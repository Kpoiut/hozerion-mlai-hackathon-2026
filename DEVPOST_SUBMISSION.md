# Hozerion — Hướng Dẫn Điền Form Nộp Bài Devpost (MLAI Hackathon 2026)

## 1. Trang `Project overview` -> `General info`

### `* Project name` *(Tối đa 60 ký tự — 52/60 ký tự)*
```text
Hozerion: Neuro-Symbolic Logistics Exception Sidecar
```

### `* Elevator pitch` *(Tối đa 200 ký tự — 198/200 ký tự)*
```text
Zero-churn Neuro-Symbolic AI sidecar for ports, ICDs & warehouses: 5 agents + Go 5.15µs/Rust WASM solver recover late vessels & 8 vehicle modes with k=0 displacement, saving $29.7M across 3,092 calls.
```

### `Edit thumbnail` *(Ảnh đại diện dự án < 5 MB)*
Chọn 1 trong các file ảnh sắc nét đã xuất sẵn tại thư mục `D:\mlaihackathon\screenshots\`:
- **Khuyên dùng số 1 (Giao diện Bảng Điều Độ Gantt Đa Phương Tiện + 3D Inspector)**: `D:\mlaihackathon\screenshots\mlai-top1-icd-demo.png` (`774 KB`)
- **Khuyên dùng số 2 (Blueprint Tổng Thể 6 Màn Hình)**: `D:\mlaihackathon\screenshots\01-design-system-visual-blueprint.png` (`1.67 MB`)
- **Khuyên dùng số 3 (Tổng Quan Kiến Trúc & 8 Hệ Phương Tiện 3D)**: `D:\mlaihackathon\screenshots\mlai-top1-overview.png` (`1.76 MB`)

---

## 2. Trang `Project details` -> `* About the project` *(Copy nguyên khối Markdown bên dưới dán vào ô)*

```markdown
## Inspiration

Maritime container terminals and multi-modal logistics hubs in Vietnam (**Tân Cảng Cát Lái** running `TOPX/TOPOVN/ePort`, **Cảng Tân Thuận & Hiệp Phước** running `CATOS / SGP-TOS`, **SP-ITC** running `VTOS`, and **Cái Mép** running `Navis N4`) as well as global distribution centers (`SAP EWM`, `Blue Yonder`, `FourKites`, `C3`) have already invested millions of dollars in their host Terminal Operating Systems (TOS) and Warehouse Management Systems (WMS).

Yet every day, when a container vessel, inland river barge, intermodal freight train, air cargo ULD feeder, or `-25°C` reefer truck arrives late due to noisy VHF Ch.16 radio updates, driver Zalo/SMS messages, or VETC highway congestion, operations teams face **three unsolved challenges**:
1. **The Re-Optimization Domino Effect (\(k > 0\))**: Global MILP re-optimizers reshuffle dozens of already-booked vessels and trucks across quay cranes, yard RTGs, and customs gates—creating operational chaos that human dispatchers immediately reject.
2. **Pure LLM Hallucination on Physical Constraints**: Standard LLMs cannot guarantee physical berth draft limits, contiguous quay meters, STS crane non-crossing rail constraints, or `-25°C` cold-chain thermal cut-offs.
3. **No Enterprise Will Rip-and-Replace Its Host TOS**: Logistics operators need a **non-invasive sidecar plugin** that keeps **100% of existing appointments intact (\(k = 0\) displaced other vehicles)** and writes back minimal, auditable patches.

---

## What it does

**Hozerion** is a **Universal Neuro-Symbolic Organizational AI Sidecar** for multi-modal port, ICD, rail, air-cargo, cold-chain, and warehouse exception recovery.

