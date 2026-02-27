'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import { renderScene, RenderState } from '../lib/renderScene';
import { createElement, normalizeRect, measureText } from '../lib/elements';
import {
  clientToWorld,
  getElementAtPoint,
  getElementsInRect,
  getSelectionBounds,
  getHandleAtScreenPoint,
  applyResize,
  getResizeCursor,
} from '../lib/geometry';
import {
  DEFAULT_FILL_COLOR,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_OPACITY,
  DEFAULT_ROUGHNESS,
  DEFAULT_STROKE_COLOR,
  DEFAULT_STROKE_WIDTH,
  MAX_ZOOM,
  MIN_ZOOM,
} from '../lib/constants';
import {
  ExcalidrawElement,
  FreedrawElement,
  TextElement,
  Tool,
  Viewport,
  DrawingProperties,
  ResizeHandle,
} from '../types';

// ─── Interaction State Machine ─────────────────────────────────────────────

type Interaction =
  | { mode: 'idle' }
  | { mode: 'drawing'; startX: number; startY: number }
  | { mode: 'freedrawing' }
  | { mode: 'selecting'; startX: number; startY: number }
  | {
      mode: 'moving';
      startX: number;
      startY: number;
      origPositions: Map<string, { x: number; y: number }>;
    }
  | {
      mode: 'resizing';
      handle: ResizeHandle;
      startX: number;
      startY: number;
      origBounds: { x: number; y: number; width: number; height: number };
      elementId: string;
    }
  | {
      mode: 'panning';
      startX: number;
      startY: number;
      origOffset: { x: number; y: number };
    };

// ─── Cursor mapping ─────────────────────────────────────────────────────────

