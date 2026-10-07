
# LUCID 홈페이지 관리

VS Code 터미널에서 `lucid-lab` 폴더로 이동한 뒤 실행

```powershell
cd lucid-lab
```

## 자주 사용하는 명령

| 작업 | 명령 |
| --- | --- |
| PubMed 논문 업데이트 + 빌드 | `.\update-publications.cmd` |
| 새 과제 입력 + 빌드 | `.\add-project.cmd` |
| 수정한 내용으로 홈페이지 빌드 | `.\build.cmd` |

## 논문 업데이트

```powershell
.\update-publications.cmd
```

PubMed에서 `Jung HA`의 최근 5년 논문을 검색하고, 상세 정보를 저장한 뒤 홈페이지를 빌드

- 최근 5년은 명령 실행일 기준. 방문할 때마다 자동 수집하거나 예약 실행하지는 않습니다.
- 검색 조건은 `src/data/pubmed-config.json`의 `query`에서 변경합니다.
- 동명이인 등 제외할 논문은 같은 파일의 `excludePmids`에 PMID를 문자열로 추가한 뒤 업데이트 명령을 다시 실행합니다.
- `src/data/publications.json`은 자동 수집 결과이므로 직접 수정하면 다음 업데이트에서 덮어써집니다.
- Conference 내용은 `src/pages/publications.njk`에서 직접 수정한 뒤 `.\build.cmd`를 실행합니다.

세부 내용: [논문 관리 안내](docs/publications.md)

## 새 과제 추가

```powershell
.\add-project.cmd
```

질문이 나오는 순서대로 한 항목씩 입력하고 Enter를 누릅니다.

| 입력 항목 | 입력 방법 / 예시 |
| --- | --- |
| 과제 제목 | 영문 제목을 한 줄로 입력 |
| 부제 / 약어 | 없으면 Enter |
| Project ID | 고유 과제번호 입력 |
| Principal Investigator |  |
| Institution | |
| Funding Agency | 지원기관명 입력 |
| Program | 사업명 입력 |
| 시작일 | ex. `2021-06-01` |
| 종료일 | `2024-02-29` |
| Total Research Funding | 연구비 입력 |

마지막에 입력 내용을 확인하고 `y`를 입력하면 저장과 빌드가 실행됩니다. `N` 또는 입력 중 `Ctrl+C`로 취소할 수 있습니다. 이미 등록된 과제번호와 잘못된 날짜는 다시 입력하도록 안내합니다.

### 진행 / 종료 자동 분류

- **Ongoing Projects:** 종료일이 오늘이거나 이후인 과제. 아직 시작하지 않은 과제도 이 영역에 포함됩니다.
- **Completed Projects:** 종료일이 지난 과제.
- 한국 시간(`Asia/Seoul`) 기준으로 판단하며, 종료일 당일까지 진행 과제로 표시하고 다음 날부터 종료 과제로 분류합니다.
- 각 영역 안에서는 시작 연도별 최신순으로 묶고, 같은 연도에서도 시작일 최신순으로 정렬합니다. 번호는 연도별 01부터 자동 생성됩니다.

분류는 `.\add-project.cmd` 또는 `.\build.cmd` 실행 시 갱신됩니다. 날짜가 지났다고 배포된 사이트가 저절로 바뀌지는 않으므로 빌드 후 GitHub에 업로드하세요.

### 기존 과제 수정 / 삭제

`src/data/projects.json`에서 해당 과제의 정보를 수정하거나 과제 항목을 삭제한 뒤 실행합니다.

```powershell
.\build.cmd
```

수정 시 `key`는 기존 값을 유지하고, JSON의 쉼표와 따옴표 형식을 지켜주세요. 생성된 `projects.html`을 직접 수정하면 다음 빌드에서 덮어써집니다.

세부 내용: [과제 관리 안내](docs/projects.md)

## GitHub에 반영

논문 업데이트와 과제 추가 명령은 빌드까지 수행하지만 GitHub 업로드는 하지 않습니다. 로컬에서 내용을 확인한 뒤 실행하세요.

```powershell
.\build.cmd
.\build.cmd --check
git status
git add .
git commit -m "Update publications and research projects"
git push origin main
```

빌드나 검사에서 오류가 나오면 먼저 해결한 뒤 업로드합니다. GitHub Pages 배포가 완료되면 실제 홈페이지에 반영됩니다.

## 편집 위치와 실행 환경

- 페이지 내용: `src/pages/`
- 공통 헤더·푸터·목록 디자인: `src/_includes/`
- 데이터: `src/data/`
- 색상·폰트·간격: `assets/css/`
- 사진·로고: `assets/img/`

현재 PC에서는 상위 `.tools/`의 Node.js를 사용합니다. 다른 PC에서는 Node.js 22 이상을 설치하고 프로젝트 폴더에서 `npm ci`를 한 번 실행하세요. 과제 추가와 일반 빌드는 인터넷 없이 실행할 수 있습니다. 논문 업데이트는 Windows PowerShell과 인터넷 연결이 필요합니다.

루트의 HTML과 논문·과제 데이터는 Git에 포함합니다. `node_modules/`와 로컬 도구·임시 파일은 `.gitignore`로 제외합니다.
