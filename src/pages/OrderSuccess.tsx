import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Order Successful!
        </h2>
        <p className="mt-2 text-gray-600">
          Thank you for your purchase. We'll send you an email with your order details.
        </p>
        <Button
          className="mt-6"
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}