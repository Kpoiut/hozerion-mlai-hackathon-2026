import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BASE_DELAY_MIN, EVENT_TRUCK_ID, createYard } from "./seed.ts";
import { parseEvent } from "./parse.ts";
import { compareBaselines, dockAccepts, solve } from "./solver.ts";
import type { Appointment, DelayEvent, Dock, Truck, Yard } from "./types.ts";

function section(id: string, cargo: "dry" | "reefer"): Dock {
  return {
    id,
    name: id,
    short: id,
    equipment: cargo === "dry" ? ["forklift"] : ["reefer_plug"],
    cargo: [cargo],
  };
}

function call(id: string, durationMin: number, span: number, cargo: "dry" | "reefer" = "dry"): Truck {
  return {
    id,
    plate: id,
    hauler: "h",
    durationMin,
    cargo,
    requiredEquipment: cargo === "dry" ? ["forklift"] : ["reefer_plug"],
    priority: 2,
    deadlineMin: 500,
    maxWaitMin: 500,
    span,
  };
}

function quay(docks: Dock[], trucks: Truck[], appointments: Appointment[]): Yard {
  return {
    id: "quay",
    name: "quay",
    gate: "gate",
    shiftLabel: "shift",
    shiftStartMin: 0,
    shiftLenMin: 200,
    docks,
    trucks,
    appointments,
  };
}

describe("MinMove solver", () => {
  it("sends C to Door 6 after J, zero other moves", () => {
    const yard = createYard();
    const origC = yard.appointments.find((a) => a.truckId === EVENT_TRUCK_ID)!;
    const result = solve(yard, {
      truckId: EVENT_TRUCK_ID,
      newEtaMin: origC.startMin + BASE_DELAY_MIN,
      source: "manual",
    });
    assert.equal(result.status, "OPTIMAL");
    const nextC = result.appointments.find((a) => a.truckId === "C");
    const nextP = result.appointments.find((a) => a.truckId === "P");
    const nextQ = result.appointments.find((a) => a.truckId === "Q");
    const nextJ = result.appointments.find((a) => a.truckId === "J");
    assert.ok(nextC && nextP && nextQ && nextJ);
    assert.equal(nextC.dockId, "D6");
    assert.equal(nextC.startMin, 240);
    assert.equal(nextP.dockId, "D1");
    assert.equal(nextP.startMin, 260);
    assert.equal(nextQ.startMin, 350);
    assert.equal(nextJ.startMin, 200);
    assert.equal(result.metrics.displaced, 0);
    assert.equal(result.metrics.dockChangeIds.join(), "C");
    assert.equal(result.metrics.deadlineMisses, 0);
  });

  it("beats keep-order and greedy on displaced count", () => {
    const yard = createYard();
    const origC = yard.appointments.find((a) => a.truckId === "C")!;
    const event = { truckId: "C" as const, newEtaMin: origC.startMin + BASE_DELAY_MIN, source: "manual" as const };
    const minmove = solve(yard, event);
    const rows = compareBaselines(yard, event, minmove);
    const keep = rows.find((r) => r.id === "keep-order")!;
    const greedy = rows.find((r) => r.id === "greedy")!;
    const mm = rows.find((r) => r.id === "minmove")!;
    assert.equal(mm.feasible, true);
    assert.equal(keep.feasible, false);
    assert.ok(greedy.feasible && greedy.metrics && mm.metrics);
    assert.ok(mm.metrics.totalDelayMin < greedy.metrics.totalDelayMin);
    assert.ok(mm.metrics.objective < greedy.metrics.objective);
    assert.equal(mm.metrics.deadlineMisses, 0);
  });

  it("rejects a forced heavy door that has no forklift", () => {
    const yard = createYard();
    const origC = yard.appointments.find((a) => a.truckId === "C")!;
    const heavy = yard.docks.find((d) => d.id === "D4")!;
    const truck = yard.trucks.find((t) => t.id === "C")!;
    assert.equal(dockAccepts(heavy, truck.cargo, truck.requiredEquipment), false);
    const result = solve(yard, {
      truckId: "C",
      newEtaMin: origC.startMin + BASE_DELAY_MIN,
      forceDockId: "D4",
      source: "manual",
    });
    assert.equal(result.status, "INFEASIBLE");
    assert.ok(result.conflict?.some((c) => c.code === "EQUIPMENT" || c.code === "FORCED_DOCK_INELIGIBLE"));
  });

  it("rejects reefer C on dry-only home door without a cold plug", () => {
    const yard = createYard();
    const origC = yard.appointments.find((a) => a.truckId === "C")!;
    const result = solve(yard, {
      truckId: "C",
      newEtaMin: origC.startMin + 40,
      cargoOverride: "reefer",
      forceDockId: "D1",
      source: "manual",
    });
    assert.equal(result.status, "INFEASIBLE");
    assert.ok(result.conflict && result.conflict.length > 0);
  });

  it("moves four booked calls when that is the only deadline-feasible repair", () => {
    const tight = (id: string, deadlineMin: number, maxWaitMin: number): Truck => ({
      ...call(id, 10, 1),
      deadlineMin,
      maxWaitMin,
    });
    const yard = quay(
      [section("D0", "dry")],
      [tight("A", 20, 20), tight("B", 30, 30), tight("C", 40, 40), tight("D", 50, 50), tight("E", 60, 0)],
      [
        { truckId: "A", dockId: "D0", startMin: 0 },
        { truckId: "B", dockId: "D0", startMin: 10 },
        { truckId: "C", dockId: "D0", startMin: 20 },
        { truckId: "D", dockId: "D0", startMin: 30 },
        { truckId: "E", dockId: "D0", startMin: 50 },
      ],
    );
    yard.shiftLenMin = 80;
    const result = solve(yard, { truckId: "E", newEtaMin: 0, nowMin: -1, source: "manual" });
    assert.equal(result.status, "OPTIMAL");
    assert.equal(result.metrics.displaced, 4);
    assert.equal(result.metrics.deadlineMisses, 0);
    const start = (id: string) => result.appointments.find((a) => a.truckId === id)?.startMin;
    assert.equal(start("E"), 0);
    assert.equal(start("A"), 10);
    assert.equal(start("B"), 20);
    assert.equal(start("C"), 30);
    assert.equal(start("D"), 40);
  });
});

