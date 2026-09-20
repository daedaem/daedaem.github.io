import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import yaml from 'js-yaml'
import { internalReadingLinks, selectWikiReading } from '../src/utils/wiki-reading.mjs'

const entry = (id, tags = [], options = {}) => ({
  id,
  collection: 'wiki',
  body: '',
  ...options,
  data: { title: id, tags, topic: 'database', ...options.data },
})
const ids = (rows) => rows.map((row) => row.id)

test('internal reading links keep author order, fragments and deduplication, not example code', () => {
  const body = [
    '[둘째](/wiki/second/#heading)',
    '[첫째](/posts/first?from=wiki "제목")',
    '[반복](/wiki/second/)',
    '[외부](https://example.com/wiki/external/)',
    '![그림](/wiki/image/)',
    '`[인라인 예시](/wiki/inline/)`',
    '<!-- [주석](/wiki/comment/) -->',
    '```md',
    '[코드 예시](/wiki/fenced/)',
    '```',
    '~~~md',
    '[코드 예시](/wiki/tilde/)',
    '~~~',
  ].join('\n')
  assert.deepEqual(internalReadingLinks(body), ['/wiki/second/', '/posts/first/'])
  assert.deepEqual(internalReadingLinks(), [])
})

test('one or several broad tags and topic alone do not qualify as a recommendation', () => {
  const current = entry('null', ['Oracle', 'SQL', 'Java', 'Spring', 'React', '레거시'])
  const pool = [
    current,
    entry('one', ['Oracle']),
    entry('two', ['Oracle', 'SQL']),
    entry('spring', ['Spring']),
    entry('same-topic'),
  ]
  assert.deepEqual(selectWikiReading(pool, current).related, [])
})

test('a specific tag qualifies regardless of frequency, normalizing case and duplicate tags', () => {
  const current = entry('session', [' HTTP ', 'Servlet'])
  const pool = [
    current,
    ...Array.from({ length: 8 }, (_, i) => entry(`http-${i}`, ['http', 'HTTP'])),
  ]
  assert.deepEqual(ids(selectWikiReading(pool, current).related), ['http-0', 'http-1', 'http-2'])
})

test('forward links win in author order while backlinks, self, drafts and missing targets stay out', () => {
  const current = entry('current', ['NULL'], {
    body: [
      '[후순위 제목](/wiki/z-last/)',
      '[상호 참조](/wiki/back/)',
      '[우선 제목](/posts/a-first/)',
      '[반복](/wiki/z-last/)',
      '[자기](/wiki/current/)',
      '[초안](/wiki/draft/)',
      '[없는 글](/wiki/missing/)',
    ].join('\n'),
  })
  const back = entry('back', ['NULL'], { body: '[현재](/wiki/current/)' })
  const pool = [
    entry('a-first', [], { collection: 'posts' }),
    current,
    back,
    entry('draft', ['NULL'], { data: { draft: true } }),
    entry('z-last'),
    entry('auto', ['NULL']),
  ]
  const result = selectWikiReading(pool, current)
  assert.deepEqual(ids(result.references), ['back'])
  assert.deepEqual(ids(result.related), ['z-last', 'a-first', 'auto'])
})

test('automatic ranking uses specific tags, broad tags, topic, then title and stable path', () => {
  const current = entry('current', ['NULL', '비교', 'Oracle'])
  const pool = [
    current,
    entry('plain', ['NULL']),
    entry('other-topic', ['NULL', 'Oracle'], { data: { topic: 'java' } }),
    entry('same-topic', ['NULL', 'Oracle']),
    entry('two-concepts', ['NULL', '비교'], { data: { topic: 'java' } }),
  ]
  assert.deepEqual(ids(selectWikiReading(pool, current).related), [
    'two-concepts',
    'same-topic',
    'other-topic',
  ])
  const ties = [
    entry('z', ['NULL'], { data: { title: '동일' } }),
    entry('a', ['NULL'], { data: { title: '동일' } }),
  ]
  assert.deepEqual(ids(selectWikiReading(ties, current).related), ['a', 'z'])
})

