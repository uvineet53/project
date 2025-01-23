import React from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Product } from '@/types';
import { Button } from './ui/Button';
import { useCartStore } from '@/lib/store';
import { toast } from 'sonner';

interface ProductDetailsProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetails({ product, isOpen, onClose }: ProductDetailsProps) {
  const [quantity, setQuantity] = React.useState(1);
  const addItem = useCartStore((state) => state.addItem);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    // Add item multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`);
    setQuantity(1); // Reset quantity
    onClose();
  };

  const incrementQuantity = () => {
    if (quantity < product.inventory) {
      setQuantity(q => q + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg max-w-2xl w-full shadow-xl">
          <div className="absolute right-4 top-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[300px] object-cover rounded-lg"
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <p className="text-gray-600">{product.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  product.inventory > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
                </span>
              </div>

              {product.inventory > 0 && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.inventory}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button
                  className="w-full"
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
          </div>
        </div>
      </div>
    </div>
  );
} 