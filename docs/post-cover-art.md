# 사례 글 표지 이미지 제작 기록

2026-09-11. 사용자의 이미지 생성 요청으로 공개 사례 7편의 주제를 읽고 만든 개념 표지다. 내장 이미지 생성 도구(`image_gen`)를 사용했으며, 이미지별 한 번씩 총 7회 생성했다. 재생성·변형 후보·외부 이미지 검색은 사용하지 않았다.

## 사용 범위

홈·글 목록·카테고리에서 같은 글의 표지를 재사용한다. 제목과 본문을 대체하는 설명 자료나 실제 시스템 구성도가 아닌, 기술 원리를 떠올리는 장식용 개념 이미지다. 상세 본문과 소셜 공유 이미지는 바꾸지 않았다.

- 회사 식별 정보·원본 화면·실측 구성·보안 사고·미구현 기능을 이미지에 넣지 않았다. 공개 글에서 일반화된 기술 원리만 프롬프트로 전달했다.
- NULL 표지는 두 값이 같다는 뜻이 아니다. 비교를 수행하는 지점을 하나로 모으는 개념이다. 주소 표지는 검색 범위 차이만 표현하며 API 성능 수치나 미구현 자동 대체 경로를 그리지 않는다.
- 인증 표지는 일반적인 단계별 권한 부여만 표현한다. 정수 표지는 실제 선택한 int→long의 범위 확대이며 무한 범위·부호 반전 공식·드라이버 원인을 주장하지 않는다. 블록의 개수·색상 비율은 실제 수치를 나타내지 않는다.
- 첫 큰 표지의 기존 1.26 비율로 자르면 일부 끝부분이 잘릴 수 있어, 생성 표지는 원본 3:2 비율을 그대로 표시한다. 원본의 그림이나 문자를 후처리로 고치거나 추가하지 않았다.

## 저장 파일과 최적화

생성 원본은 1536×1024 PNG였다. 웹에 사용하는 최종 파일은 아래 경로의 WebP이며 1440×960, 768×512, 320×213 세 크기로 압축했다. 파일명 뒤의 `-320`, `-768`이 작은 버전이다. 크기별 파일은 `src/data/post-cover-images.json`에서 관리한다. 이미지 내용은 자르지 않았으며 메타데이터를 포함시키지 않았다. 첫 추천 이미지만 우선 로드하고 나머지는 지연 로드한다. CMS에 나중에 올리는 일반 이미지는 등록되지 않은 파생 파일이 있다고 가정하지 않는다.

- [서로 다른 비교 경로를 한 판단 지점으로 모음](../public/uploads/post-covers/null-and-empty-string-sync-failure-v1.webp) — `public/uploads/post-covers/null-and-empty-string-sync-failure-v1.webp`
- [전체 탐색과 전방 일치의 범위 차이](../public/uploads/post-covers/address-search-9s-to-100ms-v1.webp) — `public/uploads/post-covers/address-search-9s-to-100ms-v1.webp`
- [오래된 의존성을 제거하고 기존 기능을 다시 연결](../public/uploads/post-covers/retire-flash-module-by-integration-v1.webp) — `public/uploads/post-covers/retire-flash-module-by-integration-v1.webp`
- [외부 할당과 내부 여유 공간을 구분](../public/uploads/post-covers/disk-99-percent-check-before-expanding-v1.webp) — `public/uploads/post-covers/disk-99-percent-check-before-expanding-v1.webp`
- [세 인증 관문을 모두 지난 뒤 권한을 부여](../public/uploads/post-covers/staged-auth-and-password-migration-v1.webp) — `public/uploads/post-covers/staged-auth-and-password-migration-v1.webp`
- [값의 범위에 맞춰 int에서 long으로 확대](../public/uploads/post-covers/integer-overflow-negative-amount-v1.webp) — `public/uploads/post-covers/integer-overflow-negative-amount-v1.webp`
- [갱신 흔적에서 살아 있는 프로세스를 추적](../public/uploads/post-covers/phantom-batch-after-was-migration-v1.webp) — `public/uploads/post-covers/phantom-batch-after-was-migration-v1.webp`

