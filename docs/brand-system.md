## Brand System

Tokens source: `src/styles/tokens.css`.

### Colors (OKLCH)
- Brand scale: `--brand-50`, `--brand-500`, `--brand-950`
- Semantic: `--bg`, `--fg`

Use in Tailwind classes via CSS variables, e.g.:
```html
<div class="bg-[oklch(var(--bg))] text-[oklch(var(--fg))]" />
```

### JS/TS
Use `src/constants/brand.ts` for colors, gradients, fonts, shadows, radius, spacing, animations.

### Dark Mode
Apply `.dark` on `<html>` to switch to dark tokens.



