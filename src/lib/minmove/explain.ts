import { clockLabel } from "./seed.ts";
import type { Appointment, BaselineRow, DelayEvent, SolveResult, Truck, Yard } from "./types.ts";

function plateOf(yard: Yard, id: string): string {
  return yard.trucks.find((t) => t.id === id)?.plate ?? id;
}

function dockOf(yard: Yard, id: string): string {
  return yard.docks.find((d) => d.id === id)?.short ?? id;
}

export function explainSolve(yard: Yard, event: DelayEvent, result: SolveResult, truck: Truck): string {
  const orig = new Map(yard.appointments.map((a) => [a.truckId, a]));
  if (result.status === "INFEASIBLE") {
    const core = (result.conflict ?? []).filter((c) => c.core);
    const lines = (core.length ? core : result.conflict ?? []).map((c) => c.message);
    return [`Cannot commit. ${truck.plate} is not legally placeable.`, ...lines].join(" ");
  }
  if (result.status === "HUMAN_REQUIRED") {
    const unk = (result.conflict ?? []).filter((c) => c.code === "UNKNOWN_FACT").map((c) => c.message);
    return `A plan exists only if an unknown dock fact is assumed allow. ${unk.join(" ")} Dispatcher must confirm.`;
  }
  const next = new Map(result.appointments.map((a) => [a.truckId, a]));
  const moved = result.metrics.displacedIds.map((id) => {
    const from = orig.get(id);
    const to = next.get(id);
    return `${plateOf(yard, id)} ${dockOf(yard, from?.dockId ?? "")}→${dockOf(yard, to?.dockId ?? "")}`;
  });
  const self = next.get(event.truckId);
  const stay = orig.get(event.truckId)?.dockId === self?.dockId;
  const eta = clockLabel(yard.shiftStartMin, event.newEtaMin);
  const start = self ? clockLabel(yard.shiftStartMin, self.startMin) : "—";
  const door = self ? dockOf(yard, self.dockId) : "—";
  const head = stay
    ? `${truck.plate} stays on ${door}, starts ${start} (ETA ${eta}).`
    : `${truck.plate} relocates to ${door}, starts ${start} (ETA ${eta}).`;
  const rest =
    moved.length === 0
      ? "No other appointment moves."
      : `Relocate ${moved.join("; ")}. Everyone else holds.`;
  const greedy = result.certificate?.whyNotGreedy;
  const vs = greedy
    ? ` Greedy ${dockOf(yard, greedy.greedyDockId)} waits ${greedy.greedyWaitMin} min; this waits ${result.metrics.eventWaitMin} min (saves ${greedy.savedWaitMin}).`
    : "";
  return `${head} ${rest} Lex displaced ${result.metrics.lex.displaced} · delay ${result.metrics.totalDelayMin} min.${vs}`;
}

export function explainBaselines(rows: BaselineRow[]): string {
  return rows
    .map((r) => {
      if (!r.feasible || !r.metrics) return `${r.label}: infeasible.`;
      return `${r.label}: displaced ${r.metrics.displaced}, delay ${r.metrics.totalDelayMin} min, deadline misses ${r.metrics.deadlineMisses}.`;
    })
    .join(" ");
}

export function diffAppointments(before: Appointment[], after: Appointment[]): Map<string, { from: Appointment; to: Appointment }> {
  const a = new Map(before.map((x) => [x.truckId, x]));
  const out = new Map<string, { from: Appointment; to: Appointment }>();
  for (const to of after) {
    const from = a.get(to.truckId);
    if (!from) continue;
    if (from.dockId !== to.dockId || from.startMin !== to.startMin) out.set(to.truckId, { from, to });
  }
  return out;
}
