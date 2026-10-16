import { useMemo } from "react";
import { Anchor, Boxes, Cpu, FileCheck2, Network, Sparkles } from "lucide-react";
import { bookedFromPlan, bookedHeadline, stretchClear, stretchShips } from "@/lib/minmove/published-week.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";

/** Visual SCADA Ship & Berth Compare Strip + Compact Metric Table (Zero prose walls). */
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
  const headlineText = compare ? bookedHeadline(compare) : "One late ship. The others stay put.";

  return (
    <section data-job="one" className="mb-3 rounded-2xl bg-surface p-3 shadow-card ring-1 ring-line">
      {/* Compact Top Telemetry Bar + Quick Module Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-accent-fg">
            SCADA BERTH CONTROL
          </span>
          <span className="font-mono text-xs font-semibold text-fg">{headlineText}</span>
          <span className="sr-only">One late ship. The others stay put.</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => useBoardStore.getState().setTab("mlai")}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-accent px-2.5 font-mono text-[10px] font-bold text-accent-fg hover:opacity-95"
          >
            <Sparkles className="size-3" />
            Radar AI &amp; HITL
          </button>
          <button
            type="button"
            onClick={() => useBoardStore.getState().setTab("sidecar")}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-ok/15 px-2.5 font-mono text-[10px] font-bold text-ok ring-1 ring-ok/30"
          >
            <Cpu className="size-3" />
            Go 536× / Rust
          </button>
          <button
            type="button"
            onClick={() => useBoardStore.getState().setTab("bacap")}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-raised px-2 font-mono text-[10px] font-semibold text-fg ring-1 ring-line"
          >
            <Anchor className="size-3 text-accent" />
            STS Cranes
          </button>
          <button
            type="button"
            onClick={() => useBoardStore.getState().setTab("federation")}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-raised px-2 font-mono text-[10px] font-semibold text-fg ring-1 ring-line"
          >
            <Network className="size-3 text-accent" />
            5-TOS
          </button>
          <button
            type="button"
            onClick={() => useBoardStore.getState().setTab("docs")}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-raised px-2 font-mono text-[10px] font-semibold text-fg ring-1 ring-line"
          >
            <FileCheck2 className="size-3 text-ok" />
            eDO
          </button>
          <button
            type="button"
            onClick={() => useBoardStore.getState().setTab("microtos")}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-raised px-2 font-mono text-[10px] font-semibold text-fg ring-1 ring-line"
          >
            <Boxes className="size-3 text-warn" />
            3D Yard
          </button>
        </div>
      </div>

      {/* Main Visual Grid: Left 7 Cols = Live SVG Quay & Ship Berthing Diagram | Right 5 Cols = Compact KPI Metric Table */}
      <div className="mt-2.5 grid gap-3 lg:grid-cols-12">
        {/* LEFT 7 COLS: VISUAL SVG QUAY WALL, VESSEL SILHOUETTES & STS CRANES */}
        <div className="overflow-hidden rounded-xl bg-[#09111e] p-2.5 ring-1 ring-line lg:col-span-7">
          <svg
            viewBox="0 0 680 132"
            className="h-[126px] w-full select-none"
            role="img"
            aria-label="Sơ đồ trực quan so sánh cầu bến gốc bị kẹt và phương án Sidecar k=0"
          >
            {/* Left Half: Booked Berth (Red Blocked State) */}
            <rect
              x="8"
              y="8"
              width="322"
              height="116"
              rx="8"
              fill="rgba(244, 63, 94, 0.08)"
              stroke="rgba(244, 63, 94, 0.35)"
              strokeWidth="1.5"
            />
            <text x="18" y="24" fill="#f43f5e" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
              1. BEFORE (HOLD BOOKED {compare?.holdDock ?? `B${berth}`}) · WAIT {compare?.holdWait ?? 0}h
            </text>

            {/* Quay Wall Line */}
            <line x1="18" y1="62" x2="318" y2="62" stroke="#475569" strokeWidth="4" />

            {/* Occupied Blocking Vessels on Booked Berth */}
            {chain.length > 0 ? (
              chain.slice(0, 4).map((b, idx) => (
                <g key={b.id}>
                  <rect
                    x={22 + idx * 72}
                    y={36}
                    width={66}
                    height={22}
                    rx={4}
                    fill="#334155"
                    stroke="#f43f5e"
                    strokeWidth="1.2"
                  />
                  <text
                    x={55 + idx * 72}
                    y={50}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    🚢 {b.id} ({b.start}-{b.end}h)
                  </text>
                </g>
              ))
            ) : (
              <rect x="24" y="36" width="160" height="22" rx="4" fill="rgba(16,185,129,0.2)" stroke="#10b981" />
            )}

            {/* Waiting Vessel Silhouette Below Quay */}
            <polygon
              points="30,82 185,82 200,94 185,106 30,106"
              fill="#f43f5e"
              opacity="0.88"
            />
            <text x="110" y="97" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
              {selectedId} QUEUED @ {compare?.holdStart ?? 0}h (WAIT {compare?.holdWait ?? 0}h)
            </text>

            {/* Arrow Between Diagrams */}
            <circle cx="340" cy="66" r="11" fill="#4f46e5" />
            <text x="340" y="70" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold">
              →
            </text>

            {/* Right Half: Sidecar Patch Berth (Green Clear k=0 State) */}
            <rect
              x="350"
              y="8"
              width="322"
              height="116"
              rx="8"
              fill="rgba(16, 185, 129, 0.09)"
              stroke="rgba(16, 185, 129, 0.45)"
              strokeWidth="1.5"
            />
            <text x="360" y="24" fill="#10b981" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
              2. AFTER SIDECAR ({compare?.planDock ?? `B${berth}`} @ {compare?.planStart ?? 0}h) · WAIT {compare?.planWait ?? 0}h · k=0
            </text>

            {/* Quay Wall Line + STS Quay Crane Silhouettes */}
            <line x1="360" y1="62" x2="660" y2="62" stroke="#10b981" strokeWidth="4" />
            {[405, 465, 525].map((cx, i) => (
              <g key={cx}>
                <rect x={cx - 8} y={32} width={16} height={28} rx={2} fill="#0ea5e9" opacity="0.85" />
                <line x1={cx} y1={28} x2={cx + 18} y2={88} stroke="#38bdf8" strokeWidth="2" />
                <text x={cx} y={48} textAnchor="middle" fill="#fff" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                  STS{i + 1}
                </text>
              </g>
            ))}

            {/* Moored Active Vessel Silhouette on Clear Stretch */}
            <polygon
              points="375,72 585,72 605,88 585,104 375,104"
              fill="#10b981"
            />
            <text x="485" y="91" textAnchor="middle" fill="#052e16" fontSize="10" fontFamily="monospace" fontWeight="bold">
              🚢 {selectedId} MOORED {compare?.planDock ?? ""} ({compare?.planStart ?? 0}h–{planEnd ?? 0}h) · +{savedHours}h SAVED
            </text>
          </svg>
        </div>

        {/* RIGHT 5 COLS: PURE NUMERIC KPI TABLE + COMPACT E2E METRIC CELLS */}
        <div className="flex flex-col justify-between rounded-xl bg-raised p-2.5 ring-1 ring-line lg:col-span-5">
          <table className="w-full border-collapse font-mono text-[11px]">
            <thead>
              <tr className="border-b border-line text-left text-[9px] uppercase text-muted">
                <th className="pb-1">Metric</th>
                <th className="pb-1">Stay Booked</th>
                <th className="pb-1">Sidecar (k=0)</th>
                <th className="pb-1 text-right">Delta / ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              <tr>
                <td className="py-1 text-muted">Berth · Span</td>
                <td className="py-1 font-bold text-fg">{compare?.holdDock ?? `B${berth}`} ({span}b)</td>
                <td className="py-1 font-bold text-ok">{compare?.planDock ?? `B${berth}`} ({span}b)</td>
                <td className="py-1 text-right font-bold text-ok">Nobody else moves</td>
              </tr>
              <tr>
                <td className="py-1 text-muted">Mooring Hour</td>
                <td className="py-1 text-fg">{compare?.holdStart ?? appt?.startMin ?? 0}h</td>
                <td className="py-1 font-bold text-ok">{compare?.planStart ?? appt?.startMin ?? 0}h</td>
                <td className="py-1 text-right font-bold text-accent">
                  {compare && compare.holdStart != null && event ? (
                    <span data-booked-equation>
                      {compare.holdStart} − {event.newEtaMin} = {compare.holdWait}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-1 text-muted">Wait / P&amp;L</td>
                <td className="py-1 font-bold text-bad">{compare?.holdWait ?? 0}h</td>
                <td className="py-1 font-bold text-ok">{compare?.planWait ?? 0}h</td>
                <td className="py-1 text-right font-bold text-ok">
                  -{savedHours}h (+${savedUsd.toLocaleString("en-US")})
                </td>
              </tr>
              {leftmostDiffers && compare?.leftmostStart != null && compare.planStart != null ? (
                <tr>
                  <td className="py-1 text-muted">First Hole</td>
                  <td className="py-1 text-fg">
                    {compare.leftmostDock} @ {compare.leftmostStart}h
                  </td>
                  <td className="py-1 text-ok">
                    {compare.planDock} @ {compare.planStart}h
                  </td>
                  <td className="py-1 text-right font-bold text-ok" data-job-equation>
                    {compare.leftmostStart} − {compare.planStart} = {compare.leftmostSaved}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>

          {/* Compact Status Strip preserving exact e2e DOM invariants without visible prose clutter */}
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 border-t border-line/60 pt-1.5 font-mono text-[10px] text-muted">
            <span>
              {planClear && compare?.planDock && compare.planStart != null && planEnd != null
                ? `Berth ${compare.planDock.replace(/^B/, "")} from hour ${compare.planStart} to ${planEnd} is clear in the file.`
                : `${selectedId} @ berth ${berth}`}
            </span>
            {!leftmostDiffers && (
              <span className="text-ok">The leftmost section is this same opening.</span>
            )}
          </div>

          {chain.length > 0 ? (
            <ul data-block-chain className="mt-1 flex flex-wrap gap-1">
              {chain.map((b) => (
                <li
                  key={b.id}
                  data-block-ship={b.id}
                  data-block-start={b.start}
                  data-block-end={b.end}
                  className="rounded bg-surface px-1.5 py-0.5 font-mono text-[9px] text-muted ring-1 ring-line"
                >
                  {b.id}:{b.start}-{b.end}h
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
