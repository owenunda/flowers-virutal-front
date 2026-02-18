import { useEffect, useState } from 'react';
import { sileo } from 'sileo';
import { productService } from '../../services/product.service';
import { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { Plus, Minus } from 'lucide-react';
import { formatCOP } from '../../utils/format';

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.findAll();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (id: string, value: string) => {
    const qty = parseInt(value, 10);
    setQuantities((prev) => ({ ...prev, [id]: qty > 0 ? qty : 1 }));
  };

  const increment = (id: string, stock: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      return { ...prev, [id]: current < stock ? current + 1 : current };
    });
  };

  const decrement = (id: string) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      return { ...prev, [id]: current > 1 ? current - 1 : 1 };
    });
  };

  const handleAddToCart = (product: Product) => {
    const qty = quantities[product.id] || 1;
    addToCart(product, qty);
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }))
    sileo.success({title : `Agregado ${qty} ${product.name} al carrito`,
    fill: "dark"});
  };

  if (loading) return <div className="text-center py-10">Loading products...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Catálogo de Productos</h1>
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {products.map((product) => (
          <div key={product.id} className="group relative border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 h-48 mb-4 flex items-center justify-center">
              <span className="text-gray-500 text-4xl">🌷</span>
            </div>
            <div className="mt-4 flex justify-between">
              <div>
                <h3 className="text-sm text-gray-700">
                  <span aria-hidden="true" className="absolute inset-0" />
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">Stock: {product.stock}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">{formatCOP(product.basePrice)}</p>
            </div>

            <div className="mt-4 flex items-center gap-2 z-10 relative">
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => decrement(product.id)}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  className="w-10 text-center text-sm py-1 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={quantities[product.id] || 1}
                  onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                />
                <button
                  onClick={() => increment(product.id, product.stock)}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <button
                onClick={() => handleAddToCart(product)}
                className="flex-1 flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;
