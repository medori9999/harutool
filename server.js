const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");
const ADSENSE_CLIENT = process.env.ADSENSE_CLIENT || "";
const ADSENSE_TOP_SLOT = process.env.ADSENSE_TOP_SLOT || "";
const ADSENSE_SIDE_SLOT = process.env.ADSENSE_SIDE_SLOT || "";
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION || "";
const NAVER_SITE_VERIFICATION = process.env.NAVER_SITE_VERIFICATION || "";
const notFoundMeta = {
  title: "페이지를 찾을 수 없습니다 | 하루툴",
  description: "요청한 페이지가 없거나 주소가 변경되었습니다."
};

const tools = {
  "/": {
    name: "하루툴",
    title: "하루툴 - 매일 쓰는 계산기와 텍스트 도구",
    description: "글자 수 세기, 퍼센트·할인·날짜 계산, 랜덤 추첨, 비밀번호 생성까지 필요한 도구를 바로 사용하세요."
  },
  "/tools/character-counter": {
    name: "글자 수 세기",
    title: "글자 수 세기 - 공백 포함·제외, 바이트 계산 | 하루툴",
    description: "자기소개서, 블로그, SNS 문장의 글자 수와 공백 제외 글자 수, 단어 수, 바이트를 실시간으로 계산합니다."
  },
  "/tools/percentage-calculator": {
    name: "퍼센트 계산기",
    title: "퍼센트 계산기 - 비율·증감률 바로 계산 | 하루툴",
    description: "전체의 몇 퍼센트인지, 퍼센트에 해당하는 값과 증가율·감소율을 빠르게 계산하세요."
  },
  "/tools/discount-calculator": {
    name: "할인 계산기",
    title: "할인 계산기 - 할인율·최종 가격 계산 | 하루툴",
    description: "원래 가격과 할인율을 입력하면 할인 금액과 최종 결제 금액을 즉시 계산합니다."
  },
  "/tools/dday-calculator": {
    name: "디데이 계산기",
    title: "디데이 계산기 - 날짜 차이·기념일 계산 | 하루툴",
    description: "오늘부터 목표일까지 남은 날짜와 두 날짜 사이의 기간을 간편하게 계산합니다."
  },
  "/tools/random-picker": {
    name: "랜덤 뽑기",
    title: "랜덤 뽑기 - 이름·메뉴·순서 추첨 | 하루툴",
    description: "참가자나 메뉴를 줄마다 입력해 공정하게 한 명 또는 여러 항목을 무작위로 뽑으세요."
  },
  "/tools/password-generator": {
    name: "비밀번호 생성기",
    title: "안전한 비밀번호 생성기 - 랜덤 암호 만들기 | 하루툴",
    description: "길이와 문자 구성을 선택해 브라우저 안에서 안전한 랜덤 비밀번호를 생성합니다."
  },
  "/tools/text-cleaner": {
    name: "텍스트 정리기",
    title: "텍스트 정리기 - 공백·빈 줄·중복 줄 제거 | 하루툴",
    description: "복사한 텍스트의 불필요한 공백과 빈 줄, 중복 줄을 클릭 한 번으로 정리합니다."
  },
  "/tools/pyeong-calculator": {
    name: "평수 계산기",
    title: "평수 계산기 - 제곱미터(㎡) 평 변환 | 하루툴",
    description: "아파트와 토지 면적의 제곱미터(㎡)를 평으로, 평을 제곱미터로 빠르고 정확하게 변환합니다."
  },
  "/tools/age-calculator": {
    name: "만 나이 계산기",
    title: "만 나이 계산기 - 생년월일로 현재 나이 계산 | 하루툴",
    description: "생년월일과 기준일을 입력해 만 나이, 세는나이와 다음 생일까지 남은 날짜를 계산합니다."
  },
  "/tools/unit-converter": {
    name: "단위 변환기",
    title: "단위 변환기 - 길이·무게·온도 변환 | 하루툴",
    description: "길이, 무게, 온도의 다양한 단위를 설치 없이 간편하게 변환합니다."
  },
  "/tools/loan-calculator": {
    name: "대출 이자 계산기",
    title: "대출 이자 계산기 - 월 상환금·총이자 계산 | 하루툴",
    description: "대출금, 연이율, 기간을 입력해 원리금균등상환의 월 납입금과 총이자를 계산합니다."
  },
  "/tools/compound-interest-calculator": {
    name: "복리 계산기",
    title: "복리 계산기 - 적립식 투자 수익 계산 | 하루툴",
    description: "초기 투자금과 월 적립금, 수익률, 기간을 입력해 복리로 늘어나는 예상 자산을 계산합니다."
  },
  "/tools/time-calculator": {
    name: "시간 계산기",
    title: "시간 계산기 - 근무시간·시간 차이 계산 | 하루툴",
    description: "시작 시각과 종료 시각, 휴게시간을 입력해 실제 경과 시간과 근무시간을 계산합니다."
  },
  "/tools/average-calculator": {
    name: "평균 계산기",
    title: "평균 계산기 - 산술평균·중앙값·합계 계산 | 하루툴",
    description: "숫자 목록을 입력해 산술평균, 중앙값, 합계, 최솟값과 최댓값을 한 번에 계산합니다."
  },
  "/tools/vat-calculator": {
    name: "부가세 계산기",
    title: "부가세 계산기 - 공급가액·VAT·합계금액 계산 | 하루툴",
    description: "공급가액 또는 부가세 포함 금액을 입력해 공급가액, 부가가치세와 합계금액을 계산합니다."
  },
  "/tools/margin-calculator": {
    name: "마진율 계산기",
    title: "마진율 계산기 - 판매가·원가·수수료 순이익 계산 | 하루툴",
    description: "판매가, 상품 원가와 판매 수수료를 입력해 순이익, 마진율, 원가율과 손익분기 판매가를 계산합니다."
  },
  "/tools/fuel-cost-calculator": {
    name: "유류비 계산기",
    title: "유류비 계산기 - 주행거리·연비·기름값 계산 | 하루툴",
    description: "주행거리, 차량 연비와 리터당 유가를 입력해 필요한 연료량, 예상 유류비와 인원별 정산 금액을 계산합니다."
  }
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function send(res, status, body, contentType, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": contentType.includes("text/html") ? "no-cache" : "public, max-age=3600",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    ...extraHeaders
  });
  res.end(body);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toolEntries() {
  return Object.entries(tools).filter(([route]) => route !== "/");
}

