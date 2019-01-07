module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'CG.Lee',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js project' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: '#ffc107' },
      { name: 'apple-mobile-web-app-title', content: 'CG.Lee' },
      { name: 'theme-color', content: '#f4f4f4' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { hid: 'og:type', name: 'og:type', property:'og:type' , content: 'website' },
      { hid: 'og:title', name: 'og:title', property:'og:title' , content: 'About CG.Lee' },
      { hid: 'og:site_name', name: 'og:site_name', property:'og:site_name' , content: 'CG.Lee' },
      { hid: 'og:description', name: 'og:description', property:'og:description', 
        content: 'CG.Lee`s pasonal blog created with JAMStack Nuxt.js', 'template': chunk => `${chunk} - Blog `},
      { hid: 'og:image', name: 'og:image', property:'og:image' , content: 'https://esl.chulgil.me/content/images/2019/01/chulgil.me-4.png' },
      { hid: 'twitter:card', name: 'twitter:card', property:'twitter:card' , content: 'summary' },        
      { hid: 'twitter:site', name: 'twitter:site', property:'twitter:site' , content: 'https://chulgil.me' },        
      { hid: 'twitter:title', name: 'twitter:title', property:'twitter:title' , content: 'About CG.Lee' },        
      { hid: 'twitter:description', name: 'twitter:description', property:'twitter:description' , content: 'CG.Lee`s pasonal blog created with JAMStack Nuxt.js' },        
      { hid: 'twitter:image', name: 'twitter:image', property:'twitter:image' , content: 'https://esl.chulgil.me/content/images/2019/01/chulgil150.png' },        
    ],
    link: [
      {
        rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.min.css'
      },
      { rel: 'icon', type: 'image/x-icon', href: 'favicon.ico?v=2' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },
  plugins: [
    {src:"~plugins/vue-particles",ssr:false}
  ],
  css: [
    '@fortawesome/fontawesome-free-webfonts',
    '@fortawesome/fontawesome-free-webfonts/css/fa-brands.css',
    '@fortawesome/fontawesome-free-webfonts/css/fa-regular.css',
    '@fortawesome/fontawesome-free-webfonts/css/fa-solid.css',
  ],
  modules: [
    '@nuxtjs/pwa',
    '@nuxtjs/sitemap'
  ],
  sitemap: {
    path: '/sitemap.xml',
    hostname: 'https://chulgil.me',
    cacheTime: 1000 * 60 * 15,
    gzip: true,
    generate: false, // Enable me when using nuxt generate
  }  
}

