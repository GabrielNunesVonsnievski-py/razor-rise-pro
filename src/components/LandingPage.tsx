import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  DollarSign,
  Clock,
  Check,
  Scissors,
  Star,
  Zap,
  Shield,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToPlans = () => {
    const plansSection = document.getElementById('plans-section');
    plansSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero text-white py-20 px-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-accent text-accent-foreground border-none px-6 py-2 text-base animate-pulse">
            💈 Sistema Profissional para Barbearias
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Transforme sua barbearia em uma
            <span className="text-accent block mt-2">máquina de agendamentos!</span>
          </h1>
          
          <p className="text-xl md:text-2xl opacity-90 mb-4 max-w-3xl mx-auto">
            Organize, atenda e <strong>lucre mais</strong> com o sistema que faz sua barbearia rodar no piloto automático.
          </p>
          
          <p className="text-lg md:text-xl opacity-80 mb-10 max-w-2xl mx-auto">
            O Winix é o seu novo assistente digital — simples, rápido e feito sob medida para barbeiros.
          </p>
          
          <Button 
            size="lg"
            onClick={scrollToPlans}
            className="bg-accent hover:bg-accent/90 text-white px-12 py-6 text-xl font-bold shadow-glow hover:scale-105 transition-all"
          >
            Ver Planos
          </Button>
        </div>
      </section>

      {/* Dor e Identificação */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            Você ainda tenta controlar sua barbearia <span className="text-accent">na mão?</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              "Clientes marcando pelo direct e outros pedindo no WhatsApp?",
              "Confusão com horários e agendamentos duplicados?",
              "Falta de controle sobre o faturamento e desempenho?"
            ].map((problema, i) => (
              <Card key={i} className="border-l-4 border-l-accent bg-card hover:shadow-elegant transition-all">
                <CardContent className="p-6">
                  <p className="text-foreground font-medium">{problema}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              A boa notícia é que <span className="text-accent">dá pra resolver tudo isso com o Winix.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Solução */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Conheça o Winix — <span className="text-accent">o sistema completo</span> para sua barbearia
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Agendamentos Automáticos",
                description: "Clientes agendam sozinhos pelo link. Zero confusão, zero trabalho manual."
              },
              {
                icon: MessageSquare,
                title: "Lembretes Automáticos",
                description: "WhatsApp automático para lembrar os clientes e reduzir faltas."
              },
              {
                icon: DollarSign,
                title: "Painel Financeiro Completo",
                description: "Veja quanto você fatura por dia, semana e mês em tempo real."
              },
              {
                icon: Users,
                title: "Controle de Equipe",
                description: "Gerencie seus barbeiros e acompanhe o desempenho de cada um."
              },
              {
                icon: TrendingUp,
                title: "Aumento no Faturamento",
                description: "Mais organização = mais clientes atendidos = mais lucro."
              },
              {
                icon: Clock,
                title: "Economize Tempo",
                description: "Automatize tarefas repetitivas e foque no que importa: seus clientes."
              }
            ].map((feature, i) => (
              <Card key={i} className="border-none shadow-elegant hover:shadow-glow hover:scale-105 transition-all bg-gradient-to-br from-card to-card/50">
                <CardContent className="p-8 text-center">
                  <feature.icon className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 px-6 bg-gradient-accent text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Por que escolher o <span className="text-black">Winix?</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              "Sistema profissional sem complicação",
              "Agendamento online 24/7 automático",
              "Controle total do seu negócio",
              "Lembretes automáticos via WhatsApp",
              "Painel financeiro em tempo real",
              "Suporte dedicado para barbeiros",
              "Funciona em qualquer dispositivo",
              "Dados seguros e protegidos"
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-full">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <p className="text-lg font-medium pt-1">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prova Social */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Barbeiros que já <span className="text-accent">transformaram</span> seus negócios
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Carlos Silva",
                barbershop: "Barbearia do Carlos",
                testimonial: "Meu faturamento aumentou 40% no primeiro mês. Agora tenho controle total da agenda!",
                rating: 5
              },
              {
                name: "João Pedro",
                barbershop: "JP Barber Shop",
                testimonial: "Acabou a bagunça! Meus clientes adoram agendar online e eu economizo horas por semana.",
                rating: 5
              },
              {
                name: "Roberto Costa",
                barbershop: "Costa's Barbearia",
                testimonial: "Sistema simples e profissional. Recomendo para todo barbeiro que quer crescer.",
                rating: 5
              }
            ].map((testimonial, i) => (
              <Card key={i} className="shadow-elegant hover:shadow-glow transition-all">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-accent fill-accent" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.testimonial}"</p>
                  <div className="border-t pt-4">
                    <p className="font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.barbershop}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans-section" className="py-20 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Escolha o plano ideal para <span className="text-accent">sua barbearia</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Simples, transparente e sem surpresas
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plano Mensal */}
            <Card className="relative border-2 hover:border-accent/50 transition-all hover:shadow-glow animate-fade-in hover-scale">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Plano Mensal</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-5xl font-bold text-accent">R$ 74,90</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Flexibilidade total, cancele quando quiser
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    "Agendamentos ilimitados",
                    "Gestão de barbeiros",
                    "Painel financeiro completo",
                    "Lembretes automáticos",
                    "Suporte dedicado"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a 
                  href="https://pay.kirvano.com/e9a13824-b88a-4012-a111-349a64b02194"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button 
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90 text-white font-bold transition-all"
                  >
                    Assinar Agora
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Plano Trimestral */}
            <Card className="relative border-2 border-accent shadow-glow animate-fade-in hover-scale" style={{ animationDelay: '0.1s' }}>
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white border-none px-4 py-1 animate-pulse">
                MAIS POPULAR
              </Badge>
              
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Plano Trimestral</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-5xl font-bold text-accent">R$ 149,90</span>
                    <span className="text-muted-foreground">/trimestre</span>
                  </div>
                  <p className="text-sm font-semibold text-accent mb-2">
                    Apenas R$ 49,96/mês
                  </p>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    Economize 33%
                  </Badge>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    "Agendamentos ilimitados",
                    "Gestão de barbeiros",
                    "Painel financeiro completo",
                    "Lembretes automáticos",
                    "Suporte dedicado",
                    "Melhor custo-benefício"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a 
                  href="https://pay.kirvano.com/cfef8cc5-042d-4a78-bade-0f4fd59fa92b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button 
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90 text-white font-bold shadow-glow transition-all"
                  >
                    Assinar Agora
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Pagamento seguro • Acesso imediato • Cancele quando quiser
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center">
          <Scissors className="h-20 w-20 text-accent mx-auto mb-8 animate-pulse" />
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Pronto para <span className="text-accent">transformar</span> sua barbearia?
          </h2>
          
          <p className="text-xl md:text-2xl opacity-80 mb-10">
            Comece agora e veja seus resultados crescerem em <strong>poucos dias.</strong>
          </p>
          
          <Button 
            size="lg"
            onClick={scrollToPlans}
            className="bg-accent hover:bg-accent/90 text-white px-12 py-6 text-xl font-bold shadow-glow hover:scale-105 transition-all"
          >
            Ver Planos
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;