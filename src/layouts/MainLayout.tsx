import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { Role } from '../types';
import { LogOut, ShoppingCart } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link to="/" className="text-xl font-bold text-indigo-600">
                  Flower Virtual
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Dashboard
                </Link>
                {user?.role === Role.CLIENTE && (
                  <>
                    <Link
                      to="/catalog"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Catálogo
                    </Link>
                    <Link
                      to="/my-orders"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Mis Pedidos
                    </Link>
                  </>
                )}
                {user?.role === Role.EMPLEADO && (
                   <>
                     <Link
                       to="/manage-orders"
                       className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                     >
                       Gestionar Pedidos
                     </Link>
                     <Link
                       to="/manage-products"
                       className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                     >
                       Gestionar Productos
                     </Link>
                   </>
                )}
                 {user?.role === Role.PROVEEDOR && (
                   <Link
                   to="/consolidated-orders"
                   className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                 >
                   Órdenes Consolidadas
                 </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {user?.role === Role.CLIENTE && (
                <Link to="/cart" className="relative p-2 text-gray-400 hover:text-gray-500">
                  <ShoppingCart className="h-6 w-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </Link>
              )}
              <div className="ml-4 flex items-center">
                 <span className="mr-4 text-sm text-gray-700">{user?.email} ({user?.role})</span>
                 <button
                    onClick={handleLogout}
                     className="p-2 text-gray-400 hover:text-gray-500"
                 >
                    <LogOut className="h-5 w-5" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
