# 사례 표지 3편 보완 기록

2026-09-11. 사용자가 표지가 글의 주제와 판단을 충분히 전달하는지 물었고, 평가 후 필요한 변경을 승인했다. NULL·주소 검색·배치 추적 세 표지를 교체하고 다른 네 표지는 유지했다. 초기 제작은 [v1 기록](./post-cover-art.md)에 있다.

## 제작 방식과 선택 이유

내장 이미지 생성 도구(`image_gen`)의 편집 모드를 세 번 병렬 호출했다. 각 호출에는 해당 공개 v1 이미지 한 장과 일반화된 개념 설명만 전달했다. 하위 에이전트 한 개가 이미지 작업만 맡았고, 상위 에이전트가 원본 세 장을 직접 확인하고 사이트에 연결했다. 추가 후보나 재시도, 외부 API/CLI 모드는 사용하지 않았다.

- NULL: `NULL`과 `A`가 한 레코드로 합쳐지던 구도를 없애고 `JAVA`·`SQL`과 하나의 `ONE CHECK`로 변경 판정 지점의 단일화를 표현한다. NULL과 실제 값이 같다고 주장하지 않는다. 별개의 항목 소유권 원인은 이 표지의 범위가 아니다.

  체크 표시는 판정 지점을 하나로 모았다는 표현이며, NULL이 검사를 통과하거나 참으로 평가된다는 의미가 아니다. 그림만으로 이 차이가 분명하지 않을 수 있으므로 제목과 본문의 판단 과정을 함께 읽어야 한다.

- 주소: 일반적인 검색 범위 그림 대신 별도로 놓인 `LOCAL COPY`와 외부 `ADDRESS API` 검색 창을 구분한다. 선택한 결과에서 `FORM` 입력창으로 돌아오는 화살표 방향을 확인했다. 서버 API 호출이나 자동 대체 경로, DB 튜닝과 외부 API를 섞은 개선 수치는 그리지 않았다.
- 배치: `STOP` 명령의 끊긴 점선과 `RUNNING` 프로세스에서 `UPDATE`로 향하는 연결을 구분한다. 종료 명령을 실행해도 프로세스가 실제 종료된 것은 아닐 수 있다는 모순에 초점을 맞춘다.

표지는 여전히 제목과 요약을 돕는 개념 일러스트이며 실행 흐름 전체를 설명하는 정확한 구성도가 아니다. NULL 그림의 화살표는 JAVA 쪽에서 시작하고 SQL 타일은 떨어져 있어, 두 비교 지점의 통합 전후를 그림만으로 완전히 설명하지는 않는다. 주소의 로컬 사본은 분리돼 있지만 유지관리 책임의 변화는 제목과 본문을 함께 읽어야 한다. 실제 독자 이해도 조사나 채용 효과를 검증한 것은 아니다.

## 최종 저장 파일

원본은 1536×1024 PNG, 사이트용은 자르지 않은 WebP 1440×960·768×512·320×213 세 크기다. 새 아홉 파일 합계는 157,878바이트이며 320px 세 개 합계는 14,536바이트다. 원본 비율 3:2, 첫 이미지 우선 로드와 나머지 지연 로드, 빈 대체 텍스트는 유지한다. 본문·다른 메타데이터·날짜·발행 상태·URL·추천 순서·레이아웃·브랜드·소셜 공유 이미지는 바꾸지 않았다.

- [중복된 비교를 하나의 변경 판정으로](../public/uploads/post-covers/null-and-empty-string-sync-failure-v2.webp) — `public/uploads/post-covers/null-and-empty-string-sync-failure-v2.webp`, `null-and-empty-string-sync-failure-v2-768.webp`, `null-and-empty-string-sync-failure-v2-320.webp`
- [로컬 주소 보관에서 외부 팝업 선택으로](../public/uploads/post-covers/address-search-9s-to-100ms-v2.webp) — `public/uploads/post-covers/address-search-9s-to-100ms-v2.webp`, `address-search-9s-to-100ms-v2-768.webp`, `address-search-9s-to-100ms-v2-320.webp`
- [종료 명령과 살아 있는 프로세스의 차이](../public/uploads/post-covers/phantom-batch-after-was-migration-v2.webp) — `public/uploads/post-covers/phantom-batch-after-was-migration-v2.webp`, `phantom-batch-after-was-migration-v2-768.webp`, `phantom-batch-after-was-migration-v2-320.webp`

기존 v1 파일은 덮어쓰거나 삭제하지 않았다. 세 글의 `coverImage`와 반응형 파일 목록만 v2로 연결했다. 작은 크기에 옛 버전이 섞이는 것을 막도록 버전별 파일 연결 검사도 보강했다.

