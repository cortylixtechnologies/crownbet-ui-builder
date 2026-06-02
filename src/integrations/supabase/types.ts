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
      aviator_rounds: {
        Row: {
          cashed_at_multiplier: number | null
          crash_multiplier: number
          ended_at: string | null
          id: string
          stake: number
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          cashed_at_multiplier?: number | null
          crash_multiplier: number
          ended_at?: string | null
          id?: string
          stake: number
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          cashed_at_multiplier?: number | null
          crash_multiplier?: number
          ended_at?: string | null
          id?: string
          stake?: number
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      bet_selections: {
        Row: {
          bet_id: string
          id: string
          market: string
          match_id: string | null
          match_label: string
          odd: number
          pick: string
        }
        Insert: {
          bet_id: string
          id?: string
          market: string
          match_id?: string | null
          match_label: string
          odd: number
          pick: string
        }
        Update: {
          bet_id?: string
          id?: string
          market?: string
          match_id?: string | null
          match_label?: string
          odd?: number
          pick?: string
        }
        Relationships: [
          {
            foreignKeyName: "bet_selections_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bet_selections_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      bets: {
        Row: {
          id: string
          placed_at: string
          potential_win: number
          settled_at: string | null
          stake: number
          status: string
          total_odds: number
          user_id: string
        }
        Insert: {
          id?: string
          placed_at?: string
          potential_win: number
          settled_at?: string | null
          stake: number
          status?: string
          total_odds: number
          user_id: string
        }
        Update: {
          id?: string
          placed_at?: string
          potential_win?: number
          settled_at?: string | null
          stake?: number
          status?: string
          total_odds?: number
          user_id?: string
        }
        Relationships: []
      }
      game_transactions: {
        Row: {
          created_at: string
          game: string
          id: string
          meta: Json | null
          multiplier: number | null
          net: number
          payout: number
          stake: number
          user_id: string
        }
        Insert: {
          created_at?: string
          game: string
          id?: string
          meta?: Json | null
          multiplier?: number | null
          net?: number
          payout?: number
          stake?: number
          user_id: string
        }
        Update: {
          created_at?: string
          game?: string
          id?: string
          meta?: Json | null
          multiplier?: number | null
          net?: number
          payout?: number
          stake?: number
          user_id?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          active: boolean
          category: string
          color: string
          emoji: string
          id: string
          slug: string
          sort_order: number
          title: string
        }
        Insert: {
          active?: boolean
          category: string
          color: string
          emoji: string
          id?: string
          slug: string
          sort_order?: number
          title: string
        }
        Update: {
          active?: boolean
          category?: string
          color?: string
          emoji?: string
          id?: string
          slug?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          approved: boolean
          away: string
          created_at: string
          external_id: string | null
          home: string
          hot: boolean
          id: string
          league: string
          league_icon: string | null
          live: boolean
          match_date: string
          match_time: string
          minute: string | null
          odds_away: number
          odds_draw: number
          odds_home: number
          score: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          away: string
          created_at?: string
          external_id?: string | null
          home: string
          hot?: boolean
          id?: string
          league: string
          league_icon?: string | null
          live?: boolean
          match_date: string
          match_time: string
          minute?: string | null
          odds_away: number
          odds_draw: number
          odds_home: number
          score?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          away?: string
          created_at?: string
          external_id?: string | null
          home?: string
          hot?: boolean
          id?: string
          league?: string
          league_icon?: string | null
          live?: boolean
          match_date?: string
          match_time?: string
          minute?: string | null
          odds_away?: number
          odds_draw?: number
          odds_home?: number
          score?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      mines_rounds: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          mine_tiles: number[]
          mines_count: number
          revealed: number[]
          stake: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          mine_tiles: number[]
          mines_count: number
          revealed?: number[]
          stake: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          mine_tiles?: number[]
          mines_count?: number
          revealed?: number[]
          stake?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          status?: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          active: boolean
          color: string
          created_at: string
          emoji: string
          id: string
          sort_order: number
          title: string
          to_url: string
        }
        Insert: {
          active?: boolean
          color: string
          created_at?: string
          emoji: string
          id?: string
          sort_order?: number
          title: string
          to_url: string
        }
        Update: {
          active?: boolean
          color?: string
          created_at?: string
          emoji?: string
          id?: string
          sort_order?: number
          title?: string
          to_url?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          accepting_bets: boolean
          id: number
          maintenance: boolean
          max_stake: number
          min_stake: number
          site_name: string
          updated_at: string
          welcome_bonus_pct: number
        }
        Insert: {
          accepting_bets?: boolean
          id?: number
          maintenance?: boolean
          max_stake?: number
          min_stake?: number
          site_name?: string
          updated_at?: string
          welcome_bonus_pct?: number
        }
        Update: {
          accepting_bets?: boolean
          id?: number
          maintenance?: boolean
          max_stake?: number
          min_stake?: number
          site_name?: string
          updated_at?: string
          welcome_bonus_pct?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _game_settle: {
        Args: {
          _game: string
          _meta: Json
          _multiplier: number
          _payout: number
          _stake: number
          _uid: string
        }
        Returns: number
      }
      aviator_cashout: {
        Args: { _claimed_multiplier: number; _round_id: string }
        Returns: {
          crash_multiplier: number
          crashed: boolean
          multiplier: number
          new_balance: number
          payout: number
        }[]
      }
      aviator_resolve_crashed: {
        Args: { _round_id: string }
        Returns: undefined
      }
      aviator_start: {
        Args: { _stake: number }
        Returns: {
          new_balance: number
          round_id: string
          started_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mines_cashout: {
        Args: { _round_id: string }
        Returns: {
          multiplier: number
          new_balance: number
          payout: number
        }[]
      }
      mines_pick: {
        Args: { _round_id: string; _tile: number }
        Returns: {
          hit_mine: boolean
          multiplier: number
          revealed_count: number
          status: string
        }[]
      }
      mines_start: {
        Args: { _mines_count: number; _stake: number }
        Returns: {
          new_balance: number
          round_id: string
        }[]
      }
      place_bet: {
        Args: { _selections: Json; _stake: number }
        Returns: string
      }
      play_coinflip: {
        Args: { _pick: string; _stake: number }
        Returns: {
          new_balance: number
          payout: number
          result: string
          won: boolean
        }[]
      }
      play_dice: {
        Args: { _over: boolean; _stake: number; _target: number }
        Returns: {
          multiplier: number
          new_balance: number
          payout: number
          roll: number
          won: boolean
        }[]
      }
      play_wheel: {
        Args: { _stake: number }
        Returns: {
          multiplier: number
          new_balance: number
          payout: number
          segment: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
