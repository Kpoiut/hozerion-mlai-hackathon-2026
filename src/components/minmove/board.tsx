import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useAtomValue } from "jotai";
import { Link } from "@tanstack/react-router";
import {
  Anchor,
  Boxes,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  FileCheck2,
  LayoutGrid,
  LayoutList,
  MapPin,
  Minus,
  Moon,
  Network,
  Pause,
  Play,
  Radio,
  Sparkles,
  Sun,
  Truck,
  Undo2,
  Waypoints,
} from "lucide-react";
import { BacapPane, FederationPane, UniversalSidecarAndBenchmarkPanel } from "@/components/minmove/bacap-federation-pane.tsx";
import { MlaiHackathonCommandCenter } from "@/components/minmove/mlai-command-pane.tsx";
import { DecisionBar } from "@/components/minmove/decision-bar.tsx";
import { DocsReconcilePane, MicroTosPane } from "@/components/minmove/docs-microtos-pane.tsx";
import { JobCard } from "@/components/minmove/job-card.tsx";
import { FlowStage } from "@/components/minmove/flow-stage.tsx";
import { Gantt } from "@/components/minmove/gantt.tsx";
import { Inspector } from "@/components/minmove/inspector.tsx";
import { PublishedLedger } from "@/components/minmove/published-ledger.tsx";
import { Roster } from "@/components/minmove/roster.tsx";
import { Button } from "@/components/ui/button.tsx";
import { SERVICES, healthMap, runFlow } from "@/lib/minmove/engine.ts";
import { formatWhen } from "@/lib/minmove/seed.ts";
import { clockMinAtom } from "@/lib/minmove/atoms.ts";
import { selectLive, selectPlayhead, useBoardStore } from "@/lib/minmove/store.ts";
import { cn } from "@/lib/utils.ts";

const OFFSET_TICKS = [-90, -60, -30, 0, 30, 60, 90];
const PRESETS = [
  { id: "late47", label: "C+47", text: "Truck C late 47 min" },
  { id: "vn", label: "VN", text: "51C-882.13 bên Q7 đang kẹt, chắc tầm 11h27 mới tới. Hàng đông lạnh nhé." },
  { id: "door4", label: "Door 4", text: "Truck C late 47 min, door 4" },
];

export function Board() {
  const noteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    useBoardStore.getState().hydrateTheme();
    const s = useBoardStore.getState();
    if (s.yard.timeUnit === "hour" && !s.result) s.findPlan();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
      if (e.key === "/" && !typing) {
        e.preventDefault();
        noteRef.current?.focus();
        return;
      }
      if (typing) return;
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        useBoardStore.getState().findPlan();
      }
      if (e.key === "c" || e.key === "C") useBoardStore.getState().commit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-bg text-fg">
      <ClockDriver />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header noteRef={noteRef} />
        <MobileNav />
        <div className="flex min-h-0 flex-1">
          <Main />
          <InspectorPane />
        </div>
      </div>
    </div>
  );
}

function ClockDriver() {
  const playing = useBoardStore((s) => s.playing);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      useBoardStore.getState().advanceClock((now - last) / 35);
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  return null;
}

