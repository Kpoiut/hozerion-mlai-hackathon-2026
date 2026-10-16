# Hozerion — Universal Neuro-Symbolic Organizational AI Sidecar for Port & Logistics Exception Recovery

> **MLAI Hackathon 2026 Official Submission (`https://mlai-hackathon.devpost.com/`)**
> - **Primary Track — Track 02 (VNG): *A.I Làm Việc Thực Tế — Organizational Challenge*** (*Covers all 3 Sub-Branches: `Escalation Referee`, `Whole Workflow`, and `Coordination Layer` + Mandatory `Human-in-the-Loop` & `Transparent SHA-256 Audit Log`*)
> - **Cross-Track Synergy — Track 01 (TASCO / Goong):** *Ứng dụng Bản đồ thông minh (HCMC – Saigon River – Soài Rạp – Cái Mép & VETC E-Tag Highway Corridor Map)*
> - **Cross-Track Synergy — Track 03 (TMA):** *Ứng dụng AI hỗ trợ ra quyết định cho người Việt (Bilingual Vietnamese/English Executive Decision Co-Pilot)*

---

## 1. Inspiration & Real-World Enterprise Problem

Container terminals and logistics hubs in Vietnam (**Tân Cảng Cát Lái** running `TOPX/TOPOVN/ePort`, **Cảng Tân Thuận & Hiệp Phước** running `CATOS -> SGP-TOS`, **SP-ITC** running `VTOS`, and **Cái Mép** running `Navis N4`) and global warehouses (`SAP EWM`, `Blue Yonder`, `FourKites`, `C3`) have already invested millions of dollars in host Terminal Operating Systems (TOS) and Yard Management Systems (YMS).

However, **three critical operational gaps remain unsolved**:
1. **No enterprise will rip-and-replace a multi-million-dollar TOS**, yet when a vessel or truck arrives late via noisy VHF radio, Zalo message, or VETC highway congestion, re-optimizing the whole schedule causes a **domino cascade (`k > 0`)** across quay cranes, yard RTG blocks, and customs gates.
2. **Pure LLMs hallucinate physical constraints** (berth draft, contiguous quay meters, STS crane non-crossing rails, cold-chain thermal limits) and lack calibrated uncertainty bounds or safety guardrails.
3. **Inter-port & customs silos in HCMC**: Each terminal runs a different TOS vendor without a shared `DCSA v3.0 / UN/EDIFACT BERMAN / VNACCS e-EIR` coordination layer or tamper-evident audit trail.

---

## 2. What It Does — Universal Non-Invasive Sidecar + 5-Agent Organizational AI

**Hozerion** plugs into any existing Seaport TOS, Inland Waterway Barge ICD, Warehouse Dock WMS, or `-25°C` Cold-Chain Hub as a **Zero-Lock-In Sidecar Plugin**:

### A. Track 02 (VNG): Organizational AI — 5-Agent Coordination Layer, Escalation Referee, HITL & SHA-256 Audit Log
1. **Agent 1 — Multimodal Unstructured Signal Intake Agent (`Whole Workflow`)**: Parses noisy Vietnamese/English VHF Ch.16 radio transcripts, driver Zalo/SMS notes, AIS telemetry, and VETC e-tag gate feeds into structured delay events.
2. **Agent 2 — Conformal ML ETA & Congestion Quantile Forecaster**: Computes calibrated conformal prediction intervals $[Q_{10}, Q_{50}, Q_{90}]$, epistemic uncertainty $\sigma$, and confidence score $C \in [0, 100\%]$ from port congestion density, tide windows, and VETC corridor flow.
3. **Agent 3 — Neuro-Symbolic Lexicographic MinMove & BACAP Solver (`0% Hallucination`)**: Executes an exact lexicographic combinatorial kernel ($\min (k, \text{Wait}, \text{CraneConflict})$) that prioritizes **$k = 0$ displaced other vessels/trucks** and verifies schedule robustness at both $Q_{50}$ and the conservative $Q_{90}$ conformal bound.
4. **Agent 4 — `Escalation Referee` & 5 Safety Guardrails (`G1`–`G5`)**:
   - **`G1_ZERO_DISPLACEMENT`**: Guarantees $k = 0$ cascade displacement.
   - **`G2_CONFORMAL_ROBUSTNESS`**: Ensures zero berth/door collision even at the $Q_{90}$ arrival bound.
   - **`G3_ECONOMIC_THRESHOLD`**: Requires net savings $\ge \$1,500\text{ USD}$ to prevent unnecessary TOS churn.
   - **`G4_TRANSSHIPMENT_SLA`**: Protects feeder-to-mother-vessel cut-offs and `-25°C` cold-chain SLAs.
   - **`G5_CONFIDENCE_FLOOR`**: Requires ML confidence $\ge 85.0\%$.
   - **3-Tier Referee Routing**:
     - `TIER_0_AUTONOMOUS_NO_OP` (**83.02%** of 3,092 real calls): Host TOS plan is already optimal — emits zero-touch heartbeat without disturbing human operators.
     - `TIER_1_AUTONOMOUS_COMMIT_K0`: All 5 guardrails pass — emits minimal `RFC 7396 JSON Merge Patch` (`k = 0`).
     - `TIER_2_HITL_ESCALATION_REFEREE`: Any guardrail violation immediately pauses autonomous write-back and triggers the **Human-in-the-Loop (HITL) Duty Chief Console** (`Approve & Sign`, `Supervisor Override`, or `Reject & Rollback`).
