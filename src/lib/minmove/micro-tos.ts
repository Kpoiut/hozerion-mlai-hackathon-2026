import { validateIso6346 } from "./documents.ts";
import { packExtremeFFD, volume, type Bin3, type Box3, type Pose3 } from "./pack3d.ts";

export type ContainerSize = "20DC" | "40HC" | "20RF" | "40RF";

export interface YardContainer {
  containerNo: string;
  size: ContainerSize;
  cargo: "dry" | "reefer";
  weightTon: number;
  /** Lower number = departs earlier (1 is next up). */
  pickupOrder: number;
  pickupEtaLabel: string;
  customsStatus: "GREEN_CLEARED" | "YELLOW_HOLD" | "RED_INSPECT";
  edoValid: boolean;
  dwellDays: number;
  reeferHours: number;
  hauler: string;
  truckPlate: string;
  row: number; // 0-indexed column in bay (0..nRows-1)
  tier: number; // 0-indexed height (0 = ground, maxTiers-1 = top)
}

export interface BayConfig {
  blockId: string;
  bayNo: string;
  nRows: number;
  maxTiers: number;
  reeferRows: number[];
}

export interface CraneMoveStep {
  stepNo: number;
  action: "RELOCATE_BLOCKER" | "RETRIEVE_TARGET" | "STACK_INCOMING";
  containerNo: string;
  fromRow: number;
  fromTier: number;
  toRow: number | "TRUCK_CHASSIS";
  toTier: number | null;
  cleanMove: boolean;
  reason: string;
  craneMinutes: number;
}

export interface BayRetrievalPlan {
  targetContainer: YardContainer;
  initialGrid: (YardContainer | null)[][]; // [row][tier]
  finalGrid: (YardContainer | null)[][];
  blockingContainers: YardContainer[];
  rehandleCount: number;
  cleanRehandles: number;
  secondaryRiskMoves: number;
  totalCraneMinutes: number;
  steps: CraneMoveStep[];
}

export interface SlotRecommendation {
  row: number;
  tier: number;
  score: number;
  causesBlockingInversion: boolean;
  weightViolation: boolean;
  reeferCompatible: boolean;
  reason: string;
}

export interface TariffLineItem {
  code: string;
  description: string;
  quantity: number;
  unit: string;
  unitPriceVnd: number;
  amountVnd: number;
}

export interface PortBillingInvoice {
  invoiceNo: string;
  containerNo: string;
  size: ContainerSize;
  dwellDays: number;
  freeDays: number;
  chargeableDays: number;
  rehandleMovesBilled: number;
  reeferPlugHours: number;
  lines: TariffLineItem[];
  subtotalVnd: number;
  vatRatePct: number;
  vatVnd: number;
  totalVnd: number;
  totalUsd: number;
  paymentStatus: "PAID_EPORT" | "UNPAID_HOLD";
}

export interface GateEirReceipt {
  eirNo: string;
  gateLane: string;
  direction: "GATE_IN" | "GATE_OUT";
  containerNo: string;
  isoValid: boolean;
  truckPlate: string;
  yardCoordinate: string;
  customsCleared: boolean;
  edoCleared: boolean;
  billingCleared: boolean;
  rehandleMovesRequired: number;
  estimatedTurnaroundMin: number;
  status: "ISSUED_GREEN" | "HELD_AT_GATE";
  holdReasons: string[];
}

export const DEFAULT_BAY_CONFIG: BayConfig = {
  blockId: "B02",
  bayNo: "14",
  nRows: 6,
  maxTiers: 4,
  reeferRows: [0, 1],
};

