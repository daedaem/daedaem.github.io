export type Project = {
  name: string
  tagline: string
  /** 무엇을 만들었나 */
  what: string
  /** 어떤 문제를 어떻게 풀었나 — 이 프로젝트에서 실제로 판단한 것 */
  points: { title: string; body: string }[]
  stack: string[]
  period: string
  /** 공개 저장소일 때만 넣는다. 비공개면 비워 두고 status로 알린다. */
  repo?: string
  /** 진행 상황. 완성 전이라도 올려 두고 채운다. */
  status?: string
  featured?: boolean
}

/**
 * 회사 업무로 만든 것은 여기에 올리지 않는다. 개인적으로 만든 것만 둔다.
 * 완성도가 낮아도 status에 상태를 적어 두고 올린다.
 */
export const PROJECTS: Project[] = [
  {
    name: 'GymSpot',
    featured: true,
    tagline: '동시 예약 경합을 애플리케이션이 아니라 DB에서 막아 보는 중',
    period: '2026.08 – 진행 중',
    status: '진행 중 — 예약 도메인 구현, 화면 개발 중',
    what: '생활체육센터의 대관 공간을 시간 단위로 조회·예약·관리하는 웹 애플리케이션을 만들고 있다. 예약 시스템에서 어려운 부분은 화면이 아니라 "같은 시간에 두 명이 동시에 누르면 어떻게 되는가"라고 보고, 거기를 어떻게 다룰지 정하는 데 시간을 쓰고 있다.',
    points: [
      {
        title: '겹침을 검사하는 대신 겹칠 수 없는 구조로 두려고 한다',
        body: '예약을 시작·종료 시각 한 쌍으로 저장하면 겹침 판정을 코드로 해야 하고, 두 요청이 동시에 검사를 통과하는 창이 생긴다. 예약을 30분 슬롯 행으로 펼쳐 저장하고 `UNIQUE(공간, 슬롯시각)` 제약을 거는 방향으로 잡았다. 이렇게 두면 겹침은 판정할 대상이 아니라 DB가 거부하는 일이 된다.',
      },
      {
        title: '애플리케이션 검사는 남기되 역할을 바꾼다',
        body: '겹침 검사를 없애지는 않는다. 다만 정합성을 지키는 장치가 아니라 사용자에게 미리 알려 주는 UX 장치로 성격을 옮긴다. 최종 판단은 DB 제약이 하고, 검사는 사용자가 실패를 늦게 아는 것을 줄여 준다.',
      },
      {
        title: '남은 것',
        body: '예약 화면과 관리자 기능이 아직이다. 경합 상황을 실제로 만들어 놓고 제약이 의도대로 거부하는지 확인하는 테스트도 더 써야 한다. 정리되는 대로 여기에 다시 적는다.',
      },
    ],
    stack: [
      'Java 21',
      'Spring Boot 3.5',
      'Spring Security',
      'PostgreSQL',
      'React 19',
      'Vite',
      'Tailwind CSS',
    ],
  },
]

/** 삼성 청년 SW 아카데미(SSAFY) 교육 과정에서 진행한 팀 프로젝트. 프론트엔드로 참여했다. */
export type TeamProject = {
  name: string
  desc: string
  period: string
  /** 총 인원과 구성 */
  team: string
  role: string[]
  stack: string
  repo: string
  /** 팀장을 맡은 프로젝트 */
  lead?: boolean
}

export const TEAM_PROJECTS: TeamProject[] = [
  {
    name: 'Pairplay',
    desc: '전국 체육시설 조회·예약 및 운동 메이트 중개 플랫폼',
    period: '2022.04 – 2022.05',
    team: '6명 (백엔드 3, 프론트엔드 3)',
    role: [
      '지역·종목·날짜 필터링 검색과 지도 API를 이용한 위치 기반 시설 조회 구현',
      '시설 상세 화면(평점·이용시간·요금·위치·이용규칙·리뷰)과 날짜별 예약 가능 시간 조회 구현',
      '결제 API를 연동해 예약 기능 구현',
    ],
    stack: 'JavaScript, Vue 3, Scss, Bootstrap, Naver Map API, Figma',
    repo: 'https://github.com/daedaem/Pairplay',
  },
  {
    name: 'Unique',
    desc: 'NFT 마켓플레이스와 온라인 전시 서비스',
    period: '2022.02 – 2022.04',
    team: '4명 (백엔드 2, 프론트엔드 2)',
    lead: true,
    role: [
      '팀장 — 업무 계획과 진행 관리, 데일리 스크럼 및 기록',
      '메인·지갑·NFT 생성·마켓·전시 페이지 구현, 와이어프레임 제작',
      'ganache와 truffle로 로컬 블록체인 네트워크를 구성하고 프라이빗 네트워크에 스마트 컨트랙트 배포',
      'ERC-20·ERC-721 표준 기반 컨트랙트 구현(NFT 발행, 판매 계약 생성)과 web3.js 연동',
    ],
    stack: 'JavaScript, Vue 2, Scss, Solidity, truffle, ganache, web3.js',
    repo: 'https://github.com/daedaem/Unique-NFT_MarketExhibition',
  },
  {
    name: 'Campus',
    desc: '캠핑 SNS와 캠핑장 조회·메이트 중개 서비스',
    period: '2022.01 – 2022.02',
    team: '5명 (백엔드 3, 프론트엔드 2)',
    lead: true,
    role: [
      '팀장 — Jira로 업무 계획과 프로세스 관리, Notion으로 회의·기획 기록',
      '캠핑 생활을 공유하는 SNS 기능 개발',
      '공공 캠핑장 정보 API를 연동해 검색과 필터 조회 구현',
    ],
    stack: 'JavaScript, Vue 2, Bootstrap',
    repo: 'https://github.com/daedaem/Campus',
  },
  {
    name: 'Moving',
    desc: '영화 정보 기반 추천 서비스',
    period: '2021.11',
    team: '2명',
    role: [
      '백엔드 — Django로 전체 모델링과 영화 도메인 개발, DRF로 API 구현',
      '프론트엔드 — 외부 영화 정보 API를 연동한 장르별 추천과 검색 기능 구현',
    ],
    stack: 'Python, Django, DRF, JavaScript, Vue 2, SQLite',
    repo: 'https://github.com/daedaem/Moving_SSAFY-1th-Project',
  },
]
