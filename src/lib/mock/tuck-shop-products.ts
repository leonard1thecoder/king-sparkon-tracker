import type { CreateTuckShopPurchasePayload, PageResponse, Product, TuckShopPurchase } from "@/lib/types/backend";

export const MOCK_TUCK_SHOP_PRODUCTS: Product[] = [
  {
    id: 1001,
    businessId: 501,
    businessName: "King Sparkon Corner Store",
    name: "Coca-Cola Original 500ml",
    productImageUrl: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=900&q=80",
    category: "NonAlcohol",
    status: "CREATED",
    price: 18,
    salePrice: 16.99,
    stockQuantity: 42,
    barcodeCount: 42,
    remainingBarcodeSlots: 58,
    returnableEnabled: false,
    nightShiftEnabled: true,
    nightShiftPrice: 19.99,
    barcodes: ["KST-COKE-500-001", "KST-COKE-500-002", "KST-COKE-500-003"],
  },
  {
    id: 1002,
    businessId: 501,
    businessName: "King Sparkon Corner Store",
    name: "Still Water 750ml",
    productImageUrl: "https://images.unsplash.com/photo-1616118132534-381148898bb4?auto=format&fit=crop&w=900&q=80",
    category: "NonAlcohol",
    status: "CREATED",
    price: 12,
    salePrice: 10.5,
    stockQuantity: 64,
    barcodeCount: 64,
    remainingBarcodeSlots: 36,
    returnableEnabled: false,
    nightShiftEnabled: false,
    barcodes: ["KST-WATER-750-001", "KST-WATER-750-002"],
  },
  {
    id: 1003,
    businessId: 502,
    businessName: "Sparks Campus Kiosk",
    name: "Simba Chips Mrs H.S. Ball's Chutney 120g",
    productImageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=900&q=80",
    category: "NonAlcohol",
    status: "CREATED",
    price: 24.5,
    salePrice: 22.99,
    stockQuantity: 28,
    barcodeCount: 28,
    remainingBarcodeSlots: 72,
    returnableEnabled: false,
    nightShiftEnabled: true,
    nightShiftPrice: 27,
    barcodes: ["KST-SIMBA-CHUTNEY-001", "KST-SIMBA-CHUTNEY-002"],
  },
  {
    id: 1004,
    businessId: 502,
    businessName: "Sparks Campus Kiosk",
    name: "Doritos Sweet Chilli Pepper 145g",
    productImageUrl: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?auto=format&fit=crop&w=900&q=80",
    category: "NonAlcohol",
    status: "CREATED",
    price: 29.99,
    salePrice: 26.99,
    stockQuantity: 21,
    barcodeCount: 21,
    remainingBarcodeSlots: 79,
    returnableEnabled: false,
    nightShiftEnabled: true,
    nightShiftPrice: 31.99,
    barcodes: ["KST-DORITOS-SWEET-001"],
  },
  {
    id: 1005,
    businessId: 503,
    businessName: "Mamelodi Mini Market",
    name: "Oros Orange Squash 2L",
    productImageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=900&q=80",
    category: "NonAlcohol",
    status: "CREATED",
    price: 42,
    salePrice: 39.99,
    stockQuantity: 13,
    barcodeCount: 13,
    remainingBarcodeSlots: 87,
    returnableEnabled: false,
    nightShiftEnabled: false,
    barcodes: ["KST-OROS-2L-001", "KST-OROS-2L-002"],
  },
  {
    id: 1006,
    businessId: 503,
    businessName: "Mamelodi Mini Market",
    name: "Appletiser Sparkling Apple 330ml",
    productImageUrl: "https://images.unsplash.com/photo-1596803244534-925769f71125?auto=format&fit=crop&w=900&q=80",
    category: "NonAlcohol",
    status: "CREATED",
    price: 19.99,
    salePrice: 18.5,
    stockQuantity: 35,
    barcodeCount: 35,
    remainingBarcodeSlots: 65,
    returnableEnabled: true,
    returnablePrice: 2,
    nightShiftEnabled: true,
    nightShiftPrice: 22,
    barcodes: ["KST-APPLETISER-330-001", "KST-APPLETISER-330-002"],
  },
  {
    id: 1007,
    businessId: 504,
    businessName: "Johannesburg Night Tuck Shop",
    name: "Monster Energy Original 500ml",
    productImageUrl: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=900&q=80",
    category: "NonAlcohol",
    status: "CREATED",
    price: 32.99,
    salePrice: 29.99,
    stockQuantity: 18,
    barcodeCount: 18,
    remainingBarcodeSlots: 82,
    returnableEnabled: false,
    nightShiftEnabled: true,
    nightShiftPrice: 36,
    barcodes: ["KST-MONSTER-500-001"],
  },
  {
    id: 1008,
    businessId: 504,
    businessName: "Johannesburg Night Tuck Shop",
    name: "Chicken Mayo Sandwich",
    productImageUrl: "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=900&q=80",
    category: "NonAlcohol",
    status: "CREATED",
    price: 36,
    salePrice: 34.99,
    stockQuantity: 9,
    barcodeCount: 9,
    remainingBarcodeSlots: 91,
    returnableEnabled: false,
    nightShiftEnabled: false,
    barcodes: ["KST-SANDWICH-CHICKEN-001"],
  },
  {
    id: 1009,
    businessId: 505,
    businessName: "Pretoria Quick Bite",
    name: "Beef Kota Combo",
    productImageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    category: "NonAlcohol",
    status: "CREATED",
    price: 55,
    salePrice: 49.99,
    stockQuantity: 12,
    barcodeCount: 12,
    remainingBarcodeSlots: 88,
    returnableEnabled: false,
    nightShiftEnabled: true,
    nightShiftPrice: 59.99,
    barcodes: ["KST-KOTA-BEEF-001", "KST-KOTA-BEEF-002"],
  },
  {
    id: 1010,
    businessId: 505,
    businessName: "Pretoria Quick Bite",
    name: "Lunch Bar Chocolate 48g",
    productImageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=80",
    category: "NonAlcohol",
    status: "CREATED",
    price: 14.99,
    salePrice: 12.99,
    stockQuantity: 57,
    barcodeCount: 57,
    remainingBarcodeSlots: 43,
    returnableEnabled: false,
    nightShiftEnabled: false,
    barcodes: ["KST-LUNCHBAR-48-001", "KST-LUNCHBAR-48-002", "KST-LUNCHBAR-48-003"],
  },
  {
    id: 1011,
    businessId: 506,
    businessName: "Soweto Fresh Stop",
    name: "Fresh Fruit Cup",
    productImageUrl: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=80",
    category: "NonAlcohol",
    status: "CREATED",
    price: 28,
    salePrice: 24.99,
    stockQuantity: 16,
    barcodeCount: 16,
    remainingBarcodeSlots: 84,
    returnableEnabled: false,
    nightShiftEnabled: false,
    barcodes: ["KST-FRUIT-CUP-001"],
  },
  {
    id: 1012,
    businessId: 506,
    businessName: "Soweto Fresh Stop",
    name: "Bar-One Chocolate 55g",
    productImageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=900&q=80",
    category: "NonAlcohol",
    status: "CREATED",
    price: 16.99,
    salePrice: 14.5,
    stockQuantity: 44,
    barcodeCount: 44,
    remainingBarcodeSlots: 56,
    returnableEnabled: false,
    nightShiftEnabled: false,
    barcodes: ["KST-BARONE-55-001", "KST-BARONE-55-002"],
  },
];

