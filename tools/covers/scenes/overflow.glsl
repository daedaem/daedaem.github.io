// 금액이 마이너스로: 세워 둔 계약서 금액 칸에 음수(라벨), 옆 사람이 머리를 긁으며 갸웃(머리 위 ?는 라벨).
float rb(vec3 p, vec3 b) { return sdRBox(p, b, 0.012); }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
vec3 sheetP(vec3 p) { return rotX(p - vec3(0.45, 0.95, 0.0), -0.30); }
vec2 solid(vec3 p) {
  vec3 f = sheetP(p);
  vec2 r = vec2(rb(f, vec3(1.15, 0.8, 0.025)), M_WHITE);
  // 금액 칸 테두리
  vec3 e = f - vec3(0.0, -0.3, 0.027);
  r = U(r, vec2(opSub(rb(e, vec3(1.05, 0.3, 0.005)), sdBox(e, vec3(1.03, 0.28, 0.05))), M_MEDIUM));
  // 받침
  r = U(r, vec2(rb(p - vec3(0.45, 0.08, 0.1), vec3(1.25, 0.08, 0.32)), M_COBALT));
  return r;
}
vec2 loose(vec3 p) {
  vec3 q = p - vec3(-1.35, 0.0, 0.55);
  float body = sdCapsule(q, vec3(0.0, 0.3, 0.0), vec3(0.0, 0.82, 0.0), 0.3);
  vec3 hc = vec3(0.06, 1.34, 0.0);
  float head = length(q - hc) - 0.24;
  float d = smin(body, head, 0.06);
  // 머리를 긁는 팔
  d = smin(d, sdCapsule(q, vec3(0.02, 0.92, 0.24), vec3(0.1, 1.22, 0.42), 0.075), 0.04);
  d = min(d, sdCapsule(q, vec3(0.1, 1.22, 0.42), vec3(0.08, 1.46, 0.2), 0.07));
  vec2 r = vec2(d, M_MEDIUM);
  // 눈: 계약서와 보는 사람 사이를 향한다
  vec3 dir = normalize(vec3(0.86, 0.02, 0.5)), side = vec3(-dir.z, 0.0, dir.x);
  for (int i = 0; i < 2; i++) {
    vec3 ec = hc + dir * 0.225 + side * (i == 0 ? 0.085 : -0.085) + vec3(0.0, 0.03, 0.0);
    r = U(r, vec2(length(q - ec) - 0.032, M_WHITE));
  }
  return r;
}
float cutSDF(vec3 p) { return 1e9; }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
