# 과제 추가

`lucid-lab` 폴더의 터미널에서 실행합니다.

```powershell
.\add-project.cmd
```

제목(영문), 부제(선택), Project ID, 연구책임자, 기관, 지원기관, 사업명, 시작일, 종료일, 연구비를 차례로 입력합니다. 긴 제목도 한 줄로 붙여넣으면 화면 너비에 맞춰 자동 줄바꿈됩니다.

- 연구책임자와 기관은 Enter를 누르면 각각 `Hyun Ae Jung`, `Samsung Medical Center`가 입력됩니다.
- 날짜는 `2026-04-01` 형식입니다. 존재하지 않는 날짜나 시작일보다 빠른 종료일은 다시 입력합니다.
- 연구비는 `KRW 100 million`처럼 표시할 문구를 입력합니다.
- 마지막에 전체 내용을 확인하고 `y`를 입력하면 저장과 빌드가 실행됩니다. `N` 또는 입력 중 `Ctrl+C`는 취소입니다.

시작 연도별 최신순으로 묶이고 같은 연도에서도 시작일 최신순으로 정렬됩니다. 번호는 연도별 01부터 자동 생성됩니다. Project Contact는 표시하지 않습니다.

완료 후 `projects.html`을 새로고침하세요. 실제 사이트에 반영하려면 별도로 GitHub에 커밋·푸시해야 합니다.

## 수정과 삭제

정보는 `src/data/projects.json`에 저장됩니다. 기존 과제 수정·삭제는 해당 파일에서 처리한 뒤 `build.cmd`를 실행합니다. `key`는 펼치기 영역의 고유 식별자이므로 기존 값을 유지합니다. 디자인은 `src/_includes/project-list.njk`와 `assets/css/pages/projects.css`에서 수정합니다.

`add-project.cmd`는 인터넷 없이 실행되며 기존 빌드와 동일한 Node.js 환경을 사용합니다.

## Automatic project status

Projects are grouped into Ongoing Projects and Completed Projects, then by start year. Every add-project.cmd or build.cmd run evaluates end dates in Asia/Seoul. A project remains ongoing through its end date and becomes completed the following day. Future-start projects stay in Ongoing until their end date passes. No manual status field is needed. The published static site changes only after rebuilding and uploading the generated HTML.
