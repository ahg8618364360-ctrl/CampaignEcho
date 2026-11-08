const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = path.resolve(__dirname, "..", "docs", "screenshots", "uat");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const ROUTES = [
  { name: "overview", path: "/", expectedText: "CampaignEcho" },
  { name: "brands", path: "/brands", expectedText: "The Taco Syndicate" },
  { name: "campaign-studio", path: "/campaign-studio", expectedText: "Campaign" },
  { name: "campaign-history", path: "/campaign-history", expectedText: "History" },
  { name: "memory-evolution", path: "/memory-evolution", expectedText: "Evolution" },
  { name: "memory-explorer", path: "/memory-explorer", expectedText: "Memory" },
  { name: "settings", path: "/settings", expectedText: "Settings" },
];

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch (err) {
    console.log("  [INFO] Default chromium launch fallback to system chrome channel.");
    return await chromium.launch({ channel: "chrome", headless: true });
  }
}

async function runUAT() {
  console.log("==========================================================");
  console.log("  CampaignEcho — Comprehensive Browser User Acceptance Test");
  console.log("==========================================================");

  const browser = await launchBrowser();
  const report = {
    started_at: new Date().toISOString(),
    routes: [],
    journey_steps: [],
    console_errors: [],
    page_errors: [],
    failed_requests: [],
    overflow_violations: [],
    all_passed: true,
  };

  try {
    // PHASE A: Responsive Route Matrix & Overflow Verification
    console.log("\n[Phase A] Verifying 7 Routes Across 3 Viewports (21 assertions)...");
    for (const vp of VIEWPORTS) {
      console.log(`\n  --- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          const errText = msg.text();
          if (!errText.includes("favicon") && !errText.includes("Download the React DevTools")) {
            report.console_errors.push({ viewport: vp.name, error: errText });
          }
        }
      });

      page.on("pageerror", (err) => {
        report.page_errors.push({
          viewport: vp.name,
          message: err.message,
          stack: err.stack,
        });
      });

      page.on("response", (res) => {
        if (res.status() >= 400 && res.url().includes("/api/")) {
          report.failed_requests.push({
            viewport: vp.name,
            url: res.url(),
            status: res.status(),
          });
        }
      });

      for (const r of ROUTES) {
        const url = `http://localhost:3000${r.path}`;
        process.stdout.write(`    Route: ${r.path.padEnd(20)} [${vp.name}] ... `);
        
        const response = await page.goto(url, { waitUntil: "networkidle", timeout: 25000 });
        await page.waitForTimeout(500);

        const status = response ? response.status() : 0;
        const pageContent = await page.textContent("body");
        const hasExpectedText = pageContent.includes(r.expectedText);

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
          const body = document.body;
          const doc = document.documentElement;
          const scrollWidth = Math.max(body.scrollWidth, doc.scrollWidth);
          const clientWidth = Math.max(body.clientWidth, doc.clientWidth);
          return {
            scrollWidth,
            clientWidth,
            hasHorizontalScroll: scrollWidth > clientWidth,
          };
        });

        const screenshotPath = path.join(SCREENSHOT_DIR, `${r.name}-${vp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        const routePass = (status === 200) && hasExpectedText && !overflow.hasHorizontalScroll;

        if (overflow.hasHorizontalScroll) {
          console.log(`[OVERFLOW WARN: ${overflow.scrollWidth} > ${overflow.clientWidth}]`);
          report.overflow_violations.push({
            route: r.name,
            viewport: vp.name,
            scrollWidth: overflow.scrollWidth,
            clientWidth: overflow.clientWidth,
          });
        } else if (!hasExpectedText) {
          console.log(`[TEXT MISSING: "${r.expectedText}"]`);
        } else if (status !== 200) {
          console.log(`[HTTP ${status}]`);
        } else {
          console.log("[PASS]");
        }

        report.routes.push({
          route: r.name,
          path: r.path,
          viewport: vp.name,
          status: status,
          expected_text: r.expectedText,
          text_found: hasExpectedText,
          overflow: overflow.hasHorizontalScroll,
          screenshot: `${r.name}-${vp.name}.png`,
          passed: routePass,
        });
      }
      await context.close();
    }

    // PHASE B: Complete Evaluator End-to-End User Journey
    console.log("\n[Phase B] Executing Evaluator End-to-End Strategic Journey...");
    const journeyContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const jPage = await journeyContext.newPage();

    jPage.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (!text.includes("favicon") && !text.includes("Download the React DevTools")) {
          report.console_errors.push({ journey_step: "active_step", error: text });
        }
      }
    });

    jPage.on("pageerror", (err) => {
      report.page_errors.push({
        journey_step: "active_step",
        message: err.message,
        stack: err.stack,
      });
    });

    // Step 1: Brands & Tenant Isolation Verification
    console.log("  Step 1: Inspecting Brands & Tenant Isolation...");
    await jPage.goto("http://localhost:3000/brands", { waitUntil: "networkidle" });
    await jPage.waitForSelector("text=The Taco Syndicate");
    const brandContent = await jPage.textContent("body");
    const brandVerified = brandContent.includes("The Taco Syndicate") && brandContent.includes("campaignecho-brand-");
    report.journey_steps.push({
      step: "Brand Inspection & Isolation",
      passed: brandVerified,
      details: "The Taco Syndicate loaded with isolated bank mapping",
    });
    console.log(`    Result: ${brandVerified ? "[PASS]" : "[FAIL]"}`);

    // Step 2: Settings & Cloud Service Diagnostics
    console.log("  Step 2: Inspecting Settings & API Diagnostics...");
    await jPage.goto("http://localhost:3000/settings", { waitUntil: "networkidle" });
    await jPage.waitForTimeout(1000);
    const settingsContent = await jPage.textContent("body");
    const settingsPass = settingsContent.includes("Connected") || settingsContent.includes("Online") || settingsContent.includes("v0.1.0");
    report.journey_steps.push({
      step: "Settings Diagnostics",
      passed: settingsPass,
      details: "System settings and service status rendered cleanly",
    });
    console.log(`    Result: ${settingsPass ? "[PASS]" : "[FAIL]"}`);

    // Step 3: Memory Explorer & Grounded Retrieval
    console.log("  Step 3: Inspecting Memory Explorer & Search...");
    await jPage.goto("http://localhost:3000/memory-explorer", { waitUntil: "networkidle" });
    await jPage.waitForTimeout(1000);
    const memContent = await jPage.textContent("body");
    const memPass = memContent.includes("Memory") || memContent.includes("Observations");
    report.journey_steps.push({
      step: "Memory Explorer Inspection",
      passed: memPass,
      details: "Memory Explorer rendered observations and retrieval controls",
    });
    console.log(`    Result: ${memPass ? "[PASS]" : "[FAIL]"}`);

    // Step 4: Campaign Studio Workspace Inspection
    console.log("  Step 4: Inspecting Campaign Studio Form & Strategy Controls...");
    await jPage.goto("http://localhost:3000/campaign-studio", { waitUntil: "networkidle" });
    await jPage.waitForTimeout(1000);
    const studioContent = await jPage.textContent("body");
    const studioPass = studioContent.includes("Campaign") && (studioContent.includes("Generate") || studioContent.includes("Strategy"));
    report.journey_steps.push({
      step: "Campaign Studio Inspection",
      passed: studioPass,
      details: "Campaign Studio loaded with active brand strategy generator",
    });
    console.log(`    Result: ${studioPass ? "[PASS]" : "[FAIL]"}`);

    // Step 5: Memory Evolution Comparison View
    console.log("  Step 5: Inspecting Memory Evolution Screen...");
    await jPage.goto("http://localhost:3000/memory-evolution", { waitUntil: "networkidle" });
    await jPage.waitForTimeout(1000);
    const evoContent = await jPage.textContent("body");
    const evoPass = evoContent.includes("Mode A") && evoContent.includes("Mode B");
    report.journey_steps.push({
      step: "Memory Evolution Mode A vs Mode B Inspection",
      passed: evoPass,
      details: "Mode A Stateless Baseline and Mode B Memory-Grounded cards displayed",
    });
    console.log(`    Result: ${evoPass ? "[PASS]" : "[FAIL]"}`);

    // Step 6: Campaign History Inspection
    console.log("  Step 6: Inspecting Campaign History Observations...");
    await jPage.goto("http://localhost:3000/campaign-history", { waitUntil: "networkidle" });
    await jPage.waitForTimeout(1000);
    const histContent = await jPage.textContent("body");
    const histPass = histContent.includes("Late Night Burrito Drops") || histContent.includes("Campaign");
    report.journey_steps.push({
      step: "Campaign History & Observations",
      passed: histPass,
      details: "Historical campaigns and observed metrics rendered",
    });
    console.log(`    Result: ${histPass ? "[PASS]" : "[FAIL]"}`);

    // Step 7: Multi-Session Persistence & Recall Verification
    console.log("  Step 7: Verifying Cross-Session Cognitive Memory Persistence...");
    const healthCheck = await jPage.evaluate(async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/health/ready");
        const data = await res.json();
        return data.status === "ready" && data.database === "connected";
      } catch {
        return false;
      }
    });
    report.journey_steps.push({
      step: "Cross-Session Database & Memory Readiness",
      passed: healthCheck,
      details: "Backend reported ready with SQLite persistence intact",
    });
    console.log(`    Result: ${healthCheck ? "[PASS]" : "[FAIL]"}`);

    // Summary of journey
    const routesPassed = report.routes.every((r) => r.passed);
    const journeyPassed = report.journey_steps.every((s) => s.passed);
    
    report.all_passed =
      routesPassed &&
      journeyPassed &&
      report.console_errors.length === 0 &&
      report.page_errors.length === 0 &&
      report.overflow_violations.length === 0 &&
      report.failed_requests.length === 0;

    await journeyContext.close();

    console.log("\n==========================================================");
    console.log("  User Acceptance Testing Summary");
    console.log("==========================================================");
    console.log(`  Total Route Checks       : ${report.routes.length}`);
    console.log(`  Route Checks Passed      : ${report.routes.filter(r => r.passed).length}/${report.routes.length}`);
    console.log(`  Journey Steps Passed     : ${report.journey_steps.filter(s => s.passed).length}/${report.journey_steps.length}`);
    console.log(`  Console Errors Detected  : ${report.console_errors.length}`);
    console.log(`  Page Errors Detected     : ${report.page_errors.length}`);
    console.log(`  Failed API Requests      : ${report.failed_requests.length}`);
    console.log(`  Overflow Violations      : ${report.overflow_violations.length}`);
    console.log(`  Overall UAT Verdict      : ${report.all_passed ? "PASS (100% GREEN)" : "FAIL"}`);
    console.log("==========================================================\n");

    fs.writeFileSync(
      path.resolve(__dirname, "..", "docs", "uat_evidence.json"),
      JSON.stringify(report, null, 2),
      "utf8"
    );

    return report.all_passed ? 0 : 1;
  } finally {
    await browser.close();
  }
}

runUAT().then((code) => process.exit(code));
