const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITE_URL = process.env.SITE_URL || "https://harutool.pages.dev";

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

test("static build contains all search landing pages", () => {
  assert.ok(fs.existsSync(path.join(DIST, "index.html")));
  assert.ok(fs.existsSync(path.join(DIST, "404.html")));
  for (const route of toolRoutes) {
    const file = path.join(DIST, "tools", route, "index.html");
    assert.ok(fs.existsSync(file), `${route} 정적 페이지가 있어야 합니다.`);
    const html = fs.readFileSync(file, "utf8");
    assert.match(html, /<h1>[^<]+<\/h1>/);
    assert.match(html, new RegExp(`<link rel="canonical" href="${SITE_URL}/tools/${route}"`));
    assert.doesNotMatch(html, /\{\{[A-Z_]+\}\}/);
  }
});

test("static build contains crawler and trust files", () => {
  for (const file of [
    "robots.txt",
    "sitemap.xml",
    "_headers",
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
  assert.match(robots, new RegExp(`Sitemap: ${SITE_URL}/sitemap\\.xml`));
  assert.doesNotMatch(sitemap, /localhost|127\.0\.0\.1/);
});
