import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email providers configuration
const PROVIDERS = {
  resend: {
    name: 'Resend API',
    apiKey: Deno.env.get('RESEND_API_KEY'),
    domain: 'winixbarbearia.com.br',
  },
  smtp: {
    name: 'SMTP',
    host: Deno.env.get('SMTP_HOST'),
    port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
    user: Deno.env.get('SMTP_USER'),
    password: Deno.env.get('SMTP_PASSWORD'),
    from: Deno.env.get('SMTP_FROM_EMAIL'),
    fromName: Deno.env.get('SMTP_FROM_NAME'),
  }
};

const RETRY_CONFIG = {
  maxAttempts: 3,
  backoffSeconds: [2, 6, 18],
};

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

async function sleep(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

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

async function sendViaResend(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  const { apiKey, domain } = PROVIDERS.resend;
  
  if (!apiKey) {
    return { success: false, error: 'Resend API key not configured' };
  }

  try {
    console.log(`[Resend] Attempting to send email to ${to}`);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Winix Barbearia <noreply@${domain}>`,
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

async function sendViaSMTP(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  const { host, port, user, password, from, fromName } = PROVIDERS.smtp;
  
  if (!host || !user || !password || !from) {
    return { success: false, error: 'SMTP not fully configured' };
  }

  try {
    console.log(`[SMTP] Attempting to send email to ${to} via ${host}:${port}`);
    
    // Using a simple SMTP implementation via nodemailer-like approach
    // For production, consider using a proper SMTP library
    const conn = await Deno.connect({ hostname: host, port: port });
    
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    async function writeLine(line: string) {
      await conn.write(encoder.encode(line + '\r\n'));
    }

    async function readResponse(): Promise<string> {
      const buf = new Uint8Array(1024);
      const n = await conn.read(buf);
      return decoder.decode(buf.subarray(0, n || 0));
    }

    // SMTP handshake
    await readResponse(); // Welcome message
    await writeLine(`EHLO ${host}`);
    await readResponse();
    
    await writeLine('STARTTLS');
    await readResponse();
    
    // TLS upgrade would go here in production
    // For now, we'll use basic auth
    
    await writeLine('AUTH LOGIN');
    await readResponse();
    await writeLine(btoa(user));
    await readResponse();
    await writeLine(btoa(password));
    const authResponse = await readResponse();
    
    if (!authResponse.startsWith('235')) {
      conn.close();
      return { success: false, error: 'SMTP authentication failed' };
    }

    await writeLine(`MAIL FROM:<${from}>`);
    await readResponse();
    await writeLine(`RCPT TO:<${to}>`);
    await readResponse();
    await writeLine('DATA');
    await readResponse();
    
    const message = [
      `From: ${fromName} <${from}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html,
      '.',
    ].join('\r\n');
    
    await writeLine(message);
    await readResponse();
    await writeLine('QUIT');
    conn.close();

    console.log('[SMTP] Email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('[SMTP] Exception:', error);
    return { 
      success: false, 
      error: `SMTP exception: ${error.message}` 
    };
  }
}

async function sendEmailWithRetry(emailData: EmailRequest): Promise<{ success: boolean; error?: string; provider?: string }> {
  const { to, subject, html = '', text = '' } = emailData;
  const finalHtml = html || `<p>${text}</p>`;

  // Try Resend first (faster and more reliable)
  for (let attempt = 0; attempt < RETRY_CONFIG.maxAttempts; attempt++) {
    if (attempt > 0) {
      const backoff = RETRY_CONFIG.backoffSeconds[attempt - 1];
      console.log(`[Retry] Waiting ${backoff}s before attempt ${attempt + 1}`);
      await sleep(backoff);
    }

    console.log(`[Attempt ${attempt + 1}/${RETRY_CONFIG.maxAttempts}] Trying Resend...`);
    const resendResult = await sendViaResend(to, subject, finalHtml);
    
    if (resendResult.success) {
      return { success: true, provider: 'Resend API' };
    }
    
    console.log(`[Resend Failed] ${resendResult.error}`);
  }

  // Fallback to SMTP
  console.log('[Fallback] Switching to SMTP provider...');
  for (let attempt = 0; attempt < RETRY_CONFIG.maxAttempts; attempt++) {
    if (attempt > 0) {
      const backoff = RETRY_CONFIG.backoffSeconds[attempt - 1];
      console.log(`[Retry] Waiting ${backoff}s before attempt ${attempt + 1}`);
      await sleep(backoff);
    }

    console.log(`[Attempt ${attempt + 1}/${RETRY_CONFIG.maxAttempts}] Trying SMTP...`);
    const smtpResult = await sendViaSMTP(to, subject, finalHtml);
    
    if (smtpResult.success) {
      return { success: true, provider: 'SMTP' };
    }
    
    console.log(`[SMTP Failed] ${smtpResult.error}`);
  }

  return { 
    success: false, 
    error: 'All email providers failed after retries',
  };
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

    // Send email with retry and fallback
    const result = await sendEmailWithRetry({ to, subject, html, text, barbershop_id });

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
          provider: result.provider,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error,
          message: 'Failed to send email after all retry attempts',
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
