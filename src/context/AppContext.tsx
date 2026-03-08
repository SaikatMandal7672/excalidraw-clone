'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  ExcalidrawElement,
  Tool,
  Viewport,
  DrawingProperties,
} from '../types';
import { Interaction } from '../types/interaction';
import {
  DEFAULT_FILL_COLOR,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_OPACITY,
  DEFAULT_ROUGHNESS,
  DEFAULT_STROKE_COLOR,
  DEFAULT_STROKE_WIDTH,
} from '../lib/constants';

interface AppState {
  tool: Tool;
  setTool: (tool: Tool) => void;

  properties: DrawingProperties;
  setProperties: React.Dispatch<React.SetStateAction<DrawingProperties>>;

  elements: ExcalidrawElement[];
  setElements: React.Dispatch<React.SetStateAction<ExcalidrawElement[]>>;

  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;

  viewport: Viewport;
  setViewport: React.Dispatch<React.SetStateAction<Viewport>>;

  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;

  showGrid: boolean;
  setShowGrid: React.Dispatch<React.SetStateAction<boolean>>;

  editingTextId: string | null;
  setEditingTextId: React.Dispatch<React.SetStateAction<string | null>>;

  /** Mutable ref for in-progress drawing element (avoids re-renders) */
  drawingElRef: React.MutableRefObject<ExcalidrawElement | null>;
  /** Mutable ref for lasso selection rectangle */
  selRectRef: React.MutableRefObject<{ x: number; y: number; width: number; height: number } | null>;
  /** Mutable ref tracking the current interaction state machine */
  interactionRef: React.MutableRefObject<Interaction>;
  /** Mutable ref tracking if space key is held */
  isSpaceRef: React.MutableRefObject<boolean>;
  /**
   * Always-current snapshot of reactive state.
   * Window-level event listeners read from this to avoid stale closures.
   */
  stateRef: React.MutableRefObject<StateSnapshot>;
}

export interface StateSnapshot {
  tool: Tool;
  properties: DrawingProperties;
  elements: ExcalidrawElement[];
  selectedIds: Set<string>;
  viewport: Viewport;
  theme: 'light' | 'dark';
  showGrid: boolean;
  editingTextId: string | null;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tool, setTool] = useState<Tool>('select');
  const [properties, setProperties] = useState<DrawingProperties>({
    strokeColor: DEFAULT_STROKE_COLOR,
    fillColor: DEFAULT_FILL_COLOR,
    strokeWidth: DEFAULT_STROKE_WIDTH,
    strokeStyle: 'solid',
    roughness: DEFAULT_ROUGHNESS,
    opacity: DEFAULT_OPACITY,
    fontSize: DEFAULT_FONT_SIZE,
    fontFamily: DEFAULT_FONT_FAMILY,
  });
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewport, setViewport] = useState<Viewport>({ zoom: 1, offsetX: 0, offsetY: 0 });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showGrid, setShowGrid] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const drawingElRef = useRef<ExcalidrawElement | null>(null);
  const selRectRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const interactionRef = useRef<Interaction>({ mode: 'idle' });
  const isSpaceRef = useRef(false);

  const stateRef = useRef<StateSnapshot>({
    tool, properties, elements, selectedIds, viewport, theme, showGrid, editingTextId,
  });
  useEffect(() => {
    stateRef.current = { tool, properties, elements, selectedIds, viewport, theme, showGrid, editingTextId };
  });

  return (
    <AppContext.Provider
      value={{
        tool, setTool,
        properties, setProperties,
        elements, setElements,
        selectedIds, setSelectedIds,
        viewport, setViewport,
        theme, setTheme,
        showGrid, setShowGrid,
        editingTextId, setEditingTextId,
        drawingElRef, selRectRef, interactionRef, isSpaceRef, stateRef,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used inside AppProvider');
  return ctx;
}
