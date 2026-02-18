import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Catalog from './pages/client/Catalog';
import Cart from './pages/client/Cart';
import Orders from './pages/client/Orders';
import EmployeeOrders from './pages/employee/Orders';
import Products from './pages/employee/Products';
import ProviderOrders from './pages/provider/Orders';

import { Toaster } from 'sileo';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" />
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<MainLayout />}>
               {/* Protected Routes Wrapper */}
               <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  
                  {/* Client Routes */}
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/my-orders" element={<Orders />} />

                  {/* Employee Routes */}
                  <Route path="/manage-orders" element={<EmployeeOrders />} />
                  <Route path="/manage-products" element={<Products />} />

                  {/* Provider Routes */}
                  <Route path="/consolidated-orders" element={<ProviderOrders />} />
               </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
