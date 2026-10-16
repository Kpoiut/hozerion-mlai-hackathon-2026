export interface GeoPlace {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

/** Tan Thuan ICD gate. */
export const YARD_PLACE: GeoPlace = {
  id: "tan-thuan",
  name: "Tan Thuan ICD",
  lat: 10.7556,
  lon: 106.7281,
};

const PLACES: GeoPlace[] = [
  { id: "q7", name: "District 7", lat: 10.7308, lon: 106.7217 },
  { id: "cat-lai", name: "Cat Lai", lat: 10.784, lon: 106.782 },
  { id: "thu-duc", name: "Thu Duc", lat: 10.849, lon: 106.753 },
  { id: "q9", name: "District 9", lat: 10.842, lon: 106.828 },
  { id: "binh-tan", name: "Binh Tan", lat: 10.765, lon: 106.605 },
];

export function placeFromNote(note: string): GeoPlace {
  const t = note.toLowerCase();
  if (/c[aá]t\s*l[aá]i|cat lai/.test(t)) return PLACES[1]!;
  if (/th[uủ]\s*đ[uứ]c|thu duc|thuduc/.test(t)) return PLACES[2]!;
  if (/q(?:uận|uan)?\s*9|district 9/.test(t)) return PLACES[3]!;
  if (/b[iì]nh\s*t[aâ]n|binh tan/.test(t)) return PLACES[4]!;
  if (/q(?:uận|uan)?\s*7|district 7|q7/.test(t)) return PLACES[0]!;
  return PLACES[0]!;
}

export function haversineKm(a: GeoPlace, b: GeoPlace): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** City traffic: ~22 km/h plus 4 min gate approach. */
export function travelMinFromKm(km: number): number {
  return Math.max(6, Math.round((km / 22) * 60 + 4));
}

export interface LiveEta {
  from: GeoPlace;
  to: GeoPlace;
  km: number;
  travelMin: number;
  source: "osrm" | "haversine";
}

export function etaFromPlaces(from: GeoPlace, to: GeoPlace = YARD_PLACE): LiveEta {
  const km = haversineKm(from, to);
  return { from, to, km, travelMin: travelMinFromKm(km), source: "haversine" };
}

export async function etaFromOsrm(from: GeoPlace, to: GeoPlace = YARD_PLACE): Promise<LiveEta> {
  const fallback = etaFromPlaces(from, to);
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "MinMove/1.0 (yard planner)" },
    });
    if (!res.ok) return fallback;
    const body = (await res.json()) as { routes?: { duration?: number; distance?: number }[] };
    const route = body.routes?.[0];
    if (!route || typeof route.duration !== "number") return fallback;
    return {
      from,
      to,
      km: (route.distance ?? kmMeters(fallback.km)) / 1000,
      travelMin: Math.max(6, Math.round(route.duration / 60)),
      source: "osrm",
    };
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

function kmMeters(km: number): number {
  return km * 1000;
}

export function delayFromLive(bookedStartMin: number, live: LiveEta, nowMin: number): number {
  const arrival = nowMin + live.travelMin;
  return Math.max(0, Math.round(arrival - bookedStartMin));
}
