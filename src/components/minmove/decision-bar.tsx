import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, CircleAlert, CircleX, Copy, Undo2 } from "lucide-react";
import { formatEtcVerdict } from "@/lib/minmove/arbitrate.ts";
import { planProof } from "@/lib/minmove/proof.ts";
import { bookedFromPlan, bookedHeadline, holdingCall, type BookedProbe } from "@/lib/minmove/published-week.ts";
import { formatWhen } from "@/lib/minmove/seed.ts";
import { useBoardStore } from "@/lib/minmove/store.ts";
import type { Certificate, ConstraintId, SolveResult, Yard } from "@/lib/minmove/types.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

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
    <div className="flex min-h-10 flex-wrap items-center gap-3">
      {result.status === "OPTIMAL" ? (
        <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ok/10 px-3 text-sm font-medium text-ok">
          <CheckCircle2 className="size-4" />
          Ready
        </span>
      ) : result.status === "HUMAN_REQUIRED" ? (
        <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-warn/10 px-3 text-sm font-medium text-warn">
          <CircleAlert className="size-4" />
          Review
        </span>
      ) : (
        <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-bad/10 px-3 text-sm font-medium text-bad">
          <CircleX className="size-4" />
          Blocked
        </span>
      )}
      {result.status === "OPTIMAL" && cert ? (
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-accent">
          {placeName(cert.chosen.dockId, hour)} at {formatWhen(yard, cert.chosen.startMin)}
          <span className="ml-2 font-normal">wait {result.metrics.eventWaitMin}{hour ? "h" : "m"}</span>
          <span className="font-normal text-muted">
            {result.metrics.displaced ? ` · ${result.metrics.displaced} moved` : " · nobody else moves"}
          </span>
          <span className="ml-2 font-normal text-faint">· draft</span>
        </p>
      ) : (
        <p className="min-w-0 flex-1 truncate text-sm text-muted">{msg}</p>
      )}
      {result.status === "OPTIMAL" ? <ProofStrip result={result} yard={yard} /> : null}
      {hour && fact && event ? (
        <p className="basis-full text-sm text-muted">
          {fact.id} in the file: arrives {fact.arrival}h, moors {fact.moor}h on berth {fact.berth}, occupies {fact.len} berths, works {fact.handling}h. This probe arrives at {event.newEtaMin}h.
        </p>
      ) : null}
      {hour && cert ? <CertificateAudit cert={cert} yard={yard} /> : null}
      {etc ? (
        <p className="basis-full truncate font-mono text-xs text-muted" data-etc-winner={etc.winner}>
          {formatEtcVerdict(etc, yard.shiftStartMin, yard.timeUnit)}
          {etc.conflicts.length > 1 ? ` · ${etc.conflicts.length} disagreements` : ""}
        </p>
      ) : null}
      {restores.map((r) => (
        <Button key={r.id} type="button" variant="secondary" size="sm" onClick={() => onApplyRelax(r.drop)}>
          {DROP_LABEL[r.drop] ?? r.label}
        </Button>
      ))}
      <div className="relative flex shrink-0" ref={wrap}>
        <Button
          type="button"
          className="h-10 min-w-24 rounded-l-xl rounded-r-none"
          onClick={onCommit}
          disabled={result.status !== "OPTIMAL"}
        >
          Commit
        </Button>
        <Button
          type="button"
          className="h-10 rounded-l-none rounded-r-xl px-2"
          onClick={() => setMenu((v) => !v)}
          disabled={result.status !== "OPTIMAL"}
          aria-label="Commit options"
          aria-expanded={menu}
        >
          <ChevronDown className="size-4" />
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
  );
}