function renderInitialContent(route, meta) {
  if (route === "/404") {
    return `<div class="not-found"><span class="error-code">404</span><h1>길을 조금 잘못 찾았어요.</h1><p>${escapeHtml(meta.description)}</p><a class="btn btn-primary" href="/">모든 도구 보러 가기</a></div>`;
  }

  if (route === "/") {
    const cards = toolEntries().map(([toolRoute, tool]) => `
      <a class="tool-card compact-card" href="${toolRoute}">
        <span class="arrow">↗</span>
        <h3>${escapeHtml(tool.name)}</h3>
        <p>${escapeHtml(tool.description)}</p>
      </a>`).join("");
    return `<div class="home initial-content">
      <section class="hero">
        <p class="eyebrow">● 매일 쓰는 실용 도구</p>
        <h1>필요할 때 바로 쓰는<br><span>작고 빠른 도구</span></h1>
        <p>${escapeHtml(meta.description)}</p>
      </section>
      <section id="all-tools">
        <div class="section-head"><div><h2>오늘 필요한 도구</h2><p>${toolEntries().length}개의 도구가 있습니다.</p></div></div>
        <div class="tool-grid">${cards}</div>
      </section>
    </div>`;
  }

  const related = toolEntries()
    .filter(([toolRoute]) => toolRoute !== route)
    .slice(0, 4)
    .map(([toolRoute, tool]) => `<li><a href="${toolRoute}">${escapeHtml(tool.name)}</a></li>`)
    .join("");
  return `<div class="tool-page initial-content">
    <div class="breadcrumbs"><a href="/">홈</a> &nbsp;/&nbsp; ${escapeHtml(meta.name)}</div>
    <header class="tool-header"><h1>${escapeHtml(meta.name)}</h1><p>${escapeHtml(meta.description)}</p></header>
    <section class="tool-box initial-tool-box">
      <h2>${escapeHtml(meta.name)} 사용하기</h2>
      <p>계산 도구를 불러오는 중입니다. 잠시 후 입력 화면이 표시됩니다.</p>
    </section>
    <section class="info-section"><h2>함께 사용하는 도구</h2><ul class="server-link-list">${related}</ul></section>
  </div>`;
}

function structuredData(route, meta, canonical) {
  let data;
  if (route === "/") {
    data = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebSite", name: "하루툴", url: canonical, description: meta.description, inLanguage: "ko-KR" },
        {
          "@type": "ItemList",
          name: "하루툴 도구 목록",
          itemListElement: toolEntries().map(([toolRoute, tool], index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: tool.name,
            url: `${canonical.replace(/\/$/, "")}${toolRoute}`
          }))
        }
      ]
    };
  } else if (route === "/404") {
    data = { "@context": "https://schema.org", "@type": "WebPage", name: meta.title };
  } else {
    data = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          name: meta.name,
          url: canonical,
          description: meta.description,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          browserRequirements: "JavaScript",
          inLanguage: "ko-KR"
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "홈", item: canonical.replace(route, "/") },
            { "@type": "ListItem", position: 2, name: meta.name, item: canonical }
          ]
        }
      ]
    };
  }
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}

