import { useRef } from "react";
import { clockLabel } from "@/lib/minmove/seed.ts";
import type { Appointment, Truck, Yard } from "@/lib/minmove/types.ts";
import { pct } from "@/components/minmove/glyphs.tsx";

export function DelayLane({
  yard,
  truck,
  orig,
  delayMin,
  onDelay,
}: {
  yard: Yard;
  truck: Truck;
  orig: Appointment;
  delayMin: number;
  onDelay: (min: number) => void;
}) {
  const eta = orig.startMin + delayMin;
  const track = useRef<HTMLDivElement>(null);

  const setFromClientX = (clientX: number) => {
    const el = track.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const min = Math.round(((clientX - r.left) / r.width) * yard.shiftLenMin);
    onDelay(Math.max(10, Math.min(90, min - orig.startMin)));
  };

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <p className="text-xs text-muted">Delay</p>
        <p className="font-mono text-xs tabular-nums text-fg">
          {clockLabel(yard.shiftStartMin, eta)} · +{delayMin}m
        </p>
      </div>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-valuemin={10}
        aria-valuemax={90}
        aria-valuenow={delayMin}
        aria-label="Delay in minutes"
        onClick={(e) => setFromClientX(e.clientX)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") onDelay(Math.min(90, delayMin + 5));
          if (e.key === "ArrowLeft") onDelay(Math.max(10, delayMin - 5));
        }}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (e.buttons !== 1) return;
          setFromClientX(e.clientX);
        }}
        className="relative h-10 cursor-ew-resize rounded-md bg-raised ring-1 ring-line"
      >
        <span
          className="pointer-events-none absolute top-3 bottom-3 rounded-md ring-1 ring-dashed ring-fg/35"
          style={{ left: pct(orig.startMin, yard.shiftLenMin), width: pct(truck.durationMin, yard.shiftLenMin) }}
        />
        <span
          className="pointer-events-none absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-warn"
          style={{ left: pct(orig.startMin, yard.shiftLenMin), width: pct(delayMin, yard.shiftLenMin) }}
        />
        <span
          className="pointer-events-none absolute top-2 bottom-2 w-px bg-fg"
          style={{ left: pct(eta, yard.shiftLenMin) }}
        />
        <span
          className="absolute top-1/2 z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg shadow-[var(--shadow-border)]"
          style={{ left: pct(eta, yard.shiftLenMin) }}
        />
      </div>
    </div>
  );
}
