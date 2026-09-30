// 금액이 마이너스로: 세워 둔 계약서 금액 칸에 음수(라벨).
float rb(vec3 p, vec3 b) { return sdRBox(p, b, 0.012); }
vec3 sheetP(vec3 p) { return rotX(p - vec3(0.0, 0.95, 0.0), -0.30); }
vec2 solid(vec3 p) {
  vec3 f = sheetP(p);
  vec2 r = vec2(rb(f, vec3(1.15, 0.8, 0.025)), M_WHITE);
  // 금액 칸 테두리
  vec3 e = f - vec3(0.0, -0.3, 0.027);
  r = U(r, vec2(opSub(rb(e, vec3(1.05, 0.3, 0.005)), sdBox(e, vec3(1.03, 0.28, 0.05))), M_MEDIUM));
  // 받침
  r = U(r, vec2(rb(p - vec3(0.0, 0.08, 0.1), vec3(1.25, 0.08, 0.32)), M_COBALT));
  return r;
}
vec2 loose(vec3 p) { return vec2(1e9, M_WHITE); }
float cutSDF(vec3 p) { return 1e9; }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