function Sidebar() {
  const collapsed = useBoardStore((s) => s.collapsed);
  const tab = useBoardStore((s) => s.tab);
  const setTab = useBoardStore((s) => s.setTab);
  const yard = useBoardStore((s) => s.yard);
  const event = useBoardStore((s) => s.event);
  const result = useBoardStore((s) => s.result);
  const liveEta = useBoardStore((s) => s.liveEta);
  const useAgent = useBoardStore((s) => s.useAgent);
  const health = healthMap(useAgent);
  const lateCount = event ? 1 : 0;

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-nav-line bg-nav text-nav-fg lg:flex",
        collapsed ? "w-[4.5rem]" : "w-sidebar",
      )}
    >
      <div className="flex h-14 items-center gap-3 px-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-fg">
          H
        </span>
        {collapsed ? null : (
          <div className="min-w-0">
            <p className="text-base font-semibold leading-tight tracking-tight">Hozerion</p>
            <p className="truncate font-mono text-[10px] text-accent">Universal Logistics Sidecar</p>
          </div>
        )}
      </div>
      {collapsed ? null : (
        <div className="mx-3 mb-2.5 rounded-xl bg-raised/80 px-3 py-2 ring-1 ring-line/60">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-nav-muted">Site · Điểm Vận Hành</p>
            <span className="rounded bg-ok/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ok">k=0</span>
          </div>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium">
            <MapPin className="size-3.5 text-accent" />
            {yard.name}
          </p>
          <p className="pl-5 text-xs text-nav-muted">{yard.gate}</p>
        </div>
      )}
      <nav className="flex flex-col gap-0.5 overflow-y-auto px-3">
        {collapsed ? null : (
          <p className="px-2 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-faint">
            Điều Độ Lịch &amp; Luồng
          </p>
        )}
        <NavBtn icon={CalendarClock} label="Timeline" active={tab === "board"} onClick={() => setTab("board")} collapsed={collapsed} />
        <NavBtn icon={LayoutGrid} label="Appointments" active={tab === "roster"} onClick={() => setTab("roster")} collapsed={collapsed} />
        <NavBtn icon={Waypoints} label="Flow" active={tab === "flow"} onClick={() => setTab("flow")} collapsed={collapsed} />
        {collapsed ? null : (
          <p className="px-2 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
            Hệ Sinh Thái 7 Trụ Cột
          </p>
        )}
        <NavBtn
          icon={Sparkles}
          label="AI Agent & HITL"
          badge="MLAI"
          active={tab === "mlai"}
          onClick={() => setTab("mlai")}
          collapsed={collapsed}
        />
        <NavBtn
          icon={Cpu}
          label="Sidecar & Go/Rust"
          badge="536×"
          active={tab === "sidecar"}
          onClick={() => setTab("sidecar")}
          collapsed={collapsed}
        />
        <NavBtn
          icon={Anchor}
          label="BACAP · Cẩu & TOS"
          badge="STS"
          active={tab === "bacap"}
          onClick={() => setTab("bacap")}
          collapsed={collapsed}
        />
        <NavBtn
          icon={Network}
          label="Liên thông Cảng"
          badge="5 TOS"
          active={tab === "federation"}
          onClick={() => setTab("federation")}
          collapsed={collapsed}
        />
        <NavBtn
          icon={FileCheck2}
          label="Hải quan · eDO"
          badge="ISO"
          active={tab === "docs"}
          onClick={() => setTab("docs")}
          collapsed={collapsed}
        />
        <NavBtn
          icon={Boxes}
          label="Micro-TOS · Bãi 3D"
          badge="3D"
          active={tab === "microtos"}
          onClick={() => setTab("microtos")}
          collapsed={collapsed}
        />
      </nav>
      <div className="mt-auto space-y-2.5 p-3">
        {collapsed ? null : (
          <>
            <div className="grid grid-cols-3 gap-1.5">
              <Kpi value={yard.trucks.length} label={yard.timeUnit === "hour" ? "Calls" : "Trucks"} icon={Truck} />
              <Kpi value={yard.docks.length} label={yard.timeUnit === "hour" ? "Berths" : "Doors"} icon={LayoutList} />
              <Kpi value={lateCount} label="Late" warn={lateCount > 0} />
            </div>
            {yard.timeUnit === "hour" ? (
              <div className="rounded-xl bg-raised/80 px-3 py-2 ring-1 ring-line/60">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-nav-muted">Thực nghiệm 3.092 Ca</p>
                  <span className="font-mono text-[10px] font-bold text-ok">+$29.7M</span>
                </div>
                <p className="mt-1 text-xs leading-snug text-nav-fg">
                  83.02% giữ nguyên TOS (NO_OP) · 16.98% cứu 19.801 giờ tàu chờ (k=0).
                </p>
                {result ? (
                  <p className="mt-1.5 font-mono text-[11px] tabular-nums text-nav-muted">
                    V8: {result.ms}ms · Go: 5.15µs · k={result.kUsed}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl bg-raised/80 px-3 py-2">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-nav-muted">Services</p>
                <ul className="space-y-1">
                  {SERVICES.map((s) => (
                    <li key={s.id} className="flex items-center justify-between text-xs">
                      <span className="text-nav-muted">{s.label}</span>
                      {health[s.id] === "ok" ? (
                        <Check className="size-3.5 text-ok" />
                      ) : (
                        <span className="font-mono text-[10px] uppercase text-faint">{health[s.id]}</span>
                      )}
                    </li>
                  ))}
                  <li className="flex items-center justify-between text-xs">
                    <button type="button" onClick={() => useBoardStore.getState().toggleAgent()} className="text-nav-muted hover:text-nav-fg">
                      Agent {useAgent ? "on" : "off"}
                    </button>
                    {useAgent ? <Check className="size-3.5 text-ok" /> : <Minus className="size-3.5 text-faint" />}
                  </li>
                </ul>
                {result ? (
                  <p className="mt-1.5 font-mono text-xs tabular-nums text-nav-muted">
                    {result.ms}ms · {result.nodes ?? 0}n · k={result.kUsed}
                  </p>
                ) : null}
                {liveEta ? <p className="mt-1 text-xs text-ok">{liveEta}</p> : null}
              </div>
            )}
            <div className="flex flex-wrap gap-1">
              {yard.timeUnit === "hour" ? (
                <button
                  type="button"
                  onClick={() => useBoardStore.getState().openDemo()}
                  className="rounded-full bg-raised px-2 py-1 text-xs text-nav-muted ring-1 ring-line hover:bg-nav-hover hover:text-nav-fg"
                >
                  ICD minute demo
                </button>
              ) : (
                <>
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => useBoardStore.getState().setMessage(p.text)}
                      className="rounded-full bg-raised px-2 py-1 text-xs text-nav-muted hover:bg-nav-hover hover:text-nav-fg"
                    >
                      {p.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => useBoardStore.getState().openPublished()}
                    className="rounded-full bg-raised px-2 py-1 text-xs text-nav-muted hover:bg-nav-hover hover:text-nav-fg"
                  >
                    Barcelona 24B
                  </button>
                </>
              )}
              <Link to="/design" className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/15">
                Spec
              </Link>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={() => useBoardStore.getState().toggleCollapsed()}
          className="inline-flex h-7 items-center gap-1 text-xs text-nav-muted hover:text-nav-fg"
        >
          <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
          {collapsed ? null : "Collapse"}
        </button>
      </div>
    </aside>
  );
}

function Header({ noteRef }: { noteRef: RefObject<HTMLInputElement | null> }) {
  const tab = useBoardStore((s) => s.tab);
  const message = useBoardStore((s) => s.message);
  const busy = useBoardStore((s) => s.busy);
  const agentNote = useBoardStore((s) => s.agentNote);
  const delayMin = useBoardStore((s) => s.delayMin);
  const forceDock = useBoardStore((s) => s.forceDock);
  const playing = useBoardStore((s) => s.playing);
  const event = useBoardStore((s) => s.event);
  const dark = useBoardStore((s) => s.dark);
  const yard = useBoardStore((s) => s.yard);
  const hour = yard.timeUnit === "hour";
  const shift = yard.shiftLenMin;
  const start = yard.shiftStartMin;
  const sliderMin = hour ? -6 : -90;
  const sliderMax = hour ? 12 : 90;
  const ticks = hour ? [-6, -1, 0, 1, 6, 12] : OFFSET_TICKS;

  return (
    <header className="flex h-16 shrink-0 flex-nowrap items-center gap-3 overflow-hidden border-b border-line bg-surface px-4 sm:px-5">
      <h1 className="shrink-0 text-sm font-semibold tracking-tight">Hozerion</h1>
      <p className="hidden shrink-0 whitespace-nowrap text-sm xl:block">
        <span className="font-semibold tracking-tight">
          {tab === "sidecar"
            ? "Universal Sidecar Plugin & Go/Rust Benchmark"
            : tab === "bacap"
              ? "BACAP-R · Quay Crane & TOS"
              : tab === "federation"
                ? "Inter-Port TOS Federation"
                : tab === "docs"
                  ? "VNACCS · eDO · VGM Reconciliation"
                  : tab === "microtos"
                    ? "Micro-TOS · 3D Yard & Billing"
                    : hour
                      ? "Late call"
                      : tab === "board"
                        ? "Timeline"
                        : tab === "roster"
                          ? "Appointments"
                          : "Flow"}
        </span>
        <span className="mx-1.5 text-faint">/</span>
        <span className="text-muted">{hour ? "Published berth plan" : "Morning board"}</span>
      </p>
      <div className="ml-auto flex min-w-0 flex-nowrap items-center gap-2">
        {hour ? (
          <button
            type="button"
            onClick={() => useBoardStore.getState().setTab(tab === "sidecar" ? "board" : "sidecar")}
            className={cn(
              "hidden h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ring-1 transition-all md:inline-flex",
              tab === "sidecar"
                ? "bg-accent text-accent-fg ring-accent"
                : "bg-accent/10 text-accent ring-accent/30 hover:bg-accent/15",
            )}
          >
            <Cpu className="size-3.5" />
            Sidecar &amp; Go/Rust (536×)
          </button>
        ) : (
          <label className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-bg px-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-accent/30">
            <Truck className="size-4 shrink-0 text-muted" />
            <input
              ref={noteRef}
              value={message}
              onChange={(e) => useBoardStore.getState().setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void useBoardStore.getState().readNote();
              }}
              disabled={busy}
              placeholder="Paste a gate note"
              title={agentNote ?? "Enter to read"}
              className="w-36 min-w-0 bg-transparent py-0 text-sm outline-none sm:w-48 2xl:w-56"
            />
            <ChevronRight className="size-4 shrink-0 text-faint" />
          </label>
        )}
        <div className="hidden w-52 shrink-0 flex-col justify-center xl:flex 2xl:w-64">
          <span className="mb-0.5 text-[10px] font-medium tracking-wide text-faint">{hour ? "Hours after mooring" : "Time offset"}</span>
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={1}
            value={Math.max(sliderMin, Math.min(sliderMax, delayMin))}
            onChange={(e) => useBoardStore.getState().setDelayMin(Number(e.target.value))}
            className="w-full"
            style={{ ["--mm-range" as string]: `${((delayMin - sliderMin) / (sliderMax - sliderMin)) * 100}%` }}
            aria-label={hour ? "Hours after published mooring" : "Time offset minutes"}
          />
          <div className="flex justify-between overflow-hidden whitespace-nowrap font-mono text-[10px] leading-none text-faint">
            {ticks.map((t) => (
              <span key={t} className={cn(!hour && Math.abs(t) === 60 && "hidden 2xl:inline")}>
                {t === 0 ? "0" : t > 0 ? `+${t}` : String(t)}
              </span>
            ))}
          </div>
        </div>
        <span className="hidden h-9 shrink-0 items-center rounded-full bg-bg px-2.5 font-mono text-xs tabular-nums ring-1 ring-line sm:inline-flex">
          {delayMin >= 0 ? `+${delayMin}` : delayMin} {hour ? "h" : "min"}
        </span>
        {forceDock ? (
          <button
            type="button"
            onClick={() => useBoardStore.getState().setForceDock("")}
            className="hidden h-9 shrink-0 items-center rounded-full bg-accent px-3 font-mono text-xs text-accent-fg sm:inline-flex"
          >
            Door {forceDock.replace("D", "")}
          </button>
        ) : null}
        <Button type="button" variant="ghost" className="h-9 shrink-0 rounded-full px-3 ring-1 ring-line" onClick={() => useBoardStore.getState().findPlan()}>
          <Sparkles className="size-3.5 text-accent" />
          Find plan
        </Button>
        <button
          type="button"
          onClick={() => void useBoardStore.getState().liveRoute()}
          disabled={busy}
          hidden={hour}
          className="hidden h-9 shrink-0 items-center gap-1.5 rounded-full bg-ok/10 px-3 text-xs font-medium text-ok ring-1 ring-ok/20 hover:bg-ok/15 sm:inline-flex"
          title="Arbitrate the radio note against the road ETA. Range estimate if the router is down."
        >
          <Radio className="size-3.5" />
          Live
        </button>
        <HeaderClock shift={shift} start={start} etaMin={event?.newEtaMin} playing={playing} hour={hour} />
        <Button type="button" variant="ghost" size="sm" className="hidden h-9 shrink-0 rounded-full lg:inline-flex" onClick={() => useBoardStore.getState().reset()}>
          Reset
        </Button>
        <UndoHeader />
        <button
          type="button"
          onClick={() => useBoardStore.getState().toggleTheme()}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted ring-1 ring-line hover:bg-raised hover:text-fg"
          aria-label={dark ? "Switch to light" : "Switch to dark"}
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>
    </header>
  );
}

