import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useAtomValue } from "jotai";
import type { LucideIcon } from "lucide-react";
import {
  Anchor,
  Bot,
  Container,
  Flag,
  Plane,
  Sailboat,
  Snowflake,
  TrainFront,
  Truck,
  Zap,
} from "lucide-react";
import { holdingCall } from "@/lib/minmove/published-week.ts";
import { windowBlocks, windowMarks } from "@/lib/minmove/virtual.ts";
import { useVirtualGantt } from "@/lib/minmove/use-virtual-gantt.ts";
import { clockMinAtom } from "@/lib/minmove/atoms.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";
import { CargoMark, Icon, doorStatus } from "@/components/minmove/icons.tsx";
import { formatWhen } from "@/lib/minmove/seed.ts";
import type { FlowTrace } from "@/lib/minmove/flow.ts";
import {
  buildTimeScale,
  layoutDockBlocks,
  layoutFlowBlocks,
  type DockBlock,
  type FlowBlock,
  type TimeScale,
} from "@/lib/minmove/layout.ts";
import { doorOccupancy, type Occupancy } from "@/lib/minmove/doors.ts";
import type { Appointment, Dock, Truck as TruckT, Yard } from "@/lib/minmove/types.ts";
import {
  resolveTruckVehicleMeta,
  type MultimodalModeId,
} from "@/lib/minmove/vehicle-modes.ts";
import { cn } from "@/lib/utils.ts";

const ROW_H = 66;
const CARD_H = 50;
const CARD_INSET = 8;
const FEATURED_INSET = 5;
const FEATURED_H = ROW_H - FEATURED_INSET * 2;
const STACK_INSET = 22;
const DOOR_COL = "6.2rem";
const EMPTY_FLOW: FlowBlock[] = [];

export function VehicleModeGlyph({
  modeId,
  reefer,
  className,
}: {
  modeId: MultimodalModeId;
  reefer?: boolean;
  className?: string;
}) {
  if (modeId === "ship") return <Anchor className={className} />;
  if (modeId === "barge") return <Sailboat className={className} />;
  if (modeId === "train") return <TrainFront className={className} />;
  if (modeId === "aircraft") return <Plane className={className} />;
  if (modeId === "agv-stacker") return <Bot className={className} />;
  if (modeId === "sts-rtg") return <Container className={className} />;
  if (modeId === "van-drone") return <Zap className={className} />;
  if (reefer) return <Snowflake className={className} />;
  return <Truck className={className} />;
}

interface RowGeom {
  rowH: number;
  cardH: number;
  cardInset: number;
  featuredH: number;
  compact: boolean;
}

const MINUTE_GEOM: RowGeom = { rowH: ROW_H, cardH: CARD_H, cardInset: CARD_INSET, featuredH: FEATURED_H, compact: false };

function geomFor(dockCount: number, hour: boolean): RowGeom {
  if (!hour) return MINUTE_GEOM;
  const rowH = Math.max(22, Math.min(32, Math.floor(420 / Math.max(1, dockCount))));
  const cardH = Math.max(16, rowH - 4);
  return { rowH, cardH, cardInset: Math.floor((rowH - cardH) / 2), featuredH: cardH, compact: true };
}

const GeomContext = createContext<RowGeom>(MINUTE_GEOM);
function useGeom(): RowGeom {
  return useContext(GeomContext);
}

