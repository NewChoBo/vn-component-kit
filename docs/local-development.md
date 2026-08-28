# Local development links

## 목적

Lily와 Aether가 같은 component-kit 작업 트리를 읽도록 연결해, component 변경을 복사나 재설치 없이 브라우저 새로고침만으로 확인한다.

## 권장 방식: project-local junction/symlink

소비 프로젝트가 `vn-components-dev`를 dev script로 사용하면 한 명령으로 연결과 서버 실행을 처리할 수 있다.

```powershell
# 고정 설치 dependency 사용
npm run dev

# sibling component-kit 작업 트리를 npm link로 연결한 뒤 실행
npm run dev -- --components ../vn-component-kit
```

`--components`가 없으면 현재 lockfile로 설치된 `@newchobo/vn-components`를 사용한다. 옵션이 있으면 해당 경로의 package 이름과 공개 JS/CSS를 검증한 뒤 `npm link --save=false --ignore-scripts`를 실행한다. Vite나 별도 bundler는 요구하지 않는다.

직접 링크만 만들고 기존 dev server를 유지해야 하는 프로젝트는 아래 명령을 사용한다.

component-kit 루트에서 실행한다.

```powershell
npm run link:consumer -- C:\dev\project\newchobo\lily-vn
npm run link:consumer -- C:\dev\project\newchobo\ather-vn
```

기본 결과:

```text
consumer/
└── node_modules/
    └── @newchobo/
        └── vn-components -> C:\dev\project\newchobo\vn-component-kit
```

다른 마운트가 필요하면 소비 프로젝트 기준 상대 경로를 두 번째 인자로 전달한다.

```powershell
npm run link:consumer -- C:\path\to\consumer vendor/vn-components
```

링크 도구의 안전 규칙:

- mount는 반드시 소비 프로젝트 내부의 상대 경로다.
- 기존 파일, 실제 디렉터리, 다른 target을 가리키는 링크는 덮어쓰지 않는다.
- 이미 올바른 target이면 성공으로 처리한다.
- 링크 자체는 개발자 로컬 환경이며 Git에 커밋하지 않는다.

소비 프로젝트의 개발용 HTML은 마운트 경로의 공개 파일을 직접 로드한다.

```html
<link rel="stylesheet" href="./node_modules/@newchobo/vn-components/index.css">
<script src="./node_modules/@newchobo/vn-components/index.js"></script>
```

component-kit에는 빌드 단계가 없으므로 저장 후 소비 프로젝트 브라우저를 새로고침하면 즉시 반영된다.

`node_modules/`를 지우거나 clean install을 실행하면 개발 링크도 제거되므로 위 링크 명령을 다시 실행한다.

## npm link 대안

npm 표준 symlink가 필요한 bundler 기반 소비자는 다음 방식을 사용할 수 있다.

```powershell
cd C:\dev\project\newchobo\lily-vn
npm link ..\vn-component-kit --save=false
```

브라우저 직접 로딩 프로젝트에서는 `node_modules`를 공개 URL로 노출해야 하므로 project-local mount를 우선한다. `npm link`는 로컬 dependency를 package 이름으로 import하는 bundler 환경에서 사용한다.

## 배포 경계

- symlink/junction은 개발 전용이며 배포 산출물로 간주하지 않는다.
- npm 공개 전에는 release 과정에서 검증된 commit의 공개 파일만 vendor snapshot으로 복사한다.
- npm 공개 후에는 정확한 semver를 설치하고 lockfile로 고정한다.
- 소비 프로젝트의 Monogatari adapter와 theme은 계속 소비 프로젝트가 소유한다.