## 검수 범위

원본 세 장과 압축된 320px 세 장을 직접 확인하고, 실제 파일 크기·포맷·치수 및 생성 HTML의 연결을 검사했다. 브라우저 화면·88px 실렌더링·스크린리더·CMS 왕복·전체 콘텐츠 감사나 새 Claude/Notion 검토는 이번 범위가 아니다. 회사 자료나 비공개 원본은 열거나 전달하지 않았다. 실행 검증은 [사이트 검증 기록](./site-verification.md)에 남겼다.

## 실제 사용한 편집 프롬프트 전문

아래는 각 호출의 실제 프롬프트다. 요구한 구도와 세부 배치가 모두 그대로 구현됐다는 뜻은 아니다. 이미지별 입력은 해당 글의 기존 공개 v1 표지 한 장이었다.

### 1. 중복된 비교를 하나의 변경 판정으로

`null-and-empty-string-sync-failure`

```text
Use case: precise-object-edit
Asset type: raster editorial cover illustration for a Korean backend-development technical blog.
Input image: Image 1 is the only edit target. Preserve its navy background palette, ivory/apricot accents, tactile cut-paper material, restrained grain, shallow relief and directional soft shadows. Replace the entire misleading foreground composition; remove the old NULL/A data ribbons, gate and joined record.
Canvas: one finished landscape image, exactly 1536 x 1024 pixels, aspect ratio 3:2. Generous safe margins around every object and shadow; strong simple silhouette, large short labels useful at 500px feature-card width. At 88px only the subject silhouette needs to remain recognizable.
New scene: three physical paper decision modules. Two distinct smaller comparison-rule tiles, clearly labeled "JAVA" and "SQL", sit loosely misaligned in a secondary upper/rear zone, visually receding as retired duplicate decision locations. A SINGLE broad, simple apricot transition arrow leads from the pair as a group toward ONE dominant ivory comparison/decision tile in the foreground labeled "ONE CHECK". On this same dominant tile put "NULL" as a compact but legible contextual label; NULL must not be a separate data tile. One short outgoing signal ending in one simple check symbol leaves the dominant tile. Keep the scene spare and beautifully physical, with the large ONE CHECK tile clearly outweighing the two smaller old rule tiles.
Meaning: duplicated change detection in Java and SQL gave inconsistent outcomes for null versus a real value; it was centralized in one application method. Show competing checks becoming one check. The arrow represents replacement of decision locations, not data flow, and must not branch from two input streams.
Style: editorial shallow-relief cut-paper objects, warm ivory and apricot on the original navy, with light-blue only as a restrained supporting paper accent. Quiet directional soft shadow, crisp paper edges, minimal grain.
Text (verbatim, only these four labels, each once): "JAVA", "SQL", "ONE CHECK", "NULL". Large clean high-contrast uppercase typography. No other letters, text or numerals.
Constraints: no literal A tile; no two data values entering a funnel; no merged data record; no equation or equals sign; no two-source-data streams; no extra decision outputs; do not suggest that NULL equals a real value or that merely replacing equals was the solution. No need to depict a separate ownership cause.
Avoid: comprehensive technical architecture diagrams, dense flowcharts, webpage screenshots, surrounding page chrome, real names, hosts, addresses, IPs, identifiers, product logos, numbers or benchmarks, watermarks, invented achievements, decorative props. Produce exactly one edited illustration, no variants.
```

### 2. 로컬 주소 보관에서 외부 팝업 선택으로

`address-search-9s-to-100ms`

