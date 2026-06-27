# 하루툴

매일 사용하는 생활·업무 도구를 모은 웹사이트입니다. 서버 의존성이 없어 Node.js 18 이상이면 바로 실행됩니다.

## 포함된 도구

- 글자 수 세기
- 퍼센트 계산기
- 할인 계산기
- 디데이 계산기
- 랜덤 뽑기
- 비밀번호 생성기
- 텍스트 정리기
- 평수 계산기
- 만 나이 계산기
- 길이·무게·온도 단위 변환기
- 대출 이자 계산기
- 복리 계산기
- 시간 계산기
- 평균 계산기
- 부가세 계산기
- 마진율 계산기
- 유류비 계산기

## 실행

```bash
npm start
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 검증

```bash
npm run verify
```

구문 검사와 함께 전체 도구 URL, 검색 메타데이터, canonical, 구조화 데이터, 사이트맵, robots.txt, 404와 신뢰 페이지를 실제 HTTP 요청으로 검사합니다. Cloudflare Pages용 정적 산출물도 함께 생성하고 검사합니다.

검색 등록·분석·광고 준비 상태만 빠르게 점검하려면:

```bash
npm run audit:launch
```

이 명령은 `dist` 산출물 기준으로 공개 URL, sitemap/robots, canonical, 구조화 데이터, 보안 헤더, 리다이렉트, AdSense와 Cloudflare Web Analytics 준비 상태를 확인합니다.

Cloudflare에 배포된 실제 공개 사이트를 읽기 전용으로 점검하려면:

```bash
SITE_URL=https://harutool.pages.dev npm run audit:live
```

이 명령은 공개 홈, robots.txt, sitemap.xml, 주요 URL, 리다이렉트, 보안 헤더, canonical, 구조화 데이터와 ads.txt 상태를 네트워크로 확인합니다.

## 배포 환경 변수

- `PORT`: 서버 포트
- `SITE_URL`: 실제 도메인. canonical URL, robots.txt, sitemap.xml에 사용됩니다.
- `NODE_VERSION`: Cloudflare Pages 빌드 런타임. `.node-version`, GitHub Actions, Render와 맞춰 `22`로 둡니다.
- `GOOGLE_SITE_VERIFICATION`: Google Search Console HTML 태그의 `content` 값
- `NAVER_SITE_VERIFICATION`: 네이버 서치어드바이저 HTML 태그의 `content` 값
- `CLOUDFLARE_WEB_ANALYTICS_TOKEN`: Cloudflare Web Analytics 토큰. 설정하면 방문자 계측 스크립트가 전체 페이지에 삽입됩니다.
- `SITEMAP_LASTMOD`: `YYYY-MM-DD` 형식의 사이트맵 갱신일. 비워두면 빌드 날짜가 사용됩니다.

## Cloudflare Pages 공개 배포

1. Cloudflare 대시보드에서 **Workers & Pages → Create → Pages → Connect to Git**을 선택합니다.
2. GitHub의 `medori9999/harutool` 저장소를 연결합니다.
3. 빌드 명령은 `npm run build`, 출력 디렉터리는 `dist`로 설정합니다. 이 명령은 정적 SEO 테스트까지 통과해야 성공합니다.
4. 환경 변수 `NODE_VERSION`은 `22`, `SITE_URL`에는 발급된 `https://...pages.dev` 주소를 입력합니다.
5. 다시 배포한 뒤 `/robots.txt`, `/sitemap.xml`과 핵심 도구 URL이 열리는지 확인합니다.

Cloudflare Pages의 정적 파일은 비활성 상태에서도 잠들지 않습니다. 도메인을 구입했다면 Custom domains에서 연결한 후 `SITE_URL`을 `https://실제도메인`으로 변경합니다.

GitHub Actions도 `main` 푸시와 Pull Request마다 `npm run verify`를 실행합니다. 검증에 실패한 변경은 Cloudflare 배포 전에 발견할 수 있습니다.

로컬에서 배포 산출물만 만들려면:

```bash
SITE_URL=https://harutool.pages.dev npm run build
```

## 광고 적용

AdSense 승인 후 환경 변수에 발급받은 값을 설정합니다.

- `ADSENSE_CLIENT`: `ca-pub-` 뒤에 숫자 16자리가 붙는 게시자 클라이언트 ID. 형식이 맞지 않으면 배포 검증에서 실패합니다.
- `ADSENSE_TOP_SLOT`: 홈 상단 광고 단위 ID
- `ADSENSE_SIDE_SLOT`: 도구 페이지 측면 광고 단위 ID

광고 스크립트는 방문자가 선택 쿠키에 동의한 뒤에만 불러옵니다. `ADSENSE_CLIENT`를 설정하면 `/ads.txt`도 게시자 ID에 맞춰 생성됩니다.

## 방문자 확인

무료 테스트 단계에서는 Cloudflare Web Analytics를 우선 사용합니다.

1. Cloudflare 대시보드에서 **Analytics & Logs → Web Analytics**로 이동합니다.
2. 사이트를 추가하고 발급된 Web Analytics 토큰을 복사합니다.
3. Pages 프로젝트의 환경 변수 `CLOUDFLARE_WEB_ANALYTICS_TOKEN`에 토큰을 저장합니다.
4. 다시 배포한 뒤 Cloudflare Web Analytics에서 방문 수, 상위 페이지, 유입 경로와 Core Web Vitals를 확인합니다.

공개 사이트에 방문자 집계 스크립트가 실제로 붙었는지 강제로 확인하려면:

```bash
REQUIRE_ANALYTICS=true SITE_URL=https://harutool.pages.dev npm run audit:live
```

Google 검색 유입은 Search Console의 실적 보고서에서 클릭수, 노출수, CTR, 평균 게재순위와 검색어를 확인합니다. 광고 수익은 AdSense 승인 후 AdSense 보고서에서 확인합니다.

운영 중 매주 확인할 대시보드와 수익 집계 전제 조건은 [운영·측정 체크리스트](docs/operations.md)를 기준으로 점검합니다.

## 출시 전 교체할 내용

- `hello@harutool.kr` 문의 주소
- `.env.example`을 참고한 Cloudflare Pages 환경 변수
- 개인정보처리방침의 분석·광고 제공 업체
- AdSense 및 Analytics 코드
- 실제 운영자 이메일과 연락 수단

## 검색 등록 순서

1. 공개 배포 후 `SITE_URL`을 실제 HTTPS 주소로 설정합니다.
2. [Google Search Console](https://search.google.com/search-console)에서 URL 접두어 속성을 추가합니다.
3. Search Console이 알려주는 HTML 태그의 `content` 값만 `GOOGLE_SITE_VERIFICATION`에 입력하고 재배포합니다.
4. [네이버 서치어드바이저](https://searchadvisor.naver.com/)에서 사이트를 추가하고 같은 방식으로 `NAVER_SITE_VERIFICATION`을 설정합니다.
5. 두 서비스에 `https://실제도메인/sitemap.xml`을 제출합니다.
6. 구글 URL 검사에서 홈과 핵심 계산기 3~5개에 색인 생성을 요청합니다.
7. 네이버 URL 검사에서 robots.txt와 사이트맵 수집 상태를 확인합니다.
8. 검색 노출과 방문자가 발생한 뒤 AdSense 심사를 요청합니다.

사이트맵 제출은 URL 발견을 돕지만 검색 노출이나 순위를 보장하지 않습니다. 이후에는 Search Console의 실제 검색어와 노출 페이지를 기준으로 도구와 설명 콘텐츠를 확장합니다.
