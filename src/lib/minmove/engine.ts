import { fetchLiveEta } from "./eta.ts";
import { interpretDelay } from "./interpret.ts";
import { toDelayEvent, type ParseResult } from "./parse.ts";
import {
  SERVICES,
  baselinesFor,
  commitPlan,
  healthMap,
  parseNote,
  planDelay,
  simulateBoard,
  type ServiceHealth,
  type ServiceId,
} from "./services.ts";
import type { BaselineRow, DelayEvent, SolveResult, Yard } from "./types.ts";
import type { FlowTrace } from "./flow.ts";

export { SERVICES, healthMap, toDelayEvent };
export type { ServiceHealth, ServiceId };

export interface EngineSnapshot {
  parse: ParseResult;
  result: SolveResult;
  baselines: BaselineRow[];
  flow: FlowTrace;
}

export function runParse(text: string, yard: Yard): ParseResult {
  return parseNote(text, yard);
}

export function runSolve(yard: Yard, event: DelayEvent): SolveResult {
  return planDelay(event, yard);
}

export function runFlow(yard: Yard, live: Yard["appointments"], event?: DelayEvent | null, fallbackEta?: number): FlowTrace {
  return simulateBoard(yard, live, event, fallbackEta);
}

export function runBaselines(yard: Yard, event: DelayEvent, result: SolveResult): BaselineRow[] {
  return baselinesFor(yard, event, result);
}

export function runCommit(yard: Yard, appointments: Yard["appointments"]): Yard {
  return commitPlan(yard, appointments);
}

export async function runInterpret(text: string) {
  return interpretDelay({ data: { text } });
}

export async function runLiveEta(note: string) {
  return fetchLiveEta({ data: { note } });
}
