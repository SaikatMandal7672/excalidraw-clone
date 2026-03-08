'use client';

import React, { memo } from 'react';
import { Tool } from '../types';
import styles from './Toolbar.module.css';

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

const Toolbar = memo(function Toolbar({
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

  const cssVars = {
    '--bg': isDark ? '#1e1e1e' : '#ffffff',
    '--border': isDark ? '#333' : '#e5e7eb',
    '--text': isDark ? '#e5e7eb' : '#374151',
    '--hover-bg': isDark ? '#2a2a2a' : '#f3f4f6',
  } as React.CSSProperties;

  return (
    <div className={styles.sidebar} style={cssVars}>
      <div className={styles.logo}>Ex</div>

      {TOOLS.map((t) => (
        <button
          key={t.id}
          title={`${t.label} (${t.shortcut})`}
          onClick={() => onToolChange(t.id)}
          className={`${styles.toolBtn} ${tool === t.id ? styles.toolBtnActive : ''}`}
          style={t.id === 'text' ? { fontSize: 16, fontWeight: 700 } : undefined}
        >
          {t.icon}
        </button>
      ))}

      <div className={styles.spacer} />
      <div className={styles.divider} />

      <button
        title="Toggle Grid (G)"
        onClick={onToggleGrid}
        className={`${styles.actionBtn} ${showGrid ? styles.toolBtnActive : ''}`}
      >
        #
      </button>

      <button title="Toggle Theme" onClick={onToggleTheme} className={styles.actionBtn}>
        {isDark ? '☀' : '☾'}
      </button>

      <button title="Export PNG" onClick={onExportPNG} className={styles.actionBtn}>
        ↓
      </button>

      <div className={styles.divider} />

      <button
        title="Undo (Ctrl+Z)"
        onClick={onUndo}
        disabled={!canUndo}
        className={`${styles.actionBtn} ${!canUndo ? styles.actionBtnDisabled : ''}`}
      >
        ↩
      </button>

      <button
        title="Redo (Ctrl+Y)"
        onClick={onRedo}
        disabled={!canRedo}
        className={`${styles.actionBtn} ${!canRedo ? styles.actionBtnDisabled : ''}`}
      >
        ↪
      </button>

      <button title="Clear Canvas" onClick={onClearCanvas} className={styles.deleteBtn}>
        🗑
      </button>
    </div>
  );
});

export default Toolbar;
