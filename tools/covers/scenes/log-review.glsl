// 묶은 텍스트를 살펴보는 장면. 줄은 실제 로그 대신 추상적인 띠로 그린다.
vec2 solid(vec3 p) {
  vec2 r = vec2(sdRBox(p - vec3(-0.49, 1.04, 0.02), vec3(0.77, 0.84, 0.048), 0.026), M_PALE);
  r = U(r, vec2(sdRBox(p - vec3(-0.36, 0.99, 0.16), vec3(0.77, 0.82, 0.048), 0.026), M_WHITE));
  r = U(r, vec2(sdRBox(p - vec3(-0.22, 0.94, 0.30), vec3(0.77, 0.79, 0.048), 0.026), M_WHITE));

  for (int i = 0; i < 3; i++) {
    float y = 1.12 - float(i) * 0.26;
    float width = i == 2 ? 0.43 : 0.54;
    float line = sdRBox(p - vec3(-0.82 + width, y, 0.35), vec3(width, 0.037, 0.014), 0.01);
    r = U(r, vec2(line, i == 1 ? M_APRICOT : M_PALE));
  }
  r = U(r, vec2(sdRBox(p - vec3(-0.23, 0.08, 0.18), vec3(0.91, 0.08, 0.32), 0.044), M_COBALT));
  return r;
}

vec2 loose(vec3 p) {
  // 살구색 줄에 포개지는 돋보기.
  vec3 q = p - vec3(0.43, 0.88, 0.56);
  float rim = sdTorusZ(q, 0.36, 0.055);
  float handle = sdCapsule(q, vec3(0.25, -0.24, 0.0), vec3(0.58, -0.58, 0.0), 0.065);
  return vec2(min(rim, handle), M_MEDIUM);
}

float cutSDF(vec3 p) { return 1e9; }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
