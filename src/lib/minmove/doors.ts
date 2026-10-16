import { berthSpan, occupyIndexes } from "./calendar.ts";
import type { Appointment, Dock, Truck } from "./types.ts";

export type Occupancy = "open" | "busy" | "tight";

const MIN_REMAINING_GAP = 30;

function coversDock(dockId: string, apptDock: string, span: number, docks?: { id: string }[]): boolean {
  if (!docks || span <= 1) return apptDock === dockId;
  const ids = docks.map((d) => d.id);
  const covered = occupyIndexes(ids.length, ids.indexOf(apptDock), span);
  return covered.includes(ids.indexOf(dockId));
}

export function occupyingTruck(
  dockId: string,
  live: Appointment[],
  trucks: Map<string, Truck>,
  clockMin: number,
  docks?: { id: string }[],
): Appointment | undefined {
  return live.find((a) => {
    const t = trucks.get(a.truckId);
    if (!t || !coversDock(dockId, a.dockId, berthSpan(t), docks)) return false;
    return a.startMin <= clockMin && clockMin < a.startMin + t.durationMin;
  });
}

export function remainingGap(
  dockId: string,
  live: Appointment[],
  trucks: Map<string, Truck>,
  clockMin: number,
  shiftLen: number,
  docks?: { id: string }[],
): number {
  const intervals = live
    .filter((a) => {
      const t = trucks.get(a.truckId);
      return !!t && coversDock(dockId, a.dockId, berthSpan(t), docks);
    })
    .map((a) => {
      const t = trucks.get(a.truckId);
      return { s: a.startMin, e: a.startMin + (t?.durationMin ?? 0) };
    })
    .filter((iv) => iv.e > clockMin)
    .sort((a, b) => a.s - b.s);
  let cursor = clockMin;
  let best = 0;
  for (const iv of intervals) {
    best = Math.max(best, Math.max(0, iv.s - cursor));
    cursor = Math.max(cursor, iv.e);
  }
  best = Math.max(best, Math.max(0, shiftLen - cursor));
  return best;
}

export function doorOccupancy(
  dockId: string,
  live: Appointment[],
  trucks: Map<string, Truck>,
  clockMin: number,
  shiftLen: number,
  docks?: { id: string }[],
  minGap = MIN_REMAINING_GAP,
): Occupancy {
  if (occupyingTruck(dockId, live, trucks, clockMin, docks)) return "busy";
  if (remainingGap(dockId, live, trucks, clockMin, shiftLen, docks) < minGap) return "tight";
  return "open";
}

export function doorCapabilities(dock: Dock): { reefer: boolean; heavy: boolean; dry: boolean } {
  return {
    reefer: dock.cargo.includes("reefer") || dock.equipment.includes("reefer_plug"),
    heavy: dock.equipment.includes("crane"),
    dry: dock.cargo.includes("dry"),
  };
}
