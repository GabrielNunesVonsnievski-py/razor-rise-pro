import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('Webhook Asaas recebido');
    
    const payload = await req.json();
    console.log('Payload completo:', JSON.stringify(payload, null, 2));

    // Extrair dados do webhook
    const {
      ip,
      fee,
      plan,
      type,
      payment,
      subscription,
      customer,
      event
    } = payload;

    // Determinar o tipo de evento
    const tipoEvento = event || type || 'UNKNOWN';
    const statusPagamento = payment?.status || null;

    // Preparar dados para inserção
    const webhookData: any = {
      ip_cliente: ip || null,
      taxa: fee || null,
      nome_plano: plan?.name || null,
      frequencia_cobranca: plan?.charge_frequency || null,
      numero_cobranca: plan?.charge_number || null,
      proxima_data_cobranca: plan?.next_charge_date || null,
      tipo_evento: tipoEvento,
      status_pagamento: statusPagamento,
      payload_completo: payload,
      processado: false,
    };

    // Inserir o webhook na tabela de logs
    const { data: webhookRecord, error: webhookError } = await supabase
      .from('webhook_pagamentos')
      .insert(webhookData)
      .select()
      .single();

    if (webhookError) {
      console.error('Erro ao inserir webhook:', webhookError);
      throw webhookError;
    }

    console.log('Webhook registrado com ID:', webhookRecord.id);

    // Processar o evento baseado no tipo
    let subscriptionUpdated = false;

    if (tipoEvento === 'PAYMENT_RECEIVED' || tipoEvento === 'RECURRING') {
      // Pagamento confirmado - ativar ou atualizar assinatura
      const customerId = customer?.id || subscription?.customer || null;
      const subscriptionId = subscription?.id || null;
      
      if (customerId) {
        console.log('Processando pagamento confirmado para customer:', customerId);

        // Calcular próxima data de cobrança
        let nextChargeDate: Date | null = null;
        if (plan?.next_charge_date) {
          nextChargeDate = new Date(plan.next_charge_date);
        } else if (plan?.charge_frequency === 'MONTHLY') {
          nextChargeDate = new Date();
          nextChargeDate.setMonth(nextChargeDate.getMonth() + 1);
        } else if (plan?.charge_frequency === 'QUARTERLY') {
          nextChargeDate = new Date();
          nextChargeDate.setMonth(nextChargeDate.getMonth() + 3);
        }

        // Tentar atualizar assinatura existente
        const { data: existingSub, error: findError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('customer_id', customerId)
          .maybeSingle();

        if (existingSub) {
          // Atualizar assinatura existente
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              subscription_id: subscriptionId || existingSub.subscription_id,
              plan_name: plan?.name || existingSub.plan_name,
              plan_type: plan?.charge_frequency || existingSub.plan_type,
              charge_number: plan?.charge_number || existingSub.charge_number,
              next_charge_date: nextChargeDate?.toISOString() || existingSub.next_charge_date,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSub.id);

          if (updateError) {
            console.error('Erro ao atualizar assinatura:', updateError);
          } else {
            console.log('Assinatura atualizada para ativa:', existingSub.id);
            subscriptionUpdated = true;

            // Atualizar o webhook como processado
            await supabase
              .from('webhook_pagamentos')
              .update({
                processado: true,
                processed_at: new Date().toISOString(),
                subscription_id: existingSub.id,
              })
              .eq('id', webhookRecord.id);
          }
        } else {
          console.log('Assinatura não encontrada para customer_id:', customerId);
        }
      }
    } else if (tipoEvento === 'PAYMENT_CANCELED' || tipoEvento === 'SUBSCRIPTION_CANCELED') {
      // Pagamento cancelado - cancelar assinatura
      const customerId = customer?.id || subscription?.customer || null;
      
      if (customerId) {
        console.log('Processando cancelamento para customer:', customerId);

        const { data: existingSub, error: findError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('customer_id', customerId)
          .maybeSingle();

        if (existingSub) {
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSub.id);

          if (updateError) {
            console.error('Erro ao cancelar assinatura:', updateError);
          } else {
            console.log('Assinatura cancelada:', existingSub.id);
            subscriptionUpdated = true;

            await supabase
              .from('webhook_pagamentos')
              .update({
                processado: true,
                processed_at: new Date().toISOString(),
                subscription_id: existingSub.id,
              })
              .eq('id', webhookRecord.id);
          }
        }
      }
    } else if (tipoEvento === 'SUBSCRIPTION_EXPIRED') {
      // Assinatura expirada
      const customerId = customer?.id || subscription?.customer || null;
      
      if (customerId) {
        console.log('Processando expiração para customer:', customerId);

        const { data: existingSub, error: findError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('customer_id', customerId)
          .maybeSingle();

        if (existingSub) {
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'expired',
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSub.id);

          if (updateError) {
            console.error('Erro ao expirar assinatura:', updateError);
          } else {
            console.log('Assinatura expirada:', existingSub.id);
            subscriptionUpdated = true;

            await supabase
              .from('webhook_pagamentos')
              .update({
                processado: true,
                processed_at: new Date().toISOString(),
                subscription_id: existingSub.id,
              })
              .eq('id', webhookRecord.id);
          }
        }
      }
    }

    console.log('Webhook processado com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processado com sucesso',
        webhookId: webhookRecord.id,
        subscriptionUpdated,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
