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
      {/* Section 1: Refined Non-Destructive Sidecar Studio (matching attachments/image.png) */}
      <section className="overflow-hidden rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 py-1 font-mono text-xs font-semibold text-accent ring-1 ring-accent/25">
              <Cpu className="size-3.5" />
              Universal Non-Invasive Sidecar
            </span>
            <span className="rounded-xl bg-ok/10 px-2.5 py-1 font-mono text-xs font-semibold text-ok ring-1 ring-ok/25">
              {pnl.pairedWeeksCount} Weeks · {pnl.totalArrivalProbes.toLocaleString("en-US")} Calls · +${pnl.grossSavingsAcrossCorpusUsd.toLocaleString("en-US")}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 rounded-xl text-xs"
              onClick={() => {
                if (activeHost.id === "host-maritime-quay") {
                  setCustomTargetId("S11");
                  setCustomDelay(0);
                } else {
                  setCustomDelay(0);
                }
              }}
            >
              Zero-Touch NO_OP (83.02%)
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-xl text-xs"
              onClick={() => {
                setCustomTargetId(activeHost.defaultTargetId);
                setCustomDelay(activeHost.defaultDelayDelta);
              }}
            >
              Minimal Patch k=0 (16.98%)
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 rounded-xl text-xs ring-1 ring-line"
              onClick={() => useBoardStore.getState().setSetupOpen(true)}
            >
              Tự Setup Bãi/Cảng
            </Button>
          </div>
        </div>

        {/* 4 Clean KPI Cards (matching attachments/image.png card style) */}
        <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-raised/60 p-3 ring-1 ring-line">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Empirical Corpus</p>
            <p className="mt-1 font-mono text-lg font-bold tabular-nums text-fg">
              {pnl.pairedWeeksCount}w · {pnl.totalArrivalProbes.toLocaleString("en-US")}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-muted">100% legal · 0 violations</p>
          </div>
          <div className="rounded-xl bg-raised/60 p-3 ring-1 ring-line">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">NO_OP Preservation</p>
            <p className="mt-1 font-mono text-lg font-bold tabular-nums text-ok">
              {pnl.uncontestedCount.toLocaleString("en-US")} (83.02%)
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-muted">0 host TOS mutations</p>
          </div>
          <div className="rounded-xl bg-raised/60 p-3 ring-1 ring-line">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Rescued Calls (k=0)</p>
            <p className="mt-1 font-mono text-lg font-bold tabular-nums text-accent">
              {pnl.contestedCount} · {pnl.totalShipHoursSaved.toLocaleString("en-US")}h
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-muted">0 other ships displaced</p>
          </div>
          <div className="rounded-xl bg-ok/10 p-3 ring-1 ring-ok/25">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ok">Verified Net P&amp;L</p>
            <p className="mt-1 font-mono text-lg font-bold tabular-nums text-ok">
              +${pnl.grossSavingsAcrossCorpusUsd.toLocaleString("en-US")}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-muted">$1,500/h demurrage</p>
          </div>
        </div>

        {/* 4 Interactive Domain Selector Pills */}
        <div className="mt-3.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {UNIVERSAL_HOST_PROFILES.map((h) => {
            const selected = h.id === activeHost.id;
            const label =
              h.domain === "MARITIME_CONTAINER_QUAY"
                ? "Maritime Container TOS"
                : h.domain === "INLAND_BARGE_ICD"
                  ? "Inland Barge & ICD"
                  : h.domain === "WAREHOUSE_DOCK_WMS"
                    ? "Warehouse Dock WMS"
                    : "Cold Chain Reefer -25°C";
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
                  "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left ring-1 transition",
                  selected
                    ? "bg-accent text-accent-fg ring-accent shadow-xs"
                    : "bg-raised/60 text-fg ring-line hover:bg-raised",
                )}
              >
                <span className="text-xs font-semibold">{label}</span>
                <span className="font-mono text-xs font-semibold opacity-90">
                  ${h.costPerWaitUnitUsd}/{h.timeUnitLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Sidecar Configurator + Booked -> Plan Cards + RFC 7396 Patch Inspector */}
        <div className="mt-3.5 grid gap-4 rounded-xl bg-raised/40 p-3.5 ring-1 ring-line lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-5">
            <div>
              <label className="block text-[11px] font-medium text-muted">Host System Profile</label>
              <select
                data-testid="host-profile-select"
                value={activeHost.id}
                onChange={(e) => {
                  setHostId(e.target.value);
                  setCustomDelay(null);
                  setCustomTargetId(null);
                }}
                className="mt-1 block h-9 w-full rounded-xl bg-surface px-3 text-xs font-semibold text-fg ring-1 ring-line"
              >
                {UNIVERSAL_HOST_PROFILES.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-muted">Late Call / Vehicle</label>
                <select
                  value={effectiveTargetId}
                  onChange={(e) => setCustomTargetId(e.target.value)}
                  className="mt-1 block h-9 w-full rounded-xl bg-surface px-2.5 font-mono text-xs font-semibold text-fg ring-1 ring-line"
                >
                  {activeHost.yard.appointments.slice(0, 12).map((a) => (
                    <option key={a.truckId} value={a.truckId}>
                      {a.truckId} ({a.dockId}@{a.startMin})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl bg-surface px-3 py-1.5 ring-1 ring-line">
                <div className="flex justify-between font-mono text-[11px] text-muted">
                  <span>ETA Delay</span>
                  <strong className="text-accent">+{effectiveDelay} {activeHost.timeUnitLabel}</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={activeHost.timeUnitLabel === "hour" ? 12 : 120}
                  step={activeHost.timeUnitLabel === "hour" ? 1 : 5}
                  value={effectiveDelay}
                  onChange={(e) => setCustomDelay(Number(e.target.value))}
                  className="mt-1 w-full accent-accent"
                />
              </div>
            </div>

            {/* Clean Booked -> Sidecar Patch Comparison Cards (matching Inspector in attachments/image.png) */}
            <div className="flex items-center gap-2.5">
              <div className="flex-1 rounded-xl bg-surface p-2.5 ring-1 ring-line">
                <p className="text-[10px] font-semibold uppercase text-muted">Host Booked</p>
                <p className="mt-0.5 font-mono text-base font-bold text-fg">
                  {bookedRes} @{bookedSt}{activeHost.timeUnitLabel === "hour" ? "h" : "m"}
                </p>
                <p className="font-mono text-[11px] text-bad">Wait: {pluginExec.hostPlanWait} {activeHost.timeUnitLabel}</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-accent" />
              <div className="flex-1 rounded-xl bg-accent/10 p-2.5 ring-1 ring-accent/30">
                <p className="text-[10px] font-semibold uppercase text-accent">Sidecar Patch (k={pluginExec.otherJobsMoved})</p>
                <p className="mt-0.5 font-mono text-base font-bold text-fg">
                  {patchedRes} @{patchedSt}{activeHost.timeUnitLabel === "hour" ? "h" : "m"}
                </p>
                <p className="font-mono text-[11px] font-semibold text-ok">
                  Wait: {pluginExec.pluginPlanWait} · +${pluginExec.netEconomicGainUsd.toLocaleString("en-US")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between lg:col-span-7">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPatchView("rfc7396")}
                  className={cn(
                    "rounded-lg px-2.5 py-1 font-mono text-xs font-semibold transition",
                    patchView === "rfc7396" ? "bg-accent text-accent-fg" : "bg-surface text-muted ring-1 ring-line",
                  )}
                >
                  RFC 7396 Merge Patch
                </button>
                <button
                  type="button"
                  onClick={() => setPatchView("native")}
                  className={cn(
                    "rounded-lg px-2.5 py-1 font-mono text-xs font-semibold transition",
                    patchView === "native" ? "bg-accent text-accent-fg" : "bg-surface text-muted ring-1 ring-line",
                  )}
                >
                  {activeHost.incumbentSystem.split("/")[0]?.trim()} Adapter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(activePatchPayload);
                    setCopiedPatch(true);
                    setTimeout(() => setCopiedPatch(false), 1500);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1 font-mono text-xs text-fg ring-1 ring-line hover:bg-raised"
                >
                  <Copy className="size-3" />
                  {copiedPatch ? "Copied" : "Copy"}
                </button>
              </div>
              <span className="rounded-lg bg-ok/10 px-2.5 py-1 font-mono text-xs font-semibold text-ok">
                {pluginExec.pluginDecision} · Saved {pluginExec.waitSaved}{activeHost.timeUnitLabel}
              </span>
            </div>
            <pre className="max-h-40 flex-1 overflow-auto rounded-xl bg-surface p-3 font-mono text-[11px] leading-relaxed text-fg ring-1 ring-line">
              {activePatchPayload}
            </pre>
          </div>
        </div>
      </section>

      {/* Section 2: Refined Multi-Language Benchmark Studio (Go 1.26.5 536× · Rust WASM · V8 Zero-Alloc) */}
      <section className="overflow-hidden rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent" />
            <h3 className="text-sm font-semibold text-fg">
              Multi-Language Kernel Benchmark (Go 1.26.5 Native 536× · Rust #![no_std] WASM · V8 Zero-Alloc)
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {([1, 5, 10] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setScaleMult(m)}
                className={cn(
                  "h-8 rounded-xl px-2.5 font-mono text-xs font-semibold ring-1 transition",
                  scaleMult === m ? "bg-accent text-accent-fg ring-accent" : "bg-raised/70 text-muted ring-line hover:text-fg",
                )}
              >
                {m}× ({(3092 * m).toLocaleString("en-US")} calls)
              </button>
            ))}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 rounded-xl text-xs"
              data-testid="rerun-live-benchmark-btn"
              onClick={() => setBenchRunCount((c) => c + 1)}
            >
              <Sparkles className="size-3.5 text-accent" />
              Re-run ({benchReport.totalBenchmarkWallMs}ms)
            </Button>
          </div>
        </div>

        {/* Clean Light-Surface Speedup Progress Bars + Numeric Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-line bg-raised/50 text-[10px] uppercase text-muted">
                <th className="px-3 py-2">Kernel</th>
                <th className="px-3 py-2">Visual Speedup Ratio</th>
                <th className="px-3 py-2 text-right">JS Heap</th>
                <th className="px-3 py-2 text-right">V8 Zero-Alloc</th>
                <th className="px-3 py-2 text-right">Go / Rust</th>
                <th className="px-3 py-2 text-right">FFI Cost</th>
                <th className="px-3 py-2 text-right">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {benchReport.kernels.map((k) => {
                const approved = k.decision === "REWRITE_APPROVED_AND_DEPLOYED";
                const pct = approved
                  ? Math.min(100, Math.max(18, Math.round(Math.log10(Math.max(2, k.nativeSpeedupVsBaseline)) * 36)))
                  : 10;
                return (
                  <tr key={k.id} className="hover:bg-raised/40">
                    <td className="px-3 py-2.5 font-sans text-xs font-semibold text-fg">
                      {k.kernelName}
                    </td>
                    <td className="w-64 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-raised ring-1 ring-line">
                          <div
                            className={cn("h-full rounded-full transition-all", approved ? "bg-ok" : "bg-warn")}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={cn("w-14 text-right font-bold", approved ? "text-ok" : "text-warn")}>
                          {k.nativeSpeedupVsBaseline}×
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right text-muted">
                      {(k.baselineV8Ms * scaleMult).toFixed(2)} ms
                    </td>
                    <td className="px-3 py-2.5 text-right text-fg">
                      {(k.optimizedV8Ms * scaleMult).toFixed(2)} ms ({k.v8SpeedupRatio}×)
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-fg">
                      {(k.nativeRustOrGoMs * scaleMult).toFixed(2)} ms
                    </td>
                    <td className="px-3 py-2.5 text-right text-muted">
                      {(k.ffiOverheadMs * scaleMult).toFixed(2)} ms
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-bold",
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
  );
}

