import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { UniversalSidecarAndBenchmarkPanel } from "@/components/minmove/bacap-federation-pane.tsx";
import { ArchitectureDiagram } from "@/components/minmove/diagram.tsx";
import { runEnterpriseQualityAudit } from "@/lib/minmove/enterprise-audit.ts";
import { useBoardStore, type Tab } from "@/lib/minmove/store.ts";

export const Route = createFileRoute("/design")({ component: DesignPage });

const UPGRADE_MATRIX: Array<{
  gap: string;
  oldState: string;
  upgradedEngine: string;
  standards: string;
  tab: Tab;
  tabLabel: string;
}> = [
  {
    gap: "1. Các cảng mỗi nơi một phần mềm, không liên thông",
    oldState: "Một file, một cầu, không có bản tin gửi sang cảng khác.",
    upgradedEngine:
      "Bộ Giải Liên Thông 5 Cảng TP.HCM & Sà Lan Trung Chuyển (Cát Lái ↔ Tân Thuận ↔ Hiệp Phước ↔ SP-ITC ↔ ICD Phước Long) + Bộ Biên Dịch Đa Chuẩn TOS Hai Chiều.",
    standards: "TOPOVN/TOPX/ePort · SGP-TOS (VTOS/GTOS/VSL) · CATOS · Navis N4 · UN/EDIFACT BAPLIE/COPARN/CODECO · DCSA v3.0 · VNACCS OLA",
    tab: "federation",
    tabLabel: "Mở Liên Thông Cảng",
  },
  {
    gap: "2. Cảng nhỏ không kham nổi hệ thống triệu đô",
    oldState: "Phần đắt là cổng, bãi container, hải quan và tính tiền. Sản phẩm cũ không làm các việc đó.",
    upgradedEngine:
      "Micro-TOS Trọn Gói Cho Cảng Nhỏ & ICD: Sơ đồ Bãi 3D Block-Bay-Row-Tier (6×4), Giải thuật Đảo Chuyển Cẩu Bãi RTG Tối Thiểu (Min-Rehandle), Cổng eEIR 5 Chốt Chặn Hải Quan/Cước, Biểu Cước Lưu Bãi Lũy Tiến VND/USD + VAT 8% & Đóng Hàng Lẻ Kho CFS 3D.",
    standards: "3D Bay-Row-Tier Matrix · RTG Rehandle Solver · Gate eEIR · Progressive Storage/Reefer/DEM-DET Tariff · Extreme-Point 3D CFS",
    tab: "microtos",
    tabLabel: "Mở Micro-TOS & Bãi 3D",
  },
  {
    gap: "3. Giấy chạy song song với điện tử vì chưa có chuẩn chung",
    oldState: "Không có tờ khai, lệnh giao nhận, lịch tàu của hãng, hay mã dùng chung.",
    upgradedEngine:
      "Cầu Nối Đối Soát Điện Tử 4 Bên (Hải quan VNACCS 12 số ↔ Hãng tàu eDO ↔ Nhà xe VGM/eEIR ↔ Bãi TOS) kèm Kiểm định Toán học Check-Digit ISO 6346 Modulo-11, phát hiện lệch chì Seal/VGM SOLAS và sinh mã QR Một Cửa Không Giấy.",
    standards: "ISO 6346 Modulo-11 · VNACCS/VCIS · VASSCM Getout · UN/EDIFACT COREOR & CODECO · DCSA eDO",
    tab: "docs",
    tabLabel: "Mở Đối Soát Hải Quan · eDO",
  },
  {
    gap: "4. Xe trễ thì sửa lịch cửa trên lịch kho đã có",
    oldState: "Dữ liệu cửa kho đơn lẻ; 2.567/3.092 ca Barcelona ở lại cầu cũ vì tự có khoảng trống.",
    upgradedEngine:
      "Bộ Giải Ngoại Lệ Cửa Kho Liên Hợp (Coupled Dock–Yard–Customs–Vessel Cut-off Solver): Hoán Đổi Slot Song Phương Giữa Hai Nhà Xe + Tách Tờ Khai Luồng Vàng + Đảo Chuyển RTG Trước Khi Xe Tới Cổng; kèm Bộ Lọc 525 Ca Thực Sự Tranh Chấp Cầu của Barcelona.",
    standards: "Bilateral Hauler Slot-Swap · Customs Hold Decoupling · Vessel Closing Time Cut-off Protection · Contested-Call Filter",
    tab: "microtos",
    tabLabel: "Mở Ngoại Lệ Cửa Kho Liên Hợp",
  },
  {
    gap: "5. Tàu trễ thì sửa kế hoạch cầu, ít đụng tàu khác",
    oldState: "Chưa tính cần cẩu bờ STS, trung chuyển feeder-mother, thủy triều và chưa gắn vào TOS.",
    upgradedEngine:
      "BACAP-R (Berth Allocation & Quay Crane Assignment Recovery): Nén Giờ Làm Hàng Bằng Tăng Cường Cần Cẩu Bờ STS d(q) = ceil(d0*(q0/q)^alpha) Không Giao Cắt Ray, Bảo Vệ Kết Nối Container Trung Chuyển (Feeder → Mother), Ràng Buộc Mớn Nước Thủy Triều & Xuất/Nhập Trực Tiếp 4 Chuẩn TOS.",
    standards: "Navis N4 SNX XML · SGP-TOS (VTOS JSON) · Cát Lái TOPOVN SQL · UN/EDIFACT BERMAN D.95B",
    tab: "bacap",
    tabLabel: "Mở BACAP · Cẩu & TOS",
  },
];

