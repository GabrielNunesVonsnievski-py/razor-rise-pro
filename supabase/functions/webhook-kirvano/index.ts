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

        // Buscar ou criar usuário pelo email
        let userId = null;
        const customerName = customer?.name || payload?.buyer?.name || 'Novo Cliente';
        
        if (customerEmail) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('email', customerEmail)
            .maybeSingle();
          
          if (profile) {
            userId = profile.user_id;
            console.log('Usuário já existe:', userId);
          } else {
            // Usuário não existe - criar novo
            console.log('Criando novo usuário para:', customerEmail);
            
            // Gerar senha temporária aleatória
            const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase() + '!@#';
            
            // Criar usuário no Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: customerEmail,
              password: tempPassword,
              email_confirm: true,
              user_metadata: {
                full_name: customerName,
              }
            });

            if (authError) {
              console.error('Erro ao criar usuário:', authError);
              throw new Error(`Erro ao criar usuário: ${authError.message}`);
            }

            userId = authData.user.id;
            console.log('Novo usuário criado:', userId);

            // Criar perfil
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                user_id: userId,
                email: customerEmail,
                full_name: customerName,
              });

            if (profileError) {
              console.error('Erro ao criar perfil:', profileError);
            }

            // Enviar e-mail de boas-vindas
            try {
              const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                  <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h1 style="color: #ff6b35; margin-bottom: 20px;">Bem-vindo ao Winix! 🎉</h1>
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">Olá <strong>${customerName}</strong>,</p>
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">Seu pagamento foi confirmado com sucesso! Sua conta já está ativa e pronta para uso.</p>
                    
                    <div style="background-color: #fff3f0; border-left: 4px solid #ff6b35; padding: 15px; margin: 20px 0;">
                      <h3 style="color: #ff6b35; margin-top: 0;">Seus dados de acesso:</h3>
                      <p style="color: #333; margin: 5px 0;"><strong>Email:</strong> ${customerEmail}</p>
                      <p style="color: #333; margin: 5px 0;"><strong>Senha temporária:</strong> <code style="background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 14px;">${tempPassword}</code></p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6;">⚠️ Por segurança, recomendamos que você altere sua senha após o primeiro login.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://winix-five.vercel.app/auth" 
                         style="display: inline-block; background-color: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Fazer Login
                      </a>
                    </div>
                    
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                      Se você não realizou esta compra, entre em contato conosco imediatamente.
                    </p>
                  </div>
                </div>
              `;

              const { error: emailError } = await supabase.functions.invoke('send-email', {
                body: {
                  to: customerEmail,
                  subject: 'Bem-vindo ao Winix - Seus Dados de Acesso',
                  html: emailHtml,
                  isTest: false,
                }
              });

              if (emailError) {
                console.error('Erro ao enviar e-mail:', emailError);
              } else {
                console.log('E-mail de boas-vindas enviado para:', customerEmail);
              }
            } catch (emailErr) {
              console.error('Erro ao processar e-mail:', emailErr);
            }
          }
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
