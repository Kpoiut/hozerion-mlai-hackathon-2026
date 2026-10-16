import { addSpan, berthSpan, earliestSpanFit, fitsSpan, type Busy } from "./calendar.ts";
import { spanAllowed } from "./windows.ts";
import type { Appointment, DelayEvent, SolveMask, Truck, Yard } from "./types.ts";

export interface RepairCtx {
  yard: Yard;
  original: Appointment[];
  movableIds: Set<string>;
  event: DelayEvent;
  etaById: Map<string, number>;
  cargoById: Map<string, Truck["cargo"]>;
  mask: SolveMask;
}

function trucksOf(yard: Yard): Map<string, Truck> {
  return new Map(yard.trucks.map((t) => [t.id, t]));
}

function apptOf(appts: Appointment[]): Map<string, Appointment> {
  return new Map(appts.map((a) => [a.truckId, a]));
}

export function occupancyFrom(frozen: Appointment[], yard: Yard, dockIndex: Map<string, number>): Busy[][] {
  const occ = yard.docks.map(() => [] as Busy[]);
  const trucks = trucksOf(yard);
  for (const a of frozen) {
    const t = trucks.get(a.truckId);
    const di = dockIndex.get(a.dockId);
    if (!t || di === undefined) continue;
    const span = berthSpan(t);
    addSpan(occ, di, span, a.startMin, a.startMin + t.durationMin);
  }
  return occ;
}

function legalStart(
  truck: Truck,
  eta: number,
  start: number,
  mask: SolveMask,
  occ: Busy[][],
  left: number,
  len: number,
): boolean {
  const span = berthSpan(truck);
  if (span < 1 || start < eta) return false;
  if (!mask.ignoreWait && start - eta > truck.maxWaitMin) return false;
  if (!mask.ignoreDeadline && start + truck.durationMin > truck.deadlineMin) return false;
  return fitsSpan(occ, left, span, start, start + truck.durationMin, len);
}

function eventTruck(ctx: RepairCtx): Truck | undefined {
  return ctx.yard.trucks.find((t) => t.id === ctx.event.truckId);
}

function forcedDock(ctx: RepairCtx, isEvent: boolean): string | undefined {
  return isEvent && !ctx.mask.ignoreForceDock ? ctx.event.forceDockId : undefined;
}

/** k=0: one movable truck. Earliest legal start on every door, pick lex-best. */
export function exactEventOnly(ctx: RepairCtx): { appts: Appointment[]; nodes: number } | null {
  const truck = eventTruck(ctx);
  if (!truck || !ctx.movableIds.has(truck.id) || ctx.movableIds.size !== 1) return null;
  const dockIndex = new Map(ctx.yard.docks.map((d, i) => [d.id, i]));
  const orig = apptOf(ctx.original);
  const frozen = ctx.original.filter((a) => a.truckId !== truck.id);
  const occ = occupancyFrom(frozen, ctx.yard, dockIndex);
  const cargo = ctx.cargoById.get(truck.id) ?? truck.cargo;
  const eta = ctx.etaById.get(truck.id) ?? orig.get(truck.id)?.startMin ?? 0;
  const home = orig.get(truck.id)?.dockId;
  const forced = forcedDock(ctx, true);
  let best: { dockId: string; start: number; dch: number; wait: number } | null = null;
  let nodes = 0;

  for (const dock of ctx.yard.docks) {
    nodes += 1;
    if (forced && dock.id !== forced) continue;
    const di = dockIndex.get(dock.id);
    if (di === undefined) continue;
    if (!spanAllowed(ctx.yard.docks, di, berthSpan(truck), cargo, truck.requiredEquipment, ctx.mask)) continue;
    const extras = orig.get(truck.id) ? [orig.get(truck.id)!.startMin] : [];
    const s = earliestSpanFit(occ, di, berthSpan(truck), eta, truck.durationMin, ctx.yard.shiftLenMin, extras);
    if (s == null || !legalStart(truck, eta, s, ctx.mask, occ, di, ctx.yard.shiftLenMin)) continue;
    const dch = home && home !== dock.id ? 1 : 0;
    const wait = s - eta;
    const better =
      !best ||
      wait < best.wait ||
      (wait === best.wait && dch < best.dch) ||
      (wait === best.wait && dch === best.dch && di < (dockIndex.get(best.dockId) ?? di));
    if (better) best = { dockId: dock.id, start: s, dch, wait };
  }

  if (!best) return null;
  return {
    appts: frozen.concat([{ truckId: truck.id, dockId: best.dockId, startMin: best.start }]),
    nodes,
  };
}

