// 지원 끝난 모듈 대체: 코발트 서버를 잘라 보니 슬롯에서 먹지 Flash 카트리지(× 스티커)가 빠져나오고, 윗면엔 API 띠.
float rb(vec3 p, vec3 b) { return sdRBox(p, b, 0.012); }
float sdCylZ(vec3 p, float h, float r) { vec2 d = abs(vec2(length(p.xy), p.z)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }
vec2 solid(vec3 p) {
  vec3 q = p - vec3(0.15, 0.60, 0.0);
  float outer = rb(q, vec3(0.75, 0.60, 0.50));
  float slot = sdBox(q - vec3(0.0, 0.05, 0.15), vec3(0.52, 0.13, 0.50));
  vec2 r = vec2(opSub(outer, slot), M_COBALT);
  float lining = opSub(sdBox(q - vec3(0.0, 0.05, 0.15), vec3(0.55, 0.16, 0.50)), slot);
  r = U(r, vec2(max(lining, outer), M_APRICOT));
  r = U(r, vec2(rb(q - vec3(-0.49, 0.36, 0.508), vec3(0.20, 0.09, 0.008)), M_WHITE));
  return r;
}
vec2 loose(vec3 p) {
  vec3 c = p - vec3(0.15, 0.65, 0.45);
  vec2 r = vec2(rb(c, vec3(0.48, 0.10, 0.30)), M_INK);
  return r;
}
float cutSDF(vec3 p) { return max(-0.15 - p.x, -0.10 - p.z); }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
