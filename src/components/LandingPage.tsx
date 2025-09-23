import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Scissors, Star, Clock, Smartphone, TrendingUp, Users, MessageCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const features = [
    {
      icon: Calendar,
      title: "Agendamento Inteligente",
      description: "Sistema completo de agendamentos com confirmação automática",
    },
    {
      icon: MessageCircle,
      title: "Bot WhatsApp",
      description: "Automação completa para agendamentos via WhatsApp",
    },
    {
      icon: TrendingUp,
      title: "Sistema Financeiro",
      description: "Controle total de receitas, lucros e relatórios detalhados",
    },
    {
      icon: Star,
      title: "Promoções Personalizadas",
      description: "Crie e gerencie promoções direto pelo app",
    },
  ];

  const benefits = [
    "Aumente seus agendamentos em até 300%",
    "Reduza cancelamentos com lembretes automáticos",
    "Controle financeiro completo",
    "Interface moderna e responsiva",
    "Suporte completo para dispositivos móveis",
    "Integração com WhatsApp Business"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="src/img/winix.png">
              <img src="src/img/winix.png" alt="Winix" className="w-20 h-20" />
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/booking">
              <Button variant="outline">Agendar</Button>
            </Link>
            <Link to="/auth">
              <Button variant="accent">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero text-accent-foreground py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-accent-foreground text-accent">
            🚀 Lançamento Especial - 50% OFF
          </Badge>
          <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
            O Sistema Completo para sua
            <span className="block text-gradient">Barbearia</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-3xl mx-auto">
            Transforme sua barbearia com agendamento automático via WhatsApp,
            sistema financeiro completo e muito mais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button variant="accent" size="lg" className="text-lg px-8 py-6">
                Cadastrar-se
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-20">
        {/* Features */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sistema completo para automatizar e profissionalizar sua barbearia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-elegant hover:shadow-glow transition-all duration-300 group">
                <CardHeader>
                  <div className="w-12 h-12 gradient-accent rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-all">
                    <feature.icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-xl text-primary">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>


        {/* CTA */}
        <section className="text-center bg-accent/5 rounded-2xl p-8 md:p-16">
          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4">
            Pronto para revolucionar sua barbearia?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de barbeiros que já transformaram seus negócios
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6">
              <Smartphone className="w-5 h-5" />
              Começar Teste Grátis
            </Button>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Ver Dashboard Demo
              </Button>
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scissors className="w-8 h-8 text-accent" />
            <span className="text-2xl font-bold">Winix</span>
          </div>
          <p className="text-primary-foreground/80">
            © 2024 Winix. Transformando barbearias em todo o Brasil.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;