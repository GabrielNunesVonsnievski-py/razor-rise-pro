import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Scissors, ArrowLeft, Phone, User as UserIcon, MapPin, Clock, Tag, Users } from 'lucide-react';
import InputMask from 'react-input-mask';
import dayjs from 'dayjs';
import { z } from 'zod';
import { TimeSlotSelector } from '@/components/TimeSlotSelector';
import {
  generateTimeSlots,
  getAvailableTimeSlots,
  getOccupiedSlots,
  TimeSlot
} from '@/utils/timeSlots';

interface Service {
  id: number;
  nome: string;
  valor: number;
  duracao: number;
}

interface Barber {
  id: number;
  nome: string;
  status: string;
}

interface Barbershop {
  id: number;
  nome: string;
  slug: string;
  telefone: string | null;
  endereco: string | null;
  descricao: string | null;
  logo_url?: string;
  foto_perfil_url?: string;
  cor_fundo?: string;
}

interface BarbershopSchedule {
  id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  intervalo_inicio: string | null;
  intervalo_fim: string | null;
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
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [schedules, setSchedules] = useState<BarbershopSchedule[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    serviceId: '',
    barberId: '',
    date: '',
    time: ''
  });

  const selectedService = services.find(s => s.id === parseInt(formData.serviceId));

  useEffect(() => {
    const fetchBarbershopData = async () => {
      try {
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

        // Buscar serviços
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('barbershop_id', barbershopData.id)
          .eq('ativo', true);

        setServices(servicesData || []);

        // Buscar barbeiros ativos
        const { data: barbersData } = await supabase
          .from('barbers')
          .select('*')
          .eq('barbershop_id', barbershopData.id)
          .eq('status', 'ativo');

        setBarbers(barbersData || []);

        // Buscar horários configurados
        const { data: schedulesData } = await supabase
          .from('barbershop_schedules')
          .select('*')
          .eq('barbershop_id', barbershopData.id)
          .eq('ativo', true);

        setSchedules(schedulesData || []);

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

  // Atualizar slots disponíveis quando data, serviço ou barbeiro mudam
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!formData.date || !barbershop?.id || !selectedService) {
        setAvailableSlots([]);
        return;
      }

      const selectedDate = dayjs(formData.date);
      const dayOfWeek = selectedDate.day();

      // Buscar horário configurado para este dia da semana
      const daySchedule = schedules.find(s => s.dia_semana === dayOfWeek);

      if (!daySchedule) {
        setAvailableSlots([]);
        toast({
          title: 'Dia não disponível',
          description: 'A barbearia não funciona neste dia da semana.',
          variant: 'destructive'
        });
        return;
      }

      // Gerar todos os slots de 30 minutos possíveis
      const allSlots = generateTimeSlots(
        daySchedule.hora_inicio,
        daySchedule.hora_fim,
        daySchedule.intervalo_inicio || undefined,
        daySchedule.intervalo_fim || undefined
      );

      // Buscar agendamentos já existentes
      let query = supabase
        .from('appointments')
        .select('time')
        .eq('barbershop_id', barbershop.id)
        .eq('date', formData.date)
        .in('status', ['pending', 'confirmed']);

      // Se um barbeiro foi selecionado, filtrar por ele
      if (formData.barberId) {
        query = query.eq('barber_id', parseInt(formData.barberId));
      }

      const { data: existingAppointments } = await query;

      // Buscar todos os horários ocupados considerando duração dos serviços
      const bookedTimes = new Set<string>();
      
      if (existingAppointments) {
        for (const appointment of existingAppointments) {
          // Para cada agendamento, marcar também os slots seguintes se o serviço for longo
          const occupiedSlots = getOccupiedSlots(
            appointment.time,
            selectedService.duracao,
            allSlots
          );
          occupiedSlots.forEach(slot => bookedTimes.add(slot));
        }
      }

      // Calcular slots disponíveis considerando a duração do serviço selecionado
      const available = getAvailableTimeSlots(
        allSlots,
        Array.from(bookedTimes),
        selectedService.duracao
      );

      setAvailableSlots(available);
    };

    loadAvailableSlots();
  }, [formData.date, formData.serviceId, formData.barberId, selectedService, schedules]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookingSchema = z.object({
      fullName: z.string()
        .trim()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome contém caracteres inválidos'),
      phone: z.string()
        .trim()
        .regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, 'Telefone inválido'),
      serviceId: z.string().min(1, 'Selecione um serviço'),
      barberId: z.string().min(1, 'Selecione um barbeiro'),
      date: z.string().min(1, 'Selecione uma data'),
      time: z.string().min(1, 'Selecione um horário')
    });

    const validation = bookingSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: 'Dados inválidos',
        description: validation.error.errors[0].message,
        variant: 'destructive'
      });
      return;
    }

    const selectedDate = dayjs(`${formData.date} ${formData.time}`);
    if (selectedDate.isBefore(dayjs())) {
      toast({
        title: 'Data inválida',
        description: 'Não é possível agendar para datas passadas.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      let userId = user?.id;
      let isNewUser = false;

      // Auto-criar conta se não autenticado
      if (!user) {
        const cleanPhone = formData.phone.replace(/\D/g, '');
        const tempEmail = `${cleanPhone}@temp.winix.app`;
        const tempPassword = `${cleanPhone}Winix2024!`;
        
        // Tentar fazer login primeiro
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: tempEmail,
          password: tempPassword
        });

        if (signInError) {
          // Se falhar, criar nova conta
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

          if (signUpError) throw signUpError;
          userId = signUpData.user?.id;
          isNewUser = true;

          // Aguardar um momento para garantir que a sessão foi estabelecida
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          userId = signInData.user?.id;
        }
      }

      if (!userId) {
        throw new Error('Não foi possível identificar o usuário.');
      }

      const service = services.find(s => s.id === parseInt(formData.serviceId));
      
      // Criar agendamento
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          barbershop_id: barbershop?.id,
          user_id: userId,
          barber_id: parseInt(formData.barberId),
          client: formData.fullName,
          phone: formData.phone,
          service_id: parseInt(formData.serviceId),
          service: service?.nome || '',
          valor: service?.valor || 0,
          date: formData.date,
          time: formData.time,
          status: 'pending'
        });

      if (appointmentError) throw appointmentError;

      // Adicionar cliente à barbearia se for novo
      if (isNewUser) {
        const { error: clientError } = await supabase
          .from('barbershop_clients')
          .insert({
            barbershop_id: barbershop?.id,
            client_user_id: userId
          })
          .select()
          .maybeSingle();

        // Não falhar se o cliente já existir
        if (clientError && !clientError.message.includes('duplicate')) {
          console.error('Erro ao adicionar cliente:', clientError);
        }
      }

      const barberName = barbers.find(b => b.id === parseInt(formData.barberId))?.nome || 'Barbeiro';
      const sanitizedName = formData.fullName.trim().slice(0, 100);
      const sanitizedService = service?.nome?.trim().slice(0, 100) || 'Serviço';
      const sanitizedBarbershop = barbershop?.nome?.trim().slice(0, 100) || 'Barbearia';
      
      const whatsappMessage = `Olá ${sanitizedName}! Seu agendamento foi confirmado!\n\nBarbearia: ${sanitizedBarbershop}\nBarbeiro: ${barberName}\nServiço: ${sanitizedService}\nData: ${dayjs(formData.date).format('DD/MM/YYYY')}\nHorário: ${formData.time}\n\nNos vemos lá! 💈`;
      const whatsappUrl = `https://wa.me/55${formData.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
      
      toast({
        title: 'Agendamento confirmado!',
        description: 'Você receberá uma confirmação no WhatsApp.',
      });

      window.open(whatsappUrl, '_blank');
      setBookingSuccess(true);
      setFormData({
        fullName: '',
        phone: '',
        serviceId: '',
        barberId: '',
        date: '',
        time: ''
      });

    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Erro ao agendar',
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
              <Button>Voltar para a página inicial</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const googleMapsUrl = barbershop.endereco 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(barbershop.endereco)}`
    : null;

  const customBg = barbershop.cor_fundo || 'hsl(var(--background))';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Custom Color */}
      <section 
        className="text-white py-8 md:py-12 px-4 md:px-6 relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${customBg} 0%, ${customBg}dd 100%)`
        }}
      >
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <Link to="/auth" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-3 rounded-lg hover:bg-white/30 transition-all shadow-lg mb-6 font-semibold">
            <Scissors className="w-4 h-4" />
            Acessar App
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              {barbershop.logo_url && (
                <img 
                  src={barbershop.logo_url} 
                  alt={`Logo ${barbershop.nome}`}
                  className="w-24 h-24 object-contain mb-6 rounded-lg bg-white/10 backdrop-blur-sm p-2"
                />
              )}
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
                {barbershop.nome}
              </h1>
              <p className="text-lg md:text-xl opacity-95 mb-6 drop-shadow-md">
                {barbershop.descricao || 'Agende seu horário conosco!'}
              </p>

              <div className="space-y-3">
                {barbershop.endereco && (
                  <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                    <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <p className="opacity-95">{barbershop.endereco}</p>
                      {googleMapsUrl && (
                        <a 
                          href={googleMapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm underline opacity-80 hover:opacity-100 transition-opacity"
                        >
                          Ver no Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {barbershop.telefone && (
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                    <Phone className="w-5 h-5 flex-shrink-0" />
                    <p className="opacity-95">{barbershop.telefone}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {promotions.length > 0 && (
                <div className="bg-white/15 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-5 h-5" />
                    <h3 className="text-xl font-bold">Promoções Ativas</h3>
                  </div>
                  <div className="space-y-3">
                    {promotions.map((promo) => (
                      <div key={promo.id} className="bg-white/25 backdrop-blur rounded-lg p-4 border border-white/30">
                        <h4 className="font-semibold text-lg">{promo.titulo}</h4>
                        <p className="text-2xl font-bold">{promo.desconto}% OFF</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 -mt-8">
        {/* Formulário de Agendamento */}
        <Card className="shadow-elegant">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Calendar className="w-6 h-6 text-accent" />
              {bookingSuccess ? 'Agendamento Confirmado!' : 'Agende Seu Horário'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {bookingSuccess ? (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Scissors className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Agendamento confirmado com sucesso!</h3>
                  <p className="text-muted-foreground">
                    Você receberá uma confirmação no WhatsApp com todos os detalhes.
                  </p>
                </div>
                <Button 
                  onClick={() => setBookingSuccess(false)} 
                  size="lg"
                  className="w-full md:w-auto"
                >
                  Fazer Outro Agendamento
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo *</Label>
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
                    <Label htmlFor="phone">Telefone (WhatsApp) *</Label>
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
                  <Label htmlFor="service">Serviço *</Label>
                  <Select
                    value={formData.serviceId}
                    onValueChange={(value) => setFormData({ ...formData, serviceId: value, time: '' })}
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

                {barbers.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="barber" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Barbeiro *
                    </Label>
                    <Select
                      value={formData.barberId}
                      onValueChange={(value) => setFormData({ ...formData, barberId: value, time: '' })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o barbeiro" />
                      </SelectTrigger>
                      <SelectContent>
                        {barbers.map((barber) => (
                          <SelectItem key={barber.id} value={barber.id.toString()}>
                            {barber.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    min={dayjs().format('YYYY-MM-DD')}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
                    required
                  />
                </div>

                {formData.date && formData.serviceId && (
                  <div className="space-y-2">
                    <Label>Horário Disponível *</Label>
                    <TimeSlotSelector
                      slots={availableSlots}
                      selectedTime={formData.time}
                      onSelectTime={(time) => setFormData({ ...formData, time })}
                      serviceDuration={selectedService?.duracao}
                    />
                  </div>
                )}

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full" 
                  disabled={submitting || !formData.time}
                >
                  {submitting ? 'Agendando...' : 'Confirmar Agendamento'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Lista de Serviços */}
        {services.length > 0 && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Nossos Serviços</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div key={service.id} className="p-5 border border-border rounded-lg hover:shadow-glow transition-all">
                  <h3 className="font-semibold text-lg text-primary mb-1">{service.nome}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {service.duracao} minutos
                  </p>
                  <p className="text-2xl font-bold text-accent">R$ {service.valor.toFixed(2)}</p>
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
