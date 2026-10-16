import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BASE_DELAY_MIN, createYard } from "./seed.ts";
import { compareBaselines, solve } from "./solver.ts";
import { classifyTime, defaultNowMin } from "./windows.ts";
import type { DelayEvent, Yard } from "./types.ts";

function lateC(extra: Partial<DelayEvent> = {}): { yard: Yard; event: DelayEvent } {
  const yard = createYard();
  const origC = yard.appointments.find((a) => a.truckId === "C")!;
  return {
    yard,
    event: {
      truckId: "C",
      newEtaMin: origC.startMin + BASE_DELAY_MIN,
      source: "manual",
      ...extra,
    },
  };
}

describe("certificate and lex", () => {
  it("C+47 certificate beats greedy wait by 40 min on Door 6", () => {
    const { yard, event } = lateC();
    const result = solve(yard, event);
    assert.equal(result.status, "OPTIMAL");
    assert.ok(result.certificate);
    assert.equal(result.certificate.chosen.dockId, "D6");
    assert.equal(result.certificate.chosen.startMin, 240);
    assert.equal(result.certificate.chosen.waitMin, 33);
    const g = result.certificate.whyNotGreedy;
    assert.ok(g);
    assert.equal(g.greedyDockId, "D2");
    assert.equal(g.greedyStartMin, 280);
    assert.equal(g.greedyWaitMin, 73);
    assert.equal(g.savedWaitMin, 40);
    const rows = compareBaselines(yard, event, result);
    assert.equal(rows.find((r) => r.id === "keep-order")?.feasible, false);
  });

  it("classifyTime at 159 marks A/B done and C free", () => {
    const yard = createYard();
    const origC = yard.appointments.find((a) => a.truckId === "C")!;
    const now = defaultNowMin(origC.startMin, origC.startMin + BASE_DELAY_MIN);
    assert.equal(now, 159);
    const { doneIds, frozenIds, freeIds } = classifyTime(yard, now, "C");
    assert.ok(doneIds.includes("A"));
    assert.ok(doneIds.includes("B"));
    assert.ok(freeIds.includes("C"));
    assert.ok(!frozenIds.includes("C"));
  });
});

describe("IIS and relaxations", () => {
  it("force D4 IIS includes equipment and forceDock; dropping force restores D6", () => {
    const { yard, event } = lateC({ forceDockId: "D4" });
    const result = solve(yard, event);
    assert.equal(result.status, "INFEASIBLE");
    assert.ok(result.iis?.includes("forceDock"));
    assert.ok(result.iis?.includes("equipment"));
    const dropForce = result.relaxations?.find((r) => r.drop === "forceDock");
    assert.equal(dropForce?.restores, true);
    assert.equal(dropForce?.chosen?.dockId, "D6");
    const dropCargo = result.relaxations?.find((r) => r.drop === "cargo");
    assert.equal(dropCargo?.restores, false);
  });

  it("mutations of ineligible doors always produce a nonempty IIS", () => {
    const yard = createYard();
    const origC = yard.appointments.find((a) => a.truckId === "C")!;
    const cases: DelayEvent[] = [
      { truckId: "C", newEtaMin: origC.startMin + 47, forceDockId: "D4", source: "manual" },
      { truckId: "C", newEtaMin: origC.startMin + 47, forceDockId: "D3", source: "manual" },
      { truckId: "C", newEtaMin: origC.startMin + 40, cargoOverride: "reefer", forceDockId: "D1", source: "manual" },
      { truckId: "C", newEtaMin: origC.startMin + 40, cargoOverride: "reefer", forceDockId: "D4", source: "manual" },
      { truckId: "C", newEtaMin: origC.startMin + 47, forceDockId: "D5", source: "manual" },
      { truckId: "F", newEtaMin: 40, forceDockId: "D1", source: "manual" },
      { truckId: "F", newEtaMin: 40, forceDockId: "D4", source: "manual" },
      { truckId: "C", newEtaMin: origC.startMin + 47, forceDockId: "D3", cargoOverride: "reefer", source: "manual" },
    ];
    for (const event of cases) {
      const result = solve(yard, event);
      if (result.status === "INFEASIBLE") {
        assert.ok(result.iis && result.iis.length > 0, `empty IIS for ${JSON.stringify(event)}`);
        const restores = (result.relaxations ?? []).filter((r) => r.restores);
        assert.ok(restores.length > 0 || result.iis.length > 0);
      }
    }
  });
});

describe("freeze and unknown facts", () => {
  it("J is frozen at now=210 and is not displaced", () => {
    const { yard, event } = lateC({ nowMin: 210 });
    const result = solve(yard, event);
    assert.equal(result.status, "OPTIMAL");
    assert.ok(result.certificate?.frozenIds.includes("J"));
    const j = result.appointments.find((a) => a.truckId === "J");
    assert.equal(j?.dockId, "D6");
    assert.equal(j?.startMin, 200);
    assert.ok(!result.metrics.displacedIds.includes("J"));
  });

  it("unknown forklift as the only hole is HUMAN_REQUIRED", () => {
    const yard: Yard = {
      id: "unk",
      name: "Unknown bay",
      gate: "G",
      shiftLabel: "08:00–16:00",
      shiftStartMin: 480,
      shiftLenMin: 480,
      docks: [
        {
          id: "U1",
          name: "Unknown fork",
          short: "U1",
          equipment: [],
          cargo: ["dry"],
          unknownEquipment: ["forklift"],
        },
      ],
      trucks: [
        {
          id: "X",
          plate: "51X-000.00",
          hauler: "Test",
          durationMin: 60,
          cargo: "dry",
          requiredEquipment: ["forklift"],
          priority: 2,
          deadlineMin: 400,
          maxWaitMin: 180,
        },
      ],
      appointments: [{ truckId: "X", dockId: "U1", startMin: 0 }],
    };
    const result = solve(yard, { truckId: "X", newEtaMin: 20, source: "manual" });
    assert.equal(result.status, "HUMAN_REQUIRED");
    assert.ok(result.conflict?.some((c) => c.code === "UNKNOWN_FACT"));
    const placed = result.appointments.find((a) => a.truckId === "X");
    assert.equal(placed?.dockId, "U1");
  });
});
