# BugSnap

BugSnap은 오류 화면 스크린샷을 업로드하면 OCR로 화면 텍스트를 추출하고, 개발자가 바로 GitHub Issue에 붙여넣을 수 있는 버그 리포트 Markdown 초안을 만들어주는 로컬 MVP 웹앱입니다.

외부 유료 API와 데이터베이스를 사용하지 않으며, OCR은 브라우저에서 `tesseract.js`로 실행되고 최근 리포트는 `localStorage`에 저장됩니다.

## 주요 기능

- PNG, JPG, JPEG 스크린샷 업로드
- 드래그 앤 드롭 및 파일 선택 지원
- 업로드 이미지 미리보기, 제거, 다시 업로드
- 브라우저 기반 OCR 텍스트 추출
- OCR 진행률, 오류 상태, 직접 텍스트 수정
- 버그 제목, 요약, 재현 절차, 예상 결과, 실제 결과 입력
- 브라우저, OS, 화면 크기, 발생 URL 자동 채움
- OCR 텍스트 기반 제목/요약/심각도 자동 추론
- GitHub Issue용 Markdown 자동 생성
- Markdown 한 번에 복사
- Markdown `.md` 파일 다운로드
- 리포트 완성도 점수와 부족한 항목 안내
- 최근 리포트 localStorage 저장, 불러오기, 삭제
- 데스크톱 2단 레이아웃 및 모바일 세로 배치

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

COMS 배포 경로 기준으로 확인하려면 `http://localhost:3000/BugSnap`을 엽니다.

프로덕션 빌드 확인:

```bash
npm run build
```

`npm run build`는 정적 export를 생성하며 결과물은 `out/`에 저장됩니다.

테스트와 린트:

```bash
npm test
npm run lint
```

## 사용 기술

- Next.js 16 App Router
- TypeScript
- React 19
- Tailwind CSS 4
- tesseract.js
- lucide-react
- Vitest
- localStorage

## 배포

GitHub Actions는 `main` 브랜치 push 시 테스트, 린트, audit, 정적 빌드를 실행한 뒤 `out/`을 COMS 서버의 `/var/www/coms/BugSnap`으로 동기화합니다.

필요한 GitHub Secrets:

- `DEPLOY_HOST`
- `DEPLOY_PORT`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY_B64`

서버에서 직접 배포해야 할 때는 저장소 체크아웃 위치에서 다음 스크립트를 사용할 수 있습니다.

```bash
bash scripts/deploy-coms.sh
```

## 폴더 구조

```text
BugSnap/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── BugForm.tsx
│   ├── ImageUploader.tsx
│   ├── MarkdownPreview.tsx
│   ├── OcrPanel.tsx
│   └── RecentReports.tsx
├── lib/
│   ├── environment.ts
│   ├── download.ts
│   ├── reportQuality.ts
│   ├── reportGenerator.ts
│   └── storage.ts
├── tests/
│   ├── download.test.ts
│   ├── environment.test.ts
│   ├── reportQuality.test.ts
│   ├── reportGenerator.test.ts
│   └── storage.test.ts
├── types/
│   └── report.ts
├── scripts/
│   └── deploy-coms.sh
├── next.config.ts
├── package.json
└── README.md
```

## 향후 개선 아이디어

- GitHub Issue API 연동
- Jira/Notion 내보내기
- AI 기반 리포트 요약
- 팀별 프로젝트 관리
- 브라우저 확장 프로그램 버전
- 에러 로그 파일 업로드 지원
