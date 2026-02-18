import { useEffect, useState } from 'react';
import { orderService } from '../../services/order.service';
import { Order } from '../../types';
import { Clock, XCircle, ShieldCheck, PackageCheck, FileX } from 'lucide-react';
import { formatCOP } from '../../utils/format';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.findAll();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETADO': return <PackageCheck className="h-5 w-5 text-green-500" />;
      case 'VALIDADO': return <ShieldCheck className="h-5 w-5 text-blue-500" />;
      case 'RECHAZADO': return <FileX className="h-5 w-5 text-red-500" />;
      case 'PENDIENTE_VALIDACION': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Pedidos</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {orders.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-gray-500">No orders found.</li>
          ) : orders.map((order) => (
            <li key={order.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-indigo-600">Order #{order.id.slice(0, 8)}</p>
                  <div className="ml-2 flex flex-shrink-0">
                    <p className="inline-flex items-center rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Total: {formatCOP(order.total)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Placed on <time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleDateString()}</time>
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Orders;
