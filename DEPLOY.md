# Netlify 배포 가이드

## 배포 방법

### 방법 1: GitHub 연동 (권장)

1. **GitHub에 코드 푸시**
   ```bash
   git push origin main
   ```

2. **Netlify 대시보드에서 배포**
   - [Netlify](https://app.netlify.com)에 로그인
   - "Add new site" → "Import an existing project" 클릭
   - GitHub 선택 후 저장소 연결
   - 빌드 설정:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - "Deploy site" 클릭

3. **환경 변수 설정**
   - Site settings → Environment variables
   - 다음 변수 추가:
     ```
     VITE_SUPABASE_URL=https://mazsobuocswsabkbfqhe.supabase.co
     VITE_SUPABASE_ANON_KEY=sb_publishable_8IcdApGjvKJx4vfGfewOIQ_6gH-OGL_
     ```
   - "Save" 클릭 후 재배포

### 방법 2: Netlify CLI

1. **CLI 설치 및 로그인**
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **프로젝트 초기화**
   ```bash
   netlify init
   ```
   - Site name: 원하는 사이트 이름 입력
   - Build command: `npm run build`
   - Directory to deploy: `dist`

3. **환경 변수 설정**
   ```bash
   netlify env:set VITE_SUPABASE_URL "https://mazsobuocswsabkbfqhe.supabase.co"
   netlify env:set VITE_SUPABASE_ANON_KEY "sb_publishable_8IcdApGjvKJx4vfGfewOIQ_6gH-OGL_"
   ```

4. **배포**
   ```bash
   # 테스트 배포
   netlify deploy
   
   # 프로덕션 배포
   netlify deploy --prod
   ```

### 방법 3: Drag & Drop

1. **빌드**
   ```bash
   npm run build
   ```

2. **Netlify 대시보드에서 배포**
   - [Netlify](https://app.netlify.com)에 로그인
   - "Add new site" → "Deploy manually"
   - `dist` 폴더를 드래그 앤 드롭
   - 환경 변수는 Site settings에서 설정

## 재배포 방법 (Step by Step)

### 방법 A: GitHub 자동 배포 (가장 간단)

1. **코드 변경 후 GitHub에 푸시**
   ```bash
   git add .
   git commit -m "your commit message"
   git push origin main
   ```

2. **Netlify 자동 배포 확인**
   - Netlify 대시보드 접속: https://app.netlify.com
   - 사이트 선택
   - "Deploys" 탭 클릭
   - 자동으로 새 배포가 시작됨 (몇 초 내)
   - 배포 상태 확인:
     - "Building" → 빌드 중
     - "Published" → 배포 완료

3. **배포 완료 확인**
   - "Published" 상태가 되면 사이트가 업데이트됨
   - 사이트 URL로 접속하여 변경사항 확인

### 방법 B: Netlify 대시보드에서 수동 재배포

1. **Netlify 대시보드 접속**
   - https://app.netlify.com 로그인

2. **사이트 선택**
   - 배포된 사이트 클릭

3. **재배포 트리거**
   - "Deploys" 탭 클릭
   - "Trigger deploy" 버튼 클릭
   - "Deploy site" 선택
   - 또는 "Clear cache and deploy site" (캐시 삭제 후 재배포)

4. **배포 진행 확인**
   - 배포 로그 확인
   - 빌드 성공/실패 확인
   - "Published" 상태 확인

### 방법 C: Netlify CLI로 재배포

1. **프로젝트 디렉토리로 이동**
   ```bash
   cd /Users/bitnagu/Downloads/study-flow-main
   ```

2. **재배포 실행**
   ```bash
   # 프로덕션 재배포
   netlify deploy --prod
   
   # 또는 빌드 후 배포
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **배포 상태 확인**
   - CLI에서 배포 URL 확인
   - 브라우저에서 사이트 확인

### 방법 D: 특정 커밋으로 재배포

1. **Netlify 대시보드 접속**
   - 사이트 선택 → "Deploys" 탭

2. **이전 배포 선택**
   - 재배포할 배포 항목 찾기
   - "..." 메뉴 클릭
   - "Publish deploy" 선택

## 환경 변수 확인 및 수정

1. **Netlify 대시보드 접속**
   - 사이트 선택

2. **환경 변수 확인**
   - "Site settings" 클릭
   - "Environment variables" 클릭
   - 다음 변수 확인:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. **환경 변수 수정**
   - 변수 클릭 → "Edit" → 값 수정 → "Save"
   - 자동으로 재배포됨

## 배포 로그 확인

1. **Netlify 대시보드 접속**
   - 사이트 선택 → "Deploys" 탭

2. **배포 로그 보기**
   - 배포 항목 클릭
   - "Deploy log" 탭에서 빌드 로그 확인
   - 에러 발생 시 로그에서 확인 가능

## 문제 해결

### 배포 실패 시
1. 배포 로그 확인
2. 환경 변수 확인
3. 빌드 명령어 확인 (`npm run build`)
4. `netlify.toml` 설정 확인

### 캐시 문제 시
- "Clear cache and deploy site" 사용
- 또는 `netlify deploy --prod --dir=dist` 사용

## 참고사항

- GitHub 연동 시: 코드 푸시 시 자동 배포
- `netlify.toml` 파일이 자동으로 SPA 라우팅을 처리합니다
- 모든 경로는 `index.html`로 리다이렉트되어 React Router가 작동합니다
- 빌드 후 `dist` 폴더가 배포됩니다
