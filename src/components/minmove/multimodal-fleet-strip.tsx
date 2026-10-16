import { useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultimodalAsset {
  id: string;
  code: string;
  nameVi: string;
  categoryVi: string;
  image: string;
  activeUnits: number;
  totalUnits: number;
  capacityLabel: string;
  slaRate: string;
  corridorVi: string;
  badgeColor: string;
}

export const MULTIMODAL_FLEET_ASSETS: readonly MultimodalAsset[] = [
  {
    id: "ship",
    code: "SEA-MOTHER",
    nameVi: "Tàu Mẹ & Tàu Feeder",
    categoryVi: "Đường biển Quốc tế",
    image: "/assets/logistics/vehicle-ship.png",
    activeUnits: 12,
    totalUnits: 14,
    capacityLabel: "2,850 – 18,000 TEU",
    slaRate: "99.2% đúng lịch",
    corridorVi: "Barcelona 24B · Cái Mép – Thị Vải",
    badgeColor: "bg-indigo-500/12 text-indigo-600 ring-indigo-500/25",
  },
  {
    id: "barge",
    code: "IWT-BARGE",
    nameVi: "Sà Lan Tự Hành Sông",
    categoryVi: "Đường thủy Nội địa",
    image: "/assets/logistics/vehicle-barge.png",
    activeUnits: 28,
    totalUnits: 32,
    capacityLabel: "128 – 300 TEU / chiếc",
    slaRate: "96.8% luồng xanh",
    corridorVi: "Sông Sài Gòn · Đồng Nai · Soài Rạp",
    badgeColor: "bg-sky-500/12 text-sky-600 ring-sky-500/25",
  },
  {
    id: "train",
    code: "RAIL-INTERMODAL",
    nameVi: "Tàu Hỏa Chở Container",
    categoryVi: "Đường sắt Liên vận",
    image: "/assets/logistics/vehicle-train.png",
    activeUnits: 6,
    totalUnits: 6,
    capacityLabel: "6 Line · 180 TEU / đoàn",
    slaRate: "100% đúng giờ",
    corridorVi: "ICD Sóng Thần · Trảng Bom · Liên vận",
    badgeColor: "bg-amber-500/12 text-amber-600 ring-amber-500/25",
  },
  {
    id: "aircraft",
    code: "AIR-FREIGHT",
    nameVi: "Máy Bay Vận Tải Cargo",
    categoryVi: "Hàng không & ULD",
    image: "/assets/logistics/vehicle-aircraft.png",
    activeUnits: 4,
    totalUnits: 5,
    capacityLabel: "Boeing 777F · 102 Tấn ULD",
    slaRate: "99.8% Express SLA",
    corridorVi: "Tân Sơn Nhất Cargo · Long Thành Hub",
    badgeColor: "bg-violet-500/12 text-violet-600 ring-violet-500/25",
  },
  {
    id: "reefer-truck",
    code: "ROAD-REEFER",
    nameVi: "Xe Đầu Kéo & Reefer -25°C",
    categoryVi: "Đường bộ & Chuỗi lạnh",
    image: "/assets/logistics/vehicle-reefer-truck.png",
    activeUnits: 156,
    totalUnits: 180,
    capacityLabel: "20DC / 40HC / 45RF",
    slaRate: "98.4% Cold SLA",
    corridorVi: "Tân Thuận ICD · Cát Lái · Trường Thọ",
    badgeColor: "bg-emerald-500/12 text-emerald-600 ring-emerald-500/25",
  },
  {
    id: "agv-stacker",
    code: "YARD-AGV-RS",
    nameVi: "Robot AGV & Xe Nâng Chụp",
    categoryVi: "Tự động hóa Bãi & Kho",
    image: "/assets/logistics/vehicle-agv-stacker.png",
    activeUnits: 42,
    totalUnits: 45,
    capacityLabel: "45 Tấn · Tự hành Lidar 5G",
    slaRate: "99.5% k=0",
    corridorVi: "Bãi B01 – B06 · Cross-dock D1–D6",
    badgeColor: "bg-teal-500/12 text-teal-600 ring-teal-500/25",
  },
  {
    id: "sts-rtg",
    code: "QUAY-STS-RTG",
    nameVi: "Cẩu Bờ STS & Cẩu Khung RTG",
    categoryVi: "Thiết bị Bốc xếp Cảng",
    image: "/assets/logistics/vehicle-sts-rtg.png",
    activeUnits: 34,
    totalUnits: 36,
    capacityLabel: "38 – 42 MPH / cẩu",
    slaRate: "97.9% khả dụng",
    corridorVi: "Cầu bến B0–B19 · Bãi RTG Điện",
    badgeColor: "bg-blue-500/12 text-blue-600 ring-blue-500/25",
  },
  {
    id: "van-drone",
    code: "LASTMILE-UAV",
    nameVi: "Xe Van Điện & Drone Bãi",
    categoryVi: "Chặng cuối & Kiểm kê AI",
    image: "/assets/logistics/vehicle-van-drone.png",
    activeUnits: 64,
    totalUnits: 70,
    capacityLabel: "EV 3.5T & Drone Quét RFID",
    slaRate: "99.1% giao nhanh",
    corridorVi: "Nội đô TP.HCM & Quét nhãn ISO 6346",
    badgeColor: "bg-rose-500/12 text-rose-600 ring-rose-500/25",
  },
];

export const MULTIMODAL_FLEET = MULTIMODAL_FLEET_ASSETS;

export function MultimodalFleetStrip({
  compact = false,
  selectedAssetId,
  onSelectAsset,
}: {
  compact?: boolean;
  selectedAssetId?: string;
  onSelectAsset?: (asset: MultimodalAsset) => void;
}) {
  const [internalId, setInternalId] = useState<string>("reefer-truck");
  const activeId = selectedAssetId ?? internalId;

  return (
    <div className="rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-accent ring-1 ring-accent/20">
            <Sparkles className="size-3" />8 Hệ Phương Tiện & Thiết Bị Đa Phương Thức
          </span>
          <span className="text-xs font-medium text-muted">
            Đường biển · Sà lan sông · Đường sắt · Hàng không · Đầu kéo Reefer · Robot AGV · Cẩu STS/RTG · EV Van & Drone
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-ok/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ok ring-1 ring-ok/20">
          <CheckCircle2 className="size-3" />
          346 / 388 phương tiện đang đồng bộ thời gian thực
        </span>
      </div>

      <div
        className={cn(
          "grid gap-2.5",
          compact ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8" : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8",
        )}
      >
        {MULTIMODAL_FLEET_ASSETS.map((item) => {
          const isSelected = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setInternalId(item.id);
                onSelectAsset?.(item);
              }}
              className={cn(
                "group flex flex-col overflow-hidden rounded-xl p-2 text-left transition-all",
                isSelected
                  ? "bg-accent/[0.06] shadow-xs ring-2 ring-accent"
                  : "bg-raised/40 ring-1 ring-line hover:bg-raised hover:ring-accent/40",
              )}
            >
              <div className="relative h-20 w-full overflow-hidden rounded-lg bg-[#F4F7FB]">
                <img
                  src={item.image}
                  alt={item.nameVi}
                  className="h-full w-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-1 left-1 rounded bg-slate-900/75 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white backdrop-blur-xs">
                  {item.activeUnits}/{item.totalUnits}
                </span>
              </div>
              <span
                className={cn(
                  "mt-1.5 inline-flex w-fit items-center rounded px-1.5 py-0.5 text-[9px] font-bold ring-1",
                  item.badgeColor,
                )}
              >
                {item.categoryVi}
              </span>
              <p className="mt-1 truncate text-xs font-bold text-fg">{item.nameVi}</p>
              <p className="truncate font-mono text-[10px] text-muted">{item.capacityLabel}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
