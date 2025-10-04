import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, RefreshCw, Edit } from 'lucide-react';

const EmailConfirmation = () => {
  const [loading, setLoading] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const { toast } = useToast();

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast({
          title: 'Erro',
          description: 'Usuário não encontrado.',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      toast({
        title: 'Email reenviado!',
        description: 'Verifique sua caixa de entrada.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível reenviar o email.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      toast({
        title: 'Email atualizado!',
        description: 'Verifique seu novo email para confirmar.',
      });

      setChangingEmail(false);
      setNewEmail('');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o email.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-2xl">Confirme seu email</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para seu email. Clique no link para ativar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!changingEmail ? (
            <>
              <Button 
                onClick={handleResendEmail} 
                variant="hero" 
                className="w-full"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Reenviar Email
              </Button>
              <Button 
                onClick={() => setChangingEmail(true)} 
                variant="outline" 
                className="w-full"
              >
                <Edit className="w-4 h-4" />
                Trocar Email
              </Button>
            </>
          ) : (
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">Novo Email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="seunovo@email.com"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setChangingEmail(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="hero" 
                  className="flex-1"
                  disabled={loading}
                >
                  Atualizar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;
