import { ArrowRight, CheckCircle2, Lock, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";
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
  const savedUsd = Math.max(0, saved) * slaRateUsd;

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
  const planBerthNo = planDock.replace(/^B/, "");
  const isPinnedBooked = forceDock === appt.dockId;
  const headline = bookedHeadline(compare);
  const sameAsLeftmost = (compare.leftmostSaved ?? 0) === 0;

  return (
    <section
      data-job-card=""
      aria-label="Gantt Schedule Board Header"
      className="mb-3 rounded-2xl bg-surface px-4 py-3 shadow-card ring-1 ring-line"
    >
      {/* Top SaaS Bar matching Mockup: Title | Visual Diff Pill | Equation | Commit RFC 7396 Patch */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-sm font-bold tracking-tight text-fg">Gantt Schedule Board</span>
          <span className="text-xs font-medium text-muted">Visual diff:</span>

          {/* Interactive Booked -> Sidecar Plan Pill */}
          <div className="inline-flex flex-wrap items-center gap-1.5 rounded-xl bg-raised p-1 ring-1 ring-line">
            <button
              type="button"
              onClick={() =>
                useBoardStore.getState().setForceDock(isPinnedBooked ? undefined : appt.dockId)
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-xs transition",
                isPinnedBooked
                  ? "bg-warn/20 font-semibold text-warn ring-1 ring-warn"
                  : "bg-surface text-fg shadow-2xs hover:bg-raised",
              )}
              title="Click to test pinning to Booked Berth"
            >
              <span>
                Booked {bookedDock} @{bookedStart}h
              </span>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-bold",
                  holdWait > 0 ? "bg-bad/15 text-bad" : "bg-ok/15 text-ok",
                )}
              >
                wait {holdWait}h
              </span>
            </button>

            <ArrowRight className="size-3.5 text-muted" />

            <button
              type="button"
              onClick={() => useBoardStore.getState().setForceDock(undefined)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-xs font-semibold transition",
                !isPinnedBooked
                  ? "bg-accent text-accent-fg shadow-2xs"
                  : "bg-surface text-muted hover:text-fg",
              )}
            >
              <Sparkles className="size-3" />
              <span>
                Optimal Sidecar {planDock} @{planStart}h
              </span>
              <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]">
                wait {planWait}h
              </span>
            </button>
          </div>

          {compare.holdStart != null && compare.planStart != null && saved > 0 ? (
            <span
              data-booked-equation=""
              {...(compare.leftmostStart === compare.holdStart ? { "data-job-equation": "" } : {})}
              className="rounded-lg bg-accent/10 px-2.5 py-1 font-mono text-xs font-semibold tabular-nums text-accent ring-1 ring-accent/20"
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
              className="rounded-lg bg-accent/10 px-2.5 py-1 font-mono text-xs font-semibold tabular-nums text-accent ring-1 ring-accent/20"
            >
              {compare.leftmostStart} − {compare.planStart} = {compare.leftmostSaved}
            </span>
          ) : null}

          <span className="inline-flex items-center gap-1 rounded-full bg-ok/12 px-2.5 py-1 font-mono text-xs font-semibold text-ok ring-1 ring-ok/25">
            <CheckCircle2 className="size-3.5" />
            {saved > 0
              ? `-${saved}h (+$${savedUsd.toLocaleString("en-US")}) · Nobody else moves`
              : "One late ship. The others stay put · Nobody else moves"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => useBoardStore.getState().reset()}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-raised px-3 text-xs font-medium text-fg ring-1 ring-line hover:bg-surface"
          >
            <RotateCcw className="size-3.5 text-muted" />
            Restore
          </button>
          <button
            type="button"
            data-open-logistics-setup=""
            onClick={() => useBoardStore.getState().setSetupOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-raised px-3 text-xs font-medium text-fg ring-1 ring-line hover:bg-accent/10 hover:text-accent"
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
            Commit RFC 7396 Patch
          </Button>
        </div>
      </div>

      {/* Compact Single-Line Proof & Blocking Vessel Pills */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-2 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-muted">
          <span className="font-medium text-fg">{headline}</span>
          {planClear ? (
            <span className="text-ok">
              Berth {planBerthNo} from hour {planStart} to {planEnd} is clear in the file. The
              leftmost section is this same opening.
            </span>
          ) : null}
        </div>

        {chain.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase text-bad">
              <Lock className="size-3" />
              Blocked on {appt.dockId}:
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
                        "rounded-md px-1.5 py-0.5 font-mono text-[11px] tabular-nums ring-1 transition",
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
