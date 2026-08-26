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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      businesses: {
        Row: {
          approval_status: string
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          rating: number
          short_code: string | null
          store_name: string
          subscription_plan: string
          subscription_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          rating?: number
          short_code?: string | null
          store_name: string
          subscription_plan?: string
          subscription_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          rating?: number
          short_code?: string | null
          store_name?: string
          subscription_plan?: string
          subscription_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          id: string
          last_restock_date: string | null
          low_stock_threshold: number
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          id?: string
          last_restock_date?: string | null
          low_stock_threshold?: number
          product_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          id?: string
          last_restock_date?: string | null
          low_stock_threshold?: number
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          name: string
          order_id: string
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_id: string
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_id?: string
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          agent_id: string | null
          business_id: string | null
          commission: number
          created_at: string
          delivery_address: string | null
          delivery_fee: number
          id: string
          payment_status: string
          receipt_url: string | null
          status: string
          student_id: string | null
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          business_id?: string | null
          commission?: number
          created_at?: string
          delivery_address?: string | null
          delivery_fee?: number
          id?: string
          payment_status?: string
          receipt_url?: string | null
          status?: string
          student_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          business_id?: string | null
          commission?: number
          created_at?: string
          delivery_address?: string | null
          delivery_fee?: number
          id?: string
          payment_status?: string
          receipt_url?: string | null
          status?: string
          student_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          payment_method: string
          provider_reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          payment_method: string
          provider_reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          payment_method?: string
          provider_reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          is_primary: boolean
          product_id: string
          sort_order: number
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          business_id: string
          category: string
          created_at: string
          delivery_time: string | null
          description: string | null
          id: string
          image_url: string | null
          is_popular: boolean
          is_trending: boolean
          location: string | null
          name: string
          price: number
          rating: number
          status: string
          stock: number
          updated_at: string
        }
        Insert: {
          business_id: string
          category?: string
          created_at?: string
          delivery_time?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_popular?: boolean
          is_trending?: boolean
          location?: string | null
          name: string
          price?: number
          rating?: number
          status?: string
          stock?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          category?: string
          created_at?: string
          delivery_time?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_popular?: boolean
          is_trending?: boolean
          location?: string | null
          name?: string
          price?: number
          rating?: number
          status?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          status: string
          updated_at: string
          wallet_balance: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          status?: string
          updated_at?: string
          wallet_balance?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
          wallet_balance?: number
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
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
      withdrawals: {
        Row: {
          amount: number
          id: string
          payout_method: string
          processed_at: string | null
          provider_details: Json | null
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          id?: string
          payout_method: string
          processed_at?: string | null
          provider_details?: Json | null
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          id?: string
          payout_method?: string
          processed_at?: string | null
          provider_details?: Json | null
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "agent" | "business" | "admin"
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
      app_role: ["student", "agent", "business", "admin"],
    },
  },
} as const
