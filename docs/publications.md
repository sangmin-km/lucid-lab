# Publications 관리

Journal 목록은 PubMed에서 가져온 데이터를 사용합니다. Conference 탭은 기존처럼 `src/pages/publications.njk`에서 직접 관리합니다.

## 새 논문 업데이트

프로젝트 폴더의 터미널에서 실행합니다.

```powershell
.\update-publications.cmd
```

이 명령은 PubMed 검색 → 논문 정보 저장 → HTML 빌드를 순서대로 실행합니다. 인터넷 연결이 필요합니다. 사이트를 배포하는 경우 생성된 HTML과 관련 파일을 기존 방식으로 업로드합니다. 방문할 때 자동 갱신되거나 예약 실행되는 것은 아닙니다.

일반적인 `build.cmd`는 저장된 정보로만 빌드하므로 인터넷 연결이 필요 없습니다.

## 검색 기준

`src/data/pubmed-config.json`의 기본 검색어:

```text
Jung HA AND "last 5 years"[dp]
```

PubMed의 최근 5년 검색처럼 실행일 기준의 이동 기간입니다. 2026년에는 2021년 일부도 포함됩니다. PubMed의 이 검색은 미래 발행일로 등록된 논문도 포함할 수 있습니다. 포함 여부는 PubMed 출판일 검색에 맡기며 화면은 저널 발행연도별로 묶고 발행일 내림차순으로 정렬합니다. 인쇄 발행일과 온라인 발행일의 차이로 표시 연도와 검색 기간의 경계가 다를 수 있습니다.

이름 검색은 교수님만을 고유하게 식별하지 않습니다. 동명이인 논문 등 제외할 항목은 `excludePmids`에 PMID를 문자열로 추가한 다음 업데이트 명령을 다시 실행합니다.

```json
{
  "query": "Jung HA AND \"last 5 years\"[dp]",
  "excludePmids": ["제외할 PMID"]
}
```

## 파일 역할

- `src/data/pubmed-config.json`: 검색어와 제외 목록
- `scripts/update-publications.ps1`: PubMed 공식 E-utilities에서 검색/상세 정보 수집
- `src/data/publications.json`: 가져온 정보 저장본. 다음 업데이트 때 교체되므로 직접 수정하지 않습니다.
- `src/_includes/publication-list.njk`: 연도별 목록과 펼침 영역 디자인
- `assets/css/pages/publications.css`: 색상, 크기, 간격

원본에 없는 초록·키워드·DOI는 임의 생성하지 않고 해당 영역을 숨깁니다. 수집 오류, 빈 검색 결과 또는 불완전한 응답은 기존 저장본을 덮어쓰지 않습니다. 기존 수동 Journal 원본은 작업 폴더 상위 `.tools/before-pubmed/publications.njk`에 보관했습니다.

출처: [PubMed 검색 안내](https://pubmed.ncbi.nlm.nih.gov/help/), [E-utilities](https://www.ncbi.nlm.nih.gov/books/NBK25499/).
