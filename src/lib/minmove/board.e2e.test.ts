import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chromium } from "playwright";

const URL = process.env.MINMOVE_E2E_URL ?? "http://127.0.0.1:8090/";

describe("board e2e", () => {
  it("opens quay 24B week 2 with file hours beside the solver, including a zero", async () => {
    const browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({ channel: "msedge", headless: true }));
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      const res = await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 20_000 });
      assert.equal(res?.ok(), true);
      await page.getByText("Staying on berth 0 waits 193h. The plan waits 0h on berth 5.").first().waitFor({ timeout: 15_000 });
      await page.locator("[data-week-select]").selectOption("bcn-24B-2");
      await page.getByText("Booked berth is still free. The plan stays on berth 16 at hour 79.").first().waitFor({ timeout: 15_000 });
      const s11 = page.locator("[data-ship='S11']");
      assert.equal(await s11.getAttribute("data-arrival"), "78");
      assert.equal(await s11.getAttribute("data-moor"), "78");
      assert.equal(await s11.getAttribute("data-berth"), "B16");
      assert.equal(await s11.getAttribute("data-len"), "4");
      assert.equal(await s11.getAttribute("data-handling"), "37");
      assert.equal(await s11.getAttribute("data-saved"), "84");
      const s0 = page.locator("[data-ship='S0']");
      assert.equal(await s0.getAttribute("data-saved"), "0");
      const s9 = page.locator("[data-ship='S9']");
      assert.equal(await s9.getAttribute("data-arrival"), "6");
      assert.equal(await s9.getAttribute("data-moor"), "10");
      assert.equal(await s9.getAttribute("data-saved"), "13");
      const body = await page.locator("body").innerText();
      assert.match(body, /10\.5281\/zenodo\.17665596/);
      assert.match(body, /bcn_24B_2\.json/);
      assert.match(body, /One late ship. The others stay put/);
      assert.equal((await page.locator("[data-job-equation]").innerText()).replace(/\s+/g, " ").trim(), "163 − 79 = 84");
      assert.equal(await page.locator("[data-week-select] option").count(), 98);
      assert.match(body, /arrives 78h, moors 78h on berth 16/);
      assert.match(body, /Legal windows/);
      assert.match(body, /First hole berth 0 at 163h, when S1 leaves/);
      assert.doesNotMatch(body, /Saves 40 min/);
      const hole = page.locator("[data-first-hole]");
      assert.equal(await hole.first().getAttribute("data-first-dock"), "B0");
      assert.equal(await hole.first().getAttribute("data-first-hole"), "163");
      assert.equal(await hole.first().getAttribute("data-after"), "S1");
      assert.equal(await s0.getAttribute("data-next-eta"), "36");
      assert.equal(await s11.getAttribute("data-next-eta"), "");
      const scroller = page.locator("[data-gantt-scroll]");
      const scaleStart = Number(await scroller.getAttribute("data-scale-start"));
      const scaleEnd = Number(await scroller.getAttribute("data-scale-end"));
      assert.ok(scaleStart <= 79, `scale start ${scaleStart}`);
      assert.ok(scaleEnd >= 163, `scale end ${scaleEnd}`);
      const visible = await page.evaluate(() => {
        const pane = document.querySelector("[data-gantt-scroll]");
        const holeEl = document.querySelector("[data-first-hole]");
        const plan = document.querySelector("[data-truck='S11']");
        if (!pane || !holeEl || !plan) return { ok: false, reason: "missing" };
        const box = pane.getBoundingClientRect();
        const holeBox = holeEl.getBoundingClientRect();
        const planBox = plan.getBoundingClientRect();
        const inside = (el: DOMRect) => el.top >= box.top - 2 && el.bottom <= box.bottom + 2 && el.height > 0;
        return { ok: inside(holeBox) && inside(planBox), holeTop: holeBox.top, planTop: planBox.top, paneTop: box.top, paneBottom: box.bottom };
      });
      assert.equal(visible.ok, true, JSON.stringify(visible));
      await s0.click();
      await page.getByText("Booked berth is still free. The plan stays on berth 0 at hour 17.").first().waitFor({ timeout: 15_000 });
    } finally {
      await browser.close();
    }
  });

  it("a blocked booking names the wait of staying on the published berth", async () => {
    const browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({ channel: "msedge", headless: true }));
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 20_000 });
      await page.getByText("Staying on berth 0 waits 193h. The plan waits 0h on berth 5.").first().waitFor({ timeout: 20_000 });
      const s8 = page.locator("[data-ship='S8']");
      await s8.waitFor({ timeout: 20_000 });
      assert.equal(await s8.getAttribute("data-versus-booked"), "193");
      assert.equal(await s8.getAttribute("aria-selected"), "true");
      assert.equal((await page.locator("[data-booked-equation]").innerText()).replace(/\s+/g, " ").trim(), "198 − 5 = 193");
      const body = await page.locator("body").innerText();
      assert.match(body, /The leftmost section is this same opening/);
      assert.match(body, /Nobody else moves/);
      assert.match(body, /bcn_24B_47\.json/);
      assert.match(body, /Berth 5 from hour 5 to 21 is clear in the file/);
      assert.equal(await page.locator("[data-block-ship='S2']").getAttribute("data-block-start"), "20");
      assert.equal(await page.locator("[data-block-ship='S3']").getAttribute("data-block-end"), "198");
      assert.equal(await page.locator("[data-block-chain] li").count(), 8);
      assert.doesNotMatch(body, /Saves 40 min/);
    } finally {
      await browser.close();
    }
  });

  it("quay 24B week 10 shows the file arrival 40 and mooring 77", async () => {
    const browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({ channel: "msedge", headless: true }));
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 20_000 });
      await page.locator("[data-week-select]").waitFor({ timeout: 15_000 });
      await page.locator("[data-week-select]").selectOption("bcn-24B-10");
      const row = page.locator("[data-ship='S0']");
      await row.waitFor({ timeout: 15_000 });
      assert.equal(await row.getAttribute("data-arrival"), "40");
      assert.equal(await row.getAttribute("data-moor"), "77");
      assert.equal(await row.getAttribute("data-len"), "7");
      const body = await page.locator("body").innerText();
      assert.match(body, /bcn_24B_10\.json/);
      assert.match(body, /arrives 40h, moors 77h on berth 0/);
    } finally {
      await browser.close();
    }
  });

  it("the published week fits a phone width", async () => {
    const browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({ channel: "msedge", headless: true }));
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 20_000 });
      await page.locator("[data-block-ship='S2']").waitFor({ timeout: 15_000 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      assert.equal(overflow, false);
    } finally {
      await browser.close();
    }
  });

  it("Find plan paints Ready Door 6 at 12:00 and nobody else moves", async () => {
    const browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({ channel: "msedge", headless: true }));
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      const res = await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 20_000 });
      assert.equal(res?.ok(), true);
      await page.getByText("Staying on berth 0 waits 193h. The plan waits 0h on berth 5.").first().waitFor({ timeout: 15_000 });
      await page.getByRole("button", { name: "ICD minute demo" }).click();
      await page.getByRole("button", { name: "Find plan" }).click();
      await page.getByText("Ready").waitFor({ timeout: 15_000 });
      const body = await page.locator("body").innerText();
      assert.match(body, /Door 6 at 12:00/);
      assert.match(body, /wait 33m/);
      assert.match(body, /nobody else moves/);
      assert.match(body, /51C-882\.13/);
      assert.match(body, /Dispatcher 11:27/);
      assert.match(body, /Saves 40 min versus the first free door/);
      assert.match(body, /73m/);
    } finally {
      await browser.close();
    }
  });

  it("Appointments tab lists the late plate after a plan", async () => {
    const browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({ channel: "msedge", headless: true }));
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15_000 });
      await page.getByText("Staying on berth 0 waits 193h. The plan waits 0h on berth 5.").first().waitFor({ timeout: 15_000 });
      await page.getByRole("button", { name: "ICD minute demo" }).click();
      await page.getByRole("button", { name: "Find plan" }).click();
      await page.getByText("Ready").waitFor({ timeout: 15_000 });
      await page.getByRole("button", { name: "Appointments" }).click();
      const body = await page.locator("body").innerText();
      assert.match(body, /51C-882\.13/);
      assert.match(body, /late/);
    } finally {
      await browser.close();
    }
  });

  it("a radio note shows the arbiter clock instead of the slider", async () => {
    const browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({ channel: "msedge", headless: true }));
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15_000 });
      await page.getByText("Staying on berth 0 waits 193h. The plan waits 0h on berth 5.").first().waitFor({ timeout: 15_000 });
      await page.getByRole("button", { name: "ICD minute demo" }).click();
      const note = page.getByPlaceholder("Paste a gate note");
      await note.fill("51C-882.13 bên Q7 đang kẹt, chắc tầm 11h27 mới tới. Hàng đông lạnh nhé.");
      await note.press("Enter");
      await page.locator("[data-etc-winner='parse']").waitFor({ timeout: 15_000 });
      const body = await page.locator("body").innerText();
      assert.match(body, /Radio 11:27/);
      assert.match(body, /Radio holds/);
    } finally {
      await browser.close();
    }
  });

  it("renders distinct vehicle icons & badges on Gantt cards and syncs Inspector + live mode overrides", async () => {
    const browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({ channel: "msedge", headless: true }));
    try {
      const page = await browser.newPage({ viewport: { width: 1600, height: 960 } });
      await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15_000 });
      await page.getByText("Staying on berth 0 waits 193h. The plan waits 0h on berth 5.").first().waitFor({ timeout: 15_000 });
      await page.getByRole("button", { name: "ICD minute demo" }).click();
      await page.getByRole("button", { name: "Find plan" }).click();
      await page.getByText("Ready").waitFor({ timeout: 15_000 });

      // 1. Verify Gantt cards have distinct vehicle modes and badges
      const cardD = page.locator("[data-truck='D']");
      assert.equal(await cardD.getAttribute("data-vehicle-mode"), "barge");
      assert.equal(await cardD.getAttribute("data-vehicle-badge"), "Sà lan");

      const cardP = page.locator("[data-truck='P']");
      assert.equal(await cardP.getAttribute("data-vehicle-mode"), "train");
      assert.equal(await cardP.getAttribute("data-vehicle-badge"), "Tàu hỏa");

      // 2. Click on 51D-120.68 (D) on the Gantt board and verify Inspector updates dynamically (no hardcoded values)
      await cardD.click();
      assert.equal(await page.locator("[data-inspector-truck]").getAttribute("data-inspector-truck"), "D");
      assert.equal(await page.locator("[data-inspector-driver]").innerText(), "Thuyền trưởng Võ Văn Kiệt");
      assert.equal(await page.locator("[data-inspector-booking]").innerText(), "IWT-SG-12068");
      assert.equal(await page.locator("[data-inspector-duration]").innerText(), "1g 10p");

      // 3. Reassign D's vehicle mode in Inspector to "train" and verify Gantt card D updates live
      await page.locator("[data-quick-mode='train']").click();
      assert.equal(await cardD.getAttribute("data-vehicle-mode"), "train");
      assert.equal(await cardD.getAttribute("data-vehicle-badge"), "Tàu hỏa");

      // 4. Switch to Inspector "8 Phương tiện" tab and inject a new vehicle onto the live board
      await page.locator("[data-inspector-tab='multimodal']").click();
      await page.locator("[data-inject-vehicle]").click();
      const kpiUnits = await page.locator("[data-kpi-units]").innerText();
      assert.match(kpiUnits, /^14/);
    } finally {
      await browser.close();
    }
  });

  it("filters Gantt by vehicle mode and mutates live facility doors via Self-Setup Studio", async () => {
    const browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({ channel: "msedge", headless: true }));
    try {
      const page = await browser.newPage({ viewport: { width: 1600, height: 960 } });
      await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15_000 });
      await page.getByText("Staying on berth 0 waits 193h. The plan waits 0h on berth 5.").first().waitFor({ timeout: 15_000 });
      await page.getByRole("button", { name: "ICD minute demo" }).click();

      // 1. Click Barge filter in Gantt legend and verify Inspector focuses on Barge D
      await page.locator("[data-filter-vehicle='barge']").click();
      assert.equal(await page.locator("[data-inspector-truck]").getAttribute("data-inspector-truck"), "D");

      // 2. Open Self-Setup Studio, duplicate a door (6 -> 7 doors), and apply
      await page.getByRole("button", { name: "Setup", exact: true }).click();
      await page.getByRole("button", { name: /Nhân bản/ }).click();
      await page.getByRole("button", { name: /Sẵn sàng cho mô phỏng/ }).click();

      const body = await page.locator("body").innerText();
      assert.match(body, /7\/7 cửa đang mở/);
    } finally {
      await browser.close();
    }
  });
});

