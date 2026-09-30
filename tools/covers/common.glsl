#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uRes;      // 전체 화면 크기
uniform vec2 uTile;     // 이 타일의 시작 픽셀
uniform float uSeed;

// ───────── 팔레트 (받은 7장과 같은 값) ─────────
const vec3 BG      = vec3(0.961, 0.965, 0.973); // #f5f6f8
const vec3 WHITE   = vec3(1.0);
const vec3 PALE    = vec3(0.898, 0.937, 1.0);   // #e5efff
const vec3 COBALT  = vec3(0.106, 0.392, 0.855); // #1b64da
const vec3 MEDIUM  = vec3(0.514, 0.663, 0.914); // #83a9e9
const vec3 APRICOT = vec3(0.925, 0.647, 0.455); // #eca574
const vec3 GRAY    = vec3(0.86, 0.87, 0.89);    // 낡은 종이
const vec3 INK     = vec3(0.184, 0.212, 0.263); // #2f3643 서버 몸통
const vec3 RED     = vec3(0.933, 0.353, 0.310); // #ee5a4f 경고
const vec3 MINT    = vec3(0.494, 0.812, 0.690); // #7ecfb0 케이블
const vec3 SLAB    = vec3(0.925, 0.933, 0.949); // 받침판

// 재질 번호
const float M_GROUND = 0.0, M_WHITE = 1.0, M_PALE = 2.0, M_COBALT = 3.0, M_MEDIUM = 4.0, M_APRICOT = 5.0, M_GRAY = 6.0, M_INK = 7.0, M_RED = 8.0, M_MINT = 9.0, M_SLAB = 10.0;

// ───────── SDF 기본형 ─────────
float sdRBox(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r; }
float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
// y축 원기둥, h = 반높이
float sdCylY(vec3 p, float h, float r) { vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }
// x축 원기둥
float sdCylX(vec3 p, float h, float r) { vec2 d = abs(vec2(length(p.yz), p.x)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }
// 둥근 x축 원기둥(모서리 r2)
float sdRCylX(vec3 p, float h, float r, float r2) { vec2 d = abs(vec2(length(p.yz), p.x)) - vec2(r - r2, h - r2); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r2; }
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) { vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
float sdTorusZ(vec3 p, float R, float r) { vec2 q = vec2(length(p.xy) - R, p.z); return length(q) - r; }
float sdTorusX(vec3 p, float R, float r) { vec2 q = vec2(length(p.yz) - R, p.x); return length(q) - r; }
float opSub(float a, float b) { return max(a, -b); }
float opSmin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
vec2 U(vec2 a, vec2 b) { return a.x < b.x ? a : b; }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
vec3 rotX(vec3 p, float a) { p.yz = rot(a) * p.yz; return p; }
vec3 rotY(vec3 p, float a) { p.xz = rot(a) * p.xz; return p; }
vec3 rotZ(vec3 p, float a) { p.xy = rot(a) * p.xy; return p; }

float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) { vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z); }

// 장면이 정의한다: vec2 scene(vec3 p) → (거리, 재질)
vec2 solid(vec3 p);
vec2 loose(vec3 p);
float cutSDF(vec3 p);       // 잘라내는 영역(안이 음수)
vec3 cutStripeDir();        // 단면에 보이는 결의 방향
float glassSDF(vec3 p) { return 1e9; }
vec2 scene(vec3 p) { vec2 s = solid(p); s.x = max(s.x, -cutSDF(p)); return U(s, loose(p)); }

vec2 map(vec3 p) { return U(vec2(p.y, M_GROUND), scene(p)); }

vec3 calcNormal(vec3 p) { const vec2 e = vec2(0.0008, 0.0);
  return normalize(vec3(map(p + e.xyy).x - map(p - e.xyy).x, map(p + e.yxy).x - map(p - e.yxy).x, map(p + e.yyx).x - map(p - e.yyx).x)); }

float softShadow(vec3 ro, vec3 rd, float k) { float res = 1.0, t = 0.02;
  for (int i = 0; i < 48; i++) { float h = map(ro + rd * t).x; if (h < 0.0005) return 0.0; res = min(res, k * h / t); t += clamp(h, 0.01, 0.2); if (t > 8.0) break; }
  return clamp(res, 0.0, 1.0); }

