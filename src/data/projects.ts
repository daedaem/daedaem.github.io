export type Project = {
  name: string
  tagline: string
  /** 무엇을 만들었나 */
  what: string
  /** 어떤 문제를 어떻게 풀었나 — 이 프로젝트에서 실제로 판단한 것 */
  points: { title: string; body: string }[]
  stack: string[]
  period: string
  repo: string
  featured?: boolean
}

// 진행 중인 프로젝트는 완료 후 여기에 추가한다.
// asset-ledger-api · StablePay Admin · vibeMeeting · GymSpot 은 아직 작업 중이라 뺐다.
export const PROJECTS: Project[] = []

/** 삼성 청년 SW 아카데미(SSAFY) 교육 과정에서 진행한 팀 프로젝트. 프론트엔드로 참여했다. */
export const TEAM_PROJECTS = [
  { name: 'Campus', desc: '캠핑 SNS', repo: 'https://github.com/daedaem/Campus', year: '2022' },
  { name: 'Pairplay', desc: '장소 검색·공유', repo: 'https://github.com/daedaem/Pairplay', year: '2022' },
  {
    name: 'Unique',
    desc: 'NFT 마켓·전시',
    repo: 'https://github.com/daedaem/Unique-NFT_MarketExhibition',
    year: '2022',
  },
  {
    name: 'Moving',
    desc: '영화 추천',
    repo: 'https://github.com/daedaem/Moving_SSAFY-1th-Project',
    year: '2022',
  },
]
