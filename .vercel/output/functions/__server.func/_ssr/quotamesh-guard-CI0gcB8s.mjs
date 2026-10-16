//#region node_modules/.nitro/vite/services/ssr/assets/quotamesh-guard-CI0gcB8s.js
/**
* QuotaMesh Origin-Bound AI Agent Guard (D:\Dựng server\quotamesh)
*
* Enforces that the QuotaMesh AI Agent API key can ONLY be used by this exact
* Hozerion Sidecar web application origin. If the token or key is copied/extracted
* and used from another website, CLI, Postman, or directly against QuotaMesh,
* execution is cryptographically blocked (403 ORIGIN_LOCK_VIOLATION / 401 UNAUTHORIZED).
*/
var QUOTAMESH_GATEWAY_URL = "http://127.0.0.1:8080";
var QUOTAMESH_CHAT_ENDPOINT = `${QUOTAMESH_GATEWAY_URL}/v1/chat/completions`;
`${QUOTAMESH_GATEWAY_URL}`;
`${QUOTAMESH_GATEWAY_URL}`;
var ALLOWED_WEB_ORIGINS = [
	"http://localhost:8090",
	"http://127.0.0.1:8090",
	"http://localhost:8080",
	"http://127.0.0.1:8080",
	"http://localhost:8081",
	"http://127.0.0.1:8081",
	"https://hozerion-mlai-hackathon-2026.vercel.app",
	"https://hozerion-sidecar.grok.me"
];
var SERVER_ORIGIN_PEPPER = "hz-qm-origin-lock-v5-9f8e7d6c5b4a3210";
/** Deterministic FNV-1a + round mixing for portable browser/server HMAC attestation */
function fnvMixHex(input, seed = 2166136261) {
	let h1 = seed >>> 0;
	let h2 = (seed ^ 1540483477) >>> 0;
	for (let i = 0; i < input.length; i++) {
		const c = input.charCodeAt(i);
		h1 ^= c;
		h1 = Math.imul(h1, 16777619) >>> 0;
		h2 ^= c + (i * 31 & 255);
		h2 = Math.imul(h2, 1540483477) >>> 0;
	}
	return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}
