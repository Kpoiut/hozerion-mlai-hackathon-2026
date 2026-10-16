import { berthSpan, occupyIndexes, packLanes } from "./calendar.ts";
import { diffAppointments } from "./explain.ts";
import type { FlowTrace } from "./flow.ts";
import { packDepth } from "./pack3d.ts";
import type { Appointment, Yard } from "./types.ts";

export function pct(min: number, len: number): number {
  if (len <= 0) return 0;
  return (min / len) * 100;
}

export interface DockBlock {
  truckId: string;
  dockId: string;
  startMin: number;
  endMin: number;
  left: number;
  width: number;
  isEvent: boolean;
  changed: boolean;
  stack: number;
}

export interface FlowBlock {
  truckId: string;
  row: "gate" | "yard" | "exit";
  lane: number;
  lanes: number;
  startMin: number;
  endMin: number;
  left: number;
  width: number;
  isEvent: boolean;
}

export interface TimeScale {
  start: number;
  end: number;
  marks: number[];
  dense: boolean;
  toPct: (min: number) => number;
}

const DENSE_PER_HOUR = 2.2;
const CLOSE_START_MIN = 50;
const MIN_VIEW = 180;
const PAD = 45;
const BUSY_FLOOR = 36;
const GAP_STRETCH = 1.45;
/** Compact chips (mockup), not duration-stretched bars. */
export const CARD_GAP_PCT = 0.8;
export const CARD_MIN_PCT = 8.5;
export const CARD_MAX_PCT = 14;
export const CARD_FEATURED_PCT = 16;
export const CARD_SLIVER_PCT = 4.5;

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function mergeBusy(blocks: { startMin: number; endMin: number }[], start: number, end: number) {
  const hits = blocks
    .map((b) => ({ s: Math.max(start, b.startMin), e: Math.min(end, b.endMin) }))
    .filter((b) => b.e > b.s)
    .sort((a, b) => a.s - b.s);
  const out: { s: number; e: number }[] = [];
  for (const h of hits) {
    const last = out[out.length - 1];
    if (!last || h.s > last.e) out.push({ ...h });
    else last.e = Math.max(last.e, h.e);
  }
  return out;
}

function closeStarts(blocks: { dockId?: string; startMin: number }[]): boolean {
  const byDock = new Map<string, number[]>();
  for (const b of blocks) {
    const id = b.dockId ?? "_";
    const list = byDock.get(id) ?? [];
    list.push(b.startMin);
    byDock.set(id, list);
  }
  for (const list of byDock.values()) {
    list.sort((a, b) => a - b);
    for (let i = 1; i < list.length; i++) {
      if (list[i]! - list[i - 1]! < CLOSE_START_MIN) return true;
    }
  }
  return false;
}

/**
 * Hour boards store the horizon in hours. Frame the plan and the first hole,
 * then keep one hour of chart equal to one hour of file time.
 */
function hourWindow(
  blocks: { startMin: number; endMin: number }[],
  focus: number[],
  shiftLen: number,
): { start: number; end: number; dense: boolean } {
  const foci = focus.filter((n) => Number.isFinite(n));
  if (foci.length === 0) return { start: 0, end: shiftLen, dense: false };
  const pad = 12;
  const minSpan = 48;
  let start = clamp(Math.min(...foci) - pad, 0, shiftLen);
  let end = clamp(Math.max(...foci) + pad, 0, shiftLen);
  let changed = true;
  let guard = 0;
  while (changed && guard < 12) {
    changed = false;
    guard += 1;
    for (const b of blocks) {
      if (b.endMin < start || b.startMin > end) continue;
      const ns = Math.max(0, b.startMin - pad);
      const ne = Math.min(shiftLen, b.endMin + pad);
      if (ns < start) {
        start = ns;
        changed = true;
      }
      if (ne > end) {
        end = ne;
        changed = true;
      }
    }
  }
  if (end - start < minSpan) {
    end = clamp(start + minSpan, 0, shiftLen);
    start = clamp(end - minSpan, 0, shiftLen);
  }
  return { start, end, dense: end - start < shiftLen - 1 };
}

