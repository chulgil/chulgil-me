# chulgil.me

> CG.Lee's Personal Website

JAMStack Nuxt.js로 제작된 개인 웹사이트/명함 사이트입니다.

## Overview

| Item | Description |
|------|-------------|
| **Domain** | https://chulgil.me |
| **Framework** | Nuxt.js 2.x |
| **UI** | Bulma CSS |
| **Deploy** | Docker |

## Project Structure

```
chulgil-me/
└── nuxt-blog/          # Main Nuxt.js application
    ├── assets/         # Static assets (images, etc.)
    ├── components/     # Vue components
    ├── layouts/        # Page layouts
    ├── pages/          # Application pages
    ├── plugins/        # Vue plugins
    ├── static/         # Static files (favicon, etc.)
    └── store/          # Vuex store
```

## Features

- Single-page personal profile/business card
- Particle animation background
- Social media links (Twitter, Facebook, Instagram, GitHub)
- QR code display
- PWA support
- SEO optimized (Open Graph, Twitter Card, Sitemap)

## Tech Stack

- **Framework**: Nuxt.js 2.x
- **UI Framework**: Bulma CSS
- **Icons**: Font Awesome
- **Effects**: vue-particles
- **Modules**: @nuxtjs/pwa, @nuxtjs/sitemap

## Quick Start

```bash
cd nuxt-blog

# Install dependencies
yarn install

# Development server (localhost:3000)
yarn dev

# Production build
yarn build
yarn start

# Static generation
yarn generate
```

## Docker

```bash
cd nuxt-blog
docker-compose up -d
```

## Author

**Chulgil Lee**
- Email: contact@chulgil.me
- Website: https://chulgil.me
- GitHub: https://github.com/chulgil