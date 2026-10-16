/** Linear-style single store: domain slice + chrome slice, views select. */

import { getDefaultStore } from "jotai";
import { create } from "zustand";
import { arrivalMin, arbitrateEtc, formatEtcVerdict } from "./arbitrate.ts";
import { addSpan, berthSpan, fitsSpan, type Busy } from "./calendar.ts";
import { clockMinAtom, playingAtom } from "./atoms.ts";
import { runCommit, runInterpret, runLiveEta, runParse, runSolve } from "./engine.ts";
import { blockedExampleYard, publishedYard } from "./published-week.ts";
import { BASE_DELAY_MIN, EVENT_TRUCK_ID, createYard } from "./seed.ts";
import type { Appointment, ConstraintId, DelayEvent, EtcReading, EtcSourceId, EtcVerdict, SolveResult, Yard } from "./types.ts";
import { defaultNowMin } from "./windows.ts";

export type Tab = "board" | "roster" | "flow" | "mlai" | "sidecar" | "bacap" | "federation" | "docs" | "microtos";
export type GanttFilter = "all" | "late" | "moved" | "reefer" | "dry" | "priority";
export type FacilityPresetId = "icd-minute" | "bcn-hour" | "reefer-cold" | "crossdock-fmcg" | "barge-hub";

export interface CustomJobInput {
  plate: string;
  hauler: string;
  dockId: string;
  startMin: number;
  delayMin: number;
  durationMin: number;
  cargo: "dry" | "reefer";
  priority: 1 | 2 | 3;
  span?: number;
}

export interface BoardState {
  yard: Yard;
  selectedId: string;
  delayMin: number;
  forceReefer: boolean;
  forceDock: string;
  message: string;
  useAgent: boolean;
  busy: boolean;
  agentNote: string | null;
  result: SolveResult | null;
  event: DelayEvent | null;
  clockMin: number;
  playing: boolean;
  tab: Tab;
  dark: boolean;
  collapsed: boolean;
  holdOn: boolean;
  previous: Yard | null;
  liveEta: string | null;
  etc: EtcVerdict | null;
  setupOpen: boolean;
  ganttFilter: GanttFilter;
  slaRateUsd: number;
  maxMovesAllowed: 0 | 1 | 2;
  freezeWindowMin: number;
  hostAdapter: string;

  setSelectedId: (id: string) => void;
  setDelayMin: (n: number) => void;
  setMessage: (s: string) => void;
  setTab: (t: Tab) => void;
  setForceDock: (id: string) => void;
  toggleForceDock: (id: string) => void;
  toggleForceReefer: () => void;
  toggleAgent: () => void;
  toggleCollapsed: () => void;
  setPlaying: (v: boolean) => void;
  setClockMin: (n: number) => void;
  advanceClock: (dt: number) => void;
  toggleTheme: () => void;
  hydrateTheme: () => void;
  applyEvent: (event: DelayEvent, note?: string | null) => SolveResult;
  findPlan: () => void;
  readNote: () => Promise<void>;
  applyRelax: (drop: ConstraintId) => void;
  commit: () => void;
  undo: () => void;
  hold: () => void;
  nudge: (delta?: number) => void;
  reset: () => void;
  openDemo: () => void;
  openPublished: () => void;
  openWeek: (weekId: string) => void;
  openBuiltYard: (yard: Yard, focusId?: string) => void;
  liveRoute: () => Promise<void>;
  setSetupOpen: (v: boolean) => void;
  setGanttFilter: (f: GanttFilter) => void;
  setSlaRateUsd: (n: number) => void;
  setMaxMovesAllowed: (k: 0 | 1 | 2) => void;
  setFreezeWindowMin: (n: number) => void;
  setHostAdapter: (a: string) => void;
  applyFacilityPreset: (preset: FacilityPresetId) => void;
  updateYardMeta: (name: string, gate: string) => void;
  toggleDockOpen: (dockId: string) => void;
  toggleDockReefer: (dockId: string) => void;
  addCustomDock: () => void;
  removeLastDock: () => void;
  setTruckPriority: (truckId: string, priority: 1 | 2 | 3) => void;
  setTruckDuration: (truckId: string, delta: number) => void;
  injectCustomJob: (job: CustomJobInput) => void;
}

