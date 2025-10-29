## Architecture Overview

- **App**: `src/app` (Next.js App Router)
- **UI**: `src/components/ui` (shadcn/ui components)
- **Styles**: `src/styles` (`tokens.css`, `globals.css`)
- **Lib**: `src/lib` (clients, utils, providers)
- **Constants**: `src/constants` (`brand.ts` single source of truth)
- **Types**: `src/types`
- **Docs**: `docs/*`

### Conventions
- Dark mode via `class` on `<html>`.
- Always use global tokens from `src/styles/tokens.css` instead of inline colors.
- Import order: react/external → internal (`@/**`) → relative.
- Each feature folder must include a `README.md`.


