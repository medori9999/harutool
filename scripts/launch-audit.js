const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const ENV_EXAMPLE = path.join(ROOT, ".env.example");
const PACKAGE_JSON = path.join(ROOT, "package.json");
const WRANGLER_CONFIG = path.join(ROOT, "wrangler.jsonc");
const OPERATIONS_DOC = path.join(ROOT, "docs", "operations.md");
const SITE_URL = (process.env.SITE_URL || "https://harutool.pages.dev").replace(/\/$/, "");

const requiredFiles = [
  "index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "_headers",
  "_redirects",
  "about.html",
  "terms.html",
  "privacy.html",
  "contact.html"
];

const requiredPublicRoutes = [
  "/",
  "/about",
  "/terms",
  "/privacy",
  "/contact",
  "/business",
  "/finance",
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

const requiredEnvKeys = [
  "PORT",
  "SITE_URL",
  "GOOGLE_SITE_VERIFICATION",
  "NAVER_SITE_VERIFICATION",
  "CLOUDFLARE_WEB_ANALYTICS_TOKEN",
  "SITEMAP_LASTMOD",
  "ADSENSE_CLIENT",
  "ADSENSE_TOP_SLOT",
  "ADSENSE_SIDE_SLOT"
];

const landingExpectations = {
  "business.html": {
    keywords: ["사업자 계산기 모음", "스마트스토어", "마진율", "부가세"],
    toolLinks: ["/tools/margin-calculator", "/tools/vat-calculator", "/tools/discount-calculator"]
  },
  "finance.html": {
    keywords: ["이자 계산기 모음", "대출", "복리", "퍼센트"],
    toolLinks: ["/tools/loan-calculator", "/tools/compound-interest-calculator", "/tools/percentage-calculator"]
  }
};

const checks = [];

function pass(message) {
  checks.push({ ok: true, message });
}

function fail(message) {
  checks.push({ ok: false, message });
}

function readDist(relativePath) {
  return fs.readFileSync(path.join(DIST, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function envExampleKeys() {
  if (!fs.existsSync(ENV_EXAMPLE)) return [];
  return fs.readFileSync(ENV_EXAMPLE, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=")[0]);
}

function existingHtmlFiles() {
  const files = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }
      if (entry.name.endsWith(".html")) files.push(path.relative(DIST, absolutePath));
    }
  };

  if (fs.existsSync(DIST)) walk(DIST);
  return files.sort();
}

function expect(condition, message) {
  if (condition) pass(message);
  else fail(message);
}

function verificationMeta(name, content) {
  return `<meta name="${name}" content="${content}"`;
}

function expectAdConsentGate(html, appJs) {
  expect(html.includes('id="consent-banner"'), "홈에 쿠키 동의 배너가 있습니다.");
  expect(html.includes('id="consent-essential"'), "홈에 필수만 허용 버튼이 있습니다.");
  expect(html.includes('id="consent-accept"'), "홈에 선택 쿠키 동의 버튼이 있습니다.");
  expect(html.includes('id="cookie-settings"'), "홈에 쿠키 설정 재열기 버튼이 있습니다.");
  expect(appJs.includes('localStorage.getItem("harutool-consent")'), "앱이 쿠키 동의 선택을 확인합니다.");
  expect(appJs.includes('if (!saved) banner.hidden = false;'), "동의 기록이 없으면 배너를 표시합니다.");
  expect(appJs.includes('if (saved === "accepted") loadAds();'), "저장된 선택 동의가 있을 때만 광고를 로드합니다.");
  expect(appJs.includes('if (value === "accepted") loadAds();'), "새 선택 동의가 있을 때만 광고를 로드합니다.");
  expect(appJs.includes('setConsent("essential")'), "필수만 허용 선택이 광고 로드와 분리되어 있습니다.");
  expect(appJs.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"), "AdSense 스크립트 로드 위치가 동의 게이트 내부에 있습니다.");
}

expect(fs.existsSync(DIST), "dist 산출물 디렉터리가 있습니다.");

expect(fs.existsSync(ENV_EXAMPLE), ".env.example 파일이 있습니다.");
const envKeys = envExampleKeys();
for (const key of requiredEnvKeys) {
  expect(envKeys.includes(key), `.env.example에 ${key}가 있습니다.`);
}

expect(fs.existsSync(OPERATIONS_DOC), "운영·측정 체크리스트 문서가 있습니다.");
if (fs.existsSync(OPERATIONS_DOC)) {
  const operationsDoc = fs.readFileSync(OPERATIONS_DOC, "utf8");
  expect(operationsDoc.includes("Cloudflare Web Analytics"), "운영 문서에 방문자 확인 위치가 있습니다.");
  expect(operationsDoc.includes("Google Search Console"), "운영 문서에 검색 유입 확인 위치가 있습니다.");
  expect(operationsDoc.includes("네이버 서치어드바이저"), "운영 문서에 네이버 수집 확인 위치가 있습니다.");
  expect(operationsDoc.includes("Google AdSense"), "운영 문서에 광고 수익 확인 위치가 있습니다.");
  expect(operationsDoc.includes("audit:live"), "운영 문서에 공개 배포 점검 명령이 있습니다.");
}

if (fs.existsSync(PACKAGE_JSON)) {
  const pkg = readJson("package.json");
  expect(pkg.scripts?.build === "npm run build:static && npm run test:static", "package.json의 build 명령이 정적 빌드와 테스트를 실행합니다.");
  expect(pkg.scripts?.verify?.includes("npm run audit:launch"), "package.json의 verify 명령이 출시 감사를 포함합니다.");
}

if (fs.existsSync(WRANGLER_CONFIG)) {
  const wrangler = readJson("wrangler.jsonc");
  expect(wrangler.name === "harutool", "wrangler.jsonc의 Pages 프로젝트 이름이 harutool입니다.");
  expect(wrangler.pages_build_output_dir === "./dist", "wrangler.jsonc의 Pages 출력 디렉터리가 ./dist입니다.");
}

for (const file of requiredFiles) {
  expect(fs.existsSync(path.join(DIST, file)), `${file} 파일이 있습니다.`);
}

if (fs.existsSync(path.join(DIST, "robots.txt")) && fs.existsSync(path.join(DIST, "sitemap.xml"))) {
  const robots = readDist("robots.txt");
  const sitemap = readDist("sitemap.xml");
  const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);

  expect(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`), "robots.txt가 공개 sitemap URL을 가리킵니다.");
  expect(!/localhost|127\.0\.0\.1/.test(sitemap), "sitemap에 로컬 주소가 없습니다.");
  expect(lastmods.length === sitemapLocations.length, "sitemap의 모든 URL에 lastmod가 있습니다.");

  for (const route of requiredPublicRoutes) {
    expect(sitemapLocations.includes(`${SITE_URL}${route}`), `sitemap에 ${route}가 있습니다.`);
  }
}

if (fs.existsSync(path.join(DIST, "index.html"))) {
  const index = readDist("index.html");
  expect(index.includes(`<link rel="canonical" href="${SITE_URL}/"`), "홈 canonical이 공개 URL입니다.");
  expect(index.includes('"@type":"Organization"'), "홈 구조화 데이터에 Organization이 있습니다.");
  expect(index.includes('"@type":"ItemList"'), "홈 구조화 데이터에 도구 목록이 있습니다.");
  if (fs.existsSync(path.join(DIST, "app.js"))) {
    expectAdConsentGate(index, readDist("app.js"));
  }
}

if (fs.existsSync(path.join(DIST, "404.html"))) {
  const notFound = readDist("404.html");
  expect(notFound.includes('<meta name="robots" content="noindex, follow"'), "404.html이 noindex로 설정되어 있습니다.");
  expect(notFound.includes('<span class="error-code">404</span>'), "404.html에 404 안내가 있습니다.");
}

if (fs.existsSync(path.join(DIST, "privacy.html"))) {
  const privacy = readDist("privacy.html");
  expect(privacy.includes("Cloudflare Web Analytics"), "개인정보처리방침에 방문 통계 도구가 안내되어 있습니다.");
  expect(privacy.includes("Core Web Vitals"), "개인정보처리방침에 성능 지표 사용 목적이 안내되어 있습니다.");
  expect(privacy.includes("Google AdSense"), "개인정보처리방침에 Google 광고 제공자가 안내되어 있습니다.");
  expect(privacy.includes("선택 쿠키에 동의한 뒤에만 광고 스크립트"), "개인정보처리방침에 광고 동의 후 로드 원칙이 안내되어 있습니다.");
  expect(privacy.includes("Google 광고 설정"), "개인정보처리방침에 맞춤 광고 관리 링크가 안내되어 있습니다.");
}

for (const [file, expectation] of Object.entries(landingExpectations)) {
  if (!fs.existsSync(path.join(DIST, file))) {
    fail(`${file} 랜딩 페이지가 없습니다.`);
    continue;
  }
  const html = readDist(file);
  expect(html.includes('"@type":"CollectionPage"'), `${file}에 CollectionPage 구조화 데이터가 있습니다.`);
  expect(html.includes('"@type":"FAQPage"'), `${file}에 FAQPage 구조화 데이터가 있습니다.`);
  for (const keyword of expectation.keywords) {
    expect(html.includes(keyword), `${file}에 ${keyword} 문구가 있습니다.`);
  }
  for (const toolLink of expectation.toolLinks) {
    expect(html.includes(`href="${toolLink}"`), `${file}에서 ${toolLink}로 연결됩니다.`);
  }
}

for (const file of existingHtmlFiles()) {
  const html = readDist(file);
  expect(!html.includes("{{"), `${file}에 템플릿 자리표시자가 남아 있지 않습니다.`);
  expect(!/localhost|127\.0\.0\.1/.test(html), `${file}에 로컬 주소가 없습니다.`);
  if (process.env.GOOGLE_SITE_VERIFICATION) {
    expect(html.includes(verificationMeta("google-site-verification", process.env.GOOGLE_SITE_VERIFICATION)), `${file}에 Google Search Console 인증 메타가 있습니다.`);
  }
  if (process.env.NAVER_SITE_VERIFICATION) {
    expect(html.includes(verificationMeta("naver-site-verification", process.env.NAVER_SITE_VERIFICATION)), `${file}에 네이버 서치어드바이저 인증 메타가 있습니다.`);
  }
}

if (fs.existsSync(path.join(DIST, "_headers"))) {
  const headers = readDist("_headers");
  expect(headers.includes("X-Content-Type-Options: nosniff"), "보안 헤더 nosniff가 설정되어 있습니다.");
  expect(headers.includes("X-Frame-Options: DENY"), "프레임 차단 헤더가 설정되어 있습니다.");
  expect(headers.includes("Permissions-Policy:"), "권한 정책 헤더가 설정되어 있습니다.");
  expect(headers.includes("Cache-Control: public, max-age=31536000, immutable"), "정적 자산 장기 캐시가 설정되어 있습니다.");
}

if (fs.existsSync(path.join(DIST, "_redirects"))) {
  const redirects = readDist("_redirects");
  for (const route of requiredPublicRoutes.filter((route) => route !== "/")) {
    expect(redirects.includes(`${route}.html ${route} 301`), `${route}.html 리다이렉트가 있습니다.`);
    expect(redirects.includes(`${route}/ ${route} 301`), `${route}/ 리다이렉트가 있습니다.`);
  }
}

if (process.env.ADSENSE_CLIENT) {
  expect(/^ca-pub-\d{16}$/.test(process.env.ADSENSE_CLIENT), "ADSENSE_CLIENT 형식이 올바릅니다.");
  expect(fs.existsSync(path.join(DIST, "ads.txt")), "AdSense 설정 시 ads.txt가 생성됩니다.");
  if (fs.existsSync(path.join(DIST, "ads.txt"))) {
    expect(readDist("ads.txt") === `google.com, ${process.env.ADSENSE_CLIENT.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`, "ads.txt 게시자 ID가 ADSENSE_CLIENT와 일치합니다.");
  }
} else {
  pass("AdSense 미설정 상태입니다. 승인 전이면 정상입니다.");
  expect(!fs.existsSync(path.join(DIST, "ads.txt")), "AdSense 미설정 상태에서는 ads.txt가 생성되지 않습니다.");
}

if (process.env.CLOUDFLARE_WEB_ANALYTICS_TOKEN) {
  for (const file of existingHtmlFiles()) {
    expect(readDist(file).includes("static.cloudflareinsights.com/beacon.min.js"), `${file}에 Cloudflare Web Analytics가 삽입됩니다.`);
  }
} else {
  pass("Cloudflare Web Analytics 토큰 미설정 상태입니다. 토큰 추가 전이면 정상입니다.");
  for (const file of existingHtmlFiles()) {
    expect(!readDist(file).includes("static.cloudflareinsights.com/beacon.min.js"), `${file}에 Analytics 스크립트가 잘못 삽입되지 않았습니다.`);
  }
}

for (const check of checks) {
  console.log(`${check.ok ? "✓" : "✗"} ${check.message}`);
}

const failures = checks.filter((check) => !check.ok);
if (failures.length) {
  console.error(`\n출시 점검 실패: ${failures.length}개 항목을 확인하세요.`);
  process.exit(1);
}

console.log("\n출시 점검 통과");
