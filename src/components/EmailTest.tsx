import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const EmailTest = () => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendEmail = async () => {
    if (!to || !subject || !body) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          body,
        },
      });

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "O email foi enviado com sucesso.",
      });

      // Clear form
      setTo("");
      setSubject("");
      setBody("");
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Teste de Envio de Email</CardTitle>
        <CardDescription>
          Preencha os campos abaixo para testar o envio de emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="to">Destinatário</Label>
          <Input
            id="to"
            type="email"
            placeholder="email@exemplo.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subject">Assunto</Label>
          <Input
            id="subject"
            placeholder="Assunto do email"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="body">Mensagem</Label>
          <Textarea
            id="body"
            placeholder="Digite a mensagem do email aqui..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
          />
        </div>
        
        <Button
          onClick={handleSendEmail}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Enviando..." : "Enviar Email"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmailTest;
