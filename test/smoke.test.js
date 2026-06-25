const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { spawn } = require("node:child_process");
const path = require("node:path");

const PORT = 43127;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const SITE_URL = "https://harutool.test";
const ROOT = path.resolve(__dirname, "..");

const toolRoutes = [
  "/tools/character-counter",
  "/tools/percentage-calculator",
  "/tools/discount-calculator",
  "/tools/dday-calculator",
  "/tools/random-picker",
  "/tools/password-generator",
  "/tools/text-cleaner",
  "/tools/pyeong-calculator",
  "/tools/age-calculator",
  "/tools/unit-converter",
  "/tools/loan-calculator",
  "/tools/compound-interest-calculator",
  "/tools/time-calculator",
  "/tools/average-calculator",
  "/tools/vat-calculator",
  "/tools/margin-calculator",
  "/tools/fuel-cost-calculator"
];

const trustRoutes = [
  "/about",
  "/terms",
  "/privacy",
  "/contact"
];

const landingRoutes = [
  "/business",
  "/business/smartstore-margin",
  "/business/coupang-margin",
  "/business/vat-price",
  "/finance"
];

let server;
let serverOutput = "";

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function extractJsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  assert.ok(match, "JSON-LD 스크립트가 있어야 합니다.");
  return JSON.parse(match[1]);
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${ORIGIN}/health`);
      if (response.ok) return;
    } catch {
      // 서버가 포트를 열 때까지 짧게 재시도합니다.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`테스트 서버가 시작되지 않았습니다.\n${serverOutput}`);
}

before(async () => {
  server = spawn(process.execPath, ["server.js"], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(PORT),
      SITE_URL,
      GOOGLE_SITE_VERIFICATION: "google-test-token",
      NAVER_SITE_VERIFICATION: "naver-test-token",
      CLOUDFLARE_WEB_ANALYTICS_TOKEN: "cf-test-token",
      ADSENSE_CLIENT: "ca-pub-1234567890123456",
      SITEMAP_LASTMOD: "2026-06-23"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  server.stdout.on("data", (chunk) => { serverOutput += chunk; });
  server.stderr.on("data", (chunk) => { serverOutput += chunk; });
  await waitForServer();
});

after(() => {
  if (server && !server.killed) server.kill("SIGTERM");
});

test("health endpoint responds with JSON", async () => {
  const response = await fetch(`${ORIGIN}/health`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.deepEqual(await response.json(), { ok: true });
});

test("home exposes every tool to search crawlers", async () => {
  const response = await fetch(`${ORIGIN}/`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("permissions-policy"), "camera=(), geolocation=(), microphone=(), payment=(), usb=()");
  assert.match(html, /static\.cloudflareinsights\.com\/beacon\.min\.js/);
  assert.match(html, /data-cf-beacon='[^']*&quot;token&quot;:&quot;cf-test-token&quot;[^']*'/);
  assert.match(html, /<h1>필요할 때 바로 쓰는/);
  assert.match(html, new RegExp(`<link rel="canonical" href="${SITE_URL}/"`));
  assert.equal(countMatches(html, /class="tool-card compact-card"/g), toolRoutes.length);
  for (const route of toolRoutes) assert.match(html, new RegExp(`href="${route}"`));

  const jsonLd = extractJsonLd(html);
  const organization = jsonLd["@graph"].find((item) => item["@type"] === "Organization");
  const website = jsonLd["@graph"].find((item) => item["@type"] === "WebSite");
  const itemList = jsonLd["@graph"].find((item) => item["@type"] === "ItemList");
  assert.ok(organization, "홈 JSON-LD에 Organization이 있어야 합니다.");
  assert.equal(organization["@id"], `${SITE_URL}/#organization`);
  assert.equal(organization.url, `${SITE_URL}/`);
  assert.ok(website, "홈 JSON-LD에 WebSite가 있어야 합니다.");
  assert.deepEqual(website.publisher, { "@id": organization["@id"] });
  assert.ok(itemList, "홈 JSON-LD에 ItemList가 있어야 합니다.");
  assert.equal(itemList.itemListElement.length, toolRoutes.length);
  assert.match(html, /<meta name="google-adsense-account" content="ca-pub-1234567890123456"/);
});

