import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { selectLive, selectPlayhead, useBoardStore } from "./store.ts";

describe("board store", () => {
  it("findPlan writes an OPTIMAL result without a React tree", () => {
    useBoardStore.getState().openDemo();
    useBoardStore.getState().findPlan();
    const s = useBoardStore.getState();
    assert.equal(s.result?.status, "OPTIMAL");
    assert.equal(s.etc?.winner, "manual");
    assert.equal(s.etc?.etaMin, 207);
    assert.equal(s.event?.newEtaMin, 207);
    assert.equal(selectPlayhead(s), 240);
    assert.equal(selectLive(s).find((a) => a.truckId === "C")?.startMin, 240);
  });

  it("commit publishes the plan onto the yard and clears the draft", () => {
    useBoardStore.getState().openDemo();
    useBoardStore.getState().findPlan();
    useBoardStore.getState().commit();
    const s = useBoardStore.getState();
    assert.equal(s.result, null);
    assert.equal(s.yard.appointments.find((a) => a.truckId === "C")?.startMin, 240);
  });

  it("reset restores the seed board", () => {
    useBoardStore.getState().openDemo();
    useBoardStore.getState().setDelayMin(10);
    useBoardStore.getState().findPlan();
    useBoardStore.getState().reset();
    const s = useBoardStore.getState();
    assert.equal(s.result, null);
    assert.equal(s.clockMin, 0);
    assert.equal(s.delayMin, 47);
    assert.equal(s.yard.id, "tan-thuan-b");
  });

  it("commit can be undone back to the published yard", () => {
    useBoardStore.getState().openDemo();
    useBoardStore.getState().findPlan();
    useBoardStore.getState().commit();
    assert.equal(useBoardStore.getState().yard.appointments.find((a) => a.truckId === "C")?.startMin, 240);
    useBoardStore.getState().undo();
    const s = useBoardStore.getState();
    assert.equal(s.yard.appointments.find((a) => a.truckId === "C")?.startMin, 160);
    assert.equal(s.previous, null);
    assert.equal(s.etc, null);
  });

  it("hold forces the booked door", () => {
    useBoardStore.getState().openDemo();
    useBoardStore.getState().hold();
    const s = useBoardStore.getState();
    assert.equal(s.holdOn, true);
    assert.equal(s.forceDock, "D1");
    assert.ok(s.result);
  });

  it("readNote keeps the radio clock when the slider says something else", async () => {
    useBoardStore.getState().openDemo();
    useBoardStore.getState().setDelayMin(10);
    useBoardStore.getState().setMessage("51C-882.13 bên Q7 đang kẹt, chắc tầm 11h27 mới tới. Hàng đông lạnh nhé.");
    await useBoardStore.getState().readNote();
    const s = useBoardStore.getState();
    assert.equal(s.etc?.winner, "parse");
    assert.equal(s.event?.newEtaMin, 207);
    assert.equal(s.event?.cargoOverride, "reefer");
    assert.equal(s.event?.source, "parse");
    assert.equal(s.delayMin, 47);
  });

  it("nudge slides the draft on the same door when the gap is free", () => {
    useBoardStore.getState().openDemo();
    useBoardStore.getState().findPlan();
    useBoardStore.getState().nudge(15);
    const s = useBoardStore.getState();
    assert.equal(selectLive(s).find((a) => a.truckId === "C")?.startMin, 255);
    assert.equal(s.result?.certificate?.chosen.dockId, "D6");
  });
});
