# StudyFlow 모바일 (iOS / Android)

React + Capacitor로 빌드한 웹 앱을 iOS·Android 네이티브 앱으로 실행하는 방법입니다.

## 요구 사항

- **iOS**: Mac, Xcode, CocoaPods. Capacitor 8은 **iOS 15.0** 이상 필요 (Podfile 및 Xcode deployment target을 15.0으로 설정).
- **Android**: Android Studio (또는 JDK + Android SDK)

## 웹 빌드 후 앱에 반영

```bash
npm run build
npx cap sync
```

또는 한 번에:

```bash
npm run cap:sync
```

## iOS에서 실행

```bash
npx cap open ios
```

Xcode에서 시뮬레이터 또는 실제 기기 선택 후 Run(▶).  
처음이면 `ios/App`에서 `pod install` 실행 후 다시 열기.

## Android에서 실행

```bash
npx cap open android
```

Android Studio에서 Gradle 동기화 후 Run.  
Java/Gradle 버전 오류가 나면 Android Studio가 안내하는 대로 JDK 설정.

## 스크립트 요약

| 명령어 | 설명 |
|--------|------|
| `npm run cap:sync` | 빌드 후 iOS·Android 모두 동기화 |
| `npm run cap:sync:ios` | 빌드 후 iOS만 동기화 |
| `npm run cap:sync:android` | 빌드 후 Android만 동기화 |
| `npm run cap:ios` | Xcode에서 iOS 프로젝트 열기 |
| `npm run cap:android` | Android Studio에서 Android 프로젝트 열기 |

## 설정

- **capacitor.config.ts**: 앱 ID(`com.studyflow.app`), 앱 이름, 스플래시 등.
- **vite.config.ts**: `base: "./"` 로 설정되어 있어 앱 내 로딩 경로가 올바르게 동작합니다.
