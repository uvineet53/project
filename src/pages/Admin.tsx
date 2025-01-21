import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Product, Order } from '@/types';
import { AdminProductForm } from '@/components/AdminProductForm';
import { Button } from '@/components/ui/Button';
import { Package, ShoppingBag } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { toast } from 'sonner';

export function Admin() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  // Products Query
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

  // Orders Query
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            products (
              id,
              name,
              price,
              image
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });

  // Product Mutations
  const createProduct = useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsFormOpen(false);
      toast.success('Product created successfully');
    },
    onError: (error) => {
      toast.error('Error creating product: ' + error.message);
    },
  });

  const updateProduct = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          image: data.image,
          inventory: data.inventory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedProduct?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelectedProduct(null);
      setIsFormOpen(false);
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error('Error updating product: ' + error.message);
    },
  });

  // Order Status Mutation
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      console.log('Updating order status:', { orderId, status });
      const { data, error } = await supabase
        .rpc('update_order_status', {
          order_id: orderId,
          new_status: status
        });

      if (error) {
        console.error('RPC error:', error);
        throw error;
      }
      console.log('RPC response:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Error updating order status: ' + error.message);
    },
  });

  // Order Timeline Query
  const { data: orderTimeline } = useQuery({
    queryKey: ['order-timeline', selectedOrderId],
    queryFn: async () => {
      if (!selectedOrderId) throw new Error('No order selected');
      
      const { data, error } = await supabase
        .rpc('get_order_timeline', {
          p_order_id: selectedOrderId
        });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedOrderId,
  });

  if (productsLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="mb-6">
            <Button onClick={() => {
              setSelectedProduct(null);
              setIsFormOpen(true);
            }}>
              Add New Product
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm p-4"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">${product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mb-4">Stock: {product.inventory}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsFormOpen(true);
                    console.log('Edit clicked:', product);
                  }}
                >
                  Edit
                </Button>
              </div>
            ))}
          </div>

          {isFormOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                  {selectedProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <AdminProductForm
                  product={selectedProduct as Product}
                  onSubmit={async (formData) => {
                    if (selectedProduct) {
                      await updateProduct.mutate(formData);
                    } else {
                      await createProduct.mutate(formData);
                    }
                  }}
                  onCancel={() => {
                    setSelectedProduct(null);
                    setIsFormOpen(false);
                  }}
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <div className="space-y-6">
            {orders?.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  {updateOrderStatus.isPending && order.id === updateOrderStatus.variables?.orderId ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  ) : (
                    <select
                      value={order.status}
                      onChange={(e) => {
                        try {
                          updateOrderStatus.mutate({
                            orderId: order.id,
                            status: e.target.value as Order['status']
                          });
                        } catch (error) {
                          console.error('Error updating status:', error);
                        }
                      }}
                      className="rounded-md border border-gray-300 px-3 py-2"
                      disabled={updateOrderStatus.isPending}
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  )}
                </div>

                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.products.id} className="flex items-center">
                      <img
                        src={item.products.image}
                        alt={item.products.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                      <div className="ml-4">
                        <p className="font-medium">{item.products.name}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × ${item.products.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedOrderId(
                        selectedOrderId === order.id ? null : order.id
                      )}
                    >
                      {selectedOrderId === order.id ? 'Hide' : 'View'} Timeline
                    </Button>
                    <p className="font-bold">
                      Total: ${order.total.toFixed(2)}
                    </p>
                  </div>

                  {selectedOrderId === order.id && orderTimeline && (
                    <div className="mt-4 space-y-2">
                      {orderTimeline.map((event: { status: string, created_at: string }, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="capitalize">{event.status}</span>
                          <span className="text-gray-500">
                            {new Date(event.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}