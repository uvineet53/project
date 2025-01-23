import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/lib/store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CheckoutForm {
  email: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

export function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutForm>();

  const onSubmit = async (data: CheckoutForm) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.user.id,
            status: 'pending',
            total,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      navigate('/order-success');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your order. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-600">Add some items to your cart to checkout</p>
          <Button
            className="mt-4"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Checkout</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={errors.email?.message}
            />
            <Input
              label="Full Name"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
            />
            <Input
              label="Address"
              {...register('address', { required: 'Address is required' })}
              error={errors.address?.message}
            />
            <Input
              label="City"
              {...register('city', { required: 'City is required' })}
              error={errors.city?.message}
            />
            <Input
              label="Country"
              {...register('country', { required: 'Country is required' })}
              error={errors.country?.message}
            />
            <Input
              label="Postal Code"
              {...register('postalCode', { required: 'Postal code is required' })}
              error={errors.postalCode?.message}
            />
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </Button>
          </form>
        </div>

        <div className="mt-10 lg:mt-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="bg-white shadow-sm rounded-lg">
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.product.id} className="p-4 flex">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-20 w-20 rounded object-cover"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-base font-medium text-gray-900">
                        {item.product.name}
                      </h3>
                      <p className="text-base font-medium text-gray-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Total</p>
                <p>${total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}