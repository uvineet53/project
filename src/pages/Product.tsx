import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Product as ProductType } from '@/types';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/store';
import { toast } from 'sonner';
import { Minus, Plus } from 'lucide-react';

export function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = React.useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ProductType;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Product not found</h2>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Add item multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`);
    setQuantity(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden rounded-lg">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="mt-10 lg:mt-0 lg:pl-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {product.name}
          </h1>
          
          <div className="mt-4">
            <p className="text-3xl tracking-tight text-gray-900">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-lg text-gray-600">{product.description}</p>
          </div>

          <div className="mt-8">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Quantity:</span>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                  disabled={quantity >= product.inventory}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.inventory === 0}
              >
                {product.inventory === 0 
                  ? 'Out of Stock' 
                  : `Add ${quantity} to Cart - $${(product.price * quantity).toFixed(2)}`
                }
              </Button>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-sm font-medium text-gray-900">Product Details</h2>
            <div className="mt-4 space-y-6">
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}