export const SEED_BAY_CONTAINERS: readonly YardContainer[] = [
  // Row 0 (Reefer row)
  {
    containerNo: "MSKU4029100",
    size: "40RF",
    cargo: "reefer",
    weightTon: 26.4,
    pickupOrder: 2,
    pickupEtaLabel: "09:15",
    customsStatus: "GREEN_CLEARED",
    edoValid: true,
    dwellDays: 4,
    reeferHours: 68,
    hauler: "Mekong Cold",
    truckPlate: "51C-882.13",
    row: 0,
    tier: 0,
  },
  {
    containerNo: "ONEU5120303",
    size: "40RF",
    cargo: "reefer",
    weightTon: 21.5,
    pickupOrder: 7,
    pickupEtaLabel: "13:40",
    customsStatus: "GREEN_CLEARED",
    edoValid: true,
    dwellDays: 3,
    reeferHours: 48,
    hauler: "Mekong Cold",
    truckPlate: "51F-901.11",
    row: 0,
    tier: 1,
  },
  {
    containerNo: "CMAU7182004",
    size: "20RF",
    cargo: "reefer",
    weightTon: 18.2,
    pickupOrder: 9,
    pickupEtaLabel: "15:10",
    customsStatus: "GREEN_CLEARED",
    edoValid: true,
    dwellDays: 2,
    reeferHours: 32,
    hauler: "Nam An",
    truckPlate: "51A-100.61",
    row: 0,
    tier: 2,
  },
  // Row 1 (Reefer row)
  {
    containerNo: "HLXU8190207",
    size: "40RF",
    cargo: "reefer",
    weightTon: 24.0,
    pickupOrder: 11,
    pickupEtaLabel: "16:30",
    customsStatus: "GREEN_CLEARED",
    edoValid: true,
    dwellDays: 5,
    reeferHours: 96,
    hauler: "Sai Gon Haul",
    truckPlate: "51D-120.68",
    row: 1,
    tier: 0,
  },
  {
    containerNo: "TEMU6029100",
    size: "20RF",
    cargo: "reefer",
    weightTon: 16.8,
    pickupOrder: 5,
    pickupEtaLabel: "11:20",
    customsStatus: "GREEN_CLEARED",
    edoValid: true,
    dwellDays: 2,
    reeferHours: 28,
    hauler: "Binh Tan",
    truckPlate: "51P-404.04",
    row: 1,
    tier: 1,
  },
  // Row 2 (Dry row)
  {
    containerNo: "MEDU9012406",
    size: "40HC",
    cargo: "dry",
    weightTon: 27.8,
    pickupOrder: 1,
    pickupEtaLabel: "08:45",
    customsStatus: "GREEN_CLEARED",
    edoValid: true,
    dwellDays: 9,
    reeferHours: 0,
    hauler: "Tan Thuan",
    truckPlate: "51J-112.66",
    row: 2,
    tier: 0,
  },
  {
    containerNo: "COSU4410909",
    size: "40HC",
    cargo: "dry",
    weightTon: 22.1,
    pickupOrder: 6,
    pickupEtaLabel: "12:15",
    customsStatus: "GREEN_CLEARED",
    edoValid: true,
    dwellDays: 6,
    reeferHours: 0,
    hauler: "Nam An",
    truckPlate: "51B-210.44",
    row: 2,
    tier: 1,
  },
  {
    containerNo: "ZIMU3301901",
    size: "20DC",
    cargo: "dry",
    weightTon: 15.4,
    pickupOrder: 10,
    pickupEtaLabel: "15:45",
    customsStatus: "GREEN_CLEARED",
    edoValid: true,
    dwellDays: 4,
    reeferHours: 0,
    hauler: "Sai Gon Haul",
    truckPlate: "51E-221.09",
    row: 2,
    tier: 2,
  },
  // Row 3 (Dry row)
  {
    containerNo: "EGLU7712008",
    size: "40HC",
    cargo: "dry",
    weightTon: 25.0,
    pickupOrder: 8,
    pickupEtaLabel: "14:20",
    customsStatus: "GREEN_CLEARED",
    edoValid: true,
    dwellDays: 7,
    reeferHours: 0,
    hauler: "Binh Tan",
    truckPlate: "51Q-905.05",
    row: 3,
    tier: 0,
  },
  {
    containerNo: "WHLU5501201",
    size: "20DC",
    cargo: "dry",
    weightTon: 19.6,
    pickupOrder: 4,
    pickupEtaLabel: "10:30",
    customsStatus: "YELLOW_HOLD",
    edoValid: true,
    dwellDays: 12,
    reeferHours: 0,
    hauler: "Tan Thuan",
    truckPlate: "51L-119.08",
    row: 3,
    tier: 1,
  },
  // Row 4 (Dry row)
  {
    containerNo: "SITG2091800",
    size: "20DC",
    cargo: "dry",
    weightTon: 20.5,
    pickupOrder: 12,
    pickupEtaLabel: "17:00",
    customsStatus: "GREEN_CLEARED",
    edoValid: true,
    dwellDays: 3,
    reeferHours: 0,
    hauler: "Sai Gon Haul",
    truckPlate: "51R-331.19",
    row: 4,
    tier: 0,
  },
  // Row 5 (Dry row)
  {
    containerNo: "HAHU3109404",
    size: "20DC",
    cargo: "dry",
    weightTon: 17.3,
    pickupOrder: 3,
    pickupEtaLabel: "09:50",
    customsStatus: "GREEN_CLEARED",
    edoValid: true,
    dwellDays: 5,
    reeferHours: 0,
    hauler: "Nam An",
    truckPlate: "51A-100.61",
    row: 5,
    tier: 0,
  },
] as const;

