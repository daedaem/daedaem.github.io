/** Only report success after the clipboard promise succeeds; permit retry after failure. */
export function createCodeCopy(writeText, report, schedule = setTimeout, cancel = clearTimeout) {
  let busy = false
  let timer
  return async (text) => {
    if (busy) return
    busy = true
    cancel(timer)
    report('copying')
    try {
      await writeText(text)
      report('success')
      timer = schedule(() => report('idle'), 2000)
    } catch {
      report('error')
    } finally {
      busy = false
    }
  }
}
