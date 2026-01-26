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

## 환경 변수

배포 시 다음 환경 변수를 설정해야 합니다:

- `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
- `VITE_SUPABASE_ANON_KEY`: Supabase Anon Key

## 커스텀 도메인

1. Netlify 대시보드 → Site settings → Domain management
2. "Add custom domain" 클릭
3. 도메인 입력 및 DNS 설정

## 참고사항

- `netlify.toml` 파일이 자동으로 SPA 라우팅을 처리합니다
- 모든 경로는 `index.html`로 리다이렉트되어 React Router가 작동합니다
- 빌드 후 `dist` 폴더가 배포됩니다
