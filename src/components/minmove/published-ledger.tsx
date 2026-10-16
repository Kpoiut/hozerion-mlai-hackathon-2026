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
    <section className="mb-4 overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-line">
      <div className="border-b border-line px-4 py-3.5 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              Published calls · Sổ Cái Kiểm Chứng Từng Tàu Trên Tuần Đang Chọn
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-tight">
              Same question on every call · quay {week.quay} · week {week.week}
            </h2>
          </div>
          <label className="flex max-w-full flex-col gap-1 text-xs font-medium text-muted">
            Published week (Chọn trong 98 tuần cảng Barcelona):
            <select
              data-week-select=""
              value={yard.id}
              onChange={(e) => {
                const next = clientYard(e.target.value);
                if (next) useBoardStore.getState().openBuiltYard(next);
              }}
              className="h-9 max-w-full rounded-lg bg-bg px-2.5 text-sm font-medium text-fg ring-1 ring-line"
            >
              {weeks.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.quay} · week {row.week} · {row.ships} calls
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* 4-Card Empirical Week Summary */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl bg-raised/70 p-2.5 ring-1 ring-line">
            <p className="text-[10px] font-semibold uppercase text-faint">Tàu Trong Tuần {week.week}</p>
            <p className="mt-0.5 font-mono text-base font-bold tabular-nums text-fg">{scores.length} tàu</p>
            <p className="text-[11px] text-muted">Cầu {week.quay} · Bấm vào dòng để chọn tàu</p>
          </div>
          <div className="rounded-xl bg-raised/70 p-2.5 ring-1 ring-line">
            <p className="text-[10px] font-semibold uppercase text-faint">Giữ Nguyên Cầu Gốc (NO_OP)</p>
            <p className="mt-0.5 font-mono text-base font-bold tabular-nums text-ok">
              {stay}/{scores.length} tàu
            </p>
            <p className="text-[11px] text-muted">0 sửa đổi vào TOS chủ</p>
          </div>
          <div className="rounded-xl bg-raised/70 p-2.5 ring-1 ring-line">
            <p className="text-[10px] font-semibold uppercase text-faint">Ca Kẹt Cứu Được (k=0)</p>
            <p className="mt-0.5 font-mono text-base font-bold tabular-nums text-accent">
              {beat} tàu · {versusSum} giờ
            </p>
            <p className="text-[11px] text-muted">{movedSum} tàu khác bị dời</p>
          </div>
          <div className="rounded-xl bg-ok/10 p-2.5 ring-1 ring-ok/30">
            <p className="text-[10px] font-semibold uppercase text-ok">Lợi Ích Kinh Tế Tuần {week.week}</p>
            <p className="mt-0.5 font-mono text-base font-bold tabular-nums text-ok">
              +${(versusSum * 1500).toLocaleString("en-US")} USD
            </p>
            <p className="text-[11px] text-muted">Phí lưu tàu $1,500/giờ</p>
          </div>
        </div>

        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-muted sm:text-sm" data-cite={PUBLISHED_DOI}>
          Quay {week.quay}, week {week.week} of 2024. Port of Barcelona container calls, one-hour periods, Alberto Santini (DOI {PUBLISHED_DOI}). The blocks are the published plan in {week.file} and {week.bksFile}. {weeks.length} weeks, quays 24B and 36A, weeks 2–50.{" "}
          <a className="text-accent underline" href={PUBLISHED_DOI_URL} target="_blank" rel="noreferrer">
            {PUBLISHED_DOI}
          </a>
          {" · "}
          <a className="text-accent underline" href={PUBLISHED_REPO} target="_blank" rel="noreferrer">
            source repository
          </a>
          . ship_len is consecutive berths. The file has no cargo or equipment field, so the solver does not reject a berth for either.
        </p>
        <p className="mt-1.5 max-w-4xl text-xs leading-relaxed text-muted sm:text-sm">
          Versus booked is solve() for that call one hour after its published mooring, compared with the same solve() forced onto the booked berth. Leftmost gap is the first section that can take the call, which is a different question. Saved at the next call uses the hour the next ship on those sections starts. A dash means no later ship uses them. This week at +1h: {scores.length} calls. {stay} stay on the booked berth. {beat} beat staying, {versusSum} h together, {movedSum} other calls moved. Leftmost-section gap: {leftmostSum} h. The file's makespan is the latest completion hour and is not either total.
        </p>
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
