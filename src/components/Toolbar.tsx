'use client';

import React, { memo } from 'react';
import { Tool } from '../types';

interface ToolbarProps {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleTheme: () => void;
  onToggleGrid: () => void;
  onClearCanvas: () => void;
  onExportPNG: () => void;
  showGrid: boolean;
  theme: 'light' | 'dark';
  canUndo: boolean;
  canRedo: boolean;
}

function Tip({ children }: { children: string }) {
  return (
    <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-medium
      opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50
      bg-gray-900 text-white shadow-lg dark:bg-zinc-700">
      {children}
    </span>
  );
}

function Icon({ d, size = 18, strokeWidth = 1.8, fill = 'none' }: { d: string; size?: number; strokeWidth?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const TOOLS: Array<{ id: Tool; label: string; shortcut: string; icon: React.ReactNode }> = [
  {
    id: 'select', label: 'Select', shortcut: 'V',
    icon: <Icon d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />,
  },
  {
    id: 'hand', label: 'Hand', shortcut: 'H',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0v1" /><path d="M14 10V4a2 2 0 0 0-4 0v2" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></svg>,
  },
  {
    id: 'rectangle', label: 'Rectangle', shortcut: 'R',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /></svg>,
  },
  {
    id: 'ellipse', label: 'Ellipse', shortcut: 'O',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><ellipse cx="12" cy="12" rx="9" ry="7" /></svg>,
  },
  {
    id: 'diamond', label: 'Diamond', shortcut: 'D',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 L22 12 L12 22 L2 12 Z" /></svg>,
  },
  {
    id: 'arrow', label: 'Arrow', shortcut: 'A',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  },
  {
    id: 'line', label: 'Line', shortcut: 'L',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="5" y1="19" x2="19" y2="5" /></svg>,
  },
  {
    id: 'freedraw', label: 'Pen', shortcut: 'P',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" /></svg>,
  },
  {
    id: 'text', label: 'Text', shortcut: 'T',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7" /><line x1="9.5" y1="20" x2="14.5" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>,
  },
  {
    id: 'eraser', label: 'Eraser', shortcut: 'E',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21h10" /><path d="M5.47 11.12 9.53 7.06a3.12 3.12 0 0 1 4.42 0l2.99 2.99a3.12 3.12 0 0 1 0 4.42l-4.06 4.06a3.12 3.12 0 0 1-4.42 0L5.47 15.54a3.12 3.12 0 0 1 0-4.42z" /></svg>,
  },
];

const Toolbar = memo(function Toolbar({
  tool, onToolChange, onUndo, onRedo, onToggleTheme, onToggleGrid,
  onClearCanvas, onExportPNG, showGrid, theme, canUndo, canRedo,
}: ToolbarProps) {
  const isDark = theme === 'dark';

  const btnCls = (active: boolean, disabled = false) =>
    `group relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 border-none outline-none
     ${disabled ? 'opacity-30 cursor-default' : 'cursor-pointer'}
     ${active
       ? isDark
         ? 'bg-indigo-500/20 text-indigo-300 shadow-[inset_0_0_0_1.5px_rgba(129,140,248,0.4)]'
         : 'bg-indigo-50 text-indigo-600 shadow-[inset_0_0_0_1.5px_rgba(99,102,241,0.35)]'
       : isDark
         ? 'bg-transparent text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200'
         : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-800'
     }`;

  return (
    <div className={`
      absolute left-3 top-1/2 -translate-y-1/2 z-20
      flex flex-col items-center gap-0.5 p-1.5 rounded-2xl select-none
      backdrop-blur-xl shadow-xl
      ${isDark
        ? 'bg-zinc-900/80 border border-zinc-700/60 shadow-black/40'
        : 'bg-white/80 border border-gray-200/70 shadow-gray-300/40'
      }`}
    >
      <div className="text-base font-black text-indigo-500 mb-1 tracking-tighter leading-none" style={{ fontFamily: 'Caveat, cursive' }}>
        Ex
      </div>

      {TOOLS.map((t) => (
        <button key={t.id} onClick={() => onToolChange(t.id)} className={btnCls(tool === t.id)}>
          {t.icon}
          <Tip>{`${t.label} (${t.shortcut})`}</Tip>
        </button>
      ))}

      <div className={`w-6 h-px my-1 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-gray-200'}`} />

      <button onClick={onToggleGrid} className={btnCls(showGrid)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
        <Tip>Grid (G)</Tip>
      </button>

      <button onClick={onToggleTheme} className={btnCls(false)}>
        {isDark
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
        }
        <Tip>Theme</Tip>
      </button>

      <button onClick={onExportPNG} className={btnCls(false)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        <Tip>Export PNG</Tip>
      </button>

      <div className={`w-6 h-px my-1 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-gray-200'}`} />

      <button onClick={onUndo} disabled={!canUndo} className={btnCls(false, !canUndo)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" /></svg>
        <Tip>Undo (Ctrl+Z)</Tip>
      </button>

      <button onClick={onRedo} disabled={!canRedo} className={btnCls(false, !canRedo)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 14 20 9 15 4" /><path d="M4 20v-7a4 4 0 0 1 4-4h12" /></svg>
        <Tip>Redo (Ctrl+Y)</Tip>
      </button>

      <button onClick={onClearCanvas} className={btnCls(false)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
        <Tip>Clear</Tip>
      </button>
    </div>
  );
});

export default Toolbar;
