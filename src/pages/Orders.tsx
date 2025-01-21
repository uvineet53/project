import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { useAuth } from '@/lib/auth';
import { Package, Truck, CheckCircle } from 'lucide-react';

const statusIcons = {
  pending: Package,
  shipped: Truck,
  delivered: CheckCircle,
};

const statusColors = {
  pending: 'text-yellow-500',
  shipped: 'text-blue-500',
  delivered: 'text-green-500',
};

export function Orders() {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            product_id,
            products (
              name,
              price,
              image
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-8">Your Orders</h1>
      <div className="space-y-6">
        {orders?.map((order) => {
          const StatusIcon = statusIcons[order.status];
          const statusColor = statusColors[order.status];

          return (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className={`flex items-center ${statusColor}`}>
                  <StatusIcon className="h-5 w-5 mr-2" />
                  <span className="capitalize">{order.status}</span>
                </div>
              </div>

              <div className="divide-y">
                {order.order_items.map((item) => (
                  <div key={item.product_id} className="py-4 flex items-center">
                    <img
                      src={item.products.image}
                      alt={item.products.name}
                      className="h-16 w-16 object-cover rounded"
                    />
                    <div className="ml-4">
                      <p className="font-medium">{item.products.name}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm font-medium">
                        ${(item.products.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <p className="text-right font-bold">
                  Total: ${order.total.toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 