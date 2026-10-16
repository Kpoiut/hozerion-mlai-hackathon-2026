import { useMemo } from "react";
import { ArrowRight, Calendar, Lock, SlidersHorizontal, Sparkles } from "lucide-react";
import { bookedFromPlan, bookedHeadline, stretchClear, stretchShips } from "@/lib/minmove/published-week.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";
import { cn } from "@/lib/utils.ts";

/**
 * Refined Interactive Berth & Vessel Control Strip (matching attachments/image.png aesthetic).
 * Zero decorative dark boxes or prose walls; every badge is an interactive control.
 */
export function JobCard() {
  const yard = useBoardStore((s) => s.yard);
  const result = useBoardStore((s) => s.result);
  const event = useBoardStore((s) => s.event);
  const selectedId = useBoardStore((s) => s.selectedId);
  const holdOn = useBoardStore((s) => s.holdOn);
  const slaRateUsd = useBoardStore((s) => s.slaRateUsd);

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
  const savedUsd = savedHours * slaRateUsd;
  const headlineText = compare ? bookedHeadline(compare) : "One late ship. The others stay put.";

  return (
    <section data-job="one" className="mb-2.5 rounded-2xl bg-surface px-4 py-2.5 shadow-card ring-1 ring-line">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Interactive Booked -> Plan Slot Comparison Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => useBoardStore.getState().hold()}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium ring-1 transition",
              holdOn ? "bg-bad/15 text-bad ring-bad/40" : "bg-raised/70 text-muted ring-line hover:text-fg",
            )}
            title="Click to hold on booked berth"
          >
            <Calendar className="size-3.5 text-bad" />
            <span>Booked {compare?.holdDock ?? `B${berth}`}</span>
            <span className="font-mono font-semibold text-fg">@{compare?.holdStart ?? "—"}h</span>
            <span className="rounded bg-bad/10 px-1 py-0.5 font-mono text-[10px] font-semibold text-bad">
              wait {compare?.holdWait ?? 0}h
            </span>
          </button>

          <ArrowRight className="size-3.5 text-faint" />

          <button
            type="button"
            onClick={() => {
              useBoardStore.setState({ holdOn: false, forceDock: "" });
              useBoardStore.getState().findPlan();
            }}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium ring-1 transition",
              !holdOn ? "bg-accent/10 text-accent ring-accent/30" : "bg-raised/70 text-muted ring-line hover:text-fg",
            )}
            title="Click to apply optimal k=0 berth plan"
          >
            <Sparkles className="size-3.5 text-accent" />
            <span>Plan {compare?.planDock ?? "—"}</span>
            <span className="font-mono font-semibold">@{compare?.planStart ?? "—"}h</span>
            <span className="rounded bg-ok/15 px-1 py-0.5 font-mono text-[10px] font-semibold text-ok">
              wait {compare?.planWait ?? 0}h
            </span>
          </button>

          {compare && compare.holdStart != null && compare.planStart != null ? (
            <span
              data-booked-equation=""
              className="inline-flex h-8 items-center rounded-xl bg-raised/70 px-2.5 font-mono text-xs font-semibold tabular-nums text-accent ring-1 ring-line"
            >
              {compare.holdStart} − {compare.planStart} = {compare.saved ?? 0}
            </span>
          ) : null}

          {leftmostDiffers && compare ? (
            <span
              data-job-equation=""
              className="inline-flex h-8 items-center rounded-xl bg-raised/70 px-2.5 font-mono text-xs font-semibold tabular-nums text-accent ring-1 ring-line"
            >
              {compare.leftmostStart} − {compare.planStart} = {compare.leftmostSaved}
            </span>
          ) : null}

          <span className="inline-flex h-8 items-center gap-1 rounded-xl bg-ok/10 px-2.5 font-mono text-xs font-semibold text-ok ring-1 ring-ok/25">
            {savedHours > 0 ? `-${savedHours}h (+$${savedUsd.toLocaleString("en-US")})` : "Optimal Hold"} ·{" "}
            {compare?.planMoves === 0 ? "Nobody else moves" : `${compare?.planMoves ?? 0} moved`}
          </span>
        </div>

        {/* Right: Headline + Self-Setup Button */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted">{headlineText}</span>
          <span className="sr-only">One late ship. The others stay put.</span>
          <button
            type="button"
            onClick={() => useBoardStore.getState().setSetupOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-raised px-2.5 text-xs font-medium text-fg ring-1 ring-line hover:bg-accent/10 hover:text-accent hover:ring-accent/30"
          >
            <SlidersHorizontal className="size-3.5 text-accent" />
            Tự Setup Bãi/Cảng
          </button>
        </div>
      </div>

      {/* Interactive Blocking Chain Chips (Click any vessel chip to inspect it on Gantt) */}
      {(chain.length > 0 || (planClear && compare && compare.planStart != null && planEnd != null)) ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-line/60 pt-2">
          {planClear && compare && compare.planStart != null && planEnd != null ? (
            <span className="font-mono text-[11px] text-ok">
              Berth {compare.planDock?.replace(/^B/, "")} from hour {compare.planStart} to {planEnd} is clear in the file.
              {!leftmostDiffers && compare.saved && compare.saved > 0 ? " The leftmost section is this same opening." : ""}
            </span>
          ) : null}
          {chain.length > 0 ? (
            <>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase text-faint">
                <Lock className="size-3 text-bad" />
                Blocked on B{berth}:
              </span>
              <ol data-block-chain="" className="flex flex-wrap items-center gap-1 font-mono text-[11px] tabular-nums">
                {chain.map((b) => (
                  <li
                    key={b.id}
                    data-block-ship={b.id}
                    data-block-start={b.start}
                    data-block-end={b.end}
                  >
                    <button
                      type="button"
                      onClick={() => useBoardStore.getState().setSelectedId(b.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-raised px-1.5 py-0.5 text-[11px] font-medium text-fg ring-1 ring-line transition hover:bg-accent/10 hover:text-accent hover:ring-accent/30"
                      title={`Click to inspect ${b.id} on Gantt`}
                    >
                      <span className="font-bold">{b.id}</span>
                      <span className="text-muted">
                        {b.start}–{b.end}h
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
