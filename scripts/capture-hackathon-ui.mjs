import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const URL = process.env.SMOKE_URL || "http://127.0.0.1:8090";
const ARTIFACT_DIR =
  "C:/Users/Admin/.gemini/antigravity/brain/36558798-2451-401d-a471-630c10074df3";
const SCREENSHOT_DIR = path.resolve("screenshots");

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function saveShot(page, name, fullPage = false) {
  const p1 = path.join(SCREENSHOT_DIR, name);
  const p2 = path.join(ARTIFACT_DIR, name);
  await page.screenshot({ path: p1, fullPage });
  fs.copyFileSync(p1, p2);
  console.log(`Saved: ${name}`);
}

async function launchBrowser() {
  for (const channel of ["chrome", "msedge", undefined]) {
    try {
      return await chromium.launch({ headless: true, ...(channel ? { channel } : {}) });
    } catch {
      // try next
    }
  }
  throw new Error("Could not launch Chromium/Chrome/Edge");
}

const browser = await launchBrowser();
try {
  const context = await browser.newContext({
    viewport: { width: 1520, height: 960 },
    deviceScaleFactor: 1.5,
  });
  const page = await context.newPage();

  // 1. Barcelona Quay 24B Home view
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await saveShot(page, "mlai-top1-home.png", false);

  // 2. Tan Thuan ICD 6-Door view matching attachments/image.png
  await page.getByRole("button", { name: /ICD minute demo/i }).click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /^Find plan$/i }).click();
  await page.waitForTimeout(500);
  await saveShot(page, "mlai-top1-icd-demo.png", false);

  // 3. Self-Service Logistics Custom Setup Modal
  await page.getByRole("button", { name: /^Setup$/i }).click();
  await page.waitForTimeout(450);
  await saveShot(page, "mlai-top1-setup-modal.png", false);

  // Close Setup Modal by clicking the primary done button inside the dialog
  await page.getByRole("button", { name: /Hoàn Tất & Quay Lại/i }).click();
  await page.waitForTimeout(300);

  // 4. AI Agent & HITL tab
  await page.getByRole("button", { name: /AI Agent & HITL/i }).click();
  await page.waitForTimeout(600);
  await saveShot(page, "mlai-top1-agents-hitl.png", false);

  // 5. Sidecar & Go/Rust Benchmark tab
  await page.getByRole("button", { name: /Sidecar & Go\/Rust/i }).click();
  await page.waitForTimeout(600);
  await saveShot(page, "mlai-top1-sidecar-benchmark.png", false);
} finally {
  await browser.close();
}
