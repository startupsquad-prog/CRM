# UI Guardrails (Leak-Proof)
- Reserve header space: main padding-top 64px; headings with scroll-margin-top.
- Sidebar spacer column; width 280px.
- z-index tokens: 10/20/30/40/9999.
- Modals: lock body scroll; restore focus.
- Tables: sticky header; virtualize >200 rows.
- Forms: label+helper+error; zod validation.
- Dark mode: avoid pure black; use tokens.
