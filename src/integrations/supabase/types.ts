export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          barbershop_id: number | null
          client: string
          created_at: string | null
          date: string
          id: string
          observacoes: string | null
          phone: string
          service: string
          service_id: number | null
          status: string
          time: string
          user_id: string | null
          valor: number | null
        }
        Insert: {
          barbershop_id?: number | null
          client: string
          created_at?: string | null
          date: string
          id?: string
          observacoes?: string | null
          phone: string
          service: string
          service_id?: number | null
          status?: string
          time: string
          user_id?: string | null
          valor?: number | null
        }
        Update: {
          barbershop_id?: number | null
          client?: string
          created_at?: string | null
          date?: string
          id?: string
          observacoes?: string | null
          phone?: string
          service?: string
          service_id?: number | null
          status?: string
          time?: string
          user_id?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      barbershop_clients: {
        Row: {
          barbershop_id: number
          client_user_id: string
          created_at: string | null
          id: number
        }
        Insert: {
          barbershop_id: number
          client_user_id: string
          created_at?: string | null
          id?: number
        }
        Update: {
          barbershop_id?: number
          client_user_id?: string
          created_at?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "barbershop_clients_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
        ]
      }
      barbershops: {
        Row: {
          created_at: string | null
          descricao: string | null
          dias_funcionamento: string[] | null
          endereco: string | null
          horario_abertura: string | null
          horario_fechamento: string | null
          id: number
          nome: string
          owner_id: string
          slug: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          dias_funcionamento?: string[] | null
          endereco?: string | null
          horario_abertura?: string | null
          horario_fechamento?: string | null
          id?: number
          nome: string
          owner_id: string
          slug: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          dias_funcionamento?: string[] | null
          endereco?: string | null
          horario_abertura?: string | null
          horario_fechamento?: string | null
          id?: number
          nome?: string
          owner_id?: string
          slug?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_records: {
        Row: {
          appointment_id: string | null
          barbershop_id: number
          data_registro: string | null
          descricao: string | null
          id: number
          metodo_pagamento: string | null
          tipo: string
          valor: number
        }
        Insert: {
          appointment_id?: string | null
          barbershop_id: number
          data_registro?: string | null
          descricao?: string | null
          id?: number
          metodo_pagamento?: string | null
          tipo: string
          valor: number
        }
        Update: {
          appointment_id?: string | null
          barbershop_id?: number
          data_registro?: string | null
          descricao?: string | null
          id?: number
          metodo_pagamento?: string | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_records_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          ativo: boolean | null
          barbershop_id: number
          created_at: string | null
          data_fim: string
          data_inicio: string
          desconto: number
          descricao: string | null
          id: number
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          barbershop_id: number
          created_at?: string | null
          data_fim: string
          data_inicio: string
          desconto: number
          descricao?: string | null
          id?: number
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          barbershop_id?: number
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          desconto?: number
          descricao?: string | null
          id?: number
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          ativo: boolean | null
          barbershop_id: number
          created_at: string | null
          duracao: number
          id: number
          nome: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          ativo?: boolean | null
          barbershop_id: number
          created_at?: string | null
          duracao: number
          id?: number
          nome: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          ativo?: boolean | null
          barbershop_id?: number
          created_at?: string | null
          duracao?: number
          id?: number
          nome?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      sync_user_profile: {
        Args: { user_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "barbeiro" | "cliente"
      appointment_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "no_show"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "barbeiro", "cliente"],
      appointment_status: [
        "pending",
        "confirmed",
        "completed",
        "no_show",
        "cancelled",
      ],
    },
  },
} as const