function blankChrome() {
  return {
    forceReefer: false,
    forceDock: "",
    useAgent: false,
    busy: false,
    agentNote: null as string | null,
    result: null as SolveResult | null,
    event: null as DelayEvent | null,
    clockMin: 0,
    playing: false,
    tab: "board" as Tab,
    dark: false,
    collapsed: false,
    holdOn: false,
    previous: null as Yard | null,
    liveEta: null as string | null,
    etc: null as EtcVerdict | null,
    setupOpen: false,
    ganttFilter: "all" as GanttFilter,
    slaRateUsd: 1500,
    maxMovesAllowed: 0 as 0 | 1 | 2,
    freezeWindowMin: 30,
    hostAdapter: "Navis N4 / RBS TOPOVN",
  };
}

function demoState() {
  return {
    ...blankChrome(),
    yard: createYard(),
    selectedId: EVENT_TRUCK_ID,
    delayMin: BASE_DELAY_MIN,
    message: "Truck C late 47 min",
    slaRateUsd: 18,
    hostAdapter: "SGP-TOS / Smart ICD YMS",
  };
}

function publishedState() {
  return {
    ...blankChrome(),
    yard: blockedExampleYard(),
    selectedId: "S8",
    delayMin: 1,
    message: "S8 arrives 1 hour after its published mooring",
    slaRateUsd: 1500,
    hostAdapter: "Navis N4 / RBS TOPOVN",
  };
}

function cloneYard(yard: Yard): Yard {
  return {
    ...yard,
    docks: yard.docks.map((d) => ({ ...d, equipment: [...d.equipment], cargo: [...d.cargo], unknownEquipment: d.unknownEquipment ? [...d.unknownEquipment] : undefined, unknownCargo: d.unknownCargo ? [...d.unknownCargo] : undefined })),
    trucks: yard.trucks.map((t) => ({ ...t, requiredEquipment: [...t.requiredEquipment] })),
    appointments: yard.appointments.map((a) => ({ ...a })),
  };
}

function delayBounds(unit: Yard["timeUnit"]) {
  return unit === "hour" ? { lo: -6, hi: 12 } : { lo: -90, hi: 90 };
}

const CLOCK_SYNC_MS = 250;
let lastClockSync = 0;

function nowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function syncClock(n: number, playing?: boolean) {
  const j = getDefaultStore();
  j.set(clockMinAtom, n);
  if (playing !== undefined) j.set(playingAtom, playing);
}

function pushZustandClock(
  set: (partial: Partial<BoardState>) => void,
  n: number,
  extra?: Partial<BoardState>,
  force = false,
) {
  const t = nowMs();
  if (!force && t - lastClockSync < CLOCK_SYNC_MS) return;
  lastClockSync = t;
  set({ clockMin: n, ...extra });
}

let delayRaf = 0;

function schedulePlan(get: () => BoardState) {
  if (!get().event) return;
  const run = () => {
    delayRaf = 0;
    get().findPlan();
  };
  if (typeof requestAnimationFrame === "function") {
    if (delayRaf) return;
    delayRaf = requestAnimationFrame(run);
    return;
  }
  run();
}

