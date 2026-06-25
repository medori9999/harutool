const https = require("node:https");
const http = require("node:http");

const SITE_URL = (process.env.SITE_URL || "https://harutool.pages.dev").replace(/\/$/, "");
const CLOUDFLARE_WEB_ANALYTICS_TOKEN = process.env.CLOUDFLARE_WEB_ANALYTICS_TOKEN || "";
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION || "";
const NAVER_SITE_VERIFICATION = process.env.NAVER_SITE_VERIFICATION || "";

const requiredRoutes = [
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

const landingExpectations = {
  "/business": {
    keywords: ["사업자 계산기 모음", "스마트스토어", "마진율", "부가세"],
    toolLinks: ["/tools/margin-calculator", "/tools/vat-calculator", "/tools/discount-calculator"]
  },
  "/finance": {
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

function request(pathname, options = {}) {
  const url = new URL(pathname, SITE_URL);
  const client = url.protocol === "http:" ? http : https;

  return new Promise((resolve, reject) => {
    const req = client.request(url, { method: options.method || "GET", timeout: 10000 }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => resolve({ statusCode: res.statusCode, headers: res.headers, body, url }));
    });

    req.on("timeout", () => {
      req.destroy(new Error(`${url.href} 요청 시간이 초과되었습니다.`));
    });
    req.on("error", reject);
    req.end();
  });
}

function expect(condition, message) {
  if (condition) pass(message);
  else fail(message);
}

function expectImmutableAsset(response, pathname, expectedType) {
  const cacheControl = response.headers["cache-control"] || "";
  const contentType = response.headers["content-type"] || "";

  expect(response.statusCode === 200, `${pathname} 정적 자산이 200으로 응답합니다.`);
  expect(cacheControl.includes("public"), `${pathname}에 public 캐시 정책이 있습니다.`);
  expect(cacheControl.includes("max-age=31536000"), `${pathname}에 1년 max-age 캐시가 있습니다.`);
  expect(cacheControl.includes("immutable"), `${pathname}에 immutable 캐시가 있습니다.`);
  expect(contentType.includes(expectedType), `${pathname} Content-Type이 ${expectedType}입니다.`);
}

function expectIndexableRoute(response, route) {
  const contentType = response.headers["content-type"] || "";

  expect(response.statusCode === 200, `${route} 공개 URL이 200으로 응답합니다.`);
  expect(contentType.includes("text/html"), `${route}가 HTML로 응답합니다.`);
  expect(response.body.includes(`<link rel="canonical" href="${SITE_URL}${route === "/" ? "/" : route}"`), `${route} canonical이 공개 URL과 일치합니다.`);
  expect(response.body.includes('<meta name="robots" content="index, follow"'), `${route}가 index, follow로 설정되어 있습니다.`);
  expect(/<meta name="description" content="[^"]+"/.test(response.body), `${route}에 검색 설명 메타가 있습니다.`);
  expect(/<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/.test(response.body), `${route}에 대표 제목 h1이 있습니다.`);
  expect(!response.body.includes("{{"), `${route}에 템플릿 자리표시자가 없습니다.`);
  expect(!/localhost|127\.0\.0\.1/.test(response.body), `${route}에 로컬 주소가 없습니다.`);
}

function expectLandingPage(response, route) {
  const expectation = landingExpectations[route];
  if (!expectation) return;

  expect(response.body.includes('"@type":"CollectionPage"'), `${route}에 CollectionPage 구조화 데이터가 있습니다.`);
  expect(response.body.includes('"@type":"FAQPage"'), `${route}에 FAQPage 구조화 데이터가 있습니다.`);
  for (const keyword of expectation.keywords) {
    expect(response.body.includes(keyword), `${route}에 ${keyword} 문구가 있습니다.`);
  }
  for (const toolLink of expectation.toolLinks) {
    expect(response.body.includes(`href="${toolLink}"`), `${route}에서 ${toolLink}로 연결됩니다.`);
  }
}

function expectAnalyticsState(response, route) {
  const hasBeacon = response.body.includes("static.cloudflareinsights.com/beacon.min.js");

  if (CLOUDFLARE_WEB_ANALYTICS_TOKEN) {
    expect(hasBeacon, `${route}에 Cloudflare Web Analytics 스크립트가 있습니다.`);
    expect(response.body.includes(CLOUDFLARE_WEB_ANALYTICS_TOKEN), `${route}에 Cloudflare Web Analytics 토큰이 있습니다.`);
  } else {
    expect(!hasBeacon, `${route}에 Analytics 스크립트가 잘못 삽입되지 않았습니다.`);
  }
}

function expectSearchVerificationState(response, route) {
  if (GOOGLE_SITE_VERIFICATION) {
    expect(
      response.body.includes(`<meta name="google-site-verification" content="${GOOGLE_SITE_VERIFICATION}"`),
      `${route}에 Google Search Console 인증 메타가 있습니다.`
    );
  }
  if (NAVER_SITE_VERIFICATION) {
    expect(
      response.body.includes(`<meta name="naver-site-verification" content="${NAVER_SITE_VERIFICATION}"`),
      `${route}에 네이버 서치어드바이저 인증 메타가 있습니다.`
    );
  }
}

function expectAdConsentGate(home, appJs) {
  expect(home.body.includes('id="consent-banner"'), "공개 홈에 쿠키 동의 배너가 있습니다.");
  expect(home.body.includes('id="consent-essential"'), "공개 홈에 필수만 허용 버튼이 있습니다.");
  expect(home.body.includes('id="consent-accept"'), "공개 홈에 선택 쿠키 동의 버튼이 있습니다.");
  expect(home.body.includes('id="cookie-settings"'), "공개 홈에 쿠키 설정 재열기 버튼이 있습니다.");
  expect(appJs.body.includes('localStorage.getItem("harutool-consent")'), "공개 앱이 쿠키 동의 선택을 확인합니다.");
  expect(appJs.body.includes('if (!saved) banner.hidden = false;'), "공개 앱은 동의 기록이 없으면 배너를 표시합니다.");
  expect(appJs.body.includes('if (saved === "accepted") loadAds();'), "공개 앱은 저장된 선택 동의가 있을 때만 광고를 로드합니다.");
  expect(appJs.body.includes('if (value === "accepted") loadAds();'), "공개 앱은 새 선택 동의가 있을 때만 광고를 로드합니다.");
  expect(appJs.body.includes('setConsent("essential")'), "공개 앱의 필수만 허용 선택은 광고 로드와 분리되어 있습니다.");
  expect(appJs.body.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"), "공개 앱에 AdSense 스크립트 로드 위치가 있습니다.");
}

async function main() {
  const home = await request("/");
  expect(home.statusCode === 200, "홈이 200으로 응답합니다.");
  expect(home.headers["x-content-type-options"] === "nosniff", "공개 홈에 nosniff 헤더가 있습니다.");
  expect(home.headers["x-frame-options"] === "DENY", "공개 홈에 X-Frame-Options 헤더가 있습니다.");
  expect(home.headers["permissions-policy"]?.includes("geolocation=()"), "공개 홈에 Permissions-Policy 헤더가 있습니다.");
  expect(home.body.includes(`<link rel="canonical" href="${SITE_URL}/"`), "공개 홈 canonical이 SITE_URL과 일치합니다.");
  expect(home.body.includes('"@type":"Organization"'), "공개 홈 구조화 데이터에 Organization이 있습니다.");
  expect(!home.body.includes("{{"), "공개 홈에 템플릿 자리표시자가 없습니다.");
  expect(!/localhost|127\.0\.0\.1/.test(home.body), "공개 홈에 로컬 주소가 없습니다.");

  const appScript = await request("/app.js?v=12", { method: "HEAD" });
  expectImmutableAsset(appScript, "/app.js", "javascript");
  const appSource = await request("/app.js?v=12");
  expect(appSource.statusCode === 200, "/app.js 소스가 200으로 응답합니다.");
  expectAdConsentGate(home, appSource);

  const stylesheet = await request("/styles.css?v=7", { method: "HEAD" });
  expectImmutableAsset(stylesheet, "/styles.css", "text/css");

  const favicon = await request("/favicon.svg", { method: "HEAD" });
  expectImmutableAsset(favicon, "/favicon.svg", "image/svg+xml");

  const robots = await request("/robots.txt");
  expect(robots.statusCode === 200, "robots.txt가 200으로 응답합니다.");
  expect(robots.body.includes(`Sitemap: ${SITE_URL}/sitemap.xml`), "robots.txt가 공개 sitemap URL을 가리킵니다.");

  const sitemap = await request("/sitemap.xml");
  expect(sitemap.statusCode === 200, "sitemap.xml이 200으로 응답합니다.");
  const locations = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const lastmods = [...sitemap.body.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
  expect(lastmods.length === locations.length, "공개 sitemap의 모든 URL에 lastmod가 있습니다.");
  expect(!/localhost|127\.0\.0\.1/.test(sitemap.body), "공개 sitemap에 로컬 주소가 없습니다.");
  for (const route of requiredRoutes) {
    expect(locations.includes(`${SITE_URL}${route}`), `공개 sitemap에 ${route}가 있습니다.`);
  }

  for (const route of requiredRoutes) {
    const page = route === "/" ? home : await request(route);
    expectIndexableRoute(page, route);
    expectLandingPage(page, route);
    expectAnalyticsState(page, route);
    expectSearchVerificationState(page, route);
  }

  const legacyAbout = await request("/about.html", { method: "HEAD" });
  expect(legacyAbout.statusCode === 301, "/about.html이 301로 리다이렉트됩니다.");
  expect(legacyAbout.headers.location === "/about", "/about.html 리다이렉트 목적지가 /about입니다.");

  const privacy = await request("/privacy");
  expect(privacy.statusCode === 200, "/privacy가 200으로 응답합니다.");
  expect(privacy.body.includes(`<link rel="canonical" href="${SITE_URL}/privacy"`), "/privacy canonical이 SITE_URL과 일치합니다.");
  expect(privacy.body.includes('"@type":"WebPage"'), "/privacy 구조화 데이터에 WebPage가 있습니다.");
  expect(privacy.body.includes("Cloudflare Web Analytics"), "/privacy에 방문 통계 도구 안내가 있습니다.");
  expect(privacy.body.includes("Core Web Vitals"), "/privacy에 성능 지표 사용 목적 안내가 있습니다.");
  expect(privacy.body.includes("Google AdSense"), "/privacy에 Google 광고 제공자 안내가 있습니다.");
  expect(privacy.body.includes("선택 쿠키에 동의한 뒤에만 광고 스크립트"), "/privacy에 광고 동의 후 로드 원칙 안내가 있습니다.");
  expect(privacy.body.includes("Google 광고 설정"), "/privacy에 맞춤 광고 관리 링크 안내가 있습니다.");

  const missing = await request("/missing-page-for-audit");
  expect(missing.statusCode === 404, "없는 공개 URL이 404로 응답합니다.");
  expect(missing.body.includes('<meta name="robots" content="noindex, follow"'), "없는 공개 URL이 noindex로 설정되어 있습니다.");
  expect(missing.body.includes('<span class="error-code">404</span>'), "없는 공개 URL에 404 안내가 있습니다.");

  const ads = await request("/ads.txt");
  if (process.env.ADSENSE_CLIENT) {
    expect(ads.statusCode === 200, "AdSense 설정 시 공개 ads.txt가 200으로 응답합니다.");
    expect(ads.body === `google.com, ${process.env.ADSENSE_CLIENT.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`, "공개 ads.txt 게시자 ID가 ADSENSE_CLIENT와 일치합니다.");
  } else {
    expect(ads.statusCode === 404, "AdSense 미설정 상태에서는 공개 ads.txt가 404입니다.");
  }

  for (const check of checks) {
    console.log(`${check.ok ? "✓" : "✗"} ${check.message}`);
  }

  const failures = checks.filter((check) => !check.ok);
  if (failures.length) {
    console.error(`\n공개 배포 점검 실패: ${failures.length}개 항목을 확인하세요.`);
    process.exit(1);
  }

  console.log("\n공개 배포 점검 통과");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
