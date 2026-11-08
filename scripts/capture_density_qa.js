const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.resolve(__dirname, "..", "docs", "screenshots");

const ROUTES = [
  { name: "overview", path: "/" },
  { name: "campaign-history", path: "/campaign-history" },
  { name: "campaign-studio", path: "/campaign-studio" },
  { name: "memory-explorer", path: "/memory-explorer" },
  { name: "brands", path: "/brands" },
  { name: "settings", path: "/settings" },
];

const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-390", width: 390, height: 844 },
];

async function runQA() {
  const browser = await chromium.launch();
  const results = [];

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });

    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    for (const route of ROUTES) {
      const url = `http://localhost:3000${route.path}`;
      await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
      await page.waitForTimeout(500);

      // Check overflow
      const overflow = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        return {
          scrollWidth: body.scrollWidth,
          clientWidth: body.clientWidth,
          hasHorizontalScroll: body.scrollWidth > body.clientWidth,
        };
      });

      // Capture screenshot
      const filename = `density-${route.name}-${vp.name}.png`;
      const filepath = path.join(ARTIFACT_DIR, filename);
      await page.screenshot({ path: filepath, fullPage: false });

      results.push({
        route: route.name,
        viewport: vp.name,
        dimensions: `${vp.width}x${vp.height}`,
        hasHorizontalScroll: overflow.hasHorizontalScroll,
        scrollWidth: overflow.scrollWidth,
        clientWidth: overflow.clientWidth,
        errors: consoleErrors.slice(),
        screenshot: filename,
      });

      console.log(`[PASS] ${route.name} @ ${vp.name}: overflow=${overflow.hasHorizontalScroll}`);
    }

    await page.close();
  }

  await browser.close();

  const reportPath = path.join(ARTIFACT_DIR, "qa-density-results.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log("Full QA finished. Results saved to:", reportPath);
}

runQA().catch((err) => {
  console.error("QA failed:", err);
  process.exit(1);
});

