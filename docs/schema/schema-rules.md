# Schema Rules
Additive-first; backfill; swap; drop later. snake_case; singular entities; junctions.
UUID ids; timestamps default now(); soft delete via deleted_at + partial idx.
RLS default deny; explicit policies. Align to UI flows; update ERD.
