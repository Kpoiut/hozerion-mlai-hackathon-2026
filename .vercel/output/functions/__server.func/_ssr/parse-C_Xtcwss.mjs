//#region node_modules/.nitro/vite/services/ssr/assets/parse-C_Xtcwss.js
var docks = [
	{
		id: "D1",
		name: "Door 1 · Fork",
		short: "D1",
		equipment: ["forklift"],
		cargo: ["dry"]
	},
	{
		id: "D2",
		name: "Door 2 · Fork",
		short: "D2",
		equipment: ["forklift"],
		cargo: ["dry"]
	},
	{
		id: "D3",
		name: "Door 3 · Cold",
		short: "D3",
		equipment: ["forklift", "reefer_plug"],
		cargo: ["reefer"]
	},
	{
		id: "D4",
		name: "Door 4 · Heavy",
		short: "D4",
		equipment: ["crane"],
		cargo: ["dry"]
	},
	{
		id: "D5",
		name: "Door 5 · Cold",
		short: "D5",
		equipment: ["reefer_plug"],
		cargo: ["reefer"]
	},
	{
		id: "D6",
		name: "Door 6 · Fork",
		short: "D6",
		equipment: ["forklift"],
		cargo: ["dry"]
	}
];
var trucks = [
	{
		id: "A",
		plate: "51A-100.61",
		hauler: "Nam An",
		durationMin: 60,
		cargo: "dry",
		requiredEquipment: ["forklift"],
		priority: 2,
		deadlineMin: 240,
		maxWaitMin: 180
	},
	{
		id: "B",
		plate: "51B-210.44",
		hauler: "Nam An",
		durationMin: 45,
		cargo: "dry",
		requiredEquipment: ["forklift"],
		priority: 3,
		deadlineMin: 240,
		maxWaitMin: 180
	},
	{
		id: "C",
		plate: "51C-882.13",
		hauler: "Mekong Cold",
		durationMin: 90,
		cargo: "dry",
		requiredEquipment: ["forklift"],
		priority: 1,
		deadlineMin: 420,
		maxWaitMin: 180
	},
	{
		id: "P",
		plate: "51P-404.04",
		hauler: "Binh Tan",
		durationMin: 80,
		cargo: "dry",
		requiredEquipment: ["forklift"],
		priority: 2,
		deadlineMin: 480,
		maxWaitMin: 180
	},
	{
		id: "Q",
		plate: "51Q-905.05",
		hauler: "Binh Tan",
		durationMin: 50,
		cargo: "dry",
		requiredEquipment: ["forklift"],
		priority: 2,
		deadlineMin: 420,
		maxWaitMin: 180
	},
	{
		id: "D",
		plate: "51D-120.68",
		hauler: "Sai Gon Haul",
		durationMin: 70,
		cargo: "dry",
		requiredEquipment: ["forklift"],
		priority: 3,
		deadlineMin: 240,
		maxWaitMin: 180
	},
	{
		id: "E",
		plate: "51E-221.09",
		hauler: "Sai Gon Haul",
		durationMin: 50,
		cargo: "dry",
		requiredEquipment: ["forklift"],
		priority: 3,
		deadlineMin: 300,
		maxWaitMin: 180
	},
	{
		id: "R",
		plate: "51R-331.19",
		hauler: "Sai Gon Haul",
		durationMin: 40,
		cargo: "dry",
		requiredEquipment: ["forklift"],
		priority: 3,
		deadlineMin: 360,
		maxWaitMin: 180
	},
	{
		id: "F",
		plate: "51F-901.11",
		hauler: "Mekong Cold",
		durationMin: 90,
		cargo: "reefer",
		requiredEquipment: ["reefer_plug"],
		priority: 1,
		deadlineMin: 180,
		maxWaitMin: 25
	},
	{
		id: "G",
		plate: "51G-922.12",
		hauler: "Mekong Cold",
		durationMin: 70,
		cargo: "reefer",
		requiredEquipment: ["reefer_plug"],
		priority: 1,
		deadlineMin: 240,
		maxWaitMin: 25
	},
	{
		id: "I",
		plate: "51I-983.13",
		hauler: "Mekong Cold",
		durationMin: 80,
		cargo: "reefer",
		requiredEquipment: ["reefer_plug"],
		priority: 1,
		deadlineMin: 240,
		maxWaitMin: 25
	},
	{
		id: "J",
		plate: "51J-112.66",
		hauler: "Tan Thuan",
		durationMin: 40,
		cargo: "dry",
		requiredEquipment: ["forklift"],
		priority: 3,
		deadlineMin: 360,
		maxWaitMin: 180
	},
	{
		id: "L",
		plate: "51L-119.08",
		hauler: "Tan Thuan",
		durationMin: 45,
		cargo: "dry",
		requiredEquipment: ["forklift"],
		priority: 3,
		deadlineMin: 480,
		maxWaitMin: 180
	}
];
/** Minutes from 08:00. */
var appts = [
	{
		truckId: "A",
		dockId: "D1",
		startMin: 0
	},
	{
		truckId: "B",
		dockId: "D1",
		startMin: 70
	},
	{
		truckId: "C",
		dockId: "D1",
		startMin: 160
	},
	{
		truckId: "P",
		dockId: "D1",
		startMin: 260
	},
	{
		truckId: "Q",
		dockId: "D1",
		startMin: 350
	},
	{
		truckId: "D",
		dockId: "D2",
		startMin: 0
	},
	{
		truckId: "E",
		dockId: "D2",
		startMin: 80
	},
	{
		truckId: "R",
		dockId: "D2",
		startMin: 240
	},
	{
		truckId: "F",
		dockId: "D3",
		startMin: 0
	},
	{
		truckId: "G",
		dockId: "D3",
		startMin: 100
	},
	{
		truckId: "I",
		dockId: "D5",
		startMin: 30
	},
	{
		truckId: "J",
		dockId: "D6",
		startMin: 200
	},
	{
		truckId: "L",
		dockId: "D6",
		startMin: 360
	}
];
function createYard() {
	return {
		id: "tan-thuan-b",
		name: "Tan Thuan ICD",
		gate: "Gate B · morning board",
		shiftLabel: "08:00–16:00",
		shiftStartMin: 480,
		shiftLenMin: 480,
		docks: docks.map((d) => ({
			...d,
			equipment: [...d.equipment],
			cargo: [...d.cargo]
		})),
		trucks: trucks.map((t) => ({
			...t,
			requiredEquipment: [...t.requiredEquipment]
		})),
		appointments: appts.map((a) => ({ ...a }))
	};
}
function clockLabel(shiftStartMin, offsetMin) {
	const total = shiftStartMin + offsetMin;
	const h = Math.floor(total / 60) % 24;
	const m = total % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function formatWhen(yard, offset) {
	if (yard.timeUnit === "hour") return `${Math.round(offset)}h`;
	return clockLabel(yard.shiftStartMin, offset);
}
function findTruck(yard, text) {
	const upper = text.toUpperCase();
	for (const t of yard.trucks) if (upper.includes(t.plate.toUpperCase())) return t.id;
	const plate = text.match(/\b(\d{2}[A-Z])[- ]?(\d{3})[.\s-]?(\d{2})\b/i);
	if (plate) {
		const compact = `${plate[1]}-${plate[2]}.${plate[3]}`.toUpperCase();
		const hit = yard.trucks.find((t) => t.plate.toUpperCase() === compact);
		if (hit) return hit.id;
	}
	const named = text.match(/\b(?:truck|xe)\s+([A-Z])\b/i);
	if (named) {
		const id = named[1].toUpperCase();
		if (yard.trucks.some((t) => t.id === id)) return id;
	}
}
function parseDelay(text, originalStart) {
	const note = [];
	const plus = text.match(/(?:late|delay|trễ|tre)\s*(?:thêm\s*)?(\d{1,3})\s*(?:m|min|phút|phut)?/i);
	if (plus) {
		const d = Number(plus[1]);
		return {
			eta: originalStart + d,
			note: [`delay +${d} min`]
		};
	}
	const clock = text.match(/\b(?:eta|lúc|luc|at)?\s*(\d{1,2})[:h](\d{2})\b/i);
	if (clock) {
		const h = Number(clock[1]);
		const m = Number(clock[2]);
		return {
			eta: h * 60 + m - 480,
			note: [`eta ${clock[1]}:${clock[2]}`]
		};
	}
	const around = text.match(/tầm\s*(\d{1,2})[h:](\d{2})/i);
	if (around) return {
		eta: Number(around[1]) * 60 + Number(around[2]) - 480,
		note: [`eta ~${around[1]}:${around[2]}`]
	};
	return { note };
}
function parseCargo(text) {
	if (/(reefer|cold|lạnh|lanh|đông lạnh|dong lanh|frozen)/i.test(text)) return "reefer";
	if (/(dry|khô|kho|hàng khô)/i.test(text)) return "dry";
}
function parseDock(text) {
	const m = text.match(/\b(?:door|dock|cửa|cua|làn|lan)\s*([1-6])\b/i);
	if (m) return `D${m[1]}`;
	const d = text.match(/\bD([1-6])\b/i);
	if (d) return `D${d[1]}`;
}
function parseEvent(text, yard = createYard()) {
	const warnings = [];
	const truckId = findTruck(yard, text);
	const delay = parseDelay(text, (truckId ? yard.appointments.find((a) => a.truckId === truckId) : void 0)?.startMin ?? 0);
	const cargo = parseCargo(text);
	const forceDockId = parseDock(text);
	const notes = [...delay.note];
	if (!truckId) warnings.push("No plate or truck id matched. Pick a truck on the board.");
	if (delay.eta === void 0) warnings.push("No delay or clock time found.");
	return {
		event: {
			raw: text,
			source: "parse",
			truckId,
			newEtaMin: delay.eta,
			cargoOverride: cargo,
			forceDockId,
			note: notes.join(", ") || void 0
		},
		matchedTruckId: truckId,
		warnings,
		complete: Boolean(truckId && delay.eta !== void 0)
	};
}
//#endregion
export { parseEvent as i, createYard as n, formatWhen as r, clockLabel as t };
