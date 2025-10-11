import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const RESEND_FROM = 'winix@resend.dev';

interface EmailRequest {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  isTest?: boolean;
  barbershop_id?: number;
}

interface EmailLog {
  recipient_email: string;
  subject: string;
  status: 'sent' | 'failed' | 'queued';
  error_message?: string;
  barbershop_id?: number;
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);


async function logEmail(log: EmailLog): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('email_logs')
      .insert({
        ...log,
        sent_at: log.status === 'sent' ? new Date().toISOString() : null,
      });
    
    if (error) {
      console.error('Failed to log email:', error);
    }
  } catch (err) {
    console.error('Error logging email:', err);
  }
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error('[Resend] API key not configured');
    return { success: false, error: 'Resend API key not configured' };
  }

  try {
    console.log(`[Resend] Sending email to ${to}`);
    console.log(`[Resend] From: ${RESEND_FROM}`);
    console.log(`[Resend] Subject: ${subject}`);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Resend] Error response:', data);
      return { 
        success: false, 
        error: `Resend API error: ${data.message || response.statusText}` 
      };
    }

    console.log('[Resend] Email sent successfully:', data.id);
    return { success: true };
  } catch (error) {
    console.error('[Resend] Exception:', error);
    return { 
      success: false, 
      error: `Resend exception: ${error.message}` 
    };
  }
}


serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, text, isTest, barbershop_id }: EmailRequest = await req.json();

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Email Request] To: ${to}, Subject: ${subject}, Test: ${isTest || false}`);

    const finalHtml = html || `<p>${text || ''}</p>`;
    
    // Send email
    const result = await sendEmail(to, subject, finalHtml);

    // Log the result
    await logEmail({
      recipient_email: to,
      subject,
      status: result.success ? 'sent' : 'failed',
      error_message: result.error,
      barbershop_id,
    });

    if (result.success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully',
          provider: 'Resend',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error,
          message: 'Failed to send email',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('[Error]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
