export type HcmcPortId =
  | "VNSGN-CATLAI"
  | "VNSGN-TANTHUAN"
  | "VNSGN-HIEPPHUOC"
  | "VNSGN-SPITC"
  | "VNSGN-ICD-PHUOCLONG";

export type HcmcTosEngine =
  | "TOPX_TOPOVN_EPORT"
  | "SGP_TOS_VTOS_GTOS_VSL"
  | "SGP_TOS_CATOS"
  | "VTOS_SPITC"
  | "ICD_LITE_EPORT";

export interface HcmcTerminal {
  id: HcmcPortId;
  name: string;
  shortName: string;
  operator: string;
  location: string;
  channel: string;
  tosEngine: HcmcTosEngine;
  tosHistory: string;
  berths: number;
  stsCranes: number;
  maxDraftM: number;
  berthUtilPct: number;
  yardUtilPct: number;
  gateQueueMin: number;
  freeBerthInHours: number;
  availableCranesNow: number;
  movesPerCraneHour: number;
  handlingFeePerTeuUsd: number;
}

export interface InterPortCorridor {
  from: HcmcPortId;
  to: HcmcPortId;
  mode: "barge" | "drayage" | "river-vessel";
  routeLabel: string;
  transitHours: number;
  costPerTeuUsd: number;
  customsProcedure: "VNACCS_OLA_Barge" | "VNACCS_OLA_Truck" | "Port_Shift_Manifest";
  maxTeuPerTrip: number;
}

export interface FederationIncident {
  id: string;
  title: string;
  originPort: HcmcPortId;
  vesselName: string;
  voyageCode: string;
  shippingLine: string;
  totalTeu: number;
  transshipTeu: number;
  draftMeters: number;
  delayHours: number;
  originBlockedHours: number;
  charterCostPerHourUsd: number;
  description: string;
}

export interface FederationOption {
  id: string;
  strategy: "WAIT_ORIGIN" | "DIVERT_VESSEL" | "BARGE_LIGHTERING_SPLIT";
  targetPort: HcmcPortId;
  targetPortName: string;
  targetTos: HcmcTosEngine;
  bargeTeu: number;
  originWaitHours: number;
  transitHours: number;
  handlingHours: number;
  totalCompletionHours: number;
  hoursSavedVsOrigin: number;
  vesselCharterSavedUsd: number;
  transferCostUsd: number;
  netSavingsUsd: number;
  draftCompliant: boolean;
  customsPermitCode: string;
  recommended: boolean;
  summary: string;
}

export interface CrossTosPacket {
  messageId: string;
  sequenceNo: number;
  originPort: HcmcPortId;
  originTos: HcmcTosEngine;
  targetPort: HcmcPortId;
  targetTos: HcmcTosEngine;
  sha256Digest: string;
  status: "PROPOSED" | "CUSTOMS_OLA_APPROVED" | "TARGET_TOS_ACKED" | "COMMITTED";
  originExportPayload: string;
  canonicalDcsaJson: string;
  edifactPayload: string;
  vnaccsOlaXml: string;
  targetImportPayload: string;
}

export interface FederationPlanResult {
  incident: FederationIncident;
  originTerminal: HcmcTerminal;
  recommendedOption: FederationOption;
  options: FederationOption[];
  packet: CrossTosPacket;
}

