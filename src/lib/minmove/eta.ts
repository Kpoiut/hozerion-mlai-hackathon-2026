import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { etaFromOsrm, placeFromNote, YARD_PLACE } from "./routing.ts";

export const fetchLiveEta = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ note: z.string().max(600) }).parse(input))
  .handler(async ({ data }) => {
    const from = placeFromNote(data.note || "Q7");
    const live = await etaFromOsrm(from, YARD_PLACE);
    return {
      from: live.from.name,
      to: live.to.name,
      km: Number(live.km.toFixed(2)),
      travelMin: live.travelMin,
      source: live.source,
    };
  });
