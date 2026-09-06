/** 비동기 스크립트·lazy iframe이 준비되기 전의 테마 변경도 최종 상태로 동기화한다. */
export function connectCommentTheme({ host, script, readTheme, page, document, media }) {
  const origin = 'https://giscus.app'
  let readyFrame = null
  let sentTheme
  const getFrame = () => host.querySelector('iframe.giscus-frame')

  const notify = () => {
    const theme = readTheme()
    // client.js가 아직 실행되지 않았다면 이 속성으로 첫 iframe의 테마를 정한다.
    script.setAttribute('data-theme', theme)
    const frame = getFrame()
    if (!frame?.contentWindow) return
    if (frame === readyFrame && sentTheme === theme) return
    frame.contentWindow.postMessage({ giscus: { setConfig: { theme } } }, origin)
    if (frame === readyFrame) sentTheme = theme
  }

  const onLoad = (event) => {
    if (event.target !== getFrame()) return
    readyFrame = null
    sentTheme = undefined
    notify()
  }

  const onMessage = (event) => {
    const frame = getFrame()
    if (event.origin !== origin || !frame || event.source !== frame.contentWindow) return
    // giscus의 첫 resize 통지는 위젯이 실행됐다는 신호다. 이후 반복 통지에는 재전송하지 않는다.
    const height = event.data?.giscus?.resizeHeight
    if (typeof height !== 'number' || !Number.isFinite(height) || height <= 0) return
    if (frame === readyFrame) return
    readyFrame = frame
    sentTheme = undefined
    notify()
  }

  document.addEventListener('themechange', notify)
  media.addEventListener('change', notify)
  host.addEventListener('load', onLoad, true)
  page.addEventListener('message', onMessage)
  notify()

  return () => {
    document.removeEventListener('themechange', notify)
    media.removeEventListener('change', notify)
    host.removeEventListener('load', onLoad, true)
    page.removeEventListener('message', onMessage)
  }
}
