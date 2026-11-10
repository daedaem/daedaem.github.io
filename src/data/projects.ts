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
export const PROJECTS: Project[] = []

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
  /** 2023년 포트폴리오에 쓰던 당시 화면 캡처. 원본 비율 유지, 개인정보·워터마크 영역은 잘라냈다. */
  image?: { src: string; width: number; height: number; alt: string }
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
    image: {
      src: '/uploads/project-covers/pairplay-main-2022.webp',
      width: 851,
      height: 898,
      alt: 'Pairplay 메인 화면. 운동 장소 검색 배너와 축구·풋살·농구 등 운동 카테고리 그리드',
    },
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
    image: {
      src: '/uploads/project-covers/unique-main-2022.webp',
      width: 600,
      height: 269,
      alt: 'Unique 메인 화면. NFT 탐색·생성 배너와 상단 Exhibition·Market 메뉴',
    },
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
    image: {
      src: '/uploads/project-covers/campus-main-2022.webp',
      width: 1600,
      height: 784,
      alt: 'Campus 메인 화면. 설산 앞 텐트 사진 위에 "당신의 캠핑 메이트를 만나 보세요" 문구',
    },
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
    image: {
      src: '/uploads/project-covers/moving-main-2022.webp',
      width: 943,
      height: 444,
      alt: 'Moving 메인 화면. 영화 검색창과 포스터 그리드',
    },
  },
]
