# PWA 아이콘 설정 가이드

## 개요
이 문서는 교회 헌금관리시스템의 PWA 아이콘을 라이트/다크 모드에 따라 동적으로 적용하는 방법을 설명합니다.

## 아이콘 파일 구조

```
public/
├── icons/
│   ├── coms_b-16x16.png     # 브라이트 모드 아이콘
│   ├── coms_b-32x32.png
│   ├── coms_b-72x72.png
│   ├── coms_b-96x96.png
│   ├── coms_b-128x128.png
│   ├── coms_b-144x144.png
│   ├── coms_b-152x152.png
│   ├── coms_b-192x192.png
│   ├── coms_b-384x384.png
│   ├── coms_b-512x512.png
│   ├── coms_d-16x16.png     # 다크 모드 아이콘
│   ├── coms_d-32x32.png
│   ├── coms_d-72x72.png
│   ├── coms_d-96x96.png
│   ├── coms_d-128x128.png
│   ├── coms_d-144x144.png
│   ├── coms_d-152x152.png
│   ├── coms_d-192x192.png
│   ├── coms_d-384x384.png
│   └── coms_d-512x512.png
├── manifest.json             # 브라이트 모드 manifest
├── manifest-dark.json        # 다크 모드 manifest
└── service-worker.js         # 업데이트된 서비스 워커
```

## 아이콘 생성 방법

### 1. 수동 리사이징 (Photoshop, GIMP 등)
원본 아이콘을 각 크기로 수동으로 리사이징하고 저장합니다.

