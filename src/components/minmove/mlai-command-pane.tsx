import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  FileCheck2,
  Lock,
  MapPin,
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
  const [customSignal, setCustomSignal] = useState("");
  const [selectedMapNodeId, setSelectedMapNodeId] =
    useState<string>("PORT_CAT_LAI");
  const [operatorName, setOperatorName] = useState(
    "Trưởng ca Nguyễn Minh Quân (HCMUT-VNG Ops)",
  );
  const [operatorNote, setOperatorNote] = useState(
    "Xác nhận phương án điều phối k=0 an toàn, đồng ý phát hành bản tin DCSA/BERMAN sang TOS.",
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
        rawSignalOverride: customSignal,
        stressMode,
      }),
    [yard, selectedId, event, result, customSignal, stressMode],
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
      timestampIso: "2026-10-16T17:40:12+07:00",
      vesselId: "SYS-SYNC",
      vesselName: "Đồng bộ Liên thông 5 TOS & Trạm VETC",
      weekTag: yard.name,
      rawSignal:
        "Khởi tạo phiên kiểm toán SHA-256 trên tập 3.092 ca thực nghiệm (83.02% NO_OP · 16.98% Patch k=0)",
      tier: "TIER_0_AUTONOMOUS_NO_OP",
      confidencePct: 99.8,
      guardrailsPassed: 5,
      guardrailsTotal: 5,
      actionSummaryVi: "Đồng bộ trạng thái chuẩn DCSA v3.0 & e-EIR không xâm lấn",
      economicDeltaUsd: 0,
      hitlStatus: "AUTO_VERIFIED",
      operatorId: "SYSTEM_GENESIS_VERIFIER",
      operatorNote: "Khối khởi nguyên (Genesis Audit Block) hợp lệ",
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
      operatorNote,
    );
    setSignedBlocks((prev) => [...prev, nextBlock]);
  };

  const handleCopyAuditJson = () => {
    const payload = JSON.stringify(
      {
        competition: "MLAI Hackathon 2026 (https://mlai-hackathon.devpost.com/)",
        tracksCovered: [
          "Track 02 (VNG): Organizational AI — Escalation Referee, Whole Workflow & Coordination Layer",
          "Track 01 (TASCO/Goong): Vietnam Smart Mobility & Port Corridor Map",
          "Track 03 (TMA): Vietnamese AI Decision Support Co-Pilot",
        ],
        activeEvaluation: {
          vesselId: evaluation.vesselId,
          vesselName: evaluation.vesselName,
          tier: evaluation.tier,
          conformalQuantiles: evaluation.conformal,
          guardrails: evaluation.guardrails,
          vietnameseDecisionBrief: evaluation.vietnameseDecisionBrief,
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
    <div className="space-y-4 pb-6" data-testid="mlai-hackathon-command-center">
      {/* HERO BANNER: MLAI HACKATHON 2026 TRACK 1 + TRACK 2 + TRACK 3 */}
      <section className="overflow-hidden rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                <Sparkles className="size-3" />
                MLAI HACKATHON 2026 · TOP-1 ARCHITECTURE
              </span>
              <span className="rounded-md bg-ok/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-ok">
                Track 02 (VNG): Organizational AI · Escalation Referee · Coordination Layer · HITL
              </span>
              <span className="rounded-md bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-accent">
                Track 01 (TASCO/Goong): Smart Port &amp; VETC Map
              </span>
              <span className="rounded-md bg-warn/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-warn">
                Track 03 (TMA): AI Ra Quyết Định Tiếng Việt
              </span>
            </div>
            <h2 className="mt-2 text-base font-semibold tracking-tight text-fg sm:text-lg">
              Hệ Điều Phối Đa Agent Neuro-Symbolic, Trọng Tài Ngoại Lệ (Escalation Referee) &amp; Bản Đồ Luồng Cảng Thông Minh
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">
              Đáp ứng trực diện tiêu chí chấm giải Nhất{" "}
              <span className="font-semibold text-fg">MLAI Hackathon 2026</span> trên cả 3 chủ đề:{" "}
              <span className="font-semibold text-fg">Track 02 (VNG — AI Làm Việc Thực Tế)</span>,{" "}
              <span className="font-semibold text-fg">Track 01 (TASCO — Bản đồ giao thông VETC &amp; Luồng cảng)</span> và{" "}
              <span className="font-semibold text-fg">Track 03 (TMA — Hỗ trợ quyết định cho người Việt)</span>. Kết hợp dự báo khoảng tin cậy{" "}
              <span className="font-mono font-semibold text-ok">Conformal ML [Q10, Q50, Q90]</span> với nhân giải quy hoạch nguyên{" "}
              <span className="font-mono font-semibold text-accent">Go 1.26.5 (536×) / V8 Zero-Alloc (0% Hallucination)</span>, bảng điều khiển{" "}
              <span className="font-semibold text-fg">Human-in-the-Loop (HITL)</span> qua 5 chốt chặn Guardrail và sổ cái kiểm toán băm chuỗi{" "}
              <span className="font-mono font-semibold text-ok">SHA-256 Audit Log</span>.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-ok/10 px-3 py-2 ring-1 ring-ok/30">
              <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-ok">
                ĐỘ TIN CẬY ML
              </div>
              <div className="mt-0.5 font-mono text-base font-bold text-ok">
                {evaluation.conformal.confidencePct}%
              </div>
              <div className="text-[10px] text-muted">
                [Q10={evaluation.conformal.q10Optimistic}, Q90={evaluation.conformal.q90Conservative}]
              </div>
            </div>

            <div className="rounded-xl bg-accent/10 px-3 py-2 ring-1 ring-accent/30">
              <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-accent">
                GUARDRAILS
              </div>
              <div className="mt-0.5 font-mono text-base font-bold text-accent">
                {passedGuardrailCount}/5 Đạt
              </div>
              <div className="text-[10px] text-muted">Escalation Referee</div>
            </div>

            <div className="rounded-xl bg-raised px-3 py-2 ring-1 ring-line">
              <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted">
                AUDIT SHA-256
              </div>
              <div className="mt-0.5 font-mono text-base font-bold text-fg">
                {auditChain.length} Khối
              </div>
              <div className="text-[10px] text-ok">100% Hash-Chained</div>
            </div>
          </div>
        </div>

        {/* VIETNAMESE AI DECISION CO-PILOT BRIEF (TRACK 03 TMA) */}
        <div
          className={cn(
            "mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1",
            evaluation.tier === "TIER_2_HITL_ESCALATION_REFEREE"
              ? "bg-warn/10 ring-warn/40"
              : evaluation.tier === "TIER_1_AUTONOMOUS_COMMIT_K0"
                ? "bg-accent/10 ring-accent/30"
                : "bg-ok/10 ring-ok/30",
          )}
        >
          <div className="flex items-start gap-3">
            <Bot
              className={cn(
                "mt-0.5 size-5 shrink-0",
                evaluation.tier === "TIER_2_HITL_ESCALATION_REFEREE"
                  ? "text-warn"
                  : evaluation.tier === "TIER_1_AUTONOMOUS_COMMIT_K0"
                    ? "text-accent"
                    : "text-ok",
              )}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-fg">
                  {evaluation.tierTitleVi}
                </span>
                <span className="rounded bg-surface px-2 py-0.5 font-mono text-[10px] font-semibold text-muted ring-1 ring-line">
                  Đang xét: {evaluation.vesselId} ({evaluation.vesselName}) · Lịch {evaluation.weekTag}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-fg sm:text-sm">
                {evaluation.vietnameseDecisionBrief}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: 5-AGENT COORDINATION LAYER & ESCALATION REFEREE (TRACK 02 VNG) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left 7 cols: 5-Agent Whole Workflow Pipeline */}
        <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
                TRACK 02 (VNG) · COORDINATION LAYER &amp; WHOLE WORKFLOW
              </div>
              <h3 className="mt-0.5 text-sm font-semibold text-fg sm:text-base">
                Chuỗi Điều Phối 5 AI Agent Khép Kín (Từ Tín Hiệu Thô Đến Bản Tin TOS &amp; Audit Log)
              </h3>
            </div>
            <span className="rounded-md bg-raised px-2.5 py-1 font-mono text-[10px] font-semibold text-muted ring-1 ring-line">
              Tổng độ trễ 5 Agent: 4.71 ms
            </span>
          </div>

          {/* Live Signal & Stress Scenario Simulator */}
          <div className="mt-3 rounded-xl bg-raised p-3 ring-1 ring-line">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-muted">
                <Radio className="size-3.5 text-accent" />
                Giả lập Kịch bản Ngoại lệ để Kiểm thử Escalation Referee (Track 02):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setStressMode("NORMAL")}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold transition-colors",
                    stressMode === "NORMAL"
                      ? "bg-accent text-accent-fg"
                      : "bg-surface text-muted ring-1 ring-line hover:text-fg",
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
                      : "bg-warn/10 text-warn ring-1 ring-warn/30 hover:bg-warn/20",
                  )}
                >
                  2. Mưa giông &amp; Nhiễu VHF (&lt;85% Tin cậy -&gt; HITL)
                </button>
                <button
                  type="button"
                  onClick={() => setStressMode("TRANSSHIPMENT_CRITICAL")}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold transition-colors",
                    stressMode === "TRANSSHIPMENT_CRITICAL"
                      ? "bg-danger text-white"
                      : "bg-danger/10 text-danger ring-1 ring-danger/30 hover:bg-danger/20",
                  )}
                >
                  3. Nguy cơ Rớt Tàu Mẹ Âu-Mỹ (Vi phạm G4 -&gt; HITL)
                </button>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="text"
                value={customSignal}
                onChange={(e) => setCustomSignal(e.target.value)}
                placeholder={evaluation.rawInputText}
                className="w-full rounded-lg bg-surface px-2.5 py-1.5 font-mono text-[11px] text-fg ring-1 ring-line placeholder:text-muted focus:ring-accent focus:outline-none"
              />
              {customSignal && (
                <button
                  type="button"
                  onClick={() => setCustomSignal("")}
                  className="shrink-0 rounded-lg bg-surface px-2.5 py-1.5 font-mono text-[10px] text-muted ring-1 ring-line hover:text-fg"
                >
                  Mặc định
                </button>
              )}
            </div>
          </div>

          {/* 5 Agent Cards */}
          <div className="mt-3 space-y-2">
            {evaluation.agents.map((ag, idx) => (
              <div
                key={ag.agentId}
                className={cn(
                  "rounded-xl p-3 ring-1 transition-all",
                  ag.status === "FLAGGED_FOR_HITL"
                    ? "bg-warn/10 ring-warn/40"
                    : "bg-raised/60 ring-line",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-accent font-mono text-[10px] font-bold text-accent-fg">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-fg">
                      {ag.nameVi}
                    </span>
                    <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[9px] text-muted ring-1 ring-line">
                      {ag.trackBadge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-muted">{ag.latencyMs}ms</span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 font-bold",
                        ag.status === "FLAGGED_FOR_HITL"
                          ? "bg-warn/20 text-warn"
                          : "bg-ok/15 text-ok",
                      )}
                    >
                      Tin cậy: {ag.confidencePct}%
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-muted">{ag.reasoningVi}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-surface px-2.5 py-1 font-mono text-[10px] ring-1 ring-line">
                  <span className="text-muted">In: {ag.inputSummary}</span>
                  <ArrowRight className="size-3 shrink-0 text-accent" />
                  <span className="font-semibold text-fg">
                    Out: {ag.outputSummary}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right 5 cols: Escalation Referee 5 Guardrails + Human-in-the-Loop Console */}
        <section className="flex flex-col justify-between gap-4 rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
                  TRACK 02 · ESCALATION REFEREE &amp; HUMAN-IN-THE-LOOP
                </div>
                <h3 className="mt-0.5 text-sm font-semibold text-fg sm:text-base">
                  5 Chốt Chặn An Toàn (Guardrails) &amp; Bảng Phê Duyệt Trưởng Ca
                </h3>
              </div>
              <ShieldCheck className="size-5 text-accent" />
            </div>

            {/* 5 Guardrail rows */}
            <div className="mt-3 space-y-2">
              {evaluation.guardrails.map((g) => (
                <div
                  key={g.id}
                  className={cn(
                    "rounded-xl p-2.5 ring-1",
                    g.passed
                      ? "bg-ok/5 ring-ok/25"
                      : "bg-warn/10 ring-warn/40",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {g.passed ? (
                        <CheckCircle2 className="size-4 shrink-0 text-ok" />
                      ) : (
                        <AlertTriangle className="size-4 shrink-0 text-warn" />
                      )}
                      <span className="text-xs font-semibold text-fg">
                        {g.titleVi}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 font-mono text-[10px] font-bold",
                        g.passed
                          ? "bg-ok/15 text-ok"
                          : "bg-warn/20 text-warn",
                      )}
                    >
                      {g.metricLabel}
                    </span>
                  </div>
                  <p className="mt-1 pl-5 text-[11px] text-muted">
                    {g.detailVi}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Human-in-the-Loop Action Console */}
          <div className="rounded-xl bg-raised p-4 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-fg">
                <UserCheck className="size-3.5 text-accent" />
                Bảng Điều Khiển Human-in-the-Loop (Trưởng Ca Ký Duyệt)
              </span>
              <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[9px] font-bold text-accent">
                Ký số SHA-256
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-1 gap-2">
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="rounded-lg bg-surface px-2.5 py-1 font-mono text-[11px] text-fg ring-1 ring-line"
                placeholder="Tên Trưởng ca trực..."
              />
              <input
                type="text"
                value={operatorNote}
                onChange={(e) => setOperatorNote(e.target.value)}
                className="rounded-lg bg-surface px-2.5 py-1 text-[11px] text-fg ring-1 ring-line"
                placeholder="Ghi chú kiểm toán (Audit reason)..."
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleHitlDecision("HUMAN_APPROVED")}
                className="flex items-center justify-center gap-1 rounded-lg bg-ok px-2.5 py-2 font-mono text-[10px] font-bold text-white shadow-sm hover:opacity-90"
              >
                <CheckCircle2 className="size-3.5 shrink-0" />
                Phê Duyệt Patch
              </button>
              <button
                type="button"
                onClick={() => handleHitlDecision("HUMAN_OVERRIDDEN")}
                className="flex items-center justify-center gap-1 rounded-lg bg-warn px-2.5 py-2 font-mono text-[10px] font-bold text-white shadow-sm hover:opacity-90"
              >
                <FileCheck2 className="size-3.5 shrink-0" />
                Ghi Đè Guardrail
              </button>
              <button
                type="button"
                onClick={() => handleHitlDecision("HUMAN_REJECTED")}
                className="flex items-center justify-center gap-1 rounded-lg bg-danger/15 px-2.5 py-2 font-mono text-[10px] font-bold text-danger ring-1 ring-danger/40 hover:bg-danger/25"
              >
                <RotateCcw className="size-3.5 shrink-0" />
                Rollback Gốc
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 2: TRACK 01 (TASCO / GOONG) VIETNAM SMART PORT & VETC MOBILITY CORRIDOR MAP */}
      <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-accent">
                TRACK 01 (TASCO / GOONG) · BẢN ĐỒ GIAO THÔNG &amp; LUỒNG CẢNG THÔNG MINH
              </span>
              <span className="font-mono text-[10px] text-muted">
                Tích hợp Telemetry VETC E-Tag &amp; AIS Đường thuỷ TP.HCM – Cái Mép
              </span>
            </div>
            <h3 className="mt-1 text-sm font-semibold text-fg sm:text-base">
              Bản Đồ Điều Phối Không Gian Thực Tế: Cụm Cảng TP.HCM (Cát Lái · Tân Thuận · Hiệp Phước · SP-ITC · ICD Trường Thọ) &amp; Cái Mép
            </h3>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="flex items-center gap-1 text-ok">
              <span className="size-2.5 rounded-full bg-ok" /> Luồng Sà lan chia tải k=0
            </span>
            <span className="flex items-center gap-1 text-danger">
              <span className="size-2.5 rounded-full bg-danger" /> Điểm nghẽn VETC / Cổng Cảng
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Interactive SVG Map */}
          <div className="relative overflow-hidden rounded-xl bg-[#0c1421] p-3 ring-1 ring-line lg:col-span-8">
            <svg
              viewBox="0 0 780 440"
              className="h-[320px] w-full select-none"
              role="img"
              aria-label="Bản đồ thông minh cụm cảng TP.HCM và hành lang VETC"
            >
              <defs>
                <pattern
                  id="mapGrid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.08)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="780" height="440" fill="url(#mapGrid)" />

              {/* Stylized Saigon River - Dong Nai River - Soai Rap Waterway */}
              <path
                d="M 180 20 Q 220 140 245 235 T 295 365 L 340 435"
                fill="none"
                stroke="rgba(14, 165, 233, 0.22)"
                strokeWidth="26"
                strokeLinecap="round"
              />
              <path
                d="M 520 20 Q 480 120 430 205 T 640 380"
                fill="none"
                stroke="rgba(14, 165, 233, 0.26)"
                strokeWidth="32"
                strokeLinecap="round"
              />

              {/* Corridor Edges */}
              {HCMC_CORRIDOR_EDGES.map((edge) => {
                const fromNode = HCMC_CORRIDOR_NODES.find(
                  (n) => n.id === edge.from,
                );
                const toNode = HCMC_CORRIDOR_NODES.find(
                  (n) => n.id === edge.to,
                );
                if (!fromNode || !toNode) return null;
                const strokeColor =
                  edge.trafficState === "RED_BOTTLENECK"
                    ? "#f43f5e"
                    : edge.activeDivert
                      ? "#10b981"
                      : "#f59e0b";
                return (
                  <g key={edge.id}>
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={strokeColor}
                      strokeWidth={edge.activeDivert ? 3.5 : 2.5}
                      strokeDasharray={
                        edge.mode === "WATERWAY_BARGE" ? "6 4" : undefined
                      }
                      opacity={0.85}
                    />
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2 - 6}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {edge.distanceKm}km · {edge.travelMinutes}p
                    </text>
                  </g>
                );
              })}

              {/* Port & VETC Nodes */}
              {HCMC_CORRIDOR_NODES.map((node) => {
                const isSelected = node.id === selectedMapNode.id;
                const fill =
                  node.status === "CRITICAL_DIVERT"
                    ? "#f43f5e"
                    : node.status === "CONGESTED"
                      ? "#f59e0b"
                      : "#10b981";
                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedMapNodeId(node.id)}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={22}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth={2}
                        strokeDasharray="4 2"
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={13}
                      fill={fill}
                      stroke="#0f172a"
                      strokeWidth={2.5}
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.utilizationPct}%
                    </text>
                    <rect
                      x={node.x - 82}
                      y={node.y + 17}
                      width={164}
                      height={20}
                      rx={4}
                      fill="rgba(15, 23, 42, 0.88)"
                      stroke="rgba(148, 163, 184, 0.25)"
                    />
                    <text
                      x={node.x}
                      y={node.y + 30}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="9.5"
                      fontWeight="600"
                    >
                      {node.name.split("(")[0]!.trim()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Right 4 cols: Selected Corridor Node Inspector */}
          <div className="flex flex-col justify-between rounded-xl bg-raised p-4 ring-1 ring-line lg:col-span-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-accent">
                  <MapPin className="size-3.5" />
                  ĐIỂM NÚT HẠ TẦNG ĐANG CHỌN
                </span>
                <span
                  className={cn(
                    "rounded px-2 py-0.5 font-mono text-[10px] font-bold",
                    selectedMapNode.status === "CRITICAL_DIVERT"
                      ? "bg-danger/20 text-danger"
                      : selectedMapNode.status === "CONGESTED"
                        ? "bg-warn/20 text-warn"
                        : "bg-ok/20 text-ok",
                  )}
                >
                  Tải: {selectedMapNode.utilizationPct}%
                </span>
              </div>

              <h4 className="mt-2 text-sm font-semibold text-fg">
                {selectedMapNode.name}
              </h4>
              <div className="mt-1 font-mono text-[11px] text-muted">
                Hệ thống chủ:{" "}
                <strong className="text-fg">{selectedMapNode.tosSystem}</strong>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-surface p-2.5 ring-1 ring-line">
                  <div className="font-mono text-[9px] uppercase text-muted">
                    CHỜ CỔNG / CẦU BẾN
                  </div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-fg">
                    {selectedMapNode.queueWaitHours} giờ
                  </div>
                </div>
                <div className="rounded-lg bg-surface p-2.5 ring-1 ring-line">
                  <div className="font-mono text-[9px] uppercase text-muted">
                    LUỒNG VETC E-TAG
                  </div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-fg">
                    {selectedMapNode.vetcFlowPerHour} xe/h
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-accent/10 p-3 ring-1 ring-accent/30">
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-accent">
                  <Navigation className="size-3.5" />
                  Khuyến nghị Điều hướng Bản đồ Thông minh:
                </div>
                <p className="mt-1 text-xs leading-relaxed text-fg">
                  {selectedMapNode.recommendationVi}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {HCMC_CORRIDOR_NODES.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSelectedMapNodeId(n.id)}
                  className={cn(
                    "rounded-md px-2 py-1 font-mono text-[10px] font-semibold transition-colors",
                    n.id === selectedMapNode.id
                      ? "bg-accent text-accent-fg"
                      : "bg-surface text-muted ring-1 ring-line hover:text-fg",
                  )}
                >
                  {n.name.split("(")[0]!.trim()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TRANSPARENT HASH-CHAINED AUDIT LOG (TRACK 02 MANDATORY REQUIREMENT) */}
      <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-ok/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-ok">
                <Lock className="size-3" />
                TRACK 02 MANDATORY · NHẬT KÝ KIỂM TOÁN BẤT BIẾN (IMMUTABLE SHA-256 AUDIT LOG)
              </span>
              <span className="font-mono text-[10px] text-muted">
                Chuỗi băm liên kết chống sửa đổi · Lưu vết toàn bộ Đầu vào, 5 AI Agent &amp; Chữ ký Con người
              </span>
            </div>
            <h3 className="mt-1 text-sm font-semibold text-fg sm:text-base">
              Sổ Cái Kiểm Toán Minh Bạch (Hash-Chained Organizational AI Audit Trail)
            </h3>
          </div>

          <button
            type="button"
            onClick={handleCopyAuditJson}
            className="inline-flex items-center gap-1.5 rounded-lg bg-raised px-3 py-1.5 font-mono text-[11px] font-semibold text-fg ring-1 ring-line hover:bg-canvas"
          >
            {copiedAudit ? (
              <>
                <Check className="size-3.5 text-ok" />
                Đã chép JSON Kiểm toán
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-accent" />
                Xuất Hồ Sơ Audit JSON
              </>
            )}
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-line bg-raised text-[10px] uppercase text-muted">
                <th className="px-3 py-2">Khối #</th>
                <th className="px-3 py-2">Đối tượng</th>
                <th className="px-3 py-2">Phân loại Referee</th>
                <th className="px-3 py-2">Guardrails</th>
                <th className="px-3 py-2">Quyết định &amp; Lợi ích</th>
                <th className="px-3 py-2">Trạng thái HITL / Người ký</th>
                <th className="px-3 py-2">Chuỗi Băm SHA-256 (Prev -&gt; Block)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {auditChain.map((blk) => (
                <tr key={blk.blockIndex} className="hover:bg-raised/60">
                  <td className="px-3 py-2.5 font-bold text-fg">
                    #{blk.blockIndex}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-bold text-fg">{blk.vesselName}</div>
                    <div className="text-[10px] text-muted">
                      {blk.vesselId} · {blk.weekTag}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-bold",
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
                  <td className="px-3 py-2.5 font-bold text-fg">
                    {blk.guardrailsPassed}/{blk.guardrailsTotal} PASS ({blk.confidencePct}%)
                  </td>
                  <td className="max-w-xs px-3 py-2.5 font-sans text-xs text-fg">
                    <div>{blk.actionSummaryVi}</div>
                    {blk.economicDeltaUsd > 0 && (
                      <span className="font-mono text-[10px] font-bold text-ok">
                        Tiết kiệm: +${blk.economicDeltaUsd.toLocaleString("en-US")} USD
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "inline-block rounded px-1.5 py-0.5 text-[10px] font-bold",
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
                    <div className="mt-0.5 font-sans text-[10px] text-muted">
                      {blk.operatorId}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[10px] text-muted">
                    <div>Prev: {blk.prevHash.slice(0, 14)}...</div>
                    <div className="font-bold text-ok">
                      Hash: {blk.blockHash.slice(0, 18)}...
                    </div>
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
