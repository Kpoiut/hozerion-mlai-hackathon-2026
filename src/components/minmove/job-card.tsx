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

  return (
    <section
      data-job-card=""
      aria-label="Gantt Schedule Board Header"
      className="mb-2.5 rounded-xl bg-surface px-3.5 py-2 shadow-card ring-1 ring-line"
    >
      {/* Row 1: Strictly Single-Line Diff Switch + Equation + Right-Aligned Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
          <div className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-raised p-0.5 ring-1 ring-line">
            <button
              type="button"
              onClick={() =>
                useBoardStore.getState().setForceDock(isPinnedBooked ? undefined : appt.dockId)
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] transition",
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
                  "rounded px-1 py-px text-[10px] font-bold",
                  holdWait > 0 ? "bg-bad/15 text-bad" : "bg-ok/15 text-ok",
                )}
              >
                {holdWait}h
              </span>
            </button>

            <ArrowRight className="size-3 text-muted" />

            <button
              type="button"
              onClick={() => useBoardStore.getState().setForceDock(undefined)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold transition",
                !isPinnedBooked
                  ? "bg-accent text-accent-fg shadow-2xs"
                  : "bg-surface text-muted hover:text-fg",
              )}
            >
              <Sparkles className="size-3" />
              <span>
                Sidecar {planDock} @{planStart}h
              </span>
              <span className="rounded bg-white/20 px-1 py-px text-[10px]">
                {planWait}h
              </span>
            </button>
          </div>

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

          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-ok/12 px-2 py-0.5 font-mono text-[11px] font-semibold text-ok ring-1 ring-ok/25">
            <CheckCircle2 className="size-3" />
            {saved > 0
              ? `-${saved}h (+$${savedUsd.toLocaleString("en-US")}) · Nobody else moves`
              : "One late ship. The others stay put · Nobody else moves"}
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => useBoardStore.getState().reset()}
            className="inline-flex h-7 items-center gap-1 rounded-lg bg-raised px-2 text-[11px] font-medium text-fg ring-1 ring-line hover:bg-surface"
          >
            <RotateCcw className="size-3 text-muted" />
            Restore
          </button>
          <button
            type="button"
            data-open-logistics-setup=""
            onClick={() => useBoardStore.getState().setSetupOpen(true)}
            className="inline-flex h-7 items-center gap-1 rounded-lg bg-raised px-2 text-[11px] font-medium text-fg ring-1 ring-line hover:bg-accent/10 hover:text-accent"
          >
            <SlidersHorizontal className="size-3 text-accent" />
            Setup
          </button>
          <Button
            type="button"
            size="sm"
            onClick={() => useBoardStore.getState().commit()}
            className="h-7 rounded-lg bg-accent px-2.5 text-[11px] font-semibold text-accent-fg shadow-xs hover:bg-accent/90"
          >
            Commit RFC 7396 Patch
          </Button>
        </div>
      </div>

      {/* Row 2: Compact Proof & Blocking Chain */}
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-1.5 text-[11px]">
        <div className="flex flex-wrap items-center gap-1.5 text-muted">
          <span className="font-medium text-fg">{headline}</span>
          {planClear ? (
            <span className="text-ok">
              Berth {planBerthNo} from hour {planStart} to {planEnd} is clear in the file. The
              leftmost section is this same opening.
            </span>
          ) : null}
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
