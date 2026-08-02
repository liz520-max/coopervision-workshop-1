# CooperVision Value Workshop — 배포 가이드

## 이 프로젝트에 들어있는 것
- `src/App.jsx` — 원래 작성하신 게임 앱 (일부만 수정함)
- `api/score.js` — AI 채점을 대신 처리하는 서버 함수 (API 키 보호용)
- `api/teams.js` — 팀별 점수를 모두가 함께 보는 공유 저장소 (Upstash Redis 사용)

**원본 파일에서 바뀐 부분 2가지**
1. `api.anthropic.com`을 직접 호출하던 부분 → 우리 서버(`/api/score`)를 거치도록 변경 (API 키를 브라우저에 노출하면 안 되기 때문)
2. `window.storage`(Claude 아티팩트 전용 기능) → 우리 서버(`/api/teams`)를 거치도록 변경

앱의 디자인, 문제, 채점 기준, 화면 흐름 등은 전혀 건드리지 않았습니다.

---

## 방법 A. GitHub + Vercel로 배포하기 (추천, 무료)

### 1단계: GitHub에 올리기
```bash
cd coopervision-workshop
git init
git add .
git commit -m "init"
```
GitHub에서 새 저장소를 만든 뒤:
```bash
git remote add origin <내 저장소 URL>
git push -u origin main
```

### 2단계: Vercel 가입 및 연결
1. https://vercel.com 에서 GitHub 계정으로 가입
2. "Add New... → Project" → 방금 만든 저장소 선택 → Import
3. Framework Preset은 자동으로 "Vite"로 인식됩니다. 그대로 "Deploy" 클릭

### 3단계: 환경변수 설정 (배포 후 꼭 해야 함)
Vercel 프로젝트 → **Settings → Environment Variables**에서 추가:

| Key | Value | 어디서 받나요 |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | https://console.anthropic.com → API Keys |
| `UPSTASH_REDIS_REST_URL` | 자동 입력됨 | 아래 4단계 참고 |
| `UPSTASH_REDIS_REST_TOKEN` | 자동 입력됨 | 아래 4단계 참고 |

값 추가 후 **Deployments → 맨 위 배포 → "Redeploy"**를 한번 눌러줘야 반영됩니다.

### 4단계: 팀 리더보드 저장소(Upstash Redis) 연결 — 2분 소요
1. Vercel 프로젝트 → **Storage** 탭 → **Create Database → Upstash → Redis** 선택
2. 무료 플랜 선택 후 생성 → 자동으로 프로젝트에 연결됨 (환경변수도 자동으로 채워짐)
3. 다시 Redeploy

> 이 단계를 건너뛰어도 앱은 정상 작동합니다. 다만 팀 간 리더보드가 공유되지 않고(강사 화면에서 팀 목록이 비어있음), AI 채점 대신 자동채점(fallback)만 될 수 있어요.

### 5단계: 접속
배포가 끝나면 Vercel이 `https://프로젝트이름.vercel.app` 같은 주소를 줍니다. 이 링크를 워크숍 참가자들에게 공유하면 누구나 접속할 수 있습니다.

---

## 방법 B. 로컬에서 바로 테스트해보고 싶을 때

```bash
cd coopervision-workshop
npm install
npm run dev
```
`http://localhost:5173` 접속. (단, `/api/score`, `/api/teams`는 Vercel 서버 환경에서만 동작하므로, 로컬 테스트 시에는 `vercel dev` 명령어를 쓰거나 Vercel CLI를 설치해서 실행하는 게 정확합니다.)

```bash
npm i -g vercel
vercel dev
```

---

## 자주 묻는 질문

**Q. Vercel 대신 Netlify를 써도 되나요?**
네, 가능합니다. 다만 `api/*.js` 폴더 구조가 Vercel 방식이라, Netlify는 `netlify/functions/` 폴더로 옮기고 문법을 약간 바꿔야 합니다. Vercel이 지금 구조 그대로 가장 간단합니다.

**Q. 도메인을 회사 도메인(예: workshop.coopervision.com)으로 하고 싶어요.**
Vercel 프로젝트 → Settings → Domains에서 원하는 도메인을 연결하면 됩니다 (DNS 설정 필요).

**Q. 비용이 드나요?**
워크숍처럼 짧은 기간, 소규모 인원(수십~수백 명) 사용이라면 Vercel 무료 티어 + Upstash 무료 티어로 충분합니다. Anthropic API 호출 비용만 사용한 만큼 과금됩니다.

**Q. 참가자 인증(로그인 보안)이 필요한가요?**
지금 앱은 팀 이름만 입력하면 되는 구조라 별도 인증이 없습니다. 워크숍 링크를 아는 사람은 누구나 들어올 수 있으니, 필요하면 배포 후 링크를 워크숍 참가자에게만 공유하는 방식을 권장합니다.
