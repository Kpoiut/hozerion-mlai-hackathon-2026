import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as Link, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as formatWhen } from "./parse-C_Xtcwss.mjs";
import { A as Copy, B as CalendarClock, C as LayoutGrid, D as Ellipsis, E as FileCheck2, F as ChevronRight, H as ArrowRight, I as ChevronLeft, L as ChevronDown, M as CircleX, N as CircleCheck, O as Droplets, P as CircleAlert, R as Check, S as Leaf, T as Flag, U as ArrowLeftRight, V as Boxes, W as Anchor, _ as Moon, a as Sun, b as Lock, d as Receipt, f as Radio, g as Network, h as Pause, i as TriangleAlert, j as Clock, k as DoorClosed, l as ShieldCheck, m as PenLine, n as Undo2, o as Sparkles, p as Play, r as Truck, s as Snowflake, t as Waypoints, u as RefreshCw, v as Minus, w as LayoutList, x as LockOpen, y as MapPin, z as CalendarDays } from "../_libs/lucide-react.mjs";
import { t as useAtomValue } from "../_libs/jotai.mjs";
import { $ as runFlow, A as bks_bcn_36A_2_default, B as evaluateGateTransaction, C as bks_bcn_24B_10_default, D as bks_bcn_24B_50_default, E as bks_bcn_24B_47_default, F as calculateContainerBilling, G as packCfsCargo3D, H as healthMap, J as phaseAt, K as packDepth, L as clockMinAtom, N as bookedFromPlan, O as bks_bcn_36A_10_default, P as bookedHeadline, Q as reconcileShipmentDocuments, R as cn, S as berthSpan, T as bks_bcn_24B_2_default, U as holdingCall, V as formatEtcVerdict, W as occupyIndexes, X as publishedYard, Y as publishedWeekList, Z as recommendIncomingSlot, _ as bcn_24B_50_default, at as solveHinterlandExceptions, b as bcn_36A_2_default, c as PUBLISHED_REPO, ct as stretchShips, d as SHIPMENT_DOCUMENT_CASES, dt as validateIso6346, et as scoreOneHourLate, g as bcn_24B_47_default, h as bcn_24B_2_default, i as FederationPane, it as solveBayRetrieval, j as bks_bcn_36A_50_default, k as bks_bcn_36A_25_default, l as SEED_BAY_CONTAINERS, lt as tryPublishedYard, m as bcn_24B_25_default, n as Button, nt as selectPlayhead, o as PUBLISHED_DOI, p as bcn_24B_10_default, q as packLanes, r as DEFAULT_BAY_CONFIG, s as PUBLISHED_DOI_URL, st as stretchClear, t as BacapPane, tt as selectLive, u as SERVICES, ut as useBoardStore, v as bcn_36A_10_default, w as bks_bcn_24B_25_default, x as bcn_36A_50_default, y as bcn_36A_25_default } from "./dock-exceptions-DQdKk7ce.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-u2eP-mf3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function planProof(result, unit = "minute") {
	const greedy = result.certificate?.whyNotGreedy;
	const chosen = result.certificate?.chosen;
	if (result.status !== "OPTIMAL" || !chosen) return null;
	const place = unit === "hour" ? "berth" : "door";
	const word = unit === "hour" ? "h" : "min";
	const dock = chosen.dockId.replace(/^D/, "");
	if (!greedy) {
		if (result.metrics.displaced !== 0) return null;
		return {
			waitMin: result.metrics.eventWaitMin,
			dock,
			habitWaitMin: result.metrics.eventWaitMin,
			habitDock: dock,
			savedMin: 0,
			moved: 0,
			headline: `Same wait as the first free ${place}`
		};
	}
	const savedMin = greedy.savedWaitMin;
	const headline = savedMin > 0 ? `Saves ${savedMin} ${word} versus the first free ${place}` : savedMin === 0 ? `Same wait as the first free ${place}` : `First free ${place} is ${-savedMin} ${word} shorter`;
	return {
		waitMin: result.metrics.eventWaitMin,
		dock,
		habitWaitMin: greedy.greedyWaitMin,
		habitDock: greedy.greedyDockId.replace(/^D/, ""),
		savedMin,
		moved: result.metrics.displaced,
		headline
	};
}
var DROP_LABEL = {
	forceDock: "Unforce door",
	cargo: "Keep cargo",
	equipment: "Ignore equipment",
	wait: "Relax wait",
	deadline: "Relax deadline",
	freeze: "Move in-bay",
	kbound: "One more move"
};
function DecisionBar({ result, yard, onApplyRelax, onCommit }) {
	if (!result) return null;
	const etc = useBoardStore((s) => s.etc);
	const event = useBoardStore((s) => s.event);
	const cert = result.certificate;
	const hour = yard.timeUnit === "hour";
	const restores = (result.relaxations ?? []).filter((r) => r.restores);
	const msg = (result.conflict ?? []).filter((c) => c.core)[0]?.message ?? result.conflict?.[0]?.message;
	const [menu, setMenu] = (0, import_react.useState)(false);
	const wrap = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!menu) return;
		const onDoc = (e) => {
			if (!wrap.current?.contains(e.target)) setMenu(false);
		};
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, [menu]);
	const planLine = cert && result.status === "OPTIMAL" ? `${placeName(cert.chosen.dockId, hour)} at ${formatWhen(yard, cert.chosen.startMin)}, wait ${result.metrics.eventWaitMin}${hour ? "h" : "m"}, k=${result.kUsed}` : "";
	const fact = hour && cert ? fileCall(yard, cert.chosen.truckId) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-10 flex-wrap items-center gap-3",
		children: [
			result.status === "OPTIMAL" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex h-9 items-center gap-1.5 rounded-full bg-ok/10 px-3 text-sm font-medium text-ok",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), "Ready"]
			}) : result.status === "HUMAN_REQUIRED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex h-9 items-center gap-1.5 rounded-full bg-warn/10 px-3 text-sm font-medium text-warn",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }), "Review"]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex h-9 items-center gap-1.5 rounded-full bg-bad/10 px-3 text-sm font-medium text-bad",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-4" }), "Blocked"]
			}),
			result.status === "OPTIMAL" && cert ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "min-w-0 flex-1 truncate text-sm font-medium text-accent",
				children: [
					placeName(cert.chosen.dockId, hour),
					" at ",
					formatWhen(yard, cert.chosen.startMin),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-2 font-normal",
						children: [
							"wait ",
							result.metrics.eventWaitMin,
							hour ? "h" : "m"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-normal text-muted",
						children: result.metrics.displaced ? ` · ${result.metrics.displaced} moved` : " · nobody else moves"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 font-normal text-faint",
						children: "· draft"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "min-w-0 flex-1 truncate text-sm text-muted",
				children: msg
			}),
			result.status === "OPTIMAL" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProofStrip, {
				result,
				yard
			}) : null,
			hour && fact && event ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "basis-full text-sm text-muted",
				children: [
					fact.id,
					" in the file: arrives ",
					fact.arrival,
					"h, moors ",
					fact.moor,
					"h on berth ",
					fact.berth,
					", occupies ",
					fact.len,
					" berths, works ",
					fact.handling,
					"h. This probe arrives at ",
					event.newEtaMin,
					"h."
				]
			}) : null,
			hour && cert ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CertificateAudit, {
				cert,
				yard
			}) : null,
			etc ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "basis-full truncate font-mono text-xs text-muted",
				"data-etc-winner": etc.winner,
				children: [formatEtcVerdict(etc, yard.shiftStartMin, yard.timeUnit), etc.conflicts.length > 1 ? ` · ${etc.conflicts.length} disagreements` : ""]
			}) : null,
			restores.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "secondary",
				size: "sm",
				onClick: () => onApplyRelax(r.drop),
				children: DROP_LABEL[r.drop] ?? r.label
			}, r.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex shrink-0",
				ref: wrap,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						className: "h-10 min-w-24 rounded-l-xl rounded-r-none",
						onClick: onCommit,
						disabled: result.status !== "OPTIMAL",
						children: "Commit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						className: "h-10 rounded-l-none rounded-r-xl px-2",
						onClick: () => setMenu((v) => !v),
						disabled: result.status !== "OPTIMAL",
						"aria-label": "Commit options",
						"aria-expanded": menu,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" })
					}),
					menu ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute top-full right-0 z-50 mt-1 min-w-44 rounded-xl bg-surface p-1 shadow-float ring-1 ring-line",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-raised",
								onClick: () => {
									setMenu(false);
									onCommit();
								},
								children: "Commit to board"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-raised",
								onClick: () => {
									setMenu(false);
									navigator.clipboard.writeText(planLine);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5 text-muted" }), "Copy plan"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-raised disabled:opacity-40",
								disabled: !useBoardStore.getState().previous,
								onClick: () => {
									setMenu(false);
									useBoardStore.getState().undo();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-3.5 text-muted" }), "Undo last commit"]
							})
						]
					}) : null
				]
			})
		]
	});
}
function CertificateAudit({ cert, yard }) {
	const hole = cert.whyNotGreedy;
	const next = cert.nextBest;
	const rejected = cert.rejected.slice(0, 2).map((row) => row.detail);
	const span = yard.trucks.find((t) => t.id === cert.chosen.truckId)?.span ?? 1;
	const holder = hole ? holdingCall(yard, hole.greedyDockId, hole.greedyStartMin, span) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "basis-full font-mono text-xs text-muted",
		"data-certificate": "audit",
		children: [
			"Decision hour ",
			cert.nowMin,
			". Frozen ",
			cert.frozenIds.length,
			". Done ",
			cert.doneIds.length,
			". Legal windows ",
			cert.legalWindows.length,
			". Rejected ",
			cert.rejected.length,
			".",
			hole ? ` First hole berth ${hole.greedyDockId.replace(/^B/, "")} at ${hole.greedyStartMin}h${holder ? `, when ${holder} leaves` : ""}.` : " First hole is this plan.",
			next ? ` Next plan berth ${next.dockId.replace(/^B/, "")} at ${next.startMin}h, ${next.whyWorse}.` : "",
			rejected.length ? ` ${rejected.join(" · ")}` : ""
		]
	});
}
function fileCall(yard, id) {
	const truck = yard.trucks.find((t) => t.id === id);
	const appt = yard.appointments.find((a) => a.truckId === id);
	if (!truck || !appt) return void 0;
	return {
		id,
		arrival: truck.arrivalMin ?? appt.startMin,
		moor: appt.startMin,
		berth: Number(appt.dockId.replace(/\D/g, "")),
		len: truck.span ?? 1,
		handling: truck.durationMin
	};
}
function placeName(id, hour) {
	return hour ? `Berth ${id.replace(/^B/, "")}` : `Door ${id.replace(/^D/, "")}`;
}
function BookedStrip({ row }) {
	const suffix = "h";
	const place = (id) => id ? `Berth ${id.replace(/^B/, "")}` : "—";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "basis-full rounded-xl bg-raised px-3 py-2",
		"data-proof-saved": row.saved ?? "",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: bookedHeadline(row)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mt-2 grid grid-cols-3 gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[10px] font-medium uppercase tracking-wide text-faint",
						children: "Stay booked"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "font-mono text-lg tabular-nums leading-tight",
						children: [row.holdWait ?? "—", row.holdWait == null ? "" : suffix]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-xs text-muted",
						children: place(row.holdDock)
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[10px] font-medium uppercase tracking-wide text-faint",
						children: "This plan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "font-mono text-lg tabular-nums leading-tight",
						children: [row.planWait ?? "—", row.planWait == null ? "" : suffix]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-xs text-muted",
						children: place(row.planDock)
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[10px] font-medium uppercase tracking-wide text-faint",
						children: "Versus booked"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "font-mono text-lg tabular-nums leading-tight",
						children: [row.saved ?? "—", row.saved == null ? "" : suffix]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-xs text-muted",
						children: row.planMoves === 0 ? "nobody else moves" : `${row.planMoves ?? 0} moved`
					})
				] })
			]
		})]
	});
}
function ProofStrip({ result, yard }) {
	const hour = yard.timeUnit === "hour";
	const event = useBoardStore((s) => s.event);
	if (hour && event) {
		const booked = bookedFromPlan(yard, event, result);
		if (booked.planStatus === "OPTIMAL") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookedStrip, { row: booked });
	}
	const proof = planProof(result, hour ? "hour" : "minute");
	if (!proof) return null;
	const suffix = hour ? "h" : "m";
	const place = (id) => hour ? `Berth ${id.replace(/^B/, "")}` : `Door ${id}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "basis-full rounded-xl bg-raised px-3 py-2",
		"data-proof-saved": proof.savedMin,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: proof.headline
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mt-2 grid grid-cols-3 gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[10px] font-medium uppercase tracking-wide text-faint",
						children: "First free"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "font-mono text-lg tabular-nums leading-tight",
						children: [proof.habitWaitMin, suffix]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-xs text-muted",
						children: place(proof.habitDock)
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[10px] font-medium uppercase tracking-wide text-faint",
						children: "This plan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "font-mono text-lg tabular-nums leading-tight",
						children: [proof.waitMin, suffix]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-xs text-muted",
						children: place(proof.dock)
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[10px] font-medium uppercase tracking-wide text-faint",
						children: "Saved"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "font-mono text-lg tabular-nums leading-tight",
						children: [proof.savedMin, suffix]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-xs text-muted",
						children: proof.moved === 0 ? "nobody else moves" : `${proof.moved} moved`
					})
				] })
			]
		})]
	});
}
function DocsReconcilePane() {
	const [caseId, setCaseId] = (0, import_react.useState)(SHIPMENT_DOCUMENT_CASES[0].id);
	const [autoReconcile, setAutoReconcile] = (0, import_react.useState)(false);
	const [customIsoInput, setCustomIsoInput] = (0, import_react.useState)("MSKU4029107");
	const [outFormat, setOutFormat] = (0, import_react.useState)("vascm");
	const [paperContOverride, setPaperContOverride] = (0, import_react.useState)(null);
	const [paperSealOverride, setPaperSealOverride] = (0, import_react.useState)(null);
	const [weighbridgeOverride, setWeighbridgeOverride] = (0, import_react.useState)(null);
	const [vascmOverride, setVascmOverride] = (0, import_react.useState)(null);
	const baseCase = SHIPMENT_DOCUMENT_CASES.find((c) => c.id === caseId) ?? SHIPMENT_DOCUMENT_CASES[0];
	const docCase = (0, import_react.useMemo)(() => ({
		...baseCase,
		customs: {
			...baseCase.customs,
			vascmGetOutApproved: vascmOverride ?? baseCase.customs.vascmGetOutApproved
		},
		tos: {
			...baseCase.tos,
			weighbridgeGrossKg: weighbridgeOverride ?? baseCase.tos.weighbridgeGrossKg
		},
		paper: {
			...baseCase.paper,
			scannedContainerNo: (paperContOverride ?? baseCase.paper.scannedContainerNo).toUpperCase().trim(),
			scannedSeal: (paperSealOverride ?? baseCase.paper.scannedSeal).toUpperCase().trim()
		}
	}), [
		baseCase,
		paperContOverride,
		paperSealOverride,
		weighbridgeOverride,
		vascmOverride
	]);
	const reconciled = (0, import_react.useMemo)(() => reconcileShipmentDocuments(docCase, autoReconcile), [docCase, autoReconcile]);
	const liveIso = (0, import_react.useMemo)(() => validateIso6346(customIsoInput), [customIsoInput]);
	const activeOutput = outFormat === "vascm" ? reconciled.vnaccsVascmXml : outFormat === "coreor" ? reconciled.edifactCoreor : outFormat === "codeco" ? reconciled.edifactCodeco : reconciled.dcsaCanonicalJson;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-wide text-accent",
							children: "Nâng cấp Mục 3 · Chuẩn hóa Chứng từ Hải quan (VNACCS) – Hãng tàu (eDO) – Cảng (eEIR) – Nhà xe"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 text-lg font-semibold tracking-tight",
							children: "Khử Giấy Chạy Song Song Với Điện Tử & Đối Soát Định Danh Dùng Chung (UCR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 max-w-3xl text-sm text-muted",
							children: [
								"Đối chiếu tự động 4 nguồn dữ liệu: Tờ khai Hải quan 12 số (VNACCS/VASSCM), Lệnh giao nhận điện tử Hãng tàu (eDO/COPARN), Phiếu eEIR/Cân điện tử TOS và Phiếu giấy/OCR tại cổng. Tự động bắt lỗi số kiểm tra",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-fg",
									children: "ISO 6346 modulo-11"
								}),
								", lệch số chì (Seal), lệch cân SOLAS VGM và quá hạn DEM/DET."
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: autoReconcile ? "secondary" : "primary",
						onClick: () => setAutoReconcile((v) => !v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), autoReconcile ? "Đang bật Đồng bộ Chuẩn chung (Paperless)" : "Chạy Đồng bộ Chuẩn chung & Ký số"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-3 lg:grid-cols-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs font-medium text-faint",
							children: ["Chọn bộ hồ sơ thực tế cần đối soát liên ngành", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: caseId,
								onChange: (e) => {
									setCaseId(e.target.value);
									setAutoReconcile(false);
									setPaperContOverride(null);
									setPaperSealOverride(null);
									setWeighbridgeOverride(null);
									setVascmOverride(null);
								},
								className: "mt-1.5 h-10 w-full rounded-xl bg-bg px-3 text-sm font-medium text-fg ring-1 ring-line",
								children: SHIPMENT_DOCUMENT_CASES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.id,
									children: c.title
								}, c.id))
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-raised/70 p-3 ring-1 ring-line",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs font-medium text-faint",
							children: ["Kiểm định trực tiếp số Container (Chuẩn toán học ISO 6346)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: customIsoInput,
								onChange: (e) => setCustomIsoInput(e.target.value),
								className: "mt-1 h-8 w-full rounded-lg bg-surface px-2.5 font-mono text-xs uppercase text-fg ring-1 ring-line",
								placeholder: "VD: MSKU4029107"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("mt-1.5 text-xs font-medium", liveIso.valid ? "text-ok" : "text-bad"),
							children: liveIso.reason
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-3 rounded-xl bg-raised/50 p-3 ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs font-medium text-faint",
							children: ["Sửa thử Cont trên Giấy/OCR Cổng", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: docCase.paper.scannedContainerNo,
								onChange: (e) => setPaperContOverride(e.target.value),
								className: "mt-1 h-8 w-full rounded-lg bg-surface px-2.5 font-mono text-xs uppercase text-fg ring-1 ring-line"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs font-medium text-faint",
							children: ["Sửa thử Seal trên Giấy/OCR Cổng", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: docCase.paper.scannedSeal,
								onChange: (e) => setPaperSealOverride(e.target.value),
								className: "mt-1 h-8 w-full rounded-lg bg-surface px-2.5 font-mono text-xs uppercase text-fg ring-1 ring-line"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs font-medium text-faint",
							children: ["Cân thực tế Trạm cân Cảng (kg)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								step: 100,
								value: docCase.tos.weighbridgeGrossKg,
								onChange: (e) => setWeighbridgeOverride(Number(e.target.value) || 0),
								className: "mt-1 h-8 w-full rounded-lg bg-surface px-2.5 font-mono text-xs text-fg ring-1 ring-line"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col justify-between text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-faint",
								children: "Trạng thái Hải quan VASSCM"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setVascmOverride(!docCase.customs.vascmGetOutApproved),
								className: cn("mt-1 h-8 rounded-lg px-2.5 font-mono text-xs font-semibold ring-1", docCase.customs.vascmGetOutApproved ? "bg-ok/15 text-ok ring-ok/30" : "bg-bad/15 text-bad ring-bad/30"),
								children: docCase.customs.vascmGetOutApproved ? "VASSCM: Đã duyệt qua KVGS" : "VASSCM: Đang Hold (Nhấn để duyệt)"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-bg p-3 ring-1 ring-line",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold",
									children: "1. Hải quan VNACCS"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn("rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold", docCase.customs.channel === "GREEN" ? "bg-ok/15 text-ok" : "bg-warn/15 text-warn"),
									children: ["Luồng ", docCase.customs.channel]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-2 space-y-1 font-mono text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Tờ khai:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: docCase.customs.declarationNo })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Chi cục:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: docCase.customs.customsOfficeCode })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Cont / Seal:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
											docCase.customs.containerNo,
											" · ",
											docCase.customs.customsSeal
										] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "VASSCM:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: docCase.customs.vascmGetOutApproved ? "text-ok" : "text-bad",
											children: docCase.customs.vascmGetOutApproved ? "Đủ ĐK qua KVGS" : "Chưa duyệt Get-Out"
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-bg p-3 ring-1 ring-line",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold",
									children: "2. Hãng tàu (eDO)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-accent",
									children: docCase.edo.isoSizeType
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-2 space-y-1 font-mono text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Số eDO:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: docCase.edo.edoNumber })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Số vận đơn:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: docCase.edo.billOfLading })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Seal / VGM:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
											docCase.edo.carrierSeal,
											" · ",
											docCase.edo.vgmWeightKg,
											"kg"
										] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Cảng / Hạn:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
											docCase.edo.releaseTerminalCode.replace("VNSGN-", ""),
											" · ",
											docCase.edo.freeDemurrageUntilHour,
											"h"
										] })]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-bg p-3 ring-1 ring-line",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold",
									children: "3. Cảng TOS (eEIR)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-raised px-2 py-0.5 font-mono text-[10px] text-muted",
									children: docCase.tos.tosSystem
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-2 space-y-1 font-mono text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Phiếu eEIR:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: docCase.tos.eirNumber })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Ô bãi 3D:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: docCase.tos.yardSlot })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Cân thực tế:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [docCase.tos.weighbridgeGrossKg, "kg"] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Cảng / Giờ:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
											docCase.tos.terminalCode.replace("VNSGN-", ""),
											" · ",
											docCase.tos.pickupHour,
											"h"
										] })]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-bg p-3 ring-1 ring-line",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold",
									children: "4. Giấy / OCR Cổng"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-warn/15 px-2 py-0.5 font-mono text-[10px] text-warn",
									children: "Giấy song song"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-2 space-y-1 font-mono text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Xe / Moóc:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
											docCase.paper.truckPlate,
											" / ",
											docCase.paper.chassisPlate
										] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Cont ghi tay:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: !reconciled.paperIsoVerdict.valid ? "font-bold text-bad" : "",
											children: docCase.paper.scannedContainerNo
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Seal ghi tay:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: docCase.paper.scannedSeal !== docCase.edo.carrierSeal ? "font-bold text-bad" : "",
											children: docCase.paper.scannedSeal
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Cảng trên giấy:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: docCase.paper.paperTerminalCode.replace("VNSGN-", "") })]
									})
								]
							})]
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-medium uppercase tracking-wide text-faint",
							children: [
								"Phát hiện Xung đột Giấy vs Điện tử (",
								reconciled.discrepancies.length,
								" điểm lệch)"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-0.5 text-base font-semibold",
							children: reconciled.gateReleaseStatus === "AUTO_RECONCILED" ? "Đã Chuẩn hóa & Mở Cổng Điện Tử (Không cần phiếu giấy)" : "Cổng đang Chặn Tự động do Lệch Chứng từ Liên ngành"
						})] }), reconciled.gateReleaseStatus === "AUTO_RECONCILED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-ok" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-5 text-bad" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 space-y-2.5",
						children: reconciled.discrepancies.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("rounded-xl p-3 ring-1", autoReconcile ? "bg-ok/10 ring-ok/30" : "bg-bad/10 ring-bad/30"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs font-semibold",
										children: d.field
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: d.partiesInvolved.join(" ↔ ")
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-fg",
									children: d.message
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-mono text-xs text-muted",
									children: [
										"Trái: ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-fg",
											children: d.paperOrLeftValue
										}),
										" · Phải:",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-fg",
											children: d.electronicOrRightValue
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1.5 text-xs font-medium text-accent",
									children: ["→ Giải pháp tự động: ", d.autoFixAction]
								})
							]
						}, d.code))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-xl bg-raised/70 p-3 ring-1 ring-line",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-semibold",
							children: [
								"Mã Định danh Dùng chung Liên thông (Unified Canonical Reference):",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-accent",
									children: reconciled.canonicalIds.ucrToken
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-xs text-muted",
							children: [
								"Cont chuẩn ISO: ",
								reconciled.canonicalIds.canonicalContainerNo,
								" · Tờ khai: ",
								reconciled.canonicalIds.vnaccsDeclarationNo,
								" · B/L: ",
								reconciled.canonicalIds.carrierBillOfLading,
								" · eDO: ",
								reconciled.canonicalIds.carrierEdoNumber,
								" · eEIR: ",
								reconciled.canonicalIds.tosEirNumber
							]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-faint",
						children: "Bản tin Chuẩn Chung Xuất Ra Cho 4 Bên"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-0.5 text-base font-semibold",
						children: "VNACCS VASSCM XML · UN/EDIFACT COREOR & CODECO · DCSA eDO 3.0"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1",
						children: [
							{
								id: "vascm",
								label: "Hải quan VASSCM XML"
							},
							{
								id: "coreor",
								label: "EDIFACT COREOR"
							},
							{
								id: "codeco",
								label: "EDIFACT CODECO"
							},
							{
								id: "dcsa",
								label: "DCSA eDO JSON"
							}
						].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setOutFormat(t.id),
							className: cn("rounded-lg px-2.5 py-1 text-xs font-medium", outFormat === t.id ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:text-fg"),
							children: t.label
						}, t.id))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "mt-3 max-h-72 overflow-auto rounded-xl bg-bg p-3 font-mono text-xs leading-relaxed text-fg ring-1 ring-line",
					children: activeOutput
				})]
			})]
		})]
	});
}
function MicroTosPane() {
	const [selectedContNo, setSelectedContNo] = (0, import_react.useState)("MSKU4029100");
	const [showAfterGrid, setShowAfterGrid] = (0, import_react.useState)(false);
	const [overrideCustomsHold, setOverrideCustomsHold] = (0, import_react.useState)(false);
	const retrieval = (0, import_react.useMemo)(() => solveBayRetrieval(selectedContNo, SEED_BAY_CONTAINERS, DEFAULT_BAY_CONFIG), [selectedContNo]);
	const billing = (0, import_react.useMemo)(() => calculateContainerBilling(retrieval.targetContainer, retrieval.rehandleCount), [retrieval.targetContainer, retrieval.rehandleCount]);
	const gateEir = (0, import_react.useMemo)(() => evaluateGateTransaction(retrieval.targetContainer, retrieval.rehandleCount, overrideCustomsHold), [
		retrieval.targetContainer,
		retrieval.rehandleCount,
		overrideCustomsHold
	]);
	const slotRecs = (0, import_react.useMemo)(() => recommendIncomingSlot({
		cargo: retrieval.targetContainer.cargo,
		weightTon: 19.5,
		pickupOrder: 4
	}, SEED_BAY_CONTAINERS, DEFAULT_BAY_CONFIG), [retrieval.targetContainer.cargo]);
	const cfsPack = (0, import_react.useMemo)(() => packCfsCargo3D(), []);
	const hinterland = (0, import_react.useMemo)(() => solveHinterlandExceptions(), []);
	const activeGrid = showAfterGrid ? retrieval.finalGrid : retrieval.initialGrid;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-accent",
						children: "Nâng cấp Mục 2 & Mục 4 · Micro-TOS Cho Cảng Nhỏ / ICD (Cổng eEIR · Bãi 3D Bay-Row-Tier · Hải Quan · Tính Tiền)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 text-lg font-semibold tracking-tight",
						children: "Thay thế Phần Đắt Nhất Của Hệ Thống Triệu Đô: Bãi Container, Đảo Chuyển RTG, Cổng Hải Quan & Hóa Đơn Lũy Tiến"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 max-w-3xl text-sm text-muted",
						children: [
							"Cảng nhỏ và ICD không kham nổi TOS triệu đô vì chi phí nằm ở 4 phân hệ vận hành hàng ngày: Quản lý ô bãi 3D",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-fg",
								children: "Block-Bay-Row-Tier"
							}),
							" & tối ưu số lần cẩu đảo chuyển (rehandle), Kiểm soát cổng eEIR gắn thông quan VASSCM, và Tính cước lưu bãi lũy tiến / điện lạnh / DEM-DET. Chọn bất kỳ container nào dưới đây để chạy toàn bộ chu trình."
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "secondary",
						size: "sm",
						onClick: () => setShowAfterGrid((v) => !v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), showAfterGrid ? "Đang xem: Sơ đồ Bãi SAU khi rút cont" : "Xem Sơ đồ Bãi SAU khi đảo chuyển"]
					}), retrieval.targetContainer.customsStatus !== "GREEN_CLEARED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						onClick: () => setOverrideCustomsHold((v) => !v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5" }), overrideCustomsHold ? "Đã giải phóng Hold Hải quan" : "Giải phóng Hold Luồng Vàng"]
					}) : null]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-4 xl:grid-cols-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "xl:col-span-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-semibold uppercase tracking-wide text-faint",
								children: [
									"Sơ đồ Mặt Cắt Bay Container: Block ",
									DEFAULT_BAY_CONFIG.blockId,
									" · Bay ",
									DEFAULT_BAY_CONFIG.bayNo,
									" (6 Rows × 4 Tiers)"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs text-muted",
								children: showAfterGrid ? "Trạng thái: Sau khi cẩu RTG bốc cont" : "Nhấn vào từng ô Container để rút"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 overflow-x-auto rounded-xl bg-bg p-3 ring-1 ring-line",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid min-w-[34rem] grid-cols-6 gap-2",
								children: Array.from({ length: DEFAULT_BAY_CONFIG.nRows }, (_, r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between px-1 text-[11px] font-medium text-faint",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Row ", r + 1] }), DEFAULT_BAY_CONFIG.reeferRows.includes(r) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-accent",
											children: "Reefer"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Dry" })]
									}), Array.from({ length: DEFAULT_BAY_CONFIG.maxTiers }, (_, tIdx) => {
										const tier = DEFAULT_BAY_CONFIG.maxTiers - 1 - tIdx;
										const cell = activeGrid[r]?.[tier] ?? null;
										const isTarget = cell?.containerNo === retrieval.targetContainer.containerNo;
										const isBlocker = retrieval.blockingContainers.some((b) => b.containerNo === cell?.containerNo);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											disabled: !cell,
											onClick: () => {
												if (cell) {
													setSelectedContNo(cell.containerNo);
													setShowAfterGrid(false);
												}
											},
											className: cn("flex h-16 flex-col justify-between rounded-lg p-2 text-left font-mono text-xs ring-1 transition-colors", !cell && "cursor-default border border-dashed border-line bg-surface/40 text-faint ring-0", cell && !isTarget && !isBlocker && "bg-surface text-fg ring-line hover:bg-raised", isTarget && "bg-accent text-accent-fg ring-2 ring-accent", isBlocker && !isTarget && "bg-warn/15 text-fg ring-warn/50"),
											children: cell ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "truncate text-[11px] font-bold",
													children: cell.containerNo
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: cn("rounded px-1 text-[10px]", isTarget ? "bg-accent-fg/20 text-accent-fg" : "bg-raised text-muted"),
													children: ["#", cell.pickupOrder]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between text-[10px] opacity-85",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													cell.size,
													" · ",
													cell.weightTon,
													"t"
												] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: cell.customsStatus === "YELLOW_HOLD" ? "HOLD" : cell.pickupEtaLabel })]
											})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "m-auto text-[10px] text-faint",
												children: [
													"T",
													tier + 1,
													" trống"
												]
											})
										}, tier);
									})]
								}, r))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 rounded-xl bg-raised/60 p-3 ring-1 ring-line",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs font-semibold",
									children: [
										"Lệnh Cẩu RTG Tối ưu Đảo chuyển (Min-Rehandle: ",
										retrieval.rehandleCount,
										" lượt đảo · ",
										retrieval.cleanRehandles,
										" lượt sạch 0 xung đột phụ · ",
										retrieval.totalCraneMinutes,
										" phút)"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-xs text-accent",
									children: [
										"Hạ bãi mới tối ưu: Row ",
										(slotRecs[0]?.row ?? 0) + 1,
										" Tier ",
										(slotRecs[0]?.tier ?? 0) + 1
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-1.5 text-xs",
								children: retrieval.steps.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-start gap-2 font-mono",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rounded bg-surface px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-line",
										children: ["Bước ", st.stepNo]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-sans text-fg",
										children: st.reason
									})]
								}, st.stepNo))
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 xl:col-span-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("rounded-xl p-3.5 ring-1", gateEir.status === "ISSUED_GREEN" ? "bg-ok/10 ring-ok/40" : "bg-bad/10 ring-bad/40"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs font-semibold uppercase tracking-wide",
										children: ["Cổng Thông Minh eEIR · ", gateEir.eirNo]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs font-bold",
										children: gateEir.status === "ISSUED_GREEN" ? "CHO PHÉP QUA CỔNG" : "CHẶN TẠI CỔNG"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-mono text-xs",
									children: [
										"Xe ",
										gateEir.truckPlate,
										" · ",
										gateEir.gateLane,
										" · Ô bãi ",
										gateEir.yardCoordinate,
										" · Quay đầu dự kiến ",
										gateEir.estimatedTurnaroundMin,
										" phút"
									]
								}),
								gateEir.holdReasons.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-1.5 list-disc pl-4 text-xs text-bad",
									children: gateEir.holdReasons.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: r }, r))
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-ok",
									children: "Đã xác thực ISO 6346 + Thông quan VASSCM + Lệnh eDO + Thu đủ cước cảng."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-bg p-3.5 ring-1 ring-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs font-medium uppercase tracking-wide text-faint",
										children: [
											"Bảng Tính Cước Cảng & Lưu Bãi Lũy Tiến (",
											billing.invoiceNo,
											")"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "text-sm font-semibold",
										children: [
											"Cont ",
											billing.containerNo,
											" (",
											billing.size,
											") · Lưu bãi ",
											billing.dwellDays,
											" ngày (Miễn ",
											billing.freeDays,
											" ngày)"
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-4 text-accent" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "mt-2.5 w-full text-left text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "border-b border-line text-faint",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-1.5 font-medium",
												children: "Hạng mục cước"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-2 py-1.5 text-right font-medium",
												children: "SL"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-1.5 text-right font-medium",
												children: "Thành tiền (VND)"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
										className: "font-mono tabular-nums",
										children: billing.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-b border-line/60",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-1.5 font-sans text-fg",
													children: line.description
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "px-2 py-1.5 text-right text-muted",
													children: [
														line.quantity,
														" ",
														line.unit
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-1.5 text-right",
													children: line.amountVnd.toLocaleString("vi-VN")
												})
											]
										}, line.code))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2.5 flex items-center justify-between border-t border-line pt-2 font-mono text-xs tabular-nums",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted",
										children: [
											"Thuế GTGT (",
											billing.vatRatePct,
											"%): ",
											billing.vatVnd.toLocaleString("vi-VN"),
											" ₫"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm font-bold text-accent",
										children: [
											"Tổng: ",
											billing.totalVnd.toLocaleString("vi-VN"),
											" ₫ ($",
											billing.totalUsd,
											")"
										]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-raised/60 p-3 ring-1 ring-line",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-semibold",
								children: [
									"Tối ưu Đóng Hàng Lẻ Kho CFS 3D (WASM Extreme-Point Pack3D):",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono text-ok",
										children: [cfsPack.utilizationPct, "% thể tích"]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-0.5 text-xs text-muted",
								children: [
									"Đã xếp ",
									cfsPack.poses.length,
									"/",
									cfsPack.items.length,
									" kiện pallet LCL vào ",
									cfsPack.binsUsed,
									" container 20'DC không chồng lấn AABB."
								]
							})]
						})
					]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-wide text-accent",
							children: "Nâng cấp Mục 4 · Giải Quyết Ngoại Lệ Cửa Kho Gắn Với Bãi Container, Hải Quan & Giờ Cut-off Tàu"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 text-lg font-semibold tracking-tight",
							children: "Vượt qua C3 / FourKites / DataDocks: Hoán Đổi Slot Song Phương + Tách Tờ Khai Hold + Đảo Chuyển RTG Trước"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 max-w-3xl text-sm text-muted",
							children: [
								"Các phần mềm đặt lịch cửa kho thông thường chỉ dời giờ trên sơ đồ cửa mà không biết container dưới bãi đang bị đè mấy tầng hay đang vướng tờ khai Luồng Vàng. Bộ giải liên hợp dưới đây kết nối trực tiếp",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-fg",
									children: "Cửa Kho ↔ Cẩu Bãi RTG ↔ Hải quan VASSCM ↔ Giờ Cut-off Hãng tàu"
								}),
								"."
							]
						})
					] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3 lg:grid-cols-3",
					children: hinterland.strategies.map((st) => {
						const isBest = st.id === "coupled-swap";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("rounded-xl p-3.5 ring-1", isBest ? "bg-accent/10 ring-accent/40" : "bg-bg ring-line"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: cn("text-xs font-semibold", isBest ? "text-accent" : "text-fg"),
									children: st.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-2 grid grid-cols-3 gap-2 font-mono text-xs tabular-nums",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Rớt tàu Cut-off"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
											className: cn("font-bold", st.cutoffMisses === 0 ? "text-ok" : "text-bad"),
											children: [st.cutoffMisses, " cont"]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Tổng giờ chờ"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
											className: "font-bold",
											children: [st.totalWaitMin, "p"]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-faint",
											children: "Đổi slot / Cẩu trước"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
											className: "font-bold",
											children: [
												st.swapsExecuted,
												" cặp / -",
												st.craneWaitSavedMin,
												"p"
											]
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-muted",
									children: st.summary
								})
							]
						}, st.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[48rem] text-left text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "border-b border-line text-faint",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 pr-2 font-medium",
									children: "Xe / Nhà xe"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-2 font-medium",
									children: "Container & Tàu"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-2 font-medium",
									children: "Cửa"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-2 font-medium",
									children: "Giờ đặt → Thực đến → Lên cửa"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-2 font-medium",
									children: "Dư giờ Cut-off"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "pl-2 py-2 font-medium",
									children: "Quyết định Liên hợp (Kho – Bãi – Hải quan)"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: hinterland.recommended.placements.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-line/60 font-mono tabular-nums",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "py-2 pr-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold",
										children: p.truckPlate
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block font-sans text-[11px] text-muted",
										children: p.hauler
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2",
									children: p.containerNo
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2",
									children: p.assignedDoorId
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-2 py-2",
									children: [
										"+",
										p.bookedStartMin,
										"p → +",
										p.liveEtaMin,
										"p →",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-semibold text-accent",
											children: [
												"+",
												p.startMin,
												"p..+",
												p.endMin,
												"p"
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2",
									children: p.cutoffSlackMin != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-ok",
										children: [
											"+",
											p.cutoffSlackMin,
											"p an toàn"
										]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted",
										children: "Hàng nhập"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "pl-2 py-2 font-sans text-xs text-fg",
									children: p.explanation
								})
							]
						}, p.jobId)) })]
					})
				})
			]
		})]
	});
}
/** Why a terminal opens this: the booked stretch is taken, the other ships stay, a clear stretch is named. */
function JobCard() {
	const yard = useBoardStore((s) => s.yard);
	const result = useBoardStore((s) => s.result);
	const event = useBoardStore((s) => s.event);
	const selectedId = useBoardStore((s) => s.selectedId);
	const compare = (0, import_react.useMemo)(() => yard.timeUnit === "hour" && event ? bookedFromPlan(yard, event, result ?? void 0) : null, [
		yard,
		event,
		result
	]);
	if (yard.timeUnit !== "hour") return null;
	const truck = yard.trucks.find((t) => t.id === selectedId);
	const appt = yard.appointments.find((a) => a.truckId === selectedId);
	const span = truck?.span ?? 1;
	const berth = appt ? appt.dockId.replace(/^B/, "") : "";
	const chain = compare && appt && event && compare.holdStart != null && compare.holdStart > event.newEtaMin ? stretchShips(yard, selectedId, appt.dockId, span, event.newEtaMin, compare.holdStart) : [];
	const planEnd = compare?.planStart != null && truck ? compare.planStart + truck.durationMin : null;
	const planClear = compare?.planDock != null && compare.planStart != null && planEnd != null ? stretchClear(yard, selectedId, compare.planDock, span, compare.planStart, planEnd) : false;
	const leftmostDiffers = compare != null && compare.leftmostStart != null && compare.planStart != null && compare.leftmostSaved != null && (compare.leftmostDock !== compare.holdDock || compare.leftmostStart !== compare.holdStart);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-job": "one",
		className: "mb-4 rounded-2xl bg-surface px-4 py-4 shadow-card ring-1 ring-line sm:px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wide text-faint",
				children: "The job"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 text-lg font-semibold tracking-tight",
				children: "Hozerion"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "One late ship. The others stay put."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-sm leading-relaxed text-muted",
				children: "Use this when the booked stretch is taken. The solver names a stretch that fits the late ship for the whole job, and leaves every other ship on its published time."
			}),
			truck && appt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm leading-relaxed",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: truck.id
					}),
					" in the file moors at berth ",
					berth,
					" at hour ",
					appt.startMin,
					", and works ",
					truck.durationMin,
					"h across ",
					span,
					" ",
					span === 1 ? "berth" : "berths",
					".",
					event ? ` This probe arrives at hour ${event.newEtaMin}.` : " The probe arrives one hour after that mooring."
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Pick a call. The probe arrives one hour after its published mooring."
			}),
			compare && compare.planStatus !== "OPTIMAL" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-bad",
				children: [
					"The solver did not write a plan (",
					compare.planStatus,
					")."
				]
			}) : null,
			compare && compare.planStatus === "OPTIMAL" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm font-medium leading-relaxed",
					"data-booked-headline": "",
					children: bookedHeadline(compare)
				}),
				compare.holdStart != null && compare.planStart != null && compare.saved != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 font-mono text-base tabular-nums",
					"data-booked-equation": "",
					children: [
						compare.holdStart,
						" − ",
						compare.planStart,
						" = ",
						compare.saved
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: compare.planMoves === 0 ? "Nobody else moves." : `${compare.planMoves} other calls move.`
				}),
				chain.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm leading-relaxed",
					children: [
						"From hour ",
						event?.newEtaMin,
						" the booked stretch stays occupied until hour ",
						compare.holdStart,
						". These ships are already published there. Waiting them out is the alternative."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 grid gap-1 sm:grid-cols-2",
					"data-block-chain": "",
					children: chain.map((ship) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						"data-block-ship": ship.id,
						"data-block-start": ship.start,
						"data-block-end": ship.end,
						className: "font-mono text-sm tabular-nums text-muted",
						children: [
							ship.id,
							" · berth ",
							ship.dock.replace(/^B/, ""),
							" · ",
							ship.start,
							"–",
							ship.end
						]
					}, ship.id))
				})] }) : compare.matches && compare.planWait === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: "No published ship is on this stretch at the new arrival. Staying is the plan."
				}) : null,
				planClear && compare.planDock && compare.planStart != null && planEnd != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm leading-relaxed",
					children: [
						"Berth ",
						compare.planDock.replace(/^B/, ""),
						" from hour ",
						compare.planStart,
						" to ",
						planEnd,
						" is clear in the file."
					]
				}) : null,
				leftmostDiffers ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: [
						"Leftmost section is berth ",
						compare.leftmostDock?.replace(/^B/, ""),
						" at hour ",
						compare.leftmostStart,
						". That gap is not the booking.",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 block font-mono text-base text-fg tabular-nums",
							"data-job-equation": "",
							children: [
								compare.leftmostStart,
								" − ",
								compare.planStart,
								" = ",
								compare.leftmostSaved
							]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "The leftmost section is this same opening."
				})
			] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-open-free": "",
						onClick: () => useBoardStore.getState().openWeek("bcn-24B-2"),
						className: "h-11 rounded-lg bg-bg px-3 text-sm text-fg ring-1 ring-line",
						children: "Berth still free"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => useBoardStore.getState().setTab("bacap"),
						className: "hidden h-11 items-center rounded-lg bg-accent/10 px-3 text-xs font-medium text-accent ring-1 ring-accent/30 hover:bg-accent/15 sm:inline-flex",
						children: "BACAP-R · Cẩu bờ STS & Trung chuyển"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => useBoardStore.getState().setTab("federation"),
						className: "hidden h-11 items-center rounded-lg bg-bg px-3 text-xs font-medium text-fg ring-1 ring-line hover:bg-raised sm:inline-flex",
						children: "Liên thông 5 Cảng TP.HCM (TOPOVN ↔ VTOS ↔ N4)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => useBoardStore.getState().setTab("docs"),
						className: "hidden h-11 items-center rounded-lg bg-bg px-3 text-xs font-medium text-fg ring-1 ring-line hover:bg-raised sm:inline-flex",
						children: "Đối soát Hải quan VNACCS · eDO · ISO 6346"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => useBoardStore.getState().setTab("microtos"),
						className: "hidden h-11 items-center rounded-lg bg-bg px-3 text-xs font-medium text-fg ring-1 ring-line hover:bg-raised sm:inline-flex",
						children: "Micro-TOS · Bãi 3D RTG & Hoán đổi Slot Kho"
					})
				]
			})
		]
	});
}
var COL = {
	enroute: "En route",
	gate: "Gate",
	yard: "Yard",
	dock: "Dock",
	exit: "Exit",
	gone: "Out"
};
function FlowStage({ yard, trace, clockMin, selectedId, onSelect }) {
	const t = Math.round(clockMin);
	const byPhase = {
		enroute: [],
		gate: [],
		yard: [],
		dock: [],
		exit: [],
		gone: []
	};
	for (const f of trace.trucks) byPhase[phaseAt(f, t)].push(f);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-4 flex flex-wrap items-end justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-wide text-faint",
			children: "Container flow"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-1 text-lg font-medium",
			children: formatWhen(yard, t)
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: yard.timeUnit === "hour" ? "Berth interval from the file. No gate time is published." : `Gate queue ${trace.gateQueuedMin}m${trace.tightIds.length ? ` · ${trace.tightIds.length} tight arrivals` : ""}`
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2 sm:grid-cols-5",
		children: [
			"gate",
			"yard",
			"dock",
			"exit",
			"gone"
		].map((phase) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-24 rounded-lg bg-raised p-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-2 text-xs text-faint",
				children: [
					COL[phase],
					" · ",
					byPhase[phase].length
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1",
				children: byPhase[phase].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onSelect(f.truckId),
					className: cn("rounded-md px-1.5 py-1 font-mono text-xs tabular-nums", f.truckId === selectedId ? "bg-fg text-bg" : "bg-surface text-fg ring-1 ring-line"),
					children: [f.truckId, phase === "dock" ? `·${f.dock.dockId.replace(/^D|^B/, "")}` : ""]
				}, f.truckId))
			})]
		}, phase))
	})] });
}
function windowRows(rowCount, rowH, scrollTop, height, overscan = 160) {
	if (rowCount <= 0 || rowH <= 0) return {
		start: 0,
		end: 0,
		padTop: 0,
		padBottom: 0
	};
	const start = Math.max(0, Math.floor((scrollTop - overscan) / rowH));
	const end = Math.min(rowCount, Math.ceil((scrollTop + height + overscan) / rowH));
	return {
		start,
		end,
		padTop: start * rowH,
		padBottom: Math.max(0, (rowCount - end) * rowH)
	};
}
function windowTime(vp, overscan = 160) {
	const w = Math.max(1, vp.contentWidth);
	const x0 = (vp.scrollLeft - overscan) / w * 100;
	const x1 = (vp.scrollLeft + vp.width + overscan) / w * 100;
	return {
		x0: Math.max(0, x0),
		x1: Math.min(100, x1)
	};
}
function intersectsPct(left, width, x0, x1) {
	return left < x1 && left + width > x0;
}
function windowBlocks(blocks, rows, time) {
	const out = [];
	for (const b of blocks) {
		if (b.dockIndex < rows.start || b.dockIndex >= rows.end) continue;
		if (!intersectsPct(b.left, b.width, time.x0, time.x1)) continue;
		out.push(b);
	}
	return out;
}
/** Inclusive clip so first/last visible ticks stay put and labels don't jump. */
function windowMarks(marks, toPct, x0, x1) {
	const out = [];
	for (const m of marks) {
		const x = toPct(m);
		if (x >= x0 && x <= x1) out.push(m);
	}
	return out;
}
function measureViewport(el, contentWidth) {
	return {
		scrollLeft: el.scrollLeft,
		scrollTop: el.scrollTop,
		width: el.clientWidth,
		height: el.clientHeight,
		contentWidth
	};
}
var INITIAL = {
	scrollLeft: 0,
	scrollTop: 0,
	width: 1600,
	height: 800,
	contentWidth: 832
};
function vpKey(v) {
	return `${v.scrollLeft | 0}|${v.scrollTop | 0}|${v.width | 0}|${v.height | 0}|${v.contentWidth | 0}`;
}
/** rAF-coalesced window. setState only when the visible window actually moves. */
function useVirtualGantt(ref, rowCount, rowH) {
	const [vp, setVp] = (0, import_react.useState)(INITIAL);
	const keyRef = (0, import_react.useRef)("");
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		let raf = 0;
		const sync = () => {
			raf = 0;
			const inner = el.firstElementChild;
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
	}, [
		ref,
		rowCount,
		rowH
	]);
	return {
		vp,
		rows: (0, import_react.useMemo)(() => windowRows(rowCount, rowH, vp.scrollTop, vp.height), [
			rowCount,
			rowH,
			vp.scrollTop,
			vp.height
		]),
		time: (0, import_react.useMemo)(() => windowTime(vp), [vp])
	};
}
var MIN_REMAINING_GAP = 30;
function coversDock(dockId, apptDock, span, docks) {
	if (!docks || span <= 1) return apptDock === dockId;
	const ids = docks.map((d) => d.id);
	return occupyIndexes(ids.length, ids.indexOf(apptDock), span).includes(ids.indexOf(dockId));
}
function occupyingTruck(dockId, live, trucks, clockMin, docks) {
	return live.find((a) => {
		const t = trucks.get(a.truckId);
		if (!t || !coversDock(dockId, a.dockId, berthSpan(t), docks)) return false;
		return a.startMin <= clockMin && clockMin < a.startMin + t.durationMin;
	});
}
function remainingGap(dockId, live, trucks, clockMin, shiftLen, docks) {
	const intervals = live.filter((a) => {
		const t = trucks.get(a.truckId);
		return !!t && coversDock(dockId, a.dockId, berthSpan(t), docks);
	}).map((a) => {
		const t = trucks.get(a.truckId);
		return {
			s: a.startMin,
			e: a.startMin + (t?.durationMin ?? 0)
		};
	}).filter((iv) => iv.e > clockMin).sort((a, b) => a.s - b.s);
	let cursor = clockMin;
	let best = 0;
	for (const iv of intervals) {
		best = Math.max(best, Math.max(0, iv.s - cursor));
		cursor = Math.max(cursor, iv.e);
	}
	best = Math.max(best, Math.max(0, shiftLen - cursor));
	return best;
}
function doorOccupancy(dockId, live, trucks, clockMin, shiftLen, docks, minGap = MIN_REMAINING_GAP) {
	if (occupyingTruck(dockId, live, trucks, clockMin, docks)) return "busy";
	if (remainingGap(dockId, live, trucks, clockMin, shiftLen, docks) < minGap) return "tight";
	return "open";
}
function doorCapabilities(dock) {
	return {
		reefer: dock.cargo.includes("reefer") || dock.equipment.includes("reefer_plug"),
		heavy: dock.equipment.includes("crane"),
		dry: dock.cargo.includes("dry")
	};
}
var Icon = {
	truck: Truck,
	reefer: Snowflake,
	dry: Leaf,
	other: Droplets,
	late: TriangleAlert,
	moved: ArrowLeftRight,
	priority: Flag,
	open: LockOpen,
	busy: Clock,
	closed: Lock,
	calendar: CalendarDays,
	check: Check,
	door: DoorClosed
};
function doorStatus(occupancy, dock) {
	const cap = doorCapabilities(dock);
	if (occupancy === "busy") return {
		icon: Clock,
		label: "Busy",
		tone: "text-warn"
	};
	if (occupancy === "tight") return {
		icon: Lock,
		label: "Tight",
		tone: "text-faint"
	};
	if (cap.reefer && !cap.dry) return {
		icon: Snowflake,
		label: "Reefer",
		tone: "text-accent"
	};
	return {
		icon: LockOpen,
		label: "Open",
		tone: "text-ok"
	};
}
function CargoMark({ cargo, className, featured }) {
	if (cargo === "reefer") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, {
		className: cn(className, !featured && "text-accent"),
		strokeWidth: 1.9
	});
	if (cargo === "dry") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, {
		className: cn(className, !featured && "text-ok"),
		strokeWidth: 1.9
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Droplets, {
		className: cn(className, !featured && "text-accent"),
		strokeWidth: 1.9
	});
}
function diffAppointments(before, after) {
	const a = new Map(before.map((x) => [x.truckId, x]));
	const out = /* @__PURE__ */ new Map();
	for (const to of after) {
		const from = a.get(to.truckId);
		if (!from) continue;
		if (from.dockId !== to.dockId || from.startMin !== to.startMin) out.set(to.truckId, {
			from,
			to
		});
	}
	return out;
}
function pct(min, len) {
	if (len <= 0) return 0;
	return min / len * 100;
}
var DENSE_PER_HOUR = 2.2;
var CLOSE_START_MIN = 50;
var MIN_VIEW = 180;
var PAD = 45;
var BUSY_FLOOR = 36;
var GAP_STRETCH = 1.45;
/** Compact chips (mockup), not duration-stretched bars. */
var CARD_GAP_PCT = .8;
var CARD_MIN_PCT = 8.5;
var CARD_SLIVER_PCT = 4.5;
function clamp(n, lo, hi) {
	return Math.max(lo, Math.min(hi, n));
}
function mergeBusy(blocks, start, end) {
	const hits = blocks.map((b) => ({
		s: Math.max(start, b.startMin),
		e: Math.min(end, b.endMin)
	})).filter((b) => b.e > b.s).sort((a, b) => a.s - b.s);
	const out = [];
	for (const h of hits) {
		const last = out[out.length - 1];
		if (!last || h.s > last.e) out.push({ ...h });
		else last.e = Math.max(last.e, h.e);
	}
	return out;
}
function closeStarts(blocks) {
	const byDock = /* @__PURE__ */ new Map();
	for (const b of blocks) {
		const id = b.dockId ?? "_";
		const list = byDock.get(id) ?? [];
		list.push(b.startMin);
		byDock.set(id, list);
	}
	for (const list of byDock.values()) {
		list.sort((a, b) => a - b);
		for (let i = 1; i < list.length; i++) if (list[i] - list[i - 1] < CLOSE_START_MIN) return true;
	}
	return false;
}
/**
* Hour boards store the horizon in hours. Frame the plan and the first hole,
* then keep one hour of chart equal to one hour of file time.
*/
function hourWindow(blocks, focus, shiftLen) {
	const foci = focus.filter((n) => Number.isFinite(n));
	if (foci.length === 0) return {
		start: 0,
		end: shiftLen,
		dense: false
	};
	const pad = 12;
	const minSpan = 48;
	let start = clamp(Math.min(...foci) - pad, 0, shiftLen);
	let end = clamp(Math.max(...foci) + pad, 0, shiftLen);
	let changed = true;
	let guard = 0;
	while (changed && guard < 12) {
		changed = false;
		guard += 1;
		for (const b of blocks) {
			if (b.endMin < start || b.startMin > end) continue;
			const ns = Math.max(0, b.startMin - pad);
			const ne = Math.min(shiftLen, b.endMin + pad);
			if (ns < start) {
				start = ns;
				changed = true;
			}
			if (ne > end) {
				end = ne;
				changed = true;
			}
		}
	}
	if (end - start < minSpan) {
		end = clamp(start + minSpan, 0, shiftLen);
		start = clamp(end - minSpan, 0, shiftLen);
	}
	return {
		start,
		end,
		dense: end - start < shiftLen - 1
	};
}
function viewWindow(blocks, focus, shiftLen, unit = "minute") {
	if (shiftLen <= 0) return {
		start: 0,
		end: 0,
		dense: false
	};
	if (unit === "hour") return hourWindow(blocks, focus, shiftLen);
	const hours = shiftLen / 60;
	if (!(blocks.length / Math.max(hours, .01) > DENSE_PER_HOUR || closeStarts(blocks))) return {
		start: 0,
		end: shiftLen,
		dense: false
	};
	const foci = focus.filter((n) => Number.isFinite(n));
	let start = clamp((foci.length ? foci.reduce((a, b) => a + b, 0) / foci.length : shiftLen / 2) - MIN_VIEW / 2, 0, shiftLen);
	let end = clamp(start + MIN_VIEW, 0, shiftLen);
	start = clamp(end - MIN_VIEW, 0, shiftLen);
	let changed = true;
	let guard = 0;
	while (changed && guard < 12) {
		changed = false;
		guard += 1;
		for (const b of blocks) {
			if (b.endMin < start - PAD || b.startMin > end + PAD) continue;
			const ns = Math.max(0, b.startMin - PAD);
			const ne = Math.min(shiftLen, b.endMin + PAD);
			if (ns < start) {
				start = ns;
				changed = true;
			}
			if (ne > end) {
				end = ne;
				changed = true;
			}
		}
	}
	if (end - start < MIN_VIEW) {
		const extra = (MIN_VIEW - (end - start)) / 2;
		start = clamp(start - extra, 0, shiftLen);
		end = clamp(end + extra, 0, shiftLen);
	}
	return {
		start,
		end,
		dense: true
	};
}
function lerpPct(segs, cum, weights, total, view, min) {
	const x = clamp(min, view.start, view.end);
	let lo = 0;
	let hi = segs.length - 1;
	while (lo < hi) {
		const mid = lo + hi >> 1;
		if (x > segs[mid].e) lo = mid + 1;
		else hi = mid;
	}
	const s = segs[lo];
	const span = s.e - s.s || 1;
	const local = clamp((x - s.s) / span, 0, 1);
	return cum[lo] + local * (weights[lo] / total * 100);
}
function buildTimeScale(blocks, focus, shiftLen, unit = "minute") {
	const view = viewWindow(blocks, focus, shiftLen, unit);
	const busy = mergeBusy(blocks, view.start, view.end);
	const segs = [];
	let cursor = view.start;
	for (const b of busy) {
		if (b.s > cursor) segs.push({
			s: cursor,
			e: b.s,
			occ: false
		});
		segs.push({
			s: b.s,
			e: b.e,
			occ: true
		});
		cursor = b.e;
	}
	if (cursor < view.end) segs.push({
		s: cursor,
		e: view.end,
		occ: false
	});
	if (segs.length === 0) segs.push({
		s: view.start,
		e: view.end,
		occ: false
	});
	const weights = segs.map((s) => {
		const d = Math.max(0, s.e - s.s);
		if (unit === "hour") return Math.max(d, .5);
		return s.occ ? Math.max(d, BUSY_FLOOR) : Math.max(d * GAP_STRETCH, 8);
	});
	const total = weights.reduce((a, b) => a + b, 0) || 1;
	const cum = [];
	let acc = 0;
	for (const w of weights) {
		cum.push(acc);
		acc += w / total * 100;
	}
	const lut = new Float64Array(shiftLen + 1);
	for (let m = 0; m <= shiftLen; m++) lut[m] = lerpPct(segs, cum, weights, total, view, m);
	const toPct = (min) => {
		if (!Number.isFinite(min)) return 0;
		if (min <= view.start) return 0;
		if (min >= view.end) return 100;
		const i = min | 0;
		if (min === i && i >= 0 && i <= shiftLen) return lut[i];
		const a = lut[clamp(i, 0, shiftLen)];
		return a + (lut[clamp(i + 1, 0, shiftLen)] - a) * (min - i);
	};
	const marks = [view.start];
	const span = view.end - view.start;
	const step = unit === "hour" ? span > 96 ? 24 : 12 : 60;
	const first = Math.ceil((view.start + 1) / step) * step;
	for (let h = first; h < view.end; h += step) marks.push(h);
	if (marks[marks.length - 1] !== view.end) {
		const prev = marks[marks.length - 1];
		if (view.end - prev < step * .75) marks[marks.length - 1] = view.end;
		else marks.push(view.end);
	}
	return {
		start: view.start,
		end: view.end,
		marks,
		dense: view.dense,
		toPct
	};
}
function linearScale(shiftLen) {
	const lut = new Float64Array(shiftLen + 1);
	for (let m = 0; m <= shiftLen; m++) lut[m] = pct(m, shiftLen);
	return {
		start: 0,
		end: shiftLen,
		marks: hourMarks(shiftLen),
		dense: false,
		toPct: (min) => {
			if (min <= 0) return 0;
			if (min >= shiftLen) return 100;
			const i = min | 0;
			if (min === i) return lut[i];
			return lut[i] + (lut[i + 1] - lut[i]) * (min - i);
		}
	};
}
function chipWidth(natural, featured, faithful) {
	if (faithful) return Math.max(natural, .8);
	if (featured) return Math.max(natural, 16);
	return clamp(natural, CARD_MIN_PCT, 14);
}
/**
* Compact chips, then 3D depth-pack on each door so visual overlap stacks
* in z instead of clipping below a readable width.
*/
function packCards(blocks, faithful = false) {
	const copies = blocks.map((b) => ({
		...b,
		width: chipWidth(b.width, b.isEvent, faithful),
		stack: 0
	}));
	const byDock = /* @__PURE__ */ new Map();
	for (const b of copies) {
		const list = byDock.get(b.dockId);
		if (list) list.push(b);
		else byDock.set(b.dockId, [b]);
	}
	const out = [];
	let doorY = 0;
	for (const list of byDock.values()) {
		list.sort((a, b) => a.left - b.left || a.startMin - b.startMin);
		const depth = packDepth(list.map((b) => ({
			id: b.truckId,
			x: b.left,
			w: b.width,
			y: doorY
		})), 2);
		for (const b of list) b.stack = depth.get(b.truckId) ?? 0;
		if (!faithful) {
			const layers = [list.filter((b) => b.stack === 0), list.filter((b) => b.stack !== 0)];
			for (const layer of layers) for (let i = layer.length - 1; i >= 0; i--) {
				const cur = layer[i];
				const next = layer[i + 1];
				const room = (next ? next.left - CARD_GAP_PCT : 100) - cur.left;
				if (room <= 0) {
					cur.width = CARD_SLIVER_PCT;
					continue;
				}
				cur.width = Math.min(cur.width, room);
			}
		}
		out.push(...list);
		doorY += 1;
	}
	return out;
}
function layoutDockBlocks(yard, live, eventTruckId, scale) {
	const trucks = new Map(yard.trucks.map((t) => [t.id, t]));
	const diff = diffAppointments(yard.appointments, live);
	const sc = scale ?? linearScale(yard.shiftLenMin);
	const dockIds = yard.docks.map((d) => d.id);
	const raw = [];
	for (const a of live) {
		const t = trucks.get(a.truckId);
		if (!t) continue;
		const endMin = a.startMin + t.durationMin;
		const left = sc.toPct(a.startMin);
		const width = sc.toPct(endMin) - left;
		if (width <= 0) continue;
		const paint = occupyIndexes(dockIds.length, dockIds.indexOf(a.dockId), berthSpan(t));
		for (const idx of paint) {
			const dockId = dockIds[idx];
			if (!dockId) continue;
			raw.push({
				truckId: a.truckId,
				dockId,
				startMin: a.startMin,
				endMin,
				left,
				width,
				isEvent: a.truckId === eventTruckId,
				changed: diff.has(a.truckId),
				stack: 0
			});
		}
	}
	return packCards(raw, yard.timeUnit === "hour");
}
function layoutFlowBlocks(trace, len, eventTruckId, scale) {
	const sc = scale ?? linearScale(len);
	const gatePacked = packLanes(trace.trucks.map((f) => ({
		id: f.truckId,
		start: f.gateIn.start,
		end: f.gateIn.end
	})));
	const exitPacked = packLanes(trace.trucks.map((f) => ({
		id: f.truckId,
		start: f.gateOut.start,
		end: f.gateOut.end
	})));
	const gateLanes = Math.max(1, ...gatePacked.map((p) => p.lane + 1), 0);
	const exitLanes = Math.max(1, ...exitPacked.map((p) => p.lane + 1), 0);
	const out = [];
	const push = (truckId, row, start, end, lane, lanes) => {
		const left = sc.toPct(start);
		const width = sc.toPct(end) - left;
		if (width <= 0) return;
		out.push({
			truckId,
			row,
			lane,
			lanes,
			startMin: start,
			endMin: end,
			left,
			width,
			isEvent: truckId === eventTruckId
		});
	};
	for (const p of gatePacked) push(p.id, "gate", p.start, p.end, p.lane, gateLanes);
	for (const f of trace.trucks) push(f.truckId, "yard", f.yard.start, f.yard.end, 0, 1);
	for (const p of exitPacked) push(p.id, "exit", p.start, p.end, p.lane, exitLanes);
	return out;
}
function hourMarks(len, step = 60) {
	const out = [];
	for (let t = 0; t <= len; t += step) out.push(t);
	return out;
}
var ROW_H = 80;
var CARD_H = 56;
var CARD_INSET = 12;
var FEATURED_INSET = 8;
var FEATURED_H = 64;
var STACK_INSET = 28;
var DOOR_COL = "5.75rem";
var EMPTY_FLOW = [];
var MINUTE_GEOM = {
	rowH: ROW_H,
	cardH: CARD_H,
	cardInset: CARD_INSET,
	featuredH: FEATURED_H,
	compact: false
};
function geomFor(dockCount, hour) {
	if (!hour) return MINUTE_GEOM;
	const rowH = Math.max(22, Math.min(32, Math.floor(420 / Math.max(1, dockCount))));
	const cardH = Math.max(16, rowH - 4);
	return {
		rowH,
		cardH,
		cardInset: Math.floor((rowH - cardH) / 2),
		featuredH: cardH,
		compact: true
	};
}
var GeomContext = (0, import_react.createContext)(MINUTE_GEOM);
function useGeom() {
	return (0, import_react.useContext)(GeomContext);
}
var Gantt = (0, import_react.memo)(function Gantt({ yard, live, trace, eventTruckId, etaMin, playheadMin, selectedId, onSelect, onForceDock, showFlow = false }) {
	const trucks = (0, import_react.useMemo)(() => new Map(yard.trucks.map((t) => [t.id, t])), [yard.trucks]);
	const orig = (0, import_react.useMemo)(() => new Map(yard.appointments.map((a) => [a.truckId, a])), [yard.appointments]);
	const hour = yard.timeUnit === "hour";
	const geom = (0, import_react.useMemo)(() => geomFor(yard.docks.length, hour), [yard.docks.length, hour]);
	const hole = useBoardStore((s) => hour ? s.result?.certificate?.whyNotGreedy : void 0);
	const scale = (0, import_react.useMemo)(() => {
		const blocks = live.map((a) => {
			const t = trucks.get(a.truckId);
			return {
				startMin: a.startMin,
				endMin: a.startMin + (t?.durationMin ?? 0),
				dockId: a.dockId
			};
		});
		const focus = [];
		if (etaMin != null) focus.push(etaMin);
		const ev = live.find((a) => a.truckId === eventTruckId);
		if (ev) {
			focus.push(ev.startMin);
			const dur = trucks.get(ev.truckId)?.durationMin ?? 0;
			focus.push(ev.startMin + dur);
		}
		if (playheadMin != null) focus.push(playheadMin);
		if (hole && eventTruckId) {
			const dur = trucks.get(eventTruckId)?.durationMin ?? 0;
			focus.push(hole.greedyStartMin, hole.greedyStartMin + dur);
			blocks.push({
				startMin: hole.greedyStartMin,
				endMin: hole.greedyStartMin + dur,
				dockId: hole.greedyDockId
			});
		}
		return buildTimeScale(blocks, focus, yard.shiftLenMin, hour ? "hour" : "minute");
	}, [
		live,
		etaMin,
		eventTruckId,
		playheadMin,
		yard.shiftLenMin,
		trucks,
		hole,
		hour
	]);
	const dockBlocks = (0, import_react.useMemo)(() => layoutDockBlocks(yard, live, eventTruckId, scale), [
		yard,
		live,
		eventTruckId,
		scale
	]);
	const dockIndex = (0, import_react.useMemo)(() => new Map(yard.docks.map((d, i) => [d.id, i])), [yard.docks]);
	const indexed = (0, import_react.useMemo)(() => dockBlocks.map((b) => ({
		...b,
		dockIndex: dockIndex.get(b.dockId) ?? 0
	})), [dockBlocks, dockIndex]);
	const scrollerRef = (0, import_react.useRef)(null);
	const { rows, time } = useVirtualGantt(scrollerRef, yard.docks.length, geom.rowH);
	const selectedDock = yard.appointments.find((a) => a.truckId === selectedId)?.dockId;
	const holeDock = hole?.greedyDockId;
	(0, import_react.useEffect)(() => {
		const el = scrollerRef.current;
		if (!el) return;
		if (hour) {
			const holeIdx = holeDock ? yard.docks.findIndex((d) => d.id === holeDock) : 0;
			const planIdx = selectedDock ? yard.docks.findIndex((d) => d.id === selectedDock) : 0;
			const topIdx = Math.min(holeIdx < 0 ? 0 : holeIdx, planIdx < 0 ? 0 : planIdx);
			const fits = (Math.abs((planIdx < 0 ? 0 : planIdx) - (holeIdx < 0 ? 0 : holeIdx)) + 1) * geom.rowH <= el.clientHeight;
			el.scrollTo({ top: fits ? 0 : Math.max(0, topIdx * geom.rowH) });
			return;
		}
		if (!selectedDock) return;
		const idx = yard.docks.findIndex((d) => d.id === selectedDock);
		if (idx < 0) return;
		el.scrollTo({ top: Math.max(0, idx * ROW_H - ROW_H) });
	}, [
		selectedDock,
		holeDock,
		hour,
		yard.id,
		yard.docks,
		geom.rowH
	]);
	const visBlocks = (0, import_react.useMemo)(() => windowBlocks(indexed, rows, time), [
		indexed,
		rows,
		time
	]);
	const visMarks = (0, import_react.useMemo)(() => windowMarks(scale.marks, scale.toPct, time.x0, time.x1), [
		scale.marks,
		scale.toPct,
		time.x0,
		time.x1
	]);
	const visDocks = yard.docks.slice(rows.start, rows.end);
	const flowBlocks = (0, import_react.useMemo)(() => showFlow ? layoutFlowBlocks(trace, yard.shiftLenMin, eventTruckId, scale) : EMPTY_FLOW, [
		showFlow,
		trace,
		eventTruckId,
		scale,
		yard.shiftLenMin
	]);
	const [tip, setTip] = (0, import_react.useState)(null);
	const onSelectStable = (0, import_react.useCallback)((id) => onSelect(id), [onSelect]);
	const onForceStable = (0, import_react.useCallback)((id) => onForceDock?.(id), [onForceDock]);
	const onHover = (0, import_react.useCallback)((e) => {
		const id = e.target.closest("[data-truck]")?.getAttribute("data-truck") ?? null;
		setTip((cur) => cur === id ? cur : id);
	}, []);
	const tipTruck = tip ? trucks.get(tip) : void 0;
	const tipLive = tip ? live.find((a) => a.truckId === tip) : void 0;
	const tipOrig = tip ? orig.get(tip) : void 0;
	const etaPct = etaMin != null ? scale.toPct(etaMin) : void 0;
	const ghost = eventTruckId ? orig.get(eventTruckId) : void 0;
	const ghostLive = eventTruckId ? live.find((a) => a.truckId === eventTruckId) : void 0;
	const ghostTruck = ghost ? trucks.get(ghost.truckId) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GeomContext.Provider, {
		value: geom,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: scrollerRef,
			"data-gantt-scroll": "",
			"data-scale-start": scale.start,
			"data-scale-end": scale.end,
			className: "max-h-[min(72dvh,42rem)] overflow-auto rounded-2xl bg-surface shadow-card ring-1 ring-line",
			onMouseOver: onHover,
			onMouseLeave: () => setTip(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-gantt px-6 py-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sticky top-0 z-40 mb-2 grid gap-3 bg-surface/95 pb-1 backdrop-blur-sm",
						style: { gridTemplateColumns: `${DOOR_COL} 1fr` },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-end gap-1.5 pb-1 text-xs font-medium text-faint",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon.calendar, { className: "size-3.5" }), yard.timeUnit === "hour" ? "Berth" : "Door"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative h-7",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AxisMarks, {
								scale,
								marks: visMarks,
								shiftStart: yard.shiftStartMin,
								timeUnit: yard.timeUnit
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayheadLayer, {
								scale,
								shiftStart: yard.shiftStartMin,
								timeUnit: yard.timeUnit,
								lockedMin: playheadMin,
								kind: "pill"
							})]
						})]
					}),
					showFlow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowStrip, {
						label: "Gate",
						blocks: flowBlocks.filter((b) => b.row === "gate"),
						marks: visMarks,
						scale,
						etaPct,
						selectedId,
						onSelect: onSelectStable
					}) : null,
					showFlow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowStrip, {
						label: "Yard",
						blocks: flowBlocks.filter((b) => b.row === "yard"),
						marks: visMarks,
						scale,
						etaPct,
						selectedId,
						onSelect: onSelectStable
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						style: { height: yard.docks.length * geom.rowH },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoorRail, {
							docks: visDocks,
							allDocks: yard.docks,
							live,
							trucks,
							shiftLen: yard.shiftLenMin,
							minGap: yard.timeUnit === "hour" ? 2 : 30,
							padTop: rows.padTop,
							start: rows.start,
							onForce: onForceStable
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute top-0 bottom-0 right-0",
							style: { left: DOOR_COL },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Track, {
									docks: yard.docks,
									blocks: visBlocks,
									marks: visMarks,
									trucks,
									scale,
									etaPct,
									selectedId,
									ghost,
									ghostLive,
									ghostTruck,
									shiftStart: yard.shiftStartMin,
									timeUnit: yard.timeUnit,
									onSelect: onSelectStable
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayheadLayer, {
									scale,
									shiftStart: yard.shiftStartMin,
									timeUnit: yard.timeUnit,
									lockedMin: playheadMin,
									kind: "line"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FirstHole, {
									scale,
									docks: yard.docks,
									trucks,
									eventTruckId,
									live
								})
							]
						})]
					}),
					showFlow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowStrip, {
							label: "Exit",
							blocks: flowBlocks.filter((b) => b.row === "exit"),
							marks: visMarks,
							scale,
							etaPct,
							selectedId,
							onSelect: onSelectStable
						})
					}) : null
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendRow, {
			tipTruck,
			tipLive,
			tipOrig,
			shiftStart: yard.shiftStartMin,
			timeUnit: yard.timeUnit,
			dense: scale.dense,
			scaleStart: scale.start,
			scaleEnd: scale.end
		})] })
	});
});
function FirstHole({ scale, docks, trucks, eventTruckId, live }) {
	const hole = useBoardStore((s) => s.yard.timeUnit === "hour" ? s.result?.certificate?.whyNotGreedy : void 0);
	const yard = useBoardStore((s) => s.yard);
	const geom = useGeom();
	if (!hole || !eventTruckId) return null;
	const truck = trucks.get(eventTruckId);
	const chosen = live.find((a) => a.truckId === eventTruckId);
	if (!truck || !chosen) return null;
	if (hole.greedyDockId === chosen.dockId && hole.greedyStartMin === chosen.startMin) return null;
	const leftIndex = docks.findIndex((d) => d.id === hole.greedyDockId);
	const span = truck.span ?? 1;
	if (leftIndex < 0 || span < 1) return null;
	const holder = holdingCall(yard, hole.greedyDockId, hole.greedyStartMin, span);
	const left = scale.toPct(hole.greedyStartMin);
	const width = Math.max(.8, scale.toPct(hole.greedyStartMin + truck.durationMin) - left);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: Array.from({ length: span }, (_, i) => {
		const dock = docks[leftIndex + i];
		if (!dock) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"data-first-hole": i === 0 ? hole.greedyStartMin : void 0,
			"data-first-dock": i === 0 ? hole.greedyDockId : void 0,
			"data-after": i === 0 ? holder ?? "" : void 0,
			className: "pointer-events-none absolute z-20 rounded-md ring-1 ring-dashed ring-bad/70",
			style: {
				top: (leftIndex + i) * geom.rowH + geom.cardInset,
				height: geom.cardH,
				left: `${left}%`,
				width: `${width}%`
			},
			children: i === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "absolute inset-x-1 top-0 truncate font-mono text-[10px] leading-none text-bad",
				children: [
					hole.greedyStartMin,
					"h",
					holder ? ` · ${holder}` : ""
				]
			}) : null
		}, dock.id);
	}) });
}
var AxisMarks = (0, import_react.memo)(function AxisMarks({ scale, marks, shiftStart, timeUnit }) {
	const first = scale.marks[0];
	const last = scale.marks[scale.marks.length - 1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: marks.map((h) => {
		const left = scale.toPct(h);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute font-mono text-[11px] tabular-nums text-faint",
			style: {
				left: `${left}%`,
				transform: h === first ? "none" : h === last ? "translateX(-100%)" : "translateX(-50%)"
			},
			children: formatWhen({
				shiftStartMin: shiftStart,
				timeUnit
			}, h)
		}, h);
	}) });
});
var PlayheadLayer = (0, import_react.memo)(function PlayheadLayer({ scale, shiftStart, timeUnit, lockedMin, kind }) {
	const clock = useAtomValue(clockMinAtom);
	const head = lockedMin ?? clock;
	const pct = scale.toPct(head);
	if (kind === "pill") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "pointer-events-none absolute inset-x-0 top-0 h-7",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute top-0 left-0 w-full",
			style: { transform: `translate3d(${pct}%,0,0)` },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute -translate-x-1/2 rounded-full bg-accent px-2.5 py-1 font-mono text-xs font-medium leading-none text-accent-fg",
				children: formatWhen({
					shiftStartMin: shiftStart,
					timeUnit
				}, Math.round(head))
			})
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "pointer-events-none absolute inset-0 z-20 overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute top-0 bottom-0 left-0 w-full",
			style: { transform: `translate3d(${pct}%,0,0)` },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-0 bottom-0 left-0 w-px bg-accent" })
		})
	});
});
var DoorRail = (0, import_react.memo)(function DoorRail({ docks, allDocks, live, trucks, shiftLen, minGap, padTop, start, onForce }) {
	const clock = useAtomValue(clockMinAtom);
	const occNow = Math.round(clock);
	const geom = useGeom();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute top-0 bottom-0 left-0",
		style: { width: DOOR_COL },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { height: padTop } }), docks.map((dock, i) => {
			const idx = start + i;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoorStatus, {
				dock,
				occupancy: doorOccupancy(dock.id, live, trucks, occNow, shiftLen, allDocks, minGap),
				last: idx === allDocks.length - 1,
				onForce,
				rowH: geom.rowH,
				compact: geom.compact
			}, dock.id);
		})]
	});
});
var HourGrid = (0, import_react.memo)(function HourGrid({ marks, toPct }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: marks.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute top-0 bottom-0 w-px bg-line/45",
		style: { left: `${toPct(h)}%` }
	}, h)) });
});
var Track = (0, import_react.memo)(function Track({ docks, blocks, marks, trucks, scale, etaPct, selectedId, ghost, ghostLive, ghostTruck, shiftStart, timeUnit, onSelect }) {
	const geom = useGeom();
	const showGhost = Boolean(ghost && ghostLive && ghostTruck && (ghost.dockId !== ghostLive.dockId || ghost.startMin !== ghostLive.startMin));
	const ghostIndex = showGhost && ghost ? docks.findIndex((d) => d.id === ghost.dockId) : -1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 [contain:layout_style]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HourGrid, {
				marks,
				toPct: scale.toPct
			}),
			etaPct != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "pointer-events-none absolute top-0 bottom-0 z-20 w-px border-l border-dashed border-accent/40",
				style: { left: `${etaPct}%` }
			}) : null,
			docks.map((dock, i) => i < docks.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute inset-x-0 h-px bg-line/80",
				style: { top: (i + 1) * geom.rowH }
			}, dock.id) : null),
			showGhost && ghost && ghostLive && ghostTruck && ghostIndex >= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "pointer-events-none absolute rounded-xl ring-1 ring-dashed ring-fg/25",
				style: {
					top: ghostIndex * geom.rowH + geom.cardInset,
					height: geom.cardH,
					left: `${scale.toPct(ghost.startMin)}%`,
					width: `${Math.max(0, scale.toPct(ghost.startMin + ghostTruck.durationMin) - scale.toPct(ghost.startMin))}%`
				}
			}) : null,
			blocks.map((b) => {
				const t = trucks.get(b.truckId);
				if (!t) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApptCard, {
					block: b,
					truck: t,
					start: formatWhen({
						shiftStartMin: shiftStart,
						timeUnit
					}, b.startMin),
					featured: b.isEvent,
					selected: b.truckId === selectedId,
					top: b.dockIndex * geom.rowH,
					onSelect
				}, `${b.truckId}-${b.dockId}`);
			})
		]
	});
});
var DoorStatus = (0, import_react.memo)(function DoorStatus({ dock, occupancy, last, onForce, rowH, compact }) {
	const { icon: StatusIcon, label, tone } = doorStatus(occupancy, dock);
	const index = dock.short.replace(/^D|^B/, "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onForce(dock.id),
		className: cn("flex flex-col items-start justify-center px-1 text-left hover:bg-raised/50", !last && "border-b border-line/80"),
		style: { height: rowH },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("font-semibold tabular-nums leading-none tracking-tight", compact ? "font-mono text-[11px]" : "text-2xl"),
			children: index
		}), compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: cn("mt-1 inline-flex items-center gap-1 text-xs font-medium", tone),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIcon, {
				className: "size-3.5",
				strokeWidth: 1.9
			}), label]
		})]
	});
});
var ApptCard = (0, import_react.memo)(function ApptCard({ block, truck, start, featured, selected, top, onSelect }) {
	const geom = useGeom();
	const treatReefer = useBoardStore((s) => s.event?.truckId === block.truckId && s.event?.cargoOverride === "reefer");
	const reefer = truck.cargo === "reefer" || Boolean(treatReefer);
	const stacked = block.stack > 0;
	const inset = geom.compact ? geom.cardInset : stacked ? STACK_INSET : featured ? FEATURED_INSET : CARD_INSET;
	const height = geom.compact ? geom.cardH : featured && !stacked ? FEATURED_H : CARD_H;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-truck": block.truckId,
		onClick: (e) => {
			e.stopPropagation();
			onSelect(block.truckId);
		},
		className: cn("absolute z-10 text-left [contain:layout]", geom.compact ? "" : "[content-visibility:auto]", geom.compact ? "rounded-md px-1" : "rounded-2xl px-3", featured ? "z-30 overflow-visible bg-accent text-accent-fg shadow-float" : "overflow-hidden bg-surface ring-1 ring-line", !featured && block.changed && "bg-ok/10 ring-ok/25", !featured && reefer && !block.changed && "bg-warn/[0.12] ring-warn/25", selected && !featured && "ring-2 ring-accent"),
		style: {
			left: `${block.left}%`,
			width: `${block.width}%`,
			top: top + inset,
			height
		},
		children: [featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pointer-events-none absolute top-0 left-1/2 z-40 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-[3px] ring-surface" }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "pointer-events-none flex h-full items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1.5",
						children: [geom.compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "size-3.5 shrink-0 opacity-80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("truncate font-semibold leading-none tracking-tight", geom.compact ? "font-mono text-[10px]" : "text-sm"),
							children: truck.plate
						})]
					}),
					geom.compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("mt-1.5 flex items-center gap-1 font-mono text-xs leading-none", featured ? "text-accent-fg/80" : "text-muted"),
						children: [start, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CargoMark, {
							cargo: truck.cargo,
							featured,
							className: "size-3"
						})]
					}),
					featured && !geom.compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-2 hidden items-center gap-1 sm:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 rounded-full bg-accent-fg/15 px-1.5 py-0.5 text-[11px] font-medium leading-none",
							children: [reefer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, { className: "size-3" }) : null, reefer ? "Reefer" : "Dry"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-full bg-accent-fg/15 px-1.5 py-0.5 text-[11px] font-medium leading-none",
							children: ["P", truck.priority]
						})]
					}) : null
				]
			}), featured && !stacked && !geom.compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/truck.jpg",
				alt: "",
				className: "hidden h-12 w-16 shrink-0 rounded-lg object-cover outline outline-1 -outline-offset-1 outline-black/10 sm:block"
			}) : null]
		})]
	});
});
var LegendRow = (0, import_react.memo)(function LegendRow({ tipTruck, tipLive, tipOrig, shiftStart, timeUnit, dense, scaleStart, scaleEnd }) {
	if (tipTruck && tipLive) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3 flex flex-wrap items-center gap-2 text-xs text-muted",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "font-mono tabular-nums text-fg",
			children: [
				tipTruck.plate,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mx-2 text-muted",
					children: tipTruck.hauler
				}),
				formatWhen({
					shiftStartMin: shiftStart,
					timeUnit
				}, tipLive.startMin),
				"–",
				formatWhen({
					shiftStartMin: shiftStart,
					timeUnit
				}, tipLive.startMin + tipTruck.durationMin),
				tipOrig && tipOrig.dockId !== tipLive.dockId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-2 text-warn",
					children: ["was ", tipOrig.dockId.replace("D", "")]
				}) : null
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 flex flex-wrap items-center gap-2 text-xs text-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
				icon: Icon.late,
				label: "Late",
				className: "text-bad"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
				icon: Icon.moved,
				label: "Moved",
				className: "text-warn"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
				icon: Icon.reefer,
				label: "Reefer",
				className: "text-accent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
				icon: Icon.dry,
				label: "Dry",
				className: "text-ok"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
				icon: Icon.other,
				label: "Other",
				className: "text-accent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
				icon: Flag,
				label: "Priority"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendStats, {}),
			dense ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "ml-auto text-faint",
				children: [
					"Zoomed ",
					formatWhen({
						shiftStartMin: shiftStart,
						timeUnit
					}, scaleStart),
					"–",
					formatWhen({
						shiftStartMin: shiftStart,
						timeUnit
					}, scaleEnd)
				]
			}) : null
		]
	});
});
function LegendStats() {
	const result = useBoardStore((s) => s.result);
	const hour = useBoardStore((s) => s.yard.timeUnit === "hour");
	if (!result || result.status !== "OPTIMAL") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "ml-auto inline-flex items-center gap-1 text-ok",
		children: [
			"Wait ",
			result.metrics.eventWaitMin,
			hour ? "h" : " min",
			" · k=",
			result.kUsed,
			" · ",
			result.ms,
			"ms"
		]
	});
}
function Legend({ icon: Glyph, label, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex h-8 items-center gap-1.5 rounded-full bg-surface px-2.5 text-xs shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glyph, {
			className: cn("size-3.5", className),
			strokeWidth: 1.9
		}), label]
	});
}
var FlowStrip = (0, import_react.memo)(function FlowStrip({ label, blocks, marks, scale, etaPct, selectedId, onSelect }) {
	const lanes = Math.max(1, ...blocks.map((b) => b.lanes), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-1 grid items-stretch gap-3",
		style: { gridTemplateColumns: `${DOOR_COL} 1fr` },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "self-center text-xs text-faint",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative [contain:layout]",
			style: { height: `${12 + lanes * 16}px` },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HourGrid, {
					marks,
					toPct: scale.toPct
				}),
				etaPct != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pointer-events-none absolute top-0 bottom-0 w-px border-l border-dashed border-accent/40",
					style: { left: `${etaPct}%` }
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayheadLayer, {
					scale,
					shiftStart: 0,
					kind: "line"
				}),
				blocks.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"data-truck": b.truckId,
					onClick: () => onSelect(b.truckId),
					className: cn("absolute overflow-hidden rounded-sm px-1 text-left font-mono text-[10px] tabular-nums", b.isEvent ? "bg-accent text-accent-fg" : "bg-surface text-muted ring-1 ring-line", b.truckId === selectedId && "ring-2 ring-accent"),
					style: {
						left: `${b.left}%`,
						width: `${b.width}%`,
						top: `${4 + b.lane * 16}px`,
						height: "14px"
					},
					children: b.truckId
				}, `${b.row}-${b.truckId}`))
			]
		})]
	});
});
function Inspector({ yard, truck, orig, live, event, result, onFind }) {
	const moved = orig && live && (orig.dockId !== live.dockId || orig.startMin !== live.startMin);
	const start = live ?? orig;
	const hour = yard.timeUnit === "hour";
	const unit = hour ? "h" : "min";
	const startLabel = start ? formatWhen(yard, start.startMin) : "—";
	const endLabel = start ? formatWhen(yard, start.startMin + truck.durationMin) : "—";
	const origDock = orig ? yard.docks.find((d) => d.id === orig.dockId) : void 0;
	const liveDock = live ? yard.docks.find((d) => d.id === live.dockId) : origDock;
	const len = yard.shiftLenMin;
	const wait = event && event.truckId === truck.id && start ? Math.max(0, start.startMin - event.newEtaMin) : 0;
	const forceReefer = useBoardStore((s) => s.forceReefer);
	const reeferOn = truck.cargo === "reefer" || forceReefer;
	const [menu, setMenu] = (0, import_react.useState)(false);
	const menuRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!menu) return;
		const onDoc = (e) => {
			if (!menuRef.current?.contains(e.target)) setMenu(false);
		};
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, [menu]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "flex h-full flex-col overflow-y-auto bg-surface p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-wide text-faint",
					children: "Appointment"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					ref: menuRef,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-faint hover:text-fg",
						"aria-label": "Appointment menu",
						onClick: () => setMenu((v) => !v),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
					}), menu ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute top-full right-0 z-50 mt-1 min-w-40 rounded-xl bg-surface p-1 shadow-float ring-1 ring-line",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-raised",
							onClick: () => {
								setMenu(false);
								navigator.clipboard.writeText(truck.plate);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5 text-muted" }), "Copy plate"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-raised",
							onClick: () => {
								setMenu(false);
								onFind?.();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-3.5 text-muted" }), "Reschedule"]
						})]
					}) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/truck.jpg",
						alt: "",
						className: "size-14 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10"
					}), reeferOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-accent-fg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, { className: "size-3" })
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xl font-semibold tracking-tight text-fg",
					children: truck.plate
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: truck.hauler
				})] })]
			}),
			hour ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 font-mono text-sm tabular-nums text-muted",
				children: [
					"Occupies ",
					truck.span ?? 1,
					" berths · works ",
					truck.durationMin,
					"h"
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							const s = useBoardStore.getState();
							if (!s.forceReefer) s.toggleForceReefer();
						},
						className: cn("inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ring-1", reeferOn ? "bg-accent/10 text-accent ring-accent/25" : "bg-raised text-muted ring-line"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, { className: "size-3.5" }), "Reefer"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							const s = useBoardStore.getState();
							if (s.forceReefer) s.toggleForceReefer();
						},
						className: cn("inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ring-1", !reeferOn ? "bg-ok/10 text-ok ring-ok/25" : "bg-raised text-muted ring-line"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "size-3.5" }), "Dry"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex h-8 items-center rounded-full bg-raised px-2.5 font-mono text-xs tabular-nums text-muted ring-1 ring-line",
						children: ["P", truck.priority]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex justify-between text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Shift" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono tabular-nums",
							children: [
								startLabel,
								" – ",
								endLabel
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative h-2 rounded-full bg-raised",
						children: start ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute top-0 h-2 rounded-full bg-accent",
							style: {
								left: `${start.startMin / len * 100}%`,
								width: `${truck.durationMin / len * 100}%`
							}
						}) : null
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex justify-between font-mono text-xs tabular-nums text-faint",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatWhen(yard, 0) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatWhen(yard, len) })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex items-center justify-between gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoorCard, {
						label: "Booked",
						id: origDock?.short.replace("D", "") ?? "—",
						muted: Boolean(moved)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: cn("size-4 shrink-0", moved ? "text-accent" : "text-faint") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoorCard, {
						label: moved ? "Plan" : "Holds",
						id: liveDock?.short.replace("D", "") ?? "—",
						active: Boolean(moved)
					})
				]
			}),
			event && event.truckId === truck.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-5 text-sm text-bad",
				children: ["Late to ", formatWhen(yard, event.newEtaMin)]
			}), result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: result.status === "OPTIMAL" ? "Draft · not committed" : "No legal draft"
			}) : null] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-sm text-muted",
				children: "On the published board"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-5 space-y-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						icon: Clock,
						label: "Wait",
						value: `${result?.metrics.eventWaitMin ?? wait} ${unit}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						icon: Clock,
						label: "Service time",
						value: `${truck.durationMin} ${unit}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						icon: CalendarClock,
						label: hour ? "Berth" : "Door",
						value: liveDock?.short.replace("D", "") ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						icon: Flag,
						label: "Priority",
						value: `P${truck.priority}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						icon: Snowflake,
						label: "Type",
						value: hour ? "Not in the file" : forceReefer && truck.cargo !== "reefer" ? "Dry · treat as reefer" : truck.cargo === "reefer" ? "Reefer" : "Dry"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto flex flex-wrap gap-2 border-t border-line pt-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "secondary",
						size: "sm",
						className: "rounded-full",
						onClick: onFind,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-3.5" }), "Reschedule"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						className: "rounded-full",
						onClick: () => useBoardStore.getState().hold(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3.5" }), "Hold"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						className: "rounded-full shadow-[var(--shadow-float)]",
						onClick: () => useBoardStore.getState().nudge(15),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "size-3.5" }), "Edit plan"]
					})
				]
			})
		]
	});
}
function Row({ icon: Icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex items-center gap-2 text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }), label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-sm tabular-nums",
			children: value
		})]
	});
}
function DoorCard({ label, id, muted, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex-1 rounded-2xl px-3.5 py-3.5 ring-1", active ? "bg-accent/10 text-fg ring-accent/30 shadow-[inset_0_0_0_1px_rgba(91,77,255,0.08)]" : "bg-raised/80 ring-line"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: cn("inline-flex items-center gap-1 text-[11px] font-medium", active ? "text-accent" : "text-faint"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-3" }), label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-1 font-mono text-2xl tabular-nums", muted && !active && "text-muted"),
			children: id
		})]
	});
}
var bcn_24B_11_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 18,
	n_periods: 336,
	arrival_time: [
		25,
		126,
		156,
		47,
		72,
		23,
		59,
		4,
		40,
		28,
		142,
		126,
		105,
		161,
		38,
		83,
		126,
		52
	],
	handling_time: [
		31,
		18,
		10,
		20,
		14,
		15,
		14,
		17,
		9,
		17,
		10,
		15,
		13,
		43,
		34,
		33,
		11,
		21
	],
	ship_len: [
		8,
		5,
		6,
		7,
		7,
		7,
		6,
		5,
		6,
		6,
		4,
		5,
		4,
		8,
		8,
		4,
		4,
		5
	]
};
var bcn_24B_12_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 17,
	n_periods: 336,
	arrival_time: [
		27,
		115,
		141,
		0,
		47,
		123,
		72,
		4,
		41,
		104,
		28,
		142,
		25,
		38,
		126,
		82,
		163
	],
	handling_time: [
		5,
		10,
		21,
		23,
		20,
		15,
		14,
		17,
		15,
		14,
		17,
		10,
		12,
		34,
		11,
		32,
		31
	],
	ship_len: [
		4,
		7,
		5,
		7,
		7,
		5,
		7,
		5,
		6,
		6,
		6,
		4,
		7,
		8,
		4,
		4,
		5
	]
};
var bcn_24B_13_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 19,
	n_periods: 336,
	arrival_time: [
		27,
		115,
		12,
		141,
		0,
		123,
		111,
		131,
		41,
		104,
		35,
		48,
		25,
		3,
		137,
		152,
		82,
		100,
		120
	],
	handling_time: [
		5,
		10,
		23,
		21,
		23,
		15,
		15,
		21,
		15,
		14,
		17,
		13,
		12,
		17,
		5,
		23,
		32,
		5,
		14
	],
	ship_len: [
		4,
		7,
		4,
		5,
		7,
		5,
		5,
		7,
		6,
		6,
		8,
		7,
		7,
		6,
		4,
		5,
		4,
		3,
		7
	]
};
var bcn_24B_14_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 19,
	n_periods: 336,
	arrival_time: [
		12,
		159,
		139,
		111,
		110,
		131,
		35,
		48,
		37,
		29,
		3,
		137,
		154,
		107,
		59,
		100,
		120,
		86,
		132
	],
	handling_time: [
		23,
		18,
		29,
		15,
		30,
		21,
		17,
		13,
		10,
		19,
		17,
		5,
		14,
		12,
		24,
		5,
		14,
		17,
		19
	],
	ship_len: [
		4,
		5,
		8,
		5,
		8,
		7,
		8,
		7,
		6,
		7,
		6,
		4,
		5,
		6,
		5,
		3,
		7,
		5,
		5
	]
};
var bcn_24B_15_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 21,
	n_periods: 336,
	arrival_time: [
		110,
		15,
		43,
		119,
		126,
		142,
		37,
		29,
		79,
		83,
		96,
		107,
		53,
		155,
		59,
		18,
		115,
		34,
		53,
		86,
		132
	],
	handling_time: [
		30,
		16,
		14,
		12,
		37,
		29,
		10,
		19,
		13,
		14,
		28,
		12,
		21,
		7,
		24,
		21,
		18,
		11,
		13,
		17,
		19
	],
	ship_len: [
		8,
		5,
		8,
		5,
		8,
		7,
		6,
		7,
		6,
		6,
		8,
		6,
		5,
		4,
		5,
		6,
		5,
		4,
		4,
		5,
		5
	]
};
var bcn_24B_16_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 25,
	n_periods: 336,
	arrival_time: [
		118,
		15,
		43,
		119,
		36,
		126,
		79,
		83,
		96,
		12,
		125,
		137,
		53,
		155,
		130,
		18,
		115,
		154,
		30,
		96,
		165,
		34,
		53,
		82,
		149
	],
	handling_time: [
		12,
		16,
		14,
		12,
		10,
		37,
		13,
		14,
		28,
		13,
		18,
		15,
		21,
		7,
		20,
		21,
		18,
		17,
		12,
		18,
		35,
		11,
		13,
		33,
		16
	],
	ship_len: [
		5,
		5,
		8,
		5,
		7,
		8,
		6,
		6,
		8,
		7,
		6,
		6,
		5,
		4,
		5,
		6,
		5,
		5,
		5,
		7,
		8,
		4,
		4,
		4,
		6
	]
};
var bcn_24B_17_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 21,
	n_periods: 336,
	arrival_time: [
		118,
		28,
		155,
		4,
		72,
		126,
		36,
		12,
		125,
		137,
		16,
		23,
		130,
		106,
		30,
		96,
		82,
		81,
		125,
		148,
		149
	],
	handling_time: [
		12,
		22,
		18,
		17,
		22,
		12,
		10,
		13,
		18,
		15,
		11,
		12,
		20,
		10,
		12,
		18,
		33,
		33,
		12,
		19,
		16
	],
	ship_len: [
		5,
		8,
		7,
		5,
		8,
		5,
		7,
		7,
		6,
		6,
		6,
		6,
		5,
		4,
		5,
		7,
		4,
		4,
		4,
		6,
		6
	]
};
var bcn_24B_18_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 21,
	n_periods: 336,
	arrival_time: [
		28,
		4,
		72,
		126,
		46,
		150,
		16,
		23,
		6,
		118,
		106,
		73,
		106,
		82,
		119,
		81,
		125,
		148,
		91,
		37,
		31
	],
	handling_time: [
		22,
		17,
		22,
		12,
		24,
		10,
		11,
		12,
		16,
		32,
		10,
		14,
		8,
		14,
		27,
		33,
		12,
		19,
		24,
		36,
		10
	],
	ship_len: [
		8,
		5,
		8,
		5,
		7,
		5,
		6,
		6,
		7,
		5,
		4,
		6,
		5,
		8,
		5,
		4,
		4,
		6,
		4,
		8,
		5
	]
};
var bcn_24B_19_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 25,
	n_periods: 336,
	arrival_time: [
		70,
		77,
		139,
		46,
		150,
		167,
		18,
		6,
		118,
		56,
		106,
		111,
		73,
		106,
		159,
		87,
		111,
		82,
		119,
		28,
		131,
		91,
		22,
		37,
		31
	],
	handling_time: [
		14,
		29,
		22,
		24,
		10,
		20,
		27,
		16,
		32,
		20,
		18,
		17,
		14,
		8,
		20,
		11,
		10,
		14,
		27,
		18,
		20,
		24,
		9,
		36,
		10
	],
	ship_len: [
		7,
		8,
		8,
		7,
		5,
		6,
		8,
		7,
		5,
		8,
		6,
		8,
		6,
		5,
		8,
		6,
		4,
		8,
		5,
		5,
		5,
		4,
		4,
		8,
		5
	]
};
var bcn_24B_20_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 26,
	n_periods: 336,
	arrival_time: [
		149,
		154,
		70,
		77,
		106,
		139,
		18,
		18,
		163,
		124,
		94,
		56,
		106,
		111,
		115,
		87,
		111,
		11,
		28,
		131,
		32,
		43,
		130,
		82,
		22,
		46
	],
	handling_time: [
		6,
		20,
		14,
		29,
		11,
		22,
		27,
		11,
		38,
		12,
		15,
		20,
		18,
		17,
		18,
		11,
		10,
		19,
		18,
		20,
		12,
		13,
		20,
		13,
		9,
		19
	],
	ship_len: [
		4,
		7,
		7,
		8,
		5,
		8,
		8,
		5,
		8,
		5,
		7,
		8,
		6,
		8,
		8,
		6,
		4,
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		4,
		5
	]
};
var bcn_24B_21_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 22,
	n_periods: 336,
	arrival_time: [
		149,
		157,
		125,
		106,
		18,
		124,
		94,
		115,
		25,
		53,
		111,
		11,
		29,
		32,
		43,
		130,
		109,
		82,
		52,
		81,
		46,
		82
	],
	handling_time: [
		6,
		36,
		26,
		11,
		11,
		12,
		15,
		18,
		17,
		16,
		37,
		19,
		21,
		12,
		13,
		20,
		17,
		13,
		8,
		33,
		19,
		17
	],
	ship_len: [
		4,
		7,
		5,
		5,
		5,
		5,
		7,
		8,
		8,
		7,
		8,
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		4,
		4,
		5,
		5
	]
};
var bcn_24B_22_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 24,
	n_periods: 336,
	arrival_time: [
		125,
		22,
		4,
		124,
		25,
		53,
		111,
		151,
		3,
		63,
		87,
		114,
		123,
		29,
		75,
		141,
		109,
		133,
		52,
		81,
		81,
		95,
		82,
		154
	],
	handling_time: [
		26,
		8,
		28,
		13,
		17,
		16,
		37,
		18,
		17,
		23,
		18,
		16,
		15,
		21,
		23,
		19,
		17,
		18,
		8,
		33,
		34,
		26,
		17,
		15
	],
	ship_len: [
		5,
		4,
		8,
		5,
		8,
		7,
		8,
		8,
		6,
		8,
		7,
		8,
		5,
		5,
		6,
		5,
		5,
		5,
		4,
		4,
		4,
		5,
		5,
		5
	]
};
var bcn_24B_23_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 24,
	n_periods: 336,
	arrival_time: [
		24,
		22,
		8,
		108,
		4,
		10,
		124,
		154,
		3,
		63,
		87,
		114,
		123,
		75,
		141,
		6,
		65,
		133,
		125,
		144,
		81,
		41,
		82,
		95
	],
	handling_time: [
		11,
		8,
		11,
		22,
		28,
		32,
		13,
		15,
		17,
		23,
		18,
		16,
		15,
		23,
		19,
		16,
		14,
		18,
		12,
		18,
		34,
		12,
		34,
		26
	],
	ship_len: [
		7,
		4,
		4,
		8,
		8,
		8,
		5,
		7,
		6,
		8,
		7,
		8,
		5,
		6,
		5,
		6,
		5,
		5,
		5,
		5,
		4,
		4,
		4,
		5
	]
};
var bcn_24B_24_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 23,
	n_periods: 336,
	arrival_time: [
		24,
		8,
		70,
		108,
		10,
		144,
		4,
		119,
		119,
		4,
		43,
		52,
		94,
		6,
		65,
		74,
		125,
		144,
		29,
		138,
		41,
		82,
		19
	],
	handling_time: [
		11,
		11,
		38,
		22,
		32,
		25,
		36,
		14,
		17,
		13,
		24,
		20,
		18,
		16,
		14,
		16,
		12,
		18,
		19,
		15,
		12,
		34,
		7
	],
	ship_len: [
		7,
		4,
		8,
		8,
		8,
		7,
		8,
		5,
		7,
		6,
		7,
		6,
		5,
		6,
		5,
		5,
		5,
		5,
		5,
		5,
		4,
		4,
		4
	]
};
var bcn_24B_26_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 21,
	n_periods: 336,
	arrival_time: [
		30,
		30,
		3,
		166,
		129,
		72,
		10,
		40,
		48,
		64,
		122,
		25,
		100,
		128,
		149,
		130,
		47,
		143,
		95,
		5,
		47
	],
	handling_time: [
		12,
		12,
		15,
		27,
		12,
		14,
		16,
		21,
		22,
		29,
		13,
		12,
		27,
		32,
		13,
		13,
		24,
		19,
		11,
		16,
		15
	],
	ship_len: [
		8,
		5,
		5,
		6,
		5,
		7,
		6,
		6,
		5,
		7,
		6,
		7,
		6,
		8,
		8,
		4,
		8,
		5,
		5,
		5,
		5
	]
};
var bcn_24B_27_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 25,
	n_periods: 336,
	arrival_time: [
		48,
		30,
		151,
		3,
		129,
		1,
		25,
		100,
		128,
		22,
		43,
		58,
		64,
		76,
		100,
		130,
		148,
		106,
		47,
		96,
		119,
		139,
		82,
		5,
		47
	],
	handling_time: [
		14,
		12,
		15,
		15,
		12,
		43,
		12,
		27,
		32,
		18,
		10,
		11,
		25,
		19,
		46,
		13,
		36,
		11,
		24,
		17,
		11,
		24,
		15,
		16,
		15
	],
	ship_len: [
		7,
		8,
		4,
		5,
		5,
		8,
		7,
		6,
		8,
		8,
		6,
		5,
		7,
		6,
		8,
		4,
		5,
		4,
		8,
		5,
		5,
		5,
		4,
		5,
		5
	]
};
var bcn_24B_28_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 25,
	n_periods: 336,
	arrival_time: [
		48,
		165,
		151,
		1,
		132,
		30,
		22,
		43,
		58,
		64,
		76,
		100,
		39,
		121,
		106,
		11,
		122,
		96,
		119,
		139,
		77,
		88,
		71,
		119,
		82
	],
	handling_time: [
		14,
		27,
		15,
		43,
		12,
		14,
		18,
		10,
		11,
		25,
		19,
		46,
		14,
		4,
		11,
		12,
		8,
		17,
		11,
		24,
		24,
		25,
		11,
		45,
		15
	],
	ship_len: [
		7,
		7,
		4,
		8,
		5,
		7,
		8,
		6,
		5,
		7,
		6,
		8,
		8,
		5,
		4,
		6,
		4,
		5,
		5,
		5,
		7,
		5,
		6,
		8,
		4
	]
};
var bcn_24B_29_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 25,
	n_periods: 336,
	arrival_time: [
		17,
		34,
		132,
		106,
		130,
		28,
		30,
		39,
		121,
		154,
		7,
		15,
		76,
		95,
		115,
		11,
		122,
		38,
		149,
		77,
		88,
		71,
		119,
		70,
		107
	],
	handling_time: [
		14,
		8,
		12,
		14,
		16,
		17,
		14,
		14,
		4,
		17,
		14,
		8,
		11,
		6,
		17,
		12,
		8,
		19,
		14,
		24,
		25,
		11,
		45,
		43,
		17
	],
	ship_len: [
		3,
		5,
		5,
		5,
		7,
		7,
		7,
		8,
		5,
		7,
		6,
		5,
		7,
		5,
		8,
		6,
		4,
		5,
		5,
		7,
		5,
		6,
		8,
		8,
		4
	]
};
var bcn_24B_3_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 19,
	n_periods: 336,
	arrival_time: [
		16,
		149,
		83,
		16,
		132,
		17,
		32,
		155,
		120,
		120,
		109,
		6,
		63,
		78,
		8,
		23,
		97,
		83,
		107
	],
	handling_time: [
		8,
		14,
		47,
		13,
		13,
		11,
		16,
		10,
		20,
		17,
		9,
		6,
		10,
		37,
		5,
		11,
		6,
		34,
		13
	],
	ship_len: [
		4,
		4,
		4,
		5,
		5,
		6,
		6,
		4,
		5,
		5,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4
	]
};
var bcn_24B_30_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 26,
	n_periods: 336,
	arrival_time: [
		17,
		155,
		22,
		97,
		34,
		118,
		106,
		130,
		162,
		66,
		137,
		28,
		7,
		15,
		76,
		95,
		115,
		19,
		47,
		49,
		38,
		149,
		100,
		70,
		107,
		11
	],
	handling_time: [
		14,
		15,
		23,
		33,
		8,
		15,
		14,
		16,
		16,
		17,
		15,
		17,
		14,
		8,
		11,
		6,
		17,
		18,
		9,
		45,
		19,
		14,
		6,
		43,
		17,
		21
	],
	ship_len: [
		3,
		4,
		5,
		8,
		5,
		8,
		5,
		7,
		7,
		7,
		5,
		7,
		6,
		5,
		7,
		5,
		8,
		5,
		6,
		8,
		5,
		5,
		5,
		8,
		4,
		5
	]
};
var bcn_24B_31_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 21,
	n_periods: 336,
	arrival_time: [
		22,
		156,
		97,
		118,
		66,
		137,
		111,
		19,
		47,
		49,
		27,
		52,
		70,
		89,
		100,
		22,
		32,
		78,
		11,
		153,
		40
	],
	handling_time: [
		23,
		42,
		33,
		15,
		17,
		15,
		19,
		18,
		9,
		45,
		18,
		22,
		14,
		19,
		6,
		13,
		9,
		5,
		21,
		31,
		22
	],
	ship_len: [
		5,
		4,
		8,
		8,
		7,
		5,
		7,
		5,
		6,
		8,
		6,
		8,
		6,
		8,
		5,
		5,
		4,
		4,
		5,
		5,
		5
	]
};
var bcn_24B_32_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 22,
	n_periods: 336,
	arrival_time: [
		6,
		93,
		118,
		58,
		111,
		131,
		27,
		52,
		135,
		138,
		47,
		61,
		70,
		89,
		124,
		22,
		7,
		23,
		80,
		32,
		78,
		40
	],
	handling_time: [
		28,
		17,
		15,
		16,
		19,
		15,
		18,
		22,
		33,
		34,
		12,
		12,
		14,
		19,
		21,
		13,
		14,
		18,
		4,
		9,
		5,
		22
	],
	ship_len: [
		4,
		5,
		8,
		7,
		7,
		5,
		6,
		8,
		7,
		7,
		6,
		6,
		6,
		8,
		5,
		5,
		5,
		6,
		5,
		4,
		4,
		5
	]
};
var bcn_24B_33_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 24,
	n_periods: 336,
	arrival_time: [
		6,
		154,
		95,
		127,
		58,
		35,
		93,
		118,
		58,
		131,
		4,
		47,
		61,
		155,
		82,
		98,
		126,
		124,
		115,
		7,
		23,
		36,
		80,
		101
	],
	handling_time: [
		28,
		30,
		11,
		31,
		35,
		11,
		17,
		15,
		16,
		15,
		26,
		12,
		12,
		13,
		13,
		17,
		38,
		21,
		14,
		14,
		18,
		17,
		4,
		15
	],
	ship_len: [
		4,
		4,
		7,
		4,
		8,
		5,
		5,
		8,
		7,
		5,
		6,
		6,
		6,
		6,
		6,
		5,
		5,
		5,
		5,
		5,
		6,
		8,
		5,
		4
	]
};
var bcn_24B_34_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 25,
	n_periods: 336,
	arrival_time: [
		0,
		95,
		127,
		58,
		35,
		4,
		38,
		145,
		144,
		82,
		98,
		126,
		138,
		11,
		36,
		74,
		120,
		115,
		36,
		77,
		100,
		77,
		101,
		107,
		59
	],
	handling_time: [
		29,
		11,
		31,
		35,
		11,
		26,
		34,
		17,
		16,
		13,
		17,
		38,
		36,
		25,
		21,
		18,
		22,
		14,
		17,
		15,
		17,
		20,
		15,
		31,
		15
	],
	ship_len: [
		8,
		7,
		4,
		8,
		5,
		6,
		8,
		5,
		7,
		6,
		5,
		5,
		8,
		8,
		8,
		7,
		5,
		5,
		8,
		5,
		5,
		5,
		4,
		8,
		5
	]
};
var bcn_24B_35_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 22,
	n_periods: 336,
	arrival_time: [
		0,
		167,
		38,
		145,
		46,
		88,
		144,
		11,
		36,
		74,
		120,
		5,
		21,
		71,
		118,
		140,
		94,
		77,
		100,
		77,
		107,
		59
	],
	handling_time: [
		29,
		19,
		34,
		17,
		32,
		35,
		16,
		25,
		21,
		18,
		22,
		12,
		12,
		12,
		12,
		16,
		14,
		15,
		17,
		20,
		31,
		15
	],
	ship_len: [
		8,
		7,
		8,
		5,
		8,
		8,
		7,
		8,
		8,
		7,
		5,
		6,
		8,
		6,
		5,
		7,
		5,
		5,
		5,
		5,
		8,
		5
	]
};
var bcn_24B_36_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 20,
	n_periods: 336,
	arrival_time: [
		46,
		88,
		130,
		5,
		21,
		71,
		118,
		140,
		4,
		37,
		82,
		103,
		94,
		33,
		91,
		154,
		12,
		113,
		29,
		7
	],
	handling_time: [
		32,
		35,
		18,
		12,
		12,
		12,
		12,
		16,
		6,
		19,
		13,
		18,
		14,
		14,
		16,
		20,
		13,
		13,
		6,
		23
	],
	ship_len: [
		8,
		8,
		7,
		6,
		8,
		6,
		5,
		7,
		5,
		7,
		6,
		8,
		5,
		6,
		5,
		5,
		5,
		5,
		4,
		4
	]
};
var bcn_24B_37_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 21,
	n_periods: 336,
	arrival_time: [
		150,
		18,
		156,
		10,
		130,
		4,
		37,
		82,
		103,
		29,
		76,
		118,
		33,
		91,
		12,
		113,
		29,
		36,
		7,
		47,
		155
	],
	handling_time: [
		14,
		7,
		16,
		21,
		18,
		6,
		19,
		13,
		18,
		13,
		14,
		40,
		14,
		16,
		13,
		13,
		6,
		10,
		23,
		18,
		17
	],
	ship_len: [
		5,
		5,
		5,
		7,
		7,
		5,
		7,
		6,
		8,
		8,
		7,
		8,
		6,
		5,
		5,
		5,
		4,
		4,
		4,
		8,
		5
	]
};
var bcn_24B_38_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 26,
	n_periods: 336,
	arrival_time: [
		151,
		150,
		47,
		18,
		162,
		21,
		10,
		115,
		143,
		29,
		76,
		118,
		46,
		60,
		83,
		150,
		106,
		121,
		125,
		66,
		36,
		30,
		47,
		88,
		11,
		29
	],
	handling_time: [
		25,
		14,
		4,
		7,
		21,
		35,
		21,
		11,
		15,
		13,
		14,
		40,
		14,
		16,
		35,
		13,
		10,
		13,
		15,
		15,
		10,
		4,
		18,
		11,
		13,
		12
	],
	ship_len: [
		5,
		5,
		4,
		5,
		8,
		8,
		7,
		5,
		7,
		8,
		7,
		8,
		6,
		8,
		8,
		5,
		4,
		8,
		5,
		5,
		4,
		4,
		8,
		4,
		6,
		5
	]
};
var bcn_24B_39_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 29,
	n_periods: 336,
	arrival_time: [
		47,
		108,
		21,
		167,
		115,
		143,
		37,
		107,
		142,
		46,
		60,
		83,
		150,
		11,
		48,
		149,
		106,
		121,
		125,
		89,
		66,
		120,
		125,
		34,
		30,
		88,
		151,
		11,
		29
	],
	handling_time: [
		4,
		8,
		35,
		25,
		11,
		15,
		25,
		11,
		20,
		14,
		16,
		35,
		13,
		20,
		21,
		15,
		10,
		13,
		15,
		20,
		15,
		18,
		14,
		9,
		4,
		11,
		23,
		13,
		12
	],
	ship_len: [
		4,
		4,
		8,
		8,
		5,
		7,
		8,
		5,
		7,
		6,
		8,
		8,
		5,
		7,
		7,
		6,
		4,
		8,
		5,
		5,
		5,
		8,
		5,
		5,
		4,
		4,
		4,
		6,
		5
	]
};
var bcn_24B_4_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 25,
	n_periods: 336,
	arrival_time: [
		37,
		112,
		83,
		132,
		162,
		53,
		17,
		37,
		32,
		155,
		150,
		120,
		97,
		120,
		8,
		23,
		97,
		83,
		107,
		8,
		54,
		67,
		84,
		81,
		131
	],
	handling_time: [
		6,
		15,
		47,
		13,
		8,
		26,
		11,
		9,
		16,
		10,
		8,
		17,
		16,
		11,
		5,
		11,
		6,
		34,
		13,
		6,
		4,
		15,
		31,
		17,
		11
	],
	ship_len: [
		4,
		4,
		4,
		5,
		5,
		7,
		6,
		7,
		6,
		4,
		4,
		5,
		5,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		5,
		5
	]
};
var bcn_24B_40_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 24,
	n_periods: 336,
	arrival_time: [
		108,
		95,
		37,
		107,
		142,
		133,
		11,
		48,
		149,
		36,
		90,
		125,
		89,
		120,
		125,
		8,
		11,
		107,
		34,
		77,
		143,
		63,
		93,
		139
	],
	handling_time: [
		8,
		14,
		25,
		11,
		20,
		10,
		20,
		21,
		15,
		15,
		12,
		17,
		20,
		18,
		14,
		19,
		21,
		21,
		9,
		16,
		26,
		24,
		11,
		28
	],
	ship_len: [
		4,
		7,
		8,
		5,
		7,
		5,
		7,
		7,
		6,
		6,
		6,
		7,
		5,
		8,
		5,
		7,
		5,
		5,
		5,
		3,
		4,
		4,
		4,
		4
	]
};
var bcn_24B_41_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 26,
	n_periods: 336,
	arrival_time: [
		138,
		144,
		12,
		95,
		133,
		153,
		153,
		39,
		36,
		90,
		125,
		4,
		23,
		119,
		31,
		106,
		142,
		8,
		11,
		107,
		47,
		77,
		130,
		63,
		93,
		139
	],
	handling_time: [
		13,
		42,
		15,
		14,
		10,
		15,
		11,
		35,
		15,
		12,
		17,
		17,
		12,
		19,
		11,
		7,
		24,
		19,
		21,
		21,
		23,
		16,
		13,
		24,
		11,
		28
	],
	ship_len: [
		7,
		8,
		5,
		7,
		5,
		6,
		5,
		8,
		6,
		6,
		7,
		6,
		8,
		5,
		6,
		4,
		5,
		7,
		5,
		5,
		7,
		3,
		6,
		4,
		4,
		4
	]
};
var bcn_24B_42_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 27,
	n_periods: 336,
	arrival_time: [
		138,
		83,
		12,
		108,
		153,
		10,
		115,
		100,
		10,
		39,
		4,
		23,
		119,
		160,
		47,
		35,
		31,
		106,
		142,
		137,
		47,
		130,
		6,
		48,
		126,
		28,
		82
	],
	handling_time: [
		13,
		11,
		15,
		16,
		11,
		19,
		16,
		34,
		15,
		35,
		17,
		12,
		19,
		16,
		12,
		44,
		11,
		7,
		24,
		13,
		23,
		13,
		5,
		9,
		11,
		14,
		13
	],
	ship_len: [
		7,
		8,
		5,
		4,
		5,
		8,
		5,
		8,
		7,
		8,
		6,
		8,
		5,
		8,
		6,
		8,
		6,
		4,
		5,
		5,
		7,
		6,
		5,
		4,
		4,
		5,
		5
	]
};
var bcn_24B_43_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 26,
	n_periods: 336,
	arrival_time: [
		3,
		83,
		33,
		108,
		10,
		115,
		100,
		107,
		10,
		149,
		47,
		35,
		11,
		30,
		93,
		128,
		137,
		152,
		92,
		6,
		48,
		126,
		142,
		28,
		82,
		15
	],
	handling_time: [
		22,
		11,
		46,
		16,
		19,
		16,
		34,
		11,
		15,
		19,
		12,
		44,
		11,
		22,
		12,
		21,
		13,
		13,
		29,
		5,
		9,
		11,
		38,
		14,
		13,
		11
	],
	ship_len: [
		7,
		8,
		8,
		4,
		8,
		5,
		8,
		5,
		7,
		8,
		6,
		8,
		6,
		6,
		6,
		8,
		5,
		5,
		8,
		5,
		4,
		4,
		5,
		5,
		5,
		5
	]
};
var bcn_24B_44_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 24,
	n_periods: 336,
	arrival_time: [
		3,
		33,
		91,
		119,
		107,
		136,
		142,
		11,
		30,
		93,
		128,
		151,
		35,
		52,
		129,
		106,
		152,
		5,
		79,
		92,
		72,
		11,
		142,
		15
	],
	handling_time: [
		22,
		46,
		39,
		13,
		11,
		12,
		15,
		11,
		22,
		12,
		21,
		17,
		25,
		34,
		16,
		21,
		13,
		41,
		10,
		29,
		4,
		21,
		35,
		11
	],
	ship_len: [
		7,
		8,
		8,
		5,
		5,
		5,
		7,
		6,
		6,
		6,
		8,
		7,
		5,
		8,
		6,
		6,
		5,
		5,
		5,
		8,
		5,
		4,
		4,
		5
	]
};
var bcn_24B_45_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 26,
	n_periods: 336,
	arrival_time: [
		91,
		119,
		120,
		136,
		157,
		127,
		13,
		142,
		35,
		52,
		129,
		72,
		79,
		106,
		31,
		112,
		5,
		79,
		166,
		23,
		90,
		72,
		80,
		102,
		11,
		139
	],
	handling_time: [
		39,
		13,
		9,
		12,
		14,
		6,
		14,
		15,
		25,
		34,
		16,
		12,
		16,
		21,
		18,
		7,
		41,
		10,
		20,
		13,
		6,
		4,
		5,
		15,
		21,
		22
	],
	ship_len: [
		8,
		5,
		4,
		5,
		7,
		5,
		7,
		7,
		5,
		8,
		6,
		6,
		8,
		6,
		6,
		5,
		5,
		5,
		5,
		8,
		5,
		5,
		5,
		5,
		4,
		5
	]
};
var bcn_24B_46_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 24,
	n_periods: 336,
	arrival_time: [
		73,
		120,
		127,
		128,
		13,
		72,
		79,
		16,
		62,
		141,
		31,
		112,
		41,
		49,
		23,
		90,
		116,
		108,
		80,
		102,
		87,
		30,
		139,
		0
	],
	handling_time: [
		26,
		9,
		6,
		13,
		14,
		12,
		16,
		27,
		14,
		22,
		18,
		7,
		18,
		22,
		13,
		6,
		10,
		23,
		5,
		15,
		4,
		8,
		22,
		11
	],
	ship_len: [
		5,
		4,
		5,
		5,
		7,
		6,
		8,
		7,
		6,
		8,
		6,
		5,
		8,
		5,
		8,
		5,
		5,
		5,
		5,
		5,
		5,
		4,
		5,
		5
	]
};
var bcn_24B_48_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 25,
	n_periods: 336,
	arrival_time: [
		127,
		50,
		19,
		33,
		37,
		102,
		4,
		22,
		67,
		139,
		85,
		101,
		124,
		58,
		107,
		110,
		72,
		144,
		17,
		59,
		68,
		30,
		157,
		48,
		60
	],
	handling_time: [
		21,
		14,
		2,
		18,
		20,
		4,
		16,
		20,
		27,
		16,
		14,
		13,
		38,
		13,
		7,
		17,
		15,
		18,
		15,
		16,
		22,
		4,
		25,
		15,
		23
	],
	ship_len: [
		5,
		7,
		5,
		8,
		6,
		5,
		6,
		5,
		7,
		6,
		6,
		6,
		6,
		5,
		4,
		5,
		5,
		4,
		5,
		5,
		8,
		5,
		4,
		5,
		5
	]
};
var bcn_24B_49_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 24,
	n_periods: 336,
	arrival_time: [
		23,
		77,
		127,
		6,
		50,
		37,
		102,
		159,
		123,
		85,
		101,
		124,
		9,
		30,
		73,
		97,
		131,
		107,
		120,
		17,
		59,
		68,
		48,
		60
	],
	handling_time: [
		20,
		13,
		21,
		12,
		14,
		20,
		4,
		28,
		39,
		14,
		13,
		38,
		18,
		40,
		27,
		18,
		25,
		13,
		7,
		15,
		16,
		22,
		12,
		23
	],
	ship_len: [
		7,
		4,
		5,
		4,
		7,
		6,
		5,
		5,
		8,
		6,
		6,
		6,
		8,
		8,
		8,
		5,
		8,
		8,
		4,
		5,
		5,
		8,
		6,
		5
	]
};
var bcn_24B_5_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 28,
	n_periods: 336,
	arrival_time: [
		97,
		138,
		37,
		112,
		163,
		53,
		149,
		23,
		53,
		47,
		65,
		37,
		111,
		150,
		6,
		97,
		129,
		120,
		8,
		54,
		67,
		84,
		167,
		36,
		84,
		120,
		81,
		131
	],
	handling_time: [
		24,
		8,
		6,
		15,
		11,
		13,
		16,
		20,
		26,
		26,
		39,
		9,
		18,
		8,
		12,
		16,
		12,
		11,
		6,
		4,
		15,
		31,
		6,
		10,
		32,
		10,
		17,
		11
	],
	ship_len: [
		5,
		4,
		4,
		4,
		5,
		4,
		4,
		8,
		7,
		8,
		8,
		7,
		8,
		4,
		6,
		5,
		5,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		5,
		5
	]
};
var bcn_24B_6_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 29,
	n_periods: 336,
	arrival_time: [
		97,
		138,
		53,
		149,
		23,
		47,
		65,
		3,
		111,
		78,
		111,
		167,
		54,
		32,
		6,
		156,
		25,
		143,
		129,
		88,
		131,
		36,
		84,
		120,
		41,
		59,
		78,
		144,
		155
	],
	handling_time: [
		24,
		8,
		13,
		16,
		20,
		26,
		39,
		17,
		16,
		30,
		18,
		23,
		9,
		43,
		12,
		12,
		14,
		10,
		12,
		18,
		8,
		10,
		32,
		10,
		14,
		13,
		43,
		10,
		6
	],
	ship_len: [
		5,
		4,
		4,
		4,
		8,
		8,
		8,
		5,
		5,
		8,
		8,
		6,
		6,
		8,
		6,
		4,
		6,
		4,
		5,
		5,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4
	]
};
var bcn_24B_7_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 26,
	n_periods: 336,
	arrival_time: [
		3,
		111,
		133,
		78,
		54,
		32,
		166,
		54,
		84,
		25,
		143,
		145,
		88,
		17,
		30,
		90,
		121,
		131,
		41,
		59,
		78,
		144,
		155,
		24,
		85,
		113
	],
	handling_time: [
		17,
		16,
		10,
		30,
		9,
		43,
		15,
		11,
		43,
		14,
		10,
		10,
		18,
		7,
		16,
		21,
		14,
		8,
		14,
		13,
		43,
		10,
		6,
		10,
		32,
		11
	],
	ship_len: [
		5,
		5,
		5,
		8,
		6,
		8,
		6,
		6,
		8,
		6,
		4,
		4,
		5,
		5,
		6,
		6,
		5,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4
	]
};
var bcn_24B_8_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 19,
	n_periods: 336,
	arrival_time: [
		155,
		133,
		127,
		5,
		54,
		84,
		49,
		145,
		17,
		30,
		90,
		121,
		112,
		47,
		24,
		85,
		113,
		5,
		83
	],
	handling_time: [
		7,
		10,
		10,
		12,
		11,
		43,
		11,
		10,
		7,
		16,
		21,
		14,
		12,
		5,
		10,
		32,
		11,
		10,
		33
	],
	ship_len: [
		5,
		5,
		5,
		7,
		6,
		8,
		6,
		4,
		5,
		6,
		6,
		5,
		4,
		4,
		4,
		4,
		4,
		4,
		4
	]
};
var bcn_24B_9_default = {
	n_berths: 20,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 18,
	n_periods: 336,
	arrival_time: [
		40,
		155,
		83,
		127,
		120,
		5,
		49,
		48,
		63,
		29,
		144,
		112,
		47,
		1,
		5,
		83,
		92,
		120
	],
	handling_time: [
		18,
		7,
		19,
		10,
		4,
		12,
		11,
		21,
		13,
		16,
		18,
		12,
		5,
		35,
		10,
		33,
		26,
		18
	],
	ship_len: [
		7,
		5,
		8,
		5,
		5,
		7,
		6,
		6,
		6,
		5,
		5,
		4,
		4,
		8,
		4,
		4,
		4,
		5
	]
};
var bcn_36A_11_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 49,
	n_periods: 336,
	arrival_time: [
		136,
		139,
		68,
		10,
		109,
		94,
		28,
		35,
		78,
		83,
		110,
		15,
		50,
		60,
		51,
		70,
		73,
		99,
		124,
		78,
		166,
		99,
		125,
		154,
		82,
		121,
		2,
		128,
		128,
		91,
		44,
		67,
		66,
		76,
		103,
		95,
		103,
		113,
		116,
		121,
		111,
		60,
		86,
		110,
		109,
		101,
		32,
		41,
		137
	],
	handling_time: [
		30,
		4,
		5,
		13,
		14,
		9,
		6,
		7,
		22,
		24,
		13,
		15,
		8,
		9,
		20,
		14,
		18,
		22,
		26,
		23,
		24,
		8,
		10,
		25,
		14,
		16,
		23,
		23,
		36,
		23,
		28,
		7,
		9,
		16,
		9,
		19,
		13,
		6,
		8,
		14,
		39,
		7,
		7,
		10,
		13,
		7,
		15,
		9,
		16
	],
	ship_len: [
		4,
		3,
		4,
		4,
		3,
		4,
		5,
		4,
		4,
		7,
		4,
		7,
		7,
		4,
		4,
		4,
		6,
		7,
		9,
		7,
		7,
		6,
		6,
		8,
		7,
		4,
		9,
		8,
		7,
		8,
		8,
		4,
		4,
		8,
		4,
		8,
		3,
		4,
		8,
		4,
		7,
		3,
		3,
		4,
		4,
		5,
		7,
		4,
		5
	]
};
var bcn_36A_12_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 49,
	n_periods: 336,
	arrival_time: [
		139,
		10,
		109,
		140,
		94,
		8,
		51,
		95,
		15,
		50,
		60,
		51,
		70,
		73,
		99,
		124,
		7,
		16,
		12,
		35,
		89,
		103,
		109,
		105,
		127,
		142,
		99,
		125,
		82,
		121,
		152,
		35,
		91,
		60,
		86,
		110,
		109,
		154,
		159,
		58,
		52,
		81,
		88,
		125,
		115,
		32,
		41,
		137,
		84
	],
	handling_time: [
		4,
		13,
		14,
		11,
		9,
		41,
		6,
		10,
		15,
		8,
		9,
		20,
		14,
		18,
		22,
		26,
		7,
		13,
		21,
		20,
		15,
		8,
		12,
		19,
		22,
		13,
		8,
		10,
		14,
		16,
		21,
		14,
		23,
		7,
		7,
		10,
		13,
		19,
		20,
		13,
		27,
		12,
		14,
		13,
		23,
		15,
		9,
		16,
		11
	],
	ship_len: [
		3,
		4,
		3,
		4,
		4,
		8,
		4,
		4,
		7,
		7,
		4,
		4,
		4,
		6,
		7,
		9,
		4,
		4,
		7,
		5,
		5,
		8,
		4,
		5,
		7,
		8,
		6,
		6,
		7,
		4,
		7,
		5,
		8,
		3,
		3,
		4,
		4,
		4,
		6,
		8,
		8,
		3,
		4,
		4,
		8,
		7,
		4,
		5,
		4
	]
};
var bcn_36A_13_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 48,
	n_periods: 336,
	arrival_time: [
		140,
		8,
		51,
		95,
		24,
		7,
		16,
		12,
		35,
		89,
		103,
		109,
		105,
		127,
		142,
		15,
		33,
		59,
		69,
		53,
		85,
		96,
		117,
		123,
		27,
		35,
		82,
		92,
		156,
		99,
		151,
		58,
		52,
		81,
		88,
		125,
		115,
		152,
		154,
		9,
		1,
		57,
		109,
		98,
		121,
		126,
		145,
		84
	],
	handling_time: [
		11,
		41,
		6,
		10,
		26,
		7,
		13,
		21,
		20,
		15,
		8,
		12,
		19,
		22,
		13,
		11,
		24,
		21,
		15,
		35,
		9,
		12,
		32,
		31,
		29,
		14,
		14,
		6,
		19,
		13,
		15,
		13,
		27,
		12,
		14,
		13,
		23,
		15,
		27,
		13,
		31,
		11,
		9,
		22,
		7,
		17,
		11,
		11
	],
	ship_len: [
		4,
		8,
		4,
		4,
		8,
		4,
		4,
		7,
		5,
		5,
		8,
		4,
		5,
		7,
		8,
		4,
		5,
		7,
		4,
		8,
		4,
		5,
		7,
		4,
		4,
		5,
		7,
		6,
		8,
		7,
		7,
		8,
		8,
		3,
		4,
		4,
		8,
		4,
		4,
		8,
		5,
		4,
		3,
		6,
		3,
		4,
		4,
		4
	]
};
var bcn_36A_14_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 52,
	n_periods: 336,
	arrival_time: [
		40,
		91,
		121,
		19,
		24,
		26,
		90,
		123,
		15,
		33,
		59,
		69,
		53,
		85,
		96,
		117,
		123,
		157,
		21,
		49,
		100,
		119,
		139,
		27,
		9,
		86,
		82,
		92,
		156,
		67,
		141,
		99,
		151,
		7,
		27,
		104,
		9,
		1,
		57,
		109,
		98,
		121,
		126,
		145,
		153,
		48,
		59,
		113,
		110,
		131,
		128,
		149
	],
	handling_time: [
		6,
		7,
		8,
		4,
		26,
		12,
		20,
		43,
		11,
		24,
		21,
		15,
		35,
		9,
		12,
		32,
		31,
		15,
		24,
		40,
		17,
		7,
		20,
		29,
		10,
		22,
		14,
		6,
		19,
		35,
		6,
		13,
		15,
		10,
		38,
		15,
		13,
		31,
		11,
		9,
		22,
		7,
		17,
		11,
		39,
		9,
		7,
		6,
		26,
		14,
		11,
		5
	],
	ship_len: [
		4,
		4,
		4,
		4,
		8,
		4,
		5,
		7,
		4,
		5,
		7,
		4,
		8,
		4,
		5,
		7,
		4,
		4,
		6,
		7,
		5,
		6,
		8,
		4,
		7,
		5,
		7,
		6,
		6,
		8,
		4,
		7,
		7,
		4,
		7,
		8,
		8,
		5,
		4,
		3,
		6,
		3,
		4,
		4,
		7,
		4,
		4,
		4,
		7,
		3,
		4,
		5
	]
};
var bcn_36A_15_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 50,
	n_periods: 336,
	arrival_time: [
		40,
		91,
		121,
		39,
		39,
		19,
		26,
		90,
		123,
		21,
		49,
		100,
		119,
		139,
		2,
		0,
		5,
		45,
		65,
		73,
		90,
		104,
		118,
		93,
		131,
		9,
		86,
		155,
		20,
		83,
		67,
		141,
		80,
		7,
		27,
		104,
		46,
		48,
		59,
		113,
		110,
		131,
		56,
		55,
		112,
		119,
		133,
		128,
		149,
		107
	],
	handling_time: [
		6,
		7,
		8,
		8,
		15,
		4,
		12,
		20,
		43,
		24,
		40,
		17,
		7,
		20,
		15,
		42,
		38,
		9,
		15,
		14,
		11,
		12,
		8,
		40,
		7,
		10,
		22,
		14,
		17,
		24,
		35,
		6,
		24,
		10,
		38,
		15,
		31,
		9,
		7,
		6,
		26,
		14,
		8,
		17,
		11,
		8,
		12,
		11,
		5,
		14
	],
	ship_len: [
		4,
		4,
		4,
		3,
		4,
		4,
		4,
		5,
		7,
		6,
		7,
		5,
		6,
		8,
		5,
		9,
		4,
		4,
		5,
		5,
		5,
		7,
		4,
		6,
		5,
		7,
		5,
		7,
		7,
		5,
		8,
		4,
		7,
		4,
		7,
		8,
		9,
		4,
		4,
		4,
		7,
		3,
		4,
		4,
		4,
		3,
		3,
		4,
		5,
		7
	]
};
var bcn_36A_16_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 48,
	n_periods: 336,
	arrival_time: [
		39,
		39,
		103,
		120,
		94,
		93,
		2,
		0,
		5,
		45,
		65,
		73,
		90,
		104,
		118,
		93,
		131,
		147,
		22,
		22,
		74,
		92,
		96,
		128,
		117,
		133,
		145,
		40,
		20,
		83,
		80,
		129,
		25,
		46,
		8,
		47,
		103,
		125,
		56,
		55,
		112,
		119,
		133,
		5,
		68,
		70,
		119,
		107
	],
	handling_time: [
		8,
		15,
		6,
		12,
		7,
		19,
		15,
		42,
		38,
		9,
		15,
		14,
		11,
		12,
		8,
		40,
		7,
		22,
		16,
		25,
		16,
		25,
		23,
		16,
		33,
		27,
		16,
		16,
		17,
		24,
		24,
		45,
		19,
		31,
		13,
		20,
		19,
		31,
		8,
		17,
		11,
		8,
		12,
		18,
		5,
		20,
		7,
		14
	],
	ship_len: [
		3,
		4,
		4,
		4,
		4,
		5,
		5,
		9,
		4,
		4,
		5,
		5,
		5,
		7,
		4,
		6,
		5,
		7,
		5,
		6,
		4,
		6,
		4,
		4,
		6,
		4,
		5,
		4,
		7,
		5,
		7,
		8,
		6,
		9,
		5,
		7,
		8,
		9,
		4,
		4,
		4,
		3,
		3,
		7,
		4,
		7,
		4,
		7
	]
};
var bcn_36A_17_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 43,
	n_periods: 336,
	arrival_time: [
		103,
		120,
		25,
		94,
		93,
		22,
		22,
		74,
		92,
		96,
		128,
		117,
		133,
		145,
		30,
		122,
		140,
		40,
		163,
		133,
		25,
		51,
		93,
		8,
		47,
		103,
		125,
		152,
		159,
		83,
		104,
		5,
		68,
		70,
		119,
		165,
		42,
		54,
		80,
		104,
		115,
		119,
		128
	],
	handling_time: [
		6,
		12,
		23,
		7,
		19,
		16,
		25,
		16,
		25,
		23,
		16,
		33,
		27,
		16,
		10,
		18,
		23,
		16,
		35,
		26,
		19,
		39,
		20,
		13,
		20,
		19,
		31,
		16,
		24,
		19,
		18,
		18,
		5,
		20,
		7,
		31,
		7,
		25,
		20,
		12,
		11,
		9,
		11
	],
	ship_len: [
		4,
		4,
		9,
		4,
		5,
		5,
		6,
		4,
		6,
		4,
		4,
		6,
		4,
		5,
		4,
		5,
		5,
		4,
		6,
		5,
		6,
		6,
		7,
		5,
		7,
		8,
		9,
		8,
		7,
		9,
		7,
		7,
		4,
		7,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4
	]
};
var bcn_36A_18_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 40,
	n_periods: 336,
	arrival_time: [
		37,
		59,
		119,
		25,
		10,
		93,
		30,
		122,
		140,
		144,
		151,
		8,
		165,
		22,
		5,
		30,
		81,
		133,
		51,
		93,
		44,
		58,
		83,
		104,
		47,
		82,
		42,
		54,
		80,
		104,
		115,
		119,
		56,
		85,
		105,
		119,
		131,
		128,
		162,
		18
	],
	handling_time: [
		13,
		10,
		9,
		23,
		8,
		10,
		10,
		18,
		23,
		26,
		25,
		12,
		30,
		19,
		41,
		27,
		11,
		26,
		39,
		20,
		35,
		24,
		19,
		18,
		6,
		31,
		7,
		25,
		20,
		12,
		11,
		9,
		19,
		33,
		20,
		9,
		13,
		11,
		21,
		17
	],
	ship_len: [
		4,
		4,
		3,
		9,
		5,
		5,
		4,
		5,
		5,
		4,
		5,
		4,
		5,
		9,
		6,
		5,
		6,
		5,
		6,
		7,
		9,
		7,
		9,
		7,
		8,
		7,
		4,
		4,
		4,
		4,
		4,
		4,
		7,
		7,
		4,
		4,
		7,
		4,
		6,
		4
	]
};
var bcn_36A_19_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 41,
	n_periods: 336,
	arrival_time: [
		37,
		59,
		119,
		123,
		10,
		93,
		92,
		8,
		22,
		5,
		30,
		81,
		7,
		8,
		9,
		29,
		84,
		100,
		56,
		44,
		58,
		147,
		83,
		115,
		47,
		82,
		61,
		56,
		85,
		105,
		119,
		131,
		54,
		50,
		85,
		118,
		120,
		134,
		18,
		44,
		47
	],
	handling_time: [
		13,
		10,
		9,
		6,
		8,
		10,
		25,
		12,
		19,
		41,
		27,
		11,
		20,
		34,
		39,
		23,
		27,
		20,
		25,
		35,
		24,
		26,
		7,
		43,
		6,
		31,
		10,
		19,
		33,
		20,
		9,
		13,
		8,
		32,
		12,
		7,
		12,
		10,
		17,
		8,
		12
	],
	ship_len: [
		4,
		4,
		3,
		4,
		5,
		5,
		7,
		4,
		9,
		6,
		5,
		6,
		5,
		4,
		9,
		7,
		6,
		4,
		6,
		9,
		7,
		7,
		5,
		9,
		8,
		7,
		7,
		7,
		7,
		4,
		4,
		7,
		4,
		7,
		4,
		4,
		3,
		7,
		4,
		4,
		7
	]
};
var bcn_36A_20_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 46,
	n_periods: 336,
	arrival_time: [
		138,
		71,
		123,
		92,
		90,
		7,
		8,
		9,
		29,
		84,
		146,
		13,
		38,
		33,
		39,
		85,
		128,
		100,
		56,
		160,
		32,
		102,
		83,
		115,
		39,
		73,
		126,
		61,
		8,
		54,
		141,
		54,
		50,
		85,
		118,
		120,
		134,
		12,
		57,
		78,
		109,
		44,
		47,
		79,
		104,
		120
	],
	handling_time: [
		9,
		12,
		6,
		25,
		16,
		20,
		34,
		39,
		23,
		27,
		27,
		24,
		14,
		21,
		31,
		16,
		10,
		20,
		25,
		19,
		37,
		22,
		7,
		43,
		16,
		30,
		16,
		10,
		22,
		19,
		21,
		8,
		32,
		12,
		7,
		12,
		10,
		25,
		9,
		30,
		10,
		8,
		12,
		10,
		22,
		8
	],
	ship_len: [
		4,
		6,
		4,
		7,
		5,
		5,
		4,
		9,
		7,
		6,
		8,
		5,
		8,
		5,
		4,
		7,
		6,
		4,
		6,
		7,
		5,
		7,
		5,
		9,
		5,
		8,
		7,
		7,
		8,
		8,
		7,
		4,
		7,
		4,
		4,
		3,
		7,
		4,
		4,
		7,
		4,
		4,
		7,
		4,
		8,
		5
	]
};
var bcn_36A_21_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 45,
	n_periods: 336,
	arrival_time: [
		138,
		102,
		71,
		90,
		119,
		95,
		13,
		38,
		33,
		39,
		85,
		128,
		145,
		164,
		72,
		79,
		94,
		127,
		32,
		102,
		86,
		39,
		73,
		126,
		142,
		8,
		54,
		141,
		6,
		23,
		47,
		12,
		57,
		78,
		109,
		70,
		87,
		115,
		100,
		120,
		126,
		136,
		79,
		104,
		120
	],
	handling_time: [
		9,
		10,
		12,
		16,
		8,
		34,
		24,
		14,
		21,
		31,
		16,
		10,
		27,
		35,
		25,
		21,
		24,
		9,
		37,
		22,
		31,
		16,
		30,
		16,
		13,
		22,
		19,
		21,
		12,
		18,
		22,
		25,
		9,
		30,
		10,
		7,
		6,
		10,
		25,
		8,
		13,
		8,
		10,
		22,
		8
	],
	ship_len: [
		4,
		4,
		6,
		5,
		5,
		8,
		5,
		8,
		5,
		4,
		7,
		6,
		5,
		7,
		4,
		4,
		4,
		4,
		5,
		7,
		6,
		5,
		8,
		7,
		7,
		8,
		8,
		7,
		7,
		8,
		8,
		4,
		4,
		7,
		4,
		3,
		4,
		4,
		4,
		4,
		4,
		8,
		4,
		8,
		5
	]
};
var bcn_36A_22_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 43,
	n_periods: 336,
	arrival_time: [
		80,
		102,
		68,
		116,
		102,
		90,
		119,
		95,
		25,
		72,
		79,
		94,
		127,
		12,
		26,
		48,
		73,
		78,
		60,
		86,
		98,
		142,
		148,
		6,
		23,
		47,
		157,
		39,
		125,
		132,
		70,
		87,
		115,
		100,
		120,
		126,
		136,
		11,
		60,
		73,
		116,
		8,
		129
	],
	handling_time: [
		16,
		10,
		10,
		10,
		12,
		32,
		8,
		34,
		12,
		25,
		21,
		24,
		9,
		17,
		20,
		22,
		21,
		20,
		17,
		31,
		31,
		13,
		25,
		12,
		18,
		22,
		19,
		19,
		15,
		12,
		7,
		6,
		10,
		25,
		8,
		13,
		8,
		10,
		6,
		14,
		8,
		15,
		30
	],
	ship_len: [
		6,
		4,
		4,
		4,
		4,
		8,
		5,
		8,
		4,
		4,
		4,
		4,
		4,
		7,
		4,
		9,
		4,
		4,
		4,
		6,
		6,
		7,
		9,
		7,
		8,
		8,
		9,
		8,
		7,
		4,
		3,
		4,
		4,
		4,
		4,
		4,
		8,
		4,
		4,
		4,
		3,
		8,
		6
	]
};
var bcn_36A_23_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 45,
	n_periods: 336,
	arrival_time: [
		80,
		68,
		116,
		102,
		90,
		161,
		25,
		146,
		12,
		26,
		48,
		73,
		78,
		151,
		34,
		57,
		66,
		87,
		94,
		142,
		60,
		98,
		4,
		150,
		39,
		125,
		132,
		19,
		26,
		132,
		123,
		11,
		60,
		73,
		116,
		66,
		85,
		104,
		122,
		138,
		8,
		129,
		12,
		35,
		152
	],
	handling_time: [
		16,
		10,
		10,
		12,
		32,
		10,
		12,
		24,
		17,
		20,
		22,
		21,
		20,
		34,
		20,
		25,
		18,
		43,
		43,
		8,
		17,
		31,
		18,
		13,
		19,
		15,
		12,
		13,
		37,
		10,
		36,
		10,
		6,
		14,
		8,
		8,
		34,
		16,
		19,
		12,
		15,
		30,
		8,
		10,
		13
	],
	ship_len: [
		6,
		4,
		4,
		4,
		8,
		4,
		4,
		5,
		7,
		4,
		9,
		4,
		4,
		7,
		5,
		9,
		5,
		4,
		5,
		8,
		4,
		6,
		7,
		6,
		8,
		7,
		4,
		7,
		8,
		5,
		7,
		4,
		4,
		4,
		3,
		4,
		7,
		4,
		6,
		4,
		8,
		6,
		5,
		4,
		4
	]
};
var bcn_36A_24_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 43,
	n_periods: 336,
	arrival_time: [
		45,
		100,
		122,
		141,
		73,
		34,
		57,
		66,
		87,
		94,
		142,
		2,
		19,
		31,
		35,
		33,
		126,
		167,
		4,
		150,
		153,
		166,
		23,
		50,
		19,
		26,
		132,
		123,
		162,
		18,
		138,
		66,
		85,
		104,
		122,
		138,
		33,
		55,
		117,
		121,
		12,
		35,
		152
	],
	handling_time: [
		7,
		15,
		13,
		16,
		25,
		20,
		25,
		18,
		43,
		43,
		8,
		20,
		11,
		11,
		15,
		30,
		13,
		19,
		18,
		13,
		15,
		33,
		23,
		40,
		13,
		37,
		10,
		36,
		19,
		15,
		19,
		8,
		34,
		16,
		19,
		12,
		9,
		12,
		7,
		13,
		8,
		10,
		13
	],
	ship_len: [
		3,
		4,
		4,
		4,
		5,
		5,
		9,
		5,
		4,
		5,
		8,
		8,
		4,
		5,
		7,
		5,
		4,
		4,
		7,
		6,
		7,
		6,
		6,
		9,
		7,
		8,
		5,
		7,
		7,
		8,
		6,
		4,
		7,
		4,
		6,
		4,
		4,
		3,
		4,
		4,
		5,
		4,
		4
	]
};
var bcn_36A_26_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 39,
	n_periods: 336,
	arrival_time: [
		25,
		109,
		27,
		4,
		37,
		67,
		60,
		82,
		63,
		131,
		2,
		11,
		29,
		111,
		139,
		135,
		33,
		146,
		48,
		45,
		8,
		14,
		61,
		77,
		102,
		118,
		153,
		159,
		42,
		59,
		65,
		69,
		73,
		107,
		49,
		87,
		31,
		101,
		128
	],
	handling_time: [
		6,
		17,
		9,
		7,
		9,
		17,
		32,
		18,
		41,
		43,
		7,
		28,
		14,
		27,
		22,
		16,
		47,
		12,
		10,
		14,
		15,
		16,
		13,
		27,
		14,
		11,
		11,
		9,
		6,
		4,
		7,
		23,
		35,
		12,
		10,
		42,
		14,
		4,
		30
	],
	ship_len: [
		4,
		4,
		4,
		5,
		3,
		9,
		4,
		4,
		8,
		9,
		6,
		4,
		4,
		5,
		5,
		4,
		5,
		6,
		6,
		6,
		8,
		5,
		8,
		9,
		3,
		3,
		4,
		7,
		3,
		4,
		4,
		4,
		7,
		3,
		4,
		10,
		5,
		4,
		4
	]
};
var bcn_36A_27_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 41,
	n_periods: 336,
	arrival_time: [
		25,
		109,
		147,
		4,
		49,
		2,
		11,
		29,
		111,
		139,
		24,
		29,
		69,
		74,
		103,
		133,
		164,
		44,
		48,
		45,
		164,
		8,
		14,
		61,
		77,
		47,
		42,
		59,
		65,
		69,
		73,
		107,
		89,
		104,
		120,
		114,
		127,
		31,
		101,
		128,
		67
	],
	handling_time: [
		6,
		17,
		39,
		7,
		21,
		7,
		28,
		14,
		27,
		22,
		17,
		18,
		27,
		27,
		21,
		24,
		32,
		24,
		10,
		14,
		27,
		15,
		16,
		13,
		27,
		18,
		6,
		4,
		7,
		23,
		35,
		12,
		20,
		15,
		10,
		20,
		24,
		14,
		4,
		30,
		18
	],
	ship_len: [
		4,
		4,
		8,
		5,
		5,
		6,
		4,
		4,
		5,
		5,
		5,
		4,
		5,
		5,
		7,
		4,
		4,
		6,
		6,
		6,
		7,
		8,
		5,
		8,
		9,
		7,
		3,
		4,
		4,
		4,
		7,
		3,
		5,
		4,
		4,
		6,
		7,
		5,
		4,
		4,
		8
	]
};
var bcn_36A_28_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 34,
	n_periods: 336,
	arrival_time: [
		43,
		104,
		49,
		24,
		29,
		69,
		74,
		103,
		133,
		22,
		23,
		14,
		72,
		130,
		44,
		37,
		34,
		38,
		71,
		149,
		47,
		52,
		129,
		89,
		104,
		120,
		114,
		127,
		138,
		152,
		62,
		104,
		81,
		67
	],
	handling_time: [
		26,
		21,
		21,
		17,
		18,
		27,
		27,
		21,
		24,
		9,
		11,
		21,
		29,
		22,
		24,
		23,
		8,
		11,
		31,
		16,
		18,
		17,
		18,
		20,
		15,
		10,
		20,
		24,
		42,
		36,
		16,
		17,
		45,
		18
	],
	ship_len: [
		4,
		4,
		5,
		5,
		4,
		5,
		5,
		7,
		4,
		5,
		5,
		5,
		4,
		4,
		6,
		6,
		5,
		8,
		9,
		7,
		7,
		8,
		8,
		5,
		4,
		4,
		6,
		7,
		9,
		7,
		4,
		3,
		7,
		8
	]
};
var bcn_36A_29_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 38,
	n_periods: 336,
	arrival_time: [
		43,
		104,
		31,
		139,
		8,
		22,
		23,
		14,
		72,
		154,
		23,
		36,
		42,
		56,
		101,
		130,
		37,
		0,
		34,
		38,
		71,
		149,
		29,
		135,
		3,
		52,
		129,
		67,
		62,
		104,
		81,
		162,
		6,
		50,
		90,
		95,
		138,
		123
	],
	handling_time: [
		26,
		21,
		4,
		11,
		18,
		9,
		11,
		21,
		29,
		18,
		23,
		28,
		32,
		38,
		18,
		22,
		23,
		20,
		8,
		11,
		31,
		16,
		9,
		13,
		9,
		17,
		18,
		20,
		16,
		17,
		45,
		9,
		24,
		26,
		28,
		27,
		22,
		13
	],
	ship_len: [
		4,
		4,
		3,
		3,
		5,
		5,
		5,
		5,
		4,
		5,
		7,
		5,
		4,
		4,
		7,
		4,
		6,
		6,
		5,
		8,
		9,
		7,
		4,
		7,
		4,
		8,
		8,
		5,
		4,
		3,
		7,
		4,
		4,
		4,
		4,
		3,
		8,
		7
	]
};
var bcn_36A_3_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 40,
	n_periods: 336,
	arrival_time: [
		30,
		24,
		119,
		110,
		48,
		103,
		12,
		81,
		99,
		110,
		167,
		8,
		25,
		56,
		105,
		131,
		130,
		140,
		109,
		149,
		12,
		23,
		76,
		90,
		154,
		2,
		55,
		94,
		91,
		142,
		35,
		70,
		80,
		102,
		121,
		124,
		126,
		128,
		148,
		132
	],
	handling_time: [
		14,
		2,
		8,
		13,
		19,
		26,
		15,
		16,
		9,
		17,
		7,
		16,
		25,
		16,
		19,
		16,
		21,
		13,
		17,
		7,
		9,
		18,
		10,
		16,
		11,
		23,
		13,
		7,
		10,
		10,
		11,
		6,
		28,
		26,
		13,
		11,
		12,
		18,
		18,
		35
	],
	ship_len: [
		3,
		3,
		4,
		4,
		5,
		5,
		6,
		5,
		5,
		8,
		7,
		6,
		5,
		5,
		8,
		3,
		5,
		5,
		6,
		5,
		7,
		6,
		8,
		7,
		6,
		6,
		4,
		7,
		4,
		7,
		4,
		6,
		7,
		4,
		4,
		4,
		4,
		7,
		4,
		9
	]
};
var bcn_36A_30_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 35,
	n_periods: 336,
	arrival_time: [
		31,
		139,
		106,
		8,
		109,
		23,
		36,
		42,
		56,
		101,
		163,
		33,
		49,
		66,
		119,
		0,
		149,
		29,
		135,
		47,
		3,
		67,
		88,
		6,
		50,
		90,
		95,
		138,
		15,
		54,
		94,
		85,
		132,
		123,
		151
	],
	handling_time: [
		4,
		11,
		16,
		18,
		13,
		23,
		28,
		32,
		38,
		18,
		18,
		18,
		30,
		27,
		10,
		20,
		43,
		9,
		13,
		36,
		9,
		20,
		19,
		24,
		26,
		28,
		27,
		22,
		23,
		10,
		22,
		40,
		15,
		13,
		10
	],
	ship_len: [
		3,
		3,
		4,
		5,
		5,
		7,
		5,
		4,
		4,
		7,
		8,
		5,
		5,
		5,
		4,
		6,
		6,
		4,
		7,
		8,
		4,
		5,
		5,
		4,
		4,
		4,
		3,
		8,
		7,
		4,
		4,
		6,
		7,
		7,
		4
	]
};
var bcn_36A_31_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 34,
	n_periods: 336,
	arrival_time: [
		106,
		109,
		78,
		128,
		33,
		49,
		66,
		119,
		39,
		46,
		70,
		88,
		99,
		121,
		22,
		152,
		47,
		3,
		76,
		88,
		153,
		47,
		15,
		54,
		94,
		85,
		132,
		4,
		21,
		90,
		102,
		114,
		141,
		151
	],
	handling_time: [
		16,
		13,
		18,
		23,
		18,
		30,
		27,
		10,
		21,
		20,
		15,
		25,
		39,
		20,
		22,
		45,
		36,
		15,
		41,
		19,
		15,
		15,
		23,
		10,
		22,
		40,
		15,
		15,
		47,
		8,
		17,
		11,
		25,
		10
	],
	ship_len: [
		4,
		5,
		8,
		5,
		5,
		5,
		5,
		4,
		8,
		7,
		7,
		5,
		5,
		7,
		4,
		5,
		8,
		7,
		8,
		5,
		9,
		8,
		7,
		4,
		4,
		6,
		7,
		4,
		4,
		3,
		3,
		4,
		7,
		4
	]
};
var bcn_36A_32_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 34,
	n_periods: 336,
	arrival_time: [
		69,
		100,
		78,
		128,
		39,
		46,
		70,
		88,
		99,
		121,
		67,
		60,
		80,
		97,
		22,
		165,
		3,
		76,
		47,
		106,
		105,
		132,
		4,
		21,
		90,
		102,
		114,
		141,
		16,
		38,
		55,
		77,
		99,
		139
	],
	handling_time: [
		5,
		18,
		18,
		23,
		21,
		20,
		15,
		25,
		39,
		20,
		10,
		29,
		21,
		25,
		22,
		16,
		15,
		41,
		15,
		24,
		28,
		24,
		15,
		47,
		8,
		17,
		11,
		25,
		13,
		20,
		10,
		20,
		17,
		13
	],
	ship_len: [
		4,
		4,
		8,
		5,
		8,
		7,
		7,
		5,
		5,
		7,
		9,
		7,
		9,
		5,
		4,
		7,
		7,
		8,
		8,
		5,
		7,
		8,
		4,
		4,
		3,
		3,
		4,
		7,
		7,
		7,
		5,
		4,
		3,
		7
	]
};
var bcn_36A_33_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 35,
	n_periods: 336,
	arrival_time: [
		69,
		100,
		118,
		158,
		67,
		60,
		80,
		97,
		2,
		10,
		27,
		69,
		106,
		122,
		31,
		49,
		106,
		105,
		132,
		36,
		126,
		16,
		38,
		55,
		77,
		99,
		139,
		166,
		21,
		39,
		99,
		103,
		122,
		140,
		69
	],
	handling_time: [
		5,
		18,
		10,
		39,
		10,
		29,
		21,
		25,
		13,
		12,
		20,
		23,
		14,
		41,
		6,
		13,
		24,
		28,
		24,
		17,
		19,
		13,
		20,
		10,
		20,
		17,
		13,
		22,
		8,
		3,
		18,
		15,
		16,
		11,
		13
	],
	ship_len: [
		4,
		4,
		4,
		8,
		9,
		7,
		9,
		5,
		5,
		5,
		7,
		5,
		7,
		5,
		4,
		6,
		5,
		7,
		8,
		8,
		5,
		7,
		7,
		5,
		4,
		3,
		7,
		4,
		4,
		4,
		4,
		4,
		4,
		7,
		5
	]
};
var bcn_36A_34_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 33,
	n_periods: 336,
	arrival_time: [
		118,
		100,
		2,
		10,
		27,
		69,
		106,
		122,
		23,
		26,
		34,
		57,
		129,
		31,
		116,
		49,
		166,
		36,
		126,
		153,
		0,
		15,
		98,
		21,
		39,
		99,
		103,
		122,
		140,
		2,
		12,
		83,
		69
	],
	handling_time: [
		10,
		23,
		13,
		12,
		20,
		23,
		14,
		41,
		9,
		12,
		10,
		12,
		19,
		6,
		20,
		13,
		13,
		17,
		19,
		15,
		13,
		15,
		10,
		8,
		3,
		18,
		15,
		16,
		11,
		20,
		37,
		35,
		13
	],
	ship_len: [
		4,
		4,
		5,
		5,
		7,
		5,
		7,
		5,
		5,
		5,
		5,
		5,
		5,
		4,
		4,
		6,
		6,
		8,
		5,
		7,
		8,
		8,
		5,
		4,
		4,
		4,
		4,
		4,
		7,
		5,
		6,
		4,
		5
	]
};
var bcn_36A_35_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 27,
	n_periods: 336,
	arrival_time: [
		144,
		100,
		52,
		23,
		26,
		34,
		57,
		129,
		135,
		158,
		116,
		59,
		0,
		15,
		98,
		50,
		85,
		142,
		2,
		12,
		83,
		144,
		30,
		53,
		104,
		95,
		124
	],
	handling_time: [
		29,
		23,
		9,
		9,
		12,
		10,
		12,
		19,
		35,
		28,
		20,
		15,
		13,
		15,
		10,
		30,
		15,
		19,
		20,
		37,
		35,
		28,
		17,
		10,
		14,
		24,
		16
	],
	ship_len: [
		5,
		4,
		5,
		5,
		5,
		5,
		5,
		5,
		7,
		8,
		4,
		7,
		8,
		8,
		5,
		8,
		7,
		8,
		5,
		6,
		4,
		5,
		7,
		4,
		4,
		4,
		7
	]
};
var bcn_36A_36_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 30,
	n_periods: 336,
	arrival_time: [
		79,
		111,
		138,
		37,
		52,
		122,
		152,
		2,
		23,
		102,
		122,
		129,
		59,
		57,
		50,
		85,
		142,
		53,
		51,
		150,
		30,
		53,
		104,
		95,
		124,
		154,
		90,
		75,
		118,
		0
	],
	handling_time: [
		10,
		11,
		12,
		12,
		9,
		46,
		21,
		15,
		32,
		8,
		6,
		24,
		15,
		41,
		30,
		15,
		19,
		11,
		20,
		12,
		17,
		10,
		14,
		24,
		16,
		44,
		27,
		45,
		18,
		8
	],
	ship_len: [
		3,
		3,
		4,
		7,
		5,
		5,
		4,
		5,
		7,
		6,
		5,
		5,
		7,
		9,
		8,
		7,
		8,
		4,
		6,
		8,
		7,
		4,
		4,
		4,
		7,
		4,
		4,
		7,
		4,
		5
	]
};
var bcn_36A_37_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 36,
	n_periods: 336,
	arrival_time: [
		79,
		111,
		138,
		37,
		165,
		38,
		2,
		23,
		102,
		122,
		129,
		162,
		43,
		44,
		69,
		119,
		130,
		137,
		48,
		57,
		26,
		53,
		51,
		150,
		153,
		122,
		90,
		75,
		118,
		160,
		101,
		99,
		102,
		0,
		109,
		118
	],
	handling_time: [
		10,
		11,
		12,
		12,
		39,
		47,
		15,
		32,
		8,
		6,
		24,
		29,
		3,
		17,
		26,
		14,
		23,
		25,
		18,
		41,
		15,
		11,
		20,
		12,
		31,
		26,
		27,
		45,
		18,
		27,
		13,
		18,
		17,
		8,
		17,
		10
	],
	ship_len: [
		3,
		3,
		4,
		7,
		8,
		8,
		5,
		7,
		6,
		5,
		5,
		5,
		4,
		5,
		7,
		8,
		4,
		7,
		4,
		9,
		7,
		4,
		6,
		8,
		7,
		5,
		4,
		7,
		4,
		4,
		8,
		4,
		4,
		5,
		7,
		4
	]
};
var bcn_36A_38_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 34,
	n_periods: 336,
	arrival_time: [
		165,
		34,
		108,
		38,
		156,
		43,
		44,
		69,
		119,
		130,
		137,
		13,
		46,
		66,
		121,
		48,
		26,
		166,
		115,
		122,
		81,
		101,
		126,
		147,
		101,
		99,
		102,
		23,
		14,
		52,
		50,
		105,
		109,
		118
	],
	handling_time: [
		29,
		4,
		11,
		47,
		23,
		3,
		17,
		26,
		14,
		23,
		25,
		10,
		21,
		24,
		38,
		18,
		15,
		25,
		35,
		26,
		22,
		23,
		17,
		19,
		13,
		18,
		17,
		11,
		34,
		9,
		35,
		15,
		17,
		10
	],
	ship_len: [
		4,
		4,
		4,
		8,
		8,
		4,
		5,
		7,
		8,
		4,
		7,
		4,
		4,
		4,
		5,
		4,
		7,
		7,
		8,
		5,
		7,
		8,
		8,
		7,
		8,
		4,
		4,
		3,
		4,
		4,
		7,
		4,
		7,
		4
	]
};
var bcn_36A_39_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 33,
	n_periods: 336,
	arrival_time: [
		34,
		108,
		147,
		13,
		46,
		66,
		121,
		21,
		51,
		113,
		125,
		115,
		152,
		81,
		81,
		101,
		126,
		147,
		92,
		23,
		14,
		52,
		50,
		105,
		5,
		35,
		53,
		46,
		68,
		92,
		112,
		149,
		126
	],
	handling_time: [
		4,
		11,
		15,
		10,
		21,
		24,
		38,
		17,
		38,
		22,
		18,
		35,
		22,
		36,
		22,
		23,
		17,
		19,
		21,
		11,
		34,
		9,
		35,
		15,
		28,
		15,
		9,
		26,
		14,
		25,
		18,
		6,
		15
	],
	ship_len: [
		4,
		4,
		5,
		4,
		4,
		4,
		5,
		5,
		4,
		4,
		5,
		8,
		6,
		7,
		7,
		8,
		8,
		7,
		5,
		3,
		4,
		4,
		7,
		4,
		4,
		4,
		4,
		7,
		4,
		4,
		3,
		7,
		5
	]
};
var bcn_36A_4_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 45,
	n_periods: 336,
	arrival_time: [
		110,
		107,
		103,
		27,
		70,
		107,
		135,
		8,
		25,
		56,
		105,
		131,
		130,
		140,
		11,
		4,
		45,
		43,
		50,
		60,
		61,
		84,
		149,
		119,
		2,
		55,
		94,
		6,
		23,
		62,
		102,
		35,
		70,
		80,
		102,
		121,
		124,
		126,
		128,
		148,
		70,
		86,
		133,
		100,
		126
	],
	handling_time: [
		13,
		13,
		26,
		15,
		12,
		26,
		9,
		16,
		25,
		16,
		19,
		16,
		21,
		13,
		10,
		20,
		8,
		15,
		9,
		27,
		30,
		16,
		7,
		12,
		23,
		13,
		7,
		14,
		25,
		4,
		22,
		11,
		6,
		28,
		26,
		13,
		11,
		12,
		18,
		18,
		10,
		15,
		15,
		12,
		6
	],
	ship_len: [
		4,
		4,
		5,
		4,
		5,
		7,
		5,
		6,
		5,
		5,
		8,
		3,
		5,
		5,
		8,
		7,
		6,
		5,
		7,
		5,
		8,
		7,
		5,
		6,
		6,
		4,
		7,
		8,
		7,
		4,
		7,
		4,
		6,
		7,
		4,
		4,
		4,
		4,
		7,
		4,
		3,
		4,
		7,
		5,
		5
	]
};
var bcn_36A_40_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 36,
	n_periods: 336,
	arrival_time: [
		105,
		110,
		146,
		82,
		147,
		138,
		21,
		51,
		113,
		125,
		136,
		9,
		42,
		80,
		114,
		136,
		81,
		156,
		92,
		124,
		131,
		5,
		35,
		53,
		46,
		68,
		92,
		112,
		149,
		15,
		2,
		46,
		53,
		101,
		109,
		126
	],
	handling_time: [
		10,
		12,
		22,
		47,
		15,
		19,
		17,
		38,
		22,
		18,
		33,
		29,
		34,
		28,
		13,
		19,
		36,
		19,
		21,
		20,
		28,
		28,
		15,
		9,
		26,
		14,
		25,
		18,
		6,
		22,
		40,
		5,
		23,
		11,
		9,
		15
	],
	ship_len: [
		4,
		4,
		7,
		8,
		5,
		8,
		5,
		4,
		4,
		5,
		7,
		4,
		8,
		7,
		4,
		4,
		7,
		7,
		5,
		5,
		8,
		4,
		4,
		4,
		7,
		4,
		4,
		3,
		7,
		4,
		7,
		4,
		8,
		4,
		4,
		5
	]
};
var bcn_36A_41_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 33,
	n_periods: 336,
	arrival_time: [
		105,
		110,
		82,
		138,
		9,
		42,
		80,
		114,
		162,
		158,
		43,
		105,
		130,
		132,
		136,
		156,
		124,
		131,
		15,
		2,
		46,
		53,
		101,
		109,
		6,
		35,
		15,
		53,
		86,
		106,
		92,
		62,
		69
	],
	handling_time: [
		10,
		12,
		47,
		19,
		29,
		34,
		28,
		13,
		18,
		23,
		20,
		16,
		8,
		18,
		19,
		13,
		20,
		28,
		22,
		40,
		5,
		23,
		11,
		9,
		29,
		14,
		35,
		12,
		25,
		12,
		27,
		13,
		9
	],
	ship_len: [
		4,
		4,
		8,
		8,
		4,
		8,
		7,
		4,
		8,
		7,
		8,
		5,
		5,
		4,
		4,
		7,
		5,
		8,
		4,
		7,
		4,
		8,
		4,
		4,
		7,
		7,
		4,
		4,
		7,
		4,
		4,
		5,
		4
	]
};
var bcn_36A_42_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 33,
	n_periods: 336,
	arrival_time: [
		31,
		115,
		129,
		43,
		105,
		130,
		132,
		5,
		18,
		95,
		120,
		102,
		134,
		32,
		37,
		105,
		128,
		6,
		35,
		15,
		53,
		86,
		106,
		92,
		0,
		19,
		52,
		34,
		57,
		91,
		62,
		69,
		138
	],
	handling_time: [
		4,
		11,
		27,
		20,
		16,
		8,
		18,
		24,
		13,
		22,
		16,
		12,
		36,
		17,
		13,
		18,
		23,
		29,
		14,
		35,
		12,
		25,
		12,
		27,
		15,
		13,
		10,
		43,
		24,
		26,
		13,
		9,
		5
	],
	ship_len: [
		3,
		4,
		4,
		8,
		5,
		5,
		4,
		7,
		4,
		7,
		5,
		4,
		8,
		6,
		5,
		8,
		8,
		7,
		7,
		4,
		4,
		7,
		4,
		4,
		7,
		4,
		4,
		4,
		8,
		4,
		5,
		4,
		5
	]
};
var bcn_36A_43_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 37,
	n_periods: 336,
	arrival_time: [
		31,
		115,
		36,
		129,
		5,
		18,
		95,
		120,
		28,
		83,
		127,
		146,
		147,
		102,
		32,
		86,
		150,
		37,
		105,
		128,
		161,
		109,
		120,
		0,
		19,
		52,
		34,
		57,
		91,
		24,
		48,
		99,
		85,
		111,
		95,
		138,
		4
	],
	handling_time: [
		4,
		11,
		31,
		27,
		24,
		13,
		22,
		16,
		12,
		10,
		12,
		15,
		14,
		12,
		17,
		32,
		11,
		13,
		18,
		23,
		14,
		24,
		17,
		15,
		13,
		10,
		43,
		24,
		26,
		10,
		9,
		7,
		24,
		9,
		44,
		5,
		18
	],
	ship_len: [
		3,
		4,
		7,
		4,
		7,
		4,
		7,
		5,
		4,
		5,
		4,
		4,
		7,
		4,
		6,
		6,
		4,
		5,
		8,
		8,
		8,
		5,
		4,
		7,
		4,
		4,
		4,
		8,
		4,
		7,
		4,
		4,
		7,
		3,
		4,
		5,
		4
	]
};
var bcn_36A_44_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 35,
	n_periods: 336,
	arrival_time: [
		36,
		60,
		109,
		163,
		28,
		83,
		127,
		146,
		147,
		9,
		39,
		16,
		78,
		111,
		164,
		86,
		150,
		58,
		109,
		120,
		84,
		95,
		24,
		48,
		99,
		85,
		111,
		95,
		163,
		33,
		57,
		50,
		104,
		131,
		4
	],
	handling_time: [
		31,
		19,
		20,
		8,
		12,
		10,
		12,
		15,
		14,
		28,
		16,
		42,
		15,
		16,
		11,
		32,
		11,
		15,
		24,
		17,
		18,
		12,
		10,
		9,
		7,
		24,
		9,
		44,
		19,
		6,
		7,
		20,
		16,
		20,
		18
	],
	ship_len: [
		7,
		4,
		4,
		4,
		4,
		5,
		4,
		4,
		7,
		7,
		8,
		4,
		7,
		7,
		4,
		6,
		4,
		7,
		5,
		4,
		7,
		5,
		7,
		4,
		4,
		7,
		3,
		4,
		7,
		4,
		3,
		4,
		4,
		7,
		4
	]
};
var bcn_36A_45_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 31,
	n_periods: 336,
	arrival_time: [
		60,
		109,
		82,
		27,
		9,
		39,
		16,
		78,
		111,
		39,
		54,
		107,
		127,
		58,
		146,
		84,
		95,
		85,
		33,
		57,
		50,
		104,
		131,
		155,
		55,
		80,
		105,
		108,
		132,
		147,
		76
	],
	handling_time: [
		19,
		20,
		10,
		26,
		28,
		16,
		42,
		15,
		16,
		32,
		19,
		16,
		18,
		15,
		35,
		18,
		12,
		20,
		6,
		7,
		20,
		16,
		20,
		39,
		12,
		22,
		12,
		14,
		10,
		17,
		14
	],
	ship_len: [
		4,
		4,
		3,
		3,
		7,
		8,
		4,
		7,
		7,
		5,
		8,
		7,
		9,
		7,
		8,
		7,
		5,
		5,
		4,
		3,
		4,
		4,
		7,
		6,
		3,
		4,
		4,
		4,
		4,
		7,
		5
	]
};
var bcn_36A_46_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 29,
	n_periods: 336,
	arrival_time: [
		82,
		123,
		27,
		39,
		54,
		107,
		127,
		61,
		54,
		105,
		8,
		141,
		4,
		85,
		144,
		8,
		24,
		149,
		55,
		80,
		105,
		108,
		132,
		147,
		24,
		54,
		122,
		76,
		82
	],
	handling_time: [
		10,
		9,
		26,
		32,
		19,
		16,
		18,
		19,
		33,
		16,
		12,
		45,
		18,
		20,
		30,
		21,
		8,
		15,
		12,
		22,
		12,
		14,
		10,
		17,
		22,
		6,
		7,
		14,
		20
	],
	ship_len: [
		3,
		4,
		3,
		5,
		8,
		7,
		9,
		5,
		7,
		8,
		4,
		8,
		7,
		5,
		8,
		7,
		5,
		7,
		3,
		4,
		4,
		4,
		4,
		7,
		4,
		4,
		4,
		5,
		7
	]
};
var bcn_36A_47_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 36,
	n_periods: 336,
	arrival_time: [
		123,
		145,
		63,
		122,
		61,
		54,
		105,
		13,
		26,
		35,
		66,
		95,
		107,
		119,
		8,
		144,
		4,
		59,
		8,
		24,
		149,
		165,
		125,
		24,
		54,
		122,
		167,
		3,
		54,
		56,
		101,
		103,
		132,
		156,
		82,
		95
	],
	handling_time: [
		9,
		23,
		29,
		18,
		19,
		33,
		16,
		18,
		13,
		19,
		11,
		22,
		13,
		10,
		12,
		7,
		18,
		12,
		21,
		8,
		15,
		28,
		2,
		22,
		6,
		7,
		13,
		26,
		7,
		24,
		18,
		16,
		9,
		5,
		20,
		10
	],
	ship_len: [
		4,
		9,
		7,
		5,
		5,
		7,
		8,
		7,
		4,
		5,
		7,
		4,
		5,
		5,
		4,
		4,
		7,
		6,
		7,
		5,
		7,
		5,
		5,
		4,
		4,
		4,
		7,
		7,
		4,
		5,
		3,
		4,
		7,
		3,
		7,
		5
	]
};
var bcn_36A_48_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 39,
	n_periods: 336,
	arrival_time: [
		36,
		107,
		90,
		63,
		122,
		70,
		106,
		13,
		26,
		35,
		66,
		95,
		107,
		119,
		4,
		33,
		79,
		123,
		144,
		59,
		7,
		125,
		13,
		113,
		3,
		54,
		56,
		101,
		103,
		132,
		156,
		156,
		54,
		61,
		52,
		53,
		83,
		95,
		34
	],
	handling_time: [
		11,
		9,
		21,
		29,
		18,
		12,
		22,
		18,
		13,
		19,
		11,
		22,
		13,
		10,
		30,
		15,
		19,
		21,
		7,
		12,
		15,
		2,
		17,
		8,
		26,
		7,
		24,
		18,
		16,
		9,
		5,
		23,
		7,
		7,
		26,
		35,
		10,
		10,
		13
	],
	ship_len: [
		4,
		4,
		4,
		7,
		5,
		4,
		6,
		7,
		4,
		5,
		7,
		4,
		5,
		5,
		7,
		5,
		4,
		7,
		4,
		6,
		6,
		5,
		8,
		7,
		7,
		4,
		5,
		3,
		4,
		7,
		3,
		8,
		4,
		5,
		4,
		7,
		4,
		5,
		4
	]
};
var bcn_36A_49_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 39,
	n_periods: 336,
	arrival_time: [
		104,
		36,
		107,
		67,
		90,
		70,
		106,
		105,
		4,
		33,
		79,
		123,
		151,
		12,
		50,
		50,
		70,
		86,
		96,
		129,
		47,
		7,
		34,
		13,
		113,
		150,
		54,
		61,
		52,
		53,
		83,
		9,
		57,
		90,
		107,
		116,
		133,
		148,
		34
	],
	handling_time: [
		22,
		11,
		9,
		10,
		21,
		12,
		22,
		22,
		30,
		15,
		19,
		21,
		24,
		19,
		5,
		17,
		17,
		16,
		21,
		16,
		16,
		15,
		14,
		17,
		8,
		24,
		7,
		7,
		26,
		35,
		10,
		13,
		12,
		24,
		12,
		16,
		13,
		15,
		13
	],
	ship_len: [
		4,
		4,
		4,
		3,
		4,
		4,
		6,
		5,
		7,
		5,
		4,
		7,
		8,
		8,
		6,
		4,
		4,
		8,
		7,
		6,
		4,
		6,
		6,
		8,
		7,
		8,
		4,
		5,
		4,
		7,
		4,
		7,
		4,
		4,
		3,
		3,
		4,
		7,
		4
	]
};
var bcn_36A_5_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 43,
	n_periods: 336,
	arrival_time: [
		104,
		107,
		77,
		27,
		70,
		107,
		135,
		79,
		11,
		4,
		45,
		43,
		50,
		60,
		61,
		84,
		165,
		18,
		53,
		61,
		85,
		72,
		121,
		125,
		129,
		119,
		159,
		6,
		23,
		62,
		102,
		39,
		105,
		70,
		86,
		133,
		154,
		53,
		114,
		102,
		111,
		100,
		126
	],
	handling_time: [
		9,
		13,
		6,
		15,
		12,
		26,
		9,
		16,
		10,
		20,
		8,
		15,
		9,
		27,
		30,
		16,
		20,
		21,
		6,
		15,
		15,
		36,
		16,
		22,
		10,
		12,
		16,
		14,
		25,
		4,
		22,
		11,
		18,
		10,
		15,
		15,
		17,
		5,
		6,
		25,
		21,
		12,
		6
	],
	ship_len: [
		4,
		4,
		4,
		4,
		5,
		7,
		5,
		5,
		8,
		7,
		6,
		5,
		7,
		5,
		8,
		7,
		7,
		6,
		4,
		5,
		6,
		7,
		4,
		6,
		6,
		6,
		4,
		8,
		7,
		4,
		7,
		4,
		7,
		3,
		4,
		7,
		7,
		4,
		4,
		6,
		7,
		5,
		5
	]
};
var bcn_36A_6_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 47,
	n_periods: 336,
	arrival_time: [
		104,
		149,
		77,
		151,
		105,
		56,
		79,
		53,
		18,
		53,
		61,
		85,
		72,
		121,
		125,
		140,
		141,
		7,
		25,
		48,
		68,
		97,
		121,
		138,
		46,
		129,
		118,
		39,
		105,
		4,
		22,
		67,
		76,
		83,
		53,
		114,
		102,
		111,
		158,
		3,
		28,
		54,
		64,
		101,
		131,
		148,
		40
	],
	handling_time: [
		9,
		8,
		6,
		19,
		14,
		9,
		16,
		11,
		21,
		6,
		15,
		15,
		36,
		16,
		22,
		29,
		32,
		18,
		12,
		6,
		13,
		19,
		14,
		25,
		7,
		10,
		11,
		11,
		18,
		13,
		21,
		7,
		14,
		21,
		5,
		6,
		25,
		21,
		10,
		20,
		22,
		9,
		37,
		15,
		15,
		12,
		6
	],
	ship_len: [
		4,
		5,
		4,
		4,
		4,
		4,
		5,
		5,
		6,
		4,
		5,
		6,
		7,
		4,
		6,
		4,
		7,
		7,
		5,
		5,
		5,
		5,
		8,
		5,
		4,
		6,
		7,
		4,
		7,
		7,
		7,
		8,
		8,
		6,
		4,
		4,
		6,
		7,
		4,
		4,
		7,
		4,
		4,
		4,
		7,
		7,
		5
	]
};
var bcn_36A_7_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 59,
	n_periods: 336,
	arrival_time: [
		149,
		105,
		81,
		111,
		124,
		56,
		12,
		53,
		7,
		25,
		48,
		68,
		97,
		121,
		138,
		164,
		1,
		9,
		24,
		44,
		57,
		105,
		136,
		46,
		118,
		68,
		108,
		156,
		90,
		4,
		22,
		67,
		76,
		83,
		162,
		42,
		66,
		57,
		77,
		83,
		119,
		3,
		28,
		54,
		64,
		101,
		131,
		148,
		162,
		3,
		12,
		26,
		57,
		109,
		138,
		147,
		155,
		40,
		150
	],
	handling_time: [
		8,
		14,
		26,
		10,
		18,
		9,
		28,
		11,
		18,
		12,
		6,
		13,
		19,
		14,
		25,
		11,
		6,
		13,
		8,
		11,
		9,
		31,
		25,
		7,
		11,
		7,
		9,
		9,
		19,
		13,
		21,
		7,
		14,
		21,
		7,
		11,
		13,
		25,
		11,
		20,
		11,
		20,
		22,
		9,
		37,
		15,
		15,
		12,
		8,
		5,
		19,
		17,
		8,
		11,
		11,
		17,
		9,
		6,
		18
	],
	ship_len: [
		5,
		4,
		3,
		4,
		6,
		4,
		9,
		5,
		7,
		5,
		5,
		5,
		5,
		8,
		5,
		5,
		6,
		5,
		5,
		7,
		5,
		8,
		7,
		4,
		7,
		6,
		7,
		7,
		6,
		7,
		7,
		8,
		8,
		6,
		7,
		8,
		3,
		8,
		5,
		7,
		7,
		4,
		7,
		4,
		4,
		4,
		7,
		7,
		3,
		3,
		4,
		4,
		4,
		3,
		5,
		4,
		6,
		5,
		8
	]
};
var bcn_36A_8_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 49,
	n_periods: 336,
	arrival_time: [
		78,
		81,
		111,
		163,
		124,
		12,
		166,
		25,
		1,
		9,
		24,
		44,
		57,
		105,
		136,
		11,
		85,
		69,
		108,
		132,
		68,
		108,
		156,
		90,
		17,
		42,
		66,
		57,
		77,
		83,
		119,
		111,
		3,
		12,
		26,
		57,
		109,
		138,
		147,
		155,
		40,
		60,
		36,
		77,
		93,
		101,
		121,
		130,
		163
	],
	handling_time: [
		6,
		26,
		10,
		16,
		18,
		28,
		12,
		12,
		6,
		13,
		8,
		11,
		9,
		31,
		25,
		23,
		6,
		30,
		20,
		18,
		7,
		9,
		9,
		19,
		11,
		11,
		13,
		25,
		11,
		20,
		11,
		21,
		5,
		19,
		17,
		8,
		11,
		11,
		17,
		9,
		18,
		8,
		38,
		28,
		17,
		18,
		11,
		29,
		13
	],
	ship_len: [
		4,
		3,
		4,
		3,
		6,
		9,
		5,
		5,
		6,
		5,
		5,
		7,
		5,
		8,
		7,
		9,
		4,
		5,
		7,
		4,
		6,
		7,
		7,
		6,
		4,
		8,
		3,
		8,
		5,
		7,
		7,
		7,
		3,
		4,
		4,
		4,
		3,
		5,
		4,
		6,
		4,
		4,
		9,
		8,
		4,
		4,
		4,
		7,
		5
	]
};
var bcn_36A_9_default = {
	n_berths: 29,
	berth_len: [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	],
	n_ships: 47,
	n_periods: 336,
	arrival_time: [
		78,
		5,
		58,
		59,
		122,
		126,
		33,
		90,
		25,
		73,
		11,
		85,
		69,
		108,
		132,
		162,
		15,
		27,
		38,
		50,
		56,
		62,
		110,
		17,
		13,
		140,
		111,
		16,
		47,
		76,
		40,
		60,
		36,
		77,
		93,
		101,
		121,
		130,
		153,
		31,
		63,
		96,
		104,
		125,
		142,
		67,
		107
	],
	handling_time: [
		6,
		7,
		6,
		13,
		12,
		9,
		23,
		11,
		12,
		6,
		23,
		6,
		30,
		20,
		18,
		7,
		21,
		21,
		15,
		11,
		11,
		25,
		9,
		11,
		12,
		21,
		21,
		16,
		14,
		29,
		18,
		8,
		38,
		28,
		17,
		18,
		11,
		29,
		45,
		14,
		9,
		12,
		14,
		12,
		39,
		5,
		17
	],
	ship_len: [
		4,
		5,
		4,
		4,
		4,
		4,
		6,
		4,
		5,
		5,
		9,
		4,
		5,
		7,
		4,
		5,
		7,
		7,
		5,
		7,
		5,
		5,
		6,
		4,
		7,
		7,
		7,
		7,
		4,
		8,
		4,
		4,
		9,
		8,
		4,
		4,
		4,
		7,
		4,
		4,
		4,
		4,
		4,
		4,
		7,
		4,
		7
	]
};
var bks_bcn_24B_11_default = {
	solver: "sgcp,pa,ti,gspp,rp",
	makespan: 203,
	dual_bound: 203,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 25,
			"data_handling_time": 31,
			"data_ship_length": 8,
			"mooring_time": 39,
			"completion_time": 69,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 126,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 142,
			"completion_time": 159,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 156,
			"data_handling_time": 10,
			"data_ship_length": 6,
			"mooring_time": 190,
			"completion_time": 199,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 47,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 144,
			"completion_time": 163,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 72,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 106,
			"completion_time": 119,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 23,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 23,
			"completion_time": 37,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 59,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 91,
			"completion_time": 104,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 4,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 4,
			"completion_time": 20,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 40,
			"data_handling_time": 9,
			"data_ship_length": 6,
			"mooring_time": 122,
			"completion_time": 130,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 28,
			"data_handling_time": 17,
			"data_ship_length": 6,
			"mooring_time": 73,
			"completion_time": 89,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 142,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 165,
			"completion_time": 174,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 126,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 128,
			"completion_time": 142,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 105,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 139,
			"completion_time": 151,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 161,
			"data_handling_time": 43,
			"data_ship_length": 8,
			"mooring_time": 161,
			"completion_time": 203,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 38,
			"data_handling_time": 34,
			"data_ship_length": 8,
			"mooring_time": 38,
			"completion_time": 71,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 83,
			"data_handling_time": 33,
			"data_ship_length": 4,
			"mooring_time": 88,
			"completion_time": 120,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 126,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 126,
			"completion_time": 136,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 52,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 106,
			"completion_time": 126,
			"mooring_berth": 14
		}
	]
};
var bks_bcn_24B_12_default = {
	solver: "pa,gspp,rp,ti,sgcp",
	makespan: 193,
	dual_bound: 193,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 27,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 27,
			"completion_time": 31,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 115,
			"data_handling_time": 10,
			"data_ship_length": 7,
			"mooring_time": 181,
			"completion_time": 190,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 141,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 141,
			"completion_time": 161,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 0,
			"data_handling_time": 23,
			"data_ship_length": 7,
			"mooring_time": 0,
			"completion_time": 22,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 47,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 47,
			"completion_time": 66,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 123,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 123,
			"completion_time": 137,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 72,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 72,
			"completion_time": 85,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 4,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 4,
			"completion_time": 20,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 41,
			"data_handling_time": 15,
			"data_ship_length": 6,
			"mooring_time": 93,
			"completion_time": 107,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 104,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 118,
			"completion_time": 131,
			"mooring_berth": 2
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 28,
			"data_handling_time": 17,
			"data_ship_length": 6,
			"mooring_time": 28,
			"completion_time": 44,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 142,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 142,
			"completion_time": 151,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 25,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 25,
			"completion_time": 36,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 38,
			"data_handling_time": 34,
			"data_ship_length": 8,
			"mooring_time": 38,
			"completion_time": 71,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 126,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 126,
			"completion_time": 136,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 82,
			"data_handling_time": 32,
			"data_ship_length": 4,
			"mooring_time": 82,
			"completion_time": 113,
			"mooring_berth": 1
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 163,
			"data_handling_time": 31,
			"data_ship_length": 5,
			"mooring_time": 163,
			"completion_time": 193,
			"mooring_berth": 2
		}
	]
};
var bks_bcn_24B_13_default = {
	solver: "s,gspp,ti,rp,sgcp,pa",
	makespan: 174,
	dual_bound: 174,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 27,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 46,
			"completion_time": 50,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 115,
			"data_handling_time": 10,
			"data_ship_length": 7,
			"mooring_time": 141,
			"completion_time": 150,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 12,
			"data_handling_time": 23,
			"data_ship_length": 4,
			"mooring_time": 23,
			"completion_time": 45,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 141,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 151,
			"completion_time": 171,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 0,
			"data_handling_time": 23,
			"data_ship_length": 7,
			"mooring_time": 0,
			"completion_time": 22,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 123,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 126,
			"completion_time": 140,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 111,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 111,
			"completion_time": 125,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 131,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 136,
			"completion_time": 156,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 41,
			"data_handling_time": 15,
			"data_ship_length": 6,
			"mooring_time": 41,
			"completion_time": 55,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 104,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 104,
			"completion_time": 117,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 35,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 35,
			"completion_time": 51,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 48,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 56,
			"completion_time": 68,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 25,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 157,
			"completion_time": 168,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 3,
			"data_handling_time": 17,
			"data_ship_length": 6,
			"mooring_time": 3,
			"completion_time": 19,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 137,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 137,
			"completion_time": 141,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 152,
			"data_handling_time": 23,
			"data_ship_length": 5,
			"mooring_time": 152,
			"completion_time": 174,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 82,
			"data_handling_time": 32,
			"data_ship_length": 4,
			"mooring_time": 82,
			"completion_time": 113,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 100,
			"data_handling_time": 5,
			"data_ship_length": 3,
			"mooring_time": 106,
			"completion_time": 110,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 120,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 120,
			"completion_time": 133,
			"mooring_berth": 13
		}
	]
};
var bks_bcn_24B_14_default = {
	solver: "s,rp,ti,pa,sgcp",
	makespan: 176,
	dual_bound: 176,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 12,
			"data_handling_time": 23,
			"data_ship_length": 4,
			"mooring_time": 12,
			"completion_time": 34,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 159,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 159,
			"completion_time": 176,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 139,
			"data_handling_time": 29,
			"data_ship_length": 8,
			"mooring_time": 148,
			"completion_time": 176,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 111,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 123,
			"completion_time": 137,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 110,
			"data_handling_time": 30,
			"data_ship_length": 8,
			"mooring_time": 118,
			"completion_time": 147,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 131,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 138,
			"completion_time": 158,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 35,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 47,
			"completion_time": 63,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 48,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 105,
			"completion_time": 117,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 37,
			"data_handling_time": 10,
			"data_ship_length": 6,
			"mooring_time": 37,
			"completion_time": 46,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 29,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 29,
			"completion_time": 47,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 3,
			"data_handling_time": 17,
			"data_ship_length": 6,
			"mooring_time": 3,
			"completion_time": 19,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 137,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 139,
			"completion_time": 143,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 154,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 163,
			"completion_time": 176,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 107,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 108,
			"completion_time": 119,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 59,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 59,
			"completion_time": 82,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 100,
			"data_handling_time": 5,
			"data_ship_length": 3,
			"mooring_time": 103,
			"completion_time": 107,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 120,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 124,
			"completion_time": 137,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 86,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 86,
			"completion_time": 102,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 132,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 144,
			"completion_time": 162,
			"mooring_berth": 8
		}
	]
};
var bks_bcn_24B_15_default = {
	solver: "s,sgcp,ti,rp",
	makespan: 176,
	dual_bound: 176,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 110,
			"data_handling_time": 30,
			"data_ship_length": 8,
			"mooring_time": 110,
			"completion_time": 139,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 15,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 15,
			"completion_time": 30,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 43,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 48,
			"completion_time": 61,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 119,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 136,
			"completion_time": 147,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 126,
			"data_handling_time": 37,
			"data_ship_length": 8,
			"mooring_time": 140,
			"completion_time": 176,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 142,
			"data_handling_time": 29,
			"data_ship_length": 7,
			"mooring_time": 148,
			"completion_time": 176,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 37,
			"data_handling_time": 10,
			"data_ship_length": 6,
			"mooring_time": 69,
			"completion_time": 78,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 29,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 29,
			"completion_time": 47,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 79,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 79,
			"completion_time": 91,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 83,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 83,
			"completion_time": 96,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 96,
			"data_handling_time": 28,
			"data_ship_length": 8,
			"mooring_time": 96,
			"completion_time": 123,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 107,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 124,
			"completion_time": 135,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 53,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 75,
			"completion_time": 95,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 155,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 170,
			"completion_time": 176,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 59,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 59,
			"completion_time": 82,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 18,
			"data_handling_time": 21,
			"data_ship_length": 6,
			"mooring_time": 18,
			"completion_time": 38,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 115,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 152,
			"completion_time": 169,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 34,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 39,
			"completion_time": 49,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 53,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 62,
			"completion_time": 74,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 86,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 92,
			"completion_time": 108,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 132,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 133,
			"completion_time": 151,
			"mooring_berth": 8
		}
	]
};
var bks_bcn_24B_16_default = {
	solver: "sgcp,rp,ti",
	makespan: 199,
	dual_bound: 199,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 118,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 125,
			"completion_time": 136,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 15,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 78,
			"completion_time": 93,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 43,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 43,
			"completion_time": 56,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 119,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 153,
			"completion_time": 164,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 36,
			"data_handling_time": 10,
			"data_ship_length": 7,
			"mooring_time": 72,
			"completion_time": 81,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 126,
			"data_handling_time": 37,
			"data_ship_length": 8,
			"mooring_time": 128,
			"completion_time": 164,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 79,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 94,
			"completion_time": 106,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 83,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 83,
			"completion_time": 96,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 96,
			"data_handling_time": 28,
			"data_ship_length": 8,
			"mooring_time": 98,
			"completion_time": 125,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 12,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 137,
			"completion_time": 149,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 125,
			"data_handling_time": 18,
			"data_ship_length": 6,
			"mooring_time": 182,
			"completion_time": 199,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 137,
			"data_handling_time": 15,
			"data_ship_length": 6,
			"mooring_time": 185,
			"completion_time": 199,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 53,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 57,
			"completion_time": 77,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 155,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 175,
			"completion_time": 181,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 130,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 133,
			"completion_time": 152,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 18,
			"data_handling_time": 21,
			"data_ship_length": 6,
			"mooring_time": 44,
			"completion_time": 64,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 115,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 115,
			"completion_time": 132,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 154,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 168,
			"completion_time": 184,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 30,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 31,
			"completion_time": 42,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 96,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 107,
			"completion_time": 124,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 165,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 165,
			"completion_time": 199,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 34,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 61,
			"completion_time": 71,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 53,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 65,
			"completion_time": 77,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 82,
			"data_handling_time": 33,
			"data_ship_length": 4,
			"mooring_time": 82,
			"completion_time": 114,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 149,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 150,
			"completion_time": 165,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_24B_17_default = {
	solver: "sgcp,ti,rp,pa",
	makespan: 172,
	dual_bound: 172,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 118,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 118,
			"completion_time": 129,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 28,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 60,
			"completion_time": 81,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 155,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 155,
			"completion_time": 172,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 4,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 83,
			"completion_time": 99,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 72,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 73,
			"completion_time": 94,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 126,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 130,
			"completion_time": 141,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 36,
			"data_handling_time": 10,
			"data_ship_length": 7,
			"mooring_time": 95,
			"completion_time": 104,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 12,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 35,
			"completion_time": 47,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 125,
			"data_handling_time": 18,
			"data_ship_length": 6,
			"mooring_time": 125,
			"completion_time": 142,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 137,
			"data_handling_time": 15,
			"data_ship_length": 6,
			"mooring_time": 142,
			"completion_time": 156,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 16,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 49,
			"completion_time": 59,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 23,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 82,
			"completion_time": 93,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 130,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 134,
			"completion_time": 153,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 106,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 145,
			"completion_time": 154,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 30,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 104,
			"completion_time": 115,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 96,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 105,
			"completion_time": 122,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 82,
			"data_handling_time": 33,
			"data_ship_length": 4,
			"mooring_time": 96,
			"completion_time": 128,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 81,
			"data_handling_time": 33,
			"data_ship_length": 4,
			"mooring_time": 94,
			"completion_time": 126,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 125,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 130,
			"completion_time": 141,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 148,
			"data_handling_time": 19,
			"data_ship_length": 6,
			"mooring_time": 154,
			"completion_time": 172,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 149,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 157,
			"completion_time": 172,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_24B_18_default = {
	solver: "s,sgcp,ti,gspp,rp",
	makespan: 166,
	dual_bound: 166,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 28,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 41,
			"completion_time": 62,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 4,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 4,
			"completion_time": 20,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 72,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 99,
			"completion_time": 120,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 126,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 153,
			"completion_time": 164,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 46,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 75,
			"completion_time": 98,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 150,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 157,
			"completion_time": 166,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 16,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 21,
			"completion_time": 31,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 23,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 63,
			"completion_time": 74,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 6,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 6,
			"completion_time": 21,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 118,
			"data_handling_time": 32,
			"data_ship_length": 5,
			"mooring_time": 121,
			"completion_time": 152,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 106,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 135,
			"completion_time": 144,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 73,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 99,
			"completion_time": 112,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 106,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 113,
			"completion_time": 120,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 82,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 121,
			"completion_time": 134,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 119,
			"data_handling_time": 27,
			"data_ship_length": 5,
			"mooring_time": 121,
			"completion_time": 147,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 81,
			"data_handling_time": 33,
			"data_ship_length": 4,
			"mooring_time": 87,
			"completion_time": 119,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 125,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 145,
			"completion_time": 156,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 148,
			"data_handling_time": 19,
			"data_ship_length": 6,
			"mooring_time": 148,
			"completion_time": 166,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 91,
			"data_handling_time": 24,
			"data_ship_length": 4,
			"mooring_time": 135,
			"completion_time": 158,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 37,
			"data_handling_time": 36,
			"data_ship_length": 8,
			"mooring_time": 37,
			"completion_time": 72,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 31,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 31,
			"completion_time": 40,
			"mooring_berth": 6
		}
	]
};
var bks_bcn_24B_19_default = {
	solver: "rp,ti,sgcp",
	makespan: 186,
	dual_bound: 186,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 70,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 70,
			"completion_time": 83,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 77,
			"data_handling_time": 29,
			"data_ship_length": 8,
			"mooring_time": 84,
			"completion_time": 112,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 139,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 145,
			"completion_time": 166,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 46,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 46,
			"completion_time": 69,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 150,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 177,
			"completion_time": 186,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 167,
			"data_handling_time": 20,
			"data_ship_length": 6,
			"mooring_time": 167,
			"completion_time": 186,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 18,
			"data_handling_time": 27,
			"data_ship_length": 8,
			"mooring_time": 18,
			"completion_time": 44,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 6,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 6,
			"completion_time": 21,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 118,
			"data_handling_time": 32,
			"data_ship_length": 5,
			"mooring_time": 135,
			"completion_time": 166,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 56,
			"data_handling_time": 20,
			"data_ship_length": 8,
			"mooring_time": 73,
			"completion_time": 92,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 106,
			"data_handling_time": 18,
			"data_ship_length": 6,
			"mooring_time": 117,
			"completion_time": 134,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 111,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 118,
			"completion_time": 134,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 73,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 113,
			"completion_time": 126,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 106,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 135,
			"completion_time": 142,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 159,
			"data_handling_time": 20,
			"data_ship_length": 8,
			"mooring_time": 167,
			"completion_time": 186,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 87,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 107,
			"completion_time": 117,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 111,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 135,
			"completion_time": 144,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 82,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 93,
			"completion_time": 106,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 119,
			"data_handling_time": 27,
			"data_ship_length": 5,
			"mooring_time": 127,
			"completion_time": 153,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 28,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 45,
			"completion_time": 62,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 131,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 157,
			"completion_time": 176,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 91,
			"data_handling_time": 24,
			"data_ship_length": 4,
			"mooring_time": 91,
			"completion_time": 114,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 22,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 22,
			"completion_time": 30,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 37,
			"data_handling_time": 36,
			"data_ship_length": 8,
			"mooring_time": 37,
			"completion_time": 72,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 31,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 63,
			"completion_time": 72,
			"mooring_berth": 7
		}
	]
};
var bks_bcn_24B_20_default = {
	solver: "rp,ti,sgcp",
	makespan: 200,
	dual_bound: 200,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 149,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 149,
			"completion_time": 154,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 154,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 181,
			"completion_time": 200,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 70,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 70,
			"completion_time": 83,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 77,
			"data_handling_time": 29,
			"data_ship_length": 8,
			"mooring_time": 84,
			"completion_time": 112,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 106,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 113,
			"completion_time": 123,
			"mooring_berth": 1
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 139,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 141,
			"completion_time": 162,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 18,
			"data_handling_time": 27,
			"data_ship_length": 8,
			"mooring_time": 29,
			"completion_time": 55,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 18,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 18,
			"completion_time": 28,
			"mooring_berth": 3
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 163,
			"data_handling_time": 38,
			"data_ship_length": 8,
			"mooring_time": 163,
			"completion_time": 200,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 124,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 127,
			"completion_time": 138,
			"mooring_berth": 1
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 94,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 98,
			"completion_time": 112,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 56,
			"data_handling_time": 20,
			"data_ship_length": 8,
			"mooring_time": 56,
			"completion_time": 75,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 106,
			"data_handling_time": 18,
			"data_ship_length": 6,
			"mooring_time": 113,
			"completion_time": 130,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 111,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 113,
			"completion_time": 129,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 115,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 130,
			"completion_time": 147,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 87,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 87,
			"completion_time": 97,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 111,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 131,
			"completion_time": 140,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 11,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 11,
			"completion_time": 29,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 28,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 30,
			"completion_time": 47,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 131,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 168,
			"completion_time": 187,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 32,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 32,
			"completion_time": 43,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 43,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 44,
			"completion_time": 56,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 130,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 148,
			"completion_time": 167,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 82,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 82,
			"completion_time": 94,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 22,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 22,
			"completion_time": 30,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 46,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 57,
			"completion_time": 75,
			"mooring_berth": 15
		}
	]
};
var bks_bcn_24B_21_default = {
	solver: "gspp,sgcp,ti,rp",
	makespan: 192,
	dual_bound: 192,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 149,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 187,
			"completion_time": 192,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 157,
			"data_handling_time": 36,
			"data_ship_length": 7,
			"mooring_time": 157,
			"completion_time": 192,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 125,
			"data_handling_time": 26,
			"data_ship_length": 5,
			"mooring_time": 158,
			"completion_time": 183,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 106,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 106,
			"completion_time": 116,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 18,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 72,
			"completion_time": 82,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 124,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 160,
			"completion_time": 171,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 94,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 102,
			"completion_time": 116,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 115,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 139,
			"completion_time": 156,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 25,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 25,
			"completion_time": 41,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 53,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 73,
			"completion_time": 88,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 111,
			"data_handling_time": 37,
			"data_ship_length": 8,
			"mooring_time": 118,
			"completion_time": 154,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 11,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 11,
			"completion_time": 29,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 29,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 50,
			"completion_time": 70,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 32,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 55,
			"completion_time": 66,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 43,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 43,
			"completion_time": 55,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 130,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 173,
			"completion_time": 192,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 109,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 118,
			"completion_time": 134,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 82,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 90,
			"completion_time": 102,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 52,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 59,
			"completion_time": 66,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 81,
			"data_handling_time": 33,
			"data_ship_length": 4,
			"mooring_time": 98,
			"completion_time": 130,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 46,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 69,
			"completion_time": 87,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 82,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 84,
			"completion_time": 100,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_24B_22_default = {
	solver: "s,sgcp,rp,ti",
	makespan: 186,
	dual_bound: 184.0000000000002,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 125,
			"data_handling_time": 26,
			"data_ship_length": 5,
			"mooring_time": 144,
			"completion_time": 169,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 22,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 44,
			"completion_time": 51,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 4,
			"data_handling_time": 28,
			"data_ship_length": 8,
			"mooring_time": 4,
			"completion_time": 31,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 124,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 136,
			"completion_time": 148,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 25,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 32,
			"completion_time": 48,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 53,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 59,
			"completion_time": 74,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 111,
			"data_handling_time": 37,
			"data_ship_length": 8,
			"mooring_time": 132,
			"completion_time": 168,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 151,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 169,
			"completion_time": 186,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 3,
			"data_handling_time": 17,
			"data_ship_length": 6,
			"mooring_time": 3,
			"completion_time": 19,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 63,
			"data_handling_time": 23,
			"data_ship_length": 8,
			"mooring_time": 63,
			"completion_time": 85,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 87,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 98,
			"completion_time": 115,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 114,
			"data_handling_time": 16,
			"data_ship_length": 8,
			"mooring_time": 116,
			"completion_time": 131,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 123,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 129,
			"completion_time": 143,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 29,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 42,
			"completion_time": 62,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 75,
			"data_handling_time": 23,
			"data_ship_length": 6,
			"mooring_time": 75,
			"completion_time": 97,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 141,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 150,
			"completion_time": 168,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 109,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 119,
			"completion_time": 135,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 133,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 169,
			"completion_time": 186,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 52,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 52,
			"completion_time": 59,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 81,
			"data_handling_time": 33,
			"data_ship_length": 4,
			"mooring_time": 86,
			"completion_time": 118,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 81,
			"data_handling_time": 34,
			"data_ship_length": 4,
			"mooring_time": 82,
			"completion_time": 115,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 95,
			"data_handling_time": 26,
			"data_ship_length": 5,
			"mooring_time": 103,
			"completion_time": 128,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 82,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 86,
			"completion_time": 102,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 154,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 172,
			"completion_time": 186,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_24B_23_default = {
	solver: "sgcp,ti,rp",
	makespan: 169,
	dual_bound: 169,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 24,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 62,
			"completion_time": 72,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 22,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 132,
			"completion_time": 139,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 8,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 52,
			"completion_time": 62,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 108,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 116,
			"completion_time": 137,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 4,
			"data_handling_time": 28,
			"data_ship_length": 8,
			"mooring_time": 4,
			"completion_time": 31,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 10,
			"data_handling_time": 32,
			"data_ship_length": 8,
			"mooring_time": 30,
			"completion_time": 61,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 124,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 138,
			"completion_time": 150,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 154,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 155,
			"completion_time": 169,
			"mooring_berth": 3
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 3,
			"data_handling_time": 17,
			"data_ship_length": 6,
			"mooring_time": 45,
			"completion_time": 61,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 63,
			"data_handling_time": 23,
			"data_ship_length": 8,
			"mooring_time": 63,
			"completion_time": 85,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 87,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 98,
			"completion_time": 115,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 114,
			"data_handling_time": 16,
			"data_ship_length": 8,
			"mooring_time": 121,
			"completion_time": 136,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 123,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 140,
			"completion_time": 154,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 75,
			"data_handling_time": 23,
			"data_ship_length": 6,
			"mooring_time": 75,
			"completion_time": 97,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 141,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 151,
			"completion_time": 169,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 6,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 12,
			"completion_time": 27,
			"mooring_berth": 2
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 65,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 67,
			"completion_time": 80,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 133,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 137,
			"completion_time": 154,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 125,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 139,
			"completion_time": 150,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 144,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 152,
			"completion_time": 169,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 81,
			"data_handling_time": 34,
			"data_ship_length": 4,
			"mooring_time": 86,
			"completion_time": 119,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 41,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 120,
			"completion_time": 131,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 82,
			"data_handling_time": 34,
			"data_ship_length": 4,
			"mooring_time": 82,
			"completion_time": 115,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 95,
			"data_handling_time": 26,
			"data_ship_length": 5,
			"mooring_time": 95,
			"completion_time": 120,
			"mooring_berth": 4
		}
	]
};
var bks_bcn_24B_24_default = {
	solver: "rp,s,ti,sgcp",
	makespan: 168,
	dual_bound: 168,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 24,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 72,
			"completion_time": 82,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 8,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 8,
			"completion_time": 18,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 70,
			"data_handling_time": 38,
			"data_ship_length": 8,
			"mooring_time": 83,
			"completion_time": 120,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 108,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 121,
			"completion_time": 142,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 10,
			"data_handling_time": 32,
			"data_ship_length": 8,
			"mooring_time": 40,
			"completion_time": 71,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 144,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 144,
			"completion_time": 168,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 4,
			"data_handling_time": 36,
			"data_ship_length": 8,
			"mooring_time": 4,
			"completion_time": 39,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 119,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 155,
			"completion_time": 168,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 119,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 123,
			"completion_time": 139,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 4,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 19,
			"completion_time": 31,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 43,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 43,
			"completion_time": 66,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 52,
			"data_handling_time": 20,
			"data_ship_length": 6,
			"mooring_time": 67,
			"completion_time": 86,
			"mooring_berth": 1
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 94,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 105,
			"completion_time": 122,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 6,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 27,
			"completion_time": 42,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 65,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 91,
			"completion_time": 104,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 74,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 74,
			"completion_time": 89,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 125,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 139,
			"completion_time": 150,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 144,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 151,
			"completion_time": 168,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 29,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 39,
			"completion_time": 57,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 138,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 140,
			"completion_time": 154,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 41,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 58,
			"completion_time": 69,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 82,
			"data_handling_time": 34,
			"data_ship_length": 4,
			"mooring_time": 105,
			"completion_time": 138,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 19,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 32,
			"completion_time": 38,
			"mooring_berth": 16
		}
	]
};
var bks_bcn_24B_26_default = {
	solver: "gspp,rp,ti,sgcp",
	makespan: 192,
	dual_bound: 192,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 30,
			"data_handling_time": 12,
			"data_ship_length": 8,
			"mooring_time": 43,
			"completion_time": 54,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 30,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 30,
			"completion_time": 41,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 3,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 3,
			"completion_time": 17,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 166,
			"data_handling_time": 27,
			"data_ship_length": 6,
			"mooring_time": 166,
			"completion_time": 192,
			"mooring_berth": 3
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 129,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 146,
			"completion_time": 157,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 72,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 85,
			"completion_time": 98,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 10,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 10,
			"completion_time": 25,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 40,
			"data_handling_time": 21,
			"data_ship_length": 6,
			"mooring_time": 43,
			"completion_time": 63,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 48,
			"data_handling_time": 22,
			"data_ship_length": 5,
			"mooring_time": 96,
			"completion_time": 117,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 64,
			"data_handling_time": 29,
			"data_ship_length": 7,
			"mooring_time": 65,
			"completion_time": 93,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 122,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 128,
			"completion_time": 140,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 25,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 27,
			"completion_time": 38,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 100,
			"data_handling_time": 27,
			"data_ship_length": 6,
			"mooring_time": 100,
			"completion_time": 126,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 128,
			"data_handling_time": 32,
			"data_ship_length": 8,
			"mooring_time": 128,
			"completion_time": 159,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 149,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 180,
			"completion_time": 192,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 130,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 145,
			"completion_time": 157,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 47,
			"data_handling_time": 24,
			"data_ship_length": 8,
			"mooring_time": 60,
			"completion_time": 83,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 143,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 159,
			"completion_time": 177,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 95,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 95,
			"completion_time": 105,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 5,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 5,
			"completion_time": 20,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 47,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 110,
			"completion_time": 124,
			"mooring_berth": 14
		}
	]
};
var bks_bcn_24B_27_default = {
	solver: "ti,rp,sgcp",
	makespan: 183,
	dual_bound: 183,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 48,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 87,
			"completion_time": 100,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 30,
			"data_handling_time": 12,
			"data_ship_length": 8,
			"mooring_time": 71,
			"completion_time": 82,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 151,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 169,
			"completion_time": 183,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 3,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 72,
			"completion_time": 86,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 129,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 157,
			"completion_time": 168,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 1,
			"data_handling_time": 43,
			"data_ship_length": 8,
			"mooring_time": 3,
			"completion_time": 45,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 25,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 52,
			"completion_time": 63,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 100,
			"data_handling_time": 27,
			"data_ship_length": 6,
			"mooring_time": 101,
			"completion_time": 127,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 128,
			"data_handling_time": 32,
			"data_ship_length": 8,
			"mooring_time": 128,
			"completion_time": 159,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 22,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 26,
			"completion_time": 43,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 43,
			"data_handling_time": 10,
			"data_ship_length": 6,
			"mooring_time": 118,
			"completion_time": 127,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 58,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 90,
			"completion_time": 100,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 64,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 65,
			"completion_time": 89,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 76,
			"data_handling_time": 19,
			"data_ship_length": 6,
			"mooring_time": 83,
			"completion_time": 101,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 100,
			"data_handling_time": 46,
			"data_ship_length": 8,
			"mooring_time": 102,
			"completion_time": 147,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 130,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 144,
			"completion_time": 156,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 148,
			"data_handling_time": 36,
			"data_ship_length": 5,
			"mooring_time": 148,
			"completion_time": 183,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 106,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 173,
			"completion_time": 183,
			"mooring_berth": 1
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 47,
			"data_handling_time": 24,
			"data_ship_length": 8,
			"mooring_time": 47,
			"completion_time": 70,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 96,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 101,
			"completion_time": 117,
			"mooring_berth": 1
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 119,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 160,
			"completion_time": 170,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 139,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 160,
			"completion_time": 183,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 82,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 129,
			"completion_time": 143,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 5,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 6,
			"completion_time": 21,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 47,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 50,
			"completion_time": 64,
			"mooring_berth": 7
		}
	]
};
var bks_bcn_24B_28_default = {
	solver: "s,sgcp,ti,rp",
	makespan: 191,
	dual_bound: 191,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 48,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 54,
			"completion_time": 67,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 165,
			"data_handling_time": 27,
			"data_ship_length": 7,
			"mooring_time": 165,
			"completion_time": 191,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 151,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 177,
			"completion_time": 191,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 1,
			"data_handling_time": 43,
			"data_ship_length": 8,
			"mooring_time": 1,
			"completion_time": 43,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 132,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 142,
			"completion_time": 153,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 30,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 41,
			"completion_time": 54,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 22,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 23,
			"completion_time": 40,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 43,
			"data_handling_time": 10,
			"data_ship_length": 6,
			"mooring_time": 44,
			"completion_time": 53,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 58,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 70,
			"completion_time": 80,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 64,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 117,
			"completion_time": 141,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 76,
			"data_handling_time": 19,
			"data_ship_length": 6,
			"mooring_time": 81,
			"completion_time": 99,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 100,
			"data_handling_time": 46,
			"data_ship_length": 8,
			"mooring_time": 100,
			"completion_time": 145,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 39,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 55,
			"completion_time": 68,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 121,
			"data_handling_time": 4,
			"data_ship_length": 5,
			"mooring_time": 171,
			"completion_time": 174,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 106,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 106,
			"completion_time": 116,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 11,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 11,
			"completion_time": 22,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 122,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 122,
			"completion_time": 129,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 96,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 154,
			"completion_time": 170,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 119,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 130,
			"completion_time": 140,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 139,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 141,
			"completion_time": 164,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 77,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 82,
			"completion_time": 105,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 88,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 97,
			"completion_time": 121,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 71,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 71,
			"completion_time": 81,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 119,
			"data_handling_time": 45,
			"data_ship_length": 8,
			"mooring_time": 146,
			"completion_time": 190,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 82,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 82,
			"completion_time": 96,
			"mooring_berth": 16
		}
	]
};
var bks_bcn_24B_29_default = {
	solver: "rp,s,ti,sgcp",
	makespan: 171,
	dual_bound: 171,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 17,
			"data_handling_time": 14,
			"data_ship_length": 3,
			"mooring_time": 21,
			"completion_time": 34,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 34,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 62,
			"completion_time": 69,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 132,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 146,
			"completion_time": 157,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 106,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 113,
			"completion_time": 126,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 130,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 134,
			"completion_time": 149,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 28,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 29,
			"completion_time": 45,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 30,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 35,
			"completion_time": 48,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 39,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 49,
			"completion_time": 62,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 121,
			"data_handling_time": 4,
			"data_ship_length": 5,
			"mooring_time": 151,
			"completion_time": 154,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 154,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 155,
			"completion_time": 171,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 7,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 7,
			"completion_time": 20,
			"mooring_berth": 2
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 15,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 21,
			"completion_time": 28,
			"mooring_berth": 3
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 76,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 82,
			"completion_time": 92,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 95,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 113,
			"completion_time": 118,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 115,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 117,
			"completion_time": 133,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 11,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 16,
			"completion_time": 27,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 122,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 138,
			"completion_time": 145,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 38,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 52,
			"completion_time": 70,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 149,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 158,
			"completion_time": 171,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 77,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 93,
			"completion_time": 116,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 88,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 88,
			"completion_time": 112,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 71,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 71,
			"completion_time": 81,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 119,
			"data_handling_time": 45,
			"data_ship_length": 8,
			"mooring_time": 127,
			"completion_time": 171,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 70,
			"data_handling_time": 43,
			"data_ship_length": 8,
			"mooring_time": 70,
			"completion_time": 112,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 107,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 119,
			"completion_time": 135,
			"mooring_berth": 8
		}
	]
};
var bks_bcn_24B_3_default = {
	solver: "sgcp,pa,gspp,ti,rp",
	makespan: 164,
	dual_bound: 164,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 16,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 34,
			"completion_time": 41,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 149,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 149,
			"completion_time": 162,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 83,
			"data_handling_time": 47,
			"data_ship_length": 4,
			"mooring_time": 85,
			"completion_time": 131,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 16,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 29,
			"completion_time": 41,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 132,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 135,
			"completion_time": 147,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 17,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 17,
			"completion_time": 27,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 32,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 53,
			"completion_time": 68,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 155,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 155,
			"completion_time": 164,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 120,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 120,
			"completion_time": 139,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 120,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 135,
			"completion_time": 151,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 109,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 124,
			"completion_time": 132,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 6,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 6,
			"completion_time": 11,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 63,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 63,
			"completion_time": 72,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 78,
			"data_handling_time": 37,
			"data_ship_length": 4,
			"mooring_time": 82,
			"completion_time": 118,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 8,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 8,
			"completion_time": 12,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 23,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 46,
			"completion_time": 56,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 97,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 142,
			"completion_time": 147,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 83,
			"data_handling_time": 34,
			"data_ship_length": 4,
			"mooring_time": 83,
			"completion_time": 116,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 107,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 150,
			"completion_time": 162,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_24B_30_default = {
	solver: "s,ti,rp,sgcp",
	makespan: 177,
	dual_bound: 177,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 17,
			"data_handling_time": 14,
			"data_ship_length": 3,
			"mooring_time": 17,
			"completion_time": 30,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 155,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 163,
			"completion_time": 177,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 22,
			"data_handling_time": 23,
			"data_ship_length": 5,
			"mooring_time": 22,
			"completion_time": 44,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 97,
			"data_handling_time": 33,
			"data_ship_length": 8,
			"mooring_time": 97,
			"completion_time": 129,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 34,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 58,
			"completion_time": 65,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 118,
			"data_handling_time": 15,
			"data_ship_length": 8,
			"mooring_time": 130,
			"completion_time": 144,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 106,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 130,
			"completion_time": 143,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 130,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 145,
			"completion_time": 160,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 162,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 162,
			"completion_time": 177,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 66,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 113,
			"completion_time": 129,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 137,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 146,
			"completion_time": 160,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 28,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 32,
			"completion_time": 48,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 7,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 7,
			"completion_time": 20,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 15,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 15,
			"completion_time": 22,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 76,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 136,
			"completion_time": 146,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 95,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 124,
			"completion_time": 129,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 115,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 161,
			"completion_time": 177,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 19,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 23,
			"completion_time": 40,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 47,
			"data_handling_time": 9,
			"data_ship_length": 6,
			"mooring_time": 49,
			"completion_time": 57,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 49,
			"data_handling_time": 45,
			"data_ship_length": 8,
			"mooring_time": 49,
			"completion_time": 93,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 38,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 51,
			"completion_time": 69,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 149,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 149,
			"completion_time": 162,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 100,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 130,
			"completion_time": 135,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 70,
			"data_handling_time": 43,
			"data_ship_length": 8,
			"mooring_time": 70,
			"completion_time": 112,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 107,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 107,
			"completion_time": 123,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 11,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 11,
			"completion_time": 31,
			"mooring_berth": 7
		}
	]
};
var bks_bcn_24B_31_default = {
	solver: "gspp,sgcp,rp,ti",
	makespan: 197,
	dual_bound: 197,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 22,
			"data_handling_time": 23,
			"data_ship_length": 5,
			"mooring_time": 33,
			"completion_time": 55,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 156,
			"data_handling_time": 42,
			"data_ship_length": 4,
			"mooring_time": 156,
			"completion_time": 197,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 97,
			"data_handling_time": 33,
			"data_ship_length": 8,
			"mooring_time": 110,
			"completion_time": 142,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 118,
			"data_handling_time": 15,
			"data_ship_length": 8,
			"mooring_time": 144,
			"completion_time": 158,
			"mooring_berth": 3
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 66,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 176,
			"completion_time": 192,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 137,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 160,
			"completion_time": 174,
			"mooring_berth": 2
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 111,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 135,
			"completion_time": 153,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 19,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 19,
			"completion_time": 36,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 47,
			"data_handling_time": 9,
			"data_ship_length": 6,
			"mooring_time": 47,
			"completion_time": 55,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 49,
			"data_handling_time": 45,
			"data_ship_length": 8,
			"mooring_time": 57,
			"completion_time": 101,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 27,
			"data_handling_time": 18,
			"data_ship_length": 6,
			"mooring_time": 27,
			"completion_time": 44,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 52,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 92,
			"completion_time": 113,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 70,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 77,
			"completion_time": 90,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 89,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 115,
			"completion_time": 133,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 100,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 103,
			"completion_time": 108,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 22,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 63,
			"completion_time": 75,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 32,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 58,
			"completion_time": 66,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 78,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 104,
			"completion_time": 108,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 11,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 11,
			"completion_time": 31,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 153,
			"data_handling_time": 31,
			"data_ship_length": 5,
			"mooring_time": 162,
			"completion_time": 192,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 40,
			"data_handling_time": 22,
			"data_ship_length": 5,
			"mooring_time": 40,
			"completion_time": 61,
			"mooring_berth": 14
		}
	]
};
var bks_bcn_24B_32_default = {
	solver: "sgcp,ti,rp",
	makespan: 171,
	dual_bound: 171,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 6,
			"data_handling_time": 28,
			"data_ship_length": 4,
			"mooring_time": 35,
			"completion_time": 62,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 93,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 107,
			"completion_time": 123,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 118,
			"data_handling_time": 15,
			"data_ship_length": 8,
			"mooring_time": 124,
			"completion_time": 138,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 58,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 60,
			"completion_time": 75,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 111,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 114,
			"completion_time": 132,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 131,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 157,
			"completion_time": 171,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 27,
			"data_handling_time": 18,
			"data_ship_length": 6,
			"mooring_time": 86,
			"completion_time": 103,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 52,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 77,
			"completion_time": 98,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 135,
			"data_handling_time": 33,
			"data_ship_length": 7,
			"mooring_time": 139,
			"completion_time": 171,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 138,
			"data_handling_time": 34,
			"data_ship_length": 7,
			"mooring_time": 138,
			"completion_time": 171,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 47,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 101,
			"completion_time": 112,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 61,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 63,
			"completion_time": 74,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 70,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 83,
			"completion_time": 96,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 89,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 104,
			"completion_time": 122,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 124,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 136,
			"completion_time": 156,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 22,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 123,
			"completion_time": 135,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 7,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 17,
			"completion_time": 30,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 23,
			"data_handling_time": 18,
			"data_ship_length": 6,
			"mooring_time": 41,
			"completion_time": 58,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 80,
			"data_handling_time": 4,
			"data_ship_length": 5,
			"mooring_time": 99,
			"completion_time": 102,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 32,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 74,
			"completion_time": 82,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 78,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 133,
			"completion_time": 137,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 40,
			"data_handling_time": 22,
			"data_ship_length": 5,
			"mooring_time": 40,
			"completion_time": 61,
			"mooring_berth": 15
		}
	]
};
var bks_bcn_24B_33_default = {
	solver: "rp,ti,sgcp,gspp",
	makespan: 183,
	dual_bound: 183,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 6,
			"data_handling_time": 28,
			"data_ship_length": 4,
			"mooring_time": 6,
			"completion_time": 33,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 154,
			"data_handling_time": 30,
			"data_ship_length": 4,
			"mooring_time": 154,
			"completion_time": 183,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 95,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 95,
			"completion_time": 105,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 127,
			"data_handling_time": 31,
			"data_ship_length": 4,
			"mooring_time": 133,
			"completion_time": 163,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 58,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 59,
			"completion_time": 93,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 35,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 35,
			"completion_time": 45,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 93,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 94,
			"completion_time": 110,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 118,
			"data_handling_time": 15,
			"data_ship_length": 8,
			"mooring_time": 118,
			"completion_time": 132,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 58,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 73,
			"completion_time": 88,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 131,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 133,
			"completion_time": 147,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 4,
			"data_handling_time": 26,
			"data_ship_length": 6,
			"mooring_time": 4,
			"completion_time": 29,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 47,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 47,
			"completion_time": 58,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 61,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 61,
			"completion_time": 72,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 155,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 164,
			"completion_time": 176,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 82,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 89,
			"completion_time": 101,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 98,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 102,
			"completion_time": 118,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 126,
			"data_handling_time": 38,
			"data_ship_length": 5,
			"mooring_time": 126,
			"completion_time": 163,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 124,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 124,
			"completion_time": 144,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 115,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 170,
			"completion_time": 183,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 7,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 7,
			"completion_time": 20,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 23,
			"data_handling_time": 18,
			"data_ship_length": 6,
			"mooring_time": 23,
			"completion_time": 40,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 36,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 41,
			"completion_time": 57,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 80,
			"data_handling_time": 4,
			"data_ship_length": 5,
			"mooring_time": 80,
			"completion_time": 83,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 101,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 106,
			"completion_time": 120,
			"mooring_berth": 11
		}
	]
};
var bks_bcn_24B_34_default = {
	solver: "sgcp",
	makespan: 200,
	dual_bound: 187,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 0,
			"data_handling_time": 29,
			"data_ship_length": 8,
			"mooring_time": 1,
			"completion_time": 29,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 95,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 120,
			"completion_time": 130,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 127,
			"data_handling_time": 31,
			"data_ship_length": 4,
			"mooring_time": 134,
			"completion_time": 164,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 58,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 72,
			"completion_time": 106,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 35,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 57,
			"completion_time": 67,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 4,
			"data_handling_time": 26,
			"data_ship_length": 6,
			"mooring_time": 57,
			"completion_time": 82,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 38,
			"data_handling_time": 34,
			"data_ship_length": 8,
			"mooring_time": 38,
			"completion_time": 71,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 145,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 184,
			"completion_time": 200,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 144,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 168,
			"completion_time": 183,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 82,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 138,
			"completion_time": 150,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 98,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 169,
			"completion_time": 185,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 126,
			"data_handling_time": 38,
			"data_ship_length": 5,
			"mooring_time": 131,
			"completion_time": 168,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 138,
			"data_handling_time": 36,
			"data_ship_length": 8,
			"mooring_time": 165,
			"completion_time": 200,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 11,
			"data_handling_time": 25,
			"data_ship_length": 8,
			"mooring_time": 11,
			"completion_time": 35,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 36,
			"data_handling_time": 21,
			"data_ship_length": 8,
			"mooring_time": 36,
			"completion_time": 56,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 74,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 83,
			"completion_time": 100,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 120,
			"data_handling_time": 22,
			"data_ship_length": 5,
			"mooring_time": 142,
			"completion_time": 163,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 115,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 120,
			"completion_time": 133,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 36,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 103,
			"completion_time": 119,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 77,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 186,
			"completion_time": 200,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 100,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 151,
			"completion_time": 167,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 77,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 83,
			"completion_time": 102,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 101,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 103,
			"completion_time": 117,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 107,
			"data_handling_time": 31,
			"data_ship_length": 8,
			"mooring_time": 107,
			"completion_time": 137,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 59,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 68,
			"completion_time": 82,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_24B_35_default = {
	solver: "sgcp,rp,ti",
	makespan: 185,
	dual_bound: 185,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 0,
			"data_handling_time": 29,
			"data_ship_length": 8,
			"mooring_time": 0,
			"completion_time": 28,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 167,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 167,
			"completion_time": 185,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 38,
			"data_handling_time": 34,
			"data_ship_length": 8,
			"mooring_time": 42,
			"completion_time": 75,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 145,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 150,
			"completion_time": 166,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 46,
			"data_handling_time": 32,
			"data_ship_length": 8,
			"mooring_time": 46,
			"completion_time": 77,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 88,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 104,
			"completion_time": 138,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 144,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 170,
			"completion_time": 185,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 11,
			"data_handling_time": 25,
			"data_ship_length": 8,
			"mooring_time": 17,
			"completion_time": 41,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 36,
			"data_handling_time": 21,
			"data_ship_length": 8,
			"mooring_time": 81,
			"completion_time": 101,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 74,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 102,
			"completion_time": 119,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 120,
			"data_handling_time": 22,
			"data_ship_length": 5,
			"mooring_time": 126,
			"completion_time": 147,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 5,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 5,
			"completion_time": 16,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 21,
			"data_handling_time": 12,
			"data_ship_length": 8,
			"mooring_time": 29,
			"completion_time": 40,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 71,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 92,
			"completion_time": 103,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 118,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 158,
			"completion_time": 169,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 140,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 142,
			"completion_time": 157,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 94,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 170,
			"completion_time": 183,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 77,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 105,
			"completion_time": 119,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 100,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 125,
			"completion_time": 141,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 77,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 82,
			"completion_time": 101,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 107,
			"data_handling_time": 31,
			"data_ship_length": 8,
			"mooring_time": 139,
			"completion_time": 169,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 59,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 77,
			"completion_time": 91,
			"mooring_berth": 7
		}
	]
};
var bks_bcn_24B_36_default = {
	solver: "gspp,sgcp,ti,rp",
	makespan: 173,
	dual_bound: 173,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 46,
			"data_handling_time": 32,
			"data_ship_length": 8,
			"mooring_time": 48,
			"completion_time": 79,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 88,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 88,
			"completion_time": 122,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 130,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 132,
			"completion_time": 149,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 5,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 5,
			"completion_time": 16,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 21,
			"data_handling_time": 12,
			"data_ship_length": 8,
			"mooring_time": 21,
			"completion_time": 32,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 71,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 72,
			"completion_time": 83,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 118,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 124,
			"completion_time": 135,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 140,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 157,
			"completion_time": 172,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 4,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 4,
			"completion_time": 9,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 37,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 49,
			"completion_time": 67,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 82,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 85,
			"completion_time": 97,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 103,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 105,
			"completion_time": 122,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 94,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 139,
			"completion_time": 152,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 33,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 34,
			"completion_time": 47,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 91,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 137,
			"completion_time": 152,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 154,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 154,
			"completion_time": 173,
			"mooring_berth": 3
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 12,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 18,
			"completion_time": 30,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 113,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 124,
			"completion_time": 136,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 29,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 31,
			"completion_time": 36,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 7,
			"data_handling_time": 23,
			"data_ship_length": 4,
			"mooring_time": 7,
			"completion_time": 29,
			"mooring_berth": 6
		}
	]
};
var bks_bcn_24B_37_default = {
	solver: "s,rp,ti,pa,sgcp",
	makespan: 171,
	dual_bound: 171,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 150,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 158,
			"completion_time": 171,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 18,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 31,
			"completion_time": 37,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 156,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 156,
			"completion_time": 171,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 10,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 10,
			"completion_time": 30,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 130,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 130,
			"completion_time": 147,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 4,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 4,
			"completion_time": 9,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 37,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 44,
			"completion_time": 62,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 82,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 82,
			"completion_time": 94,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 103,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 112,
			"completion_time": 129,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 29,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 31,
			"completion_time": 43,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 76,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 76,
			"completion_time": 89,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 118,
			"data_handling_time": 40,
			"data_ship_length": 8,
			"mooring_time": 118,
			"completion_time": 157,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 33,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 46,
			"completion_time": 59,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 91,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 91,
			"completion_time": 106,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 12,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 12,
			"completion_time": 24,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 113,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 130,
			"completion_time": 142,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 29,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 30,
			"completion_time": 35,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 36,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 36,
			"completion_time": 45,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 7,
			"data_handling_time": 23,
			"data_ship_length": 4,
			"mooring_time": 7,
			"completion_time": 29,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 47,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 94,
			"completion_time": 111,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 155,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 155,
			"completion_time": 171,
			"mooring_berth": 5
		}
	]
};
var bks_bcn_24B_38_default = {
	solver: "rp,s,ti,sgcp",
	makespan: 182,
	dual_bound: 182,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 151,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 158,
			"completion_time": 182,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 150,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 169,
			"completion_time": 182,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 47,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 66,
			"completion_time": 69,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 18,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 18,
			"completion_time": 24,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 162,
			"data_handling_time": 21,
			"data_ship_length": 8,
			"mooring_time": 162,
			"completion_time": 182,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 21,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 31,
			"completion_time": 65,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 10,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 10,
			"completion_time": 30,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 115,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 115,
			"completion_time": 125,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 143,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 143,
			"completion_time": 157,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 29,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 34,
			"completion_time": 46,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 76,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 84,
			"completion_time": 97,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 118,
			"data_handling_time": 40,
			"data_ship_length": 8,
			"mooring_time": 122,
			"completion_time": 161,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 46,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 70,
			"completion_time": 83,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 60,
			"data_handling_time": 16,
			"data_ship_length": 8,
			"mooring_time": 98,
			"completion_time": 113,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 83,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 87,
			"completion_time": 121,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 150,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 154,
			"completion_time": 166,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 106,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 133,
			"completion_time": 142,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 121,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 126,
			"completion_time": 138,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 125,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 139,
			"completion_time": 153,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 66,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 66,
			"completion_time": 80,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 36,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 36,
			"completion_time": 45,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 30,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 30,
			"completion_time": 33,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 47,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 66,
			"completion_time": 83,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 88,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 88,
			"completion_time": 98,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 11,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 11,
			"completion_time": 23,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 29,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 47,
			"completion_time": 58,
			"mooring_berth": 15
		}
	]
};
var bks_bcn_24B_39_default = {
	solver: "ti,rp,sgcp",
	makespan: 191,
	dual_bound: 191,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 47,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 188,
			"completion_time": 191,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 108,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 121,
			"completion_time": 128,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 21,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 21,
			"completion_time": 55,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 167,
			"data_handling_time": 25,
			"data_ship_length": 8,
			"mooring_time": 167,
			"completion_time": 191,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 115,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 129,
			"completion_time": 139,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 143,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 177,
			"completion_time": 191,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 37,
			"data_handling_time": 25,
			"data_ship_length": 8,
			"mooring_time": 37,
			"completion_time": 61,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 107,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 108,
			"completion_time": 118,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 142,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 145,
			"completion_time": 164,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 46,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 90,
			"completion_time": 103,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 60,
			"data_handling_time": 16,
			"data_ship_length": 8,
			"mooring_time": 62,
			"completion_time": 77,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 83,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 83,
			"completion_time": 117,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 150,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 165,
			"completion_time": 177,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 11,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 12,
			"completion_time": 31,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 48,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 56,
			"completion_time": 76,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 149,
			"data_handling_time": 15,
			"data_ship_length": 6,
			"mooring_time": 152,
			"completion_time": 166,
			"mooring_berth": 2
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 106,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 178,
			"completion_time": 187,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 121,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 138,
			"completion_time": 150,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 125,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 130,
			"completion_time": 144,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 89,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 100,
			"completion_time": 119,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 66,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 66,
			"completion_time": 80,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 120,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 120,
			"completion_time": 137,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 125,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 140,
			"completion_time": 153,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 34,
			"data_handling_time": 9,
			"data_ship_length": 5,
			"mooring_time": 78,
			"completion_time": 86,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 30,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 124,
			"completion_time": 127,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 88,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 119,
			"completion_time": 129,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 151,
			"data_handling_time": 23,
			"data_ship_length": 4,
			"mooring_time": 154,
			"completion_time": 176,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 11,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 87,
			"completion_time": 99,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 29,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 78,
			"completion_time": 89,
			"mooring_berth": 6
		}
	]
};
var bks_bcn_24B_4_default = {
	solver: "sgcp,gspp,rp,ti",
	makespan: 169,
	dual_bound: 169,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 37,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 76,
			"completion_time": 81,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 112,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 124,
			"completion_time": 138,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 83,
			"data_handling_time": 47,
			"data_ship_length": 4,
			"mooring_time": 83,
			"completion_time": 129,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 132,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 136,
			"completion_time": 148,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 162,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 162,
			"completion_time": 169,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 53,
			"data_handling_time": 26,
			"data_ship_length": 7,
			"mooring_time": 53,
			"completion_time": 78,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 17,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 17,
			"completion_time": 27,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 37,
			"data_handling_time": 9,
			"data_ship_length": 7,
			"mooring_time": 37,
			"completion_time": 45,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 32,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 32,
			"completion_time": 47,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 155,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 160,
			"completion_time": 169,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 150,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 162,
			"completion_time": 169,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 120,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 137,
			"completion_time": 153,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 97,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 142,
			"completion_time": 157,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 120,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 123,
			"completion_time": 133,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 8,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 8,
			"completion_time": 12,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 23,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 23,
			"completion_time": 33,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 97,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 101,
			"completion_time": 106,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 83,
			"data_handling_time": 34,
			"data_ship_length": 4,
			"mooring_time": 87,
			"completion_time": 120,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 107,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 109,
			"completion_time": 121,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 8,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 8,
			"completion_time": 13,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 54,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 71,
			"completion_time": 74,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 67,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 67,
			"completion_time": 81,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 84,
			"data_handling_time": 31,
			"data_ship_length": 4,
			"mooring_time": 102,
			"completion_time": 132,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 81,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 82,
			"completion_time": 98,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 131,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 150,
			"completion_time": 160,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_24B_40_default = {
	solver: "sgcp,ti,rp",
	makespan: 176,
	dual_bound: 176,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 108,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 112,
			"completion_time": 119,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 95,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 103,
			"completion_time": 116,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 37,
			"data_handling_time": 25,
			"data_ship_length": 8,
			"mooring_time": 37,
			"completion_time": 61,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 107,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 117,
			"completion_time": 127,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 142,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 142,
			"completion_time": 161,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 133,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 152,
			"completion_time": 161,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 11,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 83,
			"completion_time": 102,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 48,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 64,
			"completion_time": 84,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 149,
			"data_handling_time": 15,
			"data_ship_length": 6,
			"mooring_time": 162,
			"completion_time": 176,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 36,
			"data_handling_time": 15,
			"data_ship_length": 6,
			"mooring_time": 64,
			"completion_time": 78,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 90,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 165,
			"completion_time": 176,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 125,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 128,
			"completion_time": 144,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 89,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 89,
			"completion_time": 108,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 120,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 120,
			"completion_time": 137,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 125,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 138,
			"completion_time": 151,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 8,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 62,
			"completion_time": 80,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 11,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 14,
			"completion_time": 34,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 107,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 110,
			"completion_time": 130,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 34,
			"data_handling_time": 9,
			"data_ship_length": 5,
			"mooring_time": 43,
			"completion_time": 51,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 77,
			"data_handling_time": 16,
			"data_ship_length": 3,
			"mooring_time": 87,
			"completion_time": 102,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 143,
			"data_handling_time": 26,
			"data_ship_length": 4,
			"mooring_time": 151,
			"completion_time": 176,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 63,
			"data_handling_time": 24,
			"data_ship_length": 4,
			"mooring_time": 85,
			"completion_time": 108,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 93,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 105,
			"completion_time": 115,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 139,
			"data_handling_time": 28,
			"data_ship_length": 4,
			"mooring_time": 145,
			"completion_time": 172,
			"mooring_berth": 4
		}
	]
};
var bks_bcn_24B_41_default = {
	solver: "s,sgcp,rp,ti",
	makespan: 189,
	dual_bound: 189,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 138,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 142,
			"completion_time": 154,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 144,
			"data_handling_time": 42,
			"data_ship_length": 8,
			"mooring_time": 148,
			"completion_time": 189,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 12,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 21,
			"completion_time": 35,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 95,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 105,
			"completion_time": 118,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 133,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 138,
			"completion_time": 147,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 153,
			"data_handling_time": 15,
			"data_ship_length": 6,
			"mooring_time": 175,
			"completion_time": 189,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 153,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 179,
			"completion_time": 189,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 39,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 39,
			"completion_time": 73,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 36,
			"data_handling_time": 15,
			"data_ship_length": 6,
			"mooring_time": 74,
			"completion_time": 88,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 90,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 107,
			"completion_time": 118,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 125,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 125,
			"completion_time": 141,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 4,
			"data_handling_time": 17,
			"data_ship_length": 6,
			"mooring_time": 4,
			"completion_time": 20,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 23,
			"data_handling_time": 12,
			"data_ship_length": 8,
			"mooring_time": 27,
			"completion_time": 38,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 119,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 119,
			"completion_time": 137,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 31,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 39,
			"completion_time": 49,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 106,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 106,
			"completion_time": 112,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 142,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 155,
			"completion_time": 178,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 8,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 8,
			"completion_time": 26,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 11,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 11,
			"completion_time": 31,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 107,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 113,
			"completion_time": 133,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 47,
			"data_handling_time": 23,
			"data_ship_length": 7,
			"mooring_time": 50,
			"completion_time": 72,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 77,
			"data_handling_time": 16,
			"data_ship_length": 3,
			"mooring_time": 77,
			"completion_time": 92,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 130,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 134,
			"completion_time": 146,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 63,
			"data_handling_time": 24,
			"data_ship_length": 4,
			"mooring_time": 63,
			"completion_time": 86,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 93,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 94,
			"completion_time": 104,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 139,
			"data_handling_time": 28,
			"data_ship_length": 4,
			"mooring_time": 147,
			"completion_time": 174,
			"mooring_berth": 8
		}
	]
};
var bks_bcn_24B_42_default = {
	solver: "sgcp,ti,rp",
	makespan: 175,
	dual_bound: 175,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 138,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 147,
			"completion_time": 159,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 83,
			"data_handling_time": 11,
			"data_ship_length": 8,
			"mooring_time": 105,
			"completion_time": 115,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 12,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 12,
			"completion_time": 26,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 108,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 108,
			"completion_time": 123,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 153,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 160,
			"completion_time": 170,
			"mooring_berth": 2
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 10,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 21,
			"completion_time": 39,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 115,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 116,
			"completion_time": 131,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 100,
			"data_handling_time": 34,
			"data_ship_length": 8,
			"mooring_time": 100,
			"completion_time": 133,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 10,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 12,
			"completion_time": 26,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 39,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 40,
			"completion_time": 74,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 4,
			"data_handling_time": 17,
			"data_ship_length": 6,
			"mooring_time": 4,
			"completion_time": 20,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 23,
			"data_handling_time": 12,
			"data_ship_length": 8,
			"mooring_time": 27,
			"completion_time": 38,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 119,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 124,
			"completion_time": 142,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 160,
			"data_handling_time": 16,
			"data_ship_length": 8,
			"mooring_time": 160,
			"completion_time": 175,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 47,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 147,
			"completion_time": 158,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 35,
			"data_handling_time": 44,
			"data_ship_length": 8,
			"mooring_time": 39,
			"completion_time": 82,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 31,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 89,
			"completion_time": 99,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 106,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 132,
			"completion_time": 138,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 142,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 152,
			"completion_time": 175,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 137,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 139,
			"completion_time": 151,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 47,
			"data_handling_time": 23,
			"data_ship_length": 7,
			"mooring_time": 82,
			"completion_time": 104,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 130,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 134,
			"completion_time": 146,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 6,
			"data_handling_time": 5,
			"data_ship_length": 5,
			"mooring_time": 171,
			"completion_time": 175,
			"mooring_berth": 1
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 48,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 65,
			"completion_time": 73,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 126,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 136,
			"completion_time": 146,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 28,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 75,
			"completion_time": 88,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 82,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 87,
			"completion_time": 99,
			"mooring_berth": 2
		}
	]
};
var bks_bcn_24B_43_default = {
	solver: "rp,ti,sgcp",
	makespan: 180,
	dual_bound: 179,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 3,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 3,
			"completion_time": 24,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 83,
			"data_handling_time": 11,
			"data_ship_length": 8,
			"mooring_time": 88,
			"completion_time": 98,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 33,
			"data_handling_time": 46,
			"data_ship_length": 8,
			"mooring_time": 36,
			"completion_time": 81,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 108,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 108,
			"completion_time": 123,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 10,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 10,
			"completion_time": 28,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 115,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 165,
			"completion_time": 180,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 100,
			"data_handling_time": 34,
			"data_ship_length": 8,
			"mooring_time": 108,
			"completion_time": 141,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 107,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 142,
			"completion_time": 152,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 10,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 29,
			"completion_time": 43,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 149,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 149,
			"completion_time": 167,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 47,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 153,
			"completion_time": 164,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 35,
			"data_handling_time": 44,
			"data_ship_length": 8,
			"mooring_time": 44,
			"completion_time": 87,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 11,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 25,
			"completion_time": 35,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 30,
			"data_handling_time": 22,
			"data_ship_length": 6,
			"mooring_time": 84,
			"completion_time": 105,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 93,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 95,
			"completion_time": 106,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 128,
			"data_handling_time": 21,
			"data_ship_length": 8,
			"mooring_time": 128,
			"completion_time": 148,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 137,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 168,
			"completion_time": 180,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 152,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 168,
			"completion_time": 180,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 92,
			"data_handling_time": 29,
			"data_ship_length": 8,
			"mooring_time": 99,
			"completion_time": 127,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 6,
			"data_handling_time": 5,
			"data_ship_length": 5,
			"mooring_time": 6,
			"completion_time": 10,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 48,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 48,
			"completion_time": 56,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 126,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 131,
			"completion_time": 141,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 142,
			"data_handling_time": 38,
			"data_ship_length": 5,
			"mooring_time": 143,
			"completion_time": 180,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 28,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 29,
			"completion_time": 42,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 82,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 82,
			"completion_time": 94,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 15,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 15,
			"completion_time": 25,
			"mooring_berth": 7
		}
	]
};
var bks_bcn_24B_44_default = {
	solver: "ti,rp,sgcp",
	makespan: 185,
	dual_bound: 185,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 3,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 8,
			"completion_time": 29,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 33,
			"data_handling_time": 46,
			"data_ship_length": 8,
			"mooring_time": 33,
			"completion_time": 78,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 91,
			"data_handling_time": 39,
			"data_ship_length": 8,
			"mooring_time": 91,
			"completion_time": 129,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 119,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 130,
			"completion_time": 142,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 107,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 143,
			"completion_time": 153,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 136,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 172,
			"completion_time": 183,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 142,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 155,
			"completion_time": 169,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 11,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 11,
			"completion_time": 21,
			"mooring_berth": 1
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 30,
			"data_handling_time": 22,
			"data_ship_length": 6,
			"mooring_time": 30,
			"completion_time": 51,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 93,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 93,
			"completion_time": 104,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 128,
			"data_handling_time": 21,
			"data_ship_length": 8,
			"mooring_time": 134,
			"completion_time": 154,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 151,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 154,
			"completion_time": 170,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 35,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 79,
			"completion_time": 103,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 52,
			"data_handling_time": 34,
			"data_ship_length": 8,
			"mooring_time": 53,
			"completion_time": 86,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 129,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 170,
			"completion_time": 185,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 106,
			"data_handling_time": 21,
			"data_ship_length": 6,
			"mooring_time": 130,
			"completion_time": 150,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 152,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 171,
			"completion_time": 183,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 5,
			"data_handling_time": 41,
			"data_ship_length": 5,
			"mooring_time": 5,
			"completion_time": 45,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 79,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 81,
			"completion_time": 90,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 92,
			"data_handling_time": 29,
			"data_ship_length": 8,
			"mooring_time": 105,
			"completion_time": 133,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 72,
			"data_handling_time": 4,
			"data_ship_length": 5,
			"mooring_time": 87,
			"completion_time": 90,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 11,
			"data_handling_time": 21,
			"data_ship_length": 4,
			"mooring_time": 105,
			"completion_time": 125,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 142,
			"data_handling_time": 35,
			"data_ship_length": 4,
			"mooring_time": 151,
			"completion_time": 185,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 15,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 22,
			"completion_time": 32,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_24B_45_default = {
	solver: "gspp,rp,ti,sgcp",
	makespan: 185,
	dual_bound: 185,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 91,
			"data_handling_time": 39,
			"data_ship_length": 8,
			"mooring_time": 93,
			"completion_time": 131,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 119,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 150,
			"completion_time": 162,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 120,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 121,
			"completion_time": 129,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 136,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 153,
			"completion_time": 164,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 157,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 172,
			"completion_time": 185,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 127,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 148,
			"completion_time": 153,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 13,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 13,
			"completion_time": 26,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 142,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 156,
			"completion_time": 170,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 35,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 35,
			"completion_time": 59,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 52,
			"data_handling_time": 34,
			"data_ship_length": 8,
			"mooring_time": 52,
			"completion_time": 85,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 129,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 133,
			"completion_time": 148,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 72,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 75,
			"completion_time": 86,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 79,
			"data_handling_time": 16,
			"data_ship_length": 8,
			"mooring_time": 98,
			"completion_time": 113,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 106,
			"data_handling_time": 21,
			"data_ship_length": 6,
			"mooring_time": 131,
			"completion_time": 151,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 31,
			"data_handling_time": 18,
			"data_ship_length": 6,
			"mooring_time": 31,
			"completion_time": 48,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 112,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 140,
			"completion_time": 146,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 5,
			"data_handling_time": 41,
			"data_ship_length": 5,
			"mooring_time": 5,
			"completion_time": 45,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 79,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 87,
			"completion_time": 96,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 166,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 166,
			"completion_time": 185,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 23,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 61,
			"completion_time": 73,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 90,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 133,
			"completion_time": 138,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 72,
			"data_handling_time": 4,
			"data_ship_length": 5,
			"mooring_time": 88,
			"completion_time": 91,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 80,
			"data_handling_time": 5,
			"data_ship_length": 5,
			"mooring_time": 87,
			"completion_time": 91,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 102,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 115,
			"completion_time": 129,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 11,
			"data_handling_time": 21,
			"data_ship_length": 4,
			"mooring_time": 11,
			"completion_time": 31,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 139,
			"data_handling_time": 22,
			"data_ship_length": 5,
			"mooring_time": 164,
			"completion_time": 185,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_24B_46_default = {
	solver: "s,sgcp,ti,rp",
	makespan: 162,
	dual_bound: 162,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 73,
			"data_handling_time": 26,
			"data_ship_length": 5,
			"mooring_time": 107,
			"completion_time": 132,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 120,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 124,
			"completion_time": 132,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 127,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 133,
			"completion_time": 138,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 128,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 139,
			"completion_time": 151,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 13,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 13,
			"completion_time": 26,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 72,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 95,
			"completion_time": 106,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 79,
			"data_handling_time": 16,
			"data_ship_length": 8,
			"mooring_time": 79,
			"completion_time": 94,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 16,
			"data_handling_time": 27,
			"data_ship_length": 7,
			"mooring_time": 49,
			"completion_time": 75,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 62,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 81,
			"completion_time": 94,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 141,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 141,
			"completion_time": 162,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 31,
			"data_handling_time": 18,
			"data_ship_length": 6,
			"mooring_time": 31,
			"completion_time": 48,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 112,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 117,
			"completion_time": 123,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 41,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 41,
			"completion_time": 58,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 49,
			"data_handling_time": 22,
			"data_ship_length": 5,
			"mooring_time": 49,
			"completion_time": 70,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 23,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 23,
			"completion_time": 35,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 90,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 91,
			"completion_time": 96,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 116,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 116,
			"completion_time": 125,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 108,
			"data_handling_time": 23,
			"data_ship_length": 5,
			"mooring_time": 108,
			"completion_time": 130,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 80,
			"data_handling_time": 5,
			"data_ship_length": 5,
			"mooring_time": 80,
			"completion_time": 84,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 102,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 102,
			"completion_time": 116,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 87,
			"data_handling_time": 4,
			"data_ship_length": 5,
			"mooring_time": 87,
			"completion_time": 90,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 30,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 30,
			"completion_time": 37,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 139,
			"data_handling_time": 22,
			"data_ship_length": 5,
			"mooring_time": 139,
			"completion_time": 160,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 0,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 2,
			"completion_time": 12,
			"mooring_berth": 15
		}
	]
};
var bks_bcn_24B_48_default = {
	solver: "sgcp,rp,ti,gspp",
	makespan: 181,
	dual_bound: 181,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 127,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 135,
			"completion_time": 155,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 50,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 72,
			"completion_time": 85,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 19,
			"data_handling_time": 2,
			"data_ship_length": 5,
			"mooring_time": 19,
			"completion_time": 20,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 33,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 35,
			"completion_time": 52,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 37,
			"data_handling_time": 20,
			"data_ship_length": 6,
			"mooring_time": 43,
			"completion_time": 62,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 102,
			"data_handling_time": 4,
			"data_ship_length": 5,
			"mooring_time": 178,
			"completion_time": 181,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 4,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 4,
			"completion_time": 19,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 22,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 22,
			"completion_time": 41,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 67,
			"data_handling_time": 27,
			"data_ship_length": 7,
			"mooring_time": 96,
			"completion_time": 122,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 139,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 166,
			"completion_time": 181,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 85,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 129,
			"completion_time": 142,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 101,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 163,
			"completion_time": 175,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 124,
			"data_handling_time": 38,
			"data_ship_length": 6,
			"mooring_time": 124,
			"completion_time": 161,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 58,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 58,
			"completion_time": 70,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 107,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 127,
			"completion_time": 133,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 110,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 111,
			"completion_time": 127,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 72,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 87,
			"completion_time": 101,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 144,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 144,
			"completion_time": 161,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 17,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 17,
			"completion_time": 31,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 59,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 94,
			"completion_time": 109,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 68,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 71,
			"completion_time": 92,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 30,
			"data_handling_time": 4,
			"data_ship_length": 5,
			"mooring_time": 65,
			"completion_time": 68,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 157,
			"data_handling_time": 25,
			"data_ship_length": 4,
			"mooring_time": 157,
			"completion_time": 181,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 48,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 55,
			"completion_time": 69,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 60,
			"data_handling_time": 23,
			"data_ship_length": 5,
			"mooring_time": 103,
			"completion_time": 125,
			"mooring_berth": 14
		}
	]
};
var bks_bcn_24B_49_default = {
	solver: "sgcp,ti,rp",
	makespan: 186,
	dual_bound: 186,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 23,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 23,
			"completion_time": 42,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 77,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 116,
			"completion_time": 128,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 127,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 131,
			"completion_time": 151,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 6,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 77,
			"completion_time": 88,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 50,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 63,
			"completion_time": 76,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 37,
			"data_handling_time": 20,
			"data_ship_length": 6,
			"mooring_time": 43,
			"completion_time": 62,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 102,
			"data_handling_time": 4,
			"data_ship_length": 5,
			"mooring_time": 132,
			"completion_time": 135,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 159,
			"data_handling_time": 28,
			"data_ship_length": 5,
			"mooring_time": 159,
			"completion_time": 186,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 123,
			"data_handling_time": 39,
			"data_ship_length": 8,
			"mooring_time": 123,
			"completion_time": 161,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 85,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 92,
			"completion_time": 105,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 101,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 174,
			"completion_time": 186,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 124,
			"data_handling_time": 38,
			"data_ship_length": 6,
			"mooring_time": 136,
			"completion_time": 173,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 9,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 13,
			"completion_time": 30,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 30,
			"data_handling_time": 40,
			"data_ship_length": 8,
			"mooring_time": 34,
			"completion_time": 73,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 73,
			"data_handling_time": 27,
			"data_ship_length": 8,
			"mooring_time": 74,
			"completion_time": 100,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 97,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 98,
			"completion_time": 115,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 131,
			"data_handling_time": 25,
			"data_ship_length": 8,
			"mooring_time": 162,
			"completion_time": 186,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 107,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 118,
			"completion_time": 130,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 120,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 152,
			"completion_time": 158,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 17,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 44,
			"completion_time": 58,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 59,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 59,
			"completion_time": 74,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 68,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 101,
			"completion_time": 122,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 48,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 106,
			"completion_time": 117,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 60,
			"data_handling_time": 23,
			"data_ship_length": 5,
			"mooring_time": 75,
			"completion_time": 97,
			"mooring_berth": 7
		}
	]
};
var bks_bcn_24B_5_default = {
	solver: "ti,rp,sgcp",
	makespan: 173,
	dual_bound: 173,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 97,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 102,
			"completion_time": 125,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 138,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 151,
			"completion_time": 158,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 37,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 116,
			"completion_time": 121,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 112,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 126,
			"completion_time": 140,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 163,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 163,
			"completion_time": 173,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 53,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 110,
			"completion_time": 122,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 149,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 158,
			"completion_time": 173,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 23,
			"data_handling_time": 20,
			"data_ship_length": 8,
			"mooring_time": 23,
			"completion_time": 42,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 53,
			"data_handling_time": 26,
			"data_ship_length": 7,
			"mooring_time": 76,
			"completion_time": 101,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 47,
			"data_handling_time": 26,
			"data_ship_length": 8,
			"mooring_time": 49,
			"completion_time": 74,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 65,
			"data_handling_time": 39,
			"data_ship_length": 8,
			"mooring_time": 65,
			"completion_time": 103,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 37,
			"data_handling_time": 9,
			"data_ship_length": 7,
			"mooring_time": 50,
			"completion_time": 58,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 111,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 129,
			"completion_time": 146,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 150,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 150,
			"completion_time": 157,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 6,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 10,
			"completion_time": 21,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 97,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 147,
			"completion_time": 162,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 129,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 161,
			"completion_time": 172,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 120,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 136,
			"completion_time": 146,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 8,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 56,
			"completion_time": 61,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 54,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 122,
			"completion_time": 125,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 67,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 69,
			"completion_time": 83,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 84,
			"data_handling_time": 31,
			"data_ship_length": 4,
			"mooring_time": 85,
			"completion_time": 115,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 167,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 168,
			"completion_time": 173,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 36,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 126,
			"completion_time": 135,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 84,
			"data_handling_time": 32,
			"data_ship_length": 4,
			"mooring_time": 121,
			"completion_time": 152,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 120,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 141,
			"completion_time": 150,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 81,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 104,
			"completion_time": 120,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 131,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 153,
			"completion_time": 163,
			"mooring_berth": 15
		}
	]
};
var bks_bcn_24B_6_default = {
	solver: "rp,ti,s,sgcp",
	makespan: 189,
	dual_bound: 189,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 97,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 97,
			"completion_time": 120,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 138,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 182,
			"completion_time": 189,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 53,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 63,
			"completion_time": 75,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 149,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 174,
			"completion_time": 189,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 23,
			"data_handling_time": 20,
			"data_ship_length": 8,
			"mooring_time": 23,
			"completion_time": 42,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 47,
			"data_handling_time": 26,
			"data_ship_length": 8,
			"mooring_time": 47,
			"completion_time": 72,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 65,
			"data_handling_time": 39,
			"data_ship_length": 8,
			"mooring_time": 73,
			"completion_time": 111,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 3,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 3,
			"completion_time": 19,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 111,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 121,
			"completion_time": 136,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 78,
			"data_handling_time": 30,
			"data_ship_length": 8,
			"mooring_time": 121,
			"completion_time": 150,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 111,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 137,
			"completion_time": 154,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 167,
			"data_handling_time": 23,
			"data_ship_length": 6,
			"mooring_time": 167,
			"completion_time": 189,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 54,
			"data_handling_time": 9,
			"data_ship_length": 6,
			"mooring_time": 112,
			"completion_time": 120,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 32,
			"data_handling_time": 43,
			"data_ship_length": 8,
			"mooring_time": 39,
			"completion_time": 81,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 6,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 6,
			"completion_time": 17,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 156,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 162,
			"completion_time": 173,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 25,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 25,
			"completion_time": 38,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 143,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 161,
			"completion_time": 170,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 129,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 155,
			"completion_time": 166,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 88,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 171,
			"completion_time": 188,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 131,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 151,
			"completion_time": 158,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 36,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 39,
			"completion_time": 48,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 84,
			"data_handling_time": 32,
			"data_ship_length": 4,
			"mooring_time": 129,
			"completion_time": 160,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 120,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 172,
			"completion_time": 181,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 41,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 49,
			"completion_time": 62,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 59,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 84,
			"completion_time": 96,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 78,
			"data_handling_time": 43,
			"data_ship_length": 4,
			"mooring_time": 84,
			"completion_time": 126,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 144,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 151,
			"completion_time": 160,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 155,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 161,
			"completion_time": 166,
			"mooring_berth": 5
		}
	]
};
var bks_bcn_24B_7_default = {
	solver: "sgcp,ti,rp",
	makespan: 180,
	dual_bound: 180,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 3,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 61,
			"completion_time": 77,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 111,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 128,
			"completion_time": 143,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 133,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 144,
			"completion_time": 153,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 78,
			"data_handling_time": 30,
			"data_ship_length": 8,
			"mooring_time": 78,
			"completion_time": 107,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 54,
			"data_handling_time": 9,
			"data_ship_length": 6,
			"mooring_time": 128,
			"completion_time": 136,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 32,
			"data_handling_time": 43,
			"data_ship_length": 8,
			"mooring_time": 34,
			"completion_time": 76,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 166,
			"data_handling_time": 15,
			"data_ship_length": 6,
			"mooring_time": 166,
			"completion_time": 180,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 54,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 65,
			"completion_time": 75,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 84,
			"data_handling_time": 43,
			"data_ship_length": 8,
			"mooring_time": 85,
			"completion_time": 127,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 25,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 46,
			"completion_time": 59,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 143,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 169,
			"completion_time": 178,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 145,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 165,
			"completion_time": 174,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 88,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 137,
			"completion_time": 154,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 17,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 158,
			"completion_time": 164,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 30,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 40,
			"completion_time": 55,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 90,
			"data_handling_time": 21,
			"data_ship_length": 6,
			"mooring_time": 137,
			"completion_time": 157,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 121,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 154,
			"completion_time": 167,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 131,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 173,
			"completion_time": 180,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 41,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 108,
			"completion_time": 121,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 59,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 122,
			"completion_time": 134,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 78,
			"data_handling_time": 43,
			"data_ship_length": 4,
			"mooring_time": 79,
			"completion_time": 121,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 144,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 151,
			"completion_time": 160,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 155,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 175,
			"completion_time": 180,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 24,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 161,
			"completion_time": 170,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 85,
			"data_handling_time": 32,
			"data_ship_length": 4,
			"mooring_time": 108,
			"completion_time": 139,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 113,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 140,
			"completion_time": 150,
			"mooring_berth": 16
		}
	]
};
var bks_bcn_24B_8_default = {
	solver: "s,gspp,ti,rp,sgcp,pa",
	makespan: 161,
	dual_bound: 161,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 155,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 155,
			"completion_time": 161,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 133,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 137,
			"completion_time": 146,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 127,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 127,
			"completion_time": 136,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 5,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 5,
			"completion_time": 16,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 54,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 54,
			"completion_time": 64,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 84,
			"data_handling_time": 43,
			"data_ship_length": 8,
			"mooring_time": 84,
			"completion_time": 126,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 49,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 72,
			"completion_time": 82,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 145,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 145,
			"completion_time": 154,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 17,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 17,
			"completion_time": 23,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 30,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 30,
			"completion_time": 45,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 90,
			"data_handling_time": 21,
			"data_ship_length": 6,
			"mooring_time": 116,
			"completion_time": 136,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 121,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 137,
			"completion_time": 150,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 112,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 117,
			"completion_time": 128,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 47,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 47,
			"completion_time": 51,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 24,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 152,
			"completion_time": 161,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 85,
			"data_handling_time": 32,
			"data_ship_length": 4,
			"mooring_time": 85,
			"completion_time": 116,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 113,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 129,
			"completion_time": 139,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 5,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 24,
			"completion_time": 33,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 83,
			"data_handling_time": 33,
			"data_ship_length": 4,
			"mooring_time": 83,
			"completion_time": 115,
			"mooring_berth": 12
		}
	]
};
var bks_bcn_24B_9_default = {
	solver: "pa,s,gspp,rp,ti,sgcp",
	makespan: 161,
	dual_bound: 161,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 40,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 40,
			"completion_time": 57,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 155,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 155,
			"completion_time": 161,
			"mooring_berth": 1
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 83,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 83,
			"completion_time": 101,
			"mooring_berth": 2
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 127,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 127,
			"completion_time": 136,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 120,
			"data_handling_time": 4,
			"data_ship_length": 5,
			"mooring_time": 120,
			"completion_time": 123,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 5,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 5,
			"completion_time": 16,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 49,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 49,
			"completion_time": 59,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 48,
			"data_handling_time": 21,
			"data_ship_length": 6,
			"mooring_time": 48,
			"completion_time": 68,
			"mooring_berth": 1
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 63,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 63,
			"completion_time": 75,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 29,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 29,
			"completion_time": 44,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 144,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 144,
			"completion_time": 161,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 112,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 112,
			"completion_time": 123,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 47,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 66,
			"completion_time": 70,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 1,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 1,
			"completion_time": 35,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 5,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 5,
			"completion_time": 14,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 83,
			"data_handling_time": 33,
			"data_ship_length": 4,
			"mooring_time": 83,
			"completion_time": 115,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 92,
			"data_handling_time": 26,
			"data_ship_length": 4,
			"mooring_time": 92,
			"completion_time": 117,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 120,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 120,
			"completion_time": 137,
			"mooring_berth": 4
		}
	]
};
var bks_bcn_36A_11_default = {
	solver: "rp,s",
	makespan: 202,
	dual_bound: 189,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 136,
			"data_handling_time": 30,
			"data_ship_length": 4,
			"mooring_time": 144,
			"completion_time": 173,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 139,
			"data_handling_time": 4,
			"data_ship_length": 3,
			"mooring_time": 174,
			"completion_time": 177,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 68,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 73,
			"completion_time": 77,
			"mooring_berth": 1
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 10,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 30,
			"completion_time": 42,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 109,
			"data_handling_time": 14,
			"data_ship_length": 3,
			"mooring_time": 189,
			"completion_time": 202,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 94,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 135,
			"completion_time": 143,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 28,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 28,
			"completion_time": 33,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 35,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 43,
			"completion_time": 49,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 78,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 79,
			"completion_time": 100,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 83,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 101,
			"completion_time": 124,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 110,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 176,
			"completion_time": 188,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 15,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 35,
			"completion_time": 49,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 50,
			"data_handling_time": 8,
			"data_ship_length": 7,
			"mooring_time": 50,
			"completion_time": 57,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 60,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 60,
			"completion_time": 68,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 51,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 51,
			"completion_time": 70,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 70,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 79,
			"completion_time": 92,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 73,
			"data_handling_time": 18,
			"data_ship_length": 6,
			"mooring_time": 73,
			"completion_time": 90,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 99,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 117,
			"completion_time": 138,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 124,
			"data_handling_time": 26,
			"data_ship_length": 9,
			"mooring_time": 150,
			"completion_time": 175,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 78,
			"data_handling_time": 23,
			"data_ship_length": 7,
			"mooring_time": 78,
			"completion_time": 100,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 166,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 179,
			"completion_time": 202,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 99,
			"data_handling_time": 8,
			"data_ship_length": 6,
			"mooring_time": 101,
			"completion_time": 108,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 125,
			"data_handling_time": 10,
			"data_ship_length": 6,
			"mooring_time": 140,
			"completion_time": 149,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 154,
			"data_handling_time": 25,
			"data_ship_length": 8,
			"mooring_time": 178,
			"completion_time": 202,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 82,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 125,
			"completion_time": 138,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 121,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 124,
			"completion_time": 139,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 2,
			"data_handling_time": 23,
			"data_ship_length": 9,
			"mooring_time": 2,
			"completion_time": 24,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 128,
			"data_handling_time": 23,
			"data_ship_length": 8,
			"mooring_time": 139,
			"completion_time": 161,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 128,
			"data_handling_time": 36,
			"data_ship_length": 7,
			"mooring_time": 128,
			"completion_time": 163,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 91,
			"data_handling_time": 23,
			"data_ship_length": 8,
			"mooring_time": 93,
			"completion_time": 115,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 44,
			"data_handling_time": 28,
			"data_ship_length": 8,
			"mooring_time": 44,
			"completion_time": 71,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 67,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 72,
			"completion_time": 78,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 66,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 66,
			"completion_time": 74,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 76,
			"data_handling_time": 16,
			"data_ship_length": 8,
			"mooring_time": 76,
			"completion_time": 91,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 103,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 119,
			"completion_time": 127,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 95,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 98,
			"completion_time": 116,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 103,
			"data_handling_time": 13,
			"data_ship_length": 3,
			"mooring_time": 176,
			"completion_time": 188,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 113,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 140,
			"completion_time": 145,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 116,
			"data_handling_time": 8,
			"data_ship_length": 8,
			"mooring_time": 116,
			"completion_time": 123,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 121,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 164,
			"completion_time": 177,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 111,
			"data_handling_time": 39,
			"data_ship_length": 7,
			"mooring_time": 164,
			"completion_time": 202,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 60,
			"data_handling_time": 7,
			"data_ship_length": 3,
			"mooring_time": 60,
			"completion_time": 66,
			"mooring_berth": 26
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 86,
			"data_handling_time": 7,
			"data_ship_length": 3,
			"mooring_time": 91,
			"completion_time": 97,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 43,
			"data_arrival_time": 110,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 125,
			"completion_time": 134,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 44,
			"data_arrival_time": 109,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 189,
			"completion_time": 201,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 45,
			"data_arrival_time": 101,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 109,
			"completion_time": 115,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 46,
			"data_arrival_time": 32,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 32,
			"completion_time": 46,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 47,
			"data_arrival_time": 41,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 51,
			"completion_time": 59,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 48,
			"data_arrival_time": 137,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 162,
			"completion_time": 177,
			"mooring_berth": 15
		}
	]
};
var bks_bcn_36A_12_default = {
	solver: "s,sgcp,rp",
	makespan: 178,
	dual_bound: 178,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 139,
			"data_handling_time": 4,
			"data_ship_length": 3,
			"mooring_time": 175,
			"completion_time": 178,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 10,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 10,
			"completion_time": 22,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 109,
			"data_handling_time": 14,
			"data_ship_length": 3,
			"mooring_time": 113,
			"completion_time": 126,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 140,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 164,
			"completion_time": 174,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 94,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 96,
			"completion_time": 104,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 8,
			"data_handling_time": 41,
			"data_ship_length": 8,
			"mooring_time": 8,
			"completion_time": 48,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 51,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 64,
			"completion_time": 69,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 95,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 95,
			"completion_time": 104,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 15,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 35,
			"completion_time": 49,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 50,
			"data_handling_time": 8,
			"data_ship_length": 7,
			"mooring_time": 50,
			"completion_time": 57,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 60,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 61,
			"completion_time": 69,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 51,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 53,
			"completion_time": 72,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 70,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 71,
			"completion_time": 84,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 73,
			"data_handling_time": 18,
			"data_ship_length": 6,
			"mooring_time": 73,
			"completion_time": 90,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 99,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 105,
			"completion_time": 126,
			"mooring_berth": 3
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 124,
			"data_handling_time": 26,
			"data_ship_length": 9,
			"mooring_time": 124,
			"completion_time": 149,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 7,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 7,
			"completion_time": 13,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 16,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 22,
			"completion_time": 34,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 12,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 14,
			"completion_time": 34,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 35,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 35,
			"completion_time": 54,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 89,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 149,
			"completion_time": 163,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 103,
			"data_handling_time": 8,
			"data_ship_length": 8,
			"mooring_time": 150,
			"completion_time": 157,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 109,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 112,
			"completion_time": 123,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 105,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 105,
			"completion_time": 123,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 127,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 127,
			"completion_time": 148,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 142,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 166,
			"completion_time": 178,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 99,
			"data_handling_time": 8,
			"data_ship_length": 6,
			"mooring_time": 104,
			"completion_time": 111,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 125,
			"data_handling_time": 10,
			"data_ship_length": 6,
			"mooring_time": 150,
			"completion_time": 159,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 82,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 83,
			"completion_time": 96,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 121,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 150,
			"completion_time": 165,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 152,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 158,
			"completion_time": 178,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 35,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 58,
			"completion_time": 71,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 91,
			"data_handling_time": 23,
			"data_ship_length": 8,
			"mooring_time": 91,
			"completion_time": 113,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 60,
			"data_handling_time": 7,
			"data_ship_length": 3,
			"mooring_time": 76,
			"completion_time": 82,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 86,
			"data_handling_time": 7,
			"data_ship_length": 3,
			"mooring_time": 97,
			"completion_time": 103,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 110,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 114,
			"completion_time": 123,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 109,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 114,
			"completion_time": 126,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 154,
			"data_handling_time": 19,
			"data_ship_length": 4,
			"mooring_time": 160,
			"completion_time": 178,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 159,
			"data_handling_time": 20,
			"data_ship_length": 6,
			"mooring_time": 159,
			"completion_time": 178,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 58,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 70,
			"completion_time": 82,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 52,
			"data_handling_time": 27,
			"data_ship_length": 8,
			"mooring_time": 56,
			"completion_time": 82,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 81,
			"data_handling_time": 12,
			"data_ship_length": 3,
			"mooring_time": 83,
			"completion_time": 94,
			"mooring_berth": 26
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 88,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 91,
			"completion_time": 104,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 43,
			"data_arrival_time": 125,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 129,
			"completion_time": 141,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 44,
			"data_arrival_time": 115,
			"data_handling_time": 23,
			"data_ship_length": 8,
			"mooring_time": 127,
			"completion_time": 149,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 45,
			"data_arrival_time": 32,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 35,
			"completion_time": 49,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 46,
			"data_arrival_time": 41,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 49,
			"completion_time": 57,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 47,
			"data_arrival_time": 137,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 142,
			"completion_time": 157,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 48,
			"data_arrival_time": 84,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 85,
			"completion_time": 95,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_36A_13_default = {
	solver: "s",
	makespan: 183,
	dual_bound: 180.00000000000003,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 140,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 154,
			"completion_time": 164,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 8,
			"data_handling_time": 41,
			"data_ship_length": 8,
			"mooring_time": 14,
			"completion_time": 54,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 51,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 79,
			"completion_time": 84,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 95,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 108,
			"completion_time": 117,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 24,
			"data_handling_time": 26,
			"data_ship_length": 8,
			"mooring_time": 33,
			"completion_time": 58,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 7,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 7,
			"completion_time": 13,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 16,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 22,
			"completion_time": 34,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 12,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 12,
			"completion_time": 32,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 35,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 72,
			"completion_time": 91,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 89,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 92,
			"completion_time": 106,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 103,
			"data_handling_time": 8,
			"data_ship_length": 8,
			"mooring_time": 107,
			"completion_time": 114,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 109,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 120,
			"completion_time": 131,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 105,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 150,
			"completion_time": 168,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 127,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 132,
			"completion_time": 153,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 142,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 155,
			"completion_time": 167,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 15,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 22,
			"completion_time": 32,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 33,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 33,
			"completion_time": 56,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 59,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 120,
			"completion_time": 140,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 69,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 79,
			"completion_time": 93,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 53,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 57,
			"completion_time": 91,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 85,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 108,
			"completion_time": 116,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 96,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 172,
			"completion_time": 183,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 117,
			"data_handling_time": 32,
			"data_ship_length": 7,
			"mooring_time": 118,
			"completion_time": 149,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 123,
			"data_handling_time": 31,
			"data_ship_length": 4,
			"mooring_time": 138,
			"completion_time": 168,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 27,
			"data_handling_time": 29,
			"data_ship_length": 4,
			"mooring_time": 70,
			"completion_time": 98,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 35,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 38,
			"completion_time": 51,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 82,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 94,
			"completion_time": 107,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 92,
			"data_handling_time": 6,
			"data_ship_length": 6,
			"mooring_time": 99,
			"completion_time": 104,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 156,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 165,
			"completion_time": 183,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 99,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 107,
			"completion_time": 119,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 151,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 169,
			"completion_time": 183,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 58,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 59,
			"completion_time": 71,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 52,
			"data_handling_time": 27,
			"data_ship_length": 8,
			"mooring_time": 52,
			"completion_time": 78,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 81,
			"data_handling_time": 12,
			"data_ship_length": 3,
			"mooring_time": 120,
			"completion_time": 131,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 88,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 92,
			"completion_time": 105,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 125,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 141,
			"completion_time": 153,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 115,
			"data_handling_time": 23,
			"data_ship_length": 8,
			"mooring_time": 115,
			"completion_time": 137,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 152,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 169,
			"completion_time": 183,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 154,
			"data_handling_time": 27,
			"data_ship_length": 4,
			"mooring_time": 157,
			"completion_time": 183,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 9,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 9,
			"completion_time": 21,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 1,
			"data_handling_time": 31,
			"data_ship_length": 5,
			"mooring_time": 1,
			"completion_time": 31,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 57,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 59,
			"completion_time": 69,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 109,
			"data_handling_time": 9,
			"data_ship_length": 3,
			"mooring_time": 141,
			"completion_time": 149,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 43,
			"data_arrival_time": 98,
			"data_handling_time": 22,
			"data_ship_length": 6,
			"mooring_time": 98,
			"completion_time": 119,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 44,
			"data_arrival_time": 121,
			"data_handling_time": 7,
			"data_ship_length": 3,
			"mooring_time": 150,
			"completion_time": 156,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 45,
			"data_arrival_time": 126,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 138,
			"completion_time": 154,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 46,
			"data_arrival_time": 145,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 154,
			"completion_time": 164,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 47,
			"data_arrival_time": 84,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 85,
			"completion_time": 95,
			"mooring_berth": 16
		}
	]
};
var bks_bcn_36A_14_default = {
	solver: "s,rp",
	makespan: 208,
	dual_bound: 191,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 40,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 44,
			"completion_time": 49,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 91,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 97,
			"completion_time": 103,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 121,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 201,
			"completion_time": 208,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 19,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 19,
			"completion_time": 22,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 24,
			"data_handling_time": 26,
			"data_ship_length": 8,
			"mooring_time": 26,
			"completion_time": 51,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 26,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 32,
			"completion_time": 43,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 90,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 97,
			"completion_time": 116,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 123,
			"data_handling_time": 43,
			"data_ship_length": 7,
			"mooring_time": 123,
			"completion_time": 165,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 15,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 15,
			"completion_time": 25,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 33,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 65,
			"completion_time": 88,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 59,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 89,
			"completion_time": 109,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 69,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 104,
			"completion_time": 118,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 53,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 53,
			"completion_time": 87,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 85,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 117,
			"completion_time": 125,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 96,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 125,
			"completion_time": 136,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 117,
			"data_handling_time": 32,
			"data_ship_length": 7,
			"mooring_time": 136,
			"completion_time": 167,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 123,
			"data_handling_time": 31,
			"data_ship_length": 4,
			"mooring_time": 127,
			"completion_time": 157,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 157,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 192,
			"completion_time": 206,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 21,
			"data_handling_time": 24,
			"data_ship_length": 6,
			"mooring_time": 21,
			"completion_time": 44,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 49,
			"data_handling_time": 40,
			"data_ship_length": 7,
			"mooring_time": 50,
			"completion_time": 89,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 100,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 137,
			"completion_time": 153,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 119,
			"data_handling_time": 7,
			"data_ship_length": 6,
			"mooring_time": 171,
			"completion_time": 177,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 139,
			"data_handling_time": 20,
			"data_ship_length": 8,
			"mooring_time": 166,
			"completion_time": 185,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 27,
			"data_handling_time": 29,
			"data_ship_length": 4,
			"mooring_time": 45,
			"completion_time": 73,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 9,
			"data_handling_time": 10,
			"data_ship_length": 7,
			"mooring_time": 9,
			"completion_time": 18,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 86,
			"data_handling_time": 22,
			"data_ship_length": 5,
			"mooring_time": 97,
			"completion_time": 118,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 82,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 83,
			"completion_time": 96,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 92,
			"data_handling_time": 6,
			"data_ship_length": 6,
			"mooring_time": 119,
			"completion_time": 124,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 156,
			"data_handling_time": 19,
			"data_ship_length": 6,
			"mooring_time": 179,
			"completion_time": 197,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 67,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 88,
			"completion_time": 122,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 141,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 186,
			"completion_time": 191,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 99,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 158,
			"completion_time": 170,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 151,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 155,
			"completion_time": 169,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 7,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 7,
			"completion_time": 16,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 27,
			"data_handling_time": 38,
			"data_ship_length": 7,
			"mooring_time": 27,
			"completion_time": 64,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 104,
			"data_handling_time": 15,
			"data_ship_length": 8,
			"mooring_time": 177,
			"completion_time": 191,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 9,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 9,
			"completion_time": 21,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 1,
			"data_handling_time": 31,
			"data_ship_length": 5,
			"mooring_time": 1,
			"completion_time": 31,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 57,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 65,
			"completion_time": 75,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 109,
			"data_handling_time": 9,
			"data_ship_length": 3,
			"mooring_time": 199,
			"completion_time": 207,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 98,
			"data_handling_time": 22,
			"data_ship_length": 6,
			"mooring_time": 133,
			"completion_time": 154,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 121,
			"data_handling_time": 7,
			"data_ship_length": 3,
			"mooring_time": 126,
			"completion_time": 132,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 126,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 192,
			"completion_time": 208,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 43,
			"data_arrival_time": 145,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 186,
			"completion_time": 196,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 44,
			"data_arrival_time": 153,
			"data_handling_time": 39,
			"data_ship_length": 7,
			"mooring_time": 170,
			"completion_time": 208,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 45,
			"data_arrival_time": 48,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 74,
			"completion_time": 82,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 46,
			"data_arrival_time": 59,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 90,
			"completion_time": 96,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 47,
			"data_arrival_time": 113,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 119,
			"completion_time": 124,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 48,
			"data_arrival_time": 110,
			"data_handling_time": 26,
			"data_ship_length": 7,
			"mooring_time": 110,
			"completion_time": 135,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 49,
			"data_arrival_time": 131,
			"data_handling_time": 14,
			"data_ship_length": 3,
			"mooring_time": 192,
			"completion_time": 205,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 50,
			"data_arrival_time": 128,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 198,
			"completion_time": 208,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 51,
			"data_arrival_time": 149,
			"data_handling_time": 5,
			"data_ship_length": 5,
			"mooring_time": 172,
			"completion_time": 176,
			"mooring_berth": 24
		}
	]
};
var bks_bcn_36A_15_default = {
	solver: "sgcp",
	makespan: 188,
	dual_bound: 168.00000000000173,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 40,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 43,
			"completion_time": 48,
			"mooring_berth": 3
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 91,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 182,
			"completion_time": 188,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 121,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 181,
			"completion_time": 188,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 39,
			"data_handling_time": 8,
			"data_ship_length": 3,
			"mooring_time": 43,
			"completion_time": 50,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 39,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 103,
			"completion_time": 117,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 19,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 39,
			"completion_time": 42,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 26,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 26,
			"completion_time": 37,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 90,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 109,
			"completion_time": 128,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 123,
			"data_handling_time": 43,
			"data_ship_length": 7,
			"mooring_time": 129,
			"completion_time": 171,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 21,
			"data_handling_time": 24,
			"data_ship_length": 6,
			"mooring_time": 42,
			"completion_time": 65,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 49,
			"data_handling_time": 40,
			"data_ship_length": 7,
			"mooring_time": 51,
			"completion_time": 90,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 100,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 134,
			"completion_time": 150,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 119,
			"data_handling_time": 7,
			"data_ship_length": 6,
			"mooring_time": 119,
			"completion_time": 125,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 139,
			"data_handling_time": 20,
			"data_ship_length": 8,
			"mooring_time": 161,
			"completion_time": 180,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 2,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 3,
			"completion_time": 17,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 0,
			"data_handling_time": 42,
			"data_ship_length": 9,
			"mooring_time": 0,
			"completion_time": 41,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 5,
			"data_handling_time": 38,
			"data_ship_length": 4,
			"mooring_time": 5,
			"completion_time": 42,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 45,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 94,
			"completion_time": 102,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 65,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 66,
			"completion_time": 80,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 73,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 81,
			"completion_time": 94,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 90,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 126,
			"completion_time": 136,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 104,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 156,
			"completion_time": 167,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 118,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 118,
			"completion_time": 125,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 93,
			"data_handling_time": 40,
			"data_ship_length": 6,
			"mooring_time": 93,
			"completion_time": 132,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 131,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 181,
			"completion_time": 187,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 9,
			"data_handling_time": 10,
			"data_ship_length": 7,
			"mooring_time": 10,
			"completion_time": 19,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 86,
			"data_handling_time": 22,
			"data_ship_length": 5,
			"mooring_time": 87,
			"completion_time": 108,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 155,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 175,
			"completion_time": 188,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 20,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 20,
			"completion_time": 36,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 83,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 95,
			"completion_time": 118,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 67,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 77,
			"completion_time": 111,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 141,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 183,
			"completion_time": 188,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 80,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 137,
			"completion_time": 160,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 7,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 20,
			"completion_time": 29,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 27,
			"data_handling_time": 38,
			"data_ship_length": 7,
			"mooring_time": 37,
			"completion_time": 74,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 104,
			"data_handling_time": 15,
			"data_ship_length": 8,
			"mooring_time": 114,
			"completion_time": 128,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 46,
			"data_handling_time": 31,
			"data_ship_length": 9,
			"mooring_time": 46,
			"completion_time": 76,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 48,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 77,
			"completion_time": 85,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 59,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 168,
			"completion_time": 174,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 113,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 177,
			"completion_time": 182,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 110,
			"data_handling_time": 26,
			"data_ship_length": 7,
			"mooring_time": 151,
			"completion_time": 176,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 131,
			"data_handling_time": 14,
			"data_ship_length": 3,
			"mooring_time": 137,
			"completion_time": 150,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 56,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 181,
			"completion_time": 188,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 43,
			"data_arrival_time": 55,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 77,
			"completion_time": 93,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 44,
			"data_arrival_time": 112,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 126,
			"completion_time": 136,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 45,
			"data_arrival_time": 119,
			"data_handling_time": 8,
			"data_ship_length": 3,
			"mooring_time": 168,
			"completion_time": 175,
			"mooring_berth": 26
		},
		{
			"data_ship_id": 46,
			"data_arrival_time": 133,
			"data_handling_time": 12,
			"data_ship_length": 3,
			"mooring_time": 144,
			"completion_time": 155,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 47,
			"data_arrival_time": 128,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 143,
			"completion_time": 153,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 48,
			"data_arrival_time": 149,
			"data_handling_time": 5,
			"data_ship_length": 5,
			"mooring_time": 176,
			"completion_time": 180,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 49,
			"data_arrival_time": 107,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 129,
			"completion_time": 142,
			"mooring_berth": 22
		}
	]
};
var bks_bcn_36A_16_default = {
	solver: "s",
	makespan: 196,
	dual_bound: 173,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 39,
			"data_handling_time": 8,
			"data_ship_length": 3,
			"mooring_time": 39,
			"completion_time": 46,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 39,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 47,
			"completion_time": 61,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 103,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 126,
			"completion_time": 131,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 120,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 121,
			"completion_time": 132,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 94,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 94,
			"completion_time": 100,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 93,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 104,
			"completion_time": 122,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 2,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 2,
			"completion_time": 16,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 0,
			"data_handling_time": 42,
			"data_ship_length": 9,
			"mooring_time": 0,
			"completion_time": 41,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 5,
			"data_handling_time": 38,
			"data_ship_length": 4,
			"mooring_time": 42,
			"completion_time": 79,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 45,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 80,
			"completion_time": 88,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 65,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 78,
			"completion_time": 92,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 73,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 93,
			"completion_time": 106,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 90,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 123,
			"completion_time": 133,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 104,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 169,
			"completion_time": 180,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 118,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 125,
			"completion_time": 132,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 93,
			"data_handling_time": 40,
			"data_ship_length": 6,
			"mooring_time": 104,
			"completion_time": 143,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 131,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 168,
			"completion_time": 174,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 147,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 175,
			"completion_time": 196,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 22,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 42,
			"completion_time": 57,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 22,
			"data_handling_time": 25,
			"data_ship_length": 6,
			"mooring_time": 22,
			"completion_time": 46,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 74,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 90,
			"completion_time": 105,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 92,
			"data_handling_time": 25,
			"data_ship_length": 6,
			"mooring_time": 144,
			"completion_time": 168,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 96,
			"data_handling_time": 23,
			"data_ship_length": 4,
			"mooring_time": 96,
			"completion_time": 118,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 128,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 181,
			"completion_time": 196,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 117,
			"data_handling_time": 33,
			"data_ship_length": 6,
			"mooring_time": 134,
			"completion_time": 166,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 133,
			"data_handling_time": 27,
			"data_ship_length": 4,
			"mooring_time": 170,
			"completion_time": 196,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 145,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 181,
			"completion_time": 196,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 40,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 62,
			"completion_time": 77,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 20,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 21,
			"completion_time": 37,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 83,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 83,
			"completion_time": 106,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 80,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 80,
			"completion_time": 103,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 129,
			"data_handling_time": 45,
			"data_ship_length": 8,
			"mooring_time": 152,
			"completion_time": 196,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 25,
			"data_handling_time": 19,
			"data_ship_length": 6,
			"mooring_time": 31,
			"completion_time": 49,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 46,
			"data_handling_time": 31,
			"data_ship_length": 9,
			"mooring_time": 47,
			"completion_time": 77,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 8,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 8,
			"completion_time": 20,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 47,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 50,
			"completion_time": 69,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 103,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 133,
			"completion_time": 151,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 125,
			"data_handling_time": 31,
			"data_ship_length": 9,
			"mooring_time": 138,
			"completion_time": 168,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 56,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 111,
			"completion_time": 118,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 55,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 61,
			"completion_time": 77,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 112,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 127,
			"completion_time": 137,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 119,
			"data_handling_time": 8,
			"data_ship_length": 3,
			"mooring_time": 119,
			"completion_time": 126,
			"mooring_berth": 26
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 133,
			"data_handling_time": 12,
			"data_ship_length": 3,
			"mooring_time": 169,
			"completion_time": 180,
			"mooring_berth": 26
		},
		{
			"data_ship_id": 43,
			"data_arrival_time": 5,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 13,
			"completion_time": 30,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 44,
			"data_arrival_time": 68,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 120,
			"completion_time": 124,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 45,
			"data_arrival_time": 70,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 70,
			"completion_time": 89,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 46,
			"data_arrival_time": 119,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 119,
			"completion_time": 125,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 47,
			"data_arrival_time": 107,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 107,
			"completion_time": 120,
			"mooring_berth": 19
		}
	]
};
var bks_bcn_36A_17_default = {
	solver: "rp,ti,sgcp",
	makespan: 197,
	dual_bound: 197,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 103,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 114,
			"completion_time": 119,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 120,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 159,
			"completion_time": 170,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 25,
			"data_handling_time": 23,
			"data_ship_length": 9,
			"mooring_time": 25,
			"completion_time": 47,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 94,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 113,
			"completion_time": 119,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 93,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 93,
			"completion_time": 111,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 22,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 52,
			"completion_time": 67,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 22,
			"data_handling_time": 25,
			"data_ship_length": 6,
			"mooring_time": 22,
			"completion_time": 46,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 74,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 74,
			"completion_time": 89,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 92,
			"data_handling_time": 25,
			"data_ship_length": 6,
			"mooring_time": 92,
			"completion_time": 116,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 96,
			"data_handling_time": 23,
			"data_ship_length": 4,
			"mooring_time": 144,
			"completion_time": 166,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 128,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 128,
			"completion_time": 143,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 117,
			"data_handling_time": 33,
			"data_ship_length": 6,
			"mooring_time": 125,
			"completion_time": 157,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 133,
			"data_handling_time": 27,
			"data_ship_length": 4,
			"mooring_time": 171,
			"completion_time": 197,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 145,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 158,
			"completion_time": 173,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 30,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 30,
			"completion_time": 39,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 122,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 122,
			"completion_time": 139,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 140,
			"data_handling_time": 23,
			"data_ship_length": 5,
			"mooring_time": 140,
			"completion_time": 162,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 40,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 52,
			"completion_time": 67,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 163,
			"data_handling_time": 35,
			"data_ship_length": 6,
			"mooring_time": 163,
			"completion_time": 197,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 133,
			"data_handling_time": 26,
			"data_ship_length": 5,
			"mooring_time": 133,
			"completion_time": 158,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 25,
			"data_handling_time": 19,
			"data_ship_length": 6,
			"mooring_time": 25,
			"completion_time": 43,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 51,
			"data_handling_time": 39,
			"data_ship_length": 6,
			"mooring_time": 51,
			"completion_time": 89,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 93,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 93,
			"completion_time": 112,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 8,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 9,
			"completion_time": 21,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 47,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 48,
			"completion_time": 67,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 103,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 120,
			"completion_time": 138,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 125,
			"data_handling_time": 31,
			"data_ship_length": 9,
			"mooring_time": 139,
			"completion_time": 169,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 152,
			"data_handling_time": 16,
			"data_ship_length": 8,
			"mooring_time": 182,
			"completion_time": 197,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 159,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 174,
			"completion_time": 197,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 83,
			"data_handling_time": 19,
			"data_ship_length": 9,
			"mooring_time": 83,
			"completion_time": 101,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 104,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 104,
			"completion_time": 121,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 5,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 5,
			"completion_time": 22,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 68,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 68,
			"completion_time": 72,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 70,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 70,
			"completion_time": 89,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 119,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 174,
			"completion_time": 180,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 165,
			"data_handling_time": 31,
			"data_ship_length": 4,
			"mooring_time": 167,
			"completion_time": 197,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 42,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 44,
			"completion_time": 50,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 54,
			"data_handling_time": 25,
			"data_ship_length": 4,
			"mooring_time": 54,
			"completion_time": 78,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 80,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 102,
			"completion_time": 121,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 104,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 113,
			"completion_time": 124,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 115,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 117,
			"completion_time": 127,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 119,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 124,
			"completion_time": 132,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 128,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 170,
			"completion_time": 180,
			"mooring_berth": 4
		}
	]
};
var bks_bcn_36A_18_default = {
	solver: "sgcp,rp,ti",
	makespan: 194,
	dual_bound: 194,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 37,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 116,
			"completion_time": 128,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 59,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 105,
			"completion_time": 114,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 119,
			"data_handling_time": 9,
			"data_ship_length": 3,
			"mooring_time": 184,
			"completion_time": 192,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 25,
			"data_handling_time": 23,
			"data_ship_length": 9,
			"mooring_time": 25,
			"completion_time": 47,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 10,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 48,
			"completion_time": 55,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 93,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 125,
			"completion_time": 134,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 30,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 115,
			"completion_time": 124,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 122,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 177,
			"completion_time": 194,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 140,
			"data_handling_time": 23,
			"data_ship_length": 5,
			"mooring_time": 140,
			"completion_time": 162,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 144,
			"data_handling_time": 26,
			"data_ship_length": 4,
			"mooring_time": 151,
			"completion_time": 176,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 151,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 169,
			"completion_time": 193,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 8,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 103,
			"completion_time": 114,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 165,
			"data_handling_time": 30,
			"data_ship_length": 5,
			"mooring_time": 165,
			"completion_time": 194,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 22,
			"data_handling_time": 19,
			"data_ship_length": 9,
			"mooring_time": 26,
			"completion_time": 44,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 5,
			"data_handling_time": 41,
			"data_ship_length": 6,
			"mooring_time": 5,
			"completion_time": 45,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 30,
			"data_handling_time": 27,
			"data_ship_length": 5,
			"mooring_time": 31,
			"completion_time": 57,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 81,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 114,
			"completion_time": 124,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 133,
			"data_handling_time": 26,
			"data_ship_length": 5,
			"mooring_time": 137,
			"completion_time": 162,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 51,
			"data_handling_time": 39,
			"data_ship_length": 6,
			"mooring_time": 51,
			"completion_time": 89,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 93,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 93,
			"completion_time": 112,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 44,
			"data_handling_time": 35,
			"data_ship_length": 9,
			"mooring_time": 48,
			"completion_time": 82,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 58,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 90,
			"completion_time": 113,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 83,
			"data_handling_time": 19,
			"data_ship_length": 9,
			"mooring_time": 115,
			"completion_time": 133,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 104,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 134,
			"completion_time": 151,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 47,
			"data_handling_time": 6,
			"data_ship_length": 8,
			"mooring_time": 173,
			"completion_time": 178,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 82,
			"data_handling_time": 31,
			"data_ship_length": 7,
			"mooring_time": 83,
			"completion_time": 113,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 42,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 94,
			"completion_time": 100,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 54,
			"data_handling_time": 25,
			"data_ship_length": 4,
			"mooring_time": 58,
			"completion_time": 82,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 80,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 82,
			"completion_time": 101,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 104,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 180,
			"completion_time": 191,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 115,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 129,
			"completion_time": 139,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 119,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 163,
			"completion_time": 171,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 56,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 57,
			"completion_time": 75,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 85,
			"data_handling_time": 33,
			"data_ship_length": 7,
			"mooring_time": 125,
			"completion_time": 157,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 105,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 116,
			"completion_time": 135,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 119,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 160,
			"completion_time": 168,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 131,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 152,
			"completion_time": 164,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 128,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 140,
			"completion_time": 150,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 162,
			"data_handling_time": 21,
			"data_ship_length": 6,
			"mooring_time": 163,
			"completion_time": 183,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 18,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 76,
			"completion_time": 92,
			"mooring_berth": 21
		}
	]
};
var bks_bcn_36A_19_default = {
	solver: "rp",
	makespan: 181,
	dual_bound: 172,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 37,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 42,
			"completion_time": 54,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 59,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 120,
			"completion_time": 129,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 119,
			"data_handling_time": 9,
			"data_ship_length": 3,
			"mooring_time": 122,
			"completion_time": 130,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 123,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 131,
			"completion_time": 136,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 10,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 20,
			"completion_time": 27,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 93,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 151,
			"completion_time": 160,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 92,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 131,
			"completion_time": 155,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 8,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 8,
			"completion_time": 19,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 22,
			"data_handling_time": 19,
			"data_ship_length": 9,
			"mooring_time": 28,
			"completion_time": 46,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 5,
			"data_handling_time": 41,
			"data_ship_length": 6,
			"mooring_time": 5,
			"completion_time": 45,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 30,
			"data_handling_time": 27,
			"data_ship_length": 5,
			"mooring_time": 142,
			"completion_time": 168,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 81,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 170,
			"completion_time": 180,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 7,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 7,
			"completion_time": 26,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 8,
			"data_handling_time": 34,
			"data_ship_length": 4,
			"mooring_time": 8,
			"completion_time": 41,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 9,
			"data_handling_time": 39,
			"data_ship_length": 9,
			"mooring_time": 9,
			"completion_time": 47,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 29,
			"data_handling_time": 23,
			"data_ship_length": 7,
			"mooring_time": 48,
			"completion_time": 70,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 84,
			"data_handling_time": 27,
			"data_ship_length": 6,
			"mooring_time": 95,
			"completion_time": 121,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 100,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 100,
			"completion_time": 119,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 56,
			"data_handling_time": 25,
			"data_ship_length": 6,
			"mooring_time": 56,
			"completion_time": 80,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 44,
			"data_handling_time": 35,
			"data_ship_length": 9,
			"mooring_time": 55,
			"completion_time": 89,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 58,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 71,
			"completion_time": 94,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 147,
			"data_handling_time": 26,
			"data_ship_length": 7,
			"mooring_time": 156,
			"completion_time": 181,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 83,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 98,
			"completion_time": 104,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 115,
			"data_handling_time": 43,
			"data_ship_length": 9,
			"mooring_time": 139,
			"completion_time": 181,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 47,
			"data_handling_time": 6,
			"data_ship_length": 8,
			"mooring_time": 49,
			"completion_time": 54,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 82,
			"data_handling_time": 31,
			"data_ship_length": 7,
			"mooring_time": 110,
			"completion_time": 140,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 61,
			"data_handling_time": 10,
			"data_ship_length": 7,
			"mooring_time": 129,
			"completion_time": 138,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 56,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 59,
			"completion_time": 77,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 85,
			"data_handling_time": 33,
			"data_ship_length": 7,
			"mooring_time": 91,
			"completion_time": 123,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 105,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 109,
			"completion_time": 128,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 119,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 161,
			"completion_time": 169,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 131,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 169,
			"completion_time": 181,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 54,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 90,
			"completion_time": 97,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 50,
			"data_handling_time": 32,
			"data_ship_length": 7,
			"mooring_time": 78,
			"completion_time": 109,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 85,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 130,
			"completion_time": 141,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 118,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 124,
			"completion_time": 130,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 120,
			"data_handling_time": 12,
			"data_ship_length": 3,
			"mooring_time": 157,
			"completion_time": 168,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 134,
			"data_handling_time": 10,
			"data_ship_length": 7,
			"mooring_time": 141,
			"completion_time": 150,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 18,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 81,
			"completion_time": 97,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 44,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 122,
			"completion_time": 129,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 47,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 47,
			"completion_time": 58,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_36A_20_default = {
	solver: "rp,s",
	makespan: 209,
	dual_bound: 178,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 138,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 193,
			"completion_time": 201,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 71,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 198,
			"completion_time": 209,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 123,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 185,
			"completion_time": 190,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 92,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 126,
			"completion_time": 150,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 90,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 142,
			"completion_time": 157,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 7,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 7,
			"completion_time": 26,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 8,
			"data_handling_time": 34,
			"data_ship_length": 4,
			"mooring_time": 8,
			"completion_time": 41,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 9,
			"data_handling_time": 39,
			"data_ship_length": 9,
			"mooring_time": 9,
			"completion_time": 47,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 29,
			"data_handling_time": 23,
			"data_ship_length": 7,
			"mooring_time": 83,
			"completion_time": 105,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 84,
			"data_handling_time": 27,
			"data_ship_length": 6,
			"mooring_time": 158,
			"completion_time": 184,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 146,
			"data_handling_time": 27,
			"data_ship_length": 8,
			"mooring_time": 183,
			"completion_time": 209,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 13,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 27,
			"completion_time": 50,
			"mooring_berth": 2
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 38,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 135,
			"completion_time": 148,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 33,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 33,
			"completion_time": 53,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 39,
			"data_handling_time": 31,
			"data_ship_length": 4,
			"mooring_time": 63,
			"completion_time": 93,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 85,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 126,
			"completion_time": 141,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 128,
			"data_handling_time": 10,
			"data_ship_length": 6,
			"mooring_time": 181,
			"completion_time": 190,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 100,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 106,
			"completion_time": 125,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 56,
			"data_handling_time": 25,
			"data_ship_length": 6,
			"mooring_time": 79,
			"completion_time": 103,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 160,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 191,
			"completion_time": 209,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 32,
			"data_handling_time": 37,
			"data_ship_length": 5,
			"mooring_time": 48,
			"completion_time": 84,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 102,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 104,
			"completion_time": 125,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 83,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 106,
			"completion_time": 112,
			"mooring_berth": 2
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 115,
			"data_handling_time": 43,
			"data_ship_length": 9,
			"mooring_time": 142,
			"completion_time": 184,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 39,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 63,
			"completion_time": 78,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 73,
			"data_handling_time": 30,
			"data_ship_length": 8,
			"mooring_time": 85,
			"completion_time": 114,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 126,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 126,
			"completion_time": 141,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 61,
			"data_handling_time": 10,
			"data_ship_length": 7,
			"mooring_time": 149,
			"completion_time": 158,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 8,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 8,
			"completion_time": 29,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 54,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 60,
			"completion_time": 78,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 141,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 159,
			"completion_time": 179,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 54,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 115,
			"completion_time": 122,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 50,
			"data_handling_time": 32,
			"data_ship_length": 7,
			"mooring_time": 51,
			"completion_time": 82,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 85,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 88,
			"completion_time": 99,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 118,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 185,
			"completion_time": 191,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 120,
			"data_handling_time": 12,
			"data_ship_length": 3,
			"mooring_time": 198,
			"completion_time": 209,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 134,
			"data_handling_time": 10,
			"data_ship_length": 7,
			"mooring_time": 185,
			"completion_time": 194,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 12,
			"data_handling_time": 25,
			"data_ship_length": 4,
			"mooring_time": 30,
			"completion_time": 54,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 57,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 79,
			"completion_time": 87,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 78,
			"data_handling_time": 30,
			"data_ship_length": 7,
			"mooring_time": 151,
			"completion_time": 180,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 109,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 115,
			"completion_time": 124,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 44,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 55,
			"completion_time": 62,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 47,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 48,
			"completion_time": 59,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 43,
			"data_arrival_time": 79,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 96,
			"completion_time": 105,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 44,
			"data_arrival_time": 104,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 113,
			"completion_time": 134,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 45,
			"data_arrival_time": 120,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 202,
			"completion_time": 209,
			"mooring_berth": 24
		}
	]
};
var bks_bcn_36A_21_default = {
	solver: "rp,sgcp",
	makespan: 198,
	dual_bound: 198,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 138,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 138,
			"completion_time": 146,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 102,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 108,
			"completion_time": 117,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 71,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 79,
			"completion_time": 90,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 90,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 91,
			"completion_time": 106,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 119,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 156,
			"completion_time": 163,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 95,
			"data_handling_time": 34,
			"data_ship_length": 8,
			"mooring_time": 107,
			"completion_time": 140,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 13,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 13,
			"completion_time": 36,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 38,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 38,
			"completion_time": 51,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 33,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 41,
			"completion_time": 61,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 39,
			"data_handling_time": 31,
			"data_ship_length": 4,
			"mooring_time": 39,
			"completion_time": 69,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 85,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 91,
			"completion_time": 106,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 128,
			"data_handling_time": 10,
			"data_ship_length": 6,
			"mooring_time": 142,
			"completion_time": 151,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 145,
			"data_handling_time": 27,
			"data_ship_length": 5,
			"mooring_time": 149,
			"completion_time": 175,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 164,
			"data_handling_time": 35,
			"data_ship_length": 7,
			"mooring_time": 164,
			"completion_time": 198,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 72,
			"data_handling_time": 25,
			"data_ship_length": 4,
			"mooring_time": 89,
			"completion_time": 113,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 79,
			"data_handling_time": 21,
			"data_ship_length": 4,
			"mooring_time": 92,
			"completion_time": 112,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 94,
			"data_handling_time": 24,
			"data_ship_length": 4,
			"mooring_time": 114,
			"completion_time": 137,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 127,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 138,
			"completion_time": 146,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 32,
			"data_handling_time": 37,
			"data_ship_length": 5,
			"mooring_time": 42,
			"completion_time": 78,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 102,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 110,
			"completion_time": 131,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 86,
			"data_handling_time": 31,
			"data_ship_length": 6,
			"mooring_time": 168,
			"completion_time": 198,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 39,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 41,
			"completion_time": 56,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 73,
			"data_handling_time": 30,
			"data_ship_length": 8,
			"mooring_time": 73,
			"completion_time": 102,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 126,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 152,
			"completion_time": 167,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 142,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 176,
			"completion_time": 188,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 8,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 8,
			"completion_time": 29,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 54,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 54,
			"completion_time": 72,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 141,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 147,
			"completion_time": 167,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 6,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 6,
			"completion_time": 17,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 23,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 23,
			"completion_time": 40,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 47,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 64,
			"completion_time": 85,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 12,
			"data_handling_time": 25,
			"data_ship_length": 4,
			"mooring_time": 12,
			"completion_time": 36,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 57,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 70,
			"completion_time": 78,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 78,
			"data_handling_time": 30,
			"data_ship_length": 7,
			"mooring_time": 168,
			"completion_time": 197,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 109,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 154,
			"completion_time": 163,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 70,
			"data_handling_time": 7,
			"data_ship_length": 3,
			"mooring_time": 103,
			"completion_time": 109,
			"mooring_berth": 26
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 87,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 104,
			"completion_time": 109,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 115,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 118,
			"completion_time": 127,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 100,
			"data_handling_time": 25,
			"data_ship_length": 4,
			"mooring_time": 113,
			"completion_time": 137,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 120,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 168,
			"completion_time": 175,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 126,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 129,
			"completion_time": 141,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 136,
			"data_handling_time": 8,
			"data_ship_length": 8,
			"mooring_time": 191,
			"completion_time": 198,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 79,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 82,
			"completion_time": 91,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 43,
			"data_arrival_time": 104,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 132,
			"completion_time": 153,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 44,
			"data_arrival_time": 120,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 141,
			"completion_time": 148,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_36A_22_default = {
	solver: "s,rp",
	makespan: 180,
	dual_bound: 175,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 80,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 80,
			"completion_time": 95,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 102,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 133,
			"completion_time": 142,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 68,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 68,
			"completion_time": 77,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 116,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 137,
			"completion_time": 146,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 102,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 118,
			"completion_time": 129,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 90,
			"data_handling_time": 32,
			"data_ship_length": 8,
			"mooring_time": 130,
			"completion_time": 161,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 119,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 125,
			"completion_time": 132,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 95,
			"data_handling_time": 34,
			"data_ship_length": 8,
			"mooring_time": 96,
			"completion_time": 129,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 25,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 29,
			"completion_time": 40,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 72,
			"data_handling_time": 25,
			"data_ship_length": 4,
			"mooring_time": 72,
			"completion_time": 96,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 79,
			"data_handling_time": 21,
			"data_ship_length": 4,
			"mooring_time": 79,
			"completion_time": 99,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 94,
			"data_handling_time": 24,
			"data_ship_length": 4,
			"mooring_time": 106,
			"completion_time": 129,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 127,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 132,
			"completion_time": 140,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 12,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 12,
			"completion_time": 28,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 26,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 30,
			"completion_time": 49,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 48,
			"data_handling_time": 22,
			"data_ship_length": 9,
			"mooring_time": 50,
			"completion_time": 71,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 73,
			"data_handling_time": 21,
			"data_ship_length": 4,
			"mooring_time": 73,
			"completion_time": 93,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 78,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 78,
			"completion_time": 97,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 60,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 60,
			"completion_time": 76,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 86,
			"data_handling_time": 31,
			"data_ship_length": 6,
			"mooring_time": 87,
			"completion_time": 117,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 98,
			"data_handling_time": 31,
			"data_ship_length": 6,
			"mooring_time": 98,
			"completion_time": 128,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 142,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 160,
			"completion_time": 172,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 148,
			"data_handling_time": 25,
			"data_ship_length": 9,
			"mooring_time": 156,
			"completion_time": 180,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 6,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 6,
			"completion_time": 17,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 23,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 23,
			"completion_time": 40,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 47,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 47,
			"completion_time": 68,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 157,
			"data_handling_time": 19,
			"data_ship_length": 9,
			"mooring_time": 162,
			"completion_time": 180,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 39,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 39,
			"completion_time": 57,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 125,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 141,
			"completion_time": 155,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 132,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 147,
			"completion_time": 158,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 70,
			"data_handling_time": 7,
			"data_ship_length": 3,
			"mooring_time": 70,
			"completion_time": 76,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 87,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 100,
			"completion_time": 105,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 115,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 163,
			"completion_time": 172,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 100,
			"data_handling_time": 25,
			"data_ship_length": 4,
			"mooring_time": 100,
			"completion_time": 124,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 120,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 129,
			"completion_time": 136,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 126,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 143,
			"completion_time": 155,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 136,
			"data_handling_time": 8,
			"data_ship_length": 8,
			"mooring_time": 173,
			"completion_time": 180,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 11,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 18,
			"completion_time": 27,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 60,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 69,
			"completion_time": 74,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 73,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 73,
			"completion_time": 86,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 116,
			"data_handling_time": 8,
			"data_ship_length": 3,
			"mooring_time": 173,
			"completion_time": 180,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 8,
			"data_handling_time": 15,
			"data_ship_length": 8,
			"mooring_time": 8,
			"completion_time": 22,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 129,
			"data_handling_time": 30,
			"data_ship_length": 6,
			"mooring_time": 130,
			"completion_time": 159,
			"mooring_berth": 11
		}
	]
};
var bks_bcn_36A_23_default = {
	solver: "s",
	makespan: 191,
	dual_bound: 184,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 80,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 83,
			"completion_time": 98,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 68,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 88,
			"completion_time": 97,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 116,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 120,
			"completion_time": 129,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 102,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 108,
			"completion_time": 119,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 90,
			"data_handling_time": 32,
			"data_ship_length": 8,
			"mooring_time": 98,
			"completion_time": 129,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 161,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 182,
			"completion_time": 191,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 25,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 25,
			"completion_time": 36,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 146,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 160,
			"completion_time": 183,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 12,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 12,
			"completion_time": 28,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 26,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 26,
			"completion_time": 45,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 48,
			"data_handling_time": 22,
			"data_ship_length": 9,
			"mooring_time": 48,
			"completion_time": 69,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 73,
			"data_handling_time": 21,
			"data_ship_length": 4,
			"mooring_time": 77,
			"completion_time": 97,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 78,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 88,
			"completion_time": 107,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 151,
			"data_handling_time": 34,
			"data_ship_length": 7,
			"mooring_time": 158,
			"completion_time": 191,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 34,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 63,
			"completion_time": 82,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 57,
			"data_handling_time": 25,
			"data_ship_length": 9,
			"mooring_time": 58,
			"completion_time": 82,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 66,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 70,
			"completion_time": 87,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 87,
			"data_handling_time": 43,
			"data_ship_length": 4,
			"mooring_time": 88,
			"completion_time": 130,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 94,
			"data_handling_time": 43,
			"data_ship_length": 5,
			"mooring_time": 130,
			"completion_time": 172,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 142,
			"data_handling_time": 8,
			"data_ship_length": 8,
			"mooring_time": 184,
			"completion_time": 191,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 60,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 63,
			"completion_time": 79,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 98,
			"data_handling_time": 31,
			"data_ship_length": 6,
			"mooring_time": 100,
			"completion_time": 130,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 4,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 4,
			"completion_time": 21,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 150,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 179,
			"completion_time": 191,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 39,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 39,
			"completion_time": 57,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 125,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 131,
			"completion_time": 145,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 132,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 146,
			"completion_time": 157,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 19,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 29,
			"completion_time": 41,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 26,
			"data_handling_time": 37,
			"data_ship_length": 8,
			"mooring_time": 26,
			"completion_time": 62,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 132,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 136,
			"completion_time": 145,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 123,
			"data_handling_time": 36,
			"data_ship_length": 7,
			"mooring_time": 146,
			"completion_time": 181,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 11,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 24,
			"completion_time": 33,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 60,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 70,
			"completion_time": 75,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 73,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 122,
			"completion_time": 135,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 116,
			"data_handling_time": 8,
			"data_ship_length": 3,
			"mooring_time": 122,
			"completion_time": 129,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 66,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 80,
			"completion_time": 87,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 85,
			"data_handling_time": 34,
			"data_ship_length": 7,
			"mooring_time": 88,
			"completion_time": 121,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 104,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 151,
			"completion_time": 166,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 122,
			"data_handling_time": 19,
			"data_ship_length": 6,
			"mooring_time": 132,
			"completion_time": 150,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 138,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 167,
			"completion_time": 178,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 8,
			"data_handling_time": 15,
			"data_ship_length": 8,
			"mooring_time": 8,
			"completion_time": 22,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 129,
			"data_handling_time": 30,
			"data_ship_length": 6,
			"mooring_time": 130,
			"completion_time": 159,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 12,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 12,
			"completion_time": 19,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 43,
			"data_arrival_time": 35,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 46,
			"completion_time": 55,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 44,
			"data_arrival_time": 152,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 179,
			"completion_time": 191,
			"mooring_berth": 25
		}
	]
};
var bks_bcn_36A_24_default = {
	solver: "s,sgcp,ti,rp",
	makespan: 198,
	dual_bound: 198,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 45,
			"data_handling_time": 7,
			"data_ship_length": 3,
			"mooring_time": 129,
			"completion_time": 135,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 100,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 127,
			"completion_time": 141,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 122,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 137,
			"completion_time": 149,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 141,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 150,
			"completion_time": 165,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 73,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 110,
			"completion_time": 134,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 34,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 90,
			"completion_time": 109,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 57,
			"data_handling_time": 25,
			"data_ship_length": 9,
			"mooring_time": 65,
			"completion_time": 89,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 66,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 72,
			"completion_time": 89,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 87,
			"data_handling_time": 43,
			"data_ship_length": 4,
			"mooring_time": 136,
			"completion_time": 178,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 94,
			"data_handling_time": 43,
			"data_ship_length": 5,
			"mooring_time": 94,
			"completion_time": 136,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 142,
			"data_handling_time": 8,
			"data_ship_length": 8,
			"mooring_time": 142,
			"completion_time": 149,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 2,
			"data_handling_time": 20,
			"data_ship_length": 8,
			"mooring_time": 2,
			"completion_time": 21,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 19,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 19,
			"completion_time": 29,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 31,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 46,
			"completion_time": 56,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 35,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 57,
			"completion_time": 71,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 33,
			"data_handling_time": 30,
			"data_ship_length": 5,
			"mooring_time": 35,
			"completion_time": 64,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 126,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 150,
			"completion_time": 162,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 167,
			"data_handling_time": 19,
			"data_ship_length": 4,
			"mooring_time": 180,
			"completion_time": 198,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 4,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 4,
			"completion_time": 21,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 150,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 150,
			"completion_time": 162,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 153,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 163,
			"completion_time": 177,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 166,
			"data_handling_time": 33,
			"data_ship_length": 6,
			"mooring_time": 166,
			"completion_time": 198,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 23,
			"data_handling_time": 23,
			"data_ship_length": 6,
			"mooring_time": 23,
			"completion_time": 45,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 50,
			"data_handling_time": 40,
			"data_ship_length": 9,
			"mooring_time": 50,
			"completion_time": 89,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 19,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 22,
			"completion_time": 34,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 26,
			"data_handling_time": 37,
			"data_ship_length": 8,
			"mooring_time": 90,
			"completion_time": 126,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 132,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 132,
			"completion_time": 141,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 123,
			"data_handling_time": 36,
			"data_ship_length": 7,
			"mooring_time": 144,
			"completion_time": 179,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 162,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 180,
			"completion_time": 198,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 18,
			"data_handling_time": 15,
			"data_ship_length": 8,
			"mooring_time": 18,
			"completion_time": 32,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 138,
			"data_handling_time": 19,
			"data_ship_length": 6,
			"mooring_time": 180,
			"completion_time": 198,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 66,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 90,
			"completion_time": 97,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 85,
			"data_handling_time": 34,
			"data_ship_length": 7,
			"mooring_time": 90,
			"completion_time": 123,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 104,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 104,
			"completion_time": 119,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 122,
			"data_handling_time": 19,
			"data_ship_length": 6,
			"mooring_time": 180,
			"completion_time": 198,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 138,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 138,
			"completion_time": 149,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 33,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 33,
			"completion_time": 41,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 55,
			"data_handling_time": 12,
			"data_ship_length": 3,
			"mooring_time": 124,
			"completion_time": 135,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 117,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 150,
			"completion_time": 156,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 121,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 124,
			"completion_time": 136,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 12,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 49,
			"completion_time": 56,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 35,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 35,
			"completion_time": 44,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 152,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 166,
			"completion_time": 178,
			"mooring_berth": 11
		}
	]
};
var bks_bcn_36A_26_default = {
	solver: "sgcp,rp",
	makespan: 173,
	dual_bound: 173,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 25,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 54,
			"completion_time": 59,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 109,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 157,
			"completion_time": 173,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 27,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 54,
			"completion_time": 62,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 4,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 39,
			"completion_time": 45,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 37,
			"data_handling_time": 9,
			"data_ship_length": 3,
			"mooring_time": 39,
			"completion_time": 47,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 67,
			"data_handling_time": 17,
			"data_ship_length": 9,
			"mooring_time": 74,
			"completion_time": 90,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 60,
			"data_handling_time": 32,
			"data_ship_length": 4,
			"mooring_time": 60,
			"completion_time": 91,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 82,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 134,
			"completion_time": 151,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 63,
			"data_handling_time": 41,
			"data_ship_length": 8,
			"mooring_time": 63,
			"completion_time": 103,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 131,
			"data_handling_time": 43,
			"data_ship_length": 9,
			"mooring_time": 131,
			"completion_time": 173,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 2,
			"data_handling_time": 7,
			"data_ship_length": 6,
			"mooring_time": 3,
			"completion_time": 9,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 11,
			"data_handling_time": 28,
			"data_ship_length": 4,
			"mooring_time": 11,
			"completion_time": 38,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 29,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 39,
			"completion_time": 52,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 111,
			"data_handling_time": 27,
			"data_ship_length": 5,
			"mooring_time": 126,
			"completion_time": 152,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 139,
			"data_handling_time": 22,
			"data_ship_length": 5,
			"mooring_time": 152,
			"completion_time": 173,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 135,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 135,
			"completion_time": 150,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 33,
			"data_handling_time": 47,
			"data_ship_length": 5,
			"mooring_time": 33,
			"completion_time": 79,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 146,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 151,
			"completion_time": 162,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 48,
			"data_handling_time": 10,
			"data_ship_length": 6,
			"mooring_time": 49,
			"completion_time": 58,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 45,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 46,
			"completion_time": 59,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 8,
			"data_handling_time": 15,
			"data_ship_length": 8,
			"mooring_time": 14,
			"completion_time": 28,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 14,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 23,
			"completion_time": 38,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 61,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 61,
			"completion_time": 73,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 77,
			"data_handling_time": 27,
			"data_ship_length": 9,
			"mooring_time": 104,
			"completion_time": 130,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 102,
			"data_handling_time": 14,
			"data_ship_length": 3,
			"mooring_time": 104,
			"completion_time": 117,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 118,
			"data_handling_time": 11,
			"data_ship_length": 3,
			"mooring_time": 118,
			"completion_time": 128,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 153,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 163,
			"completion_time": 173,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 159,
			"data_handling_time": 9,
			"data_ship_length": 7,
			"mooring_time": 165,
			"completion_time": 173,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 42,
			"data_handling_time": 6,
			"data_ship_length": 3,
			"mooring_time": 48,
			"completion_time": 53,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 59,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 153,
			"completion_time": 156,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 65,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 66,
			"completion_time": 72,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 69,
			"data_handling_time": 23,
			"data_ship_length": 4,
			"mooring_time": 80,
			"completion_time": 102,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 73,
			"data_handling_time": 35,
			"data_ship_length": 7,
			"mooring_time": 91,
			"completion_time": 125,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 107,
			"data_handling_time": 12,
			"data_ship_length": 3,
			"mooring_time": 139,
			"completion_time": 150,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 49,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 52,
			"completion_time": 61,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 87,
			"data_handling_time": 42,
			"data_ship_length": 10,
			"mooring_time": 92,
			"completion_time": 133,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 31,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 31,
			"completion_time": 44,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 101,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 159,
			"completion_time": 162,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 128,
			"data_handling_time": 30,
			"data_ship_length": 4,
			"mooring_time": 129,
			"completion_time": 158,
			"mooring_berth": 16
		}
	]
};
var bks_bcn_36A_27_default = {
	solver: "rp,ti,sgcp",
	makespan: 195,
	dual_bound: 195,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 25,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 25,
			"completion_time": 30,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 109,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 179,
			"completion_time": 195,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 147,
			"data_handling_time": 39,
			"data_ship_length": 8,
			"mooring_time": 157,
			"completion_time": 195,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 4,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 4,
			"completion_time": 10,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 49,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 63,
			"completion_time": 83,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 2,
			"data_handling_time": 7,
			"data_ship_length": 6,
			"mooring_time": 4,
			"completion_time": 10,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 11,
			"data_handling_time": 28,
			"data_ship_length": 4,
			"mooring_time": 11,
			"completion_time": 38,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 29,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 31,
			"completion_time": 44,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 111,
			"data_handling_time": 27,
			"data_ship_length": 5,
			"mooring_time": 169,
			"completion_time": 195,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 139,
			"data_handling_time": 22,
			"data_ship_length": 5,
			"mooring_time": 139,
			"completion_time": 160,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 24,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 45,
			"completion_time": 61,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 29,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 29,
			"completion_time": 46,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 69,
			"data_handling_time": 27,
			"data_ship_length": 5,
			"mooring_time": 85,
			"completion_time": 111,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 74,
			"data_handling_time": 27,
			"data_ship_length": 5,
			"mooring_time": 112,
			"completion_time": 138,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 103,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 112,
			"completion_time": 132,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 133,
			"data_handling_time": 24,
			"data_ship_length": 4,
			"mooring_time": 133,
			"completion_time": 156,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 164,
			"data_handling_time": 32,
			"data_ship_length": 4,
			"mooring_time": 164,
			"completion_time": 195,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 44,
			"data_handling_time": 24,
			"data_ship_length": 6,
			"mooring_time": 45,
			"completion_time": 68,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 48,
			"data_handling_time": 10,
			"data_ship_length": 6,
			"mooring_time": 70,
			"completion_time": 79,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 45,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 48,
			"completion_time": 61,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 164,
			"data_handling_time": 27,
			"data_ship_length": 7,
			"mooring_time": 169,
			"completion_time": 195,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 8,
			"data_handling_time": 15,
			"data_ship_length": 8,
			"mooring_time": 8,
			"completion_time": 22,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 14,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 26,
			"completion_time": 41,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 61,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 92,
			"completion_time": 104,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 77,
			"data_handling_time": 27,
			"data_ship_length": 9,
			"mooring_time": 84,
			"completion_time": 110,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 47,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 47,
			"completion_time": 64,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 42,
			"data_handling_time": 6,
			"data_ship_length": 3,
			"mooring_time": 42,
			"completion_time": 47,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 59,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 80,
			"completion_time": 83,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 65,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 65,
			"completion_time": 71,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 69,
			"data_handling_time": 23,
			"data_ship_length": 4,
			"mooring_time": 69,
			"completion_time": 91,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 73,
			"data_handling_time": 35,
			"data_ship_length": 7,
			"mooring_time": 109,
			"completion_time": 143,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 107,
			"data_handling_time": 12,
			"data_ship_length": 3,
			"mooring_time": 111,
			"completion_time": 122,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 89,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 133,
			"completion_time": 152,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 104,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 104,
			"completion_time": 118,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 120,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 123,
			"completion_time": 132,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 114,
			"data_handling_time": 20,
			"data_ship_length": 6,
			"mooring_time": 119,
			"completion_time": 138,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 127,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 145,
			"completion_time": 168,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 31,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 31,
			"completion_time": 44,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 101,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 105,
			"completion_time": 108,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 128,
			"data_handling_time": 30,
			"data_ship_length": 4,
			"mooring_time": 139,
			"completion_time": 168,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 67,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 69,
			"completion_time": 86,
			"mooring_berth": 21
		}
	]
};
var bks_bcn_36A_28_default = {
	solver: "s,rp,ti,sgcp",
	makespan: 187,
	dual_bound: 187,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 43,
			"data_handling_time": 26,
			"data_ship_length": 4,
			"mooring_time": 43,
			"completion_time": 68,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 104,
			"data_handling_time": 21,
			"data_ship_length": 4,
			"mooring_time": 131,
			"completion_time": 151,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 49,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 87,
			"completion_time": 107,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 24,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 47,
			"completion_time": 63,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 29,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 29,
			"completion_time": 46,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 69,
			"data_handling_time": 27,
			"data_ship_length": 5,
			"mooring_time": 102,
			"completion_time": 128,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 74,
			"data_handling_time": 27,
			"data_ship_length": 5,
			"mooring_time": 127,
			"completion_time": 153,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 103,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 108,
			"completion_time": 128,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 133,
			"data_handling_time": 24,
			"data_ship_length": 4,
			"mooring_time": 154,
			"completion_time": 177,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 22,
			"data_handling_time": 9,
			"data_ship_length": 5,
			"mooring_time": 22,
			"completion_time": 30,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 23,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 23,
			"completion_time": 33,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 14,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 14,
			"completion_time": 34,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 72,
			"data_handling_time": 29,
			"data_ship_length": 4,
			"mooring_time": 80,
			"completion_time": 108,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 130,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 130,
			"completion_time": 151,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 44,
			"data_handling_time": 24,
			"data_ship_length": 6,
			"mooring_time": 44,
			"completion_time": 67,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 37,
			"data_handling_time": 23,
			"data_ship_length": 6,
			"mooring_time": 37,
			"completion_time": 59,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 34,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 35,
			"completion_time": 42,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 38,
			"data_handling_time": 11,
			"data_ship_length": 8,
			"mooring_time": 38,
			"completion_time": 48,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 71,
			"data_handling_time": 31,
			"data_ship_length": 9,
			"mooring_time": 71,
			"completion_time": 101,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 149,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 154,
			"completion_time": 169,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 47,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 49,
			"completion_time": 66,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 52,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 64,
			"completion_time": 80,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 129,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 170,
			"completion_time": 187,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 89,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 108,
			"completion_time": 127,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 104,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 111,
			"completion_time": 125,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 120,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 178,
			"completion_time": 187,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 114,
			"data_handling_time": 20,
			"data_ship_length": 6,
			"mooring_time": 126,
			"completion_time": 145,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 127,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 129,
			"completion_time": 152,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 138,
			"data_handling_time": 42,
			"data_ship_length": 9,
			"mooring_time": 146,
			"completion_time": 187,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 152,
			"data_handling_time": 36,
			"data_ship_length": 7,
			"mooring_time": 152,
			"completion_time": 187,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 62,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 64,
			"completion_time": 79,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 104,
			"data_handling_time": 17,
			"data_ship_length": 3,
			"mooring_time": 129,
			"completion_time": 145,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 81,
			"data_handling_time": 45,
			"data_ship_length": 7,
			"mooring_time": 81,
			"completion_time": 125,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 67,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 69,
			"completion_time": 86,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_36A_29_default = {
	solver: "ti,rp,s,sgcp",
	makespan: 171,
	dual_bound: 171,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 43,
			"data_handling_time": 26,
			"data_ship_length": 4,
			"mooring_time": 45,
			"completion_time": 70,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 104,
			"data_handling_time": 21,
			"data_ship_length": 4,
			"mooring_time": 107,
			"completion_time": 127,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 31,
			"data_handling_time": 4,
			"data_ship_length": 3,
			"mooring_time": 152,
			"completion_time": 155,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 139,
			"data_handling_time": 11,
			"data_ship_length": 3,
			"mooring_time": 139,
			"completion_time": 149,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 8,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 95,
			"completion_time": 112,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 22,
			"data_handling_time": 9,
			"data_ship_length": 5,
			"mooring_time": 163,
			"completion_time": 171,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 23,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 46,
			"completion_time": 56,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 14,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 25,
			"completion_time": 45,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 72,
			"data_handling_time": 29,
			"data_ship_length": 4,
			"mooring_time": 78,
			"completion_time": 106,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 154,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 154,
			"completion_time": 171,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 23,
			"data_handling_time": 23,
			"data_ship_length": 7,
			"mooring_time": 24,
			"completion_time": 46,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 36,
			"data_handling_time": 28,
			"data_ship_length": 5,
			"mooring_time": 42,
			"completion_time": 69,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 42,
			"data_handling_time": 32,
			"data_ship_length": 4,
			"mooring_time": 49,
			"completion_time": 80,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 56,
			"data_handling_time": 38,
			"data_ship_length": 4,
			"mooring_time": 57,
			"completion_time": 94,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 101,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 113,
			"completion_time": 130,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 130,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 131,
			"completion_time": 152,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 37,
			"data_handling_time": 23,
			"data_ship_length": 6,
			"mooring_time": 37,
			"completion_time": 59,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 0,
			"data_handling_time": 20,
			"data_ship_length": 6,
			"mooring_time": 1,
			"completion_time": 20,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 34,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 148,
			"completion_time": 155,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 38,
			"data_handling_time": 11,
			"data_ship_length": 8,
			"mooring_time": 148,
			"completion_time": 158,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 71,
			"data_handling_time": 31,
			"data_ship_length": 9,
			"mooring_time": 71,
			"completion_time": 101,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 149,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 156,
			"completion_time": 171,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 29,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 31,
			"completion_time": 39,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 135,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 159,
			"completion_time": 171,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 3,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 22,
			"completion_time": 30,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 52,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 60,
			"completion_time": 76,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 129,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 130,
			"completion_time": 147,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 67,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 119,
			"completion_time": 138,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 62,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 132,
			"completion_time": 147,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 104,
			"data_handling_time": 17,
			"data_ship_length": 3,
			"mooring_time": 113,
			"completion_time": 129,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 81,
			"data_handling_time": 45,
			"data_ship_length": 7,
			"mooring_time": 81,
			"completion_time": 125,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 162,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 163,
			"completion_time": 171,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 6,
			"data_handling_time": 24,
			"data_ship_length": 4,
			"mooring_time": 21,
			"completion_time": 44,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 50,
			"data_handling_time": 26,
			"data_ship_length": 4,
			"mooring_time": 55,
			"completion_time": 80,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 90,
			"data_handling_time": 28,
			"data_ship_length": 4,
			"mooring_time": 91,
			"completion_time": 118,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 95,
			"data_handling_time": 27,
			"data_ship_length": 3,
			"mooring_time": 103,
			"completion_time": 129,
			"mooring_berth": 26
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 138,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 139,
			"completion_time": 160,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 123,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 126,
			"completion_time": 138,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_36A_3_default = {
	solver: "s,sgcp,ti,rp",
	makespan: 173,
	dual_bound: 173,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 30,
			"data_handling_time": 14,
			"data_ship_length": 3,
			"mooring_time": 51,
			"completion_time": 64,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 24,
			"data_handling_time": 2,
			"data_ship_length": 3,
			"mooring_time": 24,
			"completion_time": 25,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 119,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 140,
			"completion_time": 147,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 110,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 115,
			"completion_time": 127,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 48,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 64,
			"completion_time": 82,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 103,
			"data_handling_time": 26,
			"data_ship_length": 5,
			"mooring_time": 106,
			"completion_time": 131,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 12,
			"data_handling_time": 15,
			"data_ship_length": 6,
			"mooring_time": 12,
			"completion_time": 26,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 81,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 83,
			"completion_time": 98,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 99,
			"data_handling_time": 9,
			"data_ship_length": 5,
			"mooring_time": 99,
			"completion_time": 107,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 110,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 110,
			"completion_time": 126,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 167,
			"data_handling_time": 7,
			"data_ship_length": 7,
			"mooring_time": 167,
			"completion_time": 173,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 8,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 8,
			"completion_time": 23,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 25,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 26,
			"completion_time": 50,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 56,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 56,
			"completion_time": 71,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 105,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 108,
			"completion_time": 126,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 131,
			"data_handling_time": 16,
			"data_ship_length": 3,
			"mooring_time": 140,
			"completion_time": 155,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 130,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 142,
			"completion_time": 162,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 140,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 150,
			"completion_time": 162,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 109,
			"data_handling_time": 17,
			"data_ship_length": 6,
			"mooring_time": 146,
			"completion_time": 162,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 149,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 167,
			"completion_time": 173,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 12,
			"data_handling_time": 9,
			"data_ship_length": 7,
			"mooring_time": 12,
			"completion_time": 20,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 23,
			"data_handling_time": 18,
			"data_ship_length": 6,
			"mooring_time": 27,
			"completion_time": 44,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 76,
			"data_handling_time": 10,
			"data_ship_length": 8,
			"mooring_time": 80,
			"completion_time": 89,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 90,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 90,
			"completion_time": 105,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 154,
			"data_handling_time": 11,
			"data_ship_length": 6,
			"mooring_time": 163,
			"completion_time": 173,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 2,
			"data_handling_time": 23,
			"data_ship_length": 6,
			"mooring_time": 2,
			"completion_time": 24,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 55,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 55,
			"completion_time": 67,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 94,
			"data_handling_time": 7,
			"data_ship_length": 7,
			"mooring_time": 94,
			"completion_time": 100,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 91,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 105,
			"completion_time": 114,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 142,
			"data_handling_time": 10,
			"data_ship_length": 7,
			"mooring_time": 163,
			"completion_time": 172,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 35,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 35,
			"completion_time": 45,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 70,
			"data_handling_time": 6,
			"data_ship_length": 6,
			"mooring_time": 74,
			"completion_time": 79,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 80,
			"data_handling_time": 28,
			"data_ship_length": 7,
			"mooring_time": 81,
			"completion_time": 108,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 102,
			"data_handling_time": 26,
			"data_ship_length": 4,
			"mooring_time": 102,
			"completion_time": 127,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 121,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 127,
			"completion_time": 139,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 124,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 127,
			"completion_time": 137,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 126,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 128,
			"completion_time": 139,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 128,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 128,
			"completion_time": 145,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 148,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 156,
			"completion_time": 173,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 132,
			"data_handling_time": 35,
			"data_ship_length": 9,
			"mooring_time": 132,
			"completion_time": 166,
			"mooring_berth": 4
		}
	]
};
var bks_bcn_36A_30_default = {
	solver: "s,rp,ti,sgcp",
	makespan: 191,
	dual_bound: 191,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 31,
			"data_handling_time": 4,
			"data_ship_length": 3,
			"mooring_time": 31,
			"completion_time": 34,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 139,
			"data_handling_time": 11,
			"data_ship_length": 3,
			"mooring_time": 150,
			"completion_time": 160,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 106,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 158,
			"completion_time": 173,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 8,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 8,
			"completion_time": 25,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 109,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 161,
			"completion_time": 173,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 23,
			"data_handling_time": 23,
			"data_ship_length": 7,
			"mooring_time": 27,
			"completion_time": 49,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 36,
			"data_handling_time": 28,
			"data_ship_length": 5,
			"mooring_time": 130,
			"completion_time": 157,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 42,
			"data_handling_time": 32,
			"data_ship_length": 4,
			"mooring_time": 53,
			"completion_time": 84,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 56,
			"data_handling_time": 38,
			"data_ship_length": 4,
			"mooring_time": 85,
			"completion_time": 122,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 101,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 101,
			"completion_time": 118,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 163,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 174,
			"completion_time": 191,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 33,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 35,
			"completion_time": 52,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 49,
			"data_handling_time": 30,
			"data_ship_length": 5,
			"mooring_time": 76,
			"completion_time": 105,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 66,
			"data_handling_time": 27,
			"data_ship_length": 5,
			"mooring_time": 66,
			"completion_time": 92,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 119,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 119,
			"completion_time": 128,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 0,
			"data_handling_time": 20,
			"data_ship_length": 6,
			"mooring_time": 0,
			"completion_time": 19,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 149,
			"data_handling_time": 43,
			"data_ship_length": 6,
			"mooring_time": 149,
			"completion_time": 191,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 29,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 30,
			"completion_time": 38,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 135,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 135,
			"completion_time": 147,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 47,
			"data_handling_time": 36,
			"data_ship_length": 8,
			"mooring_time": 47,
			"completion_time": 82,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 3,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 3,
			"completion_time": 11,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 67,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 67,
			"completion_time": 86,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 88,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 116,
			"completion_time": 134,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 6,
			"data_handling_time": 24,
			"data_ship_length": 4,
			"mooring_time": 6,
			"completion_time": 29,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 50,
			"data_handling_time": 26,
			"data_ship_length": 4,
			"mooring_time": 50,
			"completion_time": 75,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 90,
			"data_handling_time": 28,
			"data_ship_length": 4,
			"mooring_time": 107,
			"completion_time": 134,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 95,
			"data_handling_time": 27,
			"data_ship_length": 3,
			"mooring_time": 119,
			"completion_time": 145,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 138,
			"data_handling_time": 22,
			"data_ship_length": 8,
			"mooring_time": 150,
			"completion_time": 171,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 15,
			"data_handling_time": 23,
			"data_ship_length": 7,
			"mooring_time": 15,
			"completion_time": 37,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 54,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 54,
			"completion_time": 63,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 94,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 94,
			"completion_time": 115,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 85,
			"data_handling_time": 40,
			"data_ship_length": 6,
			"mooring_time": 90,
			"completion_time": 129,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 132,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 135,
			"completion_time": 149,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 123,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 179,
			"completion_time": 191,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 151,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 151,
			"completion_time": 160,
			"mooring_berth": 25
		}
	]
};
var bks_bcn_36A_31_default = {
	solver: "s,ti,rp,sgcp",
	makespan: 196,
	dual_bound: 196,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 106,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 151,
			"completion_time": 166,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 109,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 180,
			"completion_time": 192,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 78,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 85,
			"completion_time": 102,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 128,
			"data_handling_time": 23,
			"data_ship_length": 5,
			"mooring_time": 165,
			"completion_time": 187,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 33,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 85,
			"completion_time": 102,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 49,
			"data_handling_time": 30,
			"data_ship_length": 5,
			"mooring_time": 49,
			"completion_time": 78,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 66,
			"data_handling_time": 27,
			"data_ship_length": 5,
			"mooring_time": 125,
			"completion_time": 151,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 119,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 144,
			"completion_time": 153,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 39,
			"data_handling_time": 21,
			"data_ship_length": 8,
			"mooring_time": 39,
			"completion_time": 59,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 46,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 46,
			"completion_time": 65,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 70,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 70,
			"completion_time": 84,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 88,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 126,
			"completion_time": 150,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 99,
			"data_handling_time": 39,
			"data_ship_length": 5,
			"mooring_time": 126,
			"completion_time": 164,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 121,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 123,
			"completion_time": 142,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 22,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 22,
			"completion_time": 43,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 152,
			"data_handling_time": 45,
			"data_ship_length": 5,
			"mooring_time": 152,
			"completion_time": 196,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 47,
			"data_handling_time": 36,
			"data_ship_length": 8,
			"mooring_time": 68,
			"completion_time": 103,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 3,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 3,
			"completion_time": 17,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 76,
			"data_handling_time": 41,
			"data_ship_length": 8,
			"mooring_time": 85,
			"completion_time": 125,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 88,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 104,
			"completion_time": 122,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 153,
			"data_handling_time": 15,
			"data_ship_length": 9,
			"mooring_time": 180,
			"completion_time": 194,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 47,
			"data_handling_time": 15,
			"data_ship_length": 8,
			"mooring_time": 70,
			"completion_time": 84,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 15,
			"data_handling_time": 23,
			"data_ship_length": 7,
			"mooring_time": 16,
			"completion_time": 38,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 54,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 60,
			"completion_time": 69,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 94,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 103,
			"completion_time": 124,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 85,
			"data_handling_time": 40,
			"data_ship_length": 6,
			"mooring_time": 125,
			"completion_time": 164,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 132,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 165,
			"completion_time": 179,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 4,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 4,
			"completion_time": 18,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 21,
			"data_handling_time": 47,
			"data_ship_length": 4,
			"mooring_time": 21,
			"completion_time": 67,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 90,
			"data_handling_time": 8,
			"data_ship_length": 3,
			"mooring_time": 107,
			"completion_time": 114,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 102,
			"data_handling_time": 17,
			"data_ship_length": 3,
			"mooring_time": 106,
			"completion_time": 122,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 114,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 143,
			"completion_time": 153,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 141,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 154,
			"completion_time": 178,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 151,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 179,
			"completion_time": 188,
			"mooring_berth": 5
		}
	]
};
var bks_bcn_36A_32_default = {
	solver: "sgcp,rp",
	makespan: 180,
	dual_bound: 180,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 69,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 128,
			"completion_time": 132,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 100,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 126,
			"completion_time": 143,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 78,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 89,
			"completion_time": 106,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 128,
			"data_handling_time": 23,
			"data_ship_length": 5,
			"mooring_time": 133,
			"completion_time": 155,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 39,
			"data_handling_time": 21,
			"data_ship_length": 8,
			"mooring_time": 39,
			"completion_time": 59,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 46,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 59,
			"completion_time": 78,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 70,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 70,
			"completion_time": 84,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 88,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 107,
			"completion_time": 131,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 99,
			"data_handling_time": 39,
			"data_ship_length": 5,
			"mooring_time": 101,
			"completion_time": 139,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 121,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 136,
			"completion_time": 155,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 67,
			"data_handling_time": 10,
			"data_ship_length": 9,
			"mooring_time": 171,
			"completion_time": 180,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 60,
			"data_handling_time": 29,
			"data_ship_length": 7,
			"mooring_time": 60,
			"completion_time": 88,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 80,
			"data_handling_time": 21,
			"data_ship_length": 9,
			"mooring_time": 80,
			"completion_time": 100,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 97,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 156,
			"completion_time": 180,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 22,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 22,
			"completion_time": 43,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 165,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 165,
			"completion_time": 180,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 3,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 6,
			"completion_time": 20,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 76,
			"data_handling_time": 41,
			"data_ship_length": 8,
			"mooring_time": 85,
			"completion_time": 125,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 47,
			"data_handling_time": 15,
			"data_ship_length": 8,
			"mooring_time": 55,
			"completion_time": 69,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 106,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 132,
			"completion_time": 155,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 105,
			"data_handling_time": 28,
			"data_ship_length": 7,
			"mooring_time": 108,
			"completion_time": 135,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 132,
			"data_handling_time": 24,
			"data_ship_length": 8,
			"mooring_time": 141,
			"completion_time": 164,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 4,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 34,
			"completion_time": 48,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 21,
			"data_handling_time": 47,
			"data_ship_length": 4,
			"mooring_time": 21,
			"completion_time": 67,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 90,
			"data_handling_time": 8,
			"data_ship_length": 3,
			"mooring_time": 133,
			"completion_time": 140,
			"mooring_berth": 26
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 102,
			"data_handling_time": 17,
			"data_ship_length": 3,
			"mooring_time": 116,
			"completion_time": 132,
			"mooring_berth": 26
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 114,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 144,
			"completion_time": 154,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 141,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 156,
			"completion_time": 180,
			"mooring_berth": 1
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 16,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 21,
			"completion_time": 33,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 38,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 38,
			"completion_time": 57,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 55,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 69,
			"completion_time": 78,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 77,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 79,
			"completion_time": 98,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 99,
			"data_handling_time": 17,
			"data_ship_length": 3,
			"mooring_time": 99,
			"completion_time": 115,
			"mooring_berth": 26
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 139,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 158,
			"completion_time": 170,
			"mooring_berth": 13
		}
	]
};
var bks_bcn_36A_33_default = {
	solver: "sgcp,ti,rp,gspp",
	makespan: 196,
	dual_bound: 196,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 69,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 69,
			"completion_time": 73,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 100,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 149,
			"completion_time": 166,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 118,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 162,
			"completion_time": 171,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 158,
			"data_handling_time": 39,
			"data_ship_length": 8,
			"mooring_time": 158,
			"completion_time": 196,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 67,
			"data_handling_time": 10,
			"data_ship_length": 9,
			"mooring_time": 68,
			"completion_time": 77,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 60,
			"data_handling_time": 29,
			"data_ship_length": 7,
			"mooring_time": 69,
			"completion_time": 97,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 80,
			"data_handling_time": 21,
			"data_ship_length": 9,
			"mooring_time": 80,
			"completion_time": 100,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 97,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 100,
			"completion_time": 124,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 2,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 2,
			"completion_time": 14,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 10,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 10,
			"completion_time": 21,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 27,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 27,
			"completion_time": 46,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 69,
			"data_handling_time": 23,
			"data_ship_length": 5,
			"mooring_time": 91,
			"completion_time": 113,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 106,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 147,
			"completion_time": 160,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 122,
			"data_handling_time": 41,
			"data_ship_length": 5,
			"mooring_time": 156,
			"completion_time": 196,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 31,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 38,
			"completion_time": 43,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 49,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 50,
			"completion_time": 62,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 106,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 118,
			"completion_time": 141,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 105,
			"data_handling_time": 28,
			"data_ship_length": 7,
			"mooring_time": 115,
			"completion_time": 142,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 132,
			"data_handling_time": 24,
			"data_ship_length": 8,
			"mooring_time": 169,
			"completion_time": 192,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 36,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 36,
			"completion_time": 52,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 126,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 126,
			"completion_time": 144,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 16,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 16,
			"completion_time": 28,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 38,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 45,
			"completion_time": 64,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 55,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 55,
			"completion_time": 64,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 77,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 77,
			"completion_time": 96,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 99,
			"data_handling_time": 17,
			"data_ship_length": 3,
			"mooring_time": 126,
			"completion_time": 142,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 139,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 143,
			"completion_time": 155,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 166,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 173,
			"completion_time": 194,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 21,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 30,
			"completion_time": 37,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 39,
			"data_handling_time": 3,
			"data_ship_length": 4,
			"mooring_time": 194,
			"completion_time": 196,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 99,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 99,
			"completion_time": 116,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 103,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 107,
			"completion_time": 121,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 122,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 125,
			"completion_time": 140,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 140,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 144,
			"completion_time": 154,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 69,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 70,
			"completion_time": 82,
			"mooring_berth": 8
		}
	]
};
var bks_bcn_36A_34_default = {
	solver: "sgcp,rp,ti,gspp",
	makespan: 178,
	dual_bound: 178,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 118,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 144,
			"completion_time": 153,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 100,
			"data_handling_time": 23,
			"data_ship_length": 4,
			"mooring_time": 105,
			"completion_time": 127,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 2,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 4,
			"completion_time": 16,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 10,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 23,
			"completion_time": 34,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 27,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 83,
			"completion_time": 102,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 69,
			"data_handling_time": 23,
			"data_ship_length": 5,
			"mooring_time": 84,
			"completion_time": 106,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 106,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 109,
			"completion_time": 122,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 122,
			"data_handling_time": 41,
			"data_ship_length": 5,
			"mooring_time": 134,
			"completion_time": 174,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 23,
			"data_handling_time": 9,
			"data_ship_length": 5,
			"mooring_time": 89,
			"completion_time": 97,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 26,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 30,
			"completion_time": 41,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 34,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 39,
			"completion_time": 48,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 57,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 57,
			"completion_time": 68,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 129,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 145,
			"completion_time": 163,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 31,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 46,
			"completion_time": 51,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 116,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 124,
			"completion_time": 143,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 49,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 51,
			"completion_time": 63,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 166,
			"data_handling_time": 13,
			"data_ship_length": 6,
			"mooring_time": 166,
			"completion_time": 178,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 36,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 65,
			"completion_time": 81,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 126,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 155,
			"completion_time": 173,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 153,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 162,
			"completion_time": 176,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 0,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 3,
			"completion_time": 15,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 15,
			"data_handling_time": 15,
			"data_ship_length": 8,
			"mooring_time": 62,
			"completion_time": 76,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 98,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 99,
			"completion_time": 108,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 21,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 36,
			"completion_time": 43,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 39,
			"data_handling_time": 3,
			"data_ship_length": 4,
			"mooring_time": 176,
			"completion_time": 178,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 99,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 124,
			"completion_time": 141,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 103,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 110,
			"completion_time": 124,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 122,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 127,
			"completion_time": 142,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 140,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 146,
			"completion_time": 156,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 2,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 2,
			"completion_time": 21,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 12,
			"data_handling_time": 37,
			"data_ship_length": 6,
			"mooring_time": 18,
			"completion_time": 54,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 83,
			"data_handling_time": 35,
			"data_ship_length": 4,
			"mooring_time": 87,
			"completion_time": 121,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 69,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 72,
			"completion_time": 84,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_36A_35_default = {
	solver: "sgcp,ti,rp",
	makespan: 188,
	dual_bound: 188,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 144,
			"data_handling_time": 29,
			"data_ship_length": 5,
			"mooring_time": 160,
			"completion_time": 188,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 100,
			"data_handling_time": 23,
			"data_ship_length": 4,
			"mooring_time": 105,
			"completion_time": 127,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 52,
			"data_handling_time": 9,
			"data_ship_length": 5,
			"mooring_time": 140,
			"completion_time": 148,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 23,
			"data_handling_time": 9,
			"data_ship_length": 5,
			"mooring_time": 149,
			"completion_time": 157,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 26,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 147,
			"completion_time": 158,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 34,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 110,
			"completion_time": 119,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 57,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 149,
			"completion_time": 160,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 129,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 140,
			"completion_time": 158,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 135,
			"data_handling_time": 35,
			"data_ship_length": 7,
			"mooring_time": 135,
			"completion_time": 169,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 158,
			"data_handling_time": 28,
			"data_ship_length": 8,
			"mooring_time": 161,
			"completion_time": 188,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 116,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 120,
			"completion_time": 139,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 59,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 80,
			"completion_time": 94,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 0,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 71,
			"completion_time": 83,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 15,
			"data_handling_time": 15,
			"data_ship_length": 8,
			"mooring_time": 120,
			"completion_time": 134,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 98,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 100,
			"completion_time": 109,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 50,
			"data_handling_time": 30,
			"data_ship_length": 8,
			"mooring_time": 50,
			"completion_time": 79,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 85,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 85,
			"completion_time": 99,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 142,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 170,
			"completion_time": 188,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 2,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 119,
			"completion_time": 138,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 12,
			"data_handling_time": 37,
			"data_ship_length": 6,
			"mooring_time": 13,
			"completion_time": 49,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 83,
			"data_handling_time": 35,
			"data_ship_length": 4,
			"mooring_time": 84,
			"completion_time": 118,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 144,
			"data_handling_time": 28,
			"data_ship_length": 5,
			"mooring_time": 161,
			"completion_time": 188,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 30,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 54,
			"completion_time": 70,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 53,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 95,
			"completion_time": 104,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 104,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 104,
			"completion_time": 117,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 95,
			"data_handling_time": 24,
			"data_ship_length": 4,
			"mooring_time": 100,
			"completion_time": 123,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 124,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 124,
			"completion_time": 139,
			"mooring_berth": 9
		}
	]
};
var bks_bcn_36A_36_default = {
	solver: "s,gspp,rp,ti,sgcp",
	makespan: 197,
	dual_bound: 197,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 79,
			"data_handling_time": 10,
			"data_ship_length": 3,
			"mooring_time": 79,
			"completion_time": 88,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 111,
			"data_handling_time": 11,
			"data_ship_length": 3,
			"mooring_time": 111,
			"completion_time": 121,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 138,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 153,
			"completion_time": 164,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 37,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 37,
			"completion_time": 48,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 52,
			"data_handling_time": 9,
			"data_ship_length": 5,
			"mooring_time": 55,
			"completion_time": 63,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 122,
			"data_handling_time": 46,
			"data_ship_length": 5,
			"mooring_time": 152,
			"completion_time": 197,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 152,
			"data_handling_time": 21,
			"data_ship_length": 4,
			"mooring_time": 165,
			"completion_time": 185,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 2,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 2,
			"completion_time": 16,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 23,
			"data_handling_time": 32,
			"data_ship_length": 7,
			"mooring_time": 23,
			"completion_time": 54,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 102,
			"data_handling_time": 8,
			"data_ship_length": 6,
			"mooring_time": 102,
			"completion_time": 109,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 122,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 151,
			"completion_time": 156,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 129,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 129,
			"completion_time": 152,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 59,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 64,
			"completion_time": 78,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 57,
			"data_handling_time": 41,
			"data_ship_length": 9,
			"mooring_time": 110,
			"completion_time": 150,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 50,
			"data_handling_time": 30,
			"data_ship_length": 8,
			"mooring_time": 50,
			"completion_time": 79,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 85,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 85,
			"completion_time": 99,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 142,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 162,
			"completion_time": 180,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 53,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 53,
			"completion_time": 63,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 51,
			"data_handling_time": 20,
			"data_ship_length": 6,
			"mooring_time": 51,
			"completion_time": 70,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 150,
			"data_handling_time": 12,
			"data_ship_length": 8,
			"mooring_time": 150,
			"completion_time": 161,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 30,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 30,
			"completion_time": 46,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 53,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 53,
			"completion_time": 62,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 104,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 104,
			"completion_time": 117,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 95,
			"data_handling_time": 24,
			"data_ship_length": 4,
			"mooring_time": 125,
			"completion_time": 148,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 124,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 124,
			"completion_time": 139,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 154,
			"data_handling_time": 44,
			"data_ship_length": 4,
			"mooring_time": 154,
			"completion_time": 197,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 90,
			"data_handling_time": 27,
			"data_ship_length": 4,
			"mooring_time": 90,
			"completion_time": 116,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 75,
			"data_handling_time": 45,
			"data_ship_length": 7,
			"mooring_time": 80,
			"completion_time": 124,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 118,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 125,
			"completion_time": 142,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 0,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 0,
			"completion_time": 7,
			"mooring_berth": 9
		}
	]
};
var bks_bcn_36A_37_default = {
	solver: "s,ti,rp,sgcp",
	makespan: 203,
	dual_bound: 203,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 79,
			"data_handling_time": 10,
			"data_ship_length": 3,
			"mooring_time": 84,
			"completion_time": 93,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 111,
			"data_handling_time": 11,
			"data_ship_length": 3,
			"mooring_time": 114,
			"completion_time": 124,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 138,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 138,
			"completion_time": 149,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 37,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 37,
			"completion_time": 48,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 165,
			"data_handling_time": 39,
			"data_ship_length": 8,
			"mooring_time": 165,
			"completion_time": 203,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 38,
			"data_handling_time": 47,
			"data_ship_length": 8,
			"mooring_time": 49,
			"completion_time": 95,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 2,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 2,
			"completion_time": 16,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 23,
			"data_handling_time": 32,
			"data_ship_length": 7,
			"mooring_time": 23,
			"completion_time": 54,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 102,
			"data_handling_time": 8,
			"data_ship_length": 6,
			"mooring_time": 114,
			"completion_time": 121,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 122,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 125,
			"completion_time": 130,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 129,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 150,
			"completion_time": 173,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 162,
			"data_handling_time": 29,
			"data_ship_length": 5,
			"mooring_time": 175,
			"completion_time": 203,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 43,
			"data_handling_time": 3,
			"data_ship_length": 4,
			"mooring_time": 43,
			"completion_time": 45,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 44,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 67,
			"completion_time": 83,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 69,
			"data_handling_time": 26,
			"data_ship_length": 7,
			"mooring_time": 122,
			"completion_time": 147,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 119,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 139,
			"completion_time": 152,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 130,
			"data_handling_time": 23,
			"data_ship_length": 4,
			"mooring_time": 136,
			"completion_time": 158,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 137,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 148,
			"completion_time": 172,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 48,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 49,
			"completion_time": 66,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 57,
			"data_handling_time": 41,
			"data_ship_length": 9,
			"mooring_time": 57,
			"completion_time": 97,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 26,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 26,
			"completion_time": 40,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 53,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 98,
			"completion_time": 108,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 51,
			"data_handling_time": 20,
			"data_ship_length": 6,
			"mooring_time": 55,
			"completion_time": 74,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 150,
			"data_handling_time": 12,
			"data_ship_length": 8,
			"mooring_time": 153,
			"completion_time": 164,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 153,
			"data_handling_time": 31,
			"data_ship_length": 7,
			"mooring_time": 173,
			"completion_time": 203,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 122,
			"data_handling_time": 26,
			"data_ship_length": 5,
			"mooring_time": 178,
			"completion_time": 203,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 90,
			"data_handling_time": 27,
			"data_ship_length": 4,
			"mooring_time": 109,
			"completion_time": 135,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 75,
			"data_handling_time": 45,
			"data_ship_length": 7,
			"mooring_time": 75,
			"completion_time": 119,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 118,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 160,
			"completion_time": 177,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 160,
			"data_handling_time": 27,
			"data_ship_length": 4,
			"mooring_time": 177,
			"completion_time": 203,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 101,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 101,
			"completion_time": 113,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 99,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 159,
			"completion_time": 176,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 102,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 102,
			"completion_time": 118,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 0,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 0,
			"completion_time": 7,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 109,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 120,
			"completion_time": 136,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 118,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 120,
			"completion_time": 129,
			"mooring_berth": 25
		}
	]
};
var bks_bcn_36A_38_default = {
	solver: "s,sgcp,ti,rp",
	makespan: 193,
	dual_bound: 193,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 165,
			"data_handling_time": 29,
			"data_ship_length": 4,
			"mooring_time": 165,
			"completion_time": 193,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 34,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 34,
			"completion_time": 37,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 108,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 108,
			"completion_time": 118,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 38,
			"data_handling_time": 47,
			"data_ship_length": 8,
			"mooring_time": 38,
			"completion_time": 84,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 156,
			"data_handling_time": 23,
			"data_ship_length": 8,
			"mooring_time": 171,
			"completion_time": 193,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 43,
			"data_handling_time": 3,
			"data_ship_length": 4,
			"mooring_time": 43,
			"completion_time": 45,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 44,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 85,
			"completion_time": 101,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 69,
			"data_handling_time": 26,
			"data_ship_length": 7,
			"mooring_time": 75,
			"completion_time": 100,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 119,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 119,
			"completion_time": 132,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 130,
			"data_handling_time": 23,
			"data_ship_length": 4,
			"mooring_time": 171,
			"completion_time": 193,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 137,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 144,
			"completion_time": 168,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 13,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 13,
			"completion_time": 22,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 46,
			"data_handling_time": 21,
			"data_ship_length": 4,
			"mooring_time": 48,
			"completion_time": 68,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 66,
			"data_handling_time": 24,
			"data_ship_length": 4,
			"mooring_time": 75,
			"completion_time": 98,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 121,
			"data_handling_time": 38,
			"data_ship_length": 5,
			"mooring_time": 156,
			"completion_time": 193,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 48,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 48,
			"completion_time": 65,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 26,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 26,
			"completion_time": 40,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 166,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 169,
			"completion_time": 193,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 115,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 115,
			"completion_time": 149,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 122,
			"data_handling_time": 26,
			"data_ship_length": 5,
			"mooring_time": 143,
			"completion_time": 168,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 81,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 85,
			"completion_time": 106,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 101,
			"data_handling_time": 23,
			"data_ship_length": 8,
			"mooring_time": 102,
			"completion_time": 124,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 126,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 126,
			"completion_time": 142,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 147,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 150,
			"completion_time": 168,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 101,
			"data_handling_time": 13,
			"data_ship_length": 8,
			"mooring_time": 102,
			"completion_time": 114,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 99,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 99,
			"completion_time": 116,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 102,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 117,
			"completion_time": 133,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 23,
			"data_handling_time": 11,
			"data_ship_length": 3,
			"mooring_time": 69,
			"completion_time": 79,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 14,
			"data_handling_time": 34,
			"data_ship_length": 4,
			"mooring_time": 14,
			"completion_time": 47,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 52,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 66,
			"completion_time": 74,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 50,
			"data_handling_time": 35,
			"data_ship_length": 7,
			"mooring_time": 50,
			"completion_time": 84,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 105,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 150,
			"completion_time": 164,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 109,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 133,
			"completion_time": 149,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 118,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 134,
			"completion_time": 143,
			"mooring_berth": 8
		}
	]
};
var bks_bcn_36A_39_default = {
	solver: "rp,ti,s,sgcp",
	makespan: 173,
	dual_bound: 173,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 34,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 40,
			"completion_time": 43,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 108,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 121,
			"completion_time": 131,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 147,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 159,
			"completion_time": 173,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 13,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 13,
			"completion_time": 22,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 46,
			"data_handling_time": 21,
			"data_ship_length": 4,
			"mooring_time": 60,
			"completion_time": 80,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 66,
			"data_handling_time": 24,
			"data_ship_length": 4,
			"mooring_time": 72,
			"completion_time": 95,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 121,
			"data_handling_time": 38,
			"data_ship_length": 5,
			"mooring_time": 121,
			"completion_time": 158,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 21,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 23,
			"completion_time": 39,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 51,
			"data_handling_time": 38,
			"data_ship_length": 4,
			"mooring_time": 81,
			"completion_time": 118,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 113,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 127,
			"completion_time": 148,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 125,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 156,
			"completion_time": 173,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 115,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 121,
			"completion_time": 155,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 152,
			"data_handling_time": 22,
			"data_ship_length": 6,
			"mooring_time": 152,
			"completion_time": 173,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 81,
			"data_handling_time": 36,
			"data_ship_length": 7,
			"mooring_time": 85,
			"completion_time": 120,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 81,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 81,
			"completion_time": 102,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 101,
			"data_handling_time": 23,
			"data_ship_length": 8,
			"mooring_time": 103,
			"completion_time": 125,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 126,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 135,
			"completion_time": 151,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 147,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 149,
			"completion_time": 167,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 92,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 96,
			"completion_time": 116,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 23,
			"data_handling_time": 11,
			"data_ship_length": 3,
			"mooring_time": 23,
			"completion_time": 33,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 14,
			"data_handling_time": 34,
			"data_ship_length": 4,
			"mooring_time": 14,
			"completion_time": 47,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 52,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 72,
			"completion_time": 80,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 50,
			"data_handling_time": 35,
			"data_ship_length": 7,
			"mooring_time": 50,
			"completion_time": 84,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 105,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 120,
			"completion_time": 134,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 5,
			"data_handling_time": 28,
			"data_ship_length": 4,
			"mooring_time": 5,
			"completion_time": 32,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 35,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 35,
			"completion_time": 49,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 53,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 53,
			"completion_time": 61,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 46,
			"data_handling_time": 26,
			"data_ship_length": 7,
			"mooring_time": 46,
			"completion_time": 71,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 68,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 72,
			"completion_time": 85,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 92,
			"data_handling_time": 25,
			"data_ship_length": 4,
			"mooring_time": 96,
			"completion_time": 120,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 112,
			"data_handling_time": 18,
			"data_ship_length": 3,
			"mooring_time": 131,
			"completion_time": 148,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 149,
			"data_handling_time": 6,
			"data_ship_length": 7,
			"mooring_time": 168,
			"completion_time": 173,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 126,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 159,
			"completion_time": 173,
			"mooring_berth": 19
		}
	]
};
var bks_bcn_36A_4_default = {
	solver: "sgcp,rp",
	makespan: 165,
	dual_bound: 165,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 110,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 114,
			"completion_time": 126,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 107,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 127,
			"completion_time": 139,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 103,
			"data_handling_time": 26,
			"data_ship_length": 5,
			"mooring_time": 103,
			"completion_time": 128,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 27,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 30,
			"completion_time": 44,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 70,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 74,
			"completion_time": 85,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 107,
			"data_handling_time": 26,
			"data_ship_length": 7,
			"mooring_time": 124,
			"completion_time": 149,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 135,
			"data_handling_time": 9,
			"data_ship_length": 5,
			"mooring_time": 150,
			"completion_time": 158,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 8,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 8,
			"completion_time": 23,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 25,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 25,
			"completion_time": 49,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 56,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 58,
			"completion_time": 73,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 105,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 108,
			"completion_time": 126,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 131,
			"data_handling_time": 16,
			"data_ship_length": 3,
			"mooring_time": 150,
			"completion_time": 165,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 130,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 145,
			"completion_time": 165,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 140,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 153,
			"completion_time": 165,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 11,
			"data_handling_time": 10,
			"data_ship_length": 8,
			"mooring_time": 14,
			"completion_time": 23,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 4,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 26,
			"completion_time": 45,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 45,
			"data_handling_time": 8,
			"data_ship_length": 6,
			"mooring_time": 50,
			"completion_time": 57,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 43,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 45,
			"completion_time": 59,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 50,
			"data_handling_time": 9,
			"data_ship_length": 7,
			"mooring_time": 61,
			"completion_time": 69,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 60,
			"data_handling_time": 27,
			"data_ship_length": 5,
			"mooring_time": 60,
			"completion_time": 86,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 61,
			"data_handling_time": 30,
			"data_ship_length": 8,
			"mooring_time": 65,
			"completion_time": 94,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 84,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 86,
			"completion_time": 101,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 149,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 159,
			"completion_time": 165,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 119,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 128,
			"completion_time": 139,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 2,
			"data_handling_time": 23,
			"data_ship_length": 6,
			"mooring_time": 5,
			"completion_time": 27,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 55,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 57,
			"completion_time": 69,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 94,
			"data_handling_time": 7,
			"data_ship_length": 7,
			"mooring_time": 95,
			"completion_time": 101,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 6,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 48,
			"completion_time": 61,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 23,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 25,
			"completion_time": 49,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 62,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 147,
			"completion_time": 150,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 102,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 102,
			"completion_time": 123,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 35,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 38,
			"completion_time": 48,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 70,
			"data_handling_time": 6,
			"data_ship_length": 6,
			"mooring_time": 74,
			"completion_time": 79,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 80,
			"data_handling_time": 28,
			"data_ship_length": 7,
			"mooring_time": 80,
			"completion_time": 107,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 102,
			"data_handling_time": 26,
			"data_ship_length": 4,
			"mooring_time": 102,
			"completion_time": 127,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 121,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 140,
			"completion_time": 152,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 124,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 140,
			"completion_time": 150,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 126,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 133,
			"completion_time": 144,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 128,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 129,
			"completion_time": 146,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 148,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 148,
			"completion_time": 165,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 70,
			"data_handling_time": 10,
			"data_ship_length": 3,
			"mooring_time": 70,
			"completion_time": 79,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 86,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 87,
			"completion_time": 101,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 133,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 151,
			"completion_time": 165,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 43,
			"data_arrival_time": 100,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 102,
			"completion_time": 113,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 44,
			"data_arrival_time": 126,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 127,
			"completion_time": 132,
			"mooring_berth": 17
		}
	]
};
var bks_bcn_36A_40_default = {
	solver: "sgcp",
	makespan: 182,
	dual_bound: 182,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 105,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 117,
			"completion_time": 126,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 110,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 119,
			"completion_time": 130,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 146,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 161,
			"completion_time": 182,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 82,
			"data_handling_time": 47,
			"data_ship_length": 8,
			"mooring_time": 86,
			"completion_time": 132,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 147,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 149,
			"completion_time": 163,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 138,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 164,
			"completion_time": 182,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 21,
			"data_handling_time": 17,
			"data_ship_length": 5,
			"mooring_time": 26,
			"completion_time": 42,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 51,
			"data_handling_time": 38,
			"data_ship_length": 4,
			"mooring_time": 51,
			"completion_time": 88,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 113,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 119,
			"completion_time": 140,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 125,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 146,
			"completion_time": 163,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 136,
			"data_handling_time": 33,
			"data_ship_length": 7,
			"mooring_time": 144,
			"completion_time": 176,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 9,
			"data_handling_time": 29,
			"data_ship_length": 4,
			"mooring_time": 10,
			"completion_time": 38,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 42,
			"data_handling_time": 34,
			"data_ship_length": 8,
			"mooring_time": 42,
			"completion_time": 75,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 80,
			"data_handling_time": 28,
			"data_ship_length": 7,
			"mooring_time": 80,
			"completion_time": 107,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 114,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 127,
			"completion_time": 139,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 136,
			"data_handling_time": 19,
			"data_ship_length": 4,
			"mooring_time": 142,
			"completion_time": 160,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 81,
			"data_handling_time": 36,
			"data_ship_length": 7,
			"mooring_time": 81,
			"completion_time": 116,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 156,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 164,
			"completion_time": 182,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 92,
			"data_handling_time": 21,
			"data_ship_length": 5,
			"mooring_time": 108,
			"completion_time": 128,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 124,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 129,
			"completion_time": 148,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 131,
			"data_handling_time": 28,
			"data_ship_length": 8,
			"mooring_time": 133,
			"completion_time": 160,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 5,
			"data_handling_time": 28,
			"data_ship_length": 4,
			"mooring_time": 9,
			"completion_time": 36,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 35,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 38,
			"completion_time": 52,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 53,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 77,
			"completion_time": 85,
			"mooring_berth": 1
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 46,
			"data_handling_time": 26,
			"data_ship_length": 7,
			"mooring_time": 46,
			"completion_time": 71,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 68,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 72,
			"completion_time": 85,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 92,
			"data_handling_time": 25,
			"data_ship_length": 4,
			"mooring_time": 93,
			"completion_time": 117,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 112,
			"data_handling_time": 18,
			"data_ship_length": 3,
			"mooring_time": 126,
			"completion_time": 143,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 149,
			"data_handling_time": 6,
			"data_ship_length": 7,
			"mooring_time": 177,
			"completion_time": 182,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 15,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 15,
			"completion_time": 36,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 2,
			"data_handling_time": 40,
			"data_ship_length": 7,
			"mooring_time": 2,
			"completion_time": 41,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 46,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 76,
			"completion_time": 80,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 53,
			"data_handling_time": 23,
			"data_ship_length": 8,
			"mooring_time": 53,
			"completion_time": 75,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 101,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 108,
			"completion_time": 118,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 109,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 117,
			"completion_time": 125,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 126,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 131,
			"completion_time": 145,
			"mooring_berth": 17
		}
	]
};
var bks_bcn_36A_41_default = {
	solver: "s,sgcp,ti,rp",
	makespan: 180,
	dual_bound: 180,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 105,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 143,
			"completion_time": 152,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 110,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 121,
			"completion_time": 132,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 82,
			"data_handling_time": 47,
			"data_ship_length": 8,
			"mooring_time": 82,
			"completion_time": 128,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 138,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 139,
			"completion_time": 157,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 9,
			"data_handling_time": 29,
			"data_ship_length": 4,
			"mooring_time": 9,
			"completion_time": 37,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 42,
			"data_handling_time": 34,
			"data_ship_length": 8,
			"mooring_time": 42,
			"completion_time": 75,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 80,
			"data_handling_time": 28,
			"data_ship_length": 7,
			"mooring_time": 86,
			"completion_time": 113,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 114,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 121,
			"completion_time": 133,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 162,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 163,
			"completion_time": 180,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 158,
			"data_handling_time": 23,
			"data_ship_length": 7,
			"mooring_time": 158,
			"completion_time": 180,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 43,
			"data_handling_time": 20,
			"data_ship_length": 8,
			"mooring_time": 76,
			"completion_time": 95,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 105,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 123,
			"completion_time": 138,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 130,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 153,
			"completion_time": 160,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 132,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 134,
			"completion_time": 151,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 136,
			"data_handling_time": 19,
			"data_ship_length": 4,
			"mooring_time": 136,
			"completion_time": 154,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 156,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 168,
			"completion_time": 180,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 124,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 161,
			"completion_time": 180,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 131,
			"data_handling_time": 28,
			"data_ship_length": 8,
			"mooring_time": 132,
			"completion_time": 159,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 15,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 15,
			"completion_time": 36,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 2,
			"data_handling_time": 40,
			"data_ship_length": 7,
			"mooring_time": 2,
			"completion_time": 41,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 46,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 46,
			"completion_time": 50,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 53,
			"data_handling_time": 23,
			"data_ship_length": 8,
			"mooring_time": 53,
			"completion_time": 75,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 101,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 121,
			"completion_time": 131,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 109,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 114,
			"completion_time": 122,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 6,
			"data_handling_time": 29,
			"data_ship_length": 7,
			"mooring_time": 6,
			"completion_time": 34,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 35,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 37,
			"completion_time": 50,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 15,
			"data_handling_time": 35,
			"data_ship_length": 4,
			"mooring_time": 51,
			"completion_time": 85,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 53,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 53,
			"completion_time": 64,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 86,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 96,
			"completion_time": 120,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 106,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 119,
			"completion_time": 130,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 92,
			"data_handling_time": 27,
			"data_ship_length": 4,
			"mooring_time": 92,
			"completion_time": 118,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 62,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 65,
			"completion_time": 77,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 69,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 83,
			"completion_time": 91,
			"mooring_berth": 17
		}
	]
};
var bks_bcn_36A_42_default = {
	solver: "rp,ti,sgcp",
	makespan: 169,
	dual_bound: 169,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 31,
			"data_handling_time": 4,
			"data_ship_length": 3,
			"mooring_time": 35,
			"completion_time": 38,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 115,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 123,
			"completion_time": 133,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 129,
			"data_handling_time": 27,
			"data_ship_length": 4,
			"mooring_time": 134,
			"completion_time": 160,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 43,
			"data_handling_time": 20,
			"data_ship_length": 8,
			"mooring_time": 49,
			"completion_time": 68,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 105,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 105,
			"completion_time": 120,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 130,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 134,
			"completion_time": 141,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 132,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 152,
			"completion_time": 169,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 5,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 5,
			"completion_time": 28,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 18,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 18,
			"completion_time": 30,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 95,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 148,
			"completion_time": 169,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 120,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 154,
			"completion_time": 169,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 102,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 102,
			"completion_time": 113,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 134,
			"data_handling_time": 36,
			"data_ship_length": 8,
			"mooring_time": 134,
			"completion_time": 169,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 32,
			"data_handling_time": 17,
			"data_ship_length": 6,
			"mooring_time": 32,
			"completion_time": 48,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 37,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 49,
			"completion_time": 61,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 105,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 105,
			"completion_time": 122,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 128,
			"data_handling_time": 23,
			"data_ship_length": 8,
			"mooring_time": 128,
			"completion_time": 150,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 6,
			"data_handling_time": 29,
			"data_ship_length": 7,
			"mooring_time": 6,
			"completion_time": 34,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 35,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 35,
			"completion_time": 48,
			"mooring_berth": 3
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 15,
			"data_handling_time": 35,
			"data_ship_length": 4,
			"mooring_time": 66,
			"completion_time": 100,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 53,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 53,
			"completion_time": 64,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 86,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 101,
			"completion_time": 125,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 106,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 121,
			"completion_time": 132,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 92,
			"data_handling_time": 27,
			"data_ship_length": 4,
			"mooring_time": 121,
			"completion_time": 147,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 0,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 0,
			"completion_time": 14,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 19,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 19,
			"completion_time": 31,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 52,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 52,
			"completion_time": 61,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 34,
			"data_handling_time": 43,
			"data_ship_length": 4,
			"mooring_time": 34,
			"completion_time": 76,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 57,
			"data_handling_time": 24,
			"data_ship_length": 8,
			"mooring_time": 77,
			"completion_time": 100,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 91,
			"data_handling_time": 26,
			"data_ship_length": 4,
			"mooring_time": 108,
			"completion_time": 133,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 62,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 62,
			"completion_time": 74,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 69,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 77,
			"completion_time": 85,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 138,
			"data_handling_time": 5,
			"data_ship_length": 5,
			"mooring_time": 161,
			"completion_time": 165,
			"mooring_berth": 16
		}
	]
};
var bks_bcn_36A_43_default = {
	solver: "ti,rp,sgcp",
	makespan: 174,
	dual_bound: 174,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 31,
			"data_handling_time": 4,
			"data_ship_length": 3,
			"mooring_time": 168,
			"completion_time": 171,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 115,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 164,
			"completion_time": 174,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 36,
			"data_handling_time": 31,
			"data_ship_length": 7,
			"mooring_time": 37,
			"completion_time": 67,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 129,
			"data_handling_time": 27,
			"data_ship_length": 4,
			"mooring_time": 133,
			"completion_time": 159,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 5,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 8,
			"completion_time": 31,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 18,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 137,
			"completion_time": 149,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 95,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 100,
			"completion_time": 121,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 120,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 122,
			"completion_time": 137,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 28,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 86,
			"completion_time": 97,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 83,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 88,
			"completion_time": 97,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 127,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 133,
			"completion_time": 144,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 146,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 147,
			"completion_time": 161,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 147,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 161,
			"completion_time": 174,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 102,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 119,
			"completion_time": 130,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 32,
			"data_handling_time": 17,
			"data_ship_length": 6,
			"mooring_time": 45,
			"completion_time": 61,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 86,
			"data_handling_time": 32,
			"data_ship_length": 6,
			"mooring_time": 87,
			"completion_time": 118,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 150,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 150,
			"completion_time": 160,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 37,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 73,
			"completion_time": 85,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 105,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 119,
			"completion_time": 136,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 128,
			"data_handling_time": 23,
			"data_ship_length": 8,
			"mooring_time": 142,
			"completion_time": 164,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 161,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 161,
			"completion_time": 174,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 109,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 109,
			"completion_time": 132,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 120,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 137,
			"completion_time": 153,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 0,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 70,
			"completion_time": 84,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 19,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 63,
			"completion_time": 75,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 52,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 76,
			"completion_time": 85,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 34,
			"data_handling_time": 43,
			"data_ship_length": 4,
			"mooring_time": 34,
			"completion_time": 76,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 57,
			"data_handling_time": 24,
			"data_ship_length": 8,
			"mooring_time": 62,
			"completion_time": 85,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 91,
			"data_handling_time": 26,
			"data_ship_length": 4,
			"mooring_time": 92,
			"completion_time": 117,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 24,
			"data_handling_time": 10,
			"data_ship_length": 7,
			"mooring_time": 35,
			"completion_time": 44,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 48,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 138,
			"completion_time": 146,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 99,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 145,
			"completion_time": 151,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 85,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 85,
			"completion_time": 108,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 111,
			"data_handling_time": 9,
			"data_ship_length": 3,
			"mooring_time": 166,
			"completion_time": 174,
			"mooring_berth": 26
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 95,
			"data_handling_time": 44,
			"data_ship_length": 4,
			"mooring_time": 98,
			"completion_time": 141,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 138,
			"data_handling_time": 5,
			"data_ship_length": 5,
			"mooring_time": 153,
			"completion_time": 157,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 4,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 19,
			"completion_time": 36,
			"mooring_berth": 9
		}
	]
};
var bks_bcn_36A_44_default = {
	solver: "rp,ti,s,sgcp",
	makespan: 181,
	dual_bound: 181,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 36,
			"data_handling_time": 31,
			"data_ship_length": 7,
			"mooring_time": 80,
			"completion_time": 110,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 60,
			"data_handling_time": 19,
			"data_ship_length": 4,
			"mooring_time": 60,
			"completion_time": 78,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 109,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 161,
			"completion_time": 180,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 163,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 174,
			"completion_time": 181,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 28,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 55,
			"completion_time": 66,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 83,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 83,
			"completion_time": 92,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 127,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 143,
			"completion_time": 154,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 146,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 155,
			"completion_time": 169,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 147,
			"data_handling_time": 14,
			"data_ship_length": 7,
			"mooring_time": 147,
			"completion_time": 160,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 9,
			"data_handling_time": 28,
			"data_ship_length": 7,
			"mooring_time": 9,
			"completion_time": 36,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 39,
			"data_handling_time": 16,
			"data_ship_length": 8,
			"mooring_time": 39,
			"completion_time": 54,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 16,
			"data_handling_time": 42,
			"data_ship_length": 4,
			"mooring_time": 16,
			"completion_time": 57,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 78,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 78,
			"completion_time": 92,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 111,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 118,
			"completion_time": 133,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 164,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 171,
			"completion_time": 181,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 86,
			"data_handling_time": 32,
			"data_ship_length": 6,
			"mooring_time": 111,
			"completion_time": 142,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 150,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 161,
			"completion_time": 171,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 58,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 58,
			"completion_time": 72,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 109,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 139,
			"completion_time": 162,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 120,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 134,
			"completion_time": 150,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 84,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 93,
			"completion_time": 110,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 95,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 109,
			"completion_time": 120,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 24,
			"data_handling_time": 10,
			"data_ship_length": 7,
			"mooring_time": 24,
			"completion_time": 33,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 48,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 48,
			"completion_time": 56,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 99,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 111,
			"completion_time": 117,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 85,
			"data_handling_time": 24,
			"data_ship_length": 7,
			"mooring_time": 85,
			"completion_time": 108,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 111,
			"data_handling_time": 9,
			"data_ship_length": 3,
			"mooring_time": 111,
			"completion_time": 119,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 95,
			"data_handling_time": 44,
			"data_ship_length": 4,
			"mooring_time": 95,
			"completion_time": 138,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 163,
			"data_handling_time": 19,
			"data_ship_length": 7,
			"mooring_time": 163,
			"completion_time": 181,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 33,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 33,
			"completion_time": 38,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 57,
			"data_handling_time": 7,
			"data_ship_length": 3,
			"mooring_time": 57,
			"completion_time": 63,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 50,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 50,
			"completion_time": 69,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 104,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 121,
			"completion_time": 136,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 131,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 139,
			"completion_time": 158,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 4,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 4,
			"completion_time": 21,
			"mooring_berth": 25
		}
	]
};
var bks_bcn_36A_45_default = {
	solver: "gspp,sgcp,ti,rp",
	makespan: 193,
	dual_bound: 193,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 60,
			"data_handling_time": 19,
			"data_ship_length": 4,
			"mooring_time": 75,
			"completion_time": 93,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 109,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 156,
			"completion_time": 175,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 82,
			"data_handling_time": 10,
			"data_ship_length": 3,
			"mooring_time": 94,
			"completion_time": 103,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 27,
			"data_handling_time": 26,
			"data_ship_length": 3,
			"mooring_time": 27,
			"completion_time": 52,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 9,
			"data_handling_time": 28,
			"data_ship_length": 7,
			"mooring_time": 9,
			"completion_time": 36,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 39,
			"data_handling_time": 16,
			"data_ship_length": 8,
			"mooring_time": 40,
			"completion_time": 55,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 16,
			"data_handling_time": 42,
			"data_ship_length": 4,
			"mooring_time": 16,
			"completion_time": 57,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 78,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 83,
			"completion_time": 97,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 111,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 111,
			"completion_time": 126,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 39,
			"data_handling_time": 32,
			"data_ship_length": 5,
			"mooring_time": 39,
			"completion_time": 70,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 54,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 54,
			"completion_time": 72,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 107,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 116,
			"completion_time": 131,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 127,
			"data_handling_time": 18,
			"data_ship_length": 9,
			"mooring_time": 133,
			"completion_time": 150,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 58,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 58,
			"completion_time": 72,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 146,
			"data_handling_time": 35,
			"data_ship_length": 8,
			"mooring_time": 157,
			"completion_time": 191,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 84,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 91,
			"completion_time": 108,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 95,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 119,
			"completion_time": 130,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 85,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 136,
			"completion_time": 155,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 33,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 38,
			"completion_time": 43,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 57,
			"data_handling_time": 7,
			"data_ship_length": 3,
			"mooring_time": 74,
			"completion_time": 80,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 50,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 59,
			"completion_time": 78,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 104,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 178,
			"completion_time": 193,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 131,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 131,
			"completion_time": 150,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 155,
			"data_handling_time": 39,
			"data_ship_length": 6,
			"mooring_time": 155,
			"completion_time": 193,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 55,
			"data_handling_time": 12,
			"data_ship_length": 3,
			"mooring_time": 81,
			"completion_time": 92,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 80,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 110,
			"completion_time": 131,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 105,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 106,
			"completion_time": 117,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 108,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 134,
			"completion_time": 147,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 132,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 176,
			"completion_time": 185,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 147,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 152,
			"completion_time": 168,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 76,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 95,
			"completion_time": 108,
			"mooring_berth": 13
		}
	]
};
var bks_bcn_36A_46_default = {
	solver: "s,sgcp,rp,ti,gspp",
	makespan: 185,
	dual_bound: 185,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 82,
			"data_handling_time": 10,
			"data_ship_length": 3,
			"mooring_time": 87,
			"completion_time": 96,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 123,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 124,
			"completion_time": 132,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 27,
			"data_handling_time": 26,
			"data_ship_length": 3,
			"mooring_time": 27,
			"completion_time": 52,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 39,
			"data_handling_time": 32,
			"data_ship_length": 5,
			"mooring_time": 154,
			"completion_time": 185,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 54,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 68,
			"completion_time": 86,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 107,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 125,
			"completion_time": 140,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 127,
			"data_handling_time": 18,
			"data_ship_length": 9,
			"mooring_time": 136,
			"completion_time": 153,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 61,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 87,
			"completion_time": 105,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 54,
			"data_handling_time": 33,
			"data_ship_length": 7,
			"mooring_time": 54,
			"completion_time": 86,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 105,
			"data_handling_time": 16,
			"data_ship_length": 8,
			"mooring_time": 108,
			"completion_time": 123,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 8,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 8,
			"completion_time": 19,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 141,
			"data_handling_time": 45,
			"data_ship_length": 8,
			"mooring_time": 141,
			"completion_time": 185,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 4,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 4,
			"completion_time": 21,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 85,
			"data_handling_time": 20,
			"data_ship_length": 5,
			"mooring_time": 87,
			"completion_time": 106,
			"mooring_berth": 3
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 144,
			"data_handling_time": 30,
			"data_ship_length": 8,
			"mooring_time": 156,
			"completion_time": 185,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 8,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 8,
			"completion_time": 28,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 24,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 29,
			"completion_time": 36,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 149,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 149,
			"completion_time": 163,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 55,
			"data_handling_time": 12,
			"data_ship_length": 3,
			"mooring_time": 55,
			"completion_time": 66,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 80,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 102,
			"completion_time": 123,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 105,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 105,
			"completion_time": 116,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 108,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 108,
			"completion_time": 121,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 132,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 132,
			"completion_time": 141,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 147,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 169,
			"completion_time": 185,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 24,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 29,
			"completion_time": 50,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 54,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 54,
			"completion_time": 59,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 122,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 124,
			"completion_time": 130,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 76,
			"data_handling_time": 14,
			"data_ship_length": 5,
			"mooring_time": 111,
			"completion_time": 124,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 82,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 82,
			"completion_time": 101,
			"mooring_berth": 15
		}
	]
};
var bks_bcn_36A_47_default = {
	solver: "s,sgcp,ti,rp,gspp",
	makespan: 192,
	dual_bound: 192,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 123,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 123,
			"completion_time": 131,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 145,
			"data_handling_time": 23,
			"data_ship_length": 9,
			"mooring_time": 151,
			"completion_time": 173,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 63,
			"data_handling_time": 29,
			"data_ship_length": 7,
			"mooring_time": 78,
			"completion_time": 106,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 122,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 132,
			"completion_time": 149,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 61,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 132,
			"completion_time": 150,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 54,
			"data_handling_time": 33,
			"data_ship_length": 7,
			"mooring_time": 62,
			"completion_time": 94,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 105,
			"data_handling_time": 16,
			"data_ship_length": 8,
			"mooring_time": 177,
			"completion_time": 192,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 13,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 22,
			"completion_time": 39,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 26,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 26,
			"completion_time": 38,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 35,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 40,
			"completion_time": 58,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 66,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 117,
			"completion_time": 127,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 95,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 95,
			"completion_time": 116,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 107,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 107,
			"completion_time": 119,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 119,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 120,
			"completion_time": 129,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 8,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 8,
			"completion_time": 19,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 144,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 144,
			"completion_time": 150,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 4,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 4,
			"completion_time": 21,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 59,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 66,
			"completion_time": 77,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 8,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 22,
			"completion_time": 42,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 24,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 43,
			"completion_time": 50,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 149,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 149,
			"completion_time": 163,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 165,
			"data_handling_time": 28,
			"data_ship_length": 5,
			"mooring_time": 165,
			"completion_time": 192,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 125,
			"data_handling_time": 2,
			"data_ship_length": 5,
			"mooring_time": 130,
			"completion_time": 131,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 24,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 39,
			"completion_time": 60,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 54,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 54,
			"completion_time": 59,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 122,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 122,
			"completion_time": 128,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 167,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 167,
			"completion_time": 179,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 3,
			"data_handling_time": 26,
			"data_ship_length": 7,
			"mooring_time": 3,
			"completion_time": 28,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 54,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 54,
			"completion_time": 60,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 56,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 56,
			"completion_time": 79,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 101,
			"data_handling_time": 18,
			"data_ship_length": 3,
			"mooring_time": 101,
			"completion_time": 118,
			"mooring_berth": 26
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 103,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 103,
			"completion_time": 118,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 132,
			"data_handling_time": 9,
			"data_ship_length": 7,
			"mooring_time": 132,
			"completion_time": 140,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 156,
			"data_handling_time": 5,
			"data_ship_length": 3,
			"mooring_time": 156,
			"completion_time": 160,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 82,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 173,
			"completion_time": 192,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 95,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 95,
			"completion_time": 104,
			"mooring_berth": 21
		}
	]
};
var bks_bcn_36A_48_default = {
	solver: "sgcp,gspp,ti,rp",
	makespan: 178,
	dual_bound: 178,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 36,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 46,
			"completion_time": 56,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 107,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 170,
			"completion_time": 178,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 90,
			"data_handling_time": 21,
			"data_ship_length": 4,
			"mooring_time": 125,
			"completion_time": 145,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 63,
			"data_handling_time": 29,
			"data_ship_length": 7,
			"mooring_time": 105,
			"completion_time": 133,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 122,
			"data_handling_time": 18,
			"data_ship_length": 5,
			"mooring_time": 161,
			"completion_time": 178,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 70,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 90,
			"completion_time": 101,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 106,
			"data_handling_time": 22,
			"data_ship_length": 6,
			"mooring_time": 133,
			"completion_time": 154,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 13,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 13,
			"completion_time": 30,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 26,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 31,
			"completion_time": 43,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 35,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 39,
			"completion_time": 57,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 66,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 110,
			"completion_time": 120,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 95,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 127,
			"completion_time": 148,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 107,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 162,
			"completion_time": 174,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 119,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 150,
			"completion_time": 159,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 4,
			"data_handling_time": 30,
			"data_ship_length": 7,
			"mooring_time": 23,
			"completion_time": 52,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 33,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 89,
			"completion_time": 103,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 79,
			"data_handling_time": 19,
			"data_ship_length": 4,
			"mooring_time": 90,
			"completion_time": 108,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 123,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 138,
			"completion_time": 158,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 144,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 147,
			"completion_time": 153,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 59,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 68,
			"completion_time": 79,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 7,
			"data_handling_time": 15,
			"data_ship_length": 6,
			"mooring_time": 7,
			"completion_time": 21,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 125,
			"data_handling_time": 2,
			"data_ship_length": 5,
			"mooring_time": 135,
			"completion_time": 136,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 13,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 13,
			"completion_time": 29,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 113,
			"data_handling_time": 8,
			"data_ship_length": 7,
			"mooring_time": 115,
			"completion_time": 122,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 3,
			"data_handling_time": 26,
			"data_ship_length": 7,
			"mooring_time": 40,
			"completion_time": 65,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 54,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 81,
			"completion_time": 87,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 56,
			"data_handling_time": 24,
			"data_ship_length": 5,
			"mooring_time": 65,
			"completion_time": 88,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 101,
			"data_handling_time": 18,
			"data_ship_length": 3,
			"mooring_time": 128,
			"completion_time": 145,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 103,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 110,
			"completion_time": 125,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 132,
			"data_handling_time": 9,
			"data_ship_length": 7,
			"mooring_time": 160,
			"completion_time": 168,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 156,
			"data_handling_time": 5,
			"data_ship_length": 3,
			"mooring_time": 156,
			"completion_time": 160,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 156,
			"data_handling_time": 23,
			"data_ship_length": 8,
			"mooring_time": 156,
			"completion_time": 178,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 54,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 81,
			"completion_time": 87,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 61,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 90,
			"completion_time": 96,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 52,
			"data_handling_time": 26,
			"data_ship_length": 4,
			"mooring_time": 74,
			"completion_time": 99,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 53,
			"data_handling_time": 35,
			"data_ship_length": 7,
			"mooring_time": 54,
			"completion_time": 88,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 83,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 103,
			"completion_time": 112,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 95,
			"data_handling_time": 10,
			"data_ship_length": 5,
			"mooring_time": 98,
			"completion_time": 107,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 34,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 60,
			"completion_time": 72,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_36A_49_default = {
	solver: "rp,sgcp,ti",
	makespan: 174,
	dual_bound: 174,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 104,
			"data_handling_time": 22,
			"data_ship_length": 4,
			"mooring_time": 128,
			"completion_time": 149,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 36,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 53,
			"completion_time": 63,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 107,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 107,
			"completion_time": 115,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 67,
			"data_handling_time": 10,
			"data_ship_length": 3,
			"mooring_time": 91,
			"completion_time": 100,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 90,
			"data_handling_time": 21,
			"data_ship_length": 4,
			"mooring_time": 128,
			"completion_time": 148,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 70,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 79,
			"completion_time": 90,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 106,
			"data_handling_time": 22,
			"data_ship_length": 6,
			"mooring_time": 106,
			"completion_time": 127,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 105,
			"data_handling_time": 22,
			"data_ship_length": 5,
			"mooring_time": 106,
			"completion_time": 127,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 4,
			"data_handling_time": 30,
			"data_ship_length": 7,
			"mooring_time": 4,
			"completion_time": 33,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 33,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 64,
			"completion_time": 78,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 79,
			"data_handling_time": 19,
			"data_ship_length": 4,
			"mooring_time": 87,
			"completion_time": 105,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 123,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 130,
			"completion_time": 150,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 151,
			"data_handling_time": 24,
			"data_ship_length": 8,
			"mooring_time": 151,
			"completion_time": 174,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 12,
			"data_handling_time": 19,
			"data_ship_length": 8,
			"mooring_time": 34,
			"completion_time": 52,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 50,
			"data_handling_time": 5,
			"data_ship_length": 6,
			"mooring_time": 64,
			"completion_time": 68,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 50,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 69,
			"completion_time": 85,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 70,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 70,
			"completion_time": 86,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 86,
			"data_handling_time": 16,
			"data_ship_length": 8,
			"mooring_time": 90,
			"completion_time": 105,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 96,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 109,
			"completion_time": 129,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 129,
			"data_handling_time": 16,
			"data_ship_length": 6,
			"mooring_time": 130,
			"completion_time": 145,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 47,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 48,
			"completion_time": 63,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 7,
			"data_handling_time": 15,
			"data_ship_length": 6,
			"mooring_time": 7,
			"completion_time": 21,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 34,
			"data_handling_time": 14,
			"data_ship_length": 6,
			"mooring_time": 34,
			"completion_time": 47,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 13,
			"data_handling_time": 17,
			"data_ship_length": 8,
			"mooring_time": 31,
			"completion_time": 47,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 113,
			"data_handling_time": 8,
			"data_ship_length": 7,
			"mooring_time": 151,
			"completion_time": 158,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 150,
			"data_handling_time": 24,
			"data_ship_length": 8,
			"mooring_time": 150,
			"completion_time": 173,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 54,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 54,
			"completion_time": 60,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 61,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 61,
			"completion_time": 67,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 52,
			"data_handling_time": 26,
			"data_ship_length": 4,
			"mooring_time": 52,
			"completion_time": 77,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 53,
			"data_handling_time": 35,
			"data_ship_length": 7,
			"mooring_time": 53,
			"completion_time": 87,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 83,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 90,
			"completion_time": 99,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 9,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 9,
			"completion_time": 21,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 57,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 78,
			"completion_time": 89,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 90,
			"data_handling_time": 24,
			"data_ship_length": 4,
			"mooring_time": 90,
			"completion_time": 113,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 107,
			"data_handling_time": 12,
			"data_ship_length": 3,
			"mooring_time": 107,
			"completion_time": 118,
			"mooring_berth": 26
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 116,
			"data_handling_time": 16,
			"data_ship_length": 3,
			"mooring_time": 116,
			"completion_time": 131,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 133,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 133,
			"completion_time": 145,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 148,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 159,
			"completion_time": 173,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 34,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 34,
			"completion_time": 46,
			"mooring_berth": 25
		}
	]
};
var bks_bcn_36A_5_default = {
	solver: "ti,rp,s,sgcp",
	makespan: 184,
	dual_bound: 184,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 104,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 118,
			"completion_time": 126,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 107,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 156,
			"completion_time": 168,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 77,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 130,
			"completion_time": 135,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 27,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 103,
			"completion_time": 117,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 70,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 92,
			"completion_time": 103,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 107,
			"data_handling_time": 26,
			"data_ship_length": 7,
			"mooring_time": 108,
			"completion_time": 133,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 135,
			"data_handling_time": 9,
			"data_ship_length": 5,
			"mooring_time": 154,
			"completion_time": 162,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 79,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 141,
			"completion_time": 156,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 11,
			"data_handling_time": 10,
			"data_ship_length": 8,
			"mooring_time": 62,
			"completion_time": 71,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 4,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 22,
			"completion_time": 41,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 45,
			"data_handling_time": 8,
			"data_ship_length": 6,
			"mooring_time": 77,
			"completion_time": 84,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 43,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 43,
			"completion_time": 57,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 50,
			"data_handling_time": 9,
			"data_ship_length": 7,
			"mooring_time": 52,
			"completion_time": 60,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 60,
			"data_handling_time": 27,
			"data_ship_length": 5,
			"mooring_time": 60,
			"completion_time": 86,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 61,
			"data_handling_time": 30,
			"data_ship_length": 8,
			"mooring_time": 61,
			"completion_time": 90,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 84,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 87,
			"completion_time": 102,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 165,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 165,
			"completion_time": 184,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 18,
			"data_handling_time": 21,
			"data_ship_length": 6,
			"mooring_time": 21,
			"completion_time": 41,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 53,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 53,
			"completion_time": 58,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 61,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 62,
			"completion_time": 76,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 85,
			"data_handling_time": 15,
			"data_ship_length": 6,
			"mooring_time": 85,
			"completion_time": 99,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 72,
			"data_handling_time": 36,
			"data_ship_length": 7,
			"mooring_time": 72,
			"completion_time": 107,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 121,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 163,
			"completion_time": 178,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 125,
			"data_handling_time": 22,
			"data_ship_length": 6,
			"mooring_time": 163,
			"completion_time": 184,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 129,
			"data_handling_time": 10,
			"data_ship_length": 6,
			"mooring_time": 154,
			"completion_time": 163,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 119,
			"data_handling_time": 12,
			"data_ship_length": 6,
			"mooring_time": 171,
			"completion_time": 182,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 159,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 169,
			"completion_time": 184,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 6,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 48,
			"completion_time": 61,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 23,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 23,
			"completion_time": 47,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 62,
			"data_handling_time": 4,
			"data_ship_length": 4,
			"mooring_time": 134,
			"completion_time": 137,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 102,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 111,
			"completion_time": 132,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 39,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 100,
			"completion_time": 110,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 105,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 136,
			"completion_time": 153,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 70,
			"data_handling_time": 10,
			"data_ship_length": 3,
			"mooring_time": 124,
			"completion_time": 133,
			"mooring_berth": 26
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 86,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 91,
			"completion_time": 105,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 133,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 139,
			"completion_time": 153,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 154,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 154,
			"completion_time": 170,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 53,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 136,
			"completion_time": 140,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 114,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 118,
			"completion_time": 123,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 102,
			"data_handling_time": 25,
			"data_ship_length": 6,
			"mooring_time": 106,
			"completion_time": 130,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 111,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 133,
			"completion_time": 153,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 100,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 105,
			"completion_time": 116,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 126,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 179,
			"completion_time": 184,
			"mooring_berth": 0
		}
	]
};
var bks_bcn_36A_6_default = {
	solver: "s",
	makespan: 176,
	dual_bound: 172.00000000000006,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 104,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 136,
			"completion_time": 144,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 149,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 169,
			"completion_time": 176,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 77,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 95,
			"completion_time": 100,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 151,
			"data_handling_time": 19,
			"data_ship_length": 4,
			"mooring_time": 158,
			"completion_time": 176,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 105,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 122,
			"completion_time": 135,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 56,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 60,
			"completion_time": 68,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 79,
			"data_handling_time": 16,
			"data_ship_length": 5,
			"mooring_time": 79,
			"completion_time": 94,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 53,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 53,
			"completion_time": 63,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 18,
			"data_handling_time": 21,
			"data_ship_length": 6,
			"mooring_time": 25,
			"completion_time": 45,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 53,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 54,
			"completion_time": 59,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 61,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 61,
			"completion_time": 75,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 85,
			"data_handling_time": 15,
			"data_ship_length": 6,
			"mooring_time": 92,
			"completion_time": 106,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 72,
			"data_handling_time": 36,
			"data_ship_length": 7,
			"mooring_time": 75,
			"completion_time": 110,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 121,
			"data_handling_time": 16,
			"data_ship_length": 4,
			"mooring_time": 124,
			"completion_time": 139,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 125,
			"data_handling_time": 22,
			"data_ship_length": 6,
			"mooring_time": 136,
			"completion_time": 157,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 140,
			"data_handling_time": 29,
			"data_ship_length": 4,
			"mooring_time": 140,
			"completion_time": 168,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 141,
			"data_handling_time": 32,
			"data_ship_length": 7,
			"mooring_time": 145,
			"completion_time": 176,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 7,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 7,
			"completion_time": 24,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 25,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 25,
			"completion_time": 36,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 48,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 48,
			"completion_time": 53,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 68,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 79,
			"completion_time": 91,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 97,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 101,
			"completion_time": 119,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 121,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 163,
			"completion_time": 176,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 138,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 142,
			"completion_time": 166,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 46,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 47,
			"completion_time": 53,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 129,
			"data_handling_time": 10,
			"data_ship_length": 6,
			"mooring_time": 132,
			"completion_time": 141,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 118,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 125,
			"completion_time": 135,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 39,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 39,
			"completion_time": 49,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 105,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 107,
			"completion_time": 124,
			"mooring_berth": 10
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 4,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 4,
			"completion_time": 16,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 22,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 23,
			"completion_time": 43,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 67,
			"data_handling_time": 7,
			"data_ship_length": 8,
			"mooring_time": 69,
			"completion_time": 75,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 76,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 76,
			"completion_time": 89,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 83,
			"data_handling_time": 21,
			"data_ship_length": 6,
			"mooring_time": 90,
			"completion_time": 110,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 53,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 53,
			"completion_time": 57,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 114,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 116,
			"completion_time": 121,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 102,
			"data_handling_time": 25,
			"data_ship_length": 6,
			"mooring_time": 111,
			"completion_time": 135,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 111,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 111,
			"completion_time": 131,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 158,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 167,
			"completion_time": 176,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 3,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 3,
			"completion_time": 22,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 28,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 53,
			"completion_time": 74,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 54,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 58,
			"completion_time": 66,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 64,
			"data_handling_time": 37,
			"data_ship_length": 4,
			"mooring_time": 64,
			"completion_time": 100,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 43,
			"data_arrival_time": 101,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 101,
			"completion_time": 115,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 44,
			"data_arrival_time": 131,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 136,
			"completion_time": 150,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 45,
			"data_arrival_time": 148,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 151,
			"completion_time": 162,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 46,
			"data_arrival_time": 40,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 44,
			"completion_time": 49,
			"mooring_berth": 17
		}
	]
};
var bks_bcn_36A_7_default = {
	solver: "rp",
	makespan: 186,
	dual_bound: 174,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 149,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 161,
			"completion_time": 168,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 105,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 106,
			"completion_time": 119,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 81,
			"data_handling_time": 26,
			"data_ship_length": 3,
			"mooring_time": 84,
			"completion_time": 109,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 111,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 151,
			"completion_time": 160,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 124,
			"data_handling_time": 18,
			"data_ship_length": 6,
			"mooring_time": 137,
			"completion_time": 154,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 56,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 102,
			"completion_time": 110,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 12,
			"data_handling_time": 28,
			"data_ship_length": 9,
			"mooring_time": 17,
			"completion_time": 44,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 53,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 56,
			"completion_time": 66,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 7,
			"data_handling_time": 18,
			"data_ship_length": 7,
			"mooring_time": 7,
			"completion_time": 24,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 25,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 25,
			"completion_time": 36,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 48,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 53,
			"completion_time": 58,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 68,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 68,
			"completion_time": 80,
			"mooring_berth": 3
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 97,
			"data_handling_time": 19,
			"data_ship_length": 5,
			"mooring_time": 104,
			"completion_time": 122,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 121,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 155,
			"completion_time": 168,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 138,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 155,
			"completion_time": 179,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 164,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 164,
			"completion_time": 174,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 1,
			"data_handling_time": 6,
			"data_ship_length": 6,
			"mooring_time": 1,
			"completion_time": 6,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 9,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 9,
			"completion_time": 21,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 24,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 37,
			"completion_time": 44,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 44,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 45,
			"completion_time": 55,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 57,
			"data_handling_time": 9,
			"data_ship_length": 5,
			"mooring_time": 65,
			"completion_time": 73,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 105,
			"data_handling_time": 31,
			"data_ship_length": 8,
			"mooring_time": 105,
			"completion_time": 135,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 136,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 136,
			"completion_time": 160,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 46,
			"data_handling_time": 7,
			"data_ship_length": 4,
			"mooring_time": 52,
			"completion_time": 58,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 118,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 129,
			"completion_time": 139,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 68,
			"data_handling_time": 7,
			"data_ship_length": 6,
			"mooring_time": 111,
			"completion_time": 117,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 108,
			"data_handling_time": 9,
			"data_ship_length": 7,
			"mooring_time": 120,
			"completion_time": 128,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 156,
			"data_handling_time": 9,
			"data_ship_length": 7,
			"mooring_time": 178,
			"completion_time": 186,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 90,
			"data_handling_time": 19,
			"data_ship_length": 6,
			"mooring_time": 118,
			"completion_time": 136,
			"mooring_berth": 23
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 4,
			"data_handling_time": 13,
			"data_ship_length": 7,
			"mooring_time": 4,
			"completion_time": 16,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 22,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 25,
			"completion_time": 45,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 67,
			"data_handling_time": 7,
			"data_ship_length": 8,
			"mooring_time": 74,
			"completion_time": 80,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 76,
			"data_handling_time": 14,
			"data_ship_length": 8,
			"mooring_time": 92,
			"completion_time": 105,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 83,
			"data_handling_time": 21,
			"data_ship_length": 6,
			"mooring_time": 83,
			"completion_time": 103,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 162,
			"data_handling_time": 7,
			"data_ship_length": 7,
			"mooring_time": 180,
			"completion_time": 186,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 42,
			"data_handling_time": 11,
			"data_ship_length": 8,
			"mooring_time": 45,
			"completion_time": 55,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 66,
			"data_handling_time": 13,
			"data_ship_length": 3,
			"mooring_time": 67,
			"completion_time": 79,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 57,
			"data_handling_time": 25,
			"data_ship_length": 8,
			"mooring_time": 59,
			"completion_time": 83,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 77,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 81,
			"completion_time": 91,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 83,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 84,
			"completion_time": 103,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 119,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 125,
			"completion_time": 135,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 3,
			"data_handling_time": 20,
			"data_ship_length": 4,
			"mooring_time": 3,
			"completion_time": 22,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 28,
			"data_handling_time": 22,
			"data_ship_length": 7,
			"mooring_time": 31,
			"completion_time": 52,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 43,
			"data_arrival_time": 54,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 56,
			"completion_time": 64,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 44,
			"data_arrival_time": 64,
			"data_handling_time": 37,
			"data_ship_length": 4,
			"mooring_time": 65,
			"completion_time": 101,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 45,
			"data_arrival_time": 101,
			"data_handling_time": 15,
			"data_ship_length": 4,
			"mooring_time": 140,
			"completion_time": 154,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 46,
			"data_arrival_time": 131,
			"data_handling_time": 15,
			"data_ship_length": 7,
			"mooring_time": 136,
			"completion_time": 150,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 47,
			"data_arrival_time": 148,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 175,
			"completion_time": 186,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 48,
			"data_arrival_time": 162,
			"data_handling_time": 8,
			"data_ship_length": 3,
			"mooring_time": 170,
			"completion_time": 177,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 49,
			"data_arrival_time": 3,
			"data_handling_time": 5,
			"data_ship_length": 3,
			"mooring_time": 3,
			"completion_time": 7,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 50,
			"data_arrival_time": 12,
			"data_handling_time": 19,
			"data_ship_length": 4,
			"mooring_time": 12,
			"completion_time": 30,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 51,
			"data_arrival_time": 26,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 56,
			"completion_time": 72,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 52,
			"data_arrival_time": 57,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 57,
			"completion_time": 64,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 53,
			"data_arrival_time": 109,
			"data_handling_time": 11,
			"data_ship_length": 3,
			"mooring_time": 109,
			"completion_time": 119,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 54,
			"data_arrival_time": 138,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 140,
			"completion_time": 150,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 55,
			"data_arrival_time": 147,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 151,
			"completion_time": 167,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 56,
			"data_arrival_time": 155,
			"data_handling_time": 9,
			"data_ship_length": 6,
			"mooring_time": 168,
			"completion_time": 176,
			"mooring_berth": 5
		},
		{
			"data_ship_id": 57,
			"data_arrival_time": 40,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 46,
			"completion_time": 51,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 58,
			"data_arrival_time": 150,
			"data_handling_time": 18,
			"data_ship_length": 8,
			"mooring_time": 169,
			"completion_time": 186,
			"mooring_berth": 21
		}
	]
};
var bks_bcn_36A_8_default = {
	solver: "sgcp",
	makespan: 178,
	dual_bound: 178,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 78,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 82,
			"completion_time": 87,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 81,
			"data_handling_time": 26,
			"data_ship_length": 3,
			"mooring_time": 83,
			"completion_time": 108,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 111,
			"data_handling_time": 10,
			"data_ship_length": 4,
			"mooring_time": 147,
			"completion_time": 156,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 163,
			"data_handling_time": 16,
			"data_ship_length": 3,
			"mooring_time": 163,
			"completion_time": 178,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 124,
			"data_handling_time": 18,
			"data_ship_length": 6,
			"mooring_time": 129,
			"completion_time": 146,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 12,
			"data_handling_time": 28,
			"data_ship_length": 9,
			"mooring_time": 12,
			"completion_time": 39,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 166,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 167,
			"completion_time": 178,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 25,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 25,
			"completion_time": 36,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 1,
			"data_handling_time": 6,
			"data_ship_length": 6,
			"mooring_time": 40,
			"completion_time": 45,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 9,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 11,
			"completion_time": 23,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 24,
			"data_handling_time": 8,
			"data_ship_length": 5,
			"mooring_time": 58,
			"completion_time": 65,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 44,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 51,
			"completion_time": 61,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 57,
			"data_handling_time": 9,
			"data_ship_length": 5,
			"mooring_time": 62,
			"completion_time": 70,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 105,
			"data_handling_time": 31,
			"data_ship_length": 8,
			"mooring_time": 107,
			"completion_time": 137,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 136,
			"data_handling_time": 25,
			"data_ship_length": 7,
			"mooring_time": 138,
			"completion_time": 162,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 11,
			"data_handling_time": 23,
			"data_ship_length": 9,
			"mooring_time": 11,
			"completion_time": 33,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 85,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 163,
			"completion_time": 168,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 69,
			"data_handling_time": 30,
			"data_ship_length": 5,
			"mooring_time": 71,
			"completion_time": 100,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 108,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 108,
			"completion_time": 127,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 132,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 161,
			"completion_time": 178,
			"mooring_berth": 3
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 68,
			"data_handling_time": 7,
			"data_ship_length": 6,
			"mooring_time": 75,
			"completion_time": 81,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 108,
			"data_handling_time": 9,
			"data_ship_length": 7,
			"mooring_time": 120,
			"completion_time": 128,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 156,
			"data_handling_time": 9,
			"data_ship_length": 7,
			"mooring_time": 170,
			"completion_time": 178,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 90,
			"data_handling_time": 19,
			"data_ship_length": 6,
			"mooring_time": 101,
			"completion_time": 119,
			"mooring_berth": 16
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 17,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 40,
			"completion_time": 50,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 42,
			"data_handling_time": 11,
			"data_ship_length": 8,
			"mooring_time": 46,
			"completion_time": 56,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 66,
			"data_handling_time": 13,
			"data_ship_length": 3,
			"mooring_time": 66,
			"completion_time": 78,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 57,
			"data_handling_time": 25,
			"data_ship_length": 8,
			"mooring_time": 57,
			"completion_time": 81,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 77,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 82,
			"completion_time": 92,
			"mooring_berth": 3
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 83,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 88,
			"completion_time": 107,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 119,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 147,
			"completion_time": 157,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 111,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 111,
			"completion_time": 131,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 3,
			"data_handling_time": 5,
			"data_ship_length": 3,
			"mooring_time": 165,
			"completion_time": 169,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 12,
			"data_handling_time": 19,
			"data_ship_length": 4,
			"mooring_time": 12,
			"completion_time": 30,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 26,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 34,
			"completion_time": 50,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 57,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 71,
			"completion_time": 78,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 109,
			"data_handling_time": 11,
			"data_ship_length": 3,
			"mooring_time": 128,
			"completion_time": 138,
			"mooring_berth": 26
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 138,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 168,
			"completion_time": 178,
			"mooring_berth": 24
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 147,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 151,
			"completion_time": 167,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 155,
			"data_handling_time": 9,
			"data_ship_length": 6,
			"mooring_time": 158,
			"completion_time": 166,
			"mooring_berth": 19
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 40,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 40,
			"completion_time": 57,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 60,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 158,
			"completion_time": 165,
			"mooring_berth": 14
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 36,
			"data_handling_time": 38,
			"data_ship_length": 9,
			"mooring_time": 37,
			"completion_time": 74,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 43,
			"data_arrival_time": 77,
			"data_handling_time": 28,
			"data_ship_length": 8,
			"mooring_time": 79,
			"completion_time": 106,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 44,
			"data_arrival_time": 93,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 93,
			"completion_time": 109,
			"mooring_berth": 3
		},
		{
			"data_ship_id": 45,
			"data_arrival_time": 101,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 129,
			"completion_time": 146,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 46,
			"data_arrival_time": 121,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 139,
			"completion_time": 149,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 47,
			"data_arrival_time": 130,
			"data_handling_time": 29,
			"data_ship_length": 7,
			"mooring_time": 132,
			"completion_time": 160,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 48,
			"data_arrival_time": 163,
			"data_handling_time": 13,
			"data_ship_length": 5,
			"mooring_time": 166,
			"completion_time": 178,
			"mooring_berth": 14
		}
	]
};
var bks_bcn_36A_9_default = {
	solver: "sgcp,rp,ti",
	makespan: 197,
	dual_bound: 197,
	ships: [
		{
			"data_ship_id": 0,
			"data_arrival_time": 78,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 107,
			"completion_time": 112,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 1,
			"data_arrival_time": 5,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 34,
			"completion_time": 40,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 2,
			"data_arrival_time": 58,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 192,
			"completion_time": 197,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 3,
			"data_arrival_time": 59,
			"data_handling_time": 13,
			"data_ship_length": 4,
			"mooring_time": 180,
			"completion_time": 192,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 4,
			"data_arrival_time": 122,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 167,
			"completion_time": 178,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 5,
			"data_arrival_time": 126,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 154,
			"completion_time": 162,
			"mooring_berth": 9
		},
		{
			"data_ship_id": 6,
			"data_arrival_time": 33,
			"data_handling_time": 23,
			"data_ship_length": 6,
			"mooring_time": 88,
			"completion_time": 110,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 7,
			"data_arrival_time": 90,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 142,
			"completion_time": 152,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 8,
			"data_arrival_time": 25,
			"data_handling_time": 12,
			"data_ship_length": 5,
			"mooring_time": 76,
			"completion_time": 87,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 9,
			"data_arrival_time": 73,
			"data_handling_time": 6,
			"data_ship_length": 5,
			"mooring_time": 107,
			"completion_time": 112,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 10,
			"data_arrival_time": 11,
			"data_handling_time": 23,
			"data_ship_length": 9,
			"mooring_time": 15,
			"completion_time": 37,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 11,
			"data_arrival_time": 85,
			"data_handling_time": 6,
			"data_ship_length": 4,
			"mooring_time": 184,
			"completion_time": 189,
			"mooring_berth": 17
		},
		{
			"data_ship_id": 12,
			"data_arrival_time": 69,
			"data_handling_time": 30,
			"data_ship_length": 5,
			"mooring_time": 70,
			"completion_time": 99,
			"mooring_berth": 6
		},
		{
			"data_ship_id": 13,
			"data_arrival_time": 108,
			"data_handling_time": 20,
			"data_ship_length": 7,
			"mooring_time": 113,
			"completion_time": 132,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 14,
			"data_arrival_time": 132,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 136,
			"completion_time": 153,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 15,
			"data_arrival_time": 162,
			"data_handling_time": 7,
			"data_ship_length": 5,
			"mooring_time": 180,
			"completion_time": 186,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 16,
			"data_arrival_time": 15,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 15,
			"completion_time": 35,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 17,
			"data_arrival_time": 27,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 42,
			"completion_time": 62,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 18,
			"data_arrival_time": 38,
			"data_handling_time": 15,
			"data_ship_length": 5,
			"mooring_time": 41,
			"completion_time": 55,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 19,
			"data_arrival_time": 50,
			"data_handling_time": 11,
			"data_ship_length": 7,
			"mooring_time": 119,
			"completion_time": 129,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 20,
			"data_arrival_time": 56,
			"data_handling_time": 11,
			"data_ship_length": 5,
			"mooring_time": 187,
			"completion_time": 197,
			"mooring_berth": 8
		},
		{
			"data_ship_id": 21,
			"data_arrival_time": 62,
			"data_handling_time": 25,
			"data_ship_length": 5,
			"mooring_time": 63,
			"completion_time": 87,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 22,
			"data_arrival_time": 110,
			"data_handling_time": 9,
			"data_ship_length": 6,
			"mooring_time": 133,
			"completion_time": 141,
			"mooring_berth": 12
		},
		{
			"data_ship_id": 23,
			"data_arrival_time": 17,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 118,
			"completion_time": 128,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 24,
			"data_arrival_time": 13,
			"data_handling_time": 12,
			"data_ship_length": 7,
			"mooring_time": 13,
			"completion_time": 24,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 25,
			"data_arrival_time": 140,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 159,
			"completion_time": 179,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 26,
			"data_arrival_time": 111,
			"data_handling_time": 21,
			"data_ship_length": 7,
			"mooring_time": 111,
			"completion_time": 131,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 27,
			"data_arrival_time": 16,
			"data_handling_time": 16,
			"data_ship_length": 7,
			"mooring_time": 62,
			"completion_time": 77,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 28,
			"data_arrival_time": 47,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 75,
			"completion_time": 88,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 29,
			"data_arrival_time": 76,
			"data_handling_time": 29,
			"data_ship_length": 8,
			"mooring_time": 89,
			"completion_time": 117,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 30,
			"data_arrival_time": 40,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 106,
			"completion_time": 123,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 31,
			"data_arrival_time": 60,
			"data_handling_time": 8,
			"data_ship_length": 4,
			"mooring_time": 158,
			"completion_time": 165,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 32,
			"data_arrival_time": 36,
			"data_handling_time": 38,
			"data_ship_length": 9,
			"mooring_time": 36,
			"completion_time": 73,
			"mooring_berth": 20
		},
		{
			"data_ship_id": 33,
			"data_arrival_time": 77,
			"data_handling_time": 28,
			"data_ship_length": 8,
			"mooring_time": 79,
			"completion_time": 106,
			"mooring_berth": 11
		},
		{
			"data_ship_id": 34,
			"data_arrival_time": 93,
			"data_handling_time": 17,
			"data_ship_length": 4,
			"mooring_time": 181,
			"completion_time": 197,
			"mooring_berth": 13
		},
		{
			"data_ship_id": 35,
			"data_arrival_time": 101,
			"data_handling_time": 18,
			"data_ship_length": 4,
			"mooring_time": 180,
			"completion_time": 197,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 36,
			"data_arrival_time": 121,
			"data_handling_time": 11,
			"data_ship_length": 4,
			"mooring_time": 132,
			"completion_time": 142,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 37,
			"data_arrival_time": 130,
			"data_handling_time": 29,
			"data_ship_length": 7,
			"mooring_time": 130,
			"completion_time": 158,
			"mooring_berth": 22
		},
		{
			"data_ship_id": 38,
			"data_arrival_time": 153,
			"data_handling_time": 45,
			"data_ship_length": 4,
			"mooring_time": 153,
			"completion_time": 197,
			"mooring_berth": 4
		},
		{
			"data_ship_id": 39,
			"data_arrival_time": 31,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 56,
			"completion_time": 69,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 40,
			"data_arrival_time": 63,
			"data_handling_time": 9,
			"data_ship_length": 4,
			"mooring_time": 183,
			"completion_time": 191,
			"mooring_berth": 21
		},
		{
			"data_ship_id": 41,
			"data_arrival_time": 96,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 124,
			"completion_time": 135,
			"mooring_berth": 7
		},
		{
			"data_ship_id": 42,
			"data_arrival_time": 104,
			"data_handling_time": 14,
			"data_ship_length": 4,
			"mooring_time": 144,
			"completion_time": 157,
			"mooring_berth": 0
		},
		{
			"data_ship_id": 43,
			"data_arrival_time": 125,
			"data_handling_time": 12,
			"data_ship_length": 4,
			"mooring_time": 129,
			"completion_time": 140,
			"mooring_berth": 18
		},
		{
			"data_ship_id": 44,
			"data_arrival_time": 142,
			"data_handling_time": 39,
			"data_ship_length": 7,
			"mooring_time": 142,
			"completion_time": 180,
			"mooring_berth": 15
		},
		{
			"data_ship_id": 45,
			"data_arrival_time": 67,
			"data_handling_time": 5,
			"data_ship_length": 4,
			"mooring_time": 193,
			"completion_time": 197,
			"mooring_berth": 25
		},
		{
			"data_ship_id": 46,
			"data_arrival_time": 107,
			"data_handling_time": 17,
			"data_ship_length": 7,
			"mooring_time": 163,
			"completion_time": 179,
			"mooring_berth": 8
		}
	]
};
var instances = /* #__PURE__ */ Object.assign({
	"../../../data/barcelona/weeks/bcn_24B_10.json": bcn_24B_10_default,
	"../../../data/barcelona/weeks/bcn_24B_11.json": bcn_24B_11_default,
	"../../../data/barcelona/weeks/bcn_24B_12.json": bcn_24B_12_default,
	"../../../data/barcelona/weeks/bcn_24B_13.json": bcn_24B_13_default,
	"../../../data/barcelona/weeks/bcn_24B_14.json": bcn_24B_14_default,
	"../../../data/barcelona/weeks/bcn_24B_15.json": bcn_24B_15_default,
	"../../../data/barcelona/weeks/bcn_24B_16.json": bcn_24B_16_default,
	"../../../data/barcelona/weeks/bcn_24B_17.json": bcn_24B_17_default,
	"../../../data/barcelona/weeks/bcn_24B_18.json": bcn_24B_18_default,
	"../../../data/barcelona/weeks/bcn_24B_19.json": bcn_24B_19_default,
	"../../../data/barcelona/weeks/bcn_24B_2.json": bcn_24B_2_default,
	"../../../data/barcelona/weeks/bcn_24B_20.json": bcn_24B_20_default,
	"../../../data/barcelona/weeks/bcn_24B_21.json": bcn_24B_21_default,
	"../../../data/barcelona/weeks/bcn_24B_22.json": bcn_24B_22_default,
	"../../../data/barcelona/weeks/bcn_24B_23.json": bcn_24B_23_default,
	"../../../data/barcelona/weeks/bcn_24B_24.json": bcn_24B_24_default,
	"../../../data/barcelona/weeks/bcn_24B_25.json": bcn_24B_25_default,
	"../../../data/barcelona/weeks/bcn_24B_26.json": bcn_24B_26_default,
	"../../../data/barcelona/weeks/bcn_24B_27.json": bcn_24B_27_default,
	"../../../data/barcelona/weeks/bcn_24B_28.json": bcn_24B_28_default,
	"../../../data/barcelona/weeks/bcn_24B_29.json": bcn_24B_29_default,
	"../../../data/barcelona/weeks/bcn_24B_3.json": bcn_24B_3_default,
	"../../../data/barcelona/weeks/bcn_24B_30.json": bcn_24B_30_default,
	"../../../data/barcelona/weeks/bcn_24B_31.json": bcn_24B_31_default,
	"../../../data/barcelona/weeks/bcn_24B_32.json": bcn_24B_32_default,
	"../../../data/barcelona/weeks/bcn_24B_33.json": bcn_24B_33_default,
	"../../../data/barcelona/weeks/bcn_24B_34.json": bcn_24B_34_default,
	"../../../data/barcelona/weeks/bcn_24B_35.json": bcn_24B_35_default,
	"../../../data/barcelona/weeks/bcn_24B_36.json": bcn_24B_36_default,
	"../../../data/barcelona/weeks/bcn_24B_37.json": bcn_24B_37_default,
	"../../../data/barcelona/weeks/bcn_24B_38.json": bcn_24B_38_default,
	"../../../data/barcelona/weeks/bcn_24B_39.json": bcn_24B_39_default,
	"../../../data/barcelona/weeks/bcn_24B_4.json": bcn_24B_4_default,
	"../../../data/barcelona/weeks/bcn_24B_40.json": bcn_24B_40_default,
	"../../../data/barcelona/weeks/bcn_24B_41.json": bcn_24B_41_default,
	"../../../data/barcelona/weeks/bcn_24B_42.json": bcn_24B_42_default,
	"../../../data/barcelona/weeks/bcn_24B_43.json": bcn_24B_43_default,
	"../../../data/barcelona/weeks/bcn_24B_44.json": bcn_24B_44_default,
	"../../../data/barcelona/weeks/bcn_24B_45.json": bcn_24B_45_default,
	"../../../data/barcelona/weeks/bcn_24B_46.json": bcn_24B_46_default,
	"../../../data/barcelona/weeks/bcn_24B_47.json": bcn_24B_47_default,
	"../../../data/barcelona/weeks/bcn_24B_48.json": bcn_24B_48_default,
	"../../../data/barcelona/weeks/bcn_24B_49.json": bcn_24B_49_default,
	"../../../data/barcelona/weeks/bcn_24B_5.json": bcn_24B_5_default,
	"../../../data/barcelona/weeks/bcn_24B_50.json": bcn_24B_50_default,
	"../../../data/barcelona/weeks/bcn_24B_6.json": bcn_24B_6_default,
	"../../../data/barcelona/weeks/bcn_24B_7.json": bcn_24B_7_default,
	"../../../data/barcelona/weeks/bcn_24B_8.json": bcn_24B_8_default,
	"../../../data/barcelona/weeks/bcn_24B_9.json": bcn_24B_9_default,
	"../../../data/barcelona/weeks/bcn_36A_10.json": bcn_36A_10_default,
	"../../../data/barcelona/weeks/bcn_36A_11.json": bcn_36A_11_default,
	"../../../data/barcelona/weeks/bcn_36A_12.json": bcn_36A_12_default,
	"../../../data/barcelona/weeks/bcn_36A_13.json": bcn_36A_13_default,
	"../../../data/barcelona/weeks/bcn_36A_14.json": bcn_36A_14_default,
	"../../../data/barcelona/weeks/bcn_36A_15.json": bcn_36A_15_default,
	"../../../data/barcelona/weeks/bcn_36A_16.json": bcn_36A_16_default,
	"../../../data/barcelona/weeks/bcn_36A_17.json": bcn_36A_17_default,
	"../../../data/barcelona/weeks/bcn_36A_18.json": bcn_36A_18_default,
	"../../../data/barcelona/weeks/bcn_36A_19.json": bcn_36A_19_default,
	"../../../data/barcelona/weeks/bcn_36A_2.json": bcn_36A_2_default,
	"../../../data/barcelona/weeks/bcn_36A_20.json": bcn_36A_20_default,
	"../../../data/barcelona/weeks/bcn_36A_21.json": bcn_36A_21_default,
	"../../../data/barcelona/weeks/bcn_36A_22.json": bcn_36A_22_default,
	"../../../data/barcelona/weeks/bcn_36A_23.json": bcn_36A_23_default,
	"../../../data/barcelona/weeks/bcn_36A_24.json": bcn_36A_24_default,
	"../../../data/barcelona/weeks/bcn_36A_25.json": bcn_36A_25_default,
	"../../../data/barcelona/weeks/bcn_36A_26.json": bcn_36A_26_default,
	"../../../data/barcelona/weeks/bcn_36A_27.json": bcn_36A_27_default,
	"../../../data/barcelona/weeks/bcn_36A_28.json": bcn_36A_28_default,
	"../../../data/barcelona/weeks/bcn_36A_29.json": bcn_36A_29_default,
	"../../../data/barcelona/weeks/bcn_36A_3.json": bcn_36A_3_default,
	"../../../data/barcelona/weeks/bcn_36A_30.json": bcn_36A_30_default,
	"../../../data/barcelona/weeks/bcn_36A_31.json": bcn_36A_31_default,
	"../../../data/barcelona/weeks/bcn_36A_32.json": bcn_36A_32_default,
	"../../../data/barcelona/weeks/bcn_36A_33.json": bcn_36A_33_default,
	"../../../data/barcelona/weeks/bcn_36A_34.json": bcn_36A_34_default,
	"../../../data/barcelona/weeks/bcn_36A_35.json": bcn_36A_35_default,
	"../../../data/barcelona/weeks/bcn_36A_36.json": bcn_36A_36_default,
	"../../../data/barcelona/weeks/bcn_36A_37.json": bcn_36A_37_default,
	"../../../data/barcelona/weeks/bcn_36A_38.json": bcn_36A_38_default,
	"../../../data/barcelona/weeks/bcn_36A_39.json": bcn_36A_39_default,
	"../../../data/barcelona/weeks/bcn_36A_4.json": bcn_36A_4_default,
	"../../../data/barcelona/weeks/bcn_36A_40.json": bcn_36A_40_default,
	"../../../data/barcelona/weeks/bcn_36A_41.json": bcn_36A_41_default,
	"../../../data/barcelona/weeks/bcn_36A_42.json": bcn_36A_42_default,
	"../../../data/barcelona/weeks/bcn_36A_43.json": bcn_36A_43_default,
	"../../../data/barcelona/weeks/bcn_36A_44.json": bcn_36A_44_default,
	"../../../data/barcelona/weeks/bcn_36A_45.json": bcn_36A_45_default,
	"../../../data/barcelona/weeks/bcn_36A_46.json": bcn_36A_46_default,
	"../../../data/barcelona/weeks/bcn_36A_47.json": bcn_36A_47_default,
	"../../../data/barcelona/weeks/bcn_36A_48.json": bcn_36A_48_default,
	"../../../data/barcelona/weeks/bcn_36A_49.json": bcn_36A_49_default,
	"../../../data/barcelona/weeks/bcn_36A_5.json": bcn_36A_5_default,
	"../../../data/barcelona/weeks/bcn_36A_50.json": bcn_36A_50_default,
	"../../../data/barcelona/weeks/bcn_36A_6.json": bcn_36A_6_default,
	"../../../data/barcelona/weeks/bcn_36A_7.json": bcn_36A_7_default,
	"../../../data/barcelona/weeks/bcn_36A_8.json": bcn_36A_8_default,
	"../../../data/barcelona/weeks/bcn_36A_9.json": bcn_36A_9_default
});
var plans = /* #__PURE__ */ Object.assign({
	"../../../data/barcelona/weeks/bks-bcn_24B_10.json": bks_bcn_24B_10_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_11.json": bks_bcn_24B_11_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_12.json": bks_bcn_24B_12_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_13.json": bks_bcn_24B_13_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_14.json": bks_bcn_24B_14_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_15.json": bks_bcn_24B_15_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_16.json": bks_bcn_24B_16_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_17.json": bks_bcn_24B_17_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_18.json": bks_bcn_24B_18_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_19.json": bks_bcn_24B_19_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_2.json": bks_bcn_24B_2_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_20.json": bks_bcn_24B_20_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_21.json": bks_bcn_24B_21_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_22.json": bks_bcn_24B_22_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_23.json": bks_bcn_24B_23_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_24.json": bks_bcn_24B_24_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_25.json": bks_bcn_24B_25_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_26.json": bks_bcn_24B_26_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_27.json": bks_bcn_24B_27_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_28.json": bks_bcn_24B_28_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_29.json": bks_bcn_24B_29_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_3.json": bks_bcn_24B_3_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_30.json": bks_bcn_24B_30_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_31.json": bks_bcn_24B_31_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_32.json": bks_bcn_24B_32_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_33.json": bks_bcn_24B_33_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_34.json": bks_bcn_24B_34_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_35.json": bks_bcn_24B_35_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_36.json": bks_bcn_24B_36_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_37.json": bks_bcn_24B_37_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_38.json": bks_bcn_24B_38_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_39.json": bks_bcn_24B_39_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_4.json": bks_bcn_24B_4_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_40.json": bks_bcn_24B_40_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_41.json": bks_bcn_24B_41_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_42.json": bks_bcn_24B_42_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_43.json": bks_bcn_24B_43_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_44.json": bks_bcn_24B_44_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_45.json": bks_bcn_24B_45_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_46.json": bks_bcn_24B_46_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_47.json": bks_bcn_24B_47_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_48.json": bks_bcn_24B_48_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_49.json": bks_bcn_24B_49_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_5.json": bks_bcn_24B_5_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_50.json": bks_bcn_24B_50_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_6.json": bks_bcn_24B_6_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_7.json": bks_bcn_24B_7_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_8.json": bks_bcn_24B_8_default,
	"../../../data/barcelona/weeks/bks-bcn_24B_9.json": bks_bcn_24B_9_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_10.json": bks_bcn_36A_10_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_11.json": bks_bcn_36A_11_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_12.json": bks_bcn_36A_12_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_13.json": bks_bcn_36A_13_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_14.json": bks_bcn_36A_14_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_15.json": bks_bcn_36A_15_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_16.json": bks_bcn_36A_16_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_17.json": bks_bcn_36A_17_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_18.json": bks_bcn_36A_18_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_19.json": bks_bcn_36A_19_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_2.json": bks_bcn_36A_2_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_20.json": bks_bcn_36A_20_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_21.json": bks_bcn_36A_21_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_22.json": bks_bcn_36A_22_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_23.json": bks_bcn_36A_23_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_24.json": bks_bcn_36A_24_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_25.json": bks_bcn_36A_25_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_26.json": bks_bcn_36A_26_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_27.json": bks_bcn_36A_27_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_28.json": bks_bcn_36A_28_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_29.json": bks_bcn_36A_29_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_3.json": bks_bcn_36A_3_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_30.json": bks_bcn_36A_30_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_31.json": bks_bcn_36A_31_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_32.json": bks_bcn_36A_32_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_33.json": bks_bcn_36A_33_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_34.json": bks_bcn_36A_34_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_35.json": bks_bcn_36A_35_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_36.json": bks_bcn_36A_36_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_37.json": bks_bcn_36A_37_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_38.json": bks_bcn_36A_38_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_39.json": bks_bcn_36A_39_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_4.json": bks_bcn_36A_4_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_40.json": bks_bcn_36A_40_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_41.json": bks_bcn_36A_41_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_42.json": bks_bcn_36A_42_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_43.json": bks_bcn_36A_43_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_44.json": bks_bcn_36A_44_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_45.json": bks_bcn_36A_45_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_46.json": bks_bcn_36A_46_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_47.json": bks_bcn_36A_47_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_48.json": bks_bcn_36A_48_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_49.json": bks_bcn_36A_49_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_5.json": bks_bcn_36A_5_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_50.json": bks_bcn_36A_50_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_6.json": bks_bcn_36A_6_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_7.json": bks_bcn_36A_7_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_8.json": bks_bcn_36A_8_default,
	"../../../data/barcelona/weeks/bks-bcn_36A_9.json": bks_bcn_36A_9_default
});
function base(path) {
	return path.replace(/\\/g, "/").split("/").pop() ?? path;
}
function loadAll() {
	const planByName = /* @__PURE__ */ new Map();
	for (const [path, mod] of Object.entries(plans)) planByName.set(base(path), mod);
	const out = [];
	for (const [path, inst] of Object.entries(instances)) {
		const file = base(path);
		const match = file.match(/^bcn_(24B|36A)_(\d+)\.json$/);
		if (!match?.[1] || !match[2]) continue;
		const quay = match[1];
		const week = Number(match[2]);
		const bksFile = `bks-${file}`;
		const bks = planByName.get(bksFile);
		if (!bks) continue;
		const loaded = tryPublishedYard(`bcn-${quay}-${week}`, quay, week, file, bksFile, inst, bks);
		if (!loaded) continue;
		out.push(loaded);
	}
	out.sort((a, b) => a.info.quay === b.info.quay ? a.info.week - b.info.week : a.info.quay < b.info.quay ? -1 : 1);
	return out;
}
var ALL = loadAll();
/** Every paired week file. The yard is the published plan, not a solved one. */
function clientWeekList() {
	return ALL.map((row) => row.info);
}
function clientYard(id) {
	return ALL.find((row) => row.info.id === id)?.yard ?? null;
}
function hours(n) {
	if (n == null) return "—";
	return `${n} h`;
}
function firstFree(row) {
	if (row.firstWait == null) return "—";
	const berth = row.firstDock?.replace(/^B/, "");
	return berth ? `${berth} · ${row.firstWait} h` : `${row.firstWait} h`;
}
/** Every call in the published week, with the one-hour probe from solve(). */
function PublishedLedger() {
	const yard = useBoardStore((s) => s.yard);
	const selectedId = useBoardStore((s) => s.selectedId);
	const listed = (0, import_react.useMemo)(() => publishedWeekList(), []);
	const [weeks, setWeeks] = (0, import_react.useState)(listed);
	const [catalogReady, setCatalogReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const full = clientWeekList();
		if (full.length) setWeeks(full);
		setCatalogReady(true);
	}, []);
	const week = weeks.find((row) => row.id === yard.id) ?? listed.find((row) => row.id === yard.id);
	const known = listed.some((row) => row.id === yard.id);
	const staticYard = (0, import_react.useMemo)(() => known ? publishedYard(yard.id) : null, [known, yard.id]);
	const pristine = (catalogReady ? clientYard(yard.id) : null) ?? staticYard;
	const scores = (0, import_react.useMemo)(() => yard.timeUnit === "hour" && pristine ? scoreOneHourLate(pristine) : [], [yard.timeUnit, pristine]);
	if (yard.timeUnit !== "hour" || !week || !pristine) return null;
	const stay = scores.filter((row) => row.matchesBooked).length;
	const beat = scores.filter((row) => (row.versusBooked ?? 0) > 0).length;
	const versusSum = scores.reduce((sum, row) => sum + Math.max(0, row.versusBooked ?? 0), 0);
	const movedSum = scores.reduce((sum, row) => sum + (row.moved ?? 0), 0);
	const leftmostSum = scores.reduce((sum, row) => sum + (row.saved ?? 0), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-4 overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-line",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b border-line px-4 py-3 sm:px-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-wide text-faint",
					children: "Published calls"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mt-1 text-base font-semibold tracking-tight",
					children: [
						"Same question on every call · quay ",
						week.quay,
						" · week ",
						week.week
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 flex max-w-full flex-col gap-1 text-xs text-faint",
					children: ["Published week", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						"data-week-select": "",
						value: yard.id,
						onChange: (e) => {
							const next = clientYard(e.target.value);
							if (next) useBoardStore.getState().openBuiltYard(next);
						},
						className: "h-9 max-w-full rounded-lg bg-bg px-2 text-sm text-fg ring-1 ring-line",
						children: weeks.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: row.id,
							children: [
								row.quay,
								" · week ",
								row.week,
								" · ",
								row.ships,
								" calls"
							]
						}, row.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 max-w-3xl text-sm text-muted",
					"data-cite": PUBLISHED_DOI,
					children: [
						"Quay ",
						week.quay,
						", week ",
						week.week,
						" of 2024. Port of Barcelona container calls, one-hour periods, Alberto Santini (DOI ",
						PUBLISHED_DOI,
						"). The blocks are the published plan in ",
						week.file,
						" and ",
						week.bksFile,
						". ",
						weeks.length,
						" weeks, quays 24B and 36A, weeks 2–50.",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "text-accent underline",
							href: PUBLISHED_DOI_URL,
							target: "_blank",
							rel: "noreferrer",
							children: PUBLISHED_DOI
						}),
						" · ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "text-accent underline",
							href: PUBLISHED_REPO,
							target: "_blank",
							rel: "noreferrer",
							children: "source repository"
						}),
						". ship_len is consecutive berths. The file has no cargo or equipment field, so the solver does not reject a berth for either."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 max-w-3xl text-sm text-muted",
					children: [
						"Versus booked is solve() for that call one hour after its published mooring, compared with the same solve() forced onto the booked berth. Leftmost gap is the first section that can take the call, which is a different question. Saved at the next call uses the hour the next ship on those sections starts. A dash means no later ship uses them. This week at +1h: ",
						scores.length,
						" calls. ",
						stay,
						" stay on the booked berth. ",
						beat,
						" beat staying, ",
						versusSum,
						" h together, ",
						movedSum,
						" other calls moved. Leftmost-section gap: ",
						leftmostSum,
						" h. The file's makespan is the latest completion hour and is not either total."
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[52rem] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-xs text-faint",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-line",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2 font-medium",
								children: "Call"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Arrives"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Moors"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "File wait"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Berth"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Length"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Work"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Versus booked"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Leftmost gap"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "First free"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Next call"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Saved then"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Plan"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Moved"
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: scores.map((row) => {
					const fileWait = row.moor - row.arrival;
					const open = row.id === selectedId;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						"data-ship": row.id,
						"data-saved": row.saved ?? "",
						"data-versus-booked": row.versusBooked ?? "",
						"data-arrival": row.arrival,
						"data-moor": row.moor,
						"data-berth": row.berth,
						"data-len": row.len,
						"data-handling": row.handling,
						"data-first-dock": row.firstDock ?? "",
						"data-next-eta": row.nextEta ?? "",
						"data-next-saved": row.nextSaved ?? "",
						"aria-selected": open,
						onClick: () => useBoardStore.getState().setSelectedId(row.id),
						className: cn("cursor-pointer border-b border-line/80 hover:bg-raised/70", open && "bg-accent/10"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5 font-mono font-medium tabular-nums",
								children: row.id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-2.5 font-mono tabular-nums",
								children: [row.arrival, "h"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-2.5 font-mono tabular-nums",
								children: [row.moor, "h"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-2.5 font-mono tabular-nums",
								children: [fileWait, "h"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2.5 font-mono tabular-nums",
								children: row.berth.replace(/^B/, "")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2.5 font-mono tabular-nums",
								children: row.len
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-2.5 font-mono tabular-nums",
								children: [row.handling, "h"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: cn("px-3 py-2.5 font-mono tabular-nums", (row.versusBooked ?? 0) > 0 ? "text-ok" : "text-muted"),
								children: hours(row.versusBooked)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2.5 font-mono tabular-nums text-muted",
								children: hours(row.saved)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2.5 font-mono tabular-nums text-muted",
								children: firstFree(row)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2.5 font-mono tabular-nums text-muted",
								children: row.nextEta == null ? "—" : `${row.nextEta}h`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: cn("px-3 py-2.5 font-mono tabular-nums", (row.nextSaved ?? 0) > 0 ? "text-ok" : "text-muted"),
								children: hours(row.nextSaved)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2.5 font-mono tabular-nums",
								children: row.dock?.replace(/^B/, "") ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2.5 font-mono tabular-nums",
								children: row.moved ?? "—"
							})
						]
					}, row.id);
				}) })]
			})
		})]
	});
}
function Roster({ yard, live, trace, clockMin, eventTruckId, selectedId, onSelect }) {
	const trucks = new Map(yard.trucks.map((t) => [t.id, t]));
	const orig = new Map(yard.appointments.map((a) => [a.truckId, a]));
	const diff = diffAppointments(yard.appointments, live);
	const flowBy = new Map(trace.trucks.map((f) => [f.truckId, f]));
	const rows = [...live].sort((a, b) => a.startMin - b.startMin || a.dockId.localeCompare(b.dockId));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-gantt text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "sticky top-0 bg-surface text-xs text-faint",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Plate"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Hauler"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Door"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Window"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Cargo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Now"
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((a) => {
				const t = trucks.get(a.truckId);
				if (!t) return null;
				const o = orig.get(a.truckId);
				const moved = diff.has(a.truckId);
				const late = a.truckId === eventTruckId;
				const flow = flowBy.get(a.truckId);
				const phase = flow ? phaseAt(flow, Math.round(clockMin)) : "—";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					onClick: () => onSelect(a.truckId),
					className: cn("cursor-pointer border-b border-line/80 hover:bg-raised/70", a.truckId === selectedId && "bg-raised"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 font-mono tabular-nums",
							children: [
								t.plate,
								late ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 rounded-md bg-warn/15 px-1.5 py-0.5 text-xs text-warn",
									children: "late"
								}) : null,
								moved && !late ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 rounded-md bg-raised px-1.5 py-0.5 text-xs text-muted",
									children: "moved"
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted",
							children: t.hauler
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 font-mono tabular-nums",
							children: [a.dockId.replace("D", ""), o && o.dockId !== a.dockId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-1 text-faint",
								children: ["←", o.dockId.replace("D", "")]
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 font-mono tabular-nums text-muted",
							children: [
								formatWhen(yard, a.startMin),
								"–",
								formatWhen(yard, a.startMin + t.durationMin)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 capitalize text-muted",
							children: t.cargo
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 capitalize text-muted",
							children: phase
						})
					]
				}, a.truckId);
			}) })]
		})
	});
}
var OFFSET_TICKS = [
	-90,
	-60,
	-30,
	0,
	30,
	60,
	90
];
var PRESETS = [
	{
		id: "late47",
		label: "C+47",
		text: "Truck C late 47 min"
	},
	{
		id: "vn",
		label: "VN",
		text: "51C-882.13 bên Q7 đang kẹt, chắc tầm 11h27 mới tới. Hàng đông lạnh nhé."
	},
	{
		id: "door4",
		label: "Door 4",
		text: "Truck C late 47 min, door 4"
	}
];
function Board() {
	const noteRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		useBoardStore.getState().hydrateTheme();
		const s = useBoardStore.getState();
		if (s.yard.timeUnit === "hour" && !s.result) s.findPlan();
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			const el = e.target;
			const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
			if (e.key === "/" && !typing) {
				e.preventDefault();
				noteRef.current?.focus();
				return;
			}
			if (typing) return;
			if (e.key === "f" || e.key === "F") {
				e.preventDefault();
				useBoardStore.getState().findPlan();
			}
			if (e.key === "c" || e.key === "C") useBoardStore.getState().commit();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockDriver, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, { noteRef }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileNav, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Main, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorPane, {})]
					})
				]
			})
		]
	});
}
function ClockDriver() {
	const playing = useBoardStore((s) => s.playing);
	(0, import_react.useEffect)(() => {
		if (!playing) return;
		let raf = 0;
		let last = performance.now();
		const loop = (now) => {
			useBoardStore.getState().advanceClock((now - last) / 35);
			last = now;
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [playing]);
	return null;
}
function Sidebar() {
	const collapsed = useBoardStore((s) => s.collapsed);
	const tab = useBoardStore((s) => s.tab);
	const setTab = useBoardStore((s) => s.setTab);
	const yard = useBoardStore((s) => s.yard);
	const event = useBoardStore((s) => s.event);
	const result = useBoardStore((s) => s.result);
	const liveEta = useBoardStore((s) => s.liveEta);
	const useAgent = useBoardStore((s) => s.useAgent);
	const health = healthMap(useAgent);
	const lateCount = event ? 1 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: cn("hidden shrink-0 flex-col border-r border-nav-line bg-nav text-nav-fg lg:flex", collapsed ? "w-[4.5rem]" : "w-sidebar"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-14 items-center gap-3 px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-fg",
					children: "H"
				}), collapsed ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-base font-semibold tracking-tight",
					children: "Hozerion"
				})]
			}),
			collapsed ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-3 mb-3 rounded-xl bg-raised/80 px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-nav-muted",
						children: "Site"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 inline-flex items-center gap-1.5 text-sm font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 text-accent" }), yard.name]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pl-5 text-xs text-nav-muted",
						children: yard.gate
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex flex-col gap-1 px-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBtn, {
						icon: CalendarClock,
						label: "Timeline",
						active: tab === "board",
						onClick: () => setTab("board"),
						collapsed
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBtn, {
						icon: LayoutGrid,
						label: "Appointments",
						active: tab === "roster",
						onClick: () => setTab("roster"),
						collapsed
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBtn, {
						icon: Waypoints,
						label: "Flow",
						active: tab === "flow",
						onClick: () => setTab("flow"),
						collapsed
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBtn, {
						icon: Anchor,
						label: "BACAP · Cẩu & TOS",
						active: tab === "bacap",
						onClick: () => setTab("bacap"),
						collapsed
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBtn, {
						icon: Network,
						label: "Liên thông Cảng",
						active: tab === "federation",
						onClick: () => setTab("federation"),
						collapsed
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBtn, {
						icon: FileCheck2,
						label: "Hải quan · eDO",
						active: tab === "docs",
						onClick: () => setTab("docs"),
						collapsed
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBtn, {
						icon: Boxes,
						label: "Micro-TOS · Bãi 3D",
						active: tab === "microtos",
						onClick: () => setTab("microtos"),
						collapsed
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto space-y-3 p-3",
				children: [collapsed ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								value: yard.trucks.length,
								label: yard.timeUnit === "hour" ? "Calls" : "Trucks",
								icon: Truck
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								value: yard.docks.length,
								label: yard.timeUnit === "hour" ? "Berths" : "Doors",
								icon: LayoutList
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								value: lateCount,
								label: "Late",
								warn: lateCount > 0
							})
						]
					}),
					yard.timeUnit === "hour" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-raised/80 px-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wide text-nav-muted",
								children: "The job"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm leading-snug text-nav-fg",
								children: "One late ship. The solver names a free stretch and leaves the other ships on their published times."
							}),
							result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 font-mono text-xs tabular-nums text-nav-muted",
								children: [
									result.ms,
									"ms · ",
									result.nodes ?? 0,
									"n · k=",
									result.kUsed
								]
							}) : null
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-raised/80 px-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-2 text-xs font-medium uppercase tracking-wide text-nav-muted",
								children: "Services"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "space-y-1.5",
								children: [SERVICES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-nav-muted",
										children: s.label
									}), health[s.id] === "ok" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-ok" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-[10px] uppercase text-faint",
										children: health[s.id]
									})]
								}, s.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => useBoardStore.getState().toggleAgent(),
										className: "text-nav-muted hover:text-nav-fg",
										children: ["Agent ", useAgent ? "on" : "off"]
									}), useAgent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-ok" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-3.5 text-faint" })]
								})]
							}),
							result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 font-mono text-xs tabular-nums text-nav-muted",
								children: [
									result.ms,
									"ms · ",
									result.nodes ?? 0,
									"n · k=",
									result.kUsed
								]
							}) : null,
							liveEta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-ok",
								children: liveEta
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-1",
						children: [yard.timeUnit === "hour" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => useBoardStore.getState().openDemo(),
							className: "rounded-full bg-raised px-2 py-1 text-xs text-nav-muted hover:bg-nav-hover hover:text-nav-fg",
							children: "ICD minute demo"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => useBoardStore.getState().setMessage(p.text),
							className: "rounded-full bg-raised px-2 py-1 text-xs text-nav-muted hover:bg-nav-hover hover:text-nav-fg",
							children: p.label
						}, p.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => useBoardStore.getState().openPublished(),
							className: "rounded-full bg-raised px-2 py-1 text-xs text-nav-muted hover:bg-nav-hover hover:text-nav-fg",
							children: "Barcelona 24B"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/design",
							className: "rounded-full px-2 py-1 text-xs text-nav-muted hover:text-nav-fg",
							children: "Spec"
						})]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => useBoardStore.getState().toggleCollapsed(),
					className: "inline-flex h-8 items-center gap-1 text-xs text-nav-muted hover:text-nav-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: cn("size-4 transition-transform", collapsed && "rotate-180") }), collapsed ? null : "Collapse"]
				})]
			})
		]
	});
}
function Header({ noteRef }) {
	const tab = useBoardStore((s) => s.tab);
	const message = useBoardStore((s) => s.message);
	const busy = useBoardStore((s) => s.busy);
	const agentNote = useBoardStore((s) => s.agentNote);
	const delayMin = useBoardStore((s) => s.delayMin);
	const forceDock = useBoardStore((s) => s.forceDock);
	const playing = useBoardStore((s) => s.playing);
	const event = useBoardStore((s) => s.event);
	const dark = useBoardStore((s) => s.dark);
	const yard = useBoardStore((s) => s.yard);
	const hour = yard.timeUnit === "hour";
	const shift = yard.shiftLenMin;
	const start = yard.shiftStartMin;
	const sliderMin = hour ? -6 : -90;
	const sliderMax = hour ? 12 : 90;
	const ticks = hour ? [
		-6,
		-1,
		0,
		1,
		6,
		12
	] : OFFSET_TICKS;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex h-16 shrink-0 flex-nowrap items-center gap-3 overflow-hidden border-b border-line bg-surface px-4 sm:px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "shrink-0 text-sm font-semibold tracking-tight",
				children: "Hozerion"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "hidden shrink-0 whitespace-nowrap text-sm xl:block",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold tracking-tight",
						children: tab === "bacap" ? "BACAP-R · Quay Crane & TOS" : tab === "federation" ? "Inter-Port TOS Federation" : tab === "docs" ? "VNACCS · eDO · VGM Reconciliation" : tab === "microtos" ? "Micro-TOS · 3D Yard & Billing" : hour ? "Late call" : tab === "board" ? "Timeline" : tab === "roster" ? "Appointments" : "Flow"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-1.5 text-faint",
						children: "/"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: hour ? "Published berth plan" : "Morning board"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto flex min-w-0 flex-nowrap items-center gap-2",
				children: [
					hour ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex h-9 min-w-0 items-center gap-2 rounded-full bg-bg px-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-accent/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "size-4 shrink-0 text-muted" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: noteRef,
								value: message,
								onChange: (e) => useBoardStore.getState().setMessage(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter") useBoardStore.getState().readNote();
								},
								disabled: busy,
								placeholder: "Paste a gate note",
								title: agentNote ?? "Enter to read",
								className: "w-36 min-w-0 bg-transparent py-0 text-sm outline-none sm:w-48 2xl:w-56"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 shrink-0 text-faint" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden w-52 shrink-0 flex-col justify-center xl:flex 2xl:w-64",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mb-0.5 text-[10px] font-medium tracking-wide text-faint",
								children: hour ? "Hours after mooring" : "Time offset"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: sliderMin,
								max: sliderMax,
								step: 1,
								value: Math.max(sliderMin, Math.min(sliderMax, delayMin)),
								onChange: (e) => useBoardStore.getState().setDelayMin(Number(e.target.value)),
								className: "w-full",
								style: { ["--mm-range"]: `${(delayMin - sliderMin) / (sliderMax - sliderMin) * 100}%` },
								"aria-label": hour ? "Hours after published mooring" : "Time offset minutes"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-between overflow-hidden whitespace-nowrap font-mono text-[10px] leading-none text-faint",
								children: ticks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn(!hour && Math.abs(t) === 60 && "hidden 2xl:inline"),
									children: t === 0 ? "0" : t > 0 ? `+${t}` : String(t)
								}, t))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "hidden h-9 shrink-0 items-center rounded-full bg-bg px-2.5 font-mono text-xs tabular-nums ring-1 ring-line sm:inline-flex",
						children: [
							delayMin >= 0 ? `+${delayMin}` : delayMin,
							" ",
							hour ? "h" : "min"
						]
					}),
					forceDock ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => useBoardStore.getState().setForceDock(""),
						className: "hidden h-9 shrink-0 items-center rounded-full bg-accent px-3 font-mono text-xs text-accent-fg sm:inline-flex",
						children: ["Door ", forceDock.replace("D", "")]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "ghost",
						className: "h-9 shrink-0 rounded-full px-3 ring-1 ring-line",
						onClick: () => useBoardStore.getState().findPlan(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5 text-accent" }), "Find plan"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void useBoardStore.getState().liveRoute(),
						disabled: busy,
						hidden: hour,
						className: "hidden h-9 shrink-0 items-center gap-1.5 rounded-full bg-ok/10 px-3 text-xs font-medium text-ok ring-1 ring-ok/20 hover:bg-ok/15 sm:inline-flex",
						title: "Arbitrate the radio note against the road ETA. Range estimate if the router is down.",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5" }), "Live"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderClock, {
						shift,
						start,
						etaMin: event?.newEtaMin,
						playing,
						hour
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						className: "hidden h-9 shrink-0 rounded-full lg:inline-flex",
						onClick: () => useBoardStore.getState().reset(),
						children: "Reset"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UndoHeader, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => useBoardStore.getState().toggleTheme(),
						className: "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted ring-1 ring-line hover:bg-raised hover:text-fg",
						"aria-label": dark ? "Switch to light" : "Switch to dark",
						children: dark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" })
					})
				]
			})
		]
	});
}
function HeaderClock({ shift, start, etaMin, playing, hour }) {
	const clockMin = useAtomValue(clockMinAtom);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hidden h-9 shrink-0 items-center gap-1.5 rounded-full bg-bg px-2 ring-1 ring-line md:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => useBoardStore.getState().setPlaying(!playing),
				"aria-label": playing ? "Pause" : "Play",
				children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-px size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5 text-muted" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs tabular-nums",
				children: formatWhen({
					shiftStartMin: start,
					timeUnit: hour ? "hour" : "minute"
				}, Math.round(etaMin ?? clockMin))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "range",
				min: 0,
				max: shift,
				value: Math.round(clockMin),
				onChange: (e) => useBoardStore.getState().setClockMin(Number(e.target.value)),
				className: "hidden w-16 2xl:block",
				style: { ["--mm-range"]: `${shift ? clockMin / shift * 100 : 0}%` },
				"aria-label": "Simulation clock"
			})
		]
	});
}
function UndoHeader() {
	if (!useBoardStore((s) => s.previous)) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant: "ghost",
		size: "sm",
		className: "hidden h-9 shrink-0 rounded-full lg:inline-flex",
		onClick: () => useBoardStore.getState().undo(),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-3.5" }), "Undo"]
	});
}
function MobileNav() {
	const tab = useBoardStore((s) => s.tab);
	const setTab = useBoardStore((s) => s.setTab);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-10 shrink-0 items-center gap-1.5 overflow-x-auto border-b border-line bg-surface px-3 lg:hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBtn, {
				icon: CalendarClock,
				label: "Board",
				active: tab === "board",
				onClick: () => setTab("board"),
				compact: true,
				light: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBtn, {
				icon: LayoutList,
				label: "List",
				active: tab === "roster",
				onClick: () => setTab("roster"),
				compact: true,
				light: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBtn, {
				icon: Waypoints,
				label: "Flow",
				active: tab === "flow",
				onClick: () => setTab("flow"),
				compact: true,
				light: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBtn, {
				icon: Anchor,
				label: "BACAP",
				active: tab === "bacap",
				onClick: () => setTab("bacap"),
				compact: true,
				light: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBtn, {
				icon: Network,
				label: "Cảng",
				active: tab === "federation",
				onClick: () => setTab("federation"),
				compact: true,
				light: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBtn, {
				icon: FileCheck2,
				label: "eDO",
				active: tab === "docs",
				onClick: () => setTab("docs"),
				compact: true,
				light: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBtn, {
				icon: Boxes,
				label: "Bãi 3D",
				active: tab === "microtos",
				onClick: () => setTab("microtos"),
				compact: true,
				light: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ml-auto" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "sm",
				className: "h-8",
				onClick: () => useBoardStore.getState().reset(),
				children: "Reset"
			})
		]
	});
}
function Main() {
	const tab = useBoardStore((s) => s.tab);
	const result = useBoardStore((s) => s.result);
	const yard = useBoardStore((s) => s.yard);
	const isScheduleTab = tab === "board" || tab === "roster" || tab === "flow";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-0 min-w-0 flex-1 overflow-auto p-4 sm:p-5",
		children: [
			yard.timeUnit === "hour" && tab === "board" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobCard, {}) : null,
			result && isScheduleTab ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DecisionBar, {
					result,
					yard,
					onApplyRelax: (drop) => useBoardStore.getState().applyRelax(drop),
					onCommit: () => useBoardStore.getState().commit()
				})
			}) : null,
			tab === "board" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelinePane, {}) : null,
			tab === "roster" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RosterPane, {}) : null,
			tab === "flow" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowPane, {}) : null,
			tab === "bacap" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BacapPane, {}) : null,
			tab === "federation" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FederationPane, {}) : null,
			tab === "docs" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocsReconcilePane, {}) : null,
			tab === "microtos" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicroTosPane, {}) : null
		]
	});
}
function TimelinePane() {
	const gantt = useGanttProps();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gantt, { ...gantt }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublishedLedger, {})] });
}
function RosterPane() {
	const yard = useBoardStore((s) => s.yard);
	const live = useBoardStore(selectLive);
	const clockMin = useBoardStore((s) => s.clockMin);
	const event = useBoardStore((s) => s.event);
	const selectedId = useBoardStore((s) => s.selectedId);
	const delayMin = useBoardStore((s) => s.delayMin);
	const orig = yard.appointments.find((a) => a.truckId === (event?.truckId ?? selectedId));
	const etaMin = orig ? orig.startMin + delayMin : void 0;
	const trace = (0, import_react.useMemo)(() => runFlow(yard, live, event, event?.newEtaMin ?? etaMin), [
		yard,
		live,
		event,
		etaMin
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Roster, {
		yard,
		live,
		trace,
		clockMin,
		eventTruckId: event?.truckId,
		selectedId,
		onSelect: (id) => useBoardStore.getState().setSelectedId(id)
	});
}
function FlowPane() {
	const gantt = useGanttProps();
	const yard = gantt.yard;
	const selectedId = gantt.selectedId;
	const clockMin = useBoardStore((s) => s.clockMin);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowStage, {
			yard,
			trace: gantt.trace,
			clockMin,
			selectedId,
			onSelect: (id) => useBoardStore.getState().setSelectedId(id)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gantt, {
			...gantt,
			showFlow: true
		})]
	});
}
function InspectorPane() {
	const tab = useBoardStore((s) => s.tab);
	const yard = useBoardStore((s) => s.yard);
	const selectedId = useBoardStore((s) => s.selectedId);
	const liveAppts = useBoardStore(selectLive);
	const event = useBoardStore((s) => s.event);
	const result = useBoardStore((s) => s.result);
	if (tab === "federation" || tab === "docs" || tab === "microtos") return null;
	const truck = yard.trucks.find((t) => t.id === selectedId) ?? yard.trucks[0];
	const orig = yard.appointments.find((a) => a.truckId === truck.id);
	const live = liveAppts.find((a) => a.truckId === truck.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "hidden w-panel shrink-0 border-l border-line bg-surface xl:block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inspector, {
			yard,
			truck,
			orig,
			live,
			event,
			result,
			onFind: () => useBoardStore.getState().findPlan()
		})
	});
}
function useGanttProps() {
	const yard = useBoardStore((s) => s.yard);
	const live = useBoardStore(selectLive);
	const event = useBoardStore((s) => s.event);
	const selectedId = useBoardStore((s) => s.selectedId);
	const delayMin = useBoardStore((s) => s.delayMin);
	const playheadMin = useBoardStore(selectPlayhead);
	const orig = yard.appointments.find((a) => a.truckId === (event?.truckId ?? selectedId));
	const etaMin = event?.newEtaMin ?? (orig ? orig.startMin + delayMin : void 0);
	return {
		yard,
		live,
		trace: (0, import_react.useMemo)(() => runFlow(yard, live, event, etaMin), [
			yard,
			live,
			event,
			etaMin
		]),
		eventTruckId: event?.truckId,
		etaMin,
		playheadMin,
		selectedId,
		onSelect: (id) => useBoardStore.getState().setSelectedId(id),
		onForceDock: (id) => useBoardStore.getState().toggleForceDock(id)
	};
}
function Kpi({ value, label, warn, icon: Icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface px-1 py-2 text-center shadow-border",
		children: [
			Icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("mx-auto size-3.5", warn ? "text-bad" : "text-muted") }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-1 font-mono text-sm tabular-nums", warn && "text-bad"),
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-nav-muted",
				children: label
			})
		]
	});
}
function NavBtn({ icon: Icon, label, active, onClick, compact, light, collapsed }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		title: label,
		className: cn("flex items-center gap-2.5 rounded-xl text-sm font-medium", compact ? "h-8 px-2" : "h-10 px-3", collapsed && "justify-center px-0", light ? active ? "bg-accent/10 text-accent" : "text-muted hover:bg-raised hover:text-fg" : active ? "bg-accent/10 text-accent" : "text-nav-muted hover:bg-nav-hover hover:text-nav-fg"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }), collapsed ? null : label]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Board, {});
}
//#endregion
export { Home as component };
