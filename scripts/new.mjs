// 새 글·위키 파일을 프론트매터가 채워진 상태로 만든다.
//
//   npm run new post <slug> "제목" [category]
//   npm run new wiki <slug> "제목" [topic]
//
// slug는 ASCII 소문자·숫자·하이픈만. 파일명이 곧 URL이다.
// 글(post)은 draft: true로 만들어진다. 검토 후 false로 바꿔 공개한다.

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const [kind, slug, title, extra] = process.argv.slice(2)

const CATEGORIES = ['data-integrity', 'performance', 'operations', 'legacy', 'auth-security']
const TOPICS = ['java', 'spring', 'database', 'dotnet', 'web', 'infra', 'cs', 'etc']

function fail(msg) {
  console.error(`\n${msg}\n`)
  console.error('사용법:')
  console.error('  npm run new post <slug> "제목" [category]   category: ' + CATEGORIES.join(' | '))
  console.error('  npm run new wiki <slug> "제목" [topic]      topic:    ' + TOPICS.join(' | '))
  process.exit(1)
}

if (!['post', 'wiki'].includes(kind)) fail('첫 인자는 post 또는 wiki 입니다.')
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
  fail('slug는 ASCII 소문자·숫자·하이픈만 씁니다. 예: oracle-empty-string-is-null')
if (!title) fail('제목이 없습니다. 따옴표로 감싸서 넘기세요.')

const today = new Date().toISOString().slice(0, 10)
const quote = (s) => `'${s.replace(/'/g, "''")}'`

let dir, body
if (kind === 'post') {
  const category = extra ?? 'operations'
  if (!CATEGORIES.includes(category)) fail(`category는 ${CATEGORIES.join(' | ')} 중 하나입니다.`)
  dir = 'src/content/_drafts/posts'
  body = `---
title: ${quote(title)}
description: '한 문장 요약. 목록과 검색 결과에 그대로 노출된다.'
date: ${today}
# happened: '2026년 1월'   # 일이 실제로 있었던 시기. 발행일과 다르면 채운다
category: '${category}'
tags: []
draft: true
---

> 코드와 테이블명은 문제의 구조를 보여주기 위해 일반적인 형태로 옮긴 것이다. 실제 시스템의 코드가 아니다.

## 1. 무엇이 문제였는가

## 2. 왜 그랬는가

## 3. 무엇을 골랐고, 무엇을 고르지 않았는가

## 정리

-
`
} else {
  const topic = extra ?? 'etc'
  if (!TOPICS.includes(topic)) fail(`topic은 ${TOPICS.join(' | ')} 중 하나입니다.`)
  dir = 'src/content/_drafts/wiki'
  body = `---
title: ${quote(title)}
description: '한 문장으로. 목록과 검색 결과에 그대로 노출된다.'
topic: '${topic}'
tags: []
created: ${today}
status: 'seed'
---

##

\`\`\`java
\`\`\`
`
}

mkdirSync(resolve(dir), { recursive: true })
const path = resolve(dir, `${slug}.md`)
if (existsSync(path)) fail(`이미 있습니다: ${path}`)
writeFileSync(path, body)
console.log(`만들었습니다: ${dir}/${slug}.md`)
console.log('_drafts/ 아래는 git에 올라가지 않습니다. 공개할 때 posts/ 또는 wiki/ 로 옮기세요.')
