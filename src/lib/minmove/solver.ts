import { addSpan, berthSpan, candidateStartsSpan, earliestSpanFit, fitsSpan, removeSpan, spanIndexes } from "./calendar.ts";
import { constructRepair, exactEventOnly, occupancyFrom, relocateEvent, type RepairCtx } from "./heuristic.ts";
import type {
  Appointment,
  BaselineRow,
  Certificate,
  ConflictAtom,
  ConstraintId,
  DelayEvent,
  LegalWindow,
  LexScore,
  RejectedWindow,
  Relaxation,
  SolveMask,
  SolveMetrics,
  SolveResult,
  Truck,
  Yard,
} from "./types.ts";
import { MAX_K, STRICT_MASK, WEIGHTS } from "./types.ts";
import {
  classifyTime,
  defaultNowMin,
  dockEligibility,
  feasibleStartRange,
  freeWindows,
  spanAllowed,
} from "./windows.ts";

function truckMap(yard: Yard): Map<string, Truck> {
  return new Map(yard.trucks.map((t) => [t.id, t]));
}

function apptMap(appts: Appointment[]): Map<string, Appointment> {
  return new Map(appts.map((a) => [a.truckId, a]));
}

export function dockAccepts(
  dock: Yard["docks"][number],
  cargo: Truck["cargo"],
  equipment: Truck["requiredEquipment"],
): boolean {
  return dockEligibility(dock, cargo, equipment, STRICT_MASK) === "allow";
}

export function lexLess(a: LexScore, b: LexScore): boolean {
  if (a.violations !== b.violations) return a.violations < b.violations;
  if (a.displaced !== b.displaced) return a.displaced < b.displaced;
  if (a.priorityHits !== b.priorityHits) return a.priorityHits < b.priorityHits;
  if (a.totalDelayMin !== b.totalDelayMin) return a.totalDelayMin < b.totalDelayMin;
  if (a.eventWaitMin !== b.eventWaitMin) return a.eventWaitMin < b.eventWaitMin;
  return a.dockChanges < b.dockChanges;
}

function lexOf(m: SolveMetrics): LexScore {
  return {
    violations: m.deadlineMisses + m.waitMisses,
    displaced: m.displaced,
    priorityHits: m.priorityHits,
    dockChanges: m.dockChanges,
    totalDelayMin: m.totalDelayMin,
    eventWaitMin: m.eventWaitMin,
  };
}

function metricsOf(
  original: Appointment[],
  next: Appointment[],
  yard: Yard,
  eventTruckId: string,
  etaById: Map<string, number>,
  mask: SolveMask,
): SolveMetrics {
  const orig = apptMap(original);
  const trucks = truckMap(yard);
  const displacedIds: string[] = [];
  const dockChangeIds: string[] = [];
  let totalDelayMin = 0;
  let deadlineMisses = 0;
  let waitMisses = 0;
  let eventWaitMin = 0;
  let priorityHits = 0;

  for (const a of next) {
    const t = trucks.get(a.truckId);
    const o = orig.get(a.truckId);
    if (!t || !o) continue;
    const eta = etaById.get(a.truckId) ?? o.startMin;
    const isEvent = a.truckId === eventTruckId;
    const moved = o.dockId !== a.dockId || o.startMin !== a.startMin;
    if (!isEvent && moved) {
      displacedIds.push(a.truckId);
      if (t.priority === 1) priorityHits += 1;
    }
    if (o.dockId !== a.dockId) dockChangeIds.push(a.truckId);
    totalDelayMin += Math.max(0, a.startMin - (isEvent ? eta : o.startMin));
    if (!mask.ignoreDeadline && a.startMin + t.durationMin > t.deadlineMin) deadlineMisses += 1;
    if (!mask.ignoreWait && a.startMin - eta > t.maxWaitMin) waitMisses += 1;
    if (isEvent) eventWaitMin = Math.max(0, a.startMin - eta);
  }

  const lex: LexScore = {
    violations: deadlineMisses + waitMisses,
    displaced: displacedIds.length,
    priorityHits,
    dockChanges: dockChangeIds.length,
    totalDelayMin,
    eventWaitMin,
  };
  const objective =
    displacedIds.length * WEIGHTS.displaced +
    dockChangeIds.length * WEIGHTS.dockChange +
    totalDelayMin * WEIGHTS.delay +
    deadlineMisses * WEIGHTS.deadline +
    waitMisses * WEIGHTS.wait +
    priorityHits * WEIGHTS.priority;

  return {
    displaced: displacedIds.length,
    displacedIds,
    dockChanges: dockChangeIds.length,
    dockChangeIds,
    totalDelayMin,
    deadlineMisses,
    waitMisses,
    priorityHits,
    eventWaitMin,
    objective,
    lex,
  };
}

