import { useMemo } from "react";
import { CheckCircle2, Filter, Sparkles } from "lucide-react";
import { useBoardStore } from "@/lib/minmove/store.ts";
import {
  MULTIMODAL_FLEET_ASSETS,
  resolveTruckModeId,
  type MultimodalAssetMeta,
  type MultimodalModeId,
} from "@/lib/minmove/vehicle-modes.ts";
import { cn } from "@/lib/utils";

export type MultimodalAsset = MultimodalAssetMeta;
export { MULTIMODAL_FLEET_ASSETS };
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
  const yard = useBoardStore((s) => s.yard);
  const vehicleModeFilter = useBoardStore((s) => s.vehicleModeFilter);
  const setVehicleModeFilter = useBoardStore((s) => s.setVehicleModeFilter);
  const truckModeOverrides = useBoardStore((s) => s.truckModeOverrides);
  const selectedId = useBoardStore((s) => s.selectedId);

  const selectedTruck = useMemo(
    () => yard.trucks.find((t) => t.id === selectedId),
    [yard.trucks, selectedId],
  );
  const selectedTruckMode = selectedTruck
    ? resolveTruckModeId(selectedTruck, yard, truckModeOverrides)
    : "reefer-truck";

  const activeId =
    selectedAssetId ??
    (vehicleModeFilter !== "all" ? vehicleModeFilter : selectedTruckMode);

  const boardCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of yard.trucks) {
      const m = resolveTruckModeId(t, yard, truckModeOverrides);
      counts[m] = (counts[m] ?? 0) + 1;
    }
    return counts;
  }, [yard, truckModeOverrides]);

  const totalActiveOnBoard = yard.trucks.length;

  return (
    <div className="rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-accent ring-1 ring-accent/20">
            <Sparkles className="size-3" />8 Hệ Phương Tiện & Thiết Bị Đa Phương Thức
          </span>
          <span className="text-xs font-medium text-muted">
            Bấm vào phương tiện bất kỳ để lọc trên bảng Gantt & xem chi tiết tại Inspector
          </span>
          {vehicleModeFilter !== "all" ? (
            <button
              type="button"
              onClick={() => setVehicleModeFilter("all")}
              className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs"
            >
              <Filter className="size-2.5" />
              Đang lọc: {MULTIMODAL_FLEET_ASSETS.find((x) => x.id === vehicleModeFilter)?.shortVi} (Bỏ lọc ×)
            </button>
          ) : null}
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-ok/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ok ring-1 ring-ok/20">
          <CheckCircle2 className="size-3" />
          {totalActiveOnBoard} lượt trên lịch · 346 / 388 phương tiện đồng bộ
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
          const isFiltered = vehicleModeFilter === item.id;
          const onBoard = boardCounts[item.id] ?? 0;
          return (
            <button
              key={item.id}
              type="button"
              data-fleet-mode={item.id}
              onClick={() => {
                setVehicleModeFilter(item.id as MultimodalModeId);
                onSelectAsset?.(item);
              }}
              className={cn(
                "group flex flex-col overflow-hidden rounded-xl p-2 text-left transition-all",
                isSelected || isFiltered
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
                {onBoard > 0 ? (
                  <span className="absolute right-1 bottom-1 rounded bg-accent px-1.5 py-0.5 font-mono text-[9px] font-bold text-white shadow-2xs">
                    {onBoard} trên bảng
                  </span>
                ) : null}
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
