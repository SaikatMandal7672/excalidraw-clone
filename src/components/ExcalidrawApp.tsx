'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppState } from '../context/AppContext';
import {
  useHistory,
  useViewport,
  useTextEditing,
  useKeyboardShortcuts,
  useCanvasInteraction,
  useRenderLoop,
} from '../hooks';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import ZoomControls from './ZoomControls/ZoomControls';
import { measureText } from '../lib/elements';
import { DrawingProperties, TextElement, Tool } from '../types';

const CURSOR_MAP: Partial<Record<Tool, string>> = {
  hand: 'grab', select: 'default', text: 'text',
};

export default function ExcalidrawApp() {
  const {
    tool, setTool,
    properties, setProperties,
    elements, setElements,
    selectedIds, setSelectedIds,
    viewport,
    theme, setTheme,
    showGrid, setShowGrid,
    editingTextId,
    stateRef,
  } = useAppState();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  const { pushHistory, undo, redo, canUndo, canRedo } = useHistory();
  const { zoomAround, resetZoom } = useViewport();
  const { textareaRef, startTextEditing, commitTextEdit } = useTextEditing(pushHistory);

  useRenderLoop(canvasRef);

  const { handleMouseDown, handleWheel } = useCanvasInteraction({
    canvasRef, pushHistory, commitTextEdit, startTextEditing, zoomAround,
  });

  useKeyboardShortcuts({
    undo, redo, pushHistory, commitTextEdit, zoomAround, canvasRef,
  });

  useEffect(() => {
    if (selectedIds.size !== 1) return;
    const el = elements.find((e) => e.id === [...selectedIds][0]);
    if (!el) return;
    setProperties((prev) => ({
      ...prev,
      strokeColor: el.strokeColor,
      fillColor: el.fillColor,
      strokeWidth: el.strokeWidth,
      strokeStyle: el.strokeStyle,
      roughness: el.roughness,
      opacity: el.opacity,
      ...(el.type === 'text' ? { fontSize: el.fontSize, fontFamily: el.fontFamily } : {}),
    }));
  }, [selectedIds, elements, setProperties]);

  const handlePropertyChange = useCallback((updates: Partial<DrawingProperties>) => {
    setProperties((prev) => ({ ...prev, ...updates }));
    const { selectedIds, elements } = stateRef.current;
    if (selectedIds.size > 0) {
      const newEls = elements.map((el) => {
        if (!selectedIds.has(el.id)) return el;
        const base = { ...el, ...updates };
        if (el.type === 'text' && (updates.fontSize || updates.fontFamily)) {
          const t = el as TextElement;
          const fs = updates.fontSize ?? t.fontSize;
          const ff = updates.fontFamily ?? t.fontFamily;
          const { width, height } = measureText(t.text, fs, ff);
          return { ...base, fontSize: fs, fontFamily: ff, width, height };
        }
        return base;
      });
      setElements(newEls);
      pushHistory(newEls);
    }
  }, [pushHistory, setElements, setProperties, stateRef]);

  const exportPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'drawing.png';
    a.click();
  }, []);

  const clearCanvas = useCallback(() => {
    if (!window.confirm('Clear all elements?')) return;
    setElements([]);
    setSelectedIds(new Set());
    pushHistory([]);
  }, [pushHistory, setElements, setSelectedIds]);

  const editingEl = useMemo(
    () => (editingTextId ? elements.find((el) => el.id === editingTextId) as TextElement | undefined : undefined),
    [editingTextId, elements]
  );

  const textareaStyle: React.CSSProperties | undefined = editingEl
    ? {
        left: (editingEl.x - viewport.offsetX) * viewport.zoom,
        top: (editingEl.y - viewport.offsetY) * viewport.zoom,
        minWidth: 100,
        minHeight: editingEl.fontSize * viewport.zoom * 1.35,
        font: `${editingEl.fontSize * viewport.zoom}px ${editingEl.fontFamily}`,
        color: editingEl.strokeColor,
      }
    : undefined;

  const isDark = theme === 'dark';
  const cursor = CURSOR_MAP[tool] ?? 'crosshair';
  const selectedElements = useMemo(
    () => elements.filter((el) => selectedIds.has(el.id) && !el.isDeleted),
    [elements, selectedIds]
  );

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${isDark ? 'dark' : ''}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor }}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      />

      {editingEl ? (
        <textarea
          ref={textareaRef}
          className="absolute bg-transparent border-[1.5px] border-dashed border-indigo-400 outline-none resize-none p-0 leading-[1.35] z-20 overflow-hidden whitespace-pre rounded-sm"
          style={textareaStyle}
          onBlur={commitTextEdit}
          onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); commitTextEdit(); } }}
          onChange={(e) => {
            const ta = e.currentTarget;
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
            ta.style.width = 'auto';
            ta.style.width = Math.max(ta.scrollWidth, 100) + 'px';
          }}
        />
      ) : null}

      <Toolbar
        tool={tool} onToolChange={setTool}
        onUndo={undo} onRedo={redo}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onToggleGrid={() => setShowGrid((g) => !g)}
        onClearCanvas={clearCanvas} onExportPNG={exportPNG}
        showGrid={showGrid} theme={theme} canUndo={canUndo} canRedo={canRedo}
      />

      <PropertiesPanel
        selectedElements={selectedElements} properties={properties}
        onPropertyChange={handlePropertyChange} theme={theme}
        open={panelOpen} onToggle={() => setPanelOpen((o) => !o)}
      />

      <ZoomControls
        viewport={viewport} isDark={isDark}
        onZoomIn={() => { const c = canvasRef.current; if (c) zoomAround(c.offsetWidth / 2, c.offsetHeight / 2, viewport.zoom * 1.2); }}
        onZoomOut={() => { const c = canvasRef.current; if (c) zoomAround(c.offsetWidth / 2, c.offsetHeight / 2, viewport.zoom / 1.2); }}
        onResetZoom={resetZoom}
      />

      <div className={`absolute bottom-5 right-4 text-[10px] font-medium tracking-wide pointer-events-none select-none
        ${isDark ? 'text-zinc-600' : 'text-gray-300'}`}>
        Ctrl+Scroll to zoom &middot; Space+Drag to pan
      </div>
    </div>
  );
}
