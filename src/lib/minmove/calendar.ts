/** Interval occupancy for Gantt packing. End is exclusive. Arrays stay sorted by start. */

export interface Busy {
  start: number;
  end: number;
}

export function overlaps(a: Busy, b: Busy): boolean {
  return a.start < b.end && b.start < a.end;
}

export function fitsBusy(busy: Busy[], start: number, end: number, len: number): boolean {
  if (start < 0 || end > len || start >= end) return false;
  for (const block of busy) {
    if (block.start >= end) break;
    if (block.end > start) return false;
  }
  return true;
}

export function addBusy(busy: Busy[], start: number, end: number): void {
  let i = 0;
  while (i < busy.length && busy[i]!.start < start) i += 1;
  busy.splice(i, 0, { start, end });
}

export function removeBusy(busy: Busy[], start: number, end: number): void {
  const i = busy.findIndex((b) => b.start === start && b.end === end);
  if (i >= 0) busy.splice(i, 1);
}

export function berthSpan(truck: { span?: number }): number {
  const n = truck.span ?? 1;
  if (!Number.isInteger(n) || n < 1) return 0;
  return n;
}

/** Sections a published call still covers when it hangs off the quay. */
export function occupyIndexes(dockCount: number, left: number, span: number): number[] {
  if (!Number.isInteger(left) || !Number.isInteger(span) || span < 1 || left < 0 || left >= dockCount) return [];
  const last = Math.min(dockCount, left + span);
  const out: number[] = [];
  for (let i = left; i < last; i++) out.push(i);
  return out;
}

/** Leftmost dock index, or null when the call does not fit on the quay. */
export function spanIndexes(dockCount: number, left: number, span: number): number[] | null {
  if (!Number.isInteger(span) || span < 1 || left < 0 || left + span > dockCount) return null;
  const out: number[] = [];
  for (let i = 0; i < span; i++) out.push(left + i);
  return out;
}

export function fitsSpan(occ: Busy[][], left: number, span: number, start: number, end: number, len: number): boolean {
  if (!Number.isInteger(span) || span < 1 || left < 0 || left + span > occ.length) return false;
  if (start < 0 || end > len || start >= end) return false;
  const endDock = left + span;
  for (let i = left; i < endDock; i++) {
    const busy = occ[i]!;
    for (let j = 0; j < busy.length; j++) {
      const block = busy[j]!;
      if (block.start >= end) break;
      if (block.end > start) return false;
    }
  }
  return true;
}

export function addSpan(occ: Busy[][], left: number, span: number, start: number, end: number): void {
  if (!Number.isInteger(left) || !Number.isInteger(span) || span < 1 || left < 0 || left >= occ.length) return;
  const last = Math.min(occ.length, left + span);
  for (let i = left; i < last; i++) addBusy(occ[i]!, start, end);
}

export function removeSpan(occ: Busy[][], left: number, span: number, start: number, end: number): void {
  if (!Number.isInteger(left) || !Number.isInteger(span) || span < 1 || left < 0 || left >= occ.length) return;
  const last = Math.min(occ.length, left + span);
  for (let i = left; i < last; i++) removeBusy(occ[i]!, start, end);
}

/** Candidate starts across every dock the call covers. Span 1 matches candidateStarts. */
export function candidateStartsSpan(
  occ: Busy[][],
  left: number,
  span: number,
  eta: number,
  dur: number,
  len: number,
  extras: number[],
): number[] {
  const ids = spanIndexes(occ.length, left, span);
  if (!ids) return [];
  const points = new Set<number>([eta]);
  for (const t of extras) if (t >= eta) points.add(t);
  for (const i of ids) {
    for (const b of occ[i]!) if (b.end >= eta && b.end + dur <= len) points.add(b.end);
  }
  return [...points].filter((s) => s >= 0 && s + dur <= len).sort((a, b) => a - b);
}

