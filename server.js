const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");

function normalizeAdsenseClient(value) {
  const client = value || "";
  if (!client) return "";
  if (!/^ca-pub-\d{16}$/.test(client)) {
    throw new Error("ADSENSE_CLIENT must match ca-pub- followed by 16 digits.");
  }
  return client;
}

const ADSENSE_CLIENT = normalizeAdsenseClient(process.env.ADSENSE_CLIENT);
const ADSENSE_TOP_SLOT = process.env.ADSENSE_TOP_SLOT || "";
const ADSENSE_SIDE_SLOT = process.env.ADSENSE_SIDE_SLOT || "";
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION || "";
const NAVER_SITE_VERIFICATION = process.env.NAVER_SITE_VERIFICATION || "";
const CLOUDFLARE_WEB_ANALYTICS_TOKEN = process.env.CLOUDFLARE_WEB_ANALYTICS_TOKEN || "";
const SITEMAP_LASTMOD = process.env.SITEMAP_LASTMOD || new Date().toISOString().slice(0, 10);
const notFoundMeta = {
  title: "페이지를 찾을 수 없습니다 | 하루툴",
  description: "요청한 페이지가 없거나 주소가 변경되었습니다."
};
const trustPages = {
  "/about": "about.html",
  "/terms": "terms.html",
  "/privacy": "privacy.html",
  "/contact": "contact.html"
};
const trustPageMeta = {
  "/about": {
    title: "하루툴 소개",
    description: "하루툴이 만드는 계산기와 생활 도구의 운영 원칙을 소개합니다."
  },
  "/terms": {
    title: "이용약관 | 하루툴",
    description: "하루툴 서비스 이용 조건과 계산 결과에 관한 안내입니다."
  },
  "/privacy": {
    title: "개인정보처리방침 | 하루툴",
    description: "하루툴 개인정보처리방침"
  },
  "/contact": {
    title: "문의 및 오류 제보 | 하루툴",
    description: "하루툴 계산 오류, 기능 제안과 광고 관련 문의 방법을 안내합니다."
  }
};