export const Gantt = memo(function Gantt({
  yard,
  live,
  trace,
  eventTruckId,
  etaMin,
  playheadMin,
  selectedId,
  onSelect,
  onForceDock,
  showFlow = false,
}: {
  yard: Yard;
  live: Appointment[];
  trace: FlowTrace;
  eventTruckId?: string;
  etaMin?: number;
  playheadMin?: number;
  selectedId: string;
  onSelect: (id: string) => void;
  onForceDock?: (id: string) => void;
  showFlow?: boolean;
}) {
  const trucks = useMemo(() => new Map(yard.trucks.map((t) => [t.id, t])), [yard.trucks]);
  const orig = useMemo(() => new Map(yard.appointments.map((a) => [a.truckId, a])), [yard.appointments]);
  const hour = yard.timeUnit === "hour";
  const geom = useMemo(() => geomFor(yard.docks.length, hour), [yard.docks.length, hour]);
  const hole = useBoardStore((s) => (hour ? s.result?.certificate?.whyNotGreedy : undefined));
  const scale = useMemo(() => {
    const blocks = live.map((a) => {
      const t = trucks.get(a.truckId);
      return { startMin: a.startMin, endMin: a.startMin + (t?.durationMin ?? 0), dockId: a.dockId };
    });
    const focus: number[] = [];
    if (etaMin != null) focus.push(etaMin);
    const ev = live.find((a) => a.truckId === eventTruckId);
    if (ev) {
      focus.push(ev.startMin);
      const dur = trucks.get(ev.truckId)?.durationMin ?? 0;
      focus.push(ev.startMin + dur);
    }
    if (playheadMin != null) focus.push(playheadMin);
    if (hole && eventTruckId) {
      const dur = trucks.get(eventTruckId)?.durationMin ?? 0;
      focus.push(hole.greedyStartMin, hole.greedyStartMin + dur);
      blocks.push({ startMin: hole.greedyStartMin, endMin: hole.greedyStartMin + dur, dockId: hole.greedyDockId });
    }
    return buildTimeScale(blocks, focus, yard.shiftLenMin, hour ? "hour" : "minute");
  }, [live, etaMin, eventTruckId, playheadMin, yard.shiftLenMin, trucks, hole, hour]);

  const dockBlocks = useMemo(
    () => layoutDockBlocks(yard, live, eventTruckId, scale),
    [yard, live, eventTruckId, scale],
  );
  const dockIndex = useMemo(() => new Map(yard.docks.map((d, i) => [d.id, i])), [yard.docks]);
  const indexed = useMemo(
    () => dockBlocks.map((b) => ({ ...b, dockIndex: dockIndex.get(b.dockId) ?? 0 })),
    [dockBlocks, dockIndex],
  );

  const scrollerRef = useRef<HTMLDivElement>(null);
  const { rows, time } = useVirtualGantt(scrollerRef, yard.docks.length, geom.rowH);
  const selectedDock = yard.appointments.find((a) => a.truckId === selectedId)?.dockId;
  const holeDock = hole?.greedyDockId;
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (hour) {
      const holeIdx = holeDock ? yard.docks.findIndex((d) => d.id === holeDock) : 0;
      const planIdx = selectedDock ? yard.docks.findIndex((d) => d.id === selectedDock) : 0;
      const topIdx = Math.min(holeIdx < 0 ? 0 : holeIdx, planIdx < 0 ? 0 : planIdx);
      const span = Math.abs((planIdx < 0 ? 0 : planIdx) - (holeIdx < 0 ? 0 : holeIdx)) + 1;
      const fits = span * geom.rowH <= el.clientHeight;
      el.scrollTo({ top: fits ? 0 : Math.max(0, topIdx * geom.rowH) });
      return;
    }
    if (!selectedDock) return;
    const idx = yard.docks.findIndex((d) => d.id === selectedDock);
    if (idx < 0) return;
    el.scrollTo({ top: Math.max(0, idx * ROW_H - ROW_H) });
  }, [selectedDock, holeDock, hour, yard.id, yard.docks, geom.rowH]);
  const visBlocks = useMemo(() => windowBlocks(indexed, rows, time), [indexed, rows, time]);
  const visMarks = useMemo(
    () => windowMarks(scale.marks, scale.toPct, time.x0, time.x1),
    [scale.marks, scale.toPct, time.x0, time.x1],
  );
  const visDocks = yard.docks.slice(rows.start, rows.end);
  const flowBlocks = useMemo(
    () => (showFlow ? layoutFlowBlocks(trace, yard.shiftLenMin, eventTruckId, scale) : EMPTY_FLOW),
    [showFlow, trace, eventTruckId, scale, yard.shiftLenMin],
  );

  const [tip, setTip] = useState<string | null>(null);
  const onSelectStable = useCallback((id: string) => onSelect(id), [onSelect]);
  const onForceStable = useCallback((id: string) => onForceDock?.(id), [onForceDock]);
  const onHover = useCallback((e: MouseEvent) => {
    const id = (e.target as HTMLElement).closest("[data-truck]")?.getAttribute("data-truck") ?? null;
    setTip((cur) => (cur === id ? cur : id));
  }, []);

  const tipTruck = tip ? trucks.get(tip) : undefined;
  const tipLive = tip ? live.find((a) => a.truckId === tip) : undefined;
  const tipOrig = tip ? orig.get(tip) : undefined;
  const etaPct = etaMin != null ? scale.toPct(etaMin) : undefined;
  const ghost = eventTruckId ? orig.get(eventTruckId) : undefined;
  const ghostLive = eventTruckId ? live.find((a) => a.truckId === eventTruckId) : undefined;
  const ghostTruck = ghost ? trucks.get(ghost.truckId) : undefined;

  return (
    <GeomContext.Provider value={geom}>
    <div>
      <div
        ref={scrollerRef}
        data-gantt-scroll=""
        data-scale-start={scale.start}
        data-scale-end={scale.end}
        className="max-h-[min(72dvh,42rem)] overflow-auto rounded-2xl bg-surface shadow-card ring-1 ring-line"
        onMouseOver={onHover}
        onMouseLeave={() => setTip(null)}
      >
        <div className="min-w-gantt px-6 py-5">
          <div className="sticky top-0 z-40 mb-2 grid gap-3 bg-surface/95 pb-1 backdrop-blur-sm" style={{ gridTemplateColumns: `${DOOR_COL} 1fr` }}>
            <span className="inline-flex items-end gap-1.5 pb-1 text-xs font-medium text-faint">
              <Icon.calendar className="size-3.5" />
              {yard.timeUnit === "hour" ? "Berth" : "Door"}
            </span>
            <div className="relative h-7">
              <AxisMarks scale={scale} marks={visMarks} shiftStart={yard.shiftStartMin} timeUnit={yard.timeUnit} />
              <PlayheadLayer scale={scale} shiftStart={yard.shiftStartMin} timeUnit={yard.timeUnit} lockedMin={playheadMin} kind="pill" />
            </div>
          </div>
          {showFlow ? (
            <FlowStrip label="Gate" blocks={flowBlocks.filter((b) => b.row === "gate")} marks={visMarks} scale={scale} etaPct={etaPct} selectedId={selectedId} onSelect={onSelectStable} />
          ) : null}
          {showFlow ? (
            <FlowStrip label="Yard" blocks={flowBlocks.filter((b) => b.row === "yard")} marks={visMarks} scale={scale} etaPct={etaPct} selectedId={selectedId} onSelect={onSelectStable} />
          ) : null}
          <div className="relative" style={{ height: yard.docks.length * geom.rowH }}>
            <DoorRail
              docks={visDocks}
              allDocks={yard.docks}
              live={live}
              trucks={trucks}
              shiftLen={yard.shiftLenMin}
              minGap={yard.timeUnit === "hour" ? 2 : 30}
              padTop={rows.padTop}
              start={rows.start}
              onForce={onForceStable}
            />
            <div className="absolute top-0 bottom-0 right-0" style={{ left: DOOR_COL }}>
              <Track
                docks={yard.docks}
                blocks={visBlocks}
                marks={visMarks}
                trucks={trucks}
                scale={scale}
                etaPct={etaPct}
                selectedId={selectedId}
                ghost={ghost}
                ghostLive={ghostLive}
                ghostTruck={ghostTruck}
                shiftStart={yard.shiftStartMin}
                timeUnit={yard.timeUnit}
                onSelect={onSelectStable}
              />
              <PlayheadLayer scale={scale} shiftStart={yard.shiftStartMin} timeUnit={yard.timeUnit} lockedMin={playheadMin} kind="line" />
              <FirstHole scale={scale} docks={yard.docks} trucks={trucks} eventTruckId={eventTruckId} live={live} />
            </div>
          </div>
          {showFlow ? (
            <div className="mt-1">
              <FlowStrip label="Exit" blocks={flowBlocks.filter((b) => b.row === "exit")} marks={visMarks} scale={scale} etaPct={etaPct} selectedId={selectedId} onSelect={onSelectStable} />
            </div>
          ) : null}
        </div>
      </div>
      <LegendRow
        tipTruck={tipTruck}
        tipLive={tipLive}
        tipOrig={tipOrig}
        shiftStart={yard.shiftStartMin}
        timeUnit={yard.timeUnit}
        dense={scale.dense}
        scaleStart={scale.start}
        scaleEnd={scale.end}
      />
    </div>
    </GeomContext.Provider>
  );
});

