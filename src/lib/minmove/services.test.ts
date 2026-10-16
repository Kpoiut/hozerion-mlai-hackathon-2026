import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { phaseAt } from "./flow.ts";
import { BASE_DELAY_MIN, EVENT_TRUCK_ID, createYard } from "./seed.ts";
import {
  DelayEventIn,
  SERVICES,
  baselinesFor,
  commitPlan,
  healthMap,
  healthReport,
  parseNote,
  planDelay,
  planFromInput,
  simulateBoard,
} from "./services.ts";

describe("parse service", () => {
  it("maps a Vietnamese radio note to C at 11:27 reefer", () => {
    const r = parseNote("51C-882.13 bên Q7 đang kẹt, chắc tầm 11h27 mới tới. Hàng đông lạnh nhé.");
    assert.equal(r.matchedTruckId, "C");
    assert.equal(r.event.newEtaMin, 207);
    assert.equal(r.event.cargoOverride, "reefer");
    assert.equal(r.complete, true);
  });

  it("rejects an empty note without throwing", () => {
    const r = parseNote("   ");
    assert.equal(r.complete, false);
    assert.ok(r.warnings.length > 0);
  });
});

describe("solver service", () => {
  it("plans C+47 onto Door 6 at 240 with k=0", () => {
    const yard = createYard();
    const orig = yard.appointments.find((a) => a.truckId === EVENT_TRUCK_ID)!;
    const result = planFromInput({ truckId: "C", newEtaMin: orig.startMin + BASE_DELAY_MIN });
    assert.equal(result.status, "OPTIMAL");
    assert.equal(result.engine, "minmove");
    const c = result.appointments.find((a) => a.truckId === "C")!;
    assert.equal(c.dockId, "D6");
    assert.equal(c.startMin, 240);
    assert.equal(result.kUsed, 0);
    assert.equal(result.metrics.displaced, 0);
    assert.ok((result.nodes ?? 0) > 0);
    assert.ok((result.nodes ?? 99) < 80);
  });

  it("rejects a schema-invalid event before search", () => {
    assert.throws(() => DelayEventIn.parse({ truckId: "C", newEtaMin: -1 }));
    assert.throws(() => DelayEventIn.parse({ truckId: "", newEtaMin: 10 }));
  });

  it("IIS on forced Door 4 names equipment, not a GPT guess", () => {
    const yard = createYard();
    const orig = yard.appointments.find((a) => a.truckId === "C")!;
    const result = planDelay(
      { truckId: "C", newEtaMin: orig.startMin + BASE_DELAY_MIN, forceDockId: "D4", source: "manual" },
      yard,
    );
    assert.equal(result.status, "INFEASIBLE");
    assert.ok(result.iis?.includes("forceDock") || result.iis?.includes("equipment"));
    assert.ok(result.conflict?.some((c) => c.constraint === "equipment" || c.constraint === "forceDock"));
  });
});

describe("flow service", () => {
  it("keeps C in yard at 11:27 then at dock after 12:00 on the C+47 plan", () => {
    const yard = createYard();
    const event = { truckId: "C" as const, newEtaMin: 160 + 47, source: "manual" as const };
    const plan = planDelay(event, yard);
    assert.equal(plan.status, "OPTIMAL");
    const trace = simulateBoard(yard, plan.appointments, event);
    const c = trace.trucks.find((t) => t.truckId === "C")!;
    assert.equal(phaseAt(c, 207), "yard");
    assert.equal(phaseAt(c, 241), "dock");
  });
});

describe("service map", () => {
  it("puts the arbiter between sensors and the solver; agent is off until asked", () => {
    assert.deepEqual(
      SERVICES.map((s) => s.id),
      ["parse", "arbiter", "solver", "flow", "agent"],
    );
    const off = healthMap(false);
    assert.equal(off.solver, "ok");
    assert.equal(off.arbiter, "ok");
    assert.equal(off.agent, "off");
    const report = healthReport(true);
    assert.equal(report.ok, true);
    assert.equal(report.services.find((s) => s.id === "agent")?.status, "ok");
  });

  it("commit is the only mutation: plan does not touch the published yard", () => {
    const yard = createYard();
    const before = yard.appointments.find((a) => a.truckId === "C")!.dockId;
    const result = planFromInput({ truckId: "C", newEtaMin: 207 });
    assert.equal(yard.appointments.find((a) => a.truckId === "C")!.dockId, before);
    const next = commitPlan(yard, result.appointments);
    assert.equal(next.appointments.find((a) => a.truckId === "C")!.dockId, "D6");
    assert.equal(yard.appointments.find((a) => a.truckId === "C")!.dockId, before);
  });

  it("baselines stay worse than MinMove on C+47 wait", () => {
    const yard = createYard();
    const event = { truckId: "C" as const, newEtaMin: 207, source: "manual" as const };
    const result = planDelay(event, yard);
    const rows = baselinesFor(yard, event, result);
    const mm = rows.find((r) => r.id === "minmove")!;
    const greedy = rows.find((r) => r.id === "greedy")!;
    assert.equal(mm.feasible, true);
    assert.ok(greedy.feasible && greedy.metrics && mm.metrics);
    assert.ok(mm.metrics.eventWaitMin < greedy.metrics.eventWaitMin);
  });
});
