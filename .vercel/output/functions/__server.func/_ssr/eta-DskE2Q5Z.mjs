import { t as createServerFn } from "./ssr.mjs";
import { a as string, i as object } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/eta-DskE2Q5Z.js
/** Tan Thuan ICD gate. */
var YARD_PLACE = {
	id: "tan-thuan",
	name: "Tan Thuan ICD",
	lat: 10.7556,
	lon: 106.7281
};
var PLACES = [
	{
		id: "q7",
		name: "District 7",
		lat: 10.7308,
		lon: 106.7217
	},
	{
		id: "cat-lai",
		name: "Cat Lai",
		lat: 10.784,
		lon: 106.782
	},
	{
		id: "thu-duc",
		name: "Thu Duc",
		lat: 10.849,
		lon: 106.753
	},
	{
		id: "q9",
		name: "District 9",
		lat: 10.842,
		lon: 106.828
	},
	{
		id: "binh-tan",
		name: "Binh Tan",
		lat: 10.765,
		lon: 106.605
	}
];
function placeFromNote(note) {
	const t = note.toLowerCase();
	if (/c[aá]t\s*l[aá]i|cat lai/.test(t)) return PLACES[1];
	if (/th[uủ]\s*đ[uứ]c|thu duc|thuduc/.test(t)) return PLACES[2];
	if (/q(?:uận|uan)?\s*9|district 9/.test(t)) return PLACES[3];
	if (/b[iì]nh\s*t[aâ]n|binh tan/.test(t)) return PLACES[4];
	if (/q(?:uận|uan)?\s*7|district 7|q7/.test(t)) return PLACES[0];
	return PLACES[0];
}
function haversineKm(a, b) {
	const R = 6371;
	const dLat = (b.lat - a.lat) * Math.PI / 180;
	const dLon = (b.lon - a.lon) * Math.PI / 180;
	const la1 = a.lat * Math.PI / 180;
	const la2 = b.lat * Math.PI / 180;
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
	return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
/** City traffic: ~22 km/h plus 4 min gate approach. */
function travelMinFromKm(km) {
	return Math.max(6, Math.round(km / 22 * 60 + 4));
}
function etaFromPlaces(from, to = YARD_PLACE) {
	const km = haversineKm(from, to);
	return {
		from,
		to,
		km,
		travelMin: travelMinFromKm(km),
		source: "haversine"
	};
}
async function etaFromOsrm(from, to = YARD_PLACE) {
	const fallback = etaFromPlaces(from, to);
	const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 4e3);
	try {
		const res = await fetch(url, {
			signal: ctrl.signal,
			headers: { "User-Agent": "MinMove/1.0 (yard planner)" }
		});
		if (!res.ok) return fallback;
		const route = (await res.json()).routes?.[0];
		if (!route || typeof route.duration !== "number") return fallback;
		return {
			from,
			to,
			km: (route.distance ?? kmMeters(fallback.km)) / 1e3,
			travelMin: Math.max(6, Math.round(route.duration / 60)),
			source: "osrm"
		};
	} catch {
		return fallback;
	} finally {
		clearTimeout(timer);
	}
}
function kmMeters(km) {
	return km * 1e3;
}
var fetchLiveEta_createServerFn_handler = createServerRpc({
	id: "3517b0b980e33fb12b84705fbebec758ef4c50db8725334e2390b91ca62d5815",
	name: "fetchLiveEta",
	filename: "src/lib/minmove/eta.ts"
}, (opts) => fetchLiveEta.__executeServer(opts));
var fetchLiveEta = createServerFn({ method: "POST" }).validator((input) => object({ note: string().max(600) }).parse(input)).handler(fetchLiveEta_createServerFn_handler, async ({ data }) => {
	const live = await etaFromOsrm(placeFromNote(data.note || "Q7"), YARD_PLACE);
	return {
		from: live.from.name,
		to: live.to.name,
		km: Number(live.km.toFixed(2)),
		travelMin: live.travelMin,
		source: live.source
	};
});
//#endregion
export { fetchLiveEta_createServerFn_handler };
