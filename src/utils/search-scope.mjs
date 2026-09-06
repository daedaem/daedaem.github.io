export const SEARCH_SCOPES = ['글', '위키', '학습 노트', '알고리즘', '소개·프로젝트']

export function searchScope(pathname) {
  const section = pathname.split('/').filter(Boolean)[0]
  return (
    { posts: '글', wiki: '위키', notes: '학습 노트', algorithms: '알고리즘' }[section] ??
    '소개·프로젝트'
  )
}
