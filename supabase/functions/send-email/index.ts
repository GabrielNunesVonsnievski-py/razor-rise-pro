import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  barbershop_id?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { to, subject, body, barbershop_id }: EmailRequest = await req.json();

    console.log('Sending email to:', to);
    console.log('Subject:', subject);

    // Create email log entry
    const { data: logData, error: logError } = await supabaseClient
      .from('email_logs')
      .insert({
        barbershop_id,
        recipient_email: to,
        subject,
        status: 'pending'
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating email log:', logError);
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Winix <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: body,
    });

    console.log('Email sent successfully:', emailResponse);

    // Update log status
    if (logData) {
      await supabaseClient
        .from('email_logs')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', logData.id);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);

    // Update log status to failed if we have a log entry
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
