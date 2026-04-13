import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
import { 
  getClientConfirmationEmailAR, 
  getClientConfirmationEmailEN, 
  getAdminNotificationEmail 
} from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = 'info@hlm-legal.com'; // Change to onboarding@resend.dev if domain not verified yet. Since user verified it, we use info@.

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, email, phone, service, message, lang } = data;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Store ticket in Supabase
    const { data: ticket, error: dbError } = await supabaseAdmin
      .from('tickets')
      .insert([
        { name, email, phone, service, message, lang, status: 'new' }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase DB Error:', dbError);
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }

    // 2. Send emails via Resend
    
    // a. To Client
    const clientSubject = lang === 'ar' 
      ? 'شكراً للتواصل معنا — H.L.M' 
      : "Thank you for contacting HLM Law — We'll be in touch";
      
    const clientHtml = lang === 'ar' 
      ? getClientConfirmationEmailAR(name, service) 
      : getClientConfirmationEmailEN(name, service);

    const emailClientPromise = resend.emails.send({
      from: `HLM Law Advocates <${fromEmail}>`,
      to: email,
      subject: clientSubject,
      html: clientHtml
    });

    // b. To Admin
    const adminHtml = getAdminNotificationEmail(ticket);
    const emailAdminPromise = resend.emails.send({
      from: `HLM Website <${fromEmail}>`,
      to: 'info@hlm-legal.com', // Admin email
      subject: `New Inquiry: HLM Law Advocates — ${ticket.id}`,
      html: adminHtml
    });

    const [clientRes, adminRes] = await Promise.all([emailClientPromise, emailAdminPromise]);

    if (clientRes.error) {
      console.error('Client Email Resend Error:', clientRes.error);
    }
    if (adminRes.error) {
      console.error('Admin Email Resend Error:', adminRes.error);
    }

    // In trial versions of Resend or unverified domains, sending to arbitrary emails blocks the API.
    // We will still consider the ticket created successfully so the user isn't shown an error if Resend fails.
    if (clientRes.error || adminRes.error) {
      return NextResponse.json({ success: true, ticketId: ticket.id, emailFailed: true });
    }

    return NextResponse.json({ success: true, ticketId: ticket.id });

  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
