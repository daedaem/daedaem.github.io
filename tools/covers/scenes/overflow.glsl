// 금액이 마이너스로: 세워 둔 계약서 금액 칸에 음수(라벨). 옆 사람이 계약서를 보며 머리를 긁는다(머리 위 ?는 라벨).
float rb(vec3 p, vec3 b) { return sdRBox(p, b, 0.012); }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float sdRoundCone(vec3 p, float r1, float r2, float h) { vec2 q = vec2(length(p.xz), p.y); float b = (r1 - r2) / h, a = sqrt(1.0 - b * b); float k = dot(q, vec2(-b, a)); if (k < 0.0) return length(q) - r1; if (k > a * h) return length(q - vec2(0.0, h)) - r2; return dot(q, vec2(a, b)) - r1; }
vec3 sheetP(vec3 p) { return rotX(p - vec3(0.45, 0.95, 0.0), -0.30); }
vec2 solid(vec3 p) {
  vec3 f = sheetP(p);
  vec2 r = vec2(rb(f, vec3(1.15, 0.8, 0.025)), M_WHITE);
  vec3 e = f - vec3(0.0, -0.3, 0.027);
  r = U(r, vec2(opSub(rb(e, vec3(1.05, 0.3, 0.005)), sdBox(e, vec3(1.035, 0.285, 0.05))), M_MEDIUM));
  r = U(r, vec2(rb(p - vec3(0.45, 0.08, 0.1), vec3(1.25, 0.08, 0.32)), M_COBALT));
  return r;
}
const vec3 HC = vec3(0.04, 1.36, 0.0);
vec2 loose(vec3 p) {
  vec3 q = p - vec3(-1.3, 0.0, 0.6);
  // 몸(코발트 옷): 아래가 넓은 둥근 원뿔
  float body = sdRoundCone(q - vec3(0.0, 0.3, 0.0), 0.31, 0.22, 0.62);
  body = smin(body, sdCapsule(q, vec3(0.0, 0.95, 0.0), vec3(0.0, 1.05, 0.0), 0.1), 0.05);  // 목
  // 머리를 긁는 팔, 내린 팔
  body = smin(body, sdCapsule(q, vec3(0.02, 0.86, 0.22), vec3(0.12, 1.2, 0.4), 0.07), 0.04);
  body = min(body, sdCapsule(q, vec3(0.12, 1.2, 0.4), vec3(0.06, 1.45, 0.24), 0.065));
  body = smin(body, sdCapsule(q, vec3(0.0, 0.84, -0.22), vec3(0.04, 0.45, -0.3), 0.07), 0.04);
  vec2 r = vec2(body, M_MEDIUM);
  // 머리(흰 얼굴)와 머리카락(먹)
  float head = length(q - HC) - 0.25;
  r = U(r, vec2(head, M_WHITE));
  vec3 dir = normalize(vec3(0.86, 0.02, 0.5));
  vec3 back = normalize(vec3(0.0, 1.0, 0.0) - dir * 0.9);
  float hair = max(length(q - HC) - 0.272, -(dot(q - HC, back) - 0.02));
  r = U(r, vec2(hair, M_INK));
  // 눈
  vec3 side = vec3(-dir.z, 0.0, dir.x);
  for (int i = 0; i < 2; i++) {
    vec3 ec = HC + dir * 0.235 + side * (i == 0 ? 0.08 : -0.08) - vec3(0.0, 0.02, 0.0);
    r = U(r, vec2(length(q - ec) - 0.03, M_INK));
  }
  return r;
}
float cutSDF(vec3 p) { return 1e9; }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
