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
    console.log('Webhook Kirvano recebido');
    
    const payload = await req.json();
    console.log('Payload completo:', JSON.stringify(payload, null, 2));

    // Extrair dados do webhook da Kirvano
    const {
      ip,
      fee,
      utm,
      plan,
      type,
      payment,
      subscription,
      customer,
      event,
      status,
      transaction_id,
      amount,
      paid_at,
      expires_at
    } = payload;

    // Determinar o tipo de evento
    const tipoEvento = event || type || 'UNKNOWN';
    const statusPagamento = payment?.status || status || null;

    // Preparar dados para inserção
    const webhookData: any = {
      ip_cliente: ip || null,
      taxa: fee || null,
      nome_plano: plan?.name || null,
      frequencia_cobranca: plan?.charge_frequency || (plan?.name?.toLowerCase().includes('trimestral') ? 'QUARTERLY' : 'MONTHLY'),
      numero_cobranca: plan?.charge_number || 1,
      proxima_data_cobranca: plan?.next_charge_date || expires_at || null,
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

    // Identificar o cliente através do email ou customer ID
    const customerEmail = customer?.email || payment?.customer?.email || null;
    const customerId = customer?.id || transaction_id || null;
    const subscriptionId = subscription?.id || transaction_id || null;

    if (tipoEvento === 'PAYMENT_RECEIVED' || tipoEvento === 'RECURRING' || tipoEvento === 'payment.approved' || statusPagamento === 'approved') {
      // Pagamento confirmado - ativar ou atualizar assinatura
      
      if (customerEmail || customerId) {
        console.log('Processando pagamento confirmado para:', customerEmail || customerId);

        // Calcular próxima data de cobrança
        let nextChargeDate: Date | null = null;
        const planName = plan?.name || '';
        
        if (plan?.next_charge_date) {
          nextChargeDate = new Date(plan.next_charge_date);
        } else if (expires_at) {
          nextChargeDate = new Date(expires_at);
        } else if (planName.toLowerCase().includes('trimestral') || plan?.charge_frequency === 'QUARTERLY') {
          nextChargeDate = new Date();
          nextChargeDate.setMonth(nextChargeDate.getMonth() + 3);
        } else {
          // Mensal por padrão
          nextChargeDate = new Date();
          nextChargeDate.setMonth(nextChargeDate.getMonth() + 1);
        }

        // Buscar usuário pelo email ou customer_id
        let userId = null;
        
        if (customerEmail) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('email', customerEmail)
            .maybeSingle();
          
          userId = profile?.user_id;
        }

        // Tentar atualizar assinatura existente
        const { data: existingSub, error: findError } = await supabase
          .from('subscriptions')
          .select('*')
          .or(`customer_id.eq.${customerId},user_id.eq.${userId}`)
          .maybeSingle();

        if (existingSub) {
          // Atualizar assinatura existente
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              subscription_id: subscriptionId || existingSub.subscription_id,
              customer_id: customerId || existingSub.customer_id,
              plan_name: plan?.name || existingSub.plan_name,
              plan_type: plan?.charge_frequency || existingSub.plan_type,
              charge_number: (existingSub.charge_number || 0) + 1,
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
        } else if (userId) {
          // Criar nova assinatura
          const { data: newSub, error: createError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: userId,
              customer_id: customerId,
              subscription_id: subscriptionId,
              plan_name: plan?.name || 'Plano Mensal',
              plan_type: plan?.charge_frequency || 'MONTHLY',
              status: 'active',
              charge_number: 1,
              next_charge_date: nextChargeDate?.toISOString(),
            })
            .select()
            .single();

          if (createError) {
            console.error('Erro ao criar assinatura:', createError);
          } else {
            console.log('Nova assinatura criada:', newSub.id);
            subscriptionUpdated = true;

            await supabase
              .from('webhook_pagamentos')
              .update({
                processado: true,
                processed_at: new Date().toISOString(),
                subscription_id: newSub.id,
              })
              .eq('id', webhookRecord.id);
          }
        } else {
          console.log('Usuário não encontrado para email:', customerEmail);
        }
      }
    } else if (tipoEvento === 'PAYMENT_CANCELED' || tipoEvento === 'SUBSCRIPTION_CANCELED' || tipoEvento === 'payment.cancelled' || statusPagamento === 'cancelled') {
      // Pagamento cancelado - cancelar assinatura
      
      if (customerEmail || customerId) {
        console.log('Processando cancelamento para:', customerEmail || customerId);

        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('*')
          .or(`customer_id.eq.${customerId}${customerEmail ? `,user_id.in.(select user_id from profiles where email='${customerEmail}')` : ''}`)
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
    } else if (tipoEvento === 'SUBSCRIPTION_EXPIRED' || tipoEvento === 'subscription.expired') {
      // Assinatura expirada
      
      if (customerEmail || customerId) {
        console.log('Processando expiração para:', customerEmail || customerId);

        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('*')
          .or(`customer_id.eq.${customerId}${customerEmail ? `,user_id.in.(select user_id from profiles where email='${customerEmail}')` : ''}`)
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
