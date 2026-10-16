import { useState } from "react";
import {
  Anchor,
  Box,
  Building2,
  Check,
  Compass,
  Copy,
  Cpu,
  Edit3,
  Flame,
  Grid,
  Layers,
  Lightbulb,
  MapPin,
  Maximize2,
  MousePointer,
  Move,
  Plane,
  Play,
  Plus,
  RotateCcw,
  Save,
  Scale,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Snowflake,
  Sparkles,
  TrainTrack,
  Trash2,
  Trees,
  Truck,
  Warehouse,
  X,
  Zap,
} from "lucide-react";
import { type FacilityPresetId, useBoardStore } from "@/lib/minmove/store";
import { cn } from "@/lib/utils";

const QUICK_TEMPLATES: {
  id: FacilityPresetId;
  title: string;
  badge?: string;
  image: string;
}[] = [
  {
    id: "bcn-hour",
    title: "Cảng container",
    badge: "Phổ biến nhất",
    image: "/assets/logistics/vehicle-ship.png",
  },
  {
    id: "icd-minute",
    title: "ICD / Dry Port",
    image: "/assets/logistics/vehicle-barge.png",
  },
  {
    id: "crossdock-fmcg",
    title: "Kho bãi tổng hợp",
    image: "/assets/logistics/vehicle-agv-stacker.png",
  },
  {
    id: "reefer-cold",
    title: "Kho lạnh (-25°C)",
    image: "/assets/logistics/vehicle-reefer-truck.png",
  },
  {
    id: "barge-hub",
    title: "Ga đường sắt",
    image: "/assets/logistics/vehicle-train.png",
  },
  {
    id: "icd-minute",
    title: "Hỗn hợp (Đa phương thức)",
    image: "/assets/logistics/vehicle-aircraft.png",
  },
];

