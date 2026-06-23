const toolList = [
  { path: "/tools/character-counter", icon: "文", title: "글자 수 세기", description: "공백 포함·제외, 단어와 바이트까지", color: "#e5f1ff", category: "text" },
  { path: "/tools/percentage-calculator", icon: "%", title: "퍼센트 계산기", description: "비율과 증감률을 헷갈리지 않게", color: "#fff0dc", category: "calculate" },
  { path: "/tools/discount-calculator", icon: "₩", title: "할인 계산기", description: "할인 금액과 최종 가격을 한 번에", color: "#ffe6e0", category: "calculate" },
  { path: "/tools/dday-calculator", icon: "D", title: "디데이 계산기", description: "목표일까지 남은 날과 날짜 차이", color: "#e8e3ff", category: "date" },
  { path: "/tools/random-picker", icon: "↝", title: "랜덤 뽑기", description: "메뉴, 이름, 순서를 공정하게 추첨", color: "#e5f5df", category: "utility" },
  { path: "/tools/password-generator", icon: "✦", title: "비밀번호 생성기", description: "기기 안에서 만드는 안전한 암호", color: "#f2e6ff", category: "utility" },
  { path: "/tools/text-cleaner", icon: "≡", title: "텍스트 정리기", description: "공백, 빈 줄, 중복 줄을 말끔하게", color: "#e4f4f3", category: "text" },
  { path: "/tools/pyeong-calculator", icon: "㎡", title: "평수 계산기", description: "제곱미터와 평을 빠르게 양방향 변환", color: "#fff2c7", category: "calculate" },
  { path: "/tools/age-calculator", icon: "年", title: "만 나이 계산기", description: "현재 만 나이와 다음 생일까지", color: "#dff0ff", category: "date" },
  { path: "/tools/unit-converter", icon: "↔", title: "단위 변환기", description: "길이, 무게, 온도를 간편하게 변환", color: "#e8f5e9", category: "calculate" },
  { path: "/tools/loan-calculator", icon: "₩", title: "대출 이자 계산기", description: "월 상환금과 전체 이자를 미리 계산", color: "#ffe6d5", category: "calculate" },
  { path: "/tools/compound-interest-calculator", icon: "↗", title: "복리 계산기", description: "적립식 투자와 복리 성장 예상", color: "#e2f4d7", category: "calculate" },
  { path: "/tools/time-calculator", icon: "時", title: "시간 계산기", description: "근무시간과 두 시각의 차이를 계산", color: "#e5e9ff", category: "date" },
  { path: "/tools/average-calculator", icon: "x̄", title: "평균 계산기", description: "평균, 중앙값, 합계와 범위를 한 번에", color: "#f4e6cf", category: "calculate" },
  { path: "/tools/vat-calculator", icon: "VAT", title: "부가세 계산기", description: "공급가액, 부가세와 합계금액 계산", color: "#fbe3d8", category: "calculate" },
  { path: "/tools/margin-calculator", icon: "₩%", title: "마진율 계산기", description: "판매가와 비용으로 순이익·마진 계산", color: "#e3f1dd", category: "calculate" },
  { path: "/tools/fuel-cost-calculator", icon: "⛽", title: "유류비 계산기", description: "거리·연비·유가로 예상 기름값 계산", color: "#fff0c9", category: "calculate" }
];

const route = JSON.parse(document.querySelector("#app").dataset.route || '"/"');
const app = document.querySelector("#app");
const numberFormat = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });
const preciseNumberFormat = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 8 });
const wonFormat = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });
const appConfig = window.HARUTOOL_CONFIG || { adsenseClient: "", adSlots: {} };

function toast(message) {
  const element = document.querySelector("#toast");
  element.textContent = message;
  element.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => element.classList.remove("show"), 1600);
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    toast("클립보드에 복사했어요");
  } catch {
    toast("복사하지 못했어요");
  }
}

function adSlot(className = "", position = "top") {
  return `<aside class="ad-slot ${className}" aria-label="광고 영역" data-ad-position="${position}"><span>ADVERTISEMENT</span></aside>`;
}

function toolCards(tools = toolList, compact = false) {
  return tools.map((tool) => `
    <a class="tool-card${compact ? " compact-card" : ""}" href="${tool.path}" data-tool-path="${tool.path}">
      <span class="arrow">↗</span>
      <span class="tool-icon" style="--icon-bg:${tool.color}">${tool.icon}</span>
      <h3>${tool.title}</h3>
      <p>${tool.description}</p>
    </a>
  `).join("");
}

function renderHome() {
  const recentPaths = JSON.parse(localStorage.getItem("harutool-recent") || "[]");
  const recentTools = recentPaths.map((path) => toolList.find((tool) => tool.path === path)).filter(Boolean).slice(0, 3);
  app.innerHTML = `
    <div class="home">
      <section class="hero">
        <p class="eyebrow">● 매일 쓰는 실용 도구</p>
        <h1>필요할 때 바로 쓰는<br><span>작고 빠른 도구</span></h1>
        <p>계산하고, 세고, 정리하는 귀찮은 일을 하루툴이 대신합니다. 입력한 내용은 서버로 전송하지 않아요.</p>
        <div class="tool-search">
          <label class="sr-only" for="tool-search">도구 검색</label>
          <span aria-hidden="true">⌕</span>
          <input id="tool-search" type="search" placeholder="필요한 도구를 검색해 보세요" autocomplete="off">
          <kbd>/</kbd>
        </div>
      </section>
      ${adSlot("", "top")}
      <section id="all-tools">
        <div class="section-head">
          <div><h2>오늘 필요한 도구</h2><p id="tool-count" aria-live="polite">${toolList.length}개의 도구가 있습니다.</p></div>
        </div>
        <div class="category-tabs" role="group" aria-label="도구 카테고리">
          <button class="category-tab active" type="button" data-category="all">전체</button>
          <button class="category-tab" type="button" data-category="calculate">계산·변환</button>
          <button class="category-tab" type="button" data-category="date">날짜</button>
          <button class="category-tab" type="button" data-category="text">텍스트</button>
          <button class="category-tab" type="button" data-category="utility">생활 도구</button>
        </div>
        <div class="tool-grid" id="tool-grid">${toolCards()}</div>
        <div class="empty-state" id="empty-state" hidden><strong>검색 결과가 없어요.</strong><span>다른 검색어를 입력하거나 전체 카테고리를 확인해 보세요.</span></div>
      </section>
      ${recentTools.length ? `<section class="recent-section"><div class="section-head"><div><h2>최근 사용한 도구</h2><p>이 기기에만 저장됩니다.</p></div></div><div class="tool-grid recent-grid">${toolCards(recentTools, true)}</div></section>` : ""}
      <section class="about" id="about">
        <div class="about-main">
          <h2>설명서보다 결과가<br>먼저 나오는 웹 도구</h2>
          <p>복잡한 메뉴를 지나지 않고 필요한 기능에 바로 도착하도록 만들었습니다.</p>
        </div>
        <div class="about-stat">
          <strong>${toolList.length}가지</strong>
          <span>계산·날짜·텍스트·생활 도구</span>
        </div>
      </section>
    </div>`;
  const search = document.querySelector("#tool-search");
  const grid = document.querySelector("#tool-grid");
  const count = document.querySelector("#tool-count");
  const empty = document.querySelector("#empty-state");
  let category = "all";
  const updateTools = () => {
    const query = search.value.trim().toLocaleLowerCase("ko-KR");
    const filtered = toolList.filter((tool) => {
      const categoryMatches = category === "all" || tool.category === category;
      const textMatches = !query || `${tool.title} ${tool.description}`.toLocaleLowerCase("ko-KR").includes(query);
      return categoryMatches && textMatches;
    });
    grid.innerHTML = toolCards(filtered);
    count.textContent = filtered.length === toolList.length ? `${toolList.length}개의 도구가 있습니다.` : `${filtered.length}개를 찾았습니다.`;
    empty.hidden = filtered.length > 0;
  };
  search.addEventListener("input", updateTools);
  document.querySelectorAll(".category-tab").forEach((button) => {
    button.addEventListener("click", () => {
      category = button.dataset.category;
      document.querySelectorAll(".category-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
      updateTools();
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
      event.preventDefault();
      search.focus();
    }
  });
}

function pageShell(title, description, body, info) {
  const recent = JSON.parse(localStorage.getItem("harutool-recent") || "[]").filter((path) => path !== route);
  localStorage.setItem("harutool-recent", JSON.stringify([route, ...recent].slice(0, 5)));
  const related = toolList.filter((tool) => tool.path !== route).slice(0, 3);
  app.innerHTML = `
    <div class="tool-page">
      <div class="breadcrumbs"><a href="/">홈</a> &nbsp;/&nbsp; ${title}</div>
      <header class="tool-header"><h1>${title}</h1><p>${description}</p></header>
      <div class="workspace">
        <section class="tool-box">${body}</section>
        ${adSlot("side-ad", "side")}
      </div>
      <section class="info-section">${info}</section>
      <section class="info-section">
        <h2>다른 도구</h2>
        <div class="tool-grid">${related.map((tool) => `
          <a class="tool-card" href="${tool.path}">
            <span class="arrow">↗</span><span class="tool-icon" style="--icon-bg:${tool.color}">${tool.icon}</span>
            <h3>${tool.title}</h3><p>${tool.description}</p>
          </a>`).join("")}
        </div>
      </section>
    </div>`;
}

function faqSection(items) {
  return `<section class="faq-section">
    <h2>자주 묻는 질문</h2>
    <div class="faq-list">${items.map(([question, answer]) => `
      <details>
        <summary>${question}</summary>
        <p>${answer}</p>
      </details>`).join("")}
    </div>
  </section>`;
}

function setFaqSchema(items) {
  document.querySelector("#faq-schema")?.remove();
  const script = document.createElement("script");
  script.id = "faq-schema";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer }
    }))
  });
  document.head.appendChild(script);
}

