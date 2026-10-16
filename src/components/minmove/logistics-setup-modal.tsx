import { useEffect, useState } from "react";
import {
  Anchor,
  Building2,
  Check,
  Lock,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Snowflake,
  Sparkles,
  Trash2,
  Truck,
  Unlock,
  Warehouse,
  X,
} from "lucide-react";
import { useBoardStore, type FacilityPresetId } from "@/lib/minmove/store.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

const PRESETS: Array<{
  id: FacilityPresetId;
  title: string;
  sub: string;
  unit: string;
  sla: string;
  adapter: string;
  icon: typeof Anchor;
}> = [
  {
    id: "icd-minute",
    title: "Tan Thuan ICD",
    sub: "6 Doors · Gate B Morning",
    unit: "Minute",
    sla: "$18/m",
    adapter: "SGP-TOS / Smart ICD",
    icon: Warehouse,
  },
  {
    id: "bcn-hour",
    title: "Barcelona Quay 24B",
    sub: "20 Berths · 27 Vessels",
    unit: "Hour",
    sla: "$1,500/h",
    adapter: "Navis N4 / TOPOVN",
    icon: Anchor,
  },
  {
    id: "reefer-cold",
    title: "Mekong Cold -25°C",
    sub: "6 Reefer Doors · Cold Chain",
    unit: "Minute",
    sla: "$28/m",
    adapter: "Blue Yonder WMS",
    icon: Snowflake,
  },
  {
    id: "crossdock-fmcg",
    title: "Cross-Dock FMCG",
    sub: "8 High-Velocity Doors",
    unit: "Minute",
    sla: "$15/m",
    adapter: "SAP EWM / FourKites",
    icon: Building2,
  },
  {
    id: "barge-hub",
    title: "Cát Lái – Hiệp Phước",
    sub: "6 Barge Berths · VETC",
    unit: "Minute",
    sla: "$22/m",
    adapter: "VTOS / TOPX / VETC",
    icon: Truck,
  },
];

const ADAPTERS = [
  "Navis N4 / RBS TOPOVN",
  "SGP-TOS (VTOS / GTOS / VSL)",
  "Blue Yonder WMS / Cold-Chain ERP",
  "SAP EWM / FourKites Dynamic Yard",
  "Custom REST Webhook (RFC 7396 JSON)",
];

