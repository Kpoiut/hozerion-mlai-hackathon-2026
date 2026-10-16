import { tryPublishedYard, type PublishedWeekInfo } from "./published-week.ts";
import type { Yard } from "./types.ts";

const instances = import.meta.glob("../../../data/barcelona/weeks/bcn_*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

const plans = import.meta.glob("../../../data/barcelona/weeks/bks-bcn_*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

function base(path: string): string {
  return path.replace(/\\/g, "/").split("/").pop() ?? path;
}

interface LoadedWeek {
  info: PublishedWeekInfo;
  yard: Yard;
}

function loadAll(): LoadedWeek[] {
  const planByName = new Map<string, unknown>();
  for (const [path, mod] of Object.entries(plans)) planByName.set(base(path), mod);
  const out: LoadedWeek[] = [];
  for (const [path, inst] of Object.entries(instances)) {
    const file = base(path);
    const match = file.match(/^bcn_(24B|36A)_(\d+)\.json$/);
    if (!match?.[1] || !match[2]) continue;
    const quay = match[1];
    const week = Number(match[2]);
    const bksFile = `bks-${file}`;
    const bks = planByName.get(bksFile);
    if (!bks) continue;
    const loaded = tryPublishedYard(`bcn-${quay}-${week}`, quay, week, file, bksFile, inst, bks);
    if (!loaded) continue;
    out.push(loaded);
  }
  out.sort((a, b) => (a.info.quay === b.info.quay ? a.info.week - b.info.week : a.info.quay < b.info.quay ? -1 : 1));
  return out;
}

const ALL = loadAll();

/** Every paired week file. The yard is the published plan, not a solved one. */
export function clientWeekList(): PublishedWeekInfo[] {
  return ALL.map((row) => row.info);
}

export function clientYard(id: string): Yard | null {
  return ALL.find((row) => row.info.id === id)?.yard ?? null;
}
