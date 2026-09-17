// ═══════════════════════════════════════════════════
// DATOS REALES - COMIDAS RÁPIDAS TRUCCO
// Carta oficial con precios reales
// WhatsApp: 3171922866
// ═══════════════════════════════════════════════════

export const WHATSAPP_NUMBER = "573171922866";

export const categories = [
  "Todos",
  "Perros Calientes",
  "Hamburguesas",
  "Salchipapas",
  "Burritos",
  "Picadas",
  "Patacones",
  "Mega Picada",
];

export const products = [
  // ═══ PERROS CALIENTES ═══ (¡Todos llevan tocineta!)
  {
    id: 1,
    name: "Perro Sencillo",
    description: "Perro caliente con tocineta, ripio de papa, queso y salsas de la casa.",
    category: "Perros Calientes",
    image: "/images/perro-caliente.jpeg",
    variants: [
      { label: "Perro Sencillo", price: 9000 },
    ],
  },
  {
    id: 2,
    name: "Perro Ranchero",
    description: "Perro caliente ranchero con tocineta, queso fundido y salsas especiales.",
    category: "Perros Calientes",
    image: "/images/perro-caliente.jpeg",
    variants: [
      { label: "Perro Ranchero", price: 18000 },
    ],
  },
  {
    id: 3,
    name: "Perro Suizo",
    description: "Perro caliente suizo con tocineta, queso suizo gratinado y salsas.",
    category: "Perros Calientes",
    image: "/images/perro-caliente.jpeg",
    variants: [
      { label: "Perro Suizo", price: 23000 },
    ],
  },
  {
    id: 4,
    name: "Perro Mixto",
    description: "Perro caliente mixto con tocineta, mezcla de carnes y salsas de la casa.",
    category: "Perros Calientes",
    image: "/images/perro-caliente.jpeg",
    variants: [
      { label: "Perro Mixto", price: 20000 },
    ],
  },
  {
    id: 5,
    name: "Perro Chori Perro",
    description: "Perro caliente con chorizo, tocineta y salsas especiales.",
    category: "Perros Calientes",
    image: "/images/perro-caliente.jpeg",
    variants: [
      { label: "Perro Chori Perro", price: 20000 },
    ],
  },
  {
    id: 6,
    name: "Perro Americano",
    description: "Perro caliente americano con tocineta, queso cheddar y salsas.",
    category: "Perros Calientes",
    image: "/images/perro-caliente.jpeg",
    variants: [
      { label: "Perro Americano", price: 18000 },
    ],
  },
  {
    id: 7,
    name: "Perro Todas las Carnes (Especial)",
    description: "¡El más cargado! Perro con todas las carnes, tocineta y salsas de la casa.",
    category: "Perros Calientes",
    image: "/images/perro-caliente.jpeg",
    variants: [
      { label: "Perro Todas las Carnes", price: 28000 },
    ],
  },

  // ═══ HAMBURGUESAS ═══
  {
    id: 8,
    name: "Hamburguesa de Pollo",
    description: "Hamburguesa de pollo jugosa + papas a la francesa.",
    category: "Hamburguesas",
    image: "/images/amburguesas.jpg",
    variants: [
      { label: "Hamburguesa de Pollo + Papas", price: 23000 },
    ],
  },
  {
    id: 9,
    name: "Hamburguesa de Cerdo",
    description: "Hamburguesa de cerdo a la plancha + papas a la francesa.",
    category: "Hamburguesas",
    image: "/images/amburguesas.jpg",
    variants: [
      { label: "Hamburguesa de Cerdo + Papas", price: 22000 },
    ],
  },

  // ═══ SALCHIPAPAS ═══
  {
    id: 10,
    name: "Salchipapas",
    description: "Papas francesas crujientes con salchicha ranchera y salsas.",
    category: "Salchipapas",
    image: "/images/salchipapa.jpg",
    variants: [
      { label: "Salchipapas Sencilla", price: 15000 },
    ],
  },
  {
    id: 11,
    name: "Chori Papa",
    description: "Papas francesas con chorizo y salsas de la casa.",
    category: "Salchipapas",
    image: "/images/salchipapa.jpg",
    variants: [
      { label: "Chori Papa", price: 20000 },
    ],
  },
  {
    id: 12,
    name: "Salchipapas Suiza",
    description: "Papas francesas con salchicha y queso suizo gratinado.",
    category: "Salchipapas",
    image: "/images/salchipapa.jpg",
    variants: [
      { label: "Salchipapas Suiza (chorizo + suiza)", price: 22000 },
      { label: "Salchipapas Suiza Especial", price: 25000 },
    ],
  },

  // ═══ BURRITOS ═══
  {
    id: 13,
    name: "Burrito de Pollo",
    description: "Burrito relleno de pollo, queso, vegetales y salsas.",
    category: "Burritos",
    image: "/images/burritos.jpeg",
    variants: [
      { label: "Burrito de Pollo", price: 24000 },
    ],
  },
  {
    id: 14,
    name: "Burrito de Cerdo",
    description: "Burrito relleno de cerdo a la plancha, queso y salsas.",
    category: "Burritos",
    image: "/images/burritos.jpeg",
    variants: [
      { label: "Burrito de Cerdo", price: 22000 },
    ],
  },
  {
    id: 15,
    name: "Burrito de Carne",
    description: "Burrito relleno de carne de res, queso, vegetales y salsas.",
    category: "Burritos",
    image: "/images/burritos.jpeg",
    variants: [
      { label: "Burrito de Carne", price: 25000 },
    ],
  },
  {
    id: 16,
    name: "Burrito Especial Todas las Carnes",
    description: "¡El más completo! Burrito con todas las carnes, queso y salsas.",
    category: "Burritos",
    image: "/images/burritos.jpeg",
    variants: [
      { label: "Burrito Especial Todas las Carnes", price: 28000 },
    ],
  },

  // ═══ PICADAS ═══
  {
    id: 17,
    name: "Picada",
    description: "Picada con carnes, papas, salsas y acompañamientos de la casa.",
    category: "Picadas",
    image: "/images/picadas.jpg",
    variants: [
      { label: "Picada Sencilla (1 persona)", price: 25000 },
      { label: "Picada para 2 personas", price: 35000 },
      { label: "Picada para 3 personas", price: 50000 },
    ],
  },

  // ═══ PATACONES ═══
  {
    id: 18,
    name: "Patacón Especial",
    description: "Patacón cargado con carne, pollo o cerdo, queso y salsas.",
    category: "Patacones",
    image: "/images/picadas.jpg",
    variants: [
      { label: "Patacón Especial (carne, pollo o cerdo)", price: 25000 },
      { label: "Patacón Sencillo (pollo o cerdo)", price: 20000 },
    ],
  },

  // ═══ MEGA PICADA ═══
  {
    id: 19,
    name: "Mega Picada para 6 Personas",
    description: "Carne, pollo, butifarra, chorizo, papas a la francesa, salchichón cervecero, zumu, patacón y salsa de la casa. ¡Un sabor que lo tiene todo!",
    category: "Mega Picada",
    image: "/images/picadas.jpg",
    variants: [
      { label: "Mega Picada (6 personas)", price: 100000 },
    ],
  },
];
