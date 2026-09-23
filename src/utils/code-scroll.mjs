/**
 * 코드 블록이 옆으로 넘어갈 때만 pre에 data-scrollable을 붙이고, 끝까지 넘기면 data-scroll-end를 붙인다.
 * 실제 스크롤은 안쪽 code가 맡으므로 키보드 초점도 code로 옮긴다. 넘길 것이 없는 블록은
 * 탭 정지가 되지 않게 한다(누를 일 없는 초점이 쌓이지 않도록). 창 크기가 바뀌면 다시 잰다.
 * @param {HTMLElement} pre
 * @param {{ addEventListener(type: string, listener: () => void): void }} [win]
 */
export function markScrollableCode(pre, win = globalThis) {
  const scroller = pre.querySelector('code') ?? pre
  if (scroller !== pre) pre.removeAttribute('tabindex')
  const update = () => {
    const scrollable = scroller.scrollWidth > scroller.clientWidth + 1
    pre.toggleAttribute('data-scrollable', scrollable)
    if (scroller !== pre) {
      if (scrollable) scroller.setAttribute('tabindex', '0')
      else scroller.removeAttribute('tabindex')
    }
    const atEnd =
      !scrollable || scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1
    pre.toggleAttribute('data-scroll-end', atEnd)
  }
  update()
  scroller.addEventListener('scroll', update, { passive: true })
  win.addEventListener('resize', update)
  return update
}
