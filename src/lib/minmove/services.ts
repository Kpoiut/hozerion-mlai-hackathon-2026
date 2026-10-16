import { z } from "zod";
import { etaMap, simulateFlow, type FlowTrace } from "./flow.ts";
import { parseEvent, type ParseResult } from "./parse.ts";
import { createYard } from "./seed.ts";
import { applyCommit, compareBaselines, solve } from "./solver.ts";
import type { Appointment, BaselineRow, DelayEvent, SolveResult, Yard } from "./types.ts";

/** Four bounded contexts, one process. Solver owns the board. */
export const SERVICES = [
  { id: "parse", label: "Parse", owns: "radio note → event" },
  { id: "arbiter", label: "Arbiter", owns: "which minute is real" },
  { id: "solver", label: "Solver", owns: "lex plan + IIS" },
  { id: "flow", label: "Flow", owns: "gate → yard → dock" },
  { id: "agent", label: "Agent", owns: "intent only" },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];
export type ServiceHealth = "ok" | "idle" | "off";

export const DelayEventIn = z.object({
  truckId: z.string().min(1).max(4),
  newEtaMin: z.number().int().min(0).max(480),
  cargoOverride: z.enum(["dry", "reefer"]).optional(),
  forceDockId: z.string().optional(),
});

export type DelayEventIn = z.infer<typeof DelayEventIn>;

export function healthMap(agentOn: boolean): Record<ServiceId, ServiceHealth> {
  return {
    parse: "ok",
    arbiter: "ok",
    solver: "ok",
    flow: "ok",
    agent: agentOn ? "ok" : "off",
  };
}

export function parseNote(text: string, yard: Yard = createYard()): ParseResult {
  if (!text.trim()) {
    return { event: { raw: text }, warnings: ["Empty note."], complete: false };
  }
  return parseEvent(text, yard);
}

export function planDelay(event: DelayEvent, yard: Yard = createYard()): SolveResult {
  return solve(yard, event);
}

export function planFromInput(input: DelayEventIn, yard: Yard = createYard()): SolveResult {
  return planDelay({ ...input, source: "manual" }, yard);
}

export function simulateBoard(
  yard: Yard,
  live: Appointment[],
  event?: DelayEvent | null,
  fallbackEta?: number,
): FlowTrace {
  const eta = etaMap(yard, live, event?.truckId, event?.newEtaMin ?? fallbackEta);
  return simulateFlow(yard, live, eta);
}

export function baselinesFor(yard: Yard, event: DelayEvent, result: SolveResult): BaselineRow[] {
  return compareBaselines(yard, event, result);
}

export function commitPlan(yard: Yard, appointments: Appointment[]): Yard {
  return applyCommit(yard, appointments);
}

export function healthReport(agentOn = false) {
  return {
    ok: true as const,
    process: "minmove",
    services: SERVICES.map((s) => ({
      id: s.id,
      label: s.label,
      owns: s.owns,
      status: healthMap(agentOn)[s.id],
    })),
  };
}
