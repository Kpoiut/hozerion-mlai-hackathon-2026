import { clockLabel } from "./seed.ts";
import type { EtcConflict, EtcReading, EtcRejection, EtcSourceId, EtcVerdict } from "./types.ts";

/** Fresh operational sample beats a model, a model beats a fallback range, the booked slot is the anchor. */
export const ETC_RANK: readonly EtcSourceId[] = ["manual", "parse", "osrm", "agent", "haversine", "booked"];

const DEFAULT_FRESH_MIN: Record<EtcSourceId, number> = {
  manual: 480,
  parse: 30,
  osrm: 8,
  agent: 15,
  haversine: 8,
  booked: 480,
};

/** Sources that disagree by more than this many minutes are a recorded conflict. The higher rank still wins. */
export const ETC_CONFLICT_MIN = 12;

const SOURCE_LABEL: Record<EtcSourceId, string> = {
  manual: "Dispatcher",
  parse: "Radio",
  osrm: "Road",
  agent: "Agent",
  haversine: "Range",
  booked: "Booked",
};

export interface ArbitrateInput {
  truckId: string;
  nowMin: number;
  readings: readonly EtcReading[];
  /** Sources this call tried to obtain. Absent ones are reported as missing. */
  watched?: readonly EtcSourceId[];
  conflictMin?: number;
}

export type ArbitrateResult = { ok: true; verdict: EtcVerdict } | { ok: false; reason: "NO_READING" };

function rankOf(source: EtcSourceId): number {
  const i = ETC_RANK.indexOf(source);
  return i < 0 ? ETC_RANK.length : i;
}

function roundMin(n: number): number {
  return Math.round(n);
}

/** Gate arrival from a travel time. Not bookedStart + travel. */
export function arrivalMin(nowMin: number, travelMin: number, shiftLenMin: number): number {
  if (!Number.isFinite(nowMin) || !Number.isFinite(travelMin) || !Number.isFinite(shiftLenMin) || shiftLenMin < 0) {
    return 0;
  }
  return Math.max(0, Math.min(shiftLenMin, roundMin(nowMin + travelMin)));
}

function label(source: EtcSourceId): string {
  return SOURCE_LABEL[source];
}

function reasonFor(verdict: Pick<EtcVerdict, "winner" | "degraded" | "conflicts" | "missing" | "eligible">): string {
  const conflict = verdict.conflicts[0];
  if (verdict.degraded && verdict.winner !== "booked") {
    return `all fresh samples expired; using newest ${label(verdict.winner)} sample`;
  }
  if (verdict.winner === "booked" && verdict.eligible.every((s) => s === "booked")) {
    return "no live sample; holding the booked slot";
  }
  if (conflict) {
    return `${label(verdict.winner)} holds; ${label(conflict.left)} and ${label(conflict.right)} differ by ${conflict.deltaMin}m`;
  }
  if (verdict.winner === "haversine" && verdict.missing.includes("osrm")) {
    return "road router missing; using range estimate";
  }
  return `${label(verdict.winner)} holds`;
}

export function formatEtcVerdict(
  verdict: EtcVerdict,
  shiftStartMin: number,
  timeUnit: "minute" | "hour" = "minute",
): string {
  const clock = timeUnit === "hour" ? `${Math.round(verdict.etaMin)}h` : clockLabel(shiftStartMin, verdict.etaMin);
  return `${label(verdict.winner)} ${clock} · ${verdict.reason}`;
}

/**
 * Pick one gate minute. Array order is not a vote.
 * Booked is the plan anchor and is excluded from conflict pairs.
 */