function DesignPage() {
  const navigate = useNavigate();
  const [auditRunCount, setAuditRunCount] = useState(1);
  const audit = runEnterpriseQualityAudit(auditRunCount > 1);

  function openModule(tab: Tab) {
    useBoardStore.getState().setTab(tab);
    void navigate({ to: "/" });
  }

  return (
    <main className="min-h-dvh overflow-x-hidden bg-bg px-4 py-10 text-fg sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="text-sm text-muted hover:text-fg">
          Back to board
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">How Hozerion decides</h1>
        <p className="mt-3 max-w-3xl text-muted">
          One late truck or vessel. Fewest moved appointments. Upgraded end-to-end across 5 operational pillars: Cross-TOS Port Federation, Affordable Micro-TOS (3D Yard, Gate eEIR, Customs &amp; Billing), 4-Party Paperless Reconciliation (VNACCS/eDO/ISO 6346), Coupled Dock–Yard–Cut-off Exception Swaps, and Joint Berth + Quay Crane + Transshipment Recovery (BACAP-R).
        </p>

        <section className="mt-8 overflow-hidden rounded-2xl bg-surface p-5 shadow-card ring-1 ring-line">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                Bảng Đối Chiếu Nâng Cấp Toàn Diện 5 Lỗ Hổng Vận Hành Cảng &amp; Kho Bãi Việt Nam
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                Từ bài toán xếp lịch đơn lẻ sang Hệ sinh thái Liên thông TOS – Hải quan – Cẩu bờ – Bãi 3D
              </h2>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[54rem] text-left text-xs">
              <thead className="border-b border-line text-faint">
                <tr>
                  <th className="w-56 py-2.5 pr-3 font-medium">Chỗ còn thiếu (Phản biện thực tế)</th>
                  <th className="w-60 px-3 py-2.5 font-medium">Trạng thái trước nâng cấp</th>
                  <th className="px-3 py-2.5 font-medium">Giải pháp &amp; Mô hình Toán học đã nâng cấp</th>
                  <th className="w-64 px-3 py-2.5 font-medium">Chuẩn dữ liệu &amp; Hệ thống hỗ trợ</th>
                  <th className="w-40 pl-3 py-2.5 font-medium">Trải nghiệm trực tiếp</th>
                </tr>
              </thead>
              <tbody>
                {UPGRADE_MATRIX.map((row) => (
                  <tr key={row.gap} className="border-b border-line/60 align-top">
                    <td className="py-3 pr-3 font-semibold text-fg">{row.gap}</td>
                    <td className="px-3 py-3 text-muted">{row.oldState}</td>
                    <td className="px-3 py-3 leading-relaxed text-fg">{row.upgradedEngine}</td>
                    <td className="px-3 py-3 font-mono text-[11px] text-muted">{row.standards}</td>
                    <td className="pl-3 py-3">
                      <button
                        type="button"
                        onClick={() => openModule(row.tab)}
                        className="rounded-lg bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-fg hover:bg-accent/90"
                      >
                        {row.tabLabel}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Live Enterprise Competitive Wedge & Continuous Quality Gate Audit */}
        <section className="mt-8 rounded-2xl bg-surface p-5 shadow-card ring-1 ring-line">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                Kiểm Định Giá Trị Thực Chiến Doanh Nghiệp &amp; Chất Lượng Năng Lực Trực Tiếp (Lần chạy #{auditRunCount})
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                6 Câu Hỏi Cốt Tử: Doanh Nghiệp Cần Gì? Các Hãng Đã Làm Chưa? Điểm Mạnh Độc Nhất Là Gì? Mở Lên Lúc Nào? Đạt Chuẩn Chưa?
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ok/15 px-3 py-1 font-mono text-xs font-semibold text-ok">
                <ShieldCheck className="size-3.5" />
                {audit.totalChecksRun}/{audit.totalChecksRun} GATES PASS · {audit.totalAuditMs}ms
              </span>
              <button
                type="button"
                onClick={() => setAuditRunCount((c) => c + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-raised px-3 py-1.5 text-xs font-medium text-fg ring-1 ring-line hover:bg-bg"
              >
                <RefreshCw className="size-3.5" />
                Chạy lại Kiểm định Thực chiến
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-5">
            {audit.systemInvariants.map((inv) => (
              <div key={inv.id} className="rounded-xl bg-bg p-3 ring-1 ring-line">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[10px] font-semibold uppercase text-ok">INVARIANT PASS</span>
                  <CheckCircle2 className="size-3.5 text-ok" />
                </div>
                <p className="mt-1 text-xs font-semibold leading-snug text-fg">{inv.name}</p>
                <p className="mt-1 font-mono text-[10px] text-accent">{inv.formula}</p>
                <p className="mt-1.5 font-mono text-xs font-bold text-fg">{inv.measuredValue}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {audit.wedges.map((w) => (
              <div key={w.id} className="rounded-xl bg-bg p-4 ring-1 ring-line">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5">
                  <h3 className="text-sm font-semibold text-fg">{w.domainTitle}</h3>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="rounded-md bg-ok/15 px-2 py-0.5 font-semibold text-ok">{w.economicImpactPerIncident}</span>
                    <span className="rounded-md bg-accent/15 px-2 py-0.5 text-accent">{w.qualityGateMetric}</span>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 text-xs leading-relaxed sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="font-semibold text-faint">1. Doanh nghiệp thực sự cần gì?</p>
                    <p className="mt-1 text-fg">{w.whatEnterpriseNeeds}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-faint">2. Các hãng lớn đã làm gì &amp; Điểm mù của họ?</p>
                    <p className="mt-1 text-muted">
                      <span className="font-medium text-fg">Đã có:</span> {w.whatIncumbentsAlreadyDo}
                    </p>
                    <p className="mt-1 text-bad">
                      <span className="font-medium">Điểm mù:</span> {w.incumbentBlindSpot}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-faint">3. Điểm mạnh độc nhất buộc phải dùng &amp; Lúc kích hoạt</p>
                    <p className="mt-1 text-fg">{w.whyEnterpriseMustUseUs}</p>
                    <p className="mt-1 font-mono text-[11px] text-accent">
                      Kích hoạt: {w.dailyOperationalTrigger}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-ok">
                      Chứng chỉ kiểm định: {w.liveProofSummary}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <UniversalSidecarAndBenchmarkPanel />
        </section>

        <section className="mt-10 overflow-hidden rounded-xl shadow-[var(--shadow-border)]">
          <ArchitectureDiagram />
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]">
            <h2 className="font-medium">The engine</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
              <li>Lex repair: hold the board, then cut wait</li>
              <li>BACAP-R: joint berth + non-crossing STS quay crane surge + feeder transshipment protection</li>
              <li>3D Bay-Row-Tier RTG min-rehandle solver &amp; coupled dock-yard-customs bilateral slot swaps</li>
              <li>Cross-TOS federation (TOPOVN, SGP-TOS VTOS, CATOS, Navis N4) &amp; ISO 6346 / VNACCS / eDO reconciliation</li>
            </ul>
          </article>
          <article className="rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]">
            <h2 className="font-medium">The note reader</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
              <li>Reads a messy Vietnamese or English radio note</li>
              <li>Never writes appointments</li>
              <li>Optional — the board runs without it</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}


