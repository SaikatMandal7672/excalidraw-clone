import { useCallback } from 'react';
import { useAppState } from '../context/AppContext';
import { MIN_ZOOM, MAX_ZOOM } from '../lib/constants';

export function useViewport() {
  const { viewport, setViewport, stateRef } = useAppState();

  const zoomAround = useCallback(
    (centerX: number, centerY: number, newZoom: number) => {
      const { viewport } = stateRef.current;
      const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
      const newOffsetX = viewport.offsetX + centerX * (1 / viewport.zoom - 1 / clamped);
      const newOffsetY = viewport.offsetY + centerY * (1 / viewport.zoom - 1 / clamped);
      setViewport({ zoom: clamped, offsetX: newOffsetX, offsetY: newOffsetY });
    },
    [setViewport, stateRef]
  );

  const resetZoom = useCallback(() => {
    setViewport({ zoom: 1, offsetX: 0, offsetY: 0 });
  }, [setViewport]);

  return { viewport, setViewport, zoomAround, resetZoom };
}
