import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  issueOriginBoundToken,
  verifyOriginBoundRequest,
} from "./quotamesh-guard.ts";

describe("QuotaMesh Origin-Bound API Key Guard", () => {
  it("allows legitimate same-origin web request with valid HMAC origin-bound token", () => {
    const now = 1_792_164_000_000;
    const origin = "http://localhost:8090";
    const token = issueOriginBoundToken(origin, now);
    const v = verifyOriginBoundRequest({
      requestOrigin: origin,
      requestReferer: "http://localhost:8090/",
      secFetchSite: "same-origin",
      presentedToken: token,
      nowMs: now + 5_000,
    });
    assert.equal(v.allowed, true);
    assert.equal(v.httpStatus, 200);
    assert.equal(v.code, "ORIGIN_VERIFIED_OK");
  });

  it("blocks stolen token when replayed from another website origin", () => {
    const now = 1_792_164_000_000;
    const token = issueOriginBoundToken("http://localhost:8090", now);
    const v = verifyOriginBoundRequest({
      requestOrigin: "https://stolen-clone.evil.io",
      requestReferer: "https://stolen-clone.evil.io/",
      secFetchSite: "cross-site",
      presentedToken: token,
      nowMs: now + 2_000,
    });
    assert.equal(v.allowed, false);
    assert.equal(v.httpStatus, 403);
  });

  it("blocks stolen token when used from CLI / curl / Postman (missing origin)", () => {
    const now = 1_792_164_000_000;
    const token = issueOriginBoundToken("http://localhost:8090", now);
    const v = verifyOriginBoundRequest({
      requestOrigin: "",
      secFetchSite: "none",
      presentedToken: token,
      nowMs: now + 1_000,
    });
    assert.equal(v.allowed, false);
    assert.equal(v.httpStatus, 403);
  });

  it("blocks direct raw QuotaMesh API key extraction attempts", () => {
    const v = verifyOriginBoundRequest({
      requestOrigin: "http://localhost:8090",
      requestReferer: "http://localhost:8090/",
      secFetchSite: "same-origin",
      presentedToken: "qm-local-dev-key",
    });
    assert.equal(v.allowed, false);
    assert.equal(v.code, "BLOCKED_RAW_KEY_EXTRACTION");
    assert.equal(v.httpStatus, 403);
  });
});
