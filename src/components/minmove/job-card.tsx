import { useMemo } from "react";
import { Anchor, ArrowRight, Boxes, Cpu, FileCheck2, Network, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { bookedFromPlan, bookedHeadline, stretchClear, stretchShips } from "@/lib/minmove/published-week.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";
import { cn } from "@/lib/utils.ts";

/** Why a terminal opens this: the booked stretch is taken, the other ships stay, a clear stretch is named. */
export function JobCard() {
  const yard = useBoardStore((s) => s.yard);
  const result = useBoardStore((s) => s.result);
  const event = useBoardStore((s) => s.event);
  const selectedId = useBoardStore((s) => s.selectedId);
  const compare = useMemo(
    () => (yard.timeUnit === "hour" && event ? bookedFromPlan(yard, event, result ?? undefined) : null),
    [yard, event, result],
  );
  if (yard.timeUnit !== "hour") return null;

  const truck = yard.trucks.find((t) => t.id === selectedId);
  const appt = yard.appointments.find((a) => a.truckId === selectedId);
  const span = truck?.span ?? 1;
  const berth = appt ? appt.dockId.replace(/^B/, "") : "";
  const chain =
    compare && appt && event && compare.holdStart != null && compare.holdStart > event.newEtaMin
      ? stretchShips(yard, selectedId, appt.dockId, span, event.newEtaMin, compare.holdStart)
      : [];
  const planEnd = compare?.planStart != null && truck ? compare.planStart + truck.durationMin : null;
  const planClear =
    compare?.planDock != null && compare.planStart != null && planEnd != null
      ? stretchClear(yard, selectedId, compare.planDock, span, compare.planStart, planEnd)
      : false;
  const leftmostDiffers =
    compare != null &&
    compare.leftmostStart != null &&
    compare.planStart != null &&
    compare.leftmostSaved != null &&
    (compare.leftmostDock !== compare.holdDock || compare.leftmostStart !== compare.holdStart);

  const savedHours = Math.max(0, compare?.saved ?? 0);
  const savedUsd = savedHours * 1500;
  const isNoOp = compare?.matches && (compare?.planWait ?? 0) === 0;

  return (
    <section data-job="one" className="mb-4 rounded-2xl bg-surface px-4 py-4 shadow-card ring-1 ring-line sm:px-5">
      {/* Top Executive Status & Telemetry Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent">
            The job · Điều Độ Cầu Bến Không Xâm Lấn
          </span>
          {isNoOp ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-ok/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-ok">
              <ShieldCheck className="size-3.5" />
              NO_OP_KEEP_HOST_PLAN · Cầu gốc vẫn trống (Giữ nguyên 100% TOS)
            </span>
          ) : savedHours > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-ok/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-ok">
              <Sparkles className="size-3.5" />
              APPLY_MINIMAL_DIFF_PATCH · Cứu {savedHours}h tàu chờ (+${savedUsd.toLocaleString("en-US")} USD)
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted">
          <span className="rounded bg-raised px-2 py-0.5 ring-1 ring-line">
            V8 Zero-Alloc: <strong className="text-fg">{result?.ms ?? 0}ms</strong>
          </span>
          <span className="rounded bg-raised px-2 py-0.5 ring-1 ring-line">
            Go 1.26.5: <strong className="text-ok">5.15µs/ca (536×)</strong>
          </span>
          <span className="rounded bg-ok/10 px-2 py-0.5 text-ok ring-1 ring-ok/30">
            k = {compare?.planMoves ?? 0} tàu khác bị dời
          </span>
        </div>
      </div>

      {/* Main Headline & Core Explanations (Preserving exact e2e test copy + Vietnamese executive context) */}
      <div className="mt-3 grid gap-4 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-fg">Hozerion</h2>
            <span className="text-xs font-medium text-accent">
              · Universal Non-Invasive Berth &amp; Logistics Sidecar
            </span>
          </div>
          <p className="mt-0.5 text-sm font-medium text-fg">
            One late ship. The others stay put.{" "}
            <span className="font-normal text-muted">
              (Một tàu đến trễ — tìm đoạn cầu trống vừa khít, giữ nguyên 100% lịch các tàu khác trên TOS).
            </span>
          </p>
          <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-muted sm:text-sm">
            Use this when the booked stretch is taken. The solver names a stretch that fits the late ship for the whole job, and leaves every other ship on its published time.
          </p>
          {truck && appt ? (
            <p className="mt-2.5 rounded-xl bg-raised/60 px-3 py-2 text-xs leading-relaxed text-fg ring-1 ring-line sm:text-sm">
              <span className="font-mono font-semibold text-accent">{truck.id}</span> in the file moors at berth {berth} at hour {appt.startMin}, and works {truck.durationMin}h across {span} {span === 1 ? "berth" : "berths"}.
              {event ? ` This probe arrives at hour ${event.newEtaMin}.` : " The probe arrives one hour after that mooring."}
            </p>
          ) : (
            <p className="mt-2.5 text-sm text-muted">Pick a call. The probe arrives one hour after its published mooring.</p>
          )}

          {compare && compare.planStatus !== "OPTIMAL" ? (
            <p className="mt-2 text-sm text-bad">The solver did not write a plan ({compare.planStatus}).</p>
          ) : null}

          {compare && compare.planStatus === "OPTIMAL" ? (
            <div className="mt-2.5 space-y-1.5">
              <p className="text-sm font-semibold leading-relaxed text-fg" data-booked-headline="">
                {bookedHeadline(compare)}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {compare.holdStart != null && compare.planStart != null && compare.saved != null ? (
                  <p className="rounded-lg bg-ok/10 px-2.5 py-1 font-mono text-sm font-bold tabular-nums text-ok ring-1 ring-ok/30" data-booked-equation="">
                    {compare.holdStart} − {compare.planStart} = {compare.saved}
                  </p>
                ) : null}
                <p className="text-xs font-medium text-muted sm:text-sm">
                  {compare.planMoves === 0 ? "Nobody else moves." : `${compare.planMoves} other calls move.`}{" "}
                  <span className="text-ok">(Bảo toàn 100% lịch các tàu khác)</span>
                </p>
              </div>

              {planClear && compare.planDock && compare.planStart != null && planEnd != null ? (
                <p className="text-xs leading-relaxed text-muted sm:text-sm">
                  Berth {compare.planDock.replace(/^B/, "")} from hour {compare.planStart} to {planEnd} is clear in the file.
                </p>
              ) : null}

              {leftmostDiffers ? (
                <p className="text-xs leading-relaxed text-muted sm:text-sm">
                  Leftmost section is berth {compare.leftmostDock?.replace(/^B/, "")} at hour {compare.leftmostStart}. That gap is not the booking.
                  <span className="mt-1 block font-mono text-sm font-semibold text-fg tabular-nums" data-job-equation="">
                    {compare.leftmostStart} − {compare.planStart} = {compare.leftmostSaved}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-muted">The leftmost section is this same opening.</p>
              )}
            </div>
          ) : null}
        </div>

        {/* Right Column: Visual Before-vs-After Comparison & Blocking Chain */}
        <div className="min-w-0 space-y-2.5 lg:col-span-5">
          {compare && compare.planStatus === "OPTIMAL" ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className={cn("rounded-xl p-3 ring-1", savedHours > 0 ? "bg-bad/5 ring-bad/30" : "bg-raised/70 ring-line")}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">
                  1. Giữ Cầu Đã Đặt (Stay Booked)
                </p>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="font-mono text-base font-bold text-fg">
                    Berth {compare.holdDock?.replace(/^B/, "") ?? berth}
                  </span>
                  <span className="font-mono text-xs text-muted">@ {compare.holdStart ?? "—"}h</span>
                </div>
                <p className={cn("mt-1 font-mono text-xs font-semibold", (compare.holdWait ?? 0) > 0 ? "text-bad" : "text-ok")}>
                  Chờ: {compare.holdWait ?? 0}h{" "}
                  {(compare.holdWait ?? 0) > 0 ? `(-$${((compare.holdWait ?? 0) * 1500).toLocaleString("en-US")})` : "(Trống ngay)"}
                </p>
              </div>

              <div className="rounded-xl bg-ok/10 p-3 ring-1 ring-ok/30">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ok">
                  2. Phương Án Sidecar (Plan k=0)
                </p>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="font-mono text-base font-bold text-fg">
                    Berth {compare.planDock?.replace(/^B/, "") ?? "—"}
                  </span>
                  <span className="font-mono text-xs text-ok">@ {compare.planStart ?? "—"}h</span>
                </div>
                <p className="mt-1 font-mono text-xs font-semibold text-ok">
                  Chờ: {compare.planWait ?? 0}h · Cứu {savedHours}h (+${savedUsd.toLocaleString("en-US")})
                </p>
              </div>
            </div>
          ) : null}

          {chain.length > 0 ? (
            <div className="rounded-xl bg-raised/60 p-3 ring-1 ring-line">
              <p className="text-xs leading-relaxed text-muted">
                From hour {event?.newEtaMin} the booked stretch stays occupied until hour {compare?.holdStart}. These ships are already published there. Waiting them out is the alternative.
              </p>
              <ul className="mt-2 grid grid-cols-2 gap-1" data-block-chain="">
                {chain.map((ship) => (
                  <li
                    key={ship.id}
                    data-block-ship={ship.id}
                    data-block-start={ship.start}
                    data-block-end={ship.end}
                    className="rounded bg-surface px-2 py-0.5 font-mono text-xs tabular-nums text-muted ring-1 ring-line/60"
                  >
                    {ship.id} · berth {ship.dock.replace(/^B/, "")} · {ship.start}–{ship.end}
                  </li>
                ))}
              </ul>
            </div>
          ) : compare?.matches && compare.planWait === 0 ? (
            <div className="rounded-xl bg-ok/10 p-3 ring-1 ring-ok/30">
              <p className="text-xs leading-relaxed text-fg">
                No published ship is on this stretch at the new arrival. Staying is the plan.{" "}
                <span className="font-mono text-ok">(Plugin phát lệnh NO_OP_KEEP_HOST_PLAN)</span>
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Quick-Switch Action Bar for All 7 Enterprise Capabilities */}
      <div className="mt-3.5 border-t border-line/70 pt-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
          Chuyển Nhanh Giữa Các Kịch Bản &amp; 7 Trụ Cột Năng Lực Cốt Lõi:
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            data-open-free=""
            onClick={() => useBoardStore.getState().openWeek("bcn-24B-2")}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-bg px-3 text-xs font-medium text-fg ring-1 ring-line hover:bg-raised"
          >
            <ShieldCheck className="size-3.5 text-ok" />
            Berth still free (Thử ca NO_OP Tuần 2)
          </button>
          <button
            type="button"
            onClick={() => useBoardStore.getState().openPublished()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-bg px-3 text-xs font-medium text-fg ring-1 ring-line hover:bg-raised"
          >
            <Sparkles className="size-3.5 text-accent" />
            Ca Kẹt 193h (Tuần 47 · S8)
          </button>
          <button
            type="button"
            onClick={() => useBoardStore.getState().setTab("mlai")}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-accent-fg shadow-sm hover:opacity-95"
          >
            <Sparkles className="size-3.5" />
            AI Agent, Escalation Referee &amp; Bản Đồ VETC (MLAI Track 1-2-3)
          </button>
          <button
            type="button"
            onClick={() => useBoardStore.getState().setTab("sidecar")}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ok/15 px-3 text-xs font-semibold text-ok ring-1 ring-ok/30 hover:bg-ok/20"
          >
            <Cpu className="size-3.5" />
            Plugin Sidecar Đa Năng &amp; Benchmark Go/Rust (536×)
          </button>
          <button
            type="button"
            onClick={() => useBoardStore.getState().setTab("bacap")}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent/10 px-3 text-xs font-medium text-accent ring-1 ring-accent/30 hover:bg-accent/15"
          >
            <Anchor className="size-3.5" />
            BACAP-R · Cẩu bờ STS &amp; Trung chuyển
          </button>
          <button
            type="button"
            onClick={() => useBoardStore.getState().setTab("federation")}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-bg px-3 text-xs font-medium text-fg ring-1 ring-line hover:bg-raised"
          >
            <Network className="size-3.5 text-accent" />
            Liên thông 5 Cảng TP.HCM (TOPOVN ↔ VTOS ↔ N4)
          </button>
          <button
            type="button"
            onClick={() => useBoardStore.getState().setTab("docs")}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-bg px-3 text-xs font-medium text-fg ring-1 ring-line hover:bg-raised"
          >
            <FileCheck2 className="size-3.5 text-ok" />
            Đối soát Hải quan VNACCS · eDO · ISO 6346
          </button>
          <button
            type="button"
            onClick={() => useBoardStore.getState().setTab("microtos")}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-bg px-3 text-xs font-medium text-fg ring-1 ring-line hover:bg-raised"
          >
            <Boxes className="size-3.5 text-warn" />
            Micro-TOS · Bãi 3D RTG &amp; Hoán đổi Slot Kho
          </button>
          <Link
            to="/design"
            className="inline-flex h-9 items-center gap-1 rounded-lg bg-raised px-3 text-xs font-medium text-fg ring-1 ring-line hover:bg-surface"
          >
            Kiến trúc &amp; P&amp;L Toàn cục
            <ArrowRight className="size-3.5 text-accent" />
          </Link>
        </div>
      </div>
    </section>
  );
}


