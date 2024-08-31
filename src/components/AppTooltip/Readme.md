# CreativeTooltip

## Usage

```js
import AppTooltip from '@component/AppTooltip';

<AppTooltip
  trigger={'click'}
  placement={'topStart'}
  theme={'white'}
  text={'안녕하세요'}
>
  { /* 이건 children */}
  <span>안녕하세요</span>
</AppTooltip>
```

## Attr (굵은 글씨는 기본값)

- trigger(optional) :  "click" | **"hover"** | "focus" | "active" | "contextMenu" | "none"
- placement(optional) : **"topStart"** | "topEnd" 
- text(required) : ReactNode.
- children(required) : ReactElement.
- theme(optional): **"orange"** | "white" 