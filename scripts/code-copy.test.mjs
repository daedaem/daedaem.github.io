import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createCodeCopy } from '../src/utils/code-copy.mjs'

test('copy awaits clipboard permission and preserves the exact code text', async () => {
  const states = [], texts = []
  let done
  const copy = createCodeCopy((text) => { texts.push(text); return new Promise((resolve) => { done = resolve }) },
    (state) => states.push(state), () => 0, () => {})
  const pending = copy('  SELECT 1;\n')
  assert.deepEqual(states, ['copying'])
  await copy('duplicate')
  assert.deepEqual(texts, ['  SELECT 1;\n'])
  done()
  await pending
  assert.deepEqual(states, ['copying', 'success'])
})
test('denied clipboard writes show an error, and retry can succeed', async () => {
  const states = []
  let denied = true
  const copy = createCodeCopy(async () => { if (denied) throw new Error('NotAllowedError') },
    (state) => states.push(state), () => 0, () => {})
  await copy('code')
  assert.deepEqual(states, ['copying', 'error'])
  denied = false
  await copy('code')
  assert.deepEqual(states.slice(-2), ['copying', 'success'])
})
test('a previous success timer cannot erase a subsequent failure', async () => {
  const timers = new Map(), states = []
  let denied = false, id = 0
  const copy = createCodeCopy(async () => { if (denied) throw new Error('denied') },
    (state) => states.push(state), (fn) => { timers.set(++id, fn); return id }, (key) => timers.delete(key))
  await copy('code')
  assert.equal(timers.size, 1)
  denied = true
  await copy('code')
  assert.equal(timers.size, 0)
  assert.equal(states.at(-1), 'error')
})
test('reader feedback is announced and never included in copied code or search', () => {
  const source = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8')
  assert.match(source, /setAttribute\('role', 'status'\)/)
  assert.match(source, /setAttribute\('data-pagefind-ignore', 'all'\)/)
  assert.match(source, /copyCode\(code.textContent \?\? ''\)/)
  assert.match(source, /코드를 직접 선택해 복사하거나 다시 시도/)
})
