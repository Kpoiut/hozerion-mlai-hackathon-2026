import { formatWhen } from "@/lib/minmove/seed.ts";
import { diffAppointments } from "@/lib/minmove/explain.ts";
import { phaseAt, type FlowTrace } from "@/lib/minmove/flow.ts";
import type { Appointment, Yard } from "@/lib/minmove/types.ts";
import { cn } from "@/lib/utils.ts";

export function Roster({
  yard,
  live,
  trace,
  clockMin,
  eventTruckId,
  selectedId,
  onSelect,
}: {
  yard: Yard;
  live: Appointment[];
  trace: FlowTrace;
  clockMin: number;
  eventTruckId?: string;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const trucks = new Map(yard.trucks.map((t) => [t.id, t]));
  const orig = new Map(yard.appointments.map((a) => [a.truckId, a]));
  const diff = diffAppointments(yard.appointments, live);
  const flowBy = new Map(trace.trucks.map((f) => [f.truckId, f]));
  const rows = [...live].sort((a, b) => a.startMin - b.startMin || a.dockId.localeCompare(b.dockId));

  return (
    <div className="overflow-auto">
      <table className="w-full min-w-gantt text-left text-sm">
        <thead className="sticky top-0 bg-surface text-xs text-faint">
          <tr className="border-b border-line">
            <th className="px-4 py-3 font-medium">Plate</th>
            <th className="px-4 py-3 font-medium">Hauler</th>
            <th className="px-4 py-3 font-medium">Door</th>
            <th className="px-4 py-3 font-medium">Window</th>
            <th className="px-4 py-3 font-medium">Cargo</th>
            <th className="px-4 py-3 font-medium">Now</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => {
            const t = trucks.get(a.truckId);
            if (!t) return null;
            const o = orig.get(a.truckId);
            const moved = diff.has(a.truckId);
            const late = a.truckId === eventTruckId;
            const flow = flowBy.get(a.truckId);
            const phase = flow ? phaseAt(flow, Math.round(clockMin)) : "—";
            return (
              <tr
                key={a.truckId}
                onClick={() => onSelect(a.truckId)}
                className={cn(
                  "cursor-pointer border-b border-line/80 hover:bg-raised/70",
                  a.truckId === selectedId && "bg-raised",
                )}
              >
                <td className="px-4 py-3 font-mono tabular-nums">
                  {t.plate}
                  {late ? <span className="ml-2 rounded-md bg-warn/15 px-1.5 py-0.5 text-xs text-warn">late</span> : null}
                  {moved && !late ? <span className="ml-2 rounded-md bg-raised px-1.5 py-0.5 text-xs text-muted">moved</span> : null}
                </td>
                <td className="px-4 py-3 text-muted">{t.hauler}</td>
                <td className="px-4 py-3 font-mono tabular-nums">
                  {a.dockId.replace("D", "")}
                  {o && o.dockId !== a.dockId ? (
                    <span className="ml-1 text-faint">←{o.dockId.replace("D", "")}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums text-muted">
                  {formatWhen(yard, a.startMin)}–{formatWhen(yard, a.startMin + t.durationMin)}
                </td>
                <td className="px-4 py-3 capitalize text-muted">{t.cargo}</td>
                <td className="px-4 py-3 capitalize text-muted">{phase}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
