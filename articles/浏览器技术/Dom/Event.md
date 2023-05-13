# DOM Event

## Description

DOM Event 存在 Capturing -> Target -> Bubbling 三个过程，其中仅 Bubbling 暴露了一些控制 API。

- instances:

  - `type: string`：类型
  - `target: EventTarget`：即 `target`，目标
  - `bubbles: boolean`：是否冒泡
  - `cancelable: boolean`：是否可取消，只有 true 时对它的 `preventDefault()` 才有效
  - `currentTarget: EventTarget`：当前的节点
  - `composed: boolean`：是否冒泡出 ShadowDocument
  - `defaultPrevented: Boolean`：是否已经被取消（是否已经被 `preventDefault()`）
  - `eventPhase: number`：`0` = 等待，`1` = 捕获中，`2` = 目标，`2` = 冒泡中
  - `timeStamp: number`：存活的时间
  - `isTrusted: boolean`：是否可信

- methods:
  - `stopPropagation()`
  - `preventDefault()`
  - `stopImmediatePropagation()`
  - `composedPath()`：得到传播的路径

## Create

```js
// current
{
  // common event
  {
    const event = new Event(/* eventType */ 'myEvent', {
      bubbles: false,
      cancelable: false,
      composed: false,
    })
  }

  // specific event
  {
    // MouseEvent <- UIEvent <- Event
    {
      const event = new MouseEvent(/* eventType */ 'click', {
        // options
      })
    }
    // CustomEvent <- Event
    {
      const event = new CustomEvent(/* eventType */ 'addCount', {
        // options
      })
    }
  }
}

// deprecated
{
  // common event
  {
    // Create a event based on the Event Constructor.
    const event = document.createEvent(/* eventConstructorName */ 'Event')
    // Throw an error if dispatch an uninitialized event using "dispatchEvent".
    // The "initEvent" does not supports "composed" attribute.
    event.initEvent(
      /* eventType */ 'myEvent',
      /* bubbles */ false,
      /* cancelable */ false
    )
  }

  // specific event
  {
    // MouseEvent
    {
      // Create a event based on the MouseEvent Constructor.
      const event = document.createEvent('MouseEvent')
      event.initMouseEvent(
        /* eventType */ 'click',
        ...[
          /* options */
        ]
      )
    }
    // CustomEvent
    {
      // Create a event based on the CustomEvent Constructor.
      const event = document.createEvent('CustomEvent')
      event.initCustomEvent(
        /* eventType */ 'addCount',
        ...[
          /* options */
        ]
      )
    }
  }
}
```
