import { phaseAt, type FlowPhase, type FlowTrace } from "@/lib/minmove/flow.ts";
import { formatWhen } from "@/lib/minmove/seed.ts";
import type { Yard } from "@/lib/minmove/types.ts";
import { cn } from "@/lib/utils.ts";

const COL: Record<FlowPhase, string> = {
  enroute: "En route",
  gate: "Gate",
  yard: "Yard",
  dock: "Dock",
  exit: "Exit",
  gone: "Out",
};

export function FlowStage({
  yard,
  trace,
  clockMin,
  selectedId,
  onSelect,
}: {
  yard: Yard;
  trace: FlowTrace;
  clockMin: number;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const t = Math.round(clockMin);
  const byPhase: Record<FlowPhase, typeof trace.trucks> = {
    enroute: [],
    gate: [],
    yard: [],
    dock: [],
    exit: [],
    gone: [],
  };
  for (const f of trace.trucks) byPhase[phaseAt(f, t)].push(f);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-faint">Container flow</p>
          <h2 className="mt-1 text-lg font-medium">
            {formatWhen(yard, t)}
          </h2>
        </div>
        <p className="text-xs text-muted">
          {yard.timeUnit === "hour"
            ? "Berth interval from the file. No gate time is published."
            : `Gate queue ${trace.gateQueuedMin}m${trace.tightIds.length ? ` · ${trace.tightIds.length} tight arrivals` : ""}`}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {(["gate", "yard", "dock", "exit", "gone"] as FlowPhase[]).map((phase) => (
          <div key={phase} className="min-h-24 rounded-lg bg-raised p-2">
            <p className="mb-2 text-xs text-faint">
              {COL[phase]} · {byPhase[phase].length}
            </p>
            <div className="flex flex-wrap gap-1">
              {byPhase[phase].map((f) => (
                <button
                  key={f.truckId}
                  type="button"
                  onClick={() => onSelect(f.truckId)}
                  className={cn(
                    "rounded-md px-1.5 py-1 font-mono text-xs tabular-nums",
                    f.truckId === selectedId ? "bg-fg text-bg" : "bg-surface text-fg ring-1 ring-line",
                  )}
                >
                  {f.truckId}
                  {phase === "dock" ? `·${f.dock.dockId.replace(/^D|^B/, "")}` : ""}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
