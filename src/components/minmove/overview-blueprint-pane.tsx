import { useState } from "react";
import {
  AlertTriangle,
  Anchor,
  ArrowRight,
  Box,
  CheckCircle2,
  Clock,
  Crown,
  Edit3,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { useBoardStore } from "@/lib/minmove/store";
import { cn } from "@/lib/utils";
import { MultimodalFleetStrip } from "./multimodal-fleet-strip.tsx";

export function OverviewBlueprintPane() {
  const [contextMode, setContextMode] = useState<
    "icd" | "seaport" | "warehouse" | "supplychain"
  >("icd");

  return (
    <div className="space-y-3.5 pb-6">
      {/* 1. Photorealistic Port Crane Hero Banner matching 01-design-system-visual-blueprint.png */}
      <div className="relative overflow-hidden rounded-2xl bg-[#F4F8FF] p-5 shadow-card ring-1 ring-line">
        <img
          src="/assets/logistics/hero-port-banner.png"
          alt="Hozerion Sidecar Port Banner"
          className="pointer-events-none absolute inset-y-0 right-0 h-full w-[44%] object-cover object-right"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#F4F8FF] via-[#F4F8FF] via-[62%] to-transparent" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-accent">
              NỀN TẢNG LOGISTICS ĐA PHƯƠNG THỨC THẾ HỆ MỚI
            </span>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
              Hozerion Sidecar — Visual-First Logistics UX Blueprint
            </h1>
            <p className="mt-1.5 text-sm font-medium text-slate-600">
              Kết nối con người · dữ liệu · 8 hệ phương tiện vận tải · AI QuotaMesh{" "}
              <span className="mx-1.5 text-slate-300">|</span> Tùy biến cho mọi mô hình
              cảng biển, ICD, đường sắt, hàng không, kho lạnh và chuỗi cung ứng
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs ring-1 ring-slate-200">
                <span className="size-2 rounded-full bg-accent" />3 chỉ số trên 1 thẻ
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs ring-1 ring-slate-200">
                <span className="size-2 rounded-full bg-emerald-500" />8 phương tiện vận tải 3D
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs ring-1 ring-slate-200">
                <span className="size-2 rounded-full bg-amber-500" />QuotaMesh AI khóa theo Web Origin
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => useBoardStore.getState().setSetupOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3.5 py-2 text-xs font-bold text-slate-800 shadow-xs ring-1 ring-slate-200 transition hover:bg-white"
            >
              <Edit3 className="size-3.5 text-accent" />
              Tùy chỉnh giao diện
            </button>
            <div className="rounded-lg bg-white/85 px-2.5 py-1 text-right text-xs font-semibold leading-snug text-slate-800 backdrop-blur-xs">
              <div>Smarter Logistics.</div>
              <div className="text-accent">Brighter Tomorrow.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 4 KPI Cards + Operating Context Selector matching 01-design-system-visual-blueprint.png */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
        {/* Card 1 */}
        <div className="flex items-center justify-between rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600">
              <Box className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted">Tổng sản lượng hôm nay</p>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-extrabold text-fg">2,847</span>
                <span className="font-mono text-[11px] font-bold text-ok">↑+12%</span>
              </div>
              <p className="text-[10px] text-muted">container · tất cả cơ sở</p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex items-center justify-between rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/12 text-teal-600">
              <Truck className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted">Phương tiện hoạt động</p>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-extrabold text-fg">346</span>
                <span className="font-mono text-[11px] font-bold text-ok">↑+8%</span>
              </div>
              <p className="text-[10px] text-muted">xe · tàu · sà lan · rail · air</p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex items-center justify-between rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/12 text-indigo-600">
              <Anchor className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted">Tàu & Đoàn liên vận</p>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-extrabold text-fg">12</span>
                <span className="font-mono text-[11px] font-bold text-accent">8 hệ</span>
              </div>
              <p className="text-[10px] text-muted">3 tàu mẹ + 6 đoàn tàu hỏa</p>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex items-center justify-between rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/12 text-violet-600">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted">Hiệu suất chung</p>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-extrabold text-fg">85%</span>
                <span className="font-mono text-[11px] font-bold text-ok">↑+6%</span>
              </div>
              <p className="text-[10px] text-muted">so với tuần trước</p>
            </div>
          </div>
        </div>

        {/* Card 5: Operating Context Switcher */}
        <div className="flex flex-col justify-between rounded-2xl bg-surface p-3.5 shadow-card ring-1 ring-line xl:col-span-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-fg">Chọn bối cảnh vận hành</span>
            <button
              type="button"
              onClick={() => useBoardStore.getState().setSetupOpen(true)}
              className="text-[11px] font-semibold text-accent hover:underline"
            >
              · Quản lý
            </button>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {[
              {
                id: "icd" as const,
                label: "Tân Thuận ICD",
                action: () => useBoardStore.getState().openDemo(),
              },
              {
                id: "seaport" as const,
                label: "Cảng biển",
                action: () => useBoardStore.getState().openPublished(),
              },
              {
                id: "warehouse" as const,
                label: "Kho nội địa",
                action: () => useBoardStore.getState().applyFacilityPreset("crossdock-fmcg"),
              },
              {
                id: "supplychain" as const,
                label: "Chuỗi cung ứng",
                action: () => useBoardStore.getState().applyFacilityPreset("barge-hub"),
              },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setContextMode(c.id);
                  c.action();
                }}
                className={cn(
                  "rounded-lg px-2 py-1.5 text-[11px] font-bold transition",
                  contextMode === c.id
                    ? "bg-accent/12 text-accent ring-1 ring-accent"
                    : "bg-raised text-muted ring-1 ring-line hover:text-fg",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Photorealistic 8-Mode Multi-Modal Logistics Fleet & Equipment Showcase */}
      <MultimodalFleetStrip />

      {/* 4. 6 Visual Module Cards Grid matching 01-design-system-visual-blueprint.png */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        {/* Module 01: Điều độ Phút / Tân Thuận ICD */}
        <div className="flex flex-col justify-between rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-accent/12 px-2 py-0.5 font-mono text-xs font-extrabold text-accent">
                  01
                </span>
                <h2 className="text-sm font-extrabold text-fg">
                  Điều độ Phút <span className="font-normal text-muted">/ Tân Thuận ICD</span>
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-ok/12 px-2.5 py-0.5 text-[10px] font-bold text-ok">
                ● Đang hoạt động
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Điều phối xe đầu kéo · tàu hỏa · sà lan · container lạnh theo thời gian thực
            </p>

            {/* Visual Mini Gantt Preview */}
            <div className="mt-3 rounded-xl bg-raised/40 p-2.5 ring-1 ring-line">
              <div className="mb-1.5 flex justify-between font-mono text-[10px] text-muted">
                <span>Cửa</span>
                <span>08:00</span>
                <span>10:00</span>
                <span className="rounded bg-accent px-1.5 text-white">12:00</span>
                <span>14:00</span>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="w-6 font-mono font-bold text-fg">D1</span>
                  <div className="flex-1 rounded-lg bg-surface px-2 py-1 font-mono font-semibold text-fg ring-1 ring-ok/40">
                    🚛 51A-100.61 · 08:30
                  </div>
                  <div className="flex-1 rounded-lg bg-surface px-2 py-1 font-mono font-semibold text-fg ring-1 ring-accent/40">
                    🚆 51P-404.04 · AI
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 font-mono font-bold text-fg">D3</span>
                  <div className="flex-1 rounded-lg bg-sky-500/10 px-2 py-1 font-mono font-semibold text-sky-700 ring-1 ring-sky-500/30">
                    ❄️ 51F-901.11 · Reefer
                  </div>
                  <div className="flex-1 rounded-lg bg-rose-500/10 px-2 py-1 font-mono font-semibold text-rose-600 ring-1 ring-rose-500/30">
                    ⚠ Đã giải cứu k=0
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 font-mono font-bold text-fg">D6</span>
                  <div className="w-1/3 rounded-lg bg-surface px-2 py-1 font-mono text-muted ring-1 ring-line">
                    51J-112.09
                  </div>
                  <div className="flex-1 rounded-lg bg-accent px-2 py-1 font-mono font-bold text-white shadow-xs">
                    🚛 51C-882.13 · 12:00 (-40m)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
            <div className="flex items-center gap-2 text-[10px] font-medium text-muted">
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full bg-ok" /> Trống
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full bg-accent" /> Chuyển cửa
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full bg-sky-500" /> Reefer
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                useBoardStore.getState().openDemo();
                useBoardStore.getState().setTab("board");
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent ring-1 ring-accent/25 hover:bg-accent hover:text-white"
            >
              Mở điều độ <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Module 02: Cầu bến Quốc tế / Barcelona Quay 24B */}
        <div className="flex flex-col justify-between rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-accent/12 px-2 py-0.5 font-mono text-xs font-extrabold text-accent">
                  02
                </span>
                <h2 className="text-sm font-extrabold text-fg">
                  Cầu bến Quốc tế <span className="font-normal text-muted">/ Barcelona 24B</span>
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-ok/12 px-2.5 py-0.5 text-[10px] font-bold text-ok">
                ● Đang hoạt động
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Phân bổ 20 cầu bến · theo dõi tàu mẹ, sà lan & cẩu STS · tối ưu thời gian quay
            </p>

            <div className="relative mt-3 h-36 overflow-hidden rounded-xl ring-1 ring-line">
              <img
                src="/assets/logistics/barcelona-harbor-aerial.png"
                alt="Barcelona Quay 24B Aerial"
                className="h-full w-full object-cover"
              />
              <div className="absolute top-2 right-2 rounded-lg bg-white/95 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-900 shadow-xs">
                20 bến · 27 tàu
              </div>
              <div className="absolute right-2 bottom-2 left-2 grid grid-cols-3 gap-1.5">
                <div className="rounded-lg bg-white/95 px-2 py-1 text-[10px] shadow-xs">
                  <div className="font-bold text-slate-900">MSC OCEAN</div>
                  <div className="font-mono text-[9px] text-slate-500">B5 · +$289,500</div>
                </div>
                <div className="rounded-lg bg-white/95 px-2 py-1 text-[10px] shadow-xs">
                  <div className="font-bold text-slate-900">EVER GREEN</div>
                  <div className="font-mono text-[9px] text-slate-500">IMO 9881231</div>
                </div>
                <div className="rounded-lg bg-white/95 px-2 py-1 text-[10px] shadow-xs">
                  <div className="font-bold text-slate-900">CMA CGM</div>
                  <div className="font-mono text-[9px] text-slate-500">IMO 9723411</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end border-t border-line pt-2.5">
            <button
              type="button"
              onClick={() => {
                useBoardStore.getState().openPublished();
                useBoardStore.getState().setTab("board");
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent ring-1 ring-accent/25 hover:bg-accent hover:text-white"
            >
              Mở cầu bến <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Module 03: Self-Setup Studio / Digital Twin */}
        <div className="flex flex-col justify-between rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-accent/12 px-2 py-0.5 font-mono text-xs font-extrabold text-accent">
                  03
                </span>
                <h2 className="text-sm font-extrabold text-fg">
                  Self-Setup Studio <span className="font-normal text-muted">/ Digital Twin</span>
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-warn/15 px-2.5 py-0.5 text-[10px] font-bold text-warn">
                ● 3D Isometric
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Tự thiết lập mô hình cảng, ICD, ga đường sắt, kho lạnh · kéo thả 8 hệ phương tiện
            </p>

            <div className="mt-3 grid grid-cols-12 gap-2">
              <div className="col-span-7 h-36 overflow-hidden rounded-xl ring-1 ring-line">
                <img
                  src="/assets/logistics/digital-twin-3d-canvas.png"
                  alt="Self-Setup 3D Digital Twin"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="col-span-5 flex flex-col justify-between rounded-xl bg-raised/50 p-2.5 text-[11px] ring-1 ring-line">
                <div className="font-bold text-fg">Thuộc tính B01</div>
                <div className="flex justify-between">
                  <span className="text-muted">Số container</span>
                  <span className="font-mono font-bold text-fg">2,400 TEU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Vị trí</span>
                  <span className="font-mono font-bold text-fg">D1 – D6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Loại</span>
                  <span className="font-semibold text-accent">Đa phương thức</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md bg-ok/12 px-2 py-0.5 text-[10px] font-bold text-ok">
                  ● Hoạt động
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end border-t border-line pt-2.5">
            <button
              type="button"
              onClick={() => useBoardStore.getState().setSetupOpen(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent ring-1 ring-accent/25 hover:bg-accent hover:text-white"
            >
              Mở Studio <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Module 04: AI Command / Trung tâm chỉ huy (QuotaMesh Origin-Bound) */}
        <div className="flex flex-col justify-between rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-accent/12 px-2 py-0.5 font-mono text-xs font-extrabold text-accent">
                  04
                </span>
                <h2 className="text-sm font-extrabold text-fg">
                  AI Command <span className="font-normal text-muted">/ QuotaMesh 5 Agent</span>
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-ok/12 px-2.5 py-0.5 text-[10px] font-bold text-ok">
                ● Origin-Locked
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Bản đồ vệ tinh 6 cảng TP.HCM · Kết nối QuotaMesh Gateway · Khóa API Key theo Origin Web
            </p>

            <div className="mt-3 grid grid-cols-12 gap-2">
              <div className="col-span-7 h-36 overflow-hidden rounded-xl ring-1 ring-line">
                <img
                  src="/assets/logistics/hcmc-6ports-dark-satellite.png"
                  alt="HCMC 6 Ports Satellite Map"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="col-span-5 space-y-1.5 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-fg">AI Insights</span>
                  <span className="rounded-full bg-rose-500/15 px-1.5 py-0.2 font-mono font-bold text-rose-600">
                    3
                  </span>
                </div>
                <div className="rounded-lg bg-rose-500/10 p-1.5 ring-1 ring-rose-500/20">
                  <div className="font-bold text-rose-700">Dự kiến tắc tại Cát Lái</div>
                  <div className="font-mono text-rose-600">+32 phút · 94% tải</div>
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-1.5 ring-1 ring-emerald-500/20">
                  <div className="font-bold text-emerald-700">Điều chuyển sà lan & xe</div>
                  <div className="font-mono text-emerald-600">Tiết kiệm 1.5h · k=0</div>
                </div>
                <div className="rounded-lg bg-indigo-500/10 p-1.5 ring-1 ring-indigo-500/20">
                  <div className="font-bold text-indigo-700">QuotaMesh Origin Lock</div>
                  <div className="font-mono text-indigo-600">Chặn 100% lộ Key</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end border-t border-line pt-2.5">
            <button
              type="button"
              onClick={() => useBoardStore.getState().setTab("mlai")}
              className="inline-flex items-center gap-1 rounded-xl bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent ring-1 ring-accent/25 hover:bg-accent hover:text-white"
            >
              Mở AI Command <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Module 05: Safe Sidecar / An toàn & Tuân thủ */}
        <div className="flex flex-col justify-between rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-accent/12 px-2 py-0.5 font-mono text-xs font-extrabold text-accent">
                  05
                </span>
                <h2 className="text-sm font-extrabold text-fg">
                  Safe Sidecar <span className="font-normal text-muted">/ An toàn & Tuân thủ</span>
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-ok/12 px-2.5 py-0.5 text-[10px] font-bold text-ok">
                ● Đạt yêu cầu
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Kiểm soát quy trình · vá lỗi RFC 7396 không xâm lấn · rollback an toàn tức thì
            </p>

            <div className="mt-3 flex h-36 items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-indigo-50/60 via-white to-emerald-50/60 p-3 ring-1 ring-line">
              <div className="flex-1 rounded-xl bg-white p-2.5 text-center shadow-2xs ring-1 ring-line">
                <div className="mx-auto flex size-7 items-center justify-center rounded-lg bg-indigo-500/12 text-indigo-600">
                  <ShieldCheck className="size-4" />
                </div>
                <div className="mt-1 font-mono text-[11px] font-extrabold text-slate-900">
                  HOST TOS
                </div>
                <div className="text-[10px] font-semibold text-ok">100% an toàn</div>
              </div>
              <span className="font-mono text-xs font-bold text-accent">→</span>
              <div className="flex-1 rounded-xl bg-accent/10 p-2.5 text-center shadow-2xs ring-2 ring-accent">
                <div className="mx-auto flex size-7 items-center justify-center rounded-lg bg-accent text-white">
                  <Sparkles className="size-4" />
                </div>
                <div className="mt-1 font-mono text-[11px] font-extrabold text-accent">
                  SIDECAR
                </div>
                <div className="text-[10px] font-semibold text-slate-700">k = 0 · 5.15µs</div>
              </div>
              <span className="font-mono text-xs font-bold text-ok">→</span>
              <div className="flex-1 rounded-xl bg-white p-2.5 text-center shadow-2xs ring-1 ring-ok/40">
                <div className="mx-auto flex size-7 items-center justify-center rounded-lg bg-ok/15 text-ok">
                  <CheckCircle2 className="size-4" />
                </div>
                <div className="mt-1 font-mono text-[11px] font-extrabold text-slate-900">
                  SAFE PATCH
                </div>
                <div className="text-[10px] font-semibold text-ok">Rollback sẵn sàng</div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
            <span className="font-mono text-[10px] text-muted">
              v5.0 Enterprise · Thành công
            </span>
            <button
              type="button"
              onClick={() => useBoardStore.getState().setTab("sidecar")}
              className="inline-flex items-center gap-1 rounded-xl bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent ring-1 ring-accent/25 hover:bg-accent hover:text-white"
            >
              Xem chi tiết <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Module 06: Universal Sidecar / Quản trị & RFC */}
        <div className="flex flex-col justify-between rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-accent/12 px-2 py-0.5 font-mono text-xs font-extrabold text-accent">
                  06
                </span>
                <h2 className="text-sm font-extrabold text-fg">
                  Universal Sidecar <span className="font-normal text-muted">/ Quản trị & RFC</span>
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-ok/12 px-2.5 py-0.5 text-[10px] font-bold text-ok">
                ● Ổn định
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Quản lý thay đổi · kiểm soát phiên bản · Go 536× & Rust WASM 312× toàn chuỗi
            </p>

            <div className="mt-3 grid h-36 grid-cols-2 gap-2">
              <div className="rounded-xl bg-raised/45 p-2.5 ring-1 ring-line">
                <div className="text-[10px] text-muted">Corpus thử nghiệm</div>
                <div className="font-mono text-lg font-extrabold text-fg">3,092</div>
                <div className="font-mono text-[10px] font-bold text-ok">↑ +98 tuần</div>
              </div>
              <div className="rounded-xl bg-raised/45 p-2.5 ring-1 ring-line">
                <div className="text-[10px] text-muted">Tỷ lệ an toàn TOS</div>
                <div className="font-mono text-lg font-extrabold text-fg">83.02%</div>
                <div className="font-mono text-[10px] font-bold text-ok">2,567 lượt giữ nguyên</div>
              </div>
              <div className="rounded-xl bg-raised/45 p-2.5 ring-1 ring-line">
                <div className="text-[10px] text-muted">Ca giải cứu k=0</div>
                <div className="font-mono text-lg font-extrabold text-fg">525</div>
                <div className="font-mono text-[10px] font-bold text-ok">↑ +19,801h</div>
              </div>
              <div className="rounded-xl bg-raised/45 p-2.5 ring-1 ring-line">
                <div className="text-[10px] text-muted">Giá trị tạo ra</div>
                <div className="font-mono text-lg font-extrabold text-fg">$29.7M</div>
                <div className="font-mono text-[10px] font-bold text-ok">P&L đã kiểm soát</div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
            <span className="font-mono text-[10px] font-semibold text-ok">
              Tiến trình G1–G5: 5/5 PASS
            </span>
            <button
              type="button"
              onClick={() => useBoardStore.getState().setTab("sidecar")}
              className="inline-flex items-center gap-1 rounded-xl bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent ring-1 ring-accent/25 hover:bg-accent hover:text-white"
            >
              Mở Universal <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Enterprise Status Bar matching 01-design-system-visual-blueprint.png */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-surface px-4 py-2.5 text-xs shadow-card ring-1 ring-line">
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-amber-500" />
          <span className="font-bold text-fg">Hozerion Sidecar</span>
          <span className="rounded-md bg-accent/12 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
            v5.0 Enterprise
          </span>
        </div>
        <div className="text-muted">
          Kết nối 6 mô-đun · 8 hệ phương tiện đa phương thức · AI QuotaMesh Origin-Bound · Tùy biến linh hoạt
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-ok/12 px-2.5 py-0.5 font-semibold text-ok">
            ● Tất cả hệ thống hoạt động bình thường
          </span>
        </div>
      </div>
    </div>
  );
}