```text
Use case: precise-object-edit
Asset type: raster editorial cover illustration for a Korean backend-development technical blog.
Input image: Image 1 is the only edit target. Preserve its apricot background, navy and ivory paper palette, tactile material feel, restrained grain, shallow relief and directional soft shadows. Replace the entire misleading foreground composition; remove the old data grid, query labels and oversized magnifier.
Canvas: one finished landscape image, exactly 1536 x 1024 pixels, aspect ratio 3:2. Generous safe margins around every object and shadow; strong simple silhouette, large short labels useful at 500px feature-card width. At 88px only the subject silhouette needs to remain recognizable.
New scene: three main object groups. A small faded stack of local paper data cards labeled "LOCAL COPY" sits aside in the secondary rear zone, disconnected and visually retired but intact. Foreground: one clean ivory browser FORM card labeled "FORM", with one broad visibly empty input field. A distinct overlapping navy provider search POPUP card bears the label "ADDRESS API", a large simple location pin, and exactly three minimal result strokes, without any actual addresses. Highlight one selected result with an apricot/ivory paper accent. Draw ONE unmistakable return arrow: its tail starts at that selected result in the navy popup, and its single arrowhead lands visibly INSIDE the broad input field on the ivory FORM card. Keep the arrow and its endpoint unobscured by the overlap. It must point FROM popup selection INTO form input, never the reverse. Use the two overlapping cards and the small set-aside stack as the whole composition.
Meaning: after query tuning, the application chose an external provider's address-search popup rather than continuing to maintain a local address dataset. The provider supplies the search/results UI; the selected address returns into the application input through a callback. The selected-result return arrow is the only connection.
Style: spare editorial shallow-relief cut-paper objects, original apricot backdrop, navy popup, ivory form, light-blue only as a restrained supporting paper accent. Crisp layered paper edges, quiet directional soft shadows, restrained grain. These are illustrative physical browser cards, not a screenshot or surrounding page layout; use no excessive UI controls.
Text (verbatim, only these three labels, each once): "LOCAL COPY", "FORM", "ADDRESS API". Large clean high-contrast uppercase typography. Do not write POPUP, callback, query code or addresses. No other letters, text or numerals.
Constraints: no arrow between local copy and popup/API; no server-side API-call depiction; no database synchronization to the external API; no entire-database deletion symbol; no timers, speed claims, numbers, benchmarks, retry loops, caches, fallback or backup routes, or claims of guaranteed availability. The story is choosing provider search and ceasing local-copy maintenance, not generic faster search.
Avoid: comprehensive technical architecture diagrams, dense flowcharts, webpage screenshots, surrounding page chrome, real names, hosts, addresses, IPs, identifiers, product logos, watermarks, invented achievements, decorative props. Produce exactly one edited illustration, no variants.
```

### 3. 종료 명령과 살아 있는 프로세스의 차이

`phantom-batch-after-was-migration`

```text
Use case: precise-object-edit
Asset type: raster editorial cover illustration for a Korean backend-development technical blog.
Input image: Image 1 is the only edit target. Preserve its charcoal/navy background, ivory/apricot/light-blue paper palette, tactile material feel, restrained grain, shallow relief and directional soft shadows. Replace the entire misleading foreground composition; remove the oversized central magnifier, TRACE label and generic rack-to-rack trace.
Canvas: one finished landscape image, exactly 1536 x 1024 pixels, aspect ratio 3:2. Generous safe margins around every object and shadow; strong simple silhouette, large short labels useful at 500px feature-card width. At 88px only the subject silhouette needs to remain recognizable.
New scene: three main objects. At upper/left a small pale command tile with a clear stop-square icon is labeled "STOP". A short dotted command path leaves it toward the center but ENDS SHORT of the large process tile, leaving an unmistakable open gap; do not show a successful command arrival. The dominant center object is ONE still-active navy process tile labeled "RUNNING" in large ivory text, with a vivid apricot heartbeat/pulse. A subtle thin ivory magnifying ring reveals part of the running tile without covering the label or pulse; it is a small secondary inspection cue, not the dominant subject and not an oversized central magnifier. A SINGLE clear solid apricot arrow points FROM the running process TO a small ivory paper data-stack/cylinder on the right labeled "UPDATE". The arrowhead must visibly face the data stack and show continuing writes. Keep the RUNNING process dominant, STOP smaller and separate, and UPDATE smaller but clearly connected.
Meaning: a stop script was executed, but the old process stayed alive and kept updating data. Observing database updates led to identifying the surviving process. Make "STOP command, RUNNING process" visually unmistakable: command execution does not prove process termination.
Style: clean, spare physical-paper editorial scene, original charcoal/navy backdrop, ivory and light-blue paper accents, apricot activity pulse and outgoing write arrow, restrained grain and directional soft shadows.
Text (verbatim, only these three labels, each once): "STOP", "RUNNING", "UPDATE". Large clean high-contrast uppercase typography. No other letters, text or numerals.
Constraints: the dotted STOP command path must stop before reaching the active process; only the process-to-data path is solid and connected. No successful-termination checkmark, completed process, dead process, pair of active server racks, green security shield or security-incident cues. No real server topology or addresses. Do not let a generic magnifier hide the contradiction or the continuing writes.
Avoid: comprehensive technical architecture diagrams, dense flowcharts, webpage screenshots, surrounding page chrome, real names, hosts, addresses, IPs, identifiers, product logos, numbers or benchmarks, watermarks, invented achievements, decorative props. Produce exactly one edited illustration, no variants.
```
