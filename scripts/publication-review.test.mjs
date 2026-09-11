import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import yaml from 'js-yaml'

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
test('a withdrawn article is not shipped as a public source or linked from reader pages', () => {
  const slug = 'staged-auth-and-password-migration'
  assert.equal(existsSync(new URL(`../src/content/posts/${slug}.md`, import.meta.url)), false)
  for (const file of ['src/pages/about.astro', 'src/content/wiki/session-and-cookie.md'])
    assert.ok(!read(file).includes(`/posts/${slug}/`))
  assert.match(read('.gitignore'), /src\/content\/_drafts/)
})
test('NULL summary agrees with the demonstrated NULL-to-value comparison', () => {
  const body = read('src/content/posts/null-and-empty-string-sync-failure.md')
  const data = yaml.load(body.match(/^---\n([\s\S]*?)\n---/)[1])
  assert.match(data.cause, /NULL과 실제 값/)
  assert.match(body, /둘만의 비교는 이 차이의 원인이 아니다/)
  assert.match(body, /규칙은 기존 방어 코드와 다르지 않다/)
})
test('numeric incident summaries distinguish a successful fix from an unverified conversion point', () => {
  const body = read('src/content/posts/integer-overflow-negative-amount.md')
  const data = yaml.load(body.match(/^---\n([\s\S]*?)\n---/)[1])
  assert.match(data.description, /특정하지 못한 변환·연산 지점/)
  assert.match(read('src/content/posts/retire-flash-module-by-integration.md'), /정확한 변환·연산 지점까지 특정하지는 못했다/)
})
test('public content dates are valid and revisions do not predate creation', () => {
  for (const collection of ['posts', 'wiki', 'notes']) {
    for (const file of readdirSync(new URL(`../src/content/${collection}/`, import.meta.url)).filter((f) => /\.mdx?$/.test(f))) {
      const body = read(`src/content/${collection}/${file}`)
      const data = yaml.load(body.match(/^---\n([\s\S]*?)\n---/)[1])
      const first = new Date(data.date ?? data.created)
      assert.ok(Number.isFinite(first.valueOf()), file)
      if (data.updated) assert.ok(new Date(data.updated) >= first, file)
    }
  }
})
test('project evidence text uses readable body size and repository links have 44px targets', () => {
  const page = read('src/pages/projects.astro')
  for (const selector of ['what', 'team-lead', 'team-desc', 'meta dd']) {
    const css = page.split(`.${selector} {`)[1]?.split('}')[0]
    assert.match(css, /font-size: var\(--type-body\)/)
  }
  assert.match(page.split('.repo {')[1]?.split('}')[0], /min-height: var\(--control-size\)/)
})
