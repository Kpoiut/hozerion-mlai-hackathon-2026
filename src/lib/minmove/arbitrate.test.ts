import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { arrivalMin, arbitrateEtc, formatEtcVerdict } from "./arbitrate.ts";
import type { EtcReading, EtcSourceId } from "./types.ts";

function reading(partial: EtcReading): EtcReading {
  return partial;
}

describe("ETC arbiter", () => {
  it("lets the dispatcher beat radio, road, and the agent", () => {
    const result = arbitrateEtc({
      truckId: "C",
      nowMin: 40,
      readings: [
        reading({ source: "osrm", truckId: "C", etaMin: 180, observedAtMin: 40 }),
        reading({ source: "agent", truckId: "C", etaMin: 190, observedAtMin: 40 }),
        reading({ source: "parse", truckId: "C", etaMin: 207, observedAtMin: 40 }),
        reading({ source: "manual", truckId: "C", etaMin: 200, observedAtMin: 40 }),
      ],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.verdict.winner, "manual");
    assert.equal(result.verdict.etaMin, 200);
    assert.equal(result.verdict.degraded, false);
  });

  it("lets a fresh radio clock beat the road and the agent", () => {
    const result = arbitrateEtc({
      truckId: "C",
      nowMin: 40,
      readings: [
        reading({ source: "agent", truckId: "C", etaMin: 230, observedAtMin: 40 }),
        reading({ source: "osrm", truckId: "C", etaMin: 190, observedAtMin: 40 }),
        reading({ source: "parse", truckId: "C", etaMin: 207, observedAtMin: 40 }),
      ],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.verdict.winner, "parse");
    assert.equal(result.verdict.etaMin, 207);
    assert.equal(result.verdict.conflicts.length, 3);
  });

  it("does not treat array order as a vote", () => {
    const readings: EtcReading[] = [
      { source: "haversine", truckId: "C", etaMin: 150, observedAtMin: 10 },
      { source: "osrm", truckId: "C", etaMin: 170, observedAtMin: 10 },
      { source: "parse", truckId: "C", etaMin: 207, observedAtMin: 10 },
    ];
    const forward = arbitrateEtc({ truckId: "C", nowMin: 12, readings });
    const backward = arbitrateEtc({ truckId: "C", nowMin: 12, readings: [...readings].reverse() });
    assert.equal(forward.ok && backward.ok, true);
    if (!forward.ok || !backward.ok) return;
    assert.deepEqual(
      { winner: forward.verdict.winner, eta: forward.verdict.etaMin, conflicts: forward.verdict.conflicts },
      { winner: backward.verdict.winner, eta: backward.verdict.etaMin, conflicts: backward.verdict.conflicts },
    );
    assert.equal(forward.verdict.winner, "parse");
  });

  it("drops a stale road sample and records it", () => {
    const result = arbitrateEtc({
      truckId: "C",
      nowMin: 40,
      readings: [
        reading({ source: "osrm", truckId: "C", etaMin: 300, observedAtMin: 0, freshForMin: 8 }),
        reading({ source: "parse", truckId: "C", etaMin: 207, observedAtMin: 35, freshForMin: 30 }),
      ],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.verdict.winner, "parse");
    assert.deepEqual(result.verdict.stale, ["osrm"]);
    assert.equal(result.verdict.conflicts.length, 0);
  });

  it("keeps the higher rank when two fresh sources conflict", () => {
    const result = arbitrateEtc({
      truckId: "C",
      nowMin: 20,
      conflictMin: 12,
      readings: [
        reading({ source: "parse", truckId: "C", etaMin: 207, observedAtMin: 20 }),
        reading({ source: "osrm", truckId: "C", etaMin: 190, observedAtMin: 20 }),
      ],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.verdict.winner, "parse");
    assert.deepEqual(result.verdict.conflicts, [{ left: "parse", right: "osrm", deltaMin: 17 }]);
    assert.match(result.verdict.reason, /differ by 17m/);
  });

  it("does not call a 12 minute gap a conflict", () => {
    const result = arbitrateEtc({
      truckId: "C",
      nowMin: 20,
      readings: [
        reading({ source: "parse", truckId: "C", etaMin: 200, observedAtMin: 20 }),
        reading({ source: "osrm", truckId: "C", etaMin: 188, observedAtMin: 20 }),
      ],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.verdict.conflicts.length, 0);
  });

  it("lists a watched source that never arrived", () => {
    const result = arbitrateEtc({
      truckId: "C",
      nowMin: 10,
      watched: ["parse", "osrm", "haversine", "booked"],
      readings: [reading({ source: "haversine", truckId: "C", etaMin: 80, observedAtMin: 10 })],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.verdict.winner, "haversine");
    assert.deepEqual(result.verdict.missing, ["parse", "osrm", "booked"]);
    assert.match(result.verdict.reason, /road router missing/);
  });

  it("ignores another truck and a future sample", () => {
    const result = arbitrateEtc({
      truckId: "C",
      nowMin: 30,
      readings: [
        reading({ source: "parse", truckId: "F", etaMin: 10, observedAtMin: 30 }),
        reading({ source: "osrm", truckId: "C", etaMin: 400, observedAtMin: 90 }),
        reading({ source: "agent", truckId: "C", etaMin: 140, observedAtMin: 30 }),
      ],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.verdict.winner, "agent");
    assert.equal(result.verdict.etaMin, 140);
    const why = result.verdict.rejected.map((r) => r.why);
    assert.ok(why.includes("other-truck"));
    assert.ok(why.includes("future"));
  });

  it("holds the booked slot when every live sample is absent", () => {
    const result = arbitrateEtc({
      truckId: "C",
      nowMin: 15,
      watched: ["parse", "osrm"],
      readings: [reading({ source: "booked", truckId: "C", etaMin: 160, observedAtMin: 0 })],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.verdict.winner, "booked");
    assert.equal(result.verdict.etaMin, 160);
    assert.equal(result.verdict.degraded, true);
    assert.deepEqual(result.verdict.missing, ["parse", "osrm"]);
    assert.equal(result.verdict.conflicts.length, 0);
  });

  it("uses the newest stale sample when nothing is fresh", () => {
    const result = arbitrateEtc({
      truckId: "C",
      nowMin: 100,
      readings: [
        reading({ source: "parse", truckId: "C", etaMin: 207, observedAtMin: 10, freshForMin: 30 }),
        reading({ source: "osrm", truckId: "C", etaMin: 180, observedAtMin: 40, freshForMin: 8 }),
      ],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.verdict.degraded, true);
    assert.equal(result.verdict.winner, "osrm");
    assert.equal(result.verdict.etaMin, 180);
  });

  it("rejects an empty call", () => {
    const result = arbitrateEtc({ truckId: "C", nowMin: 0, readings: [] });
    assert.deepEqual(result, { ok: false, reason: "NO_READING" });
  });

  it("rejects a non-finite minute", () => {
    const result = arbitrateEtc({
      truckId: "C",
      nowMin: 5,
      readings: [
        reading({ source: "parse", truckId: "C", etaMin: Number.NaN, observedAtMin: 5 }),
        reading({ source: "booked", truckId: "C", etaMin: 160, observedAtMin: 0 }),
      ],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.verdict.winner, "booked");
    assert.ok(result.verdict.rejected.some((r) => r.why === "nan"));
  });

  it("prefers the newer sample of the same source", () => {
    const result = arbitrateEtc({
      truckId: "C",
      nowMin: 20,
      readings: [
        reading({ source: "osrm", truckId: "C", etaMin: 100, observedAtMin: 5 }),
        reading({ source: "osrm", truckId: "C", etaMin: 130, observedAtMin: 18 }),
      ],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.verdict.etaMin, 130);
  });

  it("formats a clock the board can show", () => {
    const result = arbitrateEtc({
      truckId: "C",
      nowMin: 40,
      readings: [reading({ source: "parse", truckId: "C", etaMin: 207, observedAtMin: 40 })],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(formatEtcVerdict(result.verdict, 8 * 60), "Radio 11:27 · Radio holds");
  });

  it("turns travel time into an arrival, not a second delay stacked on the booking", () => {
    assert.equal(arrivalMin(40, 15, 480), 55);
    assert.equal(arrivalMin(40, 15, 50), 50);
    assert.equal(arrivalMin(Number.NaN, 15, 480), 0);
  });

  it("is stable across the watched source list", () => {
    const readings: EtcReading[] = [
      { source: "manual", truckId: "C", etaMin: 210, observedAtMin: 0 },
      { source: "booked", truckId: "C", etaMin: 160, observedAtMin: 0 },
    ];
    const watched: EtcSourceId[] = ["manual", "booked", "osrm"];
    const a = arbitrateEtc({ truckId: "C", nowMin: 0, readings, watched });
    const b = arbitrateEtc({ truckId: "C", nowMin: 0, readings: [...readings].reverse(), watched: [...watched].reverse() });
    assert.equal(a.ok && b.ok, true);
    if (!a.ok || !b.ok) return;
    assert.equal(a.verdict.winner, b.verdict.winner);
    assert.equal(a.verdict.etaMin, b.verdict.etaMin);
    assert.deepEqual(a.verdict.missing, ["osrm"]);
    assert.deepEqual(b.verdict.missing, ["osrm"]);
  });
});
