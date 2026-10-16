import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GATE_IN_MIN, GATE_LANES, GATE_OUT_MIN, etaMap, phaseAt, simulateFlow } from "./flow.ts";
import { layoutDockBlocks, layoutFlowBlocks } from "./layout.ts";
import { publishedYard } from "./published-week.ts";
import { BASE_DELAY_MIN, createYard } from "./seed.ts";
import { solve } from "./solver.ts";

describe("container flow", () => {
  it("two gate lanes: no three trucks occupy gate at the same instant", () => {
    const yard = createYard();
    const eta = etaMap(yard, yard.appointments);
    const trace = simulateFlow(yard, yard.appointments, eta);
    const instants: number[] = [];
    for (const f of trace.trucks) {
      instants.push(f.gateIn.start, f.gateIn.end - 1, f.gateOut.start, f.gateOut.end - 1);
    }
    for (const t of new Set(instants)) {
      const inGate = trace.trucks.filter((f) => f.gateIn.start <= t && t < f.gateIn.end).length;
      const outGate = trace.trucks.filter((f) => f.gateOut.start <= t && t < f.gateOut.end).length;
      assert.ok(inGate <= GATE_LANES, `gate-in overlap ${inGate} at ${t}`);
      assert.ok(outGate <= GATE_LANES, `gate-out overlap ${outGate} at ${t}`);
    }
  });

  it("C+47 dwells in yard then docks D6; phase clock is monotonic", () => {
    const yard = createYard();
    const origC = yard.appointments.find((a) => a.truckId === "C")!;
    const event = { truckId: "C", newEtaMin: origC.startMin + BASE_DELAY_MIN, source: "manual" as const };
    const result = solve(yard, event);
    assert.equal(result.status, "OPTIMAL");
    const eta = etaMap(yard, result.appointments, "C", event.newEtaMin);
    const trace = simulateFlow(yard, result.appointments, eta);
    const c = trace.trucks.find((f) => f.truckId === "C")!;
    assert.equal(c.dock.dockId, "D6");
    assert.equal(c.dock.start, 240);
    assert.equal(c.gateIn.end - c.gateIn.start, GATE_IN_MIN);
    assert.equal(c.gateOut.end - c.gateOut.start, GATE_OUT_MIN);
    assert.equal(phaseAt(c, c.gateIn.start - 1), "enroute");
    assert.equal(phaseAt(c, c.gateIn.start), "gate");
    assert.equal(phaseAt(c, c.dock.start), "dock");
    assert.equal(phaseAt(c, c.gateOut.start), "exit");
    assert.equal(phaseAt(c, c.gateOut.end), "gone");
    const blocks = layoutDockBlocks(yard, result.appointments, "C");
    const cBlock = blocks.find((b) => b.truckId === "C")!;
    assert.equal(cBlock.dockId, "D6");
    assert.ok(cBlock.isEvent);
    const flowBlocks = layoutFlowBlocks(trace, yard.shiftLenMin, "C");
    assert.ok(flowBlocks.some((b) => b.truckId === "C" && b.row === "gate"));
    assert.ok(flowBlocks.some((b) => b.truckId === "C" && b.row === "exit"));
  });

  it("published board has no dock overlaps on the same door", () => {
    const yard = createYard();
    const trucks = new Map(yard.trucks.map((t) => [t.id, t]));
    for (const dock of yard.docks) {
      const on = yard.appointments
        .filter((a) => a.dockId === dock.id)
        .map((a) => {
          const t = trucks.get(a.truckId)!;
          return { id: a.truckId, start: a.startMin, end: a.startMin + t.durationMin };
        })
        .sort((a, b) => a.start - b.start);
      for (let i = 1; i < on.length; i++) {
        assert.ok(on[i]!.start >= on[i - 1]!.end, `${dock.id} overlap ${on[i - 1]!.id}/${on[i]!.id}`);
      }
    }
  });

  it("does not invent an 8-hour gate on a published week", () => {
    const yard = publishedYard();
    const trace = simulateFlow(yard, yard.appointments, etaMap(yard, yard.appointments));
    const s11 = trace.trucks.find((f) => f.truckId === "S11");
    assert.ok(s11);
    assert.equal(s11.gateIn.end - s11.gateIn.start, 0);
    assert.equal(s11.gateOut.end - s11.gateOut.start, 0);
    assert.equal(s11.dock.start, 78);
    assert.equal(s11.dock.end, 115);
    assert.equal(trace.gateQueuedMin, 0);
    assert.equal(phaseAt(s11, 78), "dock");
    assert.equal(phaseAt(s11, 115), "gone");
  });
});
