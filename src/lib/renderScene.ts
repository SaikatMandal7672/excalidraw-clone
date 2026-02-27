import rough from 'roughjs';
import {
  ExcalidrawElement,
  Viewport,
  FreedrawElement,
  TextElement,
  ArrowElement,
  LineElement,
} from '../types';
import { GRID_SIZE, HANDLE_SIZE, SELECTION_PADDING } from './constants';
import { getSelectionBounds, getElementBounds } from './geometry';

export interface RenderState {
  elements: ExcalidrawElement[];
  viewport: Viewport;
  selectedIds: Set<string>;
  drawingElement: ExcalidrawElement | null;
  selectionRect: { x: number; y: number; width: number; height: number } | null;
  theme: 'light' | 'dark';
  showGrid: boolean;
  editingTextId: string | null;
}

export function renderScene(canvas: HTMLCanvasElement, state: RenderState): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.offsetWidth;
  const cssH = canvas.offsetHeight;

  // Resize physical pixels to match CSS size × DPR
  if (
    canvas.width !== Math.round(cssW * dpr) ||
    canvas.height !== Math.round(cssH * dpr)
  ) {
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
  }

  const { viewport, theme, showGrid, selectedIds, selectionRect, editingTextId } = state;

  // 1. Reset transform to DPR only, clear
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  // 2. Background
  ctx.fillStyle = theme === 'dark' ? '#121212' : '#f8f9fa';
  ctx.fillRect(0, 0, cssW, cssH);

  // 3. Apply viewport transform for world-space rendering
  // After this: drawing at world(wx,wy) → screen pixel ((wx-offsetX)*zoom, (wy-offsetY)*zoom)
  ctx.save();
  ctx.scale(viewport.zoom, viewport.zoom);
  ctx.translate(-viewport.offsetX, -viewport.offsetY);

  // 4. Grid
  if (showGrid) {
    renderGrid(ctx, viewport, cssW, cssH, theme);
  }

  // 5. Render committed elements + in-progress drawing element
  const rc = rough.canvas(canvas);
  const allElements = state.drawingElement
    ? [...state.elements, state.drawingElement]
    : state.elements;

  for (const element of allElements) {
    if (element.isDeleted) continue;
    if (element.id === editingTextId) continue; // textarea overlays it
    renderElement(ctx, rc, element, viewport.zoom);
  }

  // 6. Lasso selection rectangle
  if (selectionRect) {
    const { x, y, width, height } = selectionRect;
    ctx.strokeStyle = '#1a73e8';
    ctx.fillStyle = 'rgba(26, 115, 232, 0.08)';
    ctx.lineWidth = 1 / viewport.zoom;
    ctx.setLineDash([4 / viewport.zoom, 4 / viewport.zoom]);
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();

  // 7. Selection handles (drawn in CSS pixel space after restoring transform)
  if (selectedIds.size > 0) {
    renderSelectionHandles(ctx, state.elements, selectedIds, viewport);
  }
}

function renderGrid(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  cssW: number,
  cssH: number,
  theme: 'light' | 'dark'
) {
  const { zoom, offsetX, offsetY } = viewport;
  const left = offsetX;
  const top = offsetY;
  const right = offsetX + cssW / zoom;
  const bottom = offsetY + cssH / zoom;

  const startX = Math.floor(left / GRID_SIZE) * GRID_SIZE;
  const startY = Math.floor(top / GRID_SIZE) * GRID_SIZE;

  ctx.strokeStyle = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
  ctx.lineWidth = 0.5 / zoom;
  ctx.beginPath();
  for (let x = startX; x <= right + GRID_SIZE; x += GRID_SIZE) {
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
  }
  for (let y = startY; y <= bottom + GRID_SIZE; y += GRID_SIZE) {
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
  }
  ctx.stroke();
}