function placeOne(
  truck: Truck,
  ctx: RepairCtx,
  occ: Busy[][],
  dockIndex: Map<string, number>,
  preferHome: boolean,
): Appointment | null {
  const orig = apptOf(ctx.original);
  const o = orig.get(truck.id);
  const cargo = ctx.cargoById.get(truck.id) ?? truck.cargo;
  const eta = ctx.etaById.get(truck.id) ?? o?.startMin ?? 0;
  const isEvent = truck.id === ctx.event.truckId;
  const forced = forcedDock(ctx, isEvent);
  const len = ctx.yard.shiftLenMin;

  if (preferHome && o && (!forced || forced === o.dockId)) {
    const di = dockIndex.get(o.dockId);
    const dock = di !== undefined ? ctx.yard.docks[di] : undefined;
    if (
      dock &&
      di !== undefined &&
      spanAllowed(ctx.yard.docks, di, berthSpan(truck), cargo, truck.requiredEquipment, ctx.mask) &&
      legalStart(truck, eta, o.startMin, ctx.mask, occ, di, len) &&
      o.startMin >= eta
    ) {
      addSpan(occ, di, berthSpan(truck), o.startMin, o.startMin + truck.durationMin);
      return { truckId: truck.id, dockId: o.dockId, startMin: o.startMin };
    }
  }

  let best: { dockId: string; start: number; dch: number; wait: number } | null = null;
  for (const dock of ctx.yard.docks) {
    if (forced && dock.id !== forced) continue;
    const di = dockIndex.get(dock.id);
    if (di === undefined) continue;
    if (!spanAllowed(ctx.yard.docks, di, berthSpan(truck), cargo, truck.requiredEquipment, ctx.mask)) continue;
    const extras = o ? [o.startMin] : [];
    const s = earliestSpanFit(occ, di, berthSpan(truck), eta, truck.durationMin, len, extras);
    if (s == null || !legalStart(truck, eta, s, ctx.mask, occ, di, len)) continue;
    const dch = o && o.dockId !== dock.id ? 1 : 0;
    const wait = s - eta;
    if (!best || wait < best.wait || (wait === best.wait && dch < best.dch)) {
      best = { dockId: dock.id, start: s, dch, wait };
    }
  }
  if (!best) return null;
  const di = dockIndex.get(best.dockId)!;
  addSpan(occ, di, berthSpan(truck), best.start, best.start + truck.durationMin);
  return { truckId: truck.id, dockId: best.dockId, startMin: best.start };
}

/**
 * Event first (most constrained), then others keep home if the hole remains.
 * Falls back to earliest legal door. Not claimed optimal for k>0.
 */
export function constructRepair(ctx: RepairCtx): Appointment[] | null {
  const dockIndex = new Map(ctx.yard.docks.map((d, i) => [d.id, i]));
  const frozen = ctx.original.filter((a) => !ctx.movableIds.has(a.truckId));
  const occ = occupancyFrom(frozen, ctx.yard, dockIndex);
  const movable = ctx.yard.trucks.filter((t) => ctx.movableIds.has(t.id));
  const event = movable.find((t) => t.id === ctx.event.truckId);
  const rest = movable
    .filter((t) => t.id !== ctx.event.truckId)
    .sort((a, b) => (ctx.etaById.get(a.id) ?? 0) - (ctx.etaById.get(b.id) ?? 0));
  const order = event ? [event, ...rest] : rest;
  const placed: Appointment[] = [];
  for (const truck of order) {
    const hit = placeOne(truck, ctx, occ, dockIndex, truck.id !== ctx.event.truckId);
    if (!hit) return null;
    placed.push(hit);
  }
  return frozen.concat(placed);
}

/** Hill-climb: move only the late truck onto any cheaper legal door. */
export function relocateEvent(ctx: RepairCtx, appts: Appointment[]): Appointment[] {
  const truck = eventTruck(ctx);
  if (!truck) return appts;
  const dockIndex = new Map(ctx.yard.docks.map((d, i) => [d.id, i]));
  const without = appts.filter((a) => a.truckId !== truck.id);
  const occ = occupancyFrom(without, ctx.yard, dockIndex);
  const probe: RepairCtx = { ...ctx, original: ctx.original, movableIds: new Set([truck.id]) };
  const hit = placeOne(truck, probe, occ, dockIndex, false);
  if (!hit) return appts;
  const current = appts.find((a) => a.truckId === truck.id);
  if (!current) return without.concat([hit]);
  const eta = ctx.etaById.get(truck.id) ?? 0;
  const home = ctx.original.find((a) => a.truckId === truck.id)?.dockId;
  const cur = {
    dch: home && home !== current.dockId ? 1 : 0,
    wait: current.startMin - eta,
  };
  const next = {
    dch: home && home !== hit.dockId ? 1 : 0,
    wait: hit.startMin - eta,
  };
  if (next.wait < cur.wait || (next.wait === cur.wait && next.dch < cur.dch)) {
    return without.concat([hit]);
  }
  return appts;
}
