import i24b2 from "../../../data/barcelona/weeks/bcn_24B_2.json" with { type: "json" };
import i24b10 from "../../../data/barcelona/weeks/bcn_24B_10.json" with { type: "json" };
import i24b25 from "../../../data/barcelona/weeks/bcn_24B_25.json" with { type: "json" };
import i24b50 from "../../../data/barcelona/weeks/bcn_24B_50.json" with { type: "json" };
import i36a2 from "../../../data/barcelona/weeks/bcn_36A_2.json" with { type: "json" };
import i36a10 from "../../../data/barcelona/weeks/bcn_36A_10.json" with { type: "json" };
import i36a25 from "../../../data/barcelona/weeks/bcn_36A_25.json" with { type: "json" };
import i36a50 from "../../../data/barcelona/weeks/bcn_36A_50.json" with { type: "json" };
import b24b2 from "../../../data/barcelona/weeks/bks-bcn_24B_2.json" with { type: "json" };
import b24b10 from "../../../data/barcelona/weeks/bks-bcn_24B_10.json" with { type: "json" };
import b24b25 from "../../../data/barcelona/weeks/bks-bcn_24B_25.json" with { type: "json" };
import b24b50 from "../../../data/barcelona/weeks/bks-bcn_24B_50.json" with { type: "json" };
import b36a2 from "../../../data/barcelona/weeks/bks-bcn_36A_2.json" with { type: "json" };
import b36a10 from "../../../data/barcelona/weeks/bks-bcn_36A_10.json" with { type: "json" };
import b36a25 from "../../../data/barcelona/weeks/bks-bcn_36A_25.json" with { type: "json" };
import b36a50 from "../../../data/barcelona/weeks/bks-bcn_36A_50.json" with { type: "json" };
import i24b47 from "../../../data/barcelona/weeks/bcn_24B_47.json" with { type: "json" };
import b24b47 from "../../../data/barcelona/weeks/bks-bcn_24B_47.json" with { type: "json" };
import { solve } from "./solver.ts";
import type { DelayEvent, Dock, SolveResult, Truck, Yard } from "./types.ts";

interface InstanceFile {
  n_berths: number;
  berth_len: number[];
  n_ships: number;
  n_periods: number;
  arrival_time: number[];
  handling_time: number[];
  ship_len: number[];
}

interface BksShip {
  data_ship_id: number;
  data_arrival_time: number;
  data_handling_time: number;
  data_ship_length: number;
  mooring_time: number;
  mooring_berth: number;
}

interface BksFile {
  ships: BksShip[];
}

export interface PublishedFact {
  id: string;
  ship: number;
  arrival: number;
  handling: number;
  len: number;
  moor: number;
  berth: number;
}

export interface PublishedWeekInfo {
  id: string;
  quay: string;
  week: number;
  file: string;
  bksFile: string;
  ships: number;
  berths: number;
  periods: number;
}

interface WeekSource {
  info: PublishedWeekInfo;
  inst: InstanceFile;
  bks: BksFile;
}

function isInstance(value: unknown): value is InstanceFile {
  if (!value || typeof value !== "object") return false;
  const row = value as InstanceFile;
  return (
    Array.isArray(row.arrival_time) &&
    Array.isArray(row.handling_time) &&
    Array.isArray(row.ship_len) &&
    Array.isArray(row.berth_len) &&
    row.n_ships === row.arrival_time.length
  );
}

function isBks(value: unknown): value is BksFile {
  if (!value || typeof value !== "object") return false;
  return Array.isArray((value as BksFile).ships);
}

function source(
  id: string,
  quay: string,
  week: number,
  file: string,
  bksFile: string,
  instRaw: unknown,
  bksRaw: unknown,
): WeekSource | null {
  if (!isInstance(instRaw) || !isBks(bksRaw)) return null;
  return {
    info: {
      id,
      quay,
      week,
      file,
      bksFile,
      ships: instRaw.n_ships,
      berths: instRaw.n_berths,
      periods: instRaw.n_periods,
    },
    inst: instRaw,
    bks: bksRaw,
  };
}

