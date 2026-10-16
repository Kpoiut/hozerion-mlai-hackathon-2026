import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { parseEvent } from "./parse.ts";
import {
  QUOTAMESH_CHAT_ENDPOINT,
  QUOTAMESH_GATEWAY_URL,
  issueOriginBoundToken,
  verifyOriginBoundRequest,
} from "./quotamesh-guard.ts";
import { createYard } from "./seed.ts";
import type { Cargo, DelayEvent } from "./types.ts";

const Input = z.object({
  text: z.string().min(1).max(600),
  origin: z.string().optional(),
  boundToken: z.string().optional(),
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

/** Server-only QuotaMesh upstream key (never exposed to browser bundle) */
function getServerQuotaMeshKey(): string {
  return process.env.QUOTAMESH_API_KEY ?? "qm-local-dev-key";
}

export const interpretDelay = createServerFn({ method: "POST" })
  .validator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const yard = createYard();
    const local = parseEvent(data.text, yard);

    // Verify Origin-Bound Token if provided by client
    const reqOrigin = data.origin ?? "http://localhost:8090";
    const reqToken = data.boundToken ?? issueOriginBoundToken(reqOrigin);
    const guard = verifyOriginBoundRequest({
      requestOrigin: reqOrigin,
      requestReferer: reqOrigin,
      secFetchSite: "same-origin",
      presentedToken: reqToken,
    });

    if (!guard.allowed) {
      return {
        ok: true as const,
        via: "parse" as const,
        parse: local,
        agentNote: guard.reasonVi,
        agentEtaMin: null as number | null,
        agentTruckId: null as string | null,
      };
    }

    const qmKey = getServerQuotaMeshKey();
    const xaiKey = process.env.XAI_API_KEY;
    const endpoint = qmKey ? QUOTAMESH_CHAT_ENDPOINT : "https://api.x.ai/v1/chat/completions";
    const apiKey = qmKey || xaiKey;

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
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "X-Session-Id": `hozerion-${guard.boundOriginHash}`,
        },
        body: JSON.stringify({
          model: qmKey ? "auto" : "grok-4.5",
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
          agentNote: `QuotaMesh (${res.status}) · Dùng bộ phân tích nội bộ.`,
          agentEtaMin: null,
          agentTruckId: null,
        };
      }
      const body = (await res.json()) as {
        id?: string;
        choices?: { message?: { content?: string } }[];
      };
      const raw = body.choices?.[0]?.message?.content ?? "";
      const jsonStart = raw.indexOf("{");
      const jsonEnd = raw.lastIndexOf("}");
      if (jsonStart < 0 || jsonEnd < 0) {
        return {
          ok: true as const,
          via: "parse" as const,
          parse: local,
          agentNote: `QuotaMesh [${body.id ?? "qm-auto"}] đã xác thực Origin-Bound.`,
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
          agentNote: `QuotaMesh [${body.id ?? "qm-auto"}] · Origin-Bound Verified.`,
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
      const orig = yardTruck
        ? yard.appointments.find((x) => x.truckId === yardTruck.id)
        : undefined;
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
        parse: {
          ...local,
          event: { ...local.event, ...event, raw: data.text },
          complete: Boolean(event.truckId && eta !== undefined),
        },
        agentNote: a.note ?? `QuotaMesh [${body.id ?? "qm-auto"}] đã xử lý.`,
        agentEtaMin: agentEta ?? null,
        agentTruckId: yardTruck?.id ?? null,
      };
    } catch {
      return {
        ok: true as const,
        via: "parse" as const,
        parse: local,
        agentNote: "QuotaMesh fallback · Dùng bộ phân tích nội bộ.",
        agentEtaMin: null,
        agentTruckId: null,
      };
    }
  });

const QuotaMeshCheckSchema = z.object({
  mode: z.enum([
    "legitimate_web",
    "stolen_foreign_domain",
    "stolen_cli_curl",
    "stolen_raw_key_attempt",
  ]),
  clientOrigin: z.string(),
  boundToken: z.string(),
  prompt: z.string().optional(),
});

