import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Cpu,
  Lock,
  Navigation,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
} from "lucide-react";
import {
  HCMC_CORRIDOR_EDGES,
  HCMC_CORRIDOR_NODES,
  createHitlSignedAuditBlock,
  runOrganizationalAgentPipeline,
  type AuditLogBlock,
  type GuardrailCheck,
} from "@/lib/minmove/mlai-agents.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

export function MlaiHackathonCommandCenter() {
  const yard = useBoardStore((s) => s.yard);
  const event = useBoardStore((s) => s.event);
  const result = useBoardStore((s) => s.result);
  const selectedId = useBoardStore((s) => s.selectedId);

  const [stressMode, setStressMode] = useState<
    "NORMAL" | "LOW_CONFIDENCE_STORM" | "TRANSSHIPMENT_CRITICAL"
  >("NORMAL");
  const [selectedPortId, setSelectedPortId] = useState<string>("VNCLI");
  const [divertedPorts, setDivertedPorts] = useState<Record<string, number>>({});
  const [selectedAgentIdx, setSelectedAgentIdx] = useState<number>(2);
  const [overriddenGuards, setOverriddenGuards] = useState<Record<string, boolean>>({});
  const [operatorName, setOperatorName] = useState("Nguyễn Minh Quân · Senior Dispatcher");
  const [customAuditChain, setCustomAuditChain] = useState<AuditLogBlock[]>([]);
  const [copiedAudit, setCopiedAudit] = useState(false);

  const hour = yard.timeUnit === "hour";
  const unit = hour ? "h" : "min";
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
  const requiresHumanSignOff = pipeline.tier === "TIER_2_HITL_ESCALATION_REFEREE";

  const handleDivert = () => {
    setDivertedPorts((prev) => ({
      ...prev,
      VNCLI: (prev.VNCLI ?? 0) - 18,
      VNICD: (prev.VNICD ?? 0) - 12,
      VNHPH: (prev.VNHPH ?? 0) + 14,
      VNITC: (prev.VNITC ?? 0) + 10,
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
      {/* Top Interactive Scenario & Quick Control Bar (Refined Light Surface matching attachments/image.png) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 shadow-card ring-1 ring-line">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 py-1 font-mono text-xs font-semibold text-accent ring-1 ring-accent/25">
            <Sparkles className="size-3.5" />
            AI Agent &amp; Guardrails
          </span>
          <span
            className={cn(
              "rounded-xl px-2.5 py-1 font-mono text-xs font-semibold ring-1",
              requiresHumanSignOff
                ? "bg-warn/10 text-warn ring-warn/30"
                : "bg-ok/10 text-ok ring-ok/25",
            )}
          >
            {pipeline.tier}
          </span>
          <span className="font-mono text-xs text-muted">
            {pipeline.conformal.q50Median}
            {unit} ([Q10={pipeline.conformal.q10Optimistic}
            {unit}, Q90={pipeline.conformal.q90Conservative}
            {unit}]) · Conf {pipeline.conformal.confidencePct}%
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "NORMAL", label: "Auto k=0 (Standard)" },
              { id: "LOW_CONFIDENCE_STORM", label: "Storm (<85% Conf → HITL)" },
              { id: "TRANSSHIPMENT_CRITICAL", label: "Cut-off Risk (G4 → HITL)" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setStressMode(m.id)}
              className={cn(
                "h-8 rounded-xl px-3 text-xs font-medium ring-1 transition",
                stressMode === m.id
                  ? "bg-accent text-accent-fg ring-accent shadow-xs"
                  : "bg-raised/70 text-muted ring-line hover:text-fg",
              )}
            >
              {m.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => useBoardStore.getState().setSetupOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-raised px-3 text-xs font-medium text-fg ring-1 ring-line hover:bg-accent/10 hover:text-accent"
          >
            <SlidersHorizontal className="size-3.5 text-accent" />
            Setup
          </button>
        </div>
      </div>

      {/* Main 12-Col Interactive Grid */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* LEFT 7 COLS: Interactive Port & Corridor Node Studio */}
        <div className="flex flex-col justify-between rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="size-4 text-accent" />
              <h3 className="text-sm font-semibold text-fg">HCMC Port &amp; VETC Corridor Network</h3>
              <span className="rounded-lg bg-raised px-2 py-0.5 font-mono text-[11px] text-muted ring-1 ring-line">
                Avg Load: {corridorDensityPct}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 rounded-xl text-xs"
                onClick={handleDivert}
              >
                <Sparkles className="size-3.5 text-accent" />
                Divert Load (k=0)
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 rounded-xl text-xs"
                onClick={() => setDivertedPorts({})}
              >
                <RefreshCw className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Interactive 6-Port Node Grid (Click any port card to inspect & adjust live load) */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {portLoads.map((node) => {
              const active = node.id === selectedPortId;
              const high = node.utilizationPct >= 85;
              const med = node.utilizationPct >= 70 && node.utilizationPct < 85;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedPortId(node.id)}
                  className={cn(
                    "flex flex-col justify-between rounded-xl p-3 text-left ring-1 transition",
                    active
                      ? "bg-accent/10 ring-2 ring-accent"
                      : "bg-raised/50 ring-line hover:bg-raised",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-muted">{node.id}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-mono text-[11px] font-bold",
                        high
                          ? "bg-bad/15 text-bad"
                          : med
                            ? "bg-warn/15 text-warn"
                            : "bg-ok/15 text-ok",
                      )}
                    >
                      {node.utilizationPct}%
                    </span>
                  </div>
                  <p className="mt-1.5 truncate text-xs font-semibold text-fg">{node.name}</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line/60">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        high ? "bg-bad" : med ? "bg-warn" : "bg-ok",
                      )}
                      style={{ width: `${node.utilizationPct}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-muted">
                    <span>Wait {node.queueWaitHours}h</span>
                    <span>{node.vetcFlowPerHour}/h</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Selected Port Live Control Strip */}
          <div className="mt-3 rounded-xl bg-raised/60 p-3 ring-1 ring-line">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-fg">
                  {activePort.name}{" "}
                  <span className="font-mono text-muted">({activePort.tosSystem})</span>
                </p>
                <p className="font-mono text-[11px] text-muted">
                  Wait: {activePort.queueWaitHours}h · VETC: {activePort.vetcFlowPerHour} vehicles/h
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted">Simulate Load:</span>
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
                  className="w-28 accent-accent"
                  aria-label="Simulate port load delta"
                />
                <span className="w-10 text-right font-mono text-xs font-bold text-accent">
                  {activePort.utilizationPct}%
                </span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 border-t border-line/60 pt-2">
              {HCMC_CORRIDOR_EDGES.map((edge) => (
                <span
                  key={edge.id}
                  className="inline-flex items-center gap-1 rounded-lg bg-surface px-2 py-0.5 font-mono text-[10px] text-muted ring-1 ring-line"
                >
                  <span className="font-semibold text-fg">{edge.from}</span>
                  <ArrowRight className="size-2.5 text-accent" />
                  <span className="font-semibold text-fg">{edge.to}</span>
                  <span>
                    ({edge.distanceKm}km · {edge.travelMinutes}m)
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: Conformal Quantile Visual Bar + Interactive Guardrails + HITL Sign-Off */}
        <div className="flex flex-col justify-between gap-3 lg:col-span-5">
          {/* Card 1: Conformal ML Quantile Band + 5 Interactive Guardrails */}
          <div className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-fg">
                <Activity className="size-4 text-accent" />
                Conformal ETA Band &amp; 5 Guardrails
              </span>
              <span className="rounded-lg bg-ok/10 px-2 py-0.5 font-mono text-xs font-semibold text-ok">
                {pipeline.guardrails.filter((g) => g.passed || overriddenGuards[g.id]).length}/5 PASS
              </span>
            </div>

            {/* Clean Visual Quantile Range Bar */}
            <div className="mt-3 rounded-xl bg-raised/60 p-3 ring-1 ring-line">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-muted">
                  Q10:{" "}
                  <strong className="text-fg">
                    {pipeline.conformal.q10Optimistic}
                    {unit}
                  </strong>
                </span>
                <span className="text-accent">
                  Q50:{" "}
                  <strong>
                    {pipeline.conformal.q50Median}
                    {unit}
                  </strong>
                </span>
                <span className="text-ok">
                  Q90:{" "}
                  <strong>
                    {pipeline.conformal.q90Conservative}
                    {unit}
                  </strong>
                </span>
                <span className="text-muted">σ = {pipeline.conformal.epistemicSigma}</span>
              </div>
              <div className="relative mt-2 h-2.5 w-full rounded-full bg-line/60">
                <div className="absolute inset-y-0 left-[18%] right-[24%] rounded-full bg-accent/25 ring-1 ring-accent" />
                <div className="absolute top-1/2 left-[45%] size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-surface" />
              </div>
            </div>

            {/* 5 Interactive Guardrail Pills (Click to toggle override) */}
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {pipeline.guardrails.map((g: GuardrailCheck) => {
                const effectivePass = g.passed
                  ? !overriddenGuards[g.id]
                  : Boolean(overriddenGuards[g.id]);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setOverriddenGuards((prev) => ({ ...prev, [g.id]: !prev[g.id] }))}
                    title={`${g.titleEn}: ${g.metricLabel} (Click to toggle test state)`}
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

          {/* Card 2: Interactive HITL Sign-Off Pad */}
          <div className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-fg">
                <UserCheck className="size-4 text-accent" />
                Human-in-the-Loop Sign-Off
              </span>
              <span className="font-mono text-xs font-bold text-ok">
                +${pipeline.netEconomicBenefitUsd.toLocaleString("en-US")}
              </span>
            </div>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="mt-2.5 h-8 w-full rounded-xl bg-raised/70 px-3 font-mono text-xs text-fg ring-1 ring-line focus:ring-accent focus:outline-none"
              aria-label="Operator Sign-off Name"
            />
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Button
                type="button"
                size="sm"
                className="h-8 flex-1 rounded-xl bg-ok text-xs text-white hover:bg-ok/90"
                onClick={() => handleHitlAction("HUMAN_APPROVED")}
              >
                <ShieldCheck className="size-3.5" />
                Approve &amp; Commit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 rounded-xl text-xs"
                onClick={() => handleHitlAction("HUMAN_OVERRIDDEN")}
              >
                <ShieldAlert className="size-3.5 text-warn" />
                Override
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 rounded-xl text-xs"
                onClick={() => handleHitlAction("HUMAN_REJECTED")}
              >
                <RefreshCw className="size-3.5" />
                Rollback
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 5-Agent Stepper (Click any Agent step to inspect live Input/Output vector) */}
      <div className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="size-4 text-accent" />
            <h3 className="text-sm font-semibold text-fg">
              SƠ ĐỒ MẠCH ĐIỀU PHỐI 5 AI AGENT ({totalPipelineMs}ms)
            </h3>
          </div>
          <span className="font-mono text-xs font-semibold text-ok">
            {orig?.dockId ?? "B0"}@{orig?.startMin ?? 4}
            {unit} → {live?.dockId ?? "B5"}@{live?.startMin ?? 5}
            {unit} · k={result?.kUsed ?? 0}
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
                  "flex flex-col justify-between rounded-xl p-3 text-left ring-1 transition",
                  active
                    ? "bg-accent/10 ring-2 ring-accent"
                    : "bg-raised/50 ring-line hover:bg-raised",
                )}
              >
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="font-bold text-accent">#{idx + 1}</span>
                  <span className="text-ok">
                    {s.confidencePct}% · {s.latencyMs}ms
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-1 text-xs font-semibold text-fg">{s.nameVi}</p>
                <p className="mt-1 truncate font-mono text-[10px] text-muted">{s.outputSummary}</p>
              </button>
            );
          })}
        </div>

        {/* Selected Agent Step Inspector Bar */}
        <div className="mt-3 grid gap-2 rounded-xl bg-raised/60 p-3 font-mono text-xs ring-1 ring-line sm:grid-cols-3">
          <div>
            <span className="text-[10px] font-semibold uppercase text-faint">Selected Agent</span>
            <p className="mt-0.5 font-sans text-xs font-semibold text-fg">
              #{selectedAgentIdx + 1} · {activeStep.nameVi} ({activeStep.roleEn})
            </p>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-faint">Input Telemetry</span>
            <p className="mt-0.5 truncate text-muted">{activeStep.inputSummary}</p>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-faint">Verified Output</span>
            <p className="mt-0.5 truncate font-semibold text-fg">{activeStep.outputSummary}</p>
          </div>
        </div>
      </div>

      {/* Compact SHA-256 Hash-Chained Audit Ledger */}
      <div className="overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-line">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Lock className="size-3.5 text-ok" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              SHA-256 Audit Ledger ({fullAuditChain.length} Blocks)
            </h3>
          </div>
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