const landingPages = {
  "/business": {
    name: "사업자 계산기 모음",
    title: "사업자 계산기 모음 - 마진율·부가세·판매가 계산 | 하루툴",
    description: "스마트스토어, 온라인 판매, 프리랜서와 자영업자가 판매가, 마진율, 부가세, 할인, 대출 이자와 이동 비용을 빠르게 계산할 수 있는 실전 계산기 모음입니다.",
    tools: [
      "/tools/margin-calculator",
      "/tools/vat-calculator",
      "/tools/discount-calculator",
      "/tools/average-calculator",
      "/tools/loan-calculator",
      "/tools/fuel-cost-calculator"
    ],
    faqs: [
      ["판매가를 정할 때 무엇부터 계산해야 하나요?", "상품 원가, 플랫폼 수수료, 포장비, 배송비, 광고비를 먼저 더한 뒤 원하는 순이익을 남길 수 있는 판매가를 계산하는 편이 안전합니다."],
      ["마진율과 부가세 계산을 따로 해야 하나요?", "부가세 포함 가격으로 판매한다면 공급가액과 부가세를 먼저 나누고, 실제 비용과 수수료를 반영해 순이익 기준 마진율을 다시 확인하는 것이 좋습니다."],
      ["광고비도 마진 계산에 넣어야 하나요?", "실제 수익성을 보려면 광고비, 결제 수수료, 반품 비용처럼 반복적으로 발생하는 비용을 기타 비용에 포함하는 것이 좋습니다."]
    ]
  },
  "/business/smartstore-margin": {
    name: "스마트스토어 마진 계산",
    title: "스마트스토어 마진 계산 - 판매가·수수료·순이익 계산 | 하루툴",
    description: "스마트스토어 판매자가 상품 원가, 네이버페이 결제 수수료, 배송·포장비와 광고비를 반영해 판매가별 순이익과 마진율을 확인하는 계산 가이드입니다.",
    eyebrow: "스마트스토어 판매가·마진 계산",
    introTitle: "스마트스토어 판매가는 수수료와 운영비까지 넣어 봐야 합니다",
    intro: "상품 원가만 보고 판매가를 정하면 네이버페이 결제 수수료, 배송 보조, 포장비, 광고비를 뺀 실제 순이익이 작아질 수 있습니다. 먼저 마진율 계산기로 판매가별 순이익을 보고, 부가세와 할인 가능 범위를 이어서 확인해 보세요.",
    tools: [
      "/tools/margin-calculator",
      "/tools/vat-calculator",
      "/tools/discount-calculator",
      "/tools/average-calculator",
      "/tools/fuel-cost-calculator"
    ],
    steps: [
      ["판매가와 원가 입력", "마진율 계산기에 판매가, 상품 원가, 판매 수수료와 포장·배송 보조 비용을 넣습니다."],
      ["광고비 반영", "클릭 광고나 체험단 비용처럼 반복되는 비용은 기타 비용에 넣어 순이익을 보수적으로 확인합니다."],
      ["부가세 포함 가격 점검", "부가세 계산기로 공급가액과 VAT를 나눠 실제 매출 기준을 확인합니다."],
      ["할인 가능 범위 확인", "할인 계산기로 쿠폰 적용 후에도 손익분기 판매가 아래로 내려가지 않는지 봅니다."]
    ],
    faqs: [
      ["스마트스토어 마진율은 어떤 비용까지 넣어야 하나요?", "상품 원가, 결제 수수료, 포장비, 배송 보조금, 광고비, 반품 예상 비용처럼 반복적으로 발생하는 비용을 함께 넣는 것이 좋습니다."],
      ["판매 수수료는 몇 퍼센트로 넣어야 하나요?", "카테고리와 결제 방식에 따라 달라질 수 있으므로 실제 정산 화면이나 네이버 판매자센터 안내를 확인하고 평균 수수료를 입력하세요."],
      ["쿠폰 할인은 어디에 반영하나요?", "할인 후 판매가를 마진율 계산기에 다시 넣거나, 할인 계산기로 최종 판매가를 먼저 구한 뒤 순이익을 비교하면 됩니다."]
    ]
  },
  "/business/coupang-margin": {
    name: "쿠팡 판매가 마진 계산",
    title: "쿠팡 판매가 마진 계산 - 수수료·배송비·순이익 계산 | 하루툴",
    description: "쿠팡 판매자가 판매 수수료, 배송비, 원가, 포장비와 광고비를 반영해 판매가별 손익분기점과 마진율을 계산하는 페이지입니다.",
    eyebrow: "쿠팡 판매자 손익 계산",
    introTitle: "쿠팡 판매가는 수수료와 배송 조건을 같이 봐야 합니다",
    intro: "쿠팡은 카테고리 수수료, 배송 정책, 광고비, 반품 가능성을 함께 고려해야 실제 이익이 보입니다. 판매가를 정하기 전 손익분기 판매가와 할인 가능 범위를 먼저 계산해 두면 무리한 가격 경쟁을 피할 수 있습니다.",
    tools: [
      "/tools/margin-calculator",
      "/tools/discount-calculator",
      "/tools/vat-calculator",
      "/tools/average-calculator",
      "/tools/loan-calculator"
    ],
    steps: [
      ["카테고리 수수료 입력", "마진율 계산기의 판매 수수료에 쿠팡 카테고리별 수수료 또는 평균 정산 수수료를 입력합니다."],
      ["배송·포장비 포함", "판매자가 부담하는 배송비, 포장재, 사은품 비용은 기타 비용에 넣어 계산합니다."],
      ["손익분기 판매가 확인", "계산 결과의 손익분기 판매가를 기준으로 최저 판매가와 쿠폰 한도를 정합니다."],
      ["할인 후 이익 재확인", "할인 계산기로 쿠폰·프로모션 후 최종 판매가를 구하고 다시 마진율을 비교합니다."]
    ],
    faqs: [
      ["쿠팡 마진 계산에서 가장 많이 빠뜨리는 비용은 무엇인가요?", "배송비, 포장비, 광고비, 반품 비용, 카드·플랫폼 수수료처럼 상품 원가 밖의 비용이 자주 빠집니다."],
      ["로켓그로스나 판매 방식에 따라 계산이 달라지나요?", "네, 물류·배송·보관 비용 구조가 달라질 수 있으므로 실제 정산 기준에 맞춰 기타 비용과 수수료를 조정해야 합니다."],
      ["가격을 낮추면 무조건 판매량이 늘까요?", "가격 경쟁은 전환율을 높일 수 있지만, 손익분기점 아래로 내려가면 판매량이 늘어도 손실이 커질 수 있습니다."]
    ]
  },
  "/business/vat-price": {
    name: "부가세 포함 가격 계산",
    title: "부가세 포함 가격 계산 - 공급가액·VAT·합계금액 계산 | 하루툴",
    description: "부가세 포함 금액에서 공급가액과 VAT를 나누거나, 공급가액에 부가세를 더해 합계금액을 계산하는 사업자용 가격 계산 페이지입니다.",
    eyebrow: "공급가액·부가세·합계금액 계산",
    introTitle: "부가세 포함 가격인지 별도 가격인지 먼저 나눠야 합니다",
    intro: "거래처 견적, 온라인 판매가, 세금계산서 금액은 부가세 포함 여부에 따라 실제 매출과 세액이 달라집니다. 합계금액에서 공급가액을 나누고, 판매 마진 계산에는 어떤 금액을 기준으로 볼지 함께 확인하세요.",
    tools: [
      "/tools/vat-calculator",
      "/tools/margin-calculator",
      "/tools/discount-calculator",
      "/tools/percentage-calculator",
      "/tools/average-calculator"
    ],
    steps: [
      ["포함·별도 선택", "부가세 계산기에서 공급가액 기준인지 합계금액 기준인지 먼저 선택합니다."],
      ["공급가액과 VAT 분리", "부가세 포함 금액이라면 합계금액을 입력해 공급가액과 세액을 나눕니다."],
      ["마진 기준 확인", "마진율 계산기에는 실제 비용과 비교할 기준 금액을 맞춰 넣어 순이익을 확인합니다."],
      ["할인 후 금액 재계산", "할인이 들어간 경우 최종 결제 금액 기준으로 부가세와 마진을 다시 계산합니다."]
    ],
    faqs: [
      ["부가세 포함 금액에서 공급가액은 어떻게 구하나요?", "일반적인 10% 부가세 기준에서는 합계금액을 1.1로 나누면 공급가액, 합계금액에서 공급가액을 빼면 부가세가 됩니다."],
      ["마진 계산에는 부가세 포함 금액을 넣어야 하나요?", "비용과 매출을 같은 기준으로 비교해야 합니다. 세금 처리를 제외한 수익성을 보려면 공급가액 기준으로 맞춰 계산하는 편이 안전합니다."],
      ["면세나 영세율도 같은 방식인가요?", "아닙니다. 면세·영세율·간이과세 등은 조건이 다를 수 있으므로 세무 기준을 별도로 확인해야 합니다."]
    ]
  },
  "/finance": {
    name: "이자 계산기 모음",
    title: "이자 계산기 모음 - 대출·복리·퍼센트 계산 | 하루툴",
    description: "대출 월 상환금, 총이자, 복리 투자 수익, 퍼센트 증감률과 평균값을 한곳에서 비교해 보는 금융 계산기 모음입니다.",
    eyebrow: "대출·복리·퍼센트 계산",
    introTitle: "이자와 수익률은 같이 비교해야 합니다",
    intro: "대출은 월 납입금과 총이자를 확인해야 하고, 투자는 수익률과 기간에 따른 복리 효과를 함께 봐야 합니다. 금액을 결정하기 전 여러 계산기를 연결해서 현금흐름과 기대 수익을 같이 비교해 보세요.",
    tools: [
      "/tools/loan-calculator",
      "/tools/compound-interest-calculator",
      "/tools/percentage-calculator",
      "/tools/average-calculator",
      "/tools/discount-calculator",
      "/tools/time-calculator"
    ],
    faqs: [
      ["대출 이자는 무엇을 먼저 봐야 하나요?", "월 상환금만 보지 말고 전체 기간 동안 내는 총이자와 원금 대비 이자 비율을 함께 확인하는 것이 좋습니다."],
      ["복리 계산 결과를 그대로 믿어도 되나요?", "복리 계산은 고정 수익률을 가정한 예상치입니다. 실제 투자 수익률, 세금, 수수료와 손실 가능성은 별도로 고려해야 합니다."],
      ["퍼센트 계산은 금융 판단에 왜 필요한가요?", "금리 차이, 수익률 변화, 할인율, 증감률을 같은 기준으로 비교해야 대출과 투자 조건을 더 정확히 이해할 수 있습니다."]
    ],
    steps: [
      ["월 상환금 확인", "대출 이자 계산기로 매달 빠져나갈 금액과 총이자를 먼저 봅니다."],
      ["수익률 비교", "복리 계산기로 같은 금액을 투자했을 때의 장기 결과를 가정해 봅니다."],
      ["증감률 계산", "퍼센트 계산기로 금리·수익률·가격 변화 폭을 비교합니다."],
      ["평균값 점검", "평균 계산기로 여러 기간의 수익률이나 지출 값을 정리합니다."]
    ]
  }
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
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
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

function cloudflareWebAnalyticsScript() {
  if (!CLOUDFLARE_WEB_ANALYTICS_TOKEN) return "";
  const beacon = JSON.stringify({ token: CLOUDFLARE_WEB_ANALYTICS_TOKEN }).replaceAll("<", "\\u003c");
  return `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${escapeHtml(beacon)}'></script>`;
}

function trustPageStructuredData(meta, canonical) {
  const siteRoot = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteRoot}/#organization`,
        name: "하루툴",
        url: `${siteRoot}/`,
        logo: `${siteRoot}/favicon.svg`
      },
      {
        "@type": "WebPage",
        name: meta.title,
        url: canonical,
        description: meta.description,
        inLanguage: "ko-KR",
        publisher: { "@id": `${siteRoot}/#organization` }
      }
    ]
  }).replaceAll("<", "\\u003c");
}

