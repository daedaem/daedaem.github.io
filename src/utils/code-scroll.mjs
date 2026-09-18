/**
 * 코드 블록이 옆으로 넘어갈 때만 data-scrollable을 붙이고, 끝까지 넘기면 data-scroll-end를 붙인다.
 * CSS는 두 속성으로 오른쪽 가장자리 페이드를 켜고 끈다. 창 크기가 바뀌면 다시 잰다.
 * @param {HTMLElement} pre
 * @param {{ addEventListener(type: string, listener: () => void): void }} [win]
 */
export function markScrollableCode(pre, win = globalThis) {
  const update = () => {
    const scrollable = pre.scrollWidth > pre.clientWidth + 1
    pre.toggleAttribute('data-scrollable', scrollable)
    const atEnd = !scrollable || pre.scrollLeft + pre.clientWidth >= pre.scrollWidth - 1
    pre.toggleAttribute('data-scroll-end', atEnd)
  }
  update()
  pre.addEventListener('scroll', update, { passive: true })
  win.addEventListener('resize', update)
  return update
}
