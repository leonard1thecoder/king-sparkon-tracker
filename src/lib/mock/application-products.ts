import type { CreateTuckShopPurchasePayload, PageResponse, Product, TuckShopPurchase } from "@/lib/types/backend";

type MockProductSeed = {
  id: number;
  businessId: number;
  businessName: string;
  name: string;
  image: string;
  price: number;
  salePrice?: number;
  stock: number;
  category?: string;
  returnablePrice?: number;
  nightShiftPrice?: number;
};

function mockProduct(seed: MockProductSeed): Product {
  const barcodeCount = Math.max(seed.stock, 0);
  const code = seed.name
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase()
    .slice(0, 26);

  return {
    id: seed.id,
    businessId: seed.businessId,
    businessName: seed.businessName,
    name: seed.name,
    productImageUrl: seed.image,
    category: seed.category ?? "NonAlcohol",
    status: "CREATED",
    price: seed.price,
    salePrice: seed.salePrice,
    stockQuantity: seed.stock,
    barcodeCount,
    remainingBarcodeSlots: Math.max(100 - barcodeCount, 0),
    returnableEnabled: seed.returnablePrice !== undefined,
    returnablePrice: seed.returnablePrice,
    nightShiftEnabled: seed.nightShiftPrice !== undefined,
    nightShiftPrice: seed.nightShiftPrice,
    barcodes: Array.from({ length: Math.min(Math.max(seed.stock, 1), 3) }, (_, index) => `KST-${code}-${String(index + 1).padStart(3, "0")}`),
  };
}

