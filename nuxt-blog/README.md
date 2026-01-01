# nuxt-blog

> CG.Lee's personal blog created with JAMStack Nuxt.js

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Nuxt.js 2.x |
| UI | Bulma CSS |
| Icons | Font Awesome |
| Effects | vue-particles |
| Modules | @nuxtjs/pwa, @nuxtjs/sitemap |

## Project Structure

```
nuxt-blog/
├── assets/           # Static assets (images)
├── components/       # Vue components
│   └── AppLogo.vue
├── layouts/          # Page layouts
│   └── default.vue
├── middleware/       # Route middleware
├── pages/            # Application pages
│   └── index.vue     # Main landing page
├── plugins/          # Vue plugins
│   └── vue-particles.js
├── static/           # Static files
│   └── favicon.ico
├── store/            # Vuex store
├── nuxt.config.js    # Nuxt configuration
├── package.json
├── Dockerfile
└── docker-compose.yml
```

## Setup

```bash
# Install dependencies
yarn install

# Serve with hot reload at localhost:3000
yarn dev

# Build for production and launch server
yarn build
yarn start

# Generate static project
yarn generate
```

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t chulgil-me .
docker run -p 3000:3000 chulgil-me
```

## Configuration

Main configuration is in `nuxt.config.js`:

- **PWA**: Enabled for mobile app-like experience
- **Sitemap**: Auto-generated at `/sitemap.xml`
- **SEO**: Open Graph and Twitter Card meta tags configured

## Links

- **Live Site**: https://chulgil.me
- **Nuxt.js Docs**: https://nuxtjs.org/docs
