const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITE_URL = process.env.SITE_URL || "https://harutool.pages.dev";
const SITEMAP_LASTMOD = process.env.SITEMAP_LASTMOD || new Date().toISOString().slice(0, 10);

const toolRoutes = [
  "character-counter",
  "percentage-calculator",
  "discount-calculator",
  "dday-calculator",
  "random-picker",
  "password-generator",
  "text-cleaner",
  "pyeong-calculator",
  "age-calculator",
  "unit-converter",
  "loan-calculator",
  "compound-interest-calculator",
  "time-calculator",
  "average-calculator",
  "vat-calculator",
  "margin-calculator",
  "fuel-cost-calculator"
];

const landingRoutes = [
  "business",
  "finance"
];

function extractJsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  assert.ok(match, "JSON-LD 스크립트가 있어야 합니다.");
  return JSON.parse(match[1]);
}

test("static build contains all search landing pages", () => {
  assert.ok(fs.existsSync(path.join(DIST, "index.html")));
  assert.ok(fs.existsSync(path.join(DIST, "404.html")));
  for (const route of landingRoutes) {
    const cleanUrlFile = path.join(DIST, `${route}.html`);
    const trailingSlashFile = path.join(DIST, route, "index.html");
    assert.ok(fs.existsSync(cleanUrlFile), `${route} clean URL용 랜딩 페이지가 있어야 합니다.`);
    assert.ok(fs.existsSync(trailingSlashFile), `${route} trailing slash 호환 랜딩 페이지가 있어야 합니다.`);
    const html = fs.readFileSync(cleanUrlFile, "utf8");
    assert.match(html, route === "business" ? /사업자 계산기 모음/ : /이자 계산기 모음/);
    assert.match(html, route === "business" ? /스마트스토어/ : /복리/);
    assert.match(html, new RegExp(`<link rel="canonical" href="${SITE_URL}/${route}"`));
    assert.match(html, /"@type":"CollectionPage"/);
    assert.match(html, /"@type":"FAQPage"/);
    assert.doesNotMatch(html, /\{\{[A-Z_]+\}\}/);
  }
  for (const route of toolRoutes) {
    const cleanUrlFile = path.join(DIST, "tools", `${route}.html`);
    const trailingSlashFile = path.join(DIST, "tools", route, "index.html");
    assert.ok(fs.existsSync(cleanUrlFile), `${route} clean URL용 정적 페이지가 있어야 합니다.`);
    assert.ok(fs.existsSync(trailingSlashFile), `${route} trailing slash 호환 정적 페이지가 있어야 합니다.`);
    const html = fs.readFileSync(cleanUrlFile, "utf8");
    assert.match(html, /<h1>[^<]+<\/h1>/);
    assert.match(html, new RegExp(`<link rel="canonical" href="${SITE_URL}/tools/${route}"`));
    assert.doesNotMatch(html, /\{\{[A-Z_]+\}\}/);
    assert.doesNotMatch(html, /CLOUDFLARE_WEB_ANALYTICS/);
  }
});

test("static build contains crawler and trust files", () => {
  for (const file of [
    "robots.txt",
    "sitemap.xml",
    "_headers",
    "_redirects",
    "about.html",
    "terms.html",
    "privacy.html",
    "contact.html",
    "app.js",
    "styles.css",
    "favicon.svg"
  ]) {
    assert.ok(fs.existsSync(path.join(DIST, file)), `${file} 파일이 있어야 합니다.`);
  }

  const robots = fs.readFileSync(path.join(DIST, "robots.txt"), "utf8");
  const sitemap = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
  assert.match(robots, new RegExp(`Sitemap: ${SITE_URL}/sitemap\\.xml`));
  assert.equal(lastmods.length, locations.length);
  assert.ok(lastmods.every((lastmod) => lastmod === SITEMAP_LASTMOD));
  for (const route of ["/about", "/terms", "/privacy", "/contact"]) {
    assert.match(sitemap, new RegExp(`<loc>${SITE_URL}${route}</loc>`));
  }

  assert.doesNotMatch(sitemap, /\/(?:about|terms|privacy|contact)\.html/);
  assert.doesNotMatch(sitemap, /localhost|127\.0\.0\.1/);
});

test("Cloudflare redirects legacy trust URLs to canonical clean URLs", () => {
  const redirects = fs.readFileSync(path.join(DIST, "_redirects"), "utf8");

  for (const route of ["/about", "/terms", "/privacy", "/contact"]) {
    assert.match(redirects, new RegExp(`${route}\\.html ${route} 301`));
    assert.match(redirects, new RegExp(`${route}/ ${route} 301`));
  }

  for (const route of landingRoutes.map((route) => `/${route}`)) {
    assert.match(redirects, new RegExp(`${route}\\.html ${route} 301`));
    assert.match(redirects, new RegExp(`${route}/ ${route} 301`));
  }

  for (const route of toolRoutes.map((route) => `/tools/${route}`)) {
    assert.match(redirects, new RegExp(`${route}\\.html ${route} 301`));
    assert.match(redirects, new RegExp(`${route}/ ${route} 301`));
  }
});

test("trust pages expose indexable SEO metadata", () => {
  for (const file of ["about.html", "terms.html", "privacy.html", "contact.html"]) {
    const route = `/${file.replace(/\.html$/, "")}`;
    const html = fs.readFileSync(path.join(DIST, file), "utf8");
    assert.match(html, /<meta name="robots" content="index, follow" \/>/);
    assert.match(html, new RegExp(`<link rel="canonical" href="${SITE_URL}${route}"`));
    assert.match(html, new RegExp(`<meta property="og:url" content="${SITE_URL}${route}"`));
    const jsonLd = extractJsonLd(html);
    const organization = jsonLd["@graph"].find((item) => item["@type"] === "Organization");
    const webPage = jsonLd["@graph"].find((item) => item["@type"] === "WebPage");
    assert.equal(organization["@id"], `${SITE_URL}/#organization`);
    assert.equal(webPage.url, `${SITE_URL}${route}`);
    assert.deepEqual(webPage.publisher, { "@id": organization["@id"] });
    assert.doesNotMatch(html, /href="\/(?:about|terms|privacy|contact)\.html"/);
    assert.doesNotMatch(html, /CLOUDFLARE_WEB_ANALYTICS/);
    assert.doesNotMatch(html, /localhost|127\.0\.0\.1/);
  }
});

test("Cloudflare headers keep crawler files fresh and cache versioned assets", () => {
  const headers = fs.readFileSync(path.join(DIST, "_headers"), "utf8");

  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /Referrer-Policy: strict-origin-when-cross-origin/);
  assert.match(headers, /X-Frame-Options: DENY/);
  assert.match(headers, /Permissions-Policy: camera=\(\), geolocation=\(\), microphone=\(\), payment=\(\), usb=\(\)/);

  for (const file of ["/*.html", "/robots.txt", "/sitemap.xml"]) {
    assert.match(headers, new RegExp(`${file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n\\s+Cache-Control: no-cache`));
  }

  for (const file of ["/app.js", "/styles.css", "/favicon.svg"]) {
    assert.match(
      headers,
      new RegExp(`${file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n\\s+Cache-Control: public, max-age=31536000, immutable`)
    );
  }
});
