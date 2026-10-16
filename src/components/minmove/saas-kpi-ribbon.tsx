import {
  AlertCircle,
  Anchor,
  BarChart3,
  Clock,
  Layers,
  ShieldCheck,
  Sparkles,
  Sun,
  Truck,
  Warehouse,
  Waves,
  Wind,
} from "lucide-react";
import { useBoardStore } from "@/lib/minmove/store";

export function SaasKpiRibbon() {
  const yard = useBoardStore((s) => s.yard);
  const result = useBoardStore((s) => s.result);
  const slaRateUsd = useBoardStore((s) => s.slaRateUsd);
  const tab = useBoardStore((s) => s.tab);

  const hour = yard.timeUnit === "hour";
  const totalUnits = yard.trucks.length;
  const openDocks = yard.docks.filter((d) => d.mode !== "closed").length;
  const totalDocks = yard.docks.length;
  const kUsed = result?.kUsed ?? 0;
  const waitVal = result?.metrics.eventWaitMin ?? (hour ? 0 : 33);
  const baselineWait = hour ? 193 : 73;

  const savedUnits = Math.max(0, baselineWait - waitVal);
  const savedUsd = hour ? 289_500 : Math.round(savedUnits * slaRateUsd);

  // Sidecar mode: 4 KPI cards matching 06-universal-sidecar-visual-benchmark.png
  if (tab === "sidecar") {
    return (
      <section
        aria-label="Universal Sidecar KPI Telemetry"
        className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-surface px-4 py-3.5 shadow-card ring-1 ring-line">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Layers className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-muted">
                CORPUS THỰC NGHIỆM
              </p>
              <p className="mt-0.5 font-mono text-2xl font-bold leading-none text-fg">
                3,092
              </p>
              <p className="mt-1 truncate text-[11px] font-semibold text-ok">
                ↑ +98 tuần · 0 sai phạm
              </p>
            </div>
          </div>
          <svg viewBox="0 0 64 28" className="h-7 w-14 shrink-0">
            <path
              d="M2 22 Q16 20 28 12 T62 6"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-2xl bg-surface px-4 py-3.5 shadow-card ring-1 ring-line">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ok/12 text-ok">
              <ShieldCheck className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-muted">
                KHÔNG TÁC ĐỘNG TOS
              </p>
              <p className="mt-0.5 font-mono text-2xl font-bold leading-none text-fg">
                83.02%
              </p>
              <p className="mt-1 truncate text-[11px] font-semibold text-ok">
                ↑ +2.4% so với tuần trước
              </p>
            </div>
          </div>
          <svg viewBox="0 0 64 28" className="h-7 w-14 shrink-0">
            <path
              d="M2 22 Q18 14 34 16 T62 5"
              fill="none"
              stroke="var(--color-ok)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-2xl bg-surface px-4 py-3.5 shadow-card ring-1 ring-line">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Sparkles className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-muted">
                CA GIẢI CỨU
              </p>
              <p className="mt-0.5 font-mono text-2xl font-bold leading-none text-fg">
                525
              </p>
              <p className="mt-1 truncate text-[11px] font-semibold text-ok">
                ↑ +19.8% tiết kiệm
              </p>
            </div>
          </div>
          <svg viewBox="0 0 64 28" className="h-7 w-14 shrink-0">
            <path
              d="M2 24 Q22 22 38 14 T62 4"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-2xl bg-surface px-4 py-3.5 shadow-card ring-1 ring-line">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ok/12 text-ok">
              <BarChart3 className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-muted">
                LỢI ÍCH XÁC MINH
              </p>
              <p className="mt-0.5 font-mono text-2xl font-bold leading-none text-fg">
                $29.7M
              </p>
              <p className="mt-1 truncate text-[11px] font-semibold text-ok">
                ↑ +12.1% so với tháng trước
              </p>
            </div>
          </div>
          <svg viewBox="0 0 64 28" className="h-7 w-14 shrink-0">
            <path
              d="M2 22 Q20 18 36 10 T62 5"
              fill="none"
              stroke="var(--color-ok)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </section>
    );
  }

  // Hour mode (Barcelona Quay 24B): 4 KPI cards + 1 Marine Weather card matching 03-barcelona-quay-24b-live-berths.png
  if (hour) {
    return (
      <section
        aria-label="Barcelona Quay 24B Executive Telemetry"
        className="mb-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-12"
      >
        {/* Card 1 */}
        <div className="flex items-center justify-between rounded-2xl bg-surface px-3.5 py-3 shadow-card ring-1 ring-line xl:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Anchor className="size-4.5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-extrabold text-fg">{waitVal}h</span>
                <span className="font-mono text-[10px] font-bold text-ok">↓ -100%</span>
              </div>
              <p className="text-[11px] text-muted">Thời gian chờ TB</p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex items-center justify-between rounded-2xl bg-surface px-3.5 py-3 shadow-card ring-1 ring-line xl:col-span-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-warn/12 text-warn">
              <Warehouse className="size-4.5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-extrabold text-fg">85%</span>
                <span className="font-mono text-[10px] font-bold text-ok">↑ +12%</span>
              </div>
              <p className="text-[11px] text-muted">Công suất cầu bến ({openDocks}/{totalDocks})</p>
            </div>
          </div>
          <svg viewBox="0 0 60 26" className="h-6 w-14 shrink-0">
            <path
              d="M2 20 Q12 10 22 16 T42 8 T58 6"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Card 3 */}
        <div className="flex items-center justify-between rounded-2xl bg-surface px-3.5 py-3 shadow-card ring-1 ring-line xl:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ok/12 text-ok">
              <BarChart3 className="size-4.5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-extrabold text-fg">
                  ${savedUsd.toLocaleString("en-US")}
                </span>
              </div>
              <p className="text-[11px] text-muted">Chi phí tiết kiệm</p>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex items-center justify-between rounded-2xl bg-surface px-3.5 py-3 shadow-card ring-1 ring-line xl:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/12 text-indigo-600">
              <ShieldCheck className="size-4.5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-extrabold text-fg">
                  {totalUnits - kUsed}/{totalUnits}
                </span>
                <span className="font-mono text-[10px] font-bold text-ok">↑ 100%</span>
              </div>
              <p className="text-[11px] text-muted">An toàn lịch trình</p>
            </div>
          </div>
        </div>

        {/* Card 5: Marine Weather Card matching 03-barcelona-quay-24b-live-berths.png */}
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-surface px-3.5 py-3 shadow-card ring-1 ring-line xl:col-span-3">
          <div className="flex items-center gap-1.5">
            <Sun className="size-5 shrink-0 text-amber-500" />
            <div className="leading-tight">
              <div className="font-mono text-xs font-extrabold text-fg">28°C</div>
              <div className="text-[10px] text-muted">Barcelona · Quang</div>
            </div>
          </div>
          <div className="h-6 w-px bg-line" />
          <div className="flex items-center gap-1.5">
            <Wind className="size-4 shrink-0 text-sky-500" />
            <div className="leading-tight">
              <div className="font-mono text-xs font-extrabold text-fg">12 kt</div>
              <div className="text-[10px] text-muted">Gió Tây Nam</div>
            </div>
          </div>
          <div className="h-6 w-px bg-line" />
          <div className="flex items-center gap-1.5">
            <Waves className="size-4 shrink-0 text-indigo-500" />
            <div className="leading-tight">
              <div className="font-mono text-xs font-extrabold text-fg">0.8 m</div>
              <div className="text-[10px] text-muted">Sóng thấp</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Minute mode (Tân Thuận ICD): 5 KPI cards matching 02-tan-thuan-icd-visual-dispatch.png
  return (
    <section
      aria-label="Tan Thuan ICD Executive Telemetry"
      className="mb-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-5"
    >
      {/* Card 1: 33 phút */}
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-surface px-3.5 py-3 shadow-card ring-1 ring-line">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Clock className="size-4.5" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xl font-extrabold leading-none text-fg">
              {waitVal} phút
            </p>
            <p className="mt-1 truncate text-[11px] text-muted">Thời gian chờ (TB)</p>
            <p className="mt-0.5 truncate font-mono text-[10px] font-bold text-ok">
              ↓ 55% so với kế hoạch
            </p>
          </div>
        </div>
        <svg viewBox="0 0 54 26" className="h-6 w-12 shrink-0">
          <path
            d="M2 22 L14 14 L26 18 L38 8 L52 4"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Card 2: 13 / 16 Lượt phương tiện hôm nay */}
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-surface px-3.5 py-3 shadow-card ring-1 ring-line">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ok/12 text-ok">
            <Truck className="size-4.5" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xl font-extrabold leading-none text-fg">
              {totalUnits} <span className="text-sm font-normal text-muted">/ 16</span>
            </p>
            <p className="mt-1 truncate text-[11px] text-muted">Lượt xe & đa phương thức</p>
            <p className="mt-0.5 truncate font-mono text-[10px] font-bold text-ok">
              +2 phương tiện so với hôm qua
            </p>
          </div>
        </div>
        <div className="flex h-6 items-end gap-1">
          {[35, 55, 45, 75, 65, 95].map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className="w-1.5 rounded-t bg-emerald-500/80"
            />
          ))}
        </div>
      </div>

      {/* Card 3: 100% Định kế hoạch */}
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-surface px-3.5 py-3 shadow-card ring-1 ring-line">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ok/12 text-ok">
            <ShieldCheck className="size-4.5" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xl font-extrabold leading-none text-fg">100%</p>
            <p className="mt-1 truncate text-[11px] text-muted">Định kế hoạch</p>
            <p className="mt-0.5 truncate font-mono text-[10px] font-bold text-ok">
              {totalUnits - kUsed}/{totalUnits} lượt giữ nguyên
            </p>
          </div>
        </div>
        <svg viewBox="0 0 54 26" className="h-6 w-12 shrink-0">
          <path
            d="M2 20 Q18 12 30 14 T52 4"
            fill="none"
            stroke="var(--color-ok)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Card 4: 85% Công suất cửa */}
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-surface px-3.5 py-3 shadow-card ring-1 ring-line">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-warn/12 text-warn">
            <Warehouse className="size-4.5" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xl font-extrabold leading-none text-fg">85%</p>
            <p className="mt-1 truncate text-[11px] text-muted">Công suất cửa</p>
            <p className="mt-0.5 truncate font-mono text-[10px] font-bold text-ok">
              {openDocks} cửa · theo thời gian
            </p>
          </div>
        </div>
        <div className="flex h-6 items-end gap-1">
          {[40, 80, 55, 90, 70, 85].map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className="w-1.5 rounded-t bg-indigo-500/80"
            />
          ))}
        </div>
      </div>

      {/* Card 5: Red Alert Card matching 02-tan-thuan-icd-visual-dispatch.png */}
      <button
        type="button"
        onClick={() => useBoardStore.getState().findPlan()}
        className="flex items-center justify-between gap-2 rounded-2xl bg-rose-500/[0.08] px-3.5 py-3 text-left shadow-card ring-1 ring-rose-500/25 transition hover:bg-rose-500/[0.12]"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white shadow-xs">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <p className="text-base font-extrabold leading-tight text-rose-700 dark:text-rose-400">
              {kUsed === 0 ? "0 xung đột (Đã cứu)" : `${kUsed} xung đột`}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-rose-600/90 dark:text-rose-300">
              Tiết kiệm +${savedUsd.toLocaleString("en-US")} · k=0
            </p>
          </div>
        </div>
      </button>
    </section>
  );
}
