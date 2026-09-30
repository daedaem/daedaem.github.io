// 분명히 껐는데 배치가 돌고 있었다: 서버 앞면 스위치는 내려가 OFF인데, 옆의 살구색 톱니는 돌고 있다(코발트 회전 자국).
float rb(vec3 p, vec3 b) { return sdRBox(p, b, 0.012); }
const vec3 PD = vec3(0.483, 0.0, 0.875);
float sdCog(vec3 p) {
  float d = sdCylY(p, 0.05, 0.3);
  for (int i = 0; i < 8; i++) {
    vec3 q = rotY(p, float(i) * 0.7854);
    d = min(d, sdRBox(q - vec3(0.33, 0.0, 0.0), vec3(0.08, 0.05, 0.07), 0.02));
  }
  return opSub(d, sdCylY(p, 0.1, 0.09));
}
float arc(vec3 q, float R, float r, float a0, float a1) {
  float a = atan(q.y, q.x);
  if (a < 0.0) a += 6.2832;
  if (a >= a0 && a <= a1) return sdTorusZ(q, R, r);
  vec3 e0 = vec3(cos(a0), sin(a0), 0.0) * R, e1 = vec3(cos(a1), sin(a1), 0.0) * R;
  return min(length(q - e0), length(q - e1)) - r;
}
vec2 solid(vec3 p) {
  vec2 r = vec2(rb(p - vec3(-0.6, 0.62, 0.0), vec3(0.5, 0.62, 0.42)), M_COBALT);
  r = U(r, vec2(rb(p - vec3(-0.6, 0.92, 0.43), vec3(0.3, 0.17, 0.02)), M_WHITE));     // OFF 명판
  r = U(r, vec2(rb(p - vec3(-0.6, 0.42, 0.43), vec3(0.13, 0.2, 0.03)), M_PALE));      // 스위치 판
  return r;
}
vec2 loose(vec3 p) {
  vec2 r = vec2(sdCapsule(p, vec3(-0.6, 0.42, 0.46), vec3(-0.6, 0.25, 0.64), 0.055), M_INK); // 내려간 레버
  vec3 g = rotY(p - vec3(0.75, 0.95, 0.2), -atan(PD.x, PD.z));
  r = U(r, vec2(sdCog(rotX(g, 1.5708)), M_APRICOT));
  float m = min(arc(g, 0.6, 0.03, 0.35, 1.25), arc(g, 0.6, 0.03, 3.5, 4.4));
  r = U(r, vec2(m, M_MEDIUM));
  return r;
}
float cutSDF(vec3 p) { return 1e9; }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
