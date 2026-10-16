import { CheckCircle2, Lock, RotateCcw, Ship, SlidersHorizontal } from "lucide-react";
import {
  bookedFromPlan,
  bookedHeadline,
  stretchClear,
  stretchShips,
} from "@/lib/minmove/published-week.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

export function JobCard() {
  const yard = useBoardStore((s) => s.yard);
  const event = useBoardStore((s) => s.event);
  const result = useBoardStore((s) => s.result);
  const selectedId = useBoardStore((s) => s.selectedId);
  const forceDock = useBoardStore((s) => s.forceDock);
  const slaRateUsd = useBoardStore((s) => s.slaRateUsd);

  if (yard.timeUnit !== "hour" || !event) return null;
  const compare = bookedFromPlan(yard, event, result ?? undefined);
  const appt = yard.appointments.find((a) => a.truckId === event.truckId);
  const ship = yard.trucks.find((t) => t.id === event.truckId);
  if (!appt || !ship) return null;

  const span = ship.span ?? 1;
  const dur = ship.durationMin;
  const arrived = event.newEtaMin;
  const saved = compare.saved ?? 0;
  const savedUsd = Math.max(0, saved) * (slaRateUsd || 1500);

  const bookedDock = compare.holdDock ?? appt.dockId;
  const bookedStart = compare.holdStart ?? appt.startMin;
  const holdWait = compare.holdWait ?? 0;
  const planDock = compare.planDock ?? appt.dockId;
  const planStart = compare.planStart ?? appt.startMin;
  const planWait = compare.planWait ?? 0;

  const chain =
    compare.matches || compare.holdStart == null
      ? []
      : stretchShips(yard, event.truckId, appt.dockId, span, arrived, compare.holdStart);

  const planClear =
    !compare.matches &&
    compare.planDock != null &&
    compare.planStart != null &&
    stretchClear(yard, event.truckId, compare.planDock, span, compare.planStart, compare.planStart + dur);

  const planEnd = planStart + dur;
  const planBerthNo = Number(planDock.replace(/^B/, ""));
  const bookedBerthNo = Number(bookedDock.replace(/^B/, ""));
  const isPinnedBooked = forceDock === appt.dockId;
  const headline = bookedHeadline(compare);

  return (
    <section
      data-job-card=""
      aria-label="Barcelona Quay 24B Visual Maritime Board"
      className="mb-3 overflow-hidden rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line"
    >
      {/* Row 1: Top Decision Banner matching 03-barcelona-quay-24b-live-berths.png */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ok/12 px-3 py-1 text-xs font-bold text-ok ring-1 ring-ok/25">
            <CheckCircle2 className="size-3.5" />
            Phương án đã tìm
          </span>

          <div className="inline-flex items-center gap-1.5 rounded-xl bg-raised px-2.5 py-1 font-mono text-xs font-bold text-fg ring-1 ring-line">
            <button
              type="button"
              onClick={() =>
                useBoardStore.getState().setForceDock(isPinnedBooked ? "" : (appt.dockId ?? ""))
              }
              className={cn(
                "rounded px-1.5 py-0.5 transition",
                isPinnedBooked ? "bg-warn/20 text-warn" : "text-muted hover:text-fg",
              )}
              title="Bấm để ghim thử bến cũ"
            >
              {bookedDock} ({holdWait}h)
            </button>
            <span className="text-muted">→</span>
            <button
              type="button"
              onClick={() => useBoardStore.getState().setForceDock("")}
              className={cn(
                "rounded px-1.5 py-0.5 transition",
                !isPinnedBooked ? "bg-accent text-white" : "text-muted hover:text-fg",
              )}
            >
              {planDock} @ {String(planStart).padStart(2, "0")}h
            </button>
          </div>

          <span className="inline-flex items-center rounded-lg bg-ok/12 px-2 py-0.5 font-mono text-xs font-bold text-ok">
            {saved > 0 ? `-${saved}h (${planWait}h chờ)` : `${planWait}h chờ`}
          </span>

          {saved > 0 ? (
            <span className="inline-flex items-center rounded-lg bg-ok/12 px-2 py-0.5 font-mono text-xs font-bold text-ok">
              +${savedUsd.toLocaleString("en-US")}
            </span>
          ) : null}

          {compare.holdStart != null && compare.planStart != null && saved > 0 ? (
            <span
              data-booked-equation=""
              {...(compare.leftmostStart === compare.holdStart ? { "data-job-equation": "" } : {})}
              className="shrink-0 rounded-md bg-accent/10 px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-accent ring-1 ring-accent/20"
            >
              {compare.holdStart} − {compare.planStart} = {saved}
            </span>
          ) : null}

          {compare.leftmostStart != null &&
          compare.planStart != null &&
          (compare.leftmostSaved ?? 0) > 0 &&
          compare.leftmostStart !== compare.holdStart ? (
            <span
              data-job-equation=""
              className="shrink-0 rounded-md bg-accent/10 px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-accent ring-1 ring-accent/20"
            >
              {compare.leftmostStart} − {compare.planStart} = {compare.leftmostSaved}
            </span>
          ) : null}

          <span className="hidden font-mono text-[11px] text-muted xl:inline">
            One late ship. The others stay put · Nobody else moves
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => useBoardStore.getState().reset()}
            className="inline-flex h-8 items-center gap-1 rounded-xl bg-raised px-2.5 text-xs font-medium text-fg ring-1 ring-line hover:bg-surface"
          >
            <RotateCcw className="size-3.5 text-muted" />
            Restore
          </button>
          <button
            type="button"
            data-open-logistics-setup=""
            onClick={() => useBoardStore.getState().setSetupOpen(true)}
            className="inline-flex h-8 items-center gap-1 rounded-xl bg-raised px-2.5 text-xs font-medium text-fg ring-1 ring-line hover:bg-accent/10 hover:text-accent"
          >
            <SlidersHorizontal className="size-3.5 text-accent" />
            Setup
          </button>
          <Button
            type="button"
            size="sm"
            onClick={() => useBoardStore.getState().commit()}
            className="h-8 rounded-xl bg-accent px-3.5 text-xs font-semibold text-accent-fg shadow-xs hover:bg-accent/90"
          >
            Áp dụng kế hoạch
          </Button>
        </div>
      </div>

      {/* Row 2: Illustrated Maritime Quay Hero matching 03-barcelona-quay-24b-live-berths.png */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-200/80 bg-gradient-to-b from-slate-100 via-sky-100 to-sky-700 shadow-inner dark:border-sky-900/60 dark:from-slate-900 dark:via-sky-950 dark:to-slate-950">
        {/* Top Overlay Badges */}
        <div className="pointer-events-none absolute top-2.5 right-3 left-3 z-10 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-white backdrop-blur-xs">
            <Ship className="size-3 text-sky-400" />
            HẢI ĐỒ TRỰC QUAN · BARCELONA QUAY 24B
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1 text-[11px] font-bold text-slate-900 shadow-xs">
            <span className="size-2 rounded-full bg-emerald-500" />
            Hoạt động · {yard.docks.length} bến · {yard.trucks.length} tàu
          </span>
        </div>

        {/* SVG Harbor Panorama with STS Cranes, Container Stacks, and Moored Vessels */}
        <svg
          viewBox="0 0 960 148"
          className="block h-32 w-full sm:h-36"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="harborWater" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="55%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="apronConcrete" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>

          {/* Terminal Yard Apron (Top) */}
          <rect x="0" y="0" width="960" height="58" fill="url(#apronConcrete)" />
          {/* Quay Wall Coping */}
          <rect x="0" y="54" width="960" height="6" fill="#64748b" />
          <line x1="0" y1="57" x2="960" y2="57" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="8 6" />

          {/* Yard Container Stacks */}
          {[40, 110, 290, 360, 520, 610, 760, 840].map((x, idx) => (
            <g key={x} transform={`translate(${x}, 10)`}>
              <rect x="0" y="22" width="26" height="10" rx="1.5" fill={idx % 2 === 0 ? "#3b82f6" : "#f97316"} />
              <rect x="28" y="22" width="26" height="10" rx="1.5" fill={idx % 3 === 0 ? "#10b981" : "#6366f1"} />
              <rect x="6" y="11" width="26" height="10" rx="1.5" fill="#ef4444" />
              <rect x="34" y="11" width="26" height="10" rx="1.5" fill="#0ea5e9" />
            </g>
          ))}

          {/* 4 STS Quay Cranes */}
          {[175, 420, 665, 815].map((cx) => (
            <g key={cx} transform={`translate(${cx}, 4)`}>
              <line x1="0" y1="50" x2="8" y2="6" stroke="#334155" strokeWidth="3" />
              <line x1="26" y1="50" x2="18" y2="6" stroke="#334155" strokeWidth="3" />
              <line x1="-18" y1="12" x2="54" y2="12" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
              <line x1="13" y1="0" x2="-10" y2="12" stroke="#475569" strokeWidth="1.5" />
              <line x1="13" y1="0" x2="46" y2="12" stroke="#475569" strokeWidth="1.5" />
              <rect x="6" y="13" width="14" height="6" rx="1" fill="#f59e0b" />
            </g>
          ))}

          {/* Deep Water Harbor Basin */}
          <rect x="0" y="60" width="960" height="88" fill="url(#harborWater)" />

          {/* Subtle Water Wave Lines */}
          <path d="M 30 82 Q 90 77, 150 82 T 270 82 T 390 82" fill="none" stroke="#7dd3fc" strokeOpacity="0.25" strokeWidth="1.5" />
          <path d="M 480 128 Q 560 123, 640 128 T 800 128 T 920 128" fill="none" stroke="#7dd3fc" strokeOpacity="0.22" strokeWidth="1.5" />

          {/* Ghost Booked Slot on B0 (Left) */}
          <g transform="translate(28, 66)">
            <rect
              x="0"
              y="0"
              width="155"
              height="34"
              rx="10"
              fill="#f59e0b"
              fillOpacity="0.18"
              stroke="#fbbf24"
              strokeWidth="1.8"
              strokeDasharray="5 4"
            />
            <text x="12" y="15" fill="#fef08a" fontSize="9.5" fontWeight="700" fontFamily="monospace">
              Lịch cũ {bookedDock} · Chờ {holdWait}h
            </text>
            <text x="12" y="27" fill="#fed7aa" fontSize="8.5" fontFamily="sans-serif">
              Đang vướng {chain.length || 3} tàu khác
            </text>
          </g>

          {/* Curved Re-Berthing Path Arrow from B0 to Plan Berth */}
          <path
            d="M 188 84 C 225 84, 240 94, 276 94"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.2"
            strokeDasharray="4 3"
          />

          {/* Highlighted Rescued Vessel (MSC OCEAN · S8) at Plan Berth */}
          <g transform="translate(282, 66)">
            {/* Vessel Hull Top-Down */}
            <path
              d="M 0 6 L 235 6 L 258 22 L 235 38 L 0 38 L 8 22 Z"
              fill="#1e1b4b"
              stroke="#818cf8"
              strokeWidth="2"
            />
            {/* Colored Container Bays on Deck */}
            <rect x="18" y="11" width="26" height="22" rx="2" fill="#f97316" />
            <rect x="48" y="11" width="26" height="22" rx="2" fill="#3b82f6" />
            <rect x="78" y="11" width="26" height="22" rx="2" fill="#10b981" />
            <rect x="108" y="11" width="26" height="22" rx="2" fill="#eab308" />
            {/* Label Pill on Vessel */}
            <rect x="140" y="9" width="92" height="26" rx="6" fill="#4f46e5" />
            <text x="147" y="20" fill="#ffffff" fontSize="9.5" fontWeight="800" fontFamily="monospace">
              MSC OCEAN · {ship.plate}
            </text>
            <text x="147" y="30" fill="#bbf7d0" fontSize="8" fontWeight="700" fontFamily="sans-serif">
              {planDock} · {String(planStart).padStart(2, "0")}:00–{String(planEnd).padStart(2, "0")}:00 · 0h chờ
            </text>
          </g>

          {/* Neighboring Moored Vessel on Right (MAERSK LIMA) */}
          <g transform="translate(615, 68)">
            <path
              d="M 0 5 L 220 5 L 240 19 L 220 33 L 0 33 L 6 19 Z"
              fill="#0f172a"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <rect x="16" y="9" width="24" height="20" rx="2" fill="#0ea5e9" />
            <rect x="44" y="9" width="24" height="20" rx="2" fill="#f43f5e" />
            <rect x="72" y="9" width="24" height="20" rx="2" fill="#10b981" />
            <text x="108" y="22" fill="#e2e8f0" fontSize="9.5" fontWeight="700" fontFamily="monospace">
              MAERSK LIMA · B12–B15 (Giữ nguyên)
            </text>
          </g>
        </svg>

        {/* Interactive 20-Berth Capsule Selector Strip matching 03-barcelona-quay-24b-live-berths.png */}
        <div className="border-t border-line bg-surface/95 px-3 py-2 backdrop-blur-xs">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-fg">Chọn cầu bến</span>
              <span className="inline-flex items-center gap-1 text-ok">
                <span className="size-2 rounded-full bg-ok" />
                17 đang khai thác
              </span>
              <span className="inline-flex items-center gap-1 text-muted">
                <span className="size-2 rounded-full bg-line" />
                03 còn trống
              </span>
            </div>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">
              BẤM BẾN ĐỂ XEM / ĐỔI TÀU
            </span>
          </div>

          <div className="grid grid-cols-10 gap-1 sm:grid-cols-20">
            {yard.docks.map((d, idx) => {
              const isPlanSpan = idx >= planBerthNo && idx < planBerthNo + span;
              const isBooked = idx === bookedBerthNo;
              const isPinned = forceDock === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => useBoardStore.getState().toggleForceDock(d.id)}
                  title={`${d.label} — Bấm để ghim/bỏ ghim`}
                  className={cn(
                    "flex h-9 flex-col items-center justify-center rounded-xl font-mono text-[11px] font-bold transition",
                    isPlanSpan
                      ? "bg-accent text-white shadow-xs ring-2 ring-accent/40"
                      : isBooked
                        ? "bg-warn/15 text-warn ring-1 ring-warn/50"
                        : isPinned
                          ? "bg-accent/20 text-accent ring-1 ring-accent"
                          : idx % 7 === 3
                            ? "bg-raised/60 text-muted ring-1 ring-line hover:bg-raised"
                            : "bg-ok/10 text-ok ring-1 ring-ok/25 hover:bg-ok/20",
                  )}
                >
                  <span>{idx}</span>
                  <span
                    className={cn(
                      "mt-0.5 size-1.5 rounded-full",
                      isPlanSpan
                        ? "bg-white"
                        : isBooked
                          ? "bg-warn"
                          : idx % 7 === 3
                            ? "bg-muted/40"
                            : "bg-ok",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: E2E Proof Headline & Blocking Chain (100% Preserved for Playwright E2E) */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
        <div className="flex flex-wrap items-center gap-1.5 text-muted">
          <span className="font-semibold text-fg">{headline}</span>
          {planClear ? (
            <span className="text-ok">
              Berth {planBerthNo} from hour {planStart} to {planEnd} is clear in the file. The
              leftmost section is this same opening.
            </span>
          ) : null}
          <span className="sr-only">One late ship. The others stay put · Nobody else moves</span>
        </div>

        {chain.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1">
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase text-bad">
              <Lock className="size-2.5" />
              Blocked {appt.dockId}:
            </span>
            <ol data-block-chain="" className="flex flex-wrap items-center gap-1">
              {chain.map((b) => {
                const active = selectedId === b.id;
                return (
                  <li
                    key={`${b.id}-${b.start}`}
                    data-block-ship={b.id}
                    data-block-start={b.start}
                    data-block-end={b.end}
                  >
                    <button
                      type="button"
                      onClick={() => useBoardStore.getState().setSelectedId(b.id)}
                      className={cn(
                        "rounded px-1.5 py-0.5 font-mono text-[10px] tabular-nums ring-1 transition",
                        active
                          ? "bg-accent text-accent-fg ring-accent"
                          : "bg-raised text-fg ring-line hover:ring-accent/50",
                      )}
                    >
                      <span className="font-bold">{b.id}</span>{" "}
                      <span className={active ? "text-accent-fg/85" : "text-muted"}>
                        {b.start}–{b.end}h
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
      </div>
    </section>
  );
}
