-- Migration: Lead Activity Tracking
-- This migration creates tables for tracking all lead interactions:
-- - Internal notes
-- - Calls
-- - Emails (sent/received)
-- - Callbacks/Follow-ups
-- - Activity history/log
-- Date: 2025-01-XX

-- ============================================
-- PART 1: Lead Activities Table (Main log)
-- ============================================
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('note', 'call', 'email', 'stage_change', 'callback', 'meeting', 'other')),
  created_by UUID NOT NULL, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Activity metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}',
  
  -- Foreign key references to specific activity tables
  note_id UUID REFERENCES public.lead_notes(id) ON DELETE CASCADE,
  call_id UUID REFERENCES public.lead_calls(id) ON DELETE CASCADE,
  email_id UUID REFERENCES public.lead_emails(id) ON DELETE CASCADE,
  callback_id UUID REFERENCES public.lead_callbacks(id) ON DELETE CASCADE,
  
  -- Description/summary
  description TEXT,
  
  -- Indexes
  CONSTRAINT lead_activities_type_check CHECK (activity_type IN ('note', 'call', 'email', 'stage_change', 'callback', 'meeting', 'other'))
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON public.lead_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON public.lead_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_by ON public.lead_activities(created_by);

-- ============================================
-- PART 2: Lead Notes Table (Internal notes)
-- ============================================
CREATE TABLE IF NOT EXISTS public.lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false, -- Private notes only visible to creator
  created_by UUID NOT NULL, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Optional tags/categories
  tags TEXT[] DEFAULT '{}',
  
  -- Indexes
  CONSTRAINT lead_notes_content_check CHECK (char_length(content) > 0)
);

CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON public.lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_created_at ON public.lead_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_notes_created_by ON public.lead_notes(created_by);

-- ============================================
-- PART 3: Lead Calls Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.lead_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL CHECK (call_type IN ('inbound', 'outbound', 'missed')),
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  duration_seconds INTEGER DEFAULT 0,
  call_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Call details
  phone_number TEXT,
  outcome TEXT CHECK (outcome IN ('answered', 'voicemail', 'no_answer', 'busy', 'failed')),
  notes TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_calls_lead_id ON public.lead_calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_calls_call_date ON public.lead_calls(call_date DESC);
CREATE INDEX IF NOT EXISTS idx_lead_calls_type ON public.lead_calls(call_type);

