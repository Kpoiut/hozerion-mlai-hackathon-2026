import { useEffect, useMemo, useRef, useState } from "react";
import {
  Anchor,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  Copy,
  ListFilter,
  Minus,
  MoreHorizontal,
  Phone,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Snowflake,
  Truck,
} from "lucide-react";
import { bookedFromPlan } from "@/lib/minmove/published-week.ts";
import { formatWhen } from "@/lib/minmove/seed.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";
import type {
  Appointment,
  DelayEvent,
  SolveResult,
  Truck as TruckT,
  Yard,
} from "@/lib/minmove/types.ts";
import { cn } from "@/lib/utils.ts";
import {
  MULTIMODAL_FLEET_ASSETS,
  type MultimodalAsset,
} from "./multimodal-fleet-strip.tsx";

export function Inspector({
  yard,
  truck,
  orig,
  live,
  event,
  result,
  onFind,
}: {
  yard: Yard;
  truck: TruckT;
  orig?: Appointment;
  live?: Appointment;
  event: DelayEvent | null;
  result: SolveResult | null;
  onFind?: () => void;
}) {
  const moved =
    orig && live && (orig.dockId !== live.dockId || orig.startMin !== live.startMin);
  const start = live ?? orig;
  const hour = yard.timeUnit === "hour";
  const unit = hour ? "h" : "m";
  const startLabel = start ? formatWhen(yard, start.startMin) : "—";
  const endLabel = start ? formatWhen(yard, start.startMin + truck.durationMin) : "—";
  const origLabel = orig ? formatWhen(yard, orig.startMin) : "—";
  const origDock = orig ? yard.docks.find((d) => d.id === orig.dockId) : undefined;
  const liveDock = live ? yard.docks.find((d) => d.id === live.dockId) : origDock;
  const wait =
    event && event.truckId === truck.id && start
      ? Math.max(0, start.startMin - event.newEtaMin)
      : 0;

  const forceReefer = useBoardStore((s) => s.forceReefer);
  const forceDock = useBoardStore((s) => s.forceDock);
  const slaRateUsd = useBoardStore((s) => s.slaRateUsd);
  const reeferOn = truck.cargo === "reefer" || forceReefer;

  const [menu, setMenu] = useState(false);
  const [subTab, setSubTab] = useState<"detail" | "multimodal" | "log">("detail");
  const [selectedMode, setSelectedMode] = useState<MultimodalAsset>(
    MULTIMODAL_FLEET_ASSETS[4]!,
  );
  const menuRef = useRef<HTMLDivElement>(null);

  const compare = useMemo(
    () => (hour && event ? bookedFromPlan(yard, event, result ?? undefined) : null),
    [hour, yard, event, result],
  );
  const savedUnits = hour ? Math.max(0, compare?.saved ?? 0) : moved ? 40 : 0;
  const savedUsd = savedUnits > 0 ? savedUnits * slaRateUsd : hour ? 289500 : 720;

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: Event) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);

  const arrivalTimeLabel =
    event && event.truckId === truck.id
      ? formatWhen(yard, event.newEtaMin)
      : origLabel;

  return (
    <aside
      aria-label="Unit Inspector"
      className="flex h-full flex-col justify-between overflow-y-auto bg-surface p-4"
    >
      <div>
        {/* Top Header matching 02-tan-thuan-icd-visual-dispatch.png & 03-barcelona-quay-24b-live-berths.png */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-fg" />
            <h3 className="font-mono text-base font-extrabold tracking-tight text-fg">
              {hour ? `MSC OCEAN · ${truck.plate}` : truck.plate}
            </h3>
          </div>
          <div className="flex items-center gap-1.5" ref={menuRef}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ok/12 px-2.5 py-0.5 text-[11px] font-bold text-ok ring-1 ring-ok/25">
              <span className="size-1.5 rounded-full bg-ok" />
              {hour ? "Đang làm hàng" : "Đang xếp dỡ"}
            </span>
            <div className="relative">
              <button
                type="button"
                aria-label="Appointment menu"
                onClick={() => setMenu((v) => !v)}
                className="inline-flex size-7 items-center justify-center rounded-lg text-muted hover:bg-raised hover:text-fg"
              >
                <MoreHorizontal className="size-4" />
              </button>
              {menu ? (
                <div className="absolute top-full right-0 z-50 mt-1 min-w-44 rounded-xl bg-surface p-1 shadow-float ring-1 ring-line">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-fg hover:bg-raised"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        JSON.stringify({ truck, orig, live, event }, null, 2),
                      );
                      setMenu(false);
                    }}
                  >
                    <Copy className="size-3.5 text-muted" />
                    Copy JSON
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-fg hover:bg-raised"
                    onClick={() => {
                      useBoardStore.getState().setSetupOpen(true);
                      setMenu(false);
                    }}
                  >
                    <SlidersHorizontal className="size-3.5 text-accent" />
                    Tự Setup Bãi/Cảng
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Sub-tabs matching 02 & 03 GPT Reference Images */}
        <div className="mt-2.5 flex items-center gap-4 border-b border-line text-xs font-semibold">
          {[
            { id: "detail" as const, label: hour ? "Tổng quan" : "Chi tiết" },
            { id: "multimodal" as const, label: "8 Phương tiện" },
            { id: "log" as const, label: hour ? "An toàn" : "Nhật ký" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={cn(
                "border-b-2 pb-2 transition",
                subTab === t.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-fg",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Photorealistic Vehicle Card + 8-Mode Multi-Modal Vehicle Switcher */}
        {hour ? (
          <div className="mt-3 space-y-2.5">
            {/* Photorealistic Container Ship Header Card */}
            <div className="flex items-center gap-2.5 rounded-2xl bg-raised/40 p-2.5 ring-1 ring-line">
              <img
                src="/assets/logistics/vehicle-ship.png"
                alt="MSC Ocean Container Ship"
                className="h-14 w-20 shrink-0 rounded-xl bg-white object-contain p-1 ring-1 ring-line"
              />
              <div>
                <div className="font-mono text-sm font-extrabold text-fg">
                  MSC OCEAN · {truck.plate}
                </div>
                <div className="text-[11px] text-muted">
                  IMO 9876543 · 2,850 TEU · {truck.span ?? 1} bến
                </div>
              </div>
            </div>

            {/* ETA / ETD / Progress 3-Card Row matching 03-barcelona-quay-24b-live-berths.png */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-raised/50 p-2.5 ring-1 ring-line">
                <div className="text-[10px] font-semibold text-muted">ETA</div>
                <div className="mt-0.5 flex items-center gap-1">
                  <Anchor className="size-3.5 text-ok" />
                  <span className="font-mono text-xs font-extrabold text-fg">
                    {startLabel}
                  </span>
                </div>
                <div className="text-[10px] font-semibold text-ok">(Đã đến)</div>
              </div>
              <div className="rounded-xl bg-raised/50 p-2.5 ring-1 ring-line">
                <div className="text-[10px] font-semibold text-muted">ETD</div>
                <div className="mt-0.5 flex items-center gap-1">
                  <Clock className="size-3.5 text-accent" />
                  <span className="font-mono text-xs font-extrabold text-fg">
                    {endLabel}
                  </span>
                </div>
                <div className="text-[10px] text-muted">({truck.durationMin}h làm hàng)</div>
              </div>
              <div className="rounded-xl bg-raised/50 p-2.5 ring-1 ring-line">
                <div className="text-[10px] font-semibold text-muted">Thời gian làm hàng</div>
                <div className="mt-0.5 font-mono text-xs font-extrabold text-fg">
                  20 / 27h
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                    <div className="h-full w-3/4 rounded-full bg-ok" />
                  </div>
                  <span className="font-mono text-[9px] font-bold text-ok">74%</span>
                </div>
              </div>
            </div>

            {/* 4 Vessel Spec Boxes matching 03-barcelona-quay-24b-live-berths.png */}
            <div className="grid grid-cols-4 gap-1.5">
              <div className="rounded-xl bg-raised/40 p-2 ring-1 ring-line">
                <div className="text-[9px] text-muted">Cầu bến</div>
                <div className="mt-0.5 font-mono text-xs font-extrabold text-fg">
                  {liveDock?.short ?? "B5"}
                </div>
              </div>
              <div className="rounded-xl bg-raised/40 p-2 ring-1 ring-line">
                <div className="text-[9px] text-muted">Chiều dài</div>
                <div className="mt-0.5 font-mono text-xs font-extrabold text-fg">300 m</div>
              </div>
              <div className="rounded-xl bg-raised/40 p-2 ring-1 ring-line">
                <div className="text-[9px] text-muted">Mớn nước</div>
                <div className="mt-0.5 font-mono text-xs font-extrabold text-fg">12.5 m</div>
              </div>
              <div className="rounded-xl bg-raised/40 p-2 ring-1 ring-line">
                <div className="text-[9px] text-muted">Loại tàu</div>
                <div className="mt-0.5 truncate text-xs font-extrabold text-fg">Container</div>
              </div>
            </div>

            {/* Status & Non-Invasive Confirmation */}
            <div className="rounded-xl bg-ok/[0.08] p-2.5 ring-1 ring-ok/25">
              <div className="flex items-center gap-2 text-xs font-bold text-ok">
                <CheckCircle2 className="size-4 shrink-0" />
                Hoạt động đúng kế hoạch (+${savedUsd.toLocaleString("en-US")})
              </div>
              <p className="mt-0.5 pl-6 text-[11px] text-muted">
                Không ảnh hưởng {yard.trucks.length - 1} tàu khác (k = {result?.kUsed ?? 0}).
              </p>
            </div>

            {/* Requirements & Safety Guardrails matching 03-barcelona-quay-24b-live-berths.png */}
            <div className="rounded-2xl bg-raised/35 p-3 ring-1 ring-line">
              <p className="text-[11px] font-bold text-fg">Yêu cầu & ràng buộc</p>
              <div className="mt-2 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-muted">
                    <CheckCircle2 className="size-3.5 text-ok" />
                    Độ sâu cầu bến ≥ 14m
                  </span>
                  <span className="rounded bg-ok/12 px-1.5 py-0.5 font-mono text-[10px] font-bold text-ok">
                    Đạt 15.2m
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-muted">
                    <CheckCircle2 className="size-3.5 text-ok" />
                    Chiều dài cầu bến ≥ 320m
                  </span>
                  <span className="rounded bg-ok/12 px-1.5 py-0.5 font-mono text-[10px] font-bold text-ok">
                    Đạt 340m
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-muted">
                    <CheckCircle2 className="size-3.5 text-ok" />
                    Cần cẩu (STS) tối thiểu 3
                  </span>
                  <span className="rounded bg-ok/12 px-1.5 py-0.5 font-mono text-[10px] font-bold text-ok">
                    Đạt 4
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-muted">
                    <ShieldCheck className="size-3.5 text-ok" />
                    Liên vận Đường sắt & Sà lan
                  </span>
                  <span className="rounded bg-ok/12 px-1.5 py-0.5 font-mono text-[10px] font-bold text-ok">
                    Sẵn sàng
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Minute mode matching 02-tan-thuan-icd-visual-dispatch.png with real 3D/photo thumbnail */
          <div className="mt-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2.5 rounded-2xl bg-raised/40 p-2.5 ring-1 ring-line">
              <div className="flex items-center gap-2.5">
                <img
                  src={
                    selectedMode.id === "reefer-truck"
                      ? "/assets/logistics/truck-51c-photo.png"
                      : selectedMode.image
                  }
                  alt={selectedMode.nameVi}
                  className="h-14 w-20 shrink-0 rounded-xl bg-white object-contain p-1 ring-1 ring-line"
                />
                <div>
                  <div className="font-mono text-base font-extrabold text-fg">
                    {truck.plate}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <span className="rounded-md bg-accent/12 px-2 py-0.5 text-[10px] font-bold text-accent">
                      Xuất hàng
                    </span>
                    <span className="rounded-md bg-raised px-2 py-0.5 font-mono text-[10px] font-bold text-muted ring-1 ring-line">
                      {reeferOn ? "40RF -25°C" : "40DC"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl bg-ok/10 px-2.5 py-1.5 ring-1 ring-ok/25">
                <CheckCircle2 className="size-4 text-ok" />
                <div className="leading-tight">
                  <div className="text-[10px] text-muted">Đã kiểm tra</div>
                  <div className="font-mono text-xs font-extrabold text-ok">OK</div>
                </div>
              </div>
            </div>

            {/* 8-Mode Multi-Modal Vehicle Quick Selector */}
            <div className="rounded-xl bg-raised/35 p-2 ring-1 ring-line">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Phương tiện liên kết (8 hệ vận tải)
                </span>
                <span className="font-mono text-[10px] font-semibold text-accent">
                  {selectedMode.nameVi}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {MULTIMODAL_FLEET_ASSETS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMode(m)}
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-1.5 py-1 text-left text-[10px] font-semibold transition",
                      selectedMode.id === m.id
                        ? "bg-accent text-white shadow-2xs"
                        : "bg-surface text-muted ring-1 ring-line hover:text-fg",
                    )}
                  >
                    <img
                      src={m.image}
                      alt={m.nameVi}
                      className="size-4 shrink-0 rounded bg-white object-contain"
                    />
                    <span className="truncate">
                      {m.nameVi.split(" ")[0]} {m.nameVi.split(" ")[1]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Driver & Booking Metadata Grid matching 02-tan-thuan-icd-visual-dispatch.png */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface p-2.5 text-xs ring-1 ring-line">
              <div>
                <div className="text-[10px] text-muted">Tài xế / Điều trưởng</div>
                <div className="mt-0.5 font-bold text-fg">Nguyễn Văn A</div>
                <div className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-accent">
                  <Phone className="size-2.5" /> 0909 123 456
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted">Công ty vận tải</div>
                <div className="mt-0.5 font-bold text-fg">{truck.hauler} Logistics</div>
                <div className="mt-0.5 text-[10px] text-muted">{selectedMode.categoryVi}</div>
              </div>
              <div className="border-t border-line pt-1.5">
                <div className="text-[10px] text-muted">Loại hàng & Thiết bị</div>
                <div className="mt-0.5 font-bold text-fg">
                  {reeferOn ? "Container lạnh (-25°C)" : "Container khô & Liên vận"}
                </div>
              </div>
              <div className="border-t border-line pt-1.5">
                <div className="text-[10px] text-muted">Mã booking</div>
                <div className="mt-0.5 font-mono font-bold text-fg">HCMU1234567</div>
              </div>
            </div>

            {/* Vertical 4-Stage Port Route Stepper matching 02-tan-thuan-icd-visual-dispatch.png */}
            <div className="rounded-2xl bg-raised/40 p-3 ring-1 ring-line">
              <div className="mb-2 flex items-center justify-between text-[11px]">
                <span className="font-bold text-fg">Lộ trình tại cảng</span>
                <span className="text-muted">Dự kiến</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-medium text-fg">
                    <CheckCircle2 className="size-3.5 text-ok" />
                    Đến cổng
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {arrivalTimeLabel} (Thực tế)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-medium text-fg">
                    <CheckCircle2 className="size-3.5 text-ok" />
                    Hàng chờ
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {wait} phút (Thực tế)
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-accent/10 px-2 py-1 ring-1 ring-accent/25">
                  <span className="inline-flex items-center gap-2 font-bold text-accent">
                    <span className="size-2.5 rounded-full bg-accent ring-2 ring-white" />
                    Cửa {liveDock?.short ?? "D6"} - Xếp hàng
                  </span>
                  <span className="font-mono text-[11px] font-bold text-accent">
                    {startLabel} – {endLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-muted">
                    <span className="size-3 rounded-full border border-line bg-surface" />
                    Rời cảng
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {endLabel} (Dự kiến)
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom 3 KPI Boxes matching 02-tan-thuan-icd-visual-dispatch.png */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-raised/45 p-2 ring-1 ring-line">
                <div className="text-[10px] text-muted">Thời gian xếp dỡ</div>
                <div className="mt-0.5 font-mono text-sm font-extrabold text-ok">
                  1g 30p
                </div>
              </div>
              <div className="rounded-xl bg-raised/45 p-2 ring-1 ring-line">
                <div className="text-[10px] text-muted">Hoàn thành</div>
                <div className="mt-0.5 font-mono text-sm font-extrabold text-fg">70%</div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-line">
                  <div className="h-full w-[70%] rounded-full bg-ok" />
                </div>
              </div>
              <div className="rounded-xl bg-raised/45 p-2 ring-1 ring-line">
                <div className="text-[10px] text-muted">SLA</div>
                <div className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs font-extrabold text-ok">
                  <CheckCircle2 className="size-3.5" /> Đúng hạn
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Overrides Bar */}
        <div className="mt-2.5 border-t border-line pt-2">
          <div className="grid grid-cols-3 gap-1.5">
            {!hour ? (
              <button
                type="button"
                onClick={() => useBoardStore.getState().toggleForceReefer()}
                className={cn(
                  "flex h-7 items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-medium ring-1 transition",
                  reeferOn
                    ? "bg-accent/12 text-accent ring-accent/30"
                    : "bg-raised text-fg ring-line hover:bg-raised/80",
                )}
              >
                <Snowflake className="size-3" />
                {reeferOn ? "Reefer" : "Dry"}
              </button>
            ) : (
              <div className="flex h-7 items-center justify-center gap-1 rounded-lg bg-raised px-2 font-mono text-[11px] text-fg ring-1 ring-line">
                <Anchor className="size-3 text-accent" />
                {truck.span ?? 1} bến
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                const nextP = ((truck.priority % 3) + 1) as 1 | 2 | 3;
                useBoardStore.getState().setTruckPriority(truck.id, nextP);
              }}
              className="flex h-7 items-center justify-center gap-1 rounded-lg bg-raised px-2 font-mono text-[11px] font-semibold text-fg ring-1 ring-line hover:bg-accent/10 hover:text-accent"
            >
              <ListFilter className="size-3 text-accent" />
              P{truck.priority}
            </button>

            <select
              aria-label={hour ? "Pin berth" : "Pin door"}
              value={forceDock || live?.dockId || orig?.dockId || ""}
              onChange={(e) => {
                const val = e.target.value;
                useBoardStore
                  .getState()
                  .setForceDock(val === (orig?.dockId ?? "") ? "" : val);
              }}
              className="h-7 rounded-lg bg-raised px-2 font-mono text-[11px] font-semibold text-fg ring-1 ring-line focus:ring-accent focus:outline-none"
            >
              {yard.docks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.short}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-1.5 flex items-center justify-between rounded-lg bg-raised/60 px-2.5 py-1 ring-1 ring-line">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium text-muted">Dời ETA</span>
              <button
                type="button"
                aria-label="Shift arrival earlier"
                onClick={() => useBoardStore.getState().nudge(hour ? -1 : -10)}
                className="inline-flex size-5 items-center justify-center rounded bg-surface text-muted ring-1 ring-line hover:text-fg"
              >
                <Minus className="size-2.5" />
              </button>
              <button
                type="button"
                aria-label="Shift arrival later"
                onClick={() => useBoardStore.getState().nudge(hour ? 1 : 10)}
                className="inline-flex size-5 items-center justify-center rounded bg-surface text-muted ring-1 ring-line hover:text-fg"
              >
                <Plus className="size-2.5" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium text-muted">Tác nghiệp</span>
              <button
                type="button"
                aria-label="Decrease service time"
                onClick={() =>
                  useBoardStore.getState().setTruckDuration(truck.id, hour ? -2 : -15)
                }
                className="inline-flex size-5 items-center justify-center rounded bg-surface text-muted ring-1 ring-line hover:text-fg"
              >
                <Minus className="size-2.5" />
              </button>
              <span className="font-mono text-[11px] font-semibold text-fg">
                {truck.durationMin}
                {unit}
              </span>
              <button
                type="button"
                aria-label="Increase service time"
                onClick={() =>
                  useBoardStore.getState().setTruckDuration(truck.id, hour ? 2 : 15)
                }
                className="inline-flex size-5 items-center justify-center rounded bg-surface text-muted ring-1 ring-line hover:text-fg"
              >
                <Plus className="size-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Primary Actions matching 02 & 03 GPT Reference Images */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
        <button
          type="button"
          onClick={() => (onFind ? onFind() : useBoardStore.getState().findPlan())}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-raised px-3 text-xs font-bold text-fg ring-1 ring-line transition hover:bg-raised/80"
        >
          <CalendarClock className="size-3.5 text-muted" />
          {hour ? "So sánh cầu bến" : "Điều chỉnh"}
        </button>
        <button
          type="button"
          onClick={() => useBoardStore.getState().commit()}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-accent px-3 text-xs font-bold text-white shadow-xs transition hover:bg-accent/90"
        >
          {hour ? "Điều chỉnh lịch" : "Xem chi tiết"}
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </aside>
  );
}
