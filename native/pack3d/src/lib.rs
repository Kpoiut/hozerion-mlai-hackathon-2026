//! Extreme-point FFD in a fixed SoA pool. No heap, no unbounded EP growth.

#![no_std]

use core::panic::PanicInfo;

#[panic_handler]
fn panic(_: &PanicInfo) -> ! {
    loop {}
}

const MAX_N: usize = 256;
const MAX_PTS: usize = 1024;
const MAX_BINS: usize = 32;
const HASH: usize = 2048;
const EMPTY: u16 = 0xFFFF;
const TOMB: u16 = 0xFFFE;
const EPS: f32 = 1e-4;

static mut ITEMS: [f32; MAX_N * 3] = [0.0; MAX_N * 3];
static mut OUT: [f32; MAX_N * 7] = [0.0; MAX_N * 7];

static mut PX: [f32; MAX_N] = [0.0; MAX_N];
static mut PY: [f32; MAX_N] = [0.0; MAX_N];
static mut PZ: [f32; MAX_N] = [0.0; MAX_N];
static mut PW: [f32; MAX_N] = [0.0; MAX_N];
static mut PH: [f32; MAX_N] = [0.0; MAX_N];
static mut PD: [f32; MAX_N] = [0.0; MAX_N];
static mut PBIN: [u16; MAX_N] = [0; MAX_N];
static mut PNEXT: [i16; MAX_N] = [-1; MAX_N];
static mut BIN_HEAD: [i16; MAX_BINS] = [-1; MAX_BINS];
static mut NPLACED: usize = 0;

static mut EX: [f32; MAX_PTS] = [0.0; MAX_PTS];
static mut EY: [f32; MAX_PTS] = [0.0; MAX_PTS];
static mut EZ: [f32; MAX_PTS] = [0.0; MAX_PTS];
static mut EBIN: [u16; MAX_PTS] = [0; MAX_PTS];
static mut ELIVE: [u8; MAX_PTS] = [0; MAX_PTS];
static mut NPTS: usize = 0;
static mut NLIVE: usize = 0;

static mut HKEY: [u64; HASH] = [0; HASH];
static mut HSLOT: [u16; HASH] = [EMPTY; HASH];
static mut EP_LIVE: u32 = 0;

#[no_mangle]
pub extern "C" fn items_ptr() -> *mut f32 {
    unsafe { ITEMS.as_mut_ptr() }
}

#[no_mangle]
pub extern "C" fn out_ptr() -> *mut f32 {
    unsafe { OUT.as_mut_ptr() }
}

#[no_mangle]
pub extern "C" fn max_n() -> u32 {
    MAX_N as u32
}

#[no_mangle]
pub extern "C" fn ep_live() -> u32 {
    unsafe { EP_LIVE }
}

fn mix(x: f32, y: f32, z: f32, bin: u16) -> u64 {
    let mut k = x.to_bits() as u64;
    k = k.wrapping_mul(0x9E3779B97F4A7C15).wrapping_add(y.to_bits() as u64);
    k = k.wrapping_mul(0x9E3779B97F4A7C15).wrapping_add(z.to_bits() as u64);
    k ^ ((bin as u64) << 48)
}

fn hash_find(key: u64) -> Option<usize> {
    unsafe {
        let mut i = (key as usize) & (HASH - 1);
        for _ in 0..HASH {
            let s = HSLOT[i];
            if s == EMPTY {
                return None;
            }
            if s != TOMB && HKEY[i] == key {
                return Some(i);
            }
            i = (i + 1) & (HASH - 1);
        }
        None
    }
}

fn hash_insert(key: u64, idx: u16) {
    unsafe {
        let mut i = (key as usize) & (HASH - 1);
        let mut tomb = None;
        for _ in 0..HASH {
            let s = HSLOT[i];
            if s == EMPTY {
                let slot = tomb.unwrap_or(i);
                HKEY[slot] = key;
                HSLOT[slot] = idx;
                return;
            }
            if s == TOMB && tomb.is_none() {
                tomb = Some(i);
            }
            i = (i + 1) & (HASH - 1);
        }
        if let Some(slot) = tomb {
            HKEY[slot] = key;
            HSLOT[slot] = idx;
        }
    }
}

fn hash_remove(key: u64) {
    if let Some(i) = hash_find(key) {
        unsafe {
            HSLOT[i] = TOMB;
        }
    }
}

fn reset() {
    unsafe {
        NPLACED = 0;
        NPTS = 0;
        NLIVE = 0;
        EP_LIVE = 0;
        for i in 0..MAX_BINS {
            BIN_HEAD[i] = -1;
        }
        for i in 0..HASH {
            HSLOT[i] = EMPTY;
        }
    }
}

fn compact_points() {
    unsafe {
        let mut w = 0;
        for r in 0..NPTS {
            if ELIVE[r] == 0 {
                continue;
            }
            if w != r {
                EX[w] = EX[r];
                EY[w] = EY[r];
                EZ[w] = EZ[r];
                EBIN[w] = EBIN[r];
                ELIVE[w] = 1;
            }
            w += 1;
        }
        NPTS = w;
        NLIVE = w;
        for i in 0..HASH {
            HSLOT[i] = EMPTY;
        }
        for i in 0..NPTS {
            hash_insert(mix(EX[i], EY[i], EZ[i], EBIN[i]), i as u16);
        }
    }
}