function emptyMetrics(): SolveMetrics {
  const lex: LexScore = {
    violations: 99,
    displaced: 99,
    priorityHits: 99,
    dockChanges: 99,
    totalDelayMin: 9999,
    eventWaitMin: 9999,
  };
  return {
    displaced: 0,
    displacedIds: [],
    dockChanges: 0,
    dockChangeIds: [],
    totalDelayMin: 0,
    deadlineMisses: 0,
    waitMisses: 0,
    priorityHits: 0,
    eventWaitMin: 0,
    objective: Number.POSITIVE_INFINITY,
    lex,
  };
}

function subsets<T>(items: T[], k: number): T[][] {
  const out: T[][] = [];
  const rec = (start: number, acc: T[]) => {
    if (acc.length === k) {
      out.push(acc.slice());
      return;
    }
    for (let i = start; i < items.length; i++) {
      acc.push(items[i]!);
      rec(i + 1, acc);
      acc.pop();
    }
  };
  rec(0, []);
  return out;
}

function search(
  yard: Yard,
  original: Appointment[],
  movableIds: Set<string>,
  event: DelayEvent,
  etaById: Map<string, number>,
  cargoById: Map<string, Truck["cargo"]>,
  mask: SolveMask,
  pruneLex: LexScore | null,
): { best: Appointment[] | null; second: Appointment[] | null; nodes: number } {
  const box: { best: { appts: Appointment[]; lex: LexScore } | null; second: { appts: Appointment[]; lex: LexScore } | null } = {
    best: null,
    second: null,
  };
  let cut = pruneLex;

  const consider = (appts: Appointment[]) => {
    const m = metricsOf(original, appts, yard, event.truckId, etaById, mask);
    if (m.lex.violations > 0) return;
    if (!box.best || lexLess(m.lex, box.best.lex)) {
      box.second = box.best;
      box.best = { appts: appts.map((a) => ({ ...a })), lex: m.lex };
      cut = m.lex;
    } else if (
      (box.best.lex.displaced !== m.lex.displaced ||
        box.best.lex.eventWaitMin !== m.lex.eventWaitMin ||
        box.best.lex.dockChanges !== m.lex.dockChanges) &&
      (!box.second || lexLess(m.lex, box.second.lex))
    ) {
      box.second = { appts: appts.map((a) => ({ ...a })), lex: m.lex };
    }
  };

  const ctx: RepairCtx = { yard, original, movableIds, event, etaById, cargoById, mask };

  if (movableIds.size === 1 && movableIds.has(event.truckId)) {
    const exact = exactEventOnly(ctx);
    if (exact) consider(exact.appts);
    return { best: box.best?.appts ?? null, second: box.second?.appts ?? null, nodes: exact?.nodes ?? 1 };
  }

  const dockIndex = new Map(yard.docks.map((d, i) => [d.id, i]));
  const orig = apptMap(original);
  const frozen = original.filter((a) => !movableIds.has(a.truckId));
  const occ = occupancyFrom(frozen, yard, dockIndex);
  const movable = yard.trucks.filter((t) => movableIds.has(t.id));
  movable.sort((a, b) => (etaById.get(a.id) ?? 0) - (etaById.get(b.id) ?? 0));

  const assigned: Appointment[] = [];
  let nodes = 0;

  const eventTruck = movable.find((t) => t.id === event.truckId);
  const eventEta = eventTruck ? (etaById.get(eventTruck.id) ?? 0) : 0;
  const eventForced = eventTruck && !mask.ignoreForceDock ? event.forceDockId : undefined;

  const waitLb = (eventPlaced: boolean, wait: number): number => {
    if (eventPlaced || !eventTruck) return wait;
    let best = Number.POSITIVE_INFINITY;
    const cargo = cargoById.get(eventTruck.id) ?? eventTruck.cargo;
    const docks = eventForced ? yard.docks.filter((d) => d.id === eventForced) : yard.docks;
    const span = berthSpan(eventTruck);
    for (const dock of docks) {
      const di = dockIndex.get(dock.id);
      if (di === undefined) continue;
      if (!spanAllowed(yard.docks, di, span, cargo, eventTruck.requiredEquipment, mask)) continue;
      const s = earliestSpanFit(occ, di, span, eventEta, eventTruck.durationMin, yard.shiftLenMin, []);
      if (s != null && s >= eventEta) best = Math.min(best, s - eventEta);
    }
    return Number.isFinite(best) ? best : 9999;
  };

  const dominated = (displaced: number, pHits: number, dChanges: number, delay: number, wait: number, eventPlaced: boolean) => {
    if (!cut) return false;
    if (displaced > cut.displaced) return true;
    if (displaced < cut.displaced) return false;
    if (pHits > cut.priorityHits) return true;
    if (pHits < cut.priorityHits) return false;
    const bound = eventPlaced ? wait : waitLb(false, wait);
    const delayLb = delay + (eventPlaced ? 0 : bound);
    if (delayLb > cut.totalDelayMin) return true;
    if (delayLb < cut.totalDelayMin) return false;
    const w = bound;
    if (w > cut.eventWaitMin) return true;
    if (w < cut.eventWaitMin) return false;
    return dChanges > cut.dockChanges;
  };

  const docksFor = (truckId: string, forced?: string) => {
    const home = orig.get(truckId)?.dockId;
    const docks = forced ? yard.docks.filter((d) => d.id === forced) : [...yard.docks];
    if (home) docks.sort((a, b) => (a.id === home ? -1 : b.id === home ? 1 : 0));
    return docks;
  };

  if (movable.length === 1) {
    const exact = exactEventOnly(ctx);
    if (exact) consider(exact.appts);
    return { best: box.best?.appts ?? null, second: box.second?.appts ?? null, nodes: exact?.nodes ?? 1 };
  }

  const built = constructRepair(ctx);
  if (built) consider(relocateEvent(ctx, built));

  const rec = (i: number, displaced: number, pHits: number, dChanges: number, delay: number, wait: number, eventPlaced: boolean) => {
    nodes += 1;
    if (dominated(displaced, pHits, dChanges, delay, wait, eventPlaced)) return;
    if (i === movable.length) {
      consider(frozen.concat(assigned));
      return;
    }
    const truck = movable[i]!;
    const cargo = cargoById.get(truck.id) ?? truck.cargo;
    const eta = etaById.get(truck.id) ?? orig.get(truck.id)?.startMin ?? 0;
    const o = orig.get(truck.id);
    const isEvent = truck.id === event.truckId;
    const forced = isEvent && !mask.ignoreForceDock ? event.forceDockId : undefined;
    const last = i === movable.length - 1;

    for (const dock of docksFor(truck.id, forced)) {
      const di = dockIndex.get(dock.id);
      if (di === undefined) continue;
      const span = berthSpan(truck);
      if (!spanAllowed(yard.docks, di, span, cargo, truck.requiredEquipment, mask)) continue;
      const extras = o ? [o.startMin] : [];
      let starts: number[];
      if (last) {
        const s = earliestSpanFit(occ, di, span, eta, truck.durationMin, yard.shiftLenMin, extras);
        starts = s == null ? [] : [s];
      } else {
        starts = candidateStartsSpan(occ, di, span, eta, truck.durationMin, yard.shiftLenMin, extras);
      }
      if (o && dock.id === o.dockId) {
        starts.sort((a, b) => (a === o.startMin ? -1 : b === o.startMin ? 1 : a - b));
      }
      for (const start of starts) {
        if (start < eta) continue;
        if (!mask.ignoreWait && start - eta > truck.maxWaitMin) continue;
        if (!mask.ignoreDeadline && start + truck.durationMin > truck.deadlineMin) continue;
        if (!fitsSpan(occ, di, span, start, start + truck.durationMin, yard.shiftLenMin)) continue;
        const moved = !o || o.dockId !== dock.id || o.startMin !== start;
        const dlt = !isEvent && moved ? 1 : 0;
        const hit = dlt && truck.priority === 1 ? 1 : 0;
        const dch = o && o.dockId !== dock.id ? 1 : 0;
        const addDelay = Math.max(0, start - (isEvent ? eta : (o?.startMin ?? eta)));
        const nextWait = isEvent ? addDelay : wait;
        addSpan(occ, di, span, start, start + truck.durationMin);
        assigned.push({ truckId: truck.id, dockId: dock.id, startMin: start });
        rec(i + 1, displaced + dlt, pHits + hit, dChanges + dch, delay + addDelay, nextWait, eventPlaced || isEvent);
        assigned.pop();
        removeSpan(occ, di, span, start, start + truck.durationMin);
      }
    }
  };

  rec(0, 0, 0, 0, 0, 0, false);
  return { best: box.best?.appts ?? null, second: box.second?.appts ?? null, nodes };
}

