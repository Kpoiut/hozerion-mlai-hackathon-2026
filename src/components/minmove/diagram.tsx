export function ArchitectureDiagram({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 920 420"
      className={compact ? "h-auto w-full" : "h-auto w-full max-w-4xl"}
      role="img"
      aria-label="Hozerion services: parse, arbiter, solver, flow, optional agent"
    >
      <rect width="920" height="420" fill="var(--color-surface)" rx="16" />
      <text x="28" y="36" fill="var(--color-faint)" fontFamily="IBM Plex Mono, monospace" fontSize="11" letterSpacing="2">
        ONE PROCESS · ARBITER PICKS THE MINUTE · SOLVER OWNS STATE
      </text>

      <Box x={28} y={56} w={200} h={88} title="Parse" lines={["radio note → event", "deterministic, local"]} />
      <Box x={248} y={56} w={200} h={88} title="Agent" lines={["optional Grok", "intent only, never writes"]} />
      <Box x={468} y={56} w={200} h={88} title="Solver" lines={["lex k-repair + freeze", "IIS deletion filter"]} accent />
      <Box x={688} y={56} w={204} h={88} title="Flow" lines={["gate → yard → dock", "playback clock"]} />

      <Arrow x1={228} y1={100} x2={248} y2={100} />
      <Arrow x1={448} y1={100} x2={468} y2={100} />
      <Arrow x1={668} y1={100} x2={688} y2={100} />

      <Arrow x1={568} y1={144} x2={568} y2={188} />
      <Box x={430} y={188} w={276} h={80} title="Certificate" lines={["versus the booked berth"]} accent />
      <Arrow x1={430} y1={228} x2={248} y2={228} />
      <Box x={28} y={188} w={220} h={80} title="Operator" lines={["COMMIT or reject", "yard never auto-mutates"]} />

      <text x="28" y="318" fill="var(--color-accent)" fontFamily="IBM Plex Mono, monospace" fontSize="11" letterSpacing="1.5">
        AUTHORITY SPLIT
      </text>
      <text x="28" y="344" fill="var(--color-fg)" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="13">
        Radio, road, and the agent propose a minute. The arbiter picks one. The solver proves. You commit.
      </text>
      <text x="28" y="368" fill="var(--color-muted)" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="12">
        Not a mesh of containers. Bounded services in one process so an 18-hour board can still demo in 60 seconds.
      </text>
      <text x="28" y="396" fill="var(--color-faint)" fontFamily="IBM Plex Mono, monospace" fontSize="11">
        lex = displaced ≺ priority ≺ dockChange ≺ delay ≺ eventWait · IIS via deletion
      </text>
    </svg>
  );
}

function Box({
  x,
  y,
  w,
  h,
  title,
  lines,
  accent,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines: string[];
  accent?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="10"
        fill="var(--color-raised)"
        stroke={accent ? "var(--color-accent)" : "var(--color-line)"}
        strokeWidth="1"
      />
      <text x={x + 14} y={y + 22} fill="var(--color-fg)" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="13" fontWeight="500">
        {title}
      </text>
      {lines.map((line) => (
        <text
          key={line}
          x={x + 14}
          y={y + 42 + lines.indexOf(line) * 16}
          fill="var(--color-muted)"
          fontFamily="IBM Plex Mono, monospace"
          fontSize="11"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const vertical = x1 === x2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-muted)" strokeWidth="1.2" />
      {vertical ? (
        <polygon points={`${x2 - 4},${y2 - 7} ${x2 + 4},${y2 - 7} ${x2},${y2}`} fill="var(--color-muted)" />
      ) : x2 < x1 ? (
        <polygon points={`${x2},${y2} ${x2 + 7},${y2 - 4} ${x2 + 7},${y2 + 4}`} fill="var(--color-muted)" />
      ) : (
        <polygon points={`${x2},${y2} ${x2 - 7},${y2 - 4} ${x2 - 7},${y2 + 4}`} fill="var(--color-muted)" />
      )}
    </g>
  );
}
