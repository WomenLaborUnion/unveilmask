# nomalized-masker

이메일, 전화번호, 이름 등의 개인정보 **가운데를 마스킹**하고, **hover(또는 focus)하면 원본을 보여주는** 라이브러리. 의존성 없는 바닐라 JS (ESM).

## 설치

```bash
npm install nomalized-masker
```

> 아직 npm에 게시하지 않았다면 저장소를 직접 설치합니다:
> `npm install miceplans/nomalized_masker`

## 사용법

### 1. 마스킹만 필요할 때 (문자열)

```js
import { mask } from 'nomalized-masker';

mask('hello@example.com');                  // 'he*lo@example.com' (auto: email)
mask('010-1234-5678');                      // '010-****-5678'     (auto: phone)
mask('홍길동', { type: 'name' });            // '홍*동'
mask('가나다라마바사', { maskChar: '●' });    // '가나●●●●사'
```

타입은 `'auto' | 'email' | 'phone' | 'name' | 'generic'` 이며, `auto`는 값의 모양으로 자동 감지합니다(기본값).

| 타입 | 동작 | 예시 |
| --- | --- | --- |
| `email` | `@` 앞 로컬 부분의 가운데 마스킹 | `he*lo@example.com` |
| `phone` | 국번/지역번과 마지막 그룹 유지, 가운데 마스킹 | `010-****-5678` |
| `name` | 각 단어의 첫·끝 글자만 유지 | `홍*동`, `J**n D*e` |
| `generic` | 전체 문자열의 앞·뒤 1/3만 유지 | `abc***ghi` |

### 2. hover하면 원본이 보이게 하기 (DOM)

CSS를 함께 import해야 hover/focus로 원본이 보입니다.

```js
import 'nomalized-masker/style.css';
import { mount } from 'nomalized-masker';

mount(document.querySelector('#email'), 'hello@example.com');
// 렌더링: <span class="nm" tabindex="0">he*lo@example.com</span>
//         (hover/focus 시 hello@example.com 표시)
```

HTML 속성으로 선언하고 한 번에 초기화할 수도 있습니다.

```html
<span data-nm-value="010-1234-5678"></span>
<span data-nm-value="홍길동" data-nm-type="name"></span>

<script type="module">
  import 'nomalized-masker/style.css';
  import { autoInit } from 'nomalized-masker';
  autoInit();
</script>
```

프로그래밍으로 제어:

```js
import { reveal, hide, toggle, unmount } from 'nomalized-masker';

reveal(el);  // 항상 원본 표시 (hover 없이)
toggle(el);  // 상태 토글
unmount(el); // 원복
```

서버 렌더링/템플릿용으로 HTML 문자염도 만들 수 있습니다.

```js
import { render } from 'nomalized-masker';

render('hello@example.com');
// '<span class="nm" tabindex="0" data-nm-value="hello@example.com">...'
```

## 접근성

- 키보드 사용자를 위해 마스커에 `tabindex="0"`이 붙습니다: **focus로도 원본이 보입니다.**
- 스크린 리더는 마스킹된 텍스트를 읽습니다(원본은 `aria-hidden`).

## 주의: 보안 경계가 아님

클리언트 마스킹은 UX 편의 기능이며 **보안 장치가 아닙니다**. 원본 값이 DOM의 `data-nm-value` 속성과 마크업 안에 그대로 들어가므로, 개발자 도구로 누구든 볼 수 있습니다. 진짜 민감정보는 서버에서 마스킹한 값만 남겨야 합니다.

## 개발

```bash
npm test        # node:test (의존성 없음)
```

데모 페이지: `examples/index.html`을 브라우저에서 열기.

## 라이선스

MIT
