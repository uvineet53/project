import { Product } from "."

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'shipped' | 'delivered'
          total: number
          created_at: string
          updated_at: string
          order_items: Array<{
              quantity: number;
              product_id: string;
              products: Product;
            }>;
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'pending' | 'shipped' | 'delivered'
          total: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'pending' | 'shipped' | 'delivered'
          total?: number
          created_at?: string
          updated_at?: string
        }
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          old_status: string | null
          new_status: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          old_status?: string | null
          new_status: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          old_status?: string | null
          new_status?: string
          created_at?: string
        }
      }
      // ... other tables
    }
    Functions: {
      update_order_status: {
        Args: {
          order_id: string
          new_status: 'pending' | 'shipped' | 'delivered'
        }
        Returns: {
          id: string
          user_id: string
          status: 'pending' | 'shipped' | 'delivered'
          total: number
          created_at: string
          updated_at: string
        }
      }
      get_order_timeline: {
        Args: {
          p_order_id: string
        }
        Returns: {
          status: string
          created_at: string
          duration: string
        }[]
      }
    }
  }
} 