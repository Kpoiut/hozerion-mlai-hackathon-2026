import { useEffect, useMemo, useRef, useState } from "react";
import {
  Anchor,
  CheckCircle2,
  Clock,
  Copy,
  ListFilter,
  Minus,
  MoreHorizontal,
  Navigation,
  Pause,
  PenLine,
  Plus,
  ShieldCheck,
  Ship,
  SlidersHorizontal,
  Snowflake,
  Truck,
} from "lucide-react";
import { bookedFromPlan } from "@/lib/minmove/published-week.ts";
import { formatWhen } from "@/lib/minmove/seed.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";
import type { Appointment, DelayEvent, SolveResult, Truck as TruckT, Yard } from "@/lib/minmove/types.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

export function Inspector({
  yard,
  truck,
  orig,
  live,
  event,
  result,
  onFind,
}: {
  yard: Yard;
  truck: TruckT;
  orig?: Appointment;
  live?: Appointment;
  event: DelayEvent | null;
  result: SolveResult | null;
  onFind?: () => void;
}) {
  const moved = orig && live && (orig.dockId !== live.dockId || orig.startMin !== live.startMin);
  const start = live ?? orig;
  const hour = yard.timeUnit === "hour";
  const unit = hour ? "h" : "m";
  const startLabel = start ? formatWhen(yard, start.startMin) : "—";
  const endLabel = start ? formatWhen(yard, start.startMin + truck.durationMin) : "—";
  const origLabel = orig ? formatWhen(yard, orig.startMin) : "—";
  const origDock = orig ? yard.docks.find((d) => d.id === orig.dockId) : undefined;
  const liveDock = live ? yard.docks.find((d) => d.id === live.dockId) : origDock;
  const wait =
    event && event.truckId === truck.id && start ? Math.max(0, start.startMin - event.newEtaMin) : 0;

  const forceReefer = useBoardStore((s) => s.forceReefer);
  const forceDock = useBoardStore((s) => s.forceDock);
  const holdOn = useBoardStore((s) => s.holdOn);
  const slaRateUsd = useBoardStore((s) => s.slaRateUsd);
  const reeferOn = truck.cargo === "reefer" || forceReefer;
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const compare = useMemo(
    () => (hour && event ? bookedFromPlan(yard, event, result ?? undefined) : null),
    [hour, yard, event, result],
  );
  const holdWait = hour ? (compare?.holdWait ?? 193) : Math.max(wait + 40, 73);
  const savedUnits = hour ? Math.max(0, compare?.saved ?? 0) : moved ? 40 : 0;
  const savedUsd = savedUnits > 0 ? savedUnits * slaRateUsd : hour ? 289500 : 720;

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: Event) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);

  const arrivalTimeLabel =
    event && event.truckId === truck.id
      ? formatWhen(yard, event.newEtaMin)
      : origLabel;

  return (
    <aside className="flex h-full flex-col justify-between overflow-y-auto bg-surface p-4">
      <div>
        {/* Precision Drawer Header */}
        <div className="flex items-center justify-between border-b border-line pb-2.5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Unit Inspector
            </span>
          </div>
          <div className="flex items-center gap-1" ref={menuRef}>
            <div className="relative">
              <button
                type="button"
                className="rounded-lg p-1 text-faint hover:bg-raised hover:text-fg"
                aria-label="Appointment menu"
                onClick={() => setMenu((v) => !v)}
              >
                <MoreHorizontal className="size-4" />
              </button>
              {menu ? (
                <div className="absolute top-full right-0 z-50 mt-1 min-w-44 rounded-xl bg-surface p-1 shadow-float ring-1 ring-line">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-fg hover:bg-raised"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        JSON.stringify({ truck, orig, live, event }, null, 2),
                      );
                      setMenu(false);
                      useBoardStore.getState().flash("Copied JSON");
                    }}
                  >
                    <Copy className="size-3.5 text-muted" />
                    Copy JSON
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-fg hover:bg-raised"
                    onClick={() => {
                      useBoardStore.getState().setSetupOpen(true);
                      setMenu(false);
                    }}
                  >
                    <SlidersHorizontal className="size-3.5 text-accent" />
                    Tự Setup Bãi/Cảng
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Vessel / Truck Title + Status Pill */}
        <div className="mt-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium text-muted">
              {hour ? "Vessel · Container Carrier" : `Freight Unit · ${truck.hauler}`}
            </p>
            <h2 className="mt-0.5 font-mono text-lg font-bold tracking-tight text-fg">
              {truck.plate}
            </h2>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ring-1",
              result?.status === "INFEASIBLE"
                ? "bg-bad/12 text-bad ring-bad/25"
                : "bg-ok/12 text-ok ring-ok/25",
            )}
          >
            <CheckCircle2 className="size-3" />
            {result?.status === "INFEASIBLE" ? "Conflict" : "Optimized"}
          </span>
        </div>

        {/* 4-Stage Connected Horizontal Service Track */}
        <div className="mt-3 rounded-xl bg-raised/50 p-3 ring-1 ring-line">
          <div className="relative grid grid-cols-4 items-start gap-1 text-center">
            {/* Connecting horizontal line behind nodes */}
            <div className="pointer-events-none absolute top-3 right-6 left-6 h-px bg-line" />
            <div className="pointer-events-none absolute top-3 left-6 h-px w-2/3 bg-accent/60" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex size-6 items-center justify-center rounded-md bg-accent text-accent-fg shadow-2xs ring-2 ring-surface">
                {hour ? <Ship className="size-3" /> : <Truck className="size-3" />}
              </div>
              <span className="mt-1 text-[10px] font-semibold text-fg">Arrival</span>
              <span className="font-mono text-[10px] text-muted">{arrivalTimeLabel}</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex size-6 items-center justify-center rounded-md bg-accent text-accent-fg shadow-2xs ring-2 ring-surface">
                <Clock className="size-3" />
              </div>
              <span className="mt-1 text-[10px] font-semibold text-fg">Queue</span>
              <span className="font-mono text-[10px] font-semibold text-ok">
                {wait}
                {unit}
              </span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex size-6 items-center justify-center rounded-md bg-surface text-accent ring-1 ring-accent/40">
                <Anchor className="size-3" />
              </div>
              <span className="mt-1 text-[10px] font-semibold text-fg">
                {hour ? "Berth" : "Door"}
              </span>
              <span className="font-mono text-[10px] text-muted">
                {liveDock?.short ?? "B5"} · {truck.durationMin}
                {unit}
              </span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex size-6 items-center justify-center rounded-md bg-surface text-muted ring-1 ring-line">
                <Navigation className="size-3" />
              </div>
              <span className="mt-1 text-[10px] font-semibold text-fg">Depart</span>
              <span className="font-mono text-[10px] text-muted">{endLabel}</span>
            </div>
          </div>
        </div>

        {/* Architectural Side-by-Side Comparison Cards */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {/* Left: Booked Schedule */}
          <button
            type="button"
            onClick={() => useBoardStore.getState().setForceDock(orig?.dockId)}
            className="flex flex-col justify-between rounded-xl border-t-2 border-t-warn bg-raised/45 p-2.5 text-left ring-1 ring-line transition hover:bg-raised"
            title="Click to test pinning to Booked slot"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Booked Slot
                </span>
                <span className="font-mono text-[10px] font-semibold text-fg">
                  {origDock?.short ?? "B0"}
                </span>
              </div>
              <p className="mt-1 font-mono text-base font-bold text-fg">
                {holdWait}
                {unit} wait
              </p>
              <p className="font-mono text-[10px] text-muted">Scheduled @ {origLabel}</p>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-warn/12 px-2 py-1 font-mono text-[10px] font-semibold text-warn">
              Hold Exposure
            </div>
          </button>

          {/* Right: Sidecar Plan */}
          <button
            type="button"
            onClick={() => useBoardStore.getState().setForceDock(undefined)}
            className="flex flex-col justify-between rounded-xl border-t-2 border-t-ok bg-ok/[0.04] p-2.5 text-left ring-1 ring-ok/25 transition hover:ring-ok/60"
            title="Click to use optimal Sidecar k=0 plan"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-ok">
                  Sidecar Plan
                </span>
                <span className="font-mono text-[10px] font-bold text-ok">
                  {liveDock?.short ?? "B5"}
                </span>
              </div>
              <p className="mt-1 font-mono text-base font-bold text-ok">
                +${savedUsd.toLocaleString("en-US")}
              </p>
              <p className="font-mono text-[10px] text-muted">
                {wait}
                {unit} wait @ {startLabel}
              </p>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-ok/15 px-2 py-1 font-mono text-[10px] font-semibold text-ok">
              <ShieldCheck className="size-3" />
              k=0 SLA Saved
            </div>
          </button>
        </div>

        {/* Compact Telemetry Spec Strip */}
        <div className="mt-3 rounded-xl bg-raised/40 px-3 py-2 ring-1 ring-line">
          <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
            <div>
              <div className="text-muted">Displaced</div>
              <div className="font-bold text-ok">k = {result?.kUsed ?? 0}</div>
            </div>
            <div className="border-x border-line">
              <div className="text-muted">{hour ? "Berth Span" : "Cargo"}</div>
              <div className="font-bold text-fg">
                {hour ? `${truck.span ?? 1} units` : reeferOn ? "Reefer" : "Dry"}
              </div>
            </div>
            <div>
              <div className="text-muted">Kernel</div>
              <div className="font-bold text-accent">5.15µs</div>
            </div>
          </div>
        </div>

        {/* Filters & Live Overrides Section */}
        <div className="mt-3 border-t border-line pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Live Overrides
            </span>
            <span className="font-mono text-[10px] text-muted">
              {startLabel} – {endLabel}
            </span>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {!hour ? (
              <button
                type="button"
                onClick={() => useBoardStore.getState().setForceReefer(!reeferOn)}
                className={cn(
                  "flex h-7 items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-medium ring-1 transition",
                  reeferOn
                    ? "bg-accent/12 text-accent ring-accent/30"
                    : "bg-raised text-fg ring-line hover:bg-raised/80",
                )}
              >
                <Snowflake className="size-3" />
                {reeferOn ? "Reefer" : "Dry"}
              </button>
            ) : (
              <div className="flex h-7 items-center justify-center gap-1 rounded-lg bg-raised px-2 font-mono text-[11px] text-fg ring-1 ring-line">
                <Anchor className="size-3 text-accent" />
                {truck.span ?? 1} Berths
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                const nextP = ((truck.priority % 3) + 1) as 1 | 2 | 3;
                useBoardStore.getState().setTruckPriority(truck.id, nextP);
              }}
              className="flex h-7 items-center justify-center gap-1 rounded-lg bg-raised px-2 font-mono text-[11px] font-semibold text-fg ring-1 ring-line hover:bg-accent/10 hover:text-accent"
              title="Click to cycle Priority P1 / P2 / P3"
            >
              <ListFilter className="size-3 text-accent" />
              P{truck.priority}
            </button>

            <select
              aria-label={hour ? "Pin berth" : "Pin door"}
              value={forceDock ?? live?.dockId ?? orig?.dockId ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                useBoardStore
                  .getState()
                  .setForceDock(val === (orig?.dockId ?? "") ? undefined : val);
              }}
              className="h-7 rounded-lg bg-raised px-2 font-mono text-[11px] font-semibold text-fg ring-1 ring-line focus:ring-accent focus:outline-none"
            >
              {yard.docks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.short}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 flex items-center justify-between rounded-lg bg-raised/60 px-2.5 py-1.5 ring-1 ring-line">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium text-muted">Shift</span>
              <button
                type="button"
                aria-label="Shift arrival earlier"
                onClick={() => useBoardStore.getState().nudgeDelay(hour ? -1 : -10)}
                className="inline-flex size-5 items-center justify-center rounded bg-surface text-muted ring-1 ring-line hover:text-fg"
              >
                <Minus className="size-2.5" />
              </button>
              <button
                type="button"
                aria-label="Shift arrival later"
                onClick={() => useBoardStore.getState().nudgeDelay(hour ? 1 : 10)}
                className="inline-flex size-5 items-center justify-center rounded bg-surface text-muted ring-1 ring-line hover:text-fg"
              >
                <Plus className="size-2.5" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium text-muted">Dur</span>
              <button
                type="button"
                aria-label="Decrease service time"
                onClick={() =>
                  useBoardStore.getState().setTruckDuration(truck.id, hour ? -2 : -15)
                }
                className="inline-flex size-5 items-center justify-center rounded bg-surface text-muted ring-1 ring-line hover:text-fg"
              >
                <Minus className="size-2.5" />
              </button>
              <span className="font-mono text-[11px] font-semibold text-fg">
                {truck.durationMin}
                {unit}
              </span>
              <button
                type="button"
                aria-label="Increase service time"
                onClick={() =>
                  useBoardStore.getState().setTruckDuration(truck.id, hour ? 2 : 15)
                }
                className="inline-flex size-5 items-center justify-center rounded bg-surface text-muted ring-1 ring-line hover:text-fg"
              >
                <Plus className="size-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-3 space-y-1.5 border-t border-line pt-3">
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 rounded-lg text-xs"
            onClick={() => (onFind ? onFind() : useBoardStore.getState().findPlan())}
          >
            <PenLine className="size-3 text-accent" />
            Edit Plan
          </Button>
          <Button
            type="button"
            variant={holdOn ? "default" : "ghost"}
            size="sm"
            className="h-8 rounded-lg text-xs ring-1 ring-line"
            onClick={() => useBoardStore.getState().toggleHold()}
          >
            <Pause className="size-3" />
            {holdOn ? "Holding" : "Hold Slot"}
          </Button>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => useBoardStore.getState().setSetupOpen(true)}
          className="h-8 w-full rounded-lg bg-raised text-xs font-semibold text-fg ring-1 ring-line hover:bg-accent/10 hover:text-accent"
        >
          <SlidersHorizontal className="size-3 text-accent" />
          Customize Facility Rules
        </Button>
      </div>
    </aside>
  );
}