function HeaderClock({
  shift,
  start,
  etaMin,
  playing,
  hour,
}: {
  shift: number;
  start: number;
  etaMin?: number;
  playing: boolean;
  hour: boolean;
}) {
  const clockMin = useAtomValue(clockMinAtom);
  const label = etaMin ?? clockMin;
  return (
    <div className="hidden h-9 shrink-0 items-center gap-1.5 rounded-full bg-bg px-2 ring-1 ring-line md:flex">
      <button type="button" onClick={() => useBoardStore.getState().setPlaying(!playing)} aria-label={playing ? "Pause" : "Play"}>
        {playing ? <Pause className="size-3.5" /> : <Play className="ml-px size-3.5" />}
      </button>
      <Clock className="size-3.5 text-muted" />
      <span className="font-mono text-xs tabular-nums">{formatWhen({ shiftStartMin: start, timeUnit: hour ? "hour" : "minute" }, Math.round(label))}</span>
      <input
        type="range"
        min={0}
        max={shift}
        value={Math.round(clockMin)}
        onChange={(e) => useBoardStore.getState().setClockMin(Number(e.target.value))}
        className="hidden w-16 2xl:block"
        style={{ ["--mm-range" as string]: `${shift ? (clockMin / shift) * 100 : 0}%` }}
        aria-label="Simulation clock"
      />
    </div>
  );
}

