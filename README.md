# Phaser Next.js 템플릿

이 템플릿은 **Phaser 3**와 **Next.js** 프레임워크를 함께 사용하는 프로젝트 템플릿입니다. React와 Phaser 간의 통신을 위한 브릿지, 빠른 개발을 위한 핫 리로딩, 프로덕션 빌드를 위한 스크립트 등이 포함되어 있습니다.

### 버전 정보

이 템플릿은 다음 버전에 맞춰 업데이트되어 있습니다:

- [Phaser 3.90.0](https://github.com/phaserjs/phaser)
- [Next.js 15.3.1](https://github.com/vercel/next.js)
- [TypeScript 5](https://github.com/microsoft/TypeScript)

![screenshot](screenshot.png)

## 요구 사항

[Node.js](https://nodejs.org)가 필요합니다. 의존성 설치 및 스크립트 실행 시 `npm`을 사용합니다.

## 사용 가능한 명령어

| 명령어 | 설명 |
|--------|------|
| `npm install` | 프로젝트 의존성 설치 |
| `npm run dev` | 개발용 웹 서버 실행 |
| `npm run build` | `dist` 폴더에 프로덕션 빌드 생성 |
| `npm run dev-nolog` | 익명 데이터 전송 없이 개발 서버 실행 (아래 "log.js 관련" 참고) |
| `npm run build-nolog` | 익명 데이터 전송 없이 프로덕션 빌드 생성 (아래 "log.js 관련" 참고) |

## 코드 작성 방법

레포지토리를 클론한 후, `npm install`로 의존성을 설치하고 `npm run dev`로 개발 서버를 실행하세요.

기본적으로 서버는 `http://localhost:8080`에서 실행됩니다. 변경하거나 SSL을 추가하고 싶으면 Next.js 문서를 참고하세요.

코드 수정 시 Next.js가 자동으로 컴파일하고 브라우저를 리로드합니다.

## 프로젝트 구조

| 경로 | 설명 |
|------|------|
| `src/pages/_document.tsx` | HTML 및 Body 태그 정의하는 Next.js 문서 컴포넌트 |
| `src` | 클라이언트 소스 코드가 위치한 폴더 |
| `src/styles/globals.css` | 전역 CSS. Tailwind CSS 추가 가능 |
| `src/page/_app.tsx` | 메인 앱 컴포넌트 |
| `src/App.tsx` | Phaser를 클라이언트에서 실행하는 미들웨어 |
| `src/PhaserGame.tsx` | React에서 Phaser를 초기화하는 브릿지 컴포넌트 |
| `src/game/EventBus.ts` | React와 Phaser 간 통신용 이벤트 버스 |
| `src/game` | 게임 로직 및 설정 코드 |
| `src/game/main.tsx` | Phaser 게임 설정 및 시작점 |
| `src/game/scenes/` | Phaser Scene 정의하는 폴더 |
| `public/favicon.png` | 기본 파비콘 |
| `public/assets` | 게임에서 사용할 정적 자산 폴더 |

## React 브릿지

`PhaserGame.tsx`는 React와 Phaser 사이의 연결고리 역할을 합니다.

React에서 Phaser로, Phaser에서 React로 이벤트를 주고받기 위해 `EventBus.ts`를 사용할 수 있습니다.

```ts
// React에서
import { EventBus } from './EventBus';

EventBus.emit('event-name', data);

// Phaser에서
EventBus.on('event-name', (data) => {
    // 처리
});
```

또한 `PhaserGame` 컴포넌트는 `ref`를 통해 Phaser 인스턴스와 활성화된 Scene을 전달합니다.

## Phaser Scene 처리

Phaser의 Scene은 모든 게임 로직이 포함된 핵심 단위입니다. 여러 Scene을 동시에 실행할 수도 있습니다.

React에서 특정 Scene에 접근하려면 Phaser Scene 내부에서 `"current-scene-ready"` 이벤트를 `EventBus`를 통해 발생시켜야 하며, React에서는 `"current-active-scene"` 이벤트를 통해 해당 Scene을 받을 수 있습니다.

```ts
class MyScene extends Phaser.Scene {
    constructor() {
        super('MyScene');
    }

    create() {
        // 게임 로직

        EventBus.emit('current-scene-ready', this);
    }
}
```

## React 컴포넌트 예시

```ts
import { useRef } from 'react';
import { IRefPhaserGame } from "./game/PhaserGame";

const ReactComponent = () => {
    const phaserRef = useRef<IRefPhaserGame>();

    const onCurrentActiveScene = (scene: Phaser.Scene) => {
        // Scene 접근 가능
    }

    return (
        <PhaserGame ref={phaserRef} currentActiveScene={onCurrentActiveScene} />
    );
}
```

`phaserRef.current.game`을 통해 게임 인스턴스, `phaserRef.current.scene`을 통해 현재 Scene에 접근할 수 있습니다.

## 에셋 관리

`public/assets` 폴더에 이미지, 오디오, 비디오 등 정적 자산을 넣고 Phaser에서 다음처럼 불러올 수 있습니다:

```ts
preload () {
    this.load.image('background', 'assets/bg.png');
}
```

`npm run build` 시 해당 자산들은 `dist/assets`로 복사됩니다.

## 프로덕션 배포

`npm run build`를 실행하면 모든 코드와 자산이 `dist` 폴더에 번들링됩니다. 이 폴더 전체를 웹 서버에 업로드하면 배포할 수 있습니다.

## 템플릿 커스터마이징

### Next.js 설정

CSS나 폰트 로딩 등 추가 설정이 필요하면 `next.config.mjs` 파일을 수정하면 됩니다. 더 자세한 내용은 [Next.js 공식 문서](https://nextjs.org/docs)를 참고하세요.

## log.js에 대하여

스크립트를 보면 `log.js`라는 파일이 있습니다. 이는 `gryzor.co`라는 도메인으로 간단한 익명 정보를 전송합니다. 이 도메인은 Phaser Studio Inc.가 소유하고 있습니다.

전송되는 데이터는 다음 3가지입니다:

1. 템플릿 이름 (예: react, vue 등)
2. dev 또는 build 여부
3. Phaser 버전

**개인 정보는 절대 수집되지 않으며**, 파일이나 장치, 브라우저 등의 정보는 수집하지 않습니다.

만약 이 동작을 원하지 않는다면 `npm run dev-nolog`, `npm run build-nolog` 명령어를 사용하거나 `log.js` 파일을 삭제하고 `package.json`의 script에서 호출 부분을 제거하면 됩니다:

삭제 전:
```json
"scripts": {
    "dev": "node log.js dev & dev-template-script",
    "build": "node log.js build & build-template-script"
},
```

삭제 후:
```json
"scripts": {
    "dev": "dev-template-script",
    "build": "build-template-script"
},
```

가능하다면 Discord나 이메일로 어떤 템플릿을 사용 중인지 알려주세요!

## Phaser 커뮤니티 참여하기

Phaser로 만든 게임을 공유해 주세요! 여러분의 결과물을 보는 것은 개발자들에게 큰 힘이 됩니다.

- 🔗 [Phaser 공식 웹사이트](https://phaser.io)
- 🐦 [Phaser 트위터](https://twitter.com/phaser_)
- 📚 [API 문서](https://newdocs.phaser.io)
- 🧠 [디스코스 포럼](https://phaser.discourse.group/)
- ❓ [StackOverflow 질문](https://stackoverflow.com/questions/tagged/phaser-framework)
- 💬 [Discord 참여](https://discord.gg/phaser)
- 🎮 [예제 보기](https://labs.phaser.io)
- 📰 [Phaser 뉴스레터](https://phaser.io/community/newsletter)

---
