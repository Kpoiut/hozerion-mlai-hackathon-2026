import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const srcDir = "C:/Users/Admin/Downloads/New folder";
const outAssets = "d:/mlaihackathon/public/assets/logistics";
const outScreen = "d:/mlaihackathon/screenshots";
const outBrain =
  "C:/Users/Admin/.gemini/antigravity/brain/36558798-2451-401d-a471-630c10074df3";

fs.mkdirSync(outAssets, { recursive: true });

const mapping = [
  {
    src: "Ảnh ChatGPT 22_05_21 16 thg 10, 2026-1.png",
    dst: "01-design-system-visual-blueprint.png",
  },
  {
    src: "Ảnh ChatGPT 22_05_48 16 thg 10, 2026-2.png",
    dst: "02-tan-thuan-icd-visual-dispatch.png",
  },
  {
    src: "Ảnh ChatGPT 22_05_50 16 thg 10, 2026-3.png",
    dst: "03-barcelona-quay-24b-live-berths.png",
  },
  {
    src: "Ảnh ChatGPT 22_05_52 16 thg 10, 2026-4.png",
    dst: "04-self-setup-3d-facility-studio.png",
  },
  {
    src: "Ảnh ChatGPT 22_05_53 16 thg 10, 2026-5.png",
    dst: "05-ai-agents-hcmc-port-map.png",
  },
  {
    src: "Ảnh ChatGPT 22_05_55 16 thg 10, 2026-6.png",
    dst: "06-universal-sidecar-visual-benchmark.png",
  },
];

for (const m of mapping) {
  const fullSrc = path.join(srcDir, m.src);
  fs.copyFileSync(fullSrc, path.join(outScreen, m.dst));
  fs.copyFileSync(fullSrc, path.join(outBrain, m.dst));
  fs.copyFileSync(fullSrc, path.join(outAssets, m.dst));
  console.log("Copied:", m.dst);
}

async function launchBrowser() {
  for (const channel of ["chrome", "msedge", undefined]) {
    try {
      return await chromium.launch({ headless: true, ...(channel ? { channel } : {}) });
    } catch {
      // try next
    }
  }
  throw new Error("Could not launch browser");
}

const browser = await launchBrowser();
const page = await browser.newPage({
  viewport: { width: 1672, height: 941 },
  deviceScaleFactor: 2,
});

async function cropFrom(file, crops) {
  const b64 = fs.readFileSync(path.join(outAssets, file)).toString("base64");
  await page.setContent(
    `<body style="margin:0;padding:0;background:transparent;"><img src="data:image/png;base64,${b64}" style="width:1672px;height:941px;display:block;"/></body>`,
  );
  for (const c of crops) {
    await page.screenshot({
      path: path.join(outAssets, c.name),
      clip: { x: c.x, y: c.y, width: c.w, height: c.h },
    });
    console.log("Cropped:", c.name);
  }
}

await cropFrom("01-design-system-visual-blueprint.png", [
  { name: "hero-port-banner.png", x: 204, y: 58, w: 1446, h: 128 },
  { name: "overview-berth-preview.png", x: 706, y: 400, w: 436, h: 196 },
  { name: "overview-studio-preview.png", x: 1285, y: 398, w: 230, h: 200 },
  { name: "overview-map-preview.png", x: 214, y: 684, w: 310, h: 175 },
]);

await cropFrom("02-tan-thuan-icd-visual-dispatch.png", [
  { name: "truck-51c-photo.png", x: 1250, y: 468, w: 92, h: 68 },
]);

await cropFrom("03-barcelona-quay-24b-live-berths.png", [
  { name: "barcelona-harbor-aerial.png", x: 104, y: 294, w: 1148, h: 446 },
  { name: "ship-msc-ocean.png", x: 235, y: 465, w: 198, h: 66 },
  { name: "ship-ever-green.png", x: 450, y: 465, w: 195, h: 66 },
  { name: "ship-cma-cgm.png", x: 665, y: 465, w: 190, h: 66 },
]);

await cropFrom("04-self-setup-3d-facility-studio.png", [
  { name: "digital-twin-3d-canvas.png", x: 356, y: 150, w: 916, h: 650 },
  { name: "tpl-container-port.png", x: 386, y: 838, w: 124, h: 52 },
  { name: "tpl-icd-dryport.png", x: 526, y: 838, w: 114, h: 52 },
  { name: "tpl-warehouse.png", x: 656, y: 838, w: 114, h: 52 },
  { name: "tpl-cold-chain.png", x: 786, y: 838, w: 114, h: 52 },
  { name: "tpl-rail-terminal.png", x: 916, y: 838, w: 114, h: 52 },
  { name: "tpl-multimodal.png", x: 1046, y: 838, w: 114, h: 52 },
]);

await cropFrom("05-ai-agents-hcmc-port-map.png", [
  { name: "hcmc-6ports-dark-satellite.png", x: 142, y: 278, w: 988, h: 492 },
]);

const gridSrc = path.join(outBrain, "multimodal_vehicles_grid_1792163973564.jpg");
if (fs.existsSync(gridSrc)) {
  fs.copyFileSync(gridSrc, path.join(outAssets, "multimodal-vehicles-grid.jpg"));
  fs.copyFileSync(gridSrc, path.join(outScreen, "multimodal-vehicles-grid.jpg"));
  const b64Grid = fs.readFileSync(gridSrc).toString("base64");
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.setContent(
    `<body style="margin:0;padding:0;background:transparent;"><img src="data:image/jpeg;base64,${b64Grid}" style="width:1600px;height:900px;display:block;"/></body>`,
  );
  const cellW = 400;
  const cellH = 450;
  const gridCells = [
    { name: "vehicle-ship.png", col: 0, row: 0 },
    { name: "vehicle-barge.png", col: 1, row: 0 },
    { name: "vehicle-train.png", col: 2, row: 0 },
    { name: "vehicle-aircraft.png", col: 3, row: 0 },
    { name: "vehicle-reefer-truck.png", col: 0, row: 1 },
    { name: "vehicle-agv-stacker.png", col: 1, row: 1 },
    { name: "vehicle-sts-rtg.png", col: 2, row: 1 },
    { name: "vehicle-van-drone.png", col: 3, row: 1 },
  ];
  for (const cell of gridCells) {
    await page.screenshot({
      path: path.join(outAssets, cell.name),
      clip: {
        x: cell.col * cellW + 8,
        y: cell.row * cellH + 8,
        width: cellW - 16,
        height: cellH - 16,
      },
    });
    console.log("Cropped vehicle:", cell.name);
  }
}

await browser.close();
console.log("All visual assets extracted successfully!");
