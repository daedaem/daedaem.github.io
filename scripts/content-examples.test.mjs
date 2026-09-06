import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runInNewContext, Script } from 'node:vm'
import { spawnSync } from 'node:child_process'
import ts from 'typescript'

const read = (file) => readFileSync(new URL('../src/content/' + file, import.meta.url), 'utf8')
const blocks = (file) => [...read(file).matchAll(/^```\w*\n([\s\S]*?)^```/gm)].map((m) => m[1])
const first = (file) => blocks(file)[0]
const corrected = (file, marker) => {
  const code = blocks(file).find((code) => code.includes('2026-09-06 교정 예제: ' + marker))
  assert.ok(code, marker)
  return code
}

test('delivery loop handles empty work, exact capacity, and a farther empty house', () => {
  const code = first('solutions/pg-150369.md')
  for (const [args, expected] of [
    [[1, 1, [0], [0]], 0],
    [[1, 1, [1], [0]], 2],
    [[2, 3, [1, 0, 0], [0, 0, 0]], 2],
    [[2, 3, [0, 0, 1], [0, 0, 1]], 6],
    [[2, 1, [5], [1]], 6],
  ])
    assert.equal(
      runInNewContext(code + `\nsolution(...${JSON.stringify(args)})`, {}, { timeout: 1000 }),
      expected,
    )
})

