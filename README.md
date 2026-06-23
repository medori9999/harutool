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

구문 검사와 함께 전체 도구 URL, 검색 메타데이터, canonical, 구조화 데이터, 사이트맵, robots.txt, 404와 신뢰 페이지를 실제 HTTP 요청으로 검사합니다. Render 배포도 이 검증을 통과해야 진행됩니다.

## 배포 환경 변수

- `PORT`: 서버 포트
- `SITE_URL`: 실제 도메인. canonical URL, robots.txt, sitemap.xml에 사용됩니다.
- `GOOGLE_SITE_VERIFICATION`: Google Search Console HTML 태그의 `content` 값
- `NAVER_SITE_VERIFICATION`: 네이버 서치어드바이저 HTML 태그의 `content` 값

## Render 공개 배포

1. 이 프로젝트를 GitHub 저장소에 올립니다.
2. Render에서 **New → Blueprint**를 선택합니다.
3. GitHub 저장소를 연결하면 `render.yaml`을 읽어 웹 서비스를 만듭니다.
4. 첫 배포 후 Render가 제공한 `https://...onrender.com` 주소를 `SITE_URL` 환경 변수에 입력합니다.
5. 다시 배포한 뒤 `/health`, `/robots.txt`, `/sitemap.xml`이 열리는지 확인합니다.

도메인을 구입했다면 Render의 Custom Domains에서 연결한 후 `SITE_URL`을 `https://실제도메인`으로 변경합니다.

## 광고 적용

AdSense 승인 후 환경 변수에 발급받은 값을 설정합니다.

- `ADSENSE_CLIENT`: `ca-pub-...` 형식의 게시자 클라이언트 ID
- `ADSENSE_TOP_SLOT`: 홈 상단 광고 단위 ID
- `ADSENSE_SIDE_SLOT`: 도구 페이지 측면 광고 단위 ID

광고 스크립트는 방문자가 선택 쿠키에 동의한 뒤에만 불러옵니다. `ADSENSE_CLIENT`를 설정하면 `/ads.txt`도 게시자 ID에 맞춰 생성됩니다.

## 출시 전 교체할 내용

- `hello@harutool.kr` 문의 주소
- `.env.example`의 실제 도메인
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
