/**
 * Occupancy depth on a published berth plan.
 *
 * Source: Alberto Santini, "Instances, Best Known Solutions and Models for
 * Berth Allocation Problems", DOI 10.5281/zenodo.17665596.
 * Generator fact (generator/instance_generation.ipynb): discretisation_hr = 1,
 * arrival_time = floor(ETA seconds / 3600), handling_time = floor(call seconds / 3600),
 * ship_len = berth modulus count, n_periods = 14 * 24. Quays 24B and 36A,
 * Port of Barcelona container calls in 2024, weeks 2 through 50. The repository
 * README describes this as the whole published set for this one problem.
 * Calls longer than 48h are not in the file.
 * The generator folds an ETA past day 7 back by 7 days. This test does not unfold it.
 *
 * BKS mooring_berth is the leftmost section. The last occupied period is
 * mooring_time + handling_time - 1, so the solver interval is [mooring, mooring+handling).
 * The BKS model in rp_solver.py minimizes makespan (max completion). The file's
 * makespan field is that value. The repository README also says total completion;
 * that sentence does not match the solver that wrote these files.
 * Neither number is MinMove's score.
 *
 * Question asked of solve(): one ship is one period late, and, when a later ship
 * uses the same sections, one ship arrives as that later ship starts. Saved periods
 * are the certificate's first-hole wait minus the chosen wait. A save of 0 or a
 * negative save stays in the table. handling_time 0 is counted and not solved.
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { berthSpan } from "./calendar.ts";
import { layoutDockBlocks } from "./layout.ts";
import { solve } from "./solver.ts";
import type { Appointment, DelayEvent, Dock, Truck, Yard } from "./types.ts";
import { classifyTime, defaultNowMin } from "./windows.ts";

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
  completion_time: number;
  mooring_berth: number;
}

interface BksFile {
  makespan: number;
  ships: BksShip[];
}

interface Call {
  id: number;
  arrival: number;
  handling: number;
  len: number;
  moor: number;
  berth: number;
}

const WEEK_DIR = fileURLToPath(new URL("../../../data/barcelona/weeks/", import.meta.url));

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

function timeOverlap(aStart: number, aDur: number, bStart: number, bDur: number): boolean {
  return aStart < bStart + bDur && bStart < aStart + aDur;
}

function planOverlaps(yard: Yard, appts: Appointment[]): string | null {
  const trucks = new Map(yard.trucks.map((t) => [t.id, t]));
  const dockAt = new Map(yard.docks.map((d, i) => [d.id, i]));
  for (let i = 0; i < appts.length; i++) {
    for (let j = i + 1; j < appts.length; j++) {
      const a = appts[i]!;
      const b = appts[j]!;
      const ta = trucks.get(a.truckId);
      const tb = trucks.get(b.truckId);
      const ia = dockAt.get(a.dockId);
      const ib = dockAt.get(b.dockId);
      if (!ta || !tb || ia === undefined || ib === undefined) return "missing truck or dock";
      if (
        timeOverlap(a.startMin, ta.durationMin, b.startMin, tb.durationMin) &&
        spaceOverlap(ia, berthSpan(ta), ib, berthSpan(tb))
      ) {
        return `${a.truckId}@${a.dockId}:${a.startMin} overlaps ${b.truckId}@${b.dockId}:${b.startMin}`;
      }
    }
  }
  return null;
}

function yardFromCalls(id: string, nBerths: number, horizon: number, calls: Call[]): Yard {
  return {
    id,
    name: id,
    gate: "published",
    shiftLabel: "period",
    shiftStartMin: 0,
    shiftLenMin: horizon,
    docks: Array.from({ length: nBerths }, (_, i) => dock(`B${i}`)),
    trucks: calls.map((c) => truck(`S${c.id}`, c.handling, c.len, horizon)),
    appointments: calls.map((c) => ({ truckId: `S${c.id}`, dockId: `B${c.berth}`, startMin: c.moor })),
  };
}

describe("span changes the first hole", () => {
  it("a 2-section call leaves a blocked home berth and saves 70 periods against the first hole", () => {
    const horizon = 200;
    const yard = yardFromCalls("span-oracle", 6, horizon, [
      { id: 0, arrival: 0, handling: 80, len: 2, moor: 0, berth: 0 },
      { id: 1, arrival: 0, handling: 20, len: 2, moor: 0, berth: 0 },
    ]);
    const event: DelayEvent = { truckId: "S1", newEtaMin: 10, source: "manual" };
    const result = solve(yard, event);
    assert.equal(result.status, "OPTIMAL");
    const chosen = result.appointments.find((a) => a.truckId === "S1")!;
    assert.equal(chosen.dockId, "B2");
    assert.equal(chosen.startMin, 10);
    assert.equal(result.metrics.eventWaitMin, 0);
    assert.equal(result.metrics.displaced, 0);
    const greedy = result.certificate?.whyNotGreedy;
    assert.ok(greedy);
    assert.equal(greedy.greedyDockId, "B0");
    assert.equal(greedy.greedyStartMin, 80);
    assert.equal(greedy.greedyWaitMin, 70);
    assert.equal(greedy.savedWaitMin, 70);
    assert.equal(planOverlaps(yard, result.appointments), null);
    const painted = layoutDockBlocks(yard, yard.appointments)
      .filter((b) => b.truckId === "S0")
      .map((b) => b.dockId);
    assert.deepEqual(painted, ["B0", "B1"]);
  });
});

function loadPair(name: string): { inst: InstanceFile; bks: BksFile; calls: Call[] } {
  const inst = JSON.parse(readFileSync(`${WEEK_DIR}${name}`, "utf8")) as InstanceFile;
  const bks = JSON.parse(readFileSync(`${WEEK_DIR}bks-${name}`, "utf8")) as BksFile;
  assert.equal(inst.berth_len.length, inst.n_berths);
  assert.ok(inst.berth_len.every((n) => n === 1), `${name} has a berth_len other than 1; span=ship_len would be the wrong map`);
  assert.equal(inst.n_periods, 336);
  assert.equal(bks.ships.length, inst.n_ships);
  const calls: Call[] = bks.ships.map((s) => {
    assert.equal(s.data_arrival_time, inst.arrival_time[s.data_ship_id]);
    assert.equal(s.data_handling_time, inst.handling_time[s.data_ship_id]);
    assert.equal(s.data_ship_length, inst.ship_len[s.data_ship_id]);
    assert.equal(s.completion_time, s.mooring_time + s.data_handling_time - 1);
    assert.ok(s.mooring_time >= s.data_arrival_time);
    assert.ok(s.mooring_berth >= 0);
    assert.ok(s.mooring_berth + s.data_ship_length <= inst.n_berths);
    return {
      id: s.data_ship_id,
      arrival: s.data_arrival_time,
      handling: s.data_handling_time,
      len: s.data_ship_length,
      moor: s.mooring_time,
      berth: s.mooring_berth,
    };
  });
  const seen = new Set(calls.map((c) => c.id));
  assert.equal(seen.size, inst.n_ships);
  for (let i = 0; i < calls.length; i++) {
    for (let j = i + 1; j < calls.length; j++) {
      const a = calls[i]!;
      const b = calls[j]!;
      const hit =
        timeOverlap(a.moor, a.handling, b.moor, b.handling) && spaceOverlap(a.berth, a.len, b.berth, b.len);
      assert.equal(hit, false, `${name} BKS overlaps S${a.id} and S${b.id} under the hour model`);
    }
  }
  const maxCompletion = Math.max(...bks.ships.map((s) => s.completion_time));
  assert.equal(bks.makespan, maxCompletion);
  return { inst, bks, calls };
}

interface Row {
  file: string;
  family: "plus1" | "next-ship" | "zero-handling";
  ship: number;
  len: number;
  eta: number;
  status: string;
  wait: number | null;
  greedyWait: number | null;
  saved: number | null;
  displaced: number | null;
  dock: string | null;
}

function score(file: string, family: Row["family"], yard: Yard, call: Call, eta: number): Row {
  const event: DelayEvent = { truckId: `S${call.id}`, newEtaMin: eta, source: "manual" };
  const result = solve(yard, event);
  const again = solve(yard, event);
  assert.equal(again.status, result.status);
  assert.equal(again.metrics.displaced, result.metrics.displaced);
  assert.equal(again.metrics.eventWaitMin, result.metrics.eventWaitMin);
  const chosen = result.appointments.find((a) => a.truckId === event.truckId);
  const chosen2 = again.appointments.find((a) => a.truckId === event.truckId);
  assert.equal(chosen2?.dockId, chosen?.dockId);
  assert.equal(chosen2?.startMin, chosen?.startMin);
  if (result.status !== "OPTIMAL") {
    return {
      file,
      family,
      ship: call.id,
      len: call.len,
      eta,
      status: result.status,
      wait: null,
      greedyWait: null,
      saved: null,
      displaced: null,
      dock: null,
    };
  }
  assert.ok(chosen);
  assert.equal(planOverlaps(yard, result.appointments), null);
  assert.ok(chosen.startMin >= eta);
  const now = event.nowMin ?? defaultNowMin(call.moor, eta);
  const { frozenIds } = classifyTime(yard, now, event.truckId);
  const orig = new Map(yard.appointments.map((a) => [a.truckId, a]));
  const next = new Map(result.appointments.map((a) => [a.truckId, a]));
  for (const id of frozenIds) {
    assert.equal(next.get(id)?.dockId, orig.get(id)?.dockId);
    assert.equal(next.get(id)?.startMin, orig.get(id)?.startMin);
  }
  const greedy = result.certificate?.whyNotGreedy;
  const saved = greedy ? greedy.savedWaitMin : 0;
  if (greedy) assert.equal(saved, greedy.greedyWaitMin - result.metrics.eventWaitMin);
  return {
    file,
    family,
    ship: call.id,
    len: call.len,
    eta,
    status: result.status,
    wait: result.metrics.eventWaitMin,
    greedyWait: greedy ? greedy.greedyWaitMin : result.metrics.eventWaitMin,
    saved,
    displaced: result.metrics.displaced,
    dock: chosen.dockId,
  };
}

function nextShipEta(calls: Call[], self: Call): number | null {
  const end = self.moor + self.handling;
  let eta: number | null = null;
  for (const other of calls) {
    if (other.id === self.id || other.handling < 1) continue;
    if (!spaceOverlap(self.berth, self.len, other.berth, other.len)) continue;
    if (other.moor < end) continue;
    if (eta === null || other.moor < eta) eta = other.moor;
  }
  return eta;
}

describe("published Barcelona weeks", () => {
  it("scores every downloaded week that has a BKS, including saves of zero", () => {
    const names = readdirSync(WEEK_DIR)
      .filter((n) => n.startsWith("bcn_") && n.endsWith(".json"))
      .sort();
    assert.ok(names.includes("bcn_24B_2.json"));
    const rows: Row[] = [];
    for (const name of names) {
      if (!existsSync(`${WEEK_DIR}bks-${name}`)) {
        assert.fail(`${name} has no BKS beside it; do not score a plan this repo invented`);
      }
      const { inst, calls } = loadPair(name);
      const solvable = calls.filter((c) => c.handling >= 1);
      for (const c of calls.filter((c) => c.handling < 1)) {
        rows.push({
          file: name,
          family: "zero-handling",
          ship: c.id,
          len: c.len,
          eta: c.moor,
          status: "NOT_SOLVED",
          wait: null,
          greedyWait: null,
          saved: null,
          displaced: null,
          dock: null,
        });
      }
      const yard = yardFromCalls(name, inst.n_berths, inst.n_periods, solvable);
      for (const c of solvable) {
        rows.push(score(name, "plus1", yard, c, c.moor + 1));
        const later = nextShipEta(calls, c);
        if (later !== null) rows.push(score(name, "next-ship", yard, c, later));
      }
    }
    const pack = (fileRows: Row[]) => {
      const solved = fileRows.filter((r) => r.status === "OPTIMAL");
      const plus = solved.filter((r) => r.family === "plus1");
      const later = solved.filter((r) => r.family === "next-ship");
      const sum = (list: Row[]) => list.reduce((n, r) => n + (r.saved ?? 0), 0);
      return {
        rows: fileRows.length,
        optimal: solved.length,
        notOptimal: fileRows.filter((r) => r.status !== "OPTIMAL").length,
        plus1: plus.length,
        plus1SavedPositive: plus.filter((r) => (r.saved ?? 0) > 0).length,
        plus1SavedZero: plus.filter((r) => r.saved === 0).length,
        plus1SavedNegative: plus.filter((r) => (r.saved ?? 0) < 0).length,
        plus1SavedSum: sum(plus),
        nextShip: later.length,
        nextShipSavedPositive: later.filter((r) => (r.saved ?? 0) > 0).length,
        nextShipSavedZero: later.filter((r) => r.saved === 0).length,
        nextShipSavedNegative: later.filter((r) => (r.saved ?? 0) < 0).length,
        nextShipSavedSum: sum(later),
        zeroHandling: fileRows.filter((r) => r.family === "zero-handling").length,
        displacedPositive: solved.filter((r) => (r.displaced ?? 0) > 0).length,
      };
    };
    const eight = new Set([
      "bcn_24B_10.json",
      "bcn_24B_2.json",
      "bcn_24B_25.json",
      "bcn_24B_50.json",
      "bcn_36A_10.json",
      "bcn_36A_2.json",
      "bcn_36A_25.json",
      "bcn_36A_50.json",
    ]);
    assert.equal(names.length, 98);
    for (const name of names) {
      const match = name.match(/^bcn_(24B|36A)_(\d+)\.json$/);
      assert.ok(match, name);
      const week = Number(match[2]);
      assert.ok(week >= 2 && week <= 50, name);
    }
    for (const name of eight) assert.ok(names.includes(name));
    assert.deepEqual(
      pack(rows.filter((row) => eight.has(row.file))),
      {
        rows: 438,
        optimal: 438,
        notOptimal: 0,
        plus1: 235,
        plus1SavedPositive: 148,
        plus1SavedZero: 87,
        plus1SavedNegative: 0,
        plus1SavedSum: 10538,
        nextShip: 203,
        nextShipSavedPositive: 128,
        nextShipSavedZero: 75,
        nextShipSavedNegative: 0,
        nextShipSavedSum: 4631,
        zeroHandling: 0,
        displacedPositive: 0,
      },
    );
    assert.deepEqual(pack(rows), {
      rows: 5797,
      optimal: 5797,
      notOptimal: 0,
      plus1: 3092,
      plus1SavedPositive: 1591,
      plus1SavedZero: 1501,
      plus1SavedNegative: 0,
      plus1SavedSum: 105954,
      nextShip: 2705,
      nextShipSavedPositive: 1013,
      nextShipSavedZero: 1692,
      nextShipSavedNegative: 0,
      nextShipSavedSum: 40465,
      zeroHandling: 0,
      displacedPositive: 0,
    });
  });
});
