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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          member_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          member_id?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          member_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "tenant_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda_json: Json | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          meeting_type: string
          notes: string | null
          started_at: string | null
          status: string
          tenant_id: string
          updated_at: string | null
          week_start: string | null
        }
        Insert: {
          agenda_json?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          meeting_type?: string
          notes?: string | null
          started_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string | null
          week_start?: string | null
        }
        Update: {
          agenda_json?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          meeting_type?: string
          notes?: string | null
          started_at?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
          week_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      scorecard_entries: {
        Row: {
          created_at: string | null
          entered_at: string | null
          entered_by: string | null
          id: string
          metric_id: string
          status_color: string
          status_note: string | null
          tenant_id: string
          updated_at: string | null
          value: number | null
          week_start: string
        }
        Insert: {
          created_at?: string | null
          entered_at?: string | null
          entered_by?: string | null
          id?: string
          metric_id: string
          status_color: string
          status_note?: string | null
          tenant_id: string
          updated_at?: string | null
          value?: number | null
          week_start: string
        }
        Update: {
          created_at?: string | null
          entered_at?: string | null
          entered_by?: string | null
          id?: string
          metric_id?: string
          status_color?: string
          status_note?: string | null
          tenant_id?: string
          updated_at?: string | null
          value?: number | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "scorecard_entries_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "tenant_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scorecard_entries_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "scorecard_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scorecard_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      scorecard_metrics: {
        Row: {
          aggregation: string
          category: string
          created_at: string | null
          data_source: string | null
          id: string
          is_active: boolean | null
          metric_type: string
          name: string
          owner_member_id: string | null
          sort_order: number
          target_value: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          aggregation?: string
          category?: string
          created_at?: string | null
          data_source?: string | null
          id?: string
          is_active?: boolean | null
          metric_type?: string
          name: string
          owner_member_id?: string | null
          sort_order?: number
          target_value?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          aggregation?: string
          category?: string
          created_at?: string | null
          data_source?: string | null
          id?: string
          is_active?: boolean | null
          metric_type?: string
          name?: string
          owner_member_id?: string | null
          sort_order?: number
          target_value?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scorecard_metrics_owner_member_id_fkey"
            columns: ["owner_member_id"]
            isOneToOne: false
            referencedRelation: "tenant_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scorecard_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          created_at: string | null
          display_name: string
          email: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          push_subscription: Json | null
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          push_subscription?: Json | null
          role?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          push_subscription?: Json | null
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string
          name: string
          nudge_time: string
          onboarding_completed: boolean | null
          team_size: number
          timezone: string
          trade_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          nudge_time?: string
          onboarding_completed?: boolean | null
          team_size?: number
          timezone?: string
          trade_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          nudge_time?: string
          onboarding_completed?: boolean | null
          team_size?: number
          timezone?: string
          trade_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trade_defaults: {
        Row: {
          category: string
          id: string
          metric_name: string
          metric_type: string
          sort_order: number
          trade_type: string
        }
        Insert: {
          category?: string
          id?: string
          metric_name: string
          metric_type?: string
          sort_order: number
          trade_type: string
        }
        Update: {
          category?: string
          id?: string
          metric_name?: string
          metric_type?: string
          sort_order?: number
          trade_type?: string
        }
        Relationships: []
      }
      weekly_priorities: {
        Row: {
          carried_from_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          member_id: string
          priority_text: string
          sort_order: number
          status: string
          tenant_id: string
          updated_at: string | null
          week_start: string
        }
        Insert: {
          carried_from_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          member_id: string
          priority_text: string
          sort_order: number
          status?: string
          tenant_id: string
          updated_at?: string | null
          week_start: string
        }
        Update: {
          carried_from_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          member_id?: string
          priority_text?: string
          sort_order?: number
          status?: string
          tenant_id?: string
          updated_at?: string | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_priorities_carried_from_id_fkey"
            columns: ["carried_from_id"]
            isOneToOne: false
            referencedRelation: "weekly_priorities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_priorities_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "tenant_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_priorities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_tenant_owner: { Args: { p_tenant_id: string }; Returns: boolean }
      user_tenant_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