function searchableText(product: Product) {
  return [product.name, product.businessName, product.category, product.status].join(" ").toLowerCase();
}

export function getMockTuckShopProducts(params: {
  page?: number;
  size?: number;
  businessId?: number | null;
  category?: string | null;
  search?: string | null;
} = {}): PageResponse<Product> {
  const page = Number(params.page ?? 0);
  const size = Number(params.size ?? MOCK_TUCK_SHOP_PRODUCTS.length);
  const search = String(params.search ?? "").trim().toLowerCase();
  const category = String(params.category ?? "").trim().toLowerCase();

  const filtered = MOCK_TUCK_SHOP_PRODUCTS.filter((product) => {
    const matchesBusiness = !params.businessId || product.businessId === params.businessId;
    const matchesCategory = !category || product.category.toLowerCase() === category;
    const matchesSearch = !search || searchableText(product).includes(search);
    return matchesBusiness && matchesCategory && matchesSearch;
  });

  const start = page * size;
  const content = filtered.slice(start, start + size);
  const totalPages = size > 0 ? Math.max(Math.ceil(filtered.length / size), 1) : 1;

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

export function createMockTuckShopPurchase(payload: CreateTuckShopPurchasePayload): TuckShopPurchase {
  const items = payload.items.map((item) => {
    const product = MOCK_TUCK_SHOP_PRODUCTS.find((candidate) => candidate.id === item.productId);
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

  return {
    transactionId,
    businessId: 501,
    businessName: "Mock Tuck Shop Preview",
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
