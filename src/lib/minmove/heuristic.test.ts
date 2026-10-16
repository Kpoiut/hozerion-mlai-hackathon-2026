import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { constructRepair, exactEventOnly, relocateEvent, type RepairCtx } from "./heuristic.ts";
import { BASE_DELAY_MIN, createYard } from "./seed.ts";
import { STRICT_MASK } from "./types.ts";
import { solve } from "./solver.ts";

function ctxC47(): RepairCtx {
  const yard = createYard();
  const orig = new Map(yard.appointments.map((a) => [a.truckId, a]));
  const etaById = new Map(yard.trucks.map((t) => [t.id, orig.get(t.id)?.startMin ?? 0]));
  const cargoById = new Map(yard.trucks.map((t) => [t.id, t.cargo]));
  etaById.set("C", (orig.get("C")?.startMin ?? 0) + BASE_DELAY_MIN);
  return {
    yard,
    original: yard.appointments,
    movableIds: new Set(["C"]),
    event: { truckId: "C", newEtaMin: etaById.get("C")!, source: "manual" },
    etaById,
    cargoById,
    mask: STRICT_MASK,
  };
}

describe("heuristic", () => {
  it("exactEventOnly sends C+47 to Door 6 at 240, not greedy Door 2", () => {
    const hit = exactEventOnly(ctxC47());
    assert.ok(hit);
    const c = hit.appts.find((a) => a.truckId === "C")!;
    assert.equal(c.dockId, "D6");
    assert.equal(c.startMin, 240);
    assert.equal(hit.nodes, 6);
  });

  it("constructRepair matches exact on k=0 and relocate does not worsen it", () => {
    const c = ctxC47();
    const built = constructRepair(c);
    assert.ok(built);
    const placed = built.find((a) => a.truckId === "C")!;
    assert.equal(placed.dockId, "D6");
    assert.equal(placed.startMin, 240);
    const moved = relocateEvent(c, built);
    const again = moved.find((a) => a.truckId === "C")!;
    assert.equal(again.dockId, "D6");
    assert.equal(again.startMin, 240);
  });

  it("solver k=0 path stays optimal and visits one node per door", () => {
    const yard = createYard();
    const origC = yard.appointments.find((a) => a.truckId === "C")!;
    const result = solve(yard, { truckId: "C", newEtaMin: origC.startMin + BASE_DELAY_MIN, source: "manual" });
    assert.equal(result.status, "OPTIMAL");
    assert.equal(result.kUsed, 0);
    assert.equal(result.appointments.find((a) => a.truckId === "C")?.dockId, "D6");
    assert.ok((result.nodes ?? 99) <= 8);
  });
});
