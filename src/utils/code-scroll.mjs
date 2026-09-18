/**
 * 코드 블록이 옆으로 넘어갈 때만 pre에 data-scrollable을 붙이고, 끝까지 넘기면 data-scroll-end를 붙인다.
 * 실제 스크롤은 안쪽 code가 맡으므로 키보드 초점도 code로 옮긴다. 창 크기가 바뀌면 다시 잰다.
 * @param {HTMLElement} pre
 * @param {{ addEventListener(type: string, listener: () => void): void }} [win]
 */
export function markScrollableCode(pre, win = globalThis) {
  const scroller = pre.querySelector('code') ?? pre
  if (scroller !== pre) {
    scroller.setAttribute('tabindex', '0')
    pre.removeAttribute('tabindex')
  }
  const update = () => {
    const scrollable = scroller.scrollWidth > scroller.clientWidth + 1
    pre.toggleAttribute('data-scrollable', scrollable)
    const atEnd =
      !scrollable || scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1
    pre.toggleAttribute('data-scroll-end', atEnd)
  }
  update()
  scroller.addEventListener('scroll', update, { passive: true })
  win.addEventListener('resize', update)
  return update
}
