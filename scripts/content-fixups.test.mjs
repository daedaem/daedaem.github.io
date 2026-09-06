import test from 'node:test'
import assert from 'node:assert/strict'
import fixups from '../src/plugins/rehype-content-fixups.mjs'

const text = (value) => ({ type: 'text', value })
const el = (tagName, children = [], properties = {}) => ({
  type: 'element',
  tagName,
  properties,
  children,
})

test('table wrapper removes structural whitespace but preserves inline and preformatted spaces', () => {
  const cell = el('td', [
    el('code', [text('A')]),
    text(' '),
    el('code', [text('B')]),
    el('pre', [text('  \n')]),
  ])
  const caption = el('caption', [el('strong', [text('A')]), text(' '), el('em', [text('B')])])
  const row = el('tr', [text('\n'), cell, text('\n')])
  const table = el('table', [text('\n'), caption, el('tbody', [text('\n'), row]), text('\n')])
  const tree = { type: 'root', children: [table] }
  fixups()(tree)
  assert.deepEqual(tree.children[0].properties.className, ['table-scroll'])
  assert.equal(row.children.length, 1)
  assert.equal(cell.children[1].value, ' ')
  assert.equal(cell.children[3].children[0].value, '  \n')
  assert.equal(caption.children[1].value, ' ')
  const once = structuredClone(tree)
  fixups()(tree)
  assert.deepEqual(tree, once)
})

test('image fixups still preserve authored alt, loading and local assets', () => {
  const remote = el('img', [], { src: 'https://example.test/a.png', alt: '설명', loading: 'eager' })
  const bare = el('img', [], {
    src: 'https://example.test/b.png',
    alt: 'https://example.test/b.png',
  })
  const local = el('img', [], { src: '/image.png', alt: '로컬' })
  fixups()({ type: 'root', children: [remote, bare, local] })
  assert.equal(remote.properties.alt, '설명')
  assert.equal(remote.properties.loading, 'eager')
  assert.equal(bare.properties.alt, '')
  assert.equal(bare.properties.loading, 'lazy')
  assert.equal(local.properties.loading, undefined)
})
