# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Electron 28** - Desktop shell
- **React 19.0.0** - UI framework
- **Vite+ (vp)** - Build tool (voidzero's unified toolchain, not plain Vite)
- **TypeScript (tsgo)** - Go-rewrite TypeScript compiler (`@typescript/native-preview`)
- **Tailwind CSS 4** - CSS (Lightning CSS, no PostCSS)
- **sql.js** - SQLite in WASM, persisted to file
- **shadcn/ui + Radix UI** - Component library

## Commands

```bash
# Development
npm run dev              # Vite+ dev server (port via vite-plus)
npm run electron:dev     # Dev server + Electron main process

# Build
npm run build            # tsgo + vp build + electron build
npm run build:electron   # Electron main/preload only (esbuild)
npm run electron:build   # Full packaged app via electron-builder

# Type check & test
npm run typecheck        # tsgo --noEmit
npm test                 # vite-plus test (vitest)
npm test -- path/to/file # Run specific test file
```

## Architecture

### Process Model
- **Main Process** (`electron/`) - Electron main, database, notifications, IPC handlers
- **Renderer Process** (`src/`) - React app, routed via `AppRouter`
- Main/preload built separately via esbuild (not bundled with Vite)

### Database
- `electron/database.ts` - sql.js wrapper, persisted to `app.getPath('userData')/tomato-clock.db`
- Loaded on app ready, saved after each write, saved on `before-quit`
- Renderer communicates via IPC: `db-save-session`, `db-get-today-stats`, `db-get-week-stats`, `db-clear-all`

### Routing
- `src/router.tsx` - `BrowserRouter` with routes `/` (TimerPage) and `/stats` (StatsPage)
- `src/DatabaseProvider` - React context providing database operations

### Key Hooks
- `useTimer` - Timer state machine (work/shortBreak/longBreak), interval management
- `useDatabase` - Context consumer for DB operations
- `useNotification` - System notification, floating window, sound

## React 19 Notes

- **React Compiler enabled** in `vite.config.ts` - `useCallback` not needed, compiler handles memoization
- **forwardRef deprecated** - ref is a normal prop; `Button`, `Card` components migrated
- **use() hook** - Can replace `useContext` for cleaner consumption
- **Progress component** retains `forwardRef` due to Radix UI type complexity

## Path Aliases

- `@/*` maps to `src/*` (defined in both tsconfig.json and vite.config.ts)

## Build Output

- `dist/` - Vite build output (HTML, JS, CSS)
- `dist-electron/` - esbuild output (main.js, preload.js)
- electron-builder packages from `dist/` + `dist-electron/` + `package.json`
