import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

const TRACKING_STEPS = [
  { status: 'pending', icon: Clock, label: 'Order Placed' },
  { status: 'shipped', icon: Truck, label: 'In Transit' },
  { status: 'delivered', icon: CheckCircle, label: 'Delivered' },
] as const;

export function OrderTracking() {
  const { orderId } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
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
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data as Order;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Order not found
          </h3>
        </div>
      </div>
    );
  }

  const currentStepIndex = TRACKING_STEPS.findIndex(step => step.status === order.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Order Status</h1>
        
        {/* Tracking Progress */}
        <div className="mb-12">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-between">
              {TRACKING_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isComplete = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <div
                      className={`
                        relative flex h-12 w-12 items-center justify-center rounded-full
                        ${isComplete ? 'bg-blue-600' : 'bg-gray-100'}
                        ${isCurrent ? 'ring-2 ring-blue-600 ring-offset-2' : ''}
                      `}
                    >
                      <StepIcon
                        className={`h-6 w-6 ${
                          isComplete ? 'text-white' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <p
                      className={`mt-2 text-sm font-medium ${
                        isComplete ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium">Order Details</h2>
            <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
            <p className="text-sm text-gray-500">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
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

          <div className="border-t pt-4 mt-4">
            <p className="text-right font-bold">
              Total: ${order.total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 