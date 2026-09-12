import test from 'node:test'
import assert from 'node:assert/strict'
import { dismissSearchForAnchor } from '../src/utils/search-navigation.mjs'

function run(
  href,
  {
    event: overrides = {},
    target = '',
    download = false,
    current = 'https://example.com/about/#contact',
    open = true,
  } = {},
) {
  let closes = 0
  const link = { href, target, hasAttribute: () => download }
  const event = { button: 0, target: { closest: () => link }, ...overrides }
  const dialog = {
    open,
    close() {
      this.open = false
      closes++
    },
  }
  const result = dismissSearchForAnchor(event, dialog, current)
  return { result, closes, open: dialog.open }
}

test('same-document search anchors close the modal, including the already selected heading', () => {
  for (const href of ['/about/#interest', '#contact', 'https://example.com/about/#training']) {
    assert.deepEqual(run(href), { result: true, closes: 1, open: false })
  }
  assert.deepEqual(run('#training', { target: '_self' }), { result: true, closes: 1, open: false })
})

test('modified clicks, new tabs, downloads and non-links retain the search dialog', () => {
  for (const event of [
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
    { defaultPrevented: true },
    { target: {} },
  ]) {
    assert.deepEqual(run('#interest', { event }), { result: false, closes: 0, open: true })
  }
  for (const options of [{ target: '_blank' }, { download: true }]) {
    assert.deepEqual(run('#interest', options), { result: false, closes: 0, open: true })
  }
})

test('other pages, query states and origins keep their normal navigation', () => {
  for (const href of [
    '/about/',
    '/posts/example/#heading',
    '?q=x#heading',
    'https://elsewhere.example/about/#heading',
    'mailto:author@example.com',
    'http://[invalid',
  ]) {
    assert.deepEqual(run(href), { result: false, closes: 0, open: true })
  }
  assert.deepEqual(run('#interest', { open: false }), { result: false, closes: 0, open: false })
})