const WEEK_SOURCES = [
  source("bcn-24B-2", "24B", 2, "bcn_24B_2.json", "bks-bcn_24B_2.json", i24b2, b24b2),
  source("bcn-24B-10", "24B", 10, "bcn_24B_10.json", "bks-bcn_24B_10.json", i24b10, b24b10),
  source("bcn-24B-25", "24B", 25, "bcn_24B_25.json", "bks-bcn_24B_25.json", i24b25, b24b25),
  source("bcn-24B-50", "24B", 50, "bcn_24B_50.json", "bks-bcn_24B_50.json", i24b50, b24b50),
  source("bcn-36A-2", "36A", 2, "bcn_36A_2.json", "bks-bcn_36A_2.json", i36a2, b36a2),
  source("bcn-36A-10", "36A", 10, "bcn_36A_10.json", "bks-bcn_36A_10.json", i36a10, b36a10),
  source("bcn-36A-25", "36A", 25, "bcn_36A_25.json", "bks-bcn_36A_25.json", i36a25, b36a25),
  source("bcn-36A-50", "36A", 50, "bcn_36A_50.json", "bks-bcn_36A_50.json", i36a50, b36a50),
].filter((week): week is WeekSource => week !== null);

const DEFAULT_WEEK = "bcn-24B-2";

export const PUBLISHED_DOI = "10.5281/zenodo.17665596";
export const PUBLISHED_DOI_URL = "https://doi.org/10.5281/zenodo.17665596";
export const PUBLISHED_REPO = "https://github.com/alberto-santini/berth-allocation-problems";
export const PUBLISHED_INSTANCE = "bcn_24B_2.json";
export const PUBLISHED_BKS = "bks-bcn_24B_2.json";

export const PUBLISHED_CITE =
  "Quay 24B, week 2 of 2024. Port of Barcelona container calls, cut to one-hour periods by Alberto Santini (DOI 10.5281/zenodo.17665596). The blocks are that published berth plan.";

export function publishedWeekList(): PublishedWeekInfo[] {
  return WEEK_SOURCES.map((week) => week.info);
}

function weekById(weekId = DEFAULT_WEEK): WeekSource {
  const found = WEEK_SOURCES.find((week) => week.info.id === weekId) ?? WEEK_SOURCES[0];
  if (!found) throw new Error("Published Barcelona weeks did not load");
  return found;
}

function factsFor(week: WeekSource): PublishedFact[] {
  const { inst, bks } = week;
  const byId = new Map(bks.ships.map((ship) => [ship.data_ship_id, ship]));
  const out: PublishedFact[] = [];
  for (let id = 0; id < inst.n_ships; id++) {
    const ship = byId.get(id);
    const handling = inst.handling_time[id];
    const span = inst.ship_len[id];
    const arrival = inst.arrival_time[id];
    if (!ship || handling == null || span == null || arrival == null) continue;
    if (!Number.isInteger(handling) || handling < 1) continue;
    if (!Number.isInteger(span) || span < 1) continue;
    out.push({
      id: `S${id}`,
      ship: id,
      arrival,
      handling,
      len: span,
      moor: ship.mooring_time,
      berth: ship.mooring_berth,
    });
  }
  return out;
}

/** File columns only. No solver. Defaults to quay 24B week 2. */
export function publishedFacts(weekId = DEFAULT_WEEK): PublishedFact[] {
  return factsFor(weekById(weekId));
}

function berth(id: string): Dock {
  return { id, name: `Berth ${id.slice(1)}`, short: id, equipment: [], cargo: ["dry"] };
}

function call(row: PublishedFact, horizon: number, quay: string): Truck {
  return {
    id: row.id,
    plate: row.id,
    hauler: `Barcelona ${quay}`,
    durationMin: row.handling,
    cargo: "dry",
    requiredEquipment: [],
    priority: 2,
    deadlineMin: horizon,
    maxWaitMin: horizon,
    span: row.len,
    arrivalMin: row.arrival,
  };
}

function yardFromLoaded(week: WeekSource): Yard {
  const horizon = week.inst.n_periods;
  const rows = factsFor(week);
  return {
    id: week.info.id,
    name: `Barcelona quay ${week.info.quay}`,
    gate: `Week ${week.info.week} · 2024 · published plan`,
    shiftLabel: `${horizon} hours`,
    shiftStartMin: 0,
    shiftLenMin: horizon,
    timeUnit: "hour",
    docks: Array.from({ length: week.inst.n_berths }, (_, i) => berth(`B${i}`)),
    trucks: rows.map((row) => call(row, horizon, week.info.quay)),
    appointments: rows.map((row) => ({ truckId: row.id, dockId: `B${row.berth}`, startMin: row.moor })),
  };
}