export function buildBayGrid(
  containers: readonly YardContainer[],
  config: BayConfig = DEFAULT_BAY_CONFIG,
): (YardContainer | null)[][] {
  const grid: (YardContainer | null)[][] = Array.from({ length: config.nRows }, () =>
    Array.from({ length: config.maxTiers }, () => null),
  );
  for (const c of containers) {
    if (c.row >= 0 && c.row < config.nRows && c.tier >= 0 && c.tier < config.maxTiers) {
      grid[c.row]![c.tier] = { ...c };
    }
  }
  return grid;
}

function cloneGrid(grid: (YardContainer | null)[][]): (YardContainer | null)[][] {
  return grid.map((col) => col.map((cell) => (cell ? { ...cell } : null)));
}

function columnHeight(col: (YardContainer | null)[]): number {
  let h = 0;
  for (let t = 0; t < col.length; t++) {
    if (col[t]) h = t + 1;
  }
  return h;
}

function columnMinPickupOrder(col: (YardContainer | null)[]): number {
  let minOrder = Number.POSITIVE_INFINITY;
  for (const c of col) {
    if (c && c.pickupOrder < minOrder) minOrder = c.pickupOrder;
  }
  return minOrder;
}

/**
 * Exact Min-Rehandle Container Retrieval Solver (Caserta / Kim & Hong min-max pickup order heuristic).
 * Relocates every container above the target container without creating avoidable future blocking inversions.
 */
