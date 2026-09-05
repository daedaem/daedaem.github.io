import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { load } from 'js-yaml'
import { CATEGORIES, WIKI_TOPICS } from '../src/consts.ts'

const config = load(readFileSync('.pages.yml', 'utf8'))
test('CMS scopes content to approved collections and public images', () => {
  assert.deepEqual(
    config.content.map((c) => c.path),
    ['src/content/wiki', 'src/content/posts', 'src/content/notes'],
  )
  assert.equal(config.media.input, 'public/uploads')
  assert.deepEqual(config.media.categories, ['image'])
})
test('new entries are unpublished by default and existing URLs cannot be renamed', () => {
  for (const name of ['wiki', 'posts']) {
    const collection = config.content.find((c) => c.name === name)
    assert.equal(collection.fields.find((f) => f.name === 'draft').default, true)
    assert.equal(collection.operations.rename, false)
    assert.equal(collection.filename.field, 'create')
    assert.equal(collection.filename.template, '{year}-{month}-{day}-{hour}{minute}{second}.md')
    assert.ok(Array.isArray(collection.view.sort))
    assert.equal(collection.view.default.order, 'desc')
  }
  const notes = config.content.find((c) => c.name === 'notes')
  assert.deepEqual(notes.operations, { create: false, rename: false, delete: false })
  assert.equal(notes.fields, undefined)
})
test('CMS fields cover existing frontmatter and accepted select values', () => {
  for (const name of ['wiki', 'posts']) {
    const collection = config.content.find((c) => c.name === name)
    const fields = new Map(collection.fields.map((f) => [f.name, f]))
    for (const file of readdirSync(collection.path).filter((f) => /\.mdx?$/.test(f))) {
      assert.match(file, /^[a-z0-9]+(?:-[a-z0-9]+)*\.mdx?$/)
      const raw = readFileSync(collection.path + '/' + file, 'utf8')
      const data = load(raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1])
      assert.equal(
        typeof data.draft,
        'boolean',
        file + ': preserve explicit publication state in CMS',
      )
      for (const [key, value] of Object.entries(data)) {
        assert.ok(fields.has(key), file + ': missing CMS field ' + key)
        const field = fields.get(key)
        if (field.type === 'select')
          assert.ok(
            field.options.values.some((v) => (typeof v === 'string' ? v : v.name) === value),
            file + ': invalid ' + key,
          )
      }
    }
  }
})
test('CMS topic and category choices match site navigation', () => {
  for (const [name, field, choices] of [
    ['wiki', 'topic', WIKI_TOPICS],
    ['posts', 'category', CATEGORIES],
  ]) {
    const values = config.content
      .find((c) => c.name === name)
      .fields.find((f) => f.name === field)
      .options.values.map((v) => v.name)
    assert.deepEqual([...values].sort(), choices.map((c) => c.id).sort())
  }
})
