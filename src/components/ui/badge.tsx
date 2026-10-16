import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

export function Badge({
  className,
  tone = "muted",
  children,
}: {
  className?: string;
  tone?: "muted" | "ok" | "warn" | "bad" | "fg";
  children: ReactNode;
}) {
  const tones = {
    muted: "bg-raised text-muted ring-line",
    ok: "bg-ok/15 text-ok ring-ok/30",
    warn: "bg-warn/15 text-warn ring-warn/30",
    bad: "bg-bad/15 text-bad ring-bad/30",
    fg: "bg-fg text-bg ring-transparent",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 font-mono text-xs tabular-nums ring-1",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
