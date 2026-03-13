# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is
A collection of Wikimedia-related web tools (Wikipedia, Wikidata, Wikimedia Commons, etc.) by Hay Kranen. Each tool lives in its own subdirectory under `public_html/` and shares a common PHP/Twig framework.

## Setup
1. Copy `lib/config-sample.php` to `lib/config.php` and fill in credentials
2. Run `composer install` in `lib/`
3. Run `bower install` in root
4. Start with Docker: `docker-compose up -d` → `http://localhost:4080/`

Individual Node-based tools (e.g. Depictor) also require `npm install` inside their directory.

## Architecture

### Core Framework
- `lib/class-hay.php` — central class; loads tool metadata, renders headers/footers, handles Vite/webpack manifests
- `lib/tools.json` — registry of all tools with metadata
- `lib/class-templaterenderer.php` — Twig wrapper (templates in `templates/`, cached in `cache/`)
- `lib/config.php` — runtime config (DB, OAuth, debug mode)

### Tool Pattern
Each tool is a directory in `public_html/{toolname}/`. Two patterns exist:

**Simple (PHP/jQuery):** `index.php` bootstraps via the `Hay` class, outputs HTML with Twig templates, uses shared jQuery/Bootstrap from `public_html/common/`.

**Complex (Vue.js SPA):** Has its own `package.json`, `js/`, `scss/` source dirs, and produces compiled `bundle.js`/`style.css`. Uses webpack or Vite. Examples: `depictor/`, `vizquery/`.

### Key Shared Assets
- `public_html/common/` — shared jQuery, Bootstrap, Angular, SCSS
- `templates/` — Twig partials (header, footer, etc.)

### Backend Libraries (`lib/`)
- `class-directoryapi.php` — tools directory DB API
- `class-util.php` — shared HTTP/XML utilities
- `class-vizquery.php` — Wikidata query helpers
- Slim 2.x micro-framework, Paris ORM, Goutte scraper, HTTPful client

## Building Individual Tools
Inside a Node-based tool directory (e.g. `public_html/depictor/`):

```bash
npm install
npm run build      # production build (JS + CSS)
npm run build:js   # webpack/Vite only
npm run build:css  # SCSS only
npm run watch      # watch mode for development
npm run dist       # optimized production output
```

## Stack
- **Backend:** PHP 8.1, MySQL 8.0, Slim 2.x, Twig ~1.0, Composer
- **Frontend (legacy tools):** jQuery 2.x, Bootstrap 3.x, Handlebars, Bower
- **Frontend (modern tools):** Vue.js 2.x, Vuex, Vue-i18n, webpack/Vite, SCSS
- **Runtime:** Docker Compose (php:8.1-apache + mysql:8.0), Node 16.x