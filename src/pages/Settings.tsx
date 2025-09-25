import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, User, Bell, Clock, Palette, Shield } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const SettingsPage = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Configurações</h1>
                <p className="text-sm text-muted-foreground">Personalize sua experiência</p>
              </div>
            </div>
            <Button variant="hero">
              Salvar Alterações
            </Button>
          </header>

          <div className="p-6 space-y-6">
            {/* Profile Settings */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-accent" />
                  Perfil da Barbearia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Barbearia</Label>
                    <Input id="name" defaultValue="Winix - Barbearia Premium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" defaultValue="(11) 99999-9999" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" defaultValue="Rua das Flores, 123 - Centro, São Paulo - SP" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea 
                    id="description" 
                    defaultValue="Barbearia premium com mais de 10 anos de experiência. Oferecemos cortes modernos, barba bem feita e um atendimento personalizado para cada cliente."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Horário de Funcionamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monday">Segunda-feira</Label>
                    <div className="flex gap-2">
                      <Input id="monday-start" defaultValue="08:00" type="time" />
                      <Input id="monday-end" defaultValue="18:00" type="time" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tuesday">Terça-feira</Label>
                    <div className="flex gap-2">
                      <Input id="tuesday-start" defaultValue="08:00" type="time" />
                      <Input id="tuesday-end" defaultValue="18:00" type="time" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wednesday">Quarta-feira</Label>
                    <div className="flex gap-2">
                      <Input id="wednesday-start" defaultValue="08:00" type="time" />
                      <Input id="wednesday-end" defaultValue="18:00" type="time" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thursday">Quinta-feira</Label>
                    <div className="flex gap-2">
                      <Input id="thursday-start" defaultValue="08:00" type="time" />
                      <Input id="thursday-end" defaultValue="18:00" type="time" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="friday">Sexta-feira</Label>
                    <div className="flex gap-2">
                      <Input id="friday-start" defaultValue="08:00" type="time" />
                      <Input id="friday-end" defaultValue="18:00" type="time" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="saturday">Sábado</Label>
                    <div className="flex gap-2">
                      <Input id="saturday-start" defaultValue="08:00" type="time" />
                      <Input id="saturday-end" defaultValue="16:00" type="time" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="sunday-closed" defaultChecked />
                  <Label htmlFor="sunday-closed">Fechado aos domingos</Label>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-accent" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">E-mail</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações por e-mail</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notifications">SMS</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações por SMS</p>
                  </div>
                  <Switch id="sms-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="appointment-reminders">Lembretes de Agendamento</Label>
                    <p className="text-sm text-muted-foreground">Lembrar clientes sobre agendamentos</p>
                  </div>
                  <Switch id="appointment-reminders" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="promotion-notifications">Promoções</Label>
                    <p className="text-sm text-muted-foreground">Notificar sobre novas promoções</p>
                  </div>
                  <Switch id="promotion-notifications" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-accent" />
                  Aparência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">Usar tema escuro na interface</p>
                  </div>
                  <Switch id="dark-mode" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input id="current-password" type="password" placeholder="Digite sua senha atual" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input id="new-password" type="password" placeholder="Digite sua nova senha" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input id="confirm-password" type="password" placeholder="Confirme sua nova senha" />
                </div>
                <Button variant="outline" className="w-full">
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SettingsPage;