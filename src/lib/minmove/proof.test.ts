import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { planProof } from "./proof.ts";
import { BASE_DELAY_MIN, createYard } from "./seed.ts";
import { solve } from "./solver.ts";

describe("plan proof", () => {
  it("says the C+47 plan saves 40 min and moves nobody", () => {
    const yard = createYard();
    const orig = yard.appointments.find((a) => a.truckId === "C")!;
    const result = solve(yard, {
      truckId: "C",
      newEtaMin: orig.startMin + BASE_DELAY_MIN,
      source: "manual",
    });
    const proof = planProof(result);
    assert.ok(proof);
    assert.equal(proof.dock, "6");
    assert.equal(proof.waitMin, 33);
    assert.equal(proof.habitDock, "2");
    assert.equal(proof.habitWaitMin, 73);
    assert.equal(proof.savedMin, 40);
    assert.equal(proof.moved, 0);
    assert.equal(proof.headline, "Saves 40 min versus the first free door");
  });

  it("stays silent when the plan cannot be committed", () => {
    const yard = createYard();
    const result = solve(yard, { truckId: "X", newEtaMin: 20, source: "manual" });
    assert.equal(planProof(result), null);
  });
});
