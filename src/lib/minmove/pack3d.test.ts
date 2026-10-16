import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aabbHit,
  epLive,
  pack3dWasm,
  packDepth,
  packExtremeFFD,
  packExtremeFFDJs,
  volume,
  type Pose3,
} from "./pack3d.ts";

describe("3d extreme-point FFD", () => {
  it("loads the wasm module", () => {
    const wasm = pack3dWasm();
    assert.ok(wasm);
    assert.equal(wasm.max_n(), 256);
  });

  it("packs eight unit cubes into a 2×2×2 bin", () => {
    const items = Array.from({ length: 8 }, (_, i) => ({ id: String(i), w: 1, h: 1, d: 1 }));
    const placed = packExtremeFFD(items, { W: 2, H: 2, D: 2 });
    assert.equal(placed.length, 8);
    assert.equal(new Set(placed.map((p) => p.bin)).size, 1);
    assert.ok(!anyHit(placed));
    assert.ok(placed.every((p) => p.x + p.w <= 2 && p.y + p.h <= 2 && p.z + p.d <= 2));
    assert.ok(epLive() <= 16);
  });

  it("opens a second bin when a 2×2×2 cube will not fit beside a unit cube in a 2-cube bin", () => {
    const placed = packExtremeFFD(
      [
        { id: "big", w: 2, h: 2, d: 2 },
        { id: "small", w: 1, h: 1, d: 1 },
      ],
      { W: 2, H: 2, D: 2 },
    );
    const bins = new Set(placed.map((p) => p.bin));
    assert.equal(bins.size, 2);
    assert.ok(!anyHit(placed));
  });

  it("rotation lets a 3×1×1 rod stand in a 1×1×3 shaft", () => {
    const placed = packExtremeFFD([{ id: "rod", w: 3, h: 1, d: 1 }], { W: 1, H: 1, D: 3 }, true);
    assert.equal(placed.length, 1);
    assert.equal(placed[0]!.bin, 0);
    assert.ok(placed[0]!.w * placed[0]!.h * placed[0]!.d === 3);
    assert.ok(placed[0]!.z + placed[0]!.d <= 3);
    assert.ok(placed[0]!.x + placed[0]!.w <= 1);
  });

  it("volume order places the largest box first", () => {
    const placed = packExtremeFFD(
      [
        { id: "a", w: 1, h: 1, d: 1 },
        { id: "b", w: 2, h: 2, d: 1 },
      ],
      { W: 3, H: 2, D: 1 },
    );
    const b = placed.find((p) => p.id === "b")!;
    assert.equal(b.x, 0);
    assert.equal(b.y, 0);
    assert.ok(volume(b) > 1);
    assert.ok(!anyHit(placed));
  });

  it("packDepth stacks overlapping x on the same y instead of colliding", () => {
    const z = packDepth(
      [
        { id: "j", x: 42, w: 10, y: 0 },
        { id: "c", x: 50, w: 16, y: 0 },
        { id: "l", x: 78, w: 8, y: 0 },
      ],
      2,
    );
    assert.notEqual(z.get("j"), z.get("c"));
    assert.equal(z.get("l"), 0);
  });

  it("keeps the extreme-point pool bounded for 64 unit cubes", () => {
    const items = Array.from({ length: 64 }, (_, i) => ({ id: String(i), w: 1, h: 1, d: 1 }));
    const placed = packExtremeFFD(items, { W: 4, H: 4, D: 4 });
    assert.equal(placed.length, 64);
    assert.equal(new Set(placed.map((p) => p.bin)).size, 1);
    assert.ok(!anyHit(placed));
    assert.ok(epLive() <= 1024);
    assert.ok(epLive() < 64 * 3, `ep pool leaked ${epLive()}`);
  });

  it("JS SoA fallback matches wasm on eight cubes", () => {
    const items = Array.from({ length: 8 }, (_, i) => ({ id: String(i), w: 1, h: 1, d: 1 }));
    const js = packExtremeFFDJs(items, { W: 2, H: 2, D: 2 });
    assert.equal(js.length, 8);
    assert.equal(new Set(js.map((p) => p.bin)).size, 1);
    assert.ok(!anyHit(js));
  });
});

function anyHit(placed: Pose3[]): boolean {
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) if (aabbHit(placed[i]!, placed[j]!)) return true;
  }
  return false;
}
