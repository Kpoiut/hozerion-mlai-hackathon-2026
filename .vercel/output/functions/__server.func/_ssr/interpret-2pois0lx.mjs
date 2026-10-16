import { t as createServerFn } from "./ssr.mjs";
import { i as parseEvent, n as createYard } from "./parse-C_Xtcwss.mjs";
import { a as string, i as object, r as number, t as _enum } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/interpret-2pois0lx.js
var Input = object({ text: string().min(1).max(600) });
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
var interpretDelay_createServerFn_handler = createServerRpc({
	id: "84f4eda24dd05058c896621ae8f766432c2ab7c61beacfad9462d94a6bbe7abf",
	name: "interpretDelay",
	filename: "src/lib/minmove/interpret.ts"
}, (opts) => interpretDelay.__executeServer(opts));
var interpretDelay = createServerFn({ method: "POST" }).validator((input) => Input.parse(input)).handler(interpretDelay_createServerFn_handler, async ({ data }) => {
	const yard = createYard();
	const local = parseEvent(data.text, yard);
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: true,
		via: "parse",
		parse: local,
		agentNote: null,
		agentEtaMin: null,
		agentTruckId: null
	};
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
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
			agentNote: `Agent unavailable (${res.status}). Using parser.`,
			agentEtaMin: null,
			agentTruckId: null
		};
		const raw = (await res.json()).choices?.[0]?.message?.content ?? "";
		const jsonStart = raw.indexOf("{");
		const jsonEnd = raw.lastIndexOf("}");
		if (jsonStart < 0 || jsonEnd < 0) return {
			ok: true,
			via: "parse",
			parse: local,
			agentNote: "Agent returned no JSON. Using parser.",
			agentEtaMin: null,
			agentTruckId: null
		};
		const parsed = AgentJson.safeParse(JSON.parse(raw.slice(jsonStart, jsonEnd + 1)));
		if (!parsed.success) return {
			ok: true,
			via: "parse",
			parse: local,
			agentNote: "Agent schema miss. Using parser.",
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
			agentNote: a.note ?? null,
			agentEtaMin: agentEta ?? null,
			agentTruckId: yardTruck?.id ?? null
		};
	} catch {
		return {
			ok: true,
			via: "parse",
			parse: local,
			agentNote: "Agent failed. Using parser.",
			agentEtaMin: null,
			agentTruckId: null
		};
	}
});
//#endregion
export { interpretDelay_createServerFn_handler };
