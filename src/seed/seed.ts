import 'reflect-metadata';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

// ─── Enums ───────────────────────────────────────────────────────────────────

enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CUSTOMER = 'customer',
}

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: Object.values(Role), default: Role.CUSTOMER },
    status: { type: String, required: true, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: 'users' },
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    picture: { type: String, default: '' },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    stock: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    status: { type: String, required: true, enum: Object.values(ProductStatus), default: ProductStatus.ACTIVE },
    tags: { type: [String], default: [] },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: 'products' },
);

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    picture: { type: String, default: '' },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, unique: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, required: true, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: 'orders' },
);

// ─── Models ───────────────────────────────────────────────────────────────────

const UserModel = mongoose.model('User', UserSchema);
const ProductModel = mongoose.model('Product', ProductSchema);
const OrderModel = mongoose.model('Order', OrderSchema);

// ─── Data ─────────────────────────────────────────────────────────────────────

const CUSTOMER_USERS = [
  { name: 'Alice Johnson', email: 'alice.johnson@example.com' },
  { name: 'Bob Martinez', email: 'bob.martinez@example.com' },
  { name: 'Carol Williams', email: 'carol.williams@example.com' },
  { name: 'David Chen', email: 'david.chen@example.com' },
  { name: 'Eva Rodriguez', email: 'eva.rodriguez@example.com' },
];

interface ProductSeed {
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  tags: string[];
}

