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
  // 래퍼 .table(.table-scroll은 옛 이름): 키보드로 넘길 수 있고 이름이 있다
  assert.deepEqual(tree.children[0].properties, {
    className: ['table', 'table-scroll'],
    tabIndex: 0,
    ariaLabel: '표 1',
  })
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

test('table headers get a scope and tables are numbered per document', () => {
  const head = el('thead', [
    el('tr', [el('th', [text('A')]), el('th', [text('B')], { scope: 'colgroup' })]),
  ])
  const body = el('tbody', [el('tr', [el('th', [text('row')]), el('td', [text('1')])])])
  const first = el('table', [head, body])
  const second = el('table', [el('tbody', [el('tr', [el('td', [text('x')])])])])
  const tree = { type: 'root', children: [first, text('\n'), second] }
  fixups()(tree)
  assert.equal(head.children[0].children[0].properties.scope, 'col')
  assert.equal(head.children[0].children[1].properties.scope, 'colgroup')
  assert.equal(body.children[0].children[0].properties.scope, 'row')
  assert.equal(tree.children[0].properties.ariaLabel, '표 1')
  assert.equal(tree.children[2].properties.ariaLabel, '표 2')
})

test('highlighted code blocks become keyboard-scrollable with a language name and no landmark role', () => {
  // Shiki는 class·tabindex를 속성 이름 그대로 둔다
  const sql = el('pre', [el('code', [text('SELECT 1')])], {
    class: 'astro-code astro-code-themes light-plus dark-plus',
    tabindex: '0',
    dataLanguage: 'sql',
  })
  const plain = el('pre', [el('code', [text('x')])], {
    class: 'astro-code',
    dataLanguage: 'plaintext',
  })
  const other = el('pre', [el('code', [text('y')])])
  fixups()({ type: 'root', children: [sql, plain, other] })
  assert.equal(sql.properties.ariaLabel, '코드: sql')
  assert.equal(sql.properties.tabindex, '0')
  assert.equal(sql.properties.role, undefined)
  assert.equal(plain.properties.ariaLabel, '코드')
  assert.equal(plain.properties.tabindex, '0')
  assert.equal(other.properties.ariaLabel, undefined)
  assert.equal(other.properties.tabindex, undefined)
})