## 최종 프롬프트 전문

아래는 각 생성 요청에 실제로 사용한 문구다. 이미지의 구성과 안전 여백은 출력 후 별도로 검토했으며, 프롬프트에 적힌 모든 세부 조건의 달성을 보장하는 기록은 아니다. 원본을 시각적으로 확인하고 생성 표지는 원본 비율로 유지했다. 실제 브라우저의 88px 렌더링 검수는 이번 생성 기록에 포함하지 않는다.

### 1. 서로 다른 비교 경로를 한 판단 지점으로 모음

`null-and-empty-string-sync-failure`

```text
Use case: stylized-concept
Asset type: one finished raster editorial cover illustration for an established Korean technical blog, part of a cohesive seven-image set.
Style/medium: elegant technical editorial art; sophisticated screen-print and precision cut-paper with shallow relief geometry, crisp large silhouettes, subtle tactile matte paper grain, restrained soft directional light and small soft shadows. Clean, precise, calm and thoughtful.
Color palette: navy #294970 and #324e6e, warm ivory #fcfbf8, light blue #dae5ef, muted apricot #f2c9a8, charcoal #30343d. Use only this restrained palette and natural material shading.
Composition/framing: landscape 3:2, approximately 1536x1024 pixels. One compact central conceptual motif occupies the middle 70 percent of the canvas; maintain 15 percent clear outer safety margins, including all labels and endpoints. The important silhouette must survive a centered 1.26:1 crop and remain recognizable at 88 pixels wide. Sparse composition, large simple forms, clear figure-ground separation.
Constraints: symbolic technical concept only, never a depiction of a real system. No company names, vendor names, logos, company-specific architecture, physical server racks, server counts, addresses, IPs, database names, table names, screenshots, logs or security-incident depictions. No stock photography, robots, glossy 3D cloud clipart, cyber neon, layered gradients, random code, browser frames, UI mockups, titles, Korean text, explanations, signatures or watermarks. No text except the exact short labels allowed below. Generate exactly one image, not a collage, contact sheet or set of variants.
Scene/backdrop: solid matte navy #294970.
Primary request: illustrate consistent comparison decisions through one shared decision boundary.
Subject: two separate translucent ivory and light-blue paper input tiles, one marked "NULL" and the other marked "A", travel on two simple restrained converging paths toward one single well-defined comparison aperture at the center. The aperture is a large clean ivory paper frame, with one small apricot registration signal. Beyond it, the two inputs form one ordered paired record: a single joined card with two visibly separate cells, preserving the two distinct input identities. Keep the output cells unlettered and use their distinct ivory/light-blue appearance to connect them to the inputs.
Composition details: the two input paths converge only at this one central aperture, and continue as a single orderly output path to the paired record. The gate is a generic conceptual decision boundary, never application architecture.
Text (verbatim): "NULL" and "A", exactly once each, printed clearly on the two input tiles in clean bold monospaced type. No other text or symbols that express comparison results.
Accuracy constraints: do not imply that NULL equals A. No equals sign, checkmark, TRUE, UNKNOWN, metrics or merged indistinguishable value. No second comparison gate, duplicated unresolved fork, ownership diagram or network topology. The illustration's sole focus is consistency of the comparison boundary.
```

### 2. 전체 탐색과 전방 일치의 범위 차이

`address-search-9s-to-100ms`