export function solveBayRetrieval(
  targetContainerNo: string,
  containers: readonly YardContainer[] = SEED_BAY_CONTAINERS,
  config: BayConfig = DEFAULT_BAY_CONFIG,
): BayRetrievalPlan {
  const initialGrid = buildBayGrid(containers, config);
  const working = cloneGrid(initialGrid);

  let target: YardContainer | null = null;
  for (const c of containers) {
    if (c.containerNo === targetContainerNo) {
      target = { ...c };
      break;
    }
  }
  if (!target) {
    target = { ...containers[0]! };
  }

  const tRow = target.row;
  const tTier = target.tier;
  const col = working[tRow]!;
  const topH = columnHeight(col);

  const blockingContainers: YardContainer[] = [];
  for (let tier = topH - 1; tier > tTier; tier--) {
    const b = col[tier];
    if (b) blockingContainers.push({ ...b });
  }

  const steps: CraneMoveStep[] = [];
  let cleanRehandles = 0;
  let secondaryRiskMoves = 0;

  // Pop each blocker from top down and place on best target row
  for (let tier = topH - 1; tier > tTier; tier--) {
    const blocker = col[tier];
    if (!blocker) continue;
    col[tier] = null;

    // Evaluate all other rows r != tRow with available height < maxTiers
    let bestRow = -1;
    let bestScore = Number.POSITIVE_INFINITY;
    let isClean = false;

    for (let r = 0; r < config.nRows; r++) {
      if (r === tRow) continue;
      const h = columnHeight(working[r]!);
      if (h >= config.maxTiers) continue;

      // Prefer reefer rows for reefer containers if possible
      const reeferPenalty =
        blocker.cargo === "reefer" && !config.reeferRows.includes(r) ? 500 : 0;
      const minOrder = columnMinPickupOrder(working[r]!);

      if (minOrder > blocker.pickupOrder) {
        // Clean move: blocker will depart BEFORE everything currently in row r!
        const gap = (minOrder === Number.POSITIVE_INFINITY ? 100 : minOrder - blocker.pickupOrder) + reeferPenalty;
        if (!isClean || gap < bestScore) {
          isClean = true;
          bestScore = gap;
          bestRow = r;
        }
      } else if (!isClean) {
        // No clean column found yet: maximize minOrder so secondary rehandle happens as late as possible
        const fallbackScore = -minOrder * 10 + Math.abs(r - tRow) + reeferPenalty;
        if (fallbackScore < bestScore) {
          bestScore = fallbackScore;
          bestRow = r;
        }
      }
    }

    if (bestRow < 0) bestRow = (tRow + 1) % config.nRows;
    const destTier = columnHeight(working[bestRow]!);
    working[bestRow]![destTier] = { ...blocker, row: bestRow, tier: destTier };

    if (isClean) cleanRehandles += 1;
    else secondaryRiskMoves += 1;

    steps.push({
      stepNo: steps.length + 1,
      action: "RELOCATE_BLOCKER",
      containerNo: blocker.containerNo,
      fromRow: tRow,
      fromTier: tier,
      toRow: bestRow,
      toTier: destTier,
      cleanMove: isClean,
      reason: isClean
        ? `Chuyển sang Row ${bestRow + 1} Tier ${destTier + 1} (Không chặn cont nào lấy sớm hơn · 0 đảo chuyển phụ)`
        : `Chuyển sang Row ${bestRow + 1} Tier ${destTier + 1} (Cột ít xung đột nhất)`,
      craneMinutes: 2.5,
    });
  }

  // Final move: retrieve target container onto truck chassis
  col[tTier] = null;
  steps.push({
    stepNo: steps.length + 1,
    action: "RETRIEVE_TARGET",
    containerNo: target.containerNo,
    fromRow: tRow,
    fromTier: tTier,
    toRow: "TRUCK_CHASSIS",
    toTier: null,
    cleanMove: true,
    reason: `Cẩu RTG gắp ${target.containerNo} từ Row ${tRow + 1} Tier ${tTier + 1} hạ lên sơ-mi rơ-moóc xe ${target.truckPlate}`,
    craneMinutes: 2.0,
  });

  const totalCraneMinutes = steps.reduce((s, st) => s + st.craneMinutes, 0);

  return {
    targetContainer: target,
    initialGrid,
    finalGrid: working,
    blockingContainers,
    rehandleCount: blockingContainers.length,
    cleanRehandles,
    secondaryRiskMoves,
    totalCraneMinutes,
    steps,
  };
}

/**
 * Recommends the best (row, tier) slot in the bay for an incoming Gate-In container.
 */
export function recommendIncomingSlot(
  incoming: Pick<YardContainer, "cargo" | "weightTon" | "pickupOrder">,
  containers: readonly YardContainer[] = SEED_BAY_CONTAINERS,
  config: BayConfig = DEFAULT_BAY_CONFIG,
): SlotRecommendation[] {
  const grid = buildBayGrid(containers, config);
  const out: SlotRecommendation[] = [];

  for (let r = 0; r < config.nRows; r++) {
    const col = grid[r]!;
    const h = columnHeight(col);
    if (h >= config.maxTiers) continue;

    const minOrder = columnMinPickupOrder(col);
    const below = h > 0 ? col[h - 1] : null;
    const causesBlockingInversion = incoming.pickupOrder > minOrder;
    const weightViolation = below != null && incoming.weightTon > below.weightTon + 4;
    const reeferCompatible = incoming.cargo !== "reefer" || config.reeferRows.includes(r);

    let score = 100;
    if (!reeferCompatible) score -= 60;
    if (causesBlockingInversion) score -= 35;
    if (weightViolation) score -= 20;
    score -= h * 4;

    out.push({
      row: r,
      tier: h,
      score,
      causesBlockingInversion,
      weightViolation,
      reeferCompatible,
      reason: !reeferCompatible
        ? `Row ${r + 1} không có ổ cắm điện lạnh Reefer`
        : causesBlockingInversion
          ? `Đặt lên Row ${r + 1} Tier ${h + 1} sẽ đè lên cont lấy sớm hơn (pickup #${minOrder})`
          : `Row ${r + 1} Tier ${h + 1} tối ưu: không chặn cont dưới, đúng phân tầng trọng lượng (${incoming.weightTon}t)`,
    });
  }

  return out.sort((a, b) => b.score - a.score);
}

