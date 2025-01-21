import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Product } from '@/types';

interface AdminProductFormProps {
  product?: Product;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}

type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

export function AdminProductForm({ product, onSubmit, onCancel }: AdminProductFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    defaultValues: product ? {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      inventory: product.inventory
    } : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Name"
        {...register('name', { required: 'Name is required' })}
        error={errors.name?.message}
      />
      <Input
        label="Description"
        {...register('description', { required: 'Description is required' })}
        error={errors.description?.message}
      />
      <Input
        label="Price"
        type="number"
        step="0.01"
        {...register('price', {
          required: 'Price is required',
          min: { value: 0, message: 'Price must be positive' },
          valueAsNumber: true,
        })}
        error={errors.price?.message}
      />
      <Input
        label="Category"
        {...register('category', { required: 'Category is required' })}
        error={errors.category?.message}
      />
      <Input
        label="Image URL"
        {...register('image', { required: 'Image URL is required' })}
        error={errors.image?.message}
      />
      <Input
        label="Inventory"
        type="number"
        {...register('inventory', {
          required: 'Inventory is required',
          min: { value: 0, message: 'Inventory must be positive' },
          valueAsNumber: true,
        })}
        error={errors.inventory?.message}
      />
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}