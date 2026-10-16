import { berthSpan, occupyIndexes } from "./calendar.ts";
import type { Cargo, Dock, Equipment, SolveMask, Ternary, Truck, Yard } from "./types.ts";

export interface Interval {
  start: number;
  end: number;
}

export function classifyTime(yard: Yard, nowMin: number, eventTruckId?: string) {
  const frozenIds: string[] = [];
  const doneIds: string[] = [];
  const freeIds: string[] = [];
  const trucks = new Map(yard.trucks.map((t) => [t.id, t]));
  for (const a of yard.appointments) {
    if (a.truckId === eventTruckId) {
      freeIds.push(a.truckId);
      continue;
    }
    const t = trucks.get(a.truckId);
    if (!t) continue;
    const end = a.startMin + t.durationMin;
    if (end <= nowMin) doneIds.push(a.truckId);
    else if (a.startMin <= nowMin) frozenIds.push(a.truckId);
    else freeIds.push(a.truckId);
  }
  return { frozenIds, doneIds, freeIds };
}

export function defaultNowMin(originalStart: number, eta: number): number {
  return Math.max(0, Math.min(eta, originalStart) - 1);
}

export function dockEligibility(
  dock: Dock,
  cargo: Cargo,
  equipment: Equipment[],
  mask: SolveMask,
): Ternary {
  let cargoFact: Ternary = dock.cargo.includes(cargo)
    ? "allow"
    : dock.unknownCargo?.includes(cargo)
      ? "unknown"
      : "deny";
  if (mask.ignoreCargo) cargoFact = "allow";

  let eqFact: Ternary = "allow";
  for (const eq of equipment) {
    if (dock.equipment.includes(eq)) continue;
    if (dock.unknownEquipment?.includes(eq)) {
      eqFact = "unknown";
      continue;
    }
    eqFact = "deny";
    break;
  }
  if (mask.ignoreEquipment) eqFact = "allow";

  if (cargoFact === "deny" || eqFact === "deny") return "deny";
  if (cargoFact === "unknown" || eqFact === "unknown") {
    return mask.treatUnknownAs === "allow" ? "allow" : "unknown";
  }
  return "allow";
}

/** Every section the call covers must allow it. Span 1 is the single-dock check. */
export function spanAllowed(
  docks: Dock[],
  left: number,
  span: number,
  cargo: Cargo,
  equipment: Equipment[],
  mask: SolveMask,
): boolean {
  if (!Number.isInteger(span) || span < 1 || left < 0 || left + span > docks.length) return false;
  for (let i = 0; i < span; i++) {
    if (dockEligibility(docks[left + i]!, cargo, equipment, mask) !== "allow") return false;
  }
  return true;
}

export function mergeIntervals(raw: Interval[]): Interval[] {
  if (!raw.length) return [];
  const sorted = [...raw].sort((a, b) => a.start - b.start || a.end - b.end);
  const out: Interval[] = [{ ...sorted[0]! }];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const last = out[out.length - 1]!;
    if (cur.start <= last.end) last.end = Math.max(last.end, cur.end);
    else out.push({ ...cur });
  }
  return out;
}

export function occupiedOnDock(
  yard: Yard,
  dockId: string,
  skipTruckIds: Set<string>,
): Interval[] {
  const trucks = new Map(yard.trucks.map((t) => [t.id, t]));
  const dockIds = yard.docks.map((d) => d.id);
  const target = dockIds.indexOf(dockId);
  const raw: Interval[] = [];
  for (const a of yard.appointments) {
    if (skipTruckIds.has(a.truckId)) continue;
    const t = trucks.get(a.truckId);
    if (!t) continue;
    const covered = occupyIndexes(dockIds.length, dockIds.indexOf(a.dockId), berthSpan(t));
    const hits = covered.length > 0 ? target >= 0 && covered.includes(target) : a.dockId === dockId;
    if (!hits) continue;
    raw.push({ start: a.startMin, end: a.startMin + t.durationMin });
  }
  return mergeIntervals(raw);
}

export function freeWindows(occupied: Interval[], shiftLen: number): Interval[] {
  const out: Interval[] = [];
  let cursor = 0;
  for (const occ of occupied) {
    if (occ.start > cursor) out.push({ start: cursor, end: occ.start });
    cursor = Math.max(cursor, occ.end);
  }
  if (cursor < shiftLen) out.push({ start: cursor, end: shiftLen });
  return out;
}

export function feasibleStartRange(
  window: Interval,
  eta: number,
  duration: number,
  maxWait: number,
  deadline: number,
): { earliest: number; latest: number } | null {
  const earliest = Math.max(window.start, eta);
  const latest = Math.min(window.end - duration, eta + maxWait, deadline - duration);
  if (earliest > latest) return null;
  return { earliest, latest };
}
