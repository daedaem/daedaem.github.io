import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import { SITE } from './src/consts.ts'
import remarkNoteHeadings from './src/plugins/remark-note-headings.mjs'
import rehypeContentFixups from './src/plugins/rehype-content-fixups.mjs'

export default defineConfig({
  site: SITE.url,
  integrations: [mdx(), sitemap()],
  // Gatsby 시절의 한글 URL을 아카이브 주소로 넘긴다. 기존 유입과 북마크를 잃지 않기 위한 것.
  redirects: {
    '/info/': '/about/',
    '/221223_Javascript-데이터 타입/': '/notes/javascript-data-types/',
    '/221227_js-Export & Import & Class/': '/notes/javascript-export-import-class/',
    '/221230_js-Spread & RestOperators/': '/notes/javascript-spread-rest-operators/',
    '/230106_js-참조형 & 원시형 데이터타입/': '/notes/javascript-primitive-and-reference-types/',
    '/230108_코어자바스크립트 ch 1. 데이터 타입/': '/notes/core-javascript-01-data-types/',
    '/230202_코어자바스크립트 ch 2. 실행컨텍스트/': '/notes/core-javascript-02-execution-context/',
    '/230209_코어자바스크립트 ch 3. this/': '/notes/core-javascript-03-this/',
    '/230211_코어자바스크립트 ch 4. 콜백함수/': '/notes/core-javascript-04-callback/',
    '/230216_코어자바스크립트 ch 5. 클로저/': '/notes/core-javascript-05-closure/',
    '/230228_코어자바스크립트 ch 6. 프로토 타입/': '/notes/core-javascript-06-prototype/',
    '/230303_코어자바스크립트 ch 7. 클래스/': '/notes/core-javascript-07-class/',
    '/230312_모던 JS Deep Dive - 1. 프로그래밍/': '/notes/modern-js-deep-dive-01-programming/',
    '/230314_모던 JS Deep Dive - 2.자바스크립트란/':
      '/notes/modern-js-deep-dive-02-what-is-javascript/',
    '/230316_모던 JS Deep Dive - 4.변수/': '/notes/modern-js-deep-dive-04-variables/',
    '/230319_모던 JS Deep Dive - 5.표현식과 문/':
      '/notes/modern-js-deep-dive-05-expressions-and-statements/',
    '/230321_TypeScript - 0.verview/': '/notes/typescript-00-overview/',
    '/230325_TypeScript - 1.Types/': '/notes/typescript-01-types/',
    '/230327_TypeScript - 2.컴파일러 및 구성/': '/notes/typescript-02-compiler-and-config/',
    '/230331_TypeScript - 3.1 클래스/': '/notes/typescript-03-classes/',
    '/230403_TypeScript - 3.2.Interfaces/': '/notes/typescript-04-interfaces/',
    '/230406_TypeScript - 4. Advanced Type/': '/notes/typescript-05-advanced-types/',
    '/Atomic Design/': '/notes/atomic-design/',
    '/SCSA/': '/notes/scsa/',
    '/Semantic HTML/': '/notes/semantic-html/',
    '/블록체인(Blockchain)/': '/notes/blockchain/',
    '/첫 글/': '/notes/first-post/',
  },
  markdown: {
    remarkPlugins: [remarkNoteHeadings],
    rehypePlugins: [rehypeContentFixups],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
})
