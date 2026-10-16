import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addBusy,
  addSpan,
  candidateStarts,
  candidateStartsSpan,
  earliestFit,
  earliestSpanFit,
  fitsBusy,
  fitsSpan,
  packLanes,
  removeBusy,
  scheduleLanes,
  type Busy,
} from "./calendar.ts";
import { createYard } from "./seed.ts";
import { solve } from "./solver.ts";

describe("interval calendar", () => {
  it("treats [start, end) as exclusive so back-to-back fits", () => {
    const busy: Busy[] = [{ start: 0, end: 60 }];
    assert.equal(fitsBusy(busy, 60, 90, 480), true);
    assert.equal(fitsBusy(busy, 59, 90, 480), false);
    assert.equal(fitsBusy(busy, 0, 60, 480), false);
  });

  it("add/remove is exact and candidate starts are interval ends", () => {
    const busy: Busy[] = [];
    addBusy(busy, 100, 160);
    addBusy(busy, 200, 240);
    const starts = candidateStarts(busy, 0, 40, 480, [80]);
    assert.deepEqual(starts, [0, 80, 160, 240]);
    assert.equal(fitsBusy(busy, 160, 200, 480), true);
    removeBusy(busy, 100, 160);
    assert.equal(fitsBusy(busy, 100, 140, 480), true);
  });

  it("keeps occupancy sorted and earliestFit is the first hole", () => {
    const busy: Busy[] = [];
    addBusy(busy, 200, 240);
    addBusy(busy, 0, 60);
    assert.deepEqual(busy.map((b) => b.start), [0, 200]);
    assert.equal(earliestFit(busy, 160, 90, 480, []), 240);
  });

  it("packLanes uses the first free lane", () => {
    const packed = packLanes([
      { id: "a", start: 0, end: 10 },
      { id: "b", start: 0, end: 8 },
      { id: "c", start: 10, end: 20 },
    ]);
    const lane = Object.fromEntries(packed.map((p) => [p.id, p.lane]));
    assert.notEqual(lane.a, lane.b);
    assert.ok(lane.c === lane.a || lane.c === lane.b);
  });

  it("span 1 uses the same starts as a single dock", () => {
    const occ: Busy[][] = [[{ start: 0, end: 60 }, { start: 200, end: 240 }]];
    assert.deepEqual(candidateStartsSpan(occ, 0, 1, 0, 40, 480, [80]), candidateStarts(occ[0]!, 0, 40, 480, [80]));
    assert.equal(earliestSpanFit(occ, 0, 1, 160, 90, 480, []), earliestFit(occ[0]!, 160, 90, 480, []));
  });

  it("a 4-section call blocks the three sections to its right", () => {
    const occ: Busy[][] = [[], [], [], [], [], []];
    addSpan(occ, 1, 4, 10, 30);
    assert.equal(fitsSpan(occ, 0, 1, 10, 30, 100), true);
    assert.equal(fitsSpan(occ, 1, 1, 10, 30, 100), false);
    assert.equal(fitsSpan(occ, 3, 1, 10, 30, 100), false);
    assert.equal(fitsSpan(occ, 4, 1, 10, 30, 100), false);
    assert.equal(fitsSpan(occ, 5, 1, 10, 30, 100), true);
    assert.equal(fitsSpan(occ, 2, 4, 0, 10, 100), true);
    assert.equal(fitsSpan(occ, 2, 4, 10, 20, 100), false);
    assert.equal(earliestSpanFit(occ, 2, 2, 0, 15, 100, []), 30);
  });

  it("a zero-length block does not hide the longer block around it", () => {
    const busy: Busy[] = [];
    addBusy(busy, 0, 30);
    addBusy(busy, 10, 10);
    assert.equal(fitsBusy(busy, 10, 15, 100), false);
    assert.equal(fitsBusy(busy, 30, 40, 100), true);
  });

  it("a span that hangs off the quay still blocks the sections it touches", () => {
    const occ: Busy[][] = [[], [], []];
    addSpan(occ, 1, 3, 0, 40);
    assert.equal(fitsSpan(occ, 0, 1, 0, 10, 100), true);
    assert.equal(fitsSpan(occ, 1, 1, 0, 10, 100), false);
    assert.equal(fitsSpan(occ, 2, 1, 0, 10, 100), false);
    assert.equal(fitsSpan(occ, 1, 3, 40, 50, 100), false);
  });

  it("scheduleLanes with 2 servers queues the third job", () => {
    const out = scheduleLanes(
      [
        { id: "a", ready: 0, dur: 10 },
        { id: "b", ready: 0, dur: 10 },
        { id: "c", ready: 0, dur: 10 },
      ],
      2,
    );
    const c = out.find((j) => j.id === "c")!;
    assert.equal(c.start, 10);
    assert.ok(c.lane === 0 || c.lane === 1);
  });
});

describe("interval search matches known C+47 optimum", () => {
  it("still sends C to Door 6 at 240", () => {
    const yard = createYard();
    const origC = yard.appointments.find((a) => a.truckId === "C")!;
    const result = solve(yard, { truckId: "C", newEtaMin: origC.startMin + 47, source: "manual" });
    assert.equal(result.status, "OPTIMAL");
    const c = result.appointments.find((a) => a.truckId === "C")!;
    assert.equal(c.dockId, "D6");
    assert.equal(c.startMin, 240);
  });
});