/**
 * Progressive Port Tariff & Demurrage/Detention Billing Calculator (VND & USD).
 */
export function calculateContainerBilling(
  container: YardContainer,
  rehandleMoves = 0,
): PortBillingInvoice {
  const is40 = container.size.startsWith("40");
  const isReefer = container.cargo === "reefer";
  const teu = is40 ? 2 : 1;
  const freeDays = isReefer ? 2 : 5;
  const chargeableDays = Math.max(0, container.dwellDays - freeDays);

  const lines: TariffLineItem[] = [];

  // 1. Lift-on / Lift-off (Nâng hạ container tại bãi)
  const loloUnitVnd = isReefer
    ? is40
      ? 1_850_000
      : 1_250_000
    : is40
      ? 1_480_000
      : 980_000;
  lines.push({
    code: "LOLO-GATE",
    description: `Cước nâng/hạ container (${container.size} · ${isReefer ? "Lạnh" : "Khô"})`,
    quantity: 1,
    unit: "cont",
    unitPriceVnd: loloUnitVnd,
    amountVnd: loloUnitVnd,
  });

  // 2. Progressive Storage (Lưu bãi lũy tiến theo bậc ngày)
  if (chargeableDays > 0) {
    const tier1Days = Math.min(5, chargeableDays);
    const tier2Days = Math.max(0, Math.min(5, chargeableDays - 5));
    const tier3Days = Math.max(0, chargeableDays - 10);

    const t1Rate = (isReefer ? 180_000 : 75_000) * teu;
    const t2Rate = (isReefer ? 290_000 : 135_000) * teu;
    const t3Rate = (isReefer ? 450_000 : 240_000) * teu;

    if (tier1Days > 0) {
      lines.push({
        code: "STOR-T1",
        description: `Lưu bãi bậc 1 (Ngày ${freeDays + 1}–${freeDays + tier1Days} · ${teu} TEU)`,
        quantity: tier1Days,
        unit: "ngày",
        unitPriceVnd: t1Rate,
        amountVnd: tier1Days * t1Rate,
      });
    }
    if (tier2Days > 0) {
      lines.push({
        code: "STOR-T2",
        description: `Lưu bãi bậc 2 (Ngày ${freeDays + 6}–${freeDays + 5 + tier2Days} · ${teu} TEU)`,
        quantity: tier2Days,
        unit: "ngày",
        unitPriceVnd: t2Rate,
        amountVnd: tier2Days * t2Rate,
      });
    }
    if (tier3Days > 0) {
      lines.push({
        code: "STOR-T3",
        description: `Lưu bãi bậc 3 (Trên ${freeDays + 10} ngày · ${teu} TEU)`,
        quantity: tier3Days,
        unit: "ngày",
        unitPriceVnd: t3Rate,
        amountVnd: tier3Days * t3Rate,
      });
    }
  }

  // 3. Reefer power & PTI monitoring
  if (isReefer && container.reeferHours > 0) {
    const elecRate = is40 ? 145_000 : 95_000;
    lines.push({
      code: "REEFER-ELEC",
      description: `Cước điện lạnh & giám sát PTI (${container.size})`,
      quantity: container.reeferHours,
      unit: "giờ",
      unitPriceVnd: elecRate,
      amountVnd: container.reeferHours * elecRate,
    });
  }

  // 4. Rehandle / Shifting moves
  if (rehandleMoves > 0) {
    const shiftRate = 420_000;
    lines.push({
      code: "YARD-SHIFT",
      description: `Phí đảo chuyển / rút container tầng dưới (${rehandleMoves} thao tác RTG)`,
      quantity: rehandleMoves,
      unit: "lượt",
      unitPriceVnd: shiftRate,
      amountVnd: rehandleMoves * shiftRate,
    });
  }

  const subtotalVnd = lines.reduce((s, l) => s + l.amountVnd, 0);
  const vatRatePct = 8;
  const vatVnd = Math.round(subtotalVnd * 0.08);
  const totalVnd = subtotalVnd + vatVnd;
  const totalUsd = Number((totalVnd / 25_450).toFixed(2));

  return {
    invoiceNo: `INV-TOS-${container.containerNo.slice(-5)}`,
    containerNo: container.containerNo,
    size: container.size,
    dwellDays: container.dwellDays,
    freeDays,
    chargeableDays,
    rehandleMovesBilled: rehandleMoves,
    reeferPlugHours: container.reeferHours,
    lines,
    subtotalVnd,
    vatRatePct,
    vatVnd,
    totalVnd,
    totalUsd,
    paymentStatus: container.customsStatus === "GREEN_CLEARED" ? "PAID_EPORT" : "UNPAID_HOLD",
  };
}