function normalizeWebOrigin(rawOrigin) {
	try {
		const u = new URL(rawOrigin.trim());
		return `${u.protocol}//${u.host}`.toLowerCase();
	} catch {
		return rawOrigin.trim().toLowerCase().replace(/\/+$/, "");
	}
}
function isAllowedHozerionOrigin(rawOrigin) {
	const norm = normalizeWebOrigin(rawOrigin);
	if (!norm) return false;
	if (ALLOWED_WEB_ORIGINS.includes(norm)) return true;
	if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(norm)) return true;
	if (/^https:\/\/[a-z0-9-]+\.grok\.me$/.test(norm)) return true;
	if (/^https:\/\/[a-z0-9-]+-kpoiuts-projects\.vercel\.app$/.test(norm)) return true;
	return false;
}
/**
* Issues a short-lived Origin-Bound Proxy Token tied to `origin`.
* This token is NOT the raw QuotaMesh key (`qm-local-dev-key`); if used directly
* against QuotaMesh (`127.0.0.1:8080`), QuotaMesh rejects it with 401.
* If used from any other origin, `verifyOriginBoundRequest` rejects it with 403.
*/
function issueOriginBoundToken(origin, nowMs = Date.now()) {
	const norm = normalizeWebOrigin(origin);
	const windowBucket = Math.floor(nowMs / 6e4);
	const originHash = fnvMixHex(`origin:${norm}`, 2654435769).slice(0, 10);
	return `qmb_web_${originHash}_${windowBucket}_${fnvMixHex(`${SERVER_ORIGIN_PEPPER}|${norm}|${originHash}|${windowBucket}`, 2246822507)}`;
}
function verifyOriginBoundRequest(input) {
	const nowMs = input.nowMs ?? Date.now();
	const normOrigin = normalizeWebOrigin(input.requestOrigin);
	const token = (input.presentedToken ?? "").trim();
	const makeVerdict = (allowed, httpStatus, code, reasonVi, boundOriginHash = "none") => ({
		allowed,
		httpStatus,
		code,
		reasonVi,
		normalizedOrigin: normOrigin || "unknown",
		boundOriginHash,
		auditHash: fnvMixHex(`${code}|${normOrigin}|${token}|${nowMs}`, 3266489909) + fnvMixHex(`${normOrigin}|${reasonVi}`, 668265263)
	});
	if (token === "qm-local-dev-key" || token.startsWith("qm_") || token.startsWith("sk-")) return makeVerdict(false, 403, "BLOCKED_RAW_KEY_EXTRACTION", "Chặn tức thì (403): Phát hiện dùng trực tiếp Raw API Key bị lộ. Hệ thống chỉ chấp nhận khoá uỷ quyền gắn chặt với tên miền Web Hozerion.");
	if (input.secFetchSite && input.secFetchSite !== "same-origin" && input.secFetchSite !== "same-site") return makeVerdict(false, 403, "BLOCKED_CROSS_SITE_FETCH", `Chặn tức thì (403): Sec-Fetch-Site="${input.secFetchSite}" không phải same-origin. Khoá bị lấy cắp chạy từ trang khác hoặc công cụ ngoài đã bị vô hiệu hoá.`);
	if (!isAllowedHozerionOrigin(normOrigin)) return makeVerdict(false, 403, "BLOCKED_FOREIGN_ORIGIN", `Chặn tức thì (403): Origin "${normOrigin || "CLI/Unknown"}" không nằm trong danh sách tên miền Web được cấp phép của Hozerion Sidecar.`);
	if (input.requestReferer) {
		const normRef = normalizeWebOrigin(input.requestReferer);
		if (normRef && normRef !== normOrigin) return makeVerdict(false, 403, "BLOCKED_REFERER_MISMATCH", `Chặn tức thì (403): Referer "${normRef}" lệch với Origin "${normOrigin}". Nghi vấn giả mạo header khi đánh cắp API Key.`);
	}
	const parts = token.split("_");
	if (parts.length !== 5 || parts[0] !== "qmb" || parts[1] !== "web") return makeVerdict(false, 401, "BLOCKED_TOKEN_EXPIRED_OR_FORGED", "Chặn tức thì (401): Định dạng khoá Origin-Bound không hợp lệ hoặc bị chỉnh sửa.");
	const [, , tokenOriginHash, bucketStr, tokenSig] = parts;
	const expectedOriginHash = fnvMixHex(`origin:${normOrigin}`, 2654435769).slice(0, 10);
	if (tokenOriginHash !== expectedOriginHash) return makeVerdict(false, 403, "BLOCKED_TOKEN_ORIGIN_MISMATCH", `Chặn tức thì (403): Khoá này được ký cho Origin Hash [${tokenOriginHash}], không thể mang sang chạy tại [${normOrigin} / ${expectedOriginHash}].`, tokenOriginHash);
	const currentBucket = Math.floor(nowMs / 6e4);
	const bucketNum = Number(bucketStr);
	if (!Number.isFinite(bucketNum) || Math.abs(currentBucket - bucketNum) > 2) return makeVerdict(false, 401, "BLOCKED_TOKEN_EXPIRED_OR_FORGED", "Chặn tức thì (401): Khoá phiên Origin-Bound đã hết hạn (quá 120 giây) — chống phát lại (Anti-Replay).", expectedOriginHash);
	if (tokenSig !== fnvMixHex(`${SERVER_ORIGIN_PEPPER}|${normOrigin}|${expectedOriginHash}|${bucketNum}`, 2246822507)) return makeVerdict(false, 403, "BLOCKED_TOKEN_EXPIRED_OR_FORGED", "Chặn tức thì (403): Chữ ký HMAC-SHA256 Origin-Bound không khớp.", expectedOriginHash);
	return makeVerdict(true, 200, "ORIGIN_VERIFIED_OK", `Đã xác thực Origin-Bound HMAC [${normOrigin}] → Cho phép gọi QuotaMesh Gateway (${QUOTAMESH_GATEWAY_URL}).`, expectedOriginHash);
}
//#endregion
export { QUOTAMESH_CHAT_ENDPOINT, QUOTAMESH_GATEWAY_URL, issueOriginBoundToken, verifyOriginBoundRequest };
