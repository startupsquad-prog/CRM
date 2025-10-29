This is a Next.js 15 + TypeScript + Tailwind + ShadCN/UI + Supabase starter.

## Getting Started

Quickstart

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment

   Create a `.env.local` with:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Run the dev server

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Tech

- Next.js 15 (app router, `src/` dir)
- TypeScript
- Tailwind CSS
- ShadCN/UI (on-demand components)
- Supabase JS client
- next-themes (dark mode)

Structure

```
src/
  app/
    (marketing)/
    (dashboard)/dashboard/
    auth/
  lib/
    supabase/
  providers/
  types/
```

Commands

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - start production server