export function viewWindow(
  blocks: { startMin: number; endMin: number; dockId?: string }[],
  focus: number[],
  shiftLen: number,
  unit: "minute" | "hour" = "minute",
): { start: number; end: number; dense: boolean } {
  if (shiftLen <= 0) return { start: 0, end: 0, dense: false };
  if (unit === "hour") return hourWindow(blocks, focus, shiftLen);
  const hours = shiftLen / 60;
  const density = blocks.length / Math.max(hours, 0.01);
  const dense = density > DENSE_PER_HOUR || closeStarts(blocks);
  if (!dense) return { start: 0, end: shiftLen, dense: false };

  const foci = focus.filter((n) => Number.isFinite(n));
  const center = foci.length ? foci.reduce((a, b) => a + b, 0) / foci.length : shiftLen / 2;
  let start = clamp(center - MIN_VIEW / 2, 0, shiftLen);
  let end = clamp(start + MIN_VIEW, 0, shiftLen);
  start = clamp(end - MIN_VIEW, 0, shiftLen);

  let changed = true;
  let guard = 0;
  while (changed && guard < 12) {
    changed = false;
    guard += 1;
    for (const b of blocks) {
      if (b.endMin < start - PAD || b.startMin > end + PAD) continue;
      const ns = Math.max(0, b.startMin - PAD);
      const ne = Math.min(shiftLen, b.endMin + PAD);
      if (ns < start) {
        start = ns;
        changed = true;
      }
      if (ne > end) {
        end = ne;
        changed = true;
      }
    }
  }
  if (end - start < MIN_VIEW) {
    const extra = (MIN_VIEW - (end - start)) / 2;
    start = clamp(start - extra, 0, shiftLen);
    end = clamp(end + extra, 0, shiftLen);
  }
  return { start, end, dense: true };
}

function lerpPct(
  segs: { s: number; e: number }[],
  cum: number[],
  weights: number[],
  total: number,
  view: { start: number; end: number },
  min: number,
): number {
  const x = clamp(min, view.start, view.end);
  let lo = 0;
  let hi = segs.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (x > segs[mid]!.e) lo = mid + 1;
    else hi = mid;
  }
  const s = segs[lo]!;
  const span = s.e - s.s || 1;
  const local = clamp((x - s.s) / span, 0, 1);
  return cum[lo]! + local * ((weights[lo]! / total) * 100);
}

export function buildTimeScale(
  blocks: { startMin: number; endMin: number; dockId?: string }[],
  focus: number[],
  shiftLen: number,
  unit: "minute" | "hour" = "minute",
): TimeScale {
  const view = viewWindow(blocks, focus, shiftLen, unit);
  const busy = mergeBusy(blocks, view.start, view.end);
  const segs: { s: number; e: number; occ: boolean }[] = [];
  let cursor = view.start;
  for (const b of busy) {
    if (b.s > cursor) segs.push({ s: cursor, e: b.s, occ: false });
    segs.push({ s: b.s, e: b.e, occ: true });
    cursor = b.e;
  }
  if (cursor < view.end) segs.push({ s: cursor, e: view.end, occ: false });
  if (segs.length === 0) segs.push({ s: view.start, e: view.end, occ: false });

  const weights = segs.map((s) => {
    const d = Math.max(0, s.e - s.s);
    if (unit === "hour") return Math.max(d, 0.5);
    return s.occ ? Math.max(d, BUSY_FLOOR) : Math.max(d * GAP_STRETCH, 8);
  });
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const cum: number[] = [];
  let acc = 0;
  for (const w of weights) {
    cum.push(acc);
    acc += (w / total) * 100;
  }

  const lut = new Float64Array(shiftLen + 1);
  for (let m = 0; m <= shiftLen; m++) lut[m] = lerpPct(segs, cum, weights, total, view, m);

  const toPct = (min: number) => {
    if (!Number.isFinite(min)) return 0;
    if (min <= view.start) return 0;
    if (min >= view.end) return 100;
    const i = min | 0;
    if (min === i && i >= 0 && i <= shiftLen) return lut[i]!;
    const a = lut[clamp(i, 0, shiftLen)]!;
    const b = lut[clamp(i + 1, 0, shiftLen)]!;
    return a + (b - a) * (min - i);
  };

  const marks: number[] = [view.start];
  const span = view.end - view.start;
  const step = unit === "hour" ? (span > 96 ? 24 : 12) : 60;
  const first = Math.ceil((view.start + 1) / step) * step;
  for (let h = first; h < view.end; h += step) marks.push(h);
  if (marks[marks.length - 1] !== view.end) {
    const prev = marks[marks.length - 1]!;
    if (view.end - prev < step * 0.75) marks[marks.length - 1] = view.end;
    else marks.push(view.end);
  }

  return { start: view.start, end: view.end, marks, dense: view.dense, toPct };
}

export function linearScale(shiftLen: number): TimeScale {
  const lut = new Float64Array(shiftLen + 1);
  for (let m = 0; m <= shiftLen; m++) lut[m] = pct(m, shiftLen);
  return {
    start: 0,
    end: shiftLen,
    marks: hourMarks(shiftLen),
    dense: false,
    toPct: (min) => {
      if (min <= 0) return 0;
      if (min >= shiftLen) return 100;
      const i = min | 0;
      if (min === i) return lut[i]!;
      return lut[i]! + (lut[i + 1]! - lut[i]!) * (min - i);
    },
  };
}

