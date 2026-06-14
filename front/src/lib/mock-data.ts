export type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  cat1: string;
  cat2: string;
  cat3: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "archived";
  createdAt: string;
};

export type Brand = { id: string; name: string; createdAt: string };

export type Token = {
  id: string;
  name: string;
  token: string;
  status: "active" | "revoked";
  createdAt: string;
  lastUsed: string;
};

export type Activity = {
  id: string;
  date: string;
  action: string;
  user: string;
  details: string;
};

export const brands: Brand[] = [
  { id: "b_01", name: "Acme Corp", createdAt: "2025-11-02" },
  { id: "b_02", name: "Northwind", createdAt: "2025-09-14" },
  { id: "b_03", name: "Globex", createdAt: "2025-08-21" },
  { id: "b_04", name: "Initech", createdAt: "2025-07-03" },
  { id: "b_05", name: "Umbrella", createdAt: "2025-06-19" },
  { id: "b_06", name: "Hooli", createdAt: "2025-05-11" },
  { id: "b_07", name: "Stark Industries", createdAt: "2025-04-08" },
];

export const categories = [
  {
    cat1: "Electronics",
    children: [
      { cat2: "Computers", children: ["Laptops", "Desktops", "Tablets"] },
      { cat2: "Audio", children: ["Headphones", "Speakers", "Microphones"] },
      { cat2: "Mobile", children: ["Smartphones", "Accessories"] },
    ],
  },
  {
    cat1: "Home",
    children: [
      { cat2: "Furniture", children: ["Office Chairs", "Desks", "Shelves"] },
      { cat2: "Kitchen", children: ["Cookware", "Appliances"] },
    ],
  },
  {
    cat1: "Apparel",
    children: [
      { cat2: "Men", children: ["Shirts", "Pants", "Shoes"] },
      { cat2: "Women", children: ["Dresses", "Tops", "Shoes"] },
    ],
  },
];

const productNames = [
  "Aurora Pro Laptop", "Nimbus Wireless Headphones", "Vertex Office Chair",
  "Helix Mechanical Keyboard", "Lumen Desk Lamp", "Quartz Smartphone X",
  "Orbit Bluetooth Speaker", "Pulse Fitness Band", "Cascade Coffee Maker",
  "Forge Standing Desk", "Echo Studio Microphone", "Drift Tablet 11",
  "Atlas Backpack", "Beacon Smart Bulb", "Cinder Air Fryer",
  "Delta Running Shoes", "Ember Hoodie", "Flux USB-C Hub",
  "Glide Ergonomic Mouse", "Halo Ring Light",
];

const cats = [
  ["Electronics", "Computers", "Laptops"],
  ["Electronics", "Audio", "Headphones"],
  ["Home", "Furniture", "Office Chairs"],
  ["Electronics", "Computers", "Desktops"],
  ["Home", "Furniture", "Desks"],
  ["Electronics", "Mobile", "Smartphones"],
  ["Electronics", "Audio", "Speakers"],
  ["Apparel", "Men", "Shoes"],
  ["Home", "Kitchen", "Appliances"],
  ["Electronics", "Audio", "Microphones"],
];

export const products: Product[] = productNames.map((name, i) => {
  const c = cats[i % cats.length];
  return {
    id: `p_${String(i + 1).padStart(3, "0")}`,
    sku: `SKU-${1000 + i}`,
    name,
    brand: brands[i % brands.length].name,
    cat1: c[0],
    cat2: c[1],
    cat3: c[2],
    price: Math.round((49 + i * 37.5) * 100) / 100,
    stock: 10 + ((i * 13) % 240),
    status: (i % 7 === 0 ? "draft" : i % 11 === 0 ? "archived" : "active") as Product["status"],
    createdAt: `2025-${String(((i % 12) + 1)).padStart(2, "0")}-${String(((i * 3) % 27) + 1).padStart(2, "0")}`,
  };
});

export const tokens: Token[] = [
  { id: "t_1", name: "Production Server", token: "prd_8f72ks92mslq72js9a2abc123", status: "active", createdAt: "2026-04-12", lastUsed: "2026-06-14" },
  { id: "t_2", name: "Staging Pipeline", token: "stg_2j8sk2lq9smal72jspq84def456", status: "active", createdAt: "2026-03-02", lastUsed: "2026-06-13" },
  { id: "t_3", name: "Analytics Worker", token: "prd_92ksl28sjms92lkalq72ghi789", status: "active", createdAt: "2026-02-18", lastUsed: "2026-06-10" },
  { id: "t_4", name: "Old CI Runner", token: "prd_82js9q72kslq92msl28djkl012", status: "revoked", createdAt: "2025-11-08", lastUsed: "2026-01-22" },
];

export const activity: Activity[] = [
  { id: "a1", date: "2026-06-14 09:42", action: "Product created", user: "alex@acme.io", details: "SKU-1019 — Halo Ring Light" },
  { id: "a2", date: "2026-06-14 09:10", action: "CSV import", user: "alex@acme.io", details: "248 rows imported, 3 failed" },
  { id: "a3", date: "2026-06-13 17:23", action: "Token created", user: "maria@acme.io", details: "Staging Pipeline" },
  { id: "a4", date: "2026-06-13 14:08", action: "Brand updated", user: "alex@acme.io", details: "Globex" },
  { id: "a5", date: "2026-06-12 11:55", action: "Product archived", user: "sam@acme.io", details: "SKU-1003" },
  { id: "a6", date: "2026-06-12 10:30", action: "Category created", user: "maria@acme.io", details: "Apparel > Women > Shoes" },
];

export function generateToken(prefix = "prd") {
  const chars = "abcdefghijkmnopqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 28; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}_${s}`;
}

export function maskToken(t: string) {
  return "•".repeat(Math.max(0, t.length - 6)) + t.slice(-6);
}