float calcAO(vec3 p, vec3 n) { float occ = 0.0, sca = 1.0;
  for (int i = 0; i < 5; i++) { float h = 0.02 + 0.10 * float(i); float d = map(p + h * n).x; occ += (h - d) * sca; sca *= 0.8; }
  return clamp(1.0 - 1.6 * occ, 0.0, 1.0); }

vec3 albedo(float m, vec3 p, vec3 n) {
  vec3 c = m == M_WHITE ? WHITE : m == M_PALE ? PALE : m == M_COBALT ? COBALT : m == M_MEDIUM ? MEDIUM : m == M_APRICOT ? APRICOT : m == M_GRAY ? GRAY : m == M_INK ? INK : m == M_RED ? RED : m == M_MINT ? MINT : m == M_SLAB ? SLAB : BG;
  // 아주 옅은 종이 결
  float g = noise(p * 90.0) * 0.5 + noise(p * 220.0) * 0.5;
  float grain = noise(vec3(p.x * 400.0, p.y * 40.0, p.z * 400.0));
  c *= (0.982 + 0.03 * g + 0.012 * grain);
  // 절단면: 원래 색을 밝게 하고 켜켜이 쌓인 결을 보인다
  float cd = cutSDF(p);
  if (abs(cd) < 0.014 && solid(p).x < 0.014) {
    float lay = 0.5 + 0.5 * sin(dot(p, cutStripeDir()) * 170.0);
    float amp = (m == M_WHITE) ? 0.07 : 0.02;
    vec3 lc = mix(c, vec3(1.0), (m == M_WHITE) ? 0.0 : 0.74);
    return lc * (1.0 - amp + amp * lay);
  }
  // 잘린 단면(흰 심): 색종이·먹지의 둥근 모서리에서만
  if (m != M_WHITE && m != M_SLAB) {
    const float e = 0.006;
    float d0 = map(p).x;
    float lap = map(p + vec3(e, 0, 0)).x + map(p - vec3(e, 0, 0)).x + map(p + vec3(0, e, 0)).x + map(p - vec3(0, e, 0)).x + map(p + vec3(0, 0, e)).x + map(p - vec3(0, 0, e)).x - 6.0 * d0;
    float curv = lap / (e * e);
    float edge = smoothstep(18.0, 45.0, curv);
    c = mix(c, vec3(0.97, 0.97, 0.975), edge * 0.9);
  }
  return c;
}

uniform vec3 uCamPos; uniform vec3 uCamTarget; uniform float uFov; uniform int uMode;