function renderNotFound() {
  app.innerHTML = `
    <div class="not-found">
      <span class="error-code">404</span>
      <h1>길을 조금 잘못 찾았어요.</h1>
      <p>요청한 페이지가 없거나 주소가 변경되었습니다.</p>
      <a class="btn btn-primary" href="/">모든 도구 보러 가기</a>
    </div>`;
}

function renderCharacterCounter() {
  pageShell(
    "글자 수 세기",
    "텍스트를 입력하면 공백 포함·제외 글자 수, 단어 수와 UTF-8 바이트를 실시간으로 계산합니다.",
    `<div class="field"><label for="counter-text">텍스트</label><textarea id="counter-text" placeholder="여기에 글을 붙여 넣거나 직접 입력하세요."></textarea></div>
     <div class="results">
       <div class="result"><span>공백 포함</span><strong id="chars-all">0자</strong></div>
       <div class="result"><span>공백 제외</span><strong id="chars-no-space">0자</strong></div>
       <div class="result"><span>단어 수</span><strong id="words">0개</strong></div>
       <div class="result"><span>UTF-8</span><strong id="bytes">0B</strong></div>
     </div>
     <div class="actions"><button class="btn btn-secondary" id="counter-clear">전체 지우기</button><button class="btn btn-primary" id="counter-copy">텍스트 복사</button></div>`,
    `<h2>글자 수는 어떻게 계산하나요?</h2><p>공백 포함은 입력한 모든 문자를, 공백 제외는 띄어쓰기와 줄바꿈을 뺀 문자를 셉니다. 바이트는 UTF-8 기준이라 한글은 보통 3바이트로 계산됩니다.</p>`
  );
  const input = document.querySelector("#counter-text");
  const update = () => {
    const value = input.value;
    document.querySelector("#chars-all").textContent = `${[...value].length}자`;
    document.querySelector("#chars-no-space").textContent = `${[...value.replace(/\s/g, "")].length}자`;
    document.querySelector("#words").textContent = `${value.trim() ? value.trim().split(/\s+/).length : 0}개`;
    document.querySelector("#bytes").textContent = `${new TextEncoder().encode(value).length}B`;
  };
  input.addEventListener("input", update);
  document.querySelector("#counter-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
  document.querySelector("#counter-copy").addEventListener("click", () => copyText(input.value));
}

function renderPercentageCalculator() {
  pageShell(
    "퍼센트 계산기",
    "전체에서 차지하는 비율, 퍼센트에 해당하는 값, 두 숫자의 증감률을 계산합니다.",
    `<div class="field"><label for="percent-mode">계산 방식</label>
      <select id="percent-mode">
        <option value="share">A는 B의 몇 %인가요?</option>
        <option value="part">A의 B%는 얼마인가요?</option>
        <option value="change">A에서 B로 변하면 몇 %인가요?</option>
      </select>
     </div>
     <div class="field-row">
       <div class="field"><label for="percent-a">A 값</label><input id="percent-a" type="number" inputmode="decimal" placeholder="예: 20"></div>
       <div class="field"><label for="percent-b">B 값</label><input id="percent-b" type="number" inputmode="decimal" placeholder="예: 100"></div>
     </div>
     <div class="big-result"><span>계산 결과</span><strong id="percent-result">0%</strong></div>
     <p class="inline-note" id="percent-formula">20은 100의 20%입니다.</p>`,
    `<h2>퍼센트 계산법</h2><p>비율은 A ÷ B × 100, 특정 퍼센트 값은 A × B ÷ 100으로 계산합니다. 증감률은 (새 값 − 기존 값) ÷ 기존 값 × 100입니다.</p>`
  );
  const mode = document.querySelector("#percent-mode");
  const a = document.querySelector("#percent-a");
  const b = document.querySelector("#percent-b");
  const result = document.querySelector("#percent-result");
  const formula = document.querySelector("#percent-formula");
  const update = () => {
    const av = Number(a.value);
    const bv = Number(b.value);
    if (!a.value || !b.value) { result.textContent = "0%"; formula.textContent = "두 값을 입력하면 즉시 계산됩니다."; return; }
    if (mode.value === "share") {
      const value = bv === 0 ? NaN : av / bv * 100;
      result.textContent = Number.isFinite(value) ? `${numberFormat.format(value)}%` : "계산 불가";
      formula.textContent = `${numberFormat.format(av)}은 ${numberFormat.format(bv)}의 ${numberFormat.format(value)}%입니다.`;
    } else if (mode.value === "part") {
      const value = av * bv / 100;
      result.textContent = numberFormat.format(value);
      formula.textContent = `${numberFormat.format(av)}의 ${numberFormat.format(bv)}%는 ${numberFormat.format(value)}입니다.`;
    } else {
      const value = av === 0 ? NaN : (bv - av) / Math.abs(av) * 100;
      result.textContent = Number.isFinite(value) ? `${value >= 0 ? "+" : ""}${numberFormat.format(value)}%` : "계산 불가";
      formula.textContent = `${numberFormat.format(av)}에서 ${numberFormat.format(bv)}로 ${value >= 0 ? "증가" : "감소"}했습니다.`;
    }
  };
  [mode, a, b].forEach((element) => element.addEventListener("input", update));
}

function renderDiscountCalculator() {
  pageShell(
    "할인 계산기",
    "원래 가격과 할인율을 입력하면 할인받는 금액과 실제 결제 가격을 계산합니다.",
    `<div class="field-row">
       <div class="field"><label for="original-price">원래 가격</label><input id="original-price" type="number" min="0" inputmode="numeric" placeholder="예: 50000"></div>
       <div class="field"><label for="discount-rate">할인율 (%)</label><input id="discount-rate" type="number" min="0" max="100" inputmode="decimal" placeholder="예: 20"></div>
     </div>
     <div class="results">
       <div class="result"><span>할인 금액</span><strong id="discount-amount">0원</strong></div>
       <div class="result"><span>최종 가격</span><strong id="final-price">0원</strong></div>
     </div>
     <div class="field" style="margin-top:20px"><label for="extra-discount">추가 쿠폰 할인 (원, 선택)</label><input id="extra-discount" type="number" min="0" inputmode="numeric" placeholder="예: 3000"></div>`,
    `<h2>중복 할인 계산 팁</h2><p>퍼센트 할인 후 정액 쿠폰을 사용하는 경우, 할인율을 먼저 적용한 뒤 쿠폰 금액을 빼야 실제 결제 금액과 맞습니다.</p>`
  );
  const price = document.querySelector("#original-price");
  const rate = document.querySelector("#discount-rate");
  const extra = document.querySelector("#extra-discount");
  const update = () => {
    const p = Math.max(0, Number(price.value) || 0);
    const r = Math.min(100, Math.max(0, Number(rate.value) || 0));
    const coupon = Math.max(0, Number(extra.value) || 0);
    const discount = p * r / 100;
    const final = Math.max(0, p - discount - coupon);
    document.querySelector("#discount-amount").textContent = `${numberFormat.format(discount + Math.min(coupon, p - discount))}원`;
    document.querySelector("#final-price").textContent = `${numberFormat.format(final)}원`;
  };
  [price, rate, extra].forEach((element) => element.addEventListener("input", update));
}

function localDateValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function renderDdayCalculator() {
  pageShell(
    "디데이 계산기",
    "시작일과 목표일 사이의 날짜 수를 계산합니다. 오늘을 기준으로 한 D-day도 바로 확인하세요.",
    `<div class="field-row">
       <div class="field"><label for="start-date">시작일</label><input id="start-date" type="date" value="${localDateValue()}"></div>
       <div class="field"><label for="target-date">목표일</label><input id="target-date" type="date"></div>
     </div>
     <div class="big-result"><span>목표일까지</span><strong id="dday-result">날짜 선택</strong></div>
     <p class="inline-note" id="dday-detail">목표일을 선택해 주세요.</p>`,
    `<h2>D-day 계산 기준</h2><p>두 날짜의 자정 사이 차이를 계산합니다. 오늘이 목표일이면 D-Day, 미래는 D-숫자, 지난 날짜는 D+숫자로 표시합니다.</p>`
  );
  const start = document.querySelector("#start-date");
  const target = document.querySelector("#target-date");
  const update = () => {
    if (!start.value || !target.value) return;
    const startDate = new Date(`${start.value}T00:00:00`);
    const targetDate = new Date(`${target.value}T00:00:00`);
    const days = Math.round((targetDate - startDate) / 86400000);
    document.querySelector("#dday-result").textContent = days === 0 ? "D-Day" : days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
    document.querySelector("#dday-detail").textContent = `${start.value}부터 ${target.value}까지 ${Math.abs(days).toLocaleString("ko-KR")}일 차이입니다.`;
  };
  [start, target].forEach((element) => element.addEventListener("input", update));
}

function renderRandomPicker() {
  pageShell(
    "랜덤 뽑기",
    "이름이나 메뉴를 한 줄에 하나씩 입력하고 원하는 개수만큼 무작위로 추첨하세요.",
    `<div class="field"><label for="picker-items">추첨 항목</label><textarea id="picker-items" placeholder="김민수&#10;이서연&#10;박하루&#10;최도구"></textarea></div>
     <div class="field"><label for="picker-count">뽑을 개수</label><input id="picker-count" type="number" min="1" value="1"></div>
     <div class="actions"><button class="btn btn-primary" id="picker-run">랜덤으로 뽑기</button><button class="btn btn-secondary" id="picker-clear">초기화</button></div>
     <div class="big-result"><span>추첨 결과</span><strong id="picker-result">?</strong></div>`,
    `<h2>어떻게 무작위로 뽑나요?</h2><p>브라우저가 제공하는 암호학적 난수 생성기를 사용해 목록을 섞습니다. 입력한 목록은 서버에 저장하거나 전송하지 않습니다.</p>`
  );
  const items = document.querySelector("#picker-items");
  const count = document.querySelector("#picker-count");
  const randomIndex = (max) => {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % max;
  };
  document.querySelector("#picker-run").addEventListener("click", () => {
    const values = [...new Set(items.value.split(/\n|,/).map((value) => value.trim()).filter(Boolean))];
    if (!values.length) { toast("먼저 추첨 항목을 입력해 주세요"); return; }
    const selected = [];
    const pool = [...values];
    const amount = Math.min(pool.length, Math.max(1, Number(count.value) || 1));
    while (selected.length < amount) selected.push(pool.splice(randomIndex(pool.length), 1)[0]);
    document.querySelector("#picker-result").textContent = selected.join(", ");
  });
  document.querySelector("#picker-clear").addEventListener("click", () => {
    items.value = "";
    document.querySelector("#picker-result").textContent = "?";
    items.focus();
  });
}

function renderPasswordGenerator() {
  pageShell(
    "비밀번호 생성기",
    "길이와 문자 종류를 선택해 예측하기 어려운 랜덤 비밀번호를 기기 안에서 생성합니다.",
    `<div class="field"><label for="password-length">비밀번호 길이: <strong id="length-label">16</strong>자</label><input id="password-length" type="range" min="8" max="40" value="16"></div>
     <div class="field"><span class="field-label">포함할 문자</span>
       <div class="options">
         <label class="check"><input type="checkbox" id="opt-upper" checked> 영문 대문자</label>
         <label class="check"><input type="checkbox" id="opt-lower" checked> 영문 소문자</label>
         <label class="check"><input type="checkbox" id="opt-number" checked> 숫자</label>
         <label class="check"><input type="checkbox" id="opt-symbol" checked> 특수문자</label>
       </div>
     </div>
     <div class="big-result"><span>생성된 비밀번호</span><strong id="password-result">-</strong></div>
     <div class="actions"><button class="btn btn-primary" id="password-run">새로 생성</button><button class="btn btn-secondary" id="password-copy">복사</button></div>
     <p class="inline-note">비밀번호는 서버로 전송되지 않습니다.</p>`,
    `<h2>안전한 비밀번호 만들기</h2><p>가능하면 14자 이상을 사용하고, 사이트마다 서로 다른 비밀번호를 쓰세요. 생성한 비밀번호는 신뢰할 수 있는 비밀번호 관리 앱에 보관하는 것이 좋습니다.</p>`
  );
  const length = document.querySelector("#password-length");
  const output = document.querySelector("#password-result");
  const sets = {
    upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
    lower: "abcdefghijkmnopqrstuvwxyz",
    number: "23456789",
    symbol: "!@#$%^&*_-+="
  };
  const generate = () => {
    const enabled = Object.keys(sets).filter((key) => document.querySelector(`#opt-${key}`).checked);
    if (!enabled.length) { toast("문자 종류를 하나 이상 선택해 주세요"); return; }
    const pool = enabled.map((key) => sets[key]).join("");
    const bytes = new Uint32Array(Number(length.value));
    crypto.getRandomValues(bytes);
    const password = Array.from(bytes, (value) => pool[value % pool.length]).join("");
    output.textContent = password;
  };
  length.addEventListener("input", () => { document.querySelector("#length-label").textContent = length.value; generate(); });
  document.querySelectorAll(".check input").forEach((input) => input.addEventListener("change", generate));
  document.querySelector("#password-run").addEventListener("click", generate);
  document.querySelector("#password-copy").addEventListener("click", () => copyText(output.textContent));
  generate();
}

function renderTextCleaner() {
  pageShell(
    "텍스트 정리기",
    "뒤죽박죽인 공백과 빈 줄을 정리하고, 필요하면 중복된 줄까지 제거합니다.",
    `<div class="field"><label for="cleaner-text">원본 텍스트</label><textarea id="cleaner-text" placeholder="정리할 텍스트를 붙여 넣으세요."></textarea></div>
     <div class="options">
       <label class="check"><input type="checkbox" id="clean-space" checked> 연속 공백 정리</label>
       <label class="check"><input type="checkbox" id="clean-empty" checked> 빈 줄 제거</label>
       <label class="check"><input type="checkbox" id="clean-duplicate"> 중복 줄 제거</label>
     </div>
     <div class="actions"><button class="btn btn-primary" id="cleaner-run">텍스트 정리</button><button class="btn btn-secondary" id="cleaner-copy">결과 복사</button></div>
     <div class="field" style="margin-top:22px"><label for="cleaner-result">정리 결과</label><textarea id="cleaner-result" readonly></textarea></div>`,
    `<h2>복사한 문서가 깨질 때</h2><p>PDF나 웹페이지에서 글을 복사하면 불필요한 공백과 줄바꿈이 섞일 수 있습니다. 먼저 공백과 빈 줄을 정리한 뒤 필요한 부분만 다시 편집해 보세요.</p>`
  );
  const source = document.querySelector("#cleaner-text");
  const output = document.querySelector("#cleaner-result");
  document.querySelector("#cleaner-run").addEventListener("click", () => {
    let lines = source.value.replace(/\r/g, "").split("\n");
    if (document.querySelector("#clean-space").checked) lines = lines.map((line) => line.replace(/[ \t]+/g, " ").trim());
    if (document.querySelector("#clean-empty").checked) lines = lines.filter((line) => line.length);
    if (document.querySelector("#clean-duplicate").checked) lines = [...new Set(lines)];
    output.value = lines.join("\n");
    toast("텍스트를 정리했어요");
  });
  document.querySelector("#cleaner-copy").addEventListener("click", () => copyText(output.value));
}

function renderPyeongCalculator() {
  pageShell(
    "평수 계산기",
    "제곱미터(㎡)와 평을 양방향으로 변환합니다. 아파트 전용면적과 공급면적을 비교할 때 유용합니다.",
    `<div class="field"><label for="area-mode">변환 방식</label>
       <select id="area-mode"><option value="sqm-to-pyeong">제곱미터(㎡) → 평</option><option value="pyeong-to-sqm">평 → 제곱미터(㎡)</option></select>
     </div>
     <div class="field"><label for="area-value">면적</label><input id="area-value" type="number" min="0" step="any" inputmode="decimal" placeholder="예: 84"></div>
     <div class="big-result"><span id="area-result-label">평수 변환 결과</span><strong id="area-result">0평</strong></div>
     <div class="results">
       <div class="result"><span>59㎡</span><strong>약 17.85평</strong></div>
       <div class="result"><span>84㎡</span><strong>약 25.41평</strong></div>
       <div class="result"><span>102㎡</span><strong>약 30.86평</strong></div>
       <div class="result"><span>135㎡</span><strong>약 40.84평</strong></div>
     </div>`,
    `<h2>제곱미터를 평으로 계산하는 방법</h2>
     <p>1평은 약 3.305785㎡입니다. 제곱미터를 평으로 바꿀 때는 면적을 3.305785로 나누고, 평을 제곱미터로 바꿀 때는 3.305785를 곱합니다.</p>
     <h2>전용면적과 공급면적은 다릅니다</h2>
     <p>부동산에서 흔히 말하는 아파트 평형은 전용면적이 아닌 공급면적을 기준으로 표현하는 경우가 많습니다. 같은 84㎡라도 전용면적 84㎡와 공급면적 84㎡는 의미가 다르므로 계약서의 면적 종류를 함께 확인하세요.</p>`
  );
  const mode = document.querySelector("#area-mode");
  const value = document.querySelector("#area-value");
  const result = document.querySelector("#area-result");
  const label = document.querySelector("#area-result-label");
  const update = () => {
    const input = Math.max(0, Number(value.value) || 0);
    if (mode.value === "sqm-to-pyeong") {
      label.textContent = `${numberFormat.format(input)}㎡는`;
      result.textContent = `${numberFormat.format(input / 3.305785)}평`;
    } else {
      label.textContent = `${numberFormat.format(input)}평은`;
      result.textContent = `${numberFormat.format(input * 3.305785)}㎡`;
    }
  };
  [mode, value].forEach((element) => element.addEventListener("input", update));
}

function parseLocalDate(value) {
  return value ? new Date(`${value}T12:00:00`) : null;
}

function renderAgeCalculator() {
  pageShell(
    "만 나이 계산기",
    "생년월일과 기준일을 입력하면 만 나이, 연 나이, 세는나이와 다음 생일까지 남은 날짜를 계산합니다.",
    `<div class="field-row">
       <div class="field"><label for="birth-date">생년월일</label><input id="birth-date" type="date"></div>
       <div class="field"><label for="age-base-date">기준일</label><input id="age-base-date" type="date" value="${localDateValue()}"></div>
     </div>
     <div class="big-result"><span>기준일의 만 나이</span><strong id="age-result">생일 선택</strong></div>
     <div class="results">
       <div class="result"><span>연 나이</span><strong id="year-age">-</strong></div>
       <div class="result"><span>세는나이</span><strong id="korean-age">-</strong></div>
       <div class="result"><span>다음 생일</span><strong id="next-birthday">-</strong></div>
       <div class="result"><span>태어난 요일</span><strong id="birth-weekday">-</strong></div>
     </div>`,
    `<h2>만 나이는 어떻게 계산하나요?</h2>
     <p>기준 연도에서 출생 연도를 뺀 뒤, 그해 생일이 아직 지나지 않았다면 1을 뺍니다. 생일 당일에는 한 살이 올라갑니다.</p>
     <h2>만 나이, 연 나이, 세는나이 차이</h2>
     <p>만 나이는 생일을 기준으로 계산합니다. 연 나이는 현재 연도에서 출생 연도를 뺀 값이고, 세는나이는 그 값에 1을 더한 방식입니다. 실제 행정·계약 업무에서는 해당 제도의 기준을 별도로 확인하세요.</p>`
  );
  const birthInput = document.querySelector("#birth-date");
  const baseInput = document.querySelector("#age-base-date");
  const update = () => {
    const birth = parseLocalDate(birthInput.value);
    const base = parseLocalDate(baseInput.value);
    if (!birth || !base) return;
    if (birth > base) { toast("생년월일은 기준일보다 늦을 수 없어요"); return; }
    let age = base.getFullYear() - birth.getFullYear();
    const birthdayPassed = base.getMonth() > birth.getMonth() ||
      (base.getMonth() === birth.getMonth() && base.getDate() >= birth.getDate());
    if (!birthdayPassed) age -= 1;
    let next = new Date(base.getFullYear(), birth.getMonth(), birth.getDate(), 12);
    if (next < base || (next.getMonth() === base.getMonth() && next.getDate() === base.getDate())) {
      if (next < base) next = new Date(base.getFullYear() + 1, birth.getMonth(), birth.getDate(), 12);
    }
    const daysLeft = Math.ceil((next - base) / 86400000);
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    document.querySelector("#age-result").textContent = `만 ${age}세`;
    document.querySelector("#year-age").textContent = `${base.getFullYear() - birth.getFullYear()}세`;
    document.querySelector("#korean-age").textContent = `${base.getFullYear() - birth.getFullYear() + 1}세`;
    document.querySelector("#next-birthday").textContent = daysLeft === 0 ? "오늘" : `${daysLeft}일 후`;
    document.querySelector("#birth-weekday").textContent = `${weekdays[birth.getDay()]}요일`;
  };
  [birthInput, baseInput].forEach((element) => element.addEventListener("input", update));
}

function renderUnitConverter() {
  const unitGroups = {
    length: {
      label: "길이",
      units: { m: ["미터 (m)", 1], km: ["킬로미터 (km)", 1000], cm: ["센티미터 (cm)", 0.01], mm: ["밀리미터 (mm)", 0.001], inch: ["인치 (in)", 0.0254], ft: ["피트 (ft)", 0.3048], mile: ["마일 (mi)", 1609.344] }
    },
    weight: {
      label: "무게",
      units: { kg: ["킬로그램 (kg)", 1], g: ["그램 (g)", 0.001], mg: ["밀리그램 (mg)", 0.000001], ton: ["톤 (t)", 1000], lb: ["파운드 (lb)", 0.45359237], oz: ["온스 (oz)", 0.028349523125] }
    },
    temperature: {
      label: "온도",
      units: { c: ["섭씨 (°C)", "c"], f: ["화씨 (°F)", "f"], k: ["켈빈 (K)", "k"] }
    }
  };
  pageShell(
    "단위 변환기",
    "길이, 무게, 온도의 자주 쓰는 단위를 선택해 실시간으로 변환합니다.",
    `<div class="field"><label for="unit-category">단위 종류</label>
       <select id="unit-category"><option value="length">길이</option><option value="weight">무게</option><option value="temperature">온도</option></select>
     </div>
     <div class="field"><label for="unit-value">변환할 값</label><input id="unit-value" type="number" step="any" inputmode="decimal" value="1"></div>
     <div class="field-row">
       <div class="field"><label for="unit-from">변환 전 단위</label><select id="unit-from"></select></div>
       <div class="field"><label for="unit-to">변환 후 단위</label><select id="unit-to"></select></div>
     </div>
     <div class="big-result"><span>변환 결과</span><strong id="unit-result">1</strong></div>
     <div class="actions"><button class="btn btn-secondary" id="unit-swap">단위 서로 바꾸기</button><button class="btn btn-primary" id="unit-copy">결과 복사</button></div>`,
    `<h2>단위 변환 기준</h2>
     <p>국제단위계 기준으로 길이와 무게를 환산합니다. 1인치는 2.54cm, 1피트는 0.3048m, 1마일은 1.609344km, 1파운드는 0.45359237kg입니다.</p>
     <h2>섭씨와 화씨 변환</h2>
     <p>섭씨에서 화씨는 섭씨 × 9/5 + 32, 화씨에서 섭씨는 (화씨 − 32) × 5/9로 계산합니다. 켈빈은 섭씨에 273.15를 더한 값입니다.</p>`
  );
  const category = document.querySelector("#unit-category");
  const value = document.querySelector("#unit-value");
  const from = document.querySelector("#unit-from");
  const to = document.querySelector("#unit-to");
  const result = document.querySelector("#unit-result");
  const setOptions = () => {
    const units = unitGroups[category.value].units;
    const options = Object.entries(units).map(([key, data]) => `<option value="${key}">${data[0]}</option>`).join("");
    from.innerHTML = options;
    to.innerHTML = options;
    to.selectedIndex = Math.min(1, to.options.length - 1);
    update();
  };
  const toCelsius = (input, unit) => unit === "c" ? input : unit === "f" ? (input - 32) * 5 / 9 : input - 273.15;
  const fromCelsius = (input, unit) => unit === "c" ? input : unit === "f" ? input * 9 / 5 + 32 : input + 273.15;
  const update = () => {
    const input = Number(value.value) || 0;
    let converted;
    if (category.value === "temperature") {
      converted = fromCelsius(toCelsius(input, from.value), to.value);
    } else {
      const units = unitGroups[category.value].units;
      converted = input * units[from.value][1] / units[to.value][1];
    }
    result.textContent = preciseNumberFormat.format(converted);
  };
  category.addEventListener("input", setOptions);
  [value, from, to].forEach((element) => element.addEventListener("input", update));
  document.querySelector("#unit-swap").addEventListener("click", () => {
    const old = from.value; from.value = to.value; to.value = old; update();
  });
  document.querySelector("#unit-copy").addEventListener("click", () => copyText(result.textContent));
  setOptions();
}

function renderLoanCalculator() {
  const faqs = [
    ["원리금균등상환이란 무엇인가요?", "매달 원금과 이자를 합친 금액을 비슷하게 납부하는 방식입니다. 초기에는 이자 비중이 크고 시간이 지날수록 원금 비중이 커집니다."],
    ["계산 결과가 실제 은행 금액과 다른 이유는 무엇인가요?", "은행별 이자 계산일, 실행일, 우대금리, 중도상환, 수수료와 반올림 방식이 다를 수 있어 실제 상환액과 차이가 날 수 있습니다."],
    ["금리가 0%인 경우도 계산되나요?", "네. 이자가 없으면 대출 원금을 전체 개월 수로 나눈 금액을 월 상환금으로 표시합니다."]
  ];
  pageShell(
    "대출 이자 계산기",
    "대출금과 연이율, 상환 기간을 입력해 원리금균등상환 기준 월 상환금과 총이자를 계산합니다.",
    `<div class="field"><label for="loan-principal">대출금 (원)</label><input id="loan-principal" type="number" min="0" step="10000" inputmode="numeric" value="100000000"></div>
     <div class="field-row">
       <div class="field"><label for="loan-rate">연이율 (%)</label><input id="loan-rate" type="number" min="0" step="0.01" inputmode="decimal" value="4"></div>
       <div class="field"><label for="loan-years">상환 기간 (년)</label><input id="loan-years" type="number" min="1" max="50" step="1" inputmode="numeric" value="30"></div>
     </div>
     <div class="big-result"><span>예상 월 상환금</span><strong id="loan-payment">-</strong></div>
     <div class="results">
       <div class="result"><span>총 상환액</span><strong id="loan-total">-</strong></div>
       <div class="result"><span>총 이자</span><strong id="loan-interest">-</strong></div>
       <div class="result"><span>납부 횟수</span><strong id="loan-months">-</strong></div>
       <div class="result"><span>첫 달 이자</span><strong id="loan-first-interest">-</strong></div>
     </div>
     <p class="inline-note">참고용 예상치이며 실제 금융기관의 상환액과 다를 수 있습니다.</p>`,
    `<h2>대출 월 상환금 계산 방법</h2>
     <p>원리금균등상환은 대출 원금, 월 이율, 전체 납부 개월 수를 이용해 매달 비슷한 금액을 납부하도록 계산합니다. 금리가 높거나 기간이 길수록 총이자가 증가합니다.</p>
     <h2>기간을 줄이면 얼마나 달라지나요?</h2>
     <p>상환 기간을 줄이면 월 납입금은 커지지만 원금이 빨리 줄어 전체 이자 부담은 낮아집니다. 기간과 월 납입 가능 금액을 함께 비교하는 것이 좋습니다.</p>
     ${faqSection(faqs)}`
  );
  setFaqSchema(faqs);
  const principal = document.querySelector("#loan-principal");
  const rate = document.querySelector("#loan-rate");
  const years = document.querySelector("#loan-years");
  const update = () => {
    const p = Math.max(0, Number(principal.value) || 0);
    const annualRate = Math.max(0, Number(rate.value) || 0) / 100;
    const months = Math.max(1, Math.round((Number(years.value) || 1) * 12));
    const monthlyRate = annualRate / 12;
    const payment = monthlyRate === 0
      ? p / months
      : p * monthlyRate * (1 + monthlyRate) ** months / ((1 + monthlyRate) ** months - 1);
    const total = payment * months;
    document.querySelector("#loan-payment").textContent = `${wonFormat.format(payment)}원`;
    document.querySelector("#loan-total").textContent = `${wonFormat.format(total)}원`;
    document.querySelector("#loan-interest").textContent = `${wonFormat.format(Math.max(0, total - p))}원`;
    document.querySelector("#loan-months").textContent = `${months}회`;
    document.querySelector("#loan-first-interest").textContent = `${wonFormat.format(p * monthlyRate)}원`;
  };
  [principal, rate, years].forEach((element) => element.addEventListener("input", update));
  update();
}

function renderCompoundInterestCalculator() {
  const faqs = [
    ["복리는 단리와 무엇이 다른가요?", "단리는 원금에만 이자가 붙지만 복리는 이전에 발생한 수익까지 다음 계산의 원금에 포함됩니다."],
    ["월 적립금은 언제 투자되는 것으로 계산하나요?", "이 계산기는 매월 말에 적립하는 것으로 가정합니다. 월초 적립이나 실제 투자 시점에 따라 결과가 달라질 수 있습니다."],
    ["세금과 수수료도 반영되나요?", "아니요. 세금, 운용 수수료, 물가 상승과 실제 수익률 변동은 반영하지 않은 단순 예상치입니다."]
  ];
  pageShell(
    "복리 계산기",
    "초기 투자금과 매월 적립금, 연평균 수익률, 기간을 입력해 복리로 성장하는 예상 자산을 계산합니다.",
    `<div class="field-row">
       <div class="field"><label for="compound-initial">초기 투자금 (원)</label><input id="compound-initial" type="number" min="0" step="10000" value="10000000"></div>
       <div class="field"><label for="compound-monthly">매월 적립금 (원)</label><input id="compound-monthly" type="number" min="0" step="10000" value="300000"></div>
     </div>
     <div class="field-row">
       <div class="field"><label for="compound-rate">연평균 수익률 (%)</label><input id="compound-rate" type="number" step="0.1" value="7"></div>
       <div class="field"><label for="compound-years">투자 기간 (년)</label><input id="compound-years" type="number" min="1" max="80" step="1" value="10"></div>
     </div>
     <div class="big-result"><span>예상 최종 자산</span><strong id="compound-total">-</strong></div>
     <div class="results">
       <div class="result"><span>총 납입 원금</span><strong id="compound-principal">-</strong></div>
       <div class="result"><span>예상 수익</span><strong id="compound-profit">-</strong></div>
       <div class="result"><span>수익 비중</span><strong id="compound-profit-rate">-</strong></div>
       <div class="result"><span>적립 횟수</span><strong id="compound-months">-</strong></div>
     </div>
     <p class="inline-note">고정 수익률을 가정한 계산으로 실제 투자 결과를 보장하지 않습니다.</p>`,
    `<h2>복리 계산 공식</h2>
     <p>초기 투자금은 매월 수익이 누적되는 것으로, 월 적립금은 매월 말 추가되는 것으로 계산합니다. 장기간일수록 수익에 다시 수익이 붙는 복리 효과가 커집니다.</p>
     <h2>수익률보다 기간이 중요한 이유</h2>
     <p>같은 수익률이라도 투자 기간이 길어지면 복리 계산이 반복되는 횟수가 늘어납니다. 다만 실제 시장 수익률은 매년 달라지므로 여러 수익률로 비교해 보는 편이 좋습니다.</p>
     ${faqSection(faqs)}`
  );
  setFaqSchema(faqs);
  const initial = document.querySelector("#compound-initial");
  const monthly = document.querySelector("#compound-monthly");
  const rate = document.querySelector("#compound-rate");
  const years = document.querySelector("#compound-years");
  const update = () => {
    const start = Math.max(0, Number(initial.value) || 0);
    const contribution = Math.max(0, Number(monthly.value) || 0);
    const months = Math.max(1, Math.round((Number(years.value) || 1) * 12));
    const monthlyRate = (Number(rate.value) || 0) / 100 / 12;
    let total = start;
    for (let month = 0; month < months; month += 1) total = total * (1 + monthlyRate) + contribution;
    const paid = start + contribution * months;
    const profit = total - paid;
    document.querySelector("#compound-total").textContent = `${wonFormat.format(total)}원`;
    document.querySelector("#compound-principal").textContent = `${wonFormat.format(paid)}원`;
    document.querySelector("#compound-profit").textContent = `${profit >= 0 ? "+" : ""}${wonFormat.format(profit)}원`;
    document.querySelector("#compound-profit-rate").textContent = `${paid ? numberFormat.format(profit / paid * 100) : 0}%`;
    document.querySelector("#compound-months").textContent = `${months}회`;
  };
  [initial, monthly, rate, years].forEach((element) => element.addEventListener("input", update));
  update();
}

function renderTimeCalculator() {
  const faqs = [
    ["자정을 넘기는 시간도 계산할 수 있나요?", "종료 시각이 시작 시각보다 이르면 다음 날 종료한 것으로 자동 계산합니다."],
    ["휴게시간은 어떻게 반영되나요?", "전체 경과 시간에서 입력한 휴게시간을 뺀 값을 실제 시간으로 표시합니다."],
    ["급여 계산에도 사용할 수 있나요?", "시간 확인용으로는 사용할 수 있지만 임금 계산에는 사업장의 근로시간 인정 기준과 관련 규정을 별도로 확인해야 합니다."]
  ];
  pageShell(
    "시간 계산기",
    "시작 시각과 종료 시각, 휴게시간을 입력해 전체 경과 시간과 실제 시간을 계산합니다.",
    `<div class="field-row">
       <div class="field"><label for="time-start">시작 시각</label><input id="time-start" type="time" value="09:00"></div>
       <div class="field"><label for="time-end">종료 시각</label><input id="time-end" type="time" value="18:00"></div>
     </div>
     <div class="field"><label for="break-minutes">휴게시간 (분)</label><input id="break-minutes" type="number" min="0" step="5" value="60"></div>
     <div class="big-result"><span>휴게시간을 제외한 시간</span><strong id="time-result">8시간</strong></div>
     <div class="results">
       <div class="result"><span>전체 경과</span><strong id="time-elapsed">9시간</strong></div>
       <div class="result"><span>실제 시간</span><strong id="time-decimal">8.00시간</strong></div>
       <div class="result"><span>총 분</span><strong id="time-minutes">480분</strong></div>
       <div class="result"><span>종료 기준</span><strong id="time-day">당일</strong></div>
     </div>`,
    `<h2>두 시각의 차이 계산</h2>
     <p>종료 시각에서 시작 시각을 빼 전체 경과 시간을 구합니다. 종료 시각이 더 이르면 다음 날 종료한 것으로 계산해 야간 근무나 자정을 넘긴 일정에도 사용할 수 있습니다.</p>
     <h2>시간을 소수로 바꾸는 방법</h2>
     <p>분을 60으로 나누면 소수 시간으로 바꿀 수 있습니다. 예를 들어 7시간 30분은 7.5시간입니다.</p>
     ${faqSection(faqs)}`
  );
  setFaqSchema(faqs);
  const start = document.querySelector("#time-start");
  const end = document.querySelector("#time-end");
  const rest = document.querySelector("#break-minutes");
  const parseMinutes = (value) => {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return `${hours ? `${hours}시간` : ""}${hours && remainder ? " " : ""}${remainder ? `${remainder}분` : ""}` || "0분";
  };
  const update = () => {
    if (!start.value || !end.value) return;
    const startMinutes = parseMinutes(start.value);
    let endMinutes = parseMinutes(end.value);
    const nextDay = endMinutes < startMinutes;
    if (nextDay) endMinutes += 1440;
    const elapsed = endMinutes - startMinutes;
    const actual = Math.max(0, elapsed - Math.max(0, Number(rest.value) || 0));
    document.querySelector("#time-result").textContent = formatDuration(actual);
    document.querySelector("#time-elapsed").textContent = formatDuration(elapsed);
    document.querySelector("#time-decimal").textContent = `${(actual / 60).toFixed(2)}시간`;
    document.querySelector("#time-minutes").textContent = `${actual}분`;
    document.querySelector("#time-day").textContent = nextDay ? "다음 날" : "당일";
  };
  [start, end, rest].forEach((element) => element.addEventListener("input", update));
  update();
}

function renderAverageCalculator() {
  const faqs = [
    ["산술평균은 어떻게 계산하나요?", "모든 숫자를 더한 뒤 숫자의 개수로 나눕니다. 일반적으로 ‘평균’이라고 말할 때 사용하는 방식입니다."],
    ["중앙값은 평균과 무엇이 다른가요?", "숫자를 크기순으로 정렬했을 때 가운데 있는 값입니다. 극단적으로 크거나 작은 값의 영향을 산술평균보다 적게 받습니다."],
    ["소수와 음수도 입력할 수 있나요?", "네. 쉼표, 공백 또는 줄바꿈으로 구분하면 소수와 음수를 함께 계산할 수 있습니다."]
  ];
  pageShell(
    "평균 계산기",
    "숫자를 쉼표, 공백 또는 줄바꿈으로 입력해 산술평균, 중앙값, 합계와 범위를 계산합니다.",
    `<div class="field"><label for="average-values">숫자 목록</label><textarea id="average-values" placeholder="예: 10, 20, 30, 40">10, 20, 30, 40</textarea></div>
     <div class="big-result"><span>산술평균</span><strong id="average-mean">25</strong></div>
     <div class="results">
       <div class="result"><span>중앙값</span><strong id="average-median">25</strong></div>
       <div class="result"><span>합계</span><strong id="average-sum">100</strong></div>
       <div class="result"><span>최솟값 · 최댓값</span><strong id="average-range">10 · 40</strong></div>
       <div class="result"><span>숫자 개수</span><strong id="average-count">4개</strong></div>
     </div>
     <div class="actions"><button class="btn btn-secondary" id="average-clear">전체 지우기</button><button class="btn btn-primary" id="average-copy">결과 복사</button></div>
     <p class="inline-note" id="average-error" aria-live="polite"></p>`,
    `<h2>평균 계산 방법</h2>
     <p>산술평균은 입력한 모든 수의 합계를 개수로 나눈 값입니다. 예를 들어 10, 20, 30의 합은 60이고 숫자는 3개이므로 평균은 20입니다.</p>
     <h2>평균과 중앙값을 함께 보는 이유</h2>
     <p>소득이나 가격처럼 일부 값이 유난히 큰 자료에서는 산술평균이 치우칠 수 있습니다. 이때 정렬한 값의 가운데인 중앙값을 함께 보면 자료의 중심을 더 균형 있게 이해할 수 있습니다.</p>
     ${faqSection(faqs)}`
  );
  setFaqSchema(faqs);
  const input = document.querySelector("#average-values");
  const error = document.querySelector("#average-error");
  const parseValues = () => input.value
    .split(/[\s,]+/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number)
    .filter(Number.isFinite);
  const update = () => {
    const values = parseValues();
    if (!values.length) {
      ["#average-mean", "#average-median", "#average-sum", "#average-range"].forEach((selector) => {
        document.querySelector(selector).textContent = "-";
      });
      document.querySelector("#average-count").textContent = "0개";
      error.textContent = "계산할 숫자를 하나 이상 입력해 주세요.";
      return;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((total, value) => total + value, 0);
    const middle = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
    document.querySelector("#average-mean").textContent = preciseNumberFormat.format(sum / values.length);
    document.querySelector("#average-median").textContent = preciseNumberFormat.format(median);
    document.querySelector("#average-sum").textContent = preciseNumberFormat.format(sum);
    document.querySelector("#average-range").textContent = `${preciseNumberFormat.format(sorted[0])} · ${preciseNumberFormat.format(sorted.at(-1))}`;
    document.querySelector("#average-count").textContent = `${values.length}개`;
    error.textContent = "";
  };
  input.addEventListener("input", update);
  document.querySelector("#average-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
  document.querySelector("#average-copy").addEventListener("click", () => {
    const values = parseValues();
    if (!values.length) { toast("먼저 숫자를 입력해 주세요"); return; }
    copyText(`평균 ${document.querySelector("#average-mean").textContent}, 중앙값 ${document.querySelector("#average-median").textContent}, 합계 ${document.querySelector("#average-sum").textContent}`);
  });
  update();
}

function renderVatCalculator() {
  const faqs = [
    ["공급가액에서 부가세는 어떻게 계산하나요?", "일반적인 10% 세율을 적용하면 공급가액에 0.1을 곱해 부가세를 계산하고, 두 금액을 더해 합계금액을 구합니다."],
    ["부가세 포함 금액에서 공급가액은 어떻게 구하나요?", "합계금액을 1.1로 나누면 공급가액이 되고, 합계금액에서 공급가액을 빼면 부가세가 됩니다."],
    ["모든 거래에 10% 세율이 적용되나요?", "아닙니다. 영세율이나 면세 등 예외가 있으므로 실제 신고와 세금계산서 발행에는 거래 유형과 관련 법령을 확인해야 합니다."]
  ];
  pageShell(
    "부가세 계산기",
    "공급가액 또는 부가세 포함 합계금액을 기준으로 공급가액, 부가가치세와 최종 금액을 계산합니다.",
    `<div class="field"><label for="vat-mode">계산 방식</label>
       <select id="vat-mode"><option value="exclusive">공급가액에서 부가세 더하기</option><option value="inclusive">합계금액에서 부가세 분리하기</option></select>
     </div>
     <div class="field"><label for="vat-amount" id="vat-amount-label">공급가액 (원)</label><input id="vat-amount" type="number" min="0" step="1" inputmode="numeric" value="100000"></div>
     <div class="big-result"><span>합계금액</span><strong id="vat-total">110,000원</strong></div>
     <div class="results">
       <div class="result"><span>공급가액</span><strong id="vat-supply">100,000원</strong></div>
       <div class="result"><span>부가세</span><strong id="vat-tax">10,000원</strong></div>
       <div class="result"><span>적용 세율</span><strong>10%</strong></div>
       <div class="result"><span>계산 기준</span><strong id="vat-basis">별도</strong></div>
     </div>
     <div class="actions"><button class="btn btn-secondary" id="vat-reset">초기화</button><button class="btn btn-primary" id="vat-copy">결과 복사</button></div>
     <p class="inline-note">일반적인 10% 세율 기준의 참고용 계산입니다. 영세율·면세 거래와 실제 신고는 별도로 확인하세요.</p>`,
    `<h2>부가세 별도 금액 계산</h2>
     <p>공급가액이 100,000원이라면 10%인 10,000원이 부가세이고, 합계금액은 110,000원입니다. 공급가액 × 10%로 세액을 계산합니다.</p>
     <h2>부가세 포함 금액 계산</h2>
     <p>합계금액이 110,000원이라면 1.1로 나눈 100,000원이 공급가액이고 나머지 10,000원이 부가세입니다. 원 단위 반올림 때문에 세금계산서와 1원 정도 차이가 날 수 있습니다.</p>
     ${faqSection(faqs)}`
  );
  setFaqSchema(faqs);
  const mode = document.querySelector("#vat-mode");
  const amount = document.querySelector("#vat-amount");
  const label = document.querySelector("#vat-amount-label");
  const update = () => {
    const input = Math.max(0, Number(amount.value) || 0);
    let supply;
    let tax;
    let total;
    if (mode.value === "exclusive") {
      supply = input;
      tax = Math.round(supply * 0.1);
      total = supply + tax;
      label.textContent = "공급가액 (원)";
      document.querySelector("#vat-basis").textContent = "별도";
    } else {
      total = input;
      supply = Math.round(total / 1.1);
      tax = total - supply;
      label.textContent = "부가세 포함 합계금액 (원)";
      document.querySelector("#vat-basis").textContent = "포함";
    }
    document.querySelector("#vat-total").textContent = `${wonFormat.format(total)}원`;
    document.querySelector("#vat-supply").textContent = `${wonFormat.format(supply)}원`;
    document.querySelector("#vat-tax").textContent = `${wonFormat.format(tax)}원`;
  };
  [mode, amount].forEach((element) => element.addEventListener("input", update));
  document.querySelector("#vat-reset").addEventListener("click", () => {
    mode.value = "exclusive";
    amount.value = "100000";
    update();
    amount.focus();
  });
  document.querySelector("#vat-copy").addEventListener("click", () => {
    copyText(`공급가액 ${document.querySelector("#vat-supply").textContent}, 부가세 ${document.querySelector("#vat-tax").textContent}, 합계 ${document.querySelector("#vat-total").textContent}`);
  });
  update();
}

function renderMarginCalculator() {
  const faqs = [
    ["마진율은 어떻게 계산하나요?", "판매가에서 원가와 수수료 등 직접 비용을 뺀 순이익을 판매가로 나누고 100을 곱합니다."],
    ["마진율과 인상률은 무엇이 다른가요?", "마진율은 이익을 판매가로 나누지만 인상률은 이익을 원가로 나눕니다. 같은 거래라도 두 비율은 서로 다릅니다."],
    ["부가세와 배송비도 비용에 넣어야 하나요?", "실제 수익성을 보려면 판매자가 부담하는 부가세, 배송비, 포장비, 광고비와 결제 수수료 등을 비용에 포함해야 합니다."]
  ];
  pageShell(
    "마진율 계산기",
    "판매가와 상품 원가, 판매 수수료, 기타 비용을 입력해 예상 순이익과 마진율을 계산합니다.",
    `<div class="field-row">
       <div class="field"><label for="margin-price">판매가 (원)</label><input id="margin-price" type="number" min="0" step="100" inputmode="numeric" value="30000"></div>
       <div class="field"><label for="margin-cost">상품 원가 (원)</label><input id="margin-cost" type="number" min="0" step="100" inputmode="numeric" value="15000"></div>
     </div>
     <div class="field-row">
       <div class="field"><label for="margin-fee-rate">판매 수수료 (%)</label><input id="margin-fee-rate" type="number" min="0" max="100" step="0.1" inputmode="decimal" value="10"></div>
       <div class="field"><label for="margin-extra">기타 비용 (원)</label><input id="margin-extra" type="number" min="0" step="100" inputmode="numeric" value="2000"></div>
     </div>
     <div class="big-result"><span>예상 순이익</span><strong id="margin-profit">10,000원</strong></div>
     <div class="results">
       <div class="result"><span>마진율</span><strong id="margin-rate">33.33%</strong></div>
       <div class="result"><span>원가율</span><strong id="margin-cost-rate">50%</strong></div>
       <div class="result"><span>판매 수수료</span><strong id="margin-fee">3,000원</strong></div>
       <div class="result"><span>손익분기 판매가</span><strong id="margin-break-even">18,889원</strong></div>
     </div>
     <p class="inline-note" id="margin-status" aria-live="polite">판매가 대비 순이익의 비율입니다.</p>`,
    `<h2>마진율 계산 공식</h2>
     <p>순이익은 판매가에서 상품 원가, 판매 수수료와 기타 비용을 뺀 금액입니다. 마진율은 순이익 ÷ 판매가 × 100으로 계산합니다.</p>
     <h2>마진율과 원가 인상률의 차이</h2>
     <p>원가 10,000원인 상품을 15,000원에 판매하면 이익은 5,000원입니다. 마진율은 판매가 기준으로 약 33.33%지만, 원가 인상률은 원가 기준으로 50%입니다.</p>
     ${faqSection(faqs)}`
  );
  setFaqSchema(faqs);
  const price = document.querySelector("#margin-price");
  const cost = document.querySelector("#margin-cost");
  const feeRate = document.querySelector("#margin-fee-rate");
  const extra = document.querySelector("#margin-extra");
  const update = () => {
    const salePrice = Math.max(0, Number(price.value) || 0);
    const productCost = Math.max(0, Number(cost.value) || 0);
    const rate = Math.min(100, Math.max(0, Number(feeRate.value) || 0));
    const otherCost = Math.max(0, Number(extra.value) || 0);
    const fee = salePrice * rate / 100;
    const profit = salePrice - productCost - fee - otherCost;
    const marginRate = salePrice ? profit / salePrice * 100 : 0;
    const costRate = salePrice ? productCost / salePrice * 100 : 0;
    const feeMultiplier = 1 - rate / 100;
    const breakEven = feeMultiplier > 0 ? (productCost + otherCost) / feeMultiplier : Infinity;
    document.querySelector("#margin-profit").textContent = `${profit >= 0 ? "" : "-"}${wonFormat.format(Math.abs(profit))}원`;
    document.querySelector("#margin-rate").textContent = `${numberFormat.format(marginRate)}%`;
    document.querySelector("#margin-cost-rate").textContent = `${numberFormat.format(costRate)}%`;
    document.querySelector("#margin-fee").textContent = `${wonFormat.format(fee)}원`;
    document.querySelector("#margin-break-even").textContent = Number.isFinite(breakEven) ? `${wonFormat.format(Math.ceil(breakEven))}원` : "계산 불가";
    const status = document.querySelector("#margin-status");
    status.textContent = profit < 0
      ? `현재 조건에서는 ${wonFormat.format(Math.abs(profit))}원 손실입니다.`
      : profit === 0
        ? "현재 판매가는 손익분기점입니다."
        : "판매가 대비 순이익의 비율입니다.";
    status.classList.toggle("warning-note", profit < 0);
  };
  [price, cost, feeRate, extra].forEach((element) => element.addEventListener("input", update));
  update();
}

function renderFuelCostCalculator() {
  const faqs = [
    ["유류비는 어떻게 계산하나요?", "주행거리를 차량 연비로 나눠 필요한 연료량을 구하고, 여기에 리터당 유가를 곱해 예상 유류비를 계산합니다."],
    ["공인연비와 실제 연비가 다른 이유는 무엇인가요?", "교통 정체, 주행 속도, 냉난방 사용, 적재량, 타이어 상태와 운전 습관에 따라 실제 연비가 달라질 수 있습니다."],
    ["통행료와 주차비도 포함되나요?", "이 계산기는 연료비만 계산합니다. 전체 이동 비용을 정산하려면 통행료와 주차비를 기타 비용에 입력하세요."]
  ];
  pageShell(
    "유류비 계산기",
    "주행거리와 차량 연비, 리터당 유가를 입력해 필요한 연료량과 예상 유류비를 계산합니다.",
    `<div class="field-row">
       <div class="field"><label for="fuel-distance">편도 주행거리 (km)</label><input id="fuel-distance" type="number" min="0" step="0.1" inputmode="decimal" value="100"></div>
       <div class="field"><label for="fuel-efficiency">차량 연비 (km/L)</label><input id="fuel-efficiency" type="number" min="0.1" step="0.1" inputmode="decimal" value="12"></div>
     </div>
     <div class="field-row">
       <div class="field"><label for="fuel-price">리터당 유가 (원)</label><input id="fuel-price" type="number" min="0" step="1" inputmode="numeric" value="1700"></div>
       <div class="field"><label for="fuel-trip-type">주행 방식</label><select id="fuel-trip-type"><option value="1">편도</option><option value="2" selected>왕복</option></select></div>
     </div>
     <div class="field-row">
       <div class="field"><label for="fuel-people">정산 인원 (명)</label><input id="fuel-people" type="number" min="1" step="1" inputmode="numeric" value="2"></div>
       <div class="field"><label for="fuel-extra">통행료·주차비 (원)</label><input id="fuel-extra" type="number" min="0" step="100" inputmode="numeric" value="0"></div>
     </div>
     <div class="big-result"><span>예상 유류비</span><strong id="fuel-cost">28,333원</strong></div>
     <div class="results">
       <div class="result"><span>총 주행거리</span><strong id="fuel-total-distance">200km</strong></div>
       <div class="result"><span>필요 연료</span><strong id="fuel-liters">16.67L</strong></div>
       <div class="result"><span>전체 이동 비용</span><strong id="fuel-total-cost">28,333원</strong></div>
       <div class="result"><span>1인당 정산</span><strong id="fuel-per-person">14,167원</strong></div>
     </div>
     <p class="inline-note" id="fuel-status" aria-live="polite">실제 연비와 유가에 따라 결과가 달라질 수 있습니다.</p>`,
    `<h2>자동차 유류비 계산 방법</h2>
     <p>총 주행거리 ÷ 연비로 필요한 연료량을 구한 뒤 리터당 유가를 곱합니다. 예를 들어 200km를 연비 10km/L인 차량으로 주행하면 약 20L가 필요합니다.</p>
     <h2>출장비와 카풀 비용 정산</h2>
     <p>왕복 여부와 인원 수를 선택하면 전체 유류비와 1인당 금액을 함께 확인할 수 있습니다. 통행료와 주차비를 더하면 이동 비용 전체를 나누어 정산할 수 있습니다.</p>
     ${faqSection(faqs)}`
  );
  setFaqSchema(faqs);
  const distance = document.querySelector("#fuel-distance");
  const efficiency = document.querySelector("#fuel-efficiency");
  const fuelPrice = document.querySelector("#fuel-price");
  const tripType = document.querySelector("#fuel-trip-type");
  const people = document.querySelector("#fuel-people");
  const extra = document.querySelector("#fuel-extra");
  const update = () => {
    const oneWayDistance = Math.max(0, Number(distance.value) || 0);
    const kmPerLiter = Math.max(0, Number(efficiency.value) || 0);
    const pricePerLiter = Math.max(0, Number(fuelPrice.value) || 0);
    const multiplier = Number(tripType.value) || 1;
    const headcount = Math.max(1, Math.floor(Number(people.value) || 1));
    const otherCost = Math.max(0, Number(extra.value) || 0);
    const totalDistance = oneWayDistance * multiplier;
    const liters = kmPerLiter > 0 ? totalDistance / kmPerLiter : 0;
    const fuelCost = liters * pricePerLiter;
    const totalCost = fuelCost + otherCost;
    document.querySelector("#fuel-cost").textContent = `${wonFormat.format(fuelCost)}원`;
    document.querySelector("#fuel-total-distance").textContent = `${numberFormat.format(totalDistance)}km`;
    document.querySelector("#fuel-liters").textContent = `${numberFormat.format(liters)}L`;
    document.querySelector("#fuel-total-cost").textContent = `${wonFormat.format(totalCost)}원`;
    document.querySelector("#fuel-per-person").textContent = `${wonFormat.format(totalCost / headcount)}원`;
    const status = document.querySelector("#fuel-status");
    status.textContent = kmPerLiter > 0
      ? "실제 연비와 유가에 따라 결과가 달라질 수 있습니다."
      : "연비는 0보다 큰 값을 입력해 주세요.";
    status.classList.toggle("warning-note", kmPerLiter <= 0);
  };
  [distance, efficiency, fuelPrice, tripType, people, extra].forEach((element) => element.addEventListener("input", update));
  update();
}

const renderers = {
  "/": renderHome,
  "/tools/character-counter": renderCharacterCounter,
  "/tools/percentage-calculator": renderPercentageCalculator,
  "/tools/discount-calculator": renderDiscountCalculator,
  "/tools/dday-calculator": renderDdayCalculator,
  "/tools/random-picker": renderRandomPicker,
  "/tools/password-generator": renderPasswordGenerator,
  "/tools/text-cleaner": renderTextCleaner,
  "/tools/pyeong-calculator": renderPyeongCalculator,
  "/tools/age-calculator": renderAgeCalculator,
  "/tools/unit-converter": renderUnitConverter,
  "/tools/loan-calculator": renderLoanCalculator,
  "/tools/compound-interest-calculator": renderCompoundInterestCalculator,
  "/tools/time-calculator": renderTimeCalculator,
  "/tools/average-calculator": renderAverageCalculator,
  "/tools/vat-calculator": renderVatCalculator,
  "/tools/margin-calculator": renderMarginCalculator,
  "/tools/fuel-cost-calculator": renderFuelCostCalculator,
  "/404": renderNotFound
};

(renderers[route] || renderHome)();

function loadAds() {
  if (!appConfig.adsenseClient || document.querySelector("script[data-harutool-adsense]")) return;
  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.dataset.harutoolAdsense = "true";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(appConfig.adsenseClient)}`;
  document.head.appendChild(script);
  document.querySelectorAll("[data-ad-position]").forEach((container) => {
    const slot = appConfig.adSlots?.[container.dataset.adPosition];
    if (!slot) return;
    container.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="${appConfig.adsenseClient}" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
  });
}

function setConsent(value) {
  localStorage.setItem("harutool-consent", value);
  document.querySelector("#consent-banner").hidden = true;
  if (value === "accepted") loadAds();
  toast(value === "accepted" ? "선택 쿠키에 동의했습니다" : "필수 쿠키만 사용합니다");
}

function initConsent() {
  const banner = document.querySelector("#consent-banner");
  const saved = localStorage.getItem("harutool-consent");
  if (!saved) banner.hidden = false;
  if (saved === "accepted") loadAds();
  document.querySelector("#consent-accept").addEventListener("click", () => setConsent("accepted"));
  document.querySelector("#consent-essential").addEventListener("click", () => setConsent("essential"));
  document.querySelector("#cookie-settings").addEventListener("click", () => { banner.hidden = false; });
}

initConsent();
