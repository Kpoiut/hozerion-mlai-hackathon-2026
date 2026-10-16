import type { Appointment, Dock, Truck, Yard } from "@/lib/minmove/types.ts";
import { DockGlyph, pct } from "@/components/minmove/glyphs.tsx";
import { cn } from "@/lib/utils.ts";

export function YardMap({
  yard,
  live,
  selectedId,
  forceDockId,
  chosenDockId,
  leftDockId,
  onSelectTruck,
  onForceDock,
}: {
  yard: Yard;
  live: Appointment[];
  selectedId: string;
  forceDockId?: string;
  chosenDockId?: string;
  leftDockId?: string;
  onSelectTruck: (id: string) => void;
  onForceDock: (id: string) => void;
}) {
  const trucks = new Map(yard.trucks.map((t) => [t.id, t]));

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {yard.docks.map((dock) => (
        <Bay
          key={dock.id}
          dock={dock}
          live={live
          .filter((a) => a.dockId === dock.id)
          .sort((a, b) => a.startMin - b.startMin)}
          trucks={trucks}
          len={yard.shiftLenMin}
          selectedId={selectedId}
          forced={forceDockId === dock.id}
          chosen={chosenDockId === dock.id}
          vacated={leftDockId === dock.id}
          onSelectTruck={onSelectTruck}
          onForceDock={onForceDock}
        />
      ))}
    </div>
  );
}

function Bay({
  dock,
  live,
  trucks,
  len,
  selectedId,
  forced,
  chosen,
  vacated,
  onSelectTruck,
  onForceDock,
}: {
  dock: Dock;
  live: Appointment[];
  trucks: Map<string, Truck>;
  len: number;
  selectedId: string;
  forced: boolean;
  chosen: boolean;
  vacated: boolean;
  onSelectTruck: (id: string) => void;
  onForceDock: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg bg-raised p-2 text-left transition-shadow duration-150",
        chosen && "bg-fg text-bg",
        forced && !chosen && "ring-2 ring-fg",
        vacated && !chosen && "ring-1 ring-dashed ring-warn",
        !forced && !chosen && "shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
      )}
    >
      <button type="button" onClick={() => onForceDock(dock.id)} className="text-left">
        <span className="flex items-center justify-between">
          <span className="font-mono text-sm tabular-nums">{dock.short.replace("D", "")}</span>
          <DockGlyph dock={dock} className="size-3.5 opacity-70" />
        </span>
        <span className="relative mt-2 block h-8 overflow-hidden rounded-sm bg-bg/50">
          {live.map((a) => {
            const t = trucks.get(a.truckId);
            if (!t) return null;
            const on = a.truckId === selectedId;
            return (
              <span
                key={a.truckId}
                className={cn(
                  "absolute top-0.5 bottom-0.5 rounded-sm",
                  chosen ? "bg-bg/40" : on ? "bg-fg" : "bg-fg/25",
                )}
                style={{ left: pct(a.startMin, len), width: pct(t.durationMin, len) }}
              />
            );
          })}
        </span>
      </button>
      <span className="mt-2 flex min-h-8 flex-wrap gap-0.5">
        {live.slice(0, 3).map((a) => {
          const t = trucks.get(a.truckId);
          if (!t) return null;
          return (
            <button
              key={a.truckId}
              type="button"
              onClick={() => onSelectTruck(a.truckId)}
              className={cn(
                "rounded px-1 font-mono text-xs tabular-nums",
                a.truckId === selectedId ? (chosen ? "bg-bg text-fg" : "bg-fg text-bg") : "opacity-70",
              )}
            >
              {t.id}
            </button>
          );
        })}
      </span>
    </div>
  );
}
