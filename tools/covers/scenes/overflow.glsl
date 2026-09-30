// 금액이 마이너스로: 코발트 계수기 상자를 잘라 보니 종이 바퀴 넷, 마지막 바퀴가 끝을 넘어 살구색 마이너스. 윗면에 int 띠.
float rb(vec3 p, vec3 b) { return sdRBox(p, b, 0.012); }
vec2 solid(vec3 p) {
  vec3 q = p - vec3(0.0, 0.55, 0.0);
  float outer = rb(q, vec3(1.2, 0.55, 0.55));
  float innerA = sdBox(q, vec3(1.1, 0.45, 0.45));
  float innerB = sdBox(q, vec3(1.07, 0.42, 0.42));
  vec2 r = vec2(opSub(outer, innerA), M_COBALT);
  r = U(r, vec2(opSub(innerA, innerB), M_PALE));
  r = U(r, vec2(rb(q - vec3(-0.72, 0.16, 0.558), vec3(0.26, 0.10, 0.008)), M_WHITE));
  return r;
}
vec2 loose(vec3 p) {
  vec2 r = vec2(1e9, M_WHITE);
  for (int i = 0; i < 4; i++) {
    float x = -0.60 + float(i) * 0.44;
    vec3 c = p - vec3(x, 0.55, 0.0);
    if (i == 3) c = rotX(c - vec3(0.0, 0.0, 0.10), -0.40);
    float wheel = sdRCylX(c, 0.19, 0.31, 0.01);
    wheel = opSub(wheel, sdBox(rotX(c, 0.9 + float(i)) - vec3(0.0, 0.0, 0.31), vec3(0.25, 0.05, 0.005)));
    r = U(r, vec2(wheel, M_WHITE));
    if (i == 3) r = U(r, vec2(rb(c - vec3(0.0, 0.0, 0.31), vec3(0.15, 0.055, 0.014)), M_APRICOT));
  }
  return r;
}
float cutSDF(vec3 p) { return max(-0.25 - p.x, -0.05 - p.z); }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
