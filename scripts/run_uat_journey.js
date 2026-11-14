const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = path.resolve(__dirname, "..", "docs", "screenshots", "uat");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const FRONTEND_URL = "http://localhost:3000";
const API_URL = "http://localhost:8000/api/v1";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const ROUTES = [
  { name: "overview", path: "/", expectedText: "CampaignEcho" },
  { name: "brands", path: "/brands", expectedText: "Brand" },
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
  console.log("  CampaignEcho — Comprehensive Multi-Tenant Browser UAT");
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
    cleanup: null,
    all_passed: true,
  };

  let contextA = null;
  let contextB = null;

  try {
    // =========================================================================
    // PHASE A: Responsive Route Matrix & Overflow Verification (21 Checks)
    // =========================================================================
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
          // Unauthenticated Phase A loads /auth/me which returns expected 401
          if (
            !errText.includes("favicon") &&
            !errText.includes("Download the React DevTools") &&
            !errText.includes("401 (Unauthorized)")
          ) {
            report.console_errors.push({ phase: "A", viewport: vp.name, error: errText });
          }
        }
      });

      page.on("pageerror", (err) => {
        report.page_errors.push({
          phase: "A",
          viewport: vp.name,
          message: err.message,
          stack: err.stack,
        });
      });

      for (const r of ROUTES) {
        const url = `${FRONTEND_URL}${r.path}`;
        process.stdout.write(`    Route: ${r.path.padEnd(20)} [${vp.name}] ... `);

        const response = await page.goto(url, { waitUntil: "networkidle", timeout: 25000 });
        await page.waitForTimeout(400);

        const status = response ? response.status() : 0;
        const pageContent = await page.textContent("body");
        const hasExpectedText = pageContent.includes(r.expectedText);

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

        const routePass = status === 200 && hasExpectedText && !overflow.hasHorizontalScroll;

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

    // =========================================================================
    // PHASE B: Genuine Two-User Browser UI Journeys & Security Verification
    // =========================================================================
    console.log("\n[Phase B] Executing Two-User Browser UI Journey & Security Tests...");
    const timestamp = Date.now();
    const userAEmail = `director_a_${timestamp}@apexathletics.com`;
    const userBEmail = `analyst_b_${timestamp}@rivalcorp.com`;
    const userPassword = "CampaignEchoSecure2026!#Auth";

    // Context A: User A (Sarah Lin - Apex Peak Athletics)
    contextA = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageA = await contextA.newPage();
    let authenticatedA = false;

    pageA.on("console", (msg) => {
      if (msg.type() === "error") {
        const txt = msg.text();
        if (
          !txt.includes("favicon") &&
          !txt.includes("Download the React DevTools") &&
          (authenticatedA || !txt.includes("401 (Unauthorized)"))
        ) {
          report.console_errors.push({ phase: "B-UserA", error: txt });
        }
      }
    });
    pageA.on("pageerror", (err) => {
      report.page_errors.push({ phase: "B-UserA", message: err.message, stack: err.stack });
    });

    // -------------------------------------------------------------------------
    // Step 1: User A registers in browser UI (/register) & receives HttpOnly cookie
    // -------------------------------------------------------------------------
    console.log("  Step 1: User A registers via /register UI & receives HttpOnly cookie...");
    await pageA.goto(`${FRONTEND_URL}/register`, { waitUntil: "networkidle", timeout: 25000 });
    await pageA.fill('input[placeholder="Elena Rostova"]', "Sarah Lin - Apex Marketing Director");
    await pageA.fill('input[type="email"]', userAEmail);
    await pageA.fill('input[type="password"]', userPassword);

    await Promise.all([
      pageA.waitForURL("**/onboarding", { timeout: 20000 }),
      pageA.click('button[type="submit"]'),
    ]);
    authenticatedA = true;
    await pageA.waitForLoadState("networkidle");

    const cookiesA = await contextA.cookies();
    const sessionCookieA = cookiesA.find((c) => c.name === "campaignecho_session");
    const hasHttpOnlyCookieA = !!sessionCookieA && sessionCookieA.httpOnly === true;

    const lsHasTokenA = await pageA.evaluate(() => {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        const v = localStorage.getItem(k) || "";
        if (k.toLowerCase().includes("token") || v.toLowerCase().includes("bearer")) {
          return true;
        }
      }
      return false;
    });

    const step1Pass = pageA.url().includes("/onboarding") && hasHttpOnlyCookieA && !lsHasTokenA;
    report.journey_steps.push({
      step: "User A UI Registration, Redirect & HttpOnly Cookie",
      passed: step1Pass,
      details: `Redirected to /onboarding: ${pageA.url().includes("/onboarding")}, HttpOnly cookie: ${hasHttpOnlyCookieA}, Zero localStorage token: ${!lsHasTokenA}`,
    });
    console.log(`    Result: ${step1Pass ? "[PASS]" : "[FAIL]"} (HttpOnly: ${hasHttpOnlyCookieA}, NoTokenInLS: ${!lsHasTokenA})`);

    // -------------------------------------------------------------------------
    // Step 2: User A creates Business Alpha via /onboarding UI
    // -------------------------------------------------------------------------
    console.log("  Step 2: User A creates Business Alpha (Apex Peak Athletics) via /onboarding UI...");
    await pageA.fill('input[placeholder*="Apex Performance Gear"]', "Apex Peak Athletics");
    await pageA.fill('input[placeholder*="Austin, TX"]', "North America");
    await pageA.fill('input[placeholder*="Energetic, punchy"]', "Gritty, technical, scientifically grounded, inspiring");
    await pageA.fill('textarea[placeholder*="Describe your business"]', "Technical alpine and trail endurance athletic apparel brand.");
    await pageA.fill('textarea[placeholder*="Marathon runners"]', "Competitive trail runners and endurance athletes aged 24-42");

    await Promise.all([
      pageA.waitForURL("**/campaign-studio", { timeout: 25000 }),
      pageA.click('button[type="submit"]'),
    ]);
    await pageA.waitForLoadState("networkidle");
    await pageA.waitForFunction(
      () => document.body.innerText.includes("Apex Peak Athletics"),
      { timeout: 15000 }
    );

    const brandsARes = await contextA.request.get(`${API_URL}/brands`);
    const brandsAList = await brandsARes.json();
    const userABrand = brandsAList.find((b) => b.name === "Apex Peak Athletics");
    const userABrandId = userABrand ? userABrand.id : null;
    const leaksIdentifiers =
      JSON.stringify(brandsAList).includes("hindsight_bank_id") ||
      JSON.stringify(brandsAList).includes("user_id") ||
      JSON.stringify(brandsAList).includes("campaignecho-brand-");

    const step2Pass = !!userABrandId && userABrand.is_synthetic === false && !leaksIdentifiers;
    report.journey_steps.push({
      step: "User A UI Onboarding & Brand Workspace Isolation / ID Privacy",
      passed: step2Pass,
      details: `Created Business Alpha ID=${userABrandId}, is_synthetic=${userABrand?.is_synthetic}, IDs leaked=${leaksIdentifiers}`,
    });
    console.log(`    Result: ${step2Pass ? "[PASS]" : "[FAIL]"} (Brand ID: ${userABrandId}, Zero ID Leak: ${!leaksIdentifiers})`);

    // -------------------------------------------------------------------------
    // Step 3: User A generates campaign in /campaign-studio UI & submits results
    // -------------------------------------------------------------------------
    console.log("  Step 3: User A generates campaign & closes learning loop in /campaign-studio UI...");
    await pageA.waitForSelector("#studio-campaign-name", { state: "visible", timeout: 20000 });
    const studioBrandSelect = pageA.locator("select").first();
    await pageA.waitForFunction(
      (brandId) => {
        const sel = document.querySelector("select");
        return sel && Array.from(sel.options).some((o) => o.value === brandId);
      },
      userABrandId,
      { timeout: 15000 }
    ).catch(() => {});
    await studioBrandSelect.selectOption(userABrandId);

    const nameInput = pageA.locator("#studio-campaign-name").first();
    await nameInput.fill("Alpine Ventus Launch Campaign");
    const audInput = pageA.locator("#studio-target-audience").first();
    await audInput.fill("Competitive trail runners and endurance athletes aged 24-42");
    const geoInput = pageA.locator("#studio-geographic-market").first();
    await geoInput.fill("North America");

    await pageA.getByRole("button", { name: /Generate Memory-Grounded Strategy/i }).click();

    // Wait for real LLM + Hindsight strategy synthesis
    const submitResultsBtn = pageA.getByRole("button", { name: /Submit Results & Close Loop/i });
    await submitResultsBtn.waitFor({ state: "visible", timeout: 120000 });

    // Open Results Ingestion modal in UI & retain clearly-labelled UAT result
    await submitResultsBtn.click();
    await pageA.getByText(/Close Continuous Learning Loop/i).waitFor({ state: "visible", timeout: 10000 });
    await pageA.locator("textarea").last().fill(
      "UAT TEST RECORD: High-contrast trail footage in storm conditions drove 84% 5-second retention for Apex Peak Athletics."
    );
    await pageA.getByRole("button", { name: /Retain & Verify Closed Loop/i }).click();
    await pageA.getByText(/Learning Loop Successfully Closed!/i).waitFor({ state: "visible", timeout: 120000 });

    // Close drawer cleanly and reload page to verify cookie persistence on refresh
    await pageA.getByRole("button", { name: /^Cancel$/i }).click();
    await pageA.reload({ waitUntil: "networkidle" });
    await pageA.waitForFunction(
      () => document.body.innerText.includes("Apex Peak Athletics"),
      { timeout: 15000 }
    );

    const step3Pass = true;
    report.journey_steps.push({
      step: "Campaign Studio UI Generation, Results Ingestion & Cookie Persistence",
      passed: step3Pass,
      details: "Generated campaign via UI, retained clearly labelled UAT outcomes to Hindsight via modal, verified cookie persistence across reload",
    });
    console.log("    Result: [PASS] (Generated strategy, closed learning loop in UI, persisted across reload)");

    // -------------------------------------------------------------------------
    // Step 4: Verify saved campaign in /campaign-history UI & run /memory-evolution UI
    // -------------------------------------------------------------------------
    console.log("  Step 4: User A verifies Campaign History UI & runs Memory Evolution UI comparison...");
    await pageA.goto(`${FRONTEND_URL}/campaign-history`, { waitUntil: "networkidle", timeout: 25000 });
    await pageA.waitForFunction(
      () => document.body.innerText.includes("Alpine Ventus Launch Campaign"),
      { timeout: 15000 }
    );
    const historyBodyA = await pageA.textContent("body");
    const historyVisible =
      historyBodyA.includes("Alpine Ventus Launch Campaign") &&
      historyBodyA.includes("Retained to Hindsight");

    // Navigate to Memory Evolution UI and run live comparison for Business Alpha
    await pageA.goto(`${FRONTEND_URL}/memory-evolution`, { waitUntil: "networkidle", timeout: 25000 });
    await pageA.locator("#brand-select").waitFor({ state: "visible", timeout: 15000 });
    await pageA.waitForFunction(
      (brandId) => {
        const sel = document.getElementById("brand-select");
        return sel && Array.from(sel.options).some((o) => o.value === brandId);
      },
      userABrandId,
      { timeout: 15000 }
    ).catch(() => {});
    await pageA.locator("#brand-select").selectOption(userABrandId);
    await pageA.fill("#campaign-name-input", "Alpine Storm Windbreaker A/B Test");

    const compareBtn = pageA.getByRole("button", { name: /Compare Strategies/i });
    await compareBtn.waitFor({ state: "visible", timeout: 15000 });
    await compareBtn.click();
    await Promise.race([
      pageA.getByText(/Mode A · Stateless Baseline/i).waitFor({ state: "visible", timeout: 240000 }),
      pageA.locator("div.bg-red-500\\/10, div.text-red-700").waitFor({ state: "visible", timeout: 240000 }).then(async () => {
        const errMsg = await pageA.locator("div.bg-red-500\\/10, div.text-red-700").textContent();
        throw new Error(`Memory Evolution UI displayed error banner: ${errMsg}`);
      }),
    ]);
    await pageA.getByText(/Mode B · Vectorize Hindsight Powered/i).waitFor({ state: "visible", timeout: 15000 });

    const evoBodyA = await pageA.textContent("body");
    const evoLeaksBankId = evoBodyA.includes("campaignecho-brand-");

    // Lookup User A's campaign & comparison IDs for Step 6 isolation probes
    const campsARes = await contextA.request.get(`${API_URL}/campaigns?brand_id=${userABrandId}`);
    const campsAList = await campsARes.json();
    const userACampaign = campsAList.find((c) => c.name === "Alpine Ventus Launch Campaign");
    const userACampaignId = userACampaign ? userACampaign.id : null;

    const compsARes = await contextA.request.get(`${API_URL}/campaigns/compare?brand_id=${userABrandId}`);
    const compsAList = await compsARes.json();
    const userAComparisonId = compsAList.length > 0 ? compsAList[0].id : null;

    const step4Pass = historyVisible && !!userACampaignId && !!userAComparisonId && !evoLeaksBankId;
    report.journey_steps.push({
      step: "Campaign History UI & Memory Evolution UI Verification",
      passed: step4Pass,
      details: `History visible: ${historyVisible}, Campaign ID: ${userACampaignId}, Comparison ID: ${userAComparisonId}, Zero bank_id UI leak: ${!evoLeaksBankId}`,
    });
    console.log(`    Result: ${step4Pass ? "[PASS]" : "[FAIL]"} (History: ${historyVisible}, Comparison: ${userAComparisonId})`);

    // -------------------------------------------------------------------------
    // Step 5: User B registers in separate browser context & verifies isolation in UI
    // -------------------------------------------------------------------------
    console.log("  Step 5: User B registers in separate context, creates Business Beta & checks UI isolation...");
    contextB = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageB = await contextB.newPage();
    let authenticatedB = false;

    pageB.on("console", (msg) => {
      if (msg.type() === "error") {
        const txt = msg.text();
        if (
          !txt.includes("favicon") &&
          !txt.includes("Download the React DevTools") &&
          (authenticatedB || !txt.includes("401 (Unauthorized)"))
        ) {
          report.console_errors.push({ phase: "B-UserB", error: txt });
        }
      }
    });
    pageB.on("pageerror", (err) => {
      report.page_errors.push({ phase: "B-UserB", message: err.message, stack: err.stack });
    });

    await pageB.goto(`${FRONTEND_URL}/register`, { waitUntil: "networkidle", timeout: 25000 });
    await pageB.fill('input[placeholder="Elena Rostova"]', "Marcus Vance - Zenith Analytics");
    await pageB.fill('input[type="email"]', userBEmail);
    await pageB.fill('input[type="password"]', userPassword);
    await Promise.all([
      pageB.waitForURL("**/onboarding", { timeout: 20000 }),
      pageB.click('button[type="submit"]'),
    ]);
    authenticatedB = true;
    await pageB.waitForLoadState("networkidle");

    await pageB.fill('input[placeholder*="Apex Performance Gear"]', "Zenith Hydro Systems");
    await pageB.fill('input[placeholder*="Austin, TX"]', "Pacific Northwest");
    await pageB.fill('input[placeholder*="Energetic, punchy"]', "Clean, data-driven, outdoorsy");
    await pageB.fill('textarea[placeholder*="Describe your business"]', "Smart alpine hydration filtration gear.");
    await pageB.fill('textarea[placeholder*="Marathon runners"]', "Backcountry hikers and bikepackers");

    await Promise.all([
      pageB.waitForURL("**/campaign-studio", { timeout: 25000 }),
      pageB.click('button[type="submit"]'),
    ]);
    await pageB.waitForLoadState("networkidle");

    // Check /brands UI for User B: only Zenith Hydro Systems + The Taco Syndicate, NEVER Apex Peak Athletics
    await pageB.goto(`${FRONTEND_URL}/brands`, { waitUntil: "networkidle", timeout: 25000 });
    await pageB.waitForFunction(
      () => document.body.innerText.includes("Zenith Hydro Systems"),
      { timeout: 15000 }
    );
    const brandsBodyB = await pageB.textContent("body");
    const hasBetaBrand = brandsBodyB.includes("Zenith Hydro Systems");
    const leaksAlphaBrand = brandsBodyB.includes("Apex Peak Athletics");

    // Check /campaign-history UI for User B: NEVER Alpine Ventus Launch Campaign
    await pageB.goto(`${FRONTEND_URL}/campaign-history`, { waitUntil: "networkidle", timeout: 25000 });
    await pageB.waitForTimeout(600);
    const historyBodyB = await pageB.textContent("body");
    const leaksAlphaCampaign = historyBodyB.includes("Alpine Ventus Launch Campaign");

    const step5Pass = hasBetaBrand && !leaksAlphaBrand && !leaksAlphaCampaign;
    report.journey_steps.push({
      step: "User B Separate Context & Multi-Tenant UI Isolation",
      passed: step5Pass,
      details: `User B sees Zenith Hydro Systems: ${hasBetaBrand}, Alpha Brand leaked: ${leaksAlphaBrand}, Alpha Campaign leaked: ${leaksAlphaCampaign}`,
    });
    console.log(`    Result: ${step5Pass ? "[PASS]" : "[FAIL]"} (Zero cross-tenant UI exposure)`);

    // -------------------------------------------------------------------------
    // Step 6: Cross-Tenant 404 Probes & Synthetic Benchmark 403 Immutability + CSRF
    // -------------------------------------------------------------------------
    console.log("  Step 6: Cross-Tenant 404 Enforcement, Synthetic Immutability (403) & CSRF Check...");
    const originHeader = { Origin: FRONTEND_URL };

    const attackBrandRes = await contextB.request.get(`${API_URL}/brands/${userABrandId}`);
    const attackCampRes = await contextB.request.get(`${API_URL}/campaigns/${userACampaignId}`);
    const attackCompRes = await contextB.request.get(`${API_URL}/campaigns/compare/${userAComparisonId}`);
    const attackResPost = await contextB.request.post(`${API_URL}/campaigns/${userACampaignId}/results`, {
      headers: originHeader,
      data: { impressions: 999, lessons_learned: "Hostile cross-tenant submission" },
    });
    const attackMemRecall = await contextB.request.post(`${API_URL}/brands/${userABrandId}/memory/recall`, {
      headers: originHeader,
      data: { query: "Hostile recall" },
    });

    const crossTenantBlocked =
      attackBrandRes.status() === 404 &&
      attackCampRes.status() === 404 &&
      attackCompRes.status() === 404 &&
      attackResPost.status() === 404 &&
      attackMemRecall.status() === 404;

    // Synthetic benchmark immutability probes
    const synthBrand = brandsAList.find((b) => b.is_synthetic);
    const synthBrandId = synthBrand ? synthBrand.id : "1";
    const synthCampsRes = await contextA.request.get(`${API_URL}/campaigns?brand_id=${synthBrandId}`);
    const synthCampsList = await synthCampsRes.json();
    const synthCampId = synthCampsList.length > 0 ? synthCampsList[0].id : "1";

    const mutPutBrand = await contextA.request.put(`${API_URL}/brands/${synthBrandId}`, {
      headers: originHeader,
      data: { name: "Hijacked Tacos" },
    });
    const mutRetain = await contextA.request.post(`${API_URL}/brands/${synthBrandId}/memory/retain`, {
      headers: originHeader,
      data: { content: "Pollute synthetic bank" },
    });
    const mutProv = await contextA.request.post(`${API_URL}/brands/${synthBrandId}/memory/provision`, {
      headers: originHeader,
      data: { mission: "Override" },
    });
    const mutVerify = await contextA.request.post(`${API_URL}/brands/${synthBrandId}/memory/verify`, {
      headers: originHeader,
    });
    const mutGen = await contextA.request.post(`${API_URL}/campaigns/generate`, {
      headers: originHeader,
      data: { brand_id: synthBrandId, name: "Synthetic Attack", objective: "Test", platform: "TikTok" },
    });
    const mutComp = await contextA.request.post(`${API_URL}/campaigns/compare`, {
      headers: originHeader,
      data: { brand_id: synthBrandId, name: "Synthetic Compare", objective: "Test", platform: "TikTok" },
    });
    const mutResults = await contextA.request.post(`${API_URL}/campaigns/${synthCampId}/results`, {
      headers: originHeader,
      data: { impressions: 100, lessons_learned: "Polluting benchmark observations" },
    });

    const syntheticImmutable =
      mutPutBrand.status() === 403 &&
      mutRetain.status() === 403 &&
      mutProv.status() === 403 &&
      mutVerify.status() === 403 &&
      mutGen.status() === 403 &&
      mutComp.status() === 403 &&
      mutResults.status() === 403;

    // CSRF untrusted Origin rejection
    const csrfRes = await contextA.request.post(`${API_URL}/auth/logout`, {
      headers: { Origin: "https://evil-attacker.example.com" },
    });
    const csrfBlocked = csrfRes.status() === 403;

    const step6Pass = crossTenantBlocked && syntheticImmutable && csrfBlocked;
    report.journey_steps.push({
      step: "Cross-Tenant 404, Synthetic Immutability 403 & CSRF 403",
      passed: step6Pass,
      details: `Cross-tenant 404: ${crossTenantBlocked}, Synthetic 403: ${syntheticImmutable}, CSRF 403: ${csrfBlocked}`,
    });
    console.log(`    Result: ${step6Pass ? "[PASS]" : "[FAIL]"} (404=${crossTenantBlocked}, 403=${syntheticImmutable}, CSRF=${csrfBlocked})`);

    // -------------------------------------------------------------------------
    // Step 7: User A UI Logout & Server-Side Session Replay Rejection (401)
    // -------------------------------------------------------------------------
    console.log("  Step 7: User A logs out in UI & verifies revoked cookie replay fails (401)...");
    const savedCookieVal = sessionCookieA ? sessionCookieA.value : "";

    // Open WorkspaceSwitcher dropdown in header and click Sign Out
    await pageA.locator('button[title="Switch Business Workspace"]').click();
    await pageA.getByRole("button", { name: /Sign Out/i }).click();
    await pageA.waitForTimeout(800);

    // Reload pageA cleanly; User A must no longer have active session
    authenticatedA = false;
    await pageA.reload({ waitUntil: "networkidle" });
    await pageA.locator('button[title="Switch Business Workspace"]').click();
    const dropdownText = await pageA.textContent("header");
    const uiSignedOut = dropdownText.includes("Sign In / Register");

    // Replay User A's revoked session cookie against /auth/me -> MUST be 401
    const replayContext = await browser.newContext();
    const replayRes = await replayContext.request.get(`${API_URL}/auth/me`, {
      headers: { Cookie: `campaignecho_session=${savedCookieVal}` },
    });
    await replayContext.close();
    const replayStatus = replayRes.status();

    const step7Pass = uiSignedOut && replayStatus === 401;
    report.journey_steps.push({
      step: "UI Logout & Server-Side Session Revocation",
      passed: step7Pass,
      details: `UI signed out state: ${uiSignedOut}, Replaying revoked cookie returned HTTP ${replayStatus}`,
    });
    console.log(`    Result: ${step7Pass ? "[PASS]" : "[FAIL]"} (SignedOut UI: ${uiSignedOut}, Replay Status: ${replayStatus})`);

    // Summary
    const routesPassed = report.routes.every((r) => r.passed);
    const journeyPassed = report.journey_steps.every((s) => s.passed);

    report.all_passed =
      routesPassed &&
      journeyPassed &&
      report.console_errors.length === 0 &&
      report.page_errors.length === 0 &&
      report.overflow_violations.length === 0;

    console.log("\n==========================================================");
    console.log("  User Acceptance Testing Summary");
    console.log("==========================================================");
    console.log(`  Total Route Checks       : ${report.routes.length}`);
    console.log(`  Route Checks Passed      : ${report.routes.filter((r) => r.passed).length}/${report.routes.length}`);
    console.log(`  Journey Steps Passed     : ${report.journey_steps.filter((s) => s.passed).length}/${report.journey_steps.length}`);
    console.log(`  Console Errors Detected  : ${report.console_errors.length}`);
    console.log(`  Page Errors Detected     : ${report.page_errors.length}`);
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
    if (contextA) await contextA.close().catch(() => { });
    if (contextB) await contextB.close().catch(() => { });
    await browser.close();
  }
}

runUAT().then((code) => process.exit(code));