```text
Use case: stylized-concept
Asset type: one finished raster editorial cover illustration for an established Korean technical blog, part of a cohesive seven-image set.
Style/medium: elegant technical editorial art; sophisticated screen-print and precision cut-paper with shallow relief geometry, crisp large silhouettes, subtle tactile matte paper grain, restrained soft directional light and small soft shadows. Clean, precise, calm and thoughtful.
Color palette: navy #294970 and #324e6e, warm ivory #fcfbf8, light blue #dae5ef, muted apricot #f2c9a8, charcoal #30343d. Use only this restrained palette and natural material shading.
Composition/framing: landscape 3:2, approximately 1536x1024 pixels. One compact central conceptual motif occupies the middle 70 percent of the canvas; maintain 15 percent clear outer safety margins, including all labels and endpoints. The important silhouette must survive a centered 1.26:1 crop and remain recognizable at 88 pixels wide. Sparse composition, large simple forms, clear figure-ground separation.
Constraints: symbolic technical concept only, never a depiction of a real system. No company names, vendor names, logos, company-specific architecture, physical server racks, server counts, addresses, IPs, database names, table names, screenshots, logs or security-incident depictions. No stock photography, robots, glossy 3D cloud clipart, cyber neon, layered gradients, random code, browser frames, UI mockups, titles, Korean text, explanations, signatures or watermarks. No text except the exact short labels allowed below. Generate exactly one image, not a collage, contact sheet or set of variants.
Scene/backdrop: solid muted apricot #f2c9a8.
Primary request: illustrate narrowing a broad record scan into a small ordered search range.
Subject: a broad, orderly field of navy record cards, represented as a small clean stack/grid of plain paper slips without invented writing. One large precise ivory search aperture frames a narrow contiguous ordered band of these records, making that band warm ivory against the wider navy field. Make the aperture and the strong light band the dominant silhouette; avoid a crowded infographic.
Composition details: place two clearly separate small typographic chips near their corresponding scope: "%q%" belongs to the broader navy card field, and "q%" belongs to the narrow ivory band. Keep both chips distinct, comfortably inside the safe margins and large enough to read in the full image.
Text (verbatim): "%q%" and "q%", exactly once each, clean bold monospaced type, including the exact percent characters and lowercase q. No other text.
Accuracy constraints: a leading wildcard prevents efficient prefix-range narrowing; communicate scope only, without a performance chart, bars, stopwatch, speed numbers, numeric comparisons, guaranteed speedup, or claim about data freshness. No API fallback, API icon, server network diagram, new infrastructure or ownership workflow. This is a symbolic search-scope illustration.
```

### 3. 오래된 의존성을 제거하고 기존 기능을 다시 연결

`retire-flash-module-by-integration`

```text
Use case: stylized-concept
Asset type: one finished raster editorial cover illustration for an established Korean technical blog, part of a cohesive seven-image set.
Style/medium: elegant technical editorial art; sophisticated screen-print and precision cut-paper with shallow relief geometry, crisp large silhouettes, subtle tactile matte paper grain, restrained soft directional light and small soft shadows. Clean, precise, calm and thoughtful.
Color palette: navy #294970 and #324e6e, warm ivory #fcfbf8, light blue #dae5ef, muted apricot #f2c9a8, charcoal #30343d. Use only this restrained palette and natural material shading.
Composition/framing: landscape 3:2, approximately 1536x1024 pixels. One compact central conceptual motif occupies the middle 70 percent of the canvas; maintain 15 percent clear outer safety margins, including all labels and endpoints. The important silhouette must survive a centered 1.26:1 crop and remain recognizable at 88 pixels wide. Sparse composition, large simple forms, clear figure-ground separation.
Constraints: symbolic technical concept only, never a depiction of a real system. No company names, vendor names, logos, company-specific architecture, physical server racks, server counts, addresses, IPs, database names, table names, screenshots, logs or security-incident depictions. No stock photography, robots, glossy 3D cloud clipart, cyber neon, layered gradients, random code, browser frames, UI mockups, titles, Korean text, explanations, signatures or watermarks. No text except the exact short labels allowed below. Generate exactly one image, not a collage, contact sheet or set of variants.
Scene/backdrop: warm ivory #fcfbf8 with a restrained light-blue paper ground layer.
Primary request: illustrate removing an obsolete dependency by reconnecting a workflow to existing functionality.
Subject: two substantial existing ivory paper blocks, distinguished from the background by navy edges and shallow relief, are cleanly reconnected by one elegant continuous navy route with a small apricot connector. The route bends around an empty square socket. Beside that socket sits one detached inactive charcoal tile labeled "LEGACY". The dark tile is visibly set aside and has no active connection.
Composition details: the bypass route and its two existing endpoints form one compact strong central motif. The detached LEGACY tile and empty socket remain legible but secondary. The active route passes entirely outside the empty socket and never touches the inactive tile.
Text (verbatim): "LEGACY", exactly once, clean bold monospaced ivory lettering on the detached dark tile. No other text.
Accuracy constraints: show reuse and reconnection, not rebuilding a component or constructing new infrastructure. No logos, vendor names, physical servers, network topology, replacement module, extra endpoints or new service. Only the original two functional blocks are connected; the obsolete component is clearly outside the active path.
```

