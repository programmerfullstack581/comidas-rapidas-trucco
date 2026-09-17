import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WHATSAPP_NUMBER } from '../data/products';

export default function CheckoutModal({ isOpen, onClose, cart }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    orderType: 'recoger',
    address: '',
    notes: ''
  });

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let text = `*¡Hola Trucco!* 👋%0A%0AQuiero realizar el siguiente pedido:%0A%0A`;
    
    text += `🍔 *PRODUCTOS*%0A`;
    cart.forEach(item => {
      const variantText = item.variantLabel && item.variantLabel !== item.name ? ` (${item.variantLabel})` : '';
      text += `— ${item.quantity}x ${item.name}${variantText} → $${(item.price * item.quantity).toLocaleString('es-CO')}%0A`;
    });
    
    text += `%0A💰 *TOTAL: $${total.toLocaleString('es-CO')}*%0A%0A`;
    text += `👤 *Cliente:* ${formData.name}%0A`;
    text += `📱 *Teléfono:* ${formData.phone}%0A`;
    text += `📍 *Tipo:* ${formData.orderType === 'domicilio' ? '🛵 Domicilio' : '🏪 Recoger en el punto'}%0A`;
    if (formData.orderType === 'domicilio' && formData.address) {
      text += `🏠 *Dirección:* ${formData.address}%0A`;
    }
    if (formData.notes) {
      text += `📝 *Observaciones:* ${formData.notes}%0A`;
    }
    text += `%0A¡Gracias! 🙌`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-cream rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 bg-neutral text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">Confirmar Pedido</h2>
                <p className="text-gray-400 text-sm mt-1">Llena tus datos para enviarlo por WhatsApp</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Resumen del pedido */}
              <div className="bg-white p-4 rounded-2xl border border-cream-dark">
                <h3 className="font-bold text-sm text-gray-500 mb-3 uppercase tracking-wider">Resumen</h3>
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-cream last:border-0">
                    <div className="flex flex-col">
                      <span className="text-sm"><strong>{item.quantity}x</strong> {item.name}</span>
                      {item.variantLabel && item.variantLabel !== item.name && (
                        <span className="text-xs text-gray-500 leading-tight">{item.variantLabel}</span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-primary ml-4">${(item.price * item.quantity).toLocaleString('es-CO')}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-neutral">
                  <span className="font-black text-lg">TOTAL</span>
                  <span className="font-black text-xl text-primary">${total.toLocaleString('es-CO')}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral mb-1.5">Tu Nombre</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-cream-dark bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                  placeholder="Ej. Juan Pérez" />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral mb-1.5">Teléfono</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-cream-dark bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                  placeholder="Ej. 310 123 4567" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-neutral mb-1.5">Tipo de Pedido</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData({...formData, orderType: 'recoger'})}
                    className={`py-3.5 rounded-xl font-bold border-2 transition-all ${formData.orderType === 'recoger' ? 'border-primary bg-primary/10 text-primary' : 'border-cream-dark bg-white text-gray-500 hover:border-gray-300'}`}>
                    🏪 Recoger
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, orderType: 'domicilio'})}
                    className={`py-3.5 rounded-xl font-bold border-2 transition-all ${formData.orderType === 'domicilio' ? 'border-primary bg-primary/10 text-primary' : 'border-cream-dark bg-white text-gray-500 hover:border-gray-300'}`}>
                    🛵 Domicilio
                  </button>
                </div>
              </div>

              {formData.orderType === 'domicilio' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-sm font-bold text-neutral mb-1.5">Dirección de Entrega</label>
                  <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-cream-dark bg-white focus:ring-2 focus:ring-primary outline-none font-medium"
                    placeholder="Ej. Calle 123 #45-67, Barrio..." />
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-bold text-neutral mb-1.5">Observaciones <span className="text-gray-400 font-normal">(Opcional)</span></label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows="2"
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-cream-dark bg-white focus:ring-2 focus:ring-primary outline-none resize-none font-medium"
                  placeholder="Sin cebolla, extra queso..." />
              </div>
              
              <button type="submit" className="w-full bg-[#25D366] hover:bg-[#1ead55] text-white font-black py-4 rounded-full flex items-center justify-center gap-3 transition-all text-lg shadow-lg hover:scale-[1.02] mt-4">
                <Send className="w-5 h-5" />
                Confirmar y Enviar por WhatsApp
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
