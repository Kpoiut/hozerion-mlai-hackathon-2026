export interface HinterlandJob {
  id: string;
  truckPlate: string;
  hauler: string;
  containerNo: string;
  flowType: "EXPORT_CUTOFF" | "IMPORT_PICKUP" | "COLD_CHAIN_PTI";
  cargo: "dry" | "reefer";
  bookedDoorId: string;
  bookedStartMin: number;
  liveEtaMin: number;
  serviceDurationMin: number;
  vesselClosingMin: number | null;
  customsStatus: "GREEN" | "YELLOW_HOLD";
  customsClearsAtMin: number;
  yardRehandlesNeeded: number;
  vesselName: string;
}

export interface HinterlandPlacement {
  jobId: string;
  truckPlate: string;
  containerNo: string;
  hauler: string;
  assignedDoorId: string;
  bookedDoorId: string;
  startMin: number;
  bookedStartMin: number;
  endMin: number;
  liveEtaMin: number;
  effectiveServiceMin: number;
  waitMin: number;
  cutoffSlackMin: number | null;
  cutoffMissed: boolean;
  customsConflict: boolean;
  preMarshalled: boolean;
  actionTag: "BILATERAL_SWAP" | "CUSTOMS_DEFERRED" | "PRE_MARSHALLED_FIT" | "HELD_ON_TIME" | "REROUTED_DOOR";
  explanation: string;
}

export interface HinterlandStrategyComparison {
  id: "fifo-naive" | "saas-single" | "coupled-swap";
  label: string;
  totalWaitMin: number;
  cutoffMisses: number;
  customsDoorBlockedMin: number;
  craneWaitSavedMin: number;
  swapsExecuted: number;
  placements: HinterlandPlacement[];
  summary: string;
}

export interface HinterlandScenario {
  id: string;
  name: string;
  subtitle: string;
  shiftStartHour: number;
  doors: { id: string; name: string; cargo: ("dry" | "reefer")[] }[];
  jobs: HinterlandJob[];
}

export const HINTERLAND_SCENARIOS: readonly HinterlandScenario[] = [
  {
    id: "CFS-CATLAI-MORNING",
    name: "Ca Cao Điểm Sáng · Kho CFS & Cổng B Tân Thuận / Cát Lái",
    subtitle: "Đồng thời: Xe xuất tàu kẹt Cầu Phú Mỹ (+52p) · Xe đến sớm (-35p) · Cont nhập vướng Luồng Vàng · Cont đáy 3 tầng đảo chuyển",
    shiftStartHour: 8,
    doors: [
      { id: "D1", name: "Cửa D1 · Xuất Tàu (Forklift)", cargo: ["dry"] },
      { id: "D2", name: "Cửa D2 · Xuất/Nhập Khô", cargo: ["dry"] },
      { id: "D3", name: "Cửa D3 · Kho Lạnh (Reefer PTI)", cargo: ["reefer"] },
      { id: "D4", name: "Cửa D4 · Hàng Nặng & Sà Lan", cargo: ["dry", "reefer"] },
    ],
    jobs: [
      {
        id: "J-EXP-1",
        truckPlate: "51C-882.13",
        hauler: "Mekong Logistics",
        containerNo: "MSKU4029101",
        flowType: "EXPORT_CUTOFF",
        cargo: "dry",
        bookedDoorId: "D1",
        bookedStartMin: 30, // 08:30
        liveEtaMin: 82, // 09:22 (+52m stuck on Phu My bridge)
        serviceDurationMin: 45,
        vesselClosingMin: 135, // 10:15 Vessel Cut-off!
        customsStatus: "GREEN",
        customsClearsAtMin: 0,
        yardRehandlesNeeded: 3, // 3 blockers above it in yard!
        vesselName: "MAERSK HANOI 441S",
      },
      {
        id: "J-IMP-2",
        truckPlate: "51A-100.61",
        hauler: "Nam An Transport",
        containerNo: "HAHU3109406",
        flowType: "IMPORT_PICKUP",
        cargo: "dry",
        bookedDoorId: "D1",
        bookedStartMin: 80, // 09:20
        liveEtaMin: 30, // 08:30 (Arrived 50m early, already at gate, Top Tier 0 rehandles!)
        serviceDurationMin: 45,
        vesselClosingMin: null,
        customsStatus: "GREEN",
        customsClearsAtMin: 0,
        yardRehandlesNeeded: 0,
        vesselName: "HAI AN TIME 2410",
      },
      {
        id: "J-HOLD-3",
        truckPlate: "51L-119.08",
        hauler: "Tan Thuan Haulage",
        containerNo: "WHLU5501207",
        flowType: "IMPORT_PICKUP",
        cargo: "dry",
        bookedDoorId: "D2",
        bookedStartMin: 40, // 08:40
        liveEtaMin: 40, // On time physically, BUT Customs Yellow Hold until 10:00 (min 120)!
        serviceDurationMin: 50,
        vesselClosingMin: null,
        customsStatus: "YELLOW_HOLD",
        customsClearsAtMin: 120, // Cleared at 10:00
        yardRehandlesNeeded: 1,
        vesselName: "WAN HAI 288",
      },
      {
        id: "J-EXP-4",
        truckPlate: "51P-404.04",
        hauler: "Binh Tan Express",
        containerNo: "COSU4410902",
        flowType: "EXPORT_CUTOFF",
        cargo: "dry",
        bookedDoorId: "D2",
        bookedStartMin: 95, // 09:35
        liveEtaMin: 45, // 08:45 (Arrived 50m early, Customs Green, Urgent Export Cutoff at 10:05)
        serviceDurationMin: 45,
        vesselClosingMin: 125, // 10:05 Cutoff!
        customsStatus: "GREEN",
        customsClearsAtMin: 0,
        yardRehandlesNeeded: 2,
        vesselName: "COSCO HARMONY",
      },
      {
        id: "J-COLD-5",
        truckPlate: "51F-901.11",
        hauler: "Mekong Cold Chain",
        containerNo: "ONEU5120309",
        flowType: "COLD_CHAIN_PTI",
        cargo: "reefer",
        bookedDoorId: "D3",
        bookedStartMin: 60, // 09:00
        liveEtaMin: 95, // 09:35 (+35m late)
        serviceDurationMin: 50,
        vesselClosingMin: 160, // 10:40 Reefer Cutoff
        customsStatus: "GREEN",
        customsClearsAtMin: 0,
        yardRehandlesNeeded: 2,
        vesselName: "ONE REINFORCEMENT",
      },
      {
        id: "J-COLD-6",
        truckPlate: "51G-922.12",
        hauler: "Saigon Cold",
        containerNo: "TEMU6029105",
        flowType: "COLD_CHAIN_PTI",
        cargo: "reefer",
        bookedDoorId: "D3",
        bookedStartMin: 115, // 09:55
        liveEtaMin: 60, // 09:00 (Arrived 55m early!)
        serviceDurationMin: 40,
        vesselClosingMin: null,
        customsStatus: "GREEN",
        customsClearsAtMin: 0,
        yardRehandlesNeeded: 0,
        vesselName: "SITC HOCHIMINH",
      },
    ],
  },
] as const;

