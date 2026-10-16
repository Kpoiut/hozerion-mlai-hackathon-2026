/** Extreme-point FFD. WASM SoA pool first; typed-array JS fallback. */

import { PACK3D_WASM } from "./pack3d.wasm.ts";

export interface Box3 {
  id: string;
  w: number;
  h: number;
  d: number;
}

export interface Pose3 extends Box3 {
  x: number;
  y: number;
  z: number;
  bin: number;
}

export interface Bin3 {
  W: number;
  H: number;
  D: number;
}

const MAX_PTS = 1024;
const EPS = 1e-4;

export function volume(b: { w: number; h: number; d: number }): number {
  return b.w * b.h * b.d;
}

export function aabbHit(a: Pose3, b: Pose3): boolean {
  if (a.bin !== b.bin) return false;
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h && a.z < b.z + b.d && b.z < a.z + a.d;
}

export function fitsInBin(p: Pose3, bin: Bin3): boolean {
  return p.x >= 0 && p.y >= 0 && p.z >= 0 && p.x + p.w <= bin.W + 1e-9 && p.y + p.h <= bin.H + 1e-9 && p.z + p.d <= bin.D + 1e-9;
}

type Wasm = {
  memory: WebAssembly.Memory;
  items_ptr: () => number;
  out_ptr: () => number;
  max_n: () => number;
  ep_live: () => number;
  pack_ep: (n: number, bw: number, bh: number, bd: number, rotate: number) => number;
  pack_depth: (n: number, depth: number) => number;
};

let wasmRef: Wasm | null | undefined;

export function pack3dWasm(): Wasm | null {
  if (wasmRef !== undefined) return wasmRef;
  try {
    const inst = new WebAssembly.Instance(new WebAssembly.Module(PACK3D_WASM));
    wasmRef = inst.exports as unknown as Wasm;
  } catch {
    wasmRef = null;
  }
  return wasmRef;
}

export function epLive(): number {
  return pack3dWasm()?.ep_live() ?? 0;
}

function ffdOrder(items: Box3[]): number[] {
  return items
    .map((_, i) => i)
    .sort((ia, ib) => {
      const a = items[ia]!;
      const b = items[ib]!;
      return volume(b) - volume(a) || Math.max(b.w, b.h, b.d) - Math.max(a.w, a.h, a.d) || a.id.localeCompare(b.id);
    });
}

function f32(mem: WebAssembly.Memory): Float32Array {
  return new Float32Array(mem.buffer);
}

function packWasm(items: Box3[], bin: Bin3, rotate: boolean): Pose3[] | null {
  const wasm = pack3dWasm();
  if (!wasm || items.length === 0 || items.length > wasm.max_n()) return null;
  const order = ffdOrder(items);
  const mem = f32(wasm.memory);
  const ip = wasm.items_ptr() >> 2;
  for (let i = 0; i < order.length; i++) {
    const b = items[order[i]!]!;
    mem[ip + i * 3] = b.w;
    mem[ip + i * 3 + 1] = b.h;
    mem[ip + i * 3 + 2] = b.d;
  }
  const n = wasm.pack_ep(order.length, bin.W, bin.H, bin.D, rotate ? 1 : 0);
  if (n !== order.length) return null;
  const op = wasm.out_ptr() >> 2;
  const out: Pose3[] = [];
  for (let i = 0; i < order.length; i++) {
    const src = items[order[i]!]!;
    out.push({
      id: src.id,
      x: mem[op + i * 7]!,
      y: mem[op + i * 7 + 1]!,
      z: mem[op + i * 7 + 2]!,
      w: mem[op + i * 7 + 3]!,
      h: mem[op + i * 7 + 4]!,
      d: mem[op + i * 7 + 5]!,
      bin: mem[op + i * 7 + 6]!,
    });
  }
  return out;
}

export function packExtremeFFD(items: Box3[], bin: Bin3, rotate = false): Pose3[] {
  return packWasm(items, bin, rotate) ?? packExtremeFFDJs(items, bin, rotate);
}

const ORIENT: Array<[number, number, number]> = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
];

