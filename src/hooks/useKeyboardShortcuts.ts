import { useEffect } from 'react';
import { Tool } from '../types';
import { useAppState } from '../context/AppContext';

interface KeyboardDeps {
  undo: () => void;
  redo: () => void;
  pushHistory: (els: import('../types').ExcalidrawElement[]) => void;
  commitTextEdit: () => void;
  zoomAround: (cx: number, cy: number, zoom: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function useKeyboardShortcuts(deps: KeyboardDeps) {
  const {
    setTool, setSelectedIds, setShowGrid, setViewport,
    drawingElRef, selRectRef, interactionRef, isSpaceRef, stateRef,
  } = useAppState();
  const { undo, redo, pushHistory, commitTextEdit, zoomAround, canvasRef } = deps;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT';

      if (e.key === ' ' && !inInput) {
        e.preventDefault();
        isSpaceRef.current = true;
      }

      if (inInput) {
        if (e.key === 'Escape') commitTextEdit();
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); if (e.shiftKey) { redo(); } else { undo(); } return; }
        if (e.key === 'y') { e.preventDefault(); redo(); return; }
        if (e.key === 'a') {
          e.preventDefault();
          const { elements } = stateRef.current;
          setSelectedIds(new Set(elements.filter((el) => !el.isDeleted).map((el) => el.id)));
          return;
        }
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          const c = canvasRef.current;
          if (c) zoomAround(c.offsetWidth / 2, c.offsetHeight / 2, stateRef.current.viewport.zoom * 1.15);
          return;
        }
        if (e.key === '-') {
          e.preventDefault();
          const c = canvasRef.current;
          if (c) zoomAround(c.offsetWidth / 2, c.offsetHeight / 2, stateRef.current.viewport.zoom / 1.15);
          return;
        }
        if (e.key === '0') { e.preventDefault(); setViewport({ zoom: 1, offsetX: 0, offsetY: 0 }); return; }
      }

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
      if (!e.ctrlKey && !e.metaKey && toolMap[e.key]) { setTool(toolMap[e.key]); return; }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { elements, selectedIds } = stateRef.current;
        if (selectedIds.size > 0) {
          const newEls = elements.map((el) =>
            selectedIds.has(el.id) ? { ...el, isDeleted: true } : el
          );
          deps.pushHistory(newEls);
        }
        return;
      }

      if (e.key === 'Escape') {
        drawingElRef.current = null;
        selRectRef.current = null;
        interactionRef.current = { mode: 'idle' };
        setSelectedIds(new Set());
        commitTextEdit();
        return;
      }

      if (e.key === 'g' || e.key === 'G') setShowGrid((s) => !s);
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
  }, [undo, redo, pushHistory, commitTextEdit, zoomAround, canvasRef, setTool, setSelectedIds, setShowGrid, setViewport, drawingElRef, selRectRef, interactionRef, isSpaceRef, stateRef, deps]);
}
