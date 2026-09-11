/** Load a below-the-fold module once, shortly before the reader reaches it. */
export function loadWhenVisible(target, load, Observer = globalThis.IntersectionObserver) {
  if (!Observer) {
    load()
    return
  }
  let started = false
  const observer = new Observer((entries) => {
    if (started || !entries.some((entry) => entry.isIntersecting)) return
    started = true
    observer.disconnect()
    load()
  }, { rootMargin: '300px 0px' })
  observer.observe(target)
}
