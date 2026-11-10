import { Order, OrderStatus, Perfume, User } from './models';

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString();

export const SEED_PRODUCTS: Perfume[] = [
  { id: 1, name: 'Rose Éternelle', brand: 'Maison Lumière', description: 'A luminous bouquet of Damask rose wrapped in soft musk and a whisper of lychee. Romantic, radiant and timeless.', price: 128, oldPrice: 150, stock: 24, volumeMl: 100, gender: 'Women', family: 'Floral', concentration: 'EDP', topNotes: ['Lychee', 'Pink pepper'], heartNotes: ['Damask rose', 'Peony'], baseNotes: ['White musk', 'Cedar'], color: '#f9a8d4', rating: 4.8, reviews: 214, images: [], featured: true, createdAt: d(120) },
  { id: 2, name: 'Noir Absolu', brand: 'Atelier Noir', description: 'Smoky oud and leather meet dark vanilla in this nocturnal signature. Bold, magnetic and long-lasting.', price: 185, stock: 12, volumeMl: 75, gender: 'Men', family: 'Oriental', concentration: 'Parfum', topNotes: ['Saffron', 'Black pepper'], heartNotes: ['Leather', 'Oud'], baseNotes: ['Vanilla', 'Amber'], color: '#44403c', rating: 4.9, reviews: 167, images: [], featured: true, createdAt: d(200) },
  { id: 3, name: 'Sel Marin', brand: 'Côte Sauvage', description: 'Salty sea breeze, sun-warmed driftwood and crushed sage. The scent of an endless summer on the Atlantic coast.', price: 96, stock: 40, volumeMl: 100, gender: 'Unisex', family: 'Fresh', concentration: 'EDT', topNotes: ['Sea salt', 'Bergamot'], heartNotes: ['Sage', 'Seaweed'], baseNotes: ['Driftwood', 'Ambergris'], color: '#7dd3fc', rating: 4.6, reviews: 302, images: [], featured: true, createdAt: d(90) },
  { id: 4, name: 'Santal Velours', brand: 'Velours & Co', description: 'Creamy Mysore sandalwood softened with cardamom and iris. A velvety skin scent that lingers all day.', price: 142, stock: 18, volumeMl: 100, gender: 'Unisex', family: 'Woody', concentration: 'EDP', topNotes: ['Cardamom', 'Violet leaf'], heartNotes: ['Iris', 'Papyrus'], baseNotes: ['Sandalwood', 'Leather'], color: '#d6b38a', rating: 4.7, reviews: 189, images: [], featured: true, createdAt: d(60) },
  { id: 5, name: 'Agrumi di Sole', brand: 'Côte Sauvage', description: 'Sparkling Sicilian lemon, mandarin and neroli over a clean vetiver base. Pure Mediterranean sunshine.', price: 78, oldPrice: 92, stock: 55, volumeMl: 100, gender: 'Unisex', family: 'Citrus', concentration: 'Cologne', topNotes: ['Lemon', 'Mandarin'], heartNotes: ['Neroli', 'Petitgrain'], baseNotes: ['Vetiver', 'Musk'], color: '#fde047', rating: 4.4, reviews: 98, images: [], featured: false, createdAt: d(30) },
  { id: 6, name: 'Vanille Gourmande', brand: 'Maison Lumière', description: 'Bourbon vanilla, salted caramel and tonka bean. An addictive gourmand that feels like a warm embrace.', price: 115, stock: 6, volumeMl: 50, gender: 'Women', family: 'Gourmand', concentration: 'EDP', topNotes: ['Pear', 'Bitter almond'], heartNotes: ['Salted caramel', 'Jasmine'], baseNotes: ['Bourbon vanilla', 'Tonka'], color: '#fcd9a8', rating: 4.8, reviews: 256, images: [], featured: true, createdAt: d(15) },
  { id: 7, name: 'Cèdre Impérial', brand: 'Atelier Noir', description: 'Atlas cedar and juniper with a crisp grapefruit opening. Refined, confident and effortlessly elegant.', price: 132, stock: 22, volumeMl: 100, gender: 'Men', family: 'Woody', concentration: 'EDP', topNotes: ['Grapefruit', 'Juniper'], heartNotes: ['Geranium', 'Clary sage'], baseNotes: ['Atlas cedar', 'Patchouli'], color: '#86a37a', rating: 4.5, reviews: 143, images: [], featured: false, createdAt: d(150) },
  { id: 8, name: 'Jardin de Nuit', brand: 'Velours & Co', description: 'Night-blooming tuberose and jasmine sambac under a moonlit sky. Sensual white florals with a creamy heart.', price: 156, stock: 9, volumeMl: 75, gender: 'Women', family: 'Floral', concentration: 'Parfum', topNotes: ['Green mandarin', 'Ylang-ylang'], heartNotes: ['Tuberose', 'Jasmine sambac'], baseNotes: ['Benzoin', 'Sandalwood'], color: '#e9d5ff', rating: 4.7, reviews: 121, images: [], featured: false, createdAt: d(45) },
  { id: 9, name: 'Oud Royale', brand: 'Dar Al Oud', description: 'Precious Cambodian oud, Taif rose and incense. An opulent oriental crafted for unforgettable evenings.', price: 240, stock: 5, volumeMl: 50, gender: 'Unisex', family: 'Oriental', concentration: 'Parfum', topNotes: ['Saffron', 'Raspberry'], heartNotes: ['Taif rose', 'Incense'], baseNotes: ['Cambodian oud', 'Amber'], color: '#9f1239', rating: 4.9, reviews: 88, images: [], featured: true, createdAt: d(10) },
  { id: 10, name: 'Brise Verte', brand: 'Côte Sauvage', description: 'Freshly cut grass, green tea and fig leaves. A crisp, energising green scent for everyday wear.', price: 72, stock: 33, volumeMl: 100, gender: 'Unisex', family: 'Fresh', concentration: 'EDT', topNotes: ['Green tea', 'Lime'], heartNotes: ['Fig leaf', 'Cut grass'], baseNotes: ['Oakmoss', 'Musk'], color: '#a7f3d0', rating: 4.3, reviews: 76, images: [], featured: false, createdAt: d(70) },
  { id: 11, name: 'Ambre Doré', brand: 'Dar Al Oud', description: 'Golden amber, labdanum and cinnamon glowing over warm benzoin. A cosy, resinous classic.', price: 118, stock: 27, volumeMl: 100, gender: 'Men', family: 'Oriental', concentration: 'EDP', topNotes: ['Cinnamon', 'Orange'], heartNotes: ['Labdanum', 'Clove'], baseNotes: ['Amber', 'Benzoin'], color: '#f59e0b', rating: 4.6, reviews: 132, images: [], featured: false, createdAt: d(110) },
  { id: 12, name: 'Pivoine Poudrée', brand: 'Maison Lumière', description: 'Powdery peony and magnolia with a soft suede finish. Delicate, airy and endlessly feminine.', price: 98, stock: 0, volumeMl: 50, gender: 'Women', family: 'Floral', concentration: 'EDT', topNotes: ['Red berries', 'Bergamot'], heartNotes: ['Peony', 'Magnolia'], baseNotes: ['Suede', 'Musk'], color: '#fecdd3', rating: 4.5, reviews: 110, images: [], featured: false, createdAt: d(25) },
  { id: 13, name: 'Vétiver Fumé', brand: 'Atelier Noir', description: 'Haitian vetiver smoked with birch tar and black tea. Dry, earthy and quietly sophisticated.', price: 138, stock: 14, volumeMl: 100, gender: 'Men', family: 'Woody', concentration: 'EDP', topNotes: ['Black tea', 'Bergamot'], heartNotes: ['Vetiver', 'Birch'], baseNotes: ['Smoke', 'Cashmeran'], color: '#78716c', rating: 4.4, reviews: 64, images: [], featured: false, createdAt: d(80) },
  { id: 14, name: 'Néroli Blanc', brand: 'Velours & Co', description: 'Orange blossom, neroli and white tea. Clean, bright and serene — like fresh linen in the sun.', price: 105, stock: 31, volumeMl: 100, gender: 'Unisex', family: 'Citrus', concentration: 'EDP', topNotes: ['Neroli', 'Bitter orange'], heartNotes: ['Orange blossom', 'White tea'], baseNotes: ['Musk', 'Ambrette'], color: '#fef3c7', rating: 4.6, reviews: 92, images: [], featured: false, createdAt: d(5) },
  { id: 15, name: 'Cacao Noir', brand: 'Dar Al Oud', description: 'Dark cocoa, coffee and patchouli on a bed of smoky vanilla. A daring gourmand for the bold.', price: 124, oldPrice: 140, stock: 16, volumeMl: 75, gender: 'Men', family: 'Gourmand', concentration: 'EDP', topNotes: ['Coffee', 'Pink pepper'], heartNotes: ['Dark cocoa', 'Iris'], baseNotes: ['Patchouli', 'Vanilla'], color: '#7c2d12', rating: 4.7, reviews: 71, images: [], featured: false, createdAt: d(35) },
  { id: 16, name: 'Lavande Sauvage', brand: 'Côte Sauvage', description: 'Wild Provençal lavender, rosemary and a soft tonka base. Aromatic, calming and fresh.', price: 84, stock: 3, volumeMl: 100, gender: 'Unisex', family: 'Fresh', concentration: 'EDT', topNotes: ['Rosemary', 'Lemon'], heartNotes: ['Lavender', 'Thyme'], baseNotes: ['Tonka', 'Cedar'], color: '#c4b5fd', rating: 4.5, reviews: 58, images: [], featured: false, createdAt: d(55) },
];