-- ============================================
-- PART 4: Lead Emails Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.lead_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('sent', 'received')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  cc_emails TEXT[] DEFAULT '{}',
  bcc_emails TEXT[] DEFAULT '{}',
  
  -- Email status
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_emails_lead_id ON public.lead_emails(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_emails_sent_at ON public.lead_emails(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_emails_status ON public.lead_emails(status);
CREATE INDEX IF NOT EXISTS idx_lead_emails_direction ON public.lead_emails(direction);

-- ============================================
-- PART 5: Lead Callbacks Table (Follow-ups)
-- ============================================
CREATE TABLE IF NOT EXISTS public.lead_callbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  callback_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'missed', 'cancelled')) DEFAULT 'scheduled',
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Reminder settings
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_callbacks_lead_id ON public.lead_callbacks(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_callbacks_date ON public.lead_callbacks(callback_date);
CREATE INDEX IF NOT EXISTS idx_lead_callbacks_status ON public.lead_callbacks(status);
CREATE INDEX IF NOT EXISTS idx_lead_callbacks_scheduled ON public.lead_callbacks(callback_date, status) 
  WHERE status = 'scheduled' AND callback_date >= NOW();

-- ============================================
-- PART 6: Update triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lead_activities_updated_at
  BEFORE UPDATE ON public.lead_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_notes_updated_at
  BEFORE UPDATE ON public.lead_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_calls_updated_at
  BEFORE UPDATE ON public.lead_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_emails_updated_at
  BEFORE UPDATE ON public.lead_emails
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_callbacks_updated_at
  BEFORE UPDATE ON public.lead_callbacks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 7: Function to auto-create activity log entry
-- ============================================
CREATE OR REPLACE FUNCTION create_activity_log()
RETURNS TRIGGER AS $$
DECLARE
  activity_description TEXT;
  activity_meta JSONB;
BEGIN
  -- Determine activity description and metadata based on table
  IF TG_TABLE_NAME = 'lead_notes' THEN
    activity_description := 'Internal note added';
    activity_meta := jsonb_build_object(
      'note_id', NEW.id,
      'is_private', NEW.is_private,
      'tags', NEW.tags
    );
    INSERT INTO public.lead_activities (
      lead_id, activity_type, created_by, description, note_id, metadata
    ) VALUES (
      NEW.lead_id, 'note', NEW.created_by, activity_description, NEW.id, activity_meta
    );
    
  ELSIF TG_TABLE_NAME = 'lead_calls' THEN
    activity_description := format('%s call - %s', NEW.call_type, COALESCE(NEW.outcome, 'unknown'));
    activity_meta := jsonb_build_object(
      'call_id', NEW.id,
      'duration_seconds', NEW.duration_seconds,
      'outcome', NEW.outcome
    );
    INSERT INTO public.lead_activities (
      lead_id, activity_type, created_by, description, call_id, metadata
    ) VALUES (
      NEW.lead_id, 'call', NEW.created_by, activity_description, NEW.id, activity_meta
    );
    
  ELSIF TG_TABLE_NAME = 'lead_emails' THEN
    activity_description := format('Email %s: %s', NEW.direction, NEW.subject);
    activity_meta := jsonb_build_object(
      'email_id', NEW.id,
      'status', NEW.status,
      'from', NEW.from_email,
      'to', NEW.to_email
    );
    INSERT INTO public.lead_activities (
      lead_id, activity_type, created_by, description, email_id, metadata
    ) VALUES (
      NEW.lead_id, 'email', NEW.created_by, activity_description, NEW.id, activity_meta
    );
    
  ELSIF TG_TABLE_NAME = 'lead_callbacks' THEN
    activity_description := format('Callback scheduled for %s', NEW.callback_date);
    activity_meta := jsonb_build_object(
      'callback_id', NEW.id,
      'priority', NEW.priority,
      'status', NEW.status
    );
    INSERT INTO public.lead_activities (
      lead_id, activity_type, created_by, description, callback_id, metadata
    ) VALUES (
      NEW.lead_id, 'callback', NEW.created_by, activity_description, NEW.id, activity_meta
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-activity logging
CREATE TRIGGER create_activity_for_note
  AFTER INSERT ON public.lead_notes
  FOR EACH ROW
  EXECUTE FUNCTION create_activity_log();

CREATE TRIGGER create_activity_for_call
  AFTER INSERT ON public.lead_calls
  FOR EACH ROW
  EXECUTE FUNCTION create_activity_log();

CREATE TRIGGER create_activity_for_email
  AFTER INSERT ON public.lead_emails
  FOR EACH ROW
  EXECUTE FUNCTION create_activity_log();

CREATE TRIGGER create_activity_for_callback
  AFTER INSERT ON public.lead_callbacks
  FOR EACH ROW
  EXECUTE FUNCTION create_activity_log();

-- ============================================
-- PART 8: RLS (Row Level Security) Policies
-- ============================================
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_callbacks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read activities for leads they have access to
CREATE POLICY "Users can view lead activities for accessible leads"
  ON public.lead_activities FOR SELECT
  USING (true); -- Will be refined with proper RLS based on lead access

CREATE POLICY "Users can create activities"
  ON public.lead_activities FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own activities"
  ON public.lead_activities FOR UPDATE
  USING (created_by::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Notes policies
CREATE POLICY "Users can view lead notes for accessible leads"
  ON public.lead_notes FOR SELECT
  USING (true);

CREATE POLICY "Users can create notes"
  ON public.lead_notes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notes"
  ON public.lead_notes FOR UPDATE
  USING (created_by::text = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own notes"
  ON public.lead_notes FOR DELETE
  USING (created_by::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Calls policies
CREATE POLICY "Users can view lead calls for accessible leads"
  ON public.lead_calls FOR SELECT
  USING (true);

CREATE POLICY "Users can create calls"
  ON public.lead_calls FOR INSERT
  WITH CHECK (true);

-- Emails policies
CREATE POLICY "Users can view lead emails for accessible leads"
  ON public.lead_emails FOR SELECT
  USING (true);

CREATE POLICY "Users can create emails"
  ON public.lead_emails FOR INSERT
  WITH CHECK (true);

-- Callbacks policies
CREATE POLICY "Users can view lead callbacks for accessible leads"
  ON public.lead_callbacks FOR SELECT
  USING (true);

CREATE POLICY "Users can create callbacks"
  ON public.lead_callbacks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update callbacks"
  ON public.lead_callbacks FOR UPDATE
  USING (true);

-- ============================================
-- PART 9: Comments for Documentation
-- ============================================
COMMENT ON TABLE public.lead_activities IS 'Main activity log for all lead interactions';
COMMENT ON TABLE public.lead_notes IS 'Internal notes for leads (can be private)';
COMMENT ON TABLE public.lead_calls IS 'Call log for inbound/outbound calls';
COMMENT ON TABLE public.lead_emails IS 'Email log for sent/received emails';
COMMENT ON TABLE public.lead_callbacks IS 'Scheduled callbacks/follow-ups for leads';
COMMENT ON COLUMN public.lead_callbacks.callback_date IS 'Next scheduled callback date';
COMMENT ON COLUMN public.lead_notes.is_private IS 'Private notes only visible to creator';

-- ============================================
-- Migration Complete
-- ============================================

