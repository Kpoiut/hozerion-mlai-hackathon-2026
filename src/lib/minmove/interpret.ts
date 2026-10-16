import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { parseEvent } from "./parse.ts";
import { createYard } from "./seed.ts";
import type { Cargo, DelayEvent } from "./types.ts";

const Input = z.object({
  text: z.string().min(1).max(600),
});

const AgentJson = z.object({
  truckId: z.string().optional(),
  plate: z.string().optional(),
  delayMin: z.number().optional(),
  eta: z.string().optional(),
  cargo: z.enum(["dry", "reefer"]).optional(),
  forceDockId: z.string().optional(),
  note: z.string().optional(),
});

function etaFromClock(eta: string): number | undefined {
  const m = eta.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return undefined;
  return Number(m[1]) * 60 + Number(m[2]) - 8 * 60;
}

export const interpretDelay = createServerFn({ method: "POST" })
  .validator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const yard = createYard();
    const local = parseEvent(data.text, yard);
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return {
        ok: true as const,
        via: "parse" as const,
        parse: local,
        agentNote: null as string | null,
        agentEtaMin: null as number | null,
        agentTruckId: null as string | null,
      };
    }

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0,
          max_tokens: 280,
          messages: [
            {
              role: "system",
              content:
                "Extract a yard delay event as JSON only. Keys: truckId (A-L), plate, delayMin, eta (HH:MM 24h), cargo (dry|reefer), forceDockId (D1-D6), note. Omit unknown keys. Do not schedule. Do not invent a dock if the text does not name one.",
            },
            { role: "user", content: data.text },
          ],
        }),
      });
      if (!res.ok) {
        return {
          ok: true as const,
          via: "parse" as const,
          parse: local,
          agentNote: `Agent unavailable (${res.status}). Using parser.`,
          agentEtaMin: null,
          agentTruckId: null,
        };
      }
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const raw = body.choices?.[0]?.message?.content ?? "";
      const jsonStart = raw.indexOf("{");
      const jsonEnd = raw.lastIndexOf("}");
      if (jsonStart < 0 || jsonEnd < 0) {
        return {
          ok: true as const,
          via: "parse" as const,
          parse: local,
          agentNote: "Agent returned no JSON. Using parser.",
          agentEtaMin: null,
          agentTruckId: null,
        };
      }
      const parsed = AgentJson.safeParse(JSON.parse(raw.slice(jsonStart, jsonEnd + 1)));
      if (!parsed.success) {
        return {
          ok: true as const,
          via: "parse" as const,
          parse: local,
          agentNote: "Agent schema miss. Using parser.",
          agentEtaMin: null,
          agentTruckId: null,
        };
      }
      const a = parsed.data;
      const truckKey = a.truckId;
      const plateKey = a.plate;
      const byId = truckKey
        ? yard.trucks.find((t) => t.id === truckKey.toUpperCase())
        : undefined;
      const byPlate = plateKey
        ? yard.trucks.find((t) => t.plate.toUpperCase() === plateKey.toUpperCase())
        : undefined;
      const yardTruck = byId ?? byPlate;
      const orig = yardTruck ? yard.appointments.find((x) => x.truckId === yardTruck.id) : undefined;
      const agentEta =
        (typeof a.delayMin === "number" && orig ? orig.startMin + a.delayMin : undefined) ??
        (a.eta ? etaFromClock(a.eta) : undefined);
      const eta = local.event.newEtaMin ?? agentEta;
      const event: DelayEvent = {
        truckId: local.event.truckId ?? yardTruck?.id ?? "",
        newEtaMin: eta ?? 0,
        cargoOverride: local.event.cargoOverride ?? (a.cargo as Cargo | undefined),
        forceDockId: local.event.forceDockId ?? a.forceDockId,
        source: "agent",
        note: a.note,
      };
      return {
        ok: true as const,
        via: "agent" as const,
        parse: { ...local, event: { ...local.event, ...event, raw: data.text }, complete: Boolean(event.truckId && eta !== undefined) },
        agentNote: a.note ?? null,
        agentEtaMin: agentEta ?? null,
        agentTruckId: yardTruck?.id ?? null,
      };
    } catch {
      return {
        ok: true as const,
        via: "parse" as const,
        parse: local,
        agentNote: "Agent failed. Using parser.",
        agentEtaMin: null,
        agentTruckId: null,
      };
    }
  });