export const HCMC_TERMINALS: readonly HcmcTerminal[] = [
  {
    id: "VNSGN-CATLAI",
    name: "Tân Cảng Cát Lái (SNP)",
    shortName: "Cát Lái",
    operator: "Tổng Công ty Tân Cảng Sài Gòn",
    location: "P. Cát Lái, TP. Thủ Đức",
    channel: "Sông Đồng Nai – Lòng Tàu",
    tosEngine: "TOPX_TOPOVN_EPORT",
    tosHistory: "TOPX (2008) · ePort (2012) · TOPOVN (2015)",
    berths: 9,
    stsCranes: 30,
    maxDraftM: 12.0,
    berthUtilPct: 92,
    yardUtilPct: 88,
    gateQueueMin: 54,
    freeBerthInHours: 14,
    availableCranesNow: 3,
    movesPerCraneHour: 28,
    handlingFeePerTeuUsd: 52,
  },
  {
    id: "VNSGN-TANTHUAN",
    name: "Cảng Tân Thuận (SGP)",
    shortName: "Tân Thuận",
    operator: "Cảng Sài Gòn (Saigon Port)",
    location: "P. Tân Thuận Đông, Quận 7",
    channel: "Sông Sài Gòn",
    tosEngine: "SGP_TOS_VTOS_GTOS_VSL",
    tosHistory: "CATOS (2006) → SGP-TOS: VTOS, GTOS & VSL (2023–2024)",
    berths: 4,
    stsCranes: 6,
    maxDraftM: 10.5,
    berthUtilPct: 89,
    yardUtilPct: 84,
    gateQueueMin: 38,
    freeBerthInHours: 16,
    availableCranesNow: 2,
    movesPerCraneHour: 24,
    handlingFeePerTeuUsd: 46,
  },
  {
    id: "VNSGN-HIEPPHUOC",
    name: "Cảng Sài Gòn – Hiệp Phước",
    shortName: "Hiệp Phước",
    operator: "Cảng Sài Gòn (Saigon Port)",
    location: "KCN Hiệp Phước, Nhà Bè",
    channel: "Luồng Soài Rạp",
    tosEngine: "SGP_TOS_CATOS",
    tosHistory: "CATOS (2006) → SGP-TOS: VTOS, GTOS & VSL (2024)",
    berths: 3,
    stsCranes: 6,
    maxDraftM: 11.8,
    berthUtilPct: 54,
    yardUtilPct: 48,
    gateQueueMin: 12,
    freeBerthInHours: 1,
    availableCranesNow: 4,
    movesPerCraneHour: 25,
    handlingFeePerTeuUsd: 43,
  },
  {
    id: "VNSGN-SPITC",
    name: "Cảng Quốc tế SP-ITC",
    shortName: "SP-ITC",
    operator: "ITC Corp",
    location: "P. Phú Hữu, TP. Thủ Đức",
    channel: "Sông Đồng Nai – Ông Nhiêu",
    tosEngine: "VTOS_SPITC",
    tosHistory: "VTOS (từ 2019)",
    berths: 3,
    stsCranes: 8,
    maxDraftM: 11.5,
    berthUtilPct: 68,
    yardUtilPct: 62,
    gateQueueMin: 18,
    freeBerthInHours: 2,
    availableCranesNow: 4,
    movesPerCraneHour: 27,
    handlingFeePerTeuUsd: 48,
  },
  {
    id: "VNSGN-ICD-PHUOCLONG",
    name: "Cụm ICD Phước Long / Tân Thuận",
    shortName: "ICD Phước Long",
    operator: "ICD Phúc Long / Sotrans",
    location: "TP. Thủ Đức (Kết nối Sà lan)",
    channel: "Sông Sài Gòn – Rạch Chiếc",
    tosEngine: "ICD_LITE_EPORT",
    tosHistory: "ICD Gate/Barge Sync",
    berths: 4,
    stsCranes: 4,
    maxDraftM: 6.5,
    berthUtilPct: 61,
    yardUtilPct: 58,
    gateQueueMin: 15,
    freeBerthInHours: 0,
    availableCranesNow: 3,
    movesPerCraneHour: 20,
    handlingFeePerTeuUsd: 35,
  },
] as const;

export const HCMC_CORRIDORS: readonly InterPortCorridor[] = [
  {
    from: "VNSGN-TANTHUAN",
    to: "VNSGN-HIEPPHUOC",
    mode: "river-vessel",
    routeLabel: "Hành lang Sông Sài Gòn → Soài Rạp (Nội bộ Cảng Sài Gòn SGP-TOS)",
    transitHours: 2,
    costPerTeuUsd: 14,
    customsProcedure: "Port_Shift_Manifest",
    maxTeuPerTrip: 1200,
  },
  {
    from: "VNSGN-TANTHUAN",
    to: "VNSGN-SPITC",
    mode: "barge",
    routeLabel: "Sà lan Sông Sài Gòn → Ngã ba Đèn Đỏ → Đồng Nai (SP-ITC)",
    transitHours: 2,
    costPerTeuUsd: 18,
    customsProcedure: "VNACCS_OLA_Barge",
    maxTeuPerTrip: 160,
  },
  {
    from: "VNSGN-TANTHUAN",
    to: "VNSGN-CATLAI",
    mode: "barge",
    routeLabel: "Sà lan Tân Thuận (Q7) ↔ Tân Cảng Cát Lái",
    transitHours: 2,
    costPerTeuUsd: 19,
    customsProcedure: "VNACCS_OLA_Barge",
    maxTeuPerTrip: 160,
  },
  {
    from: "VNSGN-CATLAI",
    to: "VNSGN-SPITC",
    mode: "barge",
    routeLabel: "Sà lan Sông Đồng Nai (Cát Lái ↔ Phú Hữu SP-ITC, 4.5 km)",
    transitHours: 1,
    costPerTeuUsd: 12,
    customsProcedure: "VNACCS_OLA_Barge",
    maxTeuPerTrip: 240,
  },
  {
    from: "VNSGN-CATLAI",
    to: "VNSGN-HIEPPHUOC",
    mode: "river-vessel",
    routeLabel: "Điều tiết luồng Lòng Tàu → Soài Rạp (Cát Lái → Hiệp Phước)",
    transitHours: 3,
    costPerTeuUsd: 16,
    customsProcedure: "Port_Shift_Manifest",
    maxTeuPerTrip: 1500,
  },
  {
    from: "VNSGN-CATLAI",
    to: "VNSGN-ICD-PHUOCLONG",
    mode: "barge",
    routeLabel: "Sà lan giải tỏa bãi Cát Lái → Cụm ICD Phước Long / Thủ Đức",
    transitHours: 2,
    costPerTeuUsd: 15,
    customsProcedure: "VNACCS_OLA_Barge",
    maxTeuPerTrip: 192,
  },
] as const;

