import React, { useCallback, useEffect } from 'react';
import { ExcalidrawElement, FreedrawElement, TextElement } from '../types';
import { useAppState } from '../context/AppContext';
import { createElement, normalizeRect } from '../lib/elements';
import {
  clientToWorld,
  getElementAtPoint,
  getElementsInRect,
  getSelectionBounds,
  getHandleAtScreenPoint,
  applyResize,
} from '../lib/geometry';

interface CanvasInteractionDeps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  pushHistory: (els: ExcalidrawElement[]) => void;
  commitTextEdit: () => void;
  startTextEditing: (el: TextElement) => void;
  zoomAround: (cx: number, cy: number, zoom: number) => void;
}

export function useCanvasInteraction(deps: CanvasInteractionDeps) {
  const {
    setElements, setSelectedIds, setViewport,
    drawingElRef, selRectRef, interactionRef, isSpaceRef, stateRef,
  } = useAppState();
  const { canvasRef, pushHistory, commitTextEdit, startTextEditing, zoomAround } = deps;

  // ─── Mouse down ────────────────────────────────────────────────────────

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (stateRef.current.editingTextId) { commitTextEdit(); return; }

      const { tool, elements, selectedIds, viewport, properties } = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const world = clientToWorld(e.clientX, e.clientY, rect, viewport);

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

      if (tool === 'select') {
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const handle = getHandleAtScreenPoint(screenX, screenY, elements, selectedIds, viewport);

        if (handle) {
          const bounds = getSelectionBounds(elements, selectedIds);
          const elementId = [...selectedIds][0];
          if (bounds && elementId) {
            interactionRef.current = {
              mode: 'resizing', handle,
              startX: world.x, startY: world.y,
              origBounds: { ...bounds }, elementId,
            };
            return;
          }
        }

        const hit = getElementAtPoint(elements, world.x, world.y);
        if (hit) {
          if (e.detail === 2 && hit.type === 'text') { startTextEditing(hit as TextElement); return; }

          if (!e.shiftKey && !selectedIds.has(hit.id)) {
            setSelectedIds(new Set([hit.id]));
          } else if (e.shiftKey) {
            const next = new Set(selectedIds);
            if (next.has(hit.id)) { next.delete(hit.id); } else { next.add(hit.id); }
            setSelectedIds(next);
          }

          const activeIds = e.shiftKey
            ? new Set([...selectedIds, hit.id])
            : selectedIds.has(hit.id) ? selectedIds : new Set([hit.id]);

          const origPositions = new Map(
            [...activeIds].map((id) => {
              const el = elements.find((el) => el.id === id)!;
              return [id, { x: el.x, y: el.y }];
            })
          );

          interactionRef.current = { mode: 'moving', startX: world.x, startY: world.y, origPositions };
          return;
        }

        setSelectedIds(new Set());
        interactionRef.current = { mode: 'selecting', startX: world.x, startY: world.y };
        return;
      }

      if (tool === 'eraser') {
        const hit = getElementAtPoint(elements, world.x, world.y);
        if (hit) {
          const newEls = elements.map((el) => el.id === hit.id ? { ...el, isDeleted: true } : el);
          setElements(newEls);
          pushHistory(newEls);
          setSelectedIds(new Set());
        }
        return;
      }

      if (tool === 'text') {
        const hit = getElementAtPoint(elements, world.x, world.y);
        if (hit?.type === 'text') { startTextEditing(hit as TextElement); return; }
        const newEl = createElement('text', world.x, world.y, properties) as TextElement;
        setElements((prev) => [...prev, newEl]);
        startTextEditing(newEl);
        return;
      }

      if (tool === 'freedraw') {
        const newEl = createElement('freedraw', world.x, world.y, properties) as FreedrawElement;
        drawingElRef.current = newEl;
        interactionRef.current = { mode: 'freedrawing' };
        return;
      }

      if (tool === 'rectangle' || tool === 'ellipse' || tool === 'diamond' || tool === 'arrow' || tool === 'line') {
        drawingElRef.current = createElement(tool, world.x, world.y, properties);
        interactionRef.current = { mode: 'drawing', startX: world.x, startY: world.y };
      }
    },
    [canvasRef, commitTextEdit, startTextEditing, pushHistory, setElements, setSelectedIds, drawingElRef, interactionRef, isSpaceRef, stateRef]
  );

  // ─── Mouse move (window-level) ─────────────────────────────────────────

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
          setViewport({ zoom: viewport.zoom, offsetX: interaction.origOffset.x - dx, offsetY: interaction.origOffset.y - dy });
          break;
        }
        case 'drawing': {
          const el = drawingElRef.current;
          if (!el) break;
          if (el.type === 'line' || el.type === 'arrow') {
            drawingElRef.current = { ...el, points: [{ x: 0, y: 0 }, { x: world.x - el.x, y: world.y - el.y }] } as typeof el;
          } else {
            drawingElRef.current = { ...el, ...normalizeRect(interaction.startX, interaction.startY, world.x, world.y) };
          }
          break;
        }
        case 'freedrawing': {
          const el = drawingElRef.current as FreedrawElement | null;
          if (!el) break;
          drawingElRef.current = { ...el, points: [...el.points, { x: world.x - el.x, y: world.y - el.y }], pressures: [...el.pressures, 0.5] };
          break;
        }
        case 'selecting': {
          const x = Math.min(interaction.startX, world.x);
          const y = Math.min(interaction.startY, world.y);
          const width = Math.abs(world.x - interaction.startX);
          const height = Math.abs(world.y - interaction.startY);
          selRectRef.current = { x, y, width, height };
          setSelectedIds(new Set(getElementsInRect(elements, x, y, width, height).map((el) => el.id)));
          break;
        }
        case 'moving': {
          const dx = world.x - interaction.startX;
          const dy = world.y - interaction.startY;
          setElements((prev) => prev.map((el) => {
            const orig = interaction.origPositions.get(el.id);
            return orig ? { ...el, x: orig.x + dx, y: orig.y + dy } : el;
          }));
          break;
        }
        case 'resizing': {
          const { handle, startX, startY, origBounds, elementId } = interaction;
          const resized = applyResize(origBounds, handle, world.x - startX, world.y - startY);
          setElements((prev) => prev.map((el) => el.id === elementId ? { ...el, ...resized } : el));
          break;
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [canvasRef, setElements, setSelectedIds, setViewport, drawingElRef, selRectRef, interactionRef, stateRef]);

  // ─── Mouse up (window-level) ───────────────────────────────────────────

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
            setSelectedIds(el.type === 'freedraw' ? new Set() : new Set([el.id]));
          }
        }
        drawingElRef.current = null;
      }

      if (interaction.mode === 'selecting') selRectRef.current = null;
      if (interaction.mode === 'moving' || interaction.mode === 'resizing') pushHistory(stateRef.current.elements);

      interactionRef.current = { mode: 'idle' };
    };

    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, [pushHistory, setElements, setSelectedIds, drawingElRef, selRectRef, interactionRef, stateRef]);

  // ─── Wheel: zoom & pan ─────────────────────────────────────────────────

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
        zoomAround(cx, cy, viewport.zoom * (e.deltaY < 0 ? 1.1 : 0.9));
      } else {
        setViewport((v) => ({ ...v, offsetX: v.offsetX + e.deltaX / v.zoom, offsetY: v.offsetY + e.deltaY / v.zoom }));
      }
    },
    [canvasRef, zoomAround, setViewport, stateRef]
  );

  return { handleMouseDown, handleWheel };
}