function UndoHeader() {
  const previous = useBoardStore((s) => s.previous);
  if (!previous) return null;
  return (
    <Button type="button" variant="ghost" size="sm" className="hidden h-9 shrink-0 rounded-full lg:inline-flex" onClick={() => useBoardStore.getState().undo()}>
      <Undo2 className="size-3.5" />
      Undo
    </Button>
  );
}

function MobileNav() {
  const tab = useBoardStore((s) => s.tab);
  const setTab = useBoardStore((s) => s.setTab);
  return (
    <div className="flex h-10 shrink-0 items-center gap-1.5 overflow-x-auto border-b border-line bg-surface px-3 lg:hidden">
      <NavBtn icon={CalendarClock} label="Board" active={tab === "board"} onClick={() => setTab("board")} compact light />
      <NavBtn icon={Sparkles} label="MLAI" active={tab === "mlai"} onClick={() => setTab("mlai")} compact light />
      <NavBtn icon={Cpu} label="Sidecar" active={tab === "sidecar"} onClick={() => setTab("sidecar")} compact light />
      <NavBtn icon={LayoutList} label="List" active={tab === "roster"} onClick={() => setTab("roster")} compact light />
      <NavBtn icon={Waypoints} label="Flow" active={tab === "flow"} onClick={() => setTab("flow")} compact light />
      <NavBtn icon={Anchor} label="BACAP" active={tab === "bacap"} onClick={() => setTab("bacap")} compact light />
      <NavBtn icon={Network} label="Cảng" active={tab === "federation"} onClick={() => setTab("federation")} compact light />
      <NavBtn icon={FileCheck2} label="eDO" active={tab === "docs"} onClick={() => setTab("docs")} compact light />
      <NavBtn icon={Boxes} label="Bãi 3D" active={tab === "microtos"} onClick={() => setTab("microtos")} compact light />
      <span className="ml-auto" />
      <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => useBoardStore.getState().reset()}>
        Reset
      </Button>
    </div>
  );
}

