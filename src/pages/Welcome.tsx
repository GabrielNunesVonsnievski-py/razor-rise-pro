import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MessageCircle, 
  Smartphone, 
  DollarSign, 
  Tag, 
  Settings,
  CheckCircle,
  ArrowRight,
  Bot,
  Bell,
  TrendingUp,
  Scissors
} from "lucide-react";
import { Link } from "react-router-dom";
import winixLogo from "@/assets/winix-logo.png";

const Welcome = () => {
  const features = [
    {
      icon: Bot,
      title: "Bot de Automação WhatsApp",
      description: "Automatize agendamentos 24/7 via WhatsApp com confirmações automáticas",
      benefits: ["Reduz 80% do tempo em agendamentos", "Funciona mesmo quando você está ocupado", "Confirmações automáticas"],
      status: "Em Breve"
    },
    {
      icon: Settings,
      title: "Personalização do APP",
      description: "Customize cores, logo e informações da sua barbearia",
      benefits: ["Sua marca em destaque", "Interface personalizada", "Logo e cores próprias"],
      status: "Disponível"
    },
    {
      icon: Bell,
      title: "Lembretes no Calendário",
      description: "Clientes recebem lembretes automáticos dos agendamentos",
      benefits: ["Reduz faltas em 60%", "SMS e WhatsApp automáticos", "Confirmação de presença"],
      status: "Disponível"
    },
    {
      icon: TrendingUp,
      title: "Sistema Financeiro Completo",
      description: "Controle total de receitas, lucros e relatórios detalhados",
      benefits: ["Relatórios de lucro diário/mensal", "Controle de gastos", "Análise de performance"],
      status: "Disponível"
    },
    {
      icon: Tag,
      title: "Criação de Promoções",
      description: "Crie e gerencie promoções direto pelo app",
      benefits: ["Aumente vendas com promoções", "Fidelização de clientes", "Cupons personalizados"],
      status: "Disponível"
    },
    {
      icon: Calendar,
      title: "Agendamento Inteligente",
      description: "Sistema completo de agendamentos com confirmação automática",
      benefits: ["Interface intuitiva", "Controle de horários", "Histórico completo"],
      status: "Disponível"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img src={winixLogo} alt="Winix" className="w-10 h-10" />
              <span className="text-xl font-bold text-primary">Winix</span>
            </Link>
          </div>
          <Link to="/dashboard">
            <Button variant="outline">
              Ir para Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-hero text-accent-foreground py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-accent-foreground text-accent">
            ✨ Bem-vindo ao Winix!
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Sua Barbearia
            <span className="block text-gradient">Automatizada</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-3xl mx-auto">
            Descubra como o Winix vai revolucionar sua barbearia com automação completa,
            sistema financeiro e muito mais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button variant="accent" size="lg" className="text-lg px-8 py-6">
                <Smartphone className="w-5 h-5 mr-2" />
                Começar Agora
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
              Ver Tutorial
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-20">
        {/* Features Grid */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4">
              Recursos Poderosos para sua Barbearia
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cada funcionalidade foi pensada para automatizar e profissionalizar seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-elegant hover:shadow-glow transition-all duration-300 group relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 gradient-accent rounded-lg flex items-center justify-center group-hover:shadow-glow transition-all">
                      <feature.icon className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <Badge 
                      variant={feature.status === "Disponível" ? "default" : "secondary"}
                      className={feature.status === "Disponível" ? "bg-green-500 text-white" : ""}
                    >
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-primary">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-accent/5 rounded-2xl p-8 md:p-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Resultados Comprovados
            </h2>
            <p className="text-xl text-muted-foreground">
              Veja o impacto do Winix em barbearias como a sua
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">300%</div>
              <div className="text-primary font-semibold mb-2">Aumento em Agendamentos</div>
              <div className="text-sm text-muted-foreground">Com automação WhatsApp</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">60%</div>
              <div className="text-primary font-semibold mb-2">Redução em Faltas</div>
              <div className="text-sm text-muted-foreground">Com lembretes automáticos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">5h</div>
              <div className="text-primary font-semibold mb-2">Economia Diária</div>
              <div className="text-sm text-muted-foreground">Menos tempo administrativo</div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Comece a Transformar sua Barbearia Hoje
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Configure sua conta em minutos e veja a diferença imediatamente
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                <Settings className="w-5 h-5 mr-2" />
                Configurar Minha Barbearia
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <MessageCircle className="w-5 h-5 mr-2" />
              Suporte Ao Vivo
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Welcome;