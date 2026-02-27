import { ExcalidrawElement, Point, Viewport, ResizeHandle } from '../types';
import { HIT_THRESHOLD, HANDLE_SIZE, SELECTION_PADDING } from './constants';

export function distanceBetween(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return distanceBetween(p, a);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return distanceBetween(p, { x: a.x + t * dx, y: a.y + t * dy });
}

export function getElementBounds(element: ExcalidrawElement) {
  if (
    element.type === 'arrow' ||
    element.type === 'line' ||
    element.type === 'freedraw'
  ) {
    if (element.points.length === 0) {
      return { x: element.x, y: element.y, width: 0, height: 0 };
    }
    const xs = element.points.map((p) => element.x + p.x);
    const ys = element.points.map((p) => element.y + p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    return {
      x: minX,
      y: minY,
      width: Math.max(...xs) - minX,
      height: Math.max(...ys) - minY,
    };
  }
  return { x: element.x, y: element.y, width: element.width, height: element.height };
}

export function isPointInElement(
  px: number,
  py: number,
  element: ExcalidrawElement,
  threshold = HIT_THRESHOLD
): boolean {
  if (element.type === 'line' || element.type === 'arrow') {
    for (let i = 0; i < element.points.length - 1; i++) {
      const p1 = { x: element.x + element.points[i].x, y: element.y + element.points[i].y };
      const p2 = { x: element.x + element.points[i + 1].x, y: element.y + element.points[i + 1].y };
      if (distanceToSegment({ x: px, y: py }, p1, p2) < threshold) return true;
    }
    return false;
  }

  if (element.type === 'freedraw') {
    for (let i = 0; i < element.points.length - 1; i++) {
      const p1 = { x: element.x + element.points[i].x, y: element.y + element.points[i].y };
      const p2 = { x: element.x + element.points[i + 1].x, y: element.y + element.points[i + 1].y };
      if (distanceToSegment({ x: px, y: py }, p1, p2) < threshold / 2) return true;
    }
    return false;
  }

  const { x, y, width, height } = element;
  return px >= x && px <= x + width && py >= y && py <= y + height;
}

export function getElementAtPoint(
  elements: ExcalidrawElement[],
  x: number,
  y: number,
  threshold = HIT_THRESHOLD
): ExcalidrawElement | undefined {
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (!el.isDeleted && isPointInElement(x, y, el, threshold)) {
      return el;
    }
  }
  return undefined;
}

export function getElementsInRect(
  elements: ExcalidrawElement[],
  rx: number,
  ry: number,
  rw: number,
  rh: number
): ExcalidrawElement[] {
  return elements.filter((el) => {
    if (el.isDeleted) return false;
    const b = getElementBounds(el);
    return b.x >= rx && b.y >= ry && b.x + b.width <= rx + rw && b.y + b.height <= ry + rh;
  });
}

/**
 * Convert client (page) coordinates to world (scene) coordinates.
 * screenX = (worldX - offsetX) * zoom
 * worldX  = screenX / zoom + offsetX
 */
export function clientToWorld(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  viewport: Viewport
): Point {
  return {
    x: (clientX - rect.left) / viewport.zoom + viewport.offsetX,
    y: (clientY - rect.top) / viewport.zoom + viewport.offsetY,
  };
}

export function getSelectionBounds(
  elements: ExcalidrawElement[],
  selectedIds: Set<string>
) {
  const selected = elements.filter((e) => selectedIds.has(e.id) && !e.isDeleted);
  if (selected.length === 0) return null;

  const bounds = selected.map(getElementBounds);
  const x = Math.min(...bounds.map((b) => b.x));
  const y = Math.min(...bounds.map((b) => b.y));
  const x2 = Math.max(...bounds.map((b) => b.x + b.width));
  const y2 = Math.max(...bounds.map((b) => b.y + b.height));
  return { x, y, width: x2 - x, height: y2 - y };
}

/**
 * Returns the resize handle under (screenX, screenY) in CSS pixel canvas coords,
 * or null if none.
 */
export function getHandleAtScreenPoint(
  screenX: number,
  screenY: number,
  elements: ExcalidrawElement[],
  selectedIds: Set<string>,
  viewport: Viewport
): ResizeHandle | null {
  if (selectedIds.size !== 1) return null;
  const bounds = getSelectionBounds(elements, selectedIds);
  if (!bounds) return null;

  const { zoom, offsetX, offsetY } = viewport;
  const pad = SELECTION_PADDING / zoom;
  const bx = (bounds.x - pad - offsetX) * zoom;
  const by = (bounds.y - pad - offsetY) * zoom;
  const bw = (bounds.width + pad * 2) * zoom;
  const bh = (bounds.height + pad * 2) * zoom;

  const handles: Array<[ResizeHandle, number, number]> = [
    ['nw', bx, by],
    ['n', bx + bw / 2, by],
    ['ne', bx + bw, by],
    ['e', bx + bw, by + bh / 2],
    ['se', bx + bw, by + bh],
    ['s', bx + bw / 2, by + bh],
    ['sw', bx, by + bh],
    ['w', bx, by + bh / 2],
  ];

  const hitR = HANDLE_SIZE + 2;
  for (const [handle, hx, hy] of handles) {
    if (Math.abs(screenX - hx) < hitR && Math.abs(screenY - hy) < hitR) {
      return handle;
    }
  }
  return null;
}

export function applyResize(
  orig: { x: number; y: number; width: number; height: number },
  handle: ResizeHandle,
  dx: number,
  dy: number
) {
  let { x, y, width, height } = orig;

  switch (handle) {
    case 'nw': x += dx; y += dy; width -= dx; height -= dy; break;
    case 'n':  y += dy; height -= dy; break;
    case 'ne': y += dy; width += dx; height -= dy; break;
    case 'e':  width += dx; break;
    case 'se': width += dx; height += dy; break;
    case 's':  height += dy; break;
    case 'sw': x += dx; width -= dx; height += dy; break;
    case 'w':  x += dx; width -= dx; break;
  }

  if (width < 2) { width = 2; }
  if (height < 2) { height = 2; }

  return { x, y, width, height };
}

export function getResizeCursor(handle: ResizeHandle): string {
  const map: Record<ResizeHandle, string> = {
    nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize',
    e: 'e-resize', se: 'se-resize', s: 's-resize',
    sw: 'sw-resize', w: 'w-resize',
  };
  return map[handle];
}
