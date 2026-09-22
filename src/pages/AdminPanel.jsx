import { useState, useEffect } from 'react';
import {
  LogOut, Plus, Pencil, Trash2,
  ChefHat, Search, Package, AlertTriangle, CheckCircle,
  ExternalLink, X, RefreshCw
} from 'lucide-react';
import { useAdminProducts } from '../hooks/useAdminProducts';
import AdminProductForm from './AdminProductForm';

export default function AdminPanel({ onLogout }) {
  const { products, categories, loading, error, addProduct, updateProduct, deleteProduct } = useAdminProducts();

  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (error) showToast(`Error al sincronizar: ${error}`, 'error');
  }, [error]);

  const handleSave = async (formData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        showToast(`"${formData.name}" guardado en Google Sheets.`);
      } else {
        await addProduct(formData);
        showToast(`"${formData.name}" guardado en Google Sheets.`);
      }
      setView('list');
      setEditingProduct(null);
    } catch (e) {
      showToast('Hubo un error al guardar', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setView('form');
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setView('form');
  };

  const handleDelete = (product) => {
    setDeleteConfirm(product);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        await deleteProduct(deleteConfirm.id);
        showToast(`"${deleteConfirm.name}" eliminado de Google Sheets.`, 'warning');
      } catch (e) {
        showToast('Error al eliminar', 'error');
      }
      setDeleteConfirm(null);
    }
  };

// Filtrar productos
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === 'Todos' || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  // Estadísticas
  const stats = [
    { label: 'Total productos', value: products.length, icon: Package, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Categorías', value: categories.filter(c => c !== 'Todos').length, icon: ChefHat, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    {
      label: 'Precio más alto',
      value: `$${Math.max(...products.flatMap(p => p.variants.map(v => v.price))).toLocaleString('es-CO')}`,
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      label: 'Precio más bajo',
      value: `$${Math.min(...products.flatMap(p => p.variants.map(v => v.price))).toLocaleString('es-CO')}`,
      icon: CheckCircle,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
  ];

  if (view === 'form') {
    return (
      <AdminProductForm
        product={editingProduct}
        onSave={handleSave}
        onCancel={() => { setView('list'); setEditingProduct(null); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl transition-all ${toast.type === 'success' ? 'bg-green-800 border border-green-600' : 'bg-yellow-800 border border-yellow-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 text-yellow-300 flex-shrink-0" />}
          <span className="text-sm text-white max-w-xs">{toast.message}</span>
          <button onClick={() => setToast(null)}><X className="w-4 h-4 text-white/60 hover:text-white" /></button>
        </div>
      )}

      {/* Modal confirmación eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-900/50 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">¿Eliminar producto?</h3>
                <p className="text-xs text-gray-400">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-5">
              ¿Estás seguro de eliminar <span className="font-semibold text-white">"{deleteConfirm.name}"</span> del menú?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-sm transition">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-xl text-sm transition">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}


      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow shadow-yellow-500/25">
                <ChefHat className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg leading-tight">Panel de Administración</h1>
                <p className="text-xs text-gray-400">Comidas Rápidas Trucco</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 hover:text-yellow-400 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition border border-gray-700"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Ver menú
              </a>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50 px-3 py-2 rounded-xl transition border border-red-900"
              >
                <LogOut className="w-3.5 h-3.5" /> Salir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        // Barra de acciones reemplazada
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleNewProduct}
            disabled={loading}
            className={`flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-gray-900 font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-yellow-500/20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Plus className="w-4 h-4" /> Agregar producto
          </button>
          
          {loading && (
            <div className="flex items-center gap-2 text-yellow-400 text-sm px-4">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Sincronizando con Google Sheets...
            </div>
          )}
        </div>

        {/* Buscador y filtro */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
          >
            <option value="Todos">Todas</option>
            {categories.filter(c => c !== 'Todos').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Lista de productos */}
        <div className="space-y-2">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No se encontraron productos</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 flex items-center gap-4 transition group"
              >
                {/* Imagen */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = ''; e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl">🍔</div>'; }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">{product.name}</h3>
                      <span className="inline-block text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full mt-0.5">
                        {product.category}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {product.variants.length === 1 ? (
                        <p className="text-green-400 font-bold text-sm">
                          ${product.variants[0].price.toLocaleString('es-CO')}
                        </p>
                      ) : (
                        <p className="text-green-400 font-bold text-sm">
                          ${Math.min(...product.variants.map(v => v.price)).toLocaleString('es-CO')} +
                        </p>
                      )}
                      <p className="text-xs text-gray-500">{product.variants.length} opción{product.variants.length !== 1 ? 'es' : ''}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-xl transition"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-xl transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Instrucciones de Sincronización */}
        <div className="bg-green-900/20 border border-green-800/50 rounded-2xl p-4 mt-6">
          <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Sincronización con Google Sheets
          </h3>
          <p className="text-xs text-green-200/70 mb-2">
            Los cambios que hagas aquí se guardan <strong className="text-green-300">automáticamente</strong> en tu hoja de Google Sheets.
          </p>
          <ol className="text-xs text-green-200/70 space-y-1.5 list-decimal list-inside">
            <li>Agrega, edita o elimina productos usando los botones.</li>
            <li>Al guardar, verás el mensaje de "Sincronizando...".</li>
            <li>En menos de 5 minutos, todos los clientes verán los cambios en la página principal. ¡Magia! ✨</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
