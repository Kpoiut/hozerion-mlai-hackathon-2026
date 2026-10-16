import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildTimeScale, layoutDockBlocks, packCards, viewWindow, type DockBlock } from "./layout.ts";
import { createYard } from "./seed.ts";
import { solve } from "./solver.ts";

describe("density time scale", () => {
  it("keeps the morning board on 08:00–16:00 when the shift is sparse", () => {
    const yard = createYard();
    const blocks = yard.appointments.map((a) => {
      const t = yard.trucks.find((x) => x.id === a.truckId)!;
      return { startMin: a.startMin, endMin: a.startMin + t.durationMin, dockId: a.dockId };
    });
    const view = viewWindow(blocks, [0], yard.shiftLenMin);
    assert.equal(view.dense, false);
    assert.equal(view.start, 0);
    assert.equal(view.end, 480);
  });

  it("zooms when one door is packed tighter than the label gap", () => {
    const packed = Array.from({ length: 10 }, (_, i) => ({
      startMin: 180 + i * 12,
      endMin: 180 + i * 12 + 10,
      dockId: "D1",
    }));
    const view = viewWindow(packed, [200], 480);
    assert.equal(view.dense, true);
    assert.ok(view.end - view.start < 480);
    assert.ok(view.start <= 180);
    assert.ok(view.end >= 180 + 9 * 12);
    const scale = buildTimeScale(packed, [200], 480);
    const a = scale.toPct(180);
    const b = scale.toPct(180 + 12);
    assert.ok(b - a > 2);
    assert.ok(scale.toPct(0) === 0 || scale.start > 0);
  });

  it("still places C on Door 6 after a plan when the scale is applied", () => {
    const yard = createYard();
    const origC = yard.appointments.find((a) => a.truckId === "C")!;
    const result = solve(yard, { truckId: "C", newEtaMin: origC.startMin + 47, source: "manual" });
    const blocks = result.appointments.map((a) => {
      const t = yard.trucks.find((x) => x.id === a.truckId)!;
      return { startMin: a.startMin, endMin: a.startMin + t.durationMin, dockId: a.dockId };
    });
    const scale = buildTimeScale(blocks, [207, 240], yard.shiftLenMin);
    const laid = layoutDockBlocks(yard, result.appointments, "C", scale);
    const c = laid.find((b) => b.truckId === "C")!;
    assert.equal(c.dockId, "D6");
    assert.ok(c.width > 4);
    assert.ok(c.left >= 0 && c.left < 100);
  });

  it("sparse gaps stretch: empty minutes get more width than packed minutes of the same length", () => {
    const blocks = [
      { startMin: 0, endMin: 60, dockId: "D1" },
      { startMin: 60, endMin: 120, dockId: "D1" },
      { startMin: 400, endMin: 430, dockId: "D2" },
    ];
    const scale = buildTimeScale(blocks, [0], 480);
    const packedHour = scale.toPct(60) - scale.toPct(0);
    const emptyHour = scale.toPct(300) - scale.toPct(240);
    assert.ok(emptyHour > packedHour);
  });

  it("toPct is monotonic and hits 0/100 at the view ends", () => {
    const yard = createYard();
    const blocks = yard.appointments.map((a) => {
      const t = yard.trucks.find((x) => x.id === a.truckId)!;
      return { startMin: a.startMin, endMin: a.startMin + t.durationMin, dockId: a.dockId };
    });
    const scale = buildTimeScale(blocks, [0], 480);
    let prev = -1;
    for (let m = 0; m <= 480; m += 7) {
      const p = scale.toPct(m);
      assert.ok(p >= prev - 1e-9, `${m} went backwards`);
      prev = p;
    }
    assert.equal(scale.toPct(0), 0);
    assert.equal(scale.toPct(480), 100);
  });

  it("packCards never lets same-stack cards overlap", () => {
    const raw: DockBlock[] = [
      { truckId: "J", dockId: "D6", startMin: 200, endMin: 240, left: 42, width: 6, isEvent: false, changed: false, stack: 0 },
      { truckId: "C", dockId: "D6", startMin: 240, endMin: 330, left: 50, width: 10, isEvent: true, changed: true, stack: 0 },
      { truckId: "L", dockId: "D6", startMin: 360, endMin: 410, left: 72, width: 6, isEvent: false, changed: false, stack: 0 },
    ];
    const packed = packCards(raw);
    for (const stack of [0, 1]) {
      const layer = packed.filter((b) => b.stack === stack).sort((a, b) => a.left - b.left);
      for (let i = 0; i < layer.length - 1; i++) {
        assert.ok(layer[i]!.left + layer[i]!.width <= layer[i + 1]!.left + 1e-6);
      }
    }
    const c = packed.find((b) => b.truckId === "C")!;
    assert.ok(c.width >= 8);
  });

  it("caps non-featured chips so long slots do not become full bars", () => {
    const packed = packCards([
      { truckId: "A", dockId: "D1", startMin: 0, endMin: 180, left: 0, width: 37.5, isEvent: false, changed: false, stack: 0 },
      { truckId: "B", dockId: "D1", startMin: 300, endMin: 360, left: 62, width: 12, isEvent: false, changed: false, stack: 0 },
    ]);
    const a = packed.find((b) => b.truckId === "A")!;
    assert.ok(a.width <= 14.05, `A too wide ${a.width}`);
    assert.ok(a.width >= 8);
  });

  it("frames an hour horizon around the plan and the first hole, one hour per hour", () => {
    const blocks = [
      { startMin: 78, endMin: 115, dockId: "B16" },
      { startMin: 149, endMin: 163, dockId: "B0" },
    ];
    const view = viewWindow(blocks, [79, 116, 163, 200], 336, "hour");
    assert.ok(view.start <= 79);
    assert.ok(view.end >= 200);
    assert.ok(view.end - view.start < 336);
    const scale = buildTimeScale(blocks, [79, 116, 163, 200], 336, "hour");
    const at79 = scale.toPct(79);
    const at163 = scale.toPct(163);
    assert.ok(at79 > 0 && at79 < 100);
    assert.ok(at163 > at79 && at163 < 100);
    const stepA = scale.toPct(100) - scale.toPct(90);
    const stepB = scale.toPct(150) - scale.toPct(140);
    assert.ok(Math.abs(stepA - stepB) < 0.05, `hour steps ${stepA} vs ${stepB}`);
    assert.ok(scale.marks.length >= 5);
    const gaps = scale.marks.slice(1).map((m, i) => m - scale.marks[i]!);
    assert.ok(gaps.some((g) => g === 12 || g === 24));
  });

  it("keeps a faithful hour bar at its true duration width", () => {
    const packed = packCards(
      [
        { truckId: "S1", dockId: "B0", startMin: 149, endMin: 163, left: 40, width: 12, isEvent: false, changed: false, stack: 0 },
        { truckId: "S11", dockId: "B0", startMin: 163, endMin: 200, left: 52, width: 20, isEvent: true, changed: true, stack: 0 },
      ],
      true,
    );
    assert.equal(packed.find((b) => b.truckId === "S1")?.width, 12);
    assert.equal(packed.find((b) => b.truckId === "S11")?.width, 20);
  });

  it("gives the featured card the gap before shrinking it", () => {
    const packed = packCards([
      { truckId: "J", dockId: "D6", startMin: 200, endMin: 240, left: 42, width: 6, isEvent: false, changed: false, stack: 0 },
      { truckId: "C", dockId: "D6", startMin: 240, endMin: 330, left: 50, width: 10, isEvent: true, changed: true, stack: 0 },
      { truckId: "L", dockId: "D6", startMin: 360, endMin: 410, left: 78, width: 6, isEvent: false, changed: false, stack: 0 },
    ]);
    const c = packed.find((b) => b.truckId === "C")!;
    const j = packed.find((b) => b.truckId === "J")!;
    assert.ok(c.width > j.width);
    assert.ok(c.width >= 15);
  });

  it("C+47 on Door 6 does not collide on the same stack", () => {
    const yard = createYard();
    const origC = yard.appointments.find((a) => a.truckId === "C")!;
    const result = solve(yard, { truckId: "C", newEtaMin: origC.startMin + 47, source: "manual" });
    const blocks = result.appointments.map((a) => {
      const t = yard.trucks.find((x) => x.id === a.truckId)!;
      return { startMin: a.startMin, endMin: a.startMin + t.durationMin, dockId: a.dockId };
    });
    const scale = buildTimeScale(blocks, [207, 240], yard.shiftLenMin);
    const laid = layoutDockBlocks(yard, result.appointments, "C", scale).filter((b) => b.dockId === "D6");
    for (const stack of [0, 1]) {
      const layer = laid.filter((b) => b.stack === stack).sort((a, b) => a.left - b.left);
      for (let i = 0; i < layer.length - 1; i++) {
        assert.ok(layer[i]!.left + layer[i]!.width <= layer[i + 1]!.left + 0.05, `${layer[i]!.truckId} overlaps ${layer[i + 1]!.truckId}`);
      }
    }
  });
});

