import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Barbershop {
  id: number;
  owner_id: string;
  nome: string;
  slug: string;
  telefone: string | null;
  endereco: string | null;
  descricao: string | null;
  created_at: string;
  updated_at: string;
}

export function useBarbershop() {
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBarbershop();
  }, []);

  const fetchBarbershop = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('barbershops')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      setBarbershop(data);
    } catch (err) {
      console.error('Error fetching barbershop:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar barbearia');
    } finally {
      setLoading(false);
    }
  };

  const createBarbershop = async (data: {
    nome: string;
    slug: string;
    telefone?: string;
    endereco?: string;
    descricao?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: newBarbershop, error } = await supabase
        .from('barbershops')
        .insert({
          owner_id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;
      
      setBarbershop(newBarbershop);
      return { data: newBarbershop, error: null };
    } catch (err) {
      console.error('Error creating barbershop:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro ao criar barbearia' };
    }
  };

  const updateBarbershop = async (data: Partial<Barbershop>) => {
    try {
      if (!barbershop) throw new Error('Nenhuma barbearia encontrada');

      const { data: updated, error } = await supabase
        .from('barbershops')
        .update(data)
        .eq('id', barbershop.id)
        .select()
        .single();

      if (error) throw error;
      
      setBarbershop(updated);
      return { data: updated, error: null };
    } catch (err) {
      console.error('Error updating barbershop:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro ao atualizar barbearia' };
    }
  };

  return {
    barbershop,
    loading,
    error,
    createBarbershop,
    updateBarbershop,
    refetch: fetchBarbershop
  };
}
