import { useEffect } from 'react';
import { useAppState } from '../context/AppContext';
import { renderScene, RenderState } from '../lib/renderScene';

export function useRenderLoop(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const { stateRef, drawingElRef, selRectRef } = useAppState();

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
  }, [canvasRef, stateRef, drawingElRef, selRectRef]);
}
