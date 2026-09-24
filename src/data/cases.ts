/**
 * 대표 사례 3건. 소개의 '해 온 일'과 홈 '먼저 읽을 글'의 결과 줄이 같은 문장을 쓴다.
 * 숫자·문장은 각 글 본문이 출처. 새 사실을 더하지 않는다(D6).
 */
export type Case = {
  /** 글 id (src/content/posts/{id}.md) */
  id: string
  title: string
  /** 판단 */
  judgement: string
  /** 변경·결과 (소개 페이지의 합니다체 문장) */
  outcome: string
  /**
   * 같은 문장의 한다체. 홈 '먼저 읽을 글' 행에서 frontmatter의 원인 한 줄(한다체)과 나란히 놓인다.
   * 어미만 다르고 사실·수치는 outcome과 같아야 한다(테스트로 고정).
   */
  outcomePlain: string
}

export const CASES: readonly Case[] = [
  {
    id: 'null-and-empty-string-sync-failure',
    title: '시스템 간 동기화 오류의 두 원인 분리',
    judgement:
      '데이터가 지나가는 각 계층을 조사해 NULL·빈 문자열 비교 오류와 인터페이스 처리 구분값의 규약 불일치를 분리했습니다.',
    outcome:
      '상대 담당자와 송수신 규약을 맞추고 비교·반영 로직을 수정해, 해당 오류로 월 34건 반복되던 불필요한 결재를 없앴습니다.',
    outcomePlain:
      '상대 담당자와 송수신 규약을 맞추고 비교·반영 로직을 수정해, 해당 오류로 월 34건 반복되던 불필요한 결재를 없앴다.',
  },
  {
    id: 'address-search-9s-to-100ms',
    title: '주소 조회 튜닝과 데이터 관리 범위 축소',
    judgement: '조회 성능을 개선해도 주소 갱신 문제가 남아, 외부 주소 검색을 선택했습니다.',
    outcome:
      'DB 조회를 9초에서 1초대로 줄인 뒤, 외부 검색 팝업과 콜백을 연동해 수기 적재를 없앴습니다. 외부 서비스 의존은 남았습니다.',
    outcomePlain:
      'DB 조회를 9초에서 1초대로 줄인 뒤, 외부 검색 팝업과 콜백을 연동해 수기 적재를 없앴다. 외부 서비스 의존은 남았다.',
  },
  {
    id: 'retire-flash-module-by-integration',
    title: '기존 계약 API 연동과 전후 업무 로직 개발',
    judgement: '회의에서 제안된 기존 계약 시스템 API 활용 방안의 구현을 맡았습니다.',
    outcome:
      '연동 전후 업무 로직을 새로 개발하고 상태 동기화·적재 실패 복구를 구성해, Flash 기반 계약 모듈을 대체했습니다.',
    outcomePlain:
      '연동 전후 업무 로직을 새로 개발하고 상태 동기화·적재 실패 복구를 구성해, Flash 기반 계약 모듈을 대체했다.',
  },
]