function blockerIds(
  yard: Yard,
  event: DelayEvent,
  others: string[],
  cargo: Truck["cargo"],
  mask: SolveMask,
): string[] {
  const truck = yard.trucks.find((t) => t.id === event.truckId);
  if (!truck) return others;
  const eta = event.newEtaMin;
  const horizon = Math.min(yard.shiftLenMin, eta + truck.maxWaitMin + truck.durationMin, truck.deadlineMin);
  const eligible = new Set(
    yard.docks.filter((d) => dockEligibility(d, cargo, truck.requiredEquipment, mask) === "allow").map((d) => d.id),
  );
  const dockIds = yard.docks.map((d) => d.id);
  const trucks = truckMap(yard);
  const hits: string[] = [];
  for (const a of yard.appointments) {
    if (!others.includes(a.truckId)) continue;
    const t = trucks.get(a.truckId);
    if (!t) continue;
    const covered = spanIndexes(dockIds.length, dockIds.indexOf(a.dockId), berthSpan(t));
    const onEligible = covered ? covered.some((i) => eligible.has(dockIds[i]!)) : eligible.has(a.dockId);
    if (!onEligible) continue;
    const end = a.startMin + t.durationMin;
    if (end <= eta || a.startMin >= horizon) continue;
    hits.push(a.truckId);
  }
  return hits;
}

