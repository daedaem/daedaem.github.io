// 묶음에서 꺼낸 키를 강조한 정물. 실제 인증서나 키 파일은 사용하지 않는다.
vec2 solid(vec3 p) {
  vec3 q = p - vec3(-0.61, 0.61, 0.0);
  float shell = sdRBox(q, vec3(0.61, 0.61, 0.36), 0.047);
  float slot = sdRBox(q - vec3(0.0, 0.31, 0.0), vec3(0.52, 0.42, 0.26), 0.025);
  vec2 r = vec2(opSub(shell, slot), M_COBALT);
  r = U(r, vec2(sdRBox(q - vec3(0.0, 0.09, 0.353), vec3(0.49, 0.20, 0.024), 0.033), M_WHITE));
  r = U(r, vec2(sdRBox(p - vec3(-0.63, 1.14, -0.07), vec3(0.43, 0.51, 0.075), 0.035), M_WHITE));
  r = U(r, vec2(sdRBox(p - vec3(-0.63, 1.41, 0.01), vec3(0.30, 0.045, 0.014), 0.012), M_MEDIUM));
  return r;
}

vec2 loose(vec3 p) {
  // 원형 머리와 두 개의 이가 있는 키.
  vec3 q = rotY(p - vec3(0.67, 1.07, 0.42), -0.33);
  vec3 head = rotX(q, 1.5707963);
  float ring = opSub(sdCylY(head, 0.075, 0.38), sdCylY(head, 0.14, 0.19));
  float stem = sdRBox(q - vec3(0.0, -0.58, 0.0), vec3(0.112, 0.37, 0.07), 0.026);
  float teeth = min(
    sdRBox(q - vec3(0.14, -0.67, 0.0), vec3(0.13, 0.073, 0.07), 0.018),
    sdRBox(q - vec3(0.11, -0.88, 0.0), vec3(0.10, 0.069, 0.07), 0.018)
  );
  vec2 r = vec2(min(ring, min(stem, teeth)), M_APRICOT);
  return U(r, vec2(sdRBox(p - vec3(0.69, 0.06, 0.42), vec3(0.32, 0.06, 0.23), 0.038), M_PALE));
}

float cutSDF(vec3 p) { return 1e9; }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
