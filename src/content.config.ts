import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

/**
 * posts — 현재 쓰는 글. 파일명이 그대로 URL이 되므로 ASCII 슬러그로 만듭니다.
 */
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    /** 목록·검색결과·SNS 카드에 함께 쓰이므로 한 문장으로 씁니다. */
    description: z.string(),
    /**
     * 원인 한 줄. 이 사이트의 시그니처 블록으로 제목 아래와 홈 히어로에 나옵니다.
     * 증상이 아니라 원인을 한두 문장으로. 없으면 description이 그 자리에 나옵니다.
     */
    cause: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum([
      'data-integrity',
      'performance',
      'operations',
      'legacy',
      'auth-security',
    ]),
    tags: z.array(z.string()).default([]),
    /** true인 글은 빌드 결과에서 빠집니다. 초안을 저장소에 두고 다듬을 때 씁니다. */
    draft: z.boolean().default(false),
  }),
})

/**
 * notes — 2022~2023년 프론트엔드 학습 노트 아카이브.
 * 새로 쓰지 않고 보존만 합니다. 스키마를 느슨하게 둔 것은 과거 글을 고쳐 쓰지 않기 위해서입니다.
 */
const notes = defineCollection({
  loader: glob({
    base: './src/content/notes',
    pattern: '**/*.md',
    generateId: ({ data }) => data.slug as string,
  }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      title: z.string(),
      /** 노션 TIL DB의 작성일시. 블로그 발행일이 아니라 노트를 처음 쓴 날이다. */
      date: z.coerce.date(),
      /** 노션 TIL DB의 최종 수정일 */
      updated: z.coerce.date().optional(),
      summary: z.string().default(''),
      categories: z.array(z.string()).default([]),
      thumbnail: image().optional(),
      /** Gatsby 시절 URL. 리다이렉트 생성에 씁니다. */
      legacyPath: z.string().optional(),
    }),
})

/**
 * wiki — 공부하면서 그때그때 쌓는 지식. 날짜순으로 흘려보내지 않고 주제별로 갱신합니다.
 * 완성도가 낮아도 올립니다. status로 어느 정도 익은 글인지만 표시합니다.
 */
const wiki = defineCollection({
  loader: glob({ base: './src/content/wiki', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    topic: z.enum(['java', 'spring', 'database', 'dotnet', 'web', 'infra', 'cs', 'etc']),
    tags: z.array(z.string()).default([]),
    created: z.coerce.date(),
    updated: z.coerce.date().optional(),
    /**
     * seed   — 메모 수준. 뼈대만 있음
     * growing — 내용은 있지만 더 채울 계획
     * stable — 당분간 더 볼 일 없음
     */
    status: z.enum(['seed', 'growing', 'stable']).default('seed'),
    draft: z.boolean().default(false),
  }),
})

/**
 * solutions — 알고리즘 풀이. 본문은 본인이 작성한 코드만 담는다.
 * 문제 지문과 예제 입출력은 원 사이트의 저작물이라 싣지 않고 링크로 보낸다.
 */
const solutions = defineCollection({
  loader: glob({ base: './src/content/solutions', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    site: z.enum(['백준', '프로그래머스']),
    tier: z.string(),
    /** 티어 정렬용 숫자. 높을수록 상위 */
    rank: z.number(),
    num: z.string(),
    categories: z.array(z.string()).default([]),
    memory: z.string().default(''),
    runtime: z.string().default(''),
    problemUrl: z.string().default(''),
    langs: z.array(z.string()).default([]),
  }),
})

export const collections = { posts, notes, wiki, solutions }
