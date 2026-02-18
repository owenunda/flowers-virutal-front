import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { sileo } from 'sileo';
import { consolidationService, ConsolidatedOrder } from '../../services/consolidation.service';
import { formatCOP } from '../../utils/format';
import { FileDown, Package, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const ProviderOrders = () => {
    const [consolidations, setConsolidations] = useState<ConsolidatedOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await consolidationService.findAll();
            setConsolidations(data);
        } catch (error) {
            console.error('Failed to fetch consolidated orders', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleExpand = (id: string) => {
        setExpanded((prev) => (prev === id ? null : id));
    };

    const downloadExcel = (consolidation: ConsolidatedOrder) => {
        const rows = consolidation.items.map((item) => ({
            SKU: item.product.sku,
            Producto: item.product.name,
            'Cantidad Total': item.totalQty,
            'Precio Unitario': parseFloat(item.unitPrice),
            'Total Línea': parseFloat(item.lineTotal),
        }));

        const grandTotal = consolidation.items.reduce(
            (sum, item) => sum + parseFloat(item.lineTotal),
            0,
        );

        rows.push({
            SKU: '',
            Producto: 'TOTAL',
            'Cantidad Total': consolidation.items.reduce((s, i) => s + i.totalQty, 0),
            'Precio Unitario': 0,
            'Total Línea': grandTotal,
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [{ wch: 16 }, { wch: 32 }, { wch: 16 }, { wch: 18 }, { wch: 16 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Orden Consolidada');

        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `orden-consolidada-${consolidation.id.slice(0, 8)}-${date}.xlsx`);
        sileo.success({ title: 'Excel descargado correctamente', fill: 'dark' });
    };

    const downloadAllExcel = () => {
        if (!consolidations.length) return;

        const allRows: Record<string, unknown>[] = [];
        consolidations.forEach((c) => {
            c.items.forEach((item) => {
                allRows.push({
                    'Orden ID': c.id.slice(0, 8).toUpperCase(),
                    Proveedor: c.provider.name,
                    Fecha: new Date(c.createdAt).toLocaleDateString('es-CO'),
                    SKU: item.product.sku,
                    Producto: item.product.name,
                    'Cantidad Total': item.totalQty,
                    'Precio Unitario': parseFloat(item.unitPrice),
                    'Total Línea': parseFloat(item.lineTotal),
                });
            });
        });

        const ws = XLSX.utils.json_to_sheet(allRows);
        ws['!cols'] = [
            { wch: 12 }, { wch: 24 }, { wch: 14 },
            { wch: 16 }, { wch: 32 }, { wch: 16 },
            { wch: 18 }, { wch: 16 },
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Todas las Consolidaciones');

        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `consolidaciones-${date}.xlsx`);
        sileo.success({ title: 'Reporte completo descargado', fill: 'dark' });
    };

    if (loading) return <div className="text-center py-10">Cargando órdenes consolidadas...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Órdenes Consolidadas</h1>
                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Actualizar
                    </button>
                    {consolidations.length > 0 && (
                        <button
                            onClick={downloadAllExcel}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-green-600 hover:bg-green-700 text-white shadow-sm"
                        >
                            <FileDown className="h-4 w-4" />
                            Descargar Todo (Excel)
                        </button>
                    )}
                </div>
            </div>

            {consolidations.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-10 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No hay órdenes consolidadas disponibles.</p>
                    <p className="text-sm text-gray-400 mt-1">El empleado debe consolidar las órdenes validadas primero.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {consolidations.map((c) => {
                        const grandTotal = c.items.reduce(
                            (sum, item) => sum + parseFloat(item.lineTotal),
                            0,
                        );
                        const isOpen = expanded === c.id;

                        return (
                            <div key={c.id} className="bg-white rounded-lg shadow overflow-hidden">
                                <div
                                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50"
                                    onClick={() => toggleExpand(c.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                Orden #{c.id.slice(0, 8).toUpperCase()}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(c.createdAt).toLocaleDateString('es-CO', {
                                                    year: 'numeric', month: 'long', day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5">
                                            {c.items.length} productos
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">Total estimado</p>
                                            <p className="font-bold text-gray-900">{formatCOP(grandTotal)}</p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); downloadExcel(c); }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <FileDown className="h-3.5 w-3.5" />
                                            Excel
                                        </button>
                                        {isOpen ? (
                                            <ChevronUp className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="border-t border-gray-100">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {c.items.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-3 text-sm font-mono text-gray-500">{item.product.sku}</td>
                                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.product.name}</td>
                                                        <td className="px-6 py-3 text-sm font-semibold text-gray-900 text-right">{item.totalQty}</td>
                                                        <td className="px-6 py-3 text-sm text-gray-500 text-right">{formatCOP(parseFloat(item.unitPrice))}</td>
                                                        <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">{formatCOP(parseFloat(item.lineTotal))}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-50">
                                                <tr>
                                                    <td colSpan={2} className="px-6 py-3 text-sm font-bold text-gray-900">TOTAL</td>
                                                    <td className="px-6 py-3 text-sm font-bold text-gray-900 text-right">
                                                        {c.items.reduce((s, i) => s + i.totalQty, 0)}
                                                    </td>
                                                    <td></td>
                                                    <td className="px-6 py-3 text-sm font-bold text-gray-900 text-right">{formatCOP(grandTotal)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProviderOrders;
