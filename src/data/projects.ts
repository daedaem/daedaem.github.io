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

export const PROJECTS: Project[] = [
  {
    name: 'asset-ledger-api',
    tagline: '가상자산 원장·잔고 API — 복식부기, 멱등 이체, 동시성 안전',
    what: '거래소 백엔드에서 사고가 가장 잦은 영역인 "돈의 정확성"을 다룬 프로젝트입니다. 단순 CRUD가 아니라 정확성을 구조로 보장하는 것을 목표로 했습니다.',
    points: [
      {
        title: '이중 이체를 구조로 막았다',
        body: '`Idempotency-Key` 기반 멱등 처리로, 네트워크 재시도가 몇 번 오더라도 정확히 한 번만 반영된다. 클라이언트의 성실함에 기대지 않는다.',
      },
      {
        title: '음수 잔고를 두 겹으로 막았다',
        body: '비관적 락으로 동시 출금 경합을 직렬화하고, DB `CHECK` 제약을 최후 방어선으로 뒀다. 애플리케이션 버그가 있어도 DB가 막는다.',
      },
      {
        title: '장부를 고치지 않는다',
        body: 'append-only 원장으로 두고, 정정이 필요하면 역분개(reversal)를 새로 쌓는다. 과거 기록을 덮어쓰지 않으므로 감사 추적이 항상 성립한다.',
      },
      {
        title: '잔고와 원장 합이 어긋나지 않게',
        body: '캐시 성격의 잔고를 같은 트랜잭션에서 갱신하고, 저장 직후 원장 합과 일치하는지 검증한다.',
      },
    ],
    stack: ['Java 21', 'Spring Boot 3', 'PostgreSQL', 'Flyway', 'Testcontainers'],
    period: '2026.04 – 2026.07',
    repo: 'https://github.com/daedaem/asset-ledger-api',
    featured: true,
  },
  {
    name: 'StablePay Admin',
    tagline: '송금 승인 백오피스 — 상태머신, 이중원장, 리스크 룰 엔진',
    what: '요청 → 리스크 심사 → 관리자 승인 → 정산 → 온체인 반영까지의 전 생애주기를 다루는 관리자 플랫폼입니다. 스테이블코인 도메인을 걷어내면 그대로 범용 결제·정산 승인 플랫폼으로 읽히도록 용어와 구조를 중립적으로 유지했습니다.',
    points: [
      {
        title: '상태 전이를 한 곳에서만 정의했다',
        body: 'enum의 `canTransitionTo`에 허용 전이를 선언하고, 불법 전이는 409로 막는다. 서비스 계층 여기저기에 가드를 흩어두면 새 코드 경로가 그걸 우회한다.',
      },
      {
        title: '멱등성을 두 겹으로',
        body: '`Idempotency-Key` 헤더에 더해 요청 본문 해시를 비교하고, DB unique 제약까지 건다. 같은 키로 다른 내용이 오는 경우까지 잡는다.',
      },
      {
        title: '비관적 락과 낙관적 락을 비교해봤다',
        body: '잔액 차감은 `SELECT FOR UPDATE`로 직렬화하고, 낙관적 락(`@Version`)을 병행해 어느 쪽이 이 워크로드에 맞는지 확인했다.',
      },
      {
        title: '룰을 추가해도 기존 코드를 안 고치게',
        body: '리스크 룰을 `RiskRule` 인터페이스로 다형화했다. 새 규칙은 구현체를 추가하면 되고 심사 서비스는 그대로다 (OCP).',
      },
    ],
    stack: ['Java 17', 'Spring Boot 3.5', 'PostgreSQL', 'JUnit5', 'Testcontainers'],
    period: '2026.07',
    repo: 'https://github.com/daedaem/Vibe_stable_coin',
    featured: true,
  },
  {
    name: 'vibeMeeting',
    tagline: '회의실 예약 시스템 — 이중 예약 방지와 DB 이식성',
    what: '회의실을 시간 단위로 조회·예약·승인하는 웹 시스템입니다. 요구사항 정의서부터 배포 가이드까지 산출물 12종을 함께 작성했습니다.',
    points: [
      {
        title: '이중 예약을 DB가 막게 했다',
        body: '예약을 30분 슬롯 행으로 풀고 `UNIQUE(room_id, slot_start)` 제약을 걸었다. 애플리케이션의 겹침 검사는 UX용 사전 안내일 뿐이고, 진짜 방어선은 DB다.',
      },
      {
        title: '메일 발송과 예약 트랜잭션을 분리했다',
        body: 'Transactional Outbox 패턴. 발송할 메시지를 같은 트랜잭션에서 테이블에 쌓고 별도 스케줄러가 처리한다. 이중 쓰기 문제를 피하는 정석이다.',
      },
      {
        title: 'DB를 갈아끼울 수 있게 설계했다',
        body: '네이티브 SQL을 쓰지 않고 JPA 표준만 사용하며, Flyway 마이그레이션을 벤더별 폴더로 분리했다. 접속 정보만 바꾸면 MSSQL과 PostgreSQL이 전환된다.',
      },
      {
        title: '권한을 요청마다 다시 확인한다',
        body: '관리자 API는 토큰의 클레임을 믿지 않고 매 요청마다 DB의 현재 권한과 상태를 재확인하고, 감사 로그를 남긴다. 정지·강등이 즉시 반영된다.',
      },
    ],
    stack: ['Java 21', 'Spring Boot 3', 'MS SQL Server', 'PostgreSQL', 'React', 'Vite'],
    period: '2026.07 – 2026.08',
    repo: 'https://github.com/daedaem/vibeMeeting',
    featured: true,
  },
  {
    name: 'GymSpot',
    tagline: '체육관 대관 예약 — 동시 예약 경합을 DB 수준에서 차단',
    what: '생활체육센터의 대관 공간을 시간 단위로 조회·예약·관리하는 웹 애플리케이션입니다.',
    points: [
      {
        title: '경합을 애플리케이션에서 막지 않았다',
        body: '예약을 30분 슬롯 행으로 풀어 `UNIQUE(공간, 슬롯시각)` 제약을 걸었다. 애플리케이션의 겹침 검사는 사용자에게 미리 알려주기 위한 것이고, 실제로 막는 것은 DB다.',
      },
      {
        title: '개발 DB와 운영 DB가 다른 환경을 전제했다',
        body: '로컬은 PostgreSQL, 운영은 MS SQL Server를 프로필로 나눴다. 벤더 차이로 로컬에서만 통과하는 코드가 나오지 않도록 처음부터 갈라뒀다.',
      },
    ],
    stack: ['Java 21', 'Spring Boot 3.5', 'PostgreSQL', 'MS SQL Server', 'React 19', 'Tailwind'],
    period: '2026.02 – 2026.08',
    repo: 'https://github.com/daedaem/gymspot',
  },
]

/** SSAFY 재학 중 진행한 팀 프로젝트. 프론트엔드로 참여했다. */
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
