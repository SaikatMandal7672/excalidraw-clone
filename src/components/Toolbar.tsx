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

const TOOLS: Array<{ id: Tool; label: string; icon: string; shortcut: string }> = [
  { id: 'select', label: 'Select', icon: '↖', shortcut: 'V' },
  { id: 'hand', label: 'Hand', icon: '✋', shortcut: 'H' },
  { id: 'rectangle', label: 'Rectangle', icon: '□', shortcut: 'R' },
  { id: 'ellipse', label: 'Ellipse', icon: '○', shortcut: 'O' },
  { id: 'diamond', label: 'Diamond', icon: '◇', shortcut: 'D' },
  { id: 'arrow', label: 'Arrow', icon: '→', shortcut: 'A' },
  { id: 'line', label: 'Line', icon: '╱', shortcut: 'L' },
  { id: 'freedraw', label: 'Pen', icon: '✏', shortcut: 'P' },
  { id: 'text', label: 'Text', icon: 'T', shortcut: 'T' },
  { id: 'eraser', label: 'Eraser', icon: '◻', shortcut: 'E' },
];

const btnBase = 'w-10 h-10 rounded-lg border-none cursor-pointer flex items-center justify-center text-lg shrink-0 transition-colors';

const Toolbar = memo(function Toolbar({
  tool, onToolChange, onUndo, onRedo, onToggleTheme, onToggleGrid,
  onClearCanvas, onExportPNG, showGrid, theme, canUndo, canRedo,
}: ToolbarProps) {
  const isDark = theme === 'dark';
  const textCls = isDark ? 'text-gray-200' : 'text-gray-700';
  const hoverCls = isDark ? 'hover:bg-zinc-800' : 'hover:bg-gray-100';
  const activeCls = 'bg-indigo-100 !text-indigo-800';

  return (
    <div className={`w-14 flex flex-col items-center py-2 gap-0.5 select-none z-10 border-r ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
      <div className="text-lg font-black text-indigo-500 mb-2 tracking-tighter" style={{ fontFamily: 'Caveat, cursive' }}>
        Ex
      </div>

      {TOOLS.map((t) => (
        <button
          key={t.id}
          title={`${t.label} (${t.shortcut})`}
          onClick={() => onToolChange(t.id)}
          className={`${btnBase} ${textCls} ${hoverCls} ${tool === t.id ? activeCls : ''} ${t.id === 'text' ? '!text-base !font-bold' : ''}`}
        >
          {t.icon}
        </button>
      ))}

      <div className="flex-1" />
      <div className={`w-8 h-px my-1 ${isDark ? 'bg-zinc-700' : 'bg-gray-200'}`} />

      <button title="Toggle Grid (G)" onClick={onToggleGrid}
        className={`${btnBase} text-base ${textCls} ${hoverCls} ${showGrid ? activeCls : ''}`}>
        #
      </button>

      <button title="Toggle Theme" onClick={onToggleTheme}
        className={`${btnBase} text-base ${textCls} ${hoverCls}`}>
        {isDark ? '☀' : '☾'}
      </button>

      <button title="Export PNG" onClick={onExportPNG}
        className={`${btnBase} text-base ${textCls} ${hoverCls}`}>
        ↓
      </button>

      <div className={`w-8 h-px my-1 ${isDark ? 'bg-zinc-700' : 'bg-gray-200'}`} />

      <button title="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}
        className={`${btnBase} text-base ${hoverCls} ${canUndo ? textCls : 'opacity-35 cursor-default'}`}>
        ↩
      </button>

      <button title="Redo (Ctrl+Y)" onClick={onRedo} disabled={!canRedo}
        className={`${btnBase} text-base ${hoverCls} ${canRedo ? textCls : 'opacity-35 cursor-default'}`}>
        ↪
      </button>

      <button title="Clear Canvas" onClick={onClearCanvas}
        className={`${btnBase} text-sm text-red-500 ${hoverCls}`}>
        🗑
      </button>
    </div>
  );
});

export default Toolbar;