5. **Agent 5 — Cross-TOS Protocol Translator & Immutable `SHA-256 Audit Log`**: Emits `UN/EDIFACT BERMAN/COPARN`, `DCSA v3.0 JSON`, `Navis N4 SNX XML`, `SGP-TOS JSON`, `TOPOVN SQL`, and appends a tamper-evident **SHA-256 hash-chained audit block**.

### B. Track 01 (TASCO / Goong): Vietnam Smart Port & VETC Mobility Corridor Map
- Interactive geospatial command map connecting **Tân Cảng Cát Lái**, **Cảng Tân Thuận**, **Cụm Cảng Hiệp Phước**, **SP-ITC Phú Hữu**, **Cụm ICD Trường Thọ (Trạm VETC Xa Lộ Hà Nội & Vành Đai 2)**, and **Cái Mép – Thị Vải** with real-time VETC e-tag flow (`xe/giờ`), queue wait telemetry, and automated `k=0` barge/feeder diversion routes along the Saigon & Soài Rạp rivers.

### C. Track 03 (TMA): AI Decision Co-Pilot for Vietnamese Dispatchers
- Generates clear, actionable Vietnamese natural-language decision briefs with side-by-side **Before (`Stay Booked`) vs. After (`Sidecar Plan k=0`)** comparisons and counterfactual ROI in USD.

---

## 3. Empirical Validation & Multi-Language Kernel Benchmark (No Vaporware Numbers)

### Empirical P&L Proof across 98 Real Barcelona Port Weeks (3,092 Vessel Calls)
- **Total Arrival Probes Audited**: `3,092` real vessel calls across terminals `24B` and `36A` (Santini 2024 corpus).
- **Zero-Touch `NO_OP` Rate**: `2,567 / 3,092` calls (**83.02%**) — Sidecar leaves the host TOS 100% untouched.
- **High-Value `k=0` Recovery Rate**: `525 / 3,092` calls (**16.98%**) — Rescues **`19,801` ship-hours of waiting** (**`+$29,701,500 USD`** at `$1,500/hr` charter + demurrage cost) while displacing **`k = 0` other vessels**.

### 4-Tier Language Optimization Benchmark (3,092 Calls × 100 Iterations = 309,200 Solves)
| Kernel Tier | Language & Architecture | Total Time (3,092 Calls) | Latency / Call | Speedup | Engineering Verdict |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Tier 1 (Baseline)** | JS/TS Object Heap (`Map/Set` allocations) | `8,546.29 ms` | `2,764.00 µs` | `1.0×` | Baseline reference |
| **Tier 2 (Browser Live)** | TypeScript V8 Zero-Allocation `Int32Array` | `579.22 ms` | `187.33 µs` | **`14.8×`** | **Deployed in Browser UI** |
| **Tier 3 (Web Worker)** | Rust `#![no_std]` WebAssembly (`wasm32-unknown-unknown`) | `165.00 ms` | `53.36 µs` | **`51.8×`** | **Deployed for 3D Bin Packing & Monte Carlo** |
| **Tier 4 (Edge Daemon)** | **Go 1.26.5 Native 16-Core Sidecar (`0 B/op`)** | **`15.94 ms`** | **`5.15 µs`** | **`536.2×`** | **Deployed for On-Premise TOS Sidecar** |

*(Note: We also benchmarked string-heavy EDI/XML Customs Reconciliation across FFI and proved that UTF-8 boundary serialization makes WASM FFI `0.78×` slower—demonstrating disciplined systems engineering that only rewrites kernels when empirical speedup justifies the cost).*
