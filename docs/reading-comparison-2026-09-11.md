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
- Visual comparison and independent review results will be recorded after execution.
