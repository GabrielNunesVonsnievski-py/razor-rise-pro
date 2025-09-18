import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Phone, Star, Scissors, User } from "lucide-react";

const ClientInterface = () => {
  const services = [
    { name: "Corte Masculino", price: "R$ 25", duration: "30 min" },
    { name: "Barba", price: "R$ 20", duration: "20 min" },
    { name: "Corte + Barba", price: "R$ 35", duration: "45 min" },
    { name: "Sobrancelha", price: "R$ 10", duration: "15 min" },
  ];

  const availableTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-hero text-accent-foreground py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Barbearia Premium
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Agende seu horário e tenha a melhor experiência em cortes e barbas
          </p>
          <Button variant="accent" size="lg" className="text-lg px-8">
            <Calendar className="w-5 h-5" />
            Agendar Agora
          </Button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto p-6 space-y-8 -mt-8">
        {/* Booking Card */}
        <Card className="shadow-elegant bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Scissors className="w-6 h-6 text-accent" />
              Agendar Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Escolha o Serviço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border rounded-lg hover:border-accent cursor-pointer transition-all hover:shadow-elegant"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-primary">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">{service.duration}</p>
                      </div>
                      <div className="text-lg font-bold text-accent">{service.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Horários Disponíveis - Hoje</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {availableTimes.map((time, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="hover:border-accent hover:text-accent"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full">
              Confirmar Agendamento
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Promotions */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-accent">Promoções Especiais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 gradient-accent rounded-lg text-accent-foreground">
                <h3 className="font-bold">Corte + Barba</h3>
                <p className="text-sm opacity-90">De R$ 45 por apenas</p>
                <p className="text-2xl font-bold">R$ 35</p>
                <Badge className="mt-2 bg-accent-foreground text-accent">Limitado</Badge>
              </div>
              
              <div className="p-4 border border-accent rounded-lg">
                <h3 className="font-bold text-accent">Pacote Noivo</h3>
                <p className="text-sm text-muted-foreground">Corte + Barba + Sobrancelha</p>
                <p className="text-xl font-bold text-primary">R$ 80,00</p>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium text-primary">Localização</p>
                  <p className="text-sm text-muted-foreground">Rua das Flores, 123</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium text-primary">Horário</p>
                  <p className="text-sm text-muted-foreground">Seg-Sab: 8h às 18h</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium text-primary">Contato</p>
                  <p className="text-sm text-muted-foreground">(11) 99999-9999</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.9</div>
                <div className="flex justify-center text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">89 avaliações</p>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-primary">João M.</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    "Excelente atendimento! Muito profissional."
                  </p>
                </div>
                
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-primary">Pedro S.</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    "Melhor barbearia da região!"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientInterface;