// 600만 건 주소: 직접 들고 있던 주소 DB(명판 600만 건)에서 화살표가 도로명주소 API 카드로 옮겨 간다.
float rb(vec3 p, vec3 b) { return sdRBox(p, b, 0.012); }
const vec3 DB = vec3(-1.35, 0.0, 0.0);
const vec3 PD = vec3(0.6, 0.0, 0.8); // 명판이 보는 방향(카메라 쪽)
vec2 solid(vec3 p) {
  vec3 q = p - DB;
  float d = 1e9;
  for (int i = 0; i < 3; i++) d = min(d, sdCylY(q - vec3(0.0, 0.22 + 0.44 * float(i), 0.0), 0.2, 0.62) - 0.012);
  vec2 r = vec2(d, M_COBALT);
  // 명판: 원통에 박혀 앞으로 나온 판
  vec3 pc = q - vec3(PD.x * 0.55, 1.1, PD.z * 0.55);
  pc = rotY(pc, -atan(PD.x, PD.z));
  r = U(r, vec2(rb(pc, vec3(0.44, 0.15, 0.12)), M_WHITE));
  // 도로명주소 API 카드
  r = U(r, vec2(rb(p - vec3(1.3, 0.78, 0.0), vec3(0.66, 0.56, 0.1)), M_WHITE));
  return r;
}
vec2 loose(vec3 p) {
  float d = sdCapsule(p, vec3(-0.6, 0.66, 0.25), vec3(0.42, 0.66, 0.25), 0.065);
  d = min(d, sdCapsule(p, vec3(0.44, 0.66, 0.25), vec3(0.2, 0.88, 0.25), 0.065));
  d = min(d, sdCapsule(p, vec3(0.44, 0.66, 0.25), vec3(0.2, 0.44, 0.25), 0.065));
  return vec2(d, M_MEDIUM);
}
float cutSDF(vec3 p) { return 1e9; }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
