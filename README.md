# VN Component Kit

Lily와 Aether Signal을 비롯한 여러 비주얼 노벨이 공유할 수 있는 엔진 비의존 Web Component 패키지입니다. 모든 재사용 UI는 브라우저 네이티브 Custom Element를 기본 단위로 삼고, 작품별 이야기, 상태, 테마와 Monogatari lifecycle은 소비 프로젝트가 소유합니다.

현재 패키지는 실수로 npm에 공개되지 않도록 `private` 상태입니다. 두 실제 소비 프로젝트에서 API가 검증된 뒤 배포 방식과 라이선스를 별도로 결정합니다.

## 기술 기준

- 프레임워크 없이 `<nc-vn-*>` Custom Element로 제공한다.
- attribute는 짧은 문자열/boolean 설정에, object/array는 JavaScript property에 사용한다.
- 사용자 상호작용은 bubbling CustomEvent로 전달한다.
- `custom-elements.json`을 공개 계약으로 유지해 IDE와 Web Component 도구가 구성 요소를 발견할 수 있게 한다.
- Monogatari 전용 연결은 core component가 아니라 소비 프로젝트의 얇은 adapter가 담당한다.

## 제공 항목

### `nc-vn-button`

```html
<nc-vn-button
	variant="icon"
	icon="fas fa-arrow-left"
	label="Back"
	action="back"
	name="screen-back"
></nc-vn-button>
```

- `variant`: `icon` 또는 `text`
- `label`: 접근성 이름이자 text variant의 주 문구
- `description`: text variant의 선택적 보조 문구
- `icon`: icon variant의 CSS class token
- `type`: `button`, `submit`, `reset`
- `action`, `name`, `value`: 소비 애플리케이션이 동작을 연결하는 안정 식별자
- `disabled`: boolean attribute/property
- 활성화 이벤트: `nc-vn-activate`

### `nc-vn-choice`

선택 정의는 HTML 또는 JSON 문자열이 아니라 `definition` property로 전달합니다.

```js
const choice = document.querySelector('nc-vn-choice');

choice.definition = {
	id: 'first-response',
	ariaLabel: '첫 대응 선택',
	situation: '경보가 울리고 두 통로가 동시에 닫히기 시작한다.',
	constraint: '지금 확보할 수 있는 통로는 하나뿐이다.',
	options: [
		{ id: 'secure-exit', label: '출구를 먼저 확보한다', description: '대피 경로를 남긴다' },
		{ id: 'check-signal', label: '신호실로 향한다', description: '원인을 먼저 확인한다' }
	]
};

choice.addEventListener('nc-vn-choice', (event) => {
	console.log(event.detail.definitionId, event.detail.optionId);
});
```

`options`는 2~4개이며 각 option은 고유한 `id`와 비어 있지 않은 `label`을 가져야 합니다. 선택 결과, route, state effect는 이 패키지가 결정하지 않습니다.

### `nc-vn-ui-scale`

UI 크기를 `compact`, `standard`, `large` 세 단계로 고르는 엔진 비의존 설정 primitive입니다. 실제 CSS 크기와 저장소는 소비 프로젝트가 소유합니다.

```html
<nc-vn-ui-scale
	value="standard"
	label="UI size"
	description="Adjusts text and control sizing."
	compact-label="Small"
	standard-label="Standard"
	large-label="Large"
	name="ui-scale"
></nc-vn-ui-scale>
```

- `value`: `compact`, `standard`, `large`
- `label`, `compact-label`, `standard-label`, `large-label`: 번역된 필수 문구
- `description`: 선택적 보조 설명
- `name`: form/radio group 및 이벤트 식별용 안정 이름
- `disabled`: boolean attribute/property
- 변경 이벤트: `nc-vn-ui-scale-change` (`detail.value`, `detail.name`)

컴포넌트는 최소 44px 선택 영역과 native radio keyboard semantics를 제공합니다. `compact`를 선택해도 소비 프로젝트는 핵심 터치 영역을 44px보다 작게 줄이지 않아야 합니다.

## 브라우저 직접 로딩

```html
<link rel="stylesheet" href="./vendor/vn-components/index.css">
<script src="./vendor/vn-components/index.js"></script>
```

등록과 property normalizer는 `globalThis.NewChoboVnComponents`에 노출됩니다. 별도 저장소에서 소비할 때는 버전을 고정한 dependency의 공개 파일을 project-local `vendor/`로 동기화하는 방식을 권장합니다.

## 로컬 실시간 연동

Lily 또는 Aether 저장소 안에 이 작업 트리를 junction/symlink로 연결하면 빌드나 복사 없이 변경 사항이 다음 새로고침에 반영됩니다.

소비 프로젝트가 제공하는 dev wrapper에서는 다음처럼 사용할 수 있습니다.

```powershell
npm run dev -- --components ../vn-component-kit
```

옵션이 없으면 lockfile에 고정된 설치본을, 옵션이 있으면 `npm link`로 연결한 로컬 작업 트리를 사용합니다. 현재 Monogatari 프로젝트의 정적 브라우저 로딩을 유지하기 위해 Vite는 요구하지 않습니다.

```powershell
# vn-component-kit에서 실행
npm run link:consumer -- C:\dev\project\newchobo\lily-vn
npm run link:consumer -- C:\dev\project\newchobo\ather-vn
```

기본 마운트는 소비 프로젝트의 `node_modules/@newchobo/vn-components`입니다. 일반적인 `node_modules/` ignore 규칙 안에 머물기 때문에 링크가 Git 변경으로 잡히지 않습니다. 개발용 HTML은 다음 경로로 직접 로드할 수 있습니다.

```html
<link rel="stylesheet" href="./node_modules/@newchobo/vn-components/index.css">
<script src="./node_modules/@newchobo/vn-components/index.js"></script>
```

링크 명령은 기존 파일이나 디렉터리를 덮어쓰지 않습니다. 상세 운영법과 npm `link` 대안은 [`docs/local-development.md`](docs/local-development.md)를 따릅니다.

## Monogatari와의 경계

Monogatari가 이미 제공하는 action, component, screen, 설정을 우선 사용합니다. 공통화 후보의 소유권과 upstream 제안 기준은 [`docs/monogatari-integration.md`](docs/monogatari-integration.md)에 정리합니다.

특히 실제 스토리 분기는 Monogatari의 공식 Choice action과 `choice-container`를 기본으로 사용합니다. `nc-vn-choice`는 엔진 밖의 독립 화면, fixture, 공통 작성 계약이 필요한 경우를 위한 primitive이며 공식 선택 흐름을 대체하지 않습니다.

장기적으로 npm 공개 패키지를 목표로 하지만 현재는 `private: true`를 유지합니다. 실제 두 프로젝트 적용, API 안정화, 라이선스와 패키지 이름 확정, 설치 소비 테스트가 완료된 뒤 공개 전환합니다.

## 선택지 작성

문구 작성 규칙과 템플릿은 [`docs/choice-authoring-contract.md`](docs/choice-authoring-contract.md)를 따릅니다.

## 검증

```powershell
npm test
npm run validate
```
