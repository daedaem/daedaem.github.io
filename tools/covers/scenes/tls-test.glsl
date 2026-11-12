// HTTPS 연결 시험을 나타낸 창과 시험용 커넥터. 실제 연결 구성은 표현하지 않는다.
vec2 solid(vec3 p) {
  vec3 q = p - vec3(-0.30, 0.87, -0.14);
  float frame = sdRBox(q, vec3(1.02, 0.70, 0.14), 0.056);
  float opening = sdRBox(q - vec3(0.0, -0.045, 0.13), vec3(0.89, 0.51, 0.09), 0.044);
  vec2 r = vec2(opSub(frame, opening), M_WHITE);
  r = U(r, vec2(sdRBox(q - vec3(0.0, -0.045, 0.038), vec3(0.90, 0.52, 0.023), 0.045), M_PALE));
  r = U(r, vec2(sdRBox(q - vec3(0.0, 0.55, 0.143), vec3(0.87, 0.035, 0.018), 0.014), M_MEDIUM));
  r = U(r, vec2(sdRBox(p - vec3(-0.30, 0.085, -0.05), vec3(1.09, 0.085, 0.34), 0.04), M_COBALT));
  r = U(r, vec2(sdRBox(p - vec3(0.43, 0.30, 0.075), vec3(0.17, 0.11, 0.075), 0.035), M_MEDIUM));
  return r;
}

vec2 loose(vec3 p) {
  // 짧은 케이블을 따라 시선이 시험용 커넥터에 닿는다.
  vec3 a = vec3(0.43, 0.30, 0.15);
  vec3 b = vec3(0.43, 0.14, 0.43);
  vec3 c = vec3(0.53, 0.12, 0.71);
  vec3 d = vec3(0.91, 0.14, 0.85);
  float wire = min(sdCapsule(p, a, b, 0.052), sdCapsule(p, b, c, 0.052));
  wire = min(wire, sdCapsule(p, c, d, 0.052));
  vec2 r = vec2(wire, M_MEDIUM);
  vec3 plug = rotY(p - vec3(1.05, 0.14, 0.87), -0.18);
  r = U(r, vec2(sdRBox(plug, vec3(0.22, 0.13, 0.17), 0.065), M_APRICOT));
  r = U(r, vec2(sdRBox(plug - vec3(0.24, 0.0, 0.0), vec3(0.09, 0.066, 0.11), 0.024), M_INK));
  return r;
}

float cutSDF(vec3 p) { return 1e9; }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
