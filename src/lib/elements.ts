import { v4 as uuidv4 } from 'uuid';
import {
  ExcalidrawElement,
  Tool,
  DrawingProperties,
  ArrowElement,
  LineElement,
  FreedrawElement,
  TextElement,
} from '../types';
import {
  DEFAULT_FILL_COLOR,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_OPACITY,
  DEFAULT_ROUGHNESS,
  DEFAULT_STROKE_COLOR,
  DEFAULT_STROKE_WIDTH,
} from './constants';

function createBase(x: number, y: number, props: Partial<DrawingProperties>) {
  return {
    id: uuidv4(),
    x,
    y,
    width: 0,
    height: 0,
    angle: 0,
    strokeColor: props.strokeColor ?? DEFAULT_STROKE_COLOR,
    fillColor: props.fillColor ?? DEFAULT_FILL_COLOR,
    strokeWidth: props.strokeWidth ?? DEFAULT_STROKE_WIDTH,
    strokeStyle: (props.strokeStyle ?? 'solid') as 'solid' | 'dashed' | 'dotted',
    roughness: props.roughness ?? DEFAULT_ROUGHNESS,
    opacity: props.opacity ?? DEFAULT_OPACITY,
    seed: Math.floor(Math.random() * 100000),
    isDeleted: false,
  };
}

export function createElement(
  tool: Exclude<Tool, 'select' | 'hand' | 'eraser'>,
  x: number,
  y: number,
  props: Partial<DrawingProperties>
): ExcalidrawElement {
  const base = createBase(x, y, props);

  switch (tool) {
    case 'rectangle':
      return { ...base, type: 'rectangle' };
    case 'ellipse':
      return { ...base, type: 'ellipse' };
    case 'diamond':
      return { ...base, type: 'diamond' };
    case 'arrow':
      return { ...base, type: 'arrow', points: [{ x: 0, y: 0 }] } as ArrowElement;
    case 'line':
      return { ...base, type: 'line', points: [{ x: 0, y: 0 }] } as LineElement;
    case 'freedraw':
      return {
        ...base,
        type: 'freedraw',
        points: [{ x: 0, y: 0 }],
        pressures: [0.5],
      } as FreedrawElement;
    case 'text':
      return {
        ...base,
        type: 'text',
        text: '',
        fontSize: props.fontSize ?? DEFAULT_FONT_SIZE,
        fontFamily: props.fontFamily ?? DEFAULT_FONT_FAMILY,
        textAlign: 'left',
        width: 10,
        height: props.fontSize ?? DEFAULT_FONT_SIZE,
      } as TextElement;
    default:
      throw new Error(`Unknown tool: ${tool}`);
  }
}

export function normalizeRect(x1: number, y1: number, x2: number, y2: number) {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

export function measureText(text: string, fontSize: number, fontFamily: string) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${fontSize}px ${fontFamily}`;
  const lines = text.split('\n');
  const maxWidth = Math.max(...lines.map((l) => ctx.measureText(l).width), 10);
  const height = lines.length * fontSize * 1.35;
  return { width: maxWidth, height };
}