fn add_point(x: f32, y: f32, z: f32, bin: u16, bw: f32, bh: f32, bd: f32) {
    if x < -EPS || y < -EPS || z < -EPS || x > bw + EPS || y > bh + EPS || z > bd + EPS {
        return;
    }
    let key = mix(x, y, z, bin);
    if hash_find(key).is_some() {
        return;
    }
    unsafe {
        if NPTS >= MAX_PTS {
            if NLIVE * 4 < NPTS * 3 {
                compact_points();
            }
            if NPTS >= MAX_PTS {
                return;
            }
        }
        let i = NPTS;
        EX[i] = x;
        EY[i] = y;
        EZ[i] = z;
        EBIN[i] = bin;
        ELIVE[i] = 1;
        NPTS += 1;
        NLIVE += 1;
        EP_LIVE = NLIVE as u32;
        hash_insert(key, i as u16);
    }
}

fn kill_inside(x: f32, y: f32, z: f32, w: f32, h: f32, d: f32, bin: u16) {
    unsafe {
        for i in 0..NPTS {
            if ELIVE[i] == 0 || EBIN[i] != bin {
                continue;
            }
            let px = EX[i];
            let py = EY[i];
            let pz = EZ[i];
            if px >= x && px < x + w && py >= y && py < y + h && pz >= z && pz < z + d {
                ELIVE[i] = 0;
                NLIVE -= 1;
                hash_remove(mix(px, py, pz, bin));
            }
        }
        EP_LIVE = NLIVE as u32;
    }
}

fn fits(x: f32, y: f32, z: f32, w: f32, h: f32, d: f32, bw: f32, bh: f32, bd: f32) -> bool {
    x >= -EPS && y >= -EPS && z >= -EPS && x + w <= bw + EPS && y + h <= bh + EPS && z + d <= bd + EPS
}

fn collides(x: f32, y: f32, z: f32, w: f32, h: f32, d: f32, bin: u16) -> bool {
    unsafe {
        let mut i = BIN_HEAD[bin as usize];
        while i >= 0 {
            let u = i as usize;
            if x < PX[u] + PW[u]
                && PX[u] < x + w
                && y < PY[u] + PH[u]
                && PY[u] < y + h
                && z < PZ[u] + PD[u]
                && PZ[u] < z + d
            {
                return true;
            }
            i = PNEXT[u];
        }
        false
    }
}

fn orients(w: f32, h: f32, d: f32, rotate: bool, out: &mut [(f32, f32, f32); 6]) -> usize {
    if !rotate {
        out[0] = (w, h, d);
        return 1;
    }
    let dims = [w, h, d];
    const PERM: [[usize; 3]; 6] = [
        [0, 1, 2],
        [0, 2, 1],
        [1, 0, 2],
        [1, 2, 0],
        [2, 0, 1],
        [2, 1, 0],
    ];
    let mut n = 0;
    for p in PERM {
        let t = (dims[p[0]], dims[p[1]], dims[p[2]]);
        let mut dup = false;
        for i in 0..n {
            if out[i] == t {
                dup = true;
                break;
            }
        }
        if !dup {
            out[n] = t;
            n += 1;
        }
    }
    n
}

fn place(x: f32, y: f32, z: f32, w: f32, h: f32, d: f32, bin: u16) -> usize {
    unsafe {
        let i = NPLACED;
        PX[i] = x;
        PY[i] = y;
        PZ[i] = z;
        PW[i] = w;
        PH[i] = h;
        PD[i] = d;
        PBIN[i] = bin;
        PNEXT[i] = BIN_HEAD[bin as usize];
        BIN_HEAD[bin as usize] = i as i16;
        NPLACED += 1;
        i
    }
}

fn try_orient(
    ow: f32,
    oh: f32,
    od: f32,
    x: f32,
    y: f32,
    z: f32,
    bin: u16,
    bw: f32,
    bh: f32,
    bd: f32,
) -> bool {
    fits(x, y, z, ow, oh, od, bw, bh, bd) && !collides(x, y, z, ow, oh, od, bin)
}

