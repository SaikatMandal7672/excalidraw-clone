import { ResizeHandle } from '.';

export type Interaction =
  | { mode: 'idle' }
  | { mode: 'drawing'; startX: number; startY: number }
  | { mode: 'freedrawing' }
  | { mode: 'selecting'; startX: number; startY: number }
  | {
      mode: 'moving';
      startX: number;
      startY: number;
      origPositions: Map<string, { x: number; y: number }>;
    }
  | {
      mode: 'resizing';
      handle: ResizeHandle;
      startX: number;
      startY: number;
      origBounds: { x: number; y: number; width: number; height: number };
      elementId: string;
    }
  | {
      mode: 'panning';
      startX: number;
      startY: number;
      origOffset: { x: number; y: number };
    };
