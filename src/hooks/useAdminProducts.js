import { useState, useEffect } from 'react';
import { products as originalProducts, categories as originalCategories } from '../data/products';

const STORAGE_KEY = 'trucco_admin_products';
const CATEGORIES_KEY = 'trucco_admin_categories';

export function useAdminProducts() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : originalProducts;
    } catch {
      return originalProducts;
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_KEY);
      return saved ? JSON.parse(saved) : originalCategories;
    } catch {
      return originalCategories;
    }
  });

  // Persistir productos en localStorage cada vez que cambien
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (err) {
      console.error('Error guardando productos:', err);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (err) {
      console.error('Error guardando categorías:', err);
    }
  }, [categories]);

  // Agregar producto nuevo
  const addProduct = (productData) => {
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    const newProduct = { ...productData, id: newId };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  // Editar producto existente
  const updateProduct = (id, productData) => {
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, ...productData, id } : p)
    );
  };

  // Eliminar producto
  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Restaurar productos originales
  const resetToOriginal = () => {
    setProducts(originalProducts);
    setCategories(originalCategories);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CATEGORIES_KEY);
  };

  // Exportar products.js actualizado para descarga
  const exportProducts = () => {
    const content = `// ═══════════════════════════════════════════════════
// DATOS REALES - COMIDAS RÁPIDAS TRUCCO
// Actualizado desde el panel de administración
// WhatsApp: 3171922866
// ═══════════════════════════════════════════════════

export const WHATSAPP_NUMBER = "573171922866";

export const categories = ${JSON.stringify(categories, null, 2)};

export const products = ${JSON.stringify(products, null, 2)};
`;
    const blob = new Blob([content], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToOriginal,
    exportProducts,
  };
}

// Hook público para el menú (solo lectura)
export function useProducts() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : originalProducts;
    } catch {
      return originalProducts;
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_KEY);
      return saved ? JSON.parse(saved) : originalCategories;
    } catch {
      return originalCategories;
    }
  });

  // Escuchar cambios del admin en tiempo real
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setProducts(JSON.parse(saved));
        const savedCats = localStorage.getItem(CATEGORIES_KEY);
        if (savedCats) setCategories(JSON.parse(savedCats));
      } catch {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { products, categories };
}
