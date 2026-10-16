export type CustomsChannel = "GREEN" | "YELLOW" | "RED";
export type IsoSizeCode = "22G1" | "45G1" | "22R1" | "45R1";

export interface Iso6346Verdict {
  raw: string;
  normalized: string;
  ownerPrefix: string;
  serialDigits: string;
  givenCheckDigit: number | null;
  expectedCheckDigit: number | null;
  valid: boolean;
  correctedContainerNo: string;
  reason: string;
}

export interface CustomsVnaccsDoc {
  declarationNo: string;
  flowType: "IMPORT" | "EXPORT";
  channel: CustomsChannel;
  customsOfficeCode: "02CI" | "02B1" | "02H1" | "02IK";
  customsOfficeName: string;
  taxPaid: boolean;
  vascmGetOutApproved: boolean;
  containerNo: string;
  customsSeal: string;
  declaredGrossWeightKg: number;
  hsCode: string;
}

export interface CarrierEdoDoc {
  edoNumber: string;
  carrier: string;
  billOfLading: string;
  bookingNo: string;
  vesselName: string;
  voyageNo: string;
  containerNo: string;
  isoSizeType: IsoSizeCode;
  carrierSeal: string;
  vgmWeightKg: number;
  freeDemurrageUntilHour: number;
  closingTimeHour: number;
  releaseTerminalCode: "VNSGN-CATLAI" | "VNSGN-TANTHUAN" | "VNSGN-HIEPPHUOC" | "VNSGN-SPITC";
  digitalSignatureValid: boolean;
}

export interface TerminalTosDoc {
  eirNumber: string;
  terminalCode: "VNSGN-CATLAI" | "VNSGN-TANTHUAN" | "VNSGN-HIEPPHUOC" | "VNSGN-SPITC";
  tosSystem: "TOPOVN_EPORT" | "SGP_VTOS" | "CATOS" | "NAVIS_N4";
  yardSlot: string;
  containerNo: string;
  recordedSeal: string;
  weighbridgeGrossKg: number;
  pickupHour: number;
  terminalHoldReason: string | null;
}

export interface PaperHandoverDoc {
  rawPaperNote: string;
  scannedContainerNo: string;
  scannedSeal: string;
  truckPlate: string;
  chassisPlate: string;
  driverName: string;
  paperTerminalCode: "VNSGN-CATLAI" | "VNSGN-TANTHUAN" | "VNSGN-HIEPPHUOC" | "VNSGN-SPITC";
}

export interface ShipmentDocumentCase {
  id: string;
  title: string;
  subtitle: string;
  customs: CustomsVnaccsDoc;
  edo: CarrierEdoDoc;
  tos: TerminalTosDoc;
  paper: PaperHandoverDoc;
}

export type DiscrepancyCode =
  | "ISO6346_CHECK_DIGIT_ERROR"
  | "CONTAINER_ID_MISMATCH"
  | "SEAL_MISMATCH"
  | "SOLAS_VGM_WEIGHT_DISCREPANCY"
  | "CUSTOMS_VASSCM_HOLD"
  | "EDO_DEMURRAGE_EXPIRED"
  | "TERMINAL_CODE_MISMATCH"
  | "TERMINAL_COMMERCIAL_HOLD";

export interface DocumentDiscrepancy {
  code: DiscrepancyCode;
  severity: "BLOCKER" | "WARNING";
  field: string;
  partiesInvolved: string[];
  paperOrLeftValue: string;
  electronicOrRightValue: string;
  message: string;
  autoFixAction: string;
}

export interface CanonicalIdentifierBundle {
  ucrToken: string;
  canonicalContainerNo: string;
  isoSizeType: IsoSizeCode;
  vnaccsDeclarationNo: string;
  carrierBillOfLading: string;
  carrierEdoNumber: string;
  tosEirNumber: string;
  vesselVoyageKey: string;
  truckPlate: string;
  verifiedSeal: string;
  verifiedVgmKg: number;
}

export interface ReconciliationResult {
  caseId: string;
  gateReleaseStatus: "CLEARED_DIGITAL" | "BLOCKED_DISCREPANCY" | "AUTO_RECONCILED";
  isoVerdict: Iso6346Verdict;
  paperIsoVerdict: Iso6346Verdict;
  discrepancies: DocumentDiscrepancy[];
  canonicalIds: CanonicalIdentifierBundle;
  edifactCoreor: string;
  edifactCodeco: string;
  vnaccsVascmXml: string;
  dcsaCanonicalJson: string;
}

