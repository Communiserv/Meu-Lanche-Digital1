export enum UserRole {
  CANTEEN = 'canteen',
  PARENT = 'parent',
  STUDENT = 'student',
  ADMIN = 'admin',
}

export interface UserProfile {
  id: string; // Supabase user ID
  email: string;
  role: UserRole;
  full_name?: string;
  created_at: string;
  // Specific IDs for linking
  parent_id?: string; // if role is parent, this is their own ID, also used for student's parent
  canteen_id?: string; // if role is canteen or linked to one
  student_id?: string; // if role is student
}

export interface Canteen {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface Student {
  id: string;
  parent_id: string; 
  canteen_id: string;
  full_name: string;
  nickname?: string;
  photo_url?: string;
  qr_code_value: string;
  balance: number;
  daily_limit?: number;
  created_at: string;
}

export enum ProductCategory {
  SNACK = 'snack',
  DRINK = 'drink',
  MEAL = 'meal',
  DESSERT = 'dessert',
  OTHER = 'other'
}

export interface Product {
  id: string;
  canteen_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  available: boolean;
  category: ProductCategory;
  created_at: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price_at_purchase: number;
}

export interface Order {
  id: string;
  student_id: string;
  canteen_id: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  order_date: string;
  created_at: string;
}

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionMethod {
  PIX = 'pix',
  CASH = 'cash',
  CARD = 'card',
  CASHLESS = 'cashless', // For internal balance deduction
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Transaction {
  id: string;
  student_id: string;
  parent_id?: string;
  type: TransactionType;
  amount: number;
  method: TransactionMethod;
  status: TransactionStatus;
  description?: string;
  created_at: string;
}

// For mock Supabase auth user
export interface SupabaseAuthUser {
  id: string;
  email?: string;
  // Add other properties from Supabase user if needed
}

export interface SupabaseSession {
  user: SupabaseAuthUser | null;
  // Add other properties from Supabase session if needed
}

export enum CanteenApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface CanteenApproval {
  id: string;
  canteen_id: string;
  user_id: string;
  status: CanteenApprovalStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}
    