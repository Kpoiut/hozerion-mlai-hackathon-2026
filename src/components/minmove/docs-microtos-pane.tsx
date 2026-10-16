import { useMemo, useState } from "react";
import {
  ArrowRight,
  Box,
  CheckCircle2,
  CircleAlert,
  CircleX,
  Container,
  FileCheck2,
  FileWarning,
  Layers,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  SHIPMENT_DOCUMENT_CASES,
  reconcileShipmentDocuments,
  validateIso6346,
} from "@/lib/minmove/documents.ts";
import {
  DEFAULT_BAY_CONFIG,
  SEED_BAY_CONTAINERS,
  calculateContainerBilling,
  evaluateGateTransaction,
  packCfsCargo3D,
  recommendIncomingSlot,
  solveBayRetrieval,
} from "@/lib/minmove/micro-tos.ts";
import { solveHinterlandExceptions } from "@/lib/minmove/dock-exceptions.ts";
import { cn } from "@/lib/utils.ts";

export function DocsReconcilePane() {
  const [caseId, setCaseId] = useState<string>(SHIPMENT_DOCUMENT_CASES[0]!.id);
  const [autoReconcile, setAutoReconcile] = useState<boolean>(false);
  const [customIsoInput, setCustomIsoInput] = useState<string>("MSKU4029107");
  const [outFormat, setOutFormat] = useState<"vascm" | "coreor" | "codeco" | "dcsa">("vascm");

  const [paperContOverride, setPaperContOverride] = useState<string | null>(null);
  const [paperSealOverride, setPaperSealOverride] = useState<string | null>(null);
  const [weighbridgeOverride, setWeighbridgeOverride] = useState<number | null>(null);
  const [vascmOverride, setVascmOverride] = useState<boolean | null>(null);

  const baseCase = SHIPMENT_DOCUMENT_CASES.find((c) => c.id === caseId) ?? SHIPMENT_DOCUMENT_CASES[0]!;
  const docCase = useMemo(
    () => ({
      ...baseCase,
      customs: {
        ...baseCase.customs,
        vascmGetOutApproved: vascmOverride ?? baseCase.customs.vascmGetOutApproved,
      },
      tos: {
        ...baseCase.tos,
        weighbridgeGrossKg: weighbridgeOverride ?? baseCase.tos.weighbridgeGrossKg,
      },
      paper: {
        ...baseCase.paper,
        scannedContainerNo: (paperContOverride ?? baseCase.paper.scannedContainerNo).toUpperCase().trim(),
        scannedSeal: (paperSealOverride ?? baseCase.paper.scannedSeal).toUpperCase().trim(),
      },
    }),
    [baseCase, paperContOverride, paperSealOverride, weighbridgeOverride, vascmOverride],
  );

  const reconciled = useMemo(
    () => reconcileShipmentDocuments(docCase, autoReconcile),
    [docCase, autoReconcile],
  );
  const liveIso = useMemo(() => validateIso6346(customIsoInput), [customIsoInput]);

  const activeOutput =
    outFormat === "vascm"
      ? reconciled.vnaccsVascmXml
      : outFormat === "coreor"
        ? reconciled.edifactCoreor
        : outFormat === "codeco"
          ? reconciled.edifactCodeco
          : reconciled.dcsaCanonicalJson;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              Nâng cấp Mục 3 · Chuẩn hóa Chứng từ Hải quan (VNACCS) – Hãng tàu (eDO) – Cảng (eEIR) – Nhà xe
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              Khử Giấy Chạy Song Song Với Điện Tử &amp; Đối Soát Định Danh Dùng Chung (UCR)
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-muted">
              Đối chiếu tự động 4 nguồn dữ liệu: Tờ khai Hải quan 12 số (VNACCS/VASSCM), Lệnh giao nhận điện tử Hãng tàu (eDO/COPARN), Phiếu eEIR/Cân điện tử TOS và Phiếu giấy/OCR tại cổng. Tự động bắt lỗi số kiểm tra{" "}
              <span className="font-mono text-fg">ISO 6346 modulo-11</span>, lệch số chì (Seal), lệch cân SOLAS VGM và quá hạn DEM/DET.
            </p>
          </div>
          <Button
            type="button"
            variant={autoReconcile ? "secondary" : "primary"}
            onClick={() => setAutoReconcile((v) => !v)}
          >
            <ShieldCheck className="size-4" />
            {autoReconcile ? "Đang bật Đồng bộ Chuẩn chung (Paperless)" : "Chạy Đồng bộ Chuẩn chung & Ký số"}
          </Button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-faint">
              Chọn bộ hồ sơ thực tế cần đối soát liên ngành
              <select
                value={caseId}
                onChange={(e) => {
                  setCaseId(e.target.value);
                  setAutoReconcile(false);
                  setPaperContOverride(null);
                  setPaperSealOverride(null);
                  setWeighbridgeOverride(null);
                  setVascmOverride(null);
                }}
                className="mt-1.5 h-10 w-full rounded-xl bg-bg px-3 text-sm font-medium text-fg ring-1 ring-line"
              >
                {SHIPMENT_DOCUMENT_CASES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-xl bg-raised/70 p-3 ring-1 ring-line">
            <label className="block text-xs font-medium text-faint">
              Kiểm định trực tiếp số Container (Chuẩn toán học ISO 6346)
              <input
                type="text"
                value={customIsoInput}
                onChange={(e) => setCustomIsoInput(e.target.value)}
                className="mt-1 h-8 w-full rounded-lg bg-surface px-2.5 font-mono text-xs uppercase text-fg ring-1 ring-line"
                placeholder="VD: MSKU4029107"
              />
            </label>
            <p className={cn("mt-1.5 text-xs font-medium", liveIso.valid ? "text-ok" : "text-bad")}>
              {liveIso.reason}
            </p>
          </div>
        </div>

        {/* Live 4-Party Field Mutator Sandbox */}
        <div className="mt-3 grid gap-3 rounded-xl bg-raised/50 p-3 ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs font-medium text-faint">
            Sửa thử Cont trên Giấy/OCR Cổng
            <input
              type="text"
              value={docCase.paper.scannedContainerNo}
              onChange={(e) => setPaperContOverride(e.target.value)}
              className="mt-1 h-8 w-full rounded-lg bg-surface px-2.5 font-mono text-xs uppercase text-fg ring-1 ring-line"
            />
          </label>
          <label className="block text-xs font-medium text-faint">
            Sửa thử Seal trên Giấy/OCR Cổng
            <input
              type="text"
              value={docCase.paper.scannedSeal}
              onChange={(e) => setPaperSealOverride(e.target.value)}
              className="mt-1 h-8 w-full rounded-lg bg-surface px-2.5 font-mono text-xs uppercase text-fg ring-1 ring-line"
            />
          </label>
          <label className="block text-xs font-medium text-faint">
            Cân thực tế Trạm cân Cảng (kg)
            <input
              type="number"
              step={100}
              value={docCase.tos.weighbridgeGrossKg}
              onChange={(e) => setWeighbridgeOverride(Number(e.target.value) || 0)}
              className="mt-1 h-8 w-full rounded-lg bg-surface px-2.5 font-mono text-xs text-fg ring-1 ring-line"
            />
          </label>
          <div className="flex flex-col justify-between text-xs">
            <span className="font-medium text-faint">Trạng thái Hải quan VASSCM</span>
            <button
              type="button"
              onClick={() => setVascmOverride(!docCase.customs.vascmGetOutApproved)}
              className={cn(
                "mt-1 h-8 rounded-lg px-2.5 font-mono text-xs font-semibold ring-1",
                docCase.customs.vascmGetOutApproved
                  ? "bg-ok/15 text-ok ring-ok/30"
                  : "bg-bad/15 text-bad ring-bad/30",
              )}
            >
              {docCase.customs.vascmGetOutApproved ? "VASSCM: Đã duyệt qua KVGS" : "VASSCM: Đang Hold (Nhấn để duyệt)"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-bg p-3 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">1. Hải quan VNACCS</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold",
                  docCase.customs.channel === "GREEN" ? "bg-ok/15 text-ok" : "bg-warn/15 text-warn",
                )}
              >
                Luồng {docCase.customs.channel}
              </span>
            </div>
            <dl className="mt-2 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <dt className="text-faint">Tờ khai:</dt>
                <dd>{docCase.customs.declarationNo}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">Chi cục:</dt>
                <dd>{docCase.customs.customsOfficeCode}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">Cont / Seal:</dt>
                <dd>
                  {docCase.customs.containerNo} · {docCase.customs.customsSeal}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">VASSCM:</dt>
                <dd className={docCase.customs.vascmGetOutApproved ? "text-ok" : "text-bad"}>
                  {docCase.customs.vascmGetOutApproved ? "Đủ ĐK qua KVGS" : "Chưa duyệt Get-Out"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl bg-bg p-3 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">2. Hãng tàu (eDO)</span>
              <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-accent">
                {docCase.edo.isoSizeType}
              </span>
            </div>
            <dl className="mt-2 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <dt className="text-faint">Số eDO:</dt>
                <dd>{docCase.edo.edoNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">Số vận đơn:</dt>
                <dd>{docCase.edo.billOfLading}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">Seal / VGM:</dt>
                <dd>
                  {docCase.edo.carrierSeal} · {docCase.edo.vgmWeightKg}kg
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">Cảng / Hạn:</dt>
                <dd>
                  {docCase.edo.releaseTerminalCode.replace("VNSGN-", "")} · {docCase.edo.freeDemurrageUntilHour}h
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl bg-bg p-3 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">3. Cảng TOS (eEIR)</span>
              <span className="rounded-full bg-raised px-2 py-0.5 font-mono text-[10px] text-muted">
                {docCase.tos.tosSystem}
              </span>
            </div>
            <dl className="mt-2 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <dt className="text-faint">Phiếu eEIR:</dt>
                <dd>{docCase.tos.eirNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">Ô bãi 3D:</dt>
                <dd>{docCase.tos.yardSlot}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">Cân thực tế:</dt>
                <dd>{docCase.tos.weighbridgeGrossKg}kg</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">Cảng / Giờ:</dt>
                <dd>
                  {docCase.tos.terminalCode.replace("VNSGN-", "")} · {docCase.tos.pickupHour}h
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl bg-bg p-3 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">4. Giấy / OCR Cổng</span>
              <span className="rounded-full bg-warn/15 px-2 py-0.5 font-mono text-[10px] text-warn">
                Giấy song song
              </span>
            </div>
            <dl className="mt-2 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <dt className="text-faint">Xe / Moóc:</dt>
                <dd>
                  {docCase.paper.truckPlate} / {docCase.paper.chassisPlate}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">Cont ghi tay:</dt>
                <dd className={!reconciled.paperIsoVerdict.valid ? "font-bold text-bad" : ""}>
                  {docCase.paper.scannedContainerNo}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">Seal ghi tay:</dt>
                <dd className={docCase.paper.scannedSeal !== docCase.edo.carrierSeal ? "font-bold text-bad" : ""}>
                  {docCase.paper.scannedSeal}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">Cảng trên giấy:</dt>
                <dd>{docCase.paper.paperTerminalCode.replace("VNSGN-", "")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                Phát hiện Xung đột Giấy vs Điện tử ({reconciled.discrepancies.length} điểm lệch)
              </p>
              <h3 className="mt-0.5 text-base font-semibold">
                {reconciled.gateReleaseStatus === "AUTO_RECONCILED"
                  ? "Đã Chuẩn hóa & Mở Cổng Điện Tử (Không cần phiếu giấy)"
                  : "Cổng đang Chặn Tự động do Lệch Chứng từ Liên ngành"}
              </h3>
            </div>
            {reconciled.gateReleaseStatus === "AUTO_RECONCILED" ? (
              <CheckCircle2 className="size-5 text-ok" />
            ) : (
              <CircleX className="size-5 text-bad" />
            )}
          </div>

          <div className="mt-3 space-y-2.5">
            {reconciled.discrepancies.map((d) => (
              <div
                key={d.code}
                className={cn(
                  "rounded-xl p-3 ring-1",
                  autoReconcile ? "bg-ok/10 ring-ok/30" : "bg-bad/10 ring-bad/30",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-mono text-xs font-semibold">{d.field}</span>
                  <span className="text-xs text-muted">{d.partiesInvolved.join(" ↔ ")}</span>
                </div>
                <p className="mt-1 text-xs text-fg">{d.message}</p>
                <p className="mt-1 font-mono text-xs text-muted">
                  Trái: <span className="text-fg">{d.paperOrLeftValue}</span> · Phải:{" "}
                  <span className="text-fg">{d.electronicOrRightValue}</span>
                </p>
                <p className="mt-1.5 text-xs font-medium text-accent">
                  → Giải pháp tự động: {d.autoFixAction}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-raised/70 p-3 ring-1 ring-line">
            <p className="text-xs font-semibold">
              Mã Định danh Dùng chung Liên thông (Unified Canonical Reference):{" "}
              <span className="font-mono text-accent">{reconciled.canonicalIds.ucrToken}</span>
            </p>
            <p className="mt-1 font-mono text-xs text-muted">
              Cont chuẩn ISO: {reconciled.canonicalIds.canonicalContainerNo} · Tờ khai: {reconciled.canonicalIds.vnaccsDeclarationNo} · B/L: {reconciled.canonicalIds.carrierBillOfLading} · eDO: {reconciled.canonicalIds.carrierEdoNumber} · eEIR: {reconciled.canonicalIds.tosEirNumber}
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                Bản tin Chuẩn Chung Xuất Ra Cho 4 Bên
              </p>
              <h3 className="mt-0.5 text-base font-semibold">
                VNACCS VASSCM XML · UN/EDIFACT COREOR &amp; CODECO · DCSA eDO 3.0
              </h3>
            </div>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  { id: "vascm", label: "Hải quan VASSCM XML" },
                  { id: "coreor", label: "EDIFACT COREOR" },
                  { id: "codeco", label: "EDIFACT CODECO" },
                  { id: "dcsa", label: "DCSA eDO JSON" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setOutFormat(t.id)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium",
                    outFormat === t.id ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:text-fg",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-bg p-3 font-mono text-xs leading-relaxed text-fg ring-1 ring-line">
            {activeOutput}
          </pre>
        </section>
      </div>
    </div>
  );
}

export function MicroTosPane() {
  const [selectedContNo, setSelectedContNo] = useState<string>("MSKU4029100");
  const [showAfterGrid, setShowAfterGrid] = useState<boolean>(false);
  const [overrideCustomsHold, setOverrideCustomsHold] = useState<boolean>(false);

  const retrieval = useMemo(
    () => solveBayRetrieval(selectedContNo, SEED_BAY_CONTAINERS, DEFAULT_BAY_CONFIG),
    [selectedContNo],
  );
  const billing = useMemo(
    () => calculateContainerBilling(retrieval.targetContainer, retrieval.rehandleCount),
    [retrieval.targetContainer, retrieval.rehandleCount],
  );
  const gateEir = useMemo(
    () => evaluateGateTransaction(retrieval.targetContainer, retrieval.rehandleCount, overrideCustomsHold),
    [retrieval.targetContainer, retrieval.rehandleCount, overrideCustomsHold],
  );
  const slotRecs = useMemo(
    () =>
      recommendIncomingSlot(
        { cargo: retrieval.targetContainer.cargo, weightTon: 19.5, pickupOrder: 4 },
        SEED_BAY_CONTAINERS,
        DEFAULT_BAY_CONFIG,
      ),
    [retrieval.targetContainer.cargo],
  );
  const cfsPack = useMemo(() => packCfsCargo3D(), []);
  const hinterland = useMemo(() => solveHinterlandExceptions(), []);

  const activeGrid = showAfterGrid ? retrieval.finalGrid : retrieval.initialGrid;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              Nâng cấp Mục 2 &amp; Mục 4 · Micro-TOS Cho Cảng Nhỏ / ICD (Cổng eEIR · Bãi 3D Bay-Row-Tier · Hải Quan · Tính Tiền)
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              Thay thế Phần Đắt Nhất Của Hệ Thống Triệu Đô: Bãi Container, Đảo Chuyển RTG, Cổng Hải Quan &amp; Hóa Đơn Lũy Tiến
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-muted">
              Cảng nhỏ và ICD không kham nổi TOS triệu đô vì chi phí nằm ở 4 phân hệ vận hành hàng ngày: Quản lý ô bãi 3D{" "}
              <span className="font-mono text-fg">Block-Bay-Row-Tier</span> &amp; tối ưu số lần cẩu đảo chuyển (rehandle), Kiểm soát cổng eEIR gắn thông quan VASSCM, và Tính cước lưu bãi lũy tiến / điện lạnh / DEM-DET. Chọn bất kỳ container nào dưới đây để chạy toàn bộ chu trình.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowAfterGrid((v) => !v)}
            >
              <RefreshCw className="size-3.5" />
              {showAfterGrid ? "Đang xem: Sơ đồ Bãi SAU khi rút cont" : "Xem Sơ đồ Bãi SAU khi đảo chuyển"}
            </Button>
            {retrieval.targetContainer.customsStatus !== "GREEN_CLEARED" ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setOverrideCustomsHold((v) => !v)}
              >
                <ShieldCheck className="size-3.5" />
                {overrideCustomsHold ? "Đã giải phóng Hold Hải quan" : "Giải phóng Hold Luồng Vàng"}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-12">
          {/* 6x4 Bay-Row-Tier Interactive Matrix */}
          <div className="xl:col-span-7">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-faint">
                Sơ đồ Mặt Cắt Bay Container: Block {DEFAULT_BAY_CONFIG.blockId} · Bay {DEFAULT_BAY_CONFIG.bayNo} (6 Rows × 4 Tiers)
              </p>
              <span className="font-mono text-xs text-muted">
                {showAfterGrid ? "Trạng thái: Sau khi cẩu RTG bốc cont" : "Nhấn vào từng ô Container để rút"}
              </span>
            </div>

            <div className="mt-2 overflow-x-auto rounded-xl bg-bg p-3 ring-1 ring-line">
              <div className="grid min-w-[34rem] grid-cols-6 gap-2">
                {Array.from({ length: DEFAULT_BAY_CONFIG.nRows }, (_, r) => (
                  <div key={r} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between px-1 text-[11px] font-medium text-faint">
                      <span>Row {r + 1}</span>
                      {DEFAULT_BAY_CONFIG.reeferRows.includes(r) ? (
                        <span className="text-accent">Reefer</span>
                      ) : (
                        <span>Dry</span>
                      )}
                    </div>
                    {Array.from({ length: DEFAULT_BAY_CONFIG.maxTiers }, (_, tIdx) => {
                      const tier = DEFAULT_BAY_CONFIG.maxTiers - 1 - tIdx;
                      const cell = activeGrid[r]?.[tier] ?? null;
                      const isTarget = cell?.containerNo === retrieval.targetContainer.containerNo;
                      const isBlocker = retrieval.blockingContainers.some(
                        (b) => b.containerNo === cell?.containerNo,
                      );
                      return (
                        <button
                          key={tier}
                          type="button"
                          disabled={!cell}
                          onClick={() => {
                            if (cell) {
                              setSelectedContNo(cell.containerNo);
                              setShowAfterGrid(false);
                            }
                          }}
                          className={cn(
                            "flex h-16 flex-col justify-between rounded-lg p-2 text-left font-mono text-xs ring-1 transition-colors",
                            !cell && "cursor-default border border-dashed border-line bg-surface/40 text-faint ring-0",
                            cell && !isTarget && !isBlocker && "bg-surface text-fg ring-line hover:bg-raised",
                            isTarget && "bg-accent text-accent-fg ring-2 ring-accent",
                            isBlocker && !isTarget && "bg-warn/15 text-fg ring-warn/50",
                          )}
                        >
                          {cell ? (
                            <>
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate text-[11px] font-bold">{cell.containerNo}</span>
                                <span
                                  className={cn(
                                    "rounded px-1 text-[10px]",
                                    isTarget ? "bg-accent-fg/20 text-accent-fg" : "bg-raised text-muted",
                                  )}
                                >
                                  #{cell.pickupOrder}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] opacity-85">
                                <span>
                                  {cell.size} · {cell.weightTon}t
                                </span>
                                <span>{cell.customsStatus === "YELLOW_HOLD" ? "HOLD" : cell.pickupEtaLabel}</span>
                              </div>
                            </>
                          ) : (
                            <span className="m-auto text-[10px] text-faint">T{tier + 1} trống</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* RTG Step-by-Step Min-Rehandle Work Orders */}
            <div className="mt-3 rounded-xl bg-raised/60 p-3 ring-1 ring-line">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold">
                  Lệnh Cẩu RTG Tối ưu Đảo chuyển (Min-Rehandle: {retrieval.rehandleCount} lượt đảo · {retrieval.cleanRehandles} lượt sạch 0 xung đột phụ · {retrieval.totalCraneMinutes} phút)
                </p>
                <span className="font-mono text-xs text-accent">
                  Hạ bãi mới tối ưu: Row {(slotRecs[0]?.row ?? 0) + 1} Tier {(slotRecs[0]?.tier ?? 0) + 1}
                </span>
              </div>
              <ul className="mt-2 space-y-1.5 text-xs">
                {retrieval.steps.map((st) => (
                  <li key={st.stepNo} className="flex items-start gap-2 font-mono">
                    <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-line">
                      Bước {st.stepNo}
                    </span>
                    <span className="font-sans text-fg">{st.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Gate eEIR + Automated Port Tariff Invoice */}
          <div className="space-y-3 xl:col-span-5">
            <div
              className={cn(
                "rounded-xl p-3.5 ring-1",
                gateEir.status === "ISSUED_GREEN" ? "bg-ok/10 ring-ok/40" : "bg-bad/10 ring-bad/40",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Cổng Thông Minh eEIR · {gateEir.eirNo}
                </span>
                <span className="font-mono text-xs font-bold">
                  {gateEir.status === "ISSUED_GREEN" ? "CHO PHÉP QUA CỔNG" : "CHẶN TẠI CỔNG"}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs">
                Xe {gateEir.truckPlate} · {gateEir.gateLane} · Ô bãi {gateEir.yardCoordinate} · Quay đầu dự kiến {gateEir.estimatedTurnaroundMin} phút
              </p>
              {gateEir.holdReasons.length > 0 ? (
                <ul className="mt-1.5 list-disc pl-4 text-xs text-bad">
                  {gateEir.holdReasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs text-ok">
                  Đã xác thực ISO 6346 + Thông quan VASSCM + Lệnh eDO + Thu đủ cước cảng.
                </p>
              )}
            </div>

            <div className="rounded-xl bg-bg p-3.5 ring-1 ring-line">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-faint">
                    Bảng Tính Cước Cảng &amp; Lưu Bãi Lũy Tiến ({billing.invoiceNo})
                  </p>
                  <h3 className="text-sm font-semibold">
                    Cont {billing.containerNo} ({billing.size}) · Lưu bãi {billing.dwellDays} ngày (Miễn {billing.freeDays} ngày)
                  </h3>
                </div>
                <Receipt className="size-4 text-accent" />
              </div>

              <table className="mt-2.5 w-full text-left text-xs">
                <thead className="border-b border-line text-faint">
                  <tr>
                    <th className="py-1.5 font-medium">Hạng mục cước</th>
                    <th className="px-2 py-1.5 text-right font-medium">SL</th>
                    <th className="py-1.5 text-right font-medium">Thành tiền (VND)</th>
                  </tr>
                </thead>
                <tbody className="font-mono tabular-nums">
                  {billing.lines.map((line) => (
                    <tr key={line.code} className="border-b border-line/60">
                      <td className="py-1.5 font-sans text-fg">{line.description}</td>
                      <td className="px-2 py-1.5 text-right text-muted">
                        {line.quantity} {line.unit}
                      </td>
                      <td className="py-1.5 text-right">{line.amountVnd.toLocaleString("vi-VN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2 font-mono text-xs tabular-nums">
                <span className="text-muted">Thuế GTGT ({billing.vatRatePct}%): {billing.vatVnd.toLocaleString("vi-VN")} ₫</span>
                <span className="text-sm font-bold text-accent">
                  Tổng: {billing.totalVnd.toLocaleString("vi-VN")} ₫ (${billing.totalUsd})
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-raised/60 p-3 ring-1 ring-line">
              <p className="text-xs font-semibold">
                Tối ưu Đóng Hàng Lẻ Kho CFS 3D (WASM Extreme-Point Pack3D):{" "}
                <span className="font-mono text-ok">{cfsPack.utilizationPct}% thể tích</span>
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Đã xếp {cfsPack.poses.length}/{cfsPack.items.length} kiện pallet LCL vào {cfsPack.binsUsed} container 20&apos;DC không chồng lấn AABB.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 4: Coupled Hinterland Dock Exception & Bilateral Slot-Swap */}
      <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              Nâng cấp Mục 4 · Giải Quyết Ngoại Lệ Cửa Kho Gắn Với Bãi Container, Hải Quan &amp; Giờ Cut-off Tàu
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              Vượt qua C3 / FourKites / DataDocks: Hoán Đổi Slot Song Phương + Tách Tờ Khai Hold + Đảo Chuyển RTG Trước
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-muted">
              Các phần mềm đặt lịch cửa kho thông thường chỉ dời giờ trên sơ đồ cửa mà không biết container dưới bãi đang bị đè mấy tầng hay đang vướng tờ khai Luồng Vàng. Bộ giải liên hợp dưới đây kết nối trực tiếp{" "}
              <span className="font-medium text-fg">Cửa Kho ↔ Cẩu Bãi RTG ↔ Hải quan VASSCM ↔ Giờ Cut-off Hãng tàu</span>.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {hinterland.strategies.map((st) => {
            const isBest = st.id === "coupled-swap";
            return (
              <div
                key={st.id}
                className={cn(
                  "rounded-xl p-3.5 ring-1",
                  isBest ? "bg-accent/10 ring-accent/40" : "bg-bg ring-line",
                )}
              >
                <p className={cn("text-xs font-semibold", isBest ? "text-accent" : "text-fg")}>{st.label}</p>
                <dl className="mt-2 grid grid-cols-3 gap-2 font-mono text-xs tabular-nums">
                  <div>
                    <dt className="text-faint">Rớt tàu Cut-off</dt>
                    <dd className={cn("font-bold", st.cutoffMisses === 0 ? "text-ok" : "text-bad")}>
                      {st.cutoffMisses} cont
                    </dd>
                  </div>
                  <div>
                    <dt className="text-faint">Tổng giờ chờ</dt>
                    <dd className="font-bold">{st.totalWaitMin}p</dd>
                  </div>
                  <div>
                    <dt className="text-faint">Đổi slot / Cẩu trước</dt>
                    <dd className="font-bold">
                      {st.swapsExecuted} cặp / -{st.craneWaitSavedMin}p
                    </dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs text-muted">{st.summary}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-xs">
            <thead className="border-b border-line text-faint">
              <tr>
                <th className="py-2 pr-2 font-medium">Xe / Nhà xe</th>
                <th className="px-2 py-2 font-medium">Container &amp; Tàu</th>
                <th className="px-2 py-2 font-medium">Cửa</th>
                <th className="px-2 py-2 font-medium">Giờ đặt → Thực đến → Lên cửa</th>
                <th className="px-2 py-2 font-medium">Dư giờ Cut-off</th>
                <th className="pl-2 py-2 font-medium">Quyết định Liên hợp (Kho – Bãi – Hải quan)</th>
              </tr>
            </thead>
            <tbody>
              {hinterland.recommended.placements.map((p) => (
                <tr key={p.jobId} className="border-b border-line/60 font-mono tabular-nums">
                  <td className="py-2 pr-2">
                    <span className="font-semibold">{p.truckPlate}</span>
                    <span className="block font-sans text-[11px] text-muted">{p.hauler}</span>
                  </td>
                  <td className="px-2 py-2">{p.containerNo}</td>
                  <td className="px-2 py-2">{p.assignedDoorId}</td>
                  <td className="px-2 py-2">
                    +{p.bookedStartMin}p → +{p.liveEtaMin}p →{" "}
                    <span className="font-semibold text-accent">+{p.startMin}p..+{p.endMin}p</span>
                  </td>
                  <td className="px-2 py-2">
                    {p.cutoffSlackMin != null ? (
                      <span className="text-ok">+{p.cutoffSlackMin}p an toàn</span>
                    ) : (
                      <span className="text-muted">Hàng nhập</span>
                    )}
                  </td>
                  <td className="pl-2 py-2 font-sans text-xs text-fg">{p.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