const ISO_LETTER_VALUES: Record<string, number> = {
  A: 10,
  B: 12,
  C: 13,
  D: 14,
  E: 15,
  F: 16,
  G: 17,
  H: 18,
  I: 19,
  J: 20,
  K: 21,
  L: 23,
  M: 24,
  N: 25,
  O: 26,
  P: 27,
  Q: 28,
  R: 29,
  S: 30,
  T: 31,
  U: 32,
  V: 34,
  W: 35,
  X: 36,
  Y: 37,
  Z: 38,
};

/**
 * Exact ISO 6346 check-digit calculation (4 letters + 6 digits -> modulo 11 check digit).
 */
export function computeIso6346CheckDigit(firstTenChars: string): number | null {
  const clean = firstTenChars.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (clean.length < 10) return null;
  const prefix = clean.slice(0, 4);
  const serial = clean.slice(4, 10);
  if (!/^[A-Z]{4}$/.test(prefix) || !/^\d{6}$/.test(serial)) return null;
  let sum = 0;
  for (let i = 0; i < 4; i++) {
    const val = ISO_LETTER_VALUES[prefix[i]!];
    if (val === undefined) return null;
    sum += val * (1 << i);
  }
  for (let i = 0; i < 6; i++) {
    const d = Number(serial[i]);
    sum += d * (1 << (i + 4));
  }
  const rem = sum % 11;
  return rem === 10 ? 0 : rem;
}

export function validateIso6346(rawContainerNo: string): Iso6346Verdict {
  const normalized = rawContainerNo.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const match = normalized.match(/^([A-Z]{4})(\d{6})(\d)?$/);
  if (!match) {
    return {
      raw: rawContainerNo,
      normalized,
      ownerPrefix: normalized.slice(0, 4),
      serialDigits: normalized.slice(4, 10),
      givenCheckDigit: null,
      expectedCheckDigit: null,
      valid: false,
      correctedContainerNo: normalized,
      reason: "Không đúng định dạng chuẩn ISO 6346 (4 chữ cái tiếp đầu ngữ + 6 chữ số + 1 số kiểm tra).",
    };
  }
  const ownerPrefix = match[1]!;
  const serialDigits = match[2]!;
  const givenCheckDigit = match[3] !== undefined ? Number(match[3]) : null;
  const expectedCheckDigit = computeIso6346CheckDigit(ownerPrefix + serialDigits);
  const correctedContainerNo = `${ownerPrefix}${serialDigits}${expectedCheckDigit ?? 0}`;
  const valid = givenCheckDigit !== null && givenCheckDigit === expectedCheckDigit;
  return {
    raw: rawContainerNo,
    normalized,
    ownerPrefix,
    serialDigits,
    givenCheckDigit,
    expectedCheckDigit,
    valid,
    correctedContainerNo,
    reason: valid
      ? `Chuẩn ISO 6346 hợp lệ (Check-digit = ${expectedCheckDigit}).`
      : `Sai số kiểm tra ISO 6346: giấy ghi ${givenCheckDigit ?? "thiếu"}, công thức modulo-11 chuẩn phải là ${expectedCheckDigit} (${correctedContainerNo}).`,
  };
}

const OFFICE_TO_PORT: Record<CustomsVnaccsDoc["customsOfficeCode"], TerminalTosDoc["terminalCode"]> = {
  "02CI": "VNSGN-CATLAI",
  "02B1": "VNSGN-TANTHUAN",
  "02H1": "VNSGN-HIEPPHUOC",
  "02IK": "VNSGN-SPITC",
};