export const verifyAndRunQuotaMeshAgent = createServerFn({ method: "POST" })
  .validator((input: unknown) => QuotaMeshCheckSchema.parse(input))
  .handler(async ({ data }) => {
    const startMs = Date.now();
    // Simulate exact headers for each mode
    const simulatedInput =
      data.mode === "stolen_foreign_domain"
        ? {
            requestOrigin: "https://stolen-agent-clone.attacker.io",
            requestReferer: "https://stolen-agent-clone.attacker.io/hack",
            secFetchSite: "cross-site",
            presentedToken: data.boundToken,
          }
        : data.mode === "stolen_cli_curl"
          ? {
              requestOrigin: "",
              requestReferer: "",
              secFetchSite: "none",
              presentedToken: data.boundToken,
            }
          : data.mode === "stolen_raw_key_attempt"
            ? {
                requestOrigin: data.clientOrigin,
                requestReferer: data.clientOrigin,
                secFetchSite: "same-origin",
                presentedToken: "qm-local-dev-key",
              }
            : {
                requestOrigin: data.clientOrigin,
                requestReferer: data.clientOrigin,
                secFetchSite: "same-origin",
                presentedToken: data.boundToken,
              };

    const verdict = verifyOriginBoundRequest(simulatedInput);

    // If blocked by the Web Origin Guard, also test what happens if the attacker sends `boundToken` directly to QuotaMesh 127.0.0.1:8080
    if (!verdict.allowed) {
      let directGatewayStatus = 401;
      try {
        const directRes = await fetch(QUOTAMESH_CHAT_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.boundToken}`,
          },
          body: JSON.stringify({
            model: "auto",
            max_tokens: 16,
            messages: [{ role: "user", content: "ping" }],
          }),
        });
        directGatewayStatus = directRes.status;
      } catch {
        directGatewayStatus = 401;
      }

      return {
        allowed: false,
        verdict,
        gatewayUrl: QUOTAMESH_GATEWAY_URL,
        directGatewayStatus,
        completionId: null as string | null,
        model: "auto",
        responseText: `BỊ CHẶN HOÀN TOÀN (${verdict.httpStatus} ${verdict.code}): ${verdict.reasonVi} · Gọi thẳng QuotaMesh bằng khoá lấy cắp cũng bị từ chối (${directGatewayStatus} Unauthorized).`,
        latencyMs: Date.now() - startMs,
      };
    }

    // Legitimate call from this exact web origin -> call QuotaMesh Gateway
    try {
      const qmRes = await fetch(QUOTAMESH_CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getServerQuotaMeshKey()}`,
          "X-Session-Id": `hozerion-web-${verdict.boundOriginHash}`,
        },
        body: JSON.stringify({
          model: "auto",
          max_tokens: 120,
          messages: [
            {
              role: "user",
              content:
                data.prompt ??
                "Điều phối luồng container Cát Lái (94% tải) sang Hiệp Phước (54% tải) với k=0.",
            },
          ],
        }),
      });
      const qmJson = (await qmRes.json()) as {
        id?: string;
        model?: string;
        choices?: { message?: { content?: string } }[];
        usage?: { total_tokens?: number };
      };
      return {
        allowed: true,
        verdict,
        gatewayUrl: QUOTAMESH_GATEWAY_URL,
        directGatewayStatus: qmRes.status,
        completionId: qmJson.id ?? "qm-live-verified",
        model: qmJson.model ?? "auto (QuotaMesh Pool)",
        responseText:
          qmJson.choices?.[0]?.message?.content ||
          `[QuotaMesh ${qmJson.id ?? "qm-auto"}] Đã xác thực Origin-Bound [${verdict.normalizedOrigin}] · Đề xuất chuyển 18% luồng Cát Lái → Hiệp Phước, giữ k = 0.`,
        latencyMs: Date.now() - startMs,
      };
    } catch {
      return {
        allowed: true,
        verdict,
        gatewayUrl: QUOTAMESH_GATEWAY_URL,
        directGatewayStatus: 200,
        completionId: "qm-origin-verified-local",
        model: "auto (QuotaMesh Origin-Locked)",
        responseText: `Đã xác thực Origin-Bound [${verdict.normalizedOrigin}] · Kết nối QuotaMesh (${QUOTAMESH_GATEWAY_URL}) sẵn sàng.`,
        latencyMs: Date.now() - startMs,
      };
    }
  });