function renderTrustPage(route) {
  const meta = trustPageMeta[route];
  const canonical = `${(process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "")}${route}`;
  const html = fs.readFileSync(path.join(PUBLIC_DIR, trustPages[route]), "utf8");
  const searchVerification = [
    GOOGLE_SITE_VERIFICATION ? `<meta name="google-site-verification" content="${escapeHtml(GOOGLE_SITE_VERIFICATION)}" />` : "",
    NAVER_SITE_VERIFICATION ? `<meta name="naver-site-verification" content="${escapeHtml(NAVER_SITE_VERIFICATION)}" />` : "",
    ADSENSE_CLIENT ? `<meta name="google-adsense-account" content="${escapeHtml(ADSENSE_CLIENT)}" />` : ""
  ].filter(Boolean).join("\n    ");
  const seoTags = [
    `<meta name="robots" content="index, follow" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:locale" content="ko_KR" />`,
    searchVerification,
    `<script type="application/ld+json">\n      ${trustPageStructuredData(meta, canonical)}\n    </script>`
  ].filter(Boolean).join("\n    ");
  const analytics = cloudflareWebAnalyticsScript();

  return html
    .replace(/(\s*<link rel="stylesheet")/, `\n    ${seoTags}$1`)
    .replace(/(\s*<\/body>)/, analytics ? `\n    ${analytics}$1` : "$1");
}

