import { useEffect, useState } from 'react';
import { sileo } from 'sileo';
import { formatCOP } from '../../utils/format';
import { productService } from '../../services/product.service';
import { userService } from '../../services/user.service';
import { Product, Role, UserProfile } from '../../types';
import { Plus, Trash2, Pencil } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editStock, setEditStock] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    basePrice: 0,
    stock: 0,
    providerId: ''
  });

  const fetchProducts = async () => {
    try {
      const data = await productService.findAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
      sileo.error({ title: "Error al cargar productos" });
    }
  };

  const fetchProviders = async () => {
    try {
      const data = await userService.findAll(Role.PROVEEDOR);
      setProviders(data);
    } catch (error) {
      console.error('Failed to fetch providers', error);
      sileo.error({ title: "Error al cargar proveedores" });
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchProviders()]);
      setLoading(false);
    };
    load();
  }, []);

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setEditStock(product.stock);
    setEditPrice(typeof product.basePrice === 'string' ? parseFloat(product.basePrice) : product.basePrice);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    sileo.promise(
      (async () => {
        await productService.update(editProduct.id, { stock: editStock, basePrice: editPrice });
        setEditProduct(null);
        fetchProducts();
      })(),
      {
        loading: { title: 'Actualizando producto...' },
        success: { title: 'Producto actualizado' },
        error: { title: 'Error al actualizar producto' },
      }
    );
  };

  const handleDelete = async (id: string) => {
    sileo.action({
      title: 'Eliminar producto',
      description: '¿Estás seguro de que deseas eliminar este producto?',
      button: {
        title: 'Confirmar',
        onClick: async () => {
          await sileo.promise(
            (async () => {
                await productService.delete(id);
                setProducts((prev) => prev.filter(p => p.id !== id));
            })(),
            {
               loading: { title: "Eliminando producto..." },
               success: { title: "Producto eliminado correctamente" },
               error: { title: "Error al eliminar producto" }
            }
          );
        },
      },
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    sileo.promise(
        (async () => {
            await productService.create(newProduct);
            setIsModalOpen(false);
            setNewProduct({ sku: '', name: '', basePrice: 0, stock: 0, providerId: '' });
            fetchProducts();
        })(),
        {
            loading: { title: "Creando producto..." },
            success: { title: "Producto creado exitosamente" },
            error: { title: "Error creando producto. Revisa los datos." }
        }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Producto
        </button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {products.map((product) => (
              <li key={product.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">SKU: {product.sku} | Stock: <span className="font-semibold">{product.stock}</span></p>
                  <p className="text-sm text-gray-500">Precio: {formatCOP(product.basePrice)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-indigo-500 hover:text-indigo-700 p-1"
                    title="Editar stock y precio"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal Editar */}
      {editProduct && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-lg font-bold mb-1">{editProduct.name}</h2>
            <p className="text-sm text-gray-500 mb-4">SKU: {editProduct.sku}</p>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  value={editStock}
                  onChange={e => { const v = parseInt(e.target.value); setEditStock(isNaN(v) ? 0 : v); }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio Base</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  value={editPrice}
                  onChange={e => { const v = parseFloat(e.target.value); setEditPrice(isNaN(v) ? 0 : v); }}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Agregar Producto</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  value={newProduct.sku}
                  onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio Base</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  value={newProduct.basePrice}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setNewProduct({ ...newProduct, basePrice: isNaN(val) ? 0 : val });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  value={newProduct.stock}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setNewProduct({ ...newProduct, stock: isNaN(val) ? 0 : val });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Provider</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  value={newProduct.providerId}
                  onChange={e => setNewProduct({ ...newProduct, providerId: e.target.value })}
                >
                  <option value="">Seleccione un proveedor</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} ({provider.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
