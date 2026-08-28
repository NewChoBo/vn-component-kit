# VN Component Kit

Lily와 Aether Signal을 비롯한 여러 비주얼 노벨이 공유할 수 있는 엔진 비의존 Web Component 패키지입니다. 작품별 이야기, 상태, 테마와 Monogatari lifecycle은 소비 프로젝트가 소유합니다.

현재 패키지는 실수로 npm에 공개되지 않도록 `private` 상태입니다. 두 실제 소비 프로젝트에서 API가 검증된 뒤 배포 방식과 라이선스를 별도로 결정합니다.

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

## 브라우저 직접 로딩

```html
<link rel="stylesheet" href="./vendor/vn-components/index.css">
<script src="./vendor/vn-components/index.js"></script>
```

등록과 property normalizer는 `globalThis.NewChoboVnComponents`에 노출됩니다. 별도 저장소에서 소비할 때는 버전을 고정한 dependency의 공개 파일을 project-local `vendor/`로 동기화하는 방식을 권장합니다.

## 선택지 작성

문구 작성 규칙과 템플릿은 [`docs/choice-authoring-contract.md`](docs/choice-authoring-contract.md)를 따릅니다.

## 검증

```powershell
npm test
npm run validate
```
