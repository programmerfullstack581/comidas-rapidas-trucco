import { useState, useEffect, useRef } from 'react';
import {
  LogOut, Plus, Pencil, Trash2,
  ChefHat, Search, Package, AlertTriangle, CheckCircle,
  ExternalLink, X, RefreshCw, Eye, ClipboardList, Check,
  FolderPlus, Layers, Phone, MapPin, Clock, Bell, Volume2, RotateCcw
} from 'lucide-react';
import { useAdminProducts } from '../hooks/useAdminProducts';
import { APPS_SCRIPT_URL } from '../hooks/useSheetProducts';
import AdminProductForm from './AdminProductForm';

export default function AdminPanel({ onLogout }) {
  const {
    products,
    categories,
    rawCategories,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    refresh
  } = useAdminProducts();

  const [activeTab, setActiveTab] = useState('productos'); // 'productos' | 'categorias' | 'pedidos'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState(null);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [toast, setToast] = useState(null);
  
  const knownOrdersCount = useRef(0);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio notification error:', e);
    }
  };

  useEffect(() => {
    if (error) showToast(`Error al sincronizar: ${error}`, 'error');
  }, [error]);

  // Cargar pedidos desde Google Sheets y localStorage
  const loadOrders = async (silent = false) => {
    if (!silent) setLoadingOrders(true);
    try {
      // 1. Intentar cargar desde Google Sheets vía Apps Script
      const resp = await fetch(`${APPS_SCRIPT_URL}?action=getOrders&t=${Date.now()}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.orders)) {
          // Detectar si hay nuevos pedidos para emitir sonido
          if (knownOrdersCount.current > 0 && data.orders.length > knownOrdersCount.current) {
            playChime();
            showToast('🔔 ¡Nuevo pedido recibido en Google Sheets!', 'success');
          }
          knownOrdersCount.current = data.orders.length;
          setOrders(data.orders);
          localStorage.setItem('trucco_order_history', JSON.stringify(data.orders));
          if (!silent) setLoadingOrders(false);
          return;
        }
      }
    } catch (e) {
      console.warn("No se pudieron cargar pedidos de la nube, usando local:", e);
    }

    // Fallback a localStorage
    try {
      const historyStr = localStorage.getItem('trucco_order_history');
      if (historyStr) {
        const parsed = JSON.parse(historyStr);
        setOrders(Array.isArray(parsed) ? parsed : []);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Sondeo de pedidos cada 15 segundos
    const interval = setInterval(() => {
      loadOrders(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'pedidos') {
      loadOrders();
    }
  }, [activeTab]);

  const markOrderStatus = async (orderId, newStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem('trucco_order_history', JSON.stringify(updated));

    // Sincronizar estado en Google Sheets
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateOrderStatus',
          orderId: String(orderId),
          status: newStatus
        })
      });
      showToast(`Pedido #${orderId} actualizado a "${newStatus === 'completed' ? 'Completado' : 'Pendiente'}".`);
    } catch (err) {
      console.warn('Error actualizando estado en Sheet:', err);
    }
  };

  const deleteOrder = async (orderId) => {
    const updated = orders.filter(o => o.id !== orderId);
    setOrders(updated);
    localStorage.setItem('trucco_order_history', JSON.stringify(updated));

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'deleteOrder',
          orderId: String(orderId)
        })
      });
      showToast(`Pedido #${orderId} eliminado.`);
    } catch (err) {
      console.warn('Error eliminando pedido en Sheet:', err);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        showToast(`"${formData.name}" guardado en Google Sheets.`);
      } else {
        await addProduct(formData);
        showToast(`"${formData.name}" creado en Google Sheets.`);
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

  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    const name = newCategoryInput.trim();
    if (!name) return;
    if (rawCategories.includes(name)) {
      showToast('Esta categoría ya existe.', 'warning');
      return;
    }
    try {
      await addCategory(name);
      setNewCategoryInput('');
      showToast(`Categoría "${name}" agregada y guardada en Excel.`);
    } catch (err) {
      showToast('Error al agregar categoría', 'error');
    }
  };

  const confirmDeleteCategory = async () => {
    if (deleteCategoryConfirm) {
      const catName = deleteCategoryConfirm;
      try {
        await deleteCategory(catName);
        showToast(`Categoría "${catName}" eliminada de Excel.`);
      } catch (err) {
        showToast('Error al eliminar categoría', 'error');
      }
      setDeleteCategoryConfirm(null);
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
    { label: 'Categorías activas', value: rawCategories.length, icon: Layers, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    {
      label: 'Pedidos registrados',
      value: orders.length,
      icon: ClipboardList,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Pedidos pendientes',
      value: orders.filter(o => o.status !== 'completed').length,
      icon: Clock,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col md:flex-row font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl transition-all ${toast.type === 'success' ? 'bg-green-800 border border-green-600' : toast.type === 'warning' ? 'bg-amber-800 border border-amber-600' : 'bg-red-800 border border-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 text-yellow-300 flex-shrink-0" />}
          <span className="text-sm text-white max-w-xs">{toast.message}</span>
          <button onClick={() => setToast(null)}><X className="w-4 h-4 text-white/60 hover:text-white" /></button>
        </div>
      )}

      {/* Modal confirmación eliminar producto */}
      {deleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div 
            className="bg-gray-900 border border-red-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
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

      {/* Modal confirmación eliminar categoría */}
      {deleteCategoryConfirm && (
        <div 
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
          onClick={() => setDeleteCategoryConfirm(null)}
        >
          <div 
            className="bg-gray-900 border border-red-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-900/50 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">¿Eliminar categoría?</h3>
                <p className="text-xs text-gray-400">Se eliminará de la lista y de Excel</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-5">
              ¿Estás seguro de eliminar la categoría <span className="font-semibold text-yellow-400">"{deleteCategoryConfirm}"</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteCategoryConfirm(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-sm transition">Cancelar</button>
              <button onClick={confirmDeleteCategory} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-xl text-sm transition">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal del Formulario de Producto (con categorías dinámicas pasadas como prop) */}
      {view === 'form' && (
        <AdminProductForm
          product={editingProduct}
          categories={categories}
          onSave={handleSave}
          onCancel={() => { setView('list'); setEditingProduct(null); }}
        />
      )}

      {/* Modal de Detalles del Producto (Ver) */}
      {viewingProduct && (
        <div 
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setViewingProduct(null)}
        >
          <div 
            className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 bg-gray-800">
              {viewingProduct.image ? (
                <img src={viewingProduct.image} alt={viewingProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ChefHat className="w-16 h-16 text-gray-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              <button 
                onClick={() => setViewingProduct(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <span className="bg-yellow-400/10 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full border border-yellow-400/20">
                  {viewingProduct.category}
                </span>
                <h2 className="text-2xl font-black text-white mt-3 mb-2">{viewingProduct.name}</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{viewingProduct.description}</p>
              </div>

              <div className="bg-gray-950 rounded-2xl p-4 border border-gray-800">
                <h3 className="font-bold text-gray-300 mb-3 text-sm flex items-center gap-2">
                  <Package className="w-4 h-4" /> Variantes y Precios
                </h3>
                <div className="space-y-2">
                  {viewingProduct.variants.map((v, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0 last:pb-0">
                      <span className="text-gray-300 text-sm">{v.label}</span>
                      <span className="font-bold text-yellow-400">${v.price.toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setViewingProduct(null)}
                className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition"
              >
                Cerrar detalles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ BARRA LATERAL (SIDEBAR DESKTOP) ══════════════ */}
      <aside className="hidden md:flex w-64 flex-col bg-gray-900 border-r border-gray-800">
        <div className="p-6 border-b border-gray-800 flex flex-col items-center justify-center gap-2">
          <img src="/logo.png" alt="Comidas Rápidas Trucco" className="h-16 w-auto object-contain drop-shadow-lg" />
          <p className="text-xs text-yellow-400 font-bold tracking-wide">TRUCCO ADMIN PANEL</p>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('productos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'productos' ? 'bg-yellow-400/10 text-yellow-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <Package className="w-5 h-5" /> Productos ({products.length})
          </button>

          <button 
            onClick={() => setActiveTab('categorias')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'categorias' ? 'bg-yellow-400/10 text-yellow-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <Layers className="w-5 h-5" /> Categorías ({rawCategories.length})
          </button>
          
          <button 
            onClick={() => setActiveTab('pedidos')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition ${activeTab === 'pedidos' ? 'bg-yellow-400/10 text-yellow-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5" /> Pedidos
            </div>
            {orders.filter(o => o.status !== 'completed').length > 0 && (
              <span className="bg-yellow-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">
                {orders.filter(o => o.status !== 'completed').length}
              </span>
            )}
          </button>

          <a href="/" target="_blank" rel="noreferrer" className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl font-medium transition mt-4 border-t border-gray-800 pt-4">
            <ExternalLink className="w-5 h-5" /> Ver Menú Público
          </a>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-xl transition font-medium">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ══════════════ HEADER MÓVIL ══════════════ */}
      <div className="md:hidden bg-gray-900 border-b border-gray-800 sticky top-0 z-10 flex flex-col">
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Trucco" className="h-8 w-auto object-contain drop-shadow-lg" />
            <h1 className="font-bold text-white text-sm">Admin Panel</h1>
          </div>
          <button onClick={onLogout} className="text-red-400 p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <div className="flex">
          <button 
            onClick={() => setActiveTab('productos')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${activeTab === 'productos' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-400'}`}
          >
            Productos ({products.length})
          </button>
          <button 
            onClick={() => setActiveTab('categorias')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${activeTab === 'categorias' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-400'}`}
          >
            Categorías ({rawCategories.length})
          </button>
          <button 
            onClick={() => setActiveTab('pedidos')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${activeTab === 'pedidos' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-400'}`}
          >
            Pedidos ({orders.length})
          </button>
        </div>
      </div>

      {/* ══════════════ CONTENIDO PRINCIPAL ══════════════ */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-950/50">
        
        {/* ══════════════ TAB DE PRODUCTOS ══════════════ */}
        {activeTab === 'productos' && (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
          
          {/* Header de la sección */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white">Menú de Productos</h2>
              <p className="text-gray-400 text-sm mt-1">Administra el catálogo y los precios de Comidas Rápidas Trucco</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  localStorage.removeItem('trucco_sheet_cache');
                  localStorage.removeItem('trucco_categories_cache');
                  localStorage.removeItem('trucco_sheet_cache_time');
                  refresh();
                  showToast('Actualizando datos desde Google Sheets...', 'success');
                }}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold p-3 md:px-4 rounded-xl transition flex items-center justify-center gap-2"
                title="Forzar actualización desde Excel"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-yellow-400' : ''}`} />
                <span className="hidden md:inline">Actualizar</span>
              </button>
              <button 
                onClick={() => { setEditingProduct(null); setView('form'); }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-gray-900 font-bold py-3 px-5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20"
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

          {/* Estadísticas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Buscador y filtro por categoría dinámica */}
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
                <option value="Todos" className="bg-gray-900 text-white">Todas las categorías ({products.length})</option>
                {rawCategories.map(cat => {
                  const count = products.filter(p => p.category === cat).length;
                  return (
                    <option key={cat} value={cat} className="bg-gray-900 text-white">
                      {cat} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Grid de productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-gray-900 border border-gray-800 rounded-3xl">
                <ChefHat className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-300">No se encontraron productos</h3>
                <p className="text-gray-500 mt-2">Prueba cambiando los términos de búsqueda o agrega un nuevo producto.</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-3xl flex flex-col transition hover:border-gray-700 hover:shadow-xl hover:shadow-black/50 overflow-hidden relative">
                  
                  {/* Header / Imagen */}
                  <div className="relative h-48 bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { e.target.src = ''; e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-5xl bg-gray-800">🍔</div>'; }}
                    />
                    <div className="absolute top-3 left-3 bg-yellow-400 text-gray-900 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                      {product.category}
                    </div>
                  </div>

                  {/* Cuerpo */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg leading-snug mb-2 min-h-[3rem] flex items-center">{product.name}</h3>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">{product.description}</p>
                    </div>

                    {/* Precios */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800 mb-4 h-14">
                      <div className="flex flex-col">
                        {product.variants.length === 1 ? (
                          <span className="text-green-400 font-bold text-lg">
                            ${product.variants[0].price.toLocaleString('es-CO')}
                          </span>
                        ) : (
                          <span className="text-green-400 font-bold text-lg">
                            ${Math.min(...product.variants.map(v => v.price)).toLocaleString('es-CO')} +
                          </span>
                        )}
                        {product.variants.length > 1 && (
                          <span className="text-xs text-gray-500 font-medium">{product.variants.length} opciones</span>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setViewingProduct(product)}
                        className="flex items-center justify-center p-2.5 text-green-400 hover:text-green-300 bg-green-900/20 hover:bg-green-900/40 rounded-xl transition"
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex items-center justify-center p-2.5 text-blue-400 hover:text-blue-300 bg-blue-900/20 hover:bg-blue-900/40 rounded-xl transition"
                        title="Editar producto"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="flex items-center justify-center p-2.5 text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 rounded-xl transition"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
        </div>
        )}

        {/* ══════════════ TAB DE CATEGORÍAS ══════════════ */}
        {activeTab === 'categorias' && (
          <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                  <Layers className="text-yellow-400" /> Categorías del Menú
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Crea, organiza o elimina categorías sincronizadas directamente con Google Sheets (pestaña <code>categorias</code>).
                </p>
              </div>

              <button 
                onClick={() => {
                  localStorage.removeItem('trucco_categories_cache');
                  localStorage.removeItem('trucco_sheet_cache');
                  refresh();
                  showToast('Actualizando categorías desde Google Sheets...', 'success');
                }}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold p-3 md:px-4 rounded-xl transition flex items-center justify-center gap-2 self-start md:self-auto"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-yellow-400' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>

            {/* Formulario para agregar nueva categoría */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-yellow-400" /> Crear Nueva Categoría
              </h3>
              <form onSubmit={handleAddCategorySubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="Nombre de la nueva categoría (Ej. Bebidas, Desgranados, Combos...)"
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                />
                <button
                  type="submit"
                  disabled={!newCategoryInput.trim() || loading}
                  className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" /> Guardar Categoría
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                Esta categoría aparecerá de inmediato en los filtros, en el formulario de creación de productos y en la página pública.
              </p>
            </div>

            {/* Grid de categorías */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rawCategories.map((cat, idx) => {
                const prodCount = products.filter(p => p.category === cat).length;
                return (
                  <div key={cat} className="bg-gray-900 border border-gray-800 hover:border-gray-700 p-5 rounded-2xl flex items-center justify-between transition shadow-md group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">{cat}</h4>
                        <span className="text-xs text-gray-400">
                          {prodCount} {prodCount === 1 ? 'producto' : 'productos'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteCategoryConfirm(cat)}
                      className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition"
                      title={`Eliminar categoría "${cat}"`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════ TAB DE PEDIDOS (EN VIVO CON GOOGLE SHEETS) ══════════════ */}
        {activeTab === 'pedidos' && (
          <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                  <ClipboardList className="text-yellow-400" /> Pedidos en Tiempo Real
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Pedidos registrados automáticamente en la pestaña <code>pedidos</code> de Google Sheets.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playChime();
                    showToast('Prueba de sonido ejecutada con éxito 🔔');
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-3 rounded-xl transition flex items-center gap-2 text-sm font-medium"
                  title="Probar sonido de notificación"
                >
                  <Volume2 className="w-4 h-4 text-yellow-400" />
                  <span className="hidden sm:inline">Probar timbre</span>
                </button>

                <button 
                  onClick={() => loadOrders(false)}
                  className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
                  <span>Refrescar Pedidos</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {orders.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-gray-900 rounded-3xl border border-gray-800">
                  <ClipboardList className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-300">No hay pedidos registrados</h3>
                  <p className="text-gray-500 mt-2">Cuando un cliente envíe un pedido por WhatsApp, aparecerá aquí automáticamente.</p>
                </div>
              ) : (
                orders.map((order) => {
                  const isCompleted = order.status === 'completed';
                  return (
                    <div 
                      key={order.id} 
                      className={`flex flex-col bg-gray-900 border ${isCompleted ? 'border-green-800/40 opacity-75' : 'border-yellow-500/30 shadow-xl shadow-yellow-500/5'} rounded-3xl p-5 md:p-6 transition`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-white">
                              #{order.id} — {order.name}
                            </h3>
                            {isCompleted ? (
                              <span className="bg-green-900/40 text-green-400 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-green-700/50 font-bold">
                                <Check className="w-3 h-3"/> Listo
                              </span>
                            ) : (
                              <span className="bg-yellow-400/20 text-yellow-400 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-yellow-400/40 font-bold animate-pulse">
                                🔔 Pendiente
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {order.date} {order.time ? `• ${order.time}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-xl text-yellow-400">
                            ${Number(order.total || 0).toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 text-sm text-gray-300 mb-4 bg-gray-950 p-4 rounded-2xl border border-gray-800">
                        <div className="flex flex-col gap-1 text-xs sm:text-sm">
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-green-400 shrink-0" />
                            <strong>Teléfono:</strong> 
                            <a href={`https://wa.me/57${String(order.phone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-green-400 hover:underline">
                              {order.phone}
                            </a>
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-yellow-400 shrink-0" />
                            <strong>Modalidad:</strong> {order.orderType === 'domicilio' ? '🛵 Domicilio' : '🏪 Recoger en local'}
                          </p>
                          {order.address && (
                            <p className="text-gray-300 ml-6">
                              <strong>Dirección:</strong> {order.address}
                            </p>
                          )}
                          {order.notes && (
                            <p className="text-gray-400 italic ml-6">
                              <strong>Notas:</strong> {order.notes}
                            </p>
                          )}
                        </div>

                        <div className="border-t border-gray-800 pt-3">
                          <strong className="block text-gray-400 text-xs uppercase tracking-wider mb-2">Detalle de productos:</strong>
                          {Array.isArray(order.items) && order.items.length > 0 ? (
                            <ul className="space-y-1 text-xs">
                              {order.items.map((item, i) => (
                                <li key={i} className="flex justify-between border-b border-gray-800/50 pb-1 last:border-0">
                                  <span>{item.quantity}x {item.name} {item.variantLabel && item.variantLabel !== item.name ? `(${item.variantLabel})` : ''}</span>
                                  <span className="text-gray-400">${(item.price * item.quantity).toLocaleString('es-CO')}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-yellow-200/90">{order.itemsSummary || 'Ver detalle en mensaje de WhatsApp'}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end mt-auto pt-3 border-t border-gray-800">
                        {!isCompleted ? (
                          <button
                            onClick={() => markOrderStatus(order.id, 'completed')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition text-xs shadow-md shadow-green-600/20"
                          >
                            <Check className="w-4 h-4" /> Marcar Listo
                          </button>
                        ) : (
                          <button
                            onClick={() => markOrderStatus(order.id, 'pending')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition text-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Reabrir
                          </button>
                        )}
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded-xl transition text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
