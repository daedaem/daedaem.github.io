// 로그 점검 도구의 개념 화면. 줄과 막대에는 실제 로그나 측정값을 넣지 않는다.
vec2 solid(vec3 p) {
  vec2 r = vec2(sdRBox(p - vec3(-0.54, 0.92, -0.04), vec3(1.30, 0.83, 0.13), 0.063), M_COBALT);
  r = U(r, vec2(sdRBox(p - vec3(-0.54, 0.92, 0.091), vec3(1.20, 0.73, 0.022), 0.052), M_INK));
  r = U(r, vec2(sdRBox(p - vec3(-0.54, 0.052, -0.02), vec3(1.34, 0.052, 0.28), 0.038), M_COBALT));

  for (int i = 0; i < 3; i++) {
    float y = 1.02 - float(i) * 0.25;
    float width = i == 2 ? 0.29 : 0.41;
    float line = sdRBox(p - vec3(-1.30 + width, y, 0.123), vec3(width, 0.038, 0.017), 0.014);
    float prefix = sdRBox(p - vec3(-1.52, y, 0.123), vec3(0.10, 0.038, 0.017), 0.014);
    r = U(r, vec2(min(line, prefix), i == 1 ? M_APRICOT : M_WHITE));

    float height = i == 0 ? 0.29 : i == 1 ? 0.47 : 0.65;
    vec3 bar = vec3(-0.18 + float(i) * 0.25, 0.46 + height * 0.5, 0.124);
    r = U(r, vec2(sdRBox(p - bar, vec3(0.075, height * 0.5, 0.019), 0.012), M_MEDIUM));
  }
  r = U(r, vec2(sdRBox(p - vec3(0.07, 0.40, 0.124), vec3(0.36, 0.018, 0.016), 0.01), M_WHITE));
  return r;
}

vec2 loose(vec3 p) {
  // 도구 화면과 구분되는 카드로 AI의 코딩 보조를 나타낸다.
  vec3 q = p - vec3(1.48, 0.59, 0.24);
  vec2 r = vec2(sdRBox(q, vec3(0.52, 0.59, 0.125), 0.058), M_WHITE);
  r = U(r, vec2(sdRBox(q - vec3(0.0, 0.23, 0.124), vec3(0.42, 0.245, 0.019), 0.032), M_PALE));
  return r;
}

float cutSDF(vec3 p) { return 1e9; }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
