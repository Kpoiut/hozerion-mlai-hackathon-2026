import { useMemo, useState } from "react";
import {
  Anchor,
  ArrowLeftRight,
  CheckCircle2,
  CircleAlert,
  Clock,
  Container,
  Copy,
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
    <div className="space-y-3" data-testid="universal-sidecar-benchmark-panel">
      {/* Section 1: Visual SVG Donut + Sidecar Architecture Canvas + 4 Domain Control Pad */}
      <section className="overflow-hidden rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-accent-fg">
              UNIVERSAL SIDECAR SCADA
            </span>
            <span className="rounded-md bg-ok/15 px-2 py-0.5 font-mono text-[10px] font-bold text-ok">
              3,092 Calls · 83.02% NO_OP · 16.98% Patch (k=0) · +$29,701,500 USD
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                if (activeHost.id === "host-maritime-quay") {
                  setCustomTargetId("S11");
                  setCustomDelay(0);
                } else {
                  setCustomDelay(0);
                }
              }}
            >
              Mode 1: Zero-Touch NO_OP
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setCustomTargetId(activeHost.defaultTargetId);
                setCustomDelay(activeHost.defaultDelayDelta);
              }}
            >
              Mode 2: Minimal Patch (k=0)
            </Button>
          </div>
        </div>

        {/* Visual SVG Row: Left 5 Cols = SVG Donut + Corpus KPI Table | Right 7 Cols = Live SVG Sidecar & Lane Diff Schematic */}
        <div className="mt-3 grid gap-3 lg:grid-cols-12">
          {/* Left 5 Cols: SVG Donut Chart + Numeric Summary Table */}
          <div className="flex flex-col justify-between rounded-xl bg-[#09111e] p-3 ring-1 ring-line lg:col-span-5">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 120 120" className="size-28 shrink-0">
                <circle cx="60" cy="60" r="44" fill="none" stroke="#1e293b" strokeWidth="14" />
                {/* 83.02% NO_OP Emerald Arc */}
                <circle
                  cx="60"
                  cy="60"
                  r="44"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="14"
                  strokeDasharray="229.5 276.5"
                  transform="rotate(-90 60 60)"
                />
                {/* 16.98% Contested k=0 Indigo/Sky Arc */}
                <circle
                  cx="60"
                  cy="60"
                  r="44"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="14"
                  strokeDasharray="47 276.5"
                  strokeDashoffset="-229.5"
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="56" textAnchor="middle" fill="#f8fafc" fontSize="13" fontFamily="monospace" fontWeight="bold">
                  3,092
                </text>
                <text x="60" y="70" textAnchor="middle" fill="#10b981" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                  +$29.7M
                </text>
              </svg>

              <table className="w-full border-collapse font-mono text-[11px] text-slate-200">
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="py-1 text-slate-400">Weeks / Calls</td>
                    <td className="py-1 text-right font-bold text-white">
                      {pnl.pairedWeeksCount}w · {pnl.totalArrivalProbes.toLocaleString("en-US")}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-emerald-400">● NO_OP (83.02%)</td>
                    <td className="py-1 text-right font-bold text-emerald-400">
                      {pnl.uncontestedCount.toLocaleString("en-US")} calls
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-sky-400">● Patch k=0 (16.98%)</td>
                    <td className="py-1 text-right font-bold text-sky-400">
                      {pnl.contestedCount} calls
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-400">Hours Rescued</td>
                    <td className="py-1 text-right font-bold text-emerald-400">
                      {pnl.totalShipHoursSaved.toLocaleString("en-US")}h (k=0)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-400">Net P&amp;L Value</td>
                    <td className="py-1 text-right font-bold text-emerald-400">
                      +${pnl.grossSavingsAcrossCorpusUsd.toLocaleString("en-US")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 7 Cols: Live SVG Non-Invasive Sidecar & Resource Diff Diagram */}
          <div className="overflow-hidden rounded-xl bg-[#09111e] p-3 ring-1 ring-line lg:col-span-7">
            <svg
              viewBox="0 0 640 128"
              className="h-[118px] w-full select-none"
              role="img"
              aria-label="Sơ đồ kiến trúc Sidecar không xâm lấn"
            >
              {/* Node 1: Incumbent Host TOS/WMS */}
              <rect x="10" y="14" width="175" height="100" rx="8" fill="#0f172a" stroke="#475569" strokeWidth="2" />
              <text x="22" y="32" fill="#94a3b8" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                HOST SYSTEM (100% PRESERVED)
              </text>
              <text x="22" y="50" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold">
                {activeHost.incumbentSystem.slice(0, 24)}
              </text>
              <rect x="22" y="62" width="150" height="40" rx="5" fill="rgba(244,63,94,0.12)" stroke="#f43f5e" />
              <text x="30" y="78" fill="#f43f5e" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                HOLD: {bookedRes} @ {bookedSt}{activeHost.timeUnitLabel === "hour" ? "h" : "m"}
              </text>
              <text x="30" y="94" fill="#fca5a5" fontSize="9" fontFamily="monospace">
                Wait: {pluginExec.hostPlanWait} {activeHost.timeUnitLabel}
              </text>

              {/* Bidirectional Bus Arrows */}
              <line x1="185" y1="46" x2="235" y2="46" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
              <text x="210" y="39" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace">
                ETA+{effectiveDelay}
              </text>
              <line x1="235" y1="82" x2="185" y2="82" stroke="#10b981" strokeWidth="2" />
              <text x="210" y="96" textAnchor="middle" fill="#10b981" fontSize="8" fontFamily="monospace">
                RFC7396
              </text>

              {/* Node 2: Hozerion Go 1.26.5 / V8 Zero-Alloc Sidecar Kernel */}
              <rect x="235" y="14" width="175" height="100" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <text x="247" y="32" fill="#38bdf8" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                HOZERION SIDECAR KERNEL
              </text>
              <text x="247" y="50" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold">
                Go 536× · 5.15µs · k=0
              </text>
              <rect x="247" y="62" width="150" height="40" rx="5" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" />
              <text x="255" y="78" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">
                {pluginExec.pluginDecision === "NO_OP_KEEP_HOST_PLAN" ? "NO_OP (0 MUTATION)" : "PATCH 1 JOB ONLY"}
              </text>
              <text x="255" y="94" fill="#e2e8f0" fontSize="9" fontFamily="monospace">
                Other moved: k={pluginExec.otherJobsMoved}
              </text>

              {/* Arrow to Result */}
              <line x1="410" y1="64" x2="450" y2="64" stroke="#10b981" strokeWidth="2.5" />

              {/* Node 3: Patched Physical Quay / Dock Output */}
              <rect x="450" y="14" width="180" height="100" rx="8" fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth="2" />
              <text x="462" y="32" fill="#10b981" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                PHYSICAL QUAY / DOCK STATE
              </text>
              <text x="462" y="52" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold">
                {patchedRes} @ {patchedSt}{activeHost.timeUnitLabel === "hour" ? "h" : "m"} (Wait {pluginExec.pluginPlanWait})
              </text>
              <text x="462" y="74" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="bold">
                SAVED: {pluginExec.waitSaved} {activeHost.timeUnitLabel}
              </text>
              <text x="462" y="94" fill="#a7f3d0" fontSize="10" fontFamily="monospace" fontWeight="bold">
                ROI: +${pluginExec.netEconomicGainUsd.toLocaleString("en-US")} USD
              </text>
            </svg>
          </div>
        </div>

        {/* 4 Domain Selector Buttons + Interactive Sliders + Compact JSON Patch Box */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {UNIVERSAL_HOST_PROFILES.map((h) => {
            const selected = h.id === activeHost.id;
            const iconGlyph =
              h.domain === "MARITIME_CONTAINER_QUAY"
                ? "🚢 CẢNG BIỂN TOS"
                : h.domain === "INLAND_BARGE_ICD"
                  ? "⚓ SÀ LAN & ICD"
                  : h.domain === "WAREHOUSE_DOCK_WMS"
                    ? "🚛 KHO DOCK WMS"
                    : "❄️ KHO LẠNH -25°C";
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
                  "flex items-center justify-between rounded-xl px-3 py-2 text-left ring-1 transition-all",
                  selected
                    ? "bg-accent text-accent-fg ring-accent shadow-sm"
                    : "bg-raised/60 text-fg ring-line hover:bg-raised",
                )}
              >
                <span className="font-mono text-[11px] font-bold">{iconGlyph}</span>
                <span className="font-mono text-[11px] font-semibold opacity-90">
                  ${h.costPerWaitUnitUsd}/{h.timeUnitLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Compact Control Strip + Patch Preview */}
        <div className="mt-3 grid gap-3 rounded-xl bg-raised/50 p-3 ring-1 ring-line lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-5">
            <select
              data-testid="host-profile-select"
              value={activeHost.id}
              onChange={(e) => {
                setHostId(e.target.value);
                setCustomDelay(null);
                setCustomTargetId(null);
              }}
              className="block w-full rounded-lg bg-surface px-2.5 py-1.5 font-mono text-xs font-semibold text-fg ring-1 ring-line"
            >
              {UNIVERSAL_HOST_PROFILES.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={effectiveTargetId}
                onChange={(e) => setCustomTargetId(e.target.value)}
                className="block w-full rounded-lg bg-surface px-2 py-1.5 font-mono text-xs text-fg ring-1 ring-line"
              >
                {activeHost.yard.appointments.slice(0, 12).map((a) => (
                  <option key={a.truckId} value={a.truckId}>
                    {a.truckId} ({a.dockId}@{a.startMin})
                  </option>
                ))}
              </select>

              <div className="rounded-lg bg-surface px-2.5 py-1 ring-1 ring-line">
                <div className="flex justify-between font-mono text-[10px] text-muted">
                  <span>ETA Δ:</span>
                  <strong className="text-fg">+{effectiveDelay} {activeHost.timeUnitLabel}</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={activeHost.timeUnitLabel === "hour" ? 12 : 120}
                  step={activeHost.timeUnitLabel === "hour" ? 1 : 5}
                  value={effectiveDelay}
                  onChange={(e) => setCustomDelay(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPatchView("rfc7396")}
                  className={cn(
                    "rounded px-2 py-0.5 font-mono text-[10px] font-bold",
                    patchView === "rfc7396" ? "bg-accent text-accent-fg" : "bg-surface text-muted ring-1 ring-line",
                  )}
                >
                  RFC 7396 JSON Patch
                </button>
                <button
                  type="button"
                  onClick={() => setPatchView("native")}
                  className={cn(
                    "rounded px-2 py-0.5 font-mono text-[10px] font-bold",
                    patchView === "native" ? "bg-accent text-accent-fg" : "bg-surface text-muted ring-1 ring-line",
                  )}
                >
                  Native Adapter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(activePatchPayload);
                    setCopiedPatch(true);
                    setTimeout(() => setCopiedPatch(false), 1500);
                  }}
                  className="inline-flex items-center gap-1 rounded bg-surface px-2 py-0.5 font-mono text-[10px] text-fg ring-1 ring-line"
                >
                  <Copy className="size-3" />
                  {copiedPatch ? "Copied" : "Copy"}
                </button>
              </div>
              <span className="font-mono text-[10px] font-bold text-ok">
                {pluginExec.pluginDecision} · +{pluginExec.waitSaved}{activeHost.timeUnitLabel} (+${pluginExec.netEconomicGainUsd.toLocaleString("en-US")})
              </span>
            </div>
            <pre className="max-h-24 overflow-auto rounded-lg bg-bg p-2 font-mono text-[10px] leading-snug text-fg ring-1 ring-line">
              {activePatchPayload}
            </pre>
          </div>
        </div>
      </section>

      {/* Section 2: Visual Multi-Language Speedup Bar Chart + Pure Numeric Table */}
      <section className="overflow-hidden rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5">
          <span className="font-mono text-xs font-bold uppercase tracking-wide text-fg">
            BENCHMARK ĐA NGÔN NGỮ (GO 1.26.5 NATIVE 536× · RUST #![NO_STD] WASM · V8 ZERO-ALLOC)
          </span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            data-testid="rerun-live-benchmark-btn"
            onClick={() => setBenchRunCount((c) => c + 1)}
          >
            <Sparkles className="size-3.5" />
            Re-run Benchmark ({benchReport.totalBenchmarkWallMs}ms)
          </Button>
        </div>

        {/* Visual SVG Speedup Comparison Bars */}
        <div className="overflow-hidden rounded-xl bg-[#09111e] p-3 ring-1 ring-line">
          <svg
            viewBox="0 0 860 112"
            className="h-[104px] w-full select-none"
            role="img"
            aria-label="Biểu đồ thanh tốc độ Go 1.26.5 vs Rust WASM vs V8"
          >
            {benchReport.kernels.map((k, idx) => {
              const y = 10 + idx * 25;
              const approved = k.decision === "REWRITE_APPROVED_AND_DEPLOYED";
              const barW = approved
                ? Math.min(540, Math.max(90, Math.log10(Math.max(2, k.nativeSpeedupVsBaseline)) * 195))
                : 45;
              const fill = approved ? "#10b981" : "#f59e0b";
              return (
                <g key={k.id}>
                  <text x="10" y={y + 13} fill="#e2e8f0" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                    K{idx + 1}: {k.kernelName.slice(0, 32)}
                  </text>
                  <rect x="235" y={y + 2} width="545" height="14" rx="4" fill="#1e293b" />
                  <rect x="235" y={y + 2} width={barW} height="14" rx="4" fill={fill} />
                  <text x={242 + barW} y={y + 13} fill={fill} fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                    {k.nativeSpeedupVsBaseline}× ({k.nativeRustOrGoMs}ms vs {k.baselineV8Ms}ms)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Pure Numeric Table (Zero Prose Essays) */}
        <div className="mt-2.5 overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-line bg-raised text-[9px] uppercase text-muted">
                <th className="px-2.5 py-1.5">Kernel</th>
                <th className="px-2.5 py-1.5">Scale</th>
                <th className="px-2.5 py-1.5 text-right">JS Heap</th>
                <th className="px-2.5 py-1.5 text-right">V8 Zero-Alloc</th>
                <th className="px-2.5 py-1.5 text-right">Go 1.26 / Rust WASM</th>
                <th className="px-2.5 py-1.5 text-right">Speedup</th>
                <th className="px-2.5 py-1.5 text-right">FFI Cost</th>
                <th className="px-2.5 py-1.5 text-right">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {benchReport.kernels.map((k) => {
                const approved = k.decision === "REWRITE_APPROVED_AND_DEPLOYED";
                return (
                  <tr key={k.id} className="hover:bg-raised/60">
                    <td className="px-2.5 py-1.5 font-sans text-xs font-semibold text-fg">
                      {k.kernelName}
                    </td>
                    <td className="px-2.5 py-1.5 text-[10px] text-muted">
                      3,092 calls
                    </td>
                    <td className="px-2.5 py-1.5 text-right text-muted">
                      {k.baselineV8Ms} ms
                    </td>
                    <td className="px-2.5 py-1.5 text-right text-fg">
                      {k.optimizedV8Ms} ms ({k.v8SpeedupRatio}×)
                    </td>
                    <td className="px-2.5 py-1.5 text-right font-bold text-fg">
                      {k.nativeRustOrGoMs} ms
                    </td>
                    <td className={cn("px-2.5 py-1.5 text-right font-bold", approved ? "text-ok" : "text-warn")}>
                      {k.nativeSpeedupVsBaseline}×
                    </td>
                    <td className="px-2.5 py-1.5 text-right text-muted">
                      {k.ffiOverheadMs} ms
                    </td>
                    <td className="px-2.5 py-1.5 text-right">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[9px] font-bold",
                          approved ? "bg-ok/15 text-ok" : "bg-warn/20 text-warn",
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
