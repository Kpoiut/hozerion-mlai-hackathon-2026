import type { Appointment, Dock, Truck, Yard } from "./types.ts";

const docks: Dock[] = [
  { id: "D1", name: "Door 1 · Fork", short: "D1", equipment: ["forklift"], cargo: ["dry"] },
  { id: "D2", name: "Door 2 · Fork", short: "D2", equipment: ["forklift"], cargo: ["dry"] },
  { id: "D3", name: "Door 3 · Cold", short: "D3", equipment: ["forklift", "reefer_plug"], cargo: ["reefer"] },
  { id: "D4", name: "Door 4 · Heavy", short: "D4", equipment: ["crane"], cargo: ["dry"] },
  { id: "D5", name: "Door 5 · Cold", short: "D5", equipment: ["reefer_plug"], cargo: ["reefer"] },
  { id: "D6", name: "Door 6 · Fork", short: "D6", equipment: ["forklift"], cargo: ["dry"] },
];

const trucks: Truck[] = [
  { id: "A", plate: "51A-100.61", hauler: "Nam An", durationMin: 60, cargo: "dry", requiredEquipment: ["forklift"], priority: 2, deadlineMin: 240, maxWaitMin: 180 },
  { id: "B", plate: "51B-210.44", hauler: "Nam An", durationMin: 45, cargo: "dry", requiredEquipment: ["forklift"], priority: 3, deadlineMin: 240, maxWaitMin: 180 },
  { id: "C", plate: "51C-882.13", hauler: "Mekong Cold", durationMin: 90, cargo: "dry", requiredEquipment: ["forklift"], priority: 1, deadlineMin: 420, maxWaitMin: 180 },
  { id: "P", plate: "51P-404.04", hauler: "Binh Tan", durationMin: 80, cargo: "dry", requiredEquipment: ["forklift"], priority: 2, deadlineMin: 480, maxWaitMin: 180 },
  { id: "Q", plate: "51Q-905.05", hauler: "Binh Tan", durationMin: 50, cargo: "dry", requiredEquipment: ["forklift"], priority: 2, deadlineMin: 420, maxWaitMin: 180 },
  { id: "D", plate: "51D-120.68", hauler: "Sai Gon Haul", durationMin: 70, cargo: "dry", requiredEquipment: ["forklift"], priority: 3, deadlineMin: 240, maxWaitMin: 180 },
  { id: "E", plate: "51E-221.09", hauler: "Sai Gon Haul", durationMin: 50, cargo: "dry", requiredEquipment: ["forklift"], priority: 3, deadlineMin: 300, maxWaitMin: 180 },
  { id: "R", plate: "51R-331.19", hauler: "Sai Gon Haul", durationMin: 40, cargo: "dry", requiredEquipment: ["forklift"], priority: 3, deadlineMin: 360, maxWaitMin: 180 },
  { id: "F", plate: "51F-901.11", hauler: "Mekong Cold", durationMin: 90, cargo: "reefer", requiredEquipment: ["reefer_plug"], priority: 1, deadlineMin: 180, maxWaitMin: 25 },
  { id: "G", plate: "51G-922.12", hauler: "Mekong Cold", durationMin: 70, cargo: "reefer", requiredEquipment: ["reefer_plug"], priority: 1, deadlineMin: 240, maxWaitMin: 25 },
  { id: "I", plate: "51I-983.13", hauler: "Mekong Cold", durationMin: 80, cargo: "reefer", requiredEquipment: ["reefer_plug"], priority: 1, deadlineMin: 240, maxWaitMin: 25 },
  { id: "J", plate: "51J-112.66", hauler: "Tan Thuan", durationMin: 40, cargo: "dry", requiredEquipment: ["forklift"], priority: 3, deadlineMin: 360, maxWaitMin: 180 },
  { id: "L", plate: "51L-119.08", hauler: "Tan Thuan", durationMin: 45, cargo: "dry", requiredEquipment: ["forklift"], priority: 3, deadlineMin: 480, maxWaitMin: 180 },
];

/** Minutes from 08:00. */
const appts: Appointment[] = [
  { truckId: "A", dockId: "D1", startMin: 0 },
  { truckId: "B", dockId: "D1", startMin: 70 },
  { truckId: "C", dockId: "D1", startMin: 160 },
  { truckId: "P", dockId: "D1", startMin: 260 },
  { truckId: "Q", dockId: "D1", startMin: 350 },
  { truckId: "D", dockId: "D2", startMin: 0 },
  { truckId: "E", dockId: "D2", startMin: 80 },
  { truckId: "R", dockId: "D2", startMin: 240 },
  { truckId: "F", dockId: "D3", startMin: 0 },
  { truckId: "G", dockId: "D3", startMin: 100 },
  { truckId: "I", dockId: "D5", startMin: 30 },
  { truckId: "J", dockId: "D6", startMin: 200 },
  { truckId: "L", dockId: "D6", startMin: 360 },
];

export const EVENT_TRUCK_ID = "C";
export const BASE_DELAY_MIN = 47;

export function createYard(): Yard {
  return {
    id: "tan-thuan-b",
    name: "Tan Thuan ICD",
    gate: "Gate B · morning board",
    shiftLabel: "08:00–16:00",
    shiftStartMin: 8 * 60,
    shiftLenMin: 8 * 60,
    docks: docks.map((d) => ({ ...d, equipment: [...d.equipment], cargo: [...d.cargo] })),
    trucks: trucks.map((t) => ({ ...t, requiredEquipment: [...t.requiredEquipment] })),
    appointments: appts.map((a) => ({ ...a })),
  };
}

export function clockLabel(shiftStartMin: number, offsetMin: number): string {
  const total = shiftStartMin + offsetMin;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatWhen(
  yard: { shiftStartMin: number; timeUnit?: "minute" | "hour" },
  offset: number,
): string {
  if (yard.timeUnit === "hour") return `${Math.round(offset)}h`;
  return clockLabel(yard.shiftStartMin, offset);
}
