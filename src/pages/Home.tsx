import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Product, Order } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { useAuth } from '@/lib/auth';
import { Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import algoliasearch from 'algoliasearch';
import ProductSearch from '@/components/ProductSearch';

const client = algoliasearch('EVDERDZZER', '1d8fc4d899e22a051ae09303906825d8');
const index = client.initIndex('movies_index');

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const processRecords = async () => {
    try {
      await index.saveObjects(products||[], { autoGenerateObjectIDIfNotExist: true });
      console.log('Successfully indexed objects!');
    } catch (error) {
      console.error('Error fetching or indexing data:', error);
    }
  };


  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total,
          created_at,
          user_id,
          order_items!inner (
            quantity,
            product_id,
            products!inner (
              id,
              name,
              description,
              price,
              image,
              category,
              inventory,
              created_at,
              updated_at
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return (data as unknown) as Order[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    processRecords();
  }, [products]);

  if (productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Recent Orders Section */}
      {user && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Orders</h2>
            <Button variant="ghost" onClick={() => navigate('/orders')}>
              View all orders
            </Button>
          </div>

          {ordersLoading ? (
            <div className="text-center py-12">Loading orders...</div>
          ) : recentOrders && recentOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                      Order #{order.id.slice(0, 8)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                      }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={order.order_items[0].products.image}
                        alt={order.order_items[0].products.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                    </div>
                    <div>
                      <p className="font-medium">
                        {order.order_items[0].products.name}
                        {order.order_items.length > 1 &&
                          ` +${order.order_items.length - 1} more`}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No orders yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Start shopping to create your first order
              </p>
            </div>
          )}
        </div>
      )}
      {products && <ProductSearch />}
      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}