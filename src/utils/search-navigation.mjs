/** Close the overlay before native navigation to a heading in the current document. */
export function dismissSearchForAnchor(event, dialog, currentHref) {
  if (
    !dialog?.open ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return false

  const link = event.target?.closest?.('a[href]')
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self'))
    return false

  let target, current
  try {
    current = new URL(currentHref)
    target = new URL(link.href, current)
  } catch {
    return false
  }
  if (
    !target.hash ||
    target.origin !== current.origin ||
    target.pathname !== current.pathname ||
    target.search !== current.search
  )
    return false

  dialog.close()
  // Do not preventDefault: URL history, scrolling and keyboard navigation stay native.
  return true
}
