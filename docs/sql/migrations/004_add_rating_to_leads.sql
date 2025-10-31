-- Migration: Add rating field to leads table
-- Date: 2024

-- Add rating column to leads table (1-5 stars, nullable)
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Create index for filtering by rating
CREATE INDEX IF NOT EXISTS idx_leads_rating ON public.leads(rating);

-- Add comment
COMMENT ON COLUMN public.leads.rating IS 'Star rating from 1 to 5 for lead quality/priority';

