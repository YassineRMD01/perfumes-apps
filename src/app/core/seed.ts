import { Brand, Category, Coupon, Order, OrderStatus, Perfume, Review, User } from './models';

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString();

export const SEED_BRANDS: Brand[] = [
  { id: 1, name: 'Maison Lumière', country: 'France', description: 'Luminous florals and soft musks crafted in Grasse.', logo: null, createdAt: d(400) },
  { id: 2, name: 'Atelier Noir', country: 'France', description: 'Dark, refined woods and leathers for the evening.', logo: null, createdAt: d(390) },
  { id: 3, name: 'Côte Sauvage', country: 'Portugal', description: 'Fresh coastal compositions inspired by the Atlantic.', logo: null, createdAt: d(380) },
  { id: 4, name: 'Velours & Co', country: 'Italy', description: 'Velvety skin scents with an Italian touch.', logo: null, createdAt: d(370) },
  { id: 5, name: 'Dar Al Oud', country: 'United Arab Emirates', description: 'Precious oud, amber and rose from Arabian tradition.', logo: null, createdAt: d(360) },
];

const t = (en: string, fr: string, es: string, ar: string) => ({ en, fr, es, ar });

export const SEED_CATEGORIES: Category[] = [
  { id: 'floral', name: t('Floral', 'Floral', 'Floral', 'زهري'), description: t('Rose, jasmine, peony', 'Rose, jasmin, pivoine', 'Rosa, jazmín, peonía', 'ورد، ياسمين، فاوانيا'), color: '#e9a0b4', createdAt: d(400) },
  { id: 'woody', name: t('Woody', 'Boisé', 'Amaderado', 'خشبي'), description: t('Cedar, sandalwood, vetiver', 'Cèdre, santal, vétiver', 'Cedro, sándalo, vetiver', 'أرز، صندل، نجيل الهند'), color: '#c4a27e', createdAt: d(400) },
  { id: 'oriental', name: t('Oriental', 'Oriental', 'Oriental', 'شرقي'), description: t('Oud, amber, spices', 'Oud, ambre, épices', 'Oud, ámbar, especias', 'عود، عنبر، توابل'), color: '#d9907a', createdAt: d(400) },
  { id: 'fresh', name: t('Fresh', 'Frais', 'Fresco', 'منعش'), description: t('Marine, green, aromatic', 'Marin, vert, aromatique', 'Marino, verde, aromático', 'بحري، أخضر، عطري'), color: '#8cc3c9', createdAt: d(400) },
  { id: 'citrus', name: t('Citrus', 'Hespéridé', 'Cítrico', 'حمضي'), description: t('Lemon, bergamot, neroli', 'Citron, bergamote, néroli', 'Limón, bergamota, neroli', 'ليمون، برغموت، نيرولي'), color: '#e6c86e', createdAt: d(400) },
  { id: 'gourmand', name: t('Gourmand', 'Gourmand', 'Gourmand', 'حلو'), description: t('Vanilla, caramel, cocoa', 'Vanille, caramel, cacao', 'Vainilla, caramelo, cacao', 'فانيليا، كراميل، كاكاو'), color: '#d8a878', createdAt: d(400) },
];

