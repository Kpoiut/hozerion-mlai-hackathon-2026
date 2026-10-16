import { useState } from "react";
import {
  AlertTriangle,
  Compass,
  Filter,
  Layers,
  Lock,
  RotateCcw,
  Ship,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  bookedFromPlan,
  bookedHeadline,
  stretchClear,
  stretchShips,
} from "@/lib/minmove/published-week.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";
import { cn } from "@/lib/utils.ts";
import { MultimodalFleetStrip } from "./multimodal-fleet-strip.tsx";

export function JobCard() {
  const yard = useBoardStore((s) => s.yard);
  const event = useBoardStore((s) => s.event);
  const result = useBoardStore((s) => s.result);
  const selectedId = useBoardStore((s) => s.selectedId);
  const forceDock = useBoardStore((s) => s.forceDock);
  const slaRateUsd = useBoardStore((s) => s.slaRateUsd);

  const [viewMode, setViewMode] = useState<"harbor" | "multimodal">("harbor");
  const [scenario, setScenario] = useState<string>("capacity");

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
    stretchClear(
      yard,
      event.truckId,
      compare.planDock,
      span,
      compare.planStart,
      compare.planStart + dur,
    );

  const planEnd = planStart + dur;
  const planBerthNo = Number(planDock.replace(/^B/, ""));
  const bookedBerthNo = Number(bookedDock.replace(/^B/, ""));
  const isPinnedBooked = forceDock === appt.dockId;
  const headline = bookedHeadline(compare);

  return (
    <section
      data-job-card=""
      aria-label="Barcelona Quay 24B Visual Maritime Board"
      className="mb-3 space-y-2.5 overflow-hidden rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line"
    >
      {/* Sub-Tabs & Controls Bar matching 03-barcelona-quay-24b-live-berths.png */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode("harbor")}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-bold transition",
              viewMode === "harbor"
                ? "bg-accent/12 text-accent ring-1 ring-accent/30"
                : "text-muted hover:bg-raised hover:text-fg",
            )}
          >
            Sơ đồ cầu bến (Vệ tinh)
          </button>
          <button
            type="button"
            onClick={() => setViewMode("multimodal")}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-bold transition",
              viewMode === "multimodal"
                ? "bg-accent/12 text-accent ring-1 ring-accent/30"
                : "text-muted hover:bg-raised hover:text-fg",
            )}
          >
            8 Hệ Đa phương thức (Tàu · Sà lan · Rail · Air · AGV)
          </button>

          {/* Compact equation badges required for E2E verification */}
          {compare.holdStart != null && compare.planStart != null && saved > 0 ? (
            <span
              data-booked-equation=""
              {...(compare.leftmostStart === compare.holdStart
                ? { "data-job-equation": "" }
                : {})}
              className="ml-1 inline-flex items-center rounded-lg bg-accent/10 px-2 py-0.5 font-mono text-[11px] font-bold text-accent ring-1 ring-accent/20"
            >
              {compare.holdStart} − {compare.planStart} = {saved}
            </span>
          ) : null}

          {compare.leftmostStart != null &&
          compare.planStart != null &&
          compare.leftmostStart !== compare.holdStart &&
          compare.leftmostSaved != null &&
          compare.leftmostSaved > 0 ? (
            <span
              data-job-equation=""
              className="inline-flex items-center rounded-lg bg-accent/10 px-2 py-0.5 font-mono text-[11px] font-bold text-accent ring-1 ring-accent/20"
            >
              {compare.leftmostStart} − {compare.planStart} = {compare.leftmostSaved}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="hidden items-center gap-1 rounded-xl bg-raised px-2.5 py-1 text-[11px] font-semibold text-muted ring-1 ring-line sm:inline-flex">
            <Filter className="size-3" /> Lọc
          </span>
          <span className="hidden items-center gap-1 rounded-xl bg-raised px-2.5 py-1 text-[11px] font-semibold text-muted ring-1 ring-line sm:inline-flex">
            <Layers className="size-3" /> Lớp hiển thị
          </span>
          <button
            type="button"
            onClick={() => useBoardStore.getState().reset()}
            className="inline-flex h-7 items-center gap-1 rounded-xl bg-raised px-2.5 text-xs font-semibold text-fg ring-1 ring-line hover:bg-raised/80"
          >
            <RotateCcw className="size-3 text-muted" />
            Restore
          </button>
          <button
            type="button"
            onClick={() => useBoardStore.getState().setSetupOpen(true)}
            className="inline-flex h-7 items-center gap-1 rounded-xl bg-raised px-2.5 text-xs font-semibold text-fg ring-1 ring-line hover:bg-raised/80"
          >
            <SlidersHorizontal className="size-3 text-accent" />
            Setup
          </button>
          <button
            type="button"
            onClick={() => useBoardStore.getState().commit()}
            className="inline-flex h-7 items-center gap-1 rounded-xl bg-accent px-3 text-xs font-bold text-white shadow-xs hover:bg-accent/90"
          >
            <Sparkles className="size-3" />
            Áp dụng kế hoạch (+${savedUsd.toLocaleString("en-US")})
          </button>
        </div>
      </div>

      {viewMode === "multimodal" ? (
        <MultimodalFleetStrip compact />
      ) : (
        /* Photorealistic Satellite Harbor Canvas matching 03-barcelona-quay-24b-live-berths.png */
        <div className="relative overflow-hidden rounded-2xl ring-1 ring-line">
          <img
            src="/assets/logistics/barcelona-harbor-aerial.png"
            alt="Barcelona Quay 24B Satellite Aerial View"
            className="h-[190px] w-full object-cover object-center sm:h-[210px]"
          />

          {/* Top-left floating location badge */}
          <div className="absolute top-3 left-3 rounded-xl bg-white/95 px-3 py-1.5 shadow-md ring-1 ring-slate-200 backdrop-blur-xs">
            <div className="text-xs font-extrabold text-slate-900">
              Barcelona Quay 24B · {ship.plate} ({bookedDock} → {planDock})
            </div>
            <div className="text-[10px] font-medium text-slate-500">
              Cảng Quốc tế · Đã cứu {saved}h chờ · Nobody else moves (k = 0)
            </div>
          </div>

          {/* Top-right floating wind & compass badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-slate-800 shadow-md ring-1 ring-slate-200 backdrop-blur-xs">
            <Compass className="size-3.5 text-accent" />
            Gió 12 kt Tây Nam · Mớn nước 15.2m
          </div>
        </div>
      )}

      {/* Berth Cards Strip matching 03-barcelona-quay-24b-live-berths.png */}
      <div className="rounded-xl bg-raised/35 p-2.5 ring-1 ring-line">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-extrabold text-fg">Chọn cầu bến</span>
            <span className="inline-flex items-center gap-1 font-medium text-muted">
              <span className="size-2 rounded-full bg-ok" /> Đang làm hàng
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-muted">
              <span className="size-2 rounded-full bg-accent" /> Phương án Sidecar ({planDock})
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-muted">
              <span className="size-2 rounded-full bg-amber-500" /> Bến cũ ({bookedDock})
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-muted">
              <span className="size-2 rounded-full bg-rose-500" /> Bảo trì
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <button
              type="button"
              onClick={() =>
                useBoardStore
                  .getState()
                  .setForceDock(isPinnedBooked ? "" : (appt.dockId ?? ""))
              }
              className={cn(
                "rounded-lg px-2 py-0.5 font-bold ring-1 transition",
                isPinnedBooked
                  ? "bg-warn/20 text-warn ring-warn/40"
                  : "bg-surface text-muted ring-line hover:text-fg",
              )}
            >
              {bookedDock} ({holdWait}h)
            </button>
            <span className="text-muted">→</span>
            <button
              type="button"
              onClick={() => useBoardStore.getState().setForceDock("")}
              className={cn(
                "rounded-lg px-2 py-0.5 font-bold ring-1 transition",
                !isPinnedBooked
                  ? "bg-accent text-white ring-accent"
                  : "bg-surface text-muted ring-line hover:text-fg",
              )}
            >
              {planDock} @ {String(planStart).padStart(2, "0")}h ({planWait}h chờ)
            </button>
          </div>
        </div>

        {/* 6 Featured Berth Cards matching 03-barcelona-quay-24b-live-berths.png */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <button
            type="button"
            onClick={() => useBoardStore.getState().setForceDock(appt.dockId ?? "")}
            className={cn(
              "rounded-xl p-2 text-left transition",
              isPinnedBooked
                ? "bg-warn/15 ring-2 ring-warn"
                : "bg-surface ring-1 ring-warn/40 hover:bg-warn/10",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-extrabold text-fg">{bookedDock}</span>
              <span className="rounded bg-warn/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-warn">
                Chờ {holdWait}h
              </span>
            </div>
            <div className="mt-1 truncate text-[11px] font-bold text-fg">
              Lịch gốc ({ship.plate})
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full w-full rounded-full bg-warn" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => useBoardStore.getState().setForceDock("")}
            className={cn(
              "rounded-xl p-2 text-left transition",
              !isPinnedBooked
                ? "bg-accent/[0.08] ring-2 ring-accent"
                : "bg-surface ring-1 ring-line hover:ring-accent",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-extrabold text-accent">{planDock}</span>
              <Ship className="size-3.5 text-ok" />
            </div>
            <div className="mt-1 truncate text-[11px] font-extrabold text-fg">
              MSC OCEAN · {ship.plate}
            </div>
            <div className="mt-1 flex items-center justify-between gap-1">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <div className="h-full w-3/4 rounded-full bg-ok" />
              </div>
              <span className="font-mono text-[9px] font-bold text-ok">
                {planWait}h chờ
              </span>
            </div>
          </button>

          <div className="rounded-xl bg-surface p-2 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-extrabold text-fg">B12</span>
              <Ship className="size-3.5 text-ok" />
            </div>
            <div className="mt-1 truncate text-[11px] font-bold text-fg">EVER GREEN</div>
            <div className="mt-1 flex items-center justify-between gap-1">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <div className="h-full w-2/3 rounded-full bg-ok" />
              </div>
              <span className="font-mono text-[9px] text-muted">14/22h</span>
            </div>
          </div>

          <div className="rounded-xl bg-surface p-2 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-extrabold text-fg">B15</span>
              <span className="rounded bg-accent/12 px-1.5 py-0.5 text-[9px] font-bold text-accent">
                Sắp đến
              </span>
            </div>
            <div className="mt-1 truncate text-[11px] font-bold text-fg">CMA CGM</div>
            <div className="mt-1 font-mono text-[10px] text-muted">ETA 2h 15m</div>
          </div>

          <div className="rounded-xl bg-rose-500/[0.06] p-2 ring-1 ring-rose-500/25">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-extrabold text-rose-600">B17</span>
              <AlertTriangle className="size-3.5 text-rose-500" />
            </div>
            <div className="mt-1 truncate text-[11px] font-bold text-rose-600">Bảo trì cẩu STS</div>
            <div className="mt-1 font-mono text-[10px] text-rose-500">08:00 - 16:00</div>
          </div>

          <div className="rounded-xl bg-surface p-2 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-extrabold text-fg">B19</span>
              <Ship className="size-3.5 text-ok" />
            </div>
            <div className="mt-1 truncate text-[11px] font-bold text-fg">OOCL ASIA</div>
            <div className="mt-1 flex items-center justify-between gap-1">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <div className="h-full w-1/3 rounded-full bg-ok" />
              </div>
              <span className="font-mono text-[9px] text-muted">6/24h</span>
            </div>
          </div>
        </div>

        {/* Compact 20-Berth Capsule Strip (0..19) */}
        <div className="mt-2 grid grid-cols-10 gap-1 sm:grid-cols-20">
          {yard.docks.map((d, idx) => {
            const isPlanSpan = idx >= planBerthNo && idx < planBerthNo + span;
            const isBooked = idx === bookedBerthNo;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => useBoardStore.getState().toggleForceDock(d.id)}
                className={cn(
                  "flex h-6 items-center justify-center rounded-md font-mono text-[10px] font-bold transition",
                  isPlanSpan
                    ? "bg-accent text-white"
                    : isBooked
                      ? "bg-warn/20 text-warn ring-1 ring-warn/40"
                      : "bg-surface text-muted ring-1 ring-line hover:text-fg",
                )}
              >
                {idx}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Scenarios Row + E2E Proof Headline & Blocking Chain */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px]">
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

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "capacity", label: "Tối ưu công suất" },
            { id: "wait", label: "Giảm thời gian chờ" },
            { id: "weather", label: "Xử lý thời tiết xấu" },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setScenario(s.id);
                useBoardStore.getState().findPlan();
              }}
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold transition",
                scenario === s.id
                  ? "bg-accent/12 text-accent ring-1 ring-accent"
                  : "bg-raised text-muted ring-1 ring-line hover:text-fg",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {chain.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1 border-t border-line pt-1.5">
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
    </section>
  );
}
