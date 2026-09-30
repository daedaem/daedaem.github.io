// 디스크 99%: 코발트 통을 잘라 보니 종이가 턱밑까지 쌓였는데, 맨 위 한 켜만 살구색(지워도 되는 것).
vec2 solid(vec3 p) {
  vec3 c = p - vec3(0.0, 0.60, 0.0);
  float wall = opSub(sdCylY(c, 0.60, 0.75), sdCylY(c - vec3(0.0, 0.04, 0.0), 0.60, 0.70));
  vec2 r = vec2(wall, M_COBALT);
  float st = sdCylY(c - vec3(0.0, -0.005, 0.0), 0.575, 0.70 + 0.004 * sin(p.y * 170.0));
  r = U(r, vec2(st, p.y > 1.03 ? M_APRICOT : M_WHITE));
  return r;
}
vec2 loose(vec3 p) { return vec2(1e9, M_WHITE); }
float cutSDF(vec3 p) { return max(0.0 - p.x, 0.0 - p.z); }
vec3 cutStripeDir() { return vec3(0.0, 1.0, 0.0); }