function Main() {
  const tab = useBoardStore((s) => s.tab);
  const result = useBoardStore((s) => s.result);
  const yard = useBoardStore((s) => s.yard);
  const isScheduleTab = tab === "board" || tab === "roster" || tab === "flow";
  return (
    <div className="min-h-0 min-w-0 flex-1 overflow-auto p-4 sm:p-5">
      {yard.timeUnit === "hour" && tab === "board" ? <JobCard /> : null}
      {result && isScheduleTab ? (
        <div className="mb-3">
          <DecisionBar
            result={result}
            yard={yard}
            onApplyRelax={(drop) => useBoardStore.getState().applyRelax(drop)}
            onCommit={() => useBoardStore.getState().commit()}
          />
        </div>
      ) : null}
      {tab === "board" ? <TimelinePane /> : null}
      {tab === "mlai" ? <MlaiHackathonCommandCenter /> : null}
      {tab === "sidecar" ? <UniversalSidecarAndBenchmarkPanel /> : null}
      {tab === "roster" ? <RosterPane /> : null}
      {tab === "flow" ? <FlowPane /> : null}
      {tab === "bacap" ? <BacapPane /> : null}
      {tab === "federation" ? <FederationPane /> : null}
      {tab === "docs" ? <DocsReconcilePane /> : null}
      {tab === "microtos" ? <MicroTosPane /> : null}
    </div>
  );
}