export const useBoardStore = create<BoardState>((set, get) => ({
  ...publishedState(),

  setSelectedId: (id) => {
    if (get().yard.timeUnit === "hour") {
      set({ selectedId: id, delayMin: 1, holdOn: false, forceDock: "" });
      get().findPlan();
      return;
    }
    set({ selectedId: id });
  },
  setDelayMin: (n) => {
    const { lo, hi } = delayBounds(get().yard.timeUnit);
    set({ delayMin: Math.max(lo, Math.min(hi, Math.round(n))) });
    schedulePlan(get);
  },
  setMessage: (s) => set({ message: s }),
  setTab: (t) => set({ tab: t }),
  setForceDock: (id) => set({ forceDock: id }),
  toggleForceDock: (id) => {
    set({ forceDock: get().forceDock === id ? "" : id, holdOn: false });
    if (get().event) get().findPlan();
  },
  toggleForceReefer: () => {
    set({ forceReefer: !get().forceReefer });
    if (get().event) get().findPlan();
  },
  toggleAgent: () => set({ useAgent: !get().useAgent }),
  toggleCollapsed: () => set({ collapsed: !get().collapsed }),
  setPlaying: (v) => {
    const j = getDefaultStore();
    j.set(playingAtom, v);
    set({ playing: v, clockMin: j.get(clockMinAtom) });
  },
  setClockMin: (n) => {
    syncClock(n, false);
    lastClockSync = nowMs();
    set({ clockMin: n, playing: false });
  },
  advanceClock: (dt) => {
    const j = getDefaultStore();
    const { yard } = get();
    const n = j.get(clockMinAtom) + dt;
    if (n >= yard.shiftLenMin) {
      syncClock(yard.shiftLenMin, false);
      pushZustandClock(set, yard.shiftLenMin, { playing: false }, true);
      return;
    }
    syncClock(n);
    pushZustandClock(set, n);
  },
  hydrateTheme: () => {
    if (typeof window === "undefined") return;
    const next = window.localStorage.getItem("mm-theme") === "dark";
    document.documentElement.classList.toggle("dark", next);
    set({ dark: next });
  },
  toggleTheme: () => {
    const next = !get().dark;
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("mm-theme", next ? "dark" : "light");
    set({ dark: next });
  },

  applyEvent: (event, note) => {
    const yard = get().yard;
    const solved = runSolve(yard, event);
    set({
      event,
      result: solved,
      selectedId: event.truckId,
      clockMin: event.newEtaMin,
      agentNote: note === undefined ? get().agentNote : note,
      etc: event.etc ?? null,
      liveEta: event.etc ? formatEtcVerdict(event.etc, yard.shiftStartMin, yard.timeUnit) : get().liveEta,
    });
    syncClock(event.newEtaMin);
    lastClockSync = nowMs();
    return solved;
  },

  findPlan: () => {
    const s = get();
    const truck = s.yard.trucks.find((t) => t.id === s.selectedId) ?? s.yard.trucks[0];
    if (!truck) return;
    const orig = s.yard.appointments.find((a) => a.truckId === truck.id);
    if (!orig) return;
    const etaMin = Math.max(0, Math.min(s.yard.shiftLenMin, orig.startMin + s.delayMin));
    if (s.yard.timeUnit === "hour") {
      get().applyEvent(
        {
          truckId: truck.id,
          newEtaMin: etaMin,
          cargoOverride: s.forceReefer ? "reefer" : undefined,
          forceDockId: s.holdOn ? orig.dockId : s.forceDock || undefined,
          nowMin: defaultNowMin(orig.startMin, etaMin),
          source: "manual",
        },
        null,
      );
      return;
    }
    const nowMin = Math.round(s.clockMin);
    const arb = arbitrateEtc({
      truckId: truck.id,
      nowMin,
      watched: ["manual", "booked"],
      readings: [
        { source: "manual", truckId: truck.id, etaMin, observedAtMin: nowMin },
        { source: "booked", truckId: truck.id, etaMin: orig.startMin, observedAtMin: 0 },
      ],
    });
    const etc = arb.ok ? arb.verdict : undefined;
    get().applyEvent(
      {
        truckId: truck.id,
        newEtaMin: etc?.etaMin ?? etaMin,
        cargoOverride: s.forceReefer ? "reefer" : undefined,
        forceDockId: s.holdOn ? orig.dockId : s.forceDock || undefined,
        nowMin,
        source: etc?.winner ?? "manual",
        etc,
      },
      null,
    );
  },

  readNote: async () => {
    set({ busy: true, agentNote: null });
    try {
      const s = get();
      const selected = s.yard.trucks.find((t) => t.id === s.selectedId) ?? s.yard.trucks[0];
      const local = runParse(s.message, s.yard);
      let agentEtaMin: number | undefined;
      let agentTruckId: string | undefined;
      let agentCargo = local.event.cargoOverride;
      let agentDock = local.event.forceDockId;
      let agentNote: string | null = local.complete ? null : local.warnings.join(" ");
      if (s.useAgent) {
        const res = await runInterpret(s.message);
        if (res.ok) {
          if (res.agentEtaMin != null) agentEtaMin = res.agentEtaMin;
          if (res.agentTruckId) agentTruckId = res.agentTruckId;
          agentCargo = local.event.cargoOverride ?? res.parse.event.cargoOverride;
          agentDock = local.event.forceDockId ?? res.parse.event.forceDockId;
          agentNote =
            res.via === "agent" ? "Agent filled intent. The arbiter owns the minute. Solver owns the board." : res.agentNote;
        }
      }
      const truckId = local.event.truckId ?? agentTruckId ?? selected?.id ?? "";
      if (!truckId) {
        set({ agentNote: "No truck matched." });
        return;
      }
      const booked = s.yard.appointments.find((a) => a.truckId === truckId);
      const nowMin = Math.round(s.clockMin);
      const readings: EtcReading[] = [];
      if (local.event.truckId && local.event.newEtaMin != null) {
        readings.push({
          source: "parse",
          truckId: local.event.truckId,
          etaMin: local.event.newEtaMin,
          observedAtMin: nowMin,
        });
      }
      if (agentTruckId && agentEtaMin != null) {
        readings.push({ source: "agent", truckId: agentTruckId, etaMin: agentEtaMin, observedAtMin: nowMin });
      }
      if (booked) readings.push({ source: "booked", truckId, etaMin: booked.startMin, observedAtMin: 0 });
      const watched: EtcSourceId[] = ["parse", "agent", "booked"];
      if (!readings.some((r) => r.source === "parse" || r.source === "agent")) {
        const sliderBase = booked?.startMin ?? 0;
        readings.push({
          source: "manual",
          truckId,
          etaMin: Math.max(0, Math.min(s.yard.shiftLenMin, sliderBase + s.delayMin)),
          observedAtMin: nowMin,
        });
        watched.push("manual");
      }
      const arb = arbitrateEtc({ truckId, nowMin, readings, watched });
      if (!arb.ok) {
        set({ agentNote: "No clock to arbitrate." });
        return;
      }
      get().applyEvent(
        {
          truckId,
          newEtaMin: arb.verdict.etaMin,
          cargoOverride: agentCargo,
          forceDockId: agentDock,
          nowMin,
          source: arb.verdict.winner,
          note: local.event.note,
          etc: arb.verdict,
        },
        agentNote,
      );
      const base = booked?.startMin ?? 0;
      set({ delayMin: Math.max(-90, Math.min(90, Math.round(arb.verdict.etaMin - base))) });
    } finally {
      set({ busy: false });
    }
  },

  applyRelax: (drop) => {
    const { event } = get();
    if (!event) return;
    const next: DelayEvent = { ...event };
    if (drop === "forceDock") next.forceDockId = undefined;
    if (drop === "cargo") next.cargoOverride = undefined;
    get().applyEvent(next);
    if (drop === "forceDock") set({ forceDock: "", holdOn: false });
    if (drop === "cargo") set({ forceReefer: false });
  },

  commit: () => {
    const { result, yard } = get();
    if (!result || result.status !== "OPTIMAL") return;
    set({
      previous: yard,
      yard: runCommit(yard, result.appointments),
      result: null,
      event: null,
      holdOn: false,
      agentNote: "Published to the board.",
    });
  },

  undo: () => {
    const prev = get().previous;
    if (!prev) return;
    set({
      yard: prev,
      previous: null,
      result: null,
      event: null,
      holdOn: false,
      agentNote: "Last commit undone.",
      etc: null,
      liveEta: null,
    });
  },

  hold: () => {
    const s = get();
    const orig = s.yard.appointments.find((a) => a.truckId === s.selectedId);
    if (!orig) return;
    set({ holdOn: true, forceDock: orig.dockId });
    get().findPlan();
  },

  nudge: (delta = 15) => {
    const s = get();
    const event = s.event;
    const result = s.result;
    if (!result || result.status !== "OPTIMAL" || !event) {
      get().findPlan();
      return;
    }
    const truck = s.yard.trucks.find((t) => t.id === event.truckId);
    const chosen = result.appointments.find((a) => a.truckId === event.truckId);
    if (!truck || !chosen) {
      get().findPlan();
      return;
    }
    const start = chosen.startMin + delta;
    const end = start + truck.durationMin;
    if (start < event.newEtaMin || end > s.yard.shiftLenMin) {
      get().findPlan();
      return;
    }
    if (start - event.newEtaMin > truck.maxWaitMin) {
      get().findPlan();
      return;
    }
    const dockIds = s.yard.docks.map((d) => d.id);
    const left = dockIds.indexOf(chosen.dockId);
    const span = berthSpan(truck);
    const occ: Busy[][] = s.yard.docks.map(() => []);
    for (const a of result.appointments) {
      if (a.truckId === truck.id) continue;
      const t = s.yard.trucks.find((x) => x.id === a.truckId);
      const di = dockIds.indexOf(a.dockId);
      if (t && di >= 0) addSpan(occ, di, berthSpan(t), a.startMin, a.startMin + t.durationMin);
    }
    if (left < 0 || !fitsSpan(occ, left, span, start, end, s.yard.shiftLenMin)) {
      get().findPlan();
      return;
    }
    const next = result.appointments.map((a) => (a.truckId === truck.id ? { ...a, startMin: start } : a));
    const wait = start - event.newEtaMin;
    set({
      result: {
        ...result,
        appointments: next,
        metrics: { ...result.metrics, eventWaitMin: wait },
        certificate: result.certificate
          ? { ...result.certificate, chosen: { ...result.certificate.chosen, startMin: start, waitMin: wait } }
          : result.certificate,
      },
      agentNote: `Draft nudged ${delta > 0 ? "+" : ""}${delta} min on door ${chosen.dockId.replace("D", "")}.`,
    });
  },

  reset: () => {
    const keep = { dark: get().dark, collapsed: get().collapsed, tab: get().tab };
    const next = get().yard.timeUnit === "hour" ? publishedState() : demoState();
    syncClock(0, false);
    lastClockSync = nowMs();
    set({ ...next, ...keep });
  },

  openDemo: () => {
    const keep = { dark: get().dark, collapsed: get().collapsed, tab: get().tab };
    syncClock(0, false);
    lastClockSync = nowMs();
    set({ ...demoState(), ...keep });
  },

  openPublished: () => {
    get().openWeek("bcn-24B-2");
  },

  openWeek: (weekId) => {
    get().openBuiltYard(publishedYard(weekId));
  },

  openBuiltYard: (source, focusId) => {
    const keep = { dark: get().dark, collapsed: get().collapsed, tab: get().tab };
    const yard = cloneYard(source);
    const focused = focusId && yard.trucks.some((t) => t.id === focusId) ? focusId : "";
    const selectedId = focused || (yard.id === "bcn-24B-2" ? "S11" : (yard.trucks[0]?.id ?? ""));
    syncClock(0, false);
    lastClockSync = nowMs();
    set({
      ...publishedState(),
      yard,
      selectedId,
      message: `${selectedId} arrives 1 hour after its published mooring`,
      ...keep,
    });
    get().findPlan();
  },

  liveRoute: async () => {
    const s = get();
    const orig = s.yard.appointments.find((a) => a.truckId === s.selectedId);
    if (!orig) return;
    set({ busy: true });
    try {
      const eta = await runLiveEta(s.message);
      const nowMin = Math.round(get().clockMin);
      const roadEta = arrivalMin(nowMin, eta.travelMin, s.yard.shiftLenMin);
      const local = runParse(s.message, s.yard);
      const readings: EtcReading[] = [
        { source: eta.source, truckId: s.selectedId, etaMin: roadEta, observedAtMin: nowMin },
        { source: "booked", truckId: s.selectedId, etaMin: orig.startMin, observedAtMin: 0 },
      ];
      if (local.event.truckId && local.event.newEtaMin != null) {
        readings.push({
          source: "parse",
          truckId: local.event.truckId,
          etaMin: local.event.newEtaMin,
          observedAtMin: nowMin,
        });
      }
      const watched: EtcSourceId[] = ["osrm", "haversine", "booked"];
      if (s.message.trim()) watched.push("parse");
      const arb = arbitrateEtc({ truckId: s.selectedId, nowMin, readings, watched });
      if (!arb.ok) {
        set({ liveEta: "No clock to arbitrate." });
        return;
      }
      const noted = local.event.truckId === s.selectedId;
      set({ delayMin: Math.max(-90, Math.min(90, Math.round(arb.verdict.etaMin - orig.startMin))) });
      get().applyEvent({
        truckId: s.selectedId,
        newEtaMin: arb.verdict.etaMin,
        cargoOverride: (noted ? local.event.cargoOverride : undefined) ?? (get().forceReefer ? "reefer" : undefined),
        forceDockId: get().holdOn ? orig.dockId : (noted ? local.event.forceDockId : undefined) || get().forceDock || undefined,
        nowMin,
        source: arb.verdict.winner,
        note: local.event.note ?? `${eta.from} ${eta.travelMin}m`,
        etc: arb.verdict,
      });
    } catch {
      set({ liveEta: "Routing unreachable. Using local delay." });
    } finally {
      set({ busy: false });
    }
  },

  setSetupOpen: (v) => set({ setupOpen: v }),
  setGanttFilter: (f) => set({ ganttFilter: get().ganttFilter === f ? "all" : f }),
  setSlaRateUsd: (n) => set({ slaRateUsd: Math.max(1, Math.round(n)) }),
  setMaxMovesAllowed: (k) => {
    set({ maxMovesAllowed: k });
    if (get().event) get().findPlan();
  },
  setFreezeWindowMin: (n) => {
    set({ freezeWindowMin: Math.max(0, Math.round(n)) });
    if (get().event) get().findPlan();
  },
  setHostAdapter: (a) => set({ hostAdapter: a }),

  applyFacilityPreset: (preset) => {
    const keep = { dark: get().dark, collapsed: get().collapsed, tab: get().tab };
    if (preset === "bcn-hour") {
      syncClock(0, false);
      lastClockSync = nowMs();
      set({ ...publishedState(), ...keep });
      get().findPlan();
      return;
    }
    if (preset === "icd-minute") {
      syncClock(0, false);
      lastClockSync = nowMs();
      set({ ...demoState(), ...keep });
      get().findPlan();
      return;
    }
    const base = createYard();
    if (preset === "reefer-cold") {
      base.name = "Mekong Cold Hub -25°C";
      base.gate = "Cold Chain Gate A · Reefer WMS";
      base.docks = base.docks.map((d, idx) => ({
        ...d,
        mode: idx === 3 ? "closed" : "open",
        cargo: ["reefer", "dry"],
        equipment: ["reefer_plug", "forklift"],
      }));
      base.trucks = base.trucks.map((t) => ({ ...t, cargo: "reefer" }));
      syncClock(0, false);
      lastClockSync = nowMs();
      set({
        ...demoState(),
        ...keep,
        yard: base,
        slaRateUsd: 28,
        hostAdapter: "Blue Yonder WMS / Cold-Chain ERP",
      });
      get().findPlan();
      return;
    }
    if (preset === "crossdock-fmcg") {
      base.name = "Bình Dương Cross-Dock Hub";
      base.gate = "High-Velocity Gate C · 8 Doors";
      const extraDocks = [
        { id: "D7", name: "Door 7", label: "Door 7", short: "D7", mode: "open" as const, cargo: ["dry" as const], equipment: ["forklift" as const] },
        { id: "D8", name: "Door 8", label: "Door 8", short: "D8", mode: "open" as const, cargo: ["dry" as const, "reefer" as const], equipment: ["forklift" as const, "reefer_plug" as const] },
      ];
      base.docks = [...base.docks.map((d) => ({ ...d, mode: "open" as const })), ...extraDocks];
      syncClock(0, false);
      lastClockSync = nowMs();
      set({
        ...demoState(),
        ...keep,
        yard: base,
        slaRateUsd: 15,
        hostAdapter: "SAP EWM / FourKites Dynamic Yard",
      });
      get().findPlan();
      return;
    }
    if (preset === "barge-hub") {
      base.name = "Cát Lái – Hiệp Phước Barge ICD";
      base.gate = "Sông Đồng Nai · 6 Cầu Sà Lan";
      base.docks = base.docks.map((d, i) => ({
        ...d,
        name: `Bến Sà Lan ${i + 1}`,
        label: `Bến Sà Lan ${i + 1}`,
        mode: "open" as const,
      }));
      syncClock(0, false);
      lastClockSync = nowMs();
      set({
        ...demoState(),
        ...keep,
        yard: base,
        slaRateUsd: 22,
        hostAdapter: "SGP-TOS (VTOS / TOPOVN / VETC)",
      });
      get().findPlan();
    }
  },

  updateYardMeta: (name, gate) => {
    const yard = cloneYard(get().yard);
    yard.name = name;
    yard.gate = gate;
    set({ yard });
  },

  toggleDockOpen: (dockId) => {
    const yard = cloneYard(get().yard);
    const dock = yard.docks.find((d) => d.id === dockId);
    if (!dock) return;
    dock.mode = dock.mode === "closed" ? "open" : "closed";
    set({ yard });
    if (get().event) get().findPlan();
  },

  toggleDockReefer: (dockId) => {
    const yard = cloneYard(get().yard);
    const dock = yard.docks.find((d) => d.id === dockId);
    if (!dock) return;
    const hasReefer = dock.cargo.includes("reefer");
    if (hasReefer) {
      dock.cargo = ["dry"];
      dock.equipment = dock.equipment.filter((e) => e !== "reefer_plug");
    } else {
      dock.cargo = Array.from(new Set([...dock.cargo, "reefer"]));
      dock.equipment = Array.from(new Set([...dock.equipment, "reefer_plug"]));
    }
    set({ yard });
    if (get().event) get().findPlan();
  },

  addCustomDock: () => {
    const yard = cloneYard(get().yard);
    const hour = yard.timeUnit === "hour";
    const n = yard.docks.length;
    const id = hour ? `B${n}` : `D${n + 1}`;
    const name = hour ? `Berth ${n}` : `Door ${n + 1}`;
    yard.docks.push({
      id,
      name,
      label: name,
      short: id,
      mode: "open",
      cargo: ["dry", "reefer"],
      equipment: ["forklift", "reefer_plug"],
    });
    set({ yard });
    if (get().event) get().findPlan();
  },

  removeLastDock: () => {
    const yard = cloneYard(get().yard);
    if (yard.docks.length <= 3) return;
    const last = yard.docks[yard.docks.length - 1];
    if (!last) return;
    if (yard.appointments.some((a) => a.dockId === last.id)) return;
    yard.docks.pop();
    set({ yard });
    if (get().event) get().findPlan();
  },

  setTruckPriority: (truckId, priority) => {
    const yard = cloneYard(get().yard);
    const t = yard.trucks.find((x) => x.id === truckId);
    if (!t) return;
    t.priority = priority;
    set({ yard });
    if (get().event) get().findPlan();
  },

  setTruckDuration: (truckId, delta) => {
    const yard = cloneYard(get().yard);
    const t = yard.trucks.find((x) => x.id === truckId);
    if (!t) return;
    const minDur = yard.timeUnit === "hour" ? 2 : 15;
    const maxDur = yard.timeUnit === "hour" ? 96 : 240;
    t.durationMin = Math.max(minDur, Math.min(maxDur, t.durationMin + delta));
    set({ yard });
    if (get().event) get().findPlan();
  },

  injectCustomJob: (job) => {
    const yard = cloneYard(get().yard);
    const hour = yard.timeUnit === "hour";
    const id = job.plate.trim() || (hour ? `S${yard.trucks.length}` : `T-${yard.trucks.length + 1}`);
    const existingIdx = yard.trucks.findIndex((t) => t.id === id);
    const newTruck = {
      id,
      plate: job.plate.trim() || id,
      hauler: job.hauler.trim() || (hour ? "Custom Vessel Line" : "Custom Logistics Fleet"),
      cargo: job.cargo,
      requiredEquipment: job.cargo === "reefer" ? (["reefer_plug"] as ("forklift" | "reefer_plug" | "crane")[]) : ([] as ("forklift" | "reefer_plug" | "crane")[]),
      durationMin: job.durationMin,
      priority: job.priority,
      maxWaitMin: hour ? 240 : 180,
      deadlineMin: yard.shiftLenMin,
      span: hour ? (job.span ?? 4) : 1,
      arrivalMin: job.startMin,
    };
    if (existingIdx >= 0) {
      yard.trucks[existingIdx] = newTruck;
      const apptIdx = yard.appointments.findIndex((a) => a.truckId === id);
      if (apptIdx >= 0) {
        yard.appointments[apptIdx] = { truckId: id, dockId: job.dockId, startMin: job.startMin };
      }
    } else {
      yard.trucks.push(newTruck);
      yard.appointments.push({ truckId: id, dockId: job.dockId, startMin: job.startMin });
    }
    set({
      yard,
      selectedId: id,
      delayMin: job.delayMin,
      setupOpen: false,
      tab: "board",
      message: `${newTruck.plate} late ${job.delayMin}${hour ? "h" : " min"}`,
    });
    get().findPlan();
  },
}));

export function selectLive(s: BoardState): Appointment[] {
  const r = s.result;
  if (r && (r.status === "OPTIMAL" || r.status === "HUMAN_REQUIRED")) return r.appointments;
  return s.yard.appointments;
}

export function selectPlayhead(s: BoardState): number {
  return s.result?.certificate?.chosen.startMin ?? s.event?.newEtaMin ?? s.clockMin;
}