export const SHIPMENT_DOCUMENT_CASES: readonly ShipmentDocumentCase[] = [
  {
    id: "DOC-CASE-1-PAPER-DISCREPANCY",
    title: "Ca 1 · Lệch chì (Seal) + Sai số kiểm tra ISO 6346 trên phiếu giấy + Quá hạn DEM eDO",
    subtitle: "Tân Thuận (SGP-TOS VTOS) · Maersk eDO · Hải quan Chi cục KV4 (02B1)",
    customs: {
      declarationNo: "106284910240",
      flowType: "IMPORT",
      channel: "GREEN",
      customsOfficeCode: "02B1",
      customsOfficeName: "Chi cục HQ CK Cảng Sài Gòn KV4 (Tân Thuận)",
      taxPaid: true,
      vascmGetOutApproved: true,
      containerNo: "MSKU4029100",
      customsSeal: "ML-VN992841",
      declaredGrossWeightKg: 24800,
      hsCode: "8504.40.90",
    },
    edo: {
      edoNumber: "EDO-MSK-2026-88412",
      carrier: "Maersk Line",
      billOfLading: "MAEU260918420",
      bookingNo: "BKG-MAEU-9912",
      vesselName: "MAERSK HANOI",
      voyageNo: "441S",
      containerNo: "MSKU4029100",
      isoSizeType: "45G1",
      carrierSeal: "ML-VN992841",
      vgmWeightKg: 24800,
      freeDemurrageUntilHour: 96,
      closingTimeHour: 120,
      releaseTerminalCode: "VNSGN-TANTHUAN",
      digitalSignatureValid: true,
    },
    tos: {
      eirNumber: "EIR-VTOS-TT-77419",
      terminalCode: "VNSGN-TANTHUAN",
      tosSystem: "SGP_VTOS",
      yardSlot: "B02-14-03-01",
      containerNo: "MSKU4029100",
      recordedSeal: "ML-VN992841",
      weighbridgeGrossKg: 24860,
      pickupHour: 114,
      terminalHoldReason: null,
    },
    paper: {
      rawPaperNote:
        "Phiếu giao nhận tay cổng B Tân Thuận: Xe 51C-882.13 nhận cont MSKU4029107, seal ML-992849, tài xế Nguyễn Văn Hùng",
      scannedContainerNo: "MSKU4029107",
      scannedSeal: "ML-992849",
      truckPlate: "51C-882.13",
      chassisPlate: "51R-192.44",
      driverName: "Nguyễn Văn Hùng",
      paperTerminalCode: "VNSGN-TANTHUAN",
    },
  },
  {
    id: "DOC-CASE-2-CUSTOMS-VGM-HOLD",
    title: "Ca 2 · Tờ khai Luồng Vàng chưa duyệt VASSCM + Lệch cân VGM vượt ngưỡng SOLAS 5%",
    subtitle: "Tân Cảng Cát Lái (TOPOVN / ePort) · ONE Line · Chi cục HQ KV1 (02CI)",
    customs: {
      declarationNo: "306291044810",
      flowType: "EXPORT",
      channel: "YELLOW",
      customsOfficeCode: "02CI",
      customsOfficeName: "Chi cục HQ CK Cảng Sài Gòn KV1 (Cát Lái)",
      taxPaid: true,
      vascmGetOutApproved: false,
      containerNo: "ONEU5120303",
      customsSeal: "ONE-SG77410",
      declaredGrossWeightKg: 19200,
      hsCode: "0306.17.10",
    },
    edo: {
      edoNumber: "EDO-ONE-2026-55190",
      carrier: "ONE (Ocean Network Express)",
      billOfLading: "ONEYSGN60291100",
      bookingNo: "SGN60291100",
      vesselName: "ONE REINFORCEMENT",
      voyageNo: "082E",
      containerNo: "ONEU5120303",
      isoSizeType: "45R1",
      carrierSeal: "ONE-SG77410",
      vgmWeightKg: 19200,
      freeDemurrageUntilHour: 140,
      closingTimeHour: 108,
      releaseTerminalCode: "VNSGN-CATLAI",
      digitalSignatureValid: true,
    },
    tos: {
      eirNumber: "EIR-EPORT-CTL-91024",
      terminalCode: "VNSGN-CATLAI",
      tosSystem: "TOPOVN_EPORT",
      yardSlot: "R01-08-02-03",
      containerNo: "ONEU5120303",
      recordedSeal: "ONE-SG77410",
      weighbridgeGrossKg: 21450,
      pickupHour: 92,
      terminalHoldReason: null,
    },
    paper: {
      rawPaperNote: "ePort/Giấy hạ bãi Cát Lái: Xe 51F-901.11 hạ cont lạnh ONEU5120303, seal ONE-SG77410, cân 21.450kg",
      scannedContainerNo: "ONEU5120303",
      scannedSeal: "ONE-SG77410",
      truckPlate: "51F-901.11",
      chassisPlate: "51R-401.12",
      driverName: "Trần Minh Tuấn",
      paperTerminalCode: "VNSGN-CATLAI",
    },
  },
  {
    id: "DOC-CASE-3-CROSS-PORT-MISMATCH",
    title: "Ca 3 · Lệnh hãng tàu phát hành ở Cát Lái nhưng tàu đã chuyển cầu sang SP-ITC (Chưa đồng bộ mã cảng)",
    subtitle: "SP-ITC (VTOS) ↔ Cát Lái (ePort) · SITC Lines · Hải quan KV1/SP-ITC",
    customs: {
      declarationNo: "106299812030",
      flowType: "IMPORT",
      channel: "GREEN",
      customsOfficeCode: "02IK",
      customsOfficeName: "HQ Cảng Quốc tế SP-ITC (02IK)",
      taxPaid: true,
      vascmGetOutApproved: true,
      containerNo: "CMAU7182004",
      customsSeal: "SITC-882104",
      declaredGrossWeightKg: 22100,
      hsCode: "3902.10.40",
    },
    edo: {
      edoNumber: "EDO-SITC-2026-3109",
      carrier: "SITC Container Lines",
      billOfLading: "SITCSGN2410992",
      bookingNo: "BKG-SITC-2410",
      vesselName: "SITC HOCHIMINH",
      voyageNo: "2442S",
      containerNo: "CMAU7182004",
      isoSizeType: "22G1",
      carrierSeal: "SITC-882104",
      vgmWeightKg: 22100,
      freeDemurrageUntilHour: 120,
      closingTimeHour: 140,
      releaseTerminalCode: "VNSGN-CATLAI",
      digitalSignatureValid: true,
    },
    tos: {
      eirNumber: "EIR-VTOS-ITC-44102",
      terminalCode: "VNSGN-SPITC",
      tosSystem: "SGP_VTOS",
      yardSlot: "A05-06-04-02",
      containerNo: "CMAU7182004",
      recordedSeal: "SITC-882104",
      weighbridgeGrossKg: 22140,
      pickupHour: 84,
      terminalHoldReason: null,
    },
    paper: {
      rawPaperNote: "Lệnh giấy cũ ghi nhận hàng tại Cát Lái, xe 51D-120.68 đã chạy tới cổng SP-ITC nhận cont CMAU7182004",
      scannedContainerNo: "CMAU7182004",
      scannedSeal: "SITC-882104",
      truckPlate: "51D-120.68",
      chassisPlate: "51R-330.18",
      driverName: "Lê Hoàng Nam",
      paperTerminalCode: "VNSGN-CATLAI",
    },
  },
] as const;

