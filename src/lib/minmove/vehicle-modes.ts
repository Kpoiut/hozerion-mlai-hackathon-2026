import type { Truck, Yard } from "./types.ts";

export type MultimodalModeId =
  | "ship"
  | "barge"
  | "train"
  | "aircraft"
  | "reefer-truck"
  | "agv-stacker"
  | "sts-rtg"
  | "van-drone";

export interface MultimodalAssetMeta {
  id: MultimodalModeId;
  code: string;
  shortVi: string;
  nameVi: string;
  categoryVi: string;
  image: string;
  activeUnits: number;
  totalUnits: number;
  capacityLabel: string;
  slaRate: string;
  corridorVi: string;
  badgeColor: string;
  chipBg: string;
}

export const MULTIMODAL_FLEET_ASSETS: readonly MultimodalAssetMeta[] = [
  {
    id: "ship",
    code: "SEA-MOTHER",
    shortVi: "Tàu biển",
    nameVi: "Tàu Mẹ & Tàu Feeder",
    categoryVi: "Đường biển Quốc tế",
    image: "/assets/logistics/vehicle-ship.png",
    activeUnits: 12,
    totalUnits: 14,
    capacityLabel: "2,850 – 18,000 TEU",
    slaRate: "99.2% đúng lịch",
    corridorVi: "Barcelona 24B · Cái Mép – Thị Vải",
    badgeColor: "bg-indigo-500/12 text-indigo-600 ring-indigo-500/25",
    chipBg: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  },
  {
    id: "barge",
    code: "IWT-BARGE",
    shortVi: "Sà lan",
    nameVi: "Sà Lan Tự Hành Sông",
    categoryVi: "Đường thủy Nội địa",
    image: "/assets/logistics/vehicle-barge.png",
    activeUnits: 28,
    totalUnits: 32,
    capacityLabel: "128 – 300 TEU / chiếc",
    slaRate: "96.8% luồng xanh",
    corridorVi: "Sông Sài Gòn · Đồng Nai · Soài Rạp",
    badgeColor: "bg-sky-500/12 text-sky-600 ring-sky-500/25",
    chipBg: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  {
    id: "train",
    code: "RAIL-INTERMODAL",
    shortVi: "Tàu hỏa",
    nameVi: "Tàu Hỏa Chở Container",
    categoryVi: "Đường sắt Liên vận",
    image: "/assets/logistics/vehicle-train.png",
    activeUnits: 6,
    totalUnits: 6,
    capacityLabel: "6 Line · 180 TEU / đoàn",
    slaRate: "100% đúng giờ",
    corridorVi: "ICD Sóng Thần · Trảng Bom · Liên vận",
    badgeColor: "bg-amber-500/12 text-amber-600 ring-amber-500/25",
    chipBg: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  {
    id: "aircraft",
    code: "AIR-FREIGHT",
    shortVi: "Air Cargo",
    nameVi: "Máy Bay Vận Tải Cargo",
    categoryVi: "Hàng không & ULD",
    image: "/assets/logistics/vehicle-aircraft.png",
    activeUnits: 4,
    totalUnits: 5,
    capacityLabel: "Boeing 777F · 102 Tấn ULD",
    slaRate: "99.8% Express SLA",
    corridorVi: "Tân Sơn Nhất Cargo · Long Thành Hub",
    badgeColor: "bg-violet-500/12 text-violet-600 ring-violet-500/25",
    chipBg: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  },
  {
    id: "reefer-truck",
    code: "ROAD-REEFER",
    shortVi: "Đầu kéo",
    nameVi: "Xe Đầu Kéo & Reefer -25°C",
    categoryVi: "Đường bộ & Chuỗi lạnh",
    image: "/assets/logistics/vehicle-reefer-truck.png",
    activeUnits: 156,
    totalUnits: 180,
    capacityLabel: "20DC / 40HC / 45RF",
    slaRate: "98.4% Cold SLA",
    corridorVi: "Tân Thuận ICD · Cát Lái · Trường Thọ",
    badgeColor: "bg-emerald-500/12 text-emerald-600 ring-emerald-500/25",
    chipBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  {
    id: "agv-stacker",
    code: "YARD-AGV-RS",
    shortVi: "AGV Bãi",
    nameVi: "Robot AGV & Xe Nâng Chụp",
    categoryVi: "Tự động hóa Bãi & Kho",
    image: "/assets/logistics/vehicle-agv-stacker.png",
    activeUnits: 42,
    totalUnits: 45,
    capacityLabel: "45 Tấn · Tự hành Lidar 5G",
    slaRate: "99.5% k=0",
    corridorVi: "Bãi B01 – B06 · Cross-dock D1–D6",
    badgeColor: "bg-teal-500/12 text-teal-600 ring-teal-500/25",
    chipBg: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  },
  {
    id: "sts-rtg",
    code: "QUAY-STS-RTG",
    shortVi: "Cẩu RTG",
    nameVi: "Cẩu Bờ STS & Cẩu Khung RTG",
    categoryVi: "Thiết bị Bốc xếp Cảng",
    image: "/assets/logistics/vehicle-sts-rtg.png",
    activeUnits: 34,
    totalUnits: 36,
    capacityLabel: "38 – 42 MPH / cẩu",
    slaRate: "97.9% khả dụng",
    corridorVi: "Cầu bến B0–B19 · Bãi RTG Điện",
    badgeColor: "bg-blue-500/12 text-blue-600 ring-blue-500/25",
    chipBg: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  },
  {
    id: "van-drone",
    code: "LASTMILE-UAV",
    shortVi: "EV Van",
    nameVi: "Xe Van Điện & Drone Bãi",
    categoryVi: "Chặng cuối & Kiểm kê AI",
    image: "/assets/logistics/vehicle-van-drone.png",
    activeUnits: 64,
    totalUnits: 70,
    capacityLabel: "EV 3.5T & Drone Quét RFID",
    slaRate: "99.1% giao nhanh",
    corridorVi: "Nội đô TP.HCM & Quét nhãn ISO 6346",
    badgeColor: "bg-rose-500/12 text-rose-600 ring-rose-500/25",
    chipBg: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  },
];

const SEED_TRUCK_MODES: Record<string, MultimodalModeId> = {
  A: "reefer-truck",
  B: "van-drone",
  C: "reefer-truck",
  P: "train",
  Q: "agv-stacker",
  D: "barge",
  E: "reefer-truck",
  R: "aircraft",
  F: "reefer-truck",
  G: "reefer-truck",
  I: "ship",
  J: "sts-rtg",
  L: "barge",
};

const OPERATORS_BY_ID: Record<
  string,
  {
    driverName: string;
    driverPhone: string;
    bookingCode: string;
    vesselName?: string;
    imoCode?: string;
    teuCap?: number;
    lengthM?: number;
    draftM?: number;
  }
> = {
  A: {
    driverName: "Trần Quốc Bảo",
    driverPhone: "0903 812 104",
    bookingCode: "VN-ICD-880102",
  },
  B: {
    driverName: "Lê Hoàng Nam",
    driverPhone: "0918 442 910",
    bookingCode: "EV-HUB-210440",
  },
  C: {
    driverName: "Nguyễn Văn A",
    driverPhone: "0909 123 456",
    bookingCode: "HCMU1234567",
  },
  P: {
    driverName: "Đặng Minh Tuấn (Trưởng tàu)",
    driverPhone: "0982 501 774",
    bookingCode: "RAIL-ST-40404",
  },
  Q: {
    driverName: "Hệ tự hành AGV-09 (L4)",
    driverPhone: "5G-LIDAR-CH09",
    bookingCode: "AGV-YARD-90505",
  },
  D: {
    driverName: "Thuyền trưởng Võ Văn Kiệt",
    driverPhone: "0913 778 220",
    bookingCode: "IWT-SG-12068",
  },
  E: {
    driverName: "Phạm Hồng Phúc",
    driverPhone: "0908 331 609",
    bookingCode: "VN-ICD-221090",
  },
  R: {
    driverName: "Điều phái ULD Vũ Hải",
    driverPhone: "0977 889 112",
    bookingCode: "AWB-777F-33119",
  },
  F: {
    driverName: "Huỳnh Thanh Tùng",
    driverPhone: "0902 901 118",
    bookingCode: "COLD-RF-90111",
  },
  G: {
    driverName: "Ngô Gia Huy",
    driverPhone: "0906 922 129",
    bookingCode: "COLD-RF-92212",
  },
  I: {
    driverName: "Thuyền trưởng Lý Thành",
    driverPhone: "0914 983 130",
    bookingCode: "SEA-RF-98313",
  },
  J: {
    driverName: "Kỹ sư điều khiển RTG-04",
    driverPhone: "0938 112 660",
    bookingCode: "RTG-SLOT-11266",
  },
  L: {
    driverName: "Thuyền trưởng Bùi Văn Hòa",
    driverPhone: "0919 119 088",
    bookingCode: "IWT-CL-11908",
  },
};

export interface ResolvedVehicleMeta {
  mode: MultimodalAssetMeta;
  shortBadgeVi: string;
  driverName: string;
  driverPhone: string;
  bookingCode: string;
  containerSpec: string;
  operationTypeVi: string;
  vesselName: string;
  imoCode: string;
  teuCap: number;
  lengthM: number;
  draftM: number;
  photoUrl: string;
}

export function resolveTruckModeId(
  truck: Truck,
  yard: Pick<Yard, "timeUnit">,
  overrides?: Record<string, MultimodalModeId>,
): MultimodalModeId {
  if (overrides?.[truck.id]) {
    return overrides[truck.id]!;
  }
  if (truck.vehicleMode) {
    return truck.vehicleMode;
  }
  if (yard.timeUnit === "hour") {
    const num = Number(truck.id.replace(/\D/g, "")) || 1;
    if (num % 7 === 0) return "barge";
    return "ship";
  }
  if (SEED_TRUCK_MODES[truck.id]) {
    return SEED_TRUCK_MODES[truck.id]!;
  }
  if (truck.cargo === "reefer") return "reefer-truck";
  const hash = truck.id.charCodeAt(0) % MULTIMODAL_FLEET_ASSETS.length;
  return MULTIMODAL_FLEET_ASSETS[hash]?.id ?? "reefer-truck";
}

export function resolveTruckVehicleMeta(
  truck: Truck,
  yard: Pick<Yard, "timeUnit">,
  overrides?: Record<string, MultimodalModeId>,
  forceReefer?: boolean,
): ResolvedVehicleMeta {
  const modeId = resolveTruckModeId(truck, yard, overrides);
  const mode =
    MULTIMODAL_FLEET_ASSETS.find((m) => m.id === modeId) ??
    MULTIMODAL_FLEET_ASSETS[4]!;
  const isReefer = truck.cargo === "reefer" || Boolean(forceReefer);
  const op = OPERATORS_BY_ID[truck.id];
  const seedNum =
    truck.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) +
    truck.durationMin;

  const shortBadgeVi =
    mode.id === "reefer-truck"
      ? isReefer
        ? "Xe lạnh"
        : "Đầu kéo"
      : mode.shortVi;

  const containerSpec =
    mode.id === "ship"
      ? `${(truck.span ?? 1) * 1450} TEU · ${truck.span ?? 1} bến`
      : mode.id === "barge"
        ? "128 TEU Sà lan"
        : mode.id === "train"
          ? "60 TEU Đoàn tàu"
          : mode.id === "aircraft"
            ? "ULD Air Pallet"
            : mode.id === "agv-stacker"
              ? "AGV 45T L4"
              : mode.id === "sts-rtg"
                ? "Twin-lift 40HC"
                : mode.id === "van-drone"
                  ? "EV 3.5T + RFID"
                  : isReefer
                    ? "40RF -25°C"
                    : "40DC Liên vận";

  const vesselNames = [
    "MSC OCEAN",
    "EVER GREEN",
    "CMA CGM MARCO",
    "MAERSK HANOI",
    "ONE INNOVATION",
    "HAPAG LLOYD",
    "OOCL ASIA",
    "COSCO SHIPPING",
  ];
  const vesselName =
    op?.vesselName ?? vesselNames[seedNum % vesselNames.length] ?? "MSC OCEAN";
  const imoCode = op?.imoCode ?? `IMO ${9810000 + ((seedNum * 137) % 89999)}`;
  const teuCap = op?.teuCap ?? 1800 + (truck.span ?? 1) * 950 + (seedNum % 7) * 200;
  const lengthM = op?.lengthM ?? 220 + (truck.span ?? 1) * 40;
  const draftM = op?.draftM ?? Number((11.2 + ((seedNum % 8) * 0.4)).toFixed(1));

  const photoUrl =
    truck.id === "C" && mode.id === "reefer-truck"
      ? "/assets/logistics/truck-51c-photo.png"
      : mode.image;

  return {
    mode,
    shortBadgeVi,
    driverName:
      op?.driverName ??
      (yard.timeUnit === "hour"
        ? `Thuyền trưởng ${vesselName}`
        : `Điều vận ${truck.hauler} #${truck.id}`),
    driverPhone:
      op?.driverPhone ??
      `090${(seedNum % 8) + 1} ${100 + (seedNum % 899)} ${200 + ((seedNum * 3) % 799)}`,
    bookingCode:
      op?.bookingCode ??
      `${yard.timeUnit === "hour" ? "BCN" : "HCMU"}${1000000 + ((seedNum * 919) % 8999999)}`,
    containerSpec,
    operationTypeVi:
      truck.priority === 1
        ? "Ưu tiên P1 · Xuất hàng"
        : truck.priority === 2
          ? "Chuyển cảng · Liên vận"
          : "Nhập bãi · Nội địa",
    vesselName,
    imoCode,
    teuCap,
    lengthM,
    draftM,
    photoUrl,
  };
}