function chipWidth(natural: number, featured: boolean, faithful: boolean): number {
  if (faithful) return Math.max(natural, 0.8);
  if (featured) return Math.max(natural, CARD_FEATURED_PCT);
  return clamp(natural, CARD_MIN_PCT, CARD_MAX_PCT);
}

/**
 * Compact chips, then 3D depth-pack on each door so visual overlap stacks
 * in z instead of clipping below a readable width.
 */
export function packCards(blocks: DockBlock[], faithful = false): DockBlock[] {
  const copies = blocks.map((b) => ({ ...b, width: chipWidth(b.width, b.isEvent, faithful), stack: 0 }));
  const byDock = new Map<string, DockBlock[]>();
  for (const b of copies) {
    const list = byDock.get(b.dockId);
    if (list) list.push(b);
    else byDock.set(b.dockId, [b]);
  }
  const out: DockBlock[] = [];
  let doorY = 0;
  for (const list of byDock.values()) {
    list.sort((a, b) => a.left - b.left || a.startMin - b.startMin);
    const depth = packDepth(
      list.map((b) => ({ id: b.truckId, x: b.left, w: b.width, y: doorY })),
      2,
    );
    for (const b of list) b.stack = depth.get(b.truckId) ?? 0;
    if (!faithful) {
      const layers = [list.filter((b) => b.stack === 0), list.filter((b) => b.stack !== 0)];
      for (const layer of layers) {
        for (let i = layer.length - 1; i >= 0; i--) {
          const cur = layer[i]!;
          const next = layer[i + 1];
          const maxRight = next ? next.left - CARD_GAP_PCT : 100;
          const room = maxRight - cur.left;
          if (room <= 0) {
            cur.width = CARD_SLIVER_PCT;
            continue;
          }
          cur.width = Math.min(cur.width, room);
        }
      }
    }
    out.push(...list);
    doorY += 1;
  }
  return out;
}

export function layoutDockBlocks(
  yard: Yard,
  live: Appointment[],
  eventTruckId?: string,
  scale?: TimeScale,
): DockBlock[] {
  const trucks = new Map(yard.trucks.map((t) => [t.id, t]));
  const diff = diffAppointments(yard.appointments, live);
  const sc = scale ?? linearScale(yard.shiftLenMin);
  const dockIds = yard.docks.map((d) => d.id);
  const raw: DockBlock[] = [];
  for (const a of live) {
    const t = trucks.get(a.truckId);
    if (!t) continue;
    const endMin = a.startMin + t.durationMin;
    const left = sc.toPct(a.startMin);
    const right = sc.toPct(endMin);
    const width = right - left;
    if (width <= 0) continue;
    const paint = occupyIndexes(dockIds.length, dockIds.indexOf(a.dockId), berthSpan(t));
    for (const idx of paint) {
      const dockId = dockIds[idx];
      if (!dockId) continue;
      raw.push({
        truckId: a.truckId,
        dockId,
        startMin: a.startMin,
        endMin,
        left,
        width,
        isEvent: a.truckId === eventTruckId,
        changed: diff.has(a.truckId),
        stack: 0,
      });
    }
  }
  return packCards(raw, yard.timeUnit === "hour");
}

export function layoutFlowBlocks(
  trace: FlowTrace,
  len: number,
  eventTruckId?: string,
  scale?: TimeScale,
): FlowBlock[] {
  const sc = scale ?? linearScale(len);
  const gatePacked = packLanes(trace.trucks.map((f) => ({ id: f.truckId, start: f.gateIn.start, end: f.gateIn.end })));
  const exitPacked = packLanes(trace.trucks.map((f) => ({ id: f.truckId, start: f.gateOut.start, end: f.gateOut.end })));
  const gateLanes = Math.max(1, ...gatePacked.map((p) => p.lane + 1), 0);
  const exitLanes = Math.max(1, ...exitPacked.map((p) => p.lane + 1), 0);
  const out: FlowBlock[] = [];
  const push = (truckId: string, row: FlowBlock["row"], start: number, end: number, lane: number, lanes: number) => {
    const left = sc.toPct(start);
    const width = sc.toPct(end) - left;
    if (width <= 0) return;
    out.push({ truckId, row, lane, lanes, startMin: start, endMin: end, left, width, isEvent: truckId === eventTruckId });
  };
  for (const p of gatePacked) push(p.id, "gate", p.start, p.end, p.lane, gateLanes);
  for (const f of trace.trucks) push(f.truckId, "yard", f.yard.start, f.yard.end, 0, 1);
  for (const p of exitPacked) push(p.id, "exit", p.start, p.end, p.lane, exitLanes);
  return out;
}

export function hourMarks(len: number, step = 60): number[] {
  const out: number[] = [];
  for (let t = 0; t <= len; t += step) out.push(t);
  return out;
}
