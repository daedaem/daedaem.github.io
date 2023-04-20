module.exports = {
  siteMetadata: {
    title: `주니어 프론트엔드 개발자 대댐의 개발 블로그`,
    description: `주니어 프론트엔드 개발자로서의 생각과 공부하는 내용을 정리하는 블로그입니다.`,
    author: `Hae-sung Cho`,
    siteUrl: 'https://daedaem.netlify.app/', // 배포 후 변경 예정
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-typescript',
      options: {
        isTSX: true,
        allExtensions: true,
      },
    },
    `gatsby-plugin-emotion`,
    `gatsby-plugin-react-helmet`, //seo최적화를 위한 플러그인
    {
      resolve: `gatsby-source-filesystem`, //로컬 파일 시스템에서 Gatsby 애플리케이션으로 데이터를 소싱하기 위한 Gatsby 플러그인.
      options: {
        name: `contents`,
        path: `${__dirname}/contents`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/static`,
      },
    },
    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        formats: ['auto', 'webp'],
        quality: 100,
        placeholder: 'blurred',
        transformOptions: {
          fit: 'COVER',
        },
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-transformer-remark`, //gatsby에서 마크다운을 html로 변환하는 작업하는 플러그인
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-smartypants',
            options: {
              dashes: 'oldschool',
            },
          },
          {
            resolve: 'gatsby-remark-prismjs', // 코드 하이라이팅을 위한 플러그인, npm  i prismjs
            options: {
              classPrefix: 'language-',
            },
          },
          {
            resolve: 'gatsby-remark-images', //마크다운 처리시, 이미지 코드를 만나면 이미지 노드 생성
            options: {
              maxWidth: 768,
              quality: 100,
              withWebp: true,
              wrapperStyle: () => '',
            },
          },
          {
            resolve: 'gatsby-remark-copy-linked-files',
            options: {},
          },
          {
            resolve: 'gatsby-remark-external-links',
            options: {
              target: '_blank',
              rel: 'nofollow',
            },
          },
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-canonical-urls',
      options: {
        siteUrl: 'https://daedaem.netlify.app/',
        stripQueryString: true,
      },
    },
    'gatsby-plugin-sitemap',
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        policy: [{ userAgent: '*', allow: '/' }],
      },
    },
  ],
}
