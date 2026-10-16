import { useEffect, useState } from "react";
import {
  Anchor,
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  Lock,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Snowflake,
  Sparkles,
  TrainTrack,
  Trash2,
  Truck,
  Unlock,
  Warehouse,
  X,
} from "lucide-react";
import { useBoardStore, type FacilityPresetId } from "@/lib/minmove/store.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

const STUDIO_TEMPLATES: Array<{
  id: FacilityPresetId;
  title: string;
  badge: string;
  sub: string;
  spec: string;
  sla: string;
  icon: typeof Anchor;
  accent: string;
}> = [
  {
    id: "bcn-hour",
    title: "Cảng container",
    badge: "Sea · Road",
    sub: "Cầu bến · Bãi · Cổng",
    spec: "20 bến · STS Quay",
    sla: "$1,500/h",
    icon: Anchor,
    accent: "from-sky-500/15 to-indigo-500/5",
  },
  {
    id: "icd-minute",
    title: "ICD / Dry Port",
    badge: "Road · Rail",
    sub: "Cửa kho · Đường sắt · Bãi",
    spec: "06–16 cửa · Đang chọn",
    sla: "$18/m",
    icon: Warehouse,
    accent: "from-indigo-500/15 to-emerald-500/5",
  },
  {
    id: "crossdock-fmcg",
    title: "Kho & WMS",
    badge: "Warehouse",
    sub: "Cross-dock · Băng tải · Kệ",
    spec: "08 cửa · High-Velocity",
    sla: "$15/m",
    icon: Building2,
    accent: "from-amber-500/15 to-orange-500/5",
  },
  {
    id: "reefer-cold",
    title: "Kho lạnh",
    badge: "Cold Chain",
    sub: "-25°C · Reefer · Kiểm nhiệt",
    spec: "06 cửa lạnh · Reefer SLA",
    sla: "$28/m",
    icon: Snowflake,
    accent: "from-cyan-500/15 to-blue-500/5",
  },
];

const ADAPTERS = [
  "Navis N4 / RBS TOPOVN",
  "SGP-TOS (VTOS / GTOS / VSL)",
  "Blue Yonder WMS / Cold-Chain ERP",
  "SAP EWM / FourKites Dynamic Yard",
  "Custom REST Webhook (RFC 7396 JSON)",
];