function orientations(w: number, h: number, d: number, rotate: boolean): Array<[number, number, number]> {
  if (!rotate) return [[w, h, d]];
  const dim = [w, h, d];
  const seen = new Set<string>();
  const out: Array<[number, number, number]> = [];
  for (const p of ORIENT) {
    const t: [number, number, number] = [dim[p[0]]!, dim[p[1]]!, dim[p[2]]!];
    const key = `${t[0]},${t[1]},${t[2]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

/** Typed-array SoA fallback: fixed EP pool, hash dedup, prune-inside. */
export function packExtremeFFDJs(items: Box3[], bin: Bin3, rotate = false): Pose3[] {
  const order = ffdOrder(items);
  const px = new Float64Array(items.length);
  const py = new Float64Array(items.length);
  const pz = new Float64Array(items.length);
  const pw = new Float64Array(items.length);
  const ph = new Float64Array(items.length);
  const pd = new Float64Array(items.length);
  const pbin = new Uint16Array(items.length);
  let nplaced = 0;

  const ex = new Float64Array(MAX_PTS);
  const ey = new Float64Array(MAX_PTS);
  const ez = new Float64Array(MAX_PTS);
  const ebin = new Uint16Array(MAX_PTS);
  const elive = new Uint8Array(MAX_PTS);
  let npts = 0;
  const seen = new Set<string>();

  const keyOf = (x: number, y: number, z: number, b: number) => `${x}|${y}|${z}|${b}`;

  const addPt = (x: number, y: number, z: number, b: number) => {
    if (x < -EPS || y < -EPS || z < -EPS || x > bin.W + EPS || y > bin.H + EPS || z > bin.D + EPS) return;
    const k = keyOf(x, y, z, b);
    if (seen.has(k) || npts >= MAX_PTS) return;
    ex[npts] = x;
    ey[npts] = y;
    ez[npts] = z;
    ebin[npts] = b;
    elive[npts] = 1;
    seen.add(k);
    npts += 1;
  };

  const collides = (x: number, y: number, z: number, w: number, h: number, d: number, b: number) => {
    for (let i = 0; i < nplaced; i++) {
      if (pbin[i] !== b) continue;
      if (x < px[i]! + pw[i]! && px[i]! < x + w && y < py[i]! + ph[i]! && py[i]! < y + h && z < pz[i]! + pd[i]! && pz[i]! < z + d) {
        return true;
      }
    }
    return false;
  };

  const fits = (x: number, y: number, z: number, w: number, h: number, d: number) =>
    x >= -EPS && y >= -EPS && z >= -EPS && x + w <= bin.W + EPS && y + h <= bin.H + EPS && z + d <= bin.D + EPS;

  addPt(0, 0, 0, 0);
  let bins = 1;
  const poses: Pose3[] = new Array(items.length);

  for (const oi of order) {
    const item = items[oi]!;
    const orients = orientations(item.w, item.h, item.d, rotate);
    let found = false;
    let fx = 0;
    let fy = 0;
    let fz = 0;
    let fw = item.w;
    let fh = item.h;
    let fd = item.d;
    let fb = 0;
    for (let b = 0; b < bins && !found; b++) {
      let pick = -1;
      let pow = item.w;
      let poh = item.h;
      let pod = item.d;
      for (let i = 0; i < npts; i++) {
        if (!elive[i] || ebin[i] !== b) continue;
        if (
          pick >= 0 &&
          !(
            ez[i]! < ez[pick]! ||
            (ez[i] === ez[pick] && ey[i]! < ey[pick]!) ||
            (ez[i] === ez[pick] && ey[i] === ey[pick] && ex[i]! < ex[pick]!)
          )
        ) {
          continue;
        }
        for (const [ow, oh, od] of orients) {
          if (fits(ex[i]!, ey[i]!, ez[i]!, ow, oh, od) && !collides(ex[i]!, ey[i]!, ez[i]!, ow, oh, od, b)) {
            pick = i;
            pow = ow;
            poh = oh;
            pod = od;
            break;
          }
        }
      }
      if (pick >= 0) {
        fx = ex[pick]!;
        fy = ey[pick]!;
        fz = ez[pick]!;
        fw = pow;
        fh = poh;
        fd = pod;
        fb = b;
        found = true;
      }
    }
    if (!found) {
      fb = bins;
      bins += 1;
      addPt(0, 0, 0, fb);
      let put = false;
      for (const [ow, oh, od] of orients) {
        if (fits(0, 0, 0, ow, oh, od) && !collides(0, 0, 0, ow, oh, od, fb)) {
          fw = ow;
          fh = oh;
          fd = od;
          put = true;
          break;
        }
      }
      if (!put) {
        fw = item.w;
        fh = item.h;
        fd = item.d;
      }
    }
    const pi = nplaced++;
    px[pi] = fx;
    py[pi] = fy;
    pz[pi] = fz;
    pw[pi] = fw;
    ph[pi] = fh;
    pd[pi] = fd;
    pbin[pi] = fb;
    for (let i = 0; i < npts; i++) {
      if (!elive[i] || ebin[i] !== fb) continue;
      const x = ex[i]!;
      const y = ey[i]!;
      const z = ez[i]!;
      if (x >= fx && x < fx + fw && y >= fy && y < fy + fh && z >= fz && z < fz + fd) {
        elive[i] = 0;
        seen.delete(keyOf(x, y, z, fb));
      }
    }
    addPt(fx + fw, fy, fz, fb);
    addPt(fx, fy + fh, fz, fb);
    addPt(fx, fy, fz + fd, fb);
    poses[oi] = { id: item.id, x: fx, y: fy, z: fz, w: fw, h: fh, d: fd, bin: fb };
  }
  return poses;
}

export function packDepth(
  items: { id: string; x: number; w: number; y: number }[],
  depth: number,
): Map<string, number> {
  const out = new Map<string, number>();
  const wasm = pack3dWasm();
  if (wasm && items.length > 0 && items.length <= wasm.max_n()) {
    const mem = f32(wasm.memory);
    const ip = wasm.items_ptr() >> 2;
    for (let i = 0; i < items.length; i++) {
      const it = items[i]!;
      mem[ip + i * 3] = it.x;
      mem[ip + i * 3 + 1] = it.w;
      mem[ip + i * 3 + 2] = it.y;
    }
    wasm.pack_depth(items.length, depth);
    const op = wasm.out_ptr() >> 2;
    for (let i = 0; i < items.length; i++) out.set(items[i]!.id, mem[op + i]!);
    return out;
  }
  const placed: { x: number; w: number; y: number; z: number }[] = [];
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id));
  for (const it of sorted) {
    let z = 0;
    for (; z < depth; z++) {
      const hit = placed.some((p) => p.y === it.y && p.z === z && it.x < p.x + p.w && p.x < it.x + it.w);
      if (!hit) break;
    }
    if (z >= depth) z = 0;
    placed.push({ x: it.x, w: it.w, y: it.y, z });
    out.set(it.id, z);
  }
  return out;
}
