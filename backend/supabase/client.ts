import { createClient } from '@supabase/supabase-js';
import { secret } from "encore.dev/config";

const supabaseUrl = secret("SupabaseUrl");
const supabaseKey = secret("SupabaseKey");

export const supabase = createClient(supabaseUrl(), supabaseKey());

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          username: string | null;
          role: string;
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          username?: string | null;
          role?: string;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          username?: string | null;
          role?: string;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          first_name: string | null;
          last_name: string | null;
          phone_number: string | null;
          date_of_birth: string | null;
          preferred_language: string;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          parental_control_enabled: boolean;
          guardian_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name?: string | null;
          last_name?: string | null;
          phone_number?: string | null;
          date_of_birth?: string | null;
          preferred_language?: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          parental_control_enabled?: boolean;
          guardian_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone_number?: string | null;
          date_of_birth?: string | null;
          preferred_language?: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          parental_control_enabled?: boolean;
          guardian_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_type: string;
          language: string;
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_type: string;
          language?: string;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_type?: string;
          language?: string;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          sender: string;
          message: string;
          sentiment_score: number | null;
          risk_level: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          sender: string;
          message: string;
          sentiment_score?: number | null;
          risk_level?: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          sender?: string;
          message?: string;
          sentiment_score?: number | null;
          risk_level?: string;
          timestamp?: string;
        };
      };
      mood_logs: {
        Row: {
          id: string;
          user_id: string;
          mood_score: number;
          notes: string | null;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood_score: number;
          notes?: string | null;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mood_score?: number;
          notes?: string | null;
          date?: string;
          created_at?: string;
        };
      };
    };
  };
}