function solveMasked(
  yard: Yard,
  event: DelayEvent,
  mask: SolveMask,
): {
  status: SolveResult["status"];
  appts: Appointment[];
  second: Appointment[] | null;
  metrics: SolveMetrics;
  kUsed: number;
  nodes: number;
} {
  const orig = apptMap(yard.appointments);
  const home = orig.get(event.truckId);
  const nowMin = event.nowMin ?? defaultNowMin(home?.startMin ?? 0, event.newEtaMin);
  const { frozenIds } = classifyTime(yard, nowMin, event.truckId);
  const frozenSet = mask.ignoreFreeze ? new Set<string>() : new Set(frozenIds);

  const etaById = new Map<string, number>();
  const cargoById = new Map<string, Truck["cargo"]>();
  for (const t of yard.trucks) {
    const a = orig.get(t.id);
    etaById.set(t.id, a?.startMin ?? 0);
    cargoById.set(t.id, t.cargo);
  }
  etaById.set(event.truckId, event.newEtaMin);
  if (event.cargoOverride) cargoById.set(event.truckId, event.cargoOverride);

  const eventTruck = yard.trucks.find((t) => t.id === event.truckId);
  const cargo = eventTruck ? (cargoById.get(eventTruck.id) ?? eventTruck.cargo) : "dry";
  if (eventTruck) {
    const doors = event.forceDockId && !mask.ignoreForceDock
      ? yard.docks.filter((d) => d.id === event.forceDockId)
      : yard.docks;
    const anyAllow = doors.some((d) => dockEligibility(d, cargo, eventTruck.requiredEquipment, mask) === "allow");
    if (!anyAllow) {
      return { status: "INFEASIBLE", appts: yard.appointments, second: null, metrics: emptyMetrics(), kUsed: 0, nodes: 0 };
    }
  }

  let others: string[] | null = null;

  let best: Appointment[] | null = null;
  let second: Appointment[] | null = null;
  let bestM: SolveMetrics | null = null;
  let kUsed = 0;
  let nodes = 0;

  for (let k = 0; k <= mask.kMax; k++) {
    if (k === 1 && !others) {
      others = yard.trucks
        .filter((t) => t.id !== event.truckId && !frozenSet.has(t.id))
        .map((t) => t.id);
      const blocks = new Set(blockerIds(yard, event, others, cargo, mask));
      others.sort((a, b) => Number(blocks.has(b)) - Number(blocks.has(a)) || a.localeCompare(b));
    }
    const combos = k === 0 ? [[]] : subsets(others!, k);
    for (const extra of combos) {
      const movable = new Set<string>([event.truckId, ...extra]);
      const placed = search(yard, yard.appointments, movable, event, etaById, cargoById, mask, bestM?.lex ?? null);
      nodes += placed.nodes;
      if (!placed.best) continue;
      const m = metricsOf(yard.appointments, placed.best, yard, event.truckId, etaById, mask);
      if (!bestM || lexLess(m.lex, bestM.lex)) {
        second = placed.second ?? best;
        best = placed.best;
        bestM = m;
        kUsed = k;
      } else if (placed.second && (!second || lexLess(metricsOf(yard.appointments, placed.second, yard, event.truckId, etaById, mask).lex, metricsOf(yard.appointments, second, yard, event.truckId, etaById, mask).lex))) {
        second = placed.second;
      }
    }
    if (bestM && bestM.lex.violations === 0) break;
  }

  if (!best || !bestM || bestM.lex.violations > 0) {
    return { status: "INFEASIBLE", appts: yard.appointments, second: null, metrics: emptyMetrics(), kUsed: mask.kMax, nodes };
  }
  return { status: "OPTIMAL", appts: best, second, metrics: bestM, kUsed, nodes };
}

