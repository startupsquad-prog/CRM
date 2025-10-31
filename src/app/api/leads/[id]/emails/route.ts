import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/leads/[id]/emails - Get all emails for a lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const leadId = resolvedParams.id

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('lead_emails')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching emails:', error)
      return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 })
    }

    return NextResponse.json({ emails: data || [] })
  } catch (error) {
    console.error('Error in GET /api/leads/[id]/emails:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/leads/[id]/emails - Send/log an email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const leadId = resolvedParams.id

    const body = await request.json()
    const { 
      subject, 
      body: emailBody, 
      to_email, 
      from_email,
      cc_emails = [],
      bcc_emails = [],
      direction = 'sent',
      metadata = {}
    } = body

    if (!subject || !emailBody || !to_email || !from_email) {
      return NextResponse.json({ 
        error: 'Subject, body, to_email, and from_email are required' 
      }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get lead to verify it exists
    const { data: lead } = await supabase
      .from('leads')
      .select('email, full_name')
      .eq('id', leadId)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Create email record
    // In production, you would actually send the email here (e.g., using Resend, SendGrid, etc.)
    // For now, we'll create a record with status 'sent' to simulate sending
    const { data, error } = await supabase
      .from('lead_emails')
      .insert({
        lead_id: leadId,
        direction,
        subject,
        body: emailBody,
        from_email,
        to_email: to_email || lead.email || '',
        cc_emails: Array.isArray(cc_emails) ? cc_emails : [],
        bcc_emails: Array.isArray(bcc_emails) ? bcc_emails : [],
        status: 'sent', // In dummy mode, mark as sent immediately
        sent_at: new Date().toISOString(),
        metadata,
        created_by: userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating email:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    // TODO: In production, integrate with actual email service (Resend, SendGrid, etc.)
    // const emailService = new EmailService()
    // await emailService.send({
    //   to: to_email,
    //   from: from_email,
    //   subject,
    //   body: emailBody,
    //   cc: cc_emails,
    //   bcc: bcc_emails,
    // })

    return NextResponse.json({ 
      email: data,
      message: 'Email logged successfully (dummy mode - email not actually sent)'
    })
  } catch (error) {
    console.error('Error in POST /api/leads/[id]/emails:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

