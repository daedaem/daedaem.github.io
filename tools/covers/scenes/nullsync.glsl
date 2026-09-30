// 결재가 또 올라온다: 똑같은 결재서 더미를 잘라 보니 빈 칸 하나(살구색)가 모든 장을 관통한다. 한 장이 또 내려온다.
float rb(vec3 p, vec3 b) { return sdRBox(p, b, 0.012); }
vec2 solid(vec3 p) {
  vec2 r = vec2(rb(p - vec3(0.0, 0.30, 0.0), vec3(1.1, 0.30, 0.75)), M_WHITE);
  r = U(r, vec2(rb(p - vec3(0.35, 0.305, 0.05), vec3(0.26, 0.305, 0.18)), M_APRICOT));
  for (int k = 0; k < 3; k++) r = U(r, vec2(rb(p - vec3(-0.50, 0.604, -0.36 + 0.26 * float(k)), vec3(0.42, 0.004, 0.04)), M_PALE));
  return r;
}
vec2 loose(vec3 p) {
  vec3 f = p - vec3(-0.30, 0.92, -0.62);
  f = rotZ(rotX(f, 0.36), -0.20);
  f.y -= 0.05 * pow(clamp((f.x / 1.1 + 1.0) * 0.5, 0.0, 1.0), 3.0);
  vec2 r = vec2(rb(f, vec3(1.1, 0.016, 0.75)), M_WHITE);
  for (int k = 0; k < 3; k++) r = U(r, vec2(rb(f - vec3(-0.50, 0.02, -0.36 + 0.26 * float(k)), vec3(0.42, 0.004, 0.04)), M_PALE));
  vec3 e = f - vec3(0.35, 0.022, 0.05);
  r = U(r, vec2(opSub(rb(e, vec3(0.26, 0.006, 0.18)), sdBox(e, vec3(0.23, 0.05, 0.15))), M_PALE));
  return r;
}
float cutSDF(vec3 p) { return max(0.35 - p.x, 0.05 - p.z); }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
