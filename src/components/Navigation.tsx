import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { ShoppingCart, Menu, User, LogOut, Package } from 'lucide-react';
import { toast } from 'sonner';

export function Navigation({ onCartOpen }: { onCartOpen: () => void }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Button variant="ghost" className="sm:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="text-xl font-bold text-blue-600 ml-2 cursor-pointer" onClick={() => navigate('/')}>
              BringIt
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/orders')}>
                  <Package className="h-5 w-5" />
                </Button>
                <Button variant="ghost" onClick={() => navigate('/account')}>
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                </Button>
                <Button variant="ghost" onClick={onCartOpen}>
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/signin')}>Sign in</Button>
                <Button variant="ghost" onClick={onCartOpen}>
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 