export function reconcileShipmentDocuments(
  docCase: ShipmentDocumentCase,
  applyAutoReconcile = false,
): ReconciliationResult {
  const isoVerdict = validateIso6346(docCase.edo.containerNo);
  const paperIsoVerdict = validateIso6346(docCase.paper.scannedContainerNo);
  const discrepancies: DocumentDiscrepancy[] = [];

  // 1. Check ISO 6346 check-digit on paper/scanned container number
  if (!paperIsoVerdict.valid) {
    discrepancies.push({
      code: "ISO6346_CHECK_DIGIT_ERROR",
      severity: "BLOCKER",
      field: "Container Number (ISO 6346)",
      partiesInvolved: ["Giấy / OCR Nhà xe", "TOS Cảng", "Hãng tàu eDO"],
      paperOrLeftValue: docCase.paper.scannedContainerNo,
      electronicOrRightValue: paperIsoVerdict.correctedContainerNo,
      message: paperIsoVerdict.reason,
      autoFixAction: `Chuẩn hóa mã container theo modulo-11 ISO 6346 → ${paperIsoVerdict.correctedContainerNo} khớp với eDO & tờ khai ${docCase.customs.declarationNo}.`,
    });
  } else if (docCase.paper.scannedContainerNo !== docCase.edo.containerNo) {
    discrepancies.push({
      code: "CONTAINER_ID_MISMATCH",
      severity: "BLOCKER",
      field: "Container ID",
      partiesInvolved: ["Giấy giao nhận", "Hãng tàu eDO"],
      paperOrLeftValue: docCase.paper.scannedContainerNo,
      electronicOrRightValue: docCase.edo.containerNo,
      message: `Số container trên giấy (${docCase.paper.scannedContainerNo}) lệch với lệnh eDO điện tử (${docCase.edo.containerNo}).`,
      autoFixAction: `Áp mã định danh điện tử gốc ${docCase.edo.containerNo} từ COPARN/eDO đã ký số.`,
    });
  }

  // 2. Check Seal consistency across Paper, Carrier eDO, and Customs VNACCS
  if (
    docCase.paper.scannedSeal !== docCase.edo.carrierSeal ||
    docCase.customs.customsSeal !== docCase.edo.carrierSeal
  ) {
    discrepancies.push({
      code: "SEAL_MISMATCH",
      severity: "BLOCKER",
      field: "Số chì (Container Seal)",
      partiesInvolved: ["Giấy tại cổng", "Hãng tàu eDO", "Hải quan VASSCM"],
      paperOrLeftValue: docCase.paper.scannedSeal,
      electronicOrRightValue: `${docCase.edo.carrierSeal} (eDO/TOS)`,
      message: `Số chì ghi tay (${docCase.paper.scannedSeal}) không khớp số chì gốc trên eDO hãng tàu & biên bản dỡ tàu COARRI (${docCase.edo.carrierSeal}).`,
      autoFixAction: `Đối chiếu ảnh chụp camera cổng OCR + bản tin COARRI, cập nhật biên bản điều chỉnh chì điện tử ${docCase.edo.carrierSeal}.`,
    });
  }

  // 3. Check SOLAS VGM / Weighbridge discrepancy (> 500 kg or > 5%)
  const weightDeltaKg = Math.abs(docCase.tos.weighbridgeGrossKg - docCase.edo.vgmWeightKg);
  const weightPct = (weightDeltaKg / Math.max(1, docCase.edo.vgmWeightKg)) * 100;
  if (weightDeltaKg > 500 || weightPct > 5) {
    discrepancies.push({
      code: "SOLAS_VGM_WEIGHT_DISCREPANCY",
      severity: "BLOCKER",
      field: "Trọng lượng VGM / Cân cầu cảng (SOLAS)",
      partiesInvolved: ["Cân điện tử TOS", "Bản khai VGM (VERMAS)", "Tờ khai VNACCS"],
      paperOrLeftValue: `${docCase.tos.weighbridgeGrossKg.toLocaleString("en-US")} kg (Cân cổng)`,
      electronicOrRightValue: `${docCase.edo.vgmWeightKg.toLocaleString("en-US")} kg (VGM/Tờ khai)`,
      message: `Lệch trọng lượng ${weightDeltaKg.toLocaleString("en-US")} kg (${weightPct.toFixed(1)}%), vượt ngưỡng an toàn SOLAS VGM (±5% hoặc 500 kg).`,
      autoFixAction: `Phát hành bản tin UN/EDIFACT VERMAS cập nhật VGM thực tế ${docCase.tos.weighbridgeGrossKg} kg lên TOS & Hãng tàu.`,
    });
  }

  // 4. Check Customs VNACCS / VASSCM clearance
  if (!docCase.customs.vascmGetOutApproved || docCase.customs.channel !== "GREEN") {
    discrepancies.push({
      code: "CUSTOMS_VASSCM_HOLD",
      severity: "BLOCKER",
      field: "Thông quan VASSCM (Tờ khai VNACCS)",
      partiesInvolved: ["Hải quan VASSCM", "TOS Cổng Cảng"],
      paperOrLeftValue: `Luồng ${docCase.customs.channel} · Get-Out=${docCase.customs.vascmGetOutApproved ? "OK" : "HOLD"}`,
      electronicOrRightValue: "Yêu cầu GREEN / VASSCM Get-Out Approved",
      message: `Tờ khai ${docCase.customs.declarationNo} đang ở luồng ${docCase.customs.channel} và chưa có điện xác nhận qua khu vực giám sát (VASSCM Get-Out).`,
      autoFixAction: `Truy vấn tự động cổng VASSCM Hải quan theo số tờ khai ${docCase.customs.declarationNo} + đồng bộ trạng thái giải phóng hàng lên TOS.`,
    });
  }

  // 5. Check eDO Demurrage free-time expiry
  if (docCase.tos.pickupHour > docCase.edo.freeDemurrageUntilHour) {
    const overHours = docCase.tos.pickupHour - docCase.edo.freeDemurrageUntilHour;
    discrepancies.push({
      code: "EDO_DEMURRAGE_EXPIRED",
      severity: "WARNING",
      field: "Hạn lệnh eDO & Lưu bãi (DEM/DET)",
      partiesInvolved: ["Hãng tàu eDO", "Phòng Thương vụ Cảng", "Nhà xe"],
      paperOrLeftValue: `Nhận hàng ở giờ ${docCase.tos.pickupHour}h`,
      electronicOrRightValue: `Hạn lệnh eDO: ${docCase.edo.freeDemurrageUntilHour}h (Quá hạn +${overHours}h)`,
      message: `Lệnh giao nhận ${docCase.edo.edoNumber} đã quá hạn miễn phí lưu cont ${overHours}h. Cổng sẽ chặn nếu chưa gia hạn eDO và thu phụ phí lưu bãi.`,
      autoFixAction: `Tự động tính phí gia hạn lưu bãi (+${overHours}h) qua Micro-TOS Billing và phát hành COREOR gia hạn lệnh eDO tới giờ ${docCase.tos.pickupHour + 12}h.`,
    });
  }

  // 6. Check Terminal / Port Code mismatch across Customs, eDO, and TOS
  const expectedCustomsPort = OFFICE_TO_PORT[docCase.customs.customsOfficeCode];
  if (
    docCase.edo.releaseTerminalCode !== docCase.tos.terminalCode ||
    docCase.paper.paperTerminalCode !== docCase.tos.terminalCode ||
    expectedCustomsPort !== docCase.tos.terminalCode
  ) {
    discrepancies.push({
      code: "TERMINAL_CODE_MISMATCH",
      severity: "BLOCKER",
      field: "Mã Cảng Giao Nhận (LOCODE / Terminal ID)",
      partiesInvolved: ["Hãng tàu eDO", "TOS Cảng thực tế", "Hải quan"],
      paperOrLeftValue: `eDO/Giấy: ${docCase.edo.releaseTerminalCode}`,
      electronicOrRightValue: `TOS thực tế: ${docCase.tos.terminalCode}`,
      message: `Lệnh eDO ghi cảng ${docCase.edo.releaseTerminalCode} nhưng container thực tế nằm tại ${docCase.tos.terminalCode} (do tàu chuyển cầu/sà lan).`,
      autoFixAction: `Kích hoạt bản tin liên thông Change-of-Destination (COD) cập nhật mã cảng trên eDO & ePort sang ${docCase.tos.terminalCode}.`,
    });
  }

  const canonicalContainerNo = isoVerdict.valid ? docCase.edo.containerNo : isoVerdict.correctedContainerNo;
  const verifiedVgmKg = docCase.tos.weighbridgeGrossKg;
  const verifiedSeal = docCase.edo.carrierSeal;

  const canonicalIds: CanonicalIdentifierBundle = {
    ucrToken: `UCR-VN-${docCase.customs.declarationNo.slice(-6)}-${canonicalContainerNo}`,
    canonicalContainerNo,
    isoSizeType: docCase.edo.isoSizeType,
    vnaccsDeclarationNo: docCase.customs.declarationNo,
    carrierBillOfLading: docCase.edo.billOfLading,
    carrierEdoNumber: docCase.edo.edoNumber,
    tosEirNumber: docCase.tos.eirNumber,
    vesselVoyageKey: `${docCase.edo.vesselName.replace(/\s+/g, "_")}/${docCase.edo.voyageNo}`,
    truckPlate: docCase.paper.truckPlate,
    verifiedSeal,
    verifiedVgmKg,
  };

  const edifactCoreor = [
    `UNB+UNOA:2+${docCase.edo.carrier.slice(0, 6).toUpperCase()}:ZZ+${docCase.tos.terminalCode}:ZZ+261016:1400+COR-${docCase.edo.edoNumber}'`,
    `UNH+1+COREOR:D:95B:UN:SMDG20'`,
    `BGM+12+${docCase.edo.edoNumber}+9'`,
    `RFF+BM:${docCase.edo.billOfLading}'`,
    `RFF+ABT:${docCase.customs.declarationNo}'`,
    `TDT+20+${docCase.edo.voyageNo}+1+++++${docCase.edo.vesselName}:103'`,
    `LOC+11+${docCase.tos.terminalCode}:139:6'`,
    `EQD+CN+${canonicalContainerNo}+${docCase.edo.isoSizeType}:102:5++2+5'`,
    `SEL+${verifiedSeal}+CA'`,
    `MEA+AAE+VGM+KGM:${verifiedVgmKg}'`,
    `DTM+400:${Math.max(docCase.edo.freeDemurrageUntilHour, docCase.tos.pickupHour + 12)}:201'`,
    `UNT+11+1'`,
    `UNZ+1+COR-${docCase.edo.edoNumber}'`,
  ].join("\n");

  const edifactCodeco = [
    `UNB+UNOA:2+${docCase.tos.terminalCode}:ZZ+${docCase.edo.carrier.slice(0, 6).toUpperCase()}:ZZ+261016:1405+COD-${docCase.tos.eirNumber}'`,
    `UNH+1+CODECO:D:95B:UN:SMDG20'`,
    `BGM+36+${docCase.tos.eirNumber}+9'`,
    `EQD+CN+${canonicalContainerNo}+${docCase.edo.isoSizeType}:102:5++2+5'`,
    `RFF+BM:${docCase.edo.billOfLading}'`,
    `RFF+EDO:${docCase.edo.edoNumber}'`,
    `RFF+VASSCM:${docCase.customs.declarationNo}'`,
    `TDT+1+TRUCK++31++++${docCase.paper.truckPlate}'`,
    `SEL+${verifiedSeal}+CA'`,
    `LOC+165+${docCase.tos.terminalCode}:${docCase.tos.yardSlot}'`,
    `UNT+10+1'`,
    `UNZ+1+COD-${docCase.tos.eirNumber}'`,
  ].join("\n");

  const vnaccsVascmXml = [
    `<VASSCM_GetOut_Synchronization xmlns="urn:customs.gov.vn:vascm:v2">`,
    `  <UCR>${canonicalIds.ucrToken}</UCR>`,
    `  <CustomsOffice>${docCase.customs.customsOfficeCode}</CustomsOffice>`,
    `  <DeclarationNo>${docCase.customs.declarationNo}</DeclarationNo>`,
    `  <Channel>${applyAutoReconcile ? "GREEN" : docCase.customs.channel}</Channel>`,
    `  <ContainerNo iso6346="valid">${canonicalContainerNo}</ContainerNo>`,
    `  <VerifiedSeal>${verifiedSeal}</VerifiedSeal>`,
    `  <VerifiedGrossMassKg>${verifiedVgmKg}</VerifiedGrossMassKg>`,
    `  <TerminalId>${docCase.tos.terminalCode}</TerminalId>`,
    `  <EirReference>${docCase.tos.eirNumber}</EirReference>`,
    `  <TruckPlate>${docCase.paper.truckPlate}</TruckPlate>`,
    `  <ReleaseVerdict>${applyAutoReconcile || discrepancies.length === 0 ? "ALLOW_GATE_OUT_PAPERLESS" : "HOLD_PENDING_RECONCILE"}</ReleaseVerdict>`,
    `</VASSCM_GetOut_Synchronization>`,
  ].join("\n");

  const dcsaCanonicalJson = JSON.stringify(
    {
      schema: "DCSA-eDO-v3.0-Canonical",
      ucrToken: canonicalIds.ucrToken,
      paperEliminated: applyAutoReconcile || discrepancies.length === 0,
      identifiers: canonicalIds,
      reconciledDiscrepancies: discrepancies.map((d) => ({
        code: d.code,
        resolved: applyAutoReconcile,
        resolution: d.autoFixAction,
      })),
    },
    null,
    2,
  );

  const gateReleaseStatus: ReconciliationResult["gateReleaseStatus"] =
    discrepancies.length === 0
      ? "CLEARED_DIGITAL"
      : applyAutoReconcile
        ? "AUTO_RECONCILED"
        : "BLOCKED_DISCREPANCY";

  return {
    caseId: docCase.id,
    gateReleaseStatus,
    isoVerdict,
    paperIsoVerdict,
    discrepancies,
    canonicalIds,
    edifactCoreor,
    edifactCodeco,
    vnaccsVascmXml,
    dcsaCanonicalJson,
  };
}
