
import { createClient } from '@supabase/supabase-js';

// Ensure your environment variables are correctly named and accessible.
// For client-side Supabase access, these should be prefixed with NEXT_PUBLIC_
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL is missing. Make sure to set NEXT_PUBLIC_SUPABASE_URL environment variable.");
}
if (!supabaseAnonKey) {
  throw new Error("Supabase Anon Key is missing. Make sure to set NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interface representing the structure of a row in your Supabase 'products' table
export interface ProductRow {
  id: string; // uuid, primary key
  name: string; // text, NOT NULL
  type: 'powder' | 'liquid' | 'unit'; // text, NOT NULL, CHECK constraint
  wholesale_price: number; // float8, NOT NULL, CHECK (>=0)
  retail_price: number; // float8, NOT NULL, CHECK (>=0), CHECK (retail_price >= wholesale_price)
  quantity: number; // float8, NOT NULL, CHECK (>=0)
  created_at: string; // timestamptz, NOT NULL, default now()
  updated_at: string; // timestamptz, NOT NULL, default now() (auto-updates via trigger)
  // user_id?: string; // Optional: uuid, foreign key to auth.users if implementing RLS
}

// Interface representing the structure of a row in your Supabase 'sales' table
export interface SaleRow {
  id: string; // uuid, primary key
  sale_timestamp: string; // timestamptz, NOT NULL
  total_transaction_amount: number; // float8, NOT NULL, CHECK (>=0)
  created_at: string; // timestamptz, NOT NULL, default now()
  updated_at: string; // timestamptz, NOT NULL, default now() (auto-updates via trigger)
  // user_id?: string; // Optional: uuid, foreign key to auth.users if implementing RLS
}

// Interface representing the structure of a row in your Supabase 'sale_items' table
export interface SaleItemRow {
  id: string; // uuid, primary key
  sale_id: string; // uuid, foreign key to sales.id, NOT NULL, ON DELETE CASCADE
  product_id: string; // uuid, foreign key to products.id, NOT NULL, ON DELETE RESTRICT
  product_name_snapshot: string; // text, NOT NULL
  quantity_sold: number; // float8, NOT NULL, CHECK (>0)
  wholesale_price_per_unit_snapshot: number; // float8, NOT NULL, CHECK (>=0)
  retail_price_per_unit_snapshot: number; // float8, NOT NULL, CHECK (>=0)
  item_total_amount: number; // float8, NOT NULL, CHECK (>=0)
  created_at: string; // timestamptz, NOT NULL, default now()
  updated_at: string; // timestamptz, NOT NULL, default now() (auto-updates via trigger)
  // user_id?: string; // Optional: uuid, foreign key to auth.users if implementing RLS (might be redundant if sale has user_id)
}


// Interface representing the structure of a row in your Supabase 'notifications' table (Example)
export interface NotificationRow {
  id: string; // uuid, primary key
  user_id?: string; // uuid, foreign key to auth.users, if notifications are user-specific
  message: string; // text, NOT NULL
  read: boolean; // boolean, NOT NULL, default false
  href?: string; // text, optional link
  product_id?: string; // uuid, foreign key to products.id, optional
  created_at: string; // timestamptz, NOT NULL, default now()
}

// Interface representing the structure of a row in your Supabase 'backup_logs' table (Example)
export interface BackupLogRow {
  id: string; // uuid, primary key
  user_id?: string; // uuid, foreign key to auth.users, if logs are user-specific
  timestamp: string; // timestamptz, NOT NULL, when the backup was initiated by the client
  period_start: string; // timestamptz, NOT NULL
  period_end: string; // timestamptz, NOT NULL
  file_name: string; // text, NOT NULL
  created_at: string; // timestamptz, NOT NULL, default now()
}
