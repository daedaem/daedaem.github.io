# Reading-layout comparison — 2026-09-11

This branch is a review candidate, not a production design decision.

- A: production commit `835b8ed`.
- B: this branch, `codex/reading-comparison-20260911`.
- Compare home, `/posts/`, and the same NULL/empty-string article at 390 × 844 and 1440 × 900 CSS pixels.
- Keep the existing identity, brand, palette, article titles, bodies, dates, publication state, URLs, recommendation order and cover assets unchanged.
- B changes layout, type hierarchy and navigation. In particular, list explanations and mobile category options remain available but are initially collapsed. These are visibility changes, not identical interfaces.

## Decision criteria fixed before review

1. Recognize the author and the technical-blog purpose.
2. Scan and choose among real article titles and summaries.
3. Find a topic and navigate to a related article.
4. Enter and read an article, including code and the cause summary.
5. Keep a distinctive visual identity without obstructing reading.
6. Preserve responsive layout, native links, keyboard access and existing content.

Record advantages and disadvantages for each page. Do not assume that B wins because it is newer or denser. Do not convert these observations into a purported user-study score or a hiring-probability estimate. A mixed recommendation is acceptable.

## Verification status before independent review

- Type check: 89 files, no errors, warnings or hints.
- Tests: 110 passed, none skipped. Five source assertions were updated for deliberate B layout changes; three comparison-specific regression tests were added.
- No production deployment, content publication, private-document access or private-material transfer is part of this comparison.
- B build: 593 Astro pages, 555 indexed pages, 25,009 indexed words; site check: 621 HTML files, 21,782 internal references.

## Executed comparison

Codex directly inspected production-build previews of both versions in the same browser at 390 × 844 and 1440 × 900. The actual document client widths were 375 and 1425 because this desktop browser reserves scrollbar space. These are responsive viewport checks, not physical-phone tests.

Fourteen comparison screenshots cover the three entry screens at both sizes, plus the same code section at desktop size. Additional B checks cover 320px dark home/list/detail and expanded mobile navigation. The conversation comparison contains the actual captures, not reconstructed product mockups.

Rounded document coordinates from Codex's browser:

| Measurement | A mobile | B mobile | A desktop | B desktop |
| --- | ---: | ---: | ---: | ---: |
| Home: first article title top | 536 | 385 | 255 | 357 |
| Home: fully visible recommended titles in initial viewport | 1 | 2 | 1 | 3 |
| Home: other articles section top | 1706 | 1035 | 1217 | 868 |
| List: first article title top | 579 | 395 | 400 | 342 |
| Article: body container top | 810 | 724 | 621 | 553 |

B's third mobile recommended title starts at 811px but ends at 901px, outside the 844px viewport. It is partially visible, not a third fully readable title. On desktop, A's first title is earlier than B's. Density and first-title position are different measures; neither proves task completion speed or hiring impact.

### Preservation and interaction

- 737 tracked protected files compared byte-for-byte, including all 592 content files, public assets and selected configuration/shared-brand files: no differences.
- 621 generated HTML paths and all 804 generated `pre` blocks match the baseline exactly.
- Native mobile disclosures open by click and Enter; category links are 44px high. Category → article → back returns to the correct category. Logo → home works.
- NULL search returns results, including the case article and wiki; Escape closes the dialog and returns focus to the search trigger.
- Desktop article TOC moves to the selected section and sets its active item. Code background remains `#24292e`; code text is unchanged.
- No horizontal document overflow in the six primary A/B page-size comparisons or the three additional 320px B dark screens.
- The comparison viewer's screen selector and image loading were checked at 1024px and 390px; narrow output stacks without horizontal overflow.
- No new Lighthouse, PSI, real-user study, screen-reader session, CMS write, comment publication or full content factual audit was performed.

## Independent Claude review

Claude Fable 5.1 Extra received the exact A/B references and criteria before Codex supplied a preference. Claude reported separate scratchpad builds, same-browser screenshots/DOM measurements at 390/1440 light plus 320/dark, B tests 109/110 (the known container ASan limitation), and a passing site check. These are Claude-reported results, distinct from Codex's direct checks above. Claude did not run Lighthouse in this round.

Common observations: B exposes more article choices; A has a stronger editorial identity through large art. Desktop topic access improves in B, but collapsed mobile categories add an interaction. B's larger body type and earlier TOC help reading, while joined titles lose A's title/subtitle distinction.

Claude preferred B if forced to select one version and suggested a hybrid retaining one prominent cover. Codex considers A's title/subtitle distinction worth preserving as well. A hybrid has NOT been implemented or measured and is not declared the winner.

Codex prepared a follow-up challenging the blanket claim that B's first title is earlier at every size and distinguishing partial from fully visible titles. The application changed before the follow-up could be sent; further app-state access was blocked to avoid exposing unrelated conversations. No final joint sign-off on those corrections is claimed.

## Decision status

Production/master remains `835b8ed`. Only the public, non-private review branch was pushed; its push does not trigger the master-only Pages deployment. The user should see A/B and choose the next direction before production changes.

Provisional recommendation: use B's navigation/list structure as the starting point, preserve deliberate visual emphasis rather than shrink every cover indiscriminately, retain title/subtitle differentiation, and resolve mobile topic discoverability. This is a concrete direction with tradeoffs, not an untested “best” design or a claim that a full redesign is unnecessary.