function CertificateAudit({ cert, yard }: { cert: Certificate; yard: Yard }) {
  const hole = cert.whyNotGreedy;
  const next = cert.nextBest;
  const rejected = cert.rejected.slice(0, 2).map((row) => row.detail);
  const span = yard.trucks.find((t) => t.id === cert.chosen.truckId)?.span ?? 1;
  const holder = hole ? holdingCall(yard, hole.greedyDockId, hole.greedyStartMin, span) : null;
  return (
    <p className="basis-full font-mono text-xs text-muted" data-certificate="audit">
      Decision hour {cert.nowMin}. Frozen {cert.frozenIds.length}. Done {cert.doneIds.length}. Legal windows {cert.legalWindows.length}. Rejected {cert.rejected.length}.
      {hole
        ? ` First hole berth ${hole.greedyDockId.replace(/^B/, "")} at ${hole.greedyStartMin}h${holder ? `, when ${holder} leaves` : ""}.`
        : " First hole is this plan."}
      {next ? ` Next plan berth ${next.dockId.replace(/^B/, "")} at ${next.startMin}h, ${next.whyWorse}.` : ""}
      {rejected.length ? ` ${rejected.join(" · ")}` : ""}
    </p>
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

function BookedStrip({ row }: { row: BookedProbe }) {
  const suffix = "h";
  const place = (id: string | null) => (id ? `Berth ${id.replace(/^B/, "")}` : "—");
  return (
    <div className="basis-full rounded-xl bg-raised px-3 py-2" data-proof-saved={row.saved ?? ""}>
      <p className="text-sm font-medium">{bookedHeadline(row)}</p>
      <dl className="mt-2 grid grid-cols-3 gap-2">
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-faint">Stay booked</dt>
          <dd className="font-mono text-lg tabular-nums leading-tight">{row.holdWait ?? "—"}{row.holdWait == null ? "" : suffix}</dd>
          <dd className="text-xs text-muted">{place(row.holdDock)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-faint">This plan</dt>
          <dd className="font-mono text-lg tabular-nums leading-tight">{row.planWait ?? "—"}{row.planWait == null ? "" : suffix}</dd>
          <dd className="text-xs text-muted">{place(row.planDock)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-faint">Versus booked</dt>
          <dd className="font-mono text-lg tabular-nums leading-tight">{row.saved ?? "—"}{row.saved == null ? "" : suffix}</dd>
          <dd className="text-xs text-muted">{row.planMoves === 0 ? "nobody else moves" : `${row.planMoves ?? 0} moved`}</dd>
        </div>
      </dl>
    </div>
  );
}

function ProofStrip({ result, yard }: { result: SolveResult; yard: Yard }) {
  const hour = yard.timeUnit === "hour";
  const event = useBoardStore((s) => s.event);
  if (hour && event) {
    const booked = bookedFromPlan(yard, event, result);
    if (booked.planStatus === "OPTIMAL") return <BookedStrip row={booked} />;
  }
  const proof = planProof(result, hour ? "hour" : "minute");
  if (!proof) return null;
  const suffix = hour ? "h" : "m";
  const place = (id: string) => (hour ? `Berth ${id.replace(/^B/, "")}` : `Door ${id}`);
  return (
    <div className="basis-full rounded-xl bg-raised px-3 py-2" data-proof-saved={proof.savedMin}>
      <p className="text-sm font-medium">{proof.headline}</p>
      <dl className="mt-2 grid grid-cols-3 gap-2">
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-faint">First free</dt>
          <dd className="font-mono text-lg tabular-nums leading-tight">{proof.habitWaitMin}{suffix}</dd>
          <dd className="text-xs text-muted">{place(proof.habitDock)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-faint">This plan</dt>
          <dd className="font-mono text-lg tabular-nums leading-tight">{proof.waitMin}{suffix}</dd>
          <dd className="text-xs text-muted">{place(proof.dock)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-faint">Saved</dt>
          <dd className="font-mono text-lg tabular-nums leading-tight">{proof.savedMin}{suffix}</dd>
          <dd className="text-xs text-muted">{proof.moved === 0 ? "nobody else moves" : `${proof.moved} moved`}</dd>
        </div>
      </dl>
    </div>
  );
}
