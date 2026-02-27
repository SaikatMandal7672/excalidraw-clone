export type Tool =
  | 'select'
  | 'hand'
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'arrow'
  | 'line'
  | 'freedraw'
  | 'text'
  | 'eraser';

export type Point = { x: number; y: number };
export type StrokeStyle = 'solid' | 'dashed' | 'dotted';
export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface BaseElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  roughness: number;
  opacity: number;
  seed: number;
  isDeleted: boolean;
}

export interface RectangleElement extends BaseElement {
  type: 'rectangle';
}

export interface EllipseElement extends BaseElement {
  type: 'ellipse';
}

export interface DiamondElement extends BaseElement {
  type: 'diamond';
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  points: Point[];
}

export interface LineElement extends BaseElement {
  type: 'line';
  points: Point[];
}

export interface FreedrawElement extends BaseElement {
  type: 'freedraw';
  points: Point[];
  pressures: number[];
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
}

export type ExcalidrawElement =
  | RectangleElement
  | EllipseElement
  | DiamondElement
  | ArrowElement
  | LineElement
  | FreedrawElement
  | TextElement;

export interface Viewport {
  zoom: number;
  /** World X coordinate at the left edge of the canvas */
  offsetX: number;
  /** World Y coordinate at the top edge of the canvas */
  offsetY: number;
}

export interface DrawingProperties {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  roughness: number;
  opacity: number;
  fontSize: number;
  fontFamily: string;
}
