const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUTPUT_DIR = path.join(ROOT, "dist");
const DEFAULT_SITE_URL = "https://harutool.pages.dev";
const STATIC_ASSET_CACHE = "public, max-age=31536000, immutable";
const TRUST_PAGES = {
  "about.html": {
    title: "하루툴 소개",
    description: "하루툴이 만드는 계산기와 생활 도구의 운영 원칙을 소개합니다."
  },
  "terms.html": {
    title: "이용약관 | 하루툴",
    description: "하루툴 서비스 이용 조건과 계산 결과에 관한 안내입니다."
  },
  "privacy.html": {
    title: "개인정보처리방침 | 하루툴",
    description: "하루툴 개인정보처리방침"
  },
  "contact.html": {
    title: "문의 및 오류 제보 | 하루툴",
    description: "하루툴 계산 오류, 기능 제안과 광고 관련 문의 방법을 안내합니다."
  }
};

// Cloudflare exposes CF_PAGES_URL as a commit-specific preview URL during builds.
// Search metadata must always use the stable production domain instead.
process.env.SITE_URL = (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");

const { renderHtml, sitemap, tools } = require("../server");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

function writeFile(relativePath, contents) {
  const destination = path.join(OUTPUT_DIR, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, contents);
}

function renderTrustPage(relativePath) {
  const meta = TRUST_PAGES[relativePath];
  const canonical = `${process.env.SITE_URL}/${relativePath}`;
  const html = fs.readFileSync(path.join(PUBLIC_DIR, relativePath), "utf8");
  const searchVerification = [
    process.env.GOOGLE_SITE_VERIFICATION
      ? `<meta name="google-site-verification" content="${escapeHtml(process.env.GOOGLE_SITE_VERIFICATION)}" />`
      : "",
    process.env.NAVER_SITE_VERIFICATION
      ? `<meta name="naver-site-verification" content="${escapeHtml(process.env.NAVER_SITE_VERIFICATION)}" />`
      : "",
    process.env.ADSENSE_CLIENT
      ? `<meta name="google-adsense-account" content="${escapeHtml(process.env.ADSENSE_CLIENT)}" />`
      : ""
  ].filter(Boolean).join("\n    ");
  const seoTags = [
    `<meta name="robots" content="index, follow" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:locale" content="ko_KR" />`,
    searchVerification
  ].filter(Boolean).join("\n    ");

  return html.replace(/(\s*<link rel="stylesheet")/, `\n    ${seoTags}$1`);
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
for (const page of Object.keys(TRUST_PAGES)) {
  writeFile(page, renderTrustPage(page));
}
writeFile("404.html", renderHtml("/404"));
writeFile("sitemap.xml", sitemap());

const baseUrl = process.env.SITE_URL;
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

/robots.txt
  Cache-Control: no-cache

/sitemap.xml
  Cache-Control: no-cache

/app.js
  Cache-Control: ${STATIC_ASSET_CACHE}

/styles.css
  Cache-Control: ${STATIC_ASSET_CACHE}

/favicon.svg
  Cache-Control: ${STATIC_ASSET_CACHE}
`);

console.log(`정적 사이트 생성 완료: ${OUTPUT_DIR}`);
