import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { phaseAt } from "./flow.ts";
import { toDelayEvent } from "./parse.ts";
import { BASE_DELAY_MIN, createYard } from "./seed.ts";
import {
  commitPlan,
  parseNote,
  planDelay,
  planFromInput,
  simulateBoard,
} from "./services.ts";

describe("end-to-end: note → parse → solve → flow → commit", () => {
  it("English C+47 lands on Door 6, yard at 11:27, dock at 12:00, then commit sticks", () => {
    const yard = createYard();
    const parsed = parseNote("Truck C late 47 min", yard);
    assert.equal(parsed.matchedTruckId, "C");
    const orig = yard.appointments.find((a) => a.truckId === "C")!;
    const event = toDelayEvent(parsed.event, "C", orig.startMin + BASE_DELAY_MIN);
    const plan = planDelay(event, yard);
    assert.equal(plan.status, "OPTIMAL");
    const c = plan.appointments.find((a) => a.truckId === "C")!;
    assert.equal(c.dockId, "D6");
    assert.equal(c.startMin, 240);
    assert.equal(plan.kUsed, 0);
    assert.ok((plan.nodes ?? 99) < 40);

    const trace = simulateBoard(yard, plan.appointments, event);
    const flow = trace.trucks.find((t) => t.truckId === "C")!;
    assert.equal(phaseAt(flow, 207), "yard");
    assert.equal(phaseAt(flow, 240), "dock");
    assert.equal(flow.dock.dockId, "D6");

    assert.equal(yard.appointments.find((a) => a.truckId === "C")!.dockId, "D1");
    const live = commitPlan(yard, plan.appointments);
    assert.equal(live.appointments.find((a) => a.truckId === "C")!.dockId, "D6");
    assert.equal(live.appointments.find((a) => a.truckId === "P")!.dockId, "D1");
  });

  it("Vietnamese radio note → reefer C cannot stay on dry Door 1", () => {
    const yard = createYard();
    const parsed = parseNote(
      "51C-882.13 bên Q7 đang kẹt, chắc tầm 11h27 mới tới. Hàng đông lạnh nhé.",
      yard,
    );
    assert.equal(parsed.complete, true);
    const event = toDelayEvent(parsed.event, "C", 207);
    const plan = planDelay(event, yard);
    assert.ok(plan.status === "OPTIMAL" || plan.status === "INFEASIBLE");
    if (plan.status === "OPTIMAL") {
      const c = plan.appointments.find((a) => a.truckId === "C")!;
      const dock = yard.docks.find((d) => d.id === c.dockId)!;
      assert.ok(dock.cargo.includes("reefer"));
    } else {
      assert.ok((plan.iis ?? []).length > 0);
    }
  });

  it("forced Door 4 blocks, unforce restores Door 6, commit then a second delay still solves", () => {
    const yard = createYard();
    const blocked = planFromInput({ truckId: "C", newEtaMin: 207, forceDockId: "D4" }, yard);
    assert.equal(blocked.status, "INFEASIBLE");
    const drop = blocked.relaxations?.find((r) => r.drop === "forceDock");
    assert.equal(drop?.restores, true);
    assert.equal(drop?.chosen?.dockId, "D6");

    const open = planFromInput({ truckId: "C", newEtaMin: 207 }, yard);
    assert.equal(open.status, "OPTIMAL");
    const live = commitPlan(yard, open.appointments);
    const again = planFromInput({ truckId: "P", newEtaMin: 280 }, live);
    assert.ok(again.status === "OPTIMAL" || again.status === "INFEASIBLE" || again.status === "HUMAN_REQUIRED");
    if (again.status === "OPTIMAL") {
      const overlaps = live.docks.every((d) => {
        const on = again.appointments
          .filter((a) => a.dockId === d.id)
          .map((a) => {
            const t = live.trucks.find((x) => x.id === a.truckId)!;
            return { s: a.startMin, e: a.startMin + t.durationMin };
          })
          .sort((a, b) => a.s - b.s);
        for (let i = 1; i < on.length; i++) if (on[i]!.s < on[i - 1]!.e) return false;
        return true;
      });
      assert.equal(overlaps, true);
    }
  });
});
