import { createYard } from "./seed.ts";
import type { Cargo, DelayEvent, Yard } from "./types.ts";

export interface ParseResult {
  event: Partial<DelayEvent> & { raw: string };
  matchedTruckId?: string;
  warnings: string[];
  complete: boolean;
}

function findTruck(yard: Yard, text: string): string | undefined {
  const upper = text.toUpperCase();
  for (const t of yard.trucks) {
    if (upper.includes(t.plate.toUpperCase())) return t.id;
  }
  const plate = text.match(/\b(\d{2}[A-Z])[- ]?(\d{3})[.\s-]?(\d{2})\b/i);
  if (plate) {
    const compact = `${plate[1]}-${plate[2]}.${plate[3]}`.toUpperCase();
    const hit = yard.trucks.find((t) => t.plate.toUpperCase() === compact);
    if (hit) return hit.id;
  }
  const named = text.match(/\b(?:truck|xe)\s+([A-Z])\b/i);
  if (named) {
    const id = named[1]!.toUpperCase();
    if (yard.trucks.some((t) => t.id === id)) return id;
  }
  return undefined;
}

function parseDelay(text: string, originalStart: number): { eta?: number; note: string[] } {
  const note: string[] = [];
  const plus = text.match(/(?:late|delay|trễ|tre)\s*(?:thêm\s*)?(\d{1,3})\s*(?:m|min|phút|phut)?/i);
  if (plus) {
    const d = Number(plus[1]);
    return { eta: originalStart + d, note: [`delay +${d} min`] };
  }
  const clock = text.match(/\b(?:eta|lúc|luc|at)?\s*(\d{1,2})[:h](\d{2})\b/i);
  if (clock) {
    const h = Number(clock[1]);
    const m = Number(clock[2]);
    const abs = h * 60 + m;
    const shiftStart = 8 * 60;
    return { eta: abs - shiftStart, note: [`eta ${clock[1]}:${clock[2]}`] };
  }
  const around = text.match(/tầm\s*(\d{1,2})[h:](\d{2})/i);
  if (around) {
    const abs = Number(around[1]) * 60 + Number(around[2]);
    return { eta: abs - 8 * 60, note: [`eta ~${around[1]}:${around[2]}`] };
  }
  return { note };
}

function parseCargo(text: string): Cargo | undefined {
  if (/(reefer|cold|lạnh|lanh|đông lạnh|dong lanh|frozen)/i.test(text)) return "reefer";
  if (/(dry|khô|kho|hàng khô)/i.test(text)) return "dry";
  return undefined;
}

function parseDock(text: string): string | undefined {
  const m = text.match(/\b(?:door|dock|cửa|cua|làn|lan)\s*([1-6])\b/i);
  if (m) return `D${m[1]}`;
  const d = text.match(/\bD([1-6])\b/i);
  if (d) return `D${d[1]}`;
  return undefined;
}

export function parseEvent(text: string, yard: Yard = createYard()): ParseResult {
  const warnings: string[] = [];
  const truckId = findTruck(yard, text);
  const orig = truckId ? yard.appointments.find((a) => a.truckId === truckId) : undefined;
  const delay = parseDelay(text, orig?.startMin ?? 0);
  const cargo = parseCargo(text);
  const forceDockId = parseDock(text);
  const notes = [...delay.note];
  if (!truckId) warnings.push("No plate or truck id matched. Pick a truck on the board.");
  if (delay.eta === undefined) warnings.push("No delay or clock time found.");
  const event: ParseResult["event"] = {
    raw: text,
    source: "parse",
    truckId,
    newEtaMin: delay.eta,
    cargoOverride: cargo,
    forceDockId,
    note: notes.join(", ") || undefined,
  };
  const complete = Boolean(truckId && delay.eta !== undefined);
  return { event, matchedTruckId: truckId, warnings, complete };
}

export function toDelayEvent(
  partial: ParseResult["event"],
  fallbackTruckId: string,
  fallbackEta: number,
): DelayEvent {
  return {
    truckId: partial.truckId ?? fallbackTruckId,
    newEtaMin: partial.newEtaMin ?? fallbackEta,
    cargoOverride: partial.cargoOverride,
    forceDockId: partial.forceDockId,
    source: partial.source === "agent" ? "agent" : "parse",
    note: partial.note,
  };
}
