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
      audit_log: {
        Row: {
          action: string
          admin_email: string | null
          admin_id: string | null
          created_at: string
          details: Json | null
          entity: string | null
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          admin_email?: string | null
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          admin_email?: string | null
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
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
      blackjack_rounds: {
        Row: {
          created_at: string
          dealer: number[]
          deck: number[]
          ended_at: string | null
          id: string
          payout: number
          player: number[]
          stake: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dealer: number[]
          deck: number[]
          ended_at?: string | null
          id?: string
          payout?: number
          player: number[]
          stake: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dealer?: number[]
          deck?: number[]
          ended_at?: string | null
          id?: string
          payout?: number
          player?: number[]
          stake?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      game_categories: {
        Row: {
          active: boolean
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
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
          category_id: string | null
          color: string
          emoji: string
          house_edge: number
          id: string
          maintenance: boolean
          max_stake: number
          min_stake: number
          rtp: number
          slug: string
          sort_order: number
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          active?: boolean
          category: string
          category_id?: string | null
          color: string
          emoji: string
          house_edge?: number
          id?: string
          maintenance?: boolean
          max_stake?: number
          min_stake?: number
          rtp?: number
          slug: string
          sort_order?: number
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          active?: boolean
          category?: string
          category_id?: string | null
          color?: string
          emoji?: string
          house_edge?: number
          id?: string
          maintenance?: boolean
          max_stake?: number
          min_stake?: number
          rtp?: number
          slug?: string
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "game_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      jackpot_entries: {
        Row: {
          correct_count: number
          created_at: string
          id: string
          jackpot_id: string
          picks: Json
          prize: number
          status: string
          user_id: string
        }
        Insert: {
          correct_count?: number
          created_at?: string
          id?: string
          jackpot_id: string
          picks: Json
          prize?: number
          status?: string
          user_id: string
        }
        Update: {
          correct_count?: number
          created_at?: string
          id?: string
          jackpot_id?: string
          picks?: Json
          prize?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jackpot_entries_jackpot_id_fkey"
            columns: ["jackpot_id"]
            isOneToOne: false
            referencedRelation: "jackpots"
            referencedColumns: ["id"]
          },
        ]
      }
      jackpot_matches: {
        Row: {
          id: string
          jackpot_id: string
          match_id: string
          result: string | null
        }
        Insert: {
          id?: string
          jackpot_id: string
          match_id: string
          result?: string | null
        }
        Update: {
          id?: string
          jackpot_id?: string
          match_id?: string
          result?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jackpot_matches_jackpot_id_fkey"
            columns: ["jackpot_id"]
            isOneToOne: false
            referencedRelation: "jackpots"
            referencedColumns: ["id"]
          },
        ]
      }
      jackpots: {
        Row: {
          created_at: string
          deadline: string
          entry_fee: number
          id: string
          name: string
          prize: number
          settled_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          deadline: string
          entry_fee?: number
          id?: string
          name: string
          prize?: number
          settled_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          deadline?: string
          entry_fee?: number
          id?: string
          name?: string
          prize?: number
          settled_at?: string | null
          status?: string
        }
        Relationships: []
      }
      lottery_draws: {
        Row: {
          created_at: string
          draw_at: string
          draw_no: number
          game_type: string
          id: string
          jackpot: number
          prize_pool: number
          settled_at: string | null
          status: string
          ticket_price: number
          winning_numbers: number[] | null
        }
        Insert: {
          created_at?: string
          draw_at: string
          draw_no?: number
          game_type?: string
          id?: string
          jackpot?: number
          prize_pool?: number
          settled_at?: string | null
          status?: string
          ticket_price?: number
          winning_numbers?: number[] | null
        }
        Update: {
          created_at?: string
          draw_at?: string
          draw_no?: number
          game_type?: string
          id?: string
          jackpot?: number
          prize_pool?: number
          settled_at?: string | null
          status?: string
          ticket_price?: number
          winning_numbers?: number[] | null
        }
        Relationships: []
      }
      lottery_tickets: {
        Row: {
          created_at: string
          draw_id: string
          id: string
          matched: number
          numbers: number[]
          prize: number
          stake: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          draw_id: string
          id?: string
          matched?: number
          numbers: number[]
          prize?: number
          stake: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          draw_id?: string
          id?: string
          matched?: number
          numbers?: number[]
          prize?: number
          stake?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lottery_tickets_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "lottery_draws"
            referencedColumns: ["id"]
          },
        ]
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
          markets: Json | null
          match_date: string
          match_time: string
          minute: string | null
          odds_away: number
          odds_draw: number
          odds_home: number
          score: string | null
          source: string
          sport: string
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
          markets?: Json | null
          match_date: string
          match_time: string
          minute?: string | null
          odds_away: number
          odds_draw: number
          odds_home: number
          score?: string | null
          source?: string
          sport?: string
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
          markets?: Json | null
          match_date?: string
          match_time?: string
          minute?: string | null
          odds_away?: number
          odds_draw?: number
          odds_home?: number
          score?: string | null
          source?: string
          sport?: string
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
      risk_settings: {
        Row: {
          daily_user_loss_cap: number
          global_max_win: number
          id: number
          max_active_bets_per_user: number
          updated_at: string
        }
        Insert: {
          daily_user_loss_cap?: number
          global_max_win?: number
          id?: number
          max_active_bets_per_user?: number
          updated_at?: string
        }
        Update: {
          daily_user_loss_cap?: number
          global_max_win?: number
          id?: number
          max_active_bets_per_user?: number
          updated_at?: string
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
      sports_config: {
        Row: {
          active: boolean
          created_at: string
          default_margin: number
          id: string
          league_external_id: string | null
          league_name: string
          sort_order: number
          sport: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          default_margin?: number
          id?: string
          league_external_id?: string | null
          league_name: string
          sort_order?: number
          sport: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          default_margin?: number
          id?: string
          league_external_id?: string | null
          league_name?: string
          sort_order?: number
          sport?: string
          updated_at?: string
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
      _bj_hand_value: { Args: { _h: number[] }; Returns: number }
      _bj_new_deck: { Args: never; Returns: number[] }
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
      blackjack_hit: {
        Args: { _round_id: string }
        Returns: {
          new_balance: number
          player: number[]
          status: string
          value: number
        }[]
      }
      blackjack_stand: {
        Args: { _round_id: string }
        Returns: {
          dealer: number[]
          new_balance: number
          payout: number
          player: number[]
          status: string
        }[]
      }
      blackjack_start: {
        Args: { _stake: number }
        Returns: {
          dealer_up: number
          new_balance: number
          player: number[]
          round_id: string
          status: string
          value: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      jackpot_enter: {
        Args: { _jp_id: string; _picks: Json }
        Returns: {
          entry_id: string
          new_balance: number
        }[]
      }
      jackpot_settle: {
        Args: { _jp_id: string }
        Returns: {
          total_paid: number
          winners: number
        }[]
      }
      lottery_buy_ticket: {
        Args: { _draw_id: string; _numbers: number[] }
        Returns: {
          new_balance: number
          ticket_id: string
        }[]
      }
      lottery_settle_draw: {
        Args: { _draw_id: string }
        Returns: {
          tickets_settled: number
          total_paid: number
          winning_numbers: number[]
        }[]
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
      play_roulette: {
        Args: { _bets: Json }
        Returns: {
          new_balance: number
          spin: number
          total_payout: number
          total_stake: number
          wins: Json
        }[]
      }
      play_sicbo: {
        Args: { _bets: Json }
        Returns: {
          d1: number
          d2: number
          d3: number
          new_balance: number
          total_payout: number
          total_stake: number
          wins: Json
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