function renderHtml(route) {
  const meta = route === "/404" ? notFoundMeta : (tools[route] || tools["/"]);
  const template = fs.readFileSync(path.join(PUBLIC_DIR, "index.html"), "utf8");
  const baseUrl = process.env.SITE_URL || "http://localhost:3000";
  const canonical = `${baseUrl.replace(/\/$/, "")}${route}`;
  return template
    .replaceAll("{{TITLE}}", meta.title)
    .replaceAll("{{DESCRIPTION}}", meta.description)
    .replaceAll("{{CANONICAL}}", canonical)
    .replace("{{ROBOTS}}", route === "/404" ? "noindex, follow" : "index, follow")
    .replace("{{STRUCTURED_DATA}}", structuredData(route, meta, canonical))
    .replace("{{ADSENSE_META}}", ADSENSE_CLIENT ? `<meta name="google-adsense-account" content="${escapeHtml(ADSENSE_CLIENT)}" />` : "")
    .replace("{{SEARCH_VERIFICATION}}", [
      GOOGLE_SITE_VERIFICATION ? `<meta name="google-site-verification" content="${escapeHtml(GOOGLE_SITE_VERIFICATION)}" />` : "",
      NAVER_SITE_VERIFICATION ? `<meta name="naver-site-verification" content="${escapeHtml(NAVER_SITE_VERIFICATION)}" />` : ""
    ].filter(Boolean).join("\n    "))
    .replace("{{APP_CONFIG}}", JSON.stringify({
      adsenseClient: ADSENSE_CLIENT,
      adSlots: { top: ADSENSE_TOP_SLOT, side: ADSENSE_SIDE_SLOT }
    }).replaceAll("<", "\\u003c"))
    .replace("{{ROUTE}}", JSON.stringify(route))
    .replace("{{INITIAL_CONTENT}}", renderInitialContent(route, meta));
}

function sitemap() {
  const baseUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const routes = [...Object.keys(tools), "/about.html", "/terms.html", "/privacy.html", "/contact.html"];
  const urls = routes
    .map((route) => `<url><loc>${baseUrl}${route}</loc></url>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

function createServer() {
  return http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const route = requestUrl.pathname.replace(/\/+$/, "") || "/";

  if (req.method !== "GET") {
    send(res, 405, "Method Not Allowed", "text/plain; charset=utf-8", { Allow: "GET" });
    return;
  }

  if (route === "/health") {
    send(res, 200, JSON.stringify({ ok: true }), "application/json; charset=utf-8");
    return;
  }

  if (route === "/sitemap.xml") {
    send(res, 200, sitemap(), mimeTypes[".xml"]);
    return;
  }

  if (route === "/robots.txt") {
    const baseUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
    send(res, 200, `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`, mimeTypes[".txt"]);
    return;
  }

  if (route === "/ads.txt") {
    if (!ADSENSE_CLIENT) {
      send(res, 404, "# AdSense publisher ID is not configured.\n", mimeTypes[".txt"]);
      return;
    }
    const publisherId = ADSENSE_CLIENT.replace(/^ca-/, "");
    send(res, 200, `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, mimeTypes[".txt"]);
    return;
  }

  if (tools[route]) {
    send(res, 200, renderHtml(route), mimeTypes[".html"]);
    return;
  }

  const requestedFile = path.normalize(path.join(PUBLIC_DIR, route));
  if (!requestedFile.startsWith(PUBLIC_DIR)) {
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  fs.stat(requestedFile, (error, stats) => {
    if (error || !stats.isFile()) {
      send(res, 404, renderHtml("/404"), mimeTypes[".html"]);
      return;
    }
    const ext = path.extname(requestedFile);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": [".js", ".css"].includes(ext) ? "no-cache" : "public, max-age=3600",
      "X-Content-Type-Options": "nosniff"
    });
    fs.createReadStream(requestedFile).pipe(res);
  });
  });
}

if (require.main === module) {
  createServer().listen(PORT, () => {
    console.log(`하루툴이 http://localhost:${PORT} 에서 실행 중입니다.`);
  });
}

module.exports = {
  createServer,
  renderHtml,
  sitemap,
  tools
};
