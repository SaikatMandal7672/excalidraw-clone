'use client';

import React, { memo } from 'react';
import { Viewport } from '../../types';

interface Props {
  viewport: Viewport;
  isDark: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

const ZoomControls = memo(function ZoomControls({ viewport, isDark, onZoomIn, onZoomOut, onResetZoom }: Props) {
  const containerCls = isDark
    ? 'bg-zinc-900 border-zinc-700'
    : 'bg-white border-gray-200';
  const textCls = isDark ? 'text-gray-200' : 'text-gray-700';

  return (
    <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-lg px-2 py-1 border shadow-md ${containerCls}`}>
      <button onClick={onZoomOut} title="Zoom out (Ctrl+-)"
        className={`w-7 h-7 rounded-md border-none cursor-pointer flex items-center justify-center text-lg bg-transparent leading-none hover:opacity-70 ${textCls}`}>
        −
      </button>
      <span onClick={onResetZoom} title="Reset zoom (Ctrl+0)"
        className={`min-w-[52px] text-center text-[13px] tabular-nums cursor-default ${textCls}`}>
        {Math.round(viewport.zoom * 100)}%
      </span>
      <button onClick={onZoomIn} title="Zoom in (Ctrl++)"
        className={`w-7 h-7 rounded-md border-none cursor-pointer flex items-center justify-center text-lg bg-transparent leading-none hover:opacity-70 ${textCls}`}>
        +
      </button>
    </div>
  );
});

export default ZoomControls;