function TimelinePane() {
  const gantt = useGanttProps();
  return (
    <>
      <Gantt {...gantt} />
      <PublishedLedger />
      <div className="mt-4">
        <MlaiHackathonCommandCenter />
      </div>
      <UniversalSidecarAndBenchmarkPanel />
    </>
  );
}

function RosterPane() {
  const yard = useBoardStore((s) => s.yard);
  const live = useBoardStore(selectLive);
  const clockMin = useBoardStore((s) => s.clockMin);
  const event = useBoardStore((s) => s.event);
  const selectedId = useBoardStore((s) => s.selectedId);
  const delayMin = useBoardStore((s) => s.delayMin);
  const orig = yard.appointments.find((a) => a.truckId === (event?.truckId ?? selectedId));
  const etaMin = orig ? orig.startMin + delayMin : undefined;
  const trace = useMemo(() => runFlow(yard, live, event, event?.newEtaMin ?? etaMin), [yard, live, event, etaMin]);
  return (
    <Roster
      yard={yard}
      live={live}
      trace={trace}
      clockMin={clockMin}
      eventTruckId={event?.truckId}
      selectedId={selectedId}
      onSelect={(id) => useBoardStore.getState().setSelectedId(id)}
    />
  );
}

function FlowPane() {
  const gantt = useGanttProps();
  const yard = gantt.yard;
  const selectedId = gantt.selectedId;
  const clockMin = useBoardStore((s) => s.clockMin);
  return (
    <div className="space-y-4">
      <FlowStage
        yard={yard}
        trace={gantt.trace}
        clockMin={clockMin}
        selectedId={selectedId}
        onSelect={(id) => useBoardStore.getState().setSelectedId(id)}
      />
      <Gantt {...gantt} showFlow />
    </div>
  );
}

