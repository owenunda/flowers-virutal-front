import { sileo } from 'sileo';
import { useCart } from '../../hooks/useCart';
import { orderService } from '../../services/order.service';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCOP } from '../../utils/format';

const Cart = () => {
    const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCreateOrder = async () => {
        if (!items.length || !user) return;

        sileo.promise(
            (async () => {
                const orderItems = items.map(item => ({
                    productId: item.id,
                    qty: item.quantity
                }));
                
                await orderService.create({ customerId: user.sub, items: orderItems });
                
                clearCart();
                navigate('/my-orders');
            })(),
            {
                loading: { title: "Procesando orden..." },
                success: { title: "Orden creada exitosamente" },
                error: { title: "Error al crear orden" }
            }
        );
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-medium text-gray-900">Tu carrito está vacío</h2>
                <p className="mt-1 text-gray-500">Ve al catálogo y agrega algunas flores.</p>
                <button
                    onClick={() => navigate('/catalog')}
                    className="mt-6 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                    Seguir comprando
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Carrito de compras</h1>
            <div className="bg-white shadow sm:rounded-lg">
                <ul role="list" className="divide-y divide-gray-200">
                    {items.map((item) => (
                        <li key={item.id} className="flex px-4 py-6 sm:px-6">
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center">
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                                        <p className="ml-4 text-base font-medium text-gray-900">{formatCOP(item.basePrice * item.quantity)}</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{formatCOP(item.basePrice)} por unidad</p>
                                </div>
                                <div className="mt-4 sm:mt-0 sm:ml-6 flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <label htmlFor={`quantity-${item.id}`} className="text-sm text-gray-700">Cant.</label>
                                        <input
                                            id={`quantity-${item.id}`}
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                            className="w-16 rounded-md border-gray-300 py-1.5 text-base leading-5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-sm font-medium text-red-600 hover:text-red-500"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Total</p>
                        <p>{formatCOP(total)}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">Los gastos de envío se calculan al finalizar la compra.</p>
                    <div className="mt-6">
                        <button
                            onClick={handleCreateOrder}
                            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                        >
                            Enviar pedido <ArrowRight className="ml-2 h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
