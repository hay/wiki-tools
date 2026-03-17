# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is
Depictor is a Vue 3 + TypeScript SPA for vetting Wikimedia Commons images against Wikidata items using the P180 (depicts) property. Users are shown candidate images and can confirm or deny whether a Wikidata item is depicted. It includes a challenge/gamification system and Wikimedia OAuth integration.

## Build Commands

```bash
npm run watch        # Vite dev server on localhost:5173
npm run build        # Development build with source maps
npm run dist         # Production build (minified, fetches fresh locales first)
npm run typecheck    # TypeScript validation via vue-tsc
npm run update-locales  # Fetch translations from Toolforge
```

PHP backend has its own composer setup:
```bash
cd api && composer install
```

## Architecture

### State Flow
The Pinia store (`js/store.ts`) is the single source of truth. `app.vue` parses URL params and dispatches query actions; `store.ts` drives the screen state machine via the `screenState` computed. Components read state via `storeToRefs()`.

### Screen State Machine
`screenState` in the store determines which `screen-*.vue` is rendered by `app.vue`:
- `intro` → `screen-intro.vue` (query entry)
- `game` → `screen-game.vue` (main loop: candidates × items)
- `challenge` → `screen-challenge.vue` (leaderboard/overview)
- `createchallenge` → `screen-createchallenge.vue`
- `message` → `screen-message.vue` (loading/error)

### Query Types
Four query modes feed `runQuery()` in the store: `year` (birth year), `category` (Commons category), `qid` (Wikidata QID), `sparql` (raw SPARQL). All produce a candidates list (Commons files) and an items list (Wikidata entities).

### API Layers
- `js/api.ts` — wraps the local PHP endpoint at `./api/index.php` (POST for edits, GET for reads)
- `js/mwapi/` — direct MediaWiki API wrappers (Commons, Wikidata, SPARQL, Wikipedia)

### PHP Backend (`api/`)
- `index.php` routes to `class-api.php` actions
- `class-oauth.php` handles Wikimedia OAuth token exchange
- `class-db.php` is a thin PDO wrapper
- Auth state and user context are injected into `window.__ctx__` from `index.php` (the root PHP entry point)

### Internationalization
Translations live in `locales.json` (generated, not hand-edited). Run `npm run update-locales` to fetch from Toolforge. Components use vue-i18n's `$t()`. Locale is detected from URL params with `en` as fallback.

### Build Output
Vite outputs `bundle.js` and `style.css` (plus chunks) to the project root. The PHP `index.php` loads these via the Vite manifest when `"use_vite": true` in tool config.

## Key Constants (`js/const.ts`)
`IMAGE_SIZE` (500), `THUMB_SIZE` (330), `MIN_CANDIDATES_FOR_CHALLENGE` (100), `MIN_ITEMS_FOR_CHALLENGE` (10), birth year bounds for people queries.

## TypeScript Notes
- Path alias `@/*` resolves to `js/*`
- Global types (including `window.__ctx__`) are in `js/types.d.ts`
- Strict mode is on except `noImplicitAny`