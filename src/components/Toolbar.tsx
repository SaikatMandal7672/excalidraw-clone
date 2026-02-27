'use client';

import React from 'react';
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

const tools: Array<{ id: Tool; label: string; icon: string; shortcut: string }> = [
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

export default function Toolbar({
  tool,
  onToolChange,
  onUndo,
  onRedo,
  onToggleTheme,
  onToggleGrid,
  onClearCanvas,
  onExportPNG,
  showGrid,
  theme,
  canUndo,
  canRedo,
}: ToolbarProps) {
  const isDark = theme === 'dark';
  const bg = isDark ? '#1e1e1e' : '#ffffff';
  const border = isDark ? '#333' : '#e5e7eb';
  const text = isDark ? '#e5e7eb' : '#374151';
  const activeBg = '#e0e7ff';
  const activeText = '#3730a3';

  return (
    <div
      style={{
        width: 56,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: bg,
        borderRight: `1px solid ${border}`,
        padding: '8px 0',
        gap: 2,
        userSelect: 'none',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: '#6366f1',
          marginBottom: 8,
          fontFamily: 'Caveat, cursive',
          letterSpacing: -1,
        }}
      >
        Ex
      </div>

      {/* Tools */}
      {tools.map((t) => {
        const isActive = tool === t.id;
        return (
          <button
            key={t.id}
            title={`${t.label} (${t.shortcut})`}
            onClick={() => onToolChange(t.id)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: t.id === 'text' ? 16 : 18,
              fontWeight: t.id === 'text' ? 700 : 400,
              background: isActive ? activeBg : 'transparent',
              color: isActive ? activeText : text,
              transition: 'background 0.1s',
              flexShrink: 0,
            }}
          >
            {t.icon}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Divider */}
      <div style={{ width: 32, height: 1, background: border, margin: '4px 0' }} />

      {/* Grid toggle */}
      <button
        title="Toggle Grid (G)"
        onClick={onToggleGrid}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          background: showGrid ? activeBg : 'transparent',
          color: showGrid ? activeText : text,
        }}
      >
        #
      </button>

      {/* Theme toggle */}
      <button
        title="Toggle Theme"
        onClick={onToggleTheme}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          background: 'transparent',
          color: text,
        }}
      >
        {isDark ? '☀' : '☾'}
      </button>

      {/* Export */}
      <button
        title="Export PNG"
        onClick={onExportPNG}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          background: 'transparent',
          color: text,
        }}
      >
        ↓
      </button>

      {/* Divider */}
      <div style={{ width: 32, height: 1, background: border, margin: '4px 0' }} />

      {/* Undo */}
      <button
        title="Undo (Ctrl+Z)"
        onClick={onUndo}
        disabled={!canUndo}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: 'none',
          cursor: canUndo ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          background: 'transparent',
          color: canUndo ? text : isDark ? '#444' : '#d1d5db',
        }}
      >
        ↩
      </button>

      {/* Redo */}
      <button
        title="Redo (Ctrl+Y)"
        onClick={onRedo}
        disabled={!canRedo}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: 'none',
          cursor: canRedo ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          background: 'transparent',
          color: canRedo ? text : isDark ? '#444' : '#d1d5db',
        }}
      >
        ↪
      </button>

      {/* Clear */}
      <button
        title="Clear Canvas"
        onClick={onClearCanvas}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          background: 'transparent',
          color: '#ef4444',
        }}
      >
        🗑
      </button>
    </div>
  );
}
