// Supabase Edge Function: send-confirmation
// Called via Supabase Database Webhook on event_registrations INSERT
// Sends confirmation email to the newly registered attendee

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: {
    id: string
    event_id: string
    name: string
    email: string
    phone: string | null
    registered_at: string
  }
}

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json()
  if (payload.type !== 'INSERT' || payload.table !== 'event_registrations') {
    return new Response('Not applicable', { status: 200 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Fetch event details
  const { data: event } = await supabase
    .from('events')
    .select('title, date, time, location')
    .eq('id', payload.record.event_id)
    .single()

  if (!event) return new Response('Event not found', { status: 404 })

  const formattedDate = new Date(event.date).toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const emailBody = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1b3541; color: #ffffff; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #ff8a00; font-size: 28px; margin: 0;">FabLab Club</h1>
        <p style="color: #4e97b7; font-size: 12px; letter-spacing: 3px; margin-top: 4px;">WE PLAN. WE FABRICATE</p>
      </div>

      <h2 style="color: #ffffff; margin-bottom: 8px;">تم تسجيل حضورك بنجاح! 🎉</h2>
      <p style="color: rgba(255,255,255,0.6); margin-bottom: 24px;">
        مرحباً <strong style="color: #ffffff;">${payload.record.name}</strong>،
        تم تأكيد تسجيلك في الفعالية التالية:
      </p>

      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h3 style="color: #4e97b7; margin: 0 0 12px;">${event.title}</h3>
        <p style="color: rgba(255,255,255,0.7); margin: 6px 0;">📅 ${formattedDate}</p>
        <p style="color: rgba(255,255,255,0.7); margin: 6px 0;">🕐 ${event.time}</p>
        ${event.location ? `<p style="color: rgba(255,255,255,0.7); margin: 6px 0;">📍 ${event.location}</p>` : ''}
      </div>

      <p style="color: rgba(255,255,255,0.5); font-size: 14px; text-align: center; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
        نادي فاب لاب — FabLab Club
      </p>
    </div>
  `

  // Use Supabase's built-in email or Resend/SendGrid
  // Option 1: Resend (recommended)
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

  if (RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FabLab Club <noreply@fablab.club>',
        to: payload.record.email,
        subject: `تأكيد التسجيل: ${event.title}`,
        html: emailBody,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Email send failed:', err)
      return new Response(JSON.stringify({ error: err }), { status: 500 })
    }
  } else {
    console.log('No email provider configured. Email would have been sent to:', payload.record.email)
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