vec3 render(vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * uRes) / uRes.y;
  vec3 ro = uCamPos, ta = uCamTarget;
  vec3 ww = normalize(ta - ro), uu = normalize(cross(ww, vec3(0, 1, 0))), vv = cross(uu, ww);
  vec3 rd = normalize(uv.x * uu + uv.y * vv + uFov * ww);
  // 행진
  float t = 0.0; vec2 h = vec2(0.0); bool hit = false;
  for (int i = 0; i < 160; i++) { vec3 p = ro + rd * t; h = map(p); if (h.x < 0.0006 * t) { hit = true; break; } t += h.x * 0.9; if (t > 30.0) break; }
  vec3 base;
  if (!hit) { base = BG; t = 30.0; } else {
  vec3 p = ro + rd * t; vec3 n = calcNormal(p);
  vec3 L = normalize(vec3(-0.55, 0.95, 0.45));   // 왼쪽 위에서
  float dif = clamp(dot(n, L), 0.0, 1.0);
  float sh = softShadow(p + n * 0.003, L, 14.0);
  float ao = calcAO(p, n);
  float sky = 0.5 + 0.5 * n.y;
  if (h.y == M_GROUND) {
    // 바닥은 배경색 그대로, 그림자·접촉 어둠만 아주 옅게(짧고 부드러운 접촉 그림자)
    float dark = (1.0 - sh) * 0.16 + (1.0 - ao) * 0.22;
    base = mix(BG, BG * vec3(0.905, 0.915, 0.94), clamp(dark, 0.0, 1.0));
  } else {
  vec3 alb = albedo(h.y, p, n);
  // 밝고 부드러운 스튜디오 조명: 그늘도 어둡지 않게
  float amb = 0.70 + 0.10 * sky;
  vec3 col = alb * (amb * (0.75 + 0.25 * ao) + 0.30 * dif * mix(0.45, 1.0, sh));
  // 살짝 프레넬(종이 가장자리 밝음)
  float fre = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 4.0);
  col += fre * 0.04;
  base = clamp(col, 0.0, 1.0);
  }
  }
  // 유리 층
  float tg = 0.0; bool hg = false;
  for (int i = 0; i < 120; i++) { float d = glassSDF(ro + rd * tg); if (d < 0.0008 * tg) { hg = true; break; } tg += d * 0.9; if (tg > t) break; }
  if (hg && tg < t) {
    vec3 gp = ro + rd * tg; const vec2 e = vec2(0.0008, 0.0);
    vec3 gn = normalize(vec3(glassSDF(gp + e.xyy) - glassSDF(gp - e.xyy), glassSDF(gp + e.yxy) - glassSDF(gp - e.yxy), glassSDF(gp + e.yyx) - glassSDF(gp - e.yyx)));
    vec3 L = normalize(vec3(-0.55, 0.95, 0.45));
    float fre = pow(1.0 - clamp(dot(gn, -rd), 0.0, 1.0), 3.0);
    float spec = pow(clamp(dot(reflect(-L, gn), -rd), 0.0, 1.0), 40.0);
    vec3 tint = mix(WHITE, PALE, 0.5);
    float a = 0.28 + 0.45 * fre;
    base = mix(base, tint, a) + spec * 0.35 + fre * 0.06;
  }
  return clamp(base, 0.0, 1.0);
}

vec4 gbuf(vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * uRes) / uRes.y;
  vec3 ro = uCamPos, ta = uCamTarget;
  vec3 ww = normalize(ta - ro), uu = normalize(cross(ww, vec3(0, 1, 0))), vv = cross(uu, ww);
  vec3 rd = normalize(uv.x * uu + uv.y * vv + uFov * ww);
  float t = 0.0; vec2 h = vec2(0.0); bool hit = false;
  for (int i = 0; i < 160; i++) { vec3 p = ro + rd * t; h = map(p); if (h.x < 0.0006 * t) { hit = true; break; } t += h.x * 0.9; if (t > 30.0) break; }
  if (!hit) return uMode == 1 ? vec4(0.5, 0.5, 0.5, 1.0) : uMode == 3 ? vec4(1.0, 1.0, 0.0, 1.0) : vec4(1.0, 1.0, 0.0, 1.0);
  vec3 p = ro + rd * t; vec3 n = calcNormal(p);
  if (uMode == 1) return vec4(n * 0.5 + 0.5, 1.0);
  float d = clamp(t / 30.0, 0.0, 1.0); float hi = floor(d * 255.0) / 255.0; float lo = fract(d * 255.0);
  float cd = cutSDF(p); float cut = (abs(cd) < 0.014 && solid(p).x < 0.014) ? 1.0 : 0.0;
  if (uMode == 3) { float sh = softShadow(p + n * 0.003, normalize(vec3(-0.55, 0.95, 0.45)), 14.0); float ao = calcAO(p, n); float ph = fract(dot(p, cutStripeDir()) * 170.0 / 6.2832); return vec4(sh, ao, ph, 1.0); }
  return vec4(hi, lo, (h.y * 16.0 + cut * 8.0) / 255.0, 1.0);
}
void main() {
  vec2 fc = gl_FragCoord.xy; // 뷰포트 오프셋이 이미 창 좌표에 들어 있다
  if (uMode > 0) { outColor = gbuf(fc); return; }
  // 2×2 초과 표본
  vec3 c = vec3(0.0);
  for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) c += render(fc + vec2(float(i), float(j)) * 0.5 - 0.25);
  c *= 0.25;
  outColor = vec4(pow(c, vec3(1.0 / 1.0)), 1.0);
}