function diagnose(yard: Yard, event: DelayEvent, cargo: Truck["cargo"], iis: ConstraintId[]): ConflictAtom[] {
  const truck = yard.trucks.find((t) => t.id === event.truckId);
  if (!truck) return [{ code: "NO_GAP", constraint: "kbound", message: "Unknown truck.", core: true }];
  const atoms: ConflictAtom[] = [];
  const core = (c: ConstraintId) => iis.includes(c);

  if (event.forceDockId) {
    const forced = yard.docks.find((d) => d.id === event.forceDockId);
    if (!forced) {
      atoms.push({
        code: "FORCED_DOCK_INELIGIBLE",
        constraint: "forceDock",
        message: `Forced door ${event.forceDockId} does not exist.`,
        core: core("forceDock"),
      });
    } else {
      const elig = dockEligibility(forced, cargo, truck.requiredEquipment, STRICT_MASK);
      if (elig !== "allow") {
        if (!forced.cargo.includes(cargo) && !forced.unknownCargo?.includes(cargo)) {
          atoms.push({
            code: "CARGO",
            constraint: "cargo",
            message: `${forced.name} does not handle ${cargo} freight.`,
            core: core("cargo"),
          });
        }
        const missing = truck.requiredEquipment.filter((eq) => !forced.equipment.includes(eq));
        if (missing.length) {
          atoms.push({
            code: "EQUIPMENT",
            constraint: "equipment",
            message: `${forced.name} has no ${missing.join(", ")}. ${truck.plate} requires ${truck.requiredEquipment.join(", ")}.`,
            core: core("equipment"),
          });
        }
        atoms.push({
          code: "FORCED_DOCK_INELIGIBLE",
          constraint: "forceDock",
          message: `Commit to ${forced.short} is not executable.`,
          core: core("forceDock"),
        });
      }
    }
  }

  const eligible = yard.docks.filter((d) => dockEligibility(d, cargo, truck.requiredEquipment, STRICT_MASK) === "allow");
  if (!eligible.length && !event.forceDockId) {
    atoms.push({
      code: "NO_ELIGIBLE_DOCK",
      constraint: "equipment",
      message: `No door accepts ${cargo} with ${truck.requiredEquipment.join(", ")}.`,
      core: core("equipment") || core("cargo"),
    });
  }
  if (!atoms.length) {
    atoms.push({
      code: "NO_GAP",
      constraint: iis[0] ?? "kbound",
      message: "No feasible k-repair: every legal door is occupied through the wait/deadline window.",
      core: true,
    });
  }
  return atoms;
}

const DROP_SPECS: { id: ConstraintId; label: string; apply: (m: SolveMask) => SolveMask }[] = [
  { id: "forceDock", label: "Drop forced door", apply: (m) => ({ ...m, ignoreForceDock: true }) },
  { id: "cargo", label: "Ignore cargo match", apply: (m) => ({ ...m, ignoreCargo: true }) },
  { id: "equipment", label: "Ignore equipment", apply: (m) => ({ ...m, ignoreEquipment: true }) },
  { id: "wait", label: "Relax wait limit", apply: (m) => ({ ...m, ignoreWait: true }) },
  { id: "deadline", label: "Relax deadline", apply: (m) => ({ ...m, ignoreDeadline: true }) },
  { id: "freeze", label: "Allow moving in-bay trucks", apply: (m) => ({ ...m, ignoreFreeze: true }) },
  { id: "kbound", label: "Allow one more move", apply: (m) => ({ ...m, kMax: MAX_K + 1 }) },
];

function computeIis(yard: Yard, event: DelayEvent): { iis: ConstraintId[]; relaxations: Relaxation[] } {
  const relaxations: Relaxation[] = [];
  const needed: ConstraintId[] = [];
  const home = yard.appointments.find((a) => a.truckId === event.truckId);
  const nowMin = event.nowMin ?? defaultNowMin(home?.startMin ?? 0, event.newEtaMin);
  const { frozenIds } = classifyTime(yard, nowMin, event.truckId);

  for (const spec of DROP_SPECS) {
    if (spec.id === "forceDock" && !event.forceDockId) {
      relaxations.push({
        id: spec.id,
        drop: spec.id,
        label: spec.label,
        restores: false,
        inIis: false,
      });
      continue;
    }
    if (spec.id === "freeze" && frozenIds.length === 0) {
      relaxations.push({
        id: spec.id,
        drop: spec.id,
        label: spec.label,
        restores: false,
        inIis: false,
      });
      continue;
    }
    const trial = solveMasked(yard, event, spec.apply({ ...STRICT_MASK }));
    const restores = trial.status === "OPTIMAL";
    if (restores) needed.push(spec.id);
    const chosen = restores ? trial.appts.find((a) => a.truckId === event.truckId) : undefined;
    relaxations.push({
      id: spec.id,
      drop: spec.id,
      label: spec.label,
      restores,
      inIis: restores,
      chosen: chosen ? { dockId: chosen.dockId, startMin: chosen.startMin } : undefined,
      displaced: restores ? trial.metrics.displaced : undefined,
      delayMin: restores ? trial.metrics.totalDelayMin : undefined,
    });
  }
  return { iis: needed, relaxations: relaxations.map((r) => ({ ...r, inIis: needed.includes(r.drop) })) };
}

