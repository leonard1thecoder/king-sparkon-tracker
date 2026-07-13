import type { OnlineTuckShopPurchase } from "@/lib/api/tuck-shop";

const MOCK_WORKER_ONLINE_PURCHASES_KEY = "king-sparkon-mock-worker-online-purchases";
export const MOCK_WORKER_ONLINE_PURCHASES_EVENT = "king-sparkon:mock-worker-online-purchases";

const BASE_MOCK_PAID_CARTS: OnlineTuckShopPurchase[] = [
  {
    transactionId: -9101,
    businessId: 501,
    businessName: "Johannesburg Night Tuck Shop",
    customerId: 8101,
    customerUsername: "demo.naledi",
    workerId: null,
    ownerId: 501,
    productTotal: 78,
    paymentStatus: "PAID",
    paymentType: "WEBSITE_PAYMENT",
    paymentReference: "pi_mock_paid_9101",
    createdAt: "2026-07-13T09:10:00Z",
    fulfilmentStatus: "AWAITING_BARCODE_ASSIGNMENT",
    barcodesRequired: 3,
    items: [
      {
        productId: 1001,
        productName: "Sparkon Cola 500ml",
        quantity: 2,
        unitPrice: 22,
        lineTotal: 44,
        barcodes: [],
      },
      {
        productId: 1002,
        productName: "Sea Salt Crisps",
        quantity: 1,
        unitPrice: 34,
        lineTotal: 34,
        barcodes: [],
      },
    ],
  },
  {
    transactionId: -9102,
    businessId: 501,
    businessName: "Johannesburg Night Tuck Shop",
    customerId: 8102,
    customerUsername: "demo.sipho",
    workerId: null,
    ownerId: 501,
    productTotal: 54,
    paymentStatus: "PAID",
    paymentType: "WEBSITE_PAYMENT",
    paymentReference: "pi_mock_paid_9102",
    createdAt: "2026-07-13T09:35:00Z",
    fulfilmentStatus: "AWAITING_BARCODE_ASSIGNMENT",
    barcodesRequired: 2,
    items: [
      {
        productId: 1003,
        productName: "Still Water 750ml",
        quantity: 3,
        unitPrice: 18,
        lineTotal: 54,
        barcodes: ["MOCK-WATER-001"],
      },
    ],
  },
  {
    transactionId: -9103,
    businessId: 501,
    businessName: "Johannesburg Night Tuck Shop",
    customerId: 8103,
    customerUsername: "demo.ayanda",
    workerId: 701,
    ownerId: 501,
    productTotal: 32,
    paymentStatus: "PAID",
    paymentType: "WEBSITE_PAYMENT",
    paymentReference: "pi_mock_paid_9103",
    createdAt: "2026-07-13T10:00:00Z",
    fulfilmentStatus: "READY_FOR_COLLECTION",
    barcodesRequired: 0,
    collectionQrCodeValue: "KST-COLLECT:MOCK-9103-READY",
    collectionQrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=KST-COLLECT%3AMOCK-9103-READY",
    collectionReadyAt: "2026-07-13T10:05:00Z",
    preparedByWorkerId: 701,
    items: [
      {
        productId: 1004,
        productName: "Sparkon Energy Drink",
        quantity: 1,
        unitPrice: 32,
        lineTotal: 32,
        barcodes: ["MOCK-ENERGY-001"],
      },
    ],
  },
];

function cloneOrders(orders: OnlineTuckShopPurchase[]) {
  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({ ...item, barcodes: [...(item.barcodes ?? [])] })),
  }));
}

export function isMockWorkerOnlinePurchase(order: OnlineTuckShopPurchase) {
  return Number(order.transactionId) < 0;
}

export function readMockWorkerOnlinePurchases() {
  if (typeof window === "undefined") return cloneOrders(BASE_MOCK_PAID_CARTS);

  try {
    const raw = window.localStorage.getItem(MOCK_WORKER_ONLINE_PURCHASES_KEY);
    if (!raw) return cloneOrders(BASE_MOCK_PAID_CARTS);
    const parsed = JSON.parse(raw) as OnlineTuckShopPurchase[];
    if (!Array.isArray(parsed) || parsed.length === 0) return cloneOrders(BASE_MOCK_PAID_CARTS);
    return cloneOrders(parsed.filter((order) => isMockWorkerOnlinePurchase(order)));
  } catch {
    return cloneOrders(BASE_MOCK_PAID_CARTS);
  }
}

function saveMockWorkerOnlinePurchases(orders: OnlineTuckShopPurchase[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MOCK_WORKER_ONLINE_PURCHASES_KEY, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent(MOCK_WORKER_ONLINE_PURCHASES_EVENT, { detail: { orders } }));
}

export function withMockWorkerOnlinePurchases(liveOrders: OnlineTuckShopPurchase[]) {
  return [...liveOrders.filter((order) => !isMockWorkerOnlinePurchase(order)), ...readMockWorkerOnlinePurchases()];
}

export function onlinePurchasedBarcodesRequired(orders: OnlineTuckShopPurchase[]) {
  return orders.reduce((total, order) => {
    if (order.fulfilmentStatus === "COLLECTED") return total;
    const calculated = order.items.reduce(
      (sum, item) => sum + Math.max(Number(item.quantity ?? 0) - Number(item.barcodes?.length ?? 0), 0),
      0,
    );
    return total + Math.max(Number(order.barcodesRequired ?? calculated), calculated, 0);
  }, 0);
}

export function assignMockWorkerOnlinePurchaseBarcode(
  transactionId: number,
  productId: number,
  scannedValue: string,
) {
  const orders = readMockWorkerOnlinePurchases();
  let updatedOrder: OnlineTuckShopPurchase | null = null;

  const updatedOrders = orders.map((order) => {
    if (order.transactionId !== transactionId) return order;

    const items = order.items.map((item) => {
      if (item.productId !== productId) return item;
      const assigned = item.barcodes?.length ?? 0;
      if (assigned >= item.quantity) throw new Error("This demo product line already has every required barcode.");

      const safeScan = scannedValue.trim().replace(/[^a-zA-Z0-9-]/g, "").slice(-18) || "SCAN";
      const unitCode = `MOCK-${Math.abs(transactionId)}-${productId}-${assigned + 1}-${safeScan}`;
      return { ...item, barcodes: [...(item.barcodes ?? []), unitCode] };
    });

    const remaining = items.reduce(
      (sum, item) => sum + Math.max(Number(item.quantity ?? 0) - Number(item.barcodes?.length ?? 0), 0),
      0,
    );
    const ready = remaining === 0;
    const nextOrder: OnlineTuckShopPurchase = {
      ...order,
      items,
      barcodesRequired: remaining,
      fulfilmentStatus: ready ? "READY_FOR_COLLECTION" : "AWAITING_BARCODE_ASSIGNMENT",
      collectionReadyAt: ready ? new Date().toISOString() : order.collectionReadyAt,
      collectionQrCodeValue: ready ? `KST-COLLECT:MOCK-${Math.abs(transactionId)}-READY` : order.collectionQrCodeValue,
      collectionQrCodeUrl: ready
        ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`KST-COLLECT:MOCK-${Math.abs(transactionId)}-READY`)}`
        : order.collectionQrCodeUrl,
    };
    updatedOrder = nextOrder;
    return nextOrder;
  });

  if (!updatedOrder) throw new Error("Demo paid cart was not found.");
  saveMockWorkerOnlinePurchases(updatedOrders);
  return updatedOrder;
}
