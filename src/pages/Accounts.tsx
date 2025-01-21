import React, {useEffect} from 'react';
import { set, useForm } from 'react-hook-form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import NodeGeoCoder, { Options } from 'node-geocoder';

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
}

interface PaymentMethod {
  id: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

function AddressesForm() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm();
  const [autoFetched, setAutoFetched] = useState(false);

  useEffect(() => {
    // Try to get user location
    navigator.geolocation?.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(latitude, longitude)
        let url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}`

        const res = await fetch(url)
          .then(res => res.text())
          .then(xmlStr => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
            const addressParts = xmlDoc.getElementsByTagName('addressparts')[0];

            if (addressParts) {
              const road = addressParts.getElementsByTagName('residential')[0]?.textContent + ' , ' + addressParts.getElementsByTagName('suburb')[0]?.textContent;
              const city = addressParts.getElementsByTagName('city')[0]?.textContent;
              const state = addressParts.getElementsByTagName('state')[0]?.textContent;
              const postalCode = addressParts.getElementsByTagName('postcode')[0]?.textContent;
              const countryCode = addressParts.getElementsByTagName('country_code')[0]?.textContent;
              
              setValue('street', road || '');
              setValue('city', city || '');
              setValue('state', state || '');
              setValue('postalCode', postalCode || '');
            }
          });
      
        // Ideally, use a geocoding library here to convert lat/lng to address
        setAutoFetched(true);
      },
      async () => {
        // If location not available, try to fetch address by pincode (example)
        const pincode = watch('postalCode');
        if (pincode) {
          // Use any open-source pincode-based address lookup here
          // setValue('street', ...);
          // setValue('city', ...);
          // setValue('state', ...);
        }
      }
    );
  }, [watch, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const newAddress = {
        id: Date.now().toString(),
        ...data
      };
      setAddresses([...addresses, newAddress]);
      reset();
      toast.success('Address added successfully');
    } catch (error) {
      toast.error('Error adding address');
    }
  };

  const deleteAddress = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
    toast.success('Address removed');
  };

  return (
    <div className="space-y-6">
      {addresses.map((address) => (
        <Card key={address.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p>{address.street}</p>
              <p>{`${address.city}, ${address.state} ${address.postalCode}`}</p>
              <p>{address.countryCode} {address.phoneNumber}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => deleteAddress(address.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h3 className="text-lg font-medium">Add New Address</h3>
          <Input
            placeholder="Street Address"
            {...register('street', { required: 'Street address is required' })}
            error={errors.street?.message as string}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="City"
              {...register('city', { required: 'City is required' })}
              error={errors.city?.message as string}
            />
            <Input
              placeholder="State"
              {...register('state', { required: 'State is required' })}
              error={errors.state?.message as string}
            />
          </div>
          <Input
            placeholder="Postal Code"
            {...register('postalCode', { required: 'Postal code is required' })}
            error={errors.postalCode?.message as string}
          />
          <Button type="submit" disabled={isSubmitting}> SAVE ADDRESS </Button>
        </form>
      </Card>
</div>)
}

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

// function AddressesForm() {
//   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

//   const onSubmit = async (data: any) => {
//     try {
//       // Handle address update logic here
//       toast.success('Address updated successfully');
//     } catch (error) {
//       toast.error('Error updating address');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//       <Input
//         label="Street Address"
//         {...register('street', { required: 'Street address is required' })}
//         error={errors.street?.message as string as string}
//       />
//       <Input
//         label="City"
//         {...register('city', { required: 'City is required' })}
//         error={errors.city?.message as string as string}
//       />
//       <Input
//         label="State"
//         {...register('state', { required: 'State is required' })}
//         error={errors.state?.message as string as string}
//       />
//       <Input
//         label="Postal Code"
//         {...register('postalCode', { required: 'Postal code is required' })}
//         error={errors.postalCode?.message as string as string}
//       />
//       <Button type="submit" disabled={isSubmitting}>
//         {isSubmitting ? 'Saving...' : 'Save Address'}
//       </Button>
//     </form>
//   );
// }

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
        error={errors.cardNumber?.message as string}
      />
      <Input
        label="Expiry Date"
        {...register('expiryDate', { required: 'Expiry date is required' })}
        error={errors.expiryDate?.message as string}
      />
      <Input
        label="CVV"
        {...register('cvv', { required: 'CVV is required' })}
        error={errors.cvv?.message as string}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Payment Info'}
      </Button>
    </form>
  );
}

function AccountSettingsForm() {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      setValue('email', user.email);
      setValue('password', user.email);
    }
  }, [user, setValue]);

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
        error={errors.email?.message as string}
      />
      <Input
        label="Password"
        type="password"
        {...register('password', { required: 'Password is required' })}
        error={errors.password?.message as string}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  );
}