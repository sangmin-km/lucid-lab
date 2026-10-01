# 디렉토리 점검 (2026-09-30)

## Git 관리

실제 저장소 루트인 `lucid-lab/.gitignore`에서 `node_modules/`, OS 메타데이터, 환경변수 파일, 임시 수집 파일과 로그를 제외합니다. 상위 `homepage/.gitignore`는 내부 저장소에 적용되지 않습니다.

아래 파일은 필요하므로 Git에 포함해야 합니다.

- `src/`, `scripts/`, `assets/`, `docs/`, `README.md`
- `package.json`, `package-lock.json`, `build.cmd`, `update-publications.cmd`
- 생성된 루트 HTML 16개와 `.nojekyll`: 현재 정적 배포 방식 유지
- `src/data/publications.json`: 네트워크 없이 빌드할 때 사용하는 논문 저장본

설치된 `node_modules/`는 로컬 빌드에 필요하므로 삭제하지 않습니다. 다른 PC에서는 Node.js 22 이상 설치 후 `npm ci`로 복원합니다. 상위 `.tools/`에는 현재 PC의 Node 실행 파일도 있으므로 전체를 삭제하면 `build.cmd` 실행 환경에 영향을 줄 수 있습니다.

## 보관한 미사용 파일

현재 템플릿과 실행 스크립트에서 참조하지 않는 아래 항목을 `../.tools/directory-cleanup-20260930/`에 원래 상대 경로대로 옮겼습니다.

- `forms/`: 사용하지 않는 PHP 폼 예제
- `assets/scss/`: SCSS 원본 없이 구매 안내문만 있는 폴더
- `assets/vendor/`의 `fontawesome-free`, `glightbox`, `php-email-form`, `purecounter`, `swiper`
- 루트, `assets/`, `assets/img/`의 `.DS_Store`

`docs/examples/starter-page.html`은 원본 참고용 코드라 미사용 라이브러리 경로가 남아 있습니다. 실행·배포 대상이 아닙니다.

## 보존한 항목

Bootstrap, Bootstrap Icons(폰트 포함), AOS는 현재 화면에서 사용합니다. 해당 라이브러리의 배포 파일·소스맵과 출처 표기는 유지합니다.

현재 원본에서 참조하지 않는 `home.jpg`, `professor.jpg`, `hero-bg.jpg`, `logo.png`, `empty.png`, `doctors/icon.png`, `doctors/user.png`도 교체용 이미지일 수 있어 보존했습니다.

## 발견한 연결 문제

- Members의 이메일 한 곳에 빠진 `mailto:`를 수정했습니다.
- 점검 당시 없었던 `activity.html`은 이후 기본 안내 페이지로 추가했습니다. 현재 메뉴 연결은 정상이며, 실제 활동 내용은 추후 등록합니다.

논문 업데이트 절차는 [publications.md](publications.md)를 참고하세요.