### 2. 온라인 도구 사용
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://progressier.com/pwa-icons-and-ios-splash-screen-generator)
- [Favicon.io](https://favicon.io/)

### 3. ImageMagick 사용 (명령줄)

Windows에서 ImageMagick 설치 후:

```batch
@echo off
REM 브라이트 모드 아이콘 생성
magick convert coms_b_original.png -resize 16x16 public/icons/coms_b-16x16.png
magick convert coms_b_original.png -resize 32x32 public/icons/coms_b-32x32.png
magick convert coms_b_original.png -resize 72x72 public/icons/coms_b-72x72.png
magick convert coms_b_original.png -resize 96x96 public/icons/coms_b-96x96.png
magick convert coms_b_original.png -resize 128x128 public/icons/coms_b-128x128.png
magick convert coms_b_original.png -resize 144x144 public/icons/coms_b-144x144.png
magick convert coms_b_original.png -resize 152x152 public/icons/coms_b-152x152.png
magick convert coms_b_original.png -resize 192x192 public/icons/coms_b-192x192.png
magick convert coms_b_original.png -resize 384x384 public/icons/coms_b-384x384.png
magick convert coms_b_original.png -resize 512x512 public/icons/coms_b-512x512.png

REM 다크 모드 아이콘 생성
magick convert coms_d_original.png -resize 16x16 public/icons/coms_d-16x16.png
magick convert coms_d_original.png -resize 32x32 public/icons/coms_d-32x32.png
magick convert coms_d_original.png -resize 72x72 public/icons/coms_d-72x72.png
magick convert coms_d_original.png -resize 96x96 public/icons/coms_d-96x96.png
magick convert coms_d_original.png -resize 128x128 public/icons/coms_d-128x128.png
magick convert coms_d_original.png -resize 144x144 public/icons/coms_d-144x144.png
magick convert coms_d_original.png -resize 152x152 public/icons/coms_d-152x152.png
magick convert coms_d_original.png -resize 192x192 public/icons/coms_d-192x192.png
magick convert coms_d_original.png -resize 384x384 public/icons/coms_d-384x384.png
magick convert coms_d_original.png -resize 512x512 public/icons/coms_d-512x512.png
```

### 4. Node.js 스크립트 사용

`generate-icons.js` 파일 생성:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const themes = [
  { input: 'coms_b_original.png', prefix: 'coms_b' },
  { input: 'coms_d_original.png', prefix: 'coms_d' }
];

async function generateIcons() {
  const iconDir = path.join(__dirname, 'public', 'icons');
  
  // icons 디렉토리 생성
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }

  for (const theme of themes) {
    for (const size of sizes) {
      await sharp(theme.input)
        .resize(size, size)
        .toFile(path.join(iconDir, `${theme.prefix}-${size}x${size}.png`));
      
      console.log(`Generated: ${theme.prefix}-${size}x${size}.png`);
    }
  }
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
```

설치 및 실행:
```bash
npm install sharp
node generate-icons.js
```

## 기능 동작 방식

### 1. 테마 감지
- 브라우저의 `prefers-color-scheme` 미디어 쿼리를 사용하여 사용자의 시스템 테마를 감지합니다.
- 다크 모드가 감지되면 다크 모드용 아이콘과 manifest를 로드합니다.

### 2. 동적 아이콘 로딩
- `index.html`의 스크립트가 실행되면서 테마에 맞는 아이콘을 동적으로 생성합니다.
- iOS의 `apple-touch-icon`과 일반 favicon이 모두 테마에 맞게 설정됩니다.

### 3. Service Worker 캐싱
- 모든 아이콘 파일이 Service Worker에 의해 캐시됩니다.
- 오프라인 상태에서도 아이콘이 정상적으로 표시됩니다.

### 4. 테마 변경 대응
- 시스템 테마가 변경되면 Service Worker에 메시지를 보내 캐시를 업데이트합니다.
- 필요시 페이지를 새로고침하여 새 아이콘을 적용할 수 있습니다.

## Netlify 배포 설정

### 1. Build 설정
`netlify.toml` 파일이 이미 구성되어 있으므로 추가 설정은 필요하지 않습니다.

### 2. 헤더 설정 (선택사항)
더 나은 PWA 성능을 위해 `public/_headers` 파일 추가:

```
/manifest.json
  Content-Type: application/manifest+json
  Cache-Control: public, max-age=0, must-revalidate

/manifest-dark.json
  Content-Type: application/manifest+json
  Cache-Control: public, max-age=0, must-revalidate

/icons/*
  Cache-Control: public, max-age=31536000, immutable

/service-worker.js
  Cache-Control: public, max-age=0, must-revalidate
```

## 테스트 방법

### 1. 로컬 테스트
```bash
npm run build
npx serve -s build
```

### 2. PWA 설치 테스트
1. Chrome에서 사이트 열기
2. 주소창의 설치 아이콘 클릭
3. 설치 후 시스템 테마 변경
4. 아이콘이 적절히 변경되는지 확인

### 3. Lighthouse 테스트
Chrome DevTools > Lighthouse 탭에서 PWA 점수 확인

## 주의사항

1. **아이콘 최적화**: PNG 파일을 최적화하여 파일 크기를 줄이세요 (TinyPNG, ImageOptim 등 사용).

2. **브라우저 호환성**: 
   - 동적 manifest 변경은 모든 브라우저에서 지원되지 않을 수 있습니다.
   - iOS Safari는 제한적인 PWA 지원을 제공합니다.

3. **캐시 관리**: 
   - 아이콘 변경 시 Service Worker 버전을 업데이트하세요.
   - 브라우저 캐시를 강제로 지우는 것이 필요할 수 있습니다.

4. **maskable 아이콘**: 
   - Android에서는 maskable 아이콘이 필요합니다.
   - 아이콘 주변에 충분한 여백을 두세요.

## 문제 해결

### 아이콘이 표시되지 않는 경우
1. 브라우저 캐시 지우기
2. Service Worker 업데이트 확인
3. 콘솔에서 404 에러 확인
4. 파일 경로 확인

### 다크 모드가 적용되지 않는 경우
1. 시스템 테마 설정 확인
2. 브라우저가 다크 모드를 지원하는지 확인
3. JavaScript 콘솔 에러 확인

### PWA 설치가 안 되는 경우
1. HTTPS 연결 확인 (Netlify는 자동 제공)
2. manifest.json 유효성 검사
3. Service Worker 등록 확인
4. Lighthouse PWA 체크리스트 확인

## 추가 리소스

- [Web App Manifest 명세](https://www.w3.org/TR/appmanifest/)
- [PWA 아이콘 가이드](https://web.dev/add-manifest/#icons)
- [다크 모드 웹 개발](https://web.dev/prefers-color-scheme/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)