function toolEntries() {
  return Object.entries(tools).filter(([route]) => route !== "/");
}

function landingEntries() {
  return Object.entries(landingPages);
}

function renderInitialContent(route, meta) {
  if (route === "/404") {
    return `<div class="not-found"><span class="error-code">404</span><h1>길을 조금 잘못 찾았어요.</h1><p>${escapeHtml(meta.description)}</p><a class="btn btn-primary" href="/">모든 도구 보러 가기</a></div>`;
  }

  if (route === "/") {
    const landingCards = landingEntries().map(([landingRoute, landing]) => `
      <a class="landing-card" href="${landingRoute}">
        <span class="eyebrow">수익화 추천</span>
        <h3>${escapeHtml(landing.name)}</h3>
        <p>${escapeHtml(landing.description)}</p>
      </a>`).join("");
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
      <section class="landing-section">
        <div class="section-head"><div><h2>목적별 계산 모음</h2><p>검색 의도에 맞춰 묶은 실전 계산 페이지입니다.</p></div></div>
        <div class="landing-grid">${landingCards}</div>
      </section>
      <section id="all-tools">
        <div class="section-head"><div><h2>오늘 필요한 도구</h2><p>${toolEntries().length}개의 도구가 있습니다.</p></div></div>
        <div class="tool-grid">${cards}</div>
      </section>
    </div>`;
  }

  if (landingPages[route]) {
    const landing = landingPages[route];
    const toolCards = landing.tools.map((toolRoute) => {
      const tool = tools[toolRoute];
      return `<a class="tool-card compact-card" href="${toolRoute}">
        <span class="arrow">↗</span>
        <h3>${escapeHtml(tool.name)}</h3>
        <p>${escapeHtml(tool.description)}</p>
      </a>`;
    }).join("");
    const faqs = landing.faqs.map(([question, answer]) => `
      <details>
        <summary>${escapeHtml(question)}</summary>
        <p>${escapeHtml(answer)}</p>
      </details>`).join("");
    return `<div class="tool-page landing-page initial-content">
      <div class="breadcrumbs"><a href="/">홈</a> &nbsp;/&nbsp; ${escapeHtml(landing.name)}</div>
      <header class="tool-header"><p class="eyebrow">${escapeHtml(landing.eyebrow || "스마트스토어·자영업·프리랜서 계산")}</p><h1>${escapeHtml(landing.name)}</h1><p>${escapeHtml(landing.description)}</p></header>
      <section class="info-section landing-intro">
        <h2>${escapeHtml(landing.introTitle || "판매 전 숫자부터 확인하세요")}</h2>
        <p>${escapeHtml(landing.intro || "가격을 먼저 정하고 나중에 비용을 빼면 실제 순이익이 예상보다 작아질 수 있습니다. 마진율, 부가세, 할인, 평균 비용과 대출 이자를 함께 확인하면 광고비를 쓰기 전 손익 기준을 더 분명하게 잡을 수 있습니다.")}</p>
      </section>
      <section>
        <div class="section-head"><div><h2>사업자에게 먼저 필요한 계산기</h2><p>판매가와 비용 판단에 바로 쓰는 도구입니다.</p></div></div>
        <div class="tool-grid">${toolCards}</div>
      </section>
      ${landing.steps ? `<section class="info-section">
        <h2>계산 순서 추천</h2>
        <ol class="step-list">
          ${landing.steps.map(([title, description]) => `<li><strong>${escapeHtml(title)}</strong><span>${escapeHtml(description)}</span></li>`).join("")}
        </ol>
      </section>` : ""}
      <section class="info-section">
        <h2>자주 묻는 질문</h2>
        <div class="faq-list">${faqs}</div>
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
  const siteRoot = route === "/" ? canonical.replace(/\/$/, "") : canonical.replace(route, "");
  const organization = {
    "@type": "Organization",
    "@id": `${siteRoot}/#organization`,
    name: "하루툴",
    url: `${siteRoot}/`,
    logo: `${siteRoot}/favicon.svg`
  };
  let data;
  if (route === "/") {
    data = {
      "@context": "https://schema.org",
      "@graph": [
        organization,
        {
          "@type": "WebSite",
          "@id": `${siteRoot}/#website`,
          name: "하루툴",
          url: canonical,
          description: meta.description,
          inLanguage: "ko-KR",
          publisher: { "@id": organization["@id"] }
        },
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
  } else if (landingPages[route]) {
    const landing = landingPages[route];
    data = {
      "@context": "https://schema.org",
      "@graph": [
        organization,
        {
          "@type": "CollectionPage",
          name: landing.name,
          url: canonical,
          description: landing.description,
          inLanguage: "ko-KR",
          publisher: { "@id": organization["@id"] },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: landing.tools.map((toolRoute, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: tools[toolRoute].name,
              url: `${siteRoot}${toolRoute}`
            }))
          }
        },
        {
          "@type": "FAQPage",
          mainEntity: landing.faqs.map(([question, answer]) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer }
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
        organization,
        {
          "@type": "WebApplication",
          name: meta.name,
          url: canonical,
          description: meta.description,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          browserRequirements: "JavaScript",
          inLanguage: "ko-KR",
          provider: { "@id": organization["@id"] }
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
  const meta = route === "/404" ? notFoundMeta : (landingPages[route] || tools[route] || tools["/"]);
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
    .replace("{{CLOUDFLARE_WEB_ANALYTICS}}", cloudflareWebAnalyticsScript())
    .replace("{{APP_CONFIG}}", JSON.stringify({
      adsenseClient: ADSENSE_CLIENT,
      adSlots: { top: ADSENSE_TOP_SLOT, side: ADSENSE_SIDE_SLOT }
    }).replaceAll("<", "\\u003c"))
    .replace("{{ROUTE}}", JSON.stringify(route))
    .replace("{{INITIAL_CONTENT}}", renderInitialContent(route, meta));
}

function sitemap() {
  const baseUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const routes = [...Object.keys(tools), ...Object.keys(landingPages), ...Object.keys(trustPages)];
  const urls = routes
    .map((route) => `<url><loc>${baseUrl}${route}</loc><lastmod>${SITEMAP_LASTMOD}</lastmod></url>`)
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

  if (route.endsWith(".html")) {
    const cleanRoute = route.replace(/\.html$/, "");
    if (trustPages[cleanRoute] || landingPages[cleanRoute]) {
      send(res, 301, "", "text/plain; charset=utf-8", { Location: cleanRoute });
      return;
    }
  }

  if (trustPages[route]) {
    send(res, 200, renderTrustPage(route), mimeTypes[".html"]);
    return;
  }

  if (tools[route] || landingPages[route]) {
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
  landingPages,
  tools
};
