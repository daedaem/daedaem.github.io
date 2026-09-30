// 껐는데 배치가 돌고 있었다: 먹지 서버 상자를 잘라 보니 앞면은 OFF인데 안에서 살구색 톱니가 아직 돌고, 축에 IP 꼬리표가 매달려 있다.
float rb(vec3 p, vec3 b) { return sdRBox(p, b, 0.012); }
const vec3 BC = vec3(0.0, 0.62, 0.0);
vec2 solid(vec3 p) {
  vec3 q = p - BC;
  float outer = rb(q, vec3(0.55, 0.62, 0.42));
  float innerA = sdBox(q, vec3(0.48, 0.55, 0.35));
  float innerB = sdBox(q, vec3(0.44, 0.51, 0.31));
  vec2 r = vec2(opSub(outer, innerA), M_INK);
  r = U(r, vec2(opSub(innerA, innerB), M_PALE));
  r = U(r, vec2(rb(q - vec3(-0.27, 0.30, 0.428), vec3(0.21, 0.11, 0.008)), M_WHITE));
  for (int i = 0; i < 2; i++) r = U(r, vec2(rb(q - vec3(-0.27, -0.06 - 0.22 * float(i), 0.425), vec3(0.17, 0.03, 0.005)), M_PALE));
  return r;
}
float sdCog(vec3 p) {
  float d = sdCylY(p, 0.035, 0.22);
  for (int i = 0; i < 8; i++) {
    vec3 q = rotY(p, float(i) * 0.7854);
    d = min(d, sdRBox(q - vec3(0.24, 0.0, 0.0), vec3(0.06, 0.035, 0.05), 0.015));
  }
  return opSub(d, sdCylY(p, 0.1, 0.05));
}
vec2 loose(vec3 p) {
  vec3 g = p - vec3(0.22, 0.62, 0.12);
  vec2 r = vec2(sdCog(rotY(g, 0.25)), M_APRICOT);
  r = U(r, vec2(sdCylY(p - vec3(0.22, 0.42, 0.12), 0.33, 0.025), M_WHITE));                 // 축
  r = U(r, vec2(sdCapsule(p, vec3(0.22, 0.60, 0.12), vec3(0.34, 0.42, 0.30), 0.005), M_WHITE)); // 실
  vec3 tg = rotY(p - vec3(0.36, 0.33, 0.32), -0.5);
  r = U(r, vec2(rb(tg, vec3(0.13, 0.09, 0.008)), M_WHITE));                                      // IP 꼬리표(세워짐)
  return r;
}
float cutSDF(vec3 p) { return max(0.05 - p.x, -0.05 - p.z); }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
