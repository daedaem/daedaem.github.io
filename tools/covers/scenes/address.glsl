// 600만 건 주소: 코발트 카드 상자를 잘라 보니 주소 카드가 빽빽이 세워져 있고, 위에는 핀이 꽂힌 작은 API 카드 한 장.
float rb(vec3 p, vec3 b) { return sdRBox(p, b, 0.012); }
float sdRoundCone(vec3 p, float r1, float r2, float h) { vec2 q = vec2(length(p.xz), p.y); float b = (r1 - r2) / h, a = sqrt(1.0 - b * b); float k = dot(q, vec2(-b, a)); if (k < 0.0) return length(q) - r1; if (k > a * h) return length(q - vec2(0.0, h)) - r2; return dot(q, vec2(a, b)) - r1; }
vec2 solid(vec3 p) {
  vec3 q = p - vec3(-0.25, 0.45, 0.0);
  float outer = rb(q, vec3(0.95, 0.45, 0.68));
  float inner = sdBox(q - vec3(0.0, 0.10, 0.0), vec3(0.91, 0.45, 0.64));
  vec2 r = vec2(opSub(outer, inner), M_COBALT);
  r = U(r, vec2(rb(q - vec3(-0.58, 0.02, 0.688), vec3(0.22, 0.10, 0.008)), M_WHITE));
  r = U(r, vec2(sdBox(q - vec3(0.0, -0.03, 0.0), vec3(0.91, 0.42, 0.64)), M_WHITE));
  r = U(r, vec2(sdBox(q - vec3(0.18, 0.02, 0.0), vec3(0.03, 0.47, 0.64)), M_APRICOT));
  return r;
}
vec2 loose(vec3 p) {
  vec2 r = vec2(1e9, M_WHITE);
  vec3 k = p - vec3(-0.80, 0.90, -0.30);
  r = U(r, vec2(sdRoundCone(k, 0.015, 0.14, 0.38), M_MEDIUM));
  r = U(r, vec2(length(k - vec3(0.0, 0.38, 0.12)) - 0.045, M_WHITE));
  return r;
}
float cutSDF(vec3 p) { return max(-0.20 - p.x, -0.10 - p.z); }
vec3 cutStripeDir() { return vec3(1.0, 0.0, 0.0); }