export function publishedYard(weekId = DEFAULT_WEEK): Yard {
  return yardFromLoaded(weekById(weekId));
}

/** Quay 24B week 47, the published week where one late call loses its stretch. */
export function blockedExampleYard(): Yard {
  const loaded = source("bcn-24B-47", "24B", 47, "bcn_24B_47.json", "bks-bcn_24B_47.json", i24b47, b24b47);
  if (!loaded) throw new Error("Published week 47 did not load");
  return yardFromLoaded(loaded);
}

/** One published file pair. Returns null when the JSON is not this instance shape. Does not fall back to another week. */
export function tryPublishedYard(
  id: string,
  quay: string,
  week: number,
  file: string,
  bksFile: string,
  instRaw: unknown,
  bksRaw: unknown,
): { info: PublishedWeekInfo; yard: Yard } | null {
  const loaded = source(id, quay, week, file, bksFile, instRaw, bksRaw);
  if (!loaded) return null;
  return { info: loaded.info, yard: yardFromLoaded(loaded) };
}

export interface CallScore {
  id: string;
  ship: number;
  len: number;
  arrival: number;
  handling: number;
  moor: number;
  berth: string;
  status: string;
  wait: number | null;
  firstWait: number | null;
  /** Leftmost section of the first free opening. Null when that opening is the plan. */
  firstDock: string | null;
  saved: number | null;
  moved: number | null;
  dock: string | null;
  /** Unconstrained plan start. Hours, same clock as the file. */
  planStart: number | null;
  /** solve() forced onto the published berth, minus the unconstrained plan. */
  versusBooked: number | null;
  matchesBooked: boolean;
  holdStatus: string;
  holdDock: string | null;
  holdStart: number | null;
  holdWait: number | null;
  holdMoves: number | null;
  /** Mooring hour of the next published call on these sections. Null when none exists. */
  nextEta: number | null;
  nextSaved: number | null;
}

function sectionsOverlap(aLeft: number, aSpan: number, bLeft: number, bSpan: number): boolean {
  return aLeft < bLeft + bSpan && bLeft < aLeft + aSpan;
}

export interface StretchShip {
  id: string;
  dock: string;
  start: number;
  end: number;
  span: number;
}

