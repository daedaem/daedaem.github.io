// 디스크 99%: 위에는 99% 경보, 통을 잘라 보니 안은 바닥만 조금 찼다.
float rb(vec3 p, vec3 b) { return sdRBox(p, b, 0.012); }
const vec3 PD = vec3(0.483, 0.0, 0.875);
vec2 solid(vec3 p) {
  vec3 c = p - vec3(0.0, 0.60, 0.0);
  float wall = opSub(sdCylY(c, 0.60, 0.75) - 0.01, sdCylY(c - vec3(0.0, 0.04, 0.0), 0.60, 0.70));
  vec2 r = vec2(wall, M_COBALT);
  // 실제로 찬 양: 바닥에 조금
  r = U(r, vec2(sdCylY(c - vec3(0.0, -0.44, 0.0), 0.12, 0.695), M_MINT));
  return r;
}
vec2 loose(vec3 p) {
  vec3 b = rotY(p - vec3(0.0, 1.78, 0.0), -atan(PD.x, PD.z));
  vec2 r = vec2(rb(b, vec3(0.62, 0.22, 0.06)) - 0.04, M_WHITE);
  // 꼬리
  r = U(r, vec2(rb(rotZ(b - vec3(0.0, -0.26, 0.0), 0.785), vec3(0.09, 0.09, 0.05)) - 0.02, M_WHITE));
  // 경보 원
  vec3 d = b - vec3(-0.36, 0.0, 0.1);
  r = U(r, vec2(sdRCylX(rotY(d, 1.5708), 0.05, 0.16, 0.02), M_APRICOT));
  return r;
}
float cutSDF(vec3 p) { return max(0.0 - p.x, 0.0 - p.z); }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
