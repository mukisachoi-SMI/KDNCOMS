# 🚀 Netlify 배포 설정 가이드

## 📌 환경 변수 설정 문제 해결

### 현재 문제점
Netlify와 Supabase 연결 시 환경 변수가 잘못 설정되어 있습니다.

### ✅ 올바른 설정 방법

## 1. Netlify 대시보드에서 환경 변수 설정

### Site Settings > Environment Variables에서 추가:

```bash
# Supabase 연결 정보
REACT_APP_SUPABASE_URL=https://udmnzwpnwunbxfkbcjop.supabase.co
REACT_APP_SUPABASE_ANON_KEY=[Supabase 대시보드에서 복사한 anon key]
```

### 중요: React 앱에서는 환경변수명이 `REACT_APP_`으로 시작해야 합니다!

## 2. Supabase에서 Key 찾기

1. [Supabase Dashboard](https://app.supabase.com) 로그인
2. 프로젝트(COMS) 선택
3. Settings > API 메뉴
4. **Project URL**: `https://udmnzwpnwunbxfkbcjop.supabase.co`
5. **anon public key**: 복사하여 사용

## 3. 로컬 개발 환경 설정

### `.env.local` 파일 생성:
```bash
REACT_APP_SUPABASE_URL=https://udmnzwpnwunbxfkbcjop.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## 4. Supabase 클라이언트 설정 확인

### `src/utils/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 5. Netlify 빌드 설정

### Build Settings:
- **Build command**: `npm run build`
- **Publish directory**: `build`
- **Node version**: 18.x (Environment > Environment variables에서 `NODE_VERSION=18` 추가)

## 6. 재배포

환경 변수 설정 후:
1. Deploys 탭에서 "Trigger deploy" > "Clear cache and deploy site"
2. 빌드 로그 확인
3. 배포 완료 후 사이트 테스트

## 7. 트러블슈팅

### 환경 변수가 적용되지 않는 경우:
- 캐시 삭제 후 재배포
- 변수명이 `REACT_APP_`으로 시작하는지 확인
- 빌드 로그에서 에러 메시지 확인

### CORS 에러가 발생하는 경우:
Supabase Dashboard > Authentication > URL Configuration에서:
- Site URL: `https://your-netlify-site.netlify.app` 추가
- Redirect URLs에도 동일하게 추가

## 📱 iOS Safari 텍스트 색상 문제 해결

이미 코드에 수정사항을 적용했습니다:

### CSS 수정 (`src/index.css`):
```css
.input {
  /* iOS Safari 텍스트 색상 문제 해결 */
  color: #111827 !important;
  -webkit-text-fill-color: #111827 !important;
  background-color: white !important;
  -webkit-appearance: none;
}
```

### React 컴포넌트 인라인 스타일:
```jsx
style={{
  color: '#111827',
  WebkitTextFillColor: '#111827',
  backgroundColor: 'white'
}}
```

## ✅ 체크리스트

- [ ] Netlify 환경 변수 설정 완료
- [ ] Supabase API 키 복사 및 설정
- [ ] 로컬 `.env.local` 파일 생성
- [ ] 캐시 삭제 후 재배포
- [ ] iOS Safari에서 로그인 텍스트 색상 확인
- [ ] CORS 설정 확인

## 📞 추가 지원

문제가 계속되면 다음을 확인하세요:
1. Netlify 빌드 로그
2. 브라우저 콘솔 에러
3. Supabase 로그

---

**Last Updated**: 2025-01-13  
**Version**: 1.0.0