![Hozerion Multi-Modal Schedule Board](https://hozerion.zazeroks.com/assets/logistics/02-tan-thuan-icd-visual-dispatch.png)

### 1. Track 02 (VNG): 5-Agent Organizational AI, Escalation Referee, HITL & SHA-256 Audit Log
- **Agent 1 — Multimodal Unstructured Signal Intake (`Whole Workflow`)**: Parses noisy Vietnamese/English VHF Ch.16 radio transcripts, driver Zalo/SMS messages, AIS vessel telemetry, and VETC e-tag gate feeds into structured arrival delay probes.
- **Agent 2 — Conformal ML ETA & Congestion Quantile Forecaster**: Computes calibrated conformal prediction intervals \([Q_{10}, Q_{50}, Q_{90}]\), epistemic uncertainty \(\sigma\), and confidence score \(C \in [0, 100\%]\) across port approaches and highway corridors.
- **Agent 3 — Neuro-Symbolic Lexicographic MinMove & BACAP Solver (`0% Hallucination`)**: Solves an exact lexicographic objective:
$$\min \big( k,\; \text{Wait}(j^*),\; \text{CraneConflict}(j^*) \big)$$
prioritizing **\(k = 0\) displaced other vehicles** across **8 multi-modal logistics vehicle & equipment systems** (*Deep-Sea Container Ships, Inland Waterways Barges, Intermodal Freight Trains, Boeing 777F Air Cargo Freighters, `-25°C` Reefer Semi-Trucks, Autonomous AGVs & Reach Stackers, STS/RTG Quay Cranes, and Last-Mile EV Vans & Cargo Drones*).
- **Agent 4 — `Escalation Referee` & 5 Safety Guardrails (`G1`–`G5`)**:
  - `G1_ZERO_DISPLACEMENT`: Guarantees \(k = 0\) cascade displacement.
  - `G2_CONFORMAL_ROBUSTNESS`: Verifies zero berth/door collision at both \(Q_{50}\) and the conservative \(Q_{90}\) arrival bound.
  - `G3_ECONOMIC_THRESHOLD`: Requires net demurrage/SLA savings \(\ge \$1,500\text{ USD}\) before touching the host TOS.
  - `G4_TRANSSHIPMENT_SLA`: Protects mother-vessel cut-offs and `-25°C` reefer power plug availability.
  - `G5_CONFIDENCE_FLOOR`: Enforces calibrated confidence \(\ge 85.0\%\).
  - **3-Tier Referee Routing**:
    - `TIER_0_AUTONOMOUS_NO_OP` (**83.02%** of 3,092 real calls): Host TOS schedule remains optimal — zero system churn.
    - `TIER_1_AUTONOMOUS_COMMIT_K0`: All 5 guardrails pass — commits a minimal `RFC 7396 JSON Merge Patch` with \(k = 0\).
    - `TIER_2_HITL_ESCALATION_REFEREE`: Any guardrail violation pauses autonomous write-back and escalates to the **Human-in-the-Loop (HITL) Duty Chief Console** (`Approve & Sign`, `Supervisor Override`, or `Reject & Rollback`).
- **Agent 5 — Cross-TOS Protocol Translator & Tamper-Evident `SHA-256 Audit Log`**: Emits `UN/EDIFACT BERMAN/COPARN`, `DCSA v3.0 JSON`, `Navis N4 SNX XML`, `SGP-TOS JSON`, and `TOPOVN SQL`, anchored by a hash-chained **SHA-256 cryptographic audit log**.

![5 AI Agents & HCMC Smart Port Map](https://hozerion.zazeroks.com/assets/logistics/05-ai-agents-hcmc-port-map.png)

### 2. Track 01 (TASCO / Goong): Vietnam Smart Port & VETC Corridor Map
- Live geospatial command map linking **Tân Cảng Cát Lái**, **Cảng Tân Thuận**, **Cụm Cảng Hiệp Phước**, **SP-ITC Phú Hữu**, **Cụm ICD Trường Thọ (VETC Xa Lộ Hà Nội & Vành Đai 2)**, and **Cái Mép – Thị Vải**, tracking real-time VETC e-tag flow (`xe/h`), gate wait times, and automated \(k=0\) barge/feeder diversions.

### 3. Track 03 (TMA): Bilingual Vietnamese/English Decision Co-Pilot & Self-Setup 3D Studio
- Interactive **Gantt Schedule Board** with per-slot multi-modal vehicle icons/badges, a **3-Tab Dynamic Inspector** (`Chi tiết`, `8 Phương tiện`, `Nhật ký`), and a **Self-Setup 3D Facility Studio** allowing any port, ICD, cold-storage hub, or warehouse to configure custom doors, berths, reefer plugs, and SLA rules in seconds.

![Self-Setup 3D Facility Studio](https://hozerion.zazeroks.com/assets/logistics/04-self-setup-3d-facility-studio.png)

---

## How we built it

1. **4-Tier Multi-Language Solver Architecture**:
   - **Tier 1 — Baseline JS Heap Reference**: Standard object-graph schedule representation (`8,546.29 ms` across 3,092 calls).
   - **Tier 2 — TypeScript V8 Zero-Allocation `Int32Array` Kernel**: Bitset & flat typed-array interval engine running directly in the browser UI (**`14.8×` speedup**, `579.22 ms` total, `187.33 µs/call`).
   - **Tier 3 — Rust `#![no_std]` WebAssembly (`wasm32-unknown-unknown`)**: Zero-heap-allocation 3D ULD/container bin-packing and Monte Carlo robustness kernel (**`51.8×` speedup**, `165.00 ms` total, `53.36 µs/call`).
   - **Tier 4 — Go 1.26.5 Native 16-Core Sidecar Daemon (`0 B/op`)**: Lock-free worker pool for on-premise TOS deployment (**`536.2×` speedup**, `15.94 ms` for all 3,092 calls, **`5.15 µs/call`**).
2. **QuotaMesh Origin-Locked AI Agent Gateway**:
   - Connected to a multi-provider QuotaMesh AI Gateway (`OpenAI / Anthropic / Gemini` OpenAI-compatible router) protected by a **4-layer cryptographic Origin-Bound Token Guard (`qmb_web_<originHash>_<windowBucket>_<hmac>`)**. Even if an attacker extracts the token from DevTools, replaying it from any unauthorized domain, CLI, or Postman is immediately blocked with `403 BLOCKED_FOREIGN_ORIGIN` / `401 BLOCKED_RAW_KEY_EXTRACTION`.
3. **Frontend & Edge Stack**:
   - Built with **React 19**, **TanStack Start / Router**, **Tailwind CSS v4**, **Zustand**, and deployed globally on **Cloudflare Workers (`hozerion.zazeroks.com`)**.

![Universal Sidecar & 536x Benchmark](https://hozerion.zazeroks.com/assets/logistics/06-universal-sidecar-visual-benchmark.png)

---

## Challenges we ran into

- **Preventing Schedule Churn on Real Port Data**: On the 98-week **Port of Barcelona empirical corpus (3,092 vessel calls across terminals 24B & 36A)**, naive optimization mutated schedules even when the host berth was already optimal. We solved this by introducing the **`Escalation Referee` no-op invariant**, ensuring **83.02% (`2,567 / 3,092`)** of calls emit a zero-churn `NO_OP_KEEP_HOST_PLAN` while the remaining **16.98% (`525 / 3,092`)** execute verified \(k=0\) recoveries.
- **High-Density Visual Legibility Across 8 Transport Modes**: Representing ships, barges, freight trains, cargo aircraft, reefer trucks, AGVs, STS/RTG cranes, and EV vans on a minute-level Gantt board without visual clutter required designing a 2-row visual card system with color-coded mode glyphs, equipment capability badges on every door (`Xe nâng`, `Lạnh -25°C`, `Cẩu 45T`), and real-time bidirectional synchronization with the 3D Inspector.
- **Securing Browser-Triggered AI Agents**: Preventing API key theft on a public hackathon demo required building an origin-bound rolling HMAC attestation protocol between the web client and our QuotaMesh gateway.

---

## Accomplishments that we're proud of

- **Proven on 3,092 Real Vessel Calls (`+$29,701,500 USD` Verified Value)**: Rescued **19,801 ship-hours** of waiting across 98 real port weeks with **\(k = 0\) other vessels displaced**.
- **`5.15 µs` Per Call in Go 1.26.5 (`536.2×` Speedup) & `53.36 µs` in `#![no_std]` Rust WASM**: Real, reproducible multi-language systems engineering backed by **177 automated unit, corpus, security, and Playwright E2E tests**.
- **Zero Hardcoded UI State**: Every KPI card, Gantt block, vehicle mode switch, custom vehicle injection, and Self-Setup Studio door mutation dynamically recomputes through the live solver and updates the UI in under `1 ms`.

---

## What we learned

- **Disciplined FFI Engineering**: While rewriting our combinatorial solver in Go (`536.2×`) and `#![no_std]` Rust WASM (`51.8×`) delivered massive gains, benchmarking string-heavy UN/EDIFACT XML customs parsing across WASM FFI proved `0.78×` slower due to UTF-8 boundary copying—teaching us to keep string reconciliation in V8 and reserve native/WASM kernels strictly for numeric combinatorial hot loops.
- **Human-in-the-Loop Trust Requires Counterfactual Transparency**: Dispatchers adopt AI recommendations much faster when shown the exact counterfactual diff (*Stay Booked: 73m wait* vs. *Sidecar Plan: 33m wait on Door D6, \(k=0\)*) alongside an explicit `RFC 7396` patch.

---

## What's next for Hozerion

- **Live Pilot Connectors for Vietnam Port Ecosystem**: Expanding pre-built sidecar adapters for `ePort Cát Lái`, `SGP-TOS Hiệp Phước`, and `VNACCS/VCIS e-EIR` customs clearance gates.
- **Federated Multi-Terminal Barge & ICD Balancing**: Scaling the \(k=0\) coordination layer across the entire **Saigon River – Soài Rạp – Cái Mép** corridor to dynamically balance container barge queues before vessels reach congested city gates.
```

---

## 3. Trang `Project details` -> `* Built with` & `"Try it out" links`

### `* Built with` *(Copy từng từ khóa bên dưới gõ vào ô Tags — tối đa 25 tags)*
1. `typescript`
2. `react`
3. `go`
4. `rust`
5. `webassembly`
6. `cloudflare-workers`
7. `tailwindcss`
8. `tanstack-start`
9. `vite`
10. `zustand`
11. `nodejs`
12. `playwright`
13. `quotamesh`
14. `openai`
15. `anthropic`
16. `gemini`
17. `neuro-symbolic-ai`
18. `multi-agent-systems`
19. `conformal-prediction`
20. `combinatorial-optimization`
21. `operations-research`
22. `human-in-the-loop`
23. `edifact`
24. `dcsa`
25. `sha-256`

### `"Try it out" links` *(Bấm `ADD ANOTHER LINK` để thêm đủ 3 link đầy đủ)*

- **Link 1 (Website chính thức trên Cloudflare — Custom Domain đầy đủ)**:
  ```text
  https://hozerion.zazeroks.com
  ```
- **Link 2 (Link Cloudflare Workers dự phòng đầy đủ)**:
  ```text
  https://app-builder-workspace.phatbmt4444.workers.dev
  ```
- **Link 3 (Link GitHub Repository mã nguồn mở đầy đủ)**:
  ```text
  https://github.com/Kpoiut/hozerion-mlai-hackathon-2026
  ```
