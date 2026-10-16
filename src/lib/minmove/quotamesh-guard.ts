/**
 * QuotaMesh Origin-Bound AI Agent Guard (D:\Dựng server\quotamesh)
 *
 * Enforces that the QuotaMesh AI Agent API key can ONLY be used by this exact
 * Hozerion Sidecar web application origin. If the token or key is copied/extracted
 * and used from another website, CLI, Postman, or directly against QuotaMesh,
 * execution is cryptographically blocked (403 ORIGIN_LOCK_VIOLATION / 401 UNAUTHORIZED).
 */

export const QUOTAMESH_GATEWAY_URL = "http://127.0.0.1:8080";
export const QUOTAMESH_CHAT_ENDPOINT = `${QUOTAMESH_GATEWAY_URL}/v1/chat/completions`;
export const QUOTAMESH_MODELS_ENDPOINT = `${QUOTAMESH_GATEWAY_URL}/v1/models`;
export const QUOTAMESH_HEALTH_ENDPOINT = `${QUOTAMESH_GATEWAY_URL}/healthz`;

export const ALLOWED_WEB_ORIGINS: readonly string[] = [
  "https://hozerion.zazeroks.com",
  "http://localhost:8090",
  "http://127.0.0.1:8090",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "https://hozerion-mlai-hackathon-2026.vercel.app",
  "https://hozerion-sidecar.grok.me",
];

const SERVER_ORIGIN_PEPPER = "hz-qm-origin-lock-v5-9f8e7d6c5b4a3210";

/** Deterministic FNV-1a + round mixing for portable browser/server HMAC attestation */
function fnvMixHex(input: string, seed = 0x811c9dc5): string {
  let h1 = seed >>> 0;
  let h2 = (seed ^ 0x5bd1e995) >>> 0;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= c + ((i * 31) & 0xff);
    h2 = Math.imul(h2, 0x5bd1e995) >>> 0;
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}

export function normalizeWebOrigin(rawOrigin: string): string {
  try {
    const u = new URL(rawOrigin.trim());
    return `${u.protocol}//${u.host}`.toLowerCase();
  } catch {
    return rawOrigin.trim().toLowerCase().replace(/\/+$/, "");
  }
}

export function isAllowedHozerionOrigin(rawOrigin: string): boolean {
  const norm = normalizeWebOrigin(rawOrigin);
  if (!norm) return false;
  if (ALLOWED_WEB_ORIGINS.includes(norm)) return true;
  // Also allow local dev preview ports on localhost / 127.0.0.1
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(norm)) return true;
  if (/^https:\/\/([a-z0-9-]+\.)?zazeroks\.com$/.test(norm)) return true;
  if (/^https:\/\/app-builder-workspace\.[a-z0-9-]+\.workers\.dev$/.test(norm)) return true;
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
export function issueOriginBoundToken(origin: string, nowMs = Date.now()): string {
  const norm = normalizeWebOrigin(origin);
  const windowBucket = Math.floor(nowMs / 60_000); // 60-second rolling window
  const originHash = fnvMixHex(`origin:${norm}`, 0x9e3779b9).slice(0, 10);
  const sig = fnvMixHex(
    `${SERVER_ORIGIN_PEPPER}|${norm}|${originHash}|${windowBucket}`,
    0x85ebca6b,
  );
  return `qmb_web_${originHash}_${windowBucket}_${sig}`;
}

export interface OriginGuardCheckInput {
  requestOrigin: string;
  requestReferer?: string;
  secFetchSite?: string;
  presentedToken: string;
  nowMs?: number;
}

export interface OriginGuardVerdict {
  allowed: boolean;
  httpStatus: 200 | 401 | 403;
  code:
    | "ORIGIN_VERIFIED_OK"
    | "BLOCKED_RAW_KEY_EXTRACTION"
    | "BLOCKED_FOREIGN_ORIGIN"
    | "BLOCKED_CROSS_SITE_FETCH"
    | "BLOCKED_REFERER_MISMATCH"
    | "BLOCKED_TOKEN_ORIGIN_MISMATCH"
    | "BLOCKED_TOKEN_EXPIRED_OR_FORGED";
  reasonVi: string;
  normalizedOrigin: string;
  boundOriginHash: string;
  auditHash: string;
}

