/**
 * 오른쪽 레일이 없는 폭(75em 미만)에서는 차례가 본문 위에만 있어, 글 중간에서 다른 절로 가려면
 * 차례까지 한참 되돌아가야 한다. 본문 위의 차례(details.toc)가 화면 위로 지나가면 오른쪽 아래에
 * '차례' 버튼(.fab)을 띄우고, 누르면 같은 목록을 아래에서 올라오는 시트로 연다. 목록의 링크는
 * 본문 차례와 같은 #앵커라서 주소와 방문 기록이 그대로 남는다. JS가 없으면 본문의 차례만 쓴다.
 */
export function initTocSheet(root = document, view = window) {
  const nav = root.querySelector('details.toc')
  const list = nav?.querySelector('ol')
  if (!nav || !list) return

  const button = root.createElement('button')
  button.type = 'button'
  button.className = 'fab toc-fab'
  button.hidden = true
  button.setAttribute('aria-haspopup', 'dialog')
  button.textContent = '차례'

  const dialog = root.createElement('dialog')
  dialog.className = 'sheet toc-sheet'
  dialog.setAttribute('aria-label', '차례')
  const head = root.createElement('div')
  head.className = 'sheet-h toc-sheet-head'
  const title = root.createElement('p')
  title.className = 'k'
  title.textContent = '차례'
  const close = root.createElement('button')
  close.type = 'button'
  close.className = 'toc-sheet-close'
  close.textContent = '닫기'
  head.append(title, close)
  const copy = list.cloneNode(true)
  dialog.append(head, copy)
  root.body.append(button, dialog)

  const sourceLinks = [...list.querySelectorAll('a')]
  const sheetLinks = [...copy.querySelectorAll('a')]

  button.addEventListener('click', () => {
    // 지금 읽는 절(본문 차례의 aria-current)을 표시하고 그 항목에 초점을 둔다.
    let current = null
    sheetLinks.forEach((link, i) => {
      if (sourceLinks[i]?.getAttribute('aria-current') === 'location') {
        link.setAttribute('aria-current', 'location')
        current = link
      } else link.removeAttribute('aria-current')
    })
    dialog.showModal()
    ;(current ?? sheetLinks[0])?.focus()
    current?.scrollIntoView({ block: 'center' })
  })
  close.addEventListener('click', () => dialog.close())
  // 배경(대화상자 바깥)을 누르면 닫는다. 링크를 누르면 닫은 뒤 기본 이동을 그대로 한다.
  dialog.addEventListener('click', (event) => {
    const link = event.target.closest?.('a')
    if (event.target === dialog || link) dialog.close()
    if (!link) return
    // 대화상자가 닫히면 초점이 버튼으로 돌아가므로, 이동한 절의 제목으로 초점을 옮긴다.
    const heading = root.getElementById(decodeURIComponent(link.hash.slice(1)))
    view.requestAnimationFrame(() => {
      if (!heading) return
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
      heading.focus({ preventScroll: true })
    })
  })

  // 넓은 화면(75em 이상)에서는 본문 차례가 숨고 레일이 대신하므로 버튼이 뜨지 않는다.
  new view.IntersectionObserver(([entry]) => {
    button.hidden = entry.isIntersecting || entry.boundingClientRect.bottom >= 0
    if (button.hidden && dialog.open) dialog.close()
  }).observe(nav)
}
