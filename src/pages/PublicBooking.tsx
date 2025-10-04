import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Scissors, ArrowLeft, Phone, User as UserIcon, MapPin, Clock, Tag } from 'lucide-react';
import InputMask from 'react-input-mask';
import dayjs from 'dayjs';

interface Service {
  id: number;
  nome: string;
  valor: number;
  duracao: number;
}

interface Barbershop {
  id: number;
  nome: string;
  slug: string;
  telefone: string | null;
  endereco: string | null;
  descricao: string | null;
  horario_abertura?: string;
  horario_fechamento?: string;
  dias_funcionamento?: string[];
}

interface Promotion {
  id: number;
  titulo: string;
  desconto: number;
}

const PublicBooking = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    serviceId: '',
    promotionId: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    const fetchBarbershopData = async () => {
      try {
        // Buscar barbearia pelo slug
        const { data: barbershopData, error: barbershopError } = await supabase
          .from('barbershops')
          .select('*')
          .eq('slug', slug)
          .single();

        if (barbershopError || !barbershopData) {
          toast({
            title: 'Barbearia não encontrada',
            description: 'O link informado não existe.',
            variant: 'destructive'
          });
          navigate('/');
          return;
        }

        setBarbershop(barbershopData);

        // Buscar serviços da barbearia
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('barbershop_id', barbershopData.id)
          .eq('ativo', true);

        setServices(servicesData || []);

        // Buscar promoções ativas
        const { data: promotionsData } = await supabase
          .from('promotions')
          .select('*')
          .eq('barbershop_id', barbershopData.id)
          .eq('ativo', true)
          .gte('data_fim', dayjs().format('YYYY-MM-DD'));

        setPromotions(promotionsData || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBarbershopData();
    }
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.serviceId || !formData.date || !formData.time) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos para continuar.',
        variant: 'destructive'
      });
      return;
    }

    // Validar data (não permitir datas passadas)
    const selectedDate = dayjs(`${formData.date} ${formData.time}`);
    if (selectedDate.isBefore(dayjs())) {
      toast({
        title: 'Data inválida',
        description: 'Não é possível agendar para datas passadas.',
        variant: 'destructive'
      });
      return;
    }

    // Validar dia da semana
    const dayOfWeek = selectedDate.day().toString();
    if (barbershop?.dias_funcionamento && !barbershop.dias_funcionamento.includes(dayOfWeek)) {
      toast({
        title: 'Dia inválido',
        description: 'A barbearia não funciona neste dia da semana.',
        variant: 'destructive'
      });
      return;
    }

    // Validar horário de funcionamento
    if (barbershop?.horario_abertura && barbershop?.horario_fechamento) {
      const hora = formData.time;
      if (hora < barbershop.horario_abertura || hora > barbershop.horario_fechamento) {
        toast({
          title: 'Horário inválido',
          description: `A barbearia funciona das ${barbershop.horario_abertura} às ${barbershop.horario_fechamento}.`,
          variant: 'destructive'
        });
        return;
      }
    }

    setSubmitting(true);

    try {
      // Verificar conflito de horário
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('barbershop_id', barbershop?.id)
        .eq('date', formData.date)
        .eq('time', formData.time)
        .in('status', ['pending', 'confirmed']);

      if (existingAppointments && existingAppointments.length > 0) {
        toast({
          title: 'Horário indisponível',
          description: 'Este horário já está reservado. Escolha outro.',
          variant: 'destructive'
        });
        setSubmitting(false);
        return;
      }

      // Verificar se usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      let userId = user?.id;

      // Se não estiver autenticado, criar conta automaticamente
      if (!user) {
        const tempEmail = `${formData.phone.replace(/\D/g, '')}@temp.winix.app`;
        const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: tempEmail,
          password: tempPassword,
          options: {
            data: {
              full_name: formData.fullName,
              phone: formData.phone
            }
          }
        });

        if (signUpError) {
          // Tentar fazer login caso o usuário já exista
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: tempEmail,
            password: tempPassword
          });

          if (signInError) {
            throw new Error('Não foi possível autenticar. Tente novamente.');
          }
          userId = signInData.user?.id;
        } else {
          userId = signUpData.user?.id;
        }
      }

      if (!userId) {
        throw new Error('Não foi possível identificar o usuário.');
      }

      // Buscar valor do serviço
      const service = services.find(s => s.id === parseInt(formData.serviceId));
      
      // Criar agendamento
      const { error } = await supabase
        .from('appointments')
        .insert({
          barbershop_id: barbershop?.id,
          user_id: userId,
          client: formData.fullName,
          phone: formData.phone,
          service_id: parseInt(formData.serviceId),
          service: service?.nome || '',
          valor: service?.valor || 0,
          date: formData.date,
          time: formData.time,
          status: 'pending'
        });

      if (error) throw error;

      // Adicionar cliente à barbearia (ignorar se já existir)
      const { error: clientError } = await supabase
        .from('barbershop_clients')
        .insert({
          barbershop_id: barbershop?.id,
          client_user_id: userId
        });

      // Ignorar erro de duplicata
      if (clientError && !clientError.message.includes('duplicate')) {
        console.error('Erro ao adicionar cliente:', clientError);
      }

      // Enviar confirmação por WhatsApp
      const whatsappMessage = `Olá ${formData.fullName}! Seu agendamento foi confirmado!\n\nBarbearia: ${barbershop?.nome}\nServiço: ${service?.nome}\nData: ${dayjs(formData.date).format('DD/MM/YYYY')}\nHorário: ${formData.time}\n\nNos vemos lá! 💈`;
      const whatsappUrl = `https://wa.me/55${formData.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
      
      toast({
        title: 'Agendamento confirmado!',
        description: 'Você receberá uma confirmação no WhatsApp.',
      });

      // Abrir WhatsApp em nova aba
      window.open(whatsappUrl, '_blank');

      // Mostrar mensagem de sucesso
      setBookingSuccess(true);

      // Limpar formulário
      setFormData({
        fullName: '',
        phone: '',
        serviceId: '',
        promotionId: '',
        date: '',
        time: ''
      });

    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar o agendamento. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!barbershop) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Card className="max-w-md w-full text-center shadow-elegant">
          <CardContent className="pt-6">
            <Scissors className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Barbearia não encontrada</h2>
            <p className="text-muted-foreground mb-6">
              O link que você acessou não corresponde a nenhuma barbearia cadastrada.
            </p>
            <Link to="/">
              <Button variant="hero">Voltar para a página inicial</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const googleMapsUrl = barbershop.endereco 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(barbershop.endereco)}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Perfil da Barbearia */}
      <section className="gradient-hero text-accent-foreground py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-accent-foreground/80 hover:text-accent-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informações principais */}
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {barbershop.nome}
              </h1>
              <p className="text-xl opacity-90 mb-6">
                {barbershop.descricao || 'Agende seu horário conosco!'}
              </p>

              {/* Informações de contato e localização */}
              <div className="space-y-3">
                {barbershop.endereco && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <p className="opacity-90">{barbershop.endereco}</p>
                      {googleMapsUrl && (
                        <a 
                          href={googleMapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm underline opacity-75 hover:opacity-100 transition-opacity"
                        >
                          Ver no Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {barbershop.telefone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 flex-shrink-0" />
                    <p className="opacity-90">{barbershop.telefone}</p>
                  </div>
                )}
                
                {barbershop.horario_abertura && barbershop.horario_fechamento && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    <p className="opacity-90">
                      {barbershop.horario_abertura} - {barbershop.horario_fechamento}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Promoções em destaque */}
            {promotions.length > 0 && (
              <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5" />
                  <h3 className="text-xl font-bold">Promoções Ativas</h3>
                </div>
                <div className="space-y-3">
                  {promotions.map((promo) => (
                    <div key={promo.id} className="bg-accent/20 rounded-lg p-4">
                      <h4 className="font-semibold text-lg">{promo.titulo}</h4>
                      <p className="text-2xl font-bold">{promo.desconto}% OFF</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto p-6 space-y-8 -mt-8">
        {/* Seção de Agendamento */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calendar className="w-6 h-6 text-accent" />
              {bookingSuccess ? 'Agendamento Confirmado!' : 'Agende Seu Horário'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingSuccess ? (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Scissors className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Agendamento salvo com sucesso!</h3>
                  <p className="text-muted-foreground">
                    Você receberá uma confirmação no WhatsApp com todos os detalhes.
                  </p>
                </div>
                <Button 
                  onClick={() => setBookingSuccess(false)} 
                  variant="hero" 
                  size="lg"
                  className="w-full"
                >
                  Fazer Outro Agendamento
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Digite seu nome completo"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                    <InputMask
                      mask="(99) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    >
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          id="phone"
                          placeholder="(11) 99999-9999"
                          className="pl-10"
                          required
                        />
                      )}
                    </InputMask>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Serviço</Label>
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.nome} - R$ {service.valor.toFixed(2)} ({service.duracao} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {promotions.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="promotion">Promoção (opcional)</Label>
                  <Select
                    value={formData.promotionId}
                    onValueChange={(value) => setFormData({ ...formData, promotionId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma promoção" />
                    </SelectTrigger>
                    <SelectContent>
                      {promotions.map((promotion) => (
                        <SelectItem key={promotion.id} value={promotion.id.toString()}>
                          {promotion.titulo} - {promotion.desconto}% OFF
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    min={dayjs().format('YYYY-MM-DD')}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? 'Agendando...' : 'Confirmar Agendamento'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Services List */}
        {services.length > 0 && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Nossos Serviços</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service.id} className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium text-primary">{service.nome}</h3>
                  <p className="text-sm text-muted-foreground">{service.duracao} minutos</p>
                  <p className="text-lg font-bold text-accent mt-2">R$ {service.valor.toFixed(2)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicBooking;
