/**
 * 1200px 미만에서는 목차가 본문 위에 접혀 있어, 글 중간에서 다른 절로 가려면 목차까지
 * 한참 되돌아가야 한다. 본문의 목차가 화면 위로 지나가면 오른쪽 아래에 '목차' 버튼을 띄우고,
 * 누르면 같은 목록을 대화상자로 연다. 목록의 링크는 본문 목차와 같은 #앵커라서 주소와
 * 방문 기록이 그대로 남는다. JS가 없으면 본문의 목차만 쓴다.
 */
export function initTocSheet(root = document, view = window) {
  const nav = root.querySelector('.post > .toc')
  const list = nav?.querySelector('ul')
  if (!nav || !list) return

  const button = root.createElement('button')
  button.type = 'button'
  button.className = 'toc-fab'
  button.hidden = true
  button.setAttribute('aria-haspopup', 'dialog')
  button.textContent = '목차'

  const dialog = root.createElement('dialog')
  dialog.className = 'toc-sheet'
  dialog.setAttribute('aria-label', '목차')
  const head = root.createElement('div')
  head.className = 'toc-sheet-head'
  const title = root.createElement('p')
  title.textContent = '목차'
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
    // 지금 읽는 절(본문 목차의 aria-current)을 표시하고 그 항목에 초점을 둔다.
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
    if (event.target === dialog || event.target.closest?.('a')) dialog.close()
  })

  const wide = view.matchMedia('(min-width: 1200px)')
  let passed = false
  const sync = () => {
    button.hidden = wide.matches || !passed
    if (wide.matches && dialog.open) dialog.close()
  }
  new view.IntersectionObserver(([entry]) => {
    passed = !entry.isIntersecting && entry.boundingClientRect.bottom < 0
    sync()
  }).observe(nav)
  wide.addEventListener('change', sync)
}
