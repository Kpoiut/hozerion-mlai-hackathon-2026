/**
 * Business comparator: keep the published berth and push later calls on that
 * span, versus solve(). The leftmost hole is recorded and is not the score.
 */
import { readdirSync, readFileSync } from "node:fs";
import { compareBaselines, solve } from "../src/lib/minmove/solver.ts";
import type { DelayEvent, Dock, Truck, Yard } from "../src/lib/minmove/types.ts";

interface InstanceFile {
  n_berths: number;
  berth_len: number[];
  n_ships: number;
  n_periods: number;
  arrival_time: number[];
  handling_time: number[];
  ship_len: number[];
}
interface BksShip {
  data_ship_id: number;
  data_arrival_time: number;
  data_handling_time: number;
  data_ship_length: number;
  mooring_time: number;
  mooring_berth: number;
}
interface BksFile {
  ships: BksShip[];
}
interface Call {
  id: number;
  handling: number;
  len: number;
  moor: number;
  berth: number;
}

const WEEK_DIR = new URL("../data/barcelona/weeks/", import.meta.url);

function dock(id: string): Dock {
  return { id, name: id, short: id, equipment: ["forklift"], cargo: ["dry"] };
}
function truck(id: string, durationMin: number, span: number, horizon: number): Truck {
  return {
    id,
    plate: id,
    hauler: "call",
    durationMin,
    cargo: "dry",
    requiredEquipment: ["forklift"],
    priority: 2,
    deadlineMin: horizon,
    maxWaitMin: horizon,
    span,
  };
}
function spaceOverlap(aBerth: number, aLen: number, bBerth: number, bLen: number): boolean {
  return aBerth < bBerth + bLen && bBerth < aBerth + aLen;
}

function load(name: string): { yard: Yard; calls: Call[] } {
  const inst = JSON.parse(readFileSync(new URL(name, WEEK_DIR), "utf8")) as InstanceFile;
  const bks = JSON.parse(readFileSync(new URL(`bks-${name}`, WEEK_DIR), "utf8")) as BksFile;
  const calls = bks.ships
    .map((s) => ({
      id: s.data_ship_id,
      handling: s.data_handling_time,
      len: s.data_ship_length,
      moor: s.mooring_time,
      berth: s.mooring_berth,
    }))
    .filter((c) => c.handling >= 1);
  const yard: Yard = {
    id: name,
    name,
    gate: "published",
    shiftLabel: "period",
    shiftStartMin: 0,
    shiftLenMin: inst.n_periods,
    docks: Array.from({ length: inst.n_berths }, (_, i) => dock(`B${i}`)),
    trucks: calls.map((c) => truck(`S${c.id}`, c.handling, c.len, inst.n_periods)),
    appointments: calls.map((c) => ({ truckId: `S${c.id}`, dockId: `B${c.berth}`, startMin: c.moor })),
  };
  return { yard, calls };
}

function nextEta(calls: Call[], self: Call): number | null {
  const end = self.moor + self.handling;
  let eta: number | null = null;
  for (const other of calls) {
    if (other.id === self.id) continue;
    if (!spaceOverlap(self.berth, self.len, other.berth, other.len)) continue;
    if (other.moor < end) continue;
    if (eta === null || other.moor < eta) eta = other.moor;
  }
  return eta;
}

interface Acc {
  n: number;
  keepInfeasible: number;
  planInfeasible: number;
  sameDecision: number;
  keepPushes: number;
  planPushesFewer: number;
  planWaitLess: number;
  planWaitMore: number;
  planWaitEqual: number;
  delaySaved: number;
  shipsNotPushed: number;
  holeSaved: number;
  holeSavedWhenKeepSame: number;
}