export const SEED_PRODUCTS: Perfume[] = [
  { id: 1, name: 'Rose Éternelle', brandId: 1, description: 'A luminous bouquet of Damask rose wrapped in soft musk and a whisper of lychee. Romantic, radiant and timeless.', price: 128, oldPrice: 150, stock: 24, volumeMl: 100, gender: 'Women', categoryId: 'floral', concentration: 'EDP', topNotes: ['Lychee', 'Pink pepper'], heartNotes: ['Damask rose', 'Peony'], baseNotes: ['White musk', 'Cedar'], longevity: 'Long', seasons: ['Spring', 'Summer'], timeOfDay: 'Day', color: '#f9a8d4', rating: 4.8, reviews: 214, images: [], featured: true, createdAt: d(120) },
  { id: 2, name: 'Noir Absolu', brandId: 2, description: 'Smoky oud and leather meet dark vanilla in this nocturnal signature. Bold, magnetic and long-lasting.', price: 185, stock: 12, volumeMl: 75, gender: 'Men', categoryId: 'oriental', concentration: 'Parfum', topNotes: ['Saffron', 'Black pepper'], heartNotes: ['Leather', 'Oud'], baseNotes: ['Vanilla', 'Amber'], longevity: 'VeryLong', seasons: ['Autumn', 'Winter'], timeOfDay: 'Night', color: '#44403c', rating: 4.9, reviews: 167, images: [], featured: true, createdAt: d(200) },
  { id: 3, name: 'Sel Marin', brandId: 3, description: 'Salty sea breeze, sun-warmed driftwood and crushed sage. The scent of an endless summer on the Atlantic coast.', price: 96, stock: 40, volumeMl: 100, gender: 'Unisex', categoryId: 'fresh', concentration: 'EDT', topNotes: ['Sea salt', 'Bergamot'], heartNotes: ['Sage', 'Seaweed'], baseNotes: ['Driftwood', 'Ambergris'], longevity: 'Moderate', seasons: ['Spring', 'Summer'], timeOfDay: 'Day', color: '#7dd3fc', rating: 4.6, reviews: 302, images: [], featured: true, createdAt: d(90) },
  { id: 4, name: 'Santal Velours', brandId: 4, description: 'Creamy Mysore sandalwood softened with cardamom and iris. A velvety skin scent that lingers all day.', price: 142, stock: 18, volumeMl: 100, gender: 'Unisex', categoryId: 'woody', concentration: 'EDP', topNotes: ['Cardamom', 'Violet leaf'], heartNotes: ['Iris', 'Papyrus'], baseNotes: ['Sandalwood', 'Leather'], longevity: 'Long', seasons: ['Spring', 'Autumn', 'Winter'], timeOfDay: 'Both', color: '#d6b38a', rating: 4.7, reviews: 189, images: [], featured: true, createdAt: d(60) },
  { id: 5, name: 'Agrumi di Sole', brandId: 3, description: 'Sparkling Sicilian lemon, mandarin and neroli over a clean vetiver base. Pure Mediterranean sunshine.', price: 78, oldPrice: 92, stock: 55, volumeMl: 100, gender: 'Unisex', categoryId: 'citrus', concentration: 'Cologne', topNotes: ['Lemon', 'Mandarin'], heartNotes: ['Neroli', 'Petitgrain'], baseNotes: ['Vetiver', 'Musk'], longevity: 'Light', seasons: ['Spring', 'Summer'], timeOfDay: 'Day', color: '#fde047', rating: 4.4, reviews: 98, images: [], featured: false, createdAt: d(30) },
  { id: 6, name: 'Vanille Gourmande', brandId: 1, description: 'Bourbon vanilla, salted caramel and tonka bean. An addictive gourmand that feels like a warm embrace.', price: 115, stock: 6, volumeMl: 50, gender: 'Women', categoryId: 'gourmand', concentration: 'EDP', topNotes: ['Pear', 'Bitter almond'], heartNotes: ['Salted caramel', 'Jasmine'], baseNotes: ['Bourbon vanilla', 'Tonka'], longevity: 'Long', seasons: ['Autumn', 'Winter'], timeOfDay: 'Night', color: '#fcd9a8', rating: 4.8, reviews: 256, images: [], featured: true, createdAt: d(15) },
  { id: 7, name: 'Cèdre Impérial', brandId: 2, description: 'Atlas cedar and juniper with a crisp grapefruit opening. Refined, confident and effortlessly elegant.', price: 132, stock: 22, volumeMl: 100, gender: 'Men', categoryId: 'woody', concentration: 'EDP', topNotes: ['Grapefruit', 'Juniper'], heartNotes: ['Geranium', 'Clary sage'], baseNotes: ['Atlas cedar', 'Patchouli'], longevity: 'Long', seasons: ['Spring', 'Autumn'], timeOfDay: 'Both', color: '#86a37a', rating: 4.5, reviews: 143, images: [], featured: false, createdAt: d(150) },
  { id: 8, name: 'Jardin de Nuit', brandId: 4, description: 'Night-blooming tuberose and jasmine sambac under a moonlit sky. Sensual white florals with a creamy heart.', price: 156, stock: 9, volumeMl: 75, gender: 'Women', categoryId: 'floral', concentration: 'Parfum', topNotes: ['Green mandarin', 'Ylang-ylang'], heartNotes: ['Tuberose', 'Jasmine sambac'], baseNotes: ['Benzoin', 'Sandalwood'], longevity: 'Long', seasons: ['Spring', 'Summer'], timeOfDay: 'Night', color: '#e9d5ff', rating: 4.7, reviews: 121, images: [], featured: false, createdAt: d(45) },
  { id: 9, name: 'Oud Royale', brandId: 5, description: 'Precious Cambodian oud, Taif rose and incense. An opulent oriental crafted for unforgettable evenings.', price: 240, stock: 5, volumeMl: 50, gender: 'Unisex', categoryId: 'oriental', concentration: 'Parfum', topNotes: ['Saffron', 'Raspberry'], heartNotes: ['Taif rose', 'Incense'], baseNotes: ['Cambodian oud', 'Amber'], longevity: 'VeryLong', seasons: ['Autumn', 'Winter'], timeOfDay: 'Night', color: '#9f1239', rating: 4.9, reviews: 88, images: [], featured: true, createdAt: d(10) },
  { id: 10, name: 'Brise Verte', brandId: 3, description: 'Freshly cut grass, green tea and fig leaves. A crisp, energising green scent for everyday wear.', price: 72, stock: 33, volumeMl: 100, gender: 'Unisex', categoryId: 'fresh', concentration: 'EDT', topNotes: ['Green tea', 'Lime'], heartNotes: ['Fig leaf', 'Cut grass'], baseNotes: ['Oakmoss', 'Musk'], longevity: 'Light', seasons: ['Spring', 'Summer'], timeOfDay: 'Day', color: '#a7f3d0', rating: 4.3, reviews: 76, images: [], featured: false, createdAt: d(70) },
  { id: 11, name: 'Ambre Doré', brandId: 5, description: 'Golden amber, labdanum and cinnamon glowing over warm benzoin. A cosy, resinous classic.', price: 118, stock: 27, volumeMl: 100, gender: 'Men', categoryId: 'oriental', concentration: 'EDP', topNotes: ['Cinnamon', 'Orange'], heartNotes: ['Labdanum', 'Clove'], baseNotes: ['Amber', 'Benzoin'], longevity: 'VeryLong', seasons: ['Autumn', 'Winter'], timeOfDay: 'Night', color: '#f59e0b', rating: 4.6, reviews: 132, images: [], featured: false, createdAt: d(110) },
  { id: 12, name: 'Pivoine Poudrée', brandId: 1, description: 'Powdery peony and magnolia with a soft suede finish. Delicate, airy and endlessly feminine.', price: 98, stock: 0, volumeMl: 50, gender: 'Women', categoryId: 'floral', concentration: 'EDT', topNotes: ['Red berries', 'Bergamot'], heartNotes: ['Peony', 'Magnolia'], baseNotes: ['Suede', 'Musk'], longevity: 'Moderate', seasons: ['Spring'], timeOfDay: 'Day', color: '#fecdd3', rating: 4.5, reviews: 110, images: [], featured: false, createdAt: d(25) },
  { id: 13, name: 'Vétiver Fumé', brandId: 2, description: 'Haitian vetiver smoked with birch tar and black tea. Dry, earthy and quietly sophisticated.', price: 138, stock: 14, volumeMl: 100, gender: 'Men', categoryId: 'woody', concentration: 'EDP', topNotes: ['Black tea', 'Bergamot'], heartNotes: ['Vetiver', 'Birch'], baseNotes: ['Smoke', 'Cashmeran'], longevity: 'Long', seasons: ['Autumn', 'Winter'], timeOfDay: 'Both', color: '#78716c', rating: 4.4, reviews: 64, images: [], featured: false, createdAt: d(80) },
  { id: 14, name: 'Néroli Blanc', brandId: 4, description: 'Orange blossom, neroli and white tea. Clean, bright and serene — like fresh linen in the sun.', price: 105, stock: 31, volumeMl: 100, gender: 'Unisex', categoryId: 'citrus', concentration: 'EDP', topNotes: ['Neroli', 'Bitter orange'], heartNotes: ['Orange blossom', 'White tea'], baseNotes: ['Musk', 'Ambrette'], longevity: 'Moderate', seasons: ['Spring', 'Summer'], timeOfDay: 'Day', color: '#fef3c7', rating: 4.6, reviews: 92, images: [], featured: false, createdAt: d(5) },
  { id: 15, name: 'Cacao Noir', brandId: 5, description: 'Dark cocoa, coffee and patchouli on a bed of smoky vanilla. A daring gourmand for the bold.', price: 124, oldPrice: 140, stock: 16, volumeMl: 75, gender: 'Men', categoryId: 'gourmand', concentration: 'EDP', topNotes: ['Coffee', 'Pink pepper'], heartNotes: ['Dark cocoa', 'Iris'], baseNotes: ['Patchouli', 'Vanilla'], longevity: 'VeryLong', seasons: ['Autumn', 'Winter'], timeOfDay: 'Night', color: '#7c2d12', rating: 4.7, reviews: 71, images: [], featured: false, createdAt: d(35) },
  { id: 16, name: 'Lavande Sauvage', brandId: 3, description: 'Wild Provençal lavender, rosemary and a soft tonka base. Aromatic, calming and fresh.', price: 84, stock: 3, volumeMl: 100, gender: 'Unisex', categoryId: 'fresh', concentration: 'EDT', topNotes: ['Rosemary', 'Lemon'], heartNotes: ['Lavender', 'Thyme'], baseNotes: ['Tonka', 'Cedar'], longevity: 'Moderate', seasons: ['Spring', 'Summer', 'Autumn'], timeOfDay: 'Both', color: '#c4b5fd', rating: 4.5, reviews: 58, images: [], featured: false, createdAt: d(55) },
];