### 4. 외부 할당과 내부 여유 공간을 구분

`disk-99-percent-check-before-expanding`

```text
Use case: stylized-concept
Asset type: one finished raster editorial cover illustration for an established Korean technical blog, part of a cohesive seven-image set.
Style/medium: elegant technical editorial art; sophisticated screen-print and precision cut-paper with shallow relief geometry, crisp large silhouettes, subtle tactile matte paper grain, restrained soft directional light and small soft shadows. Clean, precise, calm and thoughtful.
Color palette: navy #294970 and #324e6e, warm ivory #fcfbf8, light blue #dae5ef, muted apricot #f2c9a8, charcoal #30343d. Use only this restrained palette and natural material shading.
Composition/framing: landscape 3:2, approximately 1536x1024 pixels. One compact central conceptual motif occupies the middle 70 percent of the canvas; maintain 15 percent clear outer safety margins, including all labels and endpoints. The important silhouette must survive a centered 1.26:1 crop and remain recognizable at 88 pixels wide. Sparse composition, large simple forms, clear figure-ground separation.
Constraints: symbolic technical concept only, never a depiction of a real system. No company names, vendor names, logos, company-specific architecture, physical server racks, server counts, addresses, IPs, database names, table names, screenshots, logs or security-incident depictions. No stock photography, robots, glossy 3D cloud clipart, cyber neon, layered gradients, random code, browser frames, UI mockups, titles, Korean text, explanations, signatures or watermarks. No text except the exact short labels allowed below. Generate exactly one image, not a collage, contact sheet or set of variants.
Scene/backdrop: solid light blue #dae5ef.
Primary request: illustrate that allocated file space and free space inside that allocation are different measurements.
Subject: one large precision-cut nested storage block, viewed in a restrained shallow three-quarter cutaway. Its outer opaque navy envelope is clearly defined as allocated space. The open cutaway reveals spacious warm ivory internal cavities and a few muted apricot occupied slabs within the very same fixed envelope. The outside allocation and inside room must be simultaneously visible as one unified object.
Composition details: a strong simple block silhouette and broad visible inner cavities; no fine grids, detailed capacity chart or dense callout diagram. Keep the envelope fixed and complete, with only a deliberate cutaway view to reveal the interior.
Text (verbatim): "ALLOCATED" on the outer navy envelope and "FREE" beside an ivory inner cavity, each exactly once, clean readable monospaced type. These are the only labels.
Accuracy constraints: all geometry is qualitative and unmeasured. Do not depict actual capacity or quantitative proportions; no percentages, numbers, scales or capacity units. Do not depict expansion, shrinking, deletion, removal arrows, extra storage, an alarm screenshot, a green all-safe message or a capacity recommendation. The lesson is to inspect the two kinds of space before choosing an action.
```

### 5. 세 인증 관문을 모두 지난 뒤 권한을 부여

`staged-auth-and-password-migration`

