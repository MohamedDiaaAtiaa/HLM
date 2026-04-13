import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { Resend } from 'resend';
import { getClientReplyEmail } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = 'info@hlm-legal.com'; // Use your verified domain email

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { ticketId, replyText } = await req.json();

    if (!ticketId || !replyText) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Fetch the ticket to get email + language
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('email, lang, id')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Insert the reply into the database
    const { data: insertedReply, error: replyError } = await supabaseAdmin
      .from('ticket_replies')
      .insert([{ ticket_id: ticketId, reply_text: replyText }])
      .select()
      .single();

    if (replyError) {
      console.error('Reply insert error:', replyError);
      return NextResponse.json({ error: 'Failed to save reply' }, { status: 500 });
    }

    // Update ticket status to 'replied'
    await supabaseAdmin
      .from('tickets')
      .update({ status: 'replied' })
      .eq('id', ticketId);

    // Send the email via Resend
    const subjectContent = ticket.lang === 'ar' 
      ? `رد رسمي: HLM للاستشارات القانونية — المرجع #${ticket.id.split('-')[1]}`
      : `Official Response: HLM Law Advocates — Ref #${ticket.id.split('-')[1]}`;

    const htmlContent = getClientReplyEmail(replyText, ticket.lang);

    await resend.emails.send({
      from: `HLM Law Advocates <${fromEmail}>`,
      to: ticket.email,
      subject: subjectContent,
      html: htmlContent
    });

    // Return the fresh replies array to update UI
    const { data: fullReplies } = await supabaseAdmin
      .from('ticket_replies')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    return NextResponse.json({ success: true, replies: fullReplies });
  } catch (error) {
    console.error('Reply API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
