import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EmailTest = () => {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('email-test', {
        body: { testEmail },
      });

      if (error) throw error;

      setResult(data);
      
      if (data.success) {
        toast({
          title: "✅ E-mail enviado!",
          description: "Verifique a caixa de entrada do e-mail de teste.",
        });
      } else {
        toast({
          title: "❌ Erro no envio",
          description: data.error || "Falha ao enviar e-mail de teste.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Email test error:', error);
      setResult({ success: false, error: error.message });
      toast({
        title: "Erro",
        description: error.message || "Erro ao testar e-mail.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-4">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Teste de <span className="text-gradient">E-mail</span>
          </h1>
          <p className="text-muted-foreground">
            Sistema de diagnóstico e validação de envio de e-mails
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Enviar E-mail de Teste
            </CardTitle>
            <CardDescription>
              Digite um endereço de e-mail para testar o sistema completo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Endereço de E-mail</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="seu@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar E-mail de Teste
                  </>
                )}
              </Button>
            </form>

            {result && (
              <div className="mt-6 space-y-4">
                <Alert variant={result.success ? "default" : "destructive"}>
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {result.success ? "Sucesso!" : "Falha no Envio"}
                  </AlertTitle>
                  <AlertDescription>
                    {result.success ? (
                      <>
                        E-mail enviado com sucesso!
                        {result.result?.provider && (
                          <p className="mt-2 text-sm">
                            Provedor utilizado: <strong>{result.result.provider}</strong>
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        {result.error}
                        <p className="mt-2 text-sm">
                          Verifique as configurações de SMTP/Resend e os registros DNS.
                        </p>
                      </>
                    )}
                  </AlertDescription>
                </Alert>

                {result.logs && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Logs do Teste</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Configuração DNS Necessária
            </CardTitle>
            <CardDescription>
              Para garantir a entrega de e-mails, configure estes registros DNS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">1. Registro SPF (TXT)</h3>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Nome/Host:</p>
                <code className="text-xs">@</code>
                <p className="text-xs text-muted-foreground mb-1 mt-2">Valor:</p>
                <code className="text-xs break-all">v=spf1 include:_spf.resend.com ~all</code>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">2. Registro DKIM (CNAME)</h3>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Nome/Host:</p>
                <code className="text-xs">resend._domainkey</code>
                <p className="text-xs text-muted-foreground mb-1 mt-2">Aponta para:</p>
                <code className="text-xs break-all">resend._domainkey.resend.com</code>
                <p className="text-xs text-yellow-600 mt-2">
                  ⚠️ Verifique o valor exato no painel da Resend
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">3. Registro DMARC (TXT)</h3>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Nome/Host:</p>
                <code className="text-xs">_dmarc</code>
                <p className="text-xs text-muted-foreground mb-1 mt-2">Valor:</p>
                <code className="text-xs break-all">v=DMARC1; p=none; rua=mailto:admin@winixbarbearia.com.br</code>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Após adicionar os registros DNS, aguarde até 48 horas para propagação completa.
                Use ferramentas como <a href="https://mxtoolbox.com" target="_blank" rel="noopener noreferrer" className="underline">MXToolbox</a> para verificar.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle>Status da Configuração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Resend API configurada</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>SMTP configurado (fallback)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Sistema de retry implementado (3 tentativas)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Logs automáticos habilitados</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span>DNS: Verifique os registros acima</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailTest;
