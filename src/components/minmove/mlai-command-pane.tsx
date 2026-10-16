import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Copy,
  Cpu,
  KeyRound,
  Lock,
  Navigation,
  Play,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  HCMC_CORRIDOR_NODES,
  createHitlSignedAuditBlock,
  runOrganizationalAgentPipeline,
  type AuditLogBlock,
} from "@/lib/minmove/mlai-agents.ts";
import { verifyAndRunQuotaMeshAgent } from "@/lib/minmove/interpret.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";
import { MULTIMODAL_FLEET } from "@/components/minmove/multimodal-fleet-strip.tsx";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

interface QuotaMeshLiveTestResult {
  allowed: boolean;
  status: string;
  httpStatus: number;
  gatewayUrl: string;
  boundOrigin: string;
  tokenPreview: string;
  reasonVi: string;
  agentResponseVi: string;
  latencyMs: number;
}

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
  const [selectedAgentIdx, setSelectedAgentIdx] = useState<number>(1);
  const [selectedVehicleMode, setSelectedVehicleMode] = useState<string>(MULTIMODAL_FLEET[0]!.id);
  const [operatorName] = useState("Nguyễn Minh Quân · Điều độ viên trưởng");
  const [customAuditChain, setCustomAuditChain] = useState<AuditLogBlock[]>([]);
  const [copiedAudit, setCopiedAudit] = useState(false);

  const [qmBusy, setQmBusy] = useState(false);
  const [qmResult, setQmResult] = useState<QuotaMeshLiveTestResult>({
    allowed: true,
    status: "ALLOWED_ORIGIN_VERIFIED",
    httpStatus: 200,
    gatewayUrl: "http://127.0.0.1:8080/v1/chat/completions",
    boundOrigin: "http://127.0.0.1:8090",
    tokenPreview: "qmb_web_c4a98e12f01b_29870512_9f81a4e320b1...",
    reasonVi:
      "Origin hợp lệ + chữ ký HMAC-SHA256 khớp phiên Web. Đã kết nối QuotaMesh AI Gateway thành công.",
    agentResponseVi:
      "QuotaMesh Agent: Chuyển 18% luồng Cát Lái sang Hiệp Phước & SP-ITC, ưu tiên bến D6 (k = 0 dịch chuyển dây chuyền, giảm 46 phút chờ).",
    latencyMs: 14,
  });

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

  const runQuotaMeshTest = async (
    attackMode: "NONE" | "STOLEN_KEY_FOREIGN_ORIGIN" | "STOLEN_KEY_CLI_NO_ORIGIN" | "DIRECT_RAW_KEY_EXTRACTION",
  ) => {
    setQmBusy(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:8090";
      const { issueOriginBoundToken } = await import("@/lib/minmove/quotamesh-guard.ts");
      const token = issueOriginBoundToken(origin);
      const modeMap = {
        NONE: "legitimate_web",
        STOLEN_KEY_FOREIGN_ORIGIN: "stolen_foreign_domain",
        STOLEN_KEY_CLI_NO_ORIGIN: "stolen_cli_curl",
        DIRECT_RAW_KEY_EXTRACTION: "stolen_raw_key_attempt",
      } as const;
      const res = await verifyAndRunQuotaMeshAgent({
        data: {
          mode: modeMap[attackMode],
          clientOrigin: origin,
          boundToken: token,
          prompt: `Tối ưu điều phối liên cảng cho ${truck.plate} tại ${activePort.name} (tải ${activePort.utilizationPct}%, giữ k=0).`,
        },
      });
      setQmResult({
        allowed: res.allowed,
        status: res.verdict.code,
        httpStatus: res.verdict.httpStatus,
        gatewayUrl: `${res.gatewayUrl}/v1/chat/completions`,
        boundOrigin: res.verdict.normalizedOrigin || origin,
        tokenPreview: `${token.slice(0, 28)}...`,
        reasonVi: res.verdict.reasonVi,
        agentResponseVi: res.responseText,
        latencyMs: res.latencyMs,
      });
    } finally {
      setQmBusy(false);
    }
  };

  const agentCards = [
    {
      idx: 0,
      title: "Dự báo ETA",
      desc: "Phân tích thời tiết, AIS, lịch cập bến",
      conf: 96,
      badge: "Đang chạy",
      color: "text-emerald-400 bg-emerald-500/15 ring-emerald-500/30",
      barColor: "bg-emerald-400",
    },
    {
      idx: 1,
      title: "Điều phối cầu bến",
      desc: "Tối ưu phân bổ cầu bến & thiết bị",
      conf: 92,
      badge: "Đề xuất mới",
      color: "text-sky-400 bg-sky-500/15 ring-sky-500/30",
      barColor: "bg-sky-400",
    },
    {
      idx: 2,
      title: "Phân tải luồng xe",
      desc: "Điều tiết cổng vào/ra & bãi chờ",
      conf: 89,
      badge: "Đang chạy",
      color: "text-emerald-400 bg-emerald-500/15 ring-emerald-500/30",
      barColor: "bg-emerald-400",
    },
    {
      idx: 3,
      title: "Phát hiện xung đột",
      desc: "Cảnh báo trùng lịch, quá tải cầu bến",
      conf: 94,
      badge: "2 cảnh báo",
      color: "text-amber-300 bg-amber-500/20 ring-amber-500/40",
      barColor: "bg-amber-400",
    },
    {
      idx: 4,
      title: "Tối ưu chi phí",
      desc: "Giảm thời gian chờ & chi phí nhiên liệu",
      conf: 91,
      badge: "Đang chạy",
      color: "text-emerald-400 bg-emerald-500/15 ring-emerald-500/30",
      barColor: "bg-emerald-400",
    },
  ];

  return (
    <div
      data-mlai-command-center=""
      className="space-y-3.5 rounded-3xl border border-slate-800 bg-[#070E1B] p-4 text-slate-100 shadow-2xl"
    >
      {/* Top Dark Command Bar matching 05-ai-agents-hcmc-port-map.png */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-indigo-600 font-mono text-xs font-extrabold text-white shadow-sm">
              AI
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight text-white">
                  AI Command · 6 cảng TP.HCM
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  5 AI Agents đang hoạt động
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Điều phối liên cảng thời gian thực · QuotaMesh AI Gateway (`127.0.0.1:8080`) · Khóa API Key theo Web Origin
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "NORMAL", label: "24 giờ tới" },
              { id: "LOW_CONFIDENCE_STORM", label: "Kịch bản Bão / Triều cường" },
              { id: "TRANSSHIPMENT_CRITICAL", label: "Ưu tiên Tàu mẹ" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setStressMode(m.id)}
              className={cn(
                "h-8 rounded-xl px-3 text-xs font-semibold ring-1 transition",
                stressMode === m.id
                  ? "bg-indigo-600 text-white ring-indigo-500"
                  : "bg-slate-900/90 text-slate-300 ring-slate-700 hover:bg-slate-800",
              )}
            >
              {m.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleDivert}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 text-xs font-bold text-white shadow-sm ring-1 ring-indigo-400/40 hover:bg-indigo-500"
          >
            <Sparkles className="size-3.5" />
            Tối ưu toàn cụm
          </button>
        </div>
      </div>

      {/* Row 1: 6 Dark Glass KPI Cards matching 05-ai-agents-hcmc-port-map.png */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-2xl border border-slate-800/90 bg-[#0D1729]/95 p-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Tổng phương tiện đang xử lý</span>
            <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
              +4
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-extrabold text-white">28</span>
            <span className="text-[11px] text-slate-400">Tàu · Sà lan · Xe · Tàu hỏa</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">6 cảng · 18 cầu bến hoạt động</p>
        </div>

        <div className="rounded-2xl border border-slate-800/90 bg-[#0D1729]/95 p-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Sản lượng dự kiến (24h)</span>
            <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
              +8.2%
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-extrabold text-white">83,026</span>
            <span className="text-xs font-bold text-slate-300">TEU</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Đạt 91% công suất ngày</p>
        </div>

        <div className="rounded-2xl border border-slate-800/90 bg-[#0D1729]/95 p-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Tỷ lệ đúng ETA</span>
            <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
              +3.1%
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-extrabold text-white">92.4%</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Độ lệch TB ±18 phút</p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-[#171826]/95 p-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-amber-200/80">Cảnh báo rủi ro</span>
            <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-300">
              2 cao
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-extrabold text-amber-400">5</span>
            <span className="text-xs font-semibold text-amber-200/80">điểm nghẽn</span>
          </div>
          <p className="mt-1 text-[10px] text-amber-200/70">Cát Lái · Tân Thuận cần xử lý</p>
        </div>

        <div className="rounded-2xl border border-slate-800/90 bg-[#0D1729]/95 p-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Hiệu suất cầu bến</span>
            <span className="rounded-md bg-sky-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-sky-400">
              Ổn định
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-extrabold text-white">{corridorDensityPct}%</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Cân bằng tải liên cảng</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-[#0B1E26]/95 p-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-200/80">Chi phí ước tính</span>
            <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
              -12.4%
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-extrabold text-emerald-400">$29.7M</span>
          </div>
          <p className="mt-1 text-[10px] text-emerald-200/80">Tiết kiệm $3.8M nhờ AI</p>
        </div>
      </div>

      {/* Row 2: Photorealistic Dark Satellite Map + Right AI Recommendation & QuotaMesh Security Lock */}
      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-[1fr_390px]">
        {/* Left: Real Satellite Map of 6 HCMC Ports + Multi-modal Vehicle Selector */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0B1324] p-3">
          <div className="relative overflow-hidden rounded-xl border border-slate-700/80 bg-[#070D19]">
            <img
              src="/assets/logistics/hcmc-6ports-dark-satellite.png"
              alt="Bản đồ vệ tinh điều phối 6 cảng TP.HCM"
              className="h-[340px] w-full object-cover object-center sm:h-[370px]"
            />

            {/* Interactive Port Callout Pills on Bottom of Map */}
            <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-700/90 bg-slate-950/90 px-3 py-2 backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-1.5">
                {portLoads.map((p) => {
                  const active = p.id === selectedPortId;
                  const high = p.utilizationPct >= 85;
                  const med = p.utilizationPct >= 70 && p.utilizationPct < 85;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPortId(p.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition",
                        active
                          ? "bg-indigo-600 text-white ring-1 ring-indigo-400"
                          : "bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:bg-slate-800",
                      )}
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          high ? "bg-rose-400" : med ? "bg-amber-400" : "bg-emerald-400",
                        )}
                      />
                      <span>{p.name.replace("Cảng ", "").replace("ICD ", "")}</span>
                      <span className="font-mono text-[10px] opacity-90">{p.utilizationPct}%</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <Navigation className="size-3.5 text-sky-400" />
                <span className="font-mono text-[11px] text-slate-300">
                  {activePort.tosSystem} · Chờ {activePort.queueWaitHours}h
                </span>
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
                  className="w-20 accent-indigo-500"
                  aria-label="Simulate port load delta"
                />
              </div>
            </div>
          </div>

          {/* 8 Multi-Modal Fleet Strip inside AI Command Center */}
          <div className="mt-3 rounded-xl border border-slate-800 bg-[#081020] p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ĐỘI PHƯƠNG TIỆN ĐA PHƯƠNG THỨC ĐANG ĐIỀU PHỐI (8 HỆ THỐNG)
              </span>
              <span className="font-mono text-[10px] font-semibold text-sky-400">
                Click phương tiện để lọc luồng AI
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
              {MULTIMODAL_FLEET.map((v) => {
                const active = v.id === selectedVehicleMode;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVehicleMode(v.id)}
                    className={cn(
                      "flex flex-col items-center rounded-lg p-1.5 text-center transition",
                      active
                        ? "bg-indigo-950/90 ring-1.5 ring-indigo-400"
                        : "bg-slate-900/70 ring-1 ring-slate-800 hover:bg-slate-800/80",
                    )}
                  >
                    <img
                      src={v.image}
                      alt={v.nameVi}
                      className="h-9 w-full rounded object-cover"
                    />
                    <span className="mt-1 w-full truncate text-[9.5px] font-bold text-slate-200">
                      {v.nameVi}
                    </span>
                    <span className="font-mono text-[8.5px] text-emerald-400">{v.code}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Action Proposal + QuotaMesh Origin-Bound Key Shield */}
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-[#0D1729] p-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-white">Đề xuất hành động</h3>
                <p className="text-xs text-slate-400">Từ AI Agent · Cần phê duyệt (Human-in-the-loop)</p>
              </div>
              {/* 92% Confidence Ring matching 05-ai-agents-hcmc-port-map.png */}
              <div className="relative flex size-13 shrink-0 items-center justify-center">
                <svg viewBox="0 0 36 36" className="size-13 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#1e293b" strokeWidth="3.5" />
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
                <div className="absolute flex flex-col items-center leading-none">
                  <span className="font-mono text-xs font-extrabold text-white">92%</span>
                  <span className="text-[7px] text-slate-400">Độ tin cậy</span>
                </div>
              </div>
            </div>

            {/* Highlighted Proposal Box */}
            <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                  Ưu tiên cao
                </span>
                <span className="font-mono text-[11px] text-amber-200/90">Cát Lái → Hiệp Phước</span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-white">
                Điều hướng 3 tàu sà lan &amp; 120 TEU sang Hiệp Phước
              </p>

              <div className="mt-2.5 space-y-1.5 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                  <span>
                    Giảm tải cầu bến Cát Lái từ <strong>94% → 81%</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                  <span>
                    Rút ngắn thời gian chờ trung bình <strong>42 phút/tàu</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                  <span>
                    Tiết kiệm ước tính <strong>$184,000</strong> chi phí lưu bãi
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                <span className="block text-[10px] text-slate-400">Thời gian chờ</span>
                <span className="font-mono text-sm font-extrabold text-emerald-400">-42 phút</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                <span className="block text-[10px] text-slate-400">Tải Cát Lái</span>
                <span className="font-mono text-sm font-extrabold text-sky-400">-13%</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                <span className="block text-[10px] text-slate-400">Chi phí</span>
                <span className="font-mono text-sm font-extrabold text-emerald-400">-$184K</span>
              </div>
            </div>

            {/* QUOTAMESH ORIGIN-BOUND API KEY PROTECTION CONSOLE */}
            <div
              data-testid="quotamesh-security-panel"
              className="mt-3 rounded-xl border border-indigo-500/40 bg-indigo-950/35 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-indigo-400" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300">
                    QuotaMesh AI · Khóa API Key theo Link Web
                  </span>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-mono text-[10px] font-bold",
                    qmResult.allowed
                      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                      : "bg-rose-500/25 text-rose-300 ring-1 ring-rose-500/50",
                  )}
                >
                  HTTP {qmResult.httpStatus} · {qmResult.allowed ? "ALLOWED" : "BLOCKED"}
                </span>
              </div>

              <p className="mt-1 font-mono text-[10px] text-slate-400">
                Gateway: <span className="text-slate-200">{qmResult.gatewayUrl}</span> · Token:{" "}
                <span className="text-indigo-300">{qmResult.tokenPreview}</span>
              </p>

              <div
                className={cn(
                  "mt-2 rounded-lg p-2 text-[11px] leading-snug",
                  qmResult.allowed
                    ? "bg-emerald-950/60 text-emerald-200 ring-1 ring-emerald-500/30"
                    : "bg-rose-950/70 text-rose-200 ring-1 ring-rose-500/40",
                )}
              >
                <p className="font-bold">{qmResult.reasonVi}</p>
                <p className="mt-1 font-mono text-[10px] opacity-90">{qmResult.agentResponseVi}</p>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={qmBusy}
                  data-testid="qm-btn-legit"
                  onClick={() => void runQuotaMeshTest("NONE")}
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600/90 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-500"
                >
                  <ShieldCheck className="size-3.5" />
                  Chạy từ Web này (Hợp lệ)
                </button>
                <button
                  type="button"
                  disabled={qmBusy}
                  data-testid="qm-btn-stolen"
                  onClick={() => void runQuotaMeshTest("STOLEN_KEY_FOREIGN_ORIGIN")}
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-rose-600/90 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-rose-500"
                >
                  <ShieldAlert className="size-3.5" />
                  Giả lập lấy cắp Key (Chặn)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-9 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 ring-1 ring-slate-700 hover:bg-slate-700"
              onClick={() => handleHitlAction("HUMAN_REJECTED")}
            >
              <RefreshCw className="size-3.5" />
              Xem mô phỏng
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-sm hover:bg-indigo-500"
              onClick={() => handleHitlAction("HUMAN_APPROVED")}
            >
              <CheckCircle2 className="size-3.5" />
              Áp dụng đề xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Row 3: 5 AI Agents + Real-time Event Stream matching 05-ai-agents-hcmc-port-map.png */}
      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-[1fr_390px]">
        <div className="rounded-2xl border border-slate-800 bg-[#0D1729] p-3.5">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">5 AI Agents điều phối chuyên biệt</h3>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              Cập nhật tức thì · QuotaMesh `claude-sonnet-4-5`
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {agentCards.map((ag) => {
              const active = selectedAgentIdx === ag.idx;
              return (
                <button
                  key={ag.title}
                  type="button"
                  onClick={() => setSelectedAgentIdx(ag.idx)}
                  className={cn(
                    "flex flex-col justify-between rounded-xl p-3 text-left transition",
                    active
                      ? "bg-indigo-950/90 ring-2 ring-indigo-400"
                      : "bg-slate-900/90 ring-1 ring-slate-800 hover:bg-slate-800/80",
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <Cpu className="size-4 text-indigo-400" />
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[9.5px] font-bold ring-1",
                          ag.color,
                        )}
                      >
                        {ag.badge}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-extrabold text-white">{ag.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[10.5px] text-slate-400">{ag.desc}</p>
                  </div>
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-slate-400">Độ tin cậy</span>
                      <span className="font-bold text-white">{ag.conf}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={cn("h-full rounded-full", ag.barColor)}
                        style={{ width: `${ag.conf}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Real-time Event Stream matching 05-ai-agents-hcmc-port-map.png */}
        <div className="rounded-2xl border border-slate-800 bg-[#0D1729] p-3.5">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Dòng sự kiện thời gian thực</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(JSON.stringify(fullAuditChain, null, 2));
                setCopiedAudit(true);
                setTimeout(() => setCopiedAudit(false), 1800);
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 font-mono text-[10px] text-slate-300 ring-1 ring-slate-700 hover:text-white"
            >
              <Copy className="size-3" />
              {copiedAudit ? "Copied SHA-256" : `SHA-256 (${fullAuditChain.length})`}
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5 rounded-xl bg-slate-900/90 p-2.5 ring-1 ring-slate-800">
              <span className="font-mono text-[11px] font-bold text-slate-400">14:32</span>
              <span className="mt-1 size-2 shrink-0 rounded-full bg-rose-400" />
              <p className="text-slate-200">
                <strong>Cát Lái:</strong> Tàu <span className="font-mono text-white">MV HAI AN TIME</span> báo trễ ETA +35 phút, nguy cơ trùng lịch cầu B02.
              </p>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl bg-slate-900/90 p-2.5 ring-1 ring-slate-800">
              <span className="font-mono text-[11px] font-bold text-slate-400">14:30</span>
              <span className="mt-1 size-2 shrink-0 rounded-full bg-sky-400" />
              <p className="text-slate-200">
                <strong>AI Agent:</strong> Đề xuất chuyển 3 sà lan sang <strong>Hiệp Phước</strong> để cân bằng tải ({qmResult.allowed ? "Đã xác thực Origin" : "Đã chặn Key lạ"}).
              </p>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl bg-slate-900/90 p-2.5 ring-1 ring-slate-800">
              <span className="font-mono text-[11px] font-bold text-slate-400">14:26</span>
              <span className="mt-1 size-2 shrink-0 rounded-full bg-emerald-400" />
              <p className="text-slate-200">
                <strong>Cái Mép:</strong> Hoàn tất xếp dỡ 4,200 TEU sớm hơn kế hoạch 18 phút · Hash{" "}
                <span className="font-mono text-indigo-300">
                  {fullAuditChain[fullAuditChain.length - 1]?.blockHash.slice(0, 10)}…
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
