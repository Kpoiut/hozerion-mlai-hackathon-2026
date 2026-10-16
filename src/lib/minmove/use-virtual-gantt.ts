import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { measureViewport, windowRows, windowTime, type RowWindow, type TimeWindow, type Viewport } from "./virtual.ts";

const INITIAL: Viewport = { scrollLeft: 0, scrollTop: 0, width: 1600, height: 800, contentWidth: 832 };

function vpKey(v: Viewport): string {
  return `${v.scrollLeft | 0}|${v.scrollTop | 0}|${v.width | 0}|${v.height | 0}|${v.contentWidth | 0}`;
}

/** rAF-coalesced window. setState only when the visible window actually moves. */
export function useVirtualGantt(
  ref: RefObject<HTMLElement | null>,
  rowCount: number,
  rowH: number,
): { vp: Viewport; rows: RowWindow; time: TimeWindow } {
  const [vp, setVp] = useState<Viewport>(INITIAL);
  const keyRef = useRef("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const sync = () => {
      raf = 0;
      const inner = el.firstElementChild as HTMLElement | null;
      const next = measureViewport(el, inner?.scrollWidth || el.scrollWidth || 832);
      const key = vpKey(next);
      if (key === keyRef.current) return;
      keyRef.current = key;
      setVp(next);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };
    sync();
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, rowCount, rowH]);

  const rows = useMemo(
    () => windowRows(rowCount, rowH, vp.scrollTop, vp.height),
    [rowCount, rowH, vp.scrollTop, vp.height],
  );
  const time = useMemo(() => windowTime(vp), [vp]);
  return { vp, rows, time };
}
