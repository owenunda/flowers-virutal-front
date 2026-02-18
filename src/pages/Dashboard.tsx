import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { useEffect } from 'react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case Role.CLIENTE:
          navigate('/catalog');
          break;
        case Role.EMPLEADO:
          navigate('/manage-orders');
          break;
        case Role.PROVEEDOR:
          navigate('/consolidated-orders');
          break;
        default:
            // Stay here or go to specialized dashboard
          break;
      }
    }
  }, [user, navigate]);

  return (
    <div className="px-4 py-6 sm:px-0">
       <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
       <p className="mt-2 text-gray-600">Redirecting to your role's view...</p>
    </div>
  );
};

export default Dashboard;