describe("span occupancy", () => {
  it("does not start inside a longer block that a zero-length block sits on", () => {
    const yard = quay(
      [section("D0", "dry"), section("D1", "dry")],
      [call("A", 30, 1), call("Z", 0, 1), call("C", 5, 1)],
      [
        { truckId: "A", dockId: "D0", startMin: 0 },
        { truckId: "Z", dockId: "D0", startMin: 10 },
        { truckId: "C", dockId: "D1", startMin: 0 },
      ],
    );
    const event: DelayEvent = { truckId: "C", newEtaMin: 10, forceDockId: "D0", source: "manual" };
    const result = solve(yard, event);
    assert.equal(result.status, "OPTIMAL");
    const c = result.appointments.find((a) => a.truckId === "C")!;
    assert.equal(c.dockId, "D0");
    assert.equal(c.startMin, 30);
  });

  it("does not treat a neighbour section as free when a wide call covers it", () => {
    const yard = quay(
      [section("D0", "dry"), section("D1", "dry")],
      [call("A", 100, 2), call("B", 10, 1), call("C", 5, 1)],
      [
        { truckId: "A", dockId: "D0", startMin: 0 },
        { truckId: "B", dockId: "D1", startMin: 10 },
        { truckId: "C", dockId: "D1", startMin: 0 },
      ],
    );
    const result = solve(yard, { truckId: "C", newEtaMin: 25, forceDockId: "D1", source: "manual" });
    assert.equal(result.status, "OPTIMAL");
    const c = result.appointments.find((a) => a.truckId === "C")!;
    assert.equal(c.dockId, "D1");
    assert.equal(c.startMin, 100);
  });

  it("keeps a call that hangs off the quay blocking the sections it still touches", () => {
    const yard = quay(
      [section("D0", "dry"), section("D1", "dry"), section("D2", "dry")],
      [call("A", 40, 3), call("C", 10, 1)],
      [
        { truckId: "A", dockId: "D1", startMin: 0 },
        { truckId: "C", dockId: "D0", startMin: 0 },
      ],
    );
    const result = solve(yard, { truckId: "C", newEtaMin: 0, forceDockId: "D1", source: "manual" });
    assert.equal(result.status, "OPTIMAL");
    const c = result.appointments.find((a) => a.truckId === "C")!;
    assert.equal(c.dockId, "D1");
    assert.equal(c.startMin, 40);
  });

  it("refuses a dry span that would cover a reefer-only section", () => {
    const yard = quay(
      [section("D0", "dry"), section("D1", "reefer"), section("D2", "dry"), section("D3", "dry")],
      [call("C", 20, 2)],
      [{ truckId: "C", dockId: "D0", startMin: 0 }],
    );
    const result = solve(yard, { truckId: "C", newEtaMin: 0, source: "manual" });
    assert.equal(result.status, "OPTIMAL");
    const c = result.appointments.find((a) => a.truckId === "C")!;
    assert.equal(c.dockId, "D2");
    assert.equal(c.startMin, 0);
    assert.equal(result.metrics.displaced, 0);
  });

  it("breaks an equal wait by quay order, not by dock id text", () => {
    const yard = quay(
      [section("B0", "dry"), section("B2", "dry"), section("B10", "dry")],
      [call("A", 50, 1), call("C", 10, 1)],
      [
        { truckId: "A", dockId: "B0", startMin: 0 },
        { truckId: "C", dockId: "B0", startMin: 0 },
      ],
    );
    const result = solve(yard, { truckId: "C", newEtaMin: 0, source: "manual" });
    assert.equal(result.status, "OPTIMAL");
    const c = result.appointments.find((a) => a.truckId === "C")!;
    assert.equal(c.dockId, "B2");
    assert.equal(c.startMin, 0);
  });
});

describe("deterministic parser", () => {
  it("reads a Vietnamese delay with plate and reefer", () => {
    const r = parseEvent("51C-882.13 bên Q7 đang kẹt, chắc tầm 11h27 mới tới. Hàng đông lạnh nhé.");
    assert.equal(r.matchedTruckId, "C");
    assert.equal(r.event.newEtaMin, 207);
    assert.equal(r.event.cargoOverride, "reefer");
    assert.equal(r.complete, true);
  });

  it("reads late minutes and a forced door", () => {
    const r = parseEvent("Truck C late 47 min, door 4");
    assert.equal(r.matchedTruckId, "C");
    assert.equal(r.event.newEtaMin, 160 + 47);
    assert.equal(r.event.forceDockId, "D4");
  });
});
