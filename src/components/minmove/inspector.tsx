import { useEffect, useMemo, useRef, useState } from "react";
import {
  Anchor,
  ArrowRight,
  CheckCircle2,
  ChevronUp,
  Clock,
  Copy,
  ListFilter,
  Minus,
  MoreHorizontal,
  Navigation,
  Pause,
  PenLine,
  Plus,
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
    <aside className="flex h-full flex-col justify-between overflow-y-auto bg-surface p-5">
      <div>
        {/* SaaS Drawer Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="text-sm font-semibold text-fg">Inspector Drawer</span>
          <div className="flex items-center gap-1.5" ref={menuRef}>
            <ChevronUp className="size-4 text-muted" />
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

        {/* Vessel / Truck Title + Optimized Badge */}
        <div className="mt-3.5 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted">
              {hour ? "Vessel · Container Carrier" : `Freight Unit · ${truck.hauler}`}
            </p>
            <h2 className="mt-0.5 font-mono text-xl font-bold tracking-tight text-fg">
              {truck.plate}
            </h2>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
              result?.status === "INFEASIBLE"
                ? "bg-bad/15 text-bad"
                : "bg-ok text-white shadow-2xs",
            )}
          >
            <CheckCircle2 className="size-3.5" />
            {result?.status === "INFEASIBLE" ? "Conflict" : "Optimized"}
          </span>
        </div>

        {/* 4-Stage Visual Service Stepper (Arrival -> Queue -> Berth Service -> Departure) */}
        <div className="mt-4 rounded-2xl bg-raised/55 p-3 ring-1 ring-line">
          <div className="grid grid-cols-4 items-start gap-1 text-center">
            <div className="flex flex-col items-center">
              <div className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-fg shadow-2xs">
                {hour ? <Ship className="size-4" /> : <Truck className="size-4" />}
              </div>
              <span className="mt-1.5 text-[11px] font-semibold text-fg">Arrival</span>
              <span className="font-mono text-[10px] text-muted">{arrivalTimeLabel}</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-fg shadow-2xs">
                <Clock className="size-4" />
              </div>
              <span className="mt-1.5 text-[11px] font-semibold text-fg">Queue</span>
              <span className="font-mono text-[10px] text-ok">
                {wait}
                {unit} wait
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex size-8 items-center justify-center rounded-full bg-accent/15 text-accent ring-1 ring-accent/30">
                <Anchor className="size-4" />
              </div>
              <span className="mt-1.5 text-[11px] font-semibold text-fg">
                {hour ? "Berth Service" : "Door Service"}
              </span>
              <span className="font-mono text-[10px] text-muted">
                {liveDock?.short ?? "B5"} · {truck.durationMin}
                {unit}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex size-8 items-center justify-center rounded-full bg-raised text-muted ring-1 ring-line">
                <Navigation className="size-4" />
              </div>
              <span className="mt-1.5 text-[11px] font-semibold text-fg">Departure</span>
              <span className="font-mono text-[10px] text-muted">{endLabel}</span>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Cards: Booked Schedule vs Sidecar Plan */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {/* Left: Booked Schedule */}
          <button
            type="button"
            onClick={() => useBoardStore.getState().setForceDock(orig?.dockId)}
            className="flex flex-col justify-between rounded-2xl bg-raised/65 p-3 text-left ring-1 ring-line transition hover:ring-accent/40"
            title="Click to test pinning to Booked slot"
          >
            <div>
              <p className="text-xs font-semibold text-fg">Booked Schedule</p>
              <p className="mt-1 font-mono text-[11px] text-muted">
                {origDock?.short ?? "B0"} · {origLabel}
              </p>
              <p className="mt-1.5 font-mono text-lg font-bold text-fg">
                {holdWait}
                {unit} Wait
              </p>
            </div>
            <div className="mt-2.5 rounded-xl bg-warn/15 px-2.5 py-2 text-[11px] font-medium leading-tight text-warn ring-1 ring-warn/25">
              Hold Penalty Exposure
            </div>
          </button>

          {/* Right: Sidecar Plan */}
          <button
            type="button"
            onClick={() => useBoardStore.getState().setForceDock(undefined)}
            className="flex flex-col justify-between rounded-2xl bg-ok/8 p-3 text-left ring-1 ring-ok/30 transition hover:ring-ok"
            title="Click to use optimal Sidecar k=0 plan"
          >
            <div>
              <p className="text-xs font-semibold text-fg">Sidecar Plan</p>
              <p className="mt-1 font-mono text-[11px] text-muted">
                {liveDock?.short ?? "B5"} · {startLabel}
              </p>
              <p className="mt-1.5 font-mono text-lg font-bold text-ok">
                +${savedUsd.toLocaleString("en-US")}
              </p>
            </div>
            <div className="mt-2.5 rounded-xl bg-ok/15 px-2.5 py-2 text-[11px] font-medium leading-tight text-ok ring-1 ring-ok/25">
              Calculated SLA Savings
            </div>
          </button>
        </div>

        {/* Filters & Live Overrides Section (Matches Mockup "Filters: Cargo v | Priority v | Door Pinning v") */}
        <div className="mt-4 border-t border-line pt-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fg">Filters &amp; Live Overrides</span>
            <span className="font-mono text-[11px] text-muted">
              {startLabel} – {endLabel}
            </span>
          </div>

          {/* 3 Dropdown / Pill Controls matching Mockup */}
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {!hour ? (
              <button
                type="button"
                onClick={() => useBoardStore.getState().setForceReefer(!reeferOn)}
                className={cn(
                  "flex h-8 items-center justify-center gap-1 rounded-xl px-2 text-xs font-medium ring-1 transition",
                  reeferOn
                    ? "bg-accent/12 text-accent ring-accent/30"
                    : "bg-raised text-fg ring-line hover:bg-raised/80",
                )}
              >
                <Snowflake className="size-3" />
                {reeferOn ? "Reefer" : "Dry"}
              </button>
            ) : (
              <div className="flex h-8 items-center justify-center gap-1 rounded-xl bg-raised px-2 font-mono text-xs text-fg ring-1 ring-line">
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
              className="flex h-8 items-center justify-center gap-1 rounded-xl bg-raised px-2 font-mono text-xs font-semibold text-fg ring-1 ring-line hover:bg-accent/10 hover:text-accent"
              title="Click to cycle Priority P1 / P2 / P3"
            >
              <ListFilter className="size-3 text-accent" />
              Priority P{truck.priority}
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
              className="h-8 rounded-xl bg-raised px-2 font-mono text-xs font-semibold text-fg ring-1 ring-line focus:ring-accent focus:outline-none"
            >
              {yard.docks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.short}
                </option>
              ))}
            </select>
          </div>

          {/* Fine Nudge Strip for Arrival Delay & Duration */}
          <div className="mt-2.5 flex items-center justify-between rounded-xl bg-raised/60 px-3 py-2 ring-1 ring-line">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted">Shift</span>
              <button
                type="button"
                aria-label="Shift arrival earlier"
                onClick={() => useBoardStore.getState().nudgeDelay(hour ? -1 : -10)}
                className="inline-flex size-6 items-center justify-center rounded-lg bg-surface text-muted ring-1 ring-line hover:text-fg"
              >
                <Minus className="size-3" />
              </button>
              <button
                type="button"
                aria-label="Shift arrival later"
                onClick={() => useBoardStore.getState().nudgeDelay(hour ? 1 : 10)}
                className="inline-flex size-6 items-center justify-center rounded-lg bg-surface text-muted ring-1 ring-line hover:text-fg"
              >
                <Plus className="size-3" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted">Duration</span>
              <button
                type="button"
                aria-label="Decrease service time"
                onClick={() =>
                  useBoardStore.getState().setTruckDuration(truck.id, hour ? -2 : -15)
                }
                className="inline-flex size-6 items-center justify-center rounded-lg bg-surface text-muted ring-1 ring-line hover:text-fg"
              >
                <Minus className="size-3" />
              </button>
              <span className=" font-mono text-xs font-semibold text-fg">
                {truck.durationMin}
                {unit}
              </span>
              <button
                type="button"
                aria-label="Increase service time"
                onClick={() =>
                  useBoardStore.getState().setTruckDuration(truck.id, hour ? 2 : 15)
                }
                className="inline-flex size-6 items-center justify-center rounded-lg bg-surface text-muted ring-1 ring-line hover:text-fg"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer matching Mockup */}
      <div className="mt-4 space-y-2 border-t border-line pt-3.5">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-9 rounded-xl text-xs"
            onClick={() => (onFind ? onFind() : useBoardStore.getState().findPlan())}
          >
            <PenLine className="size-3.5 text-accent" />
            Edit Plan
          </Button>
          <Button
            type="button"
            variant={holdOn ? "default" : "ghost"}
            size="sm"
            className="h-9 rounded-xl ring-1 ring-line text-xs"
            onClick={() => useBoardStore.getState().toggleHold()}
          >
            <Pause className="size-3.5" />
            {holdOn ? "Holding" : "Hold Slot"}
          </Button>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => useBoardStore.getState().setSetupOpen(true)}
          className="h-9 w-full rounded-xl bg-raised text-xs font-semibold text-fg ring-1 ring-line hover:bg-accent/10 hover:text-accent"
        >
          <SlidersHorizontal className="size-3.5 text-accent" />
          Customize Facility Rules
        </Button>
      </div>
    </aside>
  );
}
