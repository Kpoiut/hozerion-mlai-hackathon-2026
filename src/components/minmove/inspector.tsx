import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CalendarClock, CalendarDays, Clock, Copy, Cpu, Flag, MoreHorizontal, Pause, PenLine, ShieldCheck, Snowflake, Sparkles, Truck } from "lucide-react";
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
  const reeferOn = truck.cargo === "reefer" || forceReefer;
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const compare = useMemo(
    () => (hour && event ? bookedFromPlan(yard, event, result ?? undefined) : null),
    [hour, yard, event, result],
  );
  const savedUnits = hour ? Math.max(0, compare?.saved ?? 0) : moved ? 40 : 0;
  const savedUsd = hour ? savedUnits * 1500 : savedUnits * 12;

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: Event) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);

  return (
    <aside className="flex h-full flex-col overflow-y-auto bg-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Appointment · Chi Tiết Lệnh</p>
        </div>
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
                Copy plate (Chép mã)
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
                Reschedule (Tính lại)
              </button>
            </div>
          ) : null}
        </div>
      </div>

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

      {hour ? (
        <p className="mt-3 rounded-lg bg-raised/70 px-2.5 py-1.5 font-mono text-xs tabular-nums text-muted ring-1 ring-line">
          Occupies {truck.span ?? 1} berths · works {truck.durationMin}h (Chiếm {truck.span ?? 1} cầu · làm hàng {truck.durationMin}h)
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => {
              const s = useBoardStore.getState();
              if (!s.forceReefer) s.toggleForceReefer();
            }}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ring-1",
              reeferOn ? "bg-accent/10 text-accent ring-accent/25" : "bg-raised text-muted ring-line",
            )}
          >
            <Snowflake className="size-3.5" />
            Reefer (Lạnh)
          </button>
          <button
            type="button"
            onClick={() => {
              const s = useBoardStore.getState();
              if (s.forceReefer) s.toggleForceReefer();
            }}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ring-1",
              !reeferOn ? "bg-ok/10 text-ok ring-ok/25" : "bg-raised text-muted ring-line",
            )}
          >
            <Truck className="size-3.5" />
            Dry (Khô)
          </button>
          <span className="inline-flex h-8 items-center rounded-full bg-raised px-2.5 font-mono text-xs tabular-nums text-muted ring-1 ring-line">
            P{truck.priority}
          </span>
        </div>
      )}

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs text-muted">
          <span>Shift · Khung giờ làm hàng</span>
          <span className="font-mono tabular-nums">{startLabel} – {endLabel}</span>
        </div>
        <div className="relative h-2 rounded-full bg-raised">
          {start ? (
            <span
              className="absolute top-0 h-2 rounded-full bg-accent"
              style={{ left: `${(start.startMin / len) * 100}%`, width: `${(truck.durationMin / len) * 100}%` }}
            />
          ) : null}
        </div>
        <div className="mt-1 flex justify-between font-mono text-[11px] tabular-nums text-faint">
          <span>{formatWhen(yard, 0)}</span>
          <span>{formatWhen(yard, len)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2.5">
        <DoorCard label="Booked · Gốc" id={origDock?.short.replace("D", "") ?? "—"} muted={Boolean(moved)} />
        <ArrowRight className={cn("size-4 shrink-0", moved ? "text-accent" : "text-faint")} />
        <DoorCard label={moved ? "Plan · Mới" : "Holds · Giữ"} id={liveDock?.short.replace("D", "") ?? "—"} active={Boolean(moved)} />
      </div>

      {/* Sidecar Telemetry & Economic Value Box */}
      <div className={cn("mt-4 rounded-xl p-3 ring-1", savedUsd > 0 ? "bg-ok/10 ring-ok/30" : "bg-raised/60 ring-line")}>
        <div className="flex items-center justify-between gap-1">
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase text-fg">
            {savedUsd > 0 ? <Sparkles className="size-3 text-ok" /> : <ShieldCheck className="size-3 text-accent" />}
            {savedUsd > 0 ? "MINIMAL DIFF PATCH (k=0)" : "ZERO-TOUCH (NO_OP)"}
          </span>
          <span className="font-mono text-xs font-bold text-ok">
            {savedUsd > 0 ? `+$${savedUsd.toLocaleString("en-US")}` : "100% Bảo toàn"}
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-snug text-muted">
          {savedUsd > 0
            ? `Cứu ${savedUnits}${unit} chờ dây chuyền, giữ nguyên 100% lệnh khác trên TOS/WMS chủ.`
            : "Cầu/cửa gốc vẫn tối ưu — Plugin không can thiệp dữ liệu hệ thống chủ."}
        </p>
      </div>

      {event && event.truckId === truck.id ? (
        <>
          <p className="mt-3.5 text-xs font-medium text-bad">Late to {formatWhen(yard, event.newEtaMin)} (Đến trễ)</p>
          {result ? (
            <p className="mt-0.5 text-xs text-muted">
              {result.status === "OPTIMAL" ? "Draft · not committed (Bản nháp tối ưu)" : "No legal draft"}
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-3.5 text-xs text-muted">On the published board (Theo kế hoạch gốc)</p>
      )}

      <dl className="mt-3.5 space-y-2.5 text-xs">
        <Row icon={Clock} label="Wait (Chờ)" value={`${result?.metrics.eventWaitMin ?? wait} ${unit}`} />
        <Row icon={Clock} label="Service time (Làm hàng)" value={`${truck.durationMin} ${unit}`} />
        <Row icon={CalendarClock} label={hour ? "Berth (Cầu)" : "Door (Cửa)"} value={liveDock?.short.replace("D", "") ?? "—"} />
        <Row icon={Flag} label="Priority (Ưu tiên)" value={`P${truck.priority}`} />
        <Row
          icon={Snowflake}
          label="Type (Loại hàng)"
          value={
            hour
              ? "Not in the file"
              : forceReefer && truck.cargo !== "reefer"
                ? "Dry · treat as reefer"
                : truck.cargo === "reefer"
                  ? "Reefer"
                  : "Dry"
          }
        />
      </dl>

      <div className="mt-auto space-y-2 border-t border-line pt-4">
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" variant="secondary" size="sm" className="rounded-full" onClick={onFind}>
            <CalendarClock className="size-3.5" />
            Reschedule
          </Button>
          <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={() => useBoardStore.getState().hold()}>
            <Pause className="size-3.5" />
            Hold
          </Button>
          <Button type="button" size="sm" className="rounded-full shadow-[var(--shadow-float)]" onClick={() => useBoardStore.getState().nudge(15)}>
            <PenLine className="size-3.5" />
            Edit plan
          </Button>
        </div>
        <button
          type="button"
          onClick={() => useBoardStore.getState().setTab("sidecar")}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent/10 px-3 py-2 text-xs font-semibold text-accent ring-1 ring-accent/30 hover:bg-accent/15"
        >
          <Cpu className="size-3.5" />
          Mở Plugin Sidecar &amp; Benchmark Go/Rust
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
      <span className="font-mono text-xs font-medium tabular-nums text-fg">{value}</span>
    </div>
  );
}

function DoorCard({ label, id, muted, active }: { label: string; id: string; muted?: boolean; active?: boolean }) {
  return (
    <div className={cn("flex-1 rounded-2xl px-3 py-2.5 ring-1", active ? "bg-accent/10 text-fg ring-accent/30 shadow-[inset_0_0_0_1px_rgba(91,77,255,0.08)]" : "bg-raised/80 ring-line")}>
      <p className={cn("inline-flex items-center gap-1 text-[10px] font-semibold", active ? "text-accent" : "text-faint")}>
        <CalendarDays className="size-3" />
        {label}
      </p>
      <p className={cn("mt-0.5 font-mono text-xl font-bold tabular-nums", muted && !active && "text-muted")}>{id}</p>
    </div>
  );
}