function renderElement(
  ctx: CanvasRenderingContext2D,
  rc: ReturnType<typeof rough.canvas>,
  element: ExcalidrawElement,
  zoom: number
) {
  ctx.save();
  ctx.globalAlpha = element.opacity / 100;

  // Stroke dash (applied to non-rough paths like freedraw/text/arrowhead)
  const dashLen = element.strokeStyle === 'dashed' ? 8 : element.strokeStyle === 'dotted' ? 2 : 0;
  const gapLen = element.strokeStyle === 'dashed' ? 4 : element.strokeStyle === 'dotted' ? 4 : 0;

  const hasFill = element.fillColor !== 'transparent' && element.fillColor !== '';

  const roughOptions = {
    roughness: element.roughness,
    seed: element.seed,
    stroke: element.strokeColor,
    strokeWidth: element.strokeWidth,
    fill: hasFill ? element.fillColor : undefined,
    fillStyle: 'hachure' as const,
    hachureAngle: -41,
    hachureGap: element.strokeWidth * 4,
    ...(element.strokeStyle === 'dashed'
      ? { strokeLineDash: [8 / zoom, 4 / zoom] }
      : element.strokeStyle === 'dotted'
      ? { strokeLineDash: [2 / zoom, 4 / zoom] }
      : {}),
  };

  switch (element.type) {
    case 'rectangle': {
      if (element.width !== 0 || element.height !== 0) {
        rc.rectangle(element.x, element.y, element.width, element.height, roughOptions);
      }
      break;
    }

    case 'ellipse': {
      if (element.width !== 0 || element.height !== 0) {
        rc.ellipse(
          element.x + element.width / 2,
          element.y + element.height / 2,
          Math.abs(element.width),
          Math.abs(element.height),
          roughOptions
        );
      }
      break;
    }

    case 'diamond': {
      if (element.width !== 0 || element.height !== 0) {
        const cx = element.x + element.width / 2;
        const cy = element.y + element.height / 2;
        const pts: [number, number][] = [
          [cx, element.y],
          [element.x + element.width, cy],
          [cx, element.y + element.height],
          [element.x, cy],
        ];
        rc.polygon(pts, roughOptions);
      }
      break;
    }

    case 'line': {
      const el = element as LineElement;
      if (el.points.length >= 2) {
        for (let i = 0; i < el.points.length - 1; i++) {
          rc.line(
            el.x + el.points[i].x,
            el.y + el.points[i].y,
            el.x + el.points[i + 1].x,
            el.y + el.points[i + 1].y,
            roughOptions
          );
        }
      }
      break;
    }

    case 'arrow': {
      const el = element as ArrowElement;
      if (el.points.length >= 2) {
        for (let i = 0; i < el.points.length - 1; i++) {
          rc.line(
            el.x + el.points[i].x,
            el.y + el.points[i].y,
            el.x + el.points[i + 1].x,
            el.y + el.points[i + 1].y,
            roughOptions
          );
        }
        // Arrowhead
        const last = el.points[el.points.length - 1];
        const prev = el.points[el.points.length - 2];
        const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
        const size = Math.max(12, el.strokeWidth * 5);
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;
        ctx.lineCap = 'round';
        if (dashLen > 0) ctx.setLineDash([dashLen, gapLen]);
        ctx.beginPath();
        ctx.moveTo(el.x + last.x, el.y + last.y);
        ctx.lineTo(
          el.x + last.x - size * Math.cos(angle - Math.PI / 6),
          el.y + last.y - size * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(el.x + last.x, el.y + last.y);
        ctx.lineTo(
          el.x + last.x - size * Math.cos(angle + Math.PI / 6),
          el.y + last.y - size * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        ctx.setLineDash([]);
      }
      break;
    }

    case 'freedraw': {
      const el = element as FreedrawElement;
      if (el.points.length >= 2) {
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (dashLen > 0) ctx.setLineDash([dashLen, gapLen]);
        ctx.beginPath();
        ctx.moveTo(el.x + el.points[0].x, el.y + el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          const prev = el.points[i - 1];
          const curr = el.points[i];
          // Smooth curve through midpoints
          const mx = el.x + (prev.x + curr.x) / 2;
          const my = el.y + (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(el.x + prev.x, el.y + prev.y, mx, my);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
      break;
    }

    case 'text': {
      const el = element as TextElement;
      renderText(ctx, el);
      break;
    }
  }

  ctx.restore();
}

function renderText(ctx: CanvasRenderingContext2D, el: TextElement) {
  if (!el.text) return;
  ctx.fillStyle = el.strokeColor;
  ctx.font = `${el.fontSize}px ${el.fontFamily}`;
  ctx.textBaseline = 'top';
  ctx.textAlign = el.textAlign;
  const lineHeight = el.fontSize * 1.35;
  const startX =
    el.textAlign === 'center'
      ? el.x + el.width / 2
      : el.textAlign === 'right'
      ? el.x + el.width
      : el.x;
  el.text.split('\n').forEach((line, i) => {
    ctx.fillText(line, startX, el.y + i * lineHeight);
  });
}

function renderSelectionHandles(
  ctx: CanvasRenderingContext2D,
  elements: ExcalidrawElement[],
  selectedIds: Set<string>,
  viewport: Viewport
) {
  const bounds = getSelectionBounds(elements, selectedIds);
  if (!bounds) return;

  const { zoom, offsetX, offsetY } = viewport;
  const pad = SELECTION_PADDING / zoom;

  // World coords of selection box
  const wx = bounds.x - pad;
  const wy = bounds.y - pad;
  const ww = bounds.width + pad * 2;
  const wh = bounds.height + pad * 2;

  // Convert to screen CSS pixels
  const sx = (wx - offsetX) * zoom;
  const sy = (wy - offsetY) * zoom;
  const sw = ww * zoom;
  const sh = wh * zoom;

  // Selection outline
  ctx.strokeStyle = '#1a73e8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.strokeRect(sx, sy, sw, sh);

  // Only show resize handles for single selection
  if (selectedIds.size !== 1) return;

  const hs = HANDLE_SIZE;
  const handles: [number, number][] = [
    [sx, sy],
    [sx + sw / 2, sy],
    [sx + sw, sy],
    [sx + sw, sy + sh / 2],
    [sx + sw, sy + sh],
    [sx + sw / 2, sy + sh],
    [sx, sy + sh],
    [sx, sy + sh / 2],
  ];

  for (const [hx, hy] of handles) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1a73e8';
    ctx.lineWidth = 1.5;
    ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
    ctx.strokeRect(hx - hs / 2, hy - hs / 2, hs, hs);
  }
}