test('cleaned cipher code retains behavior and BOJ snippets use portable input', () => {
  const code = first('solutions/pg-155652.md')
  assert.equal(runInNewContext(code + '\nsolution("abc", "z", 1)', {}, { timeout: 1000 }), 'bcd')
  assert.doesNotMatch(code, /^\d+\s*$/m)
  const root = new URL('../src/content/solutions/', import.meta.url)
  for (const file of readdirSync(root).filter((f) => f.startsWith('boj-') && f.endsWith('.md'))) {
    const body = read('solutions/' + file)
    assert.doesNotMatch(body, /readFileSync\(["'](?:\.\/)?dev\/stdin["']\)/, file)
    // BOJ Node 코드는 CommonJS 모듈이므로 최상위 return도 모듈 래퍼 안에서 파싱한다.
    for (const match of body.matchAll(/^```javascript\n([\s\S]*?)^```/gm))
      new Script(
        '(function(exports, require, module, __filename, __dirname) {\n' + match[1] + '\n})',
        { filename: file },
      )
  }
})

test('uncertain records retain their warning and original evidence', () => {
  assert.match(read('solutions/boj-1620.md'), /reviewNote:.*원출처/)
  assert.match(read('solutions/boj-1620.md'), /내답아니고 테스트용/)
  assert.match(read('solutions/pg-42883.md'), /reviewNote:.*정답으로 사용하지 않는다/)
  assert.match(read('solutions/pg-42883.md'), /def solution\(n\)/)
  const page = readFileSync(
    new URL('../src/pages/algorithms/[...slug].astro', import.meta.url),
    'utf8',
  )
  assert.doesNotMatch(page, /코드는 직접\s*작성한 것입니다/)
  assert.match(page, /d\.reviewNote/)
})

test('prototype corrections work while the old example remains preserved', () => {
  const file = 'notes/core-javascript-06-prototype.md'
  assert.throws(() => runInNewContext(first(file), {}, { timeout: 1000 }), /not a constructor/)
  assert.equal(runInNewContext(corrected(file, '생성자 표현식') + '\nroyClone3.age'), 20)
  const result = runInNewContext(
    corrected(file, '프로토타입 설정 후 생성') +
      '\nJSON.stringify([g[0], g[1], g.length, Array.isArray(g)])',
  )
  assert.deepEqual(JSON.parse(result), [100, 90, 2, false])
})

test('logger correction reads state after a synchronous next and returns its result', () => {
  let state = 0
  const logs = []
  const env = {
    store: { getState: () => state },
    next: () => {
      state = 1
      return 'sent'
    },
    console: { log: (...args) => logs.push(args) },
  }
  const code = corrected('notes/core-javascript-05-closure.md', '액션 전달 후 상태 조회')
  assert.equal(runInNewContext(code + '\nlogger(store)(next)({type: "UPDATE"})', env), 'sent')
  assert.deepEqual(logs.at(-1), ['next state', 1])
})

function typeErrors(source) {
  const file = '/virtual/blog-example.ts'
  const options = { noEmit: true, strict: true, target: ts.ScriptTarget.ES2022, types: [] }
  const host = ts.createCompilerHost(options)
  const getSourceFile = host.getSourceFile.bind(host)
  host.getSourceFile = (name, language, ...rest) =>
    name === file
      ? ts.createSourceFile(file, source, language, true)
      : getSourceFile(name, language, ...rest)
  return ts.getPreEmitDiagnostics(ts.createProgram([file], options, host))
}

test('corrected readonly and optional-property examples pass TypeScript with the expected error', () => {
  const readonly = corrected('notes/typescript-04-interfaces.md', 'readonly 타입을 통한 접근')
  const optional = corrected('notes/typescript-05-advanced-types.md', '선택 속성 모델')
  assert.deepEqual(
    typeErrors(readonly).map((d) => d.code),
    [],
  )
  assert.deepEqual(
    typeErrors(optional).map((d) => d.code),
    [],
  )
  assert.deepEqual(
    typeErrors(readonly.replace(/^.*@ts-expect-error.*\n/m, '')).map((d) => d.code),
    [2540],
  )
})

test('new-ID correction handles an empty filtered value and punctuation boundaries', (t) => {
  const probe = spawnSync('python3', ['--version'])
  if (probe.error?.code === 'ENOENT') return t.skip('python3 is needed to execute Python examples')
  const checks =
    '\nassert solution("!") == "aaa"\nassert solution("...") == "aaa"\nassert solution("A__") == "a__"\nassert solution("ABC..DEF.") == "abc.def"\nassert solution("abcdefghijklmnop") == "abcdefghijklmno"\n'
  const result = spawnSync('python3', ['-c', first('solutions/pg-72410.md') + checks], {
    encoding: 'utf8',
    timeout: 5000,
  })
  assert.equal(result.status, 0, result.stderr)
})

test('SQL corrections preserve aggregate cardinality and integer fees (SQLite dialect adapter)', (t) => {
  const probe = spawnSync('python3', ['--version'])
  if (probe.error?.code === 'ENOENT') return t.skip('python3/sqlite3 is needed for SQL fixtures')
  // SQLite only verifies these relational/arithmetic fixtures, not Oracle runtime compatibility.
  const code = `import json, sys, sqlite3, re, math
q = json.load(sys.stdin)
db = sqlite3.connect(':memory:')
db.create_function('TRUNC', 1, math.trunc)
db.executescript('''
CREATE TABLE FIRST_HALF(FLAVOR TEXT PRIMARY KEY, TOTAL_ORDER INTEGER);
CREATE TABLE JULY(FLAVOR TEXT, TOTAL_ORDER INTEGER);
INSERT INTO FIRST_HALF VALUES ('A',100),('B',150),('C',130),('D',120);
INSERT INTO JULY VALUES ('A',1),('A',1),('B',1),('C',1),('D',1);
CREATE TABLE CAR_RENTAL_COMPANY_CAR(CAR_ID INTEGER, CAR_TYPE TEXT, DAILY_FEE INTEGER);
CREATE TABLE CAR_RENTAL_COMPANY_DISCOUNT_PLAN(CAR_TYPE TEXT, DURATION_TYPE TEXT, DISCOUNT_RATE REAL);
CREATE TABLE CAR_RENTAL_COMPANY_RENTAL_HISTORY(CAR_ID INTEGER, START_DATE TEXT, END_DATE TEXT);
INSERT INTO CAR_RENTAL_COMPANY_CAR VALUES (1,'SUV',30001),(2,'SUV',30000),(3,'SUV',50000),(4,'SUV',10000),(5,'SUV',100000);
INSERT INTO CAR_RENTAL_COMPANY_DISCOUNT_PLAN VALUES ('SUV','30일 이상',7.0);
INSERT INTO CAR_RENTAL_COMPANY_RENTAL_HISTORY VALUES (3,'2022-10-30','2022-11-01');
''')
aggregate = re.sub(r'WHERE\\s+ROWNUM\\s*<=\\s*3', 'LIMIT 3', q['aggregate'], flags=re.I)
assert db.execute(aggregate).fetchall() == [('B',),('C',),('D',)]
fees = re.sub(r"DATE\\s+('.*?')", r'\\1', q['fees'])
assert db.execute(fees).fetchall() == [(1,'SUV',837027),(2,'SUV',837000)]
`
  const result = spawnSync('python3', ['-c', code], {
    encoding: 'utf8',
    timeout: 5000,
    input: JSON.stringify({
      aggregate: first('solutions/pg-133027.md'),
      fees: first('solutions/pg-157339.md'),
    }),
  })
  assert.equal(result.status, 0, result.stderr)
})

test('robot initialization stays within arrays under address/undefined sanitizers', (t) => {
  const probe = spawnSync('clang++', ['--version'])
  if (probe.error?.code === 'ENOENT') return t.skip('clang++ is needed for the C++ sanitizer check')
  const dir = mkdtempSync(join(tmpdir(), 'blog-robot-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const binary = join(dir, 'robot')
  const compiled = spawnSync(
    'clang++',
    [
      '-std=c++17',
      '-fsanitize=address,undefined',
      '-fno-sanitize-recover=all',
      '-x',
      'c++',
      '-',
      '-o',
      binary,
    ],
    { encoding: 'utf8', timeout: 30000, input: first('solutions/boj-2174.md') },
  )
  assert.equal(compiled.status, 0, compiled.stderr)
  const maxRobots = Array.from({ length: 100 }, (_, i) => `${i + 1} 1 N`).join('\n')
  for (const [input, expected] of [
    ['1 1 1 1\n1 1 N\n1 F 1\n', 'Robot 1 crashes into the wall'],
    ['2 1 2 1\n1 1 E\n2 1 W\n1 F 1\n', 'Robot 1 crashes into robot 2'],
    [`100 100 100 1\n${maxRobots}\n1 F 99\n`, 'OK'],
  ]) {
    const run = spawnSync(binary, [], { encoding: 'utf8', input, timeout: 5000 })
    assert.equal(run.status, 0, run.stderr)
    assert.equal(run.stdout.trim(), expected)
  }
})
