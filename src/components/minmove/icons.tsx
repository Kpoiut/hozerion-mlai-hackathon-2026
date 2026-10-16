import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeftRight,
  CalendarDays,
  Check,
  Clock,
  DoorClosed,
  Droplets,
  Flag,
  Leaf,
  Lock,
  Snowflake,
  Truck,
  Unlock,
} from "lucide-react";
import { doorCapabilities, type Occupancy } from "@/lib/minmove/doors.ts";
import type { Dock } from "@/lib/minmove/types.ts";
import { cn } from "@/lib/utils.ts";

export const Icon = {
  truck: Truck,
  reefer: Snowflake,
  dry: Leaf,
  other: Droplets,
  late: AlertTriangle,
  moved: ArrowLeftRight,
  priority: Flag,
  open: Unlock,
  busy: Clock,
  closed: Lock,
  calendar: CalendarDays,
  check: Check,
  door: DoorClosed,
} as const;

export type StatusTone = "text-ok" | "text-warn" | "text-faint" | "text-accent";

export function doorStatus(occupancy: Occupancy, dock: Dock): { icon: LucideIcon; label: string; tone: StatusTone } {
  const cap = doorCapabilities(dock);
  if (occupancy === "busy") return { icon: Clock, label: "Busy", tone: "text-warn" };
  if (occupancy === "tight") return { icon: Lock, label: "Tight", tone: "text-faint" };
  if (cap.reefer && !cap.dry) return { icon: Snowflake, label: "Reefer", tone: "text-accent" };
  return { icon: Unlock, label: "Open", tone: "text-ok" };
}

export function OccupancyIcon({ occupancy, className }: { occupancy: Occupancy; className?: string }) {
  const I: LucideIcon = occupancy === "busy" ? Clock : occupancy === "tight" ? Lock : Unlock;
  return <I className={className} strokeWidth={1.9} />;
}

export function CargoMark({
  cargo,
  className,
  featured,
}: {
  cargo: "dry" | "reefer" | "other" | string;
  className?: string;
  featured?: boolean;
}) {
  if (cargo === "reefer") return <Snowflake className={cn(className, !featured && "text-accent")} strokeWidth={1.9} />;
  if (cargo === "dry") return <Leaf className={cn(className, !featured && "text-ok")} strokeWidth={1.9} />;
  return <Droplets className={cn(className, !featured && "text-accent")} strokeWidth={1.9} />;
}
