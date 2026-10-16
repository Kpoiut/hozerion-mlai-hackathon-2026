import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { intersectsPct, windowBlocks, windowMarks, windowRows, windowTime } from "./virtual.ts";

describe("timeline virtualization", () => {
  it("windows door rows with overscan padding", () => {
    const w = windowRows(80, 76, 760, 400, 76);
    assert.equal(w.start, 9);
    assert.equal(w.end, 17);
    assert.equal(w.padTop, 9 * 76);
    assert.equal(w.padBottom, (80 - 17) * 76);
  });

  it("keeps every row when the viewport covers the board", () => {
    const w = windowRows(6, 76, 0, 800, 160);
    assert.equal(w.start, 0);
    assert.equal(w.end, 6);
    assert.equal(w.padTop, 0);
    assert.equal(w.padBottom, 0);
  });

  it("maps scrollLeft to a percent time window", () => {
    const t = windowTime({ scrollLeft: 200, scrollTop: 0, width: 400, height: 400, contentWidth: 1000 }, 0);
    assert.equal(t.x0, 20);
    assert.equal(t.x1, 60);
  });

  it("drops cards outside the time window or hidden rows", () => {
    const blocks = [
      { id: "a", left: 0, width: 10, dockIndex: 0 },
      { id: "b", left: 50, width: 10, dockIndex: 0 },
      { id: "c", left: 50, width: 10, dockIndex: 9 },
    ];
    const vis = windowBlocks(blocks, { start: 0, end: 2, padTop: 0, padBottom: 0 }, { x0: 40, x1: 70 });
    assert.deepEqual(
      vis.map((b) => b.id),
      ["b"],
    );
  });

  it("treats a card on the window edge as visible", () => {
    assert.equal(intersectsPct(40, 10, 50, 80), false);
    assert.equal(intersectsPct(45, 10, 50, 80), true);
  });

  it("does not materialize 400 cards when 12 sit in view", () => {
    const blocks = Array.from({ length: 400 }, (_, i) => ({
      id: String(i),
      left: (i % 20) * 5,
      width: 4,
      dockIndex: Math.floor(i / 5),
    }));
    const vis = windowBlocks(blocks, { start: 0, end: 6, padTop: 0, padBottom: 6080 }, { x0: 0, x1: 100 });
    assert.ok(vis.length <= 30);
    assert.ok(vis.every((b) => b.dockIndex < 6));
  });

  it("windows hour marks to the visible time range, keeping edge labels", () => {
    const marks = [0, 60, 120, 180, 240];
    const toPct = (n: number) => (n / 240) * 100;
    assert.deepEqual(windowMarks(marks, toPct, 25, 75), [60, 120, 180]);
    assert.deepEqual(windowMarks(marks, toPct, 0, 100), marks);
    assert.deepEqual(windowMarks(marks, toPct, 10, 15), []);
  });
});
