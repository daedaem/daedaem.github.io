// 금액이 마이너스로: 앞면 표시창에 음수 금액(라벨). 오른쪽 끝을 잘라 보니 계수기 바퀴, 마지막 바퀴가 끝을 넘어 살구색.
float rb(vec3 p, vec3 b) { return sdRBox(p, b, 0.012); }
vec2 solid(vec3 p) {
  vec3 q = p - vec3(0.0, 0.5, 0.0);
  float outer = rb(q, vec3(1.7, 0.5, 0.5));
  float innerA = sdBox(q, vec3(1.6, 0.4, 0.4));
  float innerB = sdBox(q, vec3(1.57, 0.37, 0.37));
  vec2 r = vec2(opSub(outer, innerA), M_COBALT);
  r = U(r, vec2(opSub(innerA, innerB), M_PALE));
  // 앞면 표시창
  r = U(r, vec2(rb(q - vec3(-0.36, 0.02, 0.506), vec3(1.24, 0.24, 0.008)), M_WHITE));
  return r;
}
vec2 loose(vec3 p) {
  vec2 r = vec2(1e9, M_WHITE);
  for (int i = 0; i < 2; i++) {
    float x = 1.12 + float(i) * 0.34;
    vec3 c = p - vec3(x, 0.5, 0.0);
    if (i == 1) c = rotX(c - vec3(0.0, 0.0, 0.06), -0.40);
    float wheel = sdRCylX(c, 0.14, 0.3, 0.01);
    wheel = opSub(wheel, sdBox(rotX(c, 0.9 + float(i)) - vec3(0.0, 0.0, 0.3), vec3(0.25, 0.05, 0.005)));
    r = U(r, vec2(wheel, M_WHITE));
    if (i == 1) r = U(r, vec2(rb(c - vec3(0.0, 0.0, 0.3), vec3(0.11, 0.055, 0.014)), M_APRICOT));
  }
  return r;
}
float cutSDF(vec3 p) { return max(0.96 - p.x, -0.05 - p.z); }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
