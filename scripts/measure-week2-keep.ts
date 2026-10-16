import { compareBaselines, solve } from "../src/lib/minmove/solver.ts";
import { publishedYard, nextOccupantHour } from "../src/lib/minmove/published-week.ts";

const yard = publishedYard("bcn-24B-2");
for (const a of yard.appointments) {
  const eta = nextOccupantHour(yard, a.truckId);
  if (eta == null) {
    console.log(`${a.truckId} no next call`);
    continue;
  }
  const event = { truckId: a.truckId, newEtaMin: eta, source: "manual" as const };
  const result = solve(yard, event);
  const rows = compareBaselines(yard, event, result);
  const keep = rows.find((r) => r.id === "keep-order");
  const plan = rows.find((r) => r.id === "minmove");
  const chosen = result.appointments.find((x) => x.truckId === a.truckId);
  const next = nextOccupantHour(yard, a.truckId);
  console.log(
    [
      a.truckId,
      `home ${a.dockId}@${a.startMin}`,
      `eta ${eta} (next call)`,
      `keep w${keep?.metrics?.eventWaitMin} push${keep?.metrics?.displaced} delay${keep?.metrics?.totalDelayMin}`,
      `plan ${chosen?.dockId}@${chosen?.startMin} w${plan?.metrics?.eventWaitMin} push${plan?.metrics?.displaced} delay${plan?.metrics?.totalDelayMin}`,
      `hole ${result.certificate?.whyNotGreedy?.greedyWaitMin ?? "same"}`,
      `next ${next ?? "-"}`,
    ].join(" | "),
  );
}
