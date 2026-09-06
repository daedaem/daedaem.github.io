import test from 'node:test'
import assert from 'node:assert/strict'
import { connectCommentTheme } from '../src/utils/comment-theme.mjs'

function setup() {
  const page = new EventTarget()
  const document = new EventTarget()
  const media = new EventTarget()
  const host = new EventTarget()
  const attributes = new Map()
  const messages = []
  let theme = 'light'
  let frame
  host.querySelector = () => frame
  const script = { setAttribute: (key, value) => attributes.set(key, value) }
  const disconnect = connectCommentTheme({
    host,
    script,
    readTheme: () => theme,
    page,
    document,
    media,
  })
  return {
    attributes,
    messages,
    disconnect,
    createFrame() {
      frame = {
        contentWindow: { postMessage: (message, origin) => messages.push({ message, origin }) },
      }
    },
    change(next, system = false) {
      theme = next
      ;(system ? media : document).dispatchEvent(new Event(system ? 'change' : 'themechange'))
    },
    ready(overrides = {}) {
      const event = new Event('message')
      Object.assign(event, {
        origin: 'https://giscus.app',
        source: frame?.contentWindow,
        data: { giscus: { resizeHeight: 400 } },
        ...overrides,
      })
      page.dispatchEvent(event)
    },
  }
}

test('theme changes before client.js update the initial script and ready widget', () => {
  const s = setup()
  s.change('dark')
  assert.equal(s.attributes.get('data-theme'), 'dark')
  assert.equal(s.messages.length, 0)
  s.createFrame()
  s.ready()
  assert.deepEqual(s.messages, [
    { message: { giscus: { setConfig: { theme: 'dark' } } }, origin: 'https://giscus.app' },
  ])
})

test('a theme message lost while the iframe loads is resent on readiness', () => {
  const s = setup()
  s.createFrame()
  s.change('dark')
  assert.equal(s.messages.length, 1)
  s.ready()
  assert.equal(s.messages.length, 2)
  assert.equal(s.messages[1].message.giscus.setConfig.theme, 'dark')
  s.ready()
  assert.equal(s.messages.length, 2, 'resize feedback must not create a message loop')
})

test('readiness requires the trusted origin, current iframe and a valid resize', () => {
  const s = setup()
  s.createFrame()
  for (const overrides of [
    { origin: 'https://example.test' },
    { source: {} },
    { data: null },
    { data: { giscus: { resizeHeight: '400' } } },
    { data: { giscus: { resizeHeight: Infinity } } },
  ])
    s.ready(overrides)
  assert.equal(s.messages.length, 0)
  s.ready()
  assert.equal(s.messages.length, 1)
})

test('loaded widgets follow user and effective system theme changes without duplicate sends', () => {
  const s = setup()
  s.createFrame()
  s.ready()
  s.change('dark')
  s.change('dark', true)
  assert.equal(s.messages.length, 2)
  s.change('light', true)
  assert.equal(s.messages.at(-1).message.giscus.setConfig.theme, 'light')
  s.disconnect()
  s.change('dark')
  assert.equal(s.messages.length, 3)
})

test('a replacement iframe receives the current theme on its own readiness', () => {
  const s = setup()
  s.createFrame()
  s.ready()
  s.createFrame()
  s.ready()
  assert.equal(s.messages.length, 2)
})
