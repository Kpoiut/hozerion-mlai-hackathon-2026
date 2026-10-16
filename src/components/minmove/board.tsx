import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useAtomValue } from "jotai";
import { Link } from "@tanstack/react-router";
import {
  Anchor,
  Boxes,
  CalendarClock,
  Check,
  ChevronDown,
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
  SlidersHorizontal,
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
import { LogisticsSetupModal } from "@/components/minmove/logistics-setup-modal.tsx";
import { MultimodalFleetStrip } from "@/components/minmove/multimodal-fleet-strip.tsx";
import { OverviewBlueprintPane } from "@/components/minmove/overview-blueprint-pane.tsx";
import { PublishedLedger } from "@/components/minmove/published-ledger.tsx";
import { Roster } from "@/components/minmove/roster.tsx";
import { SaasKpiRibbon } from "@/components/minmove/saas-kpi-ribbon.tsx";
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
      <LogisticsSetupModal />
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
  const result = useBoardStore((s) => s.result);
  const liveEta = useBoardStore((s) => s.liveEta);
  const [siteMenu, setSiteMenu] = useState(false);

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-nav-line bg-nav text-nav-fg lg:flex",
        collapsed ? "w-[4.5rem]" : "w-sidebar",
      )}
    >
      {/* SaaS Brand Header */}
      <div className="flex h-15 items-center gap-3 px-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-fg shadow-xs">
          H
        </span>
        {collapsed ? null : (
          <div className="min-w-0">
            <p className="text-base font-bold leading-tight tracking-tight text-fg">
              Hozerion Sidecar
            </p>
            <p className="truncate font-mono text-[10px] text-muted">
              Enterprise Schedule Control
            </p>
          </div>
        )}
      </div>

      {/* Facility Selector Card matching Mockup */}
      {collapsed ? null : (
        <div className="relative mx-3 mb-3">
          <button
            type="button"
            data-site-picker-btn=""
            onClick={() => setSiteMenu((v) => !v)}
            className="w-full rounded-2xl bg-surface px-3.5 py-2.5 text-left shadow-card ring-1 ring-line transition hover:bg-raised/80"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted">Facility Selector</p>
              <ChevronDown
                className={cn(
                  "size-3.5 text-muted transition-transform",
                  siteMenu && "rotate-180",
                )}
              />
            </div>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-fg">
              <MapPin className="size-4 shrink-0 text-accent" />
              <span className="truncate">{yard.name}</span>
            </p>
            <p className="truncate pl-6 text-xs text-muted">{yard.gate}</p>
          </button>
          {siteMenu ? (
            <div className="absolute top-full right-0 left-0 z-50 mt-1.5 rounded-2xl bg-surface p-1.5 shadow-float ring-1 ring-line">
              {(
                [
                  { id: "icd-minute", label: "Tan Thuan ICD (Minute)" },
                  { id: "bcn-hour", label: "Barcelona Quay 24B (Hour)" },
                  { id: "reefer-cold", label: "Mekong Cold -25°C (Reefer)" },
                  { id: "crossdock-fmcg", label: "Cross-Dock FMCG (8 Doors)" },
                  { id: "barge-hub", label: "Cát Lái – Hiệp Phước Barge" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSiteMenu(false);
                    useBoardStore.getState().applyFacilityPreset(item.id);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-fg hover:bg-raised"
                >
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="my-1 border-t border-line" />
              <button
                type="button"
                onClick={() => {
                  setSiteMenu(false);
                  useBoardStore.getState().setSetupOpen(true);
                }}
                className="flex w-full items-center gap-1.5 rounded-xl bg-accent/10 px-2.5 py-1.5 text-left text-xs font-semibold text-accent hover:bg-accent/15"
              >
                <SlidersHorizontal className="size-3.5" />
                Tự Setup Cấu Hình Riêng...
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Primary SaaS Navigation matching Mockup */}
      <nav className="flex flex-col gap-1 overflow-y-auto px-3">
        <NavBtn
          icon={LayoutGrid}
          label="Tổng quan (Blueprint)"
          badge="NEW"
          active={tab === "overview"}
          onClick={() => setTab("overview")}
          collapsed={collapsed}
        />
        <NavBtn
          icon={CalendarClock}
          label="Schedule Board"
          active={tab === "board"}
          onClick={() => setTab("board")}
          collapsed={collapsed}
        />
        <NavBtn
          icon={Sparkles}
          label="AI Command & HITL"
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
          icon={SlidersHorizontal}
          label="Self-Setup Studio"
          active={false}
          onClick={() => useBoardStore.getState().setSetupOpen(true)}
          collapsed={collapsed}
        />

        {collapsed ? null : (
          <p className="px-2 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-faint">
            Operations &amp; Plugins
          </p>
        )}
        <NavBtn
          icon={LayoutGrid}
          label="Appointments"
          active={tab === "roster"}
          onClick={() => setTab("roster")}
          collapsed={collapsed}
        />
        <NavBtn
          icon={Waypoints}
          label="Flow"
          active={tab === "flow"}
          onClick={() => setTab("flow")}
          collapsed={collapsed}
        />
        <NavBtn
          icon={Anchor}
          label="BACAP · Cẩu & TOS"
          active={tab === "bacap"}
          onClick={() => setTab("bacap")}
          collapsed={collapsed}
        />
        <NavBtn
          icon={Network}
          label="Liên thông Cảng"
          active={tab === "federation"}
          onClick={() => setTab("federation")}
          collapsed={collapsed}
        />
        <NavBtn
          icon={FileCheck2}
          label="Hải quan · eDO"
          active={tab === "docs"}
          onClick={() => setTab("docs")}
          collapsed={collapsed}
        />
        <NavBtn
          icon={Boxes}
          label="Micro-TOS · Bãi 3D"
          active={tab === "microtos"}
          onClick={() => setTab("microtos")}
          collapsed={collapsed}
        />
      </nav>

      {/* Bottom System Operational Card matching Mockup */}
      <div className="mt-auto space-y-2 p-3">
        {collapsed ? null : (
          <>
            <div className="rounded-2xl bg-ok/10 px-3.5 py-3 ring-1 ring-ok/25">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ok text-white">
                  <Check className="size-3" strokeWidth={2.5} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-fg">System Operational:</p>
                  <p className="text-xs font-semibold text-ok">All Berths Synced</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted">
                    Go 5.15µs · k={result?.kUsed ?? 0} · {yard.trucks.length} units
                  </p>
                  {liveEta ? <p className="mt-0.5 font-mono text-[10px] text-ok">{liveEta}</p> : null}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {yard.timeUnit === "hour" ? (
                <button
                  type="button"
                  onClick={() => useBoardStore.getState().openDemo()}
                  className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-nav-muted shadow-border hover:bg-nav-hover hover:text-nav-fg"
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
                      className="rounded-full bg-surface px-2 py-1 text-xs text-nav-muted shadow-border hover:bg-nav-hover hover:text-nav-fg"
                    >
                      {p.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => useBoardStore.getState().openPublished()}
                    className="rounded-full bg-surface px-2 py-1 text-xs text-nav-muted shadow-border hover:bg-nav-hover hover:text-nav-fg"
                  >
                    Barcelona 24B
                  </button>
                </>
              )}
              <Link
                to="/design"
                className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/15"
              >
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
  const selectedId = useBoardStore((s) => s.selectedId);
  const dark = useBoardStore((s) => s.dark);
  const yard = useBoardStore((s) => s.yard);
  const hour = yard.timeUnit === "hour";
  const shift = yard.shiftLenMin;
  const start = yard.shiftStartMin;
  const sliderMin = hour ? -6 : -90;
  const sliderMax = hour ? 12 : 90;
  const ticks = hour ? [-6, -1, 0, 1, 6, 12] : OFFSET_TICKS;

  return (
    <header className="flex h-16 shrink-0 flex-nowrap items-center gap-2.5 overflow-hidden border-b border-line bg-surface px-4 sm:px-5">
      <p className="shrink-0 whitespace-nowrap text-sm">
        <span className="font-semibold tracking-tight text-fg">
          {tab === "sidecar"
            ? "Sidecar & Go/Rust"
            : tab === "mlai"
              ? "AI Agent & Guardrails"
              : tab === "bacap"
                ? "BACAP · STS Cranes"
                : tab === "federation"
                  ? "5-TOS Federation"
                  : tab === "docs"
                    ? "eDO & ISO 6346"
                    : tab === "microtos"
                      ? "3D Yard & Billing"
                      : tab === "roster"
                        ? "Appointments"
                        : tab === "flow"
                          ? "Flow"
                          : "Timeline"}
        </span>
        <span className="mx-1.5 text-faint">/</span>
        <span className="text-muted">{hour ? "Published berth plan" : "Morning board"}</span>
      </p>
      <div className="ml-auto flex min-w-0 flex-nowrap items-center gap-1.5">
        {hour ? (
          <div className="hidden items-center gap-1.5 rounded-xl bg-bg px-2.5 py-1 ring-1 ring-line md:flex">
            <Truck className="size-3.5 text-muted" />
            <select
              value={selectedId}
              aria-label="Active vessel call"
              onChange={(e) => useBoardStore.getState().setSelectedId(e.target.value)}
              className="bg-transparent font-mono text-xs font-semibold text-fg outline-none"
            >
              {yard.trucks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.plate} late {delayMin >= 0 ? `+${delayMin}h` : `${delayMin}h`}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <label className="flex h-9 shrink-0 items-center gap-2 rounded-xl bg-bg px-2.5 ring-1 ring-line focus-within:ring-2 focus-within:ring-accent/30">
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
              className="w-32 min-w-0 bg-transparent py-0 text-xs outline-none xl:w-40 2xl:w-52"
            />
            <ChevronRight className="size-4 shrink-0 text-faint" />
          </label>
        )}
        <div className="hidden w-36 shrink-0 flex-col justify-center xl:flex 2xl:w-56">
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
                {t === 0 ? "Now" : t > 0 ? `+${t}` : String(t)}
              </span>
            ))}
          </div>
        </div>
        <span className="hidden h-9 shrink-0 items-center rounded-xl bg-bg px-2.5 font-mono text-xs font-semibold tabular-nums ring-1 ring-line sm:inline-flex">
          {delayMin >= 0 ? `+${delayMin}` : delayMin} {hour ? "h" : "min"}
        </span>
        {forceDock ? (
          <button
            type="button"
            onClick={() => useBoardStore.getState().setForceDock("")}
            className="hidden h-9 shrink-0 items-center rounded-xl bg-accent px-3 font-mono text-xs text-accent-fg sm:inline-flex"
          >
            Door {forceDock.replace("D", "")}
          </button>
        ) : null}
        <Button type="button" variant="ghost" className="h-9 shrink-0 rounded-xl px-3 ring-1 ring-line" onClick={() => useBoardStore.getState().findPlan()}>
          <Sparkles className="size-3.5 text-accent" />
          Find plan
        </Button>
        <button
          type="button"
          onClick={() => void useBoardStore.getState().liveRoute()}
          disabled={busy}
          hidden={hour}
          className="hidden h-9 shrink-0 items-center gap-1.5 rounded-xl bg-ok/10 px-3 text-xs font-medium text-ok ring-1 ring-ok/20 hover:bg-ok/15 sm:inline-flex"
          title="Arbitrate the radio note against the road ETA. Range estimate if the router is down."
        >
          <Radio className="size-3.5" />
          Live
        </button>
        <HeaderClock shift={shift} start={start} etaMin={event?.newEtaMin} playing={playing} hour={hour} />
        <Button type="button" variant="ghost" size="sm" className="hidden h-9 shrink-0 rounded-xl lg:inline-flex" onClick={() => useBoardStore.getState().reset()}>
          Reset
        </Button>
        <UndoHeader />
        <button
          type="button"
          onClick={() => useBoardStore.getState().setSetupOpen(true)}
          className="hidden h-9 shrink-0 items-center gap-1.5 rounded-xl bg-accent/10 px-2.5 text-xs font-semibold text-accent ring-1 ring-accent/25 hover:bg-accent/15 md:inline-flex"
          title="Tự cấu hình cầu bến, cửa kho, SLA và thêm lệnh riêng"
        >
          <SlidersHorizontal className="size-3.5" />
          Setup
        </button>
        <button
          type="button"
          onClick={() => useBoardStore.getState().toggleTheme()}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-muted ring-1 ring-line hover:bg-raised hover:text-fg"
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
    <div className="hidden h-9 shrink-0 items-center gap-1.5 rounded-xl bg-bg px-2.5 ring-1 ring-line md:flex">
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
    <Button type="button" variant="ghost" size="sm" className="hidden h-9 shrink-0 rounded-xl lg:inline-flex" onClick={() => useBoardStore.getState().undo()}>
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
      <NavBtn icon={LayoutGrid} label="Tổng quan" active={tab === "overview"} onClick={() => setTab("overview")} compact light />
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
  const delayMin = useBoardStore((s) => s.delayMin);
  const playing = useBoardStore((s) => s.playing);
  const hour = yard.timeUnit === "hour";
  const isScheduleTab = tab === "board" || tab === "roster" || tab === "flow";
  const showTopDecisionBar =
    result && isScheduleTab && !(yard.timeUnit === "hour" && tab === "board");

  const pageTitle =
    tab === "overview"
      ? "Tổng quan / Hozerion Design System 5.0"
      : tab === "mlai"
        ? "AI Command / 6 cảng TP.HCM"
        : tab === "sidecar"
          ? "Universal Sidecar / RFC 7396"
          : hour
            ? "Cầu bến Quốc tế / Barcelona 24B"
            : "Điều độ phút / Tân Thuận ICD";

  const pageSub =
    tab === "overview"
      ? "Nền tảng điều độ cảng biển, ICD & logistics đa phương thức không xâm lấn"
      : tab === "mlai"
        ? "Bản đồ vệ tinh 6 cảng TP.HCM · 05 AI Agents · QuotaMesh Origin-Bound Key Lock"
        : tab === "sidecar"
          ? "Thay đổi tối thiểu · giữ nguyên hệ chủ · hiển thị bằng sơ đồ và benchmark"
          : hour
            ? `${yard.docks.length} cầu bến · ${yard.trucks.length} tàu · lịch tàu trực quan · phân bổ không xâm lấn`
            : `0${yard.docks.length} cửa kho · ${yard.trucks.length} lượt xe · Trễ ${delayMin} phút · Chế độ mô phỏng`;

  return (
    <div className="min-h-0 min-w-0 flex-1 overflow-auto p-3.5 sm:p-4">
      {/* Design System 5.0 Page Title Row matching GPT reference images */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-fg sm:text-xl">
            {pageTitle}
          </h1>
          <p className="text-xs text-muted">{pageSub}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tab === "board" && !hour ? (
            <>
              <span className="inline-flex items-center gap-1 rounded-xl bg-ok/12 px-2.5 py-1 text-xs font-bold text-ok ring-1 ring-ok/25">
                ↑ 40 phút cứu được
              </span>
              <button
                type="button"
                onClick={() => useBoardStore.getState().setPlaying(!playing)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-accent/90"
              >
                <Play className="size-3.5 fill-current" />
                {playing ? "Tạm dừng" : "Chạy mô phỏng"}
              </button>
            </>
          ) : null}

          {tab === "board" && hour ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-ok/12 px-3 py-1 text-xs font-bold text-ok ring-1 ring-ok/25">
              <span className="size-2 rounded-full bg-ok" />
              B0 → B5 · Giảm 193h chờ · +$289,500
            </span>
          ) : null}

          {tab === "mlai" ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-bad/12 px-2.5 py-1 text-xs font-bold text-bad ring-1 ring-bad/25">
                <span className="size-2 rounded-full bg-bad" />
                Cát Lái 94% tải
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-ok/12 px-2.5 py-1 text-xs font-bold text-ok ring-1 ring-ok/25">
                <span className="size-2 rounded-full bg-ok" />
                QuotaMesh Origin Lock Active
              </span>
            </>
          ) : null}

          {tab === "sidecar" ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-ok/12 px-2.5 py-1 text-xs font-bold text-ok ring-1 ring-ok/25">
                <span className="size-2 rounded-full bg-ok" />
                83.02% giữ nguyên
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-accent/12 px-2.5 py-1 font-mono text-xs font-bold text-accent ring-1 ring-accent/25">
                Go 1.26.5 · 536×
              </span>
            </>
          ) : null}
        </div>
      </div>

      {tab === "overview" ? <OverviewBlueprintPane /> : null}
      {tab === "board" ? (
        <div className="mb-3">
          <SaasKpiRibbon />
        </div>
      ) : null}
      {yard.timeUnit === "hour" && tab === "board" ? <JobCard /> : null}
      {showTopDecisionBar ? (
        <div className="mb-2.5 rounded-2xl bg-surface px-3.5 py-2.5 shadow-card ring-1 ring-line">
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
  const result = useBoardStore((s) => s.result);
  const yard = useBoardStore((s) => s.yard);
  return (
    <>
      <Gantt {...gantt} />
      <div className="mt-3">
        <MultimodalFleetStrip compact />
      </div>
      {yard.timeUnit === "hour" && result ? (
        <div className="mt-3 rounded-2xl bg-surface px-4 py-2.5 shadow-card ring-1 ring-line">
          <DecisionBar
            result={result}
            yard={yard}
            onApplyRelax={(drop) => useBoardStore.getState().applyRelax(drop)}
            onCommit={() => useBoardStore.getState().commit()}
          />
        </div>
      ) : null}
      <PublishedLedger />
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
  if (tab === "overview" || tab === "mlai" || tab === "sidecar" || tab === "federation" || tab === "docs" || tab === "microtos") return null;
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
        "flex items-center justify-between gap-2 rounded-xl text-sm font-medium transition",
        compact ? "h-8 px-2" : "h-9 px-3",
        collapsed && "justify-center px-0",
        light
          ? active
            ? "bg-accent text-accent-fg shadow-xs"
            : "text-muted hover:bg-raised hover:text-fg"
          : active
            ? "bg-accent text-accent-fg shadow-xs"
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
            active ? "bg-white/20 text-white" : "bg-raised text-nav-muted",
          )}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

