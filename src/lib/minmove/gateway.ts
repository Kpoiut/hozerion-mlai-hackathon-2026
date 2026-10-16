import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DelayEventIn, healthReport, parseNote, planFromInput, simulateBoard } from "./services.ts";
import { createYard } from "./seed.ts";

/** HTTP adapters. Same functions the board calls in-process. */
export const solveService = createServerFn({ method: "POST" })
  .validator((input: unknown) => DelayEventIn.parse(input))
  .handler(({ data }) => planFromInput(data));

export const parseService = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ text: z.string().min(1).max(600) }).parse(input))
  .handler(({ data }) => parseNote(data.text));

export const flowService = createServerFn({ method: "POST" })
  .validator((input: unknown) => DelayEventIn.partial().parse(input))
  .handler(({ data }) => {
    const yard = createYard();
    return simulateBoard(yard, yard.appointments, data.truckId ? { ...data, truckId: data.truckId, newEtaMin: data.newEtaMin ?? 0, source: "manual" } : null, data.newEtaMin);
  });

export const healthService = createServerFn({ method: "GET" }).handler(() => healthReport(false));