function buildCertificate(
  yard: Yard,
  event: DelayEvent,
  chosen: Appointment[],
  second: Appointment[] | null,
  metrics: SolveMetrics,
  greedy: Appointment[] | null,
): Certificate {
  const orig = apptMap(yard.appointments);
  const home = orig.get(event.truckId);
  const nowMin = event.nowMin ?? defaultNowMin(home?.startMin ?? 0, event.newEtaMin);
  const { frozenIds, doneIds } = classifyTime(yard, nowMin, event.truckId);
  const truck = yard.trucks.find((t) => t.id === event.truckId)!;
  const cargo = event.cargoOverride ?? truck.cargo;
  const skip = new Set([event.truckId]);
  const legalWindows: LegalWindow[] = [];
  const rejected: RejectedWindow[] = [];

  const span = berthSpan(truck);
  const dockCount = yard.docks.length;
  const dockIndex = new Map(yard.docks.map((d, i) => [d.id, i]));
  const trucks = truckMap(yard);
  const preSpans: { left: number; right: number; start: number; end: number }[] = [];
  for (const a of yard.appointments) {
    if (skip.has(a.truckId)) continue;
    const t = trucks.get(a.truckId);
    if (!t) continue;
    const di = dockIndex.get(a.dockId);
    const sp = berthSpan(t);
    if (di === undefined || sp < 1 || di < 0 || di >= dockCount) continue;
    preSpans.push({
      left: di,
      right: Math.min(dockCount, di + sp),
      start: a.startMin,
      end: a.startMin + t.durationMin,
    });
  }
  preSpans.sort((a, b) => a.start - b.start || a.end - b.end);

  const effSpan = Math.max(span, 1);
  for (let left = 0; left < dockCount; left++) {
    const dock = yard.docks[left]!;
    const elig = dockEligibility(dock, cargo, truck.requiredEquipment, STRICT_MASK);
    const right = Math.min(dockCount, left + effSpan);
    const occ: { start: number; end: number }[] = [];
    for (let k = 0; k < preSpans.length; k++) {
      const s = preSpans[k]!;
      if (s.left < right && left < s.right) {
        if (occ.length === 0) {
          occ.push({ start: s.start, end: s.end });
        } else {
          const last = occ[occ.length - 1]!;
          if (s.start <= last.end) {
            if (s.end > last.end) last.end = s.end;
          } else {
            occ.push({ start: s.start, end: s.end });
          }
        }
      }
    }
    const gaps = freeWindows(occ, yard.shiftLenMin);
    if (elig === "allow" && !spanAllowed(yard.docks, left, span, cargo, truck.requiredEquipment, STRICT_MASK)) {
      rejected.push({
        dockId: dock.id,
        startMin: 0,
        endMin: yard.shiftLenMin,
        reason: "EQUIPMENT",
        detail: `${dock.short} span covers a section that refuses this call`,
      });
      continue;
    }
    if (elig !== "allow") {
      const reason = elig === "unknown" ? "UNKNOWN" : !dock.cargo.includes(cargo) ? "CARGO" : "EQUIPMENT";
      rejected.push({
        dockId: dock.id,
        startMin: 0,
        endMin: yard.shiftLenMin,
        reason,
        detail: `${dock.short} is ${elig} for ${cargo}/${truck.requiredEquipment.join("+")}`,
      });
      continue;
    }
    if (event.forceDockId && dock.id !== event.forceDockId) {
      rejected.push({
        dockId: dock.id,
        startMin: 0,
        endMin: yard.shiftLenMin,
        reason: "FORCED_OTHER",
        detail: `Forced ${event.forceDockId}`,
      });
    }
    for (const gap of gaps) {
      const range = feasibleStartRange(gap, event.newEtaMin, truck.durationMin, truck.maxWaitMin, truck.deadlineMin);
      if (!range) {
        let reason: RejectedWindow["reason"] = "TOO_SHORT";
        if (gap.end - Math.max(gap.start, event.newEtaMin) < truck.durationMin) reason = "TOO_SHORT";
        else if (Math.max(gap.start, event.newEtaMin) - event.newEtaMin > truck.maxWaitMin) reason = "WAIT";
        else reason = "DEADLINE";
        rejected.push({
          dockId: dock.id,
          startMin: gap.start,
          endMin: gap.end,
          reason,
          detail: `${dock.short} gap ${gap.start}–${gap.end}`,
        });
        continue;
      }
      legalWindows.push({
        dockId: dock.id,
        earliestStart: range.earliest,
        latestStart: range.latest,
        gapEnd: gap.end,
        fits: true,
      });
    }
  }

  const self = chosen.find((a) => a.truckId === event.truckId)!;
  const gSelf = greedy?.find((a) => a.truckId === event.truckId);
  let whyNotGreedy: Certificate["whyNotGreedy"];
  if (gSelf && (gSelf.dockId !== self.dockId || gSelf.startMin !== self.startMin)) {
    const gWait = Math.max(0, gSelf.startMin - event.newEtaMin);
    whyNotGreedy = {
      greedyDockId: gSelf.dockId,
      greedyStartMin: gSelf.startMin,
      greedyWaitMin: gWait,
      savedWaitMin: gWait - metrics.eventWaitMin,
      note: `First hole ${gSelf.dockId} waits ${gWait}m; ${self.dockId} waits ${metrics.eventWaitMin}m.`,
    };
  }

  let nextBest: Certificate["nextBest"];
  if (second) {
    const s = second.find((a) => a.truckId === event.truckId);
    const sm = metricsOf(
      yard.appointments,
      second,
      yard,
      event.truckId,
      new Map([[event.truckId, event.newEtaMin]]),
      STRICT_MASK,
    );
    if (s) {
      nextBest = {
        dockId: s.dockId,
        startMin: s.startMin,
        displaced: sm.displaced,
        delayMin: sm.totalDelayMin,
        whyWorse:
          sm.eventWaitMin > metrics.eventWaitMin
            ? `waits ${sm.eventWaitMin - metrics.eventWaitMin}m more`
            : sm.displaced > metrics.displaced
              ? "more displacements"
              : "lex-dominated",
      };
    }
  }

  return {
    frozenIds,
    doneIds,
    nowMin,
    chosen: { truckId: event.truckId, dockId: self.dockId, startMin: self.startMin, waitMin: metrics.eventWaitMin },
    legalWindows,
    rejected,
    whyNotGreedy,
    nextBest,
  };
}

