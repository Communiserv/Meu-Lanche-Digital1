import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Tipos para as tabelas do Supabase
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Tipos específicos
export type Profile = Tables['profiles']['Row'];
export type Student = Tables['students']['Row'];
export type Product = Tables['products']['Row'];
export type Order = Tables['orders']['Row'];
export type Transaction = Tables['transactions']['Row'];
export type Canteen = Tables['canteens']['Row']; 