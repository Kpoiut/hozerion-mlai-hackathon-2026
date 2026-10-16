import { scheduleLanes } from "./calendar.ts";
import type { Appointment, Truck, Yard } from "./types.ts";

export const GATE_IN_MIN = 8;
export const TRAVEL_MIN = 4;
export const GATE_OUT_MIN = 6;
export const GATE_LANES = 2;

export type FlowPhase = "enroute" | "gate" | "yard" | "dock" | "exit" | "gone";

export interface Span {
  start: number;
  end: number;
  lane: number;
}

export interface TruckFlow {
  truckId: string;
  plate: string;
  eta: number;
  gateIn: Span;
  yard: { start: number; end: number };
  dock: { start: number; end: number; dockId: string };
  gateOut: Span;
  tight: boolean;
}

export interface FlowTrace {
  trucks: TruckFlow[];
  gateQueuedMin: number;
  tightIds: string[];
}

function truckMap(yard: Yard): Map<string, Truck> {
  return new Map(yard.trucks.map((t) => [t.id, t]));
}

export function simulateFlow(
  yard: Yard,
  appointments: Appointment[],
  etaById: Map<string, number>,
): FlowTrace {
  const trucks = truckMap(yard);
  const gateIn = yard.timeUnit === "hour" ? 0 : GATE_IN_MIN;
  const gateOut = yard.timeUnit === "hour" ? 0 : GATE_OUT_MIN;
  const jobsIn: { id: string; ready: number; dur: number }[] = [];
  const dockOf = new Map<string, Appointment>();

  for (const a of appointments) {
    const t = trucks.get(a.truckId);
    if (!t) continue;
    dockOf.set(a.truckId, a);
    const eta = etaById.get(a.truckId) ?? a.startMin;
    jobsIn.push({ id: a.truckId, ready: Math.max(0, eta - gateIn), dur: gateIn });
  }

  const gated = scheduleLanes(jobsIn, GATE_LANES);
  const gateInBy = new Map(gated.map((g) => [g.id, g]));

  const jobsOut: { id: string; ready: number; dur: number }[] = [];
  for (const a of appointments) {
    const t = trucks.get(a.truckId);
    if (!t) continue;
    jobsOut.push({ id: a.truckId, ready: a.startMin + t.durationMin, dur: gateOut });
  }
  const gatedOut = scheduleLanes(jobsOut, GATE_LANES);
  const gateOutBy = new Map(gatedOut.map((g) => [g.id, g]));

  const flows: TruckFlow[] = [];
  let gateQueuedMin = 0;
  const tightIds: string[] = [];

  for (const a of appointments) {
    const t = trucks.get(a.truckId);
    const gin = gateInBy.get(a.truckId);
    const gout = gateOutBy.get(a.truckId);
    if (!t || !gin || !gout) continue;
    const eta = etaById.get(a.truckId) ?? a.startMin;
    gateQueuedMin += Math.max(0, gin.end - eta);
    const tight = gin.end > a.startMin;
    if (tight) tightIds.push(a.truckId);
    const yardStart = gin.end;
    const yardEnd = Math.max(yardStart, a.startMin);
    flows.push({
      truckId: a.truckId,
      plate: t.plate,
      eta,
      gateIn: { start: gin.start, end: gin.end, lane: gin.lane },
      yard: { start: yardStart, end: yardEnd },
      dock: { start: a.startMin, end: a.startMin + t.durationMin, dockId: a.dockId },
      gateOut: { start: gout.start, end: gout.end, lane: gout.lane },
      tight,
    });
  }

  return { trucks: flows, gateQueuedMin, tightIds };
}

export function phaseAt(flow: TruckFlow, t: number): FlowPhase {
  if (t < flow.gateIn.start) return "enroute";
  if (t < flow.gateIn.end) return "gate";
  if (t < flow.dock.start) return "yard";
  if (t < flow.dock.end) return "dock";
  if (t < flow.gateOut.end) return "exit";
  return "gone";
}

export function etaMap(yard: Yard, live: Appointment[], eventTruckId?: string, newEtaMin?: number): Map<string, number> {
  const orig = new Map(yard.appointments.map((a) => [a.truckId, a.startMin]));
  const map = new Map<string, number>();
  for (const t of yard.trucks) map.set(t.id, orig.get(t.id) ?? 0);
  if (eventTruckId != null && newEtaMin != null) map.set(eventTruckId, newEtaMin);
  for (const a of live) if (!map.has(a.truckId)) map.set(a.truckId, a.startMin);
  return map;
}
