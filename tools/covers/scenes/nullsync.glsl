// 바꾼 적 없는데 결재가 또 올라온다: 결재지 더미 위로 같은 결재지가 한 장, 또 한 장 내려온다.
float rb(vec3 p, vec3 b) { return sdRBox(p, b, 0.012); }
vec2 sheet(vec3 f) {
  vec2 r = vec2(rb(f, vec3(0.85, 0.014, 0.6)), M_WHITE);
  r = U(r, vec2(rb(f - vec3(-0.25, 0.016, -0.38), vec3(0.45, 0.004, 0.035)), M_PALE));
  r = U(r, vec2(rb(f - vec3(-0.35, 0.016, -0.2), vec3(0.35, 0.004, 0.03)), M_PALE));
  // 결재 칸
  r = U(r, vec2(opSub(rb(f - vec3(0.52, 0.016, 0.3), vec3(0.2, 0.004, 0.16)), sdBox(f - vec3(0.52, 0.016, 0.3), vec3(0.18, 0.05, 0.14))), M_MEDIUM));
  return r;
}
vec2 solid(vec3 p) {
  vec2 r = vec2(1e9, M_WHITE);
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    r = U(r, sheet(rotY(p - vec3(0.0, 0.016 + fi * 0.034, 0.0), 0.05 * sin(fi * 2.1))));
  }
  return r;
}
vec2 loose(vec3 p) {
  vec2 r = sheet(rotX(rotZ(p - vec3(0.1, 0.72, 0.05), -0.18), 0.12));
  r = U(r, sheet(rotX(rotZ(p - vec3(-0.05, 1.28, -0.1), 0.14), -0.1)));
  return r;
}
float cutSDF(vec3 p) { return 1e9; }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