export function solve(yard: Yard, event: DelayEvent): SolveResult {
  const t0 = Date.now();
  const truck = yard.trucks.find((x) => x.id === event.truckId);
  if (!truck) {
    return {
      status: "INFEASIBLE",
      engine: "minmove",
      appointments: yard.appointments,
      metrics: emptyMetrics(),
      conflict: [{ code: "NO_GAP", constraint: "kbound", message: "Unknown truck.", core: true }],
      iis: ["kbound"],
      kUsed: 0,
      nodes: 0,
      ms: Date.now() - t0,
    };
  }

  const strict = solveMasked(yard, event, STRICT_MASK);
  const greedy = greedyInsert(yard, event);

  if (strict.status === "OPTIMAL") {
    return {
      status: "OPTIMAL",
      engine: "minmove",
      appointments: strict.appts,
      metrics: strict.metrics,
      certificate: buildCertificate(yard, event, strict.appts, strict.second, strict.metrics, greedy),
      kUsed: strict.kUsed,
      nodes: strict.nodes,
      ms: Date.now() - t0,
    };
  }

  const unknownAllow = solveMasked(yard, event, { ...STRICT_MASK, treatUnknownAs: "allow" });
  if (unknownAllow.status === "OPTIMAL") {
    const unkDocks = yard.docks.filter((d) => (d.unknownEquipment?.length ?? 0) + (d.unknownCargo?.length ?? 0) > 0);
    return {
      status: "HUMAN_REQUIRED",
      engine: "minmove",
      appointments: unknownAllow.appts,
      metrics: unknownAllow.metrics,
      certificate: buildCertificate(yard, event, unknownAllow.appts, unknownAllow.second, unknownAllow.metrics, greedy),
      conflict: [
        {
          code: "UNKNOWN_FACT",
          constraint: "equipment",
          message: `Plan uses a door with unknown facts (${unkDocks.map((d) => d.short).join(", ") || "unspecified"}). Confirm before commit.`,
          core: true,
        },
      ],
      iis: ["equipment"],
      kUsed: unknownAllow.kUsed,
      nodes: unknownAllow.nodes,
      ms: Date.now() - t0,
    };
  }

  const { iis, relaxations } = computeIis(yard, event);
  const cargo = event.cargoOverride ?? truck.cargo;
  return {
    status: "INFEASIBLE",
    engine: "minmove",
    appointments: yard.appointments,
    metrics: emptyMetrics(),
    conflict: diagnose(yard, event, cargo, iis),
    relaxations,
    iis,
    kUsed: MAX_K,
    nodes: 0,
    ms: Date.now() - t0,
  };
}