```text
Use case: stylized-concept
Asset type: one finished raster editorial cover illustration for an established Korean technical blog, part of a cohesive seven-image set.
Style/medium: elegant technical editorial art; sophisticated screen-print and precision cut-paper with shallow relief geometry, crisp large silhouettes, subtle tactile matte paper grain, restrained soft directional light and small soft shadows. Clean, precise, calm and thoughtful.
Color palette: navy #294970 and #324e6e, warm ivory #fcfbf8, light blue #dae5ef, muted apricot #f2c9a8, charcoal #30343d. Use only this restrained palette and natural material shading.
Composition/framing: landscape 3:2, approximately 1536x1024 pixels. One compact central conceptual motif occupies the middle 70 percent of the canvas; maintain 15 percent clear outer safety margins, including all labels and endpoints. The important silhouette must survive a centered 1.26:1 crop and remain recognizable at 88 pixels wide. Sparse composition, large simple forms, clear figure-ground separation.
Constraints: symbolic technical concept only, never a depiction of a real system. No company names, vendor names, logos, company-specific architecture, physical server racks, server counts, addresses, IPs, database names, table names, screenshots, logs or security-incident depictions. No stock photography, robots, glossy 3D cloud clipart, cyber neon, layered gradients, random code, browser frames, UI mockups, titles, Korean text, explanations, signatures or watermarks. No text except the exact short labels allowed below. Generate exactly one image, not a collage, contact sheet or set of variants.
Scene/backdrop: solid matte navy #294970.
Primary request: illustrate state-gated authentication: permission becomes available only after all sequential verification states.
Subject: one single continuous ivory rail passes through exactly three separate simple architectural paper gates in sequence. Use ivory and light-blue translucent planes with navy depth, clearly spaced so all three gates can be counted. Only beyond the third and final gate, at the end of the rail, appears exactly one small muted apricot permission token shaped as an abstract key.
Composition details: a compact, gently diagonal or shallow-perspective procession through three gates, with all gates and the final key inside the middle 70 percent. Each gate straddles the same continuous rail. The rail has exactly one start and one end and no branches.
Text: no text.
Accuracy constraints: exactly three gates, exactly one key, and that key is fully beyond the final gate. There must be no key or token at the first gate, middle gate, or before completion. No side paths, bypasses, fork, extra entry route, hashing algorithm names, broken locks, hackers, incidents, vulnerability imagery or production topology. This is a generic sequential verification metaphor.
```

### 6. 값의 범위에 맞춰 int에서 long으로 확대

`integer-overflow-negative-amount`

```text
Use case: stylized-concept
Asset type: one finished raster editorial cover illustration for an established Korean technical blog, part of a cohesive seven-image set.
Style/medium: elegant technical editorial art; sophisticated screen-print and precision cut-paper with shallow relief geometry, crisp large silhouettes, subtle tactile matte paper grain, restrained soft directional light and small soft shadows. Clean, precise, calm and thoughtful.
Color palette: navy #294970 and #324e6e, warm ivory #fcfbf8, light blue #dae5ef, muted apricot #f2c9a8, charcoal #30343d. Use only this restrained palette and natural material shading.
Composition/framing: landscape 3:2, approximately 1536x1024 pixels. One compact central conceptual motif occupies the middle 70 percent of the canvas; maintain 15 percent clear outer safety margins, including all labels and endpoints. The important silhouette must survive a centered 1.26:1 crop and remain recognizable at 88 pixels wide. Sparse composition, large simple forms, clear figure-ground separation.
Constraints: symbolic technical concept only, never a depiction of a real system. No company names, vendor names, logos, company-specific architecture, physical server racks, server counts, addresses, IPs, database names, table names, screenshots, logs or security-incident depictions. No stock photography, robots, glossy 3D cloud clipart, cyber neon, layered gradients, random code, browser frames, UI mockups, titles, Korean text, explanations, signatures or watermarks. No text except the exact short labels allowed below. Generate exactly one image, not a collage, contact sheet or set of variants.
Scene/backdrop: solid warm ivory #fcfbf8.
Primary request: illustrate choosing a finite numeric representation wide enough for the actual value range, specifically widening int to long.
Subject: two open precision-cut navy containers or frames arranged as a compact paired comparison. One narrow upper frame is labeled "int"; a wider lower frame is labeled "long". Each is presented with the same finite chain of simple unlettered square number blocks: in the narrow frame, the chain visibly overhangs the available right-hand capacity; in the wider frame, the same-length chain fits completely inside the frame with a small finite amount of room remaining. The last few blocks of each chain are muted apricot, with earlier blocks light blue/navy.
Composition details: align the starts of the two frames and make their unequal available widths immediately obvious. The frame ends stay visible, especially the finite right-hand boundary of the wider one. Keep all overhanging blocks within the outer safety margin. Use generous space and a clear silhouette rather than chart decoration.
Text (verbatim): "int" and "long", exactly once each, lowercase clean bold monospaced labels integrated with their corresponding frames. The number blocks contain no printed digits or other text.
Accuracy constraints: the wider container is still finite. No infinity sign, numeric limits, money amounts, negative-number formula, assertion that every overflow becomes negative, driver-causality claim or BigDecimal label. Do not introduce arithmetic equations, money symbols or an alternative chosen fix.
```