export const SEED_USERS: User[] = [
  { id: 1, name: 'Admin Lumora', email: 'admin@lumora.shop', password: 'admin123', role: 'admin', createdAt: d(365) },
  { id: 2, name: 'Clara Martin', email: 'client@lumora.shop', password: 'client123', role: 'client', phone: '+1 555 0102', createdAt: d(240) },
  { id: 3, name: 'Lucas Bernard', email: 'lucas@example.com', password: 'secret123', role: 'client', phone: '+1 555 0103', createdAt: d(180) },
  { id: 4, name: 'Sofia Rossi', email: 'sofia@example.com', password: 'secret123', role: 'client', phone: '+1 555 0104', createdAt: d(150) },
  { id: 5, name: 'Omar Haddad', email: 'omar@example.com', password: 'secret123', role: 'client', phone: '+1 555 0105', createdAt: d(90) },
  { id: 6, name: 'Emma Wilson', email: 'emma@example.com', password: 'secret123', role: 'client', phone: '+1 555 0106', createdAt: d(40) },
];

function makeOrder(n: number, userId: number, daysAgo: number, status: OrderStatus, lines: [number, number][]): Order {
  const user = SEED_USERS.find((u) => u.id === userId)!;
  const items = lines.map(([pid, qty]) => {
    const p = SEED_PRODUCTS.find((x) => x.id === pid)!;
    const brand = SEED_BRANDS.find((b) => b.id === p.brandId)!.name;
    return { productId: p.id, name: p.name, brand, color: p.color, price: p.price, qty };
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

export const SEED_REVIEWS: Review[] = [
  { id: 1, productId: 1, userId: 2, userName: 'Clara Martin', rating: 5, comment: 'Exactly the fresh rose I was looking for. Compliments every time I wear it.', createdAt: d(160) },
  { id: 2, productId: 2, userId: 3, userName: 'Lucas Bernard', rating: 5, comment: 'Deep, smoky and elegant. Lasts all night — two sprays are enough.', createdAt: d(140) },
  { id: 3, productId: 4, userId: 4, userName: 'Sofia Rossi', rating: 4, comment: 'Creamy and cosy sandalwood. I wish the projection was a little stronger.', createdAt: d(120) },
  { id: 4, productId: 8, userId: 4, userName: 'Sofia Rossi', rating: 5, comment: 'A gorgeous white floral for evenings out.', createdAt: d(118) },
  { id: 5, productId: 6, userId: 2, userName: 'Clara Martin', rating: 5, comment: 'Smells like warm caramel and vanilla. My winter signature.', createdAt: d(100) },
  { id: 6, productId: 3, userId: 6, userName: 'Emma Wilson', rating: 4, comment: 'So fresh and salty, perfect for summer days at the beach.', createdAt: d(55) },
  { id: 7, productId: 7, userId: 3, userName: 'Lucas Bernard', rating: 4, comment: 'Clean cedar, great for the office.', createdAt: d(70) },
  { id: 8, productId: 11, userId: 4, userName: 'Sofia Rossi', rating: 5, comment: 'Rich amber that lasts from morning until bedtime.', createdAt: d(40) },
];

export const SEED_COUPONS: Coupon[] = [
  { code: 'WELCOME10', type: 'percent', value: 10, minSubtotal: 0, active: true, expiresAt: null, uses: 4, createdAt: d(200) },
  { code: 'LUMORA20', type: 'fixed', value: 20, minSubtotal: 150, active: true, expiresAt: null, uses: 2, createdAt: d(90) },
  { code: 'SUMMER15', type: 'percent', value: 15, minSubtotal: 80, active: false, expiresAt: new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10), uses: 11, createdAt: d(150) },
];
