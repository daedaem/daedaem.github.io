/** Keep font URLs root-relative when the self-hosted declarations move into page HTML. */
export function inlineFontCSS(css) {
  return css.replaceAll('url(./woff2/', 'url(/fonts/pretendard/woff2/')
}
