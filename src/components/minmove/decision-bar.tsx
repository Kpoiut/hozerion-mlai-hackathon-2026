import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, CircleAlert, CircleX, Copy, Undo2 } from "lucide-react";
import { formatEtcVerdict } from "@/lib/minmove/arbitrate.ts";
import { planProof } from "@/lib/minmove/proof.ts";
import { holdingCall } from "@/lib/minmove/published-week.ts";
import { formatWhen } from "@/lib/minmove/seed.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";
import type { Certificate, ConstraintId, SolveResult, Yard } from "@/lib/minmove/types.ts";
import { Button } from "@/components/ui/button.tsx";

const DROP_LABEL: Record<string, string> = {
  forceDock: "Unforce door",
  cargo: "Keep cargo",
  equipment: "Ignore equipment",
  wait: "Relax wait",
  deadline: "Relax deadline",
  freeze: "Move in-bay",
  kbound: "One more move",
};

export function DecisionBar({
  result,
  yard,
  onApplyRelax,
  onCommit,
}: {
  result: SolveResult | null;
  yard: Yard;
  onApplyRelax: (drop: ConstraintId) => void;
  onCommit: () => void;
}) {
  if (!result) return null;

  const etc = useBoardStore((s) => s.etc);
  const event = useBoardStore((s) => s.event);
  const cert = result.certificate;
  const hour = yard.timeUnit === "hour";
  const restores = (result.relaxations ?? []).filter((r) => r.restores);
  const core = (result.conflict ?? []).filter((c) => c.core);
  const msg = core[0]?.message ?? result.conflict?.[0]?.message;
  const [menu, setMenu] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: Event) => {
      if (!wrap.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);

  const planLine =
    cert && result.status === "OPTIMAL"
      ? `${placeName(cert.chosen.dockId, hour)} at ${formatWhen(yard, cert.chosen.startMin)}, wait ${result.metrics.eventWaitMin}${hour ? "h" : "m"}, k=${result.kUsed}`
      : "";
  const fact = hour && cert ? fileCall(yard, cert.chosen.truckId) : undefined;

  return (
    <div className="space-y-1.5">
      {/* Row 1: Status + Chosen Slot + Arbiter Clock + Right-Aligned Commit */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {result.status === "OPTIMAL" ? (
            <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-ok/12 px-2 text-xs font-semibold text-ok ring-1 ring-ok/20">
              <CheckCircle2 className="size-3.5" />
              Ready
            </span>
          ) : result.status === "HUMAN_REQUIRED" ? (
            <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-warn/12 px-2 text-xs font-semibold text-warn ring-1 ring-warn/20">
              <CircleAlert className="size-3.5" />
              Review
            </span>
          ) : (
            <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-bad/12 px-2 text-xs font-semibold text-bad ring-1 ring-bad/20">
              <CircleX className="size-3.5" />
              Blocked
            </span>
          )}
          {result.status === "OPTIMAL" && cert ? (
            <p className="truncate font-mono text-xs font-semibold text-accent">
              {placeName(cert.chosen.dockId, hour)} at {formatWhen(yard, cert.chosen.startMin)}
              <span className="ml-2 font-normal text-fg">
                wait {result.metrics.eventWaitMin}
                {hour ? "h" : "m"}
              </span>
              <span className="font-normal text-muted">
                {result.metrics.displaced ? ` · ${result.metrics.displaced} moved` : " · nobody else moves"}
              </span>
              <span className="ml-1.5 font-normal text-faint">· draft</span>
            </p>
          ) : (
            <p className="truncate text-xs text-muted">{msg}</p>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {etc ? (
            <p className="hidden truncate font-mono text-[11px] text-muted sm:block" data-etc-winner={etc.winner}>
              {formatEtcVerdict(etc, yard.shiftStartMin, yard.timeUnit)}
              {etc.conflicts.length > 1 ? ` · ${etc.conflicts.length} disagreements` : ""}
            </p>
          ) : null}
          {restores.map((r) => (
            <Button key={r.id} type="button" variant="secondary" size="sm" className="h-7 text-xs" onClick={() => onApplyRelax(r.drop)}>
              {DROP_LABEL[r.drop] ?? r.label}
            </Button>
          ))}
          <div className="relative flex shrink-0" ref={wrap}>
            <Button
              type="button"
              className="h-7 min-w-18 rounded-l-lg rounded-r-none px-3 text-xs"
              onClick={onCommit}
              disabled={result.status !== "OPTIMAL"}
            >
              Commit
            </Button>
            <Button
              type="button"
              className="h-7 rounded-l-none rounded-r-lg px-1.5"
              onClick={() => setMenu((v) => !v)}
              disabled={result.status !== "OPTIMAL"}
              aria-label="Commit options"
              aria-expanded={menu}
            >
              <ChevronDown className="size-3.5" />
            </Button>
            {menu ? (
              <div className="absolute top-full right-0 z-50 mt-1 min-w-44 rounded-xl bg-surface p-1 shadow-float ring-1 ring-line">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-raised"
                  onClick={() => {
                    setMenu(false);
                    onCommit();
                  }}
                >
                  Commit to board
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-raised"
                  onClick={() => {
                    setMenu(false);
                    void navigator.clipboard.writeText(planLine);
                  }}
                >
                  <Copy className="size-3.5 text-muted" />
                  Copy plan
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-raised disabled:opacity-40"
                  disabled={!useBoardStore.getState().previous}
                  onClick={() => {
                    setMenu(false);
                    useBoardStore.getState().undo();
                  }}
                >
                  <Undo2 className="size-3.5 text-muted" />
                  Undo last commit
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Row 2: ProofStrip (Minute mode) or File Audit (Hour mode) */}
      {result.status === "OPTIMAL" && !hour ? (
        <div className="border-t border-line/60 pt-1.5">
          <ProofStrip result={result} yard={yard} />
        </div>
      ) : null}

      {hour && (fact || cert) ? (
        <div className="flex items-center gap-2 truncate border-t border-line/60 pt-1 font-mono text-[10px] text-faint">
          {fact && event ? (
            <span className="truncate">
              {fact.id} in the file: arrives {fact.arrival}h, moors {fact.moor}h on berth {fact.berth}, occupies {fact.len} berths, works {fact.handling}h. This probe arrives at {event.newEtaMin}h.
            </span>
          ) : null}
          {cert ? <CertificateAudit cert={cert} yard={yard} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function CertificateAudit({ cert, yard }: { cert: Certificate; yard: Yard }) {
  const hole = cert.whyNotGreedy;
  const next = cert.nextBest;
  const rejected = cert.rejected.slice(0, 2).map((row) => row.detail);
  const span = yard.trucks.find((t) => t.id === cert.chosen.truckId)?.span ?? 1;
  const holder = hole ? holdingCall(yard, hole.greedyDockId, hole.greedyStartMin, span) : null;
  return (
    <span className="truncate font-mono text-[10px] text-faint" data-certificate="audit">
      Decision hour {cert.nowMin}. Frozen {cert.frozenIds.length}. Done {cert.doneIds.length}. Legal windows {cert.legalWindows.length}. Rejected {cert.rejected.length}.
      {hole
        ? ` First hole berth ${hole.greedyDockId.replace(/^B/, "")} at ${hole.greedyStartMin}h${holder ? `, when ${holder} leaves` : ""}.`
        : " First hole is this plan."}
      {next ? ` Next plan berth ${next.dockId.replace(/^B/, "")} at ${next.startMin}h, ${next.whyWorse}.` : ""}
      {rejected.length ? ` ${rejected.join(" · ")}` : ""}
    </span>
  );
}

function fileCall(yard: Yard, id: string) {
  const truck = yard.trucks.find((t) => t.id === id);
  const appt = yard.appointments.find((a) => a.truckId === id);
  if (!truck || !appt) return undefined;
  return {
    id,
    arrival: truck.arrivalMin ?? appt.startMin,
    moor: appt.startMin,
    berth: Number(appt.dockId.replace(/\D/g, "")),
    len: truck.span ?? 1,
    handling: truck.durationMin,
  };
}

function placeName(id: string, hour: boolean): string {
  return hour ? `Berth ${id.replace(/^B/, "")}` : `Door ${id.replace(/^D/, "")}`;
}

function ProofStrip({ result, yard }: { result: SolveResult; yard: Yard }) {
  const hour = yard.timeUnit === "hour";
  const proof = planProof(result, hour ? "hour" : "minute");
  if (!proof) return null;
  const suffix = hour ? "h" : "m";
  const place = (id: string) => (hour ? `Berth ${id.replace(/^B/, "")}` : `Door ${id}`);
  return (
    <div
      className="flex flex-wrap items-center gap-2 text-[11px]"
      data-proof-saved={proof.savedMin}
    >
      <span className="font-semibold text-fg">{proof.headline}</span>
      <span className="font-mono text-muted">
        First free <strong className="text-fg">{proof.habitWaitMin}{suffix}</strong> ({place(proof.habitDock)})
      </span>
      <span className="text-muted">→</span>
      <span className="font-mono text-accent">
        This plan <strong>{proof.waitMin}{suffix}</strong> ({place(proof.dock)})
      </span>
      <span className="rounded bg-ok/12 px-1.5 py-px font-mono text-[10px] font-semibold text-ok">
        Saved {proof.savedMin}{suffix} · {proof.moved === 0 ? "nobody else moves" : `${proof.moved} moved`}
      </span>
    </div>
  );
}
