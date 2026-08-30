export const SITE = {
  title: '대댐 로그',
  // 홈 화면과 <meta description>에 함께 쓰이는 한 줄 정체성
  tagline: '레거시 환경에서 구조를 개선해 온 백엔드 개발자',
  description:
    'JDK 1.6, Spring 3, Oracle 10g처럼 손대기 어려운 환경에서 성능·정합성·인증 구조를 실제로 바꿔 온 기록입니다. 증상이 아니라 원인을 씁니다.',
  author: '조해성',
  // 이 값 하나가 canonical, sitemap, RSS에 모두 반영됩니다.
  url: 'https://daedaem.github.io',
  locale: 'ko-KR',
  githubUrl: 'https://github.com/daedaem',
  email: 'tg8685@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/haisung-cho-2647a2269/',

  /**
   * 검색엔진 소유 확인 코드. 등록 후 발급받은 값만 채우면 <head>에 자동으로 들어간다.
   * - 구글: search.google.com/search-console → HTML 태그 방식의 content 값
   * - 네이버: searchadvisor.naver.com → 사이트 소유확인 → HTML 태그의 content 값
   * 빈 문자열이면 해당 태그를 넣지 않는다.
   */
  verification: {
    google: 'aM2FnNkFJeBJ5b43dRGSfIMcP790b3C6WmiC6FGpAhM',
    naver: '',
  },

  /**
   * giscus 댓글. 저장소 Discussions를 댓글 저장소로 쓴다.
   * ID는 GitHub GraphQL로 조회한 값이며 비밀이 아니다. repoId를 비우면 댓글 영역을 렌더하지 않는다.
   */
  giscus: {
    repo: 'daedaem/daedaem.github.io',
    repoId: 'R_kgDOHeCvOA',
    category: 'Announcements',
    categoryId: 'DIC_kwDOHeCvOM4DEfLG',
  },
} as const

export type CategoryId =
  | 'data-integrity'
  | 'performance'
  | 'operations'
  | 'legacy'
  | 'auth-security'

export type Category = {
  id: CategoryId
  name: string
  /** 카테고리 페이지 상단에 노출되는 설명. "이 카테고리에 무엇을 쓰는가"의 기준이기도 합니다. */
  description: string
}

/** 배열 순서가 곧 사이트 내비게이션 순서입니다. */
export const CATEGORIES: Category[] = [
  {
    id: 'data-integrity',
    name: '데이터 정합성',
    description:
      '시스템 사이에서 값이 어긋나는 문제. NULL과 빈 문자열, 타입의 표현 범위, 인터페이스 플래그처럼 조용히 어긋나 있다가 한참 뒤에 드러나는 원인을 다룹니다.',
  },
  {
    id: 'performance',
    name: '성능',
    description:
      '느린 이유를 추측이 아니라 실행 계획과 측정으로 규명한 기록. 쿼리를 고쳐서 해결한 경우와, 조회 방식 자체를 바꾸는 편이 맞았던 경우를 함께 씁니다.',
  },
  {
    id: 'operations',
    name: '운영·장애 대응',
    description:
      '이미 돌아가고 있는 시스템에서 일어난 일. 재현이 어려운 현상을 어떤 근거로 좁혀 갔는지, 그 과정에서 무엇을 잘못 짚었는지까지 남깁니다.',
  },
  {
    id: 'legacy',
    name: '레거시 대응',
    description:
      '버전을 올릴 수 없는 환경에서의 선택. 지원이 끝난 기술, 구버전 런타임의 제약, 다시 만들지 않고 우회하는 판단에 대해 씁니다.',
  },
  {
    id: 'auth-security',
    name: '인증·보안',
    description:
      '인증 단계를 나누는 기준과 비밀번호 저장 방식. 운영 중인 시스템에서 사용자를 끊지 않고 이행하는 방법을 다룹니다.',
  },
]

export const CATEGORY_MAP = new Map(CATEGORIES.map(c => [c.id, c]))

export function getCategory(id: string): Category | undefined {
  return CATEGORY_MAP.get(id as CategoryId)
}

/**
 * 위키 주제. 카테고리(글의 성격)와 달리 "무엇에 대한 지식인가"로 나눕니다.
 * 회사에서 막히거나 궁금했던 것을 그때그때 여기에 쌓습니다.
 */
export const WIKI_TOPICS = [
  { id: 'java', name: 'Java', description: '언어 자체와 JVM. 구버전 JDK의 제약을 포함합니다.' },
  { id: 'spring', name: 'Spring', description: 'Spring Framework와 Spring Boot, JPA와 MyBatis.' },
  { id: 'database', name: '데이터베이스', description: 'Oracle과 MSSQL, SQL과 PL/SQL, 실행 계획과 인덱스.' },
  { id: 'dotnet', name: '.NET', description: 'C#과 ASP.NET Web Forms, IIS.' },
  { id: 'web', name: '웹·프론트엔드', description: 'HTTP, JSP와 jQuery, React, 브라우저 동작.' },
  { id: 'infra', name: '인프라·운영', description: 'WAS와 웹서버, 배포, 서버 환경과 로그.' },
  { id: 'cs', name: '기초 지식', description: '자료구조와 알고리즘, 네트워크, 운영체제.' },
  { id: 'etc', name: '그 밖에', description: '아직 자리를 못 정한 것들. 쌓이면 주제를 새로 만듭니다.' },
] as const

export type WikiTopicId = (typeof WIKI_TOPICS)[number]['id']

export const WIKI_TOPIC_MAP = new Map(WIKI_TOPICS.map(t => [t.id, t]))

export function getWikiTopic(id: string) {
  return WIKI_TOPIC_MAP.get(id as WikiTopicId)
}