function getCursor(tool: Tool, interaction: Interaction): string {
  if (interaction.mode === 'panning') return 'grabbing';
  if (tool === 'hand') return 'grab';
  if (tool === 'select') return 'default';
  if (tool === 'text') return 'text';
  return 'crosshair';
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ExcalidrawApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Tool & drawing properties (React state → updates toolbar/panel UI)
  const [tool, setTool] = useState<Tool>('select');
  const [properties, setProperties] = useState<DrawingProperties>({
    strokeColor: DEFAULT_STROKE_COLOR,
    fillColor: DEFAULT_FILL_COLOR,
    strokeWidth: DEFAULT_STROKE_WIDTH,
    strokeStyle: 'solid',
    roughness: DEFAULT_ROUGHNESS,
    opacity: DEFAULT_OPACITY,
    fontSize: DEFAULT_FONT_SIZE,
    fontFamily: DEFAULT_FONT_FAMILY,
  });

  // ── Canvas state
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewport, setViewport] = useState<Viewport>({ zoom: 1, offsetX: 0, offsetY: 0 });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showGrid, setShowGrid] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // ── History
  const historyRef = useRef<{ stack: ExcalidrawElement[][]; index: number }>({
    stack: [[]],
    index: 0,
  });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // ── In-progress rendering state (refs — avoid re-renders during drawing)
  const drawingElRef = useRef<ExcalidrawElement | null>(null);
  const selRectRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // ── Always-current shadow refs (for window-level event handlers)
  const stateRef = useRef({
    tool,
    properties,
    elements,
    selectedIds,
    viewport,
    theme,
    showGrid,
    editingTextId,
  });
  stateRef.current = { tool, properties, elements, selectedIds, viewport, theme, showGrid, editingTextId };

  const interactionRef = useRef<Interaction>({ mode: 'idle' });
  const isSpaceRef = useRef(false);

  // ─── History helpers ─────────────────────────────────────────────────────

  const pushHistory = useCallback((els: ExcalidrawElement[]) => {
    const { stack, index } = historyRef.current;
    const newStack = stack.slice(0, index + 1);
    newStack.push(JSON.parse(JSON.stringify(els)));
    historyRef.current = { stack: newStack, index: newStack.length - 1 };
    setCanUndo(newStack.length > 1);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    const { stack, index } = historyRef.current;
    if (index > 0) {
      const newIndex = index - 1;
      historyRef.current.index = newIndex;
      setElements(JSON.parse(JSON.stringify(stack[newIndex])));
      setSelectedIds(new Set());
      setCanUndo(newIndex > 0);
      setCanRedo(true);
    }
  }, []);

  const redo = useCallback(() => {
    const { stack, index } = historyRef.current;
    if (index < stack.length - 1) {
      const newIndex = index + 1;
      historyRef.current.index = newIndex;
      setElements(JSON.parse(JSON.stringify(stack[newIndex])));
      setSelectedIds(new Set());
      setCanUndo(true);
      setCanRedo(newIndex < stack.length - 1);
    }
  }, []);

  // ─── Zoom helper ─────────────────────────────────────────────────────────

  const zoomAround = useCallback((
    centerX: number,
    centerY: number,
    newZoom: number
  ) => {
    const { viewport } = stateRef.current;
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    // Keep world point under (centerX,centerY) fixed
    const newOffsetX = viewport.offsetX + centerX * (1 / viewport.zoom - 1 / clamped);
    const newOffsetY = viewport.offsetY + centerY * (1 / viewport.zoom - 1 / clamped);
    setViewport({ zoom: clamped, offsetX: newOffsetX, offsetY: newOffsetY });
  }, []);

  // ─── Text editing ────────────────────────────────────────────────────────

  const startTextEditing = useCallback((el: TextElement) => {
    setEditingTextId(el.id);
    setSelectedIds(new Set([el.id]));
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.value = el.text;
        textareaRef.current.focus();
        textareaRef.current.select();
        // Auto-size
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }, 0);
  }, []);

  const commitTextEdit = useCallback(() => {
    const { editingTextId, elements } = stateRef.current;
    if (!editingTextId) return;

    const text = textareaRef.current?.value ?? '';
    const newEls = elements.reduce<ExcalidrawElement[]>((acc, el) => {
      if (el.id !== editingTextId || el.type !== 'text') {
        acc.push(el);
        return acc;
      }
      // Remove completely empty newly created text elements
      if (text.trim() === '' && el.text === '') return acc;
      const { width, height } = measureText(text, el.fontSize, el.fontFamily);
      acc.push({ ...el, text, width: Math.max(width, 10), height: Math.max(height, el.fontSize) });
      return acc;
    }, []);

    setElements(newEls);
    pushHistory(newEls);
    setEditingTextId(null);
  }, [pushHistory]);

  // ─── RAF render loop ─────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let rafId: number;

    const loop = () => {
      const { elements, viewport, selectedIds, theme, showGrid, editingTextId } = stateRef.current;
      const state: RenderState = {
        elements,
        viewport,
        selectedIds,
        drawingElement: drawingElRef.current,
        selectionRect: selRectRef.current,
        theme,
        showGrid,
        editingTextId,
      };
      renderScene(canvas, state);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ─── Mouse down on canvas ────────────────────────────────────────────────

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Commit any active text edit first
      if (stateRef.current.editingTextId) {
        commitTextEdit();
        return;
      }

      const { tool, elements, selectedIds, viewport, properties } = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const world = clientToWorld(e.clientX, e.clientY, rect, viewport);

      // ── Pan: hand tool, middle button, or space held
      if (tool === 'hand' || e.button === 1 || (e.button === 0 && isSpaceRef.current)) {
        interactionRef.current = {
          mode: 'panning',
          startX: e.clientX,
          startY: e.clientY,
          origOffset: { x: viewport.offsetX, y: viewport.offsetY },
        };
        return;
      }

      if (e.button !== 0) return;

      // ── Select tool
      if (tool === 'select') {
        // Check resize handles (only for single selection)
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const handle = getHandleAtScreenPoint(screenX, screenY, elements, selectedIds, viewport);

        if (handle) {
          const bounds = getSelectionBounds(elements, selectedIds);
          const elementId = [...selectedIds][0];
          if (bounds && elementId) {
            interactionRef.current = {
              mode: 'resizing',
              handle,
              startX: world.x,
              startY: world.y,
              origBounds: { ...bounds },
              elementId,
            };
            return;
          }
        }

        // Hit-test elements
        const hit = getElementAtPoint(elements, world.x, world.y);
        if (hit) {
          // Double-click opens text editor
          if (e.detail === 2 && hit.type === 'text') {
            startTextEditing(hit as TextElement);
            return;
          }

          if (!e.shiftKey && !selectedIds.has(hit.id)) {
            setSelectedIds(new Set([hit.id]));
          } else if (e.shiftKey) {
            const next = new Set(selectedIds);
            next.has(hit.id) ? next.delete(hit.id) : next.add(hit.id);
            setSelectedIds(next);
          }

          const activeIds = e.shiftKey
            ? new Set([...selectedIds, hit.id])
            : selectedIds.has(hit.id)
            ? selectedIds
            : new Set([hit.id]);

          const origPositions = new Map(
            [...activeIds].map((id) => {
              const el = elements.find((e) => e.id === id)!;
              return [id, { x: el.x, y: el.y }];
            })
          );

          interactionRef.current = {
            mode: 'moving',
            startX: world.x,
            startY: world.y,
            origPositions,
          };
          return;
        }

        // Start lasso selection
        setSelectedIds(new Set());
        interactionRef.current = { mode: 'selecting', startX: world.x, startY: world.y };
        return;
      }

      // ── Eraser tool
      if (tool === 'eraser') {
        const hit = getElementAtPoint(elements, world.x, world.y);
        if (hit) {
          const newEls = elements.map((el) =>
            el.id === hit.id ? { ...el, isDeleted: true } : el
          );
          setElements(newEls);
          pushHistory(newEls);
          setSelectedIds(new Set());
        }
        return;
      }

      // ── Text tool
      if (tool === 'text') {
        const hit = getElementAtPoint(elements, world.x, world.y);
        if (hit?.type === 'text') {
          startTextEditing(hit as TextElement);
          return;
        }
        const newEl = createElement('text', world.x, world.y, properties) as TextElement;
        const newEls = [...elements, newEl];
        setElements(newEls);
        startTextEditing(newEl);
        return;
      }

      // ── Freedraw tool
      if (tool === 'freedraw') {
        const newEl = createElement('freedraw', world.x, world.y, properties) as FreedrawElement;
        drawingElRef.current = newEl;
        interactionRef.current = { mode: 'freedrawing' };
        return;
      }

      // ── Shape tools (rectangle, ellipse, diamond, arrow, line)
      if (
        tool === 'rectangle' ||
        tool === 'ellipse' ||
        tool === 'diamond' ||
        tool === 'arrow' ||
        tool === 'line'
      ) {
        const newEl = createElement(tool, world.x, world.y, properties);
        drawingElRef.current = newEl;
        interactionRef.current = { mode: 'drawing', startX: world.x, startY: world.y };
      }
    },
    [commitTextEdit, pushHistory, startTextEditing]
  );

  // ─── Window mouse move ────────────────────────────────────────────────────

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const interaction = interactionRef.current;
      if (interaction.mode === 'idle') return;

      const { elements, viewport } = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const world = clientToWorld(e.clientX, e.clientY, rect, viewport);

      switch (interaction.mode) {
        case 'panning': {
          const dx = (e.clientX - interaction.startX) / viewport.zoom;
          const dy = (e.clientY - interaction.startY) / viewport.zoom;
          setViewport({
            zoom: viewport.zoom,
            offsetX: interaction.origOffset.x - dx,
            offsetY: interaction.origOffset.y - dy,
          });
          break;
        }

        case 'drawing': {
          const el = drawingElRef.current;
          if (!el) break;

          if (el.type === 'line' || el.type === 'arrow') {
            drawingElRef.current = {
              ...el,
              points: [{ x: 0, y: 0 }, { x: world.x - el.x, y: world.y - el.y }],
            } as typeof el;
          } else {
            const norm = normalizeRect(interaction.startX, interaction.startY, world.x, world.y);
            drawingElRef.current = { ...el, ...norm };
          }
          break;
        }

        case 'freedrawing': {
          const el = drawingElRef.current as FreedrawElement | null;
          if (!el) break;
          drawingElRef.current = {
            ...el,
            points: [...el.points, { x: world.x - el.x, y: world.y - el.y }],
            pressures: [...el.pressures, 0.5],
          };
          break;
        }

        case 'selecting': {
          const x = Math.min(interaction.startX, world.x);
          const y = Math.min(interaction.startY, world.y);
          const width = Math.abs(world.x - interaction.startX);
          const height = Math.abs(world.y - interaction.startY);
          selRectRef.current = { x, y, width, height };
          const inRect = getElementsInRect(elements, x, y, width, height);
          setSelectedIds(new Set(inRect.map((el) => el.id)));
          break;
        }

        case 'moving': {
          const dx = world.x - interaction.startX;
          const dy = world.y - interaction.startY;
          setElements((prev) =>
            prev.map((el) => {
              const orig = interaction.origPositions.get(el.id);
              if (!orig) return el;
              return { ...el, x: orig.x + dx, y: orig.y + dy };
            })
          );
          break;
        }

        case 'resizing': {
          const { handle, startX, startY, origBounds, elementId } = interaction;
          const dx = world.x - startX;
          const dy = world.y - startY;
          const { x, y, width, height } = applyResize(origBounds, handle, dx, dy);
          setElements((prev) =>
            prev.map((el) => (el.id === elementId ? { ...el, x, y, width, height } : el))
          );
          break;
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  // ─── Window mouse up ─────────────────────────────────────────────────────

  useEffect(() => {
    const onMouseUp = () => {
      const interaction = interactionRef.current;

      if (interaction.mode === 'drawing' || interaction.mode === 'freedrawing') {
        const el = drawingElRef.current;
        if (el) {
          const isValid =
            el.type === 'freedraw' || el.type === 'line' || el.type === 'arrow'
              ? el.points.length >= 2
              : Math.abs(el.width) > 2 || Math.abs(el.height) > 2;

          if (isValid) {
            setElements((prev) => {
              const newEls = [...prev, el];
              pushHistory(newEls);
              return newEls;
            });
            setSelectedIds(new Set([el.id]));
          }
        }
        drawingElRef.current = null;
      }

      if (interaction.mode === 'selecting') {
        selRectRef.current = null;
      }

      if (interaction.mode === 'moving' || interaction.mode === 'resizing') {
        pushHistory(stateRef.current.elements);
      }

      interactionRef.current = { mode: 'idle' };
    };

    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, [pushHistory]);

  // ─── Mouse wheel: zoom & pan ─────────────────────────────────────────────

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const { viewport } = stateRef.current;

      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom / ctrl+scroll
        const scale = e.deltaY < 0 ? 1.1 : 0.9;
        zoomAround(cx, cy, viewport.zoom * scale);
      } else {
        // Scroll to pan
        const dx = e.deltaX / viewport.zoom;
        const dy = e.deltaY / viewport.zoom;
        setViewport((v) => ({ ...v, offsetX: v.offsetX + dx, offsetY: v.offsetY + dy }));
      }
    },
    [zoomAround]
  );

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      if (e.key === ' ' && !inInput) {
        e.preventDefault();
        isSpaceRef.current = true;
      }

      if (inInput) {
        if (e.key === 'Escape') commitTextEdit();
        return;
      }

      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          e.shiftKey ? redo() : undo();
          return;
        }
        if (e.key === 'y') { e.preventDefault(); redo(); return; }
        if (e.key === 'a') {
          e.preventDefault();
          const { elements } = stateRef.current;
          setSelectedIds(new Set(elements.filter((el) => !el.isDeleted).map((el) => el.id)));
          return;
        }
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          const canvas = canvasRef.current;
          if (canvas) zoomAround(canvas.offsetWidth / 2, canvas.offsetHeight / 2, stateRef.current.viewport.zoom * 1.15);
          return;
        }
        if (e.key === '-') {
          e.preventDefault();
          const canvas = canvasRef.current;
          if (canvas) zoomAround(canvas.offsetWidth / 2, canvas.offsetHeight / 2, stateRef.current.viewport.zoom / 1.15);
          return;
        }
        if (e.key === '0') {
          e.preventDefault();
          setViewport({ zoom: 1, offsetX: 0, offsetY: 0 });
          return;
        }
      }

      // Tool shortcuts
      const toolMap: Record<string, Tool> = {
        v: 'select', '1': 'select',
        h: 'hand',   '2': 'hand',
        r: 'rectangle', '3': 'rectangle',
        o: 'ellipse',   '4': 'ellipse',
        d: 'diamond',   '5': 'diamond',
        a: 'arrow',     '6': 'arrow',
        l: 'line',      '7': 'line',
        p: 'freedraw',  '8': 'freedraw',
        t: 'text',      '9': 'text',
        e: 'eraser',    '0': 'eraser',
      };
      if (!e.ctrlKey && !e.metaKey && toolMap[e.key]) {
        setTool(toolMap[e.key]);
        return;
      }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { elements, selectedIds } = stateRef.current;
        if (selectedIds.size > 0) {
          const newEls = elements.map((el) =>
            selectedIds.has(el.id) ? { ...el, isDeleted: true } : el
          );
          setElements(newEls);
          pushHistory(newEls);
          setSelectedIds(new Set());
        }
        return;
      }

      // Escape
      if (e.key === 'Escape') {
        drawingElRef.current = null;
        selRectRef.current = null;
        interactionRef.current = { mode: 'idle' };
        setSelectedIds(new Set());
        commitTextEdit();
        return;
      }

      // Grid toggle
      if (e.key === 'g' || e.key === 'G') {
        setShowGrid((s) => !s);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') isSpaceRef.current = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [undo, redo, pushHistory, commitTextEdit, zoomAround]);

  // ─── Sync selected element properties → panel ────────────────────────────

  useEffect(() => {
    if (selectedIds.size === 1) {
      const id = [...selectedIds][0];
      const el = elements.find((e) => e.id === id);
      if (!el) return;
      setProperties((prev) => ({
        ...prev,
        strokeColor: el.strokeColor,
        fillColor: el.fillColor,
        strokeWidth: el.strokeWidth,
        strokeStyle: el.strokeStyle,
        roughness: el.roughness,
        opacity: el.opacity,
        ...(el.type === 'text'
          ? { fontSize: el.fontSize, fontFamily: el.fontFamily }
          : {}),
      }));
    }
  }, [selectedIds, elements]);

  // ─── Property change: update panel state + selected elements ─────────────

  const handlePropertyChange = useCallback((updates: Partial<DrawingProperties>) => {
    setProperties((prev) => ({ ...prev, ...updates }));
    const { selectedIds, elements } = stateRef.current;
    if (selectedIds.size > 0) {
      const newEls = elements.map((el) => {
        if (!selectedIds.has(el.id)) return el;
        const base = { ...el, ...updates };
        // Text-specific updates
        if (el.type === 'text' && (updates.fontSize || updates.fontFamily)) {
          const textEl = el as TextElement;
          const fs = updates.fontSize ?? textEl.fontSize;
          const ff = updates.fontFamily ?? textEl.fontFamily;
          const { width, height } = measureText(textEl.text, fs, ff);
          return { ...base, fontSize: fs, fontFamily: ff, width, height };
        }
        return base;
      });
      setElements(newEls);
      pushHistory(newEls);
    }
  }, [pushHistory]);

  // ─── Export PNG ───────────────────────────────────────────────────────────

  const exportPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drawing.png';
    a.click();
  }, []);

  // ─── Clear canvas ─────────────────────────────────────────────────────────

  const clearCanvas = useCallback(() => {
    if (!window.confirm('Clear all elements?')) return;
    setElements([]);
    setSelectedIds(new Set());
    pushHistory([]);
  }, [pushHistory]);

  // ─── Compute textarea overlay position ───────────────────────────────────

  const editingTextElement =
    editingTextId != null
      ? (elements.find((el) => el.id === editingTextId) as TextElement | undefined)
      : undefined;

  let textareaStyle: React.CSSProperties = { display: 'none' };
  if (editingTextElement) {
    const { zoom, offsetX, offsetY } = viewport;
    const left = (editingTextElement.x - offsetX) * zoom;
    const top = (editingTextElement.y - offsetY) * zoom;
    const scaledFontSize = editingTextElement.fontSize * zoom;
    textareaStyle = {
      position: 'absolute',
      left,
      top,
      minWidth: 100,
      minHeight: scaledFontSize * 1.35,
      font: `${scaledFontSize}px ${editingTextElement.fontFamily}`,
      color: editingTextElement.strokeColor,
      background: 'transparent',
      border: '1.5px dashed #1a73e8',
      outline: 'none',
      resize: 'none',
      padding: '0',
      lineHeight: '1.35',
      zIndex: 20,
      overflow: 'hidden',
      whiteSpace: 'pre',
    };
  }

  // ─── Cursor ───────────────────────────────────────────────────────────────

  const cursor = getCursor(tool, interactionRef.current);

  // ─── Selected elements for panel ─────────────────────────────────────────

  const selectedElements = elements.filter((el) => selectedIds.has(el.id) && !el.isDeleted);

  // ─── Render ───────────────────────────────────────────────────────────────

  const isDark = theme === 'dark';
  const panelBg = isDark ? '#1e1e1e' : '#ffffff';
  const borderColor = isDark ? '#333' : '#e5e7eb';
  const zoomText = isDark ? '#e5e7eb' : '#374151';

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Left toolbar */}
      <Toolbar
        tool={tool}
        onToolChange={setTool}
        onUndo={undo}
        onRedo={redo}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onToggleGrid={() => setShowGrid((g) => !g)}
        onClearCanvas={clearCanvas}
        onExportPNG={exportPNG}
        showGrid={showGrid}
        theme={theme}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Canvas area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            cursor,
          }}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
        />

        {/* Text editing overlay */}
        <textarea
          ref={textareaRef}
          style={textareaStyle}
          onBlur={commitTextEdit}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              commitTextEdit();
            }
          }}
          onChange={(e) => {
            const ta = e.currentTarget;
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
            ta.style.width = 'auto';
            ta.style.width = Math.max(ta.scrollWidth, 100) + 'px';
          }}
        />

        {/* Zoom controls */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: panelBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 8,
            padding: '4px 8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <button
            onClick={() => {
              const canvas = canvasRef.current;
              if (canvas) zoomAround(canvas.offsetWidth / 2, canvas.offsetHeight / 2, viewport.zoom / 1.2);
            }}
            style={zoomBtnStyle(isDark)}
            title="Zoom out (Ctrl+-)"
          >
            −
          </button>
          <span
            style={{
              minWidth: 52,
              textAlign: 'center',
              fontSize: 13,
              color: zoomText,
              fontVariantNumeric: 'tabular-nums',
              cursor: 'default',
            }}
            title="Reset zoom (Ctrl+0)"
            onClick={() => setViewport({ zoom: 1, offsetX: 0, offsetY: 0 })}
          >
            {Math.round(viewport.zoom * 100)}%
          </span>
          <button
            onClick={() => {
              const canvas = canvasRef.current;
              if (canvas) zoomAround(canvas.offsetWidth / 2, canvas.offsetHeight / 2, viewport.zoom * 1.2);
            }}
            style={zoomBtnStyle(isDark)}
            title="Zoom in (Ctrl++)"
          >
            +
          </button>
        </div>

        {/* Keyboard hint */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            fontSize: 11,
            color: isDark ? '#555' : '#9ca3af',
            pointerEvents: 'none',
          }}
        >
          Ctrl+Scroll to zoom · Space+Drag to pan · ? for help
        </div>
      </div>

      {/* Right properties panel */}
      <PropertiesPanel
        selectedElements={selectedElements}
        properties={properties}
        onPropertyChange={handlePropertyChange}
        theme={theme}
      />
    </div>
  );
}

function zoomBtnStyle(isDark: boolean): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    background: 'transparent',
    color: isDark ? '#e5e7eb' : '#374151',
    lineHeight: 1,
  };
}
