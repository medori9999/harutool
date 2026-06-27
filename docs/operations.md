# 하루툴 운영·측정 체크리스트

무료 배포 테스트 단계의 목표는 “검색 유입이 실제로 생기는지”와 “광고 심사를 받을 만큼 사이트 품질이 쌓이는지”를 확인하는 것입니다. 아래 항목은 계정 생성이나 유료 결제 없이, 이미 준비된 Cloudflare Pages 배포를 기준으로 운영 상태를 점검하는 순서입니다.

## 매주 확인할 대시보드

| 목적 | 확인 위치 | 핵심 지표 | 해석 |
| --- | --- | --- | --- |
| 전체 방문자 | Cloudflare Dashboard → Analytics & Logs → Web Analytics | 방문자, 페이지뷰, 상위 페이지, 유입 경로, Core Web Vitals | 사이트에 사람이 실제로 들어오는지와 느린 페이지가 있는지 확인합니다. |
| 검색 유입 | Google Search Console → 실적 | 클릭수, 노출수, CTR, 평균 게재순위, 검색어 | 검색 결과에 노출되는 키워드와 클릭되는 페이지를 확인합니다. |
| 네이버 수집 | 네이버 서치어드바이저 → 리포트/요청 | 수집 상태, 색인 상태, 사이트맵 상태 | 네이버가 robots.txt와 sitemap.xml을 읽고 있는지 확인합니다. |
| 광고 수익 | Google AdSense → 보고서 | 예상 수입, 페이지뷰, 노출수, 클릭수, RPM | AdSense 승인 후부터 수익이 집계됩니다. 승인 전에는 수익이 0원인 것이 정상입니다. |

## Cloudflare Web Analytics 설정 확인

1. Cloudflare Dashboard에서 **Analytics & Logs → Web Analytics**로 이동합니다.
2. 하루툴 사이트를 추가하고 Web Analytics 토큰을 복사합니다.
3. Cloudflare Pages의 `harutool` 프로젝트에서 **Settings → Environment variables**에 `CLOUDFLARE_WEB_ANALYTICS_TOKEN`을 추가합니다.
4. 재배포 후 `npm run audit:launch` 또는 공개 사이트에서 페이지 소스를 확인해 `static.cloudflareinsights.com/beacon.min.js`가 삽입되는지 봅니다.

토큰을 넣기 전에는 방문자 수가 Cloudflare Web Analytics에 쌓이지 않습니다. Cloudflare Pages 자체의 요청 수와 Web Analytics 방문자 수는 집계 방식이 다를 수 있습니다.

토큰을 넣은 뒤에는 아래 명령으로 공개 사이트에 방문자 집계 스크립트가 실제 삽입됐는지 확인합니다.

```bash
REQUIRE_ANALYTICS=true SITE_URL=https://harutool.pages.dev npm run audit:live
```

로컬 빌드 산출물에서 Analytics 삽입까지 강제로 확인하려면 토큰을 환경 변수로 넣고 실행합니다.

```bash
REQUIRE_ANALYTICS=true CLOUDFLARE_WEB_ANALYTICS_TOKEN=발급받은_토큰 npm run build
REQUIRE_ANALYTICS=true CLOUDFLARE_WEB_ANALYTICS_TOKEN=발급받은_토큰 npm run audit:launch
```

## Search Console·네이버 확인 루틴

1. `https://harutool.pages.dev/sitemap.xml` 제출 상태가 성공인지 확인합니다.
2. 홈과 주요 도구 URL 3~5개를 URL 검사로 확인합니다.
3. “발견됨 - 현재 색인 생성되지 않음” 상태가 나오면 며칠 기다리되, 페이지가 200 응답이고 `index, follow`인지 먼저 확인합니다.
4. 검색어가 생기면 노출은 있는데 CTR이 낮은 페이지부터 제목과 설명을 개선합니다.
5. 검색어가 전혀 없으면 새 기능보다 기존 도구 설명, FAQ, 사용 예시를 보강하는 편이 먼저입니다.

### 색인 요청 우선순위