export const APPLICATION_MOCK_PRODUCTS: Product[] = [
  mockProduct({ id: 1001, businessId: 501, businessName: "King Sparkon Corner Store", name: "Coca-Cola Original 500ml", image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=900&q=80", price: 18, salePrice: 16.99, stock: 42, nightShiftPrice: 19.99 }),
  mockProduct({ id: 1002, businessId: 501, businessName: "King Sparkon Corner Store", name: "Still Water 750ml", image: "https://images.unsplash.com/photo-1616118132534-381148898bb4?auto=format&fit=crop&w=900&q=80", price: 12, salePrice: 10.5, stock: 64 }),
  mockProduct({ id: 1003, businessId: 501, businessName: "King Sparkon Corner Store", name: "Orange Juice 1L", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80", price: 31.99, salePrice: 28.99, stock: 17 }),
  mockProduct({ id: 1004, businessId: 501, businessName: "King Sparkon Corner Store", name: "White Bread 700g", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80", price: 19.99, stock: 24 }),
  mockProduct({ id: 1005, businessId: 502, businessName: "Sparks Campus Kiosk", name: "Simba Chips Chutney 120g", image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=900&q=80", price: 24.5, salePrice: 22.99, stock: 28, nightShiftPrice: 27 }),
  mockProduct({ id: 1006, businessId: 502, businessName: "Sparks Campus Kiosk", name: "Doritos Sweet Chilli 145g", image: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?auto=format&fit=crop&w=900&q=80", price: 29.99, salePrice: 26.99, stock: 21, nightShiftPrice: 31.99 }),
  mockProduct({ id: 1007, businessId: 502, businessName: "Sparks Campus Kiosk", name: "Chicken Mayo Sandwich", image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=900&q=80", price: 36, salePrice: 34.99, stock: 9 }),
  mockProduct({ id: 1008, businessId: 502, businessName: "Sparks Campus Kiosk", name: "Blueberry Muffin", image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=900&q=80", price: 22.99, stock: 15 }),
  mockProduct({ id: 1009, businessId: 503, businessName: "Mamelodi Mini Market", name: "Oros Orange Squash 2L", image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=900&q=80", price: 42, salePrice: 39.99, stock: 13 }),
  mockProduct({ id: 1010, businessId: 503, businessName: "Mamelodi Mini Market", name: "Appletiser Sparkling Apple 330ml", image: "https://images.unsplash.com/photo-1596803244534-925769f71125?auto=format&fit=crop&w=900&q=80", price: 19.99, salePrice: 18.5, stock: 35, returnablePrice: 2, nightShiftPrice: 22 }),
  mockProduct({ id: 1011, businessId: 503, businessName: "Mamelodi Mini Market", name: "Long Life Milk 1L", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80", price: 24.99, stock: 31 }),
  mockProduct({ id: 1012, businessId: 503, businessName: "Mamelodi Mini Market", name: "Large Eggs 18 Pack", image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=900&q=80", price: 69.99, salePrice: 64.99, stock: 8 }),
  mockProduct({ id: 1013, businessId: 504, businessName: "Johannesburg Night Tuck Shop", name: "Monster Energy Original 500ml", image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=900&q=80", price: 32.99, salePrice: 29.99, stock: 18, nightShiftPrice: 36 }),
  mockProduct({ id: 1014, businessId: 504, businessName: "Johannesburg Night Tuck Shop", name: "Red Bull Energy Drink 250ml", image: "https://images.unsplash.com/photo-1613218222874-81a6e86ac535?auto=format&fit=crop&w=900&q=80", price: 31.99, stock: 22, nightShiftPrice: 35 }),
  mockProduct({ id: 1015, businessId: 504, businessName: "Johannesburg Night Tuck Shop", name: "Biltong Snack Pack 100g", image: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=900&q=80", price: 54.99, salePrice: 49.99, stock: 11 }),
  mockProduct({ id: 1016, businessId: 504, businessName: "Johannesburg Night Tuck Shop", name: "Ice Bag 2kg", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80", price: 24.99, stock: 19, nightShiftPrice: 29.99 }),
  mockProduct({ id: 1017, businessId: 505, businessName: "Pretoria Quick Bite", name: "Beef Kota Combo", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80", price: 55, salePrice: 49.99, stock: 12, nightShiftPrice: 59.99 }),
  mockProduct({ id: 1018, businessId: 505, businessName: "Pretoria Quick Bite", name: "Russian and Chips", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80", price: 49.99, stock: 14 }),
  mockProduct({ id: 1019, businessId: 505, businessName: "Pretoria Quick Bite", name: "Lunch Bar Chocolate 48g", image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=80", price: 14.99, salePrice: 12.99, stock: 57 }),
  mockProduct({ id: 1020, businessId: 505, businessName: "Pretoria Quick Bite", name: "Hot Chips Large", image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=900&q=80", price: 34.99, stock: 20 }),
  mockProduct({ id: 1021, businessId: 506, businessName: "Soweto Fresh Stop", name: "Fresh Fruit Cup", image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=80", price: 28, salePrice: 24.99, stock: 16 }),
  mockProduct({ id: 1022, businessId: 506, businessName: "Soweto Fresh Stop", name: "Bar-One Chocolate 55g", image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=900&q=80", price: 16.99, salePrice: 14.5, stock: 44 }),
  mockProduct({ id: 1023, businessId: 506, businessName: "Soweto Fresh Stop", name: "Banana Smoothie 500ml", image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=900&q=80", price: 38.99, stock: 10 }),
  mockProduct({ id: 1024, businessId: 506, businessName: "Soweto Fresh Stop", name: "Greek Yoghurt Cup", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80", price: 21.99, stock: 26 }),
];

function searchableText(product: Product) {
  return [product.name, product.businessName, product.category, product.status].join(" ").toLowerCase();
}

export function getApplicationMockProducts(params: {
  page?: number;
  size?: number;
  businessId?: number | null;
  category?: string | null;
  search?: string | null;
} = {}): PageResponse<Product> {
  const page = Math.max(Number(params.page ?? 0), 0);
  const size = Math.max(Number(params.size ?? APPLICATION_MOCK_PRODUCTS.length), 1);
  const search = String(params.search ?? "").trim().toLowerCase();
  const category = String(params.category ?? "").trim().toLowerCase();

  const filtered = APPLICATION_MOCK_PRODUCTS.filter((product) => {
    const matchesBusiness = !params.businessId || product.businessId === params.businessId;
    const matchesCategory = !category || product.category.toLowerCase() === category;
    const matchesSearch = !search || searchableText(product).includes(search);
    return matchesBusiness && matchesCategory && matchesSearch;
  });

  const start = page * size;
  const content = filtered.slice(start, start + size);
  const totalPages = Math.max(Math.ceil(filtered.length / size), 1);

  return {
    content,
    page,
    size,
    totalElements: filtered.length,
    totalPages,
    first: page === 0,
    last: page >= totalPages - 1,
  };
}

export function createApplicationMockPurchase(payload: CreateTuckShopPurchasePayload): TuckShopPurchase {
  const items = payload.items.map((item) => {
    const product = APPLICATION_MOCK_PRODUCTS.find((candidate) => candidate.id === item.productId);
    const unitPrice = Number(product?.salePrice ?? product?.price ?? 0);
    return {
      productId: item.productId,
      productName: product?.name ?? `Product #${item.productId}`,
      productImageUrl: product?.productImageUrl ?? null,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      barcodes: item.barcodes ?? [],
    };
  });

  const productTotal = items.reduce((total, item) => total + item.lineTotal, 0);
  const transactionId = Number(String(Date.now()).slice(-7));
  const firstProduct = APPLICATION_MOCK_PRODUCTS.find((product) => product.id === payload.items[0]?.productId);

  return {
    transactionId,
    businessId: firstProduct?.businessId ?? 501,
    businessName: firstProduct?.businessName ?? "King Sparkon Mock Shop",
    workerId: payload.workerId ?? null,
    ownerId: 1,
    productTotal,
    paymentStatus: "MOCK_PENDING",
    paymentType: "WEBSITE_PAYMENT",
    paymentReference: `MOCK-KST-${transactionId}`,
    paymentUrl: `https://pay.example.com/mock/king-sparkon/${transactionId}`,
    paymentQrCodeUrl: null,
    tip: payload.tipAmount
      ? {
          id: transactionId + 1,
          workerId: payload.workerId ?? 1,
          tipAmount: Number(payload.tipAmount),
          callbackUrl: payload.tipCallbackUrl ?? "",
          clientContact: payload.paymentContact,
          status: "MOCK_PENDING",
          grossAmount: Number(payload.tipAmount),
          feeAmount: Math.round(Number(payload.tipAmount) * 0.09 * 100) / 100,
          netAmount: Math.round(Number(payload.tipAmount) * 0.91 * 100) / 100,
          paymentReference: `MOCK-TIP-${transactionId}`,
          paymentUrl: `https://pay.example.com/mock/king-sparkon-tip/${transactionId}`,
          qrCodeUrl: null,
        }
      : null,
    createdAt: new Date().toISOString(),
    items,
  };
}
