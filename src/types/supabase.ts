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
      user_profiles: {
        Row: {
          id: string
          email: string
          role: 'canteen' | 'parent' | 'student' | 'admin'
          full_name: string | null
          created_at: string
          parent_id: string | null
          canteen_id: string | null
          student_id: string | null
        }
        Insert: {
          id: string
          email: string
          role: 'canteen' | 'parent' | 'student' | 'admin'
          full_name?: string | null
          created_at?: string
          parent_id?: string | null
          canteen_id?: string | null
          student_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: 'canteen' | 'parent' | 'student' | 'admin'
          full_name?: string | null
          created_at?: string
          parent_id?: string | null
          canteen_id?: string | null
          student_id?: string | null
        }
      }
      canteens: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          email?: string
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          parent_id: string
          canteen_id: string
          full_name: string
          nickname: string | null
          photo_url: string | null
          qr_code_value: string
          balance: number
          daily_limit: number | null
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          canteen_id: string
          full_name: string
          nickname?: string | null
          photo_url?: string | null
          qr_code_value: string
          balance?: number
          daily_limit?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          canteen_id?: string
          full_name?: string
          nickname?: string | null
          photo_url?: string | null
          qr_code_value?: string
          balance?: number
          daily_limit?: number | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          canteen_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          canteen_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          canteen_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          available?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          student_id: string
          canteen_id: string
          items: Json
          total_amount: number
          status: 'pending' | 'completed' | 'canceled'
          order_date: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          canteen_id: string
          items: Json
          total_amount: number
          status?: 'pending' | 'completed' | 'canceled'
          order_date: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          canteen_id?: string
          items?: Json
          total_amount?: number
          status?: 'pending' | 'completed' | 'canceled'
          order_date?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          student_id: string
          parent_id: string | null
          type: 'credit' | 'debit'
          amount: number
          method: 'pix' | 'cash' | 'card' | 'cashless'
          status: 'pending' | 'completed' | 'failed'
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          parent_id?: string | null
          type: 'credit' | 'debit'
          amount: number
          method: 'pix' | 'cash' | 'card' | 'cashless'
          status?: 'pending' | 'completed' | 'failed'
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          parent_id?: string | null
          type?: 'credit' | 'debit'
          amount?: number
          method?: 'pix' | 'cash' | 'card' | 'cashless'
          status?: 'pending' | 'completed' | 'failed'
          description?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 