function FirstHole({
  scale,
  docks,
  trucks,
  eventTruckId,
  live,
}: {
  scale: TimeScale;
  docks: Dock[];
  trucks: Map<string, TruckT>;
  eventTruckId?: string;
  live: Appointment[];
}) {
  const hole = useBoardStore((s) => (s.yard.timeUnit === "hour" ? s.result?.certificate?.whyNotGreedy : undefined));
  const yard = useBoardStore((s) => s.yard);
  const geom = useGeom();
  if (!hole || !eventTruckId) return null;
  const truck = trucks.get(eventTruckId);
  const chosen = live.find((a) => a.truckId === eventTruckId);
  if (!truck || !chosen) return null;
  if (hole.greedyDockId === chosen.dockId && hole.greedyStartMin === chosen.startMin) return null;
  const leftIndex = docks.findIndex((d) => d.id === hole.greedyDockId);
  const span = truck.span ?? 1;
  if (leftIndex < 0 || span < 1) return null;
  const holder = holdingCall(yard, hole.greedyDockId, hole.greedyStartMin, span);
  const left = scale.toPct(hole.greedyStartMin);
  const width = Math.max(0.8, scale.toPct(hole.greedyStartMin + truck.durationMin) - left);
  return (
    <>
      {Array.from({ length: span }, (_, i) => {
        const dock = docks[leftIndex + i];
        if (!dock) return null;
        return (
          <span
            key={dock.id}
            data-first-hole={i === 0 ? hole.greedyStartMin : undefined}
            data-first-dock={i === 0 ? hole.greedyDockId : undefined}
            data-after={i === 0 ? (holder ?? "") : undefined}
            className="pointer-events-none absolute z-20 rounded-md ring-1 ring-dashed ring-bad/70"
            style={{ top: (leftIndex + i) * geom.rowH + geom.cardInset, height: geom.cardH, left: `${left}%`, width: `${width}%` }}
          >
            {i === 0 ? (
              <span className="absolute inset-x-1 top-0 truncate font-mono text-[10px] leading-none text-bad">
                {hole.greedyStartMin}h{holder ? ` · ${holder}` : ""}
              </span>
            ) : null}
          </span>
        );
      })}
    </>
  );
}

