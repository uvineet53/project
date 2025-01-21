export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inventory: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'shipped' | 'delivered';
  total: number;
  created_at: string;
  order_items: Array<{
    quantity: number;
    product_id: string;
    products: Product;
  }>;
}

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}