# LUCID 홈페이지 수정 안내

기존 `.html` 주소와 `assets/` 위치를 유지하면서, Nunjucks로 공통 헤더와 푸터를 합쳐 HTML을 생성합니다. 별도 서버 프로그램 없이 기존처럼 정적 사이트로 배포할 수 있습니다.

## 어디를 수정하나요?

| 수정할 내용 | 원본 파일 |
| --- | --- |
| 메뉴 이름·순서·링크, 푸터 바로가기, 공통 연락처 | `src/data/site.json` |
| 헤더 배치·로고·메뉴 마크업 | `src/_includes/header.njk` |
| 푸터 배치·출처 표기 | `src/_includes/footer.njk` |
| 전체 페이지 기본 틀 | `src/_includes/base.njk` |
| 각 페이지 제목·메타 정보·본문 | `src/pages/페이지이름.njk` |
| 공통 폰트·CSS 연결·메타 설정 | `src/_includes/head.njk` |
| 공통 JS 연결·맨 위로 버튼·로딩 화면 | `src/_includes/scripts.njk` |
| 페이지 전용 CSS | `assets/css/pages/` |
| 논문 목록의 탭 전환 | `assets/js/pages/publications.js` |
| 공통 CSS·JavaScript·이미지 | 기존 `assets/` 폴더 |
| 홈 협업 로고 목록 | `src/data/site.json`의 `collaborators` |

예: 연구실 소개는 `src/pages/intro.njk`를 수정합니다. HTML 문법은 그대로 사용합니다. `head` 블록은 페이지 제목과 메타 정보, `styles`는 전용 CSS 연결, `content`는 본문입니다. 페이지 전용 스크립트가 있을 때만 `scripts` 블록을 추가합니다. 공통 CSS와 스크립트는 기본 틀에서 자동으로 불러옵니다.

**루트의 HTML은 생성 결과물입니다. 직접 수정하면 다음 빌드에서 덮어씁니다.** 템플릿을 수정하고 빌드한 다음 해당 HTML을 새로고침하세요.

## 현재 PC에서 빌드

PowerShell에서 `lucid-lab` 폴더로 이동한 후 실행합니다.

```powershell
.\build.cmd
```

현재 작업 공간의 `../.tools/`에 준비한 Node.js를 사용합니다. 시스템에 설치된 Node.js가 있으면 해당 실행 파일도 사용할 수 있습니다. `.tools/`와 `node_modules/`는 배포하거나 버전 관리할 필요가 없습니다.

## 다른 PC에서 최초 설정

Node.js 22 이상을 설치한 후 `lucid-lab` 폴더에서 실행합니다.

```sh
npm ci
npm run build
npm run check
```

`build`는 17개 페이지를 기존 위치에 생성합니다. `check`는 HTML이 현재 템플릿과 일치하는지 확인하며 파일을 수정하지 않습니다. 현재 PC에서는 `.\build.cmd --check`로도 확인할 수 있습니다.

## 배포

빌드 후 루트의 HTML 파일과 `assets/`를 배포합니다. GitHub Pages에서는 `.nojekyll`도 유지합니다. `src/`, `scripts/`, `docs/`, `node_modules/`, `package*.json`, 빌드 실행 파일은 서버에 올릴 필요가 없습니다. 현재 사이트는 PHP 폼을 사용하지 않습니다.

## 공통화 범위

- 17개 연구실 페이지의 헤더와 푸터를 공통화했습니다.
- 모든 페이지의 로고 아래에 `Lung Cancer Intelligence & Data Lab` 부제목을 표시합니다. 문구는 `src/data/site.json`의 `subtitle`, 스타일은 `assets/css/main.css`의 `.header .lab-subtitle`에서 관리합니다.
- 현재 메뉴를 자동 강조하며, 데이터 세부 페이지에서는 Data를 강조합니다.

### Data 페이지 관리

- `src/pages/data.njk`: 보유 데이터 소개, Data at a Glance, 종류별 상세 데이터 링크
- `src/pages/root-health.njk`: ROOT HEALTH 플랫폼 설명과 Data 바로가기
- 두 페이지의 공통 스타일: `assets/css/pages/root-health.css`
- 푸터 연락처는 기존 홈 페이지를 기준으로 통일했습니다. BootstrapMade 및 ThemeWagon 출처 링크를 유지했습니다.
- 본문과 표는 유지하고, 페이지 내부 CSS는 `assets/css/pages/`로 분리했습니다. RADAR·PRISM은 `research-detail.css`, 연도별 바이오마커·영상/추적 페이지는 `data-tables.css`를 공유합니다.
- 공통 폰트·CSS·JS 연결과 맨 위로 버튼·로딩 화면도 공통화했습니다. Members의 기존 폰트 굵기 설정은 유지했습니다.
- 사용되지 않는 Swiper, GLightbox, PureCounter, 폼 검증 및 Font Awesome은 프로젝트 밖 `../.tools/directory-cleanup-20260930/`로 보관했습니다. 미사용 `forms/`, 안내문만 있던 `assets/scss/`, macOS 메타데이터도 같은 곳으로 옮겼습니다. 이 백업은 로컬에만 있으며 Git에는 포함되지 않습니다.
- RADAR·PRISM의 작업 안내와 PRISM의 깨진 이미지 영역을 제거하고, PRISM 탭 제목을 수정했습니다. Patient의 준비 중 안내는 실제 페이지 상태를 설명하므로 유지했습니다.
- `starter-page.html` 원본은 `docs/examples/starter-page.html`로 옮겼습니다. 참고용 코드이며 배포 대상에서 제외합니다.
- `Activity` 메뉴는 `activity.html`로 연결됩니다. 내용은 `src/pages/activity.njk`, 스타일은 `assets/css/pages/activity.css`에서 관리합니다.

## 새 페이지 추가

홈의 `COLLABORATION`은 NEWS 다음에 표시됩니다. 협업 로고 파일은 `assets/img/SPIDERCORE.png`, `SANOFI.png`, `MGH.png`이며, 로고 목록·대체 텍스트는 `site.json`에서 관리합니다. 로고 파일 경로는 대소문자까지 일치시켜 주세요. 협업 문구는 `src/pages/index.njk`, 스타일은 `assets/css/pages/index.css`에서 수정합니다. `CONTACT PERSON`은 `members.html#heejin-cho`로 연결됩니다.

`src/pages/`에 기존 페이지를 복사해 새 이름의 `.njk` 파일을 만들고 제목과 본문을 수정하세요. `site.json`에 메뉴를 추가한 뒤 빌드하면 같은 이름의 `.html`이 생성됩니다. 페이지 삭제 시에는 원본과 기존 생성 HTML을 함께 정리해야 합니다. 빌드는 사용자 파일을 자동 삭제하지 않습니다.