export function arbitrateEtc(input: ArbitrateInput): ArbitrateResult {
  const nowMin = roundMin(input.nowMin);
  const conflictMin = input.conflictMin ?? ETC_CONFLICT_MIN;
  const indexed = input.readings.map((reading, index) => ({ reading, index }));
  indexed.sort((a, b) => {
    const rank = rankOf(a.reading.source) - rankOf(b.reading.source);
    if (rank !== 0) return rank;
    const observed = roundMin(b.reading.observedAtMin) - roundMin(a.reading.observedAtMin);
    if (observed !== 0) return observed;
    const eta = roundMin(a.reading.etaMin) - roundMin(b.reading.etaMin);
    if (eta !== 0) return eta;
    return a.index - b.index;
  });

  const rejected: EtcRejection[] = [];
  const eligible = new Map<EtcSourceId, EtcReading>();
  const stalePool: EtcReading[] = [];
  const seen = new Set<EtcSourceId>();

  for (const { reading } of indexed) {
    seen.add(reading.source);
    if (reading.truckId !== input.truckId) {
      rejected.push({ source: reading.source, why: "other-truck" });
      continue;
    }
    if (!Number.isFinite(reading.etaMin)) {
      rejected.push({ source: reading.source, why: "nan" });
      continue;
    }
    const observedAtMin = roundMin(reading.observedAtMin);
    if (observedAtMin > nowMin + 1) {
      rejected.push({ source: reading.source, why: "future" });
      continue;
    }
    const freshForMin = reading.freshForMin ?? DEFAULT_FRESH_MIN[reading.source];
    const age = nowMin - observedAtMin;
    if (age > Math.max(0, freshForMin)) {
      if (!eligible.has(reading.source)) {
        rejected.push({ source: reading.source, why: "stale" });
        stalePool.push({ ...reading, etaMin: roundMin(reading.etaMin), observedAtMin });
      }
      continue;
    }
    if (!eligible.has(reading.source)) {
      eligible.set(reading.source, { ...reading, etaMin: roundMin(reading.etaMin), observedAtMin });
    }
  }

  const watched = input.watched ?? [];
  const missing = watched.filter((source) => !seen.has(source));
  const stale = uniqueSources(rejected.filter((r) => r.why === "stale").map((r) => r.source));

  let winnerReading: EtcReading | undefined;
  let degraded = false;
  const liveEligible = [...eligible.values()].filter((r) => r.source !== "booked");
  if (liveEligible.length > 0) {
    winnerReading = liveEligible[0];
  } else if (eligible.has("booked")) {
    winnerReading = eligible.get("booked");
    degraded = true;
  } else if (stalePool.length > 0) {
    stalePool.sort((a, b) => {
      const observed = b.observedAtMin - a.observedAtMin;
      if (observed !== 0) return observed;
      return rankOf(a.source) - rankOf(b.source);
    });
    winnerReading = stalePool[0];
    degraded = true;
  }

  if (!winnerReading) return { ok: false, reason: "NO_READING" };

  const sensorEligible = [...eligible.values()]
    .filter((r) => r.source !== "booked")
    .sort((a, b) => rankOf(a.source) - rankOf(b.source));
  const conflicts: EtcConflict[] = [];
  for (let i = 0; i < sensorEligible.length; i++) {
    for (let j = i + 1; j < sensorEligible.length; j++) {
      const left = sensorEligible[i]!;
      const right = sensorEligible[j]!;
      const deltaMin = Math.abs(left.etaMin - right.etaMin);
      if (deltaMin > conflictMin) {
        conflicts.push({ left: left.source, right: right.source, deltaMin });
      }
    }
  }

  const eligibleIds = [...eligible.keys()].sort((a, b) => rankOf(a) - rankOf(b));
  const partial = {
    winner: winnerReading.source,
    degraded,
    conflicts,
    missing,
    eligible: eligibleIds,
  };
  const verdict: EtcVerdict = {
    truckId: input.truckId,
    nowMin,
    etaMin: winnerReading.etaMin,
    winner: winnerReading.source,
    reason: reasonFor(partial),
    degraded,
    stale,
    missing,
    rejected,
    conflicts,
    eligible: eligibleIds,
  };
  return { ok: true, verdict };
}

function uniqueSources(sources: EtcSourceId[]): EtcSourceId[] {
  const out: EtcSourceId[] = [];
  for (const source of sources) {
    if (!out.includes(source)) out.push(source);
  }
  return out.sort((a, b) => rankOf(a) - rankOf(b));
}
