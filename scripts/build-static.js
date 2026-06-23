const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUTPUT_DIR = path.join(ROOT, "dist");

if (!process.env.SITE_URL && process.env.CF_PAGES_URL) {
  process.env.SITE_URL = process.env.CF_PAGES_URL;
}

const { renderHtml, sitemap, tools } = require("../server");

function writeFile(relativePath, contents) {
  const destination = path.join(OUTPUT_DIR, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, contents);
}

function copyPublicAssets() {
  for (const entry of fs.readdirSync(PUBLIC_DIR, { withFileTypes: true })) {
    if (entry.name === "index.html") continue;
    fs.cpSync(
      path.join(PUBLIC_DIR, entry.name),
      path.join(OUTPUT_DIR, entry.name),
      { recursive: true }
    );
  }
}

fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
copyPublicAssets();

writeFile("index.html", renderHtml("/"));
for (const route of Object.keys(tools).filter((route) => route !== "/")) {
  writeFile(path.join(route.slice(1), "index.html"), renderHtml(route));
}
writeFile("404.html", renderHtml("/404"));
writeFile("sitemap.xml", sitemap());

const baseUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
writeFile("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);

const adsenseClient = process.env.ADSENSE_CLIENT || "";
if (adsenseClient) {
  writeFile("ads.txt", `google.com, ${adsenseClient.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`);
}

writeFile("_headers", `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/*.html
  Cache-Control: no-cache

/app.js
  Cache-Control: public, max-age=3600

/styles.css
  Cache-Control: public, max-age=3600
`);

console.log(`정적 사이트 생성 완료: ${OUTPUT_DIR}`);
