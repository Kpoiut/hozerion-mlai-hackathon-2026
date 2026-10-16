import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createStore } from "jotai";
import { clockLabelMinAtom, clockMinAtom, hoverIdAtom, playingAtom } from "./atoms.ts";

describe("jotai view atoms", () => {
  it("clock ticks do not require a Zustand store", () => {
    const store = createStore();
    store.set(clockMinAtom, 207.4);
    assert.equal(store.get(clockLabelMinAtom), 207);
  });

  it("hover and playing are independent subscriptions", () => {
    const store = createStore();
    let hoverReads = 0;
    store.sub(hoverIdAtom, () => {
      hoverReads += 1;
    });
    store.set(playingAtom, true);
    store.set(clockMinAtom, 10);
    assert.equal(hoverReads, 0);
    store.set(hoverIdAtom, "C");
    assert.equal(hoverReads, 1);
    assert.equal(store.get(hoverIdAtom), "C");
  });
});
