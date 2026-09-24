/**
 * 옆으로 넘길 수 있는 블록(코드·표)에만 탭 정지와 이름을 둔다.
 *
 * 마크업은 JS 없이도 넘길 수 있게 래퍼(pre, .table)에 tabindex=0과 aria-label을 갖고 나온다.
 * 스크립트가 돌면 실제로 넘치는지 재서, 넘칠 때만 스크롤하는 요소에 tabindex·role="group"·aria-label을
 * 함께 두고, 넘치지 않으면 셋 다 지운다. 이름과 초점이 같은 요소에 있어야 스크린리더가 "코드: sql"을
 * 읽고, 초점 없는 요소에 aria-label만 남으면 금지 속성(aria-prohibited-attr)이 된다.
 * 랜드마크(region)가 아니라 group이라 코드 블록마다 랜드마크가 쌓이지 않는다.
 * @param {HTMLElement} wrapper 넘침 표시(data-scrollable·data-scroll-end)를 받는 요소
 * @param {HTMLElement} scroller 실제로 스크롤하는 요소(래퍼 자신일 수 있다)
 * @param {{ addEventListener(type: string, listener: () => void): void }} [win]
 */
function markScrollable(wrapper, scroller, win = globalThis) {
  const label = wrapper.getAttribute('aria-label') || '코드'
  wrapper.removeAttribute('tabindex')
  wrapper.removeAttribute('aria-label')
  const update = () => {
    const scrollable = scroller.scrollWidth > scroller.clientWidth + 1
    wrapper.toggleAttribute('data-scrollable', scrollable)
    if (scrollable) {
      scroller.setAttribute('tabindex', '0')
      scroller.setAttribute('role', 'group')
      scroller.setAttribute('aria-label', label)
    } else {
      scroller.removeAttribute('tabindex')
      scroller.removeAttribute('role')
      scroller.removeAttribute('aria-label')
    }
    const atEnd =
      !scrollable || scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1
    wrapper.toggleAttribute('data-scroll-end', atEnd)
  }
  update()
  scroller.addEventListener('scroll', update, { passive: true })
  win.addEventListener('resize', update)
  return update
}

/**
 * 코드 블록. 가로 스크롤은 pre가 아니라 안쪽 code가 맡으므로(언어 라벨·복사 버튼이 밀리지 않게)
 * 초점과 이름도 code로 옮긴다. 창 크기가 바뀌면 다시 잰다.
 * @param {HTMLElement} pre
 * @param {{ addEventListener(type: string, listener: () => void): void }} [win]
 */
export function markScrollableCode(pre, win = globalThis) {
  return markScrollable(pre, pre.querySelector('code') ?? pre, win)
}

/**
 * 표 래퍼(.table). 래퍼 자신이 스크롤하므로 넘칠 때만 탭 정지가 된다.
 * @param {HTMLElement} wrapper
 * @param {{ addEventListener(type: string, listener: () => void): void }} [win]
 */
export function markScrollableTable(wrapper, win = globalThis) {
  return markScrollable(wrapper, wrapper, win)
}