/** Earliest start that is free on every dock in the span. */
export function earliestSpanFit(
  occ: Busy[][],
  left: number,
  span: number,
  eta: number,
  dur: number,
  len: number,
  extras: number[],
): number | undefined {
  if (!Number.isInteger(span) || span < 1 || left < 0 || left + span > occ.length || dur <= 0) return undefined;
  if (eta >= 0) {
    let s = eta;
    const endDock = left + span;
    while (s + dur <= len) {
      let advanced = false;
      for (let i = left; i < endDock; i++) {
        const busy = occ[i]!;
        for (let j = 0; j < busy.length; j++) {
          const b = busy[j]!;
          if (b.start >= s + dur) break;
          if (b.end > s) {
            s = b.end;
            advanced = true;
            break;
          }
        }
        if (advanced) break;
      }
      if (!advanced) return s;
    }
    return undefined;
  }
  for (const s of candidateStartsSpan(occ, left, span, eta, dur, len, extras)) {
    if (s >= eta && fitsSpan(occ, left, span, s, s + dur, len)) return s;
  }
  return undefined;
}

/** Earliest legal start on this calendar, or undefined. */
export function earliestFit(busy: Busy[], eta: number, dur: number, len: number, extras: number[]): number | undefined {
  if (dur <= 0) return undefined;
  if (eta >= 0) {
    let s = eta;
    for (let j = 0; j < busy.length; j++) {
      const b = busy[j]!;
      if (b.start >= s + dur) break;
      if (b.end > s) s = b.end;
    }
    return s + dur <= len ? s : undefined;
  }
  const starts = candidateStarts(busy, eta, dur, len, extras);
  for (const s of starts) {
    if (s >= eta && fitsBusy(busy, s, s + dur, len)) return s;
  }
  return undefined;
}

/** Candidate Gantt starts: ETA, extras, and the end of every occupied block. */
export function candidateStarts(busy: Busy[], eta: number, dur: number, len: number, extras: number[]): number[] {
  const points = new Set<number>([eta]);
  for (const t of extras) if (t >= eta) points.add(t);
  for (const b of busy) if (b.end >= eta && b.end + dur <= len) points.add(b.end);
  return [...points].filter((s) => s >= 0 && s + dur <= len).sort((a, b) => a - b);
}

/**
 * Greedy interval-graph coloring: assign each job the first lane whose last
 * end ≤ start. Used for gate/exit swimlanes.
 */
export function packLanes(
  jobs: { id: string; start: number; end: number }[],
): { id: string; start: number; end: number; lane: number }[] {
  const sorted = [...jobs].sort((a, b) => a.start - b.start || a.end - b.end || a.id.localeCompare(b.id));
  const laneEnd: number[] = [];
  const out: { id: string; start: number; end: number; lane: number }[] = [];
  for (const job of sorted) {
    let lane = laneEnd.findIndex((end) => end <= job.start);
    if (lane < 0) {
      lane = laneEnd.length;
      laneEnd.push(job.end);
    } else {
      laneEnd[lane] = job.end;
    }
    out.push({ ...job, lane });
  }
  return out;
}

/** Multiprocessor: N lanes, job may wait if all busy. */
export function scheduleLanes(
  jobs: { id: string; ready: number; dur: number }[],
  laneCount: number,
): { id: string; start: number; end: number; lane: number }[] {
  const idle = Array.from({ length: Math.max(1, laneCount) }, () => 0);
  const sorted = [...jobs].sort((a, b) => a.ready - b.ready || a.id.localeCompare(b.id));
  const out: { id: string; start: number; end: number; lane: number }[] = [];
  for (const job of sorted) {
    let best = 0;
    for (let i = 1; i < idle.length; i++) if (idle[i]! < idle[best]!) best = i;
    const start = Math.max(job.ready, idle[best]!);
    const end = start + job.dur;
    idle[best] = end;
    out.push({ id: job.id, start, end, lane: best });
  }
  return out;
}
