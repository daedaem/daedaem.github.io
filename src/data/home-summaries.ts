/** 홈에서만 쓰는 짧은 요약. 원문·검색·RSS의 설명과 실제 수행 범위는 보존한다. */
export const HOME_SUMMARIES: Record<string, string> = {
  'retire-flash-module-by-integration':
    '기존 외부 API에 계약 작성을 연결하고, 연동 전후 업무 로직과 결재 상태 동기화·적재 실패 복구 흐름을 개발했다.',
  'disk-99-percent-check-before-expanding':
    'OS 사용률과 Oracle 데이터파일 내부의 여유 공간을 구분했다. 바로 증설하지 않고 용량 변경을 보류할 조건을 정리한다.',
  'phantom-batch-after-was-migration':
    '개발 서버에서 옛 컨테이너를 내려도 갱신이 계속됐다. UPDATE 트리거에 접속 IP를 남겨 잔존 프로세스를 찾았다.',
  'null-and-empty-string-sync-failure':
    'NULL·빈 문자열 비교와 인터페이스 처리 구분값의 규약 불일치를 각각 수정해, 불필요하게 반복되던 결재를 없앴다.',
  'integer-overflow-negative-amount':
    '동료와 개발하던 중 테스트에서 기존 금액 처리의 음수 표시를 발견했다. DB·VO 값을 대조하고 int를 long으로 바꿔 정상 표시를 확인했다.',
  'address-search-9s-to-100ms':
    'DB 조회를 1초대로 줄여도 주소 갱신 문제가 남아 외부 API로 옮겼다. 수기 적재를 없앤 대신 외부 서비스 의존은 남았다.',
}
