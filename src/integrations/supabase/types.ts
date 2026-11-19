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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_permissions: {
        Row: {
          permission: Database["public"]["Enums"]["admin_permission"]
          user_id: string
        }
        Insert: {
          permission: Database["public"]["Enums"]["admin_permission"]
          user_id: string
        }
        Update: {
          permission?: Database["public"]["Enums"]["admin_permission"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: number
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: never
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: never
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      intake_submissions: {
        Row: {
          application_type: string
          created_at: string
          email: string
          full_name: string
          id: string
          lga: string
          phone: string
          state: string
          status: string
        }
        Insert: {
          application_type: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          lga: string
          phone: string
          state: string
          status?: string
        }
        Update: {
          application_type?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          lga?: string
          phone?: string
          state?: string
          status?: string
        }
        Relationships: []
      }
      order_communications: {
        Row: {
          author_id: string
          channel: string
          created_at: string
          id: number
          order_id: string
          summary: string
        }
        Insert: {
          author_id: string
          channel: string
          created_at?: string
          id?: never
          order_id: string
          summary: string
        }
        Update: {
          author_id?: string
          channel?: string
          created_at?: string
          id?: never
          order_id?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_communications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_delivery: {
        Row: {
          address: string
          area: string
          delivery_code: string
          instructions: string | null
          is_alternate: boolean
          landmark: string | null
          order_id: string
          recipient_name: string
          recipient_phone: string
        }
        Insert: {
          address: string
          area: string
          delivery_code?: string
          instructions?: string | null
          is_alternate?: boolean
          landmark?: string | null
          order_id: string
          recipient_name: string
          recipient_phone: string
        }
        Update: {
          address?: string
          area?: string
          delivery_code?: string
          instructions?: string | null
          is_alternate?: boolean
          landmark?: string | null
          order_id?: string
          recipient_name?: string
          recipient_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_delivery_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          actor_id: string | null
          actor_role: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: number
          kind: string
          note: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"] | null
        }
        Insert: {
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: never
          kind?: string
          note?: string | null
          order_id: string
          to_status?: Database["public"]["Enums"]["order_status"] | null
        }
        Update: {
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: never
          kind?: string
          note?: string | null
          order_id?: string
          to_status?: Database["public"]["Enums"]["order_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          actual_price: number | null
          id: string
          name: string
          notes: string | null
          order_id: string
          position: number
          quantity: number
          runner_note: string | null
          status: Database["public"]["Enums"]["item_status"]
          substitute_approved: boolean | null
          substitute_name: string | null
          target_price: number | null
          unit: string | null
        }
        Insert: {
          actual_price?: number | null
          id?: string
          name: string
          notes?: string | null
          order_id: string
          position?: number
          quantity: number
          runner_note?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          substitute_approved?: boolean | null
          substitute_name?: string | null
          target_price?: number | null
          unit?: string | null
        }
        Update: {
          actual_price?: number | null
          id?: string
          name?: string
          notes?: string | null
          order_id?: string
          position?: number
          quantity?: number
          runner_note?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          substitute_approved?: boolean | null
          substitute_name?: string | null
          target_price?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancel_reason: string | null
          category: Database["public"]["Enums"]["business_category"]
          code: string
          courier_id: string | null
          created_at: string
          customer_id: string
          customer_note: string | null
          delivered_at: string | null
          delivery_fee: number | null
          id: string
          issue_note: string | null
          items_subtotal: number | null
          payment_status: string
          preferred_window: string | null
          proof_recipient: string | null
          quote_note: string | null
          quoted_at: string | null
          runner_id: string | null
          seller_decline_reason: string | null
          seller_id: string | null
          seller_response:
            | Database["public"]["Enums"]["assignment_response"]
            | null
          service_fee: number | null
          status: Database["public"]["Enums"]["order_status"]
          status_before_issue:
            | Database["public"]["Enums"]["order_status"]
            | null
          updated_at: string
        }
        Insert: {
          cancel_reason?: string | null
          category?: Database["public"]["Enums"]["business_category"]
          code?: string
          courier_id?: string | null
          created_at?: string
          customer_id: string
          customer_note?: string | null
          delivered_at?: string | null
          delivery_fee?: number | null
          id?: string
          issue_note?: string | null
          items_subtotal?: number | null
          payment_status?: string
          preferred_window?: string | null
          proof_recipient?: string | null
          quote_note?: string | null
          quoted_at?: string | null
          runner_id?: string | null
          seller_decline_reason?: string | null
          seller_id?: string | null
          seller_response?:
            | Database["public"]["Enums"]["assignment_response"]
            | null
          service_fee?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          status_before_issue?:
            | Database["public"]["Enums"]["order_status"]
            | null
          updated_at?: string
        }
        Update: {
          cancel_reason?: string | null
          category?: Database["public"]["Enums"]["business_category"]
          code?: string
          courier_id?: string | null
          created_at?: string
          customer_id?: string
          customer_note?: string | null
          delivered_at?: string | null
          delivery_fee?: number | null
          id?: string
          issue_note?: string | null
          items_subtotal?: number | null
          payment_status?: string
          preferred_window?: string | null
          proof_recipient?: string | null
          quote_note?: string | null
          quoted_at?: string | null
          runner_id?: string | null
          seller_decline_reason?: string | null
          seller_id?: string | null
          seller_response?:
            | Database["public"]["Enums"]["assignment_response"]
            | null
          service_fee?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          status_before_issue?:
            | Database["public"]["Enums"]["order_status"]
            | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_runner_id_fkey"
            columns: ["runner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          accepting_requests: boolean
          countdown_enabled: boolean
          id: boolean
          launch_at: string | null
          launch_live: boolean
          payments_mode: string
          prelaunch_message: string
          service_area: string
          updated_at: string
          updated_by: string | null
          wallet_enabled: boolean
        }
        Insert: {
          accepting_requests?: boolean
          countdown_enabled?: boolean
          id?: boolean
          launch_at?: string | null
          launch_live?: boolean
          payments_mode?: string
          prelaunch_message?: string
          service_area?: string
          updated_at?: string
          updated_by?: string | null
          wallet_enabled?: boolean
        }
        Update: {
          accepting_requests?: boolean
          countdown_enabled?: boolean
          id?: boolean
          launch_at?: string | null
          launch_live?: boolean
          payments_mode?: string
          prelaunch_message?: string
          service_area?: string
          updated_at?: string
          updated_by?: string | null
          wallet_enabled?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          default_address: string | null
          default_area: string | null
          full_name: string
          id: string
          phone: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_address?: string | null
          default_area?: string | null
          full_name?: string
          id: string
          phone?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_address?: string | null
          default_area?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Relationships: []
      }
      sellers: {
        Row: {
          accepting_requests: boolean
          business_name: string
          category: Database["public"]["Enums"]["business_category"]
          created_at: string
          description: string | null
          id: string
          market_location: string | null
          operating_hours: string | null
          owner_id: string
          service_area: string
          status: Database["public"]["Enums"]["seller_status"]
          updated_at: string
        }
        Insert: {
          accepting_requests?: boolean
          business_name: string
          category: Database["public"]["Enums"]["business_category"]
          created_at?: string
          description?: string | null
          id?: string
          market_location?: string | null
          operating_hours?: string | null
          owner_id: string
          service_area?: string
          status?: Database["public"]["Enums"]["seller_status"]
          updated_at?: string
        }
        Update: {
          accepting_requests?: boolean
          business_name?: string
          category?: Database["public"]["Enums"]["business_category"]
          created_at?: string
          description?: string | null
          id?: string
          market_location?: string | null
          operating_hours?: string | null
          owner_id?: string
          service_area?: string
          status?: Database["public"]["Enums"]["seller_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sellers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      _log_event: {
        Args: {
          _from: Database["public"]["Enums"]["order_status"]
          _kind: string
          _note: string
          _order: string
          _role: string
          _to: Database["public"]["Enums"]["order_status"]
        }
        Returns: undefined
      }
      admin_list_users: {
        Args: { _search: string }
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          roles: Database["public"]["Enums"]["app_role"][]
          status: Database["public"]["Enums"]["account_status"]
        }[]
      }
      admin_set_account_status: {
        Args: {
          _reason: string
          _status: Database["public"]["Enums"]["account_status"]
          _user: string
        }
        Returns: undefined
      }
      admin_set_permission: {
        Args: {
          _grant: boolean
          _perm: Database["public"]["Enums"]["admin_permission"]
          _user: string
        }
        Returns: undefined
      }
      admin_set_role: {
        Args: {
          _grant: boolean
          _role: Database["public"]["Enums"]["app_role"]
          _user: string
        }
        Returns: undefined
      }
      admin_set_seller_status: {
        Args: {
          _reason: string
          _seller: string
          _status: Database["public"]["Enums"]["seller_status"]
        }
        Returns: undefined
      }
      admin_update_countdown: {
        Args: { _enabled: boolean }
        Returns: undefined
      }
      admin_update_intake_status: {
        Args: { _status: string; _submission: string }
        Returns: undefined
      }
      admin_update_settings: {
        Args: {
          _accepting: boolean
          _area: string
          _launch_at: string
          _launch_live: boolean
          _message: string
          _payments: string
        }
        Returns: undefined
      }
      can_view_order: {
        Args: { _order_id: string; _uid: string }
        Returns: boolean
      }
      courier_transition: {
        Args: {
          _code: string
          _note: string
          _order: string
          _recipient: string
          _to: Database["public"]["Enums"]["order_status"]
        }
        Returns: undefined
      }
      create_order: {
        Args: {
          _category: Database["public"]["Enums"]["business_category"]
          _delivery: Json
          _items: Json
          _note: string
          _window: string
        }
        Returns: string
      }
      customer_cancel: {
        Args: { _order: string; _reason: string }
        Returns: undefined
      }
      customer_decide_substitution: {
        Args: { _approve: boolean; _item: string }
        Returns: undefined
      }
      customer_respond_quote: {
        Args: { _accept: boolean; _order: string; _reason: string }
        Returns: undefined
      }
      has_permission: {
        Args: {
          _perm: Database["public"]["Enums"]["admin_permission"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active: { Args: { _user_id: string }; Returns: boolean }
      is_order_seller: {
        Args: { _order_id: string; _uid: string }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      my_delivery_code: { Args: { _order: string }; Returns: string }
      ops_assign: {
        Args: {
          _courier: string
          _order: string
          _runner: string
          _seller: string
        }
        Returns: undefined
      }
      ops_quote: {
        Args: {
          _delivery: number
          _note: string
          _order: string
          _service: number
          _subtotal: number
        }
        Returns: undefined
      }
      ops_transition: {
        Args: {
          _note: string
          _order: string
          _to: Database["public"]["Enums"]["order_status"]
        }
        Returns: undefined
      }
      order_transition_allowed: {
        Args: {
          _from: Database["public"]["Enums"]["order_status"]
          _to: Database["public"]["Enums"]["order_status"]
        }
        Returns: boolean
      }
      runner_transition: {
        Args: {
          _note: string
          _order: string
          _to: Database["public"]["Enums"]["order_status"]
        }
        Returns: undefined
      }
      seller_respond: {
        Args: { _accept: boolean; _order: string; _reason: string }
        Returns: undefined
      }
      staff_list_people: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: {
          full_name: string
          id: string
          phone: string
          status: Database["public"]["Enums"]["account_status"]
        }[]
      }
      update_item: {
        Args: {
          _item: string
          _note: string
          _price: number
          _status: Database["public"]["Enums"]["item_status"]
          _substitute: string
        }
        Returns: undefined
      }
      write_audit: {
        Args: {
          _action: string
          _details: Json
          _target_id: string
          _target_type: string
        }
        Returns: undefined
      }
    }
    Enums: {
      account_status: "active" | "suspended"
      admin_permission:
        | "manage_users"
        | "manage_partners"
        | "manage_orders"
        | "manage_settings"
        | "view_audit"
      app_role:
        | "customer"
        | "seller"
        | "runner"
        | "courier"
        | "operations"
        | "admin"
        | "super_admin"
      assignment_response: "pending" | "accepted" | "declined"
      business_category:
        | "market"
        | "restaurant"
        | "bakery"
        | "factory"
        | "other"
      item_status: "pending" | "available" | "unavailable" | "substituted"
      order_status:
        | "submitted"
        | "quoted"
        | "confirmed"
        | "sourcing"
        | "ready"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "issue"
      seller_status: "pending" | "approved" | "suspended"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      account_status: ["active", "suspended"],
      admin_permission: [
        "manage_users",
        "manage_partners",
        "manage_orders",
        "manage_settings",
        "view_audit",
      ],
      app_role: [
        "customer",
        "seller",
        "runner",
        "courier",
        "operations",
        "admin",
        "super_admin",
      ],
      assignment_response: ["pending", "accepted", "declined"],
      business_category: ["market", "restaurant", "bakery", "factory", "other"],
      item_status: ["pending", "available", "unavailable", "substituted"],
      order_status: [
        "submitted",
        "quoted",
        "confirmed",
        "sourcing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "issue",
      ],
      seller_status: ["pending", "approved", "suspended"],
    },
  },
} as const