function InspectorPane() {
  const tab = useBoardStore((s) => s.tab);
  const yard = useBoardStore((s) => s.yard);
  const selectedId = useBoardStore((s) => s.selectedId);
  const liveAppts = useBoardStore(selectLive);
  const event = useBoardStore((s) => s.event);
  const result = useBoardStore((s) => s.result);
  if (tab === "mlai" || tab === "sidecar" || tab === "federation" || tab === "docs" || tab === "microtos") return null;
  const truck = yard.trucks.find((t) => t.id === selectedId) ?? yard.trucks[0]!;
  const orig = yard.appointments.find((a) => a.truckId === truck.id);
  const live = liveAppts.find((a) => a.truckId === truck.id);
  return (
    <div className="hidden w-panel shrink-0 border-l border-line bg-surface xl:block">
      <Inspector
        yard={yard}
        truck={truck}
        orig={orig}
        live={live}
        event={event}
        result={result}
        onFind={() => useBoardStore.getState().findPlan()}
      />
    </div>
  );
}

function useGanttProps() {
  const yard = useBoardStore((s) => s.yard);
  const live = useBoardStore(selectLive);
  const event = useBoardStore((s) => s.event);
  const selectedId = useBoardStore((s) => s.selectedId);
  const delayMin = useBoardStore((s) => s.delayMin);
  const playheadMin = useBoardStore(selectPlayhead);
  const orig = yard.appointments.find((a) => a.truckId === (event?.truckId ?? selectedId));
  const etaMin = event?.newEtaMin ?? (orig ? orig.startMin + delayMin : undefined);
  const trace = useMemo(() => runFlow(yard, live, event, etaMin), [yard, live, event, etaMin]);
  return {
    yard,
    live,
    trace,
    eventTruckId: event?.truckId,
    etaMin,
    playheadMin,
    selectedId,
    onSelect: (id: string) => useBoardStore.getState().setSelectedId(id),
    onForceDock: (id: string) => useBoardStore.getState().toggleForceDock(id),
  };
}

function Kpi({
  value,
  label,
  warn,
  icon: Icon,
}: {
  value: number;
  label: string;
  warn?: boolean;
  icon?: typeof Truck;
}) {
  return (
    <div className="rounded-xl bg-surface px-1 py-2 text-center shadow-border">
      {Icon ? <Icon className={cn("mx-auto size-3.5", warn ? "text-bad" : "text-muted")} /> : null}
      <p className={cn("mt-1 font-mono text-sm tabular-nums", warn && "text-bad")}>{value}</p>
      <p className="text-xs text-nav-muted">{label}</p>
    </div>
  );
}

function NavBtn({
  icon: Icon,
  label,
  badge,
  active,
  onClick,
  compact,
  light,
  collapsed,
}: {
  icon: typeof CalendarClock;
  label: string;
  badge?: string;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
  light?: boolean;
  collapsed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        "flex items-center justify-between gap-2 rounded-xl text-sm font-medium",
        compact ? "h-8 px-2" : "h-9 px-3",
        collapsed && "justify-center px-0",
        light
          ? active
            ? "bg-accent/10 text-accent"
            : "text-muted hover:bg-raised hover:text-fg"
          : active
            ? "bg-accent/10 text-accent"
            : "text-nav-muted hover:bg-nav-hover hover:text-nav-fg",
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5 truncate">
        <Icon className="size-4 shrink-0" />
        {collapsed ? null : <span className="truncate">{label}</span>}
      </span>
      {!collapsed && badge ? (
        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold",
            active ? "bg-accent text-accent-fg" : "bg-raised text-nav-muted",
          )}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

