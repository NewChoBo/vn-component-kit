# VN Component Kit authoring contract

이 저장소는 여러 비주얼 노벨이 공유할 수 있는 엔진 비의존 Web Component와 작성 계약을 관리한다.

## 기본 원칙

1. 작품별 세계관, 시나리오, 상태 키, 성인 콘텐츠, 브랜드 색상은 넣지 않는다.
2. 공개 API는 문서화되고 검증된 attribute, property, event로만 제공한다.
3. 동적 UI는 DOM API와 `replaceChildren`으로 구성한다.
4. `innerHTML`, `outerHTML`, `insertAdjacentHTML`, HTML 문자열 helper를 사용하지 않는다.
5. 배열이나 객체는 JSON 문자열 attribute가 아니라 JavaScript property로 전달한다.
6. 컴포넌트는 Monogatari를 포함한 특정 엔진에 직접 의존하지 않는다.
7. 엔진 adapter는 얇은 별도 진입점으로만 추가하며 core component lifecycle을 오염시키지 않는다.
8. 기본 스타일은 구조, 접근성, 터치 영역만 소유하고 작품별 theme token을 CSS custom property로 받는다.
9. 새 API는 테스트와 README 예제를 함께 갱신한다.
10. 사용자의 기존 변경을 reset, revert, discard하지 않는다.

## 선택지 계약

- 선택 전 상황은 현재형으로 쓴다.
- 플레이어가 판단할 수 있는 제약이나 trade-off를 제공한다.
- 선택지는 서로 평행한 동사형 행동 문구를 사용한다.
- `priority`, state key, route name 같은 내부 설계 용어를 플레이어 문구에 노출하지 않는다.
- prompt는 선택 사항이며, 장면 문맥만으로 충분하면 질문을 반복하지 않는다.
- 선택 결과와 상태 효과는 UI definition에 넣지 않고 소비 애플리케이션이 소유한다.

## 검증

```powershell
npm test
npm run validate
```
