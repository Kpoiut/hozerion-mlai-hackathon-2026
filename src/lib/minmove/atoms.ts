/**
 * Jotai vs Zustand — both are in this app on purpose.
 *
 * Zustand (`store.ts`) owns the domain: yard, solver result, commit.
 * One store, imperative actions (`findPlan`, `commit`). A 3ms solve is a
 * transaction; selectors like `selectLive` derive the published board.
 *
 * Jotai owns the 60fps view: clock, hover, scroll viewport.
 * Each atom notifies only its subscribers. A clock tick must not rebuild
 * appointment cards. That is the gap Zustand selectors still pay when the
 * parent that calls `useBoardStore(s => s.clockMin)` re-renders a tree.
 *
 * Rule: if a value changes every animation frame, it is a Jotai atom.
 * If a value changes when the user commits a decision, it is Zustand.
 */
import { atom } from "jotai";
import type { Viewport } from "./virtual.ts";

export const clockMinAtom = atom(0);
export const playingAtom = atom(false);
export const hoverIdAtom = atom<string | null>(null);

export const viewportAtom = atom<Viewport>({
  scrollLeft: 0,
  scrollTop: 0,
  width: 1600,
  height: 800,
  contentWidth: 832,
});

export const clockLabelMinAtom = atom((get) => Math.round(get(clockMinAtom)));
