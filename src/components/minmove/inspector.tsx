import { useEffect, useMemo, useRef, useState } from "react";
import {
  Anchor,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Clock,
  Copy,
  Flag,
  Minus,
  MoreHorizontal,
  Pause,
  PenLine,
  Plus,
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
  const unit = hour ? "h" : "min";
  const startLabel = start ? formatWhen(yard, start.startMin) : "—";
  const endLabel = start ? formatWhen(yard, start.startMin + truck.durationMin) : "—";
  const origDock = orig ? yard.docks.find((d) => d.id === orig.dockId) : undefined;
  const liveDock = live ? yard.docks.find((d) => d.id === live.dockId) : origDock;
  const len = yard.shiftLenMin;
  const wait = event && event.truckId === truck.id && start ? Math.max(0, start.startMin - event.newEtaMin) : 0;
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
  const savedUnits = hour ? Math.max(0, compare?.saved ?? 0) : moved ? 40 : 0;
  const savedUsd = savedUnits * slaRateUsd;

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: Event) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);

  const nextPriority = ((truck.priority % 3) + 1) as 1 | 2 | 3;

  return (
    <aside className="flex h-full flex-col overflow-y-auto bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">APPOINTMENT</p>
        <div className="relative" ref={menuRef}>
          <button type="button" className="text-faint hover:text-fg" aria-label="Appointment menu" onClick={() => setMenu((v) => !v)}>
            <MoreHorizontal className="size-4" />
          </button>
          {menu ? (
            <div className="absolute top-full right-0 z-50 mt-1 min-w-44 rounded-xl bg-surface p-1 shadow-float ring-1 ring-line">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-raised"
                onClick={() => {
                  setMenu(false);
                  void navigator.clipboard.writeText(truck.plate);
                }}
              >
                <Copy className="size-3.5 text-muted" />
                Copy plate
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-raised"
                onClick={() => {
                  setMenu(false);
                  onFind?.();
                }}
              >
                <CalendarClock className="size-3.5 text-muted" />
                Reschedule
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Vehicle / Vessel Identity matching attachments/image.png */}
      <div className="mt-4 flex items-center gap-3">
        <div className="relative shrink-0">
          <img src="/truck.jpg" alt="" className="size-13 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10" />
          {reeferOn ? (
            <span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-accent-fg">
              <Snowflake className="size-3" />
            </span>
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold tracking-tight text-fg">{truck.plate}</p>
          <p className="truncate text-xs text-muted">{truck.hauler}</p>
        </div>
      </div>

      {/* Interactive Attribute Pills (Reefer / Dry / Priority / Span) */}
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {hour ? (
          <>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-accent/10 px-2.5 font-mono text-xs font-medium text-accent ring-1 ring-accent/25">
              <Anchor className="size-3.5" />
              {truck.span ?? 1} berths · {truck.durationMin}h
            </span>
            <span className="sr-only">
              Occupies {truck.span ?? 1} berths · works {truck.durationMin}h
            </span>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                const s = useBoardStore.getState();
                if (!s.forceReefer) s.toggleForceReefer();
              }}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium ring-1 transition",
                reeferOn ? "bg-accent/10 text-accent ring-accent/25" : "bg-raised text-muted ring-line hover:text-fg",
              )}
            >
              <Snowflake className="size-3.5" />
              Reefer
            </button>
            <button
              type="button"
              onClick={() => {
                const s = useBoardStore.getState();
                if (s.forceReefer) s.toggleForceReefer();
              }}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium ring-1 transition",
                !reeferOn ? "bg-ok/10 text-ok ring-ok/25" : "bg-raised text-muted ring-line hover:text-fg",
              )}
            >
              <Truck className="size-3.5" />
              Dry
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => useBoardStore.getState().setTruckPriority(truck.id, nextPriority)}
          title="Click to cycle priority P1 -> P2 -> P3"
          className="inline-flex h-8 items-center gap-1 rounded-full bg-raised px-3 font-mono text-xs font-semibold tabular-nums text-accent ring-1 ring-line transition hover:bg-accent/10"
        >
          P{truck.priority}
        </button>
      </div>

      {/* Interactive Shift Progress Bar */}
      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
          <span className="font-semibold uppercase tracking-wider text-faint">SHIFT</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => useBoardStore.getState().nudge(hour ? -1 : -15)}
              className="flex size-5 items-center justify-center rounded bg-raised text-muted ring-1 ring-line hover:text-fg"
              title="Nudge earlier"
            >
              <Minus className="size-3" />
            </button>
            <span className="font-mono font-medium tabular-nums text-fg">
              {startLabel} – {endLabel}
            </span>
            <button
              type="button"
              onClick={() => useBoardStore.getState().nudge(hour ? 1 : 15)}
              className="flex size-5 items-center justify-center rounded bg-raised text-muted ring-1 ring-line hover:text-fg"
              title="Nudge later"
            >
              <Plus className="size-3" />
            </button>
          </div>
        </div>
        <div className="relative h-2 rounded-full bg-raised">
          {start ? (
            <span
              className="absolute top-0 h-2 rounded-full bg-accent transition-all"
              style={{ left: `${(start.startMin / len) * 100}%`, width: `${Math.max(4, (truck.durationMin / len) * 100)}%` }}
            />
          ) : null}
        </div>
        <div className="mt-1 flex justify-between font-mono text-[11px] tabular-nums text-faint">
          <span>{formatWhen(yard, 0)}</span>
          <span>{formatWhen(yard, len)}</span>
        </div>
      </div>

      {/* Interactive Booked -> Plan Cards matching attachments/image.png */}
      <div className="mt-4 flex items-center justify-between gap-2.5">
        <DoorCard
          label="Booked"
          id={origDock?.short.replace("D", "") ?? "—"}
          muted={Boolean(moved)}
          selected={holdOn}
          onClick={() => useBoardStore.getState().hold()}
        />
        <ArrowRight className={cn("size-4 shrink-0", moved ? "text-accent" : "text-faint")} />
        <DoorCard
          label={moved ? "Plan" : "Holds"}
          id={liveDock?.short.replace("D", "") ?? "—"}
          active={Boolean(moved) && !holdOn}
          onClick={() => {
            useBoardStore.setState({ holdOn: false, forceDock: "" });
            useBoardStore.getState().findPlan();
          }}
        />
      </div>

      {event && event.truckId === truck.id ? (
        <div className="mt-3.5 flex items-center justify-between">
          <p className="text-xs font-medium text-bad">Late to {formatWhen(yard, event.newEtaMin)}</p>
          {savedUsd > 0 ? (
            <span className="rounded-full bg-ok/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-ok ring-1 ring-ok/25">
              +${savedUsd.toLocaleString("en-US")} saved
            </span>
          ) : null}
        </div>
      ) : (
        <p className="mt-3.5 text-xs text-muted">On the published board</p>
      )}

      {/* Clean Interactive Key-Value Rows matching attachments/image.png */}
      <dl className="mt-3.5 space-y-3 border-t border-line/70 pt-3.5 text-xs">
        <Row icon={Clock} label="Wait" value={`${result?.metrics.eventWaitMin ?? wait} ${unit}`} />
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-muted">
            <Clock className="size-3.5" />
            Service time
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => useBoardStore.getState().setTruckDuration(truck.id, hour ? -2 : -15)}
              className="flex size-5 items-center justify-center rounded bg-raised text-muted ring-1 ring-line hover:text-fg"
              title="Decrease service time"
            >
              <Minus className="size-2.5" />
            </button>
            <span className="min-w-12 text-center font-mono text-xs font-semibold tabular-nums text-fg">
              {truck.durationMin} {unit}
            </span>
            <button
              type="button"
              onClick={() => useBoardStore.getState().setTruckDuration(truck.id, hour ? 2 : 15)}
              className="flex size-5 items-center justify-center rounded bg-raised text-muted ring-1 ring-line hover:text-fg"
              title="Increase service time"
            >
              <Plus className="size-2.5" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-muted">
            <CalendarClock className="size-3.5" />
            {hour ? "Berth" : "Door"}
          </span>
          <select
            value={forceDock || (liveDock?.id ?? "")}
            onChange={(e) => useBoardStore.getState().toggleForceDock(e.target.value)}
            aria-label={hour ? "Pin berth" : "Pin door"}
            className="h-6 rounded-md bg-raised px-2 font-mono text-xs font-semibold text-fg ring-1 ring-line focus:ring-accent focus:outline-none"
          >
            {yard.docks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.short.replace("D", "")} {forceDock === d.id ? "(Pinned)" : ""}
              </option>
            ))}
          </select>
        </div>
        <Row icon={Flag} label="Priority" value={`P${truck.priority}`} />
        <Row
          icon={Snowflake}
          label="Type"
          value={
            hour
              ? "Not in the file"
              : forceReefer && truck.cargo !== "reefer"
                ? "Dry (Reefer)"
                : truck.cargo === "reefer"
                  ? "Reefer"
                  : "Dry"
          }
        />
      </dl>

      {/* Bottom Action Bar matching attachments/image.png */}
      <div className="mt-auto space-y-2 border-t border-line pt-4">
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" variant="secondary" size="sm" className="rounded-xl" onClick={onFind}>
            <CalendarClock className="size-3.5" />
            Reschedule
          </Button>
          <Button type="button" variant="ghost" size="sm" className="rounded-xl" onClick={() => useBoardStore.getState().hold()}>
            <Pause className="size-3.5" />
            Hold
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-xl shadow-[var(--shadow-float)]"
            onClick={() => useBoardStore.getState().nudge(hour ? 1 : 15)}
          >
            <PenLine className="size-3.5" />
            Edit plan
          </Button>
        </div>
        <button
          type="button"
          onClick={() => useBoardStore.getState().setSetupOpen(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-raised px-3 py-2 text-xs font-medium text-fg ring-1 ring-line transition hover:bg-accent/10 hover:text-accent hover:ring-accent/30"
        >
          <SlidersHorizontal className="size-3.5 text-accent" />
          Tự Setup Cấu Hình Logistics
        </button>
      </div>
    </aside>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-1.5 text-muted">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="font-mono text-xs font-semibold tabular-nums text-fg">{value}</span>
    </div>
  );
}

function DoorCard({
  label,
  id,
  muted,
  active,
  selected,
  onClick,
}: {
  label: string;
  id: string;
  muted?: boolean;
  active?: boolean;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-2xl px-3 py-2.5 text-left ring-1 transition",
        active
          ? "bg-accent/10 text-fg ring-accent/30 shadow-[inset_0_0_0_1px_rgba(91,77,255,0.08)]"
          : selected
            ? "bg-bad/10 text-fg ring-bad/30"
            : "bg-raised/80 ring-line hover:bg-raised",
      )}
    >
      <p className={cn("inline-flex items-center gap-1 text-[11px] font-medium", active ? "text-accent" : "text-muted")}>
        <CalendarDays className="size-3" />
        {label}
      </p>
      <p className={cn("mt-1 font-mono text-xl font-bold tabular-nums", muted && !active && "text-muted")}>{id}</p>
    </button>
  );
}