const AxisMarks = memo(function AxisMarks({
  scale,
  marks,
  shiftStart,
  timeUnit,
}: {
  scale: TimeScale;
  marks: number[];
  shiftStart: number;
  timeUnit?: "minute" | "hour";
}) {
  const first = scale.marks[0];
  const last = scale.marks[scale.marks.length - 1];
  return (
    <>
      {marks.map((h) => {
        const left = scale.toPct(h);
        return (
          <span
            key={h}
            className="absolute font-mono text-[11px] tabular-nums text-faint"
            style={{
              left: `${left}%`,
              transform: h === first ? "none" : h === last ? "translateX(-100%)" : "translateX(-50%)",
            }}
          >
            {formatWhen({ shiftStartMin: shiftStart, timeUnit }, h)}
          </span>
        );
      })}
    </>
  );
});

const PlayheadLayer = memo(function PlayheadLayer({
  scale,
  shiftStart,
  timeUnit,
  lockedMin,
  kind,
}: {
  scale: TimeScale;
  shiftStart: number;
  timeUnit?: "minute" | "hour";
  lockedMin?: number;
  kind: "pill" | "line";
}) {
  const clock = useAtomValue(clockMinAtom);
  const head = lockedMin ?? clock;
  const pct = scale.toPct(head);
  if (kind === "pill") {
    return (
      <span className="pointer-events-none absolute inset-x-0 top-0 h-7">
        <span className="absolute top-0 left-0 w-full" style={{ transform: `translate3d(${pct}%,0,0)` }}>
          <span className="absolute -translate-x-1/2 rounded-full bg-accent px-2.5 py-1 font-mono text-xs font-medium leading-none text-accent-fg">
            {formatWhen({ shiftStartMin: shiftStart, timeUnit }, Math.round(head))}
          </span>
        </span>
      </span>
    );
  }
  return (
    <span className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <span className="absolute top-0 bottom-0 left-0 w-full" style={{ transform: `translate3d(${pct}%,0,0)` }}>
        <span className="absolute top-0 bottom-0 left-0 w-px bg-accent" />
      </span>
    </span>
  );
});

const DoorRail = memo(function DoorRail({
  docks,
  allDocks,
  live,
  trucks,
  shiftLen,
  minGap,
  padTop,
  start,
  onForce,
}: {
  docks: Dock[];
  allDocks: Dock[];
  live: Appointment[];
  trucks: Map<string, TruckT>;
  shiftLen: number;
  minGap: number;
  padTop: number;
  start: number;
  onForce: (id: string) => void;
}) {
  const clock = useAtomValue(clockMinAtom);
  const occNow = Math.round(clock);
  const geom = useGeom();
  return (
    <div className="absolute top-0 bottom-0 left-0" style={{ width: DOOR_COL }}>
      <div style={{ height: padTop }} />
      {docks.map((dock, i) => {
        const idx = start + i;
        return (
          <DoorStatus
            key={dock.id}
            dock={dock}
            occupancy={doorOccupancy(dock.id, live, trucks, occNow, shiftLen, allDocks, minGap)}
            last={idx === allDocks.length - 1}
            onForce={onForce}
            rowH={geom.rowH}
            compact={geom.compact}
          />
        );
      })}
    </div>
  );
});