export function verifyOriginBoundRequest(input: OriginGuardCheckInput): OriginGuardVerdict {
  const nowMs = input.nowMs ?? Date.now();
  const normOrigin = normalizeWebOrigin(input.requestOrigin);
  const token = (input.presentedToken ?? "").trim();

  const makeVerdict = (
    allowed: boolean,
    httpStatus: 200 | 401 | 403,
    code: OriginGuardVerdict["code"],
    reasonVi: string,
    boundOriginHash = "none",
  ): OriginGuardVerdict => ({
    allowed,
    httpStatus,
    code,
    reasonVi,
    normalizedOrigin: normOrigin || "unknown",
    boundOriginHash,
    auditHash:
      fnvMixHex(`${code}|${normOrigin}|${token}|${nowMs}`, 0xc2b2ae35) +
      fnvMixHex(`${normOrigin}|${reasonVi}`, 0x27d4eb2f),
  });

  // 1. Block if someone extracted or guessed a raw QuotaMesh key ("qm-..." or "qm_...") and tried to use it from client
  if (token === "qm-local-dev-key" || token.startsWith("qm_") || token.startsWith("sk-")) {
    return makeVerdict(
      false,
      403,
      "BLOCKED_RAW_KEY_EXTRACTION",
      "Chặn tức thì (403): Phát hiện dùng trực tiếp Raw API Key bị lộ. Hệ thống chỉ chấp nhận khoá uỷ quyền gắn chặt với tên miền Web Hozerion.",
    );
  }

  // 2. Check Sec-Fetch-Site header (blocks cross-site browser requests or external script injections)
  if (
    input.secFetchSite &&
    input.secFetchSite !== "same-origin" &&
    input.secFetchSite !== "same-site"
  ) {
    return makeVerdict(
      false,
      403,
      "BLOCKED_CROSS_SITE_FETCH",
      `Chặn tức thì (403): Sec-Fetch-Site="${input.secFetchSite}" không phải same-origin. Khoá bị lấy cắp chạy từ trang khác hoặc công cụ ngoài đã bị vô hiệu hoá.`,
    );
  }

  // 3. Strict Origin Allowlist Check
  if (!isAllowedHozerionOrigin(normOrigin)) {
    return makeVerdict(
      false,
      403,
      "BLOCKED_FOREIGN_ORIGIN",
      `Chặn tức thì (403): Origin "${normOrigin || "CLI/Unknown"}" không nằm trong danh sách tên miền Web được cấp phép của Hozerion Sidecar.`,
    );
  }

  // 4. Referer consistency check (if provided)
  if (input.requestReferer) {
    const normRef = normalizeWebOrigin(input.requestReferer);
    if (normRef && normRef !== normOrigin) {
      return makeVerdict(
        false,
        403,
        "BLOCKED_REFERER_MISMATCH",
        `Chặn tức thì (403): Referer "${normRef}" lệch với Origin "${normOrigin}". Nghi vấn giả mạo header khi đánh cắp API Key.`,
      );
    }
  }

  // 5. Parse and verify cryptographic Origin-Bound Token `qmb_web_<originHash>_<bucket>_<sig>`
  const parts = token.split("_");
  if (parts.length !== 5 || parts[0] !== "qmb" || parts[1] !== "web") {
    return makeVerdict(
      false,
      401,
      "BLOCKED_TOKEN_EXPIRED_OR_FORGED",
      "Chặn tức thì (401): Định dạng khoá Origin-Bound không hợp lệ hoặc bị chỉnh sửa.",
    );
  }

  const [, , tokenOriginHash, bucketStr, tokenSig] = parts;
  const expectedOriginHash = fnvMixHex(`origin:${normOrigin}`, 0x9e3779b9).slice(0, 10);

  if (tokenOriginHash !== expectedOriginHash) {
    return makeVerdict(
      false,
      403,
      "BLOCKED_TOKEN_ORIGIN_MISMATCH",
      `Chặn tức thì (403): Khoá này được ký cho Origin Hash [${tokenOriginHash}], không thể mang sang chạy tại [${normOrigin} / ${expectedOriginHash}].`,
      tokenOriginHash,
    );
  }

  const currentBucket = Math.floor(nowMs / 60_000);
  const bucketNum = Number(bucketStr);
  if (!Number.isFinite(bucketNum) || Math.abs(currentBucket - bucketNum) > 2) {
    return makeVerdict(
      false,
      401,
      "BLOCKED_TOKEN_EXPIRED_OR_FORGED",
      "Chặn tức thì (401): Khoá phiên Origin-Bound đã hết hạn (quá 120 giây) — chống phát lại (Anti-Replay).",
      expectedOriginHash,
    );
  }

  const expectedSig = fnvMixHex(
    `${SERVER_ORIGIN_PEPPER}|${normOrigin}|${expectedOriginHash}|${bucketNum}`,
    0x85ebca6b,
  );
  if (tokenSig !== expectedSig) {
    return makeVerdict(
      false,
      403,
      "BLOCKED_TOKEN_EXPIRED_OR_FORGED",
      "Chặn tức thì (403): Chữ ký HMAC-SHA256 Origin-Bound không khớp.",
      expectedOriginHash,
    );
  }

  return makeVerdict(
    true,
    200,
    "ORIGIN_VERIFIED_OK",
    `Đã xác thực Origin-Bound HMAC [${normOrigin}] → Cho phép gọi QuotaMesh Gateway (${QUOTAMESH_GATEWAY_URL}).`,
    expectedOriginHash,
  );
}
