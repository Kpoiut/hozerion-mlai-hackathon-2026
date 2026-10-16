import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyYardContestedCalls,
  computeCraneDurationHours,
  solveBacapRecovery,
} from "./bacap.ts";
import {
  SHIPMENT_DOCUMENT_CASES,
  computeIso6346CheckDigit,
  reconcileShipmentDocuments,
  validateIso6346,
} from "./documents.ts";
import {
  HCMC_INCIDENTS,
  HCMC_TERMINALS,
  solveInterPortFederation,
} from "./federation.ts";
import {
  SEED_BAY_CONTAINERS,
  calculateContainerBilling,
  evaluateGateTransaction,
  packCfsCargo3D,
  recommendIncomingSlot,
  solveBayRetrieval,
} from "./micro-tos.ts";
import { solveHinterlandExceptions } from "./dock-exceptions.ts";
import { blockedExampleYard, publishedYard } from "./published-week.ts";

describe("Pillar 1 — HCMC Inter-Port & Cross-TOS Federation (federation.ts)", () => {
  it("models all 5 real HCMC terminals and their exact TOS lineages", () => {
    assert.equal(HCMC_TERMINALS.length, 5);
    const catlai = HCMC_TERMINALS.find((t) => t.id === "VNSGN-CATLAI");
    const tanthuan = HCMC_TERMINALS.find((t) => t.id === "VNSGN-TANTHUAN");
    const hiepphuoc = HCMC_TERMINALS.find((t) => t.id === "VNSGN-HIEPPHUOC");
    const spitc = HCMC_TERMINALS.find((t) => t.id === "VNSGN-SPITC");
    assert.ok(catlai && tanthuan && hiepphuoc && spitc);
    assert.match(catlai.tosHistory, /TOPX.*ePort.*TOPOVN/);
    assert.match(tanthuan.tosHistory, /CATOS.*SGP-TOS/);
    assert.match(hiepphuoc.tosHistory, /CATOS.*SGP-TOS/);
    assert.match(spitc.tosHistory, /VTOS/);
  });

  it("solves cross-port federation for all 3 HCMC incidents with positive hours saved and valid EDIFACT/VNACCS packets", () => {
    for (const inc of HCMC_INCIDENTS) {
      const plan = solveInterPortFederation(inc.id);
      assert.ok(plan.recommendedOption.hoursSavedVsOrigin > 0, inc.id);
      assert.ok(plan.recommendedOption.netSavingsUsd > 0, inc.id);
      assert.equal(plan.recommendedOption.draftCompliant, true, inc.id);
      assert.match(plan.packet.edifactPayload, /UNH\+1\+COPARN:D:95B:UN:SMDG20'/);
      assert.match(plan.packet.vnaccsOlaXml, /<VNACCS_VASSCM_OLA/);
      assert.equal(plan.packet.sha256Digest.length, 16);
    }
  });
});

describe("Pillar 2 — Affordable Micro-TOS: Gate, 3D Yard Rehandles, Customs & Billing (micro-tos.ts)", () => {
  it("computes exact min-rehandle moves to retrieve a bottom-tier container without secondary inversions", () => {
    // MSKU4029100 is at Row 0, Tier 0 under 2 blocking containers (Tier 1 & Tier 2)
    const plan = solveBayRetrieval("MSKU4029100", SEED_BAY_CONTAINERS);
    assert.equal(plan.targetContainer.containerNo, "MSKU4029100");
    assert.equal(plan.rehandleCount, 2);
    assert.equal(plan.steps.length, 3); // 2 relocations + 1 target retrieval
    assert.equal(plan.steps[2]?.action, "RETRIEVE_TARGET");
    assert.equal(plan.steps[2]?.toRow, "TRUCK_CHASSIS");
    // Verify target slot is now empty in finalGrid
    assert.equal(plan.finalGrid[0]?.[0], null);
  });

  it("recommends a non-inverting, reefer-compatible yard slot for incoming containers", () => {
    const recs = recommendIncomingSlot({ cargo: "reefer", weightTon: 18, pickupOrder: 1 });
    assert.ok(recs.length > 0);
    assert.equal(recs[0]?.reeferCompatible, true);
    assert.equal(recs[0]?.causesBlockingInversion, false);
  });

  it("calculates progressive Vietnamese port storage, reefer electricity, Lo-Lo, and 8% VAT", () => {
    const c = SEED_BAY_CONTAINERS.find((x) => x.containerNo === "MSKU4029100")!;
    const inv = calculateContainerBilling(c, 2);
    assert.equal(inv.freeDays, 2); // Reefer has 2 free days
    assert.equal(inv.chargeableDays, 2); // 4 dwell - 2 free = 2 days
    assert.equal(inv.rehandleMovesBilled, 2);
    assert.equal(inv.vatRatePct, 8);
    assert.equal(inv.totalVnd, inv.subtotalVnd + inv.vatVnd);
    assert.ok(inv.totalVnd > 5_000_000);
  });

  it("blocks gate-out when a container has a YELLOW_HOLD customs status and releases when cleared", () => {
    const heldCont = SEED_BAY_CONTAINERS.find((x) => x.customsStatus === "YELLOW_HOLD")!;
    const blockedEir = evaluateGateTransaction(heldCont, 1, false);
    assert.equal(blockedEir.status, "HELD_AT_GATE");
    assert.ok(blockedEir.holdReasons.length > 0);

    const releasedEir = evaluateGateTransaction(heldCont, 1, true);
    assert.equal(releasedEir.status, "ISSUED_GREEN");
    assert.equal(releasedEir.holdReasons.length, 0);
  });

  it("packs LCL CFS cargo in 3D using pack3d engine", () => {
    const packed = packCfsCargo3D();
    assert.equal(packed.poses.length, packed.items.length);
    assert.equal(packed.binsUsed, 1);
    assert.ok(packed.utilizationPct > 25);
  });
});

describe("Pillar 3 — Canonical Documents & ISO 6346 Paper-vs-EDI Reconciliation (documents.ts)", () => {
  it("computes and validates exact ISO 6346 modulo-11 check digits", () => {
    const check = computeIso6346CheckDigit("MSKU402910");
    assert.equal(check, 0);
    const valid = validateIso6346("MSKU4029100");
    assert.equal(valid.valid, true);
    const invalid = validateIso6346("MSKU4029107");
    assert.equal(invalid.valid, false);
    assert.equal(invalid.expectedCheckDigit, 0);
    assert.equal(invalid.correctedContainerNo, "MSKU4029100");
  });

  it("detects paper ISO 6346 error, seal mismatch, VGM deviation, customs hold, and reconciles to canonical EDIFACT/VASSCM", () => {
    const case1 = SHIPMENT_DOCUMENT_CASES[0]!;
    const raw1 = reconcileShipmentDocuments(case1, false);
    assert.equal(raw1.gateReleaseStatus, "BLOCKED_DISCREPANCY");
    assert.ok(raw1.discrepancies.some((d) => d.code === "ISO6346_CHECK_DIGIT_ERROR"));
    assert.ok(raw1.discrepancies.some((d) => d.code === "SEAL_MISMATCH"));
    assert.ok(raw1.discrepancies.some((d) => d.code === "EDO_DEMURRAGE_EXPIRED"));

    const fixed1 = reconcileShipmentDocuments(case1, true);
    assert.equal(fixed1.gateReleaseStatus, "AUTO_RECONCILED");
    assert.equal(fixed1.canonicalIds.canonicalContainerNo, "MSKU4029100");
    assert.match(fixed1.edifactCoreor, /UNH\+1\+COREOR:D:95B:UN:SMDG20'/);
    assert.match(fixed1.edifactCodeco, /UNH\+1\+CODECO:D:95B:UN:SMDG20'/);
    assert.match(fixed1.vnaccsVascmXml, /ALLOW_GATE_OUT_PAPERLESS/);

    const case2 = SHIPMENT_DOCUMENT_CASES[1]!;
    const raw2 = reconcileShipmentDocuments(case2, false);
    assert.ok(raw2.discrepancies.some((d) => d.code === "CUSTOMS_VASSCM_HOLD"));
    assert.ok(raw2.discrepancies.some((d) => d.code === "SOLAS_VGM_WEIGHT_DISCREPANCY"));
  });
});

describe("Pillar 4 — Coupled Hinterland Dock Exceptions & Bilateral Slot-Swap (dock-exceptions.ts)", () => {
  it("eliminates vessel cut-off misses and customs door blocking via bilateral swap and RTG pre-marshalling", () => {
    const res = solveHinterlandExceptions();
    const fifo = res.strategies.find((s) => s.id === "fifo-naive")!;
    const saas = res.strategies.find((s) => s.id === "saas-single")!;
    const coupled = res.strategies.find((s) => s.id === "coupled-swap")!;

    assert.ok(fifo.cutoffMisses > 0);
    assert.ok(saas.cutoffMisses > 0);
    assert.equal(coupled.cutoffMisses, 0);
    assert.equal(coupled.customsDoorBlockedMin, 0);
    assert.ok(coupled.swapsExecuted >= 2);
    assert.ok(coupled.craneWaitSavedMin > 0);
    assert.ok(coupled.totalWaitMin < fifo.totalWaitMin);
  });
});

describe("Pillar 5 — BACAP-R Joint Berth + Quay Crane + Transshipment + TOS Adapter (bacap.ts)", () => {
  it("compresses vessel handling time sublinearly with additional STS cranes", () => {
    const d2 = computeCraneDurationHours(20, 2, 2, 0.9);
    const d4 = computeCraneDurationHours(20, 2, 4, 0.9);
    assert.equal(d2, 20);
    assert.ok(d4 < 20 && d4 >= 10);
  });

  it("solves BACAP-R on Barcelona week 47 and week 2 with valid crane rail assignment and 4 TOS adapters", () => {
    const yard47 = blockedExampleYard();
    const rec47 = solveBacapRecovery(yard47, { truckId: "S8", newEtaMin: 5, source: "manual" }, 2);
    assert.equal(rec47.craneRailConflicts, 0);
    assert.ok(rec47.peakCranesUsed <= rec47.totalCranesAvailable);
    assert.equal(rec47.modes.length, 3);
    assert.match(rec47.tosPayloads.edifactBerman, /BERMAN:D:95B/);
    assert.match(rec47.tosPayloads.navisN4Xml, /<snx:vessel-visit/);
    assert.match(rec47.tosPayloads.sgpVtosJson, /SGP-TOS\.VTOS/);
    assert.match(rec47.tosPayloads.topovnBatch, /sp_TOPOVN_UpdateVesselBerthPlan/);

    const yard2 = publishedYard("bcn-24B-2");
    const classes = classifyYardContestedCalls(yard2, 3);
    assert.equal(classes.length, 12);
    assert.ok(classes.some((c) => c.category === "SLACK_TRIVIAL"));
  });
});

describe("Pillar 6 — Enterprise Competitive Wedge & Continuous Quality Audit (enterprise-audit.ts)", async () => {
  const { runEnterpriseQualityAudit } = await import("./enterprise-audit.ts");

  it("passes all 10 live enterprise quality gates, mathematical invariants, and dynamic what-if overrides", () => {
    const report = runEnterpriseQualityAudit();
    assert.equal(report.allPassed, true);
    assert.equal(report.wedges.length, 5);
    assert.equal(report.systemInvariants.length, 5);
    assert.ok(report.systemInvariants.every((inv) => inv.passed));

    const customFed = solveInterPortFederation("INC-TANTHUAN-SGP", {
      originBlockedHours: 24,
      totalTeu: 800,
      draftMeters: 11.3,
    });
    assert.equal(customFed.originTerminal.id, "VNSGN-TANTHUAN");
    assert.equal(customFed.options[0]!.draftCompliant, false);
    assert.ok(customFed.recommendedOption.draftCompliant);
    assert.ok(customFed.recommendedOption.netSavingsUsd > 25000);
  });
});

describe("Pillar 7 — Universal Non-Invasive Sidecar Plugin & Empirical Language Benchmark (universal-plugin.ts)", async () => {
  const {
    UNIVERSAL_HOST_PROFILES,
    runEmpiricalLanguageBenchmark,
    runUniversalSidecarPlugin,
  } = await import("./universal-plugin.ts");

  it("supports all 4 universal logistics domains with Zero-Touch NO_OP on uncontested calls and Minimal Diff Patch (k=0) on contested calls", () => {
    assert.equal(UNIVERSAL_HOST_PROFILES.length, 4);

    // 1. Contested call on Maritime Quay (S8 +1h on Week 47): saves 193h with k=0 other vessels moved
    const maritimeContested = runUniversalSidecarPlugin("host-maritime-quay", 1, "S8");
    assert.equal(maritimeContested.pluginDecision, "APPLY_MINIMAL_DIFF_PATCH");
    assert.equal(maritimeContested.waitSaved, 193);
    assert.equal(maritimeContested.otherJobsMoved, 0);
    assert.equal(maritimeContested.hostValuePreservationPct, 100);
    assert.ok(maritimeContested.netEconomicGainUsd > 250_000);
    assert.match(maritimeContested.rfc7396MergePatchJson, /APPLY_MINIMAL_DIFF_PATCH/);

    // 2. Uncontested call (delay = 0): emits NO_OP_KEEP_HOST_PLAN with 0 mutations to preserve host TOS value
    const maritimeNoOp = runUniversalSidecarPlugin("host-maritime-quay", 0, "S8");
    assert.equal(maritimeNoOp.pluginDecision, "NO_OP_KEEP_HOST_PLAN");
    assert.equal(maritimeNoOp.waitSaved, 0);
    assert.equal(maritimeNoOp.otherJobsMoved, 0);
    assert.equal(maritimeNoOp.hostValuePreservationPct, 100);
    assert.match(maritimeNoOp.hostNativeAdapterPayload, /ZERO-TOUCH GUARDRAIL/);

    // 3. Verify all other host domains (Barge ICD, Warehouse Dock WMS, Cold Chain Reefer)
    for (const host of UNIVERSAL_HOST_PROFILES) {
      const res = runUniversalSidecarPlugin(host.id);
      assert.equal(res.otherJobsMoved, 0, host.id);
      assert.equal(res.hostValuePreservationPct, 100, host.id);
      assert.ok(res.waitSaved > 0, host.id);
      assert.ok(res.netEconomicGainUsd > 0, host.id);
    }
  });

  it("executes the empirical 4-kernel language benchmark and verifies when Go 1.26 / Rust WASM wins vs when FFI is rejected", () => {
    const bench = runEmpiricalLanguageBenchmark();
    assert.equal(bench.corpusPnl.pairedWeeksCount, 98);
    assert.equal(bench.corpusPnl.totalArrivalProbes, 3092);
    assert.equal(bench.corpusPnl.uncontestedCount, 2567);
    assert.equal(bench.corpusPnl.contestedCount, 525);
    assert.equal(bench.corpusPnl.totalShipHoursSaved, 19801);
    assert.equal(bench.corpusPnl.otherVesselsDisplacedTotal, 0);
    assert.equal(bench.corpusPnl.grossSavingsAcrossCorpusUsd, 29_701_500);

    assert.equal(bench.kernels.length, 4);
    const k1 = bench.kernels.find((k) => k.id === "kernel-1-berth-span-2d")!;
    const k2 = bench.kernels.find((k) => k.id === "kernel-2-pack3d-wasm")!;
    const k3 = bench.kernels.find((k) => k.id === "kernel-3-rtg-bay-rehandle")!;
    const k4 = bench.kernels.find((k) => k.id === "kernel-4-edi-xml-reconcile")!;

    assert.equal(k1.decision, "REWRITE_APPROVED_AND_DEPLOYED");
    assert.ok(k1.v8SpeedupRatio > 10);
    assert.ok(k1.nativeSpeedupVsBaseline > 500);
    assert.equal(k2.decision, "REWRITE_APPROVED_AND_DEPLOYED");
    assert.equal(k3.decision, "REWRITE_APPROVED_AND_DEPLOYED");
    // Kernel 4 (EDI/XML string reconciliation) must be rejected due to UTF-8 FFI serialization overhead
    assert.equal(k4.decision, "REJECTED_WASTEFUL_FFI_OVERHEAD");
    assert.ok(k4.nativeSpeedupVsBaseline < 1);
  });
});

describe("Pillar 8 — MLAI Hackathon Track 1-2-3 Organizational AI, Escalation Referee & SHA-256 Audit (mlai-agents.ts)", async () => {
  const {
    HCMC_CORRIDOR_EDGES,
    HCMC_CORRIDOR_NODES,
    createHitlSignedAuditBlock,
    runOrganizationalAgentPipeline,
  } = await import("./mlai-agents.ts");
  const { solve } = await import("./solver.ts");

  it("evaluates 5-Agent Coordination Layer, Escalation Referee tiers, HITL cryptographic signing, and HCMC Smart Map", () => {
    const yard47 = blockedExampleYard();
    const evContested = { truckId: "S8", newEtaMin: 5, source: "manual" as const };
    const resContested = solve(yard47, evContested);

    // 1. Normal contested case -> TIER_1_AUTONOMOUS_COMMIT_K0 (5/5 guardrails pass, 193h saved, +$289,500)
    const pipeNormal = runOrganizationalAgentPipeline({
      yard: yard47,
      selectedId: "S8",
      event: evContested,
      result: resContested,
      stressMode: "NORMAL",
    });
    assert.equal(pipeNormal.tier, "TIER_1_AUTONOMOUS_COMMIT_K0");
    assert.equal(pipeNormal.waitSavedHours, 193);
    assert.equal(pipeNormal.netEconomicBenefitUsd, 289_500);
    assert.equal(pipeNormal.agents.length, 5);
    assert.equal(pipeNormal.guardrails.filter((g) => g.passed).length, 5);
    assert.ok(pipeNormal.conformal.q10Optimistic <= pipeNormal.conformal.q50Median);
    assert.ok(pipeNormal.conformal.q50Median <= pipeNormal.conformal.q90Conservative);

    // 2. Storm / Low confidence (<85%) -> TIER_2_HITL_ESCALATION_REFEREE
    const pipeStorm = runOrganizationalAgentPipeline({
      yard: yard47,
      selectedId: "S8",
      event: evContested,
      result: resContested,
      stressMode: "LOW_CONFIDENCE_STORM",
    });
    assert.equal(pipeStorm.tier, "TIER_2_HITL_ESCALATION_REFEREE");
    assert.equal(pipeStorm.initialAuditBlock.hitlStatus, "PENDING_HUMAN_REFEREE");

    // 3. Human-in-the-Loop cryptographic sign-off chains SHA-256 hashes
    const signed = createHitlSignedAuditBlock(
      pipeStorm.initialAuditBlock,
      "HUMAN_APPROVED",
      "Duty Chief HCMUT-VNG",
      "Approved after checking tugboat availability",
    );
    assert.equal(signed.prevHash, pipeStorm.initialAuditBlock.blockHash);
    assert.notEqual(signed.blockHash, signed.prevHash);
    assert.equal(signed.hitlStatus, "HUMAN_APPROVED");

    // 4. Verify Track 01 (TASCO/Goong) HCMC Smart Port & VETC Corridor Map
    assert.equal(HCMC_CORRIDOR_NODES.length, 6);
    assert.equal(HCMC_CORRIDOR_EDGES.length, 6);
    assert.ok(HCMC_CORRIDOR_NODES.some((n) => n.id === "PORT_CAT_LAI" && n.status === "CRITICAL_DIVERT"));
  });
});



