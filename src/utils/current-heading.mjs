/** The last heading above the reading line, including jumps over long sections. */
export function currentHeadingIndex(positions, marker, atBottom = false) {
  if (atBottom) return positions.length - 1
  return positions.findLastIndex((top) => top <= marker)
}

/**
 * 본문 위 차례(details.toc)와 넓은 화면의 오른쪽 레일(nav.rail)이 같은 제목을 가리키므로,
 * 제목 하나에 링크 여러 개를 묶어 현재 절을 함께 표시한다. 기본 앵커 이동은 그대로 둔다.
 */
export function initCurrentHeading(root = document, view = window) {
  const byHash = new Map()
  for (const link of root.querySelectorAll('details.toc a[href^="#"], nav.rail a[href^="#"]')) {
    const id = decodeURIComponent(link.hash.slice(1))
    const known = byHash.get(id)
    if (known) {
      known.links.push(link)
      continue
    }
    const heading = root.getElementById(id)
    if (heading) byHash.set(id, { heading, links: [link] })
  }
  const entries = [...byHash.values()]
  if (!entries.length) return

  const update = () => {
    const current = currentHeadingIndex(
      entries.map(({ heading }) => heading.getBoundingClientRect().top),
      Math.max(128, view.innerHeight * 0.2),
      view.scrollY + view.innerHeight >= root.documentElement.scrollHeight - 2,
    )
    entries.forEach(({ links }, index) => {
      for (const link of links) {
        if (index === current) link.setAttribute('aria-current', 'location')
        else link.removeAttribute('aria-current')
      }
    })
  }
  let scheduled = false
  const schedule = () => {
    if (scheduled) return
    scheduled = true
    view.requestAnimationFrame(() => {
      scheduled = false
      update()
    })
  }
  view.addEventListener('scroll', schedule, { passive: true })
  view.addEventListener('resize', schedule)
  view.addEventListener('hashchange', schedule)
  view.addEventListener('pageshow', schedule)
  root.querySelector('details.toc')?.addEventListener('toggle', schedule)
  root.fonts?.ready.then(schedule)
  update()
}