/**
 * Evaluates a complete Smart Gate eEIR transaction combining ISO 6346, Customs, eDO, Yard Retrieval, and Billing.
 */
export function evaluateGateTransaction(
  container: YardContainer,
  rehandleMoves: number,
  overrideApproveHold = false,
): GateEirReceipt {
  const iso = validateIso6346(container.containerNo);
  const billing = calculateContainerBilling(container, rehandleMoves);
  const customsCleared = overrideApproveHold || container.customsStatus === "GREEN_CLEARED";
  const edoCleared = overrideApproveHold || container.edoValid;
  const billingCleared = overrideApproveHold || billing.paymentStatus === "PAID_EPORT";

  const holdReasons: string[] = [];
  if (!iso.valid) holdReasons.push(iso.reason);
  if (!customsCleared) holdReasons.push(`Hải quan VASSCM đang giữ (${container.customsStatus})`);
  if (!edoCleared) holdReasons.push("Lệnh giao nhận eDO hãng tàu hết hạn");
  if (!billingCleared) holdReasons.push(`Chưa thanh toán hóa đơn cảng ${billing.invoiceNo}`);

  const estimatedTurnaroundMin = 12 + rehandleMoves * 3;

  return {
    eirNo: `eEIR-${container.containerNo.slice(0, 4)}-${container.row + 1}${container.tier + 1}`,
    gateLane: container.cargo === "reefer" ? "Lane G2 (Reefer/OCR)" : "Lane G1 (Auto-ePort)",
    direction: "GATE_OUT",
    containerNo: container.containerNo,
    isoValid: iso.valid,
    truckPlate: container.truckPlate,
    yardCoordinate: `B02-14-R0${container.row + 1}-T0${container.tier + 1}`,
    customsCleared,
    edoCleared,
    billingCleared,
    rehandleMovesRequired: rehandleMoves,
    estimatedTurnaroundMin,
    status: holdReasons.length === 0 ? "ISSUED_GREEN" : "HELD_AT_GATE",
    holdReasons,
  };
}

/**
 * Connects Micro-TOS CFS LCL consolidation to the 3D Extreme-Point WASM/JS Bin-Packer (pack3d.ts).
 */
export function packCfsCargo3D(): {
  bin: Bin3;
  items: Box3[];
  poses: Pose3[];
  utilizationPct: number;
  binsUsed: number;
} {
  // Standard 20' Dry Container internal dimensions in decimeters: 59 x 23 x 23 dm
  const bin: Bin3 = { W: 59, H: 23, D: 23 };
  const items: Box3[] = [
    { id: "PAL-01", w: 12, h: 11, d: 10 },
    { id: "PAL-02", w: 12, h: 11, d: 10 },
    { id: "PAL-03", w: 12, h: 11, d: 10 },
    { id: "PAL-04", w: 12, h: 11, d: 10 },
    { id: "PAL-05", w: 11, h: 10, d: 10 },
    { id: "PAL-06", w: 11, h: 10, d: 10 },
    { id: "PAL-07", w: 10, h: 10, d: 9 },
    { id: "PAL-08", w: 10, h: 10, d: 9 },
    { id: "PAL-09", w: 10, h: 9, d: 8 },
    { id: "PAL-10", w: 10, h: 9, d: 8 },
  ];
  const poses = packExtremeFFD(items, bin, true);
  const totalItemVol = items.reduce((s, it) => s + volume(it), 0);
  const binVol = volume({ w: bin.W, h: bin.H, d: bin.D });
  const binsUsed = Math.max(1, ...poses.map((p) => p.bin + 1));
  const utilizationPct = Number(((totalItemVol / (binVol * binsUsed)) * 100).toFixed(1));
  return { bin, items, poses, utilizationPct, binsUsed };
}