test('maximum is three and missing matches are never filled from unrelated documents', () => {
  const current = entry('current', ['NULL'])
  const pool = [current, entry('only', ['NULL']), entry('unrelated', ['Oracle'])]
  assert.deepEqual(ids(selectWikiReading(pool, current).related), ['only'])
  assert.deepEqual(selectWikiReading(pool, current, 0).related, [])
})

function publicEntries() {
  return ['wiki', 'posts']
    .flatMap((collection) => {
      const directory = new URL(`../src/content/${collection}/`, import.meta.url)
      return readdirSync(directory)
        .filter((file) => /\.mdx?$/.test(file))
        .map((file) => {
          const source = readFileSync(new URL(file, directory), 'utf8')
          const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)
          return {
            collection,
            id: file.replace(/\.mdx?$/, ''),
            data: yaml.load(frontmatter[1]),
            body: source.slice(frontmatter[0].length),
          }
        })
    })
    .filter((item) => !item.data.draft)
}

test('published NULL wiki keeps real backlinks without Oracle-only follow-ups; HTTP link survives', () => {
  const pool = publicEntries()
  const current = pool.find((item) => item.id === 'oracle-empty-string-is-null')
  const result = selectWikiReading(pool, current)
  assert.deepEqual(result.related, [])
  assert.ok(result.references.some((item) => item.id === 'null-and-empty-string-sync-failure'))
  const session = pool.find((item) => item.id === 'session-and-cookie')
  assert.ok(
    selectWikiReading(pool, session).related.some(
      (item) => item.id === 'web-server-was-and-servlet',
    ),
  )
})

test('all 26 reviewed wiki outputs match the agreed reading graph and keep backlinks unchanged', () => {
  const expected = {
    'aspnet-webforms-basics': [],
    'browser-rendering': [],
    'data-modeling-basics': [
      'database-normalization',
      'relational-database-and-sql',
      'test-with-production-database-engine',
    ],
    'data-structures-and-complexity': [],
    'database-normalization': [],
    'design-patterns': ['spring-and-object-oriented-design', 'mvc-pattern'],
    'ftp-ftps-sftp': ['network-basics-and-tcp-ip', 'web-server-was-and-servlet'],
    'java-enum-state-transitions': [],
    'java-integer-overflow': ['integer-overflow-negative-amount'],
    'mvc-pattern': [],
    'network-basics-and-tcp-ip': ['web-server-was-and-servlet'],
    'oracle-empty-string-is-null': [],
    'oracle-trigger': ['phantom-batch-after-was-migration', 'relational-database-and-sql'],
    'react-context-and-redux': ['design-patterns'],
    'react-custom-hooks': ['react-context-and-redux'],
    'react-state-and-rendering': ['browser-rendering'],
    'relational-database-and-sql': ['sql-join-types', 'oracle-empty-string-is-null'],
    'rendering-strategies': ['web-server-was-and-servlet'],
    'session-and-cookie': ['java-enum-state-transitions', 'web-server-was-and-servlet'],
    'spring-and-object-oriented-design': [],
    'spring-transactional-catch-swallows-rollback': [],
    'sql-correlated-subquery': [
      'address-search-9s-to-100ms',
      'oracle-empty-string-is-null',
      'sql-join-types',
    ],
    'sql-join-types': ['oracle-empty-string-is-null'],
    'test-with-production-database-engine': [
      'oracle-empty-string-is-null',
      'java-enum-state-transitions',
      'data-modeling-basics',
    ],
    'tls-handshake-and-jdk-version': [],
    'web-server-was-and-servlet': ['phantom-batch-after-was-migration', 'session-and-cookie'],
  }
  const pool = publicEntries()
  for (const [id, related] of Object.entries(expected)) {
    const current = pool.find((item) => item.collection === 'wiki' && item.id === id)
    assert.ok(current, id)
    const result = selectWikiReading(pool, current)
    assert.deepEqual(ids(result.related), related, id)
    const oldReferences = pool.filter(
      (item) => item !== current && item.body.includes(`/wiki/${id}/`),
    )
    assert.deepEqual(result.references, oldReferences, `${id}: backlinks unchanged`)
  }
})
