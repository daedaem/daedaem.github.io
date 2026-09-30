// Flash 계약 모듈을 걷어 내고 외부 서비스와 연동: 서버 앞 빈 슬롯(살구색), 빠진 Flash 카트리지는 바닥에,
// 서버와 외부 서비스 카드 사이를 오가는 두 화살표(계약 작성 요청, 결재 상태 회신).
float rb(vec3 p, vec3 b) { return sdRBox(p, b, 0.012); }
vec2 solid(vec3 p) {
  vec3 q = p - vec3(-1.1, 0.62, 0.0);
  float outer = rb(q, vec3(0.55, 0.62, 0.45));
  float slot = sdBox(q - vec3(0.0, 0.15, 0.45), vec3(0.34, 0.08, 0.2));
  vec2 r = vec2(opSub(outer, slot), M_COBALT);
  float lining = opSub(sdBox(q - vec3(0.0, 0.15, 0.45), vec3(0.37, 0.11, 0.19)), slot);
  r = U(r, vec2(max(lining, outer), M_APRICOT));
  r = U(r, vec2(rb(p - vec3(1.2, 0.8, 0.0), vec3(0.66, 0.58, 0.1)), M_WHITE));   // 외부 서비스 카드
  return r;
}
vec2 arrow(vec3 p, vec3 a, vec3 b, float dir) {
  float d = sdCapsule(p, a, b, 0.05);
  vec3 tip = dir > 0.0 ? b : a, back = dir > 0.0 ? vec3(-0.2, 0.0, 0.0) : vec3(0.2, 0.0, 0.0);
  d = min(d, sdCapsule(p, tip, tip + back + vec3(0.0, 0.16, 0.0), 0.05));
  d = min(d, sdCapsule(p, tip, tip + back - vec3(0.0, 0.16, 0.0), 0.05));
  return vec2(d, M_MEDIUM);
}
vec2 loose(vec3 p) {
  vec2 r = vec2(rb(rotY(p - vec3(-1.05, 0.075, 0.95), 0.35), vec3(0.36, 0.065, 0.22)), M_INK);  // 빠진 Flash
  r = U(r, arrow(p, vec3(-0.4, 0.98, 0.2), vec3(0.4, 0.98, 0.2), 1.0));
  r = U(r, arrow(p, vec3(-0.4, 0.58, 0.2), vec3(0.4, 0.58, 0.2), -1.0));
  return r;
}
float cutSDF(vec3 p) { return 1e9; }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