export function LogisticsSetupModal() {
  const setupOpen = useBoardStore((s) => s.setupOpen);
  const yard = useBoardStore((s) => s.yard);

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [catFilter, setCatFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"2D" | "3D" | "pano">("3D");
  const [selectedZone, setSelectedZone] = useState<string>("Bãi container B01");
  const [teuCap, setTeuCap] = useState<number>(2400);
  const [rowCap, setRowCap] = useState<number>(12);
  const [boxType, setBoxType] = useState<"20ft" | "40ft" | "45ft" | "special">("20ft");
  const [ruleStack, setRuleStack] = useState(true);
  const [ruleLane, setRuleLane] = useState(true);
  const [ruleDist, setRuleDist] = useState(true);
  const [activeTplIdx, setActiveTplIdx] = useState<number>(0);

  if (!setupOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hozerion Sidecar Self-Setup Studio"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-2 backdrop-blur-xs sm:p-3"
    >
      <div className="flex max-h-[96vh] w-full max-w-[1480px] flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl ring-1 ring-line">
        {/* Top Studio Header + 5-Step Wizard matching 04-self-setup-3d-facility-studio.png */}
        <div className="border-b border-line bg-surface px-4 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-accent text-white shadow-xs">
                <SlidersHorizontal className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold tracking-tight text-fg">
                    Hozerion Sidecar
                  </span>
                  <span className="rounded-full bg-ok/12 px-2 py-0.5 text-[10px] font-bold text-ok">
                    ● Mô phỏng trực tiếp
                  </span>
                </div>
                <p className="text-[11px] text-muted">
                  Self-Setup Studio · {yard.name} · Thiết kế mặt bằng 3D & 8 hệ phương tiện
                </p>
              </div>
            </div>

            {/* 5-Step Wizard Chevron Bar */}
            <div className="hidden items-center gap-1.5 xl:flex">
              {[
                { id: 1 as const, num: "01", title: "Bố trí mặt bằng", sub: "Chọn & kéo thả module" },
                { id: 2 as const, num: "02", title: "Quy tắc & tham số", sub: "Cấu hình hoạt động" },
                { id: 3 as const, num: "03", title: "Kết nối hệ thống", sub: "Tích hợp thiết bị/IoT" },
                { id: 4 as const, num: "04", title: "Kiểm tra & mô phỏng", sub: "Xem trước hiệu suất" },
                { id: 5 as const, num: "05", title: "Áp dụng", sub: "Triển khai cấu hình" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-1.5 text-left transition",
                    step === s.id
                      ? "bg-accent/10 text-accent ring-1 ring-accent"
                      : "bg-raised/60 text-muted ring-1 ring-line hover:text-fg",
                  )}
                >
                  <span className="font-mono text-xs font-extrabold">{s.num}</span>
                  <div className="leading-tight">
                    <div className="text-[11px] font-bold text-fg">{s.title}</div>
                    <div className="text-[9px] text-muted">{s.sub}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => useBoardStore.getState().addCustomDock()}
                className="inline-flex h-8 items-center gap-1 rounded-xl bg-raised px-2.5 text-xs font-semibold text-fg ring-1 ring-line hover:bg-raised/80"
              >
                <Layers className="size-3.5 text-accent" />+ Nạp mẫu / Cửa
              </button>
              <button
                type="button"
                onClick={() => useBoardStore.getState().findPlan()}
                className="inline-flex h-8 items-center gap-1 rounded-xl bg-raised px-2.5 text-xs font-semibold text-fg ring-1 ring-line hover:bg-raised/80"
              >
                <Save className="size-3.5 text-accent" />
                Lưu cấu hình
              </button>
              <button
                type="button"
                onClick={() => {
                  useBoardStore.getState().findPlan();
                  useBoardStore.getState().setSetupOpen(false);
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-accent px-3.5 text-xs font-bold text-white shadow-xs hover:bg-accent/90"
              >
                <MapPin className="size-3.5" />
                Xem thử & áp dụng
              </button>
              <button
                type="button"
                aria-label="Đóng cửa sổ cấu hình"
                onClick={() => useBoardStore.getState().setSetupOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-xl text-muted ring-1 ring-line hover:bg-raised hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main 3-Column Studio Body matching 04-self-setup-3d-facility-studio.png */}
        <div className="grid flex-1 grid-cols-1 divide-y divide-line overflow-y-auto lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          {/* Left Column (3 cols): Thư viện module */}
          <div className="flex flex-col justify-between p-3.5 lg:col-span-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-fg">Thư viện module</h3>
                <Edit3 className="size-3.5 text-muted" />
              </div>

              <div className="flex h-8 items-center gap-2 rounded-xl bg-raised/60 px-2.5 ring-1 ring-line">
                <Search className="size-3.5 text-muted" />
                <input
                  placeholder="Tìm module, phương tiện..."
                  className="w-full bg-transparent text-xs outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "sea", label: "Cảng biển" },
                  { id: "wh", label: "Kho bãi" },
                  { id: "icd", label: "ICD" },
                  { id: "cold", label: "Kho lạnh" },
                  { id: "rail", label: "Đường sắt" },
                  { id: "air", label: "Hàng không" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCatFilter(c.id)}
                    className={cn(
                      "rounded-lg px-2 py-1 text-[10px] font-bold transition",
                      catFilter === c.id
                        ? "bg-accent text-white"
                        : "bg-raised text-muted ring-1 ring-line hover:text-fg",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Group 1: Khu vực & hạ tầng */}
              <div>
                <p className="mb-1.5 text-[11px] font-bold text-fg">⌄ Khu vực & hạ tầng</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "Cầu bến", icon: Anchor },
                    { label: "Bãi container", icon: Box },
                    { label: "Nhà kho", icon: Warehouse },
                    { label: "Kho lạnh", icon: Snowflake },
                    { label: "Bãi đường sắt", icon: TrainTrack },
                    { label: "Sân đỗ Cargo", icon: Plane },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setSelectedZone(item.label);
                          useBoardStore.getState().addCustomDock();
                        }}
                        className="flex flex-col items-center justify-center rounded-xl bg-raised/35 p-2 text-center ring-1 ring-line transition hover:bg-accent/10 hover:ring-accent"
                      >
                        <Icon className="size-4 text-accent" />
                        <span className="mt-1 text-[10px] font-semibold text-fg">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group 2: Thiết bị khai thác & 8 hệ phương tiện */}
              <div>
                <p className="mb-1.5 text-[11px] font-bold text-fg">
                  ⌄ Thiết bị & Phương tiện (8 hệ)
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "Cẩu bờ (STS)", icon: Anchor },
                    { label: "Cẩu RTG", icon: Grid },
                    { label: "Xe nâng (Reach)", icon: Box },
                    { label: "Đầu kéo / Reefer", icon: Truck },
                    { label: "AGV / AMR", icon: Cpu },
                    { label: "Tàu hỏa / Sà lan", icon: TrainTrack },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setSelectedZone(item.label)}
                        className="flex flex-col items-center justify-center rounded-xl bg-raised/35 p-2 text-center ring-1 ring-line transition hover:bg-accent/10 hover:ring-accent"
                      >
                        <Icon className="size-4 text-indigo-600" />
                        <span className="mt-1 text-[10px] font-semibold text-fg">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group 3: Dịch vụ & tiện ích */}
              <div>
                <p className="mb-1.5 text-[11px] font-bold text-fg">⌄ Dịch vụ & tiện ích</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "Trạm cân", icon: Scale },
                    { label: "Trạm điện", icon: Zap },
                    { label: "Tòa nhà", icon: Building2 },
                    { label: "PCCC", icon: Flame },
                    { label: "Chiếu sáng", icon: Lightbulb },
                    { label: "Cây xanh", icon: Trees },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setSelectedZone(item.label)}
                        className="flex flex-col items-center justify-center rounded-xl bg-raised/35 p-2 text-center ring-1 ring-line transition hover:bg-accent/10 hover:ring-accent"
                      >
                        <Icon className="size-4 text-muted" />
                        <span className="mt-1 text-[10px] font-semibold text-fg">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Center Column (6 cols): Photorealistic 3D Isometric Digital Twin Canvas + 6 Quick Templates */}
          <div className="flex flex-col justify-between bg-[#F3F6FB] p-3.5 lg:col-span-6">
            {/* Top 3D Viewport Toolbar */}
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex rounded-xl bg-white p-0.5 shadow-2xs ring-1 ring-line">
                {(["2D", "3D", "pano"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setViewMode(m)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-bold transition",
                      viewMode === m ? "bg-accent text-white" : "text-muted hover:text-fg",
                    )}
                  >
                    {m === "pano" ? "Toàn cảnh" : m}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-2xs ring-1 ring-line">
                <span className="inline-flex size-7 items-center justify-center rounded-lg bg-accent/12 text-accent">
                  <MousePointer className="size-3.5" />
                </span>
                <span className="inline-flex size-7 items-center justify-center rounded-lg text-muted">
                  <Move className="size-3.5" />
                </span>
                <span className="inline-flex size-7 items-center justify-center rounded-lg text-muted">
                  <Maximize2 className="size-3.5" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-accent/10 px-2 py-1 text-[11px] font-bold text-accent">
                  <Grid className="size-3" /> Bật lưới · 1m
                </span>
              </div>
            </div>

            {/* Photorealistic 3D Isometric Digital Twin Image */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line">
              <img
                src="/assets/logistics/digital-twin-3d-canvas.png"
                alt="3D Isometric Digital Twin Port & ICD Studio"
                className="h-[340px] w-full object-cover object-center sm:h-[370px]"
              />

              {/* Interactive Compass Rose & Floor Selector on Right */}
              <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-slate-200">
                  <Compass className="size-5 text-accent" />
                </div>
                <div className="rounded-xl bg-white/95 p-1 text-[10px] font-bold shadow-md ring-1 ring-slate-200">
                  <div className="px-2 py-0.5 text-muted">Tầng</div>
                  <div className="rounded-lg bg-accent px-2 py-0.5 text-white">Tất cả</div>
                  <div className="px-2 py-0.5 text-slate-700">Tầng 2</div>
                  <div className="px-2 py-0.5 text-slate-700">Tầng 1</div>
                </div>
              </div>

              {/* Interactive Door / Berth Quick Toggles Overlay at Bottom Left */}
              <div className="absolute bottom-2.5 left-2.5 flex flex-wrap items-center gap-1 rounded-xl bg-white/95 px-2.5 py-1.5 shadow-md ring-1 ring-slate-200 backdrop-blur-xs">
                <span className="mr-1 text-[10px] font-extrabold text-slate-700">
                  Cửa/Bến ({yard.docks.filter((d) => d.mode !== "closed").length}/{yard.docks.length}):
                </span>
                {yard.docks.slice(0, 6).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => useBoardStore.getState().toggleDockOpen(d.id)}
                    className={cn(
                      "rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold transition",
                      d.mode !== "closed"
                        ? "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30"
                        : "bg-slate-200 text-slate-500",
                    )}
                  >
                    {d.short}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom 6 Illustrated Quick Templates matching 04-self-setup-3d-facility-studio.png */}
            <div className="mt-2.5 rounded-2xl bg-white p-2.5 shadow-card ring-1 ring-line">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-extrabold text-fg">Mẫu bố trí nhanh</span>
                <span className="text-[10px] text-muted">
                  Bấm để nạp mặt bằng 3D & quy tắc SLA tương ứng
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {QUICK_TEMPLATES.map((tpl, idx) => {
                  const active = activeTplIdx === idx;
                  return (
                    <button
                      key={`${tpl.title}-${idx}`}
                      type="button"
                      onClick={() => {
                        setActiveTplIdx(idx);
                        useBoardStore.getState().applyFacilityPreset(tpl.id);
                      }}
                      className={cn(
                        "flex flex-col items-center overflow-hidden rounded-xl p-1.5 text-center transition",
                        active
                          ? "bg-accent/[0.08] ring-2 ring-accent"
                          : "bg-raised/40 ring-1 ring-line hover:bg-raised",
                      )}
                    >
                      <img
                        src={tpl.image}
                        alt={tpl.title}
                        className="h-10 w-full rounded-lg object-cover"
                      />
                      <span className="mt-1 line-clamp-1 text-[10px] font-bold text-fg">
                        {tpl.title}
                      </span>
                      {tpl.badge ? (
                        <span className="text-[9px] font-bold text-ok">● {tpl.badge}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Layer Visibility Toggles */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-1.5 text-[11px] ring-1 ring-line">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-bold text-muted">Hiển thị lớp:</span>
                {["Hạ tầng", "Thiết bị", "Container", "8 Phương tiện", "Nhân sự", "Vùng an toàn"].map(
                  (layer) => (
                    <span
                      key={layer}
                      className="inline-flex items-center gap-1 font-semibold text-fg"
                    >
                      <span className="size-2 rounded-full bg-ok" />
                      {layer}
                    </span>
                  ),
                )}
              </div>
              <span className="font-mono text-[10px] font-bold text-muted">100% · 3D Twin</span>
            </div>
          </div>

          {/* Right Column (3 cols): Bãi container B01 Inspector matching 04-self-setup-3d-facility-studio.png */}
          <div className="flex flex-col justify-between p-3.5 lg:col-span-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Box className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-fg">{selectedZone}</h3>
                    <p className="text-[10px] text-muted">Container Yard · Đa phương thức</p>
                  </div>
                </div>
                <span className="rounded-full bg-ok/12 px-2 py-0.5 text-[10px] font-bold text-ok">
                  ● Hoạt động
                </span>
              </div>

              {/* Dimensions & Coordinates Grid */}
              <div>
                <p className="text-[11px] font-bold text-fg">Kích thước & vị trí</p>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5 text-xs">
                  <div className="rounded-xl bg-raised/50 p-2 ring-1 ring-line">
                    <div className="text-[9px] text-muted">Dài (m)</div>
                    <div className="mt-0.5 font-mono font-bold text-fg">320</div>
                  </div>
                  <div className="rounded-xl bg-raised/50 p-2 ring-1 ring-line">
                    <div className="text-[9px] text-muted">Rộng (m)</div>
                    <div className="mt-0.5 font-mono font-bold text-fg">180</div>
                  </div>
                  <div className="rounded-xl bg-raised/50 p-2 ring-1 ring-line">
                    <div className="text-[9px] text-muted">Diện tích</div>
                    <div className="mt-0.5 font-mono font-bold text-fg">57,600 m²</div>
                  </div>
                  <div className="rounded-xl bg-raised/50 p-2 ring-1 ring-line">
                    <div className="text-[9px] text-muted">Vị trí X (m)</div>
                    <div className="mt-0.5 font-mono font-bold text-fg">120</div>
                  </div>
                  <div className="rounded-xl bg-raised/50 p-2 ring-1 ring-line">
                    <div className="text-[9px] text-muted">Vị trí Y (m)</div>
                    <div className="mt-0.5 font-mono font-bold text-fg">80</div>
                  </div>
                  <div className="rounded-xl bg-raised/50 p-2 ring-1 ring-line">
                    <div className="text-[9px] text-muted">Hướng</div>
                    <div className="mt-0.5 font-mono font-bold text-fg">0°</div>
                  </div>
                </div>
              </div>

              {/* Capacity Sliders */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-fg">Cấu hình khai thác</p>
                <div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted">Sức chứa thiết kế</span>
                    <span className="font-mono font-bold text-accent">
                      {teuCap.toLocaleString("en-US")} TEU (70%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={600}
                    max={5000}
                    step={100}
                    value={teuCap}
                    onChange={(e) => setTeuCap(Number(e.target.value))}
                    className="mt-1 w-full accent-accent"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted">Số hàng container</span>
                    <span className="font-mono font-bold text-accent">{rowCap}</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={24}
                    step={1}
                    value={rowCap}
                    onChange={(e) => setRowCap(Number(e.target.value))}
                    className="mt-1 w-full accent-accent"
                  />
                </div>

                <div className="flex items-center justify-between gap-1 pt-1">
                  <span className="text-[10px] text-muted">Loại:</span>
                  {(["20ft", "40ft", "45ft", "special"] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBoxType(b)}
                      className={cn(
                        "rounded-lg px-2 py-0.5 text-[10px] font-bold transition",
                        boxType === b
                          ? "bg-accent/12 text-accent ring-1 ring-accent"
                          : "bg-raised text-muted ring-1 ring-line",
                      )}
                    >
                      {b === "special" ? "Đặc biệt" : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Operating Rules Toggles */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-fg">Quy tắc vận hành</p>
                {[
                  {
                    label: "Cho phép xếp chồng (Tối đa 4 tầng)",
                    on: ruleStack,
                    toggle: () => setRuleStack((v) => !v),
                  },
                  {
                    label: "Tự động phân làn 8 phương tiện",
                    on: ruleLane,
                    toggle: () => setRuleLane((v) => !v),
                  },
                  {
                    label: "Không dời lịch chủ (k = 0)",
                    on: ruleDist,
                    toggle: () => {
                      const next = !ruleDist;
                      setRuleDist(next);
                      useBoardStore.getState().setMaxMovesAllowed(next ? 0 : 2);
                    },
                  },
                ].map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center justify-between rounded-xl bg-raised/40 px-2.5 py-1.5 ring-1 ring-line"
                  >
                    <span className="text-[11px] font-medium text-fg">{r.label}</span>
                    <button
                      type="button"
                      onClick={r.toggle}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition",
                        r.on ? "bg-accent" : "bg-line",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block size-3.5 rounded-full bg-white shadow-xs transition",
                          r.on ? "translate-x-4" : "translate-x-1",
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* AI Optimization Suggestion Box */}
              <div className="rounded-2xl bg-accent/[0.06] p-2.5 ring-1 ring-accent/25">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-accent">
                    <Sparkles className="size-3.5" /> Gợi ý tối ưu từ AI
                  </span>
                  <button
                    type="button"
                    onClick={() => useBoardStore.getState().findPlan()}
                    className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-bold text-accent shadow-2xs ring-1 ring-accent/20"
                  >
                    Áp dụng gợi ý
                  </button>
                </div>
                <ul className="mt-1.5 space-y-1 text-[10px] text-muted">
                  <li>• Nên bố trí thêm 2 cổng RTG để tăng 25% năng suất</li>
                  <li>• Khoảng cách đến cầu bến & ga đường sắt phù hợp (420m)</li>
                </ul>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="mt-3 space-y-2 border-t border-line pt-2.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => useBoardStore.getState().addCustomDock()}
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-raised text-xs font-bold text-fg ring-1 ring-line hover:bg-raised/80"
                >
                  <Copy className="size-3.5 text-accent" /> Nhân bản
                </button>
                <button
                  type="button"
                  onClick={() => useBoardStore.getState().removeLastDock()}
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-rose-500/10 text-xs font-bold text-rose-600 ring-1 ring-rose-500/25 hover:bg-rose-500/15"
                >
                  <Trash2 className="size-3.5" /> Xóa
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  useBoardStore.getState().findPlan();
                  useBoardStore.getState().setSetupOpen(false);
                }}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ok px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-ok/90"
              >
                <Play className="size-3.5 fill-current" />
                Sẵn sàng cho mô phỏng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