/// Pack n items already in FFD order. Items at items_ptr as (w,h,d)*n.
/// Writes (x,y,z,w,h,d,bin)*n to out_ptr. Returns n packed.
#[no_mangle]
pub extern "C" fn pack_ep(n: u32, bw: f32, bh: f32, bd: f32, rotate: u32) -> u32 {
    let n = n as usize;
    if n == 0 || n > MAX_N {
        return 0;
    }
    reset();
    add_point(0.0, 0.0, 0.0, 0, bw, bh, bd);
    let mut bins: u16 = 1;
    let mut orients_buf = [(0.0f32, 0.0f32, 0.0f32); 6];
    unsafe {
        for k in 0..n {
            let w = ITEMS[k * 3];
            let h = ITEMS[k * 3 + 1];
            let d = ITEMS[k * 3 + 2];
            let on = orients(w, h, d, rotate != 0, &mut orients_buf);
            let mut found = false;
            let mut fx = 0.0;
            let mut fy = 0.0;
            let mut fz = 0.0;
            let mut fw = w;
            let mut fh = h;
            let mut fd = d;
            let mut fbin: u16 = 0;

            for b in 0..bins {
                let mut pick = usize::MAX;
                let mut pow = w;
                let mut poh = h;
                let mut pod = d;
                for i in 0..NPTS {
                    if ELIVE[i] == 0 || EBIN[i] != b {
                        continue;
                    }
                    if pick != usize::MAX
                        && !(EZ[i] < EZ[pick]
                            || (EZ[i] == EZ[pick] && EY[i] < EY[pick])
                            || (EZ[i] == EZ[pick] && EY[i] == EY[pick] && EX[i] < EX[pick]))
                    {
                        continue;
                    }
                    for t in 0..on {
                        let (ow, oh, od) = orients_buf[t];
                        if try_orient(ow, oh, od, EX[i], EY[i], EZ[i], b, bw, bh, bd) {
                            pick = i;
                            pow = ow;
                            poh = oh;
                            pod = od;
                            break;
                        }
                    }
                }
                if pick != usize::MAX {
                    fx = EX[pick];
                    fy = EY[pick];
                    fz = EZ[pick];
                    fw = pow;
                    fh = poh;
                    fd = pod;
                    fbin = b;
                    found = true;
                    break;
                }
            }

            if !found {
                if (bins as usize) < MAX_BINS {
                    fbin = bins;
                    bins += 1;
                    add_point(0.0, 0.0, 0.0, fbin, bw, bh, bd);
                    let mut put = false;
                    for t in 0..on {
                        let (ow, oh, od) = orients_buf[t];
                        if try_orient(ow, oh, od, 0.0, 0.0, 0.0, fbin, bw, bh, bd) {
                            fx = 0.0;
                            fy = 0.0;
                            fz = 0.0;
                            fw = ow;
                            fh = oh;
                            fd = od;
                            put = true;
                            break;
                        }
                    }
                    if !put {
                        fx = 0.0;
                        fy = 0.0;
                        fz = 0.0;
                        fw = w;
                        fh = h;
                        fd = d;
                    }
                } else {
                    fx = 0.0;
                    fy = 0.0;
                    fz = 0.0;
                    fw = w;
                    fh = h;
                    fd = d;
                    fbin = 0;
                }
            }

            place(fx, fy, fz, fw, fh, fd, fbin);
            kill_inside(fx, fy, fz, fw, fh, fd, fbin);
            add_point(fx + fw, fy, fz, fbin, bw, bh, bd);
            add_point(fx, fy + fh, fz, fbin, bw, bh, bd);
            add_point(fx, fy, fz + fd, fbin, bw, bh, bd);

            let o = k * 7;
            OUT[o] = fx;
            OUT[o + 1] = fy;
            OUT[o + 2] = fz;
            OUT[o + 3] = fw;
            OUT[o + 4] = fh;
            OUT[o + 5] = fd;
            OUT[o + 6] = fbin as f32;
        }
    }
    n as u32
}

/// items as (x,w,y)*n, writes z into out[0..n).
#[no_mangle]
pub extern "C" fn pack_depth(n: u32, depth: u32) -> u32 {
    let n = n as usize;
    if n == 0 || n > MAX_N {
        return 0;
    }
    let depth = depth as i32;
    unsafe {
        // insertion sort by (y, x)
        let mut idx = [0u16; MAX_N];
        for i in 0..n {
            idx[i] = i as u16;
        }
        for i in 1..n {
            let mut j = i;
            while j > 0 {
                let a = idx[j] as usize;
                let b = idx[j - 1] as usize;
                let ay = ITEMS[a * 3 + 2];
                let by = ITEMS[b * 3 + 2];
                let ax = ITEMS[a * 3];
                let bx = ITEMS[b * 3];
                if ay < by || (ay == by && ax < bx) {
                    idx.swap(j, j - 1);
                    j -= 1;
                } else {
                    break;
                }
            }
        }
        let mut zx = [0.0f32; MAX_N];
        let mut zw = [0.0f32; MAX_N];
        let mut zy = [0.0f32; MAX_N];
        let mut zz = [0i32; MAX_N];
        let mut m = 0usize;
        for k in 0..n {
            let i = idx[k] as usize;
            let x = ITEMS[i * 3];
            let w = ITEMS[i * 3 + 1];
            let y = ITEMS[i * 3 + 2];
            let mut z = 0i32;
            while z < depth {
                let mut hit = false;
                for p in 0..m {
                    if zy[p] == y && zz[p] == z && x < zx[p] + zw[p] && zx[p] < x + w {
                        hit = true;
                        break;
                    }
                }
                if !hit {
                    break;
                }
                z += 1;
            }
            if z >= depth {
                z = 0;
            }
            zx[m] = x;
            zw[m] = w;
            zy[m] = y;
            zz[m] = z;
            m += 1;
            OUT[i] = z as f32;
        }
    }
    n as u32
}