test("ads.txt exposes the configured AdSense publisher id", async () => {
  const response = await fetch(`${ORIGIN}/ads.txt`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.equal(body, "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n");
});

test("every tool route has indexable server-rendered SEO content", async (t) => {
  for (const route of toolRoutes) {
    await t.test(route, async () => {
      const response = await fetch(`${ORIGIN}${route}`);
      const html = await response.text();

      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type"), /text\/html/);
      assert.equal(response.headers.get("x-content-type-options"), "nosniff");
      assert.match(html, /<title>[^<]+<\/title>/);
      assert.match(html, /<meta name="description" content="[^"]+"/);
      assert.match(html, /<meta name="robots" content="index, follow"/);
      assert.match(html, new RegExp(`<link rel="canonical" href="${SITE_URL}${route}"`));
      assert.match(html, /<header class="tool-header"><h1>[^<]+<\/h1><p>[^<]+<\/p><\/header>/);
      assert.match(html, /google-site-verification" content="google-test-token"/);
      assert.match(html, /naver-site-verification" content="naver-test-token"/);
      assert.doesNotMatch(html, /\{\{[A-Z_]+\}\}/);

      const jsonLd = extractJsonLd(html);
      const organization = jsonLd["@graph"].find((item) => item["@type"] === "Organization");
      const webApplication = jsonLd["@graph"].find((item) => item["@type"] === "WebApplication");
      const graphTypes = jsonLd["@graph"].map((item) => item["@type"]);
      assert.ok(organization, "도구 페이지 JSON-LD에 Organization이 있어야 합니다.");
      assert.equal(organization["@id"], `${SITE_URL}/#organization`);
      assert.ok(webApplication, "도구 페이지 JSON-LD에 WebApplication이 있어야 합니다.");
      assert.deepEqual(webApplication.provider, { "@id": organization["@id"] });
      assert.ok(graphTypes.includes("WebApplication"));
      assert.ok(graphTypes.includes("BreadcrumbList"));
    });
  }
});

test("sitemap and robots expose the public URL set", async () => {
  const sitemapResponse = await fetch(`${ORIGIN}/sitemap.xml`);
  const sitemap = await sitemapResponse.text();
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
  const expectedRoutes = ["/", ...landingRoutes, ...toolRoutes, ...trustRoutes];

  assert.equal(sitemapResponse.status, 200);
  assert.equal(locations.length, expectedRoutes.length);
  assert.equal(lastmods.length, expectedRoutes.length);
  assert.ok(lastmods.every((lastmod) => lastmod === "2026-06-23"));
  assert.equal(new Set(locations).size, expectedRoutes.length);
  for (const route of expectedRoutes) assert.ok(locations.includes(`${SITE_URL}${route}`));
  assert.doesNotMatch(sitemap, /localhost|127\.0\.0\.1/);

  const robotsResponse = await fetch(`${ORIGIN}/robots.txt`);
  const robots = await robotsResponse.text();
  assert.equal(robotsResponse.status, 200);
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, new RegExp(`Sitemap: ${SITE_URL}/sitemap\\.xml`));
});

test("business landing page targets commercial search intent", async () => {
  const response = await fetch(`${ORIGIN}/business`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(html, /사업자 계산기 모음/);
  assert.match(html, /스마트스토어/);
  assert.match(html, /마진율/);
  assert.match(html, /부가세/);
  assert.match(html, new RegExp(`<link rel="canonical" href="${SITE_URL}/business"`));
  assert.match(html, /<meta name="robots" content="index, follow"/);
  assert.match(html, /"@type":"CollectionPage"/);
  assert.match(html, /"@type":"FAQPage"/);
  for (const route of [
    "/tools/margin-calculator",
    "/tools/vat-calculator",
    "/tools/discount-calculator",
    "/tools/loan-calculator",
    "/business/smartstore-margin",
    "/business/coupang-margin",
    "/business/vat-price"
  ]) {
    assert.match(html, new RegExp(`href="${route}"`));
  }
});

test("seller intent landing pages target narrower search queries", async (t) => {
  const cases = [
    ["/business/smartstore-margin", ["스마트스토어 마진 계산", "네이버페이", "광고비"], ["/tools/margin-calculator", "/tools/vat-calculator", "/tools/discount-calculator"]],
    ["/business/coupang-margin", ["쿠팡 판매가 마진 계산", "배송비", "손익분기"], ["/tools/margin-calculator", "/tools/discount-calculator", "/tools/vat-calculator"]],
    ["/business/vat-price", ["부가세 포함 가격 계산", "공급가액", "합계금액"], ["/tools/vat-calculator", "/tools/margin-calculator", "/tools/discount-calculator"]]
  ];

  for (const [route, keywords, links] of cases) {
    await t.test(route, async () => {
      const response = await fetch(`${ORIGIN}${route}`);
      const html = await response.text();

      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type"), /text\/html/);
      assert.match(html, new RegExp(`<link rel="canonical" href="${SITE_URL}${route}"`));
      assert.match(html, /<meta name="robots" content="index, follow"/);
      assert.match(html, /"@type":"CollectionPage"/);
      assert.match(html, /"@type":"FAQPage"/);
      for (const keyword of keywords) assert.match(html, new RegExp(keyword));
      for (const link of links) assert.match(html, new RegExp(`href="${link}"`));
    });
  }
});

test("finance landing page targets interest search intent", async () => {
  const response = await fetch(`${ORIGIN}/finance`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(html, /이자 계산기 모음/);
  assert.match(html, /대출/);
  assert.match(html, /복리/);
  assert.match(html, /퍼센트/);
  assert.match(html, new RegExp(`<link rel="canonical" href="${SITE_URL}/finance"`));
  assert.match(html, /<meta name="robots" content="index, follow"/);
  assert.match(html, /"@type":"CollectionPage"/);
  assert.match(html, /"@type":"FAQPage"/);
  for (const route of [
    "/tools/loan-calculator",
    "/tools/compound-interest-calculator",
    "/tools/percentage-calculator",
    "/tools/average-calculator"
  ]) {
    assert.match(html, new RegExp(`href="${route}"`));
  }
});

test("trust pages are reachable and contain a primary heading", async (t) => {
  for (const route of trustRoutes) {
    await t.test(route, async () => {
      const response = await fetch(`${ORIGIN}${route}`);
      const html = await response.text();
      assert.equal(response.status, 200);
      assert.match(html, /<h1>[^<]+<\/h1>/);
      assert.match(html, /하루툴/);
      assert.match(html, /<meta name="robots" content="index, follow"/);
      assert.match(html, new RegExp(`<link rel="canonical" href="${SITE_URL}${route}"`));
      assert.match(html, new RegExp(`<meta property="og:url" content="${SITE_URL}${route}"`));
      assert.match(html, /static\.cloudflareinsights\.com\/beacon\.min\.js/);
      const jsonLd = extractJsonLd(html);
      const organization = jsonLd["@graph"].find((item) => item["@type"] === "Organization");
      const webPage = jsonLd["@graph"].find((item) => item["@type"] === "WebPage");
      assert.equal(organization["@id"], `${SITE_URL}/#organization`);
      assert.equal(webPage.url, `${SITE_URL}${route}`);
      assert.deepEqual(webPage.publisher, { "@id": organization["@id"] });
      assert.doesNotMatch(html, /href="\/(?:about|terms|privacy|contact)\.html"/);
    });
  }
});

test("legacy trust page .html URLs redirect to clean public URLs", async (t) => {
  for (const route of trustRoutes) {
    await t.test(`${route}.html`, async () => {
      const response = await fetch(`${ORIGIN}${route}.html`, { redirect: "manual" });
      assert.equal(response.status, 301);
      assert.equal(response.headers.get("location"), route);
    });
  }
});

test("unknown routes return a noindex 404 page", async () => {
  const response = await fetch(`${ORIGIN}/missing-page`);
  const html = await response.text();
  assert.equal(response.status, 404);
  assert.match(html, /<meta name="robots" content="noindex, follow"/);
  assert.match(html, /<span class="error-code">404<\/span>/);
});

test("unsupported methods return 405 with an Allow header", async () => {
  const response = await fetch(`${ORIGIN}/health`, { method: "POST" });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET");
});