export function LogisticsSetupModal() {
  const open = useBoardStore((s) => s.setupOpen);
  const setOpen = useBoardStore((s) => s.setSetupOpen);
  const yard = useBoardStore((s) => s.yard);
  const slaRateUsd = useBoardStore((s) => s.slaRateUsd);
  const maxMovesAllowed = useBoardStore((s) => s.maxMovesAllowed);
  const freezeWindowMin = useBoardStore((s) => s.freezeWindowMin);
  const hostAdapter = useBoardStore((s) => s.hostAdapter);

  const [section, setSection] = useState<"facility" | "rules" | "inject">("facility");
  const [nameInput, setNameInput] = useState(yard.name);
  const [gateInput, setGateInput] = useState(yard.gate);

  const hour = yard.timeUnit === "hour";
  const [jobPlate, setJobPlate] = useState(hour ? "MV-908" : "51C-998.68");
  const [jobHauler, setJobHauler] = useState(hour ? "Maersk Feeder" : "Mekong Express");
  const [jobDock, setJobDock] = useState(yard.docks[0]?.id ?? "D1");
  const [jobStart, setJobStart] = useState(hour ? 12 : 120);
  const [jobDelay, setJobDelay] = useState(hour ? 2 : 45);
  const [jobDur, setJobDur] = useState(hour ? 14 : 75);

  useEffect(() => {
    setNameInput(yard.name);
    setGateInput(yard.gate);
    setJobDock(yard.docks[0]?.id ?? "D1");
  }, [yard.name, yard.gate, yard.docks]);
  const [jobCargo, setJobCargo] = useState<"dry" | "reefer">("reefer");
  const [jobPrio, setJobPrio] = useState<1 | 2 | 3>(1);
  const [jobSpan, setJobSpan] = useState(4);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-xs">
      <div
        data-setup-modal=""
        className="flex max-h-[88dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-surface shadow-float ring-1 ring-line"
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/25">
              <SlidersHorizontal className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-fg">Logistics Self-Setup Studio · Cấu Hình Tự Chủ Theo Doanh Nghiệp</h2>
              <p className="font-mono text-[11px] text-muted">
                {yard.name} · {yard.docks.length} {hour ? "Berths" : "Doors"} · {yard.trucks.length} {hour ? "Vessels" : "Trucks"} · SLA ${slaRateUsd}/{hour ? "h" : "m"} · k={maxMovesAllowed}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(
              [
                { id: "facility", label: "1. Mô Hình Bãi / Cảng" },
                { id: "rules", label: "2. Luật Solver & Kết Nối TOS" },
                { id: "inject", label: "3. + Thêm Lệnh Tàu/Xe" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSection(tab.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  section === tab.id ? "bg-accent text-accent-fg shadow-xs" : "bg-raised text-muted hover:text-fg",
                )}
              >
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-2 flex size-8 items-center justify-center rounded-lg text-muted hover:bg-raised hover:text-fg"
              aria-label="Close setup"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {section === "facility" ? (
            <div className="space-y-5">
              {/* 5 Instant Presets */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">Chọn Nhanh Mẫu Vận Hành (1-Click Live Switch)</span>
                  <span className="font-mono text-[11px] text-accent">Tự động nạp cầu/cửa & giải lịch tức thì</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  {PRESETS.map((p) => {
                    const Icon = p.icon;
                    const active = yard.name.toLowerCase().includes(p.title.split(" ")[0]!.toLowerCase());
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          useBoardStore.getState().applyFacilityPreset(p.id);
                          const next = useBoardStore.getState().yard;
                          setNameInput(next.name);
                          setGateInput(next.gate);
                          setJobDock(next.docks[0]?.id ?? "D1");
                        }}
                        className={cn(
                          "flex flex-col items-start rounded-xl p-3 text-left ring-1 transition",
                          active ? "bg-accent/10 ring-2 ring-accent" : "bg-raised/50 ring-line hover:bg-raised",
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <Icon className={cn("size-4", active ? "text-accent" : "text-muted")} />
                          <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted ring-1 ring-line">
                            {p.sla}
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-semibold text-fg">{p.title}</p>
                        <p className="mt-0.5 text-[11px] text-muted">{p.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Facility Identity */}
              <div className="grid gap-3 rounded-xl bg-raised/40 p-3.5 ring-1 ring-line sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted">Tên Cảng / Kho / ICD</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="mt-1 h-8 w-full rounded-lg bg-surface px-2.5 text-xs font-medium text-fg ring-1 ring-line focus:ring-2 focus:ring-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted">Cổng / Khu vực Cầu Bến</label>
                  <input
                    type="text"
                    value={gateInput}
                    onChange={(e) => setGateInput(e.target.value)}
                    className="mt-1 h-8 w-full rounded-lg bg-surface px-2.5 text-xs font-medium text-fg ring-1 ring-line focus:ring-2 focus:ring-accent focus:outline-none"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs"
                    onClick={() => useBoardStore.getState().updateYardMeta(nameInput, gateInput)}
                  >
                    <Check className="size-3.5" />
                    Lưu Tên Bãi
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs"
                    onClick={() => useBoardStore.getState().addCustomDock()}
                  >
                    <Plus className="size-3.5" />
                    Thêm {hour ? "Cầu" : "Cửa"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs"
                    onClick={() => useBoardStore.getState().removeLastDock()}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Interactive Door / Berth Grid */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Ma Trận {yard.docks.length} {hour ? "Cầu Bến (Berths)" : "Cửa Kho (Doors)"} — Bấm Để Đóng/Mở Hoặc Bật Ổ Cắm Lạnh Reefer
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    Open: {yard.docks.filter((d) => d.mode !== "closed").length} · Reefer: {yard.docks.filter((d) => d.cargo.includes("reefer")).length}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
                  {yard.docks.map((d) => {
                    const closed = d.mode === "closed";
                    const reefer = d.cargo.includes("reefer");
                    return (
                      <div
                        key={d.id}
                        className={cn(
                          "flex flex-col justify-between rounded-xl p-2.5 ring-1 transition",
                          closed ? "bg-bad/5 ring-bad/25" : "bg-surface ring-line",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-fg">{d.short}</span>
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                              closed ? "bg-bad/15 text-bad" : "bg-ok/15 text-ok",
                            )}
                          >
                            {closed ? "Closed" : "Open"}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => useBoardStore.getState().toggleDockOpen(d.id)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-raised py-1 text-[10px] font-medium text-fg hover:bg-accent/10 hover:text-accent"
                            title="Toggle Open/Closed"
                          >
                            {closed ? <Unlock className="size-3" /> : <Lock className="size-3" />}
                            {closed ? "Mở" : "Đóng"}
                          </button>
                          <button
                            type="button"
                            onClick={() => useBoardStore.getState().toggleDockReefer(d.id)}
                            className={cn(
                              "flex items-center justify-center rounded-lg px-2 py-1 text-[10px] font-medium",
                              reefer ? "bg-accent/15 text-accent" : "bg-raised text-faint hover:text-fg",
                            )}
                            title="Toggle Reefer Plug"
                          >
                            <Snowflake className="size-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {section === "rules" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4 rounded-xl bg-raised/40 p-4 ring-1 ring-line">
                <div>
                  <label className="block text-xs font-semibold text-fg">Mức Bảo Toàn Lịch Gốc (Max Displaced Moves k)</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {([0, 1, 2] as const).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => useBoardStore.getState().setMaxMovesAllowed(k)}
                        className={cn(
                          "rounded-xl p-2.5 text-left ring-1 transition",
                          maxMovesAllowed === k ? "bg-accent text-accent-fg ring-accent" : "bg-surface text-fg ring-line hover:bg-raised",
                        )}
                      >
                        <p className="font-mono text-sm font-bold">k = {k}</p>
                        <p className={cn("mt-0.5 text-[10px]", maxMovesAllowed === k ? "text-accent-fg/80" : "text-muted")}>
                          {k === 0 ? "0 lệnh khác bị dời" : `Tối đa ${k} lệnh dời`}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-fg">Đơn Giá Phạt Chờ / Demurrage SLA</span>
                    <span className="font-mono font-bold text-ok">${slaRateUsd.toLocaleString("en-US")} / {hour ? "hour" : "min"}</span>
                  </div>
                  <input
                    type="range"
                    min={hour ? 200 : 5}
                    max={hour ? 5000 : 100}
                    step={hour ? 100 : 1}
                    value={slaRateUsd}
                    onChange={(e) => useBoardStore.getState().setSlaRateUsd(Number(e.target.value))}
                    className="mt-2 w-full accent-accent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-fg">Ngưỡng Đóng Băng Lịch (Freeze Horizon)</span>
                    <span className="font-mono font-bold text-accent">{freezeWindowMin} {hour ? "h" : "min"}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={hour ? 24 : 120}
                    step={hour ? 1 : 5}
                    value={freezeWindowMin}
                    onChange={(e) => useBoardStore.getState().setFreezeWindowMin(Number(e.target.value))}
                    className="mt-2 w-full accent-accent"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-xl bg-raised/40 p-4 ring-1 ring-line">
                <label className="block text-xs font-semibold text-fg">Cấu Hình Adapter Kết Nối Hệ Thống Chủ (Non-Destructive Sidecar)</label>
                <div className="space-y-1.5">
                  {ADAPTERS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => useBoardStore.getState().setHostAdapter(a)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium ring-1 transition",
                        hostAdapter === a ? "bg-accent/10 text-accent ring-accent" : "bg-surface text-fg ring-line hover:bg-raised",
                      )}
                    >
                      <span>{a}</span>
                      {hostAdapter === a ? <ShieldCheck className="size-4 text-accent" /> : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {section === "inject" ? (
            <div className="rounded-xl bg-raised/40 p-4 ring-1 ring-line">
              <div className="grid gap-3 sm:grid-cols-4">
                <div>
                  <label className="block text-[11px] font-medium text-muted">Mã Tàu / Biển Số Xe</label>
                  <input
                    type="text"
                    value={jobPlate}
                    onChange={(e) => setJobPlate(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg bg-surface px-2.5 font-mono text-xs text-fg ring-1 ring-line"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted">Hãng Tàu / Nhà Xe</label>
                  <input
                    type="text"
                    value={jobHauler}
                    onChange={(e) => setJobHauler(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg bg-surface px-2.5 text-xs text-fg ring-1 ring-line"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted">{hour ? "Cầu Đặt Gốc (Berth)" : "Cửa Đặt Gốc (Door)"}</label>
                  <select
                    value={jobDock}
                    onChange={(e) => setJobDock(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg bg-surface px-2.5 font-mono text-xs text-fg ring-1 ring-line"
                  >
                    {yard.docks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.short} ({d.mode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted">Loại Hàng & Ưu Tiên</label>
                  <div className="mt-1 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setJobCargo(jobCargo === "reefer" ? "dry" : "reefer")}
                      className={cn(
                        "flex h-9 flex-1 items-center justify-center gap-1 rounded-lg text-xs font-medium ring-1",
                        jobCargo === "reefer" ? "bg-accent/15 text-accent ring-accent/40" : "bg-surface text-fg ring-line",
                      )}
                    >
                      <Snowflake className="size-3.5" />
                      {jobCargo === "reefer" ? "Reefer" : "Dry"}
                    </button>
                    {([1, 2, 3] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setJobPrio(p)}
                        className={cn(
                          "h-9 rounded-lg px-2.5 font-mono text-xs font-semibold ring-1",
                          jobPrio === p ? "bg-accent text-accent-fg ring-accent" : "bg-surface text-muted ring-line",
                        )}
                      >
                        P{p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted">Giờ Đặt Gốc ({hour ? "h" : "min"})</label>
                  <input
                    type="number"
                    value={jobStart}
                    onChange={(e) => setJobStart(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg bg-surface px-2.5 font-mono text-xs text-fg ring-1 ring-line"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted">Độ Trễ ETA (+{hour ? "h" : "min"})</label>
                  <input
                    type="number"
                    value={jobDelay}
                    onChange={(e) => setJobDelay(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg bg-surface px-2.5 font-mono text-xs text-fg ring-1 ring-line"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted">Thời Lượng Làm Hàng ({hour ? "h" : "min"})</label>
                  <input
                    type="number"
                    value={jobDur}
                    onChange={(e) => setJobDur(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg bg-surface px-2.5 font-mono text-xs text-fg ring-1 ring-line"
                  />
                </div>
                {hour ? (
                  <div>
                    <label className="block text-[11px] font-medium text-muted">Số Cầu Chiếm (Span)</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={jobSpan}
                      onChange={(e) => setJobSpan(Number(e.target.value))}
                      className="mt-1 h-9 w-full rounded-lg bg-surface px-2.5 font-mono text-xs text-fg ring-1 ring-line"
                    />
                  </div>
                ) : null}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={() =>
                    useBoardStore.getState().injectCustomJob({
                      plate: jobPlate,
                      hauler: jobHauler,
                      dockId: jobDock,
                      startMin: jobStart,
                      delayMin: jobDelay,
                      durationMin: jobDur,
                      cargo: jobCargo,
                      priority: jobPrio,
                      span: jobSpan,
                    })
                  }
                >
                  <Sparkles className="size-4" />
                  Đưa Vào Bảng Gantt & Giải Tối Ưu Ngay
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line bg-raised/40 px-5 py-3">
          <div className="flex items-center gap-3 font-mono text-xs text-muted">
            <span>Host: {hostAdapter}</span>
            <span>·</span>
            <span>Policy: k={maxMovesAllowed}</span>
            <span>·</span>
            <span>SLA: ${slaRateUsd}/{hour ? "h" : "m"}</span>
          </div>
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            Hoàn Tất & Quay Lại Bảng Điều Độ
          </Button>
        </div>
      </div>
    </div>
  );
}
