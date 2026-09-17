import { useState } from 'react';
import { ShoppingCart, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCard({ product, onAdd }) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isVariantOpen, setIsVariantOpen] = useState(false);
  const hasMultipleVariants = product.variants && product.variants.length > 1;

  const currentVariant = product.variants ? product.variants[selectedVariant] : { label: product.name, price: 0 };

  const handleAdd = () => {
    onAdd({
      ...product,
      selectedVariant: currentVariant,
      price: currentVariant.price,
      variantLabel: currentVariant.label,
    });
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-shadow duration-300 flex flex-col border border-cream-dark relative z-10 hover:z-20 h-full justify-between overflow-visible"
    >
      {/* Contenedor de Imagen de tamaño uniforme y controlado */}
      <div className="relative h-52 w-full overflow-hidden bg-cream-dark/20 rounded-t-3xl flex items-center justify-center shrink-0">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 bg-secondary text-neutral text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md z-10">
          {product.category}
        </div>
      </div>
      
      {/* Contenido con alturas estandarizadas para alineación perfecta */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Nombre con altura fija para 1 o 2 líneas */}
          <h4 className="text-lg font-extrabold text-neutral leading-snug mb-1.5 min-h-[3rem] flex items-center">
            {product.name}
          </h4>
          
          {/* Descripción estandarizada */}
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
            {product.description}
          </p>
        </div>
        
        <div>
          {/* Zona de precio / selector de variantes con altura uniforme (h-14) */}
          <div className="h-14 mb-4 relative flex items-center">
            {hasMultipleVariants ? (
              <div className="w-full relative">
                <button
                  type="button"
                  onClick={() => setIsVariantOpen(!isVariantOpen)}
                  className="w-full flex items-center justify-between bg-cream border-2 border-cream-dark rounded-xl px-4 py-2.5 font-bold text-sm text-neutral hover:border-primary transition-colors"
                >
                  <span className="truncate mr-2">{currentVariant.label}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-primary font-black">${currentVariant.price.toLocaleString('es-CO')}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isVariantOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {isVariantOpen && (
                  <div className="absolute bottom-full mb-1 left-0 right-0 bg-white border-2 border-cream-dark rounded-xl shadow-2xl z-[70] overflow-hidden max-h-48 overflow-y-auto">
                    {product.variants.map((variant, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setSelectedVariant(i); setIsVariantOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-cream transition-colors text-left ${
                          i === selectedVariant ? 'bg-cream font-bold' : ''
                        }`}
                      >
                        <span className="truncate mr-2">{variant.label}</span>
                        <span className="text-primary font-black shrink-0">${variant.price.toLocaleString('es-CO')}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <span className="text-primary font-black text-2xl">
                  ${currentVariant.price.toLocaleString('es-CO')}
                </span>
              </div>
            )}
          </div>
          
          <button 
            type="button"
            onClick={handleAdd}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-5 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-primary/20"
          >
            <ShoppingCart className="w-4 h-4" />
            Agregar al Pedido
          </button>
        </div>
      </div>
    </motion.div>
  );
}
