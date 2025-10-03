import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Clock, Palette, Shield } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BarbershopSettings from "@/components/BarbershopSettings";
import ServicesManagement from "@/components/ServicesManagement";

const SettingsPage = () => {
  const { canAccessSettings, loading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !canAccessSettings) {
      navigate('/dashboard');
    }
  }, [canAccessSettings, loading, navigate]);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </SidebarProvider>
    );
  }

  if (!canAccessSettings) {
    return null;
  }

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

          <div className="p-6">
            <Tabs defaultValue="barbershop" className="space-y-6">
              <TabsList>
                <TabsTrigger value="barbershop">Barbearia</TabsTrigger>
                <TabsTrigger value="services">Serviços</TabsTrigger>
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="notifications">Notificações</TabsTrigger>
                <TabsTrigger value="security">Segurança</TabsTrigger>
              </TabsList>

              <TabsContent value="barbershop" className="space-y-6">
                <BarbershopSettings />
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <ServicesManagement />
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-accent" />
                      Perfil Pessoal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" defaultValue="João Silva" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" defaultValue="(11) 99999-9999" />
                      </div>
                    </div>
                    <Button variant="hero">Salvar Alterações</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
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
                        <Label htmlFor="appointment-reminders">Lembretes de Agendamento</Label>
                        <p className="text-sm text-muted-foreground">Lembrar clientes sobre agendamentos</p>
                      </div>
                      <Switch id="appointment-reminders" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
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
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SettingsPage;