const PRODUCTS: ProductSeed[] = [
  // Smartphones (5)
  { name: 'iPhone 15 Pro', sku: 'SPH-001', description: 'Apple iPhone 15 Pro with A17 Pro chip and titanium design', price: 999.99, stock: 50, category: 'Smartphones', tags: ['apple', 'ios', 'flagship'] },
  { name: 'Samsung Galaxy S24 Ultra', sku: 'SPH-002', description: 'Samsung flagship with built-in S Pen and 200MP camera', price: 1199.99, stock: 40, category: 'Smartphones', tags: ['samsung', 'android', 'flagship'] },
  { name: 'Google Pixel 8 Pro', sku: 'SPH-003', description: 'Google Pixel 8 Pro with Tensor G3 chip and 7 years of updates', price: 899.99, stock: 35, category: 'Smartphones', tags: ['google', 'android', 'camera'] },
  { name: 'OnePlus 12', sku: 'SPH-004', description: 'OnePlus 12 with Snapdragon 8 Gen 3 and 100W fast charging', price: 799.99, stock: 30, category: 'Smartphones', tags: ['oneplus', 'android', 'fast-charging'] },
  { name: 'Xiaomi 14 Ultra', sku: 'SPH-005', description: 'Xiaomi 14 Ultra with Leica optics and 1-inch main sensor', price: 1099.99, stock: 20, category: 'Smartphones', tags: ['xiaomi', 'leica', 'camera'] },

  // Laptops (5)
  { name: 'MacBook Pro 16 M3', sku: 'LAP-001', description: 'Apple MacBook Pro 16-inch with M3 Max chip and Liquid Retina XDR display', price: 2499.99, stock: 25, category: 'Laptops', tags: ['apple', 'macos', 'professional'] },
  { name: 'Dell XPS 15', sku: 'LAP-002', description: 'Dell XPS 15 with Intel Core i9 and OLED display', price: 1799.99, stock: 20, category: 'Laptops', tags: ['dell', 'windows', 'oled'] },
  { name: 'Lenovo ThinkPad X1 Carbon', sku: 'LAP-003', description: 'Business ultrabook with exceptional keyboard and battery life', price: 1599.99, stock: 30, category: 'Laptops', tags: ['lenovo', 'business', 'ultrabook'] },
  { name: 'ASUS ROG Zephyrus G14', sku: 'LAP-004', description: 'AMD-powered gaming laptop with compact 14-inch form factor', price: 1399.99, stock: 15, category: 'Laptops', tags: ['asus', 'gaming', 'amd'] },
  { name: 'HP Spectre x360 14', sku: 'LAP-005', description: '2-in-1 convertible laptop with OLED display and Intel Evo platform', price: 1299.99, stock: 22, category: 'Laptops', tags: ['hp', '2-in-1', 'oled'] },

  // Tablets (5)
  { name: 'iPad Pro 12.9 M2', sku: 'TAB-001', description: 'Apple iPad Pro with M2 chip and Liquid Retina XDR display', price: 1099.99, stock: 40, category: 'Tablets', tags: ['apple', 'ipad', 'professional'] },
  { name: 'Samsung Galaxy Tab S9 Ultra', sku: 'TAB-002', description: 'Samsung flagship tablet with 14.6-inch AMOLED display', price: 1199.99, stock: 25, category: 'Tablets', tags: ['samsung', 'android', 'amoled'] },
  { name: 'Microsoft Surface Pro 10', sku: 'TAB-003', description: 'Windows 2-in-1 tablet with Copilot+ AI capabilities', price: 1299.99, stock: 20, category: 'Tablets', tags: ['microsoft', 'windows', '2-in-1'] },
  { name: 'Lenovo Tab P12 Pro', sku: 'TAB-004', description: 'Lenovo productivity tablet with AMOLED display and stylus', price: 699.99, stock: 30, category: 'Tablets', tags: ['lenovo', 'android', 'productivity'] },
  { name: 'Amazon Fire HD 10', sku: 'TAB-005', description: 'Amazon tablet with 10.1-inch FHD display and Alexa integration', price: 149.99, stock: 80, category: 'Tablets', tags: ['amazon', 'alexa', 'budget'] },

  // Accessories (5)
  { name: 'Apple AirTag 4-Pack', sku: 'ACC-001', description: 'Apple item trackers with Precision Finding and U1 chip', price: 99.99, stock: 100, category: 'Accessories', tags: ['apple', 'tracker', 'location'] },
  { name: 'Anker USB-C Hub 7-in-1', sku: 'ACC-002', description: 'USB-C hub with 4K HDMI, USB 3.0, SD card reader, and PD charging', price: 49.99, stock: 150, category: 'Accessories', tags: ['anker', 'usb-c', 'hub'] },
  { name: 'Logitech MX Master 3S', sku: 'ACC-003', description: 'Wireless ergonomic mouse with MagSpeed scrolling and 8K DPI', price: 99.99, stock: 75, category: 'Accessories', tags: ['logitech', 'mouse', 'wireless'] },
  { name: 'Samsung 65W Travel Adapter', sku: 'ACC-004', description: 'Compact 65W GaN charger with USB-C and USB-A ports', price: 59.99, stock: 120, category: 'Accessories', tags: ['samsung', 'charger', 'gan'] },
  { name: 'Belkin MagSafe 3-in-1 Charger', sku: 'ACC-005', description: 'Wireless charger for iPhone, Apple Watch, and AirPods simultaneously', price: 149.99, stock: 60, category: 'Accessories', tags: ['belkin', 'magsafe', 'wireless-charging'] },

  // Gaming (5)
  { name: 'PlayStation 5 Slim', sku: 'GAM-001', description: 'Sony PlayStation 5 Slim with disc drive and DualSense controller', price: 499.99, stock: 30, category: 'Gaming', tags: ['sony', 'console', 'ps5'] },
  { name: 'Xbox Series X', sku: 'GAM-002', description: 'Microsoft Xbox Series X with 1TB SSD and 4K gaming', price: 499.99, stock: 25, category: 'Gaming', tags: ['microsoft', 'console', 'xbox'] },
  { name: 'Nintendo Switch OLED', sku: 'GAM-003', description: 'Nintendo Switch with 7-inch OLED screen and enhanced audio', price: 349.99, stock: 50, category: 'Gaming', tags: ['nintendo', 'portable', 'oled'] },
  { name: 'Razer BlackWidow V4 Pro', sku: 'GAM-004', description: 'Mechanical gaming keyboard with Razer Green switches and RGB', price: 229.99, stock: 40, category: 'Gaming', tags: ['razer', 'keyboard', 'mechanical'] },
  { name: 'SteelSeries Arctis Nova Pro', sku: 'GAM-005', description: 'Wireless gaming headset with active noise cancellation and multiplatform support', price: 349.99, stock: 35, category: 'Gaming', tags: ['steelseries', 'headset', 'wireless'] },

  // Audio (5)
  { name: 'Sony WH-1000XM5', sku: 'AUD-001', description: 'Industry-leading noise cancelling headphones with 30-hour battery', price: 349.99, stock: 60, category: 'Audio', tags: ['sony', 'headphones', 'noise-cancelling'] },
  { name: 'Apple AirPods Pro 2nd Gen', sku: 'AUD-002', description: 'Apple AirPods Pro with H2 chip and Adaptive Transparency', price: 249.99, stock: 80, category: 'Audio', tags: ['apple', 'earbuds', 'anc'] },
  { name: 'Bose QuietComfort 45', sku: 'AUD-003', description: 'Bose premium noise cancelling headphones with TriPort acoustic', price: 279.99, stock: 45, category: 'Audio', tags: ['bose', 'headphones', 'noise-cancelling'] },
  { name: 'JBL Charge 5', sku: 'AUD-004', description: 'Portable Bluetooth speaker with 20-hour playtime and IP67 waterproof', price: 179.99, stock: 90, category: 'Audio', tags: ['jbl', 'speaker', 'waterproof'] },
  { name: 'Sennheiser Momentum 4', sku: 'AUD-005', description: 'Wireless headphones with 60-hour battery and adaptive ANC', price: 349.99, stock: 35, category: 'Audio', tags: ['sennheiser', 'headphones', 'wireless'] },

  // Networking (5)
  { name: 'ASUS ZenWiFi Pro ET12', sku: 'NET-001', description: 'Tri-band WiFi 6E mesh system with 10 Gbps port and 6600 sq ft coverage', price: 549.99, stock: 20, category: 'Networking', tags: ['asus', 'wifi6e', 'mesh'] },
  { name: 'TP-Link Archer BE800', sku: 'NET-002', description: 'WiFi 7 router with 19 Gbps max speed and 4K QAM support', price: 599.99, stock: 15, category: 'Networking', tags: ['tp-link', 'wifi7', 'router'] },
  { name: 'Netgear Orbi RBK863S', sku: 'NET-003', description: 'Tri-band mesh WiFi 6 system covering up to 6000 sq ft', price: 699.99, stock: 18, category: 'Networking', tags: ['netgear', 'wifi6', 'mesh'] },
  { name: 'Synology DS923+', sku: 'NET-004', description: '4-bay NAS with AMD Ryzen R1600 and 10GbE expansion support', price: 599.99, stock: 12, category: 'Networking', tags: ['synology', 'nas', 'storage'] },
  { name: 'Ubiquiti UniFi Dream Machine Pro', sku: 'NET-005', description: 'All-in-one security gateway and network controller for enterprise use', price: 379.99, stock: 10, category: 'Networking', tags: ['ubiquiti', 'enterprise', 'security'] },

  // Monitors (5)
  { name: 'LG 27GP950-B', sku: 'MON-001', description: '27-inch UltraGear 4K gaming monitor with 144Hz and HDMI 2.1', price: 799.99, stock: 25, category: 'Monitors', tags: ['lg', '4k', 'gaming', '144hz'] },
  { name: 'Samsung Odyssey G9 OLED', sku: 'MON-002', description: '49-inch ultrawide OLED curved gaming monitor with 240Hz', price: 1499.99, stock: 10, category: 'Monitors', tags: ['samsung', 'oled', 'ultrawide', '240hz'] },
  { name: 'Dell UltraSharp U2723QE', sku: 'MON-003', description: '27-inch 4K USB-C hub monitor with IPS Black technology', price: 799.99, stock: 30, category: 'Monitors', tags: ['dell', '4k', 'usb-c', 'ips'] },
  { name: 'BenQ PD3220U', sku: 'MON-004', description: '32-inch 4K designer monitor with Thunderbolt 3 and sRGB/DCI-P3 coverage', price: 999.99, stock: 20, category: 'Monitors', tags: ['benq', '4k', 'design', 'thunderbolt'] },
  { name: 'ASUS ProArt PA32UCX', sku: 'MON-005', description: '32-inch 4K mini-LED monitor with HDR1400 and hardware calibration', price: 2999.99, stock: 8, category: 'Monitors', tags: ['asus', '4k', 'mini-led', 'professional'] },
];

const ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSample<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  // Clear existing data
  console.log('\nClearing existing data...');
  await Promise.all([
    UserModel.deleteMany({}),
    ProductModel.deleteMany({}),
    OrderModel.deleteMany({}),
  ]);
  console.log('Cleared users, products, orders.');

  // ─── Admin user ──────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@technical-test.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const now = new Date();

  const admin = await UserModel.create({
    _id: new mongoose.Types.ObjectId(),
    email: adminEmail,
    passwordHash: adminHash,
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: now,
    updatedAt: now,
  });
  console.log(`\nAdmin user created: ${admin.email}`);

  // ─── Customer users ───────────────────────────────────────────────────────
  const customerDocs = await Promise.all(
    CUSTOMER_USERS.map(async (u) => {
      const hash = await bcrypt.hash('Customer123!', 10);
      return UserModel.create({
        _id: new mongoose.Types.ObjectId(),
        email: u.email,
        passwordHash: hash,
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
        createdAt: now,
        updatedAt: now,
      });
    }),
  );
  console.log(`${customerDocs.length} customer users created.`);

  // ─── Products ─────────────────────────────────────────────────────────────
  const productDocs = await Promise.all(
    PRODUCTS.map((p) =>
      ProductModel.create({
        _id: new mongoose.Types.ObjectId(),
        name: p.name,
        sku: p.sku,
        description: p.description,
        picture: '',
        price: p.price,
        currency: 'USD',
        stock: p.stock,
        category: p.category,
        status: ProductStatus.ACTIVE,
        tags: p.tags,
        createdAt: now,
        updatedAt: now,
      }),
    ),
  );
  console.log(`${productDocs.length} products created.`);

  // ─── Orders ───────────────────────────────────────────────────────────────
  const orderCount = 25;
  const orders = [];

  for (let i = 0; i < orderCount; i++) {
    const customer = randomItem(CUSTOMER_USERS);
    const itemCount = randomInt(1, 5);
    const selectedProducts = randomSample(productDocs, itemCount);
    const tax = 0.1;

    const items = selectedProducts.map((prod) => {
      const quantity = randomInt(1, 3);
      const discount = round2(prod.price * quantity * randomInt(0, 10) / 100);
      const lineTotal = round2(prod.price * quantity - discount);
      return {
        productId: prod._id.toString(),
        sku: prod.sku,
        name: prod.name,
        picture: prod.picture ?? '',
        unitPrice: prod.price,
        quantity,
        discount,
        lineTotal,
      };
    });

    const subtotal = round2(items.reduce((sum, it) => sum + it.lineTotal, 0));
    const taxAmount = round2(subtotal * tax);
    const total = round2(subtotal + taxAmount);

    const status = randomItem(ORDER_STATUSES);

    orders.push(
      OrderModel.create({
        _id: new mongoose.Types.ObjectId(),
        identifier: crypto.randomUUID(),
        clientName: customer.name,
        clientEmail: customer.email,
        items,
        subtotal,
        tax: taxAmount,
        total,
        status,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  const createdOrders = await Promise.all(orders);
  console.log(`${createdOrders.length} orders created.`);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('\n─── Seed Summary ───────────────────────────────────');
  console.log(`Admin users   : 1 (${adminEmail})`);
  console.log(`Customer users: ${customerDocs.length}`);
  console.log(`Products      : ${productDocs.length} (across 8 categories)`);
  console.log(`Orders        : ${createdOrders.length}`);
  console.log('────────────────────────────────────────────────────');

  await mongoose.disconnect();
  console.log('Done. Disconnected from MongoDB.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