function empty(): Acc {
  return {
    n: 0,
    keepInfeasible: 0,
    planInfeasible: 0,
    sameDecision: 0,
    keepPushes: 0,
    planPushesFewer: 0,
    planWaitLess: 0,
    planWaitMore: 0,
    planWaitEqual: 0,
    delaySaved: 0,
    shipsNotPushed: 0,
    holeSaved: 0,
    holeSavedWhenKeepSame: 0,
  };
}

interface Example {
  file: string;
  ship: string;
  eta: number;
  keepWait: number;
  keepPushed: number;
  keepDelay: number;
  planWait: number;
  planPushed: number;
  planDelay: number;
  planDock: string;
  home: string;
  holeWait: number;
}

const examples: Example[] = [];

function add(acc: Acc, file: string, call: Call, eta: number, yard: Yard) {
  const event: DelayEvent = { truckId: `S${call.id}`, newEtaMin: eta, source: "manual" };
  const result = solve(yard, event);
  const rows = compareBaselines(yard, event, result);
  const keep = rows.find((r) => r.id === "keep-order");
  const plan = rows.find((r) => r.id === "minmove");
  acc.n += 1;
  if (!plan?.feasible || !plan.metrics) {
    acc.planInfeasible += 1;
    return;
  }
  const hole = result.certificate?.whyNotGreedy?.savedWaitMin ?? 0;
  acc.holeSaved += hole;
  if (!keep?.feasible || !keep.metrics) {
    acc.keepInfeasible += 1;
    return;
  }
  const home = yard.appointments.find((a) => a.truckId === event.truckId);
  const chosen = result.appointments.find((a) => a.truckId === event.truckId);
  const same =
    chosen?.dockId === home?.dockId &&
    chosen?.startMin === keep.appointments?.find((a) => a.truckId === event.truckId)?.startMin &&
    plan.metrics.displaced === keep.metrics.displaced;
  if (same) acc.sameDecision += 1;
  if (keep.metrics.displaced > 0) acc.keepPushes += 1;
  if (plan.metrics.displaced < keep.metrics.displaced) acc.planPushesFewer += 1;
  const waitDelta = keep.metrics.eventWaitMin - plan.metrics.eventWaitMin;
  if (waitDelta > 0) acc.planWaitLess += 1;
  else if (waitDelta < 0) acc.planWaitMore += 1;
  else acc.planWaitEqual += 1;
  acc.delaySaved += keep.metrics.totalDelayMin - plan.metrics.totalDelayMin;
  acc.shipsNotPushed += keep.metrics.displaced - plan.metrics.displaced;
  if (same) acc.holeSavedWhenKeepSame += hole;
  const useful = keep.metrics.displaced - plan.metrics.displaced;
  if (useful > 0 || waitDelta > 0) {
    examples.push({
      file,
      ship: event.truckId,
      eta,
      keepWait: keep.metrics.eventWaitMin,
      keepPushed: keep.metrics.displaced,
      keepDelay: keep.metrics.totalDelayMin,
      planWait: plan.metrics.eventWaitMin,
      planPushed: plan.metrics.displaced,
      planDelay: plan.metrics.totalDelayMin,
      planDock: chosen?.dockId ?? "",
      home: home?.dockId ?? "",
      holeWait: result.certificate?.whyNotGreedy?.greedyWaitMin ?? plan.metrics.eventWaitMin,
    });
  }
}

const plus = empty();
const later = empty();
const names = readdirSync(WEEK_DIR)
  .filter((n) => n.startsWith("bcn_") && n.endsWith(".json"))
  .sort();

for (const name of names) {
  const { yard, calls } = load(name);
  for (const call of calls) {
    add(plus, name, call, call.moor + 1, yard);
    const eta = nextEta(calls, call);
    if (eta != null) add(later, name, call, eta, yard);
  }
  console.error(name);
}

examples.sort((a, b) => b.keepPushed - a.keepPushed || b.keepDelay - a.keepDelay - (b.planDelay - a.planDelay));
console.log(JSON.stringify({ plus, later, examples: examples.slice(0, 12) }, null, 2));