Search Console과 네이버 서치어드바이저에서 URL 검사를 할 때는 아래 순서로 요청합니다. 전부 한 번에 많이 넣기보다, 검색 의도가 분명한 페이지부터 먼저 확인합니다.

1. `https://harutool.pages.dev/`
2. `https://harutool.pages.dev/business`
3. `https://harutool.pages.dev/business/smartstore-margin`
4. `https://harutool.pages.dev/business/coupang-margin`
5. `https://harutool.pages.dev/business/vat-price`
6. `https://harutool.pages.dev/tools/margin-calculator`
7. `https://harutool.pages.dev/tools/vat-calculator`
8. `https://harutool.pages.dev/tools/discount-calculator`

위 URL은 현재 광고 수익화 테스트에서 가장 중요한 “판매자·사업자 계산” 검색 의도를 담당합니다. Search Console에서 노출이 생기면 이 목록의 페이지별 검색어, CTR, 평균 게재순위를 먼저 비교합니다.

### 검색 노출 주간 기록

검색 유입은 하루 단위로 보면 0이 계속 나올 수 있으므로, 같은 요일에 7일 단위로 비교합니다. 아래 항목을 매주 한 번만 기록하면 “색인이 안 된 문제인지”, “노출은 있지만 클릭이 없는 문제인지”, “방문은 있는데 광고 수익화 준비가 덜 된 문제인지”를 나눌 수 있습니다.

| 날짜 | 확인 범위 | 클릭수 | 노출수 | CTR | 평균 게재순위 | 상위 검색어 | 상위 페이지 | 다음 조치 |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| 예: 2026-06-26 | 최근 7일 | 0 | 0 | 0% | - | 없음 | 없음 | 색인 요청 URL 1~3번 재확인 |

판단 기준은 아래처럼 둡니다.

- 노출수 0: Search Console·네이버에서 sitemap 제출, URL 검사, `index, follow`, canonical을 먼저 확인합니다.
- 노출수는 있는데 CTR 1% 미만: 제목, 설명, 첫 화면 문구를 검색어와 더 가깝게 고칩니다.
- 클릭은 있는데 체류가 짧음: 해당 페이지의 예시, FAQ, 관련 도구 내부 링크를 보강합니다.
- 방문자는 있는데 광고 수익 0원: AdSense 승인, 광고 슬롯 환경 변수, `/ads.txt`, 선택 쿠키 동의 후 광고 로드를 확인합니다.

## AdSense 수익 확인 전제

AdSense 보고서에 수익이 잡히려면 아래 조건이 모두 필요합니다.

1. AdSense 사이트 심사 승인
2. `ADSENSE_CLIENT` 환경 변수 설정
3. 필요한 광고 슬롯 ID 환경 변수 설정
4. `/ads.txt`가 공개 사이트에서 200으로 응답
5. 방문자가 선택 쿠키에 동의한 뒤 광고 스크립트 로드

승인 전에는 `ADSENSE_CLIENT`를 비워두는 것이 안전합니다. 이 상태에서는 `/ads.txt`가 404로 응답하고, 광고 수익도 발생하지 않는 것이 정상입니다.

## 배포 후 빠른 점검 명령

```bash
npm run verify
SITE_URL=https://harutool.pages.dev npm run audit:live
```

`audit:live`가 통과하면 공개 사이트의 홈, 도구 URL, robots.txt, sitemap.xml, canonical, index 설정, 보안 헤더, 정적 자산 캐시, ads.txt 상태가 정상이라는 뜻입니다.

## 다음 개선 판단 기준

- 방문자는 있는데 검색 유입이 없다: Search Console 등록·사이트맵 제출·색인 요청을 먼저 확인합니다.
- 노출은 있는데 클릭이 없다: 제목, 설명, 첫 화면 문구를 개선합니다.
- 특정 도구만 방문이 있다: 그 도구의 설명과 관련 도구 내부 링크를 보강합니다.
- 방문자는 있는데 체류가 짧다: 계산 결과 설명, 예시, FAQ를 보강합니다.
- AdSense 심사가 거절된다: 개인정보처리방침, 문의 수단, 콘텐츠 독창성, 빈 페이지/오류 URL을 먼저 점검합니다.
