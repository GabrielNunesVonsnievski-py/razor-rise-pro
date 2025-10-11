import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testEmail } = await req.json();

    if (!testEmail) {
      return new Response(
        JSON.stringify({ error: 'testEmail is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Email Test] Sending test email to ${testEmail}`);

    // Call the send-email function
    const { data, error } = await supabaseAdmin.functions.invoke('send-email', {
      body: {
        to: testEmail,
        subject: '✅ Teste de E-mail - Winix Barbearia',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B5CF6;">Winix Barbearia</h1>
            <h2>Teste de Configuração de E-mail</h2>
            <p>Este é um e-mail de teste do sistema Winix Barbearia.</p>
            <p>Se você recebeu esta mensagem, significa que o sistema de e-mails está funcionando corretamente!</p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              Data/Hora: ${new Date().toLocaleString('pt-BR')}<br>
              Enviado via: Sistema Winix Barbearia
            </p>
          </div>
        `,
        isTest: true,
      },
    });

    if (error) {
      console.error('[Email Test] Error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          logs: 'Failed to invoke send-email function',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Email Test] Result:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test email sent successfully',
        result: data,
        logs: `Email sent to ${testEmail}`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Email Test] Exception:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
