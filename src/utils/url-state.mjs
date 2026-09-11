/** Persist before navigation starts; pagehide is too late for an immediate reload. */
export function persistURL(url, write = (value) => history.replaceState(null, '', value)) {
  try {
    write(url)
    return true
  } catch {
    // Browser history limits must not disable filtering itself.
    return false
  }
}
