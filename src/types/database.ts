export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type UserRole = 'warehouse_manager' | 'staff' | 'admin';

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  store_id: string;
  store_name: string;
  created_at: string;
};

export type Product = {
  id: string;
  store_id: string;
  name: string;
  sku: string;
  quantity: number;
  low_stock_threshold: number;
  reordered: boolean;
  created_at: string;
  updated_at: string;
};

export type InventoryLog = {
  id: string;
  product_id: string;
  profile_id: string;
  action: 'increase' | 'decrease' | 'reordered' | 'created';
  quantity_delta: number;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_logs: {
        Row: InventoryLog;
        Insert: Omit<InventoryLog, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