### 7. 갱신 흔적에서 살아 있는 프로세스를 추적

`phantom-batch-after-was-migration`

```text
Use case: stylized-concept
Asset type: one finished raster editorial cover illustration for an established Korean technical blog, part of a cohesive seven-image set.
Style/medium: elegant technical editorial art; sophisticated screen-print and precision cut-paper with shallow relief geometry, crisp large silhouettes, subtle tactile matte paper grain, restrained soft directional light and small soft shadows. Clean, precise, calm and thoughtful.
Color palette: navy #294970 and #324e6e, warm ivory #fcfbf8, light blue #dae5ef, muted apricot #f2c9a8, charcoal #30343d. Use only this restrained palette and natural material shading.
Composition/framing: landscape 3:2, approximately 1536x1024 pixels. One compact central conceptual motif occupies the middle 70 percent of the canvas; maintain 15 percent clear outer safety margins, including all labels and endpoints. The important silhouette must survive a centered 1.26:1 crop and remain recognizable at 88 pixels wide. Sparse composition, large simple forms, clear figure-ground separation.
Constraints: symbolic technical concept only, never a depiction of a real system. No company names, vendor names, logos, company-specific architecture, physical server racks, server counts, addresses, IPs, database names, table names, screenshots, logs or security-incident depictions. No stock photography, robots, glossy 3D cloud clipart, cyber neon, layered gradients, random code, browser frames, UI mockups, titles, Korean text, explanations, signatures or watermarks. No text except the exact short labels allowed below. Generate exactly one image, not a collage, contact sheet or set of variants.
Scene/backdrop: solid charcoal #30343d with restrained muted-blue paper layers.
Primary request: illustrate tracing a continuing database update back to a surviving process after a shutdown command, using a calm evidence-inspection metaphor.
Subject: one large transparent inspection lens is the central dominant motif. Beneath it, a dotted evidence trail from a stylized navy database-record block is visibly revealed and leads back to one small muted grey process tile. The apparently inactive process tile contains a subtle live apricot pulse, a small restrained ring or dot that remains visible without neon glow. Render the record block as simple stacked paper records, not a labeled server or real database.
Composition details: the lens overlaps and clarifies the dotted trail, linking the record block and the single process tile in a compact central cluster. The trace should lead visibly back to the tile with the live pulse. Use warm ivory relief layers and an ivory lens rim for a strong readable silhouette on the dark background.
Text (verbatim): "TRACE", exactly once in small clear monospaced type integrated with the lens rim. No other text.
Accuracy constraints: a shutdown command does not itself prove actual process exit. Show the continuing process as an evidence trail, not a ghost or security threat. No ghosts, cartoons, attackers, broken locks, invasive or exploit mood, IPs, addresses, logs, screenshots, runtime versions, server counts, actual topology, extra processes or monitoring dashboards.
```