/** Published ships already on this stretch during [from, until). The late ship is excluded. File times only. */
export function stretchShips(
  yard: Yard,
  truckId: string,
  dockId: string,
  span: number,
  from: number,
  until: number,
): StretchShip[] {
  const left = yard.docks.findIndex((d) => d.id === dockId);
  if (left < 0 || until <= from) return [];
  const out: StretchShip[] = [];
  for (const other of yard.appointments) {
    if (other.truckId === truckId) continue;
    const peer = yard.trucks.find((t) => t.id === other.truckId);
    if (!peer || peer.durationMin < 1) continue;
    const peerLeft = yard.docks.findIndex((d) => d.id === other.dockId);
    const peerSpan = peer.span ?? 1;
    if (peerLeft < 0 || !sectionsOverlap(left, span, peerLeft, peerSpan)) continue;
    const end = other.startMin + peer.durationMin;
    if (other.startMin >= until || end <= from) continue;
    out.push({ id: other.truckId, dock: other.dockId, start: other.startMin, end, span: peerSpan });
  }
  out.sort((a, b) => a.start - b.start || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return out;
}

/** True when no published ship uses this stretch during [from, until). */
export function stretchClear(
  yard: Yard,
  truckId: string,
  dockId: string,
  span: number,
  from: number,
  until: number,
): boolean {
  return stretchShips(yard, truckId, dockId, span, from, until).length === 0;
}

/** Later published call that next occupies this call's sections. File fact, no solver. */
export function nextOccupantHour(yard: Yard, truckId: string): number | null {
  const self = yard.appointments.find((a) => a.truckId === truckId);
  const truck = yard.trucks.find((t) => t.id === truckId);
  if (!self || !truck) return null;
  const left = yard.docks.findIndex((d) => d.id === self.dockId);
  if (left < 0) return null;
  const span = truck.span ?? 1;
  const end = self.startMin + truck.durationMin;
  let eta: number | null = null;
  for (const other of yard.appointments) {
    if (other.truckId === truckId) continue;
    const peer = yard.trucks.find((t) => t.id === other.truckId);
    if (!peer || peer.durationMin < 1) continue;
    const peerLeft = yard.docks.findIndex((d) => d.id === other.dockId);
    if (peerLeft < 0 || !sectionsOverlap(left, span, peerLeft, peer.span ?? 1)) continue;
    if (other.startMin < end) continue;
    if (eta === null || other.startMin < eta) eta = other.startMin;
  }
  return eta;
}

/** Published call whose work ends exactly when this opening starts, on an overlapping section. */
export function holdingCall(yard: Yard, dockId: string, atMin: number, span: number): string | null {
  const left = yard.docks.findIndex((d) => d.id === dockId);
  if (left < 0) return null;
  for (const other of yard.appointments) {
    const peer = yard.trucks.find((t) => t.id === other.truckId);
    if (!peer) continue;
    const peerLeft = yard.docks.findIndex((d) => d.id === other.dockId);
    if (peerLeft < 0 || !sectionsOverlap(left, span, peerLeft, peer.span ?? 1)) continue;
    if (other.startMin + peer.durationMin === atMin) return other.truckId;
  }
  return null;
}

function savedOf(result: ReturnType<typeof solve>): number | null {
  if (result.status !== "OPTIMAL") return null;
  return result.certificate?.whyNotGreedy ? result.certificate.whyNotGreedy.savedWaitMin : 0;
}

/** Plan versus staying on the published berth. The leftmost section is recorded and is not this delta. */
export interface BookedProbe {
  id: string;
  matches: boolean;
  saved: number | null;
  planStatus: string;
  planDock: string | null;
  planStart: number | null;
  planWait: number | null;
  planMoves: number | null;
  holdStatus: string;
  holdDock: string | null;
  holdStart: number | null;
  holdWait: number | null;
  holdMoves: number | null;
  leftmostDock: string | null;
  leftmostStart: number | null;
  leftmostSaved: number | null;
}

function berthNo(id: string | null): string {
  return id ? id.replace(/^B/, "") : "—";
}

/** What the open card says. Positive hours mean staying on the booked berth waits longer. */
export function bookedHeadline(row: BookedProbe): string {
  if (row.planStatus !== "OPTIMAL" || row.planDock == null || row.planStart == null || row.planWait == null) {
    return "The solver did not write a plan.";
  }
  if (row.matches && row.planWait === 0) {
    return `Booked berth is still free. The plan stays on berth ${berthNo(row.planDock)} at hour ${row.planStart}.`;
  }
  if (row.matches) {
    return `The plan stays on berth ${berthNo(row.planDock)} and waits ${row.planWait}h. No earlier berth is free, and nobody else moves.`;
  }
  if (row.holdStatus !== "OPTIMAL" || row.holdWait == null || row.holdDock == null) {
    return `The booked berth has no plan. The plan uses berth ${berthNo(row.planDock)} at hour ${row.planStart}.`;
  }
  if ((row.saved ?? 0) > 0) {
    return `Staying on berth ${berthNo(row.holdDock)} waits ${row.holdWait}h. The plan waits ${row.planWait}h on berth ${berthNo(row.planDock)}.`;
  }
  if ((row.saved ?? 0) < 0) {
    return `Staying on berth ${berthNo(row.holdDock)} waits ${row.holdWait}h, ${-(row.saved ?? 0)}h less than this plan.`;
  }
  return `Same wait as staying on berth ${berthNo(row.holdDock)}. The plan uses berth ${berthNo(row.planDock)} at hour ${row.planStart}.`;
}

export function bookedFromPlan(yard: Yard, event: DelayEvent, given?: SolveResult): BookedProbe {
  const appt = yard.appointments.find((a) => a.truckId === event.truckId);
  const reusable =
    given && !event.forceDockId && given.certificate?.chosen.truckId === event.truckId ? given : undefined;
  const plan = reusable ?? solve(yard, { ...event, forceDockId: undefined });
  const pick = plan.certificate?.chosen ?? null;
  const leftmost = plan.certificate?.whyNotGreedy;
  const probe: BookedProbe = {
    id: event.truckId,
    matches: false,
    saved: null,
    planStatus: plan.status,
    planDock: pick?.dockId ?? null,
    planStart: pick?.startMin ?? null,
    planWait: plan.status === "OPTIMAL" ? plan.metrics.eventWaitMin : null,
    planMoves: plan.status === "OPTIMAL" ? plan.metrics.displaced : null,
    holdStatus: plan.status,
    holdDock: null,
    holdStart: null,
    holdWait: null,
    holdMoves: null,
    leftmostDock: leftmost?.greedyDockId ?? null,
    leftmostStart: leftmost?.greedyStartMin ?? null,
    leftmostSaved: plan.status === "OPTIMAL" ? (leftmost ? leftmost.savedWaitMin : 0) : null,
  };
  if (!appt) return probe;
  if (plan.status === "OPTIMAL" && pick && pick.dockId === appt.dockId && plan.metrics.displaced === 0) {
    return {
      ...probe,
      matches: true,
      saved: 0,
      holdStatus: "OPTIMAL",
      holdDock: pick.dockId,
      holdStart: pick.startMin,
      holdWait: plan.metrics.eventWaitMin,
      holdMoves: 0,
    };
  }
  const held = solve(yard, { ...event, forceDockId: appt.dockId });
  const heldPick = held.certificate?.chosen ?? null;
  const saved =
    plan.status === "OPTIMAL" && held.status === "OPTIMAL"
      ? held.metrics.eventWaitMin - plan.metrics.eventWaitMin
      : null;
  const matches =
    saved === 0 &&
    held.status === "OPTIMAL" &&
    plan.status === "OPTIMAL" &&
    heldPick != null &&
    pick != null &&
    heldPick.dockId === pick.dockId &&
    heldPick.startMin === pick.startMin &&
    held.metrics.displaced === plan.metrics.displaced;
  return {
    ...probe,
    matches,
    saved,
    holdStatus: held.status,
    holdDock: heldPick?.dockId ?? null,
    holdStart: heldPick?.startMin ?? null,
    holdWait: held.status === "OPTIMAL" ? held.metrics.eventWaitMin : null,
    holdMoves: held.status === "OPTIMAL" ? held.metrics.displaced : null,
  };
}

/** One-hour-late probe against the published berth. Does not score the next-ship arrival. */
export function probeBooked(yard: Yard): BookedProbe[] {
  return yard.appointments.map((a) =>
    bookedFromPlan(yard, { truckId: a.truckId, newEtaMin: a.startMin + 1, source: "manual" }),
  );
}

/** One hour late, and the later-ship arrival, against the published mooring. Both numbers are solve(). */
export function scoreOneHourLate(yard: Yard): CallScore[] {
  return yard.appointments.map((a) => {
    const truck = yard.trucks.find((t) => t.id === a.truckId);
    const ship = Number(a.truckId.slice(1));
    const event = { truckId: a.truckId, newEtaMin: a.startMin + 1, source: "manual" as const };
    const result = solve(yard, event);
    const booked = bookedFromPlan(yard, event, result);
    const greedy = result.certificate?.whyNotGreedy;
    const chosen = result.appointments.find((x) => x.truckId === a.truckId);
    const saved = savedOf(result);
    const nextEta = nextOccupantHour(yard, a.truckId);
    const nextSaved =
      nextEta == null ? null : savedOf(solve(yard, { truckId: a.truckId, newEtaMin: nextEta, source: "manual" }));
    return {
      id: a.truckId,
      ship,
      len: truck?.span ?? 1,
      arrival: truck?.arrivalMin ?? a.startMin,
      handling: truck?.durationMin ?? 0,
      moor: a.startMin,
      berth: a.dockId,
      status: result.status,
      wait: result.status === "OPTIMAL" ? result.metrics.eventWaitMin : null,
      firstWait: result.status === "OPTIMAL" ? (greedy ? greedy.greedyWaitMin : result.metrics.eventWaitMin) : null,
      firstDock: result.status === "OPTIMAL" ? (greedy ? greedy.greedyDockId : chosen?.dockId ?? null) : null,
      saved,
      moved: result.status === "OPTIMAL" ? result.metrics.displaced : null,
      dock: chosen?.dockId ?? null,
      planStart: booked.planStart,
      versusBooked: booked.saved,
      matchesBooked: booked.matches,
      holdStatus: booked.holdStatus,
      holdDock: booked.holdDock,
      holdStart: booked.holdStart,
      holdWait: booked.holdWait,
      holdMoves: booked.holdMoves,
      nextEta,
      nextSaved,
    };
  });
}