export const HCMC_INCIDENTS: readonly FederationIncident[] = [
  {
    id: "INC-TANTHUAN-SGP",
    title: "Tàu trễ 5h tại Tân Thuận (SGP-TOS) · Cầu kẹt 16h · Điều phối sang Hiệp Phước / SP-ITC",
    originPort: "VNSGN-TANTHUAN",
    vesselName: "WAN HAI 288",
    voyageCode: "S2419E",
    shippingLine: "Wan Hai Lines",
    totalTeu: 420,
    transshipTeu: 128,
    draftMeters: 10.2,
    delayHours: 5,
    originBlockedHours: 16,
    charterCostPerHourUsd: 1650,
    description:
      "Tàu WAN HAI 288 đến Tân Thuận trễ 5h làm mất cửa sổ cầu K12. Cầu Tân Thuận kẹt chuỗi 3 tàu kế tiếp trong 16h; trong khi Hiệp Phước (cùng hệ SGP-TOS) và SP-ITC (VTOS) đang trống cầu và có sẵn 4 cẩu STS.",
  },
  {
    id: "INC-CATLAI-SPITC",
    title: "Cát Lái (TOPOVN) nghẽn cầu 14h & cổng 54p · San tải sà lan/tàu sang SP-ITC (VTOS)",
    originPort: "VNSGN-CATLAI",
    vesselName: "SITC HOCHIMINH",
    voyageCode: "2442S",
    shippingLine: "SITC Container Lines",
    totalTeu: 560,
    transshipTeu: 192,
    draftMeters: 11.2,
    delayHours: 4,
    originBlockedHours: 14,
    charterCostPerHourUsd: 1900,
    description:
      "Tàu SITC HOCHIMINH trễ 4h vào lúc Cát Lái đạt 92% công suất cầu và cổng kẹt 54 phút. Chuyển hướng hoặc cắt 192 TEU qua sà lan sang SP-ITC (cách 4.5 km đường sông) yêu cầu dịch tự động bản tin giữa TOPOVN/TOPX và VTOS kèm tờ khai OLA.",
  },
  {
    id: "INC-DRAFT-HIEPPHUOC",
    title: "Tàu mớn nước sâu 11.4m vượt giới hạn Tân Thuận · Chuyển cầu sang Hiệp Phước (Luồng Soài Rạp)",
    originPort: "VNSGN-TANTHUAN",
    vesselName: "CMA CGM MEKONG",
    voyageCode: "0ME41W",
    shippingLine: "CMA CGM",
    totalTeu: 640,
    transshipTeu: 160,
    draftMeters: 11.4,
    delayHours: 3,
    originBlockedHours: 18,
    charterCostPerHourUsd: 2100,
    description:
      "Tàu CMA CGM MEKONG đầy tải (mớn nước 11.4m) trễ đỉnh triều sông Sài Gòn không thể cập Tân Thuận (giới hạn 10.5m). Hệ thống tự động định tuyến sang Cảng Hiệp Phước (mớn 11.8m) và đồng bộ SGP-TOS (VTOS/GTOS/VSL).",
  },
] as const;

