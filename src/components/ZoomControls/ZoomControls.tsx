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
  const btnCls = `w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150 border-none outline-none
    ${isDark
      ? 'bg-transparent text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200'
      : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-800'
    }`;

  return (
    <div className={`
      absolute bottom-4 left-1/2 -translate-x-1/2 z-20
      flex items-center gap-0.5 rounded-2xl px-1.5 py-1 backdrop-blur-xl shadow-xl border
      ${isDark
        ? 'bg-zinc-900/80 border-zinc-700/60 shadow-black/40'
        : 'bg-white/80 border-gray-200/70 shadow-gray-300/40'
      }`}
    >
      <button onClick={onZoomOut} title="Zoom out (Ctrl+-)" className={btnCls}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <button
        onClick={onResetZoom}
        title="Reset zoom (Ctrl+0)"
        className={`min-w-[56px] h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150 border-none outline-none
          text-[12px] font-semibold tabular-nums
          ${isDark
            ? 'text-zinc-300 hover:bg-white/[0.07]'
            : 'text-gray-700 hover:bg-gray-100'
          }`}
      >
        {Math.round(viewport.zoom * 100)}%
      </button>

      <button onClick={onZoomIn} title="Zoom in (Ctrl++)" className={btnCls}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
});

export default ZoomControls;
