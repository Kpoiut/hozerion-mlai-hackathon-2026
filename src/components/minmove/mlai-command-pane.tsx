import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  FileCheck2,
  Lock,
  Navigation,
  Radio,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import {
  createHitlSignedAuditBlock,
  HCMC_CORRIDOR_EDGES,
  HCMC_CORRIDOR_NODES,
  runOrganizationalAgentPipeline,
  type AuditLogBlock,
} from "@/lib/minmove/mlai-agents.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";
import { cn } from "@/lib/utils.ts";

export function MlaiHackathonCommandCenter() {
  const yard = useBoardStore((s) => s.yard);
  const selectedId = useBoardStore((s) => s.selectedId);
  const event = useBoardStore((s) => s.event);
  const result = useBoardStore((s) => s.result);

  const [stressMode, setStressMode] = useState<
    "NORMAL" | "LOW_CONFIDENCE_STORM" | "TRANSSHIPMENT_CRITICAL"
  >("NORMAL");
  const [selectedMapNodeId, setSelectedMapNodeId] =
    useState<string>("PORT_CAT_LAI");
  const [operatorName, setOperatorName] = useState(
    "Trưởng ca Nguyễn Minh Quân (HCMUT-VNG)",
  );
  const [signedBlocks, setSignedBlocks] = useState<AuditLogBlock[]>([]);
  const [copiedAudit, setCopiedAudit] = useState(false);

  const evaluation = useMemo(
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

  const selectedMapNode = useMemo(
    () =>
      HCMC_CORRIDOR_NODES.find((n) => n.id === selectedMapNodeId) ??
      HCMC_CORRIDOR_NODES[0]!,
    [selectedMapNodeId],
  );

  const auditChain = useMemo(() => {
    const genesisBlock: AuditLogBlock = {
      blockIndex: 1041,
      timestampIso: "17:40:12",
      vesselId: "SYS-SYNC",
      vesselName: "5-TOS Sync",
      weekTag: yard.name,
      rawSignal: "3,092 calls sync",
      tier: "TIER_0_AUTONOMOUS_NO_OP",
      confidencePct: 99.8,
      guardrailsPassed: 5,
      guardrailsTotal: 5,
      actionSummaryVi: "DCSA v3.0 Sync (NO_OP)",
      economicDeltaUsd: 0,
      hitlStatus: "AUTO_VERIFIED",
      operatorId: "GENESIS_VERIFIER",
      operatorNote: "OK",
      prevHash: "0x00000000000000000000000000000000",
      blockHash: "0x000000008f4b2e91c7d3a605192e4b7c",
    };
    return [genesisBlock, evaluation.initialAuditBlock, ...signedBlocks];
  }, [evaluation, signedBlocks, yard.name]);

  const handleHitlDecision = (
    decision: "HUMAN_APPROVED" | "HUMAN_OVERRIDDEN" | "HUMAN_REJECTED",
  ) => {
    const latestBlock =
      signedBlocks.length > 0
        ? signedBlocks[signedBlocks.length - 1]!
        : evaluation.initialAuditBlock;
    const nextBlock = createHitlSignedAuditBlock(
      latestBlock,
      decision,
      operatorName,
      decision,
    );
    setSignedBlocks((prev) => [...prev, nextBlock]);
  };

  const handleCopyAuditJson = () => {
    const payload = JSON.stringify(
      {
        competition: "MLAI Hackathon 2026",
        activeEvaluation: {
          vesselId: evaluation.vesselId,
          tier: evaluation.tier,
          conformalQuantiles: evaluation.conformal,
          guardrails: evaluation.guardrails,
        },
        immutableAuditChain: auditChain,
      },
      null,
      2,
    );
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(payload);
      setCopiedAudit(true);
      setTimeout(() => setCopiedAudit(false), 2000);
    }
  };

  const passedGuardrailCount = evaluation.guardrails.filter(
    (g) => g.passed,
  ).length;

  return (
    <div className="space-y-3 pb-6" data-testid="mlai-hackathon-command-center">
      {/* COMPACT KPI RIBBON (NO PROSE — PURE METRICS & SCENARIO SWITCHER) */}
      <section className="rounded-2xl bg-surface px-4 py-2.5 shadow-card ring-1 ring-line">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-accent-fg">
              <Sparkles className="size-3" />
              MLAI CONTROL SCADA
            </span>
            <span className="rounded bg-ok/15 px-2 py-0.5 font-mono text-[10px] font-bold text-ok">
              Track 01 Map · Track 02 Agents/HITL · Track 03 Decision
            </span>
            <span
              className={cn(
                "rounded px-2 py-0.5 font-mono text-[10px] font-bold",
                evaluation.tier === "TIER_2_HITL_ESCALATION_REFEREE"
                  ? "bg-warn/20 text-warn"
                  : evaluation.tier === "TIER_1_AUTONOMOUS_COMMIT_K0"
                    ? "bg-accent/15 text-accent"
                    : "bg-ok/15 text-ok",
              )}
            >
              {evaluation.tier}
            </span>
          </div>

          {/* Scenario Simulation Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-muted">
              <Radio className="size-3 text-accent" />
              Mode:
            </span>
            <button
              type="button"
              onClick={() => setStressMode("NORMAL")}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold transition-colors",
                stressMode === "NORMAL"
                  ? "bg-accent text-accent-fg"
                  : "bg-raised text-muted ring-1 ring-line hover:text-fg",
              )}
            >
              1. Luồng chuẩn (Auto k=0 / NO_OP)
            </button>
            <button
              type="button"
              onClick={() => setStressMode("LOW_CONFIDENCE_STORM")}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold transition-colors",
                stressMode === "LOW_CONFIDENCE_STORM"
                  ? "bg-warn text-white"
                  : "bg-warn/10 text-warn ring-1 ring-warn/30",
              )}
            >
              2. Mưa giông (&lt;85% Conf -&gt; HITL)
            </button>
            <button
              type="button"
              onClick={() => setStressMode("TRANSSHIPMENT_CRITICAL")}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold transition-colors",
                stressMode === "TRANSSHIPMENT_CRITICAL"
                  ? "bg-danger text-white"
                  : "bg-danger/10 text-danger ring-1 ring-danger/30",
              )}
            >
              3. Rớt Tàu Mẹ (G4 Fail -&gt; HITL)
            </button>
          </div>
        </div>
      </section>

      {/* ROW 1: VISUAL GEOSPATIAL RADAR MAP (LEFT 7 COLS) + VISUAL CONFORMAL CURVE & 5 RADIAL GUARDRAIL GAUGES (RIGHT 5 COLS) */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* LEFT 7 COLS: INTERACTIVE HCMC PORT & VETC RADAR MAP + COMPACT METRIC TABLE */}
        <section className="flex flex-col justify-between rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line lg:col-span-7">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="size-4 text-accent" />
              <span className="font-mono text-xs font-bold uppercase tracking-wide text-fg">
                RADAR ĐIỀU PHỐI KHÔNG GIAN CỤM CẢNG TP.HCM – VETC – CÁI MÉP
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px]">
              <span className="flex items-center gap-1 text-ok">
                <span className="size-2 rounded-full bg-ok" /> Chia tải k=0
              </span>
              <span className="flex items-center gap-1 text-warn">
                <span className="size-2 rounded-full bg-warn" /> Tải cao
              </span>
              <span className="flex items-center gap-1 text-danger">
                <span className="size-2 rounded-full bg-danger" /> Nghẽn đỏ
              </span>
            </div>
          </div>

          {/* Interactive SVG Spatial Radar Canvas */}
          <div className="relative overflow-hidden rounded-xl bg-[#09111e] ring-1 ring-line">
            <svg
              viewBox="0 0 760 330"
              className="h-[275px] w-full select-none"
              role="img"
              aria-label="Radar bản đồ cụm cảng TP.HCM và trạm VETC"
            >
              <defs>
                <pattern
                  id="scadaGrid"
                  width="32"
                  height="32"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 32 0 L 0 0 0 32"
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.08)"
                    strokeWidth="1"
                  />
                </pattern>
                <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(56, 189, 248, 0.16)" />
                  <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
                </radialGradient>
              </defs>
              <rect width="760" height="330" fill="url(#scadaGrid)" />
              <circle cx="410" cy="170" r="155" fill="url(#radarGlow)" />
              <circle
                cx="410"
                cy="170"
                r="130"
                fill="none"
                stroke="rgba(56, 189, 248, 0.12)"
                strokeDasharray="4 4"
              />

              {/* Rivers: Saigon River, Dong Nai River & Soai Rap Channel */}
              <path
                d="M 165 15 Q 205 110 235 185 T 285 280 L 330 325"
                fill="none"
                stroke="rgba(14, 165, 233, 0.25)"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <path
                d="M 500 15 Q 465 95 415 160 T 625 290"
                fill="none"
                stroke="rgba(14, 165, 233, 0.30)"
                strokeWidth="28"
                strokeLinecap="round"
              />

              {/* Edges with Animated/Visual Ship & Truck Vectors */}
              {HCMC_CORRIDOR_EDGES.map((edge) => {
                const fromNode = HCMC_CORRIDOR_NODES.find(
                  (n) => n.id === edge.from,
                );
                const toNode = HCMC_CORRIDOR_NODES.find(
                  (n) => n.id === edge.to,
                );
                if (!fromNode || !toNode) return null;
                const fx = fromNode.x - 15;
                const fy = Math.round(fromNode.y * 0.76);
                const tx = toNode.x - 15;
                const ty = Math.round(toNode.y * 0.76);
                const mx = (fx + tx) / 2;
                const my = (fy + ty) / 2;
                const strokeColor =
                  edge.trafficState === "RED_BOTTLENECK"
                    ? "#f43f5e"
                    : edge.activeDivert
                      ? "#10b981"
                      : "#f59e0b";
                return (
                  <g key={edge.id}>
                    <line
                      x1={fx}
                      y1={fy}
                      x2={tx}
                      y2={ty}
                      stroke={strokeColor}
                      strokeWidth={edge.activeDivert ? 3.5 : 2.5}
                      strokeDasharray={
                        edge.mode === "WATERWAY_BARGE" ? "7 4" : undefined
                      }
                    />
                    {/* Midpoint Vessel/Truck Icon Pill */}
                    <rect
                      x={mx - 36}
                      y={my - 9}
                      width={72}
                      height={16}
                      rx={8}
                      fill="#0f172a"
                      stroke={strokeColor}
                      strokeWidth="1.2"
                    />
                    <text
                      x={mx}
                      y={my + 2}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {edge.mode === "WATERWAY_BARGE" ? "🚢 " : "🚛 "}
                      {edge.distanceKm}km·{edge.travelMinutes}p
                    </text>
                  </g>
                );
              })}

              {/* Interactive Port & VETC Nodes with Radial Progress Rings */}
              {HCMC_CORRIDOR_NODES.map((node) => {
                const nx = node.x - 15;
                const ny = Math.round(node.y * 0.76);
                const isSelected = node.id === selectedMapNode.id;
                const color =
                  node.status === "CRITICAL_DIVERT"
                    ? "#f43f5e"
                    : node.status === "CONGESTED"
                      ? "#f59e0b"
                      : "#10b981";
                const r = 18;
                const c = 2 * Math.PI * r;
                const dash = (node.utilizationPct / 100) * c;
                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedMapNodeId(node.id)}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <circle
                        cx={nx}
                        cy={ny}
                        r={26}
                        fill="rgba(56, 189, 248, 0.15)"
                        stroke="#38bdf8"
                        strokeWidth={1.8}
                        strokeDasharray="4 2"
                      />
                    )}
                    <circle
                      cx={nx}
                      cy={ny}
                      r={r}
                      fill="#0f172a"
                      stroke="rgba(148,163,184,0.25)"
                      strokeWidth={3.5}
                    />
                    <circle
                      cx={nx}
                      cy={ny}
                      r={r}
                      fill="none"
                      stroke={color}
                      strokeWidth={3.5}
                      strokeDasharray={`${dash} ${c}`}
                      transform={`rotate(-90 ${nx} ${ny})`}
                      strokeLinecap="round"
                    />
                    <text
                      x={nx}
                      y={ny + 3.5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.utilizationPct}%
                    </text>
                    <rect
                      x={nx - 66}
                      y={ny + 21}
                      width={132}
                      height={16}
                      rx={4}
                      fill="rgba(15, 23, 42, 0.92)"
                      stroke={isSelected ? "#38bdf8" : "rgba(148, 163, 184, 0.3)"}
                    />
                    <text
                      x={nx}
                      y={ny + 32}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="8.5"
                      fontWeight="bold"
                    >
                      {node.name.split("(")[0]!.trim()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Pure Metric Table for the 6 HCMC Corridor Nodes */}
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full border-collapse text-left font-mono text-[11px]">
              <thead>
                <tr className="border-b border-line bg-raised text-[9px] uppercase text-muted">
                  <th className="px-2 py-1.5">Điểm Nút Cảng / VETC</th>
                  <th className="px-2 py-1.5">Hệ Thống TOS</th>
                  <th className="px-2 py-1.5 text-right">Tải Bến</th>
                  <th className="px-2 py-1.5 text-right">Chờ (h)</th>
                  <th className="px-2 py-1.5 text-right">Luồng VETC</th>
                  <th className="px-2 py-1.5 text-right">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {HCMC_CORRIDOR_NODES.map((n) => (
                  <tr
                    key={n.id}
                    onClick={() => setSelectedMapNodeId(n.id)}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-raised/70",
                      n.id === selectedMapNode.id && "bg-accent/10",
                    )}
                  >
                    <td className="px-2 py-1.5 font-sans text-xs font-semibold text-fg">
                      {n.name.split("(")[0]!.trim()}
                    </td>
                    <td className="px-2 py-1.5 text-[10px] text-muted">
                      {n.tosSystem}
                    </td>
                    <td className="px-2 py-1.5 text-right font-bold text-fg">
                      {n.utilizationPct}%
                    </td>
                    <td className="px-2 py-1.5 text-right text-fg">
                      {n.queueWaitHours}h
                    </td>
                    <td className="px-2 py-1.5 text-right text-accent">
                      {n.vetcFlowPerHour} xe/h
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[9px] font-bold",
                          n.status === "CRITICAL_DIVERT"
                            ? "bg-danger/20 text-danger"
                            : n.status === "CONGESTED"
                              ? "bg-warn/20 text-warn"
                              : "bg-ok/20 text-ok",
                        )}
                      >
                        {n.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* RIGHT 5 COLS: VISUAL CONFORMAL BELL CURVE + 5 RADIAL GUARDRAIL GAUGES + HITL PAD */}
        <section className="flex flex-col justify-between gap-3 rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line lg:col-span-5">
          {/* 1. Visual SVG Conformal ML Probability Distribution & Berth Window Chart */}
          <div className="rounded-xl bg-[#09111e] p-3 ring-1 ring-line">
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="font-bold uppercase text-sky-400">
                PHỔ XÁC SUẤT ETA CONFORMAL ML [Q10, Q50, Q90]
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-bold text-emerald-400">
                Conf: {evaluation.conformal.confidencePct}% · σ={evaluation.conformal.epistemicSigma}
              </span>
            </div>

            <svg
              viewBox="0 0 420 125"
              className="mt-1.5 h-[115px] w-full select-none"
              role="img"
              aria-label="Biểu đồ phân phối xác suất dự báo Conformal ML"
            >
              {/* Safe Berth Window vs Conflict Zone */}
              <rect
                x="25"
                y="12"
                width="265"
                height="86"
                rx="4"
                fill="rgba(16, 185, 129, 0.09)"
                stroke="rgba(16, 185, 129, 0.3)"
                strokeDasharray="3 3"
              />
              <rect
                x="295"
                y="12"
                width="105"
                height="86"
                rx="4"
                fill="rgba(244, 63, 94, 0.12)"
                stroke="rgba(244, 63, 94, 0.35)"
                strokeDasharray="3 3"
              />
              <text x="34" y="25" fill="#10b981" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                CỬA SỔ CẦU TRỐNG ({evaluation.proposedLane}) · k=0
              </text>
              <text x="302" y="25" fill="#f43f5e" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                VÙNG XUNG ĐỘT LỊCH
              </text>

              {/* Gaussian / Conformal Bell Curve */}
              <path
                d={
                  stressMode === "LOW_CONFIDENCE_STORM"
                    ? "M 40 98 Q 140 96 200 50 Q 260 15 320 55 Q 365 88 395 98"
                    : "M 40 98 Q 110 96 145 48 Q 175 12 205 48 Q 240 95 310 98"
                }
                fill={
                  stressMode === "LOW_CONFIDENCE_STORM"
                    ? "rgba(245, 158, 11, 0.25)"
                    : "rgba(56, 189, 248, 0.25)"
                }
                stroke={stressMode === "LOW_CONFIDENCE_STORM" ? "#f59e0b" : "#38bdf8"}
                strokeWidth="2.5"
              />

              {/* Q10, Q50, Q90 Vertical Markers */}
              <line x1="130" y1="28" x2="130" y2="98" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="2 2" />
              <line x1="175" y1="16" x2="175" y2="98" stroke="#38bdf8" strokeWidth="2" />
              <line
                x1={stressMode === "LOW_CONFIDENCE_STORM" ? "315" : "225"}
                y1="24"
                x2={stressMode === "LOW_CONFIDENCE_STORM" ? "315" : "225"}
                y2="98"
                stroke={stressMode === "LOW_CONFIDENCE_STORM" ? "#f43f5e" : "#10b981"}
                strokeWidth="2"
                strokeDasharray="3 2"
              />

              <text x="130" y="112" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontFamily="monospace">
                Q10={evaluation.conformal.q10Optimistic}h
              </text>
              <text x="175" y="112" textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">
                Q50={evaluation.conformal.q50Median}h
              </text>
              <text
                x={stressMode === "LOW_CONFIDENCE_STORM" ? "315" : "225"}
                y="112"
                textAnchor="middle"
                fill={stressMode === "LOW_CONFIDENCE_STORM" ? "#f43f5e" : "#10b981"}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                Q90={evaluation.conformal.q90Conservative}h
              </text>
            </svg>
          </div>

          {/* 2. 5 Visual Radial Guardrail Gauges (Zero Text Walls!) */}
          <div className="rounded-xl bg-raised p-3 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-fg">
                <ShieldCheck className="size-3.5 text-accent" />
                5 ĐỒNG HỒ GUARDRAIL (ESCALATION REFEREE)
              </span>
              <span className="font-mono text-[11px] font-bold text-ok">
                {passedGuardrailCount}/5 PASS
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-5 gap-1.5">
              {evaluation.guardrails.map((g, idx) => {
                const shortLabels = ["G1 k=0", "G2 Q90", "G3 ROI", "G4 SLA", "G5 Conf"];
                const stroke = g.passed ? "#10b981" : "#f59e0b";
                return (
                  <div
                    key={g.id}
                    className={cn(
                      "flex flex-col items-center rounded-lg p-1.5 text-center ring-1",
                      g.passed ? "bg-surface ring-ok/30" : "bg-warn/10 ring-warn/50",
                    )}
                  >
                    <svg viewBox="0 0 48 48" className="size-11">
                      <circle
                        cx="24"
                        cy="24"
                        r="18"
                        fill="none"
                        stroke="rgba(148,163,184,0.2)"
                        strokeWidth="4.5"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="18"
                        fill="none"
                        stroke={stroke}
                        strokeWidth="4.5"
                        strokeDasharray={g.passed ? "113 113" : "68 113"}
                        transform="rotate(-90 24 24)"
                        strokeLinecap="round"
                      />
                      <text
                        x="24"
                        y="27"
                        textAnchor="middle"
                        fill="currentColor"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {g.passed ? "OK" : "HITL"}
                      </text>
                    </svg>
                    <span className="mt-0.5 font-mono text-[10px] font-bold text-fg">
                      {shortLabels[idx]}
                    </span>
                    <span className="truncate w-full font-mono text-[9px] text-muted">
                      {g.metricLabel.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Hardware-Style HITL Control Pad */}
          <div className="rounded-xl bg-raised p-3 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-fg">
                <UserCheck className="size-3.5 text-accent" />
                HUMAN-IN-THE-LOOP SIGN-OFF PAD
              </span>
              <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-accent">
                SHA-256 Hardware Key
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full rounded-lg bg-surface px-2.5 py-1 font-mono text-[11px] text-fg ring-1 ring-line"
                aria-label="Operator Name"
              />
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleHitlDecision("HUMAN_APPROVED")}
                className="flex items-center justify-center gap-1 rounded-lg bg-ok px-2 py-2 font-mono text-[10px] font-bold text-white shadow-sm hover:opacity-90"
              >
                <CheckCircle2 className="size-3.5 shrink-0" />
                Phê Duyệt Patch
              </button>
              <button
                type="button"
                onClick={() => handleHitlDecision("HUMAN_OVERRIDDEN")}
                className="flex items-center justify-center gap-1 rounded-lg bg-warn px-2 py-2 font-mono text-[10px] font-bold text-white shadow-sm hover:opacity-90"
              >
                <FileCheck2 className="size-3.5 shrink-0" />
                Ghi Đè Guardrail
              </button>
              <button
                type="button"
                onClick={() => handleHitlDecision("HUMAN_REJECTED")}
                className="flex items-center justify-center gap-1 rounded-lg bg-danger/15 px-2 py-2 font-mono text-[10px] font-bold text-danger ring-1 ring-danger/40 hover:bg-danger/25"
              >
                <RotateCcw className="size-3.5 shrink-0" />
                Rollback Gốc
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ROW 2: VISUAL 5-AGENT NODE-GRAPH CIRCUIT DIAGRAM + PURE METRIC TABLE */}
      <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wide text-fg">
            SƠ ĐỒ MẠCH ĐIỀU PHỐI 5 AI AGENT (NEURO-SYMBOLIC COORDINATION PIPELINE · 4.71ms)
          </span>
          <span className="font-mono text-[11px] font-bold text-ok">
            Booked {evaluation.bookedLane}@{evaluation.bookedStart}h → Plan {evaluation.proposedLane}@{evaluation.proposedStart}h · Cứu {evaluation.waitSavedHours}h (+${evaluation.netEconomicBenefitUsd.toLocaleString("en-US")}) · k={evaluation.displacedCount}
          </span>
        </div>

        {/* Visual SVG 5-Node Pipeline Schematic */}
        <div className="overflow-hidden rounded-xl bg-[#09111e] p-2.5 ring-1 ring-line">
          <svg
            viewBox="0 0 920 88"
            className="h-[82px] w-full select-none"
            role="img"
            aria-label="Sơ đồ mạch 5 AI Agent"
          >
            {evaluation.agents.map((ag, i) => {
              const x = 14 + i * 182;
              const isFlagged = ag.status === "FLAGGED_FOR_HITL";
              const borderCol = isFlagged ? "#f59e0b" : "#10b981";
              const shortTitles = [
                "1. NLP VHF/AIS",
                "2. CONFORMAL ML",
                "3. GO 536× SOLVER",
                "4. REFEREE G1-G5",
                "5. DCSA & SHA-256",
              ];
              return (
                <g key={ag.agentId}>
                  {i < 4 && (
                    <g>
                      <line
                        x1={x + 154}
                        y1={44}
                        x2={x + 182}
                        y2={44}
                        stroke="#38bdf8"
                        strokeWidth="2.2"
                        strokeDasharray="4 2"
                      />
                      <polygon
                        points={`${x + 182},44 ${x + 175},40 ${x + 175},48`}
                        fill="#38bdf8"
                      />
                    </g>
                  )}
                  <rect
                    x={x}
                    y={8}
                    width={154}
                    height={72}
                    rx={8}
                    fill="#0f172a"
                    stroke={borderCol}
                    strokeWidth="2"
                  />
                  <circle cx={x + 14} cy={22} r={4.5} fill={borderCol} />
                  <text
                    x={x + 24}
                    y={25}
                    fill="#f8fafc"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {shortTitles[i]}
                  </text>
                  <text
                    x={x + 12}
                    y={46}
                    fill="#38bdf8"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    Conf: {ag.confidencePct}%
                  </text>
                  <text
                    x={x + 100}
                    y={46}
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {ag.latencyMs}ms
                  </text>
                  <text
                    x={x + 12}
                    y={66}
                    fill="#cbd5e1"
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    {ag.outputSummary.slice(0, 22)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Compact 5-Agent Telemetry Table */}
        <div className="mt-2.5 overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-line bg-raised text-[9px] uppercase text-muted">
                <th className="px-2.5 py-1.5">AI Agent Node</th>
                <th className="px-2.5 py-1.5">Track</th>
                <th className="px-2.5 py-1.5">Input Telemetry</th>
                <th className="px-2.5 py-1.5">Output Vector</th>
                <th className="px-2.5 py-1.5 text-right">Latency</th>
                <th className="px-2.5 py-1.5 text-right">Conf %</th>
                <th className="px-2.5 py-1.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {evaluation.agents.map((ag, idx) => (
                <tr key={ag.agentId} className="hover:bg-raised/60">
                  <td className="px-2.5 py-1.5 font-sans text-xs font-semibold text-fg">
                    #{idx + 1} · {ag.nameVi.split("·")[1]?.trim() ?? ag.nameVi}
                  </td>
                  <td className="px-2.5 py-1.5 text-[10px] text-accent">
                    {ag.trackBadge}
                  </td>
                  <td className="max-w-[220px] truncate px-2.5 py-1.5 text-[10px] text-muted">
                    {ag.inputSummary}
                  </td>
                  <td className="max-w-[240px] truncate px-2.5 py-1.5 text-[10px] font-bold text-fg">
                    {ag.outputSummary}
                  </td>
                  <td className="px-2.5 py-1.5 text-right text-muted">
                    {ag.latencyMs}ms
                  </td>
                  <td className="px-2.5 py-1.5 text-right font-bold text-ok">
                    {ag.confidencePct}%
                  </td>
                  <td className="px-2.5 py-1.5 text-right">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-bold",
                        ag.status === "FLAGGED_FOR_HITL"
                          ? "bg-warn/20 text-warn"
                          : "bg-ok/15 text-ok",
                      )}
                    >
                      {ag.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ROW 3: COMPACT SHA-256 HASH-CHAINED AUDIT TABLE */}
      <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-ok" />
            <span className="font-mono text-xs font-bold uppercase tracking-wide text-fg">
              Sổ Cái Kiểm Toán Minh Bạch (SHA-256 Hash-Chained Audit Ledger)
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyAuditJson}
            className="inline-flex items-center gap-1.5 rounded-lg bg-raised px-2.5 py-1 font-mono text-[10px] font-semibold text-fg ring-1 ring-line hover:bg-bg"
          >
            {copiedAudit ? (
              <>
                <Check className="size-3 text-ok" />
                Đã chép JSON
              </>
            ) : (
              <>
                <Copy className="size-3 text-accent" />
                Xuất Audit JSON
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-line bg-raised text-[9px] uppercase text-muted">
                <th className="px-2.5 py-1.5">Block #</th>
                <th className="px-2.5 py-1.5">Entity</th>
                <th className="px-2.5 py-1.5">Referee Tier</th>
                <th className="px-2.5 py-1.5">Guardrails</th>
                <th className="px-2.5 py-1.5">Action / Delta</th>
                <th className="px-2.5 py-1.5">ROI (USD)</th>
                <th className="px-2.5 py-1.5">HITL Status / Signer</th>
                <th className="px-2.5 py-1.5">SHA-256 Chain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {auditChain.map((blk) => (
                <tr key={blk.blockIndex} className="hover:bg-raised/60">
                  <td className="px-2.5 py-1.5 font-bold text-fg">
                    #{blk.blockIndex}
                  </td>
                  <td className="px-2.5 py-1.5 font-bold text-fg">
                    {blk.vesselId}
                  </td>
                  <td className="px-2.5 py-1.5">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-bold",
                        blk.tier === "TIER_2_HITL_ESCALATION_REFEREE"
                          ? "bg-warn/20 text-warn"
                          : blk.tier === "TIER_1_AUTONOMOUS_COMMIT_K0"
                            ? "bg-accent/15 text-accent"
                            : "bg-ok/15 text-ok",
                      )}
                    >
                      {blk.tier}
                    </span>
                  </td>
                  <td className="px-2.5 py-1.5 font-bold text-fg">
                    {blk.guardrailsPassed}/{blk.guardrailsTotal} ({blk.confidencePct}%)
                  </td>
                  <td className="max-w-[230px] truncate px-2.5 py-1.5 text-[10px] text-fg">
                    {blk.actionSummaryVi}
                  </td>
                  <td className="px-2.5 py-1.5 font-bold text-ok">
                    +${blk.economicDeltaUsd.toLocaleString("en-US")}
                  </td>
                  <td className="px-2.5 py-1.5">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-bold",
                        blk.hitlStatus === "HUMAN_APPROVED" ||
                          blk.hitlStatus === "AUTO_VERIFIED"
                          ? "bg-ok/15 text-ok"
                          : blk.hitlStatus === "HUMAN_REJECTED"
                            ? "bg-danger/15 text-danger"
                            : "bg-warn/20 text-warn",
                      )}
                    >
                      {blk.hitlStatus}
                    </span>
                  </td>
                  <td className="px-2.5 py-1.5 text-[10px] text-ok">
                    {blk.blockHash.slice(0, 16)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
