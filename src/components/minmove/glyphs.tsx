import { Weight } from "lucide-react";
import { Icon } from "@/components/minmove/icons.tsx";
import type { Dock } from "@/lib/minmove/types.ts";

export function DockGlyph({ dock, className }: { dock: Dock; className?: string }) {
  if (dock.equipment.includes("crane")) return <Weight className={className} strokeWidth={1.75} />;
  if (dock.cargo.includes("reefer")) return <Icon.reefer className={className} strokeWidth={1.75} />;
  return <Icon.truck className={className} strokeWidth={1.75} />;
}

export function pct(min: number, len: number) {
  return `${(min / len) * 100}%`;
}