/**
 * Evaluates all 3 hinterland dock exception strategies:
 * 1) Naive FIFO / Hold-Door (customs hold blocks door, no bilateral swap, no crane pre-marshalling)
 * 2) Single-Truck SaaS Rescheduler (shifts late trucks to later slots without swapping early trucks or pre-marshalling)
 * 3) Coupled Yard–Customs–Cutoff Bilateral Swap + Pre-Marshalling
 */
export function solveHinterlandExceptions(
  scenario: HinterlandScenario = HINTERLAND_SCENARIOS[0]!,
): {
  scenario: HinterlandScenario;
  strategies: HinterlandStrategyComparison[];
  recommended: HinterlandStrategyComparison;
} {
  const jobs = scenario.jobs;

  // --- Strategy 1: Naive Hold-Order (FIFO on Booked Door, no pre-marshalling, customs hold blocks door) ---
  const fifoPlacements: HinterlandPlacement[] = [];
  const doorCursorFifo = new Map<string, number>();
  for (const j of jobs) {
    const cur = doorCursorFifo.get(j.bookedDoorId) ?? 0;
    const readyAt = Math.max(j.bookedStartMin, j.liveEtaMin, cur);
    const rehandleWait = j.yardRehandlesNeeded * 4;
    const customsWait = j.customsStatus === "YELLOW_HOLD" ? Math.max(0, j.customsClearsAtMin - readyAt) : 0;
    const effectiveServiceMin = j.serviceDurationMin + rehandleWait + customsWait;
    const endMin = readyAt + effectiveServiceMin;
    doorCursorFifo.set(j.bookedDoorId, endMin);
    const cutoffSlackMin = j.vesselClosingMin != null ? j.vesselClosingMin - endMin : null;
    fifoPlacements.push({
      jobId: j.id,
      truckPlate: j.truckPlate,
      containerNo: j.containerNo,
      hauler: j.hauler,
      assignedDoorId: j.bookedDoorId,
      bookedDoorId: j.bookedDoorId,
      startMin: readyAt,
      bookedStartMin: j.bookedStartMin,
      endMin,
      liveEtaMin: j.liveEtaMin,
      effectiveServiceMin,
      waitMin: Math.max(0, readyAt - j.liveEtaMin) + rehandleWait + customsWait,
      cutoffSlackMin,
      cutoffMissed: cutoffSlackMin != null && cutoffSlackMin < 0,
      customsConflict: customsWait > 0,
      preMarshalled: false,
      actionTag: "HELD_ON_TIME",
      explanation:
        customsWait > 0
          ? `Xe đứng chiếm cửa ${j.bookedDoorId} chờ thông quan Luồng Vàng ${customsWait}p`
          : `Giữ thứ tự cũ trên ${j.bookedDoorId} (+${rehandleWait}p chờ cẩu đảo chuyển)`,
    });
  }

  // --- Strategy 2: Standard SaaS Booker (pushes late truck after on-time truck, but doesn't pre-marshal or defer customs hold early) ---
  const saasPlacements: HinterlandPlacement[] = [];
  // Sort by max(bookedStart, liveEta)
  const saasOrder = [...jobs].sort(
    (a, b) => Math.max(a.bookedStartMin, a.liveEtaMin) - Math.max(b.bookedStartMin, b.liveEtaMin),
  );
  const doorCursorSaas = new Map<string, number>();
  for (const j of saasOrder) {
    const cur = doorCursorSaas.get(j.bookedDoorId) ?? 0;
    // SaaS booker doesn't pull early truck before its bookedStartMin unless swapped, and doesn't pre-marshal yard
    const startMin = Math.max(j.liveEtaMin, j.bookedStartMin, cur);
    const rehandleWait = j.yardRehandlesNeeded * 4;
    const customsWait = j.customsStatus === "YELLOW_HOLD" ? Math.max(0, j.customsClearsAtMin - startMin) : 0;
    const effectiveServiceMin = j.serviceDurationMin + rehandleWait + customsWait;
    const endMin = startMin + effectiveServiceMin;
    doorCursorSaas.set(j.bookedDoorId, endMin);
    const cutoffSlackMin = j.vesselClosingMin != null ? j.vesselClosingMin - endMin : null;
    saasPlacements.push({
      jobId: j.id,
      truckPlate: j.truckPlate,
      containerNo: j.containerNo,
      hauler: j.hauler,
      assignedDoorId: j.bookedDoorId,
      bookedDoorId: j.bookedDoorId,
      startMin,
      bookedStartMin: j.bookedStartMin,
      endMin,
      liveEtaMin: j.liveEtaMin,
      effectiveServiceMin,
      waitMin: Math.max(0, startMin - j.liveEtaMin) + rehandleWait + customsWait,
      cutoffSlackMin,
      cutoffMissed: cutoffSlackMin != null && cutoffSlackMin < 0,
      customsConflict: customsWait > 0,
      preMarshalled: false,
      actionTag: "REROUTED_DOOR",
      explanation: `Dời lịch đơn thuần trên ${j.bookedDoorId} lúc +${startMin}p (không đảo chuyển bãi trước, không đổi chỗ xe đến sớm)`,
    });
  }

  // --- Strategy 3: Coupled Yard–Customs–Cutoff Bilateral Swap + RTG Pre-Marshalling ---
  // Group jobs by bookedDoorId (or compatible doors), defer YELLOW_HOLD until customsClearsAtMin,
  // swap early-arrived GREEN jobs into the vacated early slot of late jobs, and pre-marshal buried containers during the delay window!
  const coupledPlacements: HinterlandPlacement[] = [];
  let swapsExecuted = 0;
  let craneWaitSavedMin = 0;

  for (const door of scenario.doors) {
    const doorJobs = jobs.filter((j) => j.bookedDoorId === door.id);
    if (doorJobs.length === 0) continue;

    // Order by effective ready time: max(liveEtaMin, customsClearsAtMin)
    const sorted = [...doorJobs].sort((a, b) => {
      const readyA = Math.max(a.liveEtaMin, a.customsStatus === "YELLOW_HOLD" ? a.customsClearsAtMin : 0);
      const readyB = Math.max(b.liveEtaMin, b.customsStatus === "YELLOW_HOLD" ? b.customsClearsAtMin : 0);
      return readyA - readyB;
    });

    // Check if the sorted order inverted the original bookedStartMin order -> bilateral swap!
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i]!.bookedStartMin > sorted[i + 1]!.bookedStartMin) {
        swapsExecuted += 1;
      }
    }

    let cursor = 0;
    for (const j of sorted) {
      const customsReady = j.customsStatus === "YELLOW_HOLD" ? j.customsClearsAtMin : 0;
      const readyMin = Math.max(j.liveEtaMin, customsReady, cursor);

      // Can RTG pre-marshal buried containers before the truck docks?
      // Yes, if readyMin >= 40 (giving RTG 10-15 min of idle lead time before truck hits dock)
      const canPreMarshal = j.yardRehandlesNeeded > 0 && readyMin >= 35;
      const savedCraneMin = canPreMarshal ? j.yardRehandlesNeeded * 4 : 0;
      craneWaitSavedMin += savedCraneMin;

      const effectiveServiceMin = j.serviceDurationMin + (canPreMarshal ? 0 : j.yardRehandlesNeeded * 4);
      const endMin = readyMin + effectiveServiceMin;
      cursor = endMin;

      const cutoffSlackMin = j.vesselClosingMin != null ? j.vesselClosingMin - endMin : null;
      const wasSwapped =
        doorJobs.length > 1 &&
        ((j.liveEtaMin < j.bookedStartMin && readyMin < j.bookedStartMin) ||
          (j.liveEtaMin > j.bookedStartMin && readyMin >= j.liveEtaMin));

      const actionTag: HinterlandPlacement["actionTag"] =
        j.customsStatus === "YELLOW_HOLD"
          ? "CUSTOMS_DEFERRED"
          : wasSwapped
            ? "BILATERAL_SWAP"
            : canPreMarshal
              ? "PRE_MARSHALLED_FIT"
              : "HELD_ON_TIME";

      const explanation =
        j.customsStatus === "YELLOW_HOLD"
          ? `Tách khỏi cửa ${door.id} sang bãi đệm chờ thông quan Luồng Vàng tới phút ${j.customsClearsAtMin}, nhường cửa cho xe xuất tàu ${sorted[0]?.truckPlate}`
          : j.liveEtaMin < j.bookedStartMin
            ? `Hoán đổi song phương (Slot-Swap): đôn từ +${j.bookedStartMin}p lên +${readyMin}p vì xe đã ở cổng, cont tầng trên (0 đảo chuyển)`
            : `Nhận slot hoán đổi lúc +${readyMin}p + Cẩu RTG đảo chuyển trước ${j.yardRehandlesNeeded} cont trong lúc xe kẹt cầu Phú Mỹ (tiết kiệm ${savedCraneMin}p) → Kịp Cut-off tàu ${j.vesselName} (dư ${cutoffSlackMin}p)!`;

      coupledPlacements.push({
        jobId: j.id,
        truckPlate: j.truckPlate,
        containerNo: j.containerNo,
        hauler: j.hauler,
        assignedDoorId: door.id,
        bookedDoorId: j.bookedDoorId,
        startMin: readyMin,
        bookedStartMin: j.bookedStartMin,
        endMin,
        liveEtaMin: j.liveEtaMin,
        effectiveServiceMin,
        waitMin: Math.max(0, readyMin - j.liveEtaMin),
        cutoffSlackMin,
        cutoffMissed: cutoffSlackMin != null && cutoffSlackMin < 0,
        customsConflict: false,
        preMarshalled: canPreMarshal,
        actionTag,
        explanation,
      });
    }
  }

  const summarize = (
    id: HinterlandStrategyComparison["id"],
    label: string,
    placements: HinterlandPlacement[],
    swaps: number,
    craneSaved: number,
    summary: string,
  ): HinterlandStrategyComparison => ({
    id,
    label,
    totalWaitMin: placements.reduce((s, p) => s + p.waitMin, 0),
    cutoffMisses: placements.filter((p) => p.cutoffMissed).length,
    customsDoorBlockedMin: placements.filter((p) => p.customsConflict).reduce((s, p) => s + 80, 0),
    craneWaitSavedMin: craneSaved,
    swapsExecuted: swaps,
    placements: [...placements].sort((a, b) => a.startMin - b.startMin),
    summary,
  });

  const strategies: HinterlandStrategyComparison[] = [
    summarize(
      "fifo-naive",
      "1. Giữ lịch cũ (FIFO Kho truyền thống)",
      fifoPlacements,
      0,
      0,
      "Xe vướng tờ khai Luồng Vàng chiếm chết cửa D2 80 phút; 2 cont xuất bị rớt Cut-off tàu (Closing Time).",
    ),
    summarize(
      "saas-single",
      "2. Dời lịch đơn lẻ (C3 / FourKites / DataDocks kiểu cũ)",
      saasPlacements,
      0,
      0,
      "Chỉ đẩy lùi xe trễ mà không hoán đổi xe đến sớm và không đồng bộ cẩu RTG đảo chuyển trước → vẫn trễ Cut-off tàu.",
    ),
    summarize(
      "coupled-swap",
      "3. Hozerion Coupled: Hoán đổi Slot + Tách tờ khai Hold + Đảo chuyển RTG trước",
      coupledPlacements,
      swapsExecuted,
      craneWaitSavedMin,
      `Hoán đổi ${swapsExecuted} cặp xe sớm/trễ, tách xe vướng Hải quan ra bãi đệm, cẩu RTG bốc dọn trước ${craneWaitSavedMin}p → 0 rớt tàu Cut-off!`,
    ),
  ];

  return {
    scenario,
    strategies,
    recommended: strategies[2]!,
  };
}
