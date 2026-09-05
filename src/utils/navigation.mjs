export const PRIMARY_NAV = [
  { href: '/posts/', label: '글', roots: ['/posts/', '/categories/'] },
  { href: '/wiki/', label: '위키', roots: ['/wiki/'] },
  { href: '/learn/', label: '학습 기록', roots: ['/learn/', '/algorithms/', '/notes/'] },
  { href: '/about/', label: '소개', roots: ['/about/', '/projects/'] },
]

export function activeNavigation(path) {
  return PRIMARY_NAV.find((item) => item.roots.some((root) => path.startsWith(root)))?.href
}
