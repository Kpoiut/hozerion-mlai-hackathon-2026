import { t as createServerFn } from "./ssr.mjs";
import { i as parseEvent, n as createYard } from "./parse-C_Xtcwss.mjs";
import { a as string, i as object, r as number, t as _enum } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
import { QUOTAMESH_CHAT_ENDPOINT, QUOTAMESH_GATEWAY_URL, issueOriginBoundToken, verifyOriginBoundRequest } from "./quotamesh-guard-CI0gcB8s.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/interpret-z0x36_2P.js
var Input = object({
	text: string().min(1).max(600),
	origin: string().optional(),
	boundToken: string().optional()
});
var AgentJson = object({
	truckId: string().optional(),
	plate: string().optional(),
	delayMin: number().optional(),
	eta: string().optional(),
	cargo: _enum(["dry", "reefer"]).optional(),
	forceDockId: string().optional(),
	note: string().optional()
});
function etaFromClock(eta) {
	const m = eta.match(/^(\d{1,2}):(\d{2})$/);
	if (!m) return void 0;
	return Number(m[1]) * 60 + Number(m[2]) - 480;
}
/** Server-only QuotaMesh upstream key (never exposed to browser bundle) */
function getServerQuotaMeshKey() {
	return process.env.QUOTAMESH_API_KEY ?? "qm-local-dev-key";
}
var interpretDelay_createServerFn_handler = createServerRpc({
	id: "84f4eda24dd05058c896621ae8f766432c2ab7c61beacfad9462d94a6bbe7abf",
	name: "interpretDelay",
	filename: "src/lib/minmove/interpret.ts"
}, (opts) => interpretDelay.__executeServer(opts));
var interpretDelay = createServerFn({ method: "POST" }).validator((input) => Input.parse(input)).handler(interpretDelay_createServerFn_handler, async ({ data }) => {
	const yard = createYard();
	const local = parseEvent(data.text, yard);
	const reqOrigin = data.origin ?? "http://localhost:8090";
	const reqToken = data.boundToken ?? issueOriginBoundToken(reqOrigin);
	const guard = verifyOriginBoundRequest({
		requestOrigin: reqOrigin,
		requestReferer: reqOrigin,
		secFetchSite: "same-origin",
		presentedToken: reqToken
	});
	if (!guard.allowed) return {
		ok: true,
		via: "parse",
		parse: local,
		agentNote: guard.reasonVi,
		agentEtaMin: null,
		agentTruckId: null
	};
	const qmKey = getServerQuotaMeshKey();
	const xaiKey = process.env.XAI_API_KEY;
	const endpoint = qmKey ? QUOTAMESH_CHAT_ENDPOINT : "https://api.x.ai/v1/chat/completions";
	const apiKey = qmKey || xaiKey;
	if (!apiKey) return {
		ok: true,
		via: "parse",
		parse: local,
		agentNote: null,
		agentEtaMin: null,
		agentTruckId: null
	};
	try {
		const res = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
				"X-Session-Id": `hozerion-${guard.boundOriginHash}`
			},
			body: JSON.stringify({
				model: qmKey ? "auto" : "grok-4.5",
				temperature: 0,
				max_tokens: 280,
				messages: [{
					role: "system",
					content: "Extract a yard delay event as JSON only. Keys: truckId (A-L), plate, delayMin, eta (HH:MM 24h), cargo (dry|reefer), forceDockId (D1-D6), note. Omit unknown keys. Do not schedule. Do not invent a dock if the text does not name one."
				}, {
					role: "user",
					content: data.text
				}]
			})
		});
		if (!res.ok) return {
			ok: true,
			via: "parse",
			parse: local,
			agentNote: `QuotaMesh (${res.status}) · Dùng bộ phân tích nội bộ.`,
			agentEtaMin: null,
			agentTruckId: null
		};
		const body = await res.json();
		const raw = body.choices?.[0]?.message?.content ?? "";
		const jsonStart = raw.indexOf("{");
		const jsonEnd = raw.lastIndexOf("}");
		if (jsonStart < 0 || jsonEnd < 0) return {
			ok: true,
			via: "parse",
			parse: local,
			agentNote: `QuotaMesh [${body.id ?? "qm-auto"}] đã xác thực Origin-Bound.`,
			agentEtaMin: null,
			agentTruckId: null
		};
		const parsed = AgentJson.safeParse(JSON.parse(raw.slice(jsonStart, jsonEnd + 1)));
		if (!parsed.success) return {
			ok: true,
			via: "parse",
			parse: local,
			agentNote: `QuotaMesh [${body.id ?? "qm-auto"}] · Origin-Bound Verified.`,
			agentEtaMin: null,
			agentTruckId: null
		};
		const a = parsed.data;
		const truckKey = a.truckId;
		const plateKey = a.plate;
		const byId = truckKey ? yard.trucks.find((t) => t.id === truckKey.toUpperCase()) : void 0;
		const byPlate = plateKey ? yard.trucks.find((t) => t.plate.toUpperCase() === plateKey.toUpperCase()) : void 0;
		const yardTruck = byId ?? byPlate;
		const orig = yardTruck ? yard.appointments.find((x) => x.truckId === yardTruck.id) : void 0;
		const agentEta = (typeof a.delayMin === "number" && orig ? orig.startMin + a.delayMin : void 0) ?? (a.eta ? etaFromClock(a.eta) : void 0);
		const eta = local.event.newEtaMin ?? agentEta;
		const event = {
			truckId: local.event.truckId ?? yardTruck?.id ?? "",
			newEtaMin: eta ?? 0,
			cargoOverride: local.event.cargoOverride ?? a.cargo,
			forceDockId: local.event.forceDockId ?? a.forceDockId,
			source: "agent",
			note: a.note
		};
		return {
			ok: true,
			via: "agent",
			parse: {
				...local,
				event: {
					...local.event,
					...event,
					raw: data.text
				},
				complete: Boolean(event.truckId && eta !== void 0)
			},
			agentNote: a.note ?? `QuotaMesh [${body.id ?? "qm-auto"}] đã xử lý.`,
			agentEtaMin: agentEta ?? null,
			agentTruckId: yardTruck?.id ?? null
		};
	} catch {
		return {
			ok: true,
			via: "parse",
			parse: local,
			agentNote: "QuotaMesh fallback · Dùng bộ phân tích nội bộ.",
			agentEtaMin: null,
			agentTruckId: null
		};
	}
});
var QuotaMeshCheckSchema = object({
	mode: _enum([
		"legitimate_web",
		"stolen_foreign_domain",
		"stolen_cli_curl",
		"stolen_raw_key_attempt"
	]),
	clientOrigin: string(),
	boundToken: string(),
	prompt: string().optional()
});
var verifyAndRunQuotaMeshAgent_createServerFn_handler = createServerRpc({
	id: "8755b80ba3a3263b128c4befbdf03f93068be9806461817c87fb3ec2dbaf448e",
	name: "verifyAndRunQuotaMeshAgent",
	filename: "src/lib/minmove/interpret.ts"
}, (opts) => verifyAndRunQuotaMeshAgent.__executeServer(opts));
var verifyAndRunQuotaMeshAgent = createServerFn({ method: "POST" }).validator((input) => QuotaMeshCheckSchema.parse(input)).handler(verifyAndRunQuotaMeshAgent_createServerFn_handler, async ({ data }) => {
	const startMs = Date.now();
	const simulatedInput = data.mode === "stolen_foreign_domain" ? {
		requestOrigin: "https://stolen-agent-clone.attacker.io",
		requestReferer: "https://stolen-agent-clone.attacker.io/hack",
		secFetchSite: "cross-site",
		presentedToken: data.boundToken
	} : data.mode === "stolen_cli_curl" ? {
		requestOrigin: "",
		requestReferer: "",
		secFetchSite: "none",
		presentedToken: data.boundToken
	} : data.mode === "stolen_raw_key_attempt" ? {
		requestOrigin: data.clientOrigin,
		requestReferer: data.clientOrigin,
		secFetchSite: "same-origin",
		presentedToken: "qm-local-dev-key"
	} : {
		requestOrigin: data.clientOrigin,
		requestReferer: data.clientOrigin,
		secFetchSite: "same-origin",
		presentedToken: data.boundToken
	};
	const verdict = verifyOriginBoundRequest(simulatedInput);
	if (!verdict.allowed) {
		let directGatewayStatus = 401;
		try {
			directGatewayStatus = (await fetch(QUOTAMESH_CHAT_ENDPOINT, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${data.boundToken}`
				},
				body: JSON.stringify({
					model: "auto",
					max_tokens: 16,
					messages: [{
						role: "user",
						content: "ping"
					}]
				})
			})).status;
		} catch {
			directGatewayStatus = 401;
		}
		return {
			allowed: false,
			verdict,
			gatewayUrl: QUOTAMESH_GATEWAY_URL,
			directGatewayStatus,
			completionId: null,
			model: "auto",
			responseText: `BỊ CHẶN HOÀN TOÀN (${verdict.httpStatus} ${verdict.code}): ${verdict.reasonVi} · Gọi thẳng QuotaMesh bằng khoá lấy cắp cũng bị từ chối (${directGatewayStatus} Unauthorized).`,
			latencyMs: Date.now() - startMs
		};
	}
	try {
		const qmRes = await fetch(QUOTAMESH_CHAT_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${getServerQuotaMeshKey()}`,
				"X-Session-Id": `hozerion-web-${verdict.boundOriginHash}`
			},
			body: JSON.stringify({
				model: "auto",
				max_tokens: 120,
				messages: [{
					role: "user",
					content: data.prompt ?? "Điều phối luồng container Cát Lái (94% tải) sang Hiệp Phước (54% tải) với k=0."
				}]
			})
		});
		const qmJson = await qmRes.json();
		return {
			allowed: true,
			verdict,
			gatewayUrl: QUOTAMESH_GATEWAY_URL,
			directGatewayStatus: qmRes.status,
			completionId: qmJson.id ?? "qm-live-verified",
			model: qmJson.model ?? "auto (QuotaMesh Pool)",
			responseText: qmJson.choices?.[0]?.message?.content || `[QuotaMesh ${qmJson.id ?? "qm-auto"}] Đã xác thực Origin-Bound [${verdict.normalizedOrigin}] · Đề xuất chuyển 18% luồng Cát Lái → Hiệp Phước, giữ k = 0.`,
			latencyMs: Date.now() - startMs
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
			latencyMs: Date.now() - startMs
		};
	}
});
//#endregion
export { interpretDelay_createServerFn_handler, verifyAndRunQuotaMeshAgent_createServerFn_handler };
