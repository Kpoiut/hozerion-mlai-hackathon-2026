import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { doorOccupancy, occupyingTruck, remainingGap } from "./doors.ts";
import { createYard } from "./seed.ts";

describe("door occupancy is live, not hardcoded", () => {
  it("Door 1 is busy at 08:00, Door 4 is open, Door 6 is open", () => {
    const yard = createYard();
    const trucks = new Map(yard.trucks.map((t) => [t.id, t]));
    assert.equal(doorOccupancy("D1", yard.appointments, trucks, 0, yard.shiftLenMin), "busy");
    assert.equal(occupyingTruck("D1", yard.appointments, trucks, 0)?.truckId, "A");
    assert.equal(doorOccupancy("D4", yard.appointments, trucks, 0, yard.shiftLenMin), "open");
    assert.equal(doorOccupancy("D6", yard.appointments, trucks, 0, yard.shiftLenMin), "open");
  });

  it("Door 6 turns busy while J is on the bay, then open after J leaves if C has not arrived", () => {
    const yard = createYard();
    const trucks = new Map(yard.trucks.map((t) => [t.id, t]));
    assert.equal(doorOccupancy("D6", yard.appointments, trucks, 200, yard.shiftLenMin), "busy");
    assert.equal(occupyingTruck("D6", yard.appointments, trucks, 210)?.truckId, "J");
    assert.equal(doorOccupancy("D6", yard.appointments, trucks, 240, yard.shiftLenMin), "open");
  });

  it("a 4-door call is busy on every door it covers", () => {
    const yard = createYard();
    const trucks = new Map(yard.trucks.map((t) => [t.id, { ...t }]));
    const wide = trucks.get("A")!;
    wide.span = 4;
    const live = [{ truckId: "A", dockId: "D1", startMin: 0 }];
    assert.equal(occupyingTruck("D4", live, trucks, 10, yard.docks)?.truckId, "A");
    assert.equal(occupyingTruck("D5", live, trucks, 10, yard.docks), undefined);
    assert.equal(doorOccupancy("D3", live, trucks, 10, yard.shiftLenMin, yard.docks), "busy");
    assert.equal(occupyingTruck("D4", live, trucks, 10), undefined);
  });

  it("a fully packed tail is tight, not closed", () => {
    const yard = createYard();
    const trucks = new Map(yard.trucks.map((t) => [t.id, t]));
    const packed = [{ truckId: "A", dockId: "D4", startMin: 420 }];
    assert.equal(doorOccupancy("D4", packed, trucks, 420, 480), "busy");
    assert.ok(remainingGap("D4", packed, trucks, 480, 480) < 30);
    assert.equal(doorOccupancy("D4", packed, trucks, 480, 480), "tight");
  });
});
