export const SLOT_MIN = 1;
export const SHIFT_LEN_MIN = 8 * 60;
export const MAX_K = 4;

export type Cargo = "dry" | "reefer";
export type Equipment = "forklift" | "reefer_plug" | "crane";
export type Ternary = "allow" | "deny" | "unknown";

export interface Dock {
  id: string;
  name: string;
  short: string;
  equipment: Equipment[];
  cargo: Cargo[];
  /** Absence of a listed fact is deny. Unknown blocks autonomous commit if the only feasible plan needs it. */
  unknownEquipment?: Equipment[];
  unknownCargo?: Cargo[];
}

export interface Truck {
  id: string;
  plate: string;
  hauler: string;
  durationMin: number;
  cargo: Cargo;
  requiredEquipment: Equipment[];
  priority: 1 | 2 | 3;
  deadlineMin: number;
  maxWaitMin: number;
  /** Contiguous doors occupied, leftmost door is the appointment dock. Omitted means 1. */
  span?: number;
  /** Published arrival hour or minute. Omitted on yards that have no separate arrival field. */
  arrivalMin?: number;
}

export interface Appointment {
  truckId: string;
  dockId: string;
  startMin: number;
}

export interface Yard {
  id: string;
  name: string;
  gate: string;
  shiftLabel: string;
  shiftStartMin: number;
  shiftLenMin: number;
  /** Published berth files are hours. Omitted means the yard clock is minutes. */
  timeUnit?: "minute" | "hour";
  docks: Dock[];
  trucks: Truck[];
  appointments: Appointment[];
}

export interface DelayEvent {
  truckId: string;
  newEtaMin: number;
  cargoOverride?: Cargo;
  forceDockId?: string;
  /** Decision time from shift start. Trucks in bay are frozen. */
  nowMin?: number;
  source: EtcSourceId;
  note?: string;
  /** Set when the minute was chosen by arbitrateEtc. The solver ignores it. */
  etc?: EtcVerdict;
}

/** Who may propose the gate minute. Lower rank wins when the sample is fresh. */
export type EtcSourceId = "manual" | "parse" | "osrm" | "agent" | "haversine" | "booked";

export interface EtcReading {
  source: EtcSourceId;
  truckId: string;
  /** Minutes from shift start. */
  etaMin: number;
  /** Board clock when this sample was taken. */
  observedAtMin: number;
  freshForMin?: number;
}

export interface EtcConflict {
  left: EtcSourceId;
  right: EtcSourceId;
  deltaMin: number;
}

export interface EtcRejection {
  source: EtcSourceId;
  why: "stale" | "other-truck" | "future" | "nan";
}

export interface EtcVerdict {
  truckId: string;
  nowMin: number;
  etaMin: number;
  winner: EtcSourceId;
  reason: string;
  /** True when the winner is a stale sample or the booked slot with no live sensor. */
  degraded: boolean;
  stale: EtcSourceId[];
  missing: EtcSourceId[];
  rejected: EtcRejection[];
  conflicts: EtcConflict[];
  eligible: EtcSourceId[];
}

export type SolveStatus = "OPTIMAL" | "INFEASIBLE" | "HUMAN_REQUIRED";

export type ConstraintId =
  | "forceDock"
  | "cargo"
  | "equipment"
  | "wait"
  | "deadline"
  | "freeze"
  | "kbound";

export interface ConflictAtom {
  code:
    | "NO_ELIGIBLE_DOCK"
    | "FORCED_DOCK_INELIGIBLE"
    | "WAIT_LIMIT"
    | "DEADLINE"
    | "NO_GAP"
    | "EQUIPMENT"
    | "CARGO"
    | "FROZEN"
    | "UNKNOWN_FACT"
    | "K_BOUND";
  constraint: ConstraintId;
  message: string;
  core: boolean;
}

export interface LexScore {
  violations: number;
  displaced: number;
  priorityHits: number;
  dockChanges: number;
  totalDelayMin: number;
  eventWaitMin: number;
}

export interface SolveMetrics {
  displaced: number;
  displacedIds: string[];
  dockChanges: number;
  dockChangeIds: string[];
  totalDelayMin: number;
  deadlineMisses: number;
  waitMisses: number;
  priorityHits: number;
  eventWaitMin: number;
  objective: number;
  lex: LexScore;
}

export interface RejectedWindow {
  dockId: string;
  startMin: number;
  endMin: number;
  reason: "TOO_SHORT" | "WAIT" | "DEADLINE" | "CARGO" | "EQUIPMENT" | "UNKNOWN" | "FORCED_OTHER" | "FROZEN";
  detail: string;
}

export interface LegalWindow {
  dockId: string;
  earliestStart: number;
  latestStart: number;
  gapEnd: number;
  fits: boolean;
}

export interface Certificate {
  frozenIds: string[];
  doneIds: string[];
  nowMin: number;
  chosen: { truckId: string; dockId: string; startMin: number; waitMin: number };
  legalWindows: LegalWindow[];
  rejected: RejectedWindow[];
  whyNotGreedy?: {
    greedyDockId: string;
    greedyStartMin: number;
    greedyWaitMin: number;
    savedWaitMin: number;
    note: string;
  };
  nextBest?: {
    dockId: string;
    startMin: number;
    displaced: number;
    delayMin: number;
    whyWorse: string;
  };
}

export interface Relaxation {
  id: string;
  drop: ConstraintId;
  label: string;
  restores: boolean;
  inIis: boolean;
  chosen?: { dockId: string; startMin: number };
  displaced?: number;
  delayMin?: number;
}

export interface SolveResult {
  status: SolveStatus;
  engine: "minmove";
  appointments: Appointment[];
  metrics: SolveMetrics;
  conflict?: ConflictAtom[];
  relaxations?: Relaxation[];
  iis?: ConstraintId[];
  certificate?: Certificate;
  kUsed: number;
  nodes?: number;
  ms: number;
}

export interface BaselineRow {
  id: "keep-order" | "greedy" | "minmove";
  label: string;
  feasible: boolean;
  metrics?: SolveMetrics;
  appointments?: Appointment[];
  note: string;
}

export const WEIGHTS = {
  displaced: 1000,
  dockChange: 10,
  delay: 1,
  deadline: 5000,
  wait: 5000,
  priority: 80,
} as const;

export interface SolveMask {
  ignoreForceDock: boolean;
  ignoreCargo: boolean;
  ignoreEquipment: boolean;
  ignoreWait: boolean;
  ignoreDeadline: boolean;
  ignoreFreeze: boolean;
  treatUnknownAs: "deny" | "allow";
  kMax: number;
}

export const STRICT_MASK: SolveMask = {
  ignoreForceDock: false,
  ignoreCargo: false,
  ignoreEquipment: false,
  ignoreWait: false,
  ignoreDeadline: false,
  ignoreFreeze: false,
  treatUnknownAs: "deny",
  kMax: MAX_K,
};