const HourGrid = memo(function HourGrid({ marks, toPct }: { marks: number[]; toPct: (n: number) => number }) {
  return (
    <>
      {marks.map((h) => (
        <span key={h} className="absolute top-0 bottom-0 w-px bg-line/45" style={{ left: `${toPct(h)}%` }} />
      ))}
    </>
  );
});

const Track = memo(function Track({
  docks,
  blocks,
  marks,
  trucks,
  scale,
  etaPct,
  selectedId,
  ghost,
  ghostLive,
  ghostTruck,
  shiftStart,
  timeUnit,
  onSelect,
}: {
  docks: Dock[];
  blocks: Array<DockBlock & { dockIndex: number }>;
  marks: number[];
  trucks: Map<string, TruckT>;
  scale: TimeScale;
  etaPct?: number;
  selectedId: string;
  ghost?: Appointment;
  ghostLive?: Appointment;
  ghostTruck?: TruckT;
  shiftStart: number;
  timeUnit?: "minute" | "hour";
  onSelect: (id: string) => void;
}) {
  const geom = useGeom();
  const showGhost = Boolean(
    ghost && ghostLive && ghostTruck && (ghost.dockId !== ghostLive.dockId || ghost.startMin !== ghostLive.startMin),
  );
  const ghostIndex = showGhost && ghost ? docks.findIndex((d) => d.id === ghost.dockId) : -1;
  return (
    <div className="absolute inset-0 [contain:layout_style]">
      <HourGrid marks={marks} toPct={scale.toPct} />
      {etaPct != null ? (
        <span className="pointer-events-none absolute top-0 bottom-0 z-20 w-px border-l border-dashed border-accent/40" style={{ left: `${etaPct}%` }} />
      ) : null}
      {docks.map((dock, i) =>
        i < docks.length - 1 ? (
          <span key={dock.id} className="absolute inset-x-0 h-px bg-line/80" style={{ top: (i + 1) * geom.rowH }} />
        ) : null,
      )}
      {showGhost && ghost && ghostLive && ghostTruck && ghostIndex >= 0 ? (
        <span
          className="pointer-events-none absolute z-10 flex items-center justify-center overflow-hidden rounded-xl bg-warn/[0.06] px-2 ring-1 ring-dashed ring-warn/60"
          style={{
            top: ghostIndex * geom.rowH + geom.cardInset,
            height: geom.cardH,
            left: `${scale.toPct(ghost.startMin)}%`,
            width: `${Math.max(0, scale.toPct(ghost.startMin + ghostTruck.durationMin) - scale.toPct(ghost.startMin))}%`,
          }}
        >
          {!geom.compact ? (
            <span className="truncate font-mono text-[10px] font-semibold text-warn">
              Booked {ghost.dockId} → {ghostLive.dockId}
            </span>
          ) : null}
        </span>
      ) : null}
      {blocks.map((b) => {
        const t = trucks.get(b.truckId);
        if (!t) return null;
        return (
          <ApptCard
            key={`${b.truckId}-${b.dockId}`}
            block={b}
            truck={t}
            start={formatWhen({ shiftStartMin: shiftStart, timeUnit }, b.startMin)}
            featured={b.isEvent}
            selected={b.truckId === selectedId}
            top={b.dockIndex * geom.rowH}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
});

const DoorStatus = memo(function DoorStatus({
  dock,
  occupancy,
  last,
  onForce,
  rowH,
  compact,
}: {
  dock: Dock;
  occupancy: Occupancy;
  last: boolean;
  onForce: (id: string) => void;
  rowH: number;
  compact: boolean;
}) {
  const { icon: StatusIcon, label, tone } = doorStatus(occupancy, dock);
  const forced = useBoardStore((s) => s.forceDock === dock.id);
  const index = dock.short.replace(/^D|^B/, "");
  const equipLabel = dock.equipment.includes("reefer_plug")
    ? "Lạnh -25°C"
    : dock.equipment.includes("crane")
      ? "Cẩu 45T"
      : "Xe nâng";
  return (
    <button
      type="button"
      onClick={() => onForce(dock.id)}
      title={`Click to pin/unpin ${dock.label}`}
      className={cn(
        "flex w-full flex-col items-start justify-center px-1.5 text-left transition hover:bg-raised/60",
        !last && "border-b border-line/80",
        forced && "bg-accent/10 ring-1 ring-inset ring-accent/40",
      )}
      style={{ height: rowH }}
    >
      <span className="flex w-full items-center justify-between">
        <span
          className={cn(
            "font-mono font-bold tabular-nums leading-none tracking-tight",
            compact ? "text-[11px]" : "text-base text-fg",
            forced && "text-accent",
          )}
        >
          {compact ? index : `D${index}`}
        </span>
        {forced ? (
          <span className="rounded bg-accent px-1 py-0.5 font-mono text-[9px] font-bold text-accent-fg">
            PIN
          </span>
        ) : !compact ? (
          <span className="rounded bg-raised px-1 py-0.5 font-mono text-[9px] font-semibold text-muted ring-1 ring-line">
            {equipLabel}
          </span>
        ) : null}
      </span>
      {compact ? null : (
        <span className={cn("mt-1 inline-flex items-center gap-1 text-[11px] font-medium", tone)}>
          <StatusIcon className="size-3" strokeWidth={2} />
          {label}
        </span>
      )}
    </button>
  );
});

const ApptCard = memo(function ApptCard({
  block,
  truck,
  start,
  featured,
  selected,
  top,
  onSelect,
}: {
  block: DockBlock;
  truck: TruckT;
  start: string;
  featured: boolean;
  selected: boolean;
  top: number;
  onSelect: (id: string) => void;
}) {
  const geom = useGeom();
  const timeUnit = useBoardStore((s) => s.yard.timeUnit);
  const treatReefer = useBoardStore(
    (s) => s.event?.truckId === block.truckId && s.event?.cargoOverride === "reefer",
  );
  const filter = useBoardStore((s) => s.ganttFilter);
  const vehicleModeFilter = useBoardStore((s) => s.vehicleModeFilter);
  const truckModeOverrides = useBoardStore((s) => s.truckModeOverrides);
  const reefer = truck.cargo === "reefer" || Boolean(treatReefer);
  const meta = resolveTruckVehicleMeta(
    truck,
    { timeUnit },
    truckModeOverrides,
    treatReefer,
  );
  const stacked = block.stack > 0;
  const inset = geom.compact
    ? geom.cardInset
    : stacked
      ? STACK_INSET
      : featured
        ? FEATURED_INSET
        : CARD_INSET;
  const height = geom.compact ? geom.cardH : featured && !stacked ? FEATURED_H : CARD_H;

  const matchesStatus =
    filter === "all" ||
    (filter === "late" && featured) ||
    (filter === "moved" && (block.changed || featured)) ||
    (filter === "reefer" && reefer) ||
    (filter === "dry" && !reefer) ||
    (filter === "priority" && truck.priority === 1);

  const matchesVehicleMode =
    vehicleModeFilter === "all" || meta.mode.id === vehicleModeFilter;

  const matchesFilter = matchesStatus && matchesVehicleMode;

  return (
    <button
      type="button"
      data-truck={block.truckId}
      data-vehicle-mode={meta.mode.id}
      data-vehicle-badge={meta.shortBadgeVi}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.truckId);
      }}
      className={cn(
        "absolute z-10 text-left transition-all [contain:layout]",
        geom.compact ? "" : "[content-visibility:auto]",
        geom.compact ? "rounded-[5px] px-1.5" : "rounded-xl border-l-[3px] px-2 py-1.5",
        featured
          ? "z-30 overflow-hidden bg-accent text-accent-fg shadow-float ring-1 ring-accent"
          : "overflow-hidden bg-surface shadow-2xs ring-1 ring-line hover:ring-accent/60",
        !geom.compact && featured && "border-l-white/70",
        !geom.compact && !featured && reefer && "border-l-accent bg-accent/[0.04] ring-accent/25",
        !geom.compact && !featured && !reefer && "border-l-ok",
        !featured && block.changed && "bg-ok/10 ring-ok/35",
        selected && !featured && "ring-2 ring-accent",
        vehicleModeFilter !== "all" && matchesVehicleMode && !featured && "ring-2 ring-accent",
        !matchesFilter && "opacity-25",
      )}
      style={{ left: `${block.left}%`, width: `${block.width}%`, top: top + inset, height }}
    >
      <span className="pointer-events-none flex h-full flex-col justify-between">
        <span className="flex items-center justify-between gap-1">
          <span className="flex min-w-0 items-center gap-1">
            <span
              className={cn(
                "inline-flex shrink-0 items-center justify-center rounded",
                geom.compact ? "size-3" : "size-4",
                featured
                  ? "bg-white/25 text-white"
                  : meta.mode.chipBg,
              )}
            >
              <VehicleModeGlyph
                modeId={meta.mode.id}
                reefer={reefer}
                className={geom.compact ? "size-2.5" : "size-3"}
              />
            </span>
            <span
              className={cn(
                "truncate font-mono font-bold leading-none tracking-tight",
                geom.compact ? "text-[10px]" : "text-[11px]",
              )}
            >
              {truck.plate}
            </span>
          </span>

          {!geom.compact && !stacked && block.width >= 15 ? (
            <span
              className={cn(
                "hidden shrink-0 items-center gap-0.5 font-mono text-[9px] font-semibold xl:inline-flex",
                featured ? "text-white" : "text-ok",
              )}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {featured ? "k=0" : "SLA"}
            </span>
          ) : null}
        </span>

        {geom.compact ? null : (
          <span className="flex items-center justify-between gap-1">
            <span
              className={cn(
                "flex items-center gap-1 font-mono text-[10px] leading-none",
                featured ? "text-accent-fg/90" : "text-muted",
              )}
            >
              <span>{start}</span>
              <CargoMark cargo={truck.cargo} featured={featured} className="size-2.5" />
            </span>

            {!stacked || featured ? (
              <span
                className={cn(
                  "shrink-0 rounded px-1.5 py-0.5 font-sans text-[9px] font-bold leading-none",
                  featured
                    ? "bg-white/25 text-white"
                    : meta.mode.chipBg,
                )}
              >
                {meta.shortBadgeVi}
                {featured ? " · k=0" : ""}
              </span>
            ) : null}
          </span>
        )}
      </span>
    </button>
  );
});

const LegendRow = memo(function LegendRow({
  tipTruck,
  tipLive,
  tipOrig,
  shiftStart,
  timeUnit,
  dense,
  scaleStart,
  scaleEnd,
}: {
  tipTruck?: TruckT;
  tipLive?: Appointment;
  tipOrig?: Appointment;
  shiftStart: number;
  timeUnit?: "minute" | "hour";
  dense: boolean;
  scaleStart: number;
  scaleEnd: number;
}) {
  const filter = useBoardStore((s) => s.ganttFilter);
  const setFilter = useBoardStore((s) => s.setGanttFilter);
  const vehicleModeFilter = useBoardStore((s) => s.vehicleModeFilter);
  const setVehicleModeFilter = useBoardStore((s) => s.setVehicleModeFilter);
  const truckModeOverrides = useBoardStore((s) => s.truckModeOverrides);

  if (tipTruck && tipLive) {
    const tipMeta = resolveTruckVehicleMeta(tipTruck, { timeUnit }, truckModeOverrides);
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <p className="inline-flex items-center gap-1.5 font-mono tabular-nums text-fg">
          <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-sans text-[10px] font-bold", tipMeta.mode.chipBg)}>
            <VehicleModeGlyph modeId={tipMeta.mode.id} reefer={tipTruck.cargo === "reefer"} className="size-3" />
            {tipMeta.shortBadgeVi}
          </span>
          <span className="font-bold">{tipTruck.plate}</span>
          <span className="mx-1 text-muted">· {tipTruck.hauler} · {tipMeta.driverName}</span>
          {formatWhen({ shiftStartMin: shiftStart, timeUnit }, tipLive.startMin)}–{formatWhen({ shiftStartMin: shiftStart, timeUnit }, tipLive.startMin + tipTruck.durationMin)}
          {tipOrig && tipOrig.dockId !== tipLive.dockId ? <span className="ml-2 text-warn">was {tipOrig.dockId.replace("D", "")}</span> : null}
        </p>
      </div>
    );
  }
  return (
    <div className="mt-3 space-y-2 text-xs text-muted">
      <div className="flex flex-wrap items-center gap-1.5">
        <Legend icon={Icon.late} label="Late" className="text-bad" active={filter === "late"} onClick={() => setFilter("late")} />
        <Legend icon={Icon.moved} label="Moved" className="text-warn" active={filter === "moved"} onClick={() => setFilter("moved")} />
        <Legend icon={Icon.reefer} label="Reefer" className="text-accent" active={filter === "reefer"} onClick={() => setFilter("reefer")} />
        <Legend icon={Icon.dry} label="Dry" className="text-ok" active={filter === "dry"} onClick={() => setFilter("dry")} />
        <Legend icon={Icon.other} label="Other" className="text-accent" active={filter === "all" && vehicleModeFilter === "all"} onClick={() => setFilter("all")} />
        <Legend icon={Flag} label="Priority" active={filter === "priority"} onClick={() => setFilter("priority")} />

        <span className="mx-1 h-4 w-px bg-line" />

        {/* Quick Multi-Modal Vehicle Type Filter Pills on Gantt Board */}
        {[
          { id: "reefer-truck" as const, label: "Đầu kéo / Lạnh", icon: Truck },
          { id: "barge" as const, label: "Sà lan", icon: Sailboat },
          { id: "train" as const, label: "Tàu hỏa", icon: TrainFront },
          { id: "aircraft" as const, label: "Air Cargo", icon: Plane },
          { id: "agv-stacker" as const, label: "AGV Bãi", icon: Bot },
          { id: "sts-rtg" as const, label: "Cẩu RTG", icon: Container },
          { id: "van-drone" as const, label: "EV Van", icon: Zap },
          { id: "ship" as const, label: "Tàu biển", icon: Anchor },
        ].map((v) => {
          const VIcon = v.icon;
          const isActive = vehicleModeFilter === v.id;
          return (
            <button
              key={v.id}
              type="button"
              data-filter-vehicle={v.id}
              onClick={() => setVehicleModeFilter(v.id)}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition",
                isActive
                  ? "bg-accent text-white shadow-2xs ring-1 ring-accent"
                  : "bg-surface text-muted ring-1 ring-line hover:bg-raised hover:text-fg",
              )}
            >
              <VIcon className="size-3" />
              {v.label}
            </button>
          );
        })}

        <LegendStats />
        {dense ? (
          <span className="ml-auto text-faint">
            Zoomed {formatWhen({ shiftStartMin: shiftStart, timeUnit }, scaleStart)}–{formatWhen({ shiftStartMin: shiftStart, timeUnit }, scaleEnd)}
          </span>
        ) : null}
      </div>
    </div>
  );
});