function deterministicHash(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

function buildOriginExport(origin: HcmcTerminal, inc: FederationIncident): string {
  if (origin.tosEngine === "TOPX_TOPOVN_EPORT") {
    return [
      `# TOPOVN / TOPX OUTBOUND EXPORT (${origin.id})`,
      `SITE_ID=CTL | VES_ID=${inc.vesselName.replace(/\s+/g, "_")} | TFC_CODE=${inc.voyageCode}`,
      `STATUS=CONGESTED_DIVERT_CANDIDATE | QUEUED_WAIT_HR=${inc.originBlockedHours} | TOTAL_TEU=${inc.totalTeu}`,
      `EPORT_SYNC=HOLD_GATE_IN | TRANSSHIP_BATCH_TEU=${inc.transshipTeu}`,
    ].join("\n");
  }
  return JSON.stringify(
    {
      system: "SGP-TOS (VTOS / GTOS / VSL)",
      originTerminal: origin.id,
      vesselVisit: {
        vesselName: inc.vesselName,
        voyageCode: inc.voyageCode,
        draftMeters: inc.draftMeters,
        queuedBerthWaitHours: inc.originBlockedHours,
        totalTeu: inc.totalTeu,
        transshipTeu: inc.transshipTeu,
      },
      federationIntent: "REQUEST_CROSS_PORT_SLOT",
    },
    null,
    2,
  );
}

function buildTargetImport(target: HcmcTerminal, inc: FederationIncident, opt: FederationOption): string {
  if (target.tosEngine === "TOPX_TOPOVN_EPORT") {
    return [
      `-- TOPOVN / ePort INBOUND FEDERATION IMPORT (${target.id})`,
      `INSERT INTO VESSEL_DETAILS (SITE_ID, VES_NAME, IN_VOYAGE, ACT_BERTH_TS, EST_WORK_HR, FEDERATION_REF, CUSTOMS_OLA_NO)`,
      `VALUES ('CTL', '${inc.vesselName}', '${inc.voyageCode}', '+${opt.transitHours}h', ${opt.handlingHours}, '${inc.id}', '${opt.customsPermitCode}');`,
    ].join("\n");
  }
  if (target.tosEngine === "VTOS_SPITC") {
    return JSON.stringify(
      {
        targetSystem: "SP-ITC VTOS v4.2",
        terminalCode: "VNSGN-SPITC",
        command: opt.strategy === "BARGE_LIGHTERING_SPLIT" ? "ALLOCATE_BARGE_DISCHARGE_WINDOW" : "ALLOCATE_VESSEL_BERTH",
        vesselName: inc.vesselName,
        voyage: inc.voyageCode,
        allocatedTeu: opt.bargeTeu,
        assignedStsCranes: target.availableCranesNow,
        estimatedWorkHours: opt.handlingHours,
        vnaccsOlaPermit: opt.customsPermitCode,
      },
      null,
      2,
    );
  }
  return JSON.stringify(
    {
      targetSystem: "SGP-TOS (VTOS / GTOS / VSL) + CATOS Bridge",
      terminalCode: target.id,
      command: "ACCEPT_INTER_PORT_VESSEL_CALL",
      vesselName: inc.vesselName,
      voyage: inc.voyageCode,
      allocatedTeu: opt.bargeTeu,
      assignedStsCranes: target.availableCranesNow,
      estimatedWorkHours: opt.handlingHours,
      customsManifestRef: opt.customsPermitCode,
    },
    null,
    2,
  );
}

export function buildCrossTosPackets(
  origin: HcmcTerminal,
  target: HcmcTerminal,
  inc: FederationIncident,
  opt: FederationOption,
): CrossTosPacket {
  const originExportPayload = buildOriginExport(origin, inc);
  const targetImportPayload = buildTargetImport(target, inc, opt);

  const canonicalObj = {
    standard: "DCSA-JIT-v3.0 + UN/CEFACT-InterPort",
    federationId: `${inc.id}-${target.id}`,
    originTerminal: { id: origin.id, tos: origin.tosEngine },
    targetTerminal: { id: target.id, tos: target.tosEngine },
    strategy: opt.strategy,
    vessel: {
      name: inc.vesselName,
      voyage: inc.voyageCode,
      line: inc.shippingLine,
      draftMeters: inc.draftMeters,
    },
    teuTransferred: opt.bargeTeu,
    schedule: {
      transitHours: opt.transitHours,
      handlingHours: opt.handlingHours,
      totalCompletionHours: opt.totalCompletionHours,
      hoursSavedVsOrigin: opt.hoursSavedVsOrigin,
    },
    customsClearance: {
      vnaccsOlaPermit: opt.customsPermitCode,
      vascmSync: "VERIFIED_GREEN",
    },
  };
  const canonicalDcsaJson = JSON.stringify(canonicalObj, null, 2);

  const edifactPayload = [
    `UNB+UNOA:2+${origin.id}:ZZ+${target.id}:ZZ+261016:1345+FED-${inc.id}'`,
    `UNH+1+COPARN:D:95B:UN:SMDG20'`,
    `BGM+11+${inc.id}+9'`,
    `TDT+20+${inc.voyageCode}+1++${inc.shippingLine.slice(0, 5).toUpperCase()}:172:20+++${inc.vesselName}:103'`,
    `LOC+88+${origin.id}:139:6'`,
    `LOC+11+${target.id}:139:6'`,
    `EQD+CN+FED_BATCH_${opt.bargeTeu}TEU+22G1:102:5++2+5'`,
    `RFF+GC:${opt.customsPermitCode}'`,
    `UNT+8+1'`,
    `UNZ+1+FED-${inc.id}'`,
  ].join("\n");

  const vnaccsOlaXml = [
    `<VNACCS_VASSCM_OLA version="3.1">`,
    `  <DeclarationNo>${opt.customsPermitCode}</DeclarationNo>`,
    `  <DeparturePort code="${origin.id}" name="${origin.shortName}"/>`,
    `  <DestinationPort code="${target.id}" name="${target.shortName}"/>`,
    `  <TransportMode>${opt.strategy === "BARGE_LIGHTERING_SPLIT" ? "INLAND_WATERWAY_BARGE" : "VESSEL_SHIFT"}</TransportMode>`,
    `  <ContainerVolumeTEU>${opt.bargeTeu}</ContainerVolumeTEU>`,
    `  <CustomsSealStatus>E_SEAL_ACTIVE_VERIFIED</CustomsSealStatus>`,
    `  <GetOutApprove>AUTO_CLEARED</GetOutApprove>`,
    `</VNACCS_VASSCM_OLA>`,
  ].join("\n");

  const sha256Digest = deterministicHash(`${canonicalDcsaJson}|${edifactPayload}|${vnaccsOlaXml}`);

  return {
    messageId: `FED-MSG-${inc.id}`,
    sequenceNo: 2048,
    originPort: origin.id,
    originTos: origin.tosEngine,
    targetPort: target.id,
    targetTos: target.tosEngine,
    sha256Digest,
    status: "COMMITTED",
    originExportPayload,
    canonicalDcsaJson,
    edifactPayload,
    vnaccsOlaXml,
    targetImportPayload,
  };
}

export function solveInterPortFederation(
  incidentId = HCMC_INCIDENTS[0]!.id,
  overrides?: Partial<Pick<FederationIncident, "delayHours" | "originBlockedHours" | "totalTeu" | "transshipTeu" | "draftMeters">>,
): FederationPlanResult {
  const baseIncident = HCMC_INCIDENTS.find((x) => x.id === incidentId) ?? HCMC_INCIDENTS[0]!;
  const incident: FederationIncident = overrides ? { ...baseIncident, ...overrides } : baseIncident;
  const origin = HCMC_TERMINALS.find((t) => t.id === incident.originPort) ?? HCMC_TERMINALS[0]!;

  // Baseline: wait at origin terminal
  const originMoves = Math.round(incident.totalTeu * 0.68);
  const originHandlingHours = Math.max(
    4,
    Math.ceil(originMoves / (Math.max(1, origin.availableCranesNow) * origin.movesPerCraneHour)),
  );
  const originDraftOk = incident.draftMeters <= origin.maxDraftM;
  const originWaitHours = originDraftOk ? incident.originBlockedHours : incident.originBlockedHours + 8;
  const originTotalHours = originWaitHours + originHandlingHours;

  const options: FederationOption[] = [
    {
      id: `${incident.id}-WAIT`,
      strategy: "WAIT_ORIGIN",
      targetPort: origin.id,
      targetPortName: origin.name,
      targetTos: origin.tosEngine,
      bargeTeu: incident.totalTeu,
      originWaitHours,
      transitHours: 0,
      handlingHours: originHandlingHours,
      totalCompletionHours: originTotalHours,
      hoursSavedVsOrigin: 0,
      vesselCharterSavedUsd: 0,
      transferCostUsd: 0,
      netSavingsUsd: 0,
      draftCompliant: originDraftOk,
      customsPermitCode: "LOCAL-NO-OLA",
      recommended: false,
      summary: originDraftOk
        ? `Chờ cầu tại ${origin.shortName} ${originWaitHours}h + làm hàng ${originHandlingHours}h (tổng ${originTotalHours}h).`
        : `Mớn nước ${incident.draftMeters}m vượt chuẩn ${origin.shortName} (${origin.maxDraftM}m) — phải chờ triều cường hoặc hạ tải.`,
    },
  ];

  const corridors = HCMC_CORRIDORS.filter((c) => c.from === origin.id);
  for (const corr of corridors) {
    const target = HCMC_TERMINALS.find((t) => t.id === corr.to);
    if (!target) continue;

    const draftOk = incident.draftMeters <= target.maxDraftM || corr.mode === "barge";
    const isBargeSplit = corr.mode === "barge";
    const transferredTeu = isBargeSplit ? incident.transshipTeu : incident.totalTeu;

    const targetMoves = Math.round(transferredTeu * 0.68);
    const targetHandling = Math.max(
      3,
      Math.ceil(targetMoves / (Math.max(1, target.availableCranesNow) * target.movesPerCraneHour)),
    );

    let totalCompletionHours: number;
    if (isBargeSplit) {
      // Splitting transship TEU by barge reduces origin handling and allows immediate berth window fit
      const remainingMoves = Math.round((incident.totalTeu - transferredTeu) * 0.68);
      const originReducedHandling = Math.max(
        3,
        Math.ceil(remainingMoves / (Math.max(1, origin.availableCranesNow + 1) * origin.movesPerCraneHour)),
      );
      totalCompletionHours = Math.max(
        Math.ceil(originWaitHours * 0.35) + originReducedHandling,
        corr.transitHours + target.freeBerthInHours + targetHandling,
      );
    } else {
      totalCompletionHours = corr.transitHours + target.freeBerthInHours + targetHandling;
    }

    const hoursSaved = Math.max(0, originTotalHours - totalCompletionHours);
    const charterSavedUsd = hoursSaved * incident.charterCostPerHourUsd;
    const transferCostUsd = transferredTeu * corr.costPerTeuUsd;
    const netSavingsUsd = charterSavedUsd - transferCostUsd;

    const permitNum = `500${String(821040 + target.berths * 131 + transferredTeu).slice(0, 6)}OLA`;

    options.push({
      id: `${incident.id}-${target.id}`,
      strategy: isBargeSplit ? "BARGE_LIGHTERING_SPLIT" : "DIVERT_VESSEL",
      targetPort: target.id,
      targetPortName: target.name,
      targetTos: target.tosEngine,
      bargeTeu: transferredTeu,
      originWaitHours: target.freeBerthInHours,
      transitHours: corr.transitHours,
      handlingHours: targetHandling,
      totalCompletionHours,
      hoursSavedVsOrigin: hoursSaved,
      vesselCharterSavedUsd: charterSavedUsd,
      transferCostUsd,
      netSavingsUsd,
      draftCompliant: draftOk,
      customsPermitCode: permitNum,
      recommended: false,
      summary: isBargeSplit
        ? `Tách ${transferredTeu} TEU qua sà lan sang ${target.shortName} (${target.tosEngine}) — rút ngắn ${hoursSaved}h, tiết kiệm ròng $${netSavingsUsd.toLocaleString("en-US")}.`
        : `Chuyển cầu tàu sang ${target.shortName} (${target.tosEngine}, chờ ${target.freeBerthInHours}h, ${target.availableCranesNow} cẩu STS) — rút ngắn ${hoursSaved}h, tiết kiệm ròng $${netSavingsUsd.toLocaleString("en-US")}.`,
    });
  }

  // Pick best option: draftCompliant first, then highest netSavingsUsd
  const sorted = [...options].sort(
    (a, b) => Number(b.draftCompliant) - Number(a.draftCompliant) || b.netSavingsUsd - a.netSavingsUsd,
  );
  const bestId = sorted[0]?.id ?? options[0]!.id;
  for (const opt of options) {
    opt.recommended = opt.id === bestId;
  }
  const recommendedOption = options.find((o) => o.recommended) ?? options[0]!;
  const targetTerminal = HCMC_TERMINALS.find((t) => t.id === recommendedOption.targetPort) ?? origin;
  const packet = buildCrossTosPackets(origin, targetTerminal, incident, recommendedOption);

  return {
    incident,
    originTerminal: origin,
    recommendedOption,
    options,
    packet,
  };
}
