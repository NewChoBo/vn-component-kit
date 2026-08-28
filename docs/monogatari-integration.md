# Monogatari integration boundary

검토 기준일: 2026-08-28, Monogatari 2.8.0.

## 우선순위

1. 공식 Monogatari action, component, screen, configuration으로 해결한다.
2. 작품 고유 조립이나 상태 연결이면 소비 프로젝트의 얇은 adapter로 해결한다.
3. 두 작품 이상에서 반복되고 엔진 없이 독립 렌더링 가능하면 이 component kit으로 승격한다.
4. 엔진 lifecycle과 결합된 보편 기능이면 재사용 구현을 늘리기 전에 Monogatari upstream 제안을 검토한다.

## 공식 기능 확인 범위

Monogatari v2 공식 문서는 UI를 Custom Element 기반 component로 설명하고, dialog, choice container, main/settings/save/load/gallery/help/language screen 등을 공식 구성 요소로 제공한다. 엔진은 action, component, decorator 확장 지점을 제공한다.

실제 스토리 선택은 공식 [Choice action](https://monogatari.io/v2/script-actions/choices)과 [`choice-container`](https://monogatari.io/v2/components/choice-container)를 우선한다. `nc-vn-choice`는 엔진 밖의 독립 화면과 fixture를 위한 presentation primitive로만 취급하며, Monogatari의 저장, rollback, `onChosen`, `onRevert`, `Clickable`, route 실행을 재구현하지 않는다.

2026-08-28 기준 공식 v2 문서와 공식 GitHub 저장소에서 별도의 공식 plugin marketplace 또는 추천 확장 catalog는 확인되지 않았다. 따라서 `plugin이 없으니 직접 구현`으로 바로 판단하지 않고 다음 순서로 확인한다.

- [공식 Components 목록](https://monogatari.io/v2/components)
- [공식 v2 문서](https://monogatari.io/v2)
- [`@monogatari/core` 공식 저장소](https://github.com/Monogatari/Monogatari)
- 공식 저장소 issue, discussion, source의 action/component/decorator 확장 가능성

커뮤니티 package를 채택할 때는 공식 추천으로 오인하지 않도록 출처를 구분하고, Monogatari 2.8.0 호환성, 유지보수 상태, 라이선스, 접근성, 모바일 동작을 별도로 검증한다.

## 소유권 판정표

| 요구 | 기본 소유자 | 예시 |
| --- | --- | --- |
| 엔진이 이미 제공하는 저장/불러오기/설정/선택 UI | Monogatari 공식 기능 | settings-screen, choice-container |
| 작품의 번역, 상태 key, route, 화면 조립 | 소비 프로젝트 | Lily/Aether adapter |
| 엔진 없이 렌더링되는 반복 UI primitive | VN Component Kit | icon/text button, choice presentation |
| 여러 작품에 필요하고 engine lifecycle 변경이 필수인 기능 | Monogatari upstream 후보 | 공통 screen lifecycle hook |

## Upstream 제안 게이트

다음 근거가 모두 있을 때 upstream issue 또는 PR 초안을 만든다.

- 공식 기능과 문서로 충족되지 않는 구체적 gap이 있다.
- Lily와 Aether 중 최소 두 소비 사례 또는 하나의 강한 일반 사례가 있다.
- 작품 고유 문구, 상태, 테마를 제거한 최소 재현이 있다.
- 기존 API와의 호환성, 접근성, 모바일 영향이 정리돼 있다.
- component-kit에 둘 때 생기는 engine adapter 중복 비용이 설명돼 있다.

제안이 받아들여지기 전까지 engine 생성 파일을 직접 수정하지 않는다.