function LegendStats() {
  const result = useBoardStore((s) => s.result);
  const hour = useBoardStore((s) => s.yard.timeUnit === "hour");
  if (!result || result.status !== "OPTIMAL") return null;
  return (
    <span className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full bg-surface px-3 font-mono text-xs text-ok shadow-border">
      Wait {result.metrics.eventWaitMin}
      {hour ? "h" : " min"} · k={result.kUsed} · {result.ms}ms
    </span>
  );
}

function Legend({
  icon: Glyph,
  label,
  className,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition",
        active ? "bg-accent/10 text-accent ring-1 ring-accent" : "bg-surface text-fg shadow-border hover:bg-raised",
      )}
    >
      <Glyph className={cn("size-3.5", className)} strokeWidth={1.9} />
      {label}
    </button>
  );
}

const FlowStrip = memo(function FlowStrip({
  label,
  blocks,
  marks,
  scale,
  etaPct,
  selectedId,
  onSelect,
}: {
  label: string;
  blocks: FlowBlock[];
  marks: number[];
  scale: TimeScale;
  etaPct?: number;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const lanes = Math.max(1, ...blocks.map((b) => b.lanes), 0);
  return (
    <div className="mb-1 grid items-stretch gap-3" style={{ gridTemplateColumns: `${DOOR_COL} 1fr` }}>
      <span className="self-center text-xs text-faint">{label}</span>
      <div className="relative [contain:layout]" style={{ height: `${12 + lanes * 16}px` }}>
        <HourGrid marks={marks} toPct={scale.toPct} />
        {etaPct != null ? (
          <span className="pointer-events-none absolute top-0 bottom-0 w-px border-l border-dashed border-accent/40" style={{ left: `${etaPct}%` }} />
        ) : null}
        <PlayheadLayer scale={scale} shiftStart={0} kind="line" />
        {blocks.map((b) => (
          <button
            key={`${b.row}-${b.truckId}`}
            type="button"
            data-truck={b.truckId}
            onClick={() => onSelect(b.truckId)}
            className={cn(
              "absolute overflow-hidden rounded-sm px-1 text-left font-mono text-[10px] tabular-nums",
              b.isEvent ? "bg-accent text-accent-fg" : "bg-surface text-muted ring-1 ring-line",
              b.truckId === selectedId && "ring-2 ring-accent",
            )}
            style={{ left: `${b.left}%`, width: `${b.width}%`, top: `${4 + b.lane * 16}px`, height: "14px" }}
          >
            {b.truckId}
          </button>
        ))}
      </div>
    </div>
  );
});
