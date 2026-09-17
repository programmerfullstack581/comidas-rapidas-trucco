import { useState } from 'react';
import { ShoppingCart, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCard({ product, onAdd }) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isVariantOpen, setIsVariantOpen] = useState(false);
  const hasMultipleVariants = product.variants.length > 1;

  const currentVariant = product.variants[selectedVariant];

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
      className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-shadow duration-300 flex flex-col border border-cream-dark relative z-10 hover:z-20"
    >
      <div className="relative h-52 overflow-hidden bg-cream rounded-t-3xl">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 bg-secondary text-neutral text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
          {product.category}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h4 className="text-lg font-extrabold text-neutral leading-tight mb-1.5">{product.name}</h4>
        <p className="text-gray-500 text-sm mb-4 flex-grow line-clamp-2">{product.description}</p>
        
        {/* Selector de variantes */}
        {hasMultipleVariants ? (
          <div className="mb-4 relative">
            <button
              onClick={() => setIsVariantOpen(!isVariantOpen)}
              className="w-full flex items-center justify-between bg-cream border-2 border-cream-dark rounded-xl px-4 py-3 font-bold text-sm text-neutral hover:border-primary transition-colors"
            >
              <span className="truncate mr-2">{currentVariant.label}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-primary font-black">${currentVariant.price.toLocaleString('es-CO')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isVariantOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            {isVariantOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-cream-dark rounded-xl shadow-xl z-[60] overflow-hidden">
                {product.variants.map((variant, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedVariant(i); setIsVariantOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-cream transition-colors ${
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
          <div className="mb-4">
            <span className="text-primary font-black text-2xl">
              ${currentVariant.price.toLocaleString('es-CO')}
            </span>
          </div>
        )}
        
        <button 
          onClick={handleAdd}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-5 rounded-full transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-md shadow-primary/20"
        >
          <ShoppingCart className="w-4 h-4" />
          Agregar al Pedido
        </button>
      </div>
    </motion.div>
  );
}