export function SelfSetupStudioView({
  onClose,
}: {
  onClose?: () => void;
}) {
  const yard = useBoardStore((s) => s.yard);
  const slaRateUsd = useBoardStore((s) => s.slaRateUsd);
  const maxMovesAllowed = useBoardStore((s) => s.maxMovesAllowed);
  const freezeWindowMin = useBoardStore((s) => s.freezeWindowMin);
  const hostAdapter = useBoardStore((s) => s.hostAdapter);

  const [section, setSection] = useState<"facility" | "rules" | "inject">("facility");
  const [nameInput, setNameInput] = useState(yard.name);
  const [gateInput, setGateInput] = useState(yard.gate);

  const [ruleReeferPrio, setRuleReeferPrio] = useState(true);
  const [ruleAutoSuggest, setRuleAutoSuggest] = useState(true);
  const [ruleZeroMove, setRuleZeroMove] = useState(true);
  const [ruleOverloadAlert, setRuleOverloadAlert] = useState(true);
  const [railBays, setRailBays] = useState(6);

  const hour = yard.timeUnit === "hour";
  const [jobPlate, setJobPlate] = useState(hour ? "MV-908" : "51C-998.68");
  const [jobHauler, setJobHauler] = useState(hour ? "Maersk Feeder" : "Mekong Express");
  const [jobDock, setJobDock] = useState(yard.docks[0]?.id ?? "D1");
  const [jobStart, setJobStart] = useState(hour ? 12 : 120);
  const [jobDelay, setJobDelay] = useState(hour ? 2 : 45);
  const [jobDur, setJobDur] = useState(hour ? 14 : 75);
  const [jobCargo, setJobCargo] = useState<"dry" | "reefer">("reefer");
  const [jobPrio, setJobPrio] = useState<1 | 2 | 3>(1);
  const [jobSpan, setJobSpan] = useState(4);

  useEffect(() => {
    setNameInput(yard.name);
    setGateInput(yard.gate);
    setJobDock(yard.docks[0]?.id ?? "D1");
  }, [yard.name, yard.gate, yard.docks]);

  const openDoorsCount = yard.docks.filter((d) => d.mode !== "closed").length;
  const reeferDoorsCount = yard.docks.filter((d) => d.cargo.includes("reefer")).length;

  return (
    <div className="space-y-3.5">
      {/* Row 1: 4 Visual Facility Template Cards matching 04-self-setup-3d-facility-studio.png */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STUDIO_TEMPLATES.map((tpl) => {
          const Icon = tpl.icon;
          const isCurrent =
            (tpl.id === "bcn-hour" && hour) ||
            (tpl.id === "icd-minute" && !hour && yard.name.includes("Tan Thuan")) ||
            (tpl.id === "reefer-cold" && yard.name.includes("Mekong")) ||
            (tpl.id === "crossdock-fmcg" && yard.name.includes("Cross-Dock"));
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                useBoardStore.getState().applyFacilityPreset(tpl.id);
              }}
              className={cn(
                "flex items-center gap-3 rounded-2xl bg-gradient-to-br p-3.5 text-left shadow-card transition",
                tpl.accent,
                isCurrent
                  ? "bg-surface ring-2 ring-accent"
                  : "bg-surface ring-1 ring-line hover:ring-accent/50",
              )}
            >
              <div
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1",
                  isCurrent
                    ? "bg-accent text-white ring-accent"
                    : "bg-surface text-accent ring-line",
                )}
              >
                <Icon className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="truncate text-sm font-bold text-fg">{tpl.title}</span>
                  <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] font-semibold text-muted ring-1 ring-line">
                    {tpl.badge}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted">{tpl.sub}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-semibold text-accent">
                    {tpl.spec}
                  </span>
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-ok">
                      <CheckCircle2 className="size-3" /> Đang chọn
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-muted">{tpl.sla}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Row 2: Studio Sub-Toolbar matching 04-self-setup-3d-facility-studio.png */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-surface px-3.5 py-2 shadow-card ring-1 ring-line">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "facility", label: "01 / Bố trí mặt bằng" },
              { id: "rules", label: "02 / Quy tắc & TOS" },
              { id: "inject", label: "03 / Kết nối & Thêm lệnh" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSection(t.id)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
                section === t.id
                  ? "bg-accent text-white shadow-xs"
                  : "bg-raised/70 text-muted hover:text-fg",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-ok/10 px-2.5 py-1 text-xs font-semibold text-ok ring-1 ring-ok/25">
            <span className="size-2 rounded-full bg-ok" />
            Snap-to-grid
          </span>
          <button
            type="button"
            onClick={() => useBoardStore.getState().findPlan()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-raised px-2.5 py-1 text-xs font-semibold text-fg ring-1 ring-line hover:bg-surface"
          >
            <RotateCcw className="size-3.5 text-accent" />
            Xếp tự động
          </button>
          <button
            type="button"
            onClick={() => useBoardStore.getState().addCustomDock()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-accent/90"
          >
            <Plus className="size-3.5" />
            Thêm {hour ? "cầu bến" : "cửa"}
          </button>
        </div>
      </div>

      {/* Row 3: Main Split Studio (Center 3D Isometric Digital Twin + Right Live Preview) */}
      {section === "facility" ? (
        <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-[1fr_340px]">
          {/* Left: Isometric 3D Digital Twin Facility Canvas */}
          <div className="flex flex-col justify-between rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-fg">
                  Mặt bằng tương tác · {yard.name}
                </span>
                <span className="rounded-lg bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
                  3D DIGITAL TWIN
                </span>
              </div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">
                KÉO-THẢ CỬA · BÃI · ĐƯỜNG SẮT · CỔNG
              </span>
            </div>

            {/* Isometric 3D Terminal Blueprint SVG Canvas */}
            <div className="relative overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-slate-50 via-indigo-50/45 to-sky-50/60 p-3 dark:border-indigo-900/50 dark:from-slate-900 dark:via-indigo-950/35 dark:to-slate-900">
              <svg
                viewBox="0 0 820 300"
                className="h-60 w-full sm:h-68"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              >
                <defs>
                  <pattern id="isoGrid" width="32" height="18" patternUnits="userSpaceOnUse">
                    <path
                      d="M 16 0 L 32 9 L 16 18 L 0 9 Z"
                      fill="none"
                      stroke="#6366f1"
                      strokeOpacity="0.12"
                      strokeWidth="1"
                    />
                  </pattern>
                  <linearGradient id="warehouseRoof" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                </defs>

                {/* Isometric Grid Floor */}
                <rect x="0" y="0" width="820" height="300" fill="url(#isoGrid)" />

                {/* Top Rail Spur Track (Rail Bay) */}
                <line x1="40" y1="42" x2="770" y2="42" stroke="#64748b" strokeWidth="3" />
                <line x1="40" y1="49" x2="770" y2="49" stroke="#64748b" strokeWidth="3" />
                <line
                  x1="40"
                  y1="45.5"
                  x2="770"
                  y2="45.5"
                  stroke="#94a3b8"
                  strokeWidth="6"
                  strokeDasharray="3 8"
                />
                {/* Rail Cars */}
                {[90, 185, 280, 375].map((rx, i) => (
                  <g key={rx} transform={`translate(${rx}, 24)`}>
                    <rect
                      x="0"
                      y="0"
                      width="78"
                      height="18"
                      rx="3"
                      fill={i % 2 === 0 ? "#4f46e5" : "#0ea5e9"}
                    />
                    <text x="10" y="12" fill="#ffffff" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                      RAIL-0{i + 1}
                    </text>
                  </g>
                ))}

                {/* Left 3D Container Yard Block (Reefer & Dry Stacks) */}
                <g transform="translate(42, 76)">
                  <polygon
                    points="0,35 120,0 245,35 125,70"
                    fill="#e0e7ff"
                    stroke="#818cf8"
                    strokeWidth="1.5"
                  />
                  {/* Isometric 3D Containers */}
                  {[
                    { x: 52, y: 18, c: "#3b82f6", l: "REEFER" },
                    { x: 96, y: 8, c: "#10b981", l: "DRY" },
                    { x: 140, y: 18, c: "#f97316", l: "EXPORT" },
                    { x: 96, y: 28, c: "#4f46e5", l: "COLD" },
                  ].map((b, idx) => (
                    <g key={idx} transform={`translate(${b.x}, ${b.y})`}>
                      <rect x="0" y="0" width="44" height="18" rx="2.5" fill={b.c} />
                      <text x="6" y="12" fill="#ffffff" fontSize="7.5" fontWeight="700" fontFamily="monospace">
                        {b.l}
                      </text>
                    </g>
                  ))}
                  <text x="58" y="84" fill="#334155" fontSize="10" fontWeight="700">
                    Bãi Container &amp; Trạm Lạnh ({reeferDoorsCount} Reefer)
                  </text>
                </g>

                {/* Center/Right 3D Isometric Warehouse & Dock Apron */}
                <g transform="translate(270, 68)">
                  {/* Warehouse Main Building */}
                  <polygon
                    points="40,28 360,0 500,56 180,84"
                    fill="url(#warehouseRoof)"
                    stroke="#64748b"
                    strokeWidth="1.8"
                  />
                  <polygon
                    points="40,28 180,84 180,126 40,70"
                    fill="#cbd5e1"
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="180,84 500,56 500,98 180,126"
                    fill="#94a3b8"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                  <text x="175" y="48" fill="#1e293b" fontSize="12" fontWeight="800" fontFamily="sans-serif">
                    TRUNG TÂM ĐIỀU ĐỘ · {yard.name.toUpperCase()}
                  </text>
                  <text x="205" y="64" fill="#4f46e5" fontSize="9.5" fontWeight="700" fontFamily="monospace">
                    {openDoorsCount}/{yard.docks.length} CỬA ĐANG MỞ · SLA ${slaRateUsd}/{hour ? "h" : "m"}
                  </text>

                  {/* Dock Doors D9..D16 along the front apron */}
                  {yard.docks.slice(0, 8).map((d, i) => {
                    const dx = 190 + i * 38;
                    const dy = 92 - i * 3.2;
                    const isClosed = d.mode === "closed";
                    const isReefer = d.cargo.includes("reefer");
                    return (
                      <g key={d.id} transform={`translate(${dx}, ${dy})`}>
                        <rect
                          x="0"
                          y="0"
                          width="30"
                          height="24"
                          rx="4"
                          fill={isClosed ? "#fee2e2" : isReefer ? "#e0e7ff" : "#dcfce7"}
                          stroke={isClosed ? "#ef4444" : isReefer ? "#4f46e5" : "#10b981"}
                          strokeWidth="1.8"
                        />
                        <text
                          x="6"
                          y="15"
                          fill={isClosed ? "#b91c1c" : isReefer ? "#3730a3" : "#065f46"}
                          fontSize="9"
                          fontWeight="800"
                          fontFamily="monospace"
                        >
                          {d.short}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* Animated Dispatch Route Curve from Gate to Rescued Dock */}
                <path
                  d="M 88 238 Q 280 245, 440 210 T 685 182"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3.5"
                  strokeDasharray="8 5"
                />
                <circle cx="88" cy="238" r="7" fill="#10b981" />
                <text x="62" y="260" fill="#0f172a" fontSize="10" fontWeight="700">
                  Cổng vào ({yard.gate})
                </text>

                {/* Highlighted Truck on Dispatch Route */}
                <g transform="translate(385, 198)">
                  <rect x="0" y="0" width="118" height="28" rx="8" fill="#4f46e5" />
                  <text x="10" y="13" fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="monospace">
                    51C-882.13 → D6
                  </text>
                  <text x="10" y="23" fill="#bbf7d0" fontSize="8" fontWeight="700">
                    Tiết kiệm 40m · k = 0
                  </text>
                </g>
              </svg>

              {/* Interactive Quick-Click Dock Pills below 3D Map */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-indigo-200/60 pt-2.5 dark:border-indigo-900/50">
                <span className="mr-1 font-mono text-[10px] font-bold uppercase text-muted">
                  Bấm để Đóng/Mở hoặc bật Reefer:
                </span>
                {yard.docks.slice(0, 12).map((d) => {
                  const closed = d.mode === "closed";
                  const reefer = d.cargo.includes("reefer");
                  return (
                    <div
                      key={d.id}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-semibold ring-1 transition",
                        closed
                          ? "bg-bad/10 text-bad ring-bad/30"
                          : reefer
                            ? "bg-accent/12 text-accent ring-accent/30"
                            : "bg-surface text-fg ring-line",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => useBoardStore.getState().toggleDockOpen(d.id)}
                        className="inline-flex items-center gap-1 font-mono font-bold"
                        title="Đóng / Mở cửa"
                      >
                        {closed ? <Lock className="size-3" /> : <Unlock className="size-3 text-ok" />}
                        {d.short}
                      </button>
                      <button
                        type="button"
                        onClick={() => useBoardStore.getState().toggleDockReefer(d.id)}
                        className={cn(
                          "rounded p-0.5",
                          reefer ? "bg-accent text-white" : "text-muted hover:text-fg",
                        )}
                        title="Bật/Tắt ổ cắm lạnh Reefer"
                      >
                        <Snowflake className="size-2.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom 5 Resource Palette Cards matching 04-self-setup-3d-facility-studio.png */}
            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  THÊM TÀI NGUYÊN VÀO MẶT BẰNG
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    aria-label="Tên cơ sở"
                    className="h-7 w-40 rounded-lg bg-raised px-2 text-xs font-medium text-fg ring-1 ring-line"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 text-[11px]"
                    onClick={() => useBoardStore.getState().updateYardMeta(nameInput, gateInput)}
                  >
                    <Check className="size-3" /> Lưu tên
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {[
                  {
                    label: "Cửa thường",
                    sub: "+ Thêm vào sơ đồ",
                    icon: Warehouse,
                    onClick: () => useBoardStore.getState().addCustomDock(),
                  },
                  {
                    label: "Cửa reefer",
                    sub: "+ Thêm cửa lạnh",
                    icon: Snowflake,
                    onClick: () => {
                      useBoardStore.getState().addCustomDock();
                      const latest = useBoardStore.getState().yard.docks.at(-1);
                      if (latest && !latest.cargo.includes("reefer")) {
                        useBoardStore.getState().toggleDockReefer(latest.id);
                      }
                    },
                  },
                  {
                    label: "Rail bay",
                    sub: "+ Thêm đường sắt",
                    icon: TrainTrack,
                    onClick: () => setRailBays((n) => Math.min(12, n + 1)),
                  },
                  {
                    label: "Bãi container",
                    sub: "+ Mở rộng sức chứa",
                    icon: Boxes,
                    onClick: () => useBoardStore.getState().findPlan(),
                  },
                  {
                    label: "Xoá cửa cuối",
                    sub: "- Thu gọn sơ đồ",
                    icon: Trash2,
                    onClick: () => useBoardStore.getState().removeLastDock(),
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className="flex items-center gap-2.5 rounded-xl bg-raised/55 p-2.5 text-left ring-1 ring-line transition hover:bg-accent/10 hover:ring-accent/40"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface text-accent shadow-2xs ring-1 ring-line">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-fg">{item.label}</p>
                        <p className="truncate text-[10px] text-accent">{item.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Live Simulation & No-Code Rules Panel matching 04-self-setup-3d-facility-studio.png */}
          <div className="flex flex-col justify-between rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-fg">Xem trước tức thời</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-ok/12 px-2.5 py-0.5 font-mono text-xs font-bold text-ok">
                  <span className="size-1.5 rounded-full bg-ok" />
                  1ms
                </span>
              </div>

              {/* Mini 3D Preview Card */}
              <div className="mt-3 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-sky-50/50 to-surface p-3 ring-1 ring-line dark:from-slate-900 dark:to-surface">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-surface/90 p-2 ring-1 ring-line">
                    <div className="text-[10px] font-semibold text-muted">Công suất</div>
                    <div className="mt-0.5 font-mono text-base font-bold text-fg">85%</div>
                  </div>
                  <div className="rounded-xl bg-surface/90 p-2 ring-1 ring-line">
                    <div className="text-[10px] font-semibold text-muted">Chờ TB</div>
                    <div className="mt-0.5 font-mono text-base font-bold text-ok">
                      {hour ? "0h" : "22m"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-surface/90 p-2 ring-1 ring-line">
                    <div className="text-[10px] font-semibold text-muted">Bảo toàn</div>
                    <div className="mt-0.5 font-mono text-base font-bold text-accent">100%</div>
                  </div>
                </div>
              </div>

              {/* Capacity Sliders */}
              <div className="mt-3.5 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-fg">
                      Số {hour ? "cầu bến" : "cửa"} hoạt động
                    </span>
                    <span className="font-mono font-bold text-accent">{yard.docks.length}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-raised">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${Math.min(100, (yard.docks.length / 20) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-fg">Vị trí đường sắt (Rail bay)</span>
                    <span className="font-mono font-bold text-accent">{railBays}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={12}
                    value={railBays}
                    onChange={(e) => setRailBays(Number(e.target.value))}
                    className="mt-1 w-full accent-accent"
                  />
                </div>
              </div>

              {/* 4 No-Code Rule Toggle Switches matching 04-self-setup-3d-facility-studio.png */}
              <div className="mt-4 border-t border-line pt-3">
                <p className="text-xs font-bold text-fg">Quy tắc tự động</p>
                <div className="mt-2.5 space-y-2">
                  {[
                    {
                      label: "Ưu tiên container lạnh",
                      on: ruleReeferPrio,
                      toggle: () => setRuleReeferPrio((v) => !v),
                    },
                    {
                      label: "Tự gợi ý cửa trống",
                      on: ruleAutoSuggest,
                      toggle: () => setRuleAutoSuggest((v) => !v),
                    },
                    {
                      label: "Không dời lịch chủ (k = 0)",
                      on: ruleZeroMove,
                      toggle: () => {
                        const next = !ruleZeroMove;
                        setRuleZeroMove(next);
                        useBoardStore.getState().setMaxMovesAllowed(next ? 0 : 1);
                      },
                    },
                    {
                      label: "Cảnh báo tải vượt ngưỡng",
                      on: ruleOverloadAlert,
                      toggle: () => setRuleOverloadAlert((v) => !v),
                    },
                  ].map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={r.toggle}
                      className="flex w-full items-center justify-between rounded-xl bg-raised/50 px-3 py-2 text-left text-xs font-medium text-fg ring-1 ring-line transition hover:bg-raised"
                    >
                      <span>{r.label}</span>
                      <span
                        className={cn(
                          "inline-flex h-5 w-9 items-center rounded-full p-0.5 transition",
                          r.on ? "justify-end bg-accent" : "justify-start bg-muted/40",
                        )}
                      >
                        <span className="size-4 rounded-full bg-white shadow-2xs" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-line pt-3">
              <Button
                type="button"
                className="h-10 w-full rounded-xl bg-ok text-xs font-bold text-white shadow-xs hover:bg-ok/90"
                onClick={() => {
                  useBoardStore.getState().findPlan();
                  if (onClose) onClose();
                }}
              >
                <Play className="size-3.5 fill-current" />
                Chạy mô phỏng cấu hình
              </Button>
              {onClose ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 w-full rounded-xl text-xs"
                  onClick={onClose}
                >
                  Hoàn Tất &amp; Quay Lại Bảng Điều Độ
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {section === "rules" ? (
        <div className="grid gap-4 rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:grid-cols-2">
          <div className="space-y-4 rounded-xl bg-raised/40 p-4 ring-1 ring-line">
            <div>
              <label className="block text-xs font-semibold text-fg">
                Mức Bảo Toàn Lịch Gốc (Max Displaced Moves k)
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {([0, 1, 2] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => useBoardStore.getState().setMaxMovesAllowed(k)}
                    className={cn(
                      "rounded-xl p-2.5 text-left ring-1 transition",
                      maxMovesAllowed === k
                        ? "bg-accent text-accent-fg ring-accent"
                        : "bg-surface text-fg ring-line hover:bg-raised",
                    )}
                  >
                    <p className="font-mono text-sm font-bold">k = {k}</p>
                    <p
                      className={cn(
                        "mt-0.5 text-[10px]",
                        maxMovesAllowed === k ? "text-accent-fg/80" : "text-muted",
                      )}
                    >
                      {k === 0 ? "0 lệnh khác bị dời" : `Tối đa ${k} lệnh dời`}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-fg">Đơn Giá Phạt Chờ / Demurrage SLA</span>
                <span className="font-mono font-bold text-ok">
                  ${slaRateUsd.toLocaleString("en-US")} / {hour ? "hour" : "min"}
                </span>
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
                <span className="font-mono font-bold text-accent">
                  {freezeWindowMin} {hour ? "h" : "min"}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={hour ? 24 : 120}
                step={hour ? 1 : 5}
                value={freezeWindowMin}
                onChange={(e) =>
                  useBoardStore.getState().setFreezeWindowMin(Number(e.target.value))
                }
                className="mt-2 w-full accent-accent"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-xl bg-raised/40 p-4 ring-1 ring-line">
            <label className="block text-xs font-semibold text-fg">
              Cấu Hình Adapter Kết Nối Hệ Thống Chủ (Non-Destructive Sidecar)
            </label>
            <div className="space-y-1.5">
              {ADAPTERS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => useBoardStore.getState().setHostAdapter(a)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium ring-1 transition",
                    hostAdapter === a
                      ? "bg-accent/10 text-accent ring-accent"
                      : "bg-surface text-fg ring-line hover:bg-raised",
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
        <div className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-[11px] font-medium text-muted">
                Mã Tàu / Biển Số Xe
              </label>
              <input
                type="text"
                value={jobPlate}
                onChange={(e) => setJobPlate(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg bg-raised px-2.5 font-mono text-xs text-fg ring-1 ring-line"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted">
                Hãng Tàu / Nhà Xe
              </label>
              <input
                type="text"
                value={jobHauler}
                onChange={(e) => setJobHauler(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg bg-raised px-2.5 text-xs text-fg ring-1 ring-line"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted">
                {hour ? "Cầu Đặt Gốc (Berth)" : "Cửa Đặt Gốc (Door)"}
              </label>
              <select
                value={jobDock}
                onChange={(e) => setJobDock(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg bg-raised px-2.5 font-mono text-xs text-fg ring-1 ring-line"
              >
                {yard.docks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.short} ({d.mode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted">
                Loại Hàng &amp; Ưu Tiên
              </label>
              <div className="mt-1 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setJobCargo(jobCargo === "reefer" ? "dry" : "reefer")}
                  className={cn(
                    "flex h-9 flex-1 items-center justify-center gap-1 rounded-lg text-xs font-medium ring-1",
                    jobCargo === "reefer"
                      ? "bg-accent/15 text-accent ring-accent/40"
                      : "bg-raised text-fg ring-line",
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
                      jobPrio === p
                        ? "bg-accent text-accent-fg ring-accent"
                        : "bg-raised text-muted ring-line",
                    )}
                  >
                    P{p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted">
                Giờ Đặt Gốc ({hour ? "h" : "min"})
              </label>
              <input
                type="number"
                value={jobStart}
                onChange={(e) => setJobStart(Number(e.target.value))}
                className="mt-1 h-9 w-full rounded-lg bg-raised px-2.5 font-mono text-xs text-fg ring-1 ring-line"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted">
                Độ Trễ ETA (+{hour ? "h" : "min"})
              </label>
              <input
                type="number"
                value={jobDelay}
                onChange={(e) => setJobDelay(Number(e.target.value))}
                className="mt-1 h-9 w-full rounded-lg bg-raised px-2.5 font-mono text-xs text-fg ring-1 ring-line"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted">
                Thời Lượng Làm Hàng ({hour ? "h" : "min"})
              </label>
              <input
                type="number"
                value={jobDur}
                onChange={(e) => setJobDur(Number(e.target.value))}
                className="mt-1 h-9 w-full rounded-lg bg-raised px-2.5 font-mono text-xs text-fg ring-1 ring-line"
              />
            </div>
            {hour ? (
              <div>
                <label className="block text-[11px] font-medium text-muted">
                  Số Cầu Chiếm (Span)
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={jobSpan}
                  onChange={(e) => setJobSpan(Number(e.target.value))}
                  className="mt-1 h-9 w-full rounded-lg bg-raised px-2.5 font-mono text-xs text-fg ring-1 ring-line"
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
              Đưa Vào Bảng Gantt &amp; Giải Tối Ưu Ngay
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function LogisticsSetupModal() {
  const open = useBoardStore((s) => s.setupOpen);
  const setOpen = useBoardStore((s) => s.setSetupOpen);
  const yard = useBoardStore((s) => s.yard);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-xs sm:p-5">
      <div
        data-setup-modal=""
        className="flex max-h-[92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-bg shadow-float ring-1 ring-line"
      >
        {/* Top Modal Header matching 04-self-setup-3d-facility-studio.png */}
        <div className="flex items-center justify-between border-b border-line bg-surface px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-accent text-white shadow-xs">
              <SlidersHorizontal className="size-4" />
            </span>
            <div>
              <h2 className="text-base font-bold tracking-tight text-fg">
                Self-Setup Studio · Tự bố trí cơ sở &amp; Kéo-thả tài nguyên
              </h2>
              <p className="text-xs text-muted">
                {yard.name} · Xem trước tác động ngay lập tức · Không cần code
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-xl bg-accent px-3 text-xs font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Hoàn Tất &amp; Quay Lại Bảng Điều Độ
            </Button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-8 items-center justify-center rounded-xl text-muted ring-1 ring-line hover:bg-raised hover:text-fg"
              aria-label="Close setup"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <SelfSetupStudioView onClose={() => setOpen(false)} />
        </div>
      </div>
    </div>
  );
}
