import { useEffect, useState } from 'react';
import { sileo } from 'sileo';
import { orderService } from '../../services/order.service';
import { consolidationService } from '../../services/consolidation.service';
import { formatCOP } from '../../utils/format';
import { Order } from '../../types';
import { CheckCircle, RotateCcw, XOctagon, PackageCheck, Trash2, Layers } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  TODOS: 'Todos',
  BORRADOR: 'Borrador',
  PENDIENTE_VALIDACION: 'Pendiente',
  VALIDADO: 'Validado',
  COMPLETADO: 'Completado',
  RECHAZADO: 'Rechazado',
};

const STATUS_COLORS: Record<string, string> = {
  VALIDADO: 'bg-green-100 text-green-800',
  PENDIENTE_VALIDACION: 'bg-yellow-100 text-yellow-800',
  BORRADOR: 'bg-gray-100 text-gray-800',
  RECHAZADO: 'bg-red-100 text-red-800',
  COMPLETADO: 'bg-blue-100 text-blue-800',
};

const EmployeeOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('TODOS');

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

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleDelete = (id: string) => {
        sileo.action({
            title: 'Eliminar Orden',
            description: '¿Estás seguro de que deseas eliminar esta orden?',
            button: {
                title: 'Confirmar',
                onClick: async () => {
                    await sileo.promise(
                        (async () => {
                            await orderService.remove(id);
                            setOrders(prev => prev.filter(o => o.id !== id));
                        })(),
                        {
                            loading: { title: "Eliminando orden..." },
                            success: { title: "Orden eliminada correctamente" },
                            error: { title: "Error al eliminar orden" }
                        }
                    );
                }
            }
        })
    };

    const handleSubmit = async (id: string) => {
        sileo.promise(
            (async () => {
                await orderService.submit(id);
                fetchOrders();
            })(),
            {
                loading: { title: "Enviando orden..." },
                success: { title: "Orden enviada para validación" },
                error: { title: "Error al enviar orden" }
            }
        );
    }

    const handleApprove = async (id: string) => {
        sileo.promise(
            (async () => {
                await orderService.approve(id);
                fetchOrders();
            })(),
            {
                loading: { title: "Aprobando orden..." },
                success: { title: "Orden aprobada" },
                error: { title: "Error al aprobar orden" }
            }
        );
    };

    const handleReject = (id: string) => {
        sileo.action({
            title: 'Devolver a Borrador',
            description: '¿Devolver esta orden a BORRADOR para que el cliente pueda editarla?',
            button: {
                title: 'Confirmar',
                onClick: async () => {
                    await sileo.promise(
                        (async () => {
                            await orderService.reject(id);
                            fetchOrders();
                        })(),
                        {
                            loading: { title: 'Devolviendo a borrador...' },
                            success: { title: 'Orden devuelta a borrador' },
                            error: { title: 'Error al devolver orden' }
                        }
                    );
                }
            }
        });
    };

    const handleDecline = (id: string) => {
        sileo.action({
            title: 'Rechazar Orden Definitivamente',
            description: '¿Seguro? La orden quedará como RECHAZADO y no podrá editarse.',
            button: {
                title: 'Rechazar',
                onClick: async () => {
                    await sileo.promise(
                        (async () => {
                            await orderService.decline(id);
                            fetchOrders();
                        })(),
                        {
                            loading: { title: 'Rechazando orden...' },
                            success: { title: 'Orden rechazada definitivamente' },
                            error: { title: 'Error al rechazar orden' }
                        }
                    );
                }
            }
        });
    };

    const handleComplete = async (id: string) => {
        sileo.promise(
            (async () => {
                await orderService.complete(id);
                fetchOrders();
            })(),
            {
                loading: { title: "Completando orden..." },
                success: { title: "Orden completada" },
                error: { title: "Error al completar orden (posible falta de stock)" }
            }
        );
    };

    if (loading) return <div>Cargando órdenes...</div>;

    const validatedCount = orders.filter(o => o.status === 'VALIDADO').length;
    const filteredOrders = filter === 'TODOS' ? orders : orders.filter(o => o.status === filter);
    const filterTabs = ['TODOS', 'BORRADOR', 'PENDIENTE_VALIDACION', 'VALIDADO', 'COMPLETADO', 'RECHAZADO'];

    const handleConsolidate = () => {
        sileo.action({
            title: 'Consolidar Órdenes Validadas',
            description: `Se consolidarán ${validatedCount} orden(es) validada(s) y se enviarán a los proveedores correspondientes.`,
            button: {
                title: 'Consolidar',
                onClick: async () => {
                    await sileo.promise(
                        (async () => {
                            const result = await consolidationService.run();
                            fetchOrders();
                            return result;
                        })(),
                        {
                            loading: { title: 'Consolidando órdenes...' },
                            success: { title: `Consolidación exitosa` },
                            error: { title: 'Error al consolidar (¿hay órdenes validadas?)' },
                        }
                    );
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
                <button
                    onClick={handleConsolidate}
                    disabled={validatedCount === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm"
                    title={validatedCount === 0 ? 'No hay órdenes validadas para consolidar' : `Consolidar ${validatedCount} orden(es) validada(s)`}
                >
                    <Layers className="h-4 w-4" />
                    Consolidar y Despachar ({validatedCount} validadas)
                </button>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
                {filterTabs.map((tab) => {
                    const count = tab === 'TODOS' ? orders.length : orders.filter(o => o.status === tab).length;
                    return (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                filter === tab
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {STATUS_LABELS[tab]}
                            <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                                filter === tab ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>{count}</span>
                        </button>
                    );
                })}
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                        <li key={order.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-indigo-600 truncate">
                                        Orden #{order.id.slice(0, 8)}
                                    </div>
                                    <div className="flex items-center mt-2">
                                        <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[order.status] ?? 'bg-blue-100 text-blue-800'}`}>
                                            {STATUS_LABELS[order.status] ?? order.status}
                                        </div>
                                        <p className="ml-2 text-sm text-gray-500">
                                            Total: {formatCOP(order.total || 0)}
                                        </p>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500">
                                        Cliente: {(order as any).customer?.name ?? order.customerId.slice(0, 8)}
                                    </div>
                                    {order.items && (
                                        <div className="mt-2 text-xs text-gray-400">
                                            {order.items.length} ítem(s)
                                        </div>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleDelete(order.id)}
                                        className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-red-600 hover:bg-red-50 focus:outline-none"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    {/* Action Buttons based on status */}
                                    {order.status === 'BORRADOR' && (
                                        <>
                                            <button
                                                onClick={() => handleSubmit(order.id)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Enviar para Validacion
                                            </button>
                                            <button
                                                onClick={() => handleDecline(order.id)}
                                                className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                                                title="Rechazar Definitivamente"
                                            >
                                                <XOctagon className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}

                                    {order.status === 'PENDIENTE_VALIDACION' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(order.id)}
                                                className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                                                title="Aprobar"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(order.id)}
                                                className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none"
                                                title="Devolver a Borrador"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDecline(order.id)}
                                                className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                                                title="Rechazar Definitivamente"
                                            >
                                                <XOctagon className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}

                                    {order.status === 'VALIDADO' && (
                                        <>
                                            <button
                                                onClick={() => handleReject(order.id)}
                                                className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none"
                                                title="Devolver a Borrador"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleComplete(order.id)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                <PackageCheck className="h-3 w-3 mr-1" />
                                                Despachar/Completar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                    {filteredOrders.length === 0 && (
                        <li className="px-6 py-8 text-center text-gray-500">No hay órdenes en este estado</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default EmployeeOrders;
