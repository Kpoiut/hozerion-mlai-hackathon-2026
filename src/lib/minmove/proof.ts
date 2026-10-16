import type { SolveResult } from "./types.ts";

/** The one number a judge can repeat: this plan versus the first free door. */
export interface PlanProof {
  waitMin: number;
  dock: string;
  habitWaitMin: number;
  habitDock: string;
  savedMin: number;
  moved: number;
  headline: string;
}

export function planProof(result: SolveResult, unit: "minute" | "hour" = "minute"): PlanProof | null {
  const greedy = result.certificate?.whyNotGreedy;
  const chosen = result.certificate?.chosen;
  if (result.status !== "OPTIMAL" || !chosen) return null;
  const place = unit === "hour" ? "berth" : "door";
  const word = unit === "hour" ? "h" : "min";
  const dock = chosen.dockId.replace(/^D/, "");
  if (!greedy) {
    if (result.metrics.displaced !== 0) return null;
    return {
      waitMin: result.metrics.eventWaitMin,
      dock,
      habitWaitMin: result.metrics.eventWaitMin,
      habitDock: dock,
      savedMin: 0,
      moved: 0,
      headline: `Same wait as the first free ${place}`,
    };
  }
  const savedMin = greedy.savedWaitMin;
  const headline =
    savedMin > 0
      ? `Saves ${savedMin} ${word} versus the first free ${place}`
      : savedMin === 0
        ? `Same wait as the first free ${place}`
        : `First free ${place} is ${-savedMin} ${word} shorter`;
  return {
    waitMin: result.metrics.eventWaitMin,
    dock,
    habitWaitMin: greedy.greedyWaitMin,
    habitDock: greedy.greedyDockId.replace(/^D/, ""),
    savedMin,
    moved: result.metrics.displaced,
    headline,
  };
}