function cascadeHome(yard: Yard, event: DelayEvent): Appointment[] | null {
  const trucks = truckMap(yard);
  const eventTruck = trucks.get(event.truckId);
  const orig = apptMap(yard.appointments);
  const home = orig.get(event.truckId);
  if (!eventTruck || !home) return null;
  const cargo = event.cargoOverride ?? eventTruck.cargo;
  const dock = yard.docks.find((d) => d.id === (event.forceDockId ?? home.dockId));
  if (!dock || !spanAllowed(yard.docks, yard.docks.indexOf(dock), berthSpan(eventTruck), cargo, eventTruck.requiredEquipment, STRICT_MASK)) return null;

  const dockIds = yard.docks.map((d) => d.id);
  const homeLeft = dockIds.indexOf(dock.id);
  const homeSpan = berthSpan(eventTruck);
  if (homeLeft < 0 || homeSpan < 1) return null;
  const coversHome = (a: Appointment) => {
    const t = trucks.get(a.truckId);
    if (!t) return false;
    const left = dockIds.indexOf(a.dockId);
    const span = berthSpan(t);
    if (left < 0 || span < 1) return false;
    return left < homeLeft + homeSpan && homeLeft < left + span;
  };
  const onSpan = yard.appointments.filter(coversHome).sort((a, b) => a.startMin - b.startMin);
  const fixed = yard.appointments.filter((a) => !coversHome(a));
  const dockIndex = new Map(yard.docks.map((d, i) => [d.id, i]));
  const occ = occupancyFrom(fixed, yard, dockIndex);
  const next: Appointment[] = fixed.map((a) => ({ ...a }));
  for (const a of onSpan) {
    const t = trucks.get(a.truckId);
    if (!t) continue;
    const left = dockIds.indexOf(a.dockId);
    const span = berthSpan(t);
    if (!spanIndexes(dockIds.length, left, span)) return null;
    const eta = a.truckId === event.truckId ? event.newEtaMin : a.startMin;
    const start = earliestSpanFit(occ, left, span, eta, t.durationMin, yard.shiftLenMin, []);
    if (start == null) return null;
    if (start - eta > t.maxWaitMin) return null;
    if (start + t.durationMin > t.deadlineMin) return null;
    next.push({ truckId: a.truckId, dockId: a.dockId, startMin: start });
    addSpan(occ, left, span, start, start + t.durationMin);
  }
  return next;
}

function greedyInsert(yard: Yard, event: DelayEvent): Appointment[] | null {
  const trucks = truckMap(yard);
  const eventTruck = trucks.get(event.truckId);
  if (!eventTruck) return null;
  const cargo = event.cargoOverride ?? eventTruck.cargo;
  const eta = event.newEtaMin;
  const others = yard.appointments.filter((a) => a.truckId !== event.truckId);
  const dockIndex = new Map(yard.docks.map((d, i) => [d.id, i]));
  const occ = occupancyFrom(others, yard, dockIndex);
  const doors = event.forceDockId ? yard.docks.filter((d) => d.id === event.forceDockId) : yard.docks;
  const span = berthSpan(eventTruck);

  for (const dock of doors) {
    const di = dockIndex.get(dock.id);
    if (di === undefined) continue;
    if (!spanAllowed(yard.docks, di, span, cargo, eventTruck.requiredEquipment, STRICT_MASK)) continue;
    const start = earliestSpanFit(occ, di, span, eta, eventTruck.durationMin, yard.shiftLenMin, []);
    if (start == null || start < eta) continue;
    if (start - eta > eventTruck.maxWaitMin) continue;
    if (start + eventTruck.durationMin > eventTruck.deadlineMin) continue;
    if (!fitsSpan(occ, di, span, start, start + eventTruck.durationMin, yard.shiftLenMin)) continue;
    return others.concat([{ truckId: event.truckId, dockId: dock.id, startMin: start }]);
  }
  return cascadeHome(yard, event);
}

export function compareBaselines(yard: Yard, event: DelayEvent, minmove: SolveResult): BaselineRow[] {
  const orig = apptMap(yard.appointments);
  const etaById = new Map<string, number>();
  for (const t of yard.trucks) etaById.set(t.id, orig.get(t.id)?.startMin ?? 0);
  etaById.set(event.truckId, event.newEtaMin);

  const keep = cascadeHome(yard, event);
  const greedy = greedyInsert(yard, event);

  const row = (id: BaselineRow["id"], label: string, appts: Appointment[] | null, note: string): BaselineRow => {
    if (!appts) return { id, label, feasible: false, note };
    return {
      id,
      label,
      feasible: true,
      appointments: appts,
      metrics: metricsOf(yard.appointments, appts, yard, event.truckId, etaById, STRICT_MASK),
      note,
    };
  };

  return [
    row("keep-order", "Keep order", keep, "Same doors, push later trucks on the home door."),
    row("greedy", "Greedy first hole", greedy, "Insert without moving anyone; else cascade home door."),
    minmove.status === "OPTIMAL"
      ? {
          id: "minmove",
          label: "MinMove",
          feasible: true,
          appointments: minmove.appointments,
          metrics: minmove.metrics,
          note: `k=${minmove.kUsed} lex repair.`,
        }
      : { id: "minmove", label: "MinMove", feasible: false, note: minmove.status === "HUMAN_REQUIRED" ? "Needs a human on unknown facts." : "Infeasible under current constraints." },
  ];
}

export function applyCommit(yard: Yard, appointments: Appointment[]): Yard {
  return { ...yard, appointments: appointments.map((a) => ({ ...a })) };
}
