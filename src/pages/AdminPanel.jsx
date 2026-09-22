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

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col md:flex-row font-sans">
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

      {/* Modal del Formulario */}
      {view === 'form' && (
        <AdminProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={() => { setView('list'); setEditingProduct(null); }}
        />
      )}

      {/* ══════════════ BARRA LATERAL (SIDEBAR) ══════════════ */}
      <aside className="hidden md:flex w-64 flex-col bg-gray-900 border-r border-gray-800">
        <div className="p-6 border-b border-gray-800 flex flex-col items-center justify-center gap-2">
          <img src="/logo.png" alt="Comidas Rápidas Trucco" className="h-16 w-auto object-contain drop-shadow-lg" />
          <p className="text-xs text-gray-400">Trucco Panel</p>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-yellow-400/10 text-yellow-400 rounded-xl font-medium transition">
            <Package className="w-5 h-5" /> Productos
          </button>
          
          <a href="/" target="_blank" rel="noreferrer" className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl font-medium transition">
            <ExternalLink className="w-5 h-5" /> Ver mi página
          </a>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-xl transition font-medium">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ══════════════ HEADER MÓVIL ══════════════ */}
      <div className="md:hidden bg-gray-900 border-b border-gray-800 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Trucco" className="h-8 w-auto object-contain drop-shadow-lg" />
          <h1 className="font-bold text-white text-sm">Admin Panel</h1>
        </div>
        <button onClick={onLogout} className="text-red-400 p-2">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* ══════════════ CONTENIDO PRINCIPAL ══════════════ */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-950/50">
        
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-5xl mx-auto w-full">
          
          {/* Header de la sección */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white">Menú de Productos</h2>
              <p className="text-gray-400 text-sm mt-1">Administra el catálogo de Comidas Rápidas Trucco</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleNewProduct}
                disabled={loading}
                className={`flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-gray-900 font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-yellow-500/20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Plus className="w-5 h-5" /> Agregar producto
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-400/10 px-4 py-3 rounded-xl border border-yellow-400/20">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Sincronizando cambios con Google Sheets...
            </div>
          )}

          {/* Estadísticas (Tarjetas mejoradas) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Buscador y filtro */}
          <div className="bg-gray-900 border border-gray-800 p-2 rounded-2xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o categoría..."
                className="w-full bg-transparent text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-sm"
              />
            </div>
            <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-gray-800 p-1">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-transparent text-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-sm cursor-pointer"
              >
                <option value="Todos">Todas las categorías</option>
                {categories.filter(c => c !== 'Todos').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lista de productos */}
          <div className="space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-3xl text-center py-20 text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No se encontraron productos</p>
                <p className="text-sm mt-1">Intenta con otra búsqueda o agrega uno nuevo.</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 transition group"
                >
                  {/* Imagen */}
                  <div className="w-full md:w-20 h-32 md:h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = ''; e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-3xl">🍔</div>'; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-base truncate">{product.name}</h3>
                        <span className="inline-block text-xs font-medium text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-full mt-1.5">
                          {product.category}
                        </span>
                      </div>
                      <div className="text-left md:text-right flex-shrink-0 mt-2 md:mt-0">
                        {product.variants.length === 1 ? (
                          <p className="text-green-400 font-bold text-base">
                            ${product.variants[0].price.toLocaleString('es-CO')}
                          </p>
                        ) : (
                          <p className="text-green-400 font-bold text-base">
                            ${Math.min(...product.variants.map(v => v.price)).toLocaleString('es-CO')} +
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">{product.variants.length} opción{product.variants.length !== 1 ? 'es' : ''}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2 line-clamp-1">{product.description}</p>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 flex-shrink-0 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-800 w-full md:w-auto justify-end">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-blue-400 hover:text-blue-300 bg-blue-900/20 hover:bg-blue-900/40 rounded-xl transition font-medium text-sm"
                    >
                      <Pencil className="w-4 h-4" /> <span className="md:hidden">Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 rounded-xl transition font-medium text-sm"
                    >
                      <Trash2 className="w-4 h-4" /> <span className="md:hidden">Eliminar</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Instrucciones de Sincronización */}
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-800/50 rounded-2xl p-5 md:p-6 mt-8 shadow-lg">
            <h3 className="text-base font-bold text-green-400 mb-2 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" /> Sincronización Automática
            </h3>
            <p className="text-sm text-green-200/80 mb-4">
              Cualquier cambio que realices en el panel se enviará a tu hoja de cálculo.
            </p>
            <ul className="text-sm text-green-200/70 space-y-2 list-disc list-inside ml-2">
              <li>El indicador de <strong>"Sincronizando..."</strong> aparecerá cuando guardes.</li>
              <li>Tu hoja de Google Sheets es la fuente oficial de información.</li>
              <li>Los clientes verán los cambios actualizados en máximo 5 minutos en el menú principal.</li>
            </ul>
          </div>
          
        </div>
      </main>
    </div>
  );
}
