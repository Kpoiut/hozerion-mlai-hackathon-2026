import { useEffect, useMemo, useState } from "react";
import { clientWeekList, clientYard } from "@/lib/minmove/published-catalog.ts";
import {
  PUBLISHED_DOI,
  PUBLISHED_DOI_URL,
  PUBLISHED_REPO,
  publishedWeekList,
  publishedYard,
  scoreOneHourLate,
  type CallScore,
  type PublishedWeekInfo,
} from "@/lib/minmove/published-week.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";
import { cn } from "@/lib/utils.ts";

function hours(n: number | null): string {
  if (n == null) return "—";
  return `${n} h`;
}

function firstFree(row: CallScore): string {
  if (row.firstWait == null) return "—";
  const berth = row.firstDock?.replace(/^B/, "");
  return berth ? `${berth} · ${row.firstWait} h` : `${row.firstWait} h`;
}

/** Every call in the published week, with the one-hour probe from solve(). */
export function PublishedLedger() {
  const yard = useBoardStore((s) => s.yard);
  const selectedId = useBoardStore((s) => s.selectedId);
  const listed = useMemo(() => publishedWeekList(), []);
  const [weeks, setWeeks] = useState<PublishedWeekInfo[]>(listed);
  const [catalogReady, setCatalogReady] = useState(false);
  useEffect(() => {
    const full = clientWeekList();
    if (full.length) setWeeks(full);
    setCatalogReady(true);
  }, []);
  const week = weeks.find((row) => row.id === yard.id) ?? listed.find((row) => row.id === yard.id);
  const known = listed.some((row) => row.id === yard.id);
  const staticYard = useMemo(() => (known ? publishedYard(yard.id) : null), [known, yard.id]);
  const pristine = (catalogReady ? clientYard(yard.id) : null) ?? staticYard;
  const scores = useMemo(
    () => (yard.timeUnit === "hour" && pristine ? scoreOneHourLate(pristine) : []),
    [yard.timeUnit, pristine],
  );
  if (yard.timeUnit !== "hour" || !week || !pristine) return null;
  const stay = scores.filter((row) => row.matchesBooked).length;
  const beat = scores.filter((row) => (row.versusBooked ?? 0) > 0).length;
  const versusSum = scores.reduce((sum, row) => sum + Math.max(0, row.versusBooked ?? 0), 0);
  const movedSum = scores.reduce((sum, row) => sum + (row.moved ?? 0), 0);
  const leftmostSum = scores.reduce((sum, row) => sum + (row.saved ?? 0), 0);

  return (
    <section className="mt-4 mb-4 overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-line">
      <div className="border-b border-line px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-sm font-semibold tracking-tight text-fg">
              Quay {week.quay} · Week {week.week}
            </h2>
            <span className="rounded-lg bg-raised px-2 py-1 font-mono text-xs font-medium text-muted ring-1 ring-line" data-cite={PUBLISHED_DOI}>
              {week.file} · {week.bksFile} ·{" "}
              <a className="text-accent underline" href={PUBLISHED_DOI_URL} target="_blank" rel="noreferrer">
                {PUBLISHED_DOI}
              </a>{" "}
              ·{" "}
              <a className="text-accent underline" href={PUBLISHED_REPO} target="_blank" rel="noreferrer">
                repo
              </a>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-raised/80 px-2.5 py-1 font-mono text-xs font-semibold text-fg ring-1 ring-line">
              {scores.length} calls
            </span>
            <span className="rounded-lg bg-ok/10 px-2.5 py-1 font-mono text-xs font-semibold text-ok ring-1 ring-ok/25">
              NO_OP: {stay}/{scores.length}
            </span>
            <span className="rounded-lg bg-accent/10 px-2.5 py-1 font-mono text-xs font-semibold text-accent ring-1 ring-accent/25">
              Saved: {versusSum}h ({beat} ships · k={movedSum} · gap {leftmostSum}h)
            </span>
            <span className="rounded-lg bg-ok/15 px-2.5 py-1 font-mono text-xs font-bold text-ok ring-1 ring-ok/30">
              +${(versusSum * 1500).toLocaleString("en-US")}
            </span>
            <select
              data-week-select=""
              value={yard.id}
              aria-label="Published week"
              onChange={(e) => {
                const next = clientYard(e.target.value);
                if (next) useBoardStore.getState().openBuiltYard(next);
              }}
              className="h-8 rounded-lg bg-bg px-2.5 font-mono text-xs font-medium text-fg ring-1 ring-line"
            >
              {weeks.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.quay} · week {row.week} · {row.ships} calls
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="text-xs text-faint">
            <tr className="border-b border-line">
              <th className="px-4 py-2 font-medium">Call</th>
              <th className="px-3 py-2 font-medium">Arrives</th>
              <th className="px-3 py-2 font-medium">Moors</th>
              <th className="px-3 py-2 font-medium">File wait</th>
              <th className="px-3 py-2 font-medium">Berth</th>
              <th className="px-3 py-2 font-medium">Length</th>
              <th className="px-3 py-2 font-medium">Work</th>
              <th className="px-3 py-2 font-medium">Versus booked</th>
              <th className="px-3 py-2 font-medium">Leftmost gap</th>
              <th className="px-3 py-2 font-medium">First free</th>
              <th className="px-3 py-2 font-medium">Next call</th>
              <th className="px-3 py-2 font-medium">Saved then</th>
              <th className="px-3 py-2 font-medium">Plan</th>
              <th className="px-3 py-2 font-medium">Moved</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((row) => {
              const fileWait = row.moor - row.arrival;
              const open = row.id === selectedId;
              return (
                <tr
                  key={row.id}
                  data-ship={row.id}
                  data-saved={row.saved ?? ""}
                  data-versus-booked={row.versusBooked ?? ""}
                  data-arrival={row.arrival}
                  data-moor={row.moor}
                  data-berth={row.berth}
                  data-len={row.len}
                  data-handling={row.handling}
                  data-first-dock={row.firstDock ?? ""}
                  data-next-eta={row.nextEta ?? ""}
                  data-next-saved={row.nextSaved ?? ""}
                  aria-selected={open}
                  onClick={() => useBoardStore.getState().setSelectedId(row.id)}
                  className={cn(
                    "cursor-pointer border-b border-line/80 hover:bg-raised/70",
                    open && "bg-accent/10",
                  )}
                >
                  <td className="px-4 py-2.5 font-mono font-medium tabular-nums">{row.id}</td>
                  <td className="px-3 py-2.5 font-mono tabular-nums">{row.arrival}h</td>
                  <td className="px-3 py-2.5 font-mono tabular-nums">{row.moor}h</td>
                  <td className="px-3 py-2.5 font-mono tabular-nums">{fileWait}h</td>
                  <td className="px-3 py-2.5 font-mono tabular-nums">{row.berth.replace(/^B/, "")}</td>
                  <td className="px-3 py-2.5 font-mono tabular-nums">{row.len}</td>
                  <td className="px-3 py-2.5 font-mono tabular-nums">{row.handling}h</td>
                  <td className={cn("px-3 py-2.5 font-mono tabular-nums", (row.versusBooked ?? 0) > 0 ? "text-ok" : "text-muted")}>
                    {hours(row.versusBooked)}
                  </td>
                  <td className="px-3 py-2.5 font-mono tabular-nums text-muted">{hours(row.saved)}</td>
                  <td className="px-3 py-2.5 font-mono tabular-nums text-muted">{firstFree(row)}</td>
                  <td className="px-3 py-2.5 font-mono tabular-nums text-muted">{row.nextEta == null ? "—" : `${row.nextEta}h`}</td>
                  <td className={cn("px-3 py-2.5 font-mono tabular-nums", (row.nextSaved ?? 0) > 0 ? "text-ok" : "text-muted")}>
                    {hours(row.nextSaved)}
                  </td>
                  <td className="px-3 py-2.5 font-mono tabular-nums">{row.dock?.replace(/^B/, "") ?? "—"}</td>
                  <td className="px-3 py-2.5 font-mono tabular-nums">{row.moved ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
