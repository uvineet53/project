import React from 'react';
import { useForm } from 'react-hook-form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export function Accounts() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-8">Account Settings</h1>
      <Tabs defaultValue="addresses">
        <TabsList>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="payment">Payment Info</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="addresses">
          <AddressesForm />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentInfoForm />
        </TabsContent>

        <TabsContent value="settings">
          <AccountSettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddressesForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      // Handle address update logic here
      toast.success('Address updated successfully');
    } catch (error) {
      toast.error('Error updating address');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Street Address"
        {...register('street', { required: 'Street address is required' })}
        error={errors.street?.message}
      />
      <Input
        label="City"
        {...register('city', { required: 'City is required' })}
        error={errors.city?.message}
      />
      <Input
        label="State"
        {...register('state', { required: 'State is required' })}
        error={errors.state?.message}
      />
      <Input
        label="Postal Code"
        {...register('postalCode', { required: 'Postal code is required' })}
        error={errors.postalCode?.message}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Address'}
      </Button>
    </form>
  );
}

function PaymentInfoForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      // Handle payment info update logic here
      toast.success('Payment info updated successfully');
    } catch (error) {
      toast.error('Error updating payment info');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Card Number"
        {...register('cardNumber', { required: 'Card number is required' })}
        error={errors.cardNumber?.message}
      />
      <Input
        label="Expiry Date"
        {...register('expiryDate', { required: 'Expiry date is required' })}
        error={errors.expiryDate?.message}
      />
      <Input
        label="CVV"
        {...register('cvv', { required: 'CVV is required' })}
        error={errors.cvv?.message}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Payment Info'}
      </Button>
    </form>
  );
}

function AccountSettingsForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      // Handle account settings update logic here
      toast.success('Account settings updated successfully');
    } catch (error) {
      toast.error('Error updating account settings');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        {...register('email', { required: 'Email is required' })}
        error={errors.email?.message}
      />
      <Input
        label="Password"
        type="password"
        {...register('password', { required: 'Password is required' })}
        error={errors.password?.message}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  );
}