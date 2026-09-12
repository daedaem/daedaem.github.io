/** The last heading above the reading line, including jumps over long sections. */
export function currentHeadingIndex(positions, marker, atBottom = false) {
  if (atBottom) return positions.length - 1
  return positions.findLastIndex((top) => top <= marker)
}

/** Shared by case articles and wiki pages; native anchor navigation stays intact. */
export function initCurrentHeading(root = document, view = window) {
  const entries = [...root.querySelectorAll('.post > .toc a[href^="#"]')]
    .map((link) => ({
      link,
      heading: root.getElementById(decodeURIComponent(link.hash.slice(1))),
    }))
    .filter(({ heading }) => heading)
  if (!entries.length) return

  const update = () => {
    const current = currentHeadingIndex(
      entries.map(({ heading }) => heading.getBoundingClientRect().top),
      Math.max(128, view.innerHeight * 0.2),
      view.scrollY + view.innerHeight >= root.documentElement.scrollHeight - 2,
    )
    entries.forEach(({ link }, index) => {
      if (index === current) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
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
  root.querySelector('.post > .toc details')?.addEventListener('toggle', schedule)
  root.fonts?.ready.then(schedule)
  update()
}
