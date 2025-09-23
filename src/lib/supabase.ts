import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

// Server-side only client with service role key
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      albums: {
        Row: {
          id: string;
          title: string;
          cover_media_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          cover_media_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          cover_media_id?: string | null;
          created_at?: string;
        };
      };
      memories: {
        Row: {
          id: string;
          title: string;
          body: string | null;
          taken_at: string;
          city_code: number | null;
          album_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body?: string | null;
          taken_at?: string;
          city_code?: number | null;
          album_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string | null;
          taken_at?: string;
          city_code?: number | null;
          album_id?: string | null;
          created_at?: string;
        };
      };
      media: {
        Row: {
          id: string;
          memory_id: string;
          path: string;
          type: 'image' | 'video';
          width: number | null;
          height: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          memory_id: string;
          path: string;
          type: 'image' | 'video';
          width?: number | null;
          height?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          memory_id?: string;
          path?: string;
          type?: 'image' | 'video';
          width?: number | null;
          height?: number | null;
          created_at?: string;
        };
      };
      letters: {
        Row: {
          id: string;
          title: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          created_at?: string;
        };
      };
      anniversaries: {
        Row: {
          id: string;
          title: string;
          date: string;
          repeat: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          date: string;
          repeat?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          date?: string;
          repeat?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
