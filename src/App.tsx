import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShoppingCart, Menu } from 'lucide-react';
import { Button } from './components/ui/Button';
import { CartDrawer } from './components/CartDrawer';
import { useCartStore } from './lib/store';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { AuthProvider } from './lib/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Orders } from './pages/Orders';
import { Toast } from './components/ui/Toast';
import { OrderTracking } from './pages/OrderTracking';

const queryClient = new QueryClient();

function App() {
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const items = useCartStore((state) => state.items);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center">
                    <Button variant="ghost" className="sm:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                    <span className="text-xl font-bold text-blue-600 ml-2">BringIt</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" className="relative" onClick={() => setIsCartOpen(true)}>
                      <ShoppingCart className="h-5 w-5" />
                      {items.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {items.length}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </nav>

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-success"
                element={
                  <ProtectedRoute>
                    <OrderSuccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderTracking />
                  </ProtectedRoute>
                }
              />
            </Routes>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </div>
        </Router>
        <Toast />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;