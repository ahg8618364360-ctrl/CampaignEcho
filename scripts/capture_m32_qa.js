const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:\\Users\\Admin\\.gemini\\antigravity\\brain\\4fccdab8-02c3-49b3-b545-7ae8618e256d";
const SCREENSHOT_DIR = path.resolve(__dirname, "..", "docs", "screenshots");

const DESKTOP_ROUTES = [
  {
    name: "overview",
    path: "/",
    expectedTitle: "Your marketing workspace",
    expectedText: "Z.ai GLM-4.5-Flash (Active)",
  },
  {
    name: "brands",
    path: "/brands",
    expectedTitle: "Brand Profiles & Tenant Isolation",
    expectedText: "Live Hindsight Brand Isolation Verified",
  },
  {
    name: "campaign-studio",
    path: "/campaign-studio",
    expectedTitle: "Campaign Intelligence Studio",
    expectedText: "Z.ai — GLM-4.5-Flash",
  },
  {
    name: "campaign-history",
    path: "/campaign-history",
    expectedTitle: "Campaign History & Observations",
    expectedText: "Empirical Ledger",
  },
  {
    name: "memory-explorer",
    path: "/memory-explorer",
    expectedTitle: "Memory Explorer & Activity Stream",
    expectedText: "Vectorize Hindsight Cloud Connected",
  },
  {
    name: "settings",
    path: "/settings",
    expectedTitle: "System & Engine Settings",
    expectedText: "Z.ai GLM-4.5-Flash (Primary Production LLM)",
  },
];

const MOBILE_ROUTES = [
  { name: "overview", path: "/" },
  { name: "campaign-studio", path: "/campaign-studio" },
  { name: "memory-explorer", path: "/memory-explorer" },
];

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  const results = [];

  console.log("=== STEP 1: DESKTOP QA (1440x900) ===");
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const desktopConsoleErrors = [];
  desktopPage.on("console", (msg) => {
    if (msg.type() === "error") {
      desktopConsoleErrors.push(msg.text());
    }
  });

  for (const r of DESKTOP_ROUTES) {
    const url = `http://localhost:3000${r.path}`;
    console.log(`Navigating to: ${url}`);
    await desktopPage.goto(url, { waitUntil: "networkidle", timeout: 20000 });
    await desktopPage.waitForTimeout(1000);

    // Verify current URL
    const currentUrl = desktopPage.url();
    if (!currentUrl.includes(r.path)) {
      throw new Error(`URL mismatch: expected ${r.path}, got ${currentUrl}`);
    }

    // Verify expected heading or text
    const pageText = await desktopPage.innerText("body");
    if (r.expectedTitle && !pageText.includes(r.expectedTitle)) {
      throw new Error(`Route ${r.path} missing title text: "${r.expectedTitle}"`);
    }
    if (r.expectedText && !pageText.includes(r.expectedText)) {
      throw new Error(`Route ${r.path} missing expected verification text: "${r.expectedText}"`);
    }

    const filename = `m32-${r.name}-desktop.png`;
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    const docsPath = path.join(SCREENSHOT_DIR, filename);

    await desktopPage.screenshot({ path: artifactPath, fullPage: false });
    fs.copyFileSync(artifactPath, docsPath);

    console.log(`[PASS] ${r.name} verified and captured: ${filename}`);
    results.push({
      route: r.name,
      viewport: "desktop-1440x900",
      url: currentUrl,
      verifiedText: r.expectedText,
      screenshot: filename,
    });
  }
  await desktopPage.close();

  console.log("\n=== STEP 2: MOBILE QA (390x844) ===");
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  const mobileConsoleErrors = [];
  mobilePage.on("console", (msg) => {
    if (msg.type() === "error") {
      mobileConsoleErrors.push(msg.text());
    }
  });

  for (const r of MOBILE_ROUTES) {
    const url = `http://localhost:3000${r.path}`;
    console.log(`Navigating mobile to: ${url}`);
    await mobilePage.goto(url, { waitUntil: "networkidle", timeout: 20000 });
    await mobilePage.waitForTimeout(1000);

    const filename = `m32-${r.name}-mobile-390.png`;
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    const docsPath = path.join(SCREENSHOT_DIR, filename);

    await mobilePage.screenshot({ path: artifactPath, fullPage: false });
    fs.copyFileSync(artifactPath, docsPath);

    console.log(`[PASS] Mobile ${r.name} captured: ${filename}`);
    results.push({
      route: r.name,
      viewport: "mobile-390x844",
      url: mobilePage.url(),
      screenshot: filename,
    });
  }
  await mobilePage.close();

  await browser.close();

  console.log("\n=== CONSOLE ERROR AUDIT ===");
  console.log(`Desktop console errors: ${desktopConsoleErrors.length}`);
  if (desktopConsoleErrors.length > 0) {
    console.warn("Desktop errors:", desktopConsoleErrors);
  }
  console.log(`Mobile console errors: ${mobileConsoleErrors.length}`);
  if (mobileConsoleErrors.length > 0) {
    console.warn("Mobile errors:", mobileConsoleErrors);
  }

  const report = {
    timestamp: new Date().toISOString(),
    desktopConsoleErrors,
    mobileConsoleErrors,
    results,
  };
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "m32-qa-report.json"),
    JSON.stringify(report, null, 2)
  );

  console.log("\nQA and Screenshot capture finished successfully!");
}

run().catch((err) => {
  console.error("QA execution failed:", err);
  process.exit(1);
});

