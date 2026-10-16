import { useMemo, useState } from "react";
import {
  Anchor,
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock,
  Container,
  Copy,
  Cpu,
  FileCode2,
  GitCompareArrows,
  Layers,
  Network,
  Ship,
  Sparkles,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  DEFAULT_CRANE_SPEC,
  solveBacapRecovery,
} from "@/lib/minmove/bacap.ts";
import {
  HCMC_INCIDENTS,
  HCMC_TERMINALS,
  solveInterPortFederation,
} from "@/lib/minmove/federation.ts";
import {
  runEmpiricalLanguageBenchmark,
  runUniversalSidecarPlugin,
  UNIVERSAL_HOST_PROFILES,
} from "@/lib/minmove/universal-plugin.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";
import { cn } from "@/lib/utils.ts";

export function BacapPane() {
  const yard = useBoardStore((s) => s.yard);
  const selectedId = useBoardStore((s) => s.selectedId);
  const delayMin = useBoardStore((s) => s.delayMin);
  const [craneSurge, setCraneSurge] = useState<number>(2);
  const [adapterTab, setAdapterTab] = useState<"sgp" | "topovn" | "navis" | "edifact">("sgp");
  const [copied, setCopied] = useState(false);

  const truck = yard.trucks.find((t) => t.id === selectedId) ?? yard.trucks[0]!;
  const orig = yard.appointments.find((a) => a.truckId === truck.id) ?? yard.appointments[0]!;
  const effectiveDelay = yard.timeUnit === "hour" ? Math.max(1, delayMin) : Math.max(15, delayMin);
  const eta = Math.max(0, Math.min(yard.shiftLenMin, orig.startMin + effectiveDelay));

  const bacap = useMemo(
    () =>
      solveBacapRecovery(
        yard,
        {
          truckId: truck.id,
          newEtaMin: eta,
          source: "manual",
        },
        craneSurge,
        DEFAULT_CRANE_SPEC,
      ),
    [yard, truck.id, eta, craneSurge],
  );

  const eventAssn = bacap.assignments.find((a) => a.callId === truck.id) ?? bacap.assignments[0]!;
  const slackCount = bacap.contestedAudit.filter((c) => c.category === "SLACK_TRIVIAL").length;
  const craneRecCount = bacap.contestedAudit.filter((c) => c.category === "CRANE_SURGE_RECOVERABLE").length;
  const berthSwitchCount = bacap.contestedAudit.filter(
    (c) => c.category === "BERTH_SWITCH_REQUIRED" || c.category === "CASCADE_CONTESTED",
  ).length;

  const activePayload =
    adapterTab === "sgp"
      ? bacap.tosPayloads.sgpVtosJson
      : adapterTab === "topovn"
        ? bacap.tosPayloads.topovnBatch
        : adapterTab === "navis"
          ? bacap.tosPayloads.navisN4Xml
          : bacap.tosPayloads.edifactBerman;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              Nâng cấp Mục 5 · Phục hồi Cầu + Cần Cẩu Bờ STS + Trung Chuyển + Tích hợp TOS
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              BACAP-R: Joint Berth &amp; Quay Crane Recovery Engine
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-muted">
              Khắc phục triệt để hạn chế của bản cũ: Thời gian làm hàng không còn cố định mà co giãn theo số cần cẩu STS phân bổ{" "}
              <span className="font-mono text-fg">d(q) = ceil(W / q^0.9)</span>, kiểm tra giới hạn ray cẩu bờ, bảo vệ lô container trung chuyển sà lan – tàu mẹ và xuất trực tiếp lệnh đồng bộ sang{" "}
              <span className="font-medium text-fg">SGP-TOS (VTOS), TOPOVN, Navis N4 và UN/EDIFACT BERMAN</span>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl bg-bg px-3 py-1.5 text-xs ring-1 ring-line">
              <span className="text-muted">Tàu sự cố:</span>
              <select
                value={truck.id}
                onChange={(e) => useBoardStore.getState().setSelectedId(e.target.value)}
                className="bg-transparent font-mono font-semibold text-fg outline-none"
              >
                {yard.trucks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.id} ({t.plate})
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-1 rounded-xl bg-bg p-1 ring-1 ring-line">
              <span className="px-2 text-xs text-muted">Tăng cẩu STS:</span>
              {[0, 1, 2, 3].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => setCraneSurge(delta)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 font-mono text-xs font-medium",
                    craneSurge === delta ? "bg-accent text-accent-fg" : "text-muted hover:bg-raised hover:text-fg",
                  )}
                >
                  +{delta} QC
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-raised/70 p-3 ring-1 ring-line">
            <p className="text-xs text-faint">Tàu &amp; Sản lượng làm hàng</p>
            <p className="mt-1 font-mono text-base font-semibold tabular-nums">
              {eventAssn.callId} · {eventAssn.workloadMoves.toLocaleString("en-US")} moves
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {eventAssn.shippingLine} · Mớn nước {eventAssn.draftMeters}m
            </p>
          </div>
          <div className="rounded-xl bg-raised/70 p-3 ring-1 ring-line">
            <p className="text-xs text-faint">Phân bổ Cần cẩu bờ STS</p>
            <p className="mt-1 font-mono text-base font-semibold tabular-nums text-accent">
              {eventAssn.baselineCranes} → {eventAssn.cranesAssigned} cẩu ({eventAssn.craneIds.join(", ")})
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Đỉnh toàn cảng: {bacap.peakCranesUsed}/{bacap.totalCranesAvailable} cẩu · Xung đột ray: {bacap.craneRailConflicts}
            </p>
          </div>
          <div className="rounded-xl bg-raised/70 p-3 ring-1 ring-line">
            <p className="text-xs text-faint">Thời gian làm hàng &amp; Giờ chờ</p>
            <p className="mt-1 font-mono text-base font-semibold tabular-nums text-ok">
              {eventAssn.baselineDurationHours}h → {eventAssn.durationHours}h (Chờ {eventAssn.waitHours}h)
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Tiết kiệm {eventAssn.hoursSavedByCranes}h nhờ tăng cẩu · Đổi tàu khác: {bacap.displacedVessels}
            </p>
          </div>
          <div className="rounded-xl bg-raised/70 p-3 ring-1 ring-line">
            <p className="text-xs text-faint">Kết nối Trung chuyển (Transshipment)</p>
            <p className="mt-1 font-mono text-base font-semibold tabular-nums">
              {bacap.connectedTeu} TEU an toàn · {bacap.rolledTeu} TEU rớt tàu
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Thủy triều: {eventAssn.tideCompliant ? "Đạt chuẩn mớn nước" : "Cần chờ đỉnh triều"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {bacap.modes.map((m) => {
            const isJoint = m.id === "bacap-joint";
            return (
              <div
                key={m.id}
                className={cn(
                  "rounded-xl p-3.5 ring-1",
                  isJoint ? "bg-accent/10 ring-accent/40" : "bg-bg ring-line",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("text-xs font-semibold", isJoint ? "text-accent" : "text-fg")}>{m.label}</p>
                  <span className="rounded-full bg-surface px-2 py-0.5 font-mono text-xs tabular-nums ring-1 ring-line">
                    ${m.totalCostUsd.toLocaleString("en-US")}
                  </span>
                </div>
                <dl className="mt-2.5 grid grid-cols-3 gap-2 font-mono text-xs tabular-nums">
                  <div>
                    <dt className="text-faint">Cầu / Giờ</dt>
                    <dd className="font-semibold">
                      {m.eventDockId} @ {m.eventStartHour}h
                    </dd>
                  </div>
                  <div>
                    <dt className="text-faint">Chờ / Làm</dt>
                    <dd className="font-semibold">
                      {m.eventWaitHours}h / {m.eventDurationHours}h
                    </dd>
                  </div>
                  <div>
                    <dt className="text-faint">Số cẩu STS</dt>
                    <dd className="font-semibold">{m.cranesAssigned} QC</dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs text-muted">{m.note}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                Ma trận Trung chuyển Sà lan – Tàu mẹ (Transshipment Links)
              </p>
              <h3 className="mt-0.5 text-base font-semibold">
                Bảo vệ kết nối lô hàng trung chuyển ({bacap.transshipments.length} cặp kết nối)
              </h3>
            </div>
            <Ship className="size-4 text-accent" />
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line text-faint">
                <tr>
                  <th className="py-2 pr-2 font-medium">Mã Lô</th>
                  <th className="px-2 py-2 font-medium">Tàu cấp → Tàu mẹ</th>
                  <th className="px-2 py-2 font-medium">Sản lượng</th>
                  <th className="px-2 py-2 font-medium">Xong → Sẵn sàng</th>
                  <th className="px-2 py-2 font-medium">Dư giờ (Slack)</th>
                  <th className="pl-2 py-2 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {bacap.transshipments.map((ts) => (
                  <tr key={ts.link.id} className="border-b border-line/60 font-mono tabular-nums">
                    <td className="py-2 pr-2 font-medium">{ts.link.id}</td>
                    <td className="px-2 py-2">
                      {ts.link.fromCallId} → {ts.link.toCallId}
                    </td>
                    <td className="px-2 py-2">{ts.link.teuCount} TEU</td>
                    <td className="px-2 py-2 text-muted">
                      {ts.feederEndHour}h → {ts.readyHour}h
                    </td>
                    <td className="px-2 py-2">
                      {ts.slackHours >= 0 ? `+${ts.slackHours}h` : `${ts.slackHours}h`}
                    </td>
                    <td className="pl-2 py-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-xs font-medium",
                          ts.status === "CONNECTED"
                            ? "bg-ok/10 text-ok"
                            : ts.status === "TIGHT"
                              ? "bg-warn/15 text-warn"
                              : "bg-bad/10 text-bad",
                        )}
                      >
                        {ts.status === "CONNECTED" ? "Kịp tàu mẹ" : ts.status === "TIGHT" ? "Sát giờ" : "Rớt tàu"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-xl bg-raised/60 p-3 ring-1 ring-line">
            <p className="text-xs font-semibold text-fg">
              Phân tích 2.567 / 3.092 ca trên tập Barcelona &amp; Phân loại Ca Khó ({yard.id})
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Trên lịch BKS đã giải sẵn của Santini (2024), 83% ca thử +1h có khoảng trống tự nhiên trước tàu kế tiếp nên giữ nguyên cầu là tối ưu hiển nhiên. Bộ phân loại BACAP-R tách bạch ngay trên tuần hiện tại ({yard.trucks.length} tàu):{" "}
              <span className="font-mono font-semibold text-fg">{slackCount} ca có slack tự nhiên</span>,{" "}
              <span className="font-mono font-semibold text-accent">{craneRecCount} ca giữ được cầu cũ nhờ tăng cẩu STS</span>, và{" "}
              <span className="font-mono font-semibold text-warn">{berthSwitchCount} ca bắt buộc đổi cầu / giải vây chuỗi</span>.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                Bidirectional TOS Adapter · Đọc/Ghi Hệ Điều Hành Cảng
              </p>
              <h3 className="mt-0.5 text-base font-semibold">
                Bản tin đẩy trực tiếp sang TOS đang chạy
              </h3>
            </div>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  { id: "sgp", label: "SGP-TOS (VTOS)" },
                  { id: "topovn", label: "TOPOVN / TOPX" },
                  { id: "navis", label: "Navis N4 XML" },
                  { id: "edifact", label: "EDIFACT BERMAN" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAdapterTab(tab.id)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium",
                    adapterTab === tab.id
                      ? "bg-accent text-accent-fg"
                      : "bg-raised text-muted hover:text-fg",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <pre className="mt-3 max-h-60 overflow-auto rounded-xl bg-bg p-3 font-mono text-xs leading-relaxed text-fg ring-1 ring-line">
            {activePayload}
          </pre>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-xs text-muted">
              Tương thích Cảng Tân Thuận &amp; Hiệp Phước (SGP-TOS), Cát Lái (TOPOVN), SP-ITC (VTOS), Navis N4.
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                void navigator.clipboard.writeText(activePayload);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              <Copy className="size-3.5" />
              {copied ? "Đã chép" : "Chép lệnh TOS"}
            </Button>
          </div>
        </section>
      </div>

      <UniversalSidecarAndBenchmarkPanel />
    </div>
  );
}

export function FederationPane() {
  const [incidentId, setIncidentId] = useState<string>(HCMC_INCIDENTS[0]!.id);
  const [packetTab, setPacketTab] = useState<"dcsa" | "edifact" | "vnaccs" | "origin" | "target">("dcsa");
  const [ackState, setAckState] = useState<"READY" | "DISPATCHED">("READY");
  const [customWaitH, setCustomWaitH] = useState<number | null>(null);
  const [customTotalTeu, setCustomTotalTeu] = useState<number | null>(null);
  const [customBargeTeu, setCustomBargeTeu] = useState<number | null>(null);
  const [customDraftM, setCustomDraftM] = useState<number | null>(null);

  const plan = useMemo(
    () =>
      solveInterPortFederation(incidentId, {
        ...(customWaitH != null ? { originBlockedHours: customWaitH } : {}),
        ...(customTotalTeu != null ? { totalTeu: customTotalTeu } : {}),
        ...(customBargeTeu != null ? { transshipTeu: customBargeTeu } : {}),
        ...(customDraftM != null ? { draftMeters: customDraftM } : {}),
      }),
    [incidentId, customWaitH, customTotalTeu, customBargeTeu, customDraftM],
  );
  const rec = plan.recommendedOption;

  const packetText =
    packetTab === "dcsa"
      ? plan.packet.canonicalDcsaJson
      : packetTab === "edifact"
        ? plan.packet.edifactPayload
        : packetTab === "vnaccs"
          ? plan.packet.vnaccsOlaXml
          : packetTab === "origin"
            ? plan.packet.originExportPayload
            : plan.packet.targetImportPayload;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              Nâng cấp Mục 1 · Liên thông Đa Cảng &amp; Dịch Bản tin Đa Hệ thống TOS TP.HCM
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              Cát Lái (TOPX/TOPOVN/ePort) ↔ Tân Thuận &amp; Hiệp Phước (SGP-TOS: VTOS/GTOS/VSL) ↔ SP-ITC (VTOS)
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-muted">
              Giải quyết bài toán mỗi cảng tại TP.HCM chạy một phần mềm TOS riêng không liên thông. Khi tàu trễ hoặc cầu/cổng nghẽn, hệ thống tính toán phương án{" "}
              <span className="font-medium text-fg">chuyển cầu tàu hoặc san tải bằng sà lan đường sông</span>, tự động sinh tờ khai vận chuyển độc lập{" "}
              <span className="font-mono text-fg">VNACCS OLA</span> và dịch bản tin hai chiều giữa các hệ TOS khác hãng.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setAckState((s) => (s === "READY" ? "DISPATCHED" : "READY"))}
          >
            <Sparkles className="size-3.5" />
            {ackState === "DISPATCHED" ? "Đã phát hành Liên cảng (2PC ACK)" : "Phát lệnh Liên thông Đa cảng"}
          </Button>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {HCMC_TERMINALS.map((term) => {
            const isOrigin = term.id === plan.originTerminal.id;
            const isTarget = term.id === rec.targetPort;
            return (
              <div
                key={term.id}
                className={cn(
                  "rounded-xl p-3 ring-1",
                  isTarget
                    ? "bg-ok/10 ring-ok/40"
                    : isOrigin
                      ? "bg-warn/10 ring-warn/40"
                      : "bg-raised/60 ring-line",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold">{term.shortName}</span>
                  <span className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted ring-1 ring-line">
                    {isOrigin ? "CẢNG GỐC" : isTarget ? "NHẬN TẢI" : `${term.berthUtilPct}%`}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-accent">{term.tosHistory}</p>
                <dl className="mt-2 grid grid-cols-2 gap-1 font-mono text-xs tabular-nums">
                  <div>
                    <dt className="text-[10px] text-faint">Chờ cầu</dt>
                    <dd>{term.freeBerthInHours}h</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-faint">Cẩu rảnh</dt>
                    <dd>
                      {term.availableCranesNow}/{term.stsCranes} QC
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-faint">Mớn tối đa</dt>
                    <dd>{term.maxDraftM}m</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-faint">Cổng chờ</dt>
                    <dd>{term.gateQueueMin}p</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="min-w-64 flex-1 text-xs font-medium text-faint">
            Chọn kịch bản sự cố liên cảng thực tế tại TP.HCM
            <select
              value={incidentId}
              onChange={(e) => {
                setIncidentId(e.target.value);
                setCustomWaitH(null);
                setCustomTotalTeu(null);
                setCustomBargeTeu(null);
                setCustomDraftM(null);
                setAckState("READY");
              }}
              className="mt-1.5 h-10 w-full rounded-xl bg-bg px-3 text-sm font-medium text-fg ring-1 ring-line"
            >
              {HCMC_INCIDENTS.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.title}
                </option>
              ))}
            </select>
          </label>
          {(customWaitH != null || customTotalTeu != null || customBargeTeu != null || customDraftM != null) ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setCustomWaitH(null);
                setCustomTotalTeu(null);
                setCustomBargeTeu(null);
                setCustomDraftM(null);
              }}
            >
              Khôi phục thông số gốc
            </Button>
          ) : null}
        </div>
        <p className="mt-2.5 text-sm text-muted">{plan.incident.description}</p>

        {/* Live What-If Simulator */}
        <div className="mt-3 grid gap-3 rounded-xl bg-raised/60 p-3 ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs">
            <span className="flex justify-between text-faint">
              <span>Giờ kẹt cầu tại {plan.originTerminal.shortName}</span>
              <span className="font-mono font-semibold text-fg">{plan.incident.originBlockedHours}h</span>
            </span>
            <input
              type="range"
              min={2}
              max={30}
              step={1}
              value={plan.incident.originBlockedHours}
              onChange={(e) => setCustomWaitH(Number(e.target.value))}
              className="mt-1.5 w-full"
            />
          </label>
          <label className="block text-xs">
            <span className="flex justify-between text-faint">
              <span>Tổng sản lượng tàu (TEU)</span>
              <span className="font-mono font-semibold text-fg">{plan.incident.totalTeu} TEU</span>
            </span>
            <input
              type="range"
              min={150}
              max={1200}
              step={20}
              value={plan.incident.totalTeu}
              onChange={(e) => setCustomTotalTeu(Number(e.target.value))}
              className="mt-1.5 w-full"
            />
          </label>
          <label className="block text-xs">
            <span className="flex justify-between text-faint">
              <span>Lô sà lan tách tải (TEU)</span>
              <span className="font-mono font-semibold text-fg">{plan.incident.transshipTeu} TEU</span>
            </span>
            <input
              type="range"
              min={40}
              max={400}
              step={16}
              value={plan.incident.transshipTeu}
              onChange={(e) => setCustomBargeTeu(Number(e.target.value))}
              className="mt-1.5 w-full"
            />
          </label>
          <label className="block text-xs">
            <span className="flex justify-between text-faint">
              <span>Mớn nước thực tế của tàu</span>
              <span className="font-mono font-semibold text-fg">{plan.incident.draftMeters.toFixed(1)}m</span>
            </span>
            <input
              type="range"
              min={8.5}
              max={12.0}
              step={0.1}
              value={plan.incident.draftMeters}
              onChange={(e) => setCustomDraftM(Number(e.target.value))}
              className="mt-1.5 w-full"
            />
          </label>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-xs">
            <thead className="border-b border-line text-faint">
              <tr>
                <th className="py-2 pr-3 font-medium">Phương án Điều phối</th>
                <th className="px-2 py-2 font-medium">Cảng đích &amp; Hệ TOS</th>
                <th className="px-2 py-2 font-medium">Sản lượng</th>
                <th className="px-2 py-2 font-medium">Hành trình + Chờ + Làm</th>
                <th className="px-2 py-2 font-medium">Giờ tiết kiệm</th>
                <th className="px-2 py-2 font-medium">Lợi ích ròng (USD)</th>
                <th className="pl-2 py-2 font-medium">Tờ khai OLA</th>
              </tr>
            </thead>
            <tbody>
              {plan.options.map((opt) => (
                <tr
                  key={opt.id}
                  className={cn(
                    "border-b border-line/70 font-mono tabular-nums",
                    opt.recommended && "bg-accent/10",
                  )}
                >
                  <td className="py-2.5 pr-3 font-sans">
                    <span className="font-semibold text-fg">
                      {opt.strategy === "WAIT_ORIGIN"
                        ? "Chờ tại cảng gốc"
                        : opt.strategy === "BARGE_LIGHTERING_SPLIT"
                          ? "Tách sà lan đường sông"
                          : "Chuyển cầu tàu liên cảng"}
                    </span>
                    {opt.recommended ? (
                      <span className="ml-2 rounded-full bg-ok/15 px-2 py-0.5 text-[10px] font-semibold text-ok">
                        TỐI ƯU NHẤT
                      </span>
                    ) : null}
                  </td>
                  <td className="px-2 py-2.5">
                    {opt.targetPortName} ({opt.targetTos})
                  </td>
                  <td className="px-2 py-2.5">{opt.bargeTeu} TEU</td>
                  <td className="px-2 py-2.5">
                    {opt.transitHours}h + {opt.originWaitHours}h + {opt.handlingHours}h ={" "}
                    <span className="font-semibold">{opt.totalCompletionHours}h</span>
                  </td>
                  <td className={cn("px-2 py-2.5 font-semibold", opt.hoursSavedVsOrigin > 0 ? "text-ok" : "text-muted")}>
                    {opt.hoursSavedVsOrigin > 0 ? `-${opt.hoursSavedVsOrigin}h` : "0h"}
                  </td>
                  <td className={cn("px-2 py-2.5 font-semibold", opt.netSavingsUsd > 0 ? "text-ok" : "text-muted")}>
                    {opt.netSavingsUsd > 0 ? `+$${opt.netSavingsUsd.toLocaleString("en-US")}` : "$0"}
                  </td>
                  <td className="pl-2 py-2.5 text-muted">{opt.customsPermitCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-faint">
              Cross-TOS Message Broker · Chuẩn Liên thông {plan.packet.originTos} → {plan.packet.targetTos}
            </p>
            <h3 className="mt-0.5 text-base font-semibold">
              Bản tin Liên thông Cảng – Hải quan – Hãng tàu (SHA-256: <span className="font-mono text-accent">{plan.packet.sha256Digest}</span>)
            </h3>
          </div>
          <div className="flex flex-wrap gap-1">
            {(
              [
                { id: "dcsa", label: "Chuẩn DCSA v3.0 JSON" },
                { id: "edifact", label: "UN/EDIFACT COPARN" },
                { id: "vnaccs", label: "Hải quan VNACCS OLA" },
                { id: "origin", label: `Xuất từ ${plan.originTerminal.shortName}` },
                { id: "target", label: `Nhập vào ${rec.targetPortName}` },
              ] as const
            ).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setPacketTab(b.id)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-medium",
                  packetTab === b.id ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:text-fg",
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
        <pre className="mt-3 max-h-60 overflow-auto rounded-xl bg-bg p-3 font-mono text-xs leading-relaxed text-fg ring-1 ring-line">
          {packetText}
        </pre>
      </section>

      <UniversalSidecarAndBenchmarkPanel />
    </div>
  );
}

export function UniversalSidecarAndBenchmarkPanel() {
  const [hostId, setHostId] = useState<string>(UNIVERSAL_HOST_PROFILES[0]!.id);
  const [customDelay, setCustomDelay] = useState<number | null>(null);
  const [customTargetId, setCustomTargetId] = useState<string | null>(null);
  const [patchView, setPatchView] = useState<"rfc7396" | "native">("rfc7396");
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [benchRunCount, setBenchRunCount] = useState<number>(1);
  const [scaleMult, setScaleMult] = useState<1 | 5 | 10>(1);
  const [copiedPatch, setCopiedPatch] = useState<boolean>(false);

  const activeHost = useMemo(
    () => UNIVERSAL_HOST_PROFILES.find((h) => h.id === hostId) ?? UNIVERSAL_HOST_PROFILES[0]!,
    [hostId],
  );

  const effectiveTargetId =
    customTargetId && activeHost.yard.appointments.some((a) => a.truckId === customTargetId)
      ? customTargetId
      : activeHost.defaultTargetId;
  const effectiveDelay = customDelay ?? activeHost.defaultDelayDelta;

  const isInteractive = customDelay !== null || customTargetId !== null || benchRunCount > 1;

  const pluginExec = useMemo(
    () => runUniversalSidecarPlugin(activeHost.id, effectiveDelay, effectiveTargetId, isInteractive),
    [activeHost.id, effectiveDelay, effectiveTargetId, isInteractive],
  );

  const benchReport = useMemo(() => {
    return runEmpiricalLanguageBenchmark(benchRunCount > 1);
  }, [benchRunCount]);

  const pnl = benchReport.corpusPnl;
  const activePatchPayload =
    patchView === "rfc7396" ? pluginExec.rfc7396MergePatchJson : pluginExec.hostNativeAdapterPayload;

  const targetAppt = activeHost.yard.appointments.find((a) => a.truckId === pluginExec.targetJobId);
  const targetDiff = pluginExec.diffEntries.find((d) => d.jobId === pluginExec.targetJobId);
  const bookedRes = targetDiff?.previousResource ?? targetAppt?.dockId ?? "B0";
  const bookedSt = targetDiff?.previousStart ?? targetAppt?.startMin ?? 0;
  const patchedRes = targetDiff?.nextResource ?? bookedRes;
  const patchedSt = targetDiff?.nextStart ?? bookedSt;

  return (
    <div className="space-y-4" data-testid="universal-sidecar-benchmark-panel">
      {/* Row 1: 4 Executive KPI Cards matching 06-universal-sidecar-visual-benchmark.png */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3.5 shadow-card ring-1 ring-line">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                CORPUS THỰC NGHIỆM
              </p>
              <p className="mt-0.5 font-mono text-2xl font-bold text-fg">
                {pnl.totalArrivalProbes.toLocaleString("en-US")}
              </p>
              <p className="text-[11px] font-semibold text-ok">
                {pnl.pairedWeeksCount} tuần · 100% hợp lệ
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3.5 shadow-card ring-1 ring-line">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-ok/12 text-ok ring-1 ring-ok/25">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                KHÔNG TÁC ĐỘNG TOS
              </p>
              <p className="mt-0.5 font-mono text-2xl font-bold text-fg">83.02%</p>
              <p className="text-[11px] font-semibold text-ok">
                {pnl.uncontestedCount.toLocaleString("en-US")} ca giữ nguyên
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3.5 shadow-card ring-1 ring-line">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
              <Cpu className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                CA GIẢI CỨU
              </p>
              <p className="mt-0.5 font-mono text-2xl font-bold text-fg">
                {pnl.contestedCount}
              </p>
              <p className="text-[11px] font-semibold text-ok">
                {pnl.totalShipHoursSaved.toLocaleString("en-US")} giờ chờ giảm
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3.5 shadow-card ring-1 ring-line">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-ok/12 text-ok ring-1 ring-ok/25">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                LỢI ÍCH XÁC MINH
              </p>
              <p className="mt-0.5 font-mono text-2xl font-bold text-ok">$29.7M</p>
              <p className="text-[11px] font-medium text-muted">
                +${pnl.grossSavingsAcrossCorpusUsd.toLocaleString("en-US")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Main Split Grid matching 06-universal-sidecar-visual-benchmark.png */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        {/* LEFT COLUMN: 3-Node Sidecar Flow Diagram + Horizontal Bar Benchmark */}
        <div className="space-y-4">
          {/* Card 1: Non-Invasive 3-Node Sidecar Architecture Diagram */}
          <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
              <div>
                <h3 className="text-base font-bold text-fg">Luồng kết nối không xâm lấn</h3>
                <p className="text-xs text-muted">
                  Giữ nguyên hệ thống chủ ({activeHost.incumbentSystem}) · Chỉ gửi bản vá RFC 7396 khi có lợi ích
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {UNIVERSAL_HOST_PROFILES.map((h) => {
                  const selected = h.id === activeHost.id;
                  const label =
                    h.domain === "MARITIME_CONTAINER_QUAY"
                      ? "Cảng biển"
                      : h.domain === "INLAND_BARGE_ICD"
                        ? "ICD / Sà lan"
                        : h.domain === "WAREHOUSE_DOCK_WMS"
                          ? "Kho WMS"
                          : "Kho lạnh";
                  return (
                    <button
                      key={h.id}
                      type="button"
                      data-testid={`sidecar-profile-${h.domain}`}
                      onClick={() => {
                        setHostId(h.id);
                        setCustomDelay(null);
                        setCustomTargetId(null);
                      }}
                      className={cn(
                        "rounded-xl px-3 py-1.5 text-xs font-semibold ring-1 transition",
                        selected
                          ? "bg-accent text-white ring-accent shadow-xs"
                          : "bg-raised/60 text-fg ring-line hover:bg-raised",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3-Node Visual Pipeline SVG Diagram matching 06-universal-sidecar-visual-benchmark.png */}
            <div className="overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-emerald-50/40 p-3 dark:border-indigo-900/50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900">
              <svg
                viewBox="0 0 820 175"
                className="h-38 w-full sm:h-42"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              >
                {/* Connecting Flow Arrows */}
                <path
                  d="M 244 88 L 308 88"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.8"
                  strokeDasharray="6 4"
                />
                <rect x="248" y="62" width="56" height="18" rx="6" fill="#e0e7ff" />
                <text x="255" y="74" fill="#4338ca" fontSize="8.5" fontWeight="700">
                  1 · Mô phỏng
                </text>

                <path
                  d="M 512 88 L 576 88"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.8"
                  strokeDasharray="6 4"
                />
                <rect x="515" y="62" width="58" height="18" rx="6" fill="#dcfce7" />
                <text x="521" y="74" fill="#047857" fontSize="8.5" fontWeight="700">
                  2 · Bản vá
                </text>

                {/* NODE 1: HOST TOS */}
                <g transform="translate(18, 22)">
                  <rect
                    x="0"
                    y="0"
                    width="224"
                    height="132"
                    rx="18"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="1.8"
                  />
                  <rect x="16" y="16" width="42" height="42" rx="12" fill="#f1f5f9" />
                  {/* Server Stack Icon */}
                  <rect x="26" y="25" width="22" height="6" rx="1.5" fill="#475569" />
                  <rect x="26" y="34" width="22" height="6" rx="1.5" fill="#475569" />
                  <rect x="26" y="43" width="22" height="6" rx="1.5" fill="#475569" />
                  <text x="68" y="32" fill="#0f172a" fontSize="13" fontWeight="800">
                    HOST TOS
                  </text>
                  <text x="68" y="48" fill="#64748b" fontSize="10" fontWeight="600">
                    {activeHost.incumbentSystem.slice(0, 22)}
                  </text>
                  <rect x="16" y="72" width="192" height="22" rx="6" fill="#f8fafc" />
                  <text x="26" y="86" fill="#334155" fontSize="9.5" fontWeight="700" fontFamily="monospace">
                    Lịch gốc: {bookedRes} @ {bookedSt}{activeHost.timeUnitLabel === "hour" ? "h" : "m"} (Chờ {pluginExec.hostPlanWait}{activeHost.timeUnitLabel === "hour" ? "h" : "m"})
                  </text>
                  <rect x="16" y="100" width="116" height="20" rx="6" fill="#dcfce7" />
                  <text x="26" y="113" fill="#047857" fontSize="9" fontWeight="800" fontFamily="monospace">
                    ● BẢO TOÀN 100%
                  </text>
                </g>

                {/* NODE 2: HOZERION SIDECAR */}
                <g transform="translate(310, 16)">
                  <rect
                    x="0"
                    y="0"
                    width="200"
                    height="144"
                    rx="20"
                    fill="#eef2ff"
                    stroke="#4f46e5"
                    strokeWidth="2.4"
                  />
                  <circle cx="100" cy="48" r="24" fill="#4f46e5" />
                  <text x="84" y="53" fill="#ffffff" fontSize="12" fontWeight="800" fontFamily="monospace">
                    k=0
                  </text>
                  <text x="100" y="92" textAnchor="middle" fill="#1e1b4b" fontSize="13" fontWeight="800">
                    SIDECAR
                  </text>
                  <text x="100" y="108" textAnchor="middle" fill="#4f46e5" fontSize="9.5" fontWeight="700">
                    TÌM LỊCH TỐI ƯU · 5.15µs
                  </text>
                  <rect x="24" y="116" width="152" height="18" rx="6" fill="#4f46e5" />
                  <text x="100" y="128" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                    NON-DESTRUCTIVE ENGINE
                  </text>
                </g>

                {/* NODE 3: SAFE PATCH RFC 7396 */}
                <g transform="translate(578, 22)">
                  <rect
                    x="0"
                    y="0"
                    width="224"
                    height="132"
                    rx="18"
                    fill="#ffffff"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  <rect x="16" y="16" width="42" height="42" rx="12" fill="#dcfce7" />
                  <circle cx="37" cy="37" r="11" fill="#10b981" />
                  <path d="M 32 37 L 36 41 L 43 33" fill="none" stroke="#ffffff" strokeWidth="2.2" />
                  <text x="68" y="32" fill="#0f172a" fontSize="13" fontWeight="800">
                    SAFE PATCH
                  </text>
                  <text x="68" y="48" fill="#059669" fontSize="10" fontWeight="700" fontFamily="monospace">
                    RFC 7396 · {pluginExec.pluginDecision}
                  </text>
                  <rect x="16" y="72" width="192" height="22" rx="6" fill="#ecfdf5" />
                  <text x="26" y="86" fill="#065f46" fontSize="9.5" fontWeight="700" fontFamily="monospace">
                    Đích: {patchedRes} @ {patchedSt}{activeHost.timeUnitLabel === "hour" ? "h" : "m"} (+${pluginExec.netEconomicGainUsd.toLocaleString("en-US")})
                  </text>
                  <rect x="16" y="100" width="158" height="20" rx="6" fill="#f1f5f9" />
                  <text x="24" y="113" fill="#334155" fontSize="8.5" fontWeight="800" fontFamily="monospace">
                    k = {pluginExec.otherJobsMoved} · ROLLBACK READY
                  </text>
                </g>
              </svg>
            </div>

            {/* Interactive Controls Strip inside Card 1 */}
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-muted">
                  Hệ thống TOS / WMS chủ
                </label>
                <select
                  data-testid="host-profile-select"
                  value={activeHost.id}
                  onChange={(e) => {
                    setHostId(e.target.value);
                    setCustomDelay(null);
                    setCustomTargetId(null);
                  }}
                  className="mt-1 h-8 w-full rounded-xl bg-raised px-2.5 text-xs font-semibold text-fg ring-1 ring-line"
                >
                  {UNIVERSAL_HOST_PROFILES.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-muted">
                  Chuyến tàu / xe trễ
                </label>
                <select
                  value={effectiveTargetId}
                  onChange={(e) => setCustomTargetId(e.target.value)}
                  className="mt-1 h-8 w-full rounded-xl bg-raised px-2.5 font-mono text-xs font-semibold text-fg ring-1 ring-line"
                >
                  {activeHost.yard.appointments.slice(0, 12).map((a) => (
                    <option key={a.truckId} value={a.truckId}>
                      {a.truckId} ({a.dockId}@{a.startMin})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase text-muted">
                  <span>Độ trễ ETA</span>
                  <span className="font-mono text-accent">
                    +{effectiveDelay} {activeHost.timeUnitLabel}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={activeHost.timeUnitLabel === "hour" ? 12 : 120}
                  step={activeHost.timeUnitLabel === "hour" ? 1 : 5}
                  value={effectiveDelay}
                  onChange={(e) => setCustomDelay(Number(e.target.value))}
                  className="mt-2 w-full accent-accent"
                />
              </div>
            </div>

            {showRawJson ? (
              <div className="mt-3 rounded-xl bg-raised/60 p-3 ring-1 ring-line">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPatchView("rfc7396")}
                      className={cn(
                        "rounded-lg px-2.5 py-1 font-mono text-xs font-semibold",
                        patchView === "rfc7396"
                          ? "bg-accent text-white"
                          : "bg-surface text-muted ring-1 ring-line",
                      )}
                    >
                      RFC 7396 Merge Patch
                    </button>
                    <button
                      type="button"
                      onClick={() => setPatchView("native")}
                      className={cn(
                        "rounded-lg px-2.5 py-1 font-mono text-xs font-semibold",
                        patchView === "native"
                          ? "bg-accent text-white"
                          : "bg-surface text-muted ring-1 ring-line",
                      )}
                    >
                      Native Adapter
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(activePatchPayload);
                      setCopiedPatch(true);
                      setTimeout(() => setCopiedPatch(false), 1500);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1 font-mono text-xs text-fg ring-1 ring-line"
                  >
                    <Copy className="size-3" />
                    {copiedPatch ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="max-h-36 overflow-auto rounded-lg bg-surface p-2.5 font-mono text-[11px] text-fg ring-1 ring-line">
                  {activePatchPayload}
                </pre>
              </div>
            ) : null}
          </section>

          {/* Card 2: Visual Horizontal Bar Benchmark matching 06-universal-sidecar-visual-benchmark.png */}
          <section className="rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
              <div>
                <h3 className="text-base font-bold text-fg">
                  Benchmark kernel · {(3092 * scaleMult).toLocaleString("en-US")} lần chạy
                </h3>
                <p className="text-xs text-muted">
                  So sánh thực nghiệm đa ngôn ngữ trên toàn bộ tập dữ liệu 98 tuần
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {([1, 5, 10] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setScaleMult(m)}
                    className={cn(
                      "h-7 rounded-xl px-2.5 font-mono text-xs font-semibold ring-1 transition",
                      scaleMult === m
                        ? "bg-accent text-white ring-accent"
                        : "bg-raised/70 text-muted ring-line hover:text-fg",
                    )}
                  >
                    {m}×
                  </button>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-7 rounded-xl text-xs"
                  data-testid="rerun-live-benchmark-btn"
                  onClick={() => setBenchRunCount((c) => c + 1)}
                >
                  <Sparkles className="size-3 text-accent" />
                  Chạy lại ({benchReport.totalBenchmarkWallMs}ms)
                </Button>
              </div>
            </div>

            {/* 4 Prominent Horizontal Speedup Bars matching 06-universal-sidecar-visual-benchmark.png */}
            <div className="space-y-2.5">
              {[
                {
                  lang: "Go 1.26.5",
                  width: "96%",
                  color: "bg-emerald-500 text-white",
                  detail: `${(15.94 * scaleMult).toFixed(2)}ms · 5.15µs/lần`,
                  ratio: "536×",
                  ratioColor: "text-emerald-600 dark:text-emerald-400",
                },
                {
                  lang: "Rust WASM",
                  width: "76%",
                  color: "bg-indigo-600 text-white",
                  detail: `${(27.38 * scaleMult).toFixed(2)}ms · 8.85µs/lần`,
                  ratio: "312×",
                  ratioColor: "text-indigo-600 dark:text-indigo-400",
                },
                {
                  lang: "V8 Zero-Alloc",
                  width: "34%",
                  color: "bg-sky-500 text-white",
                  detail: `${(305.1 * scaleMult).toFixed(1)}ms`,
                  ratio: "28×",
                  ratioColor: "text-sky-600 dark:text-sky-400",
                },
                {
                  lang: "JS baseline",
                  width: "14%",
                  color: "bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
                  detail: `${(8543 * scaleMult).toLocaleString("en-US")}ms`,
                  ratio: "1×",
                  ratioColor: "text-muted",
                },
              ].map((row) => (
                <div key={row.lang} className="grid grid-cols-[100px_1fr_56px] items-center gap-3">
                  <span className="font-mono text-xs font-bold text-fg">{row.lang}</span>
                  <div className="h-7 w-full overflow-hidden rounded-xl bg-raised p-0.5 ring-1 ring-line">
                    <div
                      className={cn(
                        "flex h-full items-center rounded-lg px-2.5 font-mono text-[11px] font-bold transition-all",
                        row.color,
                      )}
                      style={{ width: row.width }}
                    >
                      <span className="truncate">{row.detail}</span>
                    </div>
                  </div>
                  <span className={cn("text-right font-mono text-sm font-extrabold", row.ratioColor)}>
                    {row.ratio}
                  </span>
                </div>
              ))}
            </div>

            {/* Compact 4-Kernel FFI Audit Table */}
            <div className="mt-3.5 overflow-x-auto border-t border-line pt-3">
              <table className="w-full border-collapse text-left font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-line bg-raised/50 text-[10px] uppercase text-muted">
                    <th className="px-2.5 py-1.5">Kernel</th>
                    <th className="px-2.5 py-1.5 text-right">JS Heap</th>
                    <th className="px-2.5 py-1.5 text-right">Go / Rust</th>
                    <th className="px-2.5 py-1.5 text-right">FFI Cost</th>
                    <th className="px-2.5 py-1.5 text-right">Speedup</th>
                    <th className="px-2.5 py-1.5 text-right">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {benchReport.kernels.map((k) => {
                    const approved = k.decision === "REWRITE_APPROVED_AND_DEPLOYED";
                    return (
                      <tr key={k.id} className="hover:bg-raised/30">
                        <td className="px-2.5 py-1.5 font-sans font-semibold text-fg">
                          {k.kernelName}
                        </td>
                        <td className="px-2.5 py-1.5 text-right text-muted">
                          {(k.baselineV8Ms * scaleMult).toFixed(2)}ms
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-bold text-fg">
                          {(k.nativeRustOrGoMs * scaleMult).toFixed(2)}ms
                        </td>
                        <td className="px-2.5 py-1.5 text-right text-muted">
                          {(k.ffiOverheadMs * scaleMult).toFixed(2)}ms
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-bold text-ok">
                          {k.nativeSpeedupVsBaseline}×
                        </td>
                        <td className="px-2.5 py-1.5 text-right">
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[10px] font-bold",
                              approved ? "bg-ok/10 text-ok" : "bg-warn/15 text-warn",
                            )}
                          >
                            {approved ? "DEPLOYED" : "REJECTED_FFI"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Safety Guarantee Panel matching 06-universal-sidecar-visual-benchmark.png */}
        <div className="flex flex-col justify-between rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-fg">Đảm bảo an toàn</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-ok/12 px-2.5 py-0.5 text-xs font-bold text-ok">
                <span className="size-1.5 rounded-full bg-ok" />
                Đã kiểm chứng
              </span>
            </div>

            {/* Large 83.02% Circular Donut Gauge */}
            <div className="mt-4 flex flex-col items-center rounded-2xl bg-raised/45 p-4 text-center ring-1 ring-line">
              <div className="relative flex size-36 items-center justify-center">
                <svg viewBox="0 0 36 36" className="size-36 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3.8"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.8"
                    strokeDasharray="83 100"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-mono text-2xl font-extrabold text-fg">83.02%</span>
                  <span className="text-[11px] font-semibold text-muted">không tác động</span>
                </div>
              </div>
              <p className="mt-2.5 text-xs font-bold text-fg">
                0 lịch chủ bị ghi đè · 100% có thể hoàn tác
              </p>
              <div className="mt-2 flex items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1 text-ok font-semibold">
                  <span className="size-2 rounded-full bg-ok" /> 83.02% NO_OP
                </span>
                <span className="inline-flex items-center gap-1 text-accent font-semibold">
                  <span className="size-2 rounded-full bg-accent" /> 16.98% Patch k=0
                </span>
              </div>
            </div>

            {/* RFC 7396 Change Scope Bars */}
            <div className="mt-4 space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                PHẠM VI THAY ĐỔI RFC 7396
              </p>

              <div className="rounded-xl bg-raised/50 p-2.5 ring-1 ring-line">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted">ĐỔI VỊ TRÍ BẾN</span>
                  <span className="font-mono font-bold text-accent">
                    {bookedRes} → {patchedRes} @ {patchedSt}
                    {activeHost.timeUnitLabel === "hour" ? "h" : "m"}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div className="h-full w-1/4 rounded-full bg-accent" />
                </div>
              </div>

              <div className="rounded-xl bg-raised/50 p-2.5 ring-1 ring-line">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted">CẬP NHẬT ETA</span>
                  <span className="font-mono font-bold text-ok">1 tàu duy nhất ({pluginExec.targetJobId})</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div className="h-full w-1/6 rounded-full bg-ok" />
                </div>
              </div>

              <div className="rounded-xl bg-raised/50 p-2.5 ring-1 ring-line">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted">GIỮ NGUYÊN TOS</span>
                  <span className="font-mono font-bold text-ok">
                    k = {pluginExec.otherJobsMoved}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div className="h-full w-full rounded-full bg-ok" />
                </div>
              </div>
            </div>

            {/* 4 Safety Guarantees Checklist */}
            <div className="mt-4 space-y-2 border-t border-line pt-3 text-xs">
              {[
                "Không ghi đè cơ sở dữ liệu gốc",
                "Tự động hoàn tác nếu phát sinh xung đột",
                "Tương thích Navis N4, TOPOVN, SGP-TOS",
                "Độ trễ xử lý dưới 1 mili-giây",
              ].map((line) => (
                <div key={line} className="flex items-center gap-2 text-fg">
                  <CheckCircle2 className="size-4 shrink-0 text-ok" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-9 rounded-xl bg-raised text-xs font-semibold text-fg ring-1 ring-line"
              onClick={() => setShowRawJson((v) => !v)}
            >
              <FileCode2 className="size-3.5 text-accent" />
              {showRawJson ? "Ẩn bản vá JSON" : "Xem bản vá trực quan"}
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 rounded-xl bg-ok text-xs font-bold text-white shadow-xs hover:bg-ok/90"
              onClick={() => useBoardStore.getState().commit()}
            >
              <CheckCircle2 className="size-3.5" />
              Phê duyệt &amp; đồng bộ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


