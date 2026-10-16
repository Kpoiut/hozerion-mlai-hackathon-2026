/** Window a Gantt: visible door rows + cards intersecting the time viewport. */

export const OVERSCAN_PX = 160;

export interface Viewport {
  scrollLeft: number;
  scrollTop: number;
  width: number;
  height: number;
  contentWidth: number;
}

export interface RowWindow {
  start: number;
  end: number;
  padTop: number;
  padBottom: number;
}

export interface TimeWindow {
  x0: number;
  x1: number;
}

export function windowRows(
  rowCount: number,
  rowH: number,
  scrollTop: number,
  height: number,
  overscan = OVERSCAN_PX,
): RowWindow {
  if (rowCount <= 0 || rowH <= 0) return { start: 0, end: 0, padTop: 0, padBottom: 0 };
  const start = Math.max(0, Math.floor((scrollTop - overscan) / rowH));
  const end = Math.min(rowCount, Math.ceil((scrollTop + height + overscan) / rowH));
  return {
    start,
    end,
    padTop: start * rowH,
    padBottom: Math.max(0, (rowCount - end) * rowH),
  };
}

export function windowTime(vp: Viewport, overscan = OVERSCAN_PX): TimeWindow {
  const w = Math.max(1, vp.contentWidth);
  const x0 = ((vp.scrollLeft - overscan) / w) * 100;
  const x1 = ((vp.scrollLeft + vp.width + overscan) / w) * 100;
  return { x0: Math.max(0, x0), x1: Math.min(100, x1) };
}

export function intersectsPct(left: number, width: number, x0: number, x1: number): boolean {
  return left < x1 && left + width > x0;
}

export function windowBlocks<T extends { left: number; width: number; dockIndex: number }>(
  blocks: T[],
  rows: RowWindow,
  time: TimeWindow,
): T[] {
  const out: T[] = [];
  for (const b of blocks) {
    if (b.dockIndex < rows.start || b.dockIndex >= rows.end) continue;
    if (!intersectsPct(b.left, b.width, time.x0, time.x1)) continue;
    out.push(b);
  }
  return out;
}

/** Inclusive clip so first/last visible ticks stay put and labels don't jump. */
export function windowMarks(
  marks: number[],
  toPct: (n: number) => number,
  x0: number,
  x1: number,
): number[] {
  const out: number[] = [];
  for (const m of marks) {
    const x = toPct(m);
    if (x >= x0 && x <= x1) out.push(m);
  }
  return out;
}

export function measureViewport(el: HTMLElement, contentWidth: number): Viewport {
  return {
    scrollLeft: el.scrollLeft,
    scrollTop: el.scrollTop,
    width: el.clientWidth,
    height: el.clientHeight,
    contentWidth,
  };
}
