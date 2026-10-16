import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Cpu,
  Lock,
  Navigation,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  HCMC_CORRIDOR_NODES,
  createHitlSignedAuditBlock,
  runOrganizationalAgentPipeline,
  type AuditLogBlock,
  type GuardrailCheck,
} from "@/lib/minmove/mlai-agents.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

const MAP_COORDS: Record<string, { x: number; y: number; shortName: string; sub: string }> = {
  ICD_TRUONG_THO: { x: 245, y: 68, shortName: "Trường Thọ", sub: "ICD · SGP-TOS" },
  PORT_TAN_THUAN: { x: 185, y: 182, shortName: "Tân Thuận ICD", sub: "SGP-TOS · VTOS" },
  PORT_SP_ITC: { x: 405, y: 112, shortName: "SP-ITC", sub: "VTOS · Quốc tế" },
  PORT_CAT_LAI: { x: 495, y: 194, shortName: "Cát Lái", sub: "TOPX · TOPOVN · ePort" },
  PORT_HIEP_PHUOC: { x: 295, y: 278, shortName: "Hiệp Phước", sub: "SGP-TOS · Soài Rạp" },
  HUB_CAI_MEP: { x: 645, y: 274, shortName: "Cái Mép", sub: "Cảng nước sâu" },
};

export function MlaiHackathonCommandCenter() {
  const yard = useBoardStore((s) => s.yard);
  const event = useBoardStore((s) => s.event);
  const result = useBoardStore((s) => s.result);
  const selectedId = useBoardStore((s) => s.selectedId);

  const [stressMode, setStressMode] = useState<
    "NORMAL" | "LOW_CONFIDENCE_STORM" | "TRANSSHIPMENT_CRITICAL"
  >("NORMAL");
  const [selectedPortId, setSelectedPortId] = useState<string>("PORT_CAT_LAI");
  const [divertedPorts, setDivertedPorts] = useState<Record<string, number>>({});
  const [selectedAgentIdx, setSelectedAgentIdx] = useState<number>(2);
  const [overriddenGuards, setOverriddenGuards] = useState<Record<string, boolean>>({});
  const [operatorName, setOperatorName] = useState("Nguyễn Minh Quân · Điều độ viên trưởng");
  const [customAuditChain, setCustomAuditChain] = useState<AuditLogBlock[]>([]);
  const [copiedAudit, setCopiedAudit] = useState(false);

  const hour = yard.timeUnit === "hour";
  const unit = hour ? "h" : "m";
  const truck = yard.trucks.find((t) => t.id === selectedId) ?? yard.trucks[0]!;
  const orig = yard.appointments.find((a) => a.truckId === truck.id);
  const live = result?.appointments.find((a) => a.truckId === truck.id) ?? orig;

  const portLoads = useMemo(() => {
    return HCMC_CORRIDOR_NODES.map((node) => {
      const delta = divertedPorts[node.id] ?? 0;
      const util = Math.max(25, Math.min(99, node.utilizationPct + delta));
      const wait = Math.max(0.1, Number((node.queueWaitHours + delta * 0.08).toFixed(1)));
      return { ...node, utilizationPct: util, queueWaitHours: wait };
    });
  }, [divertedPorts]);

  const activePort = portLoads.find((p) => p.id === selectedPortId) ?? portLoads[0]!;
  const corridorDensityPct = Math.round(
    portLoads.reduce((acc, n) => acc + n.utilizationPct, 0) / portLoads.length,
  );

  const pipeline = useMemo(
    () =>
      runOrganizationalAgentPipeline({
        yard,
        selectedId,
        event,
        result,
        stressMode,
      }),
    [yard, selectedId, event, result, stressMode],
  );

  const fullAuditChain = useMemo(
    () => [pipeline.initialAuditBlock, ...customAuditChain],
    [pipeline.initialAuditBlock, customAuditChain],
  );

  const activeStep = pipeline.agents[selectedAgentIdx] ?? pipeline.agents[0]!;
  const totalPipelineMs = Number(
    pipeline.agents.reduce((acc, a) => acc + a.latencyMs, 0).toFixed(2),
  );

  const handleDivert = () => {
    setDivertedPorts((prev) => ({
      ...prev,
      PORT_CAT_LAI: (prev.PORT_CAT_LAI ?? 0) - 18,
      ICD_TRUONG_THO: (prev.ICD_TRUONG_THO ?? 0) - 12,
      PORT_HIEP_PHUOC: (prev.PORT_HIEP_PHUOC ?? 0) + 14,
      PORT_SP_ITC: (prev.PORT_SP_ITC ?? 0) + 10,
    }));
  };

  const handleHitlAction = (
    decision: "HUMAN_APPROVED" | "HUMAN_OVERRIDDEN" | "HUMAN_REJECTED",
  ) => {
    const prevBlock = fullAuditChain[fullAuditChain.length - 1] ?? pipeline.initialAuditBlock;
    const note =
      decision === "HUMAN_REJECTED"
        ? `Rollback ${truck.id} -> ${orig?.dockId ?? "B0"}`
        : `${decision === "HUMAN_APPROVED" ? "Approved" : "Override"} ${truck.id}: ${orig?.dockId ?? "B0"} -> ${live?.dockId ?? "B5"}`;
    const nextBlock = createHitlSignedAuditBlock(prevBlock, decision, operatorName, note);
    setCustomAuditChain((prev) => [...prev, nextBlock]);
    if (decision === "HUMAN_APPROVED") {
      useBoardStore.getState().commit();
    }
  };

  return (
    <div data-mlai-command-center="" className="space-y-4">
      {/* Main Split Grid matching 05-ai-agents-hcmc-port-map.png */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        {/* LEFT COLUMN: Dark Geospatial HCMC Port Network Map + 5 Agent Stepper */}
        <div className="flex flex-col justify-between rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-fg">Mạng lưới cảng TP.HCM</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ok/12 px-2.5 py-0.5 font-mono text-xs font-semibold text-ok">
                <span className="size-1.5 rounded-full bg-ok" />
                Tải bình quân {corridorDensityPct}%
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: "NORMAL", label: "Tự động k = 0" },
                  { id: "LOW_CONFIDENCE_STORM", label: "Bão / Độ tin cậy thấp" },
                  { id: "TRANSSHIPMENT_CRITICAL", label: "Nguy cơ trễ chuyến" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setStressMode(m.id)}
                  className={cn(
                    "h-7 rounded-xl px-2.5 text-xs font-semibold ring-1 transition",
                    stressMode === m.id
                      ? "bg-accent text-white ring-accent shadow-xs"
                      : "bg-raised/70 text-muted ring-line hover:text-fg",
                  )}
                >
                  {m.label}
                </button>
              ))}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-7 rounded-xl text-xs"
                onClick={handleDivert}
              >
                <Sparkles className="size-3 text-accent" />
                Điều tiết luồng
              </Button>
            </div>
          </div>

          {/* Dark Geospatial Radar Map matching 05-ai-agents-hcmc-port-map.png */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1221] p-3 text-white shadow-inner">
            {/* Map Top Legend Overlay */}
            <div className="pointer-events-none relative z-10 flex flex-wrap items-center justify-between gap-2 text-[10px]">
              <span className="font-mono font-bold tracking-wider text-slate-400">
                TP. HỒ CHÍ MINH · HÀNH LANG HÀNG HẢI &amp; SÀ LAN VETC
              </span>
              <div className="flex items-center gap-3 font-medium">
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <span className="size-2 rounded-full bg-emerald-400" /> Ổn định (&lt;70%)
                </span>
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <span className="size-2 rounded-full bg-amber-400" /> Cao (70–85%)
                </span>
                <span className="inline-flex items-center gap-1 text-rose-400">
                  <span className="size-2 rounded-full bg-rose-400" /> Quá tải (&gt;85%)
                </span>
              </div>
            </div>

            <svg
              viewBox="0 0 780 340"
              className="mt-1 h-72 w-full sm:h-80"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="0.8"
                  />
                </pattern>
                <radialGradient id="catLaiGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </radialGradient>
              </defs>

              <rect x="0" y="0" width="780" height="340" fill="url(#radarGrid)" />

              {/* Regional Geographic Labels */}
              <text x="48" y="64" fill="#475569" fontSize="12" fontWeight="800" letterSpacing="2">
                TP. HỒ CHÍ MINH
              </text>
              <text x="305" y="34" fill="#334155" fontSize="10" fontWeight="700" letterSpacing="1.5">
                BÌNH DƯƠNG
              </text>
              <text x="615" y="75" fill="#334155" fontSize="10" fontWeight="700" letterSpacing="1.5">
                ĐỒNG NAI
              </text>
              <text x="58" y="295" fill="#334155" fontSize="10" fontWeight="700" letterSpacing="1.5">
                LONG AN
              </text>
              <text x="595" y="325" fill="#334155" fontSize="10" fontWeight="700" letterSpacing="1.5">
                BÀ RỊA · VŨNG TÀU
              </text>

              {/* Saigon & Dong Nai River Waterways */}
              <path
                d="M 190 10 C 235 80, 200 140, 240 195 C 280 250, 320 270, 360 335"
                fill="none"
                stroke="#0284c7"
                strokeOpacity="0.28"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 520 15 C 460 95, 440 155, 510 215 C 570 265, 620 285, 710 335"
                fill="none"
                stroke="#0284c7"
                strokeOpacity="0.28"
                strokeWidth="20"
                strokeLinecap="round"
              />

              {/* Glowing Corridor Flow Arcs */}
              {/* Cat Lai -> Hiep Phuoc Diversion Arc */}
              <path
                d="M 485 196 Q 405 262, 310 278"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.8"
                strokeDasharray="6 4"
              />
              <rect x="364" y="236" width="68" height="18" rx="6" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
              <text x="372" y="248" fill="#6ee7b7" fontSize="9" fontWeight="700" fontFamily="monospace">
                +42 TEU/h
              </text>

              {/* Truong Tho -> SP-ITC -> Cat Lai Arc */}
              <path
                d="M 255 78 Q 330 95, 385 132 T 485 196"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.2"
                strokeDasharray="5 4"
              />
              {/* Tan Thuan -> Hiep Phuoc Arc */}
              <path
                d="M 215 185 Q 250 238, 310 278"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.2"
                strokeDasharray="5 4"
              />
              <rect x="196" y="226" width="62" height="18" rx="6" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1" />
              <text x="204" y="238" fill="#7dd3fc" fontSize="9" fontWeight="700" fontFamily="monospace">
                +28 xe/h
              </text>

              {/* Cat Lai -> Cai Mep Deep Sea Barge Corridor */}
              <path
                d="M 485 196 Q 585 225, 645 274"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              <rect x="548" y="214" width="68" height="18" rx="6" fill="#451a03" stroke="#f59e0b" strokeWidth="1" />
              <text x="556" y="226" fill="#fcd34d" fontSize="9" fontWeight="700" fontFamily="monospace">
                +65 TEU/h
              </text>

              {/* Red Alert Halo on Cat Lai */}
              <circle cx="485" cy="196" r="56" fill="url(#catLaiGlow)" />

              {/* 6 Interactive Port Nodes */}
              {portLoads.map((node) => {
                const pos = MAP_COORDS[node.id] ?? {
                  x: 300,
                  y: 180,
                  shortName: node.name.slice(0, 12),
                  sub: node.tosSystem,
                };
                const active = node.id === selectedPortId;
                const high = node.utilizationPct >= 85;
                const med = node.utilizationPct >= 70 && node.utilizationPct < 85;
                const badgeColor = high ? "#f43f5e" : med ? "#f59e0b" : "#10b981";
                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x - 68}, ${pos.y - 28})`}
                    className="cursor-pointer"
                    onClick={() => setSelectedPortId(node.id)}
                  >
                    <rect
                      x="0"
                      y="0"
                      width="138"
                      height="58"
                      rx="12"
                      fill={active ? "#1e1b4b" : "#111827"}
                      fillOpacity="0.94"
                      stroke={active ? "#818cf8" : badgeColor}
                      strokeWidth={active ? "2.2" : "1.4"}
                    />
                    <circle cx="14" cy="16" r="4.5" fill={badgeColor} />
                    <text x="24" y="19" fill="#f8fafc" fontSize="10.5" fontWeight="800">
                      {pos.shortName}
                    </text>
                    <text
                      x="102"
                      y="19"
                      fill={badgeColor}
                      fontSize="11"
                      fontWeight="800"
                      fontFamily="monospace"
                    >
                      {node.utilizationPct}%
                    </text>
                    <text x="12" y="35" fill="#94a3b8" fontSize="9.5" fontFamily="monospace">
                      {node.queueWaitHours}h chờ · {node.vetcFlowPerHour}/h
                    </text>
                    <text x="12" y="48" fill="#64748b" fontSize="8.5" fontFamily="sans-serif">
                      {pos.sub}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Bottom Map Interactive Port Slider Bar */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900/90 px-3 py-2 ring-1 ring-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <Navigation className="size-3.5 text-indigo-400" />
                <span className="font-bold text-white">{activePort.name}</span>
                <span className="font-mono text-slate-400">
                  ({activePort.tosSystem} · Chờ {activePort.queueWaitHours}h)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-slate-400">Điều chỉnh tải:</span>
                <input
                  type="range"
                  min={-30}
                  max={20}
                  step={2}
                  value={divertedPorts[activePort.id] ?? 0}
                  onChange={(e) =>
                    setDivertedPorts((prev) => ({
                      ...prev,
                      [activePort.id]: Number(e.target.value),
                    }))
                  }
                  className="w-28 accent-indigo-500"
                  aria-label="Simulate port load delta"
                />
                <span className="w-10 text-right font-mono text-xs font-bold text-emerald-400">
                  {activePort.utilizationPct}%
                </span>
              </div>
            </div>
          </div>

          {/* Bottom 5-Agent Stepper matching 05-ai-agents-hcmc-port-map.png */}
          <div className="mt-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                <Cpu className="size-3.5 text-accent" />
                LUỒNG 5 AGENT · TỔNG THỜI GIAN {totalPipelineMs}ms
              </span>
              <span className="font-mono text-[11px] font-semibold text-accent">
                Đang chọn: #{selectedAgentIdx + 1} {activeStep.nameVi}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {pipeline.agents.map((s, idx) => {
                const active = idx === selectedAgentIdx;
                return (
                  <button
                    key={s.agentId}
                    type="button"
                    onClick={() => setSelectedAgentIdx(idx)}
                    className={cn(
                      "flex flex-col justify-between rounded-xl p-2.5 text-left ring-1 transition",
                      active
                        ? "bg-accent/10 ring-2 ring-accent"
                        : "bg-raised/45 ring-line hover:bg-raised",
                    )}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="rounded bg-accent/15 px-1.5 py-0.5 font-bold text-accent">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-ok">
                        {s.confidencePct}% · {s.latencyMs}ms
                      </span>
                    </div>
                    <p className="mt-1.5 truncate text-xs font-bold text-fg">{s.nameVi}</p>
                    <p className="mt-0.5 truncate text-[10px] text-muted">{s.outputSummary}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Conformal Bell Curve + 5 Guardrails + HITL Approval Drawer */}
        <div className="flex flex-col justify-between gap-4">
          {/* Card 1: Conformal Probability Bell Curve + 5 Guardrails */}
          <div className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-fg">Dự báo ETA &amp; 5 rào chắn</h3>
              <span className="rounded-full bg-ok/12 px-2.5 py-0.5 font-mono text-xs font-bold text-ok">
                {pipeline.guardrails.filter((g) => g.passed || overriddenGuards[g.id]).length}/5 ĐẠT
              </span>
            </div>

            {/* Smooth SVG Conformal Gaussian Bell Curve matching 05-ai-agents-hcmc-port-map.png */}
            <div className="mt-3 rounded-2xl bg-raised/45 p-3 ring-1 ring-line">
              <svg viewBox="0 0 300 92" className="h-24 w-full overflow-visible" aria-hidden="true">
                <defs>
                  <linearGradient id="conformalBellGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {/* Baseline */}
                <line x1="12" y1="72" x2="288" y2="72" stroke="#cbd5e1" strokeWidth="1.2" />
                {/* Bell Curve Area */}
                <path
                  d="M 16 72 C 55 72, 78 62, 102 36 C 122 14, 146 10, 168 28 C 194 50, 224 68, 284 72 Z"
                  fill="url(#conformalBellGrad)"
                />
                {/* Bell Curve Stroke */}
                <path
                  d="M 16 72 C 55 72, 78 62, 102 36 C 122 14, 146 10, 168 28 C 194 50, 224 68, 284 72"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Q10 Marker */}
                <line x1="88" y1="24" x2="88" y2="72" stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />
                <text x="64" y="86" fill="#64748b" fontSize="9.5" fontWeight="700" fontFamily="monospace">
                  Q10 {pipeline.conformal.q10Optimistic}{unit}
                </text>
                {/* Q50 Median Peak Marker */}
                <line x1="138" y1="12" x2="138" y2="72" stroke="#4f46e5" strokeWidth="1.8" strokeDasharray="3 3" />
                <circle cx="138" cy="14" r="4" fill="#4f46e5" />
                <text x="115" y="86" fill="#4f46e5" fontSize="9.5" fontWeight="800" fontFamily="monospace">
                  Q50 {pipeline.conformal.q50Median}{unit}
                </text>
                {/* Q90 Conservative Marker */}
                <line x1="205" y1="32" x2="205" y2="72" stroke="#10b981" strokeWidth="1.8" strokeDasharray="3 3" />
                <circle cx="205" cy="48" r="3.5" fill="#10b981" />
                <text x="182" y="86" fill="#10b981" fontSize="9.5" fontWeight="800" fontFamily="monospace">
                  Q90 {pipeline.conformal.q90Conservative}{unit}
                </text>
                <text x="242" y="20" fill="#64748b" fontSize="9" fontWeight="700" fontFamily="monospace">
                  σ = {pipeline.conformal.epistemicSigma}
                </text>
              </svg>
            </div>

            {/* 5 Interactive Guardrail Pills */}
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {pipeline.guardrails.map((g: GuardrailCheck) => {
                const effectivePass = g.passed
                  ? !overriddenGuards[g.id]
                  : Boolean(overriddenGuards[g.id]);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() =>
                      setOverriddenGuards((prev) => ({ ...prev, [g.id]: !prev[g.id] }))
                    }
                    title={`${g.titleEn}: ${g.metricLabel}`}
                    className={cn(
                      "flex flex-col items-center rounded-xl p-2 text-center ring-1 transition",
                      effectivePass
                        ? "bg-ok/10 text-ok ring-ok/30 hover:bg-ok/15"
                        : "bg-warn/15 text-warn ring-warn/40 hover:bg-warn/20",
                    )}
                  >
                    {effectivePass ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <AlertTriangle className="size-4" />
                    )}
                    <span className="mt-1 font-mono text-[10px] font-bold text-fg">
                      {g.id === "G1_ZERO_DISPLACEMENT"
                        ? "G1 k=0"
                        : g.id === "G2_CONFORMAL_ROBUSTNESS"
                          ? "G2 Q90"
                          : g.id === "G3_ECONOMIC_THRESHOLD"
                            ? "G3 ROI"
                            : g.id === "G4_TRANSSHIPMENT_SLA"
                              ? "G4 SLA"
                              : "G5 Conf"}
                    </span>
                    <span className="mt-0.5 w-full truncate font-mono text-[9px] text-muted">
                      {g.metricLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Human-in-the-Loop Sign-Off Drawer matching 05-ai-agents-hcmc-port-map.png */}
          <div className="flex flex-1 flex-col justify-between rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-fg">Human-in-the-loop</h3>
                <span className="rounded-full bg-ok/12 px-2.5 py-0.5 font-mono text-xs font-bold text-ok">
                  +${pipeline.netEconomicBenefitUsd.toLocaleString("en-US")}
                </span>
              </div>

              {/* Operator Avatar Card */}
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-raised/50 p-2.5 ring-1 ring-line">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-bold text-white">
                    NM
                  </span>
                  <div className="min-w-0">
                    <input
                      type="text"
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      aria-label="Operator Sign-off Name"
                      className="w-full truncate bg-transparent text-xs font-bold text-fg outline-none"
                    />
                    <p className="text-[10px] text-muted">Điều độ viên trưởng · Ca sáng</p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ok/12 px-2 py-0.5 text-[10px] font-semibold text-ok">
                  <span className="size-1.5 rounded-full bg-ok" />
                  Đã xác thực
                </span>
              </div>

              {/* 98% Circular Ring Gauge + Impact Summary */}
              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-accent/[0.05] p-3 ring-1 ring-accent/20">
                <div className="relative flex size-14 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 36 36" className="size-14 -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="currentColor"
                      className="text-line"
                      strokeWidth="3.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeDasharray="92 100"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute font-mono text-xs font-bold text-fg">98%</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                    ĐỀ XUẤT ĐIỀU PHỐI LIÊN CẢNG
                  </span>
                  <p className="mt-0.5 text-sm font-bold text-fg">
                    -23 phút · 6/6 cảng đồng bộ
                  </p>
                  <p className="text-[11px] text-muted">
                    Giảm 18% tải Cát Lái sang Hiệp Phước &amp; SP-ITC
                  </p>
                </div>
              </div>

              {/* 3 Proposed Action Rows */}
              <div className="mt-3 space-y-1.5 text-xs">
                {[
                  {
                    n: 1,
                    text: "Chuyển 18% luồng Cát Lái → Hiệp Phước",
                    tag: "-46m",
                  },
                  {
                    n: 2,
                    text: `Ưu tiên ${live?.dockId ?? "D6"} cho ${truck.plate}`,
                    tag: "k = 0",
                  },
                  {
                    n: 3,
                    text: "Đồng bộ lệnh điện tử eDO sang 5 TOS",
                    tag: "1ms",
                  },
                ].map((item) => (
                  <div
                    key={item.n}
                    className="flex items-center justify-between rounded-xl bg-raised/45 px-3 py-1.5 ring-1 ring-line"
                  >
                    <span className="truncate font-medium text-fg">
                      <strong className="mr-1.5 font-mono text-accent">{item.n}.</strong>
                      {item.text}
                    </span>
                    <span className="ml-2 shrink-0 font-mono text-[11px] font-bold text-ok">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9 rounded-xl bg-raised text-xs font-semibold text-fg ring-1 ring-line"
                onClick={() => handleHitlAction("HUMAN_REJECTED")}
              >
                <RefreshCw className="size-3.5 text-muted" />
                Từ chối
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-9 rounded-xl bg-ok text-xs font-bold text-white shadow-xs hover:bg-ok/90"
                onClick={() => handleHitlAction("HUMAN_APPROVED")}
              >
                <ShieldCheck className="size-3.5" />
                Phê duyệt &amp; áp dụng
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact SHA-256 Hash-Chained Audit Ledger */}
      <div className="overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-line">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Lock className="size-3.5 text-ok" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Sổ cái Kiểm toán Bất biến SHA-256 ({fullAuditChain.length} Blocks)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => useBoardStore.getState().setSetupOpen(true)}
              className="inline-flex h-7 items-center gap-1 rounded-lg bg-raised px-2.5 text-xs font-medium text-fg ring-1 ring-line hover:text-accent"
            >
              <SlidersHorizontal className="size-3 text-accent" />
              Setup
            </button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 rounded-lg text-xs"
              onClick={() => {
                void navigator.clipboard.writeText(JSON.stringify(fullAuditChain, null, 2));
                setCopiedAudit(true);
                setTimeout(() => setCopiedAudit(false), 1800);
              }}
            >
              <Copy className="size-3" />
              {copiedAudit ? "Copied" : "Export JSON"}
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-line bg-raised/50 text-[10px] uppercase text-muted">
                <th className="px-4 py-2">Block</th>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Tier</th>
                <th className="px-3 py-2">Guardrails</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">ROI</th>
                <th className="px-3 py-2">Decision</th>
                <th className="px-4 py-2">SHA-256</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {fullAuditChain.map((rec) => (
                <tr key={`${rec.blockIndex}-${rec.blockHash}`} className="hover:bg-raised/30">
                  <td className="px-4 py-2 font-bold text-fg">#{rec.blockIndex}</td>
                  <td className="px-3 py-2 font-bold text-accent">{rec.vesselId}</td>
                  <td className="px-3 py-2 text-[11px] text-muted">{rec.tier}</td>
                  <td className="px-3 py-2">
                    {rec.guardrailsPassed}/{rec.guardrailsTotal}
                  </td>
                  <td className="px-3 py-2 font-sans text-xs text-fg">{rec.actionSummaryVi}</td>
                  <td className="px-3 py-2 font-bold text-ok">
                    +${rec.economicDeltaUsd.toLocaleString("en-US")}
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded-md bg-ok/10 px-2 py-0.5 text-[10px] font-semibold text-ok">
                      {rec.hitlStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[11px] text-muted">{rec.blockHash.slice(0, 16)}…</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
