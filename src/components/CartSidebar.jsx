import { X, Trash2, Plus, Minus, Send, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartSidebar({ isOpen, onClose, cart, setCart, onCheckout }) {
  
  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  const removeItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[420px] bg-cream z-50 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-cream-dark flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-neutral">Tu Pedido</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-cream rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="w-24 h-24 bg-cream-dark rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-12 h-12 opacity-30" />
                  </div>
                  <p className="text-lg font-semibold">Tu carrito está vacío</p>
                  <p className="text-sm text-center">Agrega productos desde nuestro menú para empezar tu pedido.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={`${item.id}-${index}`} 
                      className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-cream-dark"
                    >
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-neutral leading-tight text-sm">{item.name}</h4>
                          {item.variantLabel && item.variantLabel !== item.name && (
                            <p className="text-xs text-gray-500 mt-0.5">{item.variantLabel}</p>
                          )}
                          <p className="text-primary font-extrabold mt-1">${(item.price * item.quantity).toLocaleString('es-CO')}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-cream rounded-full p-1">
                            <button onClick={() => updateQuantity(index, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors"><Minus className="w-4 h-4" /></button>
                            <span className="font-black text-sm w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(index, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors"><Plus className="w-4 h-4" /></button>
                          </div>
                          <button onClick={() => removeItem(index)} className="p-2 text-gray-400 hover:text-primary transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-cream-dark bg-white">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 font-semibold">Total a pagar</span>
                  <span className="text-3xl font-black text-neutral">${total.toLocaleString('es-CO')}</span>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full bg-secondary hover:bg-yellow-500 text-neutral font-black py-4 rounded-full flex items-center justify-center gap-2 transition-all text-lg shadow-lg hover:scale-[1.02]"
                >
                  Continuar Pedido
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
