import { useState, useEffect } from 'react';
import { X, Send, CheckCircle, ShieldAlert, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WHATSAPP_NUMBER } from '../data/products';

const COOLDOWN_SECONDS = 45; // 45 segundos de espera entre pedidos

export default function CheckoutModal({ isOpen, onClose, cart, onConfirmOrder }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    orderType: 'recoger',
    address: '',
    notes: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Comprobar y gestionar el temporizador anti-spam (Rate Limiting)
  useEffect(() => {
    const checkCooldown = () => {
      const lastOrderTime = localStorage.getItem('trucco_last_order_timestamp');
      if (lastOrderTime) {
        const elapsed = Math.floor((Date.now() - parseInt(lastOrderTime, 10)) / 1000);
        if (elapsed < COOLDOWN_SECONDS) {
          setCooldownRemaining(COOLDOWN_SECONDS - elapsed);
        } else {
          setCooldownRemaining(0);
        }
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Verificación de seguridad: Cooldown activo
    if (cooldownRemaining > 0) {
      setErrorMessage(`⚠️ Por favor espera ${cooldownRemaining}s antes de enviar otro pedido.`);
      return;
    }

    // 2. Verificación de seguridad: Evitar múltiples clics simultáneos (Debounce/Lock)
    if (isSubmitting) return;

    // 3. Verificación de carrito vacío
    if (!cart || cart.length === 0) {
      setErrorMessage('El carrito está vacío. Agrega productos para continuar.');
      return;
    }

    // 4. Validaciones estrictas de datos
    const cleanName = formData.name.trim();
    if (cleanName.length < 3) {
      setErrorMessage('Por favor escribe tu nombre completo (mínimo 3 letras).');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Por favor ingresa un número de teléfono válido de 10 dígitos (Ej: 304 304 0067).');
      return;
    }

    if (formData.orderType === 'domicilio') {
      const cleanAddress = formData.address.trim();
      if (cleanAddress.length < 6) {
        setErrorMessage('Por favor ingresa una dirección de entrega completa.');
        return;
      }
    }

    // Bloquear el botón inmediatamente para proteger de spam / spam-clicking
    setIsSubmitting(true);

    try {
      let text = `*¡Hola Trucco!* 👋%0A%0AQuiero realizar el siguiente pedido:%0A%0A`;
      
      text += `🍔 *PRODUCTOS*%0A`;
      cart.forEach(item => {
        const variantText = item.variantLabel && item.variantLabel !== item.name ? ` (${item.variantLabel})` : '';
        text += `— ${item.quantity}x ${item.name}${variantText} → $${(item.price * item.quantity).toLocaleString('es-CO')}%0A`;
      });
      
      text += `%0A💰 *TOTAL: $${total.toLocaleString('es-CO')}*%0A%0A`;
      text += `👤 *Cliente:* ${cleanName}%0A`;
      text += `📱 *Teléfono:* ${cleanPhone}%0A`;
      text += `📍 *Tipo:* ${formData.orderType === 'domicilio' ? '🛵 Domicilio' : '🏪 Recoger en el punto'}%0A`;
      if (formData.orderType === 'domicilio' && formData.address) {
        text += `🏠 *Dirección:* ${formData.address.trim()}%0A`;
      }
      if (formData.notes) {
        text += `📝 *Observaciones:* ${formData.notes.trim()}%0A`;
      }
      text += `%0A¡Gracias! 🙌`;

      // Registrar timestamp en almacenamiento local para anti-spam persistente
      localStorage.setItem('trucco_last_order_timestamp', Date.now().toString());
      setCooldownRemaining(COOLDOWN_SECONDS);

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
      window.open(whatsappUrl, '_blank');
      
      setIsSubmitted(true);
      if (onConfirmOrder) {
        onConfirmOrder(formData);
      }
    } catch (err) {
      setErrorMessage('Ocurrió un error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitted) {
      setIsSubmitted(false);
      setFormData({ name: '', phone: '', orderType: 'recoger', address: '', notes: '' });
    }
    setErrorMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-cream rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 bg-neutral text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">{isSubmitted ? '¡Pedido Enviado!' : 'Confirmar Pedido'}</h2>
                <p className="text-gray-400 text-sm mt-1">{isSubmitted ? 'Tu orden ha sido registrada' : 'Llena tus datos para enviarlo por WhatsApp'}</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {isSubmitted ? (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircle className="w-12 h-12" />
                </motion.div>
                <h3 className="text-2xl font-black text-neutral">¡Todo listo, {formData.name}!</h3>
                <p className="text-gray-500 max-w-sm">
                  Tu pedido ha sido enviado exitosamente y el carrito se ha vaciado. Puedes revisar este pedido en tu historial.
                </p>
                <button 
                  onClick={handleClose}
                  className="mt-6 w-full py-4 rounded-xl font-black text-lg bg-neutral text-white hover:bg-neutral-800 transition-colors"
                >
                  Cerrar y seguir navegando
                </button>
              </div>
            ) : (
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

                {/* Banner de alerta de cooldown / rate-limiting */}
                {cooldownRemaining > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-800">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="block font-bold mb-0.5">Control anti-saturación activo:</strong>
                      Para evitar spam y pedidos duplicados en WhatsApp, por favor espera <strong>{cooldownRemaining}s</strong> antes de enviar un nuevo pedido.
                    </div>
                  </div>
                )}

                {/* Mensaje de error de validación */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-neutral mb-1.5">Tu Nombre</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name} 
                    onChange={e => {
                      setFormData({...formData, name: e.target.value});
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-cream-dark bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                    placeholder="Ej. Juan Pérez" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral mb-1.5">Teléfono (WhatsApp)</label>
                  <input 
                    required 
                    type="tel" 
                    value={formData.phone} 
                    onChange={e => {
                      setFormData({...formData, phone: e.target.value});
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-cream-dark bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                    placeholder="Ej. 304 304 0067" 
                  />
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
                    <input 
                      required 
                      type="text" 
                      value={formData.address} 
                      onChange={e => {
                        setFormData({...formData, address: e.target.value});
                        if (errorMessage) setErrorMessage('');
                      }}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-cream-dark bg-white focus:ring-2 focus:ring-primary outline-none font-medium"
                      placeholder="Ej. Calle 123 #45-67, Barrio..." 
                    />
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-bold text-neutral mb-1.5">Notas adicionales (Opcional)</label>
                  <textarea 
                    value={formData.notes} 
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-cream-dark bg-white focus:ring-2 focus:ring-primary outline-none resize-none font-medium"
                    placeholder="Ej. Sin cebolla, salsas aparte..." rows="2" 
                  />
                </div>

                <button 
                  type="submit"
                  disabled={cooldownRemaining > 0 || isSubmitting}
                  className={`w-full py-4 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg ${
                    cooldownRemaining > 0 || isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                      : 'text-white bg-[#25D366] hover:bg-[#1da851] shadow-green-500/30 active:scale-[0.98]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando pedido...
                    </>
                  ) : cooldownRemaining > 0 ? (
                    <>
                      <ShieldAlert className="w-5 h-5 text-amber-600" />
                      Espera {cooldownRemaining}s para volver a pedir
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Confirmar y Enviar por WhatsApp
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
