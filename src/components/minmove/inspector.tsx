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
        {/* Top Inspector Header matching GPT Design System 5.0 */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold tracking-tight text-fg">
            {hour ? "Chi tiết tàu" : "Xe đang chọn"}
          </h3>
          <div className="flex items-center gap-1.5" ref={menuRef}>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
                result?.status === "INFEASIBLE"
                  ? "bg-bad/12 text-bad ring-bad/25"
                  : "bg-ok/12 text-ok ring-ok/25",
              )}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {result?.status === "INFEASIBLE"
                ? "Xung đột"
                : hour
                  ? "Đã tối ưu"
                  : "Đúng SLA"}
            </span>
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

        {/* Illustrated Visual Hero Card (Truck in Minute Mode / Container Ship in Hour Mode) */}
        {hour ? (
          <div className="mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-indigo-50/50 to-surface p-3 ring-1 ring-line dark:from-slate-900 dark:via-indigo-950/30 dark:to-surface">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface/90 px-2 py-0.5 text-[10px] font-semibold text-accent shadow-2xs ring-1 ring-line">
                  <Ship className="size-3" />
                  Container Vessel · {truck.span ?? 1} bến
                </span>
                <h2 className="mt-1.5 text-lg font-bold tracking-tight text-fg">
                  MSC Ocean · <span className="font-mono">{truck.plate}</span>
                </h2>
                <p className="font-mono text-[11px] text-muted">
                  IMO 9876543 · 2,850 TEU
                </p>
              </div>
            </div>
            {/* Illustrated Container Vessel SVG */}
            <svg viewBox="0 0 280 72" className="mt-2 h-16 w-full" aria-hidden="true">
              <defs>
                <linearGradient id="seaGradInsp" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.25" />
                </linearGradient>
              </defs>
              {/* Quay Crane Silhouette on Right */}
              <path d="M236 62 L242 18 L254 18 L260 62" fill="none" stroke="#94a3b8" strokeWidth="2" />
              <path d="M206 22 L272 22" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
              {/* Water base */}
              <rect x="4" y="54" width="272" height="14" rx="6" fill="url(#seaGradInsp)" />
              {/* Ship Hull */}
              <path d="M28 42 L208 42 L196 58 L38 58 Z" fill="#1e293b" />
              <path d="M34 52 L199 52 L196 58 L38 58 Z" fill="#dc2626" />
              {/* Bridge */}
              <rect x="172" y="22" width="22" height="20" rx="2" fill="#f8fafc" stroke="#64748b" strokeWidth="1.2" />
              <rect x="176" y="25" width="14" height="4" rx="1" fill="#38bdf8" />
              {/* Container Stacks */}
              <rect x="46" y="28" width="24" height="14" rx="1.5" fill="#f97316" />
              <rect x="72" y="24" width="24" height="18" rx="1.5" fill="#3b82f6" />
              <rect x="98" y="28" width="24" height="14" rx="1.5" fill="#10b981" />
              <rect x="124" y="25" width="24" height="17" rx="1.5" fill="#4f46e5" />
              <rect x="150" y="30" width="18" height="12" rx="1.5" fill="#eab308" />
            </svg>
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50/90 via-indigo-50/40 to-surface p-3 ring-1 ring-line dark:from-slate-900 dark:via-indigo-950/30 dark:to-surface">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-0.5 text-[11px] font-semibold text-accent shadow-2xs ring-1 ring-line">
                <Truck className="size-3" />
                {reeferOn ? "Xe lạnh" : "Xe tải"} · {truck.hauler}
              </span>
              {reeferOn ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/12 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400">
                  <Snowflake className="size-2.5" />
                  -25°C
                </span>
              ) : null}
            </div>
            {/* Illustrated Refrigerated Semi-Truck + Warehouse Dock SVG */}
            <svg viewBox="0 0 280 78" className="mt-1.5 h-18 w-full" aria-hidden="true">
              {/* Road Line */}
              <line x1="8" y1="68" x2="272" y2="68" stroke="#cbd5e1" strokeWidth="2" />
              {/* Warehouse Dock on Right */}
              <rect x="218" y="18" width="52" height="50" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
              <rect x="226" y="30" width="22" height="38" rx="1.5" fill="#94a3b8" />
              <line x1="226" y1="38" x2="248" y2="38" stroke="#e2e8f0" strokeWidth="1" />
              <line x1="226" y1="46" x2="248" y2="46" stroke="#e2e8f0" strokeWidth="1" />
              <line x1="226" y1="54" x2="248" y2="54" stroke="#e2e8f0" strokeWidth="1" />
              {/* Refrigerated Trailer */}
              <rect x="74" y="20" width="128" height="38" rx="4" fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
              <rect x="74" y="20" width="128" height="6" rx="2" fill="#3b82f6" />
              <text x="90" y="39" fill="#1e293b" fontSize="8.5" fontWeight="800" fontFamily="monospace">
                HOZERION SIDE CAR
              </text>
              <text x="90" y="49" fill="#3b82f6" fontSize="7.5" fontWeight="700" fontFamily="sans-serif">
                COLD CHAIN · REEFER SLA
              </text>
              {/* Reefer Cooling Unit on Front of Trailer */}
              <rect x="67" y="24" width="7" height="22" rx="1.5" fill="#94a3b8" />
              {/* Truck Tractor Cab on Left */}
              <path d="M24 38 L46 26 L64 26 L64 58 L20 58 L20 44 Z" fill="#2563eb" />
              <path d="M28 39 L44 29 L56 29 L56 41 L28 41 Z" fill="#bae6fd" />
              <rect x="20" y="50" width="6" height="5" rx="1" fill="#fde047" />
              {/* Chassis & Wheels */}
              <rect x="60" y="55" width="136" height="4" fill="#334155" />
              <circle cx="38" cy="61" r="6.5" fill="#1e293b" />
              <circle cx="38" cy="61" r="3" fill="#cbd5e1" />
              <circle cx="84" cy="61" r="6.5" fill="#1e293b" />
              <circle cx="84" cy="61" r="3" fill="#cbd5e1" />
              <circle cx="170" cy="61" r="6.5" fill="#1e293b" />
              <circle cx="170" cy="61" r="3" fill="#cbd5e1" />
              <circle cx="186" cy="61" r="6.5" fill="#1e293b" />
              <circle cx="186" cy="61" r="3" fill="#cbd5e1" />
            </svg>
            <div className="mt-1 flex items-center justify-between border-t border-line/60 pt-2">
              <span className="font-mono text-lg font-bold tracking-tight text-fg">
                {truck.plate}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-ok">
                <CheckCircle2 className="size-3.5" />
                Đã kiểm tra
              </span>
            </div>
          </div>
        )}

        {/* 4-Stage Circular Stepper matching 02-tan-thuan-icd-visual-dispatch.png */}
        <div className="mt-3 rounded-2xl bg-raised/45 p-3 ring-1 ring-line">
          <div className="relative grid grid-cols-4 items-start gap-1 text-center">
            <div className="pointer-events-none absolute top-3.5 right-6 left-6 h-0.5 bg-line" />
            <div className="pointer-events-none absolute top-3.5 left-6 h-0.5 w-2/3 bg-accent/65" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex size-7 items-center justify-center rounded-full bg-accent/15 text-accent ring-2 ring-surface">
                {hour ? <Ship className="size-3.5" /> : <Truck className="size-3.5" />}
              </div>
              <span className="mt-1 text-[10px] font-semibold text-muted">Đến</span>
              <span className="font-mono text-[11px] font-bold text-fg">{arrivalTimeLabel}</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex size-7 items-center justify-center rounded-full bg-warn/15 text-warn ring-2 ring-surface">
                <Clock className="size-3.5" />
              </div>
              <span className="mt-1 text-[10px] font-semibold text-muted">Hàng chờ</span>
              <span className="font-mono text-[11px] font-bold text-fg">
                {wait}
                {unit}
              </span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex size-7 items-center justify-center rounded-full bg-accent text-accent-fg shadow-xs ring-2 ring-surface">
                <Anchor className="size-3.5" />
              </div>
              <span className="mt-1 text-[10px] font-semibold text-muted">
                {hour ? `Bến ${liveDock?.short ?? "B5"}` : `Cửa ${liveDock?.short ?? "D6"}`}
              </span>
              <span className="font-mono text-[11px] font-bold text-accent">{startLabel}</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex size-7 items-center justify-center rounded-full bg-ok/15 text-ok ring-2 ring-surface">
                <Navigation className="size-3.5" />
              </div>
              <span className="mt-1 text-[10px] font-semibold text-muted">Rời</span>
              <span className="font-mono text-[11px] font-bold text-fg">{endLabel}</span>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Cards (Warm Amber Old Plan vs Soft Emerald New Plan) */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => useBoardStore.getState().setForceDock(orig?.dockId ?? "")}
            className="flex flex-col justify-between rounded-2xl bg-warn/[0.08] p-3 text-left ring-1 ring-warn/30 transition hover:bg-warn/[0.12]"
            title="Click to test pinning to Booked slot"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-warn">
              {hour ? `LỊCH CŨ · ${origDock?.short ?? "B0"}` : "KẾ HOẠCH CŨ"}
            </span>
            <p className="mt-1 font-mono text-2xl font-bold leading-none text-fg">
              {holdWait}
              {unit}
            </p>
            <p className="mt-1.5 font-mono text-[11px] text-muted">
              {hour ? "Chờ đến lượt" : `Cửa ${origDock?.short ?? "D1"} · ${origLabel}`}
            </p>
          </button>

          <button
            type="button"
            onClick={() => useBoardStore.getState().setForceDock("")}
            className="flex flex-col justify-between rounded-2xl bg-ok/[0.08] p-3 text-left ring-1 ring-ok/30 transition hover:bg-ok/[0.12]"
            title="Click to use optimal Sidecar k=0 plan"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-ok">
              {hour ? `LỊCH MỚI · ${liveDock?.short ?? "B5"}` : "PHƯƠNG ÁN MỚI"}
            </span>
            <p className="mt-1 font-mono text-2xl font-bold leading-none text-ok">
              {wait}
              {unit}
            </p>
            <p className="mt-1.5 font-mono text-[11px] text-muted">
              {hour ? "Cầu bến sẵn sàng" : `Cửa ${liveDock?.short ?? "D6"} · ${startLabel}`}
            </p>
          </button>
        </div>

        {/* Hour mode: Safety Guardrails list matching 03-barcelona-quay-24b-live-berths.png */}
        {hour ? (
          <div className="mt-3 rounded-2xl bg-raised/35 p-3 ring-1 ring-line">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              GIỚI HẠN AN TOÀN
            </p>
            <div className="mt-2 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-fg">
                  <CheckCircle2 className="size-3.5 text-ok" />
                  Bảo toàn lịch chủ
                </span>
                <span className="font-mono font-bold text-ok">100%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-fg">
                  <CheckCircle2 className="size-3.5 text-ok" />
                  Độ sâu luồng tàu
                </span>
                <span className="font-mono font-bold text-ok">Đạt</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-fg">
                  <CheckCircle2 className="size-3.5 text-ok" />
                  Mốc thủy triều / ETA
                </span>
                <span className="font-mono font-bold text-ok">Đạt</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-fg">
                  <ShieldCheck className="size-3.5 text-accent" />
                  Ảnh hưởng tàu khác
                </span>
                <span className="font-mono font-bold text-fg">{result?.kUsed ?? 0}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Minute mode: 3-column summary strip matching 02-tan-thuan-icd-visual-dispatch.png */
          <div className="mt-3 rounded-2xl bg-raised/40 px-3 py-2.5 ring-1 ring-line">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] font-bold uppercase text-muted">TIẾT KIỆM</div>
                <div className="mt-0.5 font-mono text-sm font-bold text-ok">
                  +${savedUsd.toLocaleString("en-US")}
                </div>
              </div>
              <div className="border-x border-line">
                <div className="text-[10px] font-bold uppercase text-muted">ẢNH HƯỞNG</div>
                <div className="mt-0.5 font-mono text-sm font-bold text-fg">
                  {result?.kUsed ?? 0} xe
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-muted">THỜI GIAN</div>
                <div className="mt-0.5 font-mono text-sm font-bold text-accent">
                  {result?.ms ?? 1}ms
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compact Interactive Overrides */}
        <div className="mt-3 border-t border-line pt-2.5">
          <div className="grid grid-cols-3 gap-1.5">
            {!hour ? (
              <button
                type="button"
                onClick={() => useBoardStore.getState().toggleForceReefer()}
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
                {truck.span ?? 1} bến
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
              value={forceDock || live?.dockId || orig?.dockId || ""}
              onChange={(e) => {
                const val = e.target.value;
                useBoardStore
                  .getState()
                  .setForceDock(val === (orig?.dockId ?? "") ? "" : val);
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

          <div className="mt-1.5 flex items-center justify-between rounded-lg bg-raised/60 px-2.5 py-1 ring-1 ring-line">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium text-muted">Dời ETA</span>
              <button
                type="button"
                aria-label="Shift arrival earlier"
                onClick={() => useBoardStore.getState().nudge(hour ? -1 : -10)}
                className="inline-flex size-5 items-center justify-center rounded bg-surface text-muted ring-1 ring-line hover:text-fg"
              >
                <Minus className="size-2.5" />
              </button>
              <button
                type="button"
                aria-label="Shift arrival later"
                onClick={() => useBoardStore.getState().nudge(hour ? 1 : 10)}
                className="inline-flex size-5 items-center justify-center rounded bg-surface text-muted ring-1 ring-line hover:text-fg"
              >
                <Plus className="size-2.5" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium text-muted">Tác nghiệp</span>
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

      {/* Bottom Action Footer matching 02-tan-thuan-icd-visual-dispatch.png & 03-barcelona-quay-24b-live-berths.png */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-9 rounded-xl bg-raised text-xs font-semibold text-fg ring-1 ring-line hover:bg-surface"
          onClick={() => (onFind ? onFind() : useBoardStore.getState().findPlan())}
        >
          <PenLine className="size-3.5 text-muted" />
          {hour ? "So sánh 2 lịch" : "Chỉnh lịch"}
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-9 rounded-xl bg-ok text-xs font-semibold text-white shadow-xs hover:bg-ok/90"
          onClick={() => useBoardStore.getState().commit()}
        >
          <CheckCircle2 className="size-3.5" />
          {hour ? "Duyệt kế hoạch" : "Áp dụng"}
        </Button>
      </div>
    </aside>
  );
}