export const SEED_USERS: User[] = [
  { id: 1, name: 'Admin Essence', email: 'admin@essence.shop', password: 'admin123', role: 'admin', createdAt: d(365) },
  { id: 2, name: 'Clara Martin', email: 'client@essence.shop', password: 'client123', role: 'client', phone: '+1 555 0102', createdAt: d(240) },
  { id: 3, name: 'Lucas Bernard', email: 'lucas@example.com', password: 'secret123', role: 'client', phone: '+1 555 0103', createdAt: d(180) },
  { id: 4, name: 'Sofia Rossi', email: 'sofia@example.com', password: 'secret123', role: 'client', phone: '+1 555 0104', createdAt: d(150) },
  { id: 5, name: 'Omar Haddad', email: 'omar@example.com', password: 'secret123', role: 'client', phone: '+1 555 0105', createdAt: d(90) },
  { id: 6, name: 'Emma Wilson', email: 'emma@example.com', password: 'secret123', role: 'client', phone: '+1 555 0106', createdAt: d(40) },
];

function makeOrder(n: number, userId: number, daysAgo: number, status: OrderStatus, lines: [number, number][]): Order {
  const user = SEED_USERS.find((u) => u.id === userId)!;
  const items = lines.map(([pid, qty]) => {
    const p = SEED_PRODUCTS.find((x) => x.id === pid)!;
    return { productId: p.id, name: p.name, brand: p.brand, color: p.color, price: p.price, qty };
  });
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 150 ? 0 : 9.9;
  return {
    id: `ES-${String(1000 + n)}`,
    userId,
    customerName: user.name,
    email: user.email,
    items,
    subtotal,
    shipping,
    total: +(subtotal + shipping).toFixed(2),
    status,
    payment: n % 3 === 0 ? 'Cash on delivery' : 'Card',
    shippingInfo: { fullName: user.name, phone: user.phone ?? '', address: `${10 + n} Rue des Fleurs`, city: 'Paris', zip: '75001', country: 'France' },
    createdAt: d(daysAgo),
  };
}

export const SEED_ORDERS: Order[] = [
  makeOrder(1, 2, 170, 'Delivered', [[1, 1], [5, 1]]),
  makeOrder(2, 3, 150, 'Delivered', [[2, 1]]),
  makeOrder(3, 4, 132, 'Delivered', [[4, 1], [8, 1]]),
  makeOrder(4, 2, 110, 'Delivered', [[6, 2]]),
  makeOrder(5, 5, 95, 'Cancelled', [[9, 1]]),
  makeOrder(6, 3, 80, 'Delivered', [[7, 1], [3, 1]]),
  makeOrder(7, 6, 62, 'Delivered', [[3, 2]]),
  makeOrder(8, 4, 45, 'Delivered', [[11, 1], [14, 1]]),
  makeOrder(9, 5, 30, 'Shipped', [[2, 1], [15, 1]]),
  makeOrder(10, 2, 18, 'Shipped', [[9, 1]]),
  makeOrder(11, 6, 8, 'Processing', [[1, 1], [6, 1]]),
  makeOrder(12, 3, 3, 'Pending', [[4, 1]]),
  makeOrder(13, 4, 1, 'Pending', [[10, 1], [5, 2]]),
];
