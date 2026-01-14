export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: {
          id: string
          user_id: string
          focus_minutes: number
          workout_minutes: number
          active_youtube_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          focus_minutes?: number
          workout_minutes?: number
          active_youtube_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          focus_minutes?: number
          workout_minutes?: number
          active_youtube_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      youtube_links: {
        Row: {
          id: string
          user_id: string
          title: string
          url: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          url: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      session_logs: {
        Row: {
          id: string
          user_id: string
          session_date: string
          type: 'FOCUS' | 'WORKOUT'
          start_time: string
          end_time: string
          duration_minutes: number
          youtube_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          session_date: string
          type: 'FOCUS' | 'WORKOUT'
          start_time: string
          end_time: string
          duration_minutes: number
          youtube_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_date?: string
          type?: 'FOCUS' | 'WORKOUT'
          start_time?: string
          end_time?: string
          duration_minutes?: number
          youtube_url?: string | null
          created_at?: string
        }
      }
    }
  }
}

