"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowDownUp,
  Barcode,
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  type LucideIcon,
  Search,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import type { IScannerControls } from "@zxing/browser";
import { BackendApiError, backendRequest } from "@/lib/backend-client";
import { normalizeUserRole, userRoleLabel } from "@/lib/roles";

const WORKER_LIMIT = 2;
const DEFAULT_OWNER_ID = process.env.NEXT_PUBLIC_KING_SPARKON_OWNER_ID ?? "";

type ViewKey =
  | "overview"
  | "products"
  | "transactions"
  | "barcodes"
  | "claims"
  | "workers"
  | "reports"
  | "audit"
  | "billing";

type StoredAuth = {
  user?: TrackerUser;
};

type TrackerUser = {
  id: number;
  username: string;
  emailAddress: string;
  createdDate: string;
  modifiedDate: string;
  privilege: "Owner" | "Worker";
  businessId?: number | null;
  businessName?: string | null;
};

type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

type ProductStatus = "CREATED" | "PENDING_APPROVAL" | "APPROVED";
type ProductBarcodeStatus = "NOT_CLAIMED" | "CLAIMED" | "EXPIRED" | "NOT_CLAIMABLE";

type ProductBarcode = {
  id?: number;
  barcode: string;
  referencee?: string | null;
  status?: ProductBarcodeStatus;
};

type Product = {
  id: number;
  businessId?: number | null;
  businessName?: string | null;
  name: string;
  catalog?: string;
  category: "Alcohol" | "NonAlcohol";
  status?: ProductStatus;
  price: number;
  salePrice?: number;
  returnableEnabled?: boolean;
  returnablePrice?: number | null;
  nightShiftEnabled?: boolean;
  nightShiftPrice?: number | null;
  nightShiftStartTime?: string | null;
  nightShiftEndTime?: string | null;
  bottleReturnable?: boolean;
  stockQuantity: number;
  barcodes?: Array<string | ProductBarcode>;
  barcodeCount?: number;
  remainingBarcodeSlots?: number;
};

type TransactionItem = {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  barcodes?: string[];
};

type Transaction = {
  id: number;
  date: string;
  type: "BUY" | "SELL";
  businessId?: number | null;
  businessName?: string | null;
  status?: string;
  employeeId: number;
  ownerId: number;
  items: TransactionItem[];
};

type InventorySummary = {
  totalProducts: number;
  alcoholProducts: number;
  nonAlcoholProducts: number;
  totalStockQuantity: number;
  totalStockValue: number;
  lowStockProducts: number;
};

type CategoryReport = {
  from?: string | null;
  to?: string | null;
  boughtQuantity: number;
  soldQuantity: number;
  boughtValue: number;
  soldValue: number;
};

type ProductMovement = {
  productId: number;
  productName: string;
  category: "Alcohol" | "NonAlcohol";
  barcodes?: string[];
  boughtQuantity: number;
  soldQuantity: number;
  boughtValue: number;
  soldValue: number;
};

type ProductBarcodeLookup = {
  id: number;
  barcode: string;
  referencee?: string | null;
  status: ProductBarcodeStatus;
  productId: number;
  productName: string;
  productCategory: "Alcohol" | "NonAlcohol";
  returnableEnabled?: boolean;
  bottleReturnable: boolean;
};

type AuditLog = {
  id: number;
  businessId?: number | null;
  businessName?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  actorUsername: string;
  details: string;
  createdAt: string;
};

type BusinessPlan = "FREE_TRIAL" | "PLUS" | "PRO";
type BillingInterval = "MONTHLY" | "YEARLY";

type BillingPlan = {
  plan: BusinessPlan;
  displayName: string;
  monthlyPrice: number;
  currency: string;
  maxWorkers: number;
  unlimitedWorkers: boolean;
  unlimitedProducts: boolean;
  unlimitedBarcodeScanning: boolean;
  workerTipsPlatform: boolean;
  businessAnalysisAi: boolean;
  workerClocker: boolean;
  features: string[];
};

type BusinessBilling = {
  businessId: number;
  businessName: string;
  businessPlan: BusinessPlan;
  businessStatus: string;
  trialStartDate?: string | null;
  trialEndDate?: string | null;
  currentBillingPeriodStartDate?: string | null;
  currentBillingPeriodEndDate?: string | null;
  paypalSubscriptionId?: string | null;
  subscriptionId?: number | null;
  billingInterval?: BillingInterval | null;
  termYears?: number | null;
  amount?: number | null;
  currency?: string | null;
  paymentStatus?: string | null;
  paypalApprovalUrl?: string | null;
  stripeCheckoutUrl?: string | null;
  stripeSubscriptionId?: string | null;
};

type StripeCheckoutSession = {
  subscriptionId?: number | null;
  checkoutSessionId: string;
  checkoutUrl: string;
  paymentStatus?: string | null;
};

type BillingDashboard = {
  businessId: number;
  businessName: string;
  currentPlan: BusinessPlan;
  businessStatus: string;
  paymentStatus?: string | null;
  trial: boolean;
  trialDaysLeft: number;
  trialEndDate?: string | null;
  currentBillingPeriodEndDate?: string | null;
  deactivated: boolean;
  showDeactivatedOverlay: boolean;
  showUpgradeButtons: boolean;
  canUseProducts: boolean;
  canUseBarcodeScanning: boolean;
  canUseWorkerTipsPlatform: boolean;
  canUseBusinessAnalysisAi: boolean;
  canUseWorkerClocker: boolean;
  availablePlans: BillingPlan[];
};

type DashboardData = {
  me: TrackerUser | null;
  inventory: InventorySummary | null;
  categoryReport: CategoryReport | null;
  movements: ProductMovement[];
  products: PageResponse<Product>;
  transactions: PageResponse<Transaction>;
  users: PageResponse<TrackerUser>;
  auditLogs: PageResponse<AuditLog>;
  billingPlans: BillingPlan[];
  billing: BusinessBilling | null;
  billingDashboard: BillingDashboard | null;
};

type Notice = {
  tone: "success" | "error" | "info";
  message: string;
};

type BarcodeValidator = (productId: number, barcode: string) => Promise<Product>;
type PaginationState = { page: number; size: number };
type ReportFilters = { from: string; to: string };

const emptyPage = <T,>(): PageResponse<T> => ({
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
});

const emptyData: DashboardData = {
  me: null,
  inventory: null,
  categoryReport: null,
  movements: [],
  products: emptyPage<Product>(),
  transactions: emptyPage<Transaction>(),
  users: emptyPage<TrackerUser>(),
  auditLogs: emptyPage<AuditLog>(),
  billingPlans: [],
  billing: null,
  billingDashboard: null,
};

const navItems: Array<{ key: ViewKey; label: string; icon: LucideIcon }> = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "products", label: "Products", icon: Boxes },
  { key: "transactions", label: "Transactions", icon: ArrowDownUp },
  { key: "claims", label: "Claims", icon: Search },
  { key: "workers", label: "Workers", icon: UsersRound },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "audit", label: "Audit", icon: History },
  { key: "billing", label: "Billing", icon: WalletCards },
];

const workerNavItems: Array<{ key: ViewKey; label: string; icon: LucideIcon }> = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "products", label: "Products", icon: Boxes },
  { key: "transactions", label: "Transactions", icon: ArrowDownUp },
  { key: "barcodes", label: "Barcodes", icon: Barcode },
  { key: "claims", label: "Claims", icon: Search },
];

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function dateLabel(value?: string) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function noticeClasses(tone: Notice["tone"]) {
  if (tone === "success") {
    return "border-[#bfe8cf] bg-[#eefaf3] text-[#1b5b3d]";
  }

  if (tone === "error") {
    return "border-[#f2c7bc] bg-[#fff1ec] text-[#8b2d1f]";
  }

  return "border-[#e6dcc0] bg-[#fff8e8] text-[#6f5620]";
}

function fieldValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isOwnerUser(user: TrackerUser | null | undefined) {
  return normalizeUserRole(user?.privilege) === "Owner";
}

function isWorkerUser(user: TrackerUser | null | undefined) {
  return normalizeUserRole(user?.privilege) === "Worker";
}

function privilegeLabel(user: TrackerUser | null | undefined) {
  if (isWorkerUser(user)) {
    return "Worker";
  }

  if (isOwnerUser(user)) {
    return "Owner";
  }

  return "JWT required";
}

function businessLabel(user: TrackerUser | null | undefined) {
  return user?.businessName ?? "No business linked";
}

function productBarcodes(product: Product): ProductBarcode[] {
  return (product.barcodes ?? []).map((entry, index) => {
    if (typeof entry === "string") {
      return { id: index, barcode: entry, status: "NOT_CLAIMED" };
    }

    return entry;
  });
}

function assignedBarcodeCount(product: Product) {
  return product.barcodeCount ?? productBarcodes(product).length;
}

function remainingBarcodeSlots(product: Product) {
  return product.remainingBarcodeSlots ?? Math.max(product.stockQuantity - assignedBarcodeCount(product), 0);
}

function productCatalogLabel(product: Product) {
  return product.catalog ?? productCategoryLabel(product.category);
}

function productCategoryLabel(category?: Product["category"] | ProductMovement["category"] | ProductBarcodeLookup["productCategory"]) {
  if (category === "Alcohol") {
    return "Alcohol products";
  }

  if (category === "NonAlcohol") {
    return "Non-alcohol products";
  }

  return "-";
}

function productReturnableEnabled(product: Product) {
  return product.returnableEnabled ?? product.bottleReturnable ?? false;
}

function barcodeLookupReturnableEnabled(result: ProductBarcodeLookup) {
  return result.returnableEnabled ?? result.bottleReturnable ?? false;
}

function isApprovedProduct(product: Product) {
  return product.status === "APPROVED";
}

function defaultOwnerIdValue() {
  return DEFAULT_OWNER_ID.trim();
}

function transactionBarcodeTotal(transaction: Transaction) {
  return transaction.items.reduce((total, item) => total + (item.barcodes?.length ?? 0), 0);
}

function transactionTotalPrice(transaction: Transaction) {
  return transaction.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

function transactionProductSoldLabel(transaction: Transaction) {
  if (!transaction.items.length) {
    return "No products";
  }

  return transaction.items
    .map((item) => `${item.productName ?? `Product #${item.productId}`} x${item.quantity}`)
    .join(", ");
}

function transactionBarcodeSummary(transaction: Transaction) {
  const barcodes = transaction.items.flatMap((item) => item.barcodes ?? []);

  if (!barcodes.length) {
    return "No barcode data";
  }

  if (barcodes.length === 1) {
    return barcodes[0];
  }

  return `${barcodes[0]} +${barcodes.length - 1}`;
}

function transactionStatusLabel(transaction: Transaction) {
  if (transaction.status) {
    return transaction.status.replaceAll("_", " ");
  }

  return "Completed";
}

function isCreatedProduct(product: Product) {
  return !product.status || product.status === "CREATED";
}

function canProductReceiveBarcodes(product: Product) {
  return isCreatedProduct(product) && remainingBarcodeSlots(product) > 0;
}

function canProductSubmitForApproval(product: Product) {
  return isCreatedProduct(product) && product.stockQuantity > 0 && remainingBarcodeSlots(product) === 0;
}

function productsNeedingBarcodes(products: Product[]) {
  return products.filter(canProductReceiveBarcodes);
}

function productsReadyForApproval(products: Product[]) {
  return products.filter(canProductSubmitForApproval);
}

type DashboardRole = "owner" | "worker";

function dashboardPathForUser(user: TrackerUser | null | undefined) {
  if (isWorkerUser(user)) {
    return "/dashboard/worker";
  }

  if (isOwnerUser(user)) {
    return "/dashboard/owner";
  }

  return "/dashboard";
}

export function DashboardShell({ expectedRole }: { expectedRole: DashboardRole }) {
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [session, setSession] = useState<StoredAuth | null>(null);
  const [data, setData] = useState<DashboardData>(emptyData);
  const [productsPagination, setProductsPagination] = useState<PaginationState>({ page: 0, size: 20 });
  const [transactionsPagination, setTransactionsPagination] = useState<PaginationState>({ page: 0, size: 20 });
  const [usersPagination, setUsersPagination] = useState<PaginationState>({ page: 0, size: 20 });
  const [auditPagination, setAuditPagination] = useState<PaginationState>({ page: 0, size: 20 });
  const [reportFilters, setReportFilters] = useState<ReportFilters>({ from: "", to: "" });
  const [workerTransactions, setWorkerTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isWorkerFormOpen, setIsWorkerFormOpen] = useState(false);
  const [quantityProduct, setQuantityProduct] = useState<Product | null>(null);
  const [barcodeScannerProduct, setBarcodeScannerProduct] = useState<Product | null>(null);
  const [claimResults, setClaimResults] = useState<ProductBarcodeLookup[]>([]);
  const [isClaimLookupLoading, setIsClaimLookupLoading] = useState(false);
  const [claimingBarcodeId, setClaimingBarcodeId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const workers = useMemo(
    () => data.users.content.filter((user) => isWorkerUser(user)),
    [data.users.content],
  );
  const currentUser = data.me ?? session?.user ?? null;
  const owner =
    data.users.content.find((user) => isOwnerUser(user)) ??
    (isOwnerUser(currentUser) ? currentUser : null);
  const isOwnerSession = isOwnerUser(currentUser);
  const isWorkerSession = isWorkerUser(currentUser);
  const canCreateWorker = workers.length < WORKER_LIMIT;
  const isWorkerDashboard = expectedRole === "worker";
  const visibleNavItems = useMemo(
    () => (isWorkerDashboard ? workerNavItems : navItems),
    [isWorkerDashboard],
  );

  const apiRequest = useCallback(async <T,>(_auth: StoredAuth, path: string, init?: RequestInit): Promise<T> => {
    try {
      return await backendRequest<T>(path, init);
    } catch (error) {
      if (error instanceof BackendApiError && error.status === 401) {
        setSession(null);
      }

      throw error;
    }
  }, []);

  const validateProductBarcode = useCallback<BarcodeValidator>(async (productId, barcode) => {
    if (!session) {
      throw new Error("Sign in before scanning item barcodes.");
    }

    const product = await apiRequest<Product>(session, `products/barcode/${encodeURIComponent(barcode)}`);

    if (product.id !== productId) {
      throw new Error(`Barcode ${barcode} belongs to ${product.name}, not the selected product.`);
    }

    return product;
  }, [apiRequest, session]);

  const loadDashboard = useCallback(async (auth: StoredAuth, quiet = false) => {
    if (quiet) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const me = await apiRequest<TrackerUser>(auth, "users/me");
      const products = await apiRequest<PageResponse<Product>>(
        auth,
        `products?page=${productsPagination.page}&size=${productsPagination.size}`,
      );
      const matchingDashboardPath = dashboardPathForUser(me);

      if (
        (expectedRole === "owner" && !isOwnerUser(me)) ||
        (expectedRole === "worker" && !isWorkerUser(me))
      ) {
        window.location.href = matchingDashboardPath;
        return;
      }

      if (isWorkerUser(me)) {
        setActiveView((view) => (view === "workers" || view === "audit" || view === "billing" || view === "reports" ? "overview" : view));
        setData({ ...emptyData, me, products });
        setNotice(null);
        return;
      }

      const reportParams = new URLSearchParams();

      if (reportFilters.from) {
        reportParams.set("from", `${reportFilters.from}T00:00:00`);
      }

      if (reportFilters.to) {
        reportParams.set("to", `${reportFilters.to}T23:59:59`);
      }

      const reportQuery = reportParams.toString();
      const reportSuffix = reportQuery ? `?${reportQuery}` : "";
      const [inventory, categoryReport, movements, transactions, users, auditLogs, billingPlans, billing, billingDashboard] = await Promise.all([
        apiRequest<InventorySummary>(auth, "reports/inventory-summary?lowStockThreshold=5"),
        apiRequest<CategoryReport>(auth, `reports/alcohol${reportSuffix}`),
        apiRequest<ProductMovement[]>(auth, `reports/product-movement${reportSuffix}`),
        apiRequest<PageResponse<Transaction>>(
          auth,
          `transactions?page=${transactionsPagination.page}&size=${transactionsPagination.size}`,
        ),
        apiRequest<PageResponse<TrackerUser>>(
          auth,
          `users?page=${usersPagination.page}&size=${usersPagination.size}`,
        ),
        apiRequest<PageResponse<AuditLog>>(
          auth,
          `audit-logs?page=${auditPagination.page}&size=${auditPagination.size}`,
        ),
        apiRequest<BillingPlan[]>(auth, "billing/plans"),
        apiRequest<BusinessBilling>(auth, "billing/me"),
        apiRequest<BillingDashboard>(auth, "billing/dashboard"),
      ]);

      setData({ me, inventory, categoryReport, movements, products, transactions, users, auditLogs, billingPlans, billing, billingDashboard });
      setNotice(null);
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load dashboard data from the backend.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    apiRequest,
    auditPagination.page,
    auditPagination.size,
    expectedRole,
    productsPagination.page,
    productsPagination.size,
    reportFilters.from,
    reportFilters.to,
    transactionsPagination.page,
    transactionsPagination.size,
    usersPagination.page,
    usersPagination.size,
  ]);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      const auth: StoredAuth = {};

      if (cancelled) {
        return;
      }

      setSession(auth);

      void loadDashboard(auth);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [loadDashboard]);

  async function handleRefresh() {
    if (!session) {
      setNotice({ tone: "info", message: "Sign in first to refresh dashboard data." });
      return;
    }

    await loadDashboard(session, true);
  }

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session || !isOwnerSession) {
      setNotice({ tone: "info", message: "Sign in as the owner to create stocked products." });
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await apiRequest<Product>(session, "products", {
        method: "POST",
        body: JSON.stringify({
          name: fieldValue(formData, "name"),
          category: fieldValue(formData, "category"),
          price: Number(fieldValue(formData, "price")),
          returnableEnabled: formData.get("returnableEnabled") === "on",
          returnablePrice: Number(fieldValue(formData, "returnablePrice") || 0),
          nightShiftEnabled: formData.get("nightShiftEnabled") === "on",
          nightShiftPrice: Number(fieldValue(formData, "nightShiftPrice") || 0),
          nightShiftStartTime: fieldValue(formData, "nightShiftStartTime") || null,
          nightShiftEndTime: fieldValue(formData, "nightShiftEndTime") || null,
          stockQuantity: Number(fieldValue(formData, "stockQuantity")),
        }),
      });
      form.reset();
      await loadDashboard(session, true);
      setIsProductFormOpen(false);
      setNotice({ tone: "success", message: "Product created and product list refreshed." });
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to create product.",
      });
    }
  }

  async function handleUpdateProductQuantity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session || !isOwnerSession || !quantityProduct) {
      setNotice({ tone: "info", message: "Sign in as the owner to update product quantity." });
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const stockQuantity = Number(fieldValue(formData, "stockQuantity"));
    const barcodeCount = assignedBarcodeCount(quantityProduct);

    if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
      setNotice({ tone: "info", message: "Enter a valid non-negative stock quantity." });
      return;
    }

    if (stockQuantity < barcodeCount) {
      setNotice({
        tone: "info",
        message: `Quantity cannot be lower than the ${barcodeCount} barcode${barcodeCount === 1 ? "" : "s"} already registered.`,
      });
      return;
    }

    try {
      await apiRequest<Product>(session, `products/${quantityProduct.id}/quantity`, {
        method: "PATCH",
        body: JSON.stringify({ stockQuantity }),
      });
      await loadDashboard(session, true);
      setQuantityProduct(null);
      setNotice({ tone: "success", message: "Product quantity updated." });
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to update product quantity.",
      });
    }
  }

  async function handleSubmitProductApproval(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session || !isWorkerSession) {
      setNotice({ tone: "info", message: "Sign in as a worker to submit products for approval." });
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const productId = fieldValue(formData, "productId");

    try {
      await apiRequest<Product>(session, `products/${productId}/submit-approval`, {
        method: "POST",
      });
      form.reset();
      await loadDashboard(session, true);
      setNotice({ tone: "success", message: "Barcode submitted for review." });
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to submit product for approval.",
      });
    }
  }

  async function handleSubmitScannedProductBarcodes(product: Product, barcodes: string[], referencee?: string) {
    if (!session || !isWorkerSession) {
      setNotice({ tone: "info", message: "Sign in as a worker to submit product barcodes." });
      return false;
    }

    const requiredCount = remainingBarcodeSlots(product);

    if (requiredCount < 1) {
      setNotice({ tone: "info", message: "This product has no barcode slots left to register." });
      return false;
    }

    if (barcodes.length !== requiredCount) {
      setNotice({
        tone: "info",
        message: `Scan ${requiredCount} barcode${requiredCount === 1 ? "" : "s"} before submitting for review.`,
      });
      return false;
    }

    try {
      for (const barcode of barcodes) {
        await apiRequest<Product>(session, `products/${product.id}/barcodes`, {
          method: "POST",
          body: JSON.stringify({
            barcode,
            ...(referencee?.trim() ? { referencee: referencee.trim() } : {}),
          }),
        });
      }

      await apiRequest<Product>(session, `products/${product.id}/submit-approval`, {
        method: "POST",
      });

      setBarcodeScannerProduct(null);
      await loadDashboard(session, true);
      setNotice({ tone: "success", message: "Barcode submitted for review." });
      return true;
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to submit scanned barcodes for review.",
      });
      return false;
    }
  }

  async function handleFindClaimReference(referencee: string) {
    if (!session) {
      setNotice({ tone: "info", message: "Sign in before searching returnable claims." });
      return;
    }

    const normalizedReference = referencee.trim();

    if (!normalizedReference) {
      setNotice({ tone: "info", message: "Enter a customer reference to search." });
      return;
    }

    setIsClaimLookupLoading(true);

    try {
      const results = await apiRequest<ProductBarcodeLookup[]>(
        session,
        `barcodes/reference/${encodeURIComponent(normalizedReference)}`,
      );
      setClaimResults(results);
      setNotice({
        tone: "success",
        message: `${results.length} barcode claim${results.length === 1 ? "" : "s"} found for ${normalizedReference}.`,
      });
    } catch (error) {
      setClaimResults([]);
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to find barcode claims.",
      });
    } finally {
      setIsClaimLookupLoading(false);
    }
  }

  async function handleClaimBarcodeByReference(referencee: string) {
    if (!session) {
      setNotice({ tone: "info", message: "Sign in before claiming returnable barcodes." });
      return;
    }

    const normalizedReference = referencee.trim();

    if (!normalizedReference) {
      setNotice({ tone: "info", message: "Enter a customer reference before claiming." });
      return;
    }

    setClaimingBarcodeId(-1);

    try {
      const claimed = await apiRequest<ProductBarcodeLookup>(
        session,
        `barcodes/reference/${encodeURIComponent(normalizedReference)}/claim`,
        { method: "POST" },
      );
      setClaimResults((results) => {
        if (!results.some((result) => result.id === claimed.id)) {
          return [claimed, ...results];
        }

        return results.map((result) => (result.id === claimed.id ? claimed : result));
      });
      setNotice({ tone: "success", message: `Barcode ${claimed.barcode} marked as claimed.` });
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to claim barcode by reference.",
      });
    } finally {
      setClaimingBarcodeId(null);
    }
  }

  async function handleClaimBarcodeById(barcodeId: number) {
    if (!session) {
      setNotice({ tone: "info", message: "Sign in before claiming returnable barcodes." });
      return;
    }

    setClaimingBarcodeId(barcodeId);

    try {
      const claimed = await apiRequest<ProductBarcodeLookup>(
        session,
        `barcodes/${barcodeId}/claim`,
        { method: "POST" },
      );
      setClaimResults((results) => {
        if (!results.some((result) => result.id === claimed.id)) {
          return [claimed, ...results];
        }

        return results.map((result) => (result.id === claimed.id ? claimed : result));
      });
      setNotice({ tone: "success", message: `Barcode ${claimed.barcode} marked as claimed.` });
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to claim barcode.",
      });
    } finally {
      setClaimingBarcodeId(null);
    }
  }

  async function handleCreateTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session) {
      setNotice({ tone: "info", message: "Sign in before recording stock movement." });
      return false;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const unitPrice = fieldValue(formData, "unitPrice");
    const employeeId = fieldValue(formData, "employeeId") || (isWorkerSession && currentUser ? String(currentUser.id) : "");
    const ownerId = fieldValue(formData, "ownerId") || (owner ? String(owner.id) : "");
    const productId = Number(fieldValue(formData, "productId"));
    const quantity = Number(fieldValue(formData, "quantity"));
    const transactionType = (isWorkerSession ? "SELL" : fieldValue(formData, "type")) as "BUY" | "SELL";
    const scannedBarcodes = formData
      .getAll("barcodes")
      .map((barcode) => String(barcode).trim())
      .filter(Boolean);

    if (!employeeId || !ownerId) {
      setNotice({
        tone: "info",
        message: "Worker ID and business owner ID are required to record stock movement. Set NEXT_PUBLIC_KING_SPARKON_OWNER_ID for worker sale entry until the backend derives ownerId from the tenant.",
      });
      return false;
    }

    if (!Number.isFinite(productId) || !Number.isFinite(quantity) || quantity < 1) {
      setNotice({ tone: "info", message: "Select a product and quantity before adding barcodes." });
      return false;
    }

    if (transactionType === "BUY" && scannedBarcodes.length > 0) {
      setNotice({ tone: "info", message: "BUY transactions must not send barcodes." });
      return false;
    }

    if (transactionType === "SELL" && scannedBarcodes.length !== quantity) {
      setNotice({ tone: "info", message: `SELL requires exactly ${quantity} scanned barcode${quantity === 1 ? "" : "s"}.` });
      return false;
    }

    try {
      const createdTransaction = await apiRequest<Transaction>(session, "transactions", {
        method: "POST",
        body: JSON.stringify({
          type: transactionType,
          employeeId: Number(employeeId),
          ownerId: Number(ownerId),
          items: [
            {
              productId,
              quantity,
              ...(unitPrice ? { unitPrice: Number(unitPrice) } : {}),
              ...(transactionType === "SELL" ? { barcodes: scannedBarcodes } : {}),
            },
          ],
        }),
      });
      form.reset();
      if (isWorkerSession) {
        const createdTransactionWithBarcodes: Transaction = {
          ...createdTransaction,
          items: createdTransaction.items.map((item) =>
            item.productId === productId ? { ...item, barcodes: scannedBarcodes } : item,
          ),
        };
        setWorkerTransactions((transactions) => [createdTransactionWithBarcodes, ...transactions].slice(0, 10));
      }
      setNotice({ tone: "success", message: "Transaction recorded and stock refreshed." });
      await loadDashboard(session, true);
      return true;
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to record transaction.",
      });
      return false;
    }
  }

  async function handleCreateWorker(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session) {
      setNotice({ tone: "info", message: "Sign in first to create worker accounts." });
      return;
    }

    if (!canCreateWorker) {
      setNotice({ tone: "info", message: "The backend allows a maximum of 2 worker accounts." });
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await apiRequest<TrackerUser>(session, "users/workers", {
        method: "POST",
        body: JSON.stringify({
          username: fieldValue(formData, "username"),
          emailAddress: fieldValue(formData, "emailAddress"),
          password: fieldValue(formData, "password"),
        }),
      });
      form.reset();
      await loadDashboard(session, true);
      setIsWorkerFormOpen(false);
      setNotice({ tone: "success", message: "Worker account created." });
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to create worker.",
      });
    }
  }

  async function handleDeleteWorker(user: TrackerUser) {
    if (!isWorkerUser(user)) {
      setNotice({ tone: "info", message: "Only worker accounts can be deleted from this table." });
      return;
    }

    if (!session) {
      setNotice({ tone: "info", message: "Sign in first to delete worker accounts." });
      return;
    }

    if (!window.confirm(`Delete worker ${user.username}?`)) {
      return;
    }

    try {
      await apiRequest<void>(session, `users/workers/${user.id}`, {
        method: "DELETE",
      });
      await loadDashboard(session, true);
      setNotice({ tone: "success", message: `Worker ${user.username} deleted.` });
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to delete worker.",
      });
    }
  }

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/login";
  }

  function handleReportFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setReportFilters({
      from: fieldValue(formData, "from"),
      to: fieldValue(formData, "to"),
    });
  }

  async function handleCreateSubscription(plan: Exclude<BusinessPlan, "FREE_TRIAL">, billingInterval: BillingInterval, termYears?: number) {
    if (!session || !isOwnerSession) {
      setNotice({ tone: "info", message: "Sign in as the owner to manage billing." });
      return;
    }

    try {
      setNotice({ tone: "info", message: "Opening secure Stripe Checkout." });
      const checkout = await apiRequest<StripeCheckoutSession>(session, "billing/stripe/checkout-sessions", {
        method: "POST",
        body: JSON.stringify({
          plan,
          billingInterval,
          termYears: billingInterval === "YEARLY" ? termYears ?? 1 : undefined,
        }),
      });

      if (checkout.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
        return;
      }

      throw new Error("Stripe Checkout did not return a redirect URL.");
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to open Stripe Checkout.",
      });
    }
  }

  async function handleActivateSubscription(subscriptionId: number) {
    if (!session || !isOwnerSession) {
      setNotice({ tone: "info", message: "Sign in as the owner to activate billing." });
      return;
    }

    try {
      await apiRequest<BusinessBilling>(session, `billing/subscriptions/${subscriptionId}/activate`, {
        method: "POST",
      });
      await loadDashboard(session, true);
      setNotice({ tone: "success", message: "Approved subscription activated." });
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to activate subscription.",
      });
    }
  }

  return (
    <main className="ks-dashboard min-h-screen bg-transparent text-[#141a21]">
      <div className="grid min-h-screen lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="border-b border-[#dfdacb] bg-white/90 px-5 py-5 shadow-[14px_0_42px_rgba(16,32,29,0.06)] backdrop-blur lg:border-b-0 lg:border-r lg:px-6">
          <div className="flex items-center justify-between gap-4 lg:block">
            <Image
              src="/king-sparkon-logo.png"
              alt="King Sparkon Tracker logo"
              width={220}
              height={220}
              priority
              className="h-auto w-[126px]"
            />
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d9d5c8] bg-white text-[#61706a] shadow-sm transition hover:border-[#123c33] hover:bg-[#eefaf3] hover:text-[#123c33] lg:hidden"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto lg:grid lg:overflow-visible">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === activeView;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveView(item.key);
                    if (item.key !== "transactions") {
                      setIsTransactionFormOpen(false);
                    }
                    if (item.key !== "products") {
                      setIsProductFormOpen(false);
                      setQuantityProduct(null);
                      setBarcodeScannerProduct(null);
                    }
                    if (item.key !== "workers") {
                      setIsWorkerFormOpen(false);
                    }
                  }}
                  className={`flex h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition lg:w-full ${
                    isActive
                      ? "bg-[#123c33] text-white shadow-lg shadow-[#123c33]/20"
                      : "text-[#61706a] hover:bg-[#eefaf3] hover:text-[#123c33] hover:shadow-sm"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 hidden rounded-xl border border-[#dfdacb] bg-[#fbfaf6] p-4 shadow-sm lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7b8782]">Current session</p>
            <p className="mt-2 truncate text-sm font-semibold text-[#10201d]">
              {currentUser?.username ?? "Not signed in"}
            </p>
            <p className="mt-1 truncate text-xs text-[#66746f]">
              {privilegeLabel(currentUser)}
            </p>
            <p className="mt-1 truncate text-xs text-[#66746f]">
              {businessLabel(currentUser)}
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#d9d5c8] bg-white text-sm font-semibold text-[#123c33] transition hover:border-[#123c33] hover:bg-[#123c33] hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </aside>

        <section className="min-w-0 px-5 py-6 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 border-b border-[#dfdacb] pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-[#e9f5ef] px-3 py-1 text-sm font-medium text-[#237a5b] ring-1 ring-[#237a5b]/10">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                {isWorkerDashboard ? "Worker workspace" : "Owner workspace"}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#10201d]">
                {isWorkerDashboard ? "Worker dashboard" : "Owner dashboard"}
              </h1>
              {currentUser?.businessName ? (
                <p className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#dfdacb] bg-white/75 px-3 py-1 text-sm font-semibold text-[#123c33]">
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  {currentUser.businessName}
                  {currentUser.businessId ? <span className="text-[#7b8782]">#{currentUser.businessId}</span> : null}
                </p>
              ) : null}
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#61706a]">
                {isWorkerDashboard
                  ? "Scan item barcodes, claim returnables, submit completed products, and record daily stock movement inside this business."
                  : "Manage a business-scoped catalogue, worker accounts, transactions, audit history, and owner reports backed by the Spring API."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#123c33] px-4 text-sm font-semibold text-white shadow-lg shadow-[#123c33]/20 transition hover:bg-[#0f4c3f] hover:shadow-xl hover:shadow-[#123c33]/20 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh data
            </button>
          </header>

          {notice ? (
            <div className={`mt-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 shadow-sm ${noticeClasses(notice.tone)}`}>
              {notice.tone === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span>{notice.message}</span>
            </div>
          ) : null}

          {!session && !isLoading ? (
            <div className="mt-6 rounded-lg border border-[#dfdacb] bg-white/95 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#10201d]">Sign-in required</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#61706a]">
                The dashboard uses protected backend endpoints. Sign in first so the UI can send your Bearer token to the backend.
              </p>
              <Link
                href="/login"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#123c33] px-4 text-sm font-semibold text-white shadow-lg shadow-[#123c33]/20 transition hover:bg-[#0f4c3f]"
              >
                Go to login
              </Link>
            </div>
          ) : null}

          <div className="mt-6">
            {activeView === "overview" ? (
              isWorkerSession ? (
                <WorkerOverviewView
                  products={data.products}
                  currentUser={currentUser}
                  isLoading={isLoading}
                />
              ) : (
                <OverviewView
                  data={data}
                  workers={workers}
                  isLoading={isLoading}
                />
              )
            ) : null}
            {activeView === "products" ? (
              <ProductsView
                products={data.products}
                isLoading={isLoading}
                canCreateProduct={isOwnerSession}
                canAddBarcode={isWorkerSession}
                onPaginationChange={setProductsPagination}
                onStartBarcodeScan={setBarcodeScannerProduct}
                onStartQuantityUpdate={setQuantityProduct}
                onSubmitApproval={handleSubmitProductApproval}
              />
            ) : null}
            {activeView === "transactions" ? (
              isWorkerSession ? (
                <WorkerTransactionsView
                  products={data.products.content}
                  currentUser={currentUser}
                  transactions={workerTransactions}
                  isLoading={isLoading}
                  isFormOpen={isTransactionFormOpen}
                  onCloseForm={() => setIsTransactionFormOpen(false)}
                  onValidateBarcode={validateProductBarcode}
                  onSubmit={handleCreateTransaction}
                />
              ) : (
                <TransactionsView
                  transactions={data.transactions}
                  products={data.products.content}
                  workers={workers}
                  owner={owner}
                  isLoading={isLoading}
                  isFormOpen={isTransactionFormOpen}
                  onCloseForm={() => setIsTransactionFormOpen(false)}
                  onPaginationChange={setTransactionsPagination}
                  onSubmit={handleCreateTransaction}
                />
              )
            ) : null}
            {activeView === "barcodes" ? (
              <BarcodesView products={data.products.content} isLoading={isLoading} />
            ) : null}
            {activeView === "claims" ? (
              <ClaimsView
                results={claimResults}
                isLoading={isClaimLookupLoading}
                claimingBarcodeId={claimingBarcodeId}
                onSearch={handleFindClaimReference}
                onClaimByReference={handleClaimBarcodeByReference}
                onClaimById={handleClaimBarcodeById}
              />
            ) : null}
            {activeView === "workers" ? (
              <WorkersView
                users={data.users}
                isLoading={isLoading}
                onPaginationChange={setUsersPagination}
                onDeleteWorker={handleDeleteWorker}
              />
            ) : null}
            {activeView === "reports" ? (
              <ReportsView
                data={data}
                filters={reportFilters}
                isLoading={isLoading}
                onSubmitFilters={handleReportFilters}
              />
            ) : null}
            {activeView === "audit" ? (
              <AuditLogsView
                auditLogs={data.auditLogs}
                isLoading={isLoading}
                onPaginationChange={setAuditPagination}
              />
            ) : null}
            {activeView === "billing" ? (
              <BillingView
                plans={data.billingPlans}
                billing={data.billing}
                dashboard={data.billingDashboard}
                isLoading={isLoading}
                onCreateSubscription={handleCreateSubscription}
                onActivateSubscription={handleActivateSubscription}
              />
            ) : null}
          </div>

          {activeView === "transactions" && !isTransactionFormOpen ? (
            <FloatingActionButton label="Add transaction" icon={Plus} onClick={() => setIsTransactionFormOpen(true)} />
          ) : null}
          {activeView === "products" && isOwnerSession && !isProductFormOpen && !quantityProduct ? (
            <FloatingActionButton label="Add product" icon={PackagePlus} onClick={() => setIsProductFormOpen(true)} />
          ) : null}
          {activeView === "workers" && isOwnerSession && !isWorkerFormOpen ? (
            <FloatingActionButton label="Add worker" icon={UsersRound} onClick={() => setIsWorkerFormOpen(true)} />
          ) : null}
          {isProductFormOpen ? (
            <ProductCreateModal onClose={() => setIsProductFormOpen(false)} onSubmit={handleCreateProduct} />
          ) : null}
          {quantityProduct ? (
            <ProductQuantityModal
              product={quantityProduct}
              onClose={() => setQuantityProduct(null)}
              onSubmit={handleUpdateProductQuantity}
            />
          ) : null}
          {isWorkerFormOpen ? (
            <WorkerCreateModal
              workers={workers}
              canCreateWorker={canCreateWorker}
              onClose={() => setIsWorkerFormOpen(false)}
              onSubmit={handleCreateWorker}
            />
          ) : null}
          {barcodeScannerProduct ? (
            <ProductBarcodeScannerModal
              key={barcodeScannerProduct.id}
              product={barcodeScannerProduct}
              onClose={() => setBarcodeScannerProduct(null)}
              onSubmit={handleSubmitScannedProductBarcodes}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-[#dfdacb] bg-white/95 p-5 shadow-[0_14px_38px_rgba(16,32,29,0.08)] transition hover:border-[#b9cbbf] hover:shadow-[0_18px_48px_rgba(16,32,29,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#61706a]">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-[#10201d]">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f5ef] text-[#237a5b] ring-1 ring-[#237a5b]/10">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-[#7b8782]">{hint}</p>
    </div>
  );
}

function LoadingText({ isLoading, fallback = "No records yet" }: { isLoading: boolean; fallback?: string }) {
  return <span className="text-sm text-[#7b8782]">{isLoading ? "Loading backend data..." : fallback}</span>;
}

function PaginationControls({
  page,
  onChange,
}: {
  page: PageResponse<unknown>;
  onChange: (pagination: PaginationState) => void;
}) {
  const totalPages = Math.max(page.totalPages, page.content.length ? 1 : 0);
  const currentPage = totalPages ? page.page + 1 : 0;

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-[#ece7d8] pt-4 text-sm text-[#61706a] sm:flex-row sm:items-center sm:justify-between">
      <p>
        Page <span className="font-semibold text-[#10201d]">{currentPage}</span> of{" "}
        <span className="font-semibold text-[#10201d]">{totalPages}</span> · {page.totalElements} rows
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Rows per page"
          value={page.size}
          onChange={(event) => onChange({ page: 0, size: Number(event.target.value) })}
          className="h-9 rounded-lg border border-[#d3c9b9] bg-white px-2 text-sm text-[#10201d]"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onChange({ page: Math.max(page.page - 1, 0), size: page.size })}
          disabled={page.first || totalPages === 0}
          className="inline-flex h-9 items-center rounded-lg border border-[#d9d5c8] px-3 text-xs font-semibold text-[#123c33] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onChange({ page: Math.min(page.page + 1, Math.max(totalPages - 1, 0)), size: page.size })}
          disabled={page.last || totalPages === 0}
          className="inline-flex h-9 items-center rounded-lg border border-[#d9d5c8] px-3 text-xs font-semibold text-[#123c33] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function OverviewView({
  data,
  workers,
  isLoading,
}: {
  data: DashboardData;
  workers: TrackerUser[];
  isLoading: boolean;
}) {
  const inventory = data.inventory;
  const categoryReport = data.categoryReport;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Products"
          value={String(inventory?.totalProducts ?? 0)}
          hint={`${inventory?.alcoholProducts ?? 0} alcohol, ${inventory?.nonAlcoholProducts ?? 0} non-alcohol`}
          icon={Boxes}
        />
        <StatCard
          label="Stock value"
          value={money(inventory?.totalStockValue)}
          hint={`${inventory?.totalStockQuantity ?? 0} units currently tracked`}
          icon={WalletCards}
        />
        <StatCard
          label="Low stock"
          value={String(inventory?.lowStockProducts ?? 0)}
          hint="Uses the backend low-stock threshold of 5 units"
          icon={AlertCircle}
        />
        <StatCard
          label="Workers"
          value={`${workers.length}/${WORKER_LIMIT}`}
          hint="Backend allows the owner to create up to two workers"
          icon={UsersRound}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#10201d]">Category movement report</h2>
              <p className="mt-1 text-sm text-[#61706a]">Bought and sold totals for the configured product category.</p>
            </div>
            <BarChart3 className="h-5 w-5 text-[#237a5b]" aria-hidden="true" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MetricLine label="Bought units" value={String(categoryReport?.boughtQuantity ?? 0)} />
            <MetricLine label="Sold units" value={String(categoryReport?.soldQuantity ?? 0)} />
            <MetricLine label="Bought value" value={money(categoryReport?.boughtValue)} />
            <MetricLine label="Sold value" value={money(categoryReport?.soldValue)} />
          </div>
        </section>

        <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#10201d]">Product movement</h2>
              <p className="mt-1 text-sm text-[#61706a]">Ranked movement from `/api/reports/product-movement`.</p>
            </div>
            <ClipboardList className="h-5 w-5 text-[#237a5b]" aria-hidden="true" />
          </div>
          <div className="mt-5 overflow-x-auto">
            {data.movements.length ? (
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.08em] text-[#7b8782]">
                  <tr className="border-b border-[#ece7d8]">
                    <th className="py-3 font-semibold">Product</th>
                    <th className="py-3 font-semibold">Category</th>
                    <th className="py-3 font-semibold">Bought</th>
                    <th className="py-3 font-semibold">Sold</th>
                    <th className="py-3 font-semibold">Sold value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.movements.slice(0, 6).map((movement) => (
                    <tr key={movement.productId} className="border-b border-[#f1ede2] last:border-0">
                      <td className="py-3 font-medium text-[#10201d]">{movement.productName}</td>
                      <td className="py-3 text-[#61706a]">{productCategoryLabel(movement.category)}</td>
                      <td className="py-3 text-[#61706a]">{movement.boughtQuantity}</td>
                      <td className="py-3 text-[#61706a]">{movement.soldQuantity}</td>
                      <td className="py-3 text-[#61706a]">{money(movement.soldValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <LoadingText isLoading={isLoading} fallback="No product movement has been recorded." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function WorkerOverviewView({
  products,
  currentUser,
  isLoading,
}: {
  products: PageResponse<Product>;
  currentUser: TrackerUser | null;
  isLoading: boolean;
}) {
  const productList = products.content;
  const barcodeQueue = productsNeedingBarcodes(productList);
  const approvalQueue = productsReadyForApproval(productList);
  const pendingApproval = productList.filter((product) => product.status === "PENDING_APPROVAL");
  const totalStock = productList.reduce((sum, product) => sum + product.stockQuantity, 0);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Products"
          value={String(products.totalElements)}
          hint={`${totalStock} stock units available to move`}
          icon={Boxes}
        />
        <StatCard
          label="Needs barcodes"
          value={String(barcodeQueue.length)}
          hint="CREATED products with open barcode slots"
          icon={ClipboardList}
        />
        <StatCard
          label="Ready approval"
          value={String(approvalQueue.length)}
          hint="Barcode count matches stock quantity"
          icon={CheckCircle2}
        />
        <StatCard
          label="Worker"
          value={currentUser ? `#${currentUser.id}` : "-"}
          hint={currentUser?.username ?? "Authenticated worker profile"}
          icon={ShieldCheck}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#10201d]">Barcode work queue</h2>
              <p className="mt-1 text-sm text-[#61706a]">{barcodeQueue.length} products still need item labels.</p>
            </div>
            <ClipboardList className="h-5 w-5 text-[#237a5b]" aria-hidden="true" />
          </div>
          <div className="mt-5 overflow-x-auto">
            {barcodeQueue.length ? (
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.08em] text-[#7b8782]">
                  <tr className="border-b border-[#ece7d8]">
                    <th className="py-3 font-semibold">Product</th>
                    <th className="py-3 font-semibold">Category</th>
                    <th className="py-3 font-semibold">Status</th>
                    <th className="py-3 font-semibold">Barcodes</th>
                    <th className="py-3 font-semibold">Sale price</th>
                  </tr>
                </thead>
                <tbody>
                  {barcodeQueue.slice(0, 6).map((product) => (
                    <tr key={product.id} className="border-b border-[#f1ede2] last:border-0">
                      <td className="py-3 font-medium text-[#10201d]">{product.name}</td>
                      <td className="py-3 text-[#61706a]">{productCatalogLabel(product)}</td>
                      <td className="py-3"><ProductStatusPill status={product.status} /></td>
                      <td className="py-3 text-[#61706a]">
                        {assignedBarcodeCount(product)}/{product.stockQuantity}
                      </td>
                      <td className="py-3 text-[#61706a]">{money(product.salePrice ?? product.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <LoadingText isLoading={isLoading} fallback="No barcode work is waiting." />
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#10201d]">Approval queue</h2>
              <p className="mt-1 text-sm text-[#61706a]">{pendingApproval.length} products already pending owner approval.</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-[#237a5b]" aria-hidden="true" />
          </div>
          <div className="mt-5 grid gap-3">
            <MetricLine label="Ready to submit" value={String(approvalQueue.length)} />
            <MetricLine label="Pending approval" value={String(pendingApproval.length)} />
          </div>
        </section>
      </div>
    </div>
  );
}

function ReportsView({
  data,
  filters,
  isLoading,
  onSubmitFilters,
}: {
  data: DashboardData;
  filters: ReportFilters;
  isLoading: boolean;
  onSubmitFilters: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const inventory = data.inventory;
  const categoryReport = data.categoryReport;

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#10201d]">Reports</h2>
            <p className="mt-1 text-sm text-[#61706a]">
              Inventory summary is live; category and product movement use the selected date window.
            </p>
          </div>
          <form className="grid gap-3 sm:grid-cols-[150px_150px_auto]" onSubmit={onSubmitFilters}>
            <DashboardInput name="from" label="From" type="date" defaultValue={filters.from} />
            <DashboardInput name="to" label="To" type="date" defaultValue={filters.to} />
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center self-end rounded-xl bg-[#123c33] px-4 text-sm font-semibold text-white shadow-lg shadow-[#123c33]/15 transition hover:bg-[#0f4c3f]"
            >
              Apply dates
            </button>
          </form>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total products" value={String(inventory?.totalProducts ?? 0)} hint="Tenant-scoped product count" icon={Boxes} />
        <StatCard label="Stock units" value={String(inventory?.totalStockQuantity ?? 0)} hint="Current stock across products" icon={PackagePlus} />
        <StatCard label="Stock value" value={money(inventory?.totalStockValue)} hint="Backend inventory valuation" icon={WalletCards} />
        <StatCard label="Low stock" value={String(inventory?.lowStockProducts ?? 0)} hint="Threshold uses 5 units" icon={AlertCircle} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#10201d]">Category movement report</h2>
              <p className="mt-1 text-sm text-[#61706a]">
                {categoryReport?.from || categoryReport?.to
                  ? `${dateLabel(categoryReport.from ?? undefined)} to ${dateLabel(categoryReport.to ?? undefined)}`
                  : "All available dates"}
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-[#237a5b]" aria-hidden="true" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MetricLine label="Bought units" value={String(categoryReport?.boughtQuantity ?? 0)} />
            <MetricLine label="Sold units" value={String(categoryReport?.soldQuantity ?? 0)} />
            <MetricLine label="Bought value" value={money(categoryReport?.boughtValue)} />
            <MetricLine label="Sold value" value={money(categoryReport?.soldValue)} />
          </div>
        </section>

        <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
          <h2 className="text-lg font-semibold text-[#10201d]">Product movement</h2>
          <p className="mt-1 text-sm text-[#61706a]">{data.movements.length} product rows from `/api/reports/product-movement`.</p>
          <div className="mt-5 overflow-x-auto">
            {data.movements.length ? (
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.08em] text-[#7b8782]">
                  <tr className="border-b border-[#ece7d8]">
                    <th className="py-3 font-semibold">Product</th>
                    <th className="py-3 font-semibold">Category</th>
                    <th className="py-3 font-semibold">Bought</th>
                    <th className="py-3 font-semibold">Sold</th>
                    <th className="py-3 font-semibold">Bought value</th>
                    <th className="py-3 font-semibold">Sold value</th>
                    <th className="py-3 font-semibold">Barcodes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.movements.map((movement) => (
                    <tr key={movement.productId} className="border-b border-[#f1ede2] last:border-0">
                      <td className="py-3 font-medium text-[#10201d]">{movement.productName}</td>
                      <td className="py-3 text-[#61706a]">{productCategoryLabel(movement.category)}</td>
                      <td className="py-3 text-[#61706a]">{movement.boughtQuantity}</td>
                      <td className="py-3 text-[#61706a]">{movement.soldQuantity}</td>
                      <td className="py-3 text-[#61706a]">{money(movement.boughtValue)}</td>
                      <td className="py-3 text-[#61706a]">{money(movement.soldValue)}</td>
                      <td className="py-3 text-[#61706a]">{movement.barcodes?.length ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <LoadingText isLoading={isLoading} fallback="No product movement has been recorded for this date range." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#ece7d8] bg-[#fbfaf6] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7b8782]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-[#10201d]">{value}</p>
    </div>
  );
}

function BillingView({
  plans,
  billing,
  dashboard,
  isLoading,
  onCreateSubscription,
  onActivateSubscription,
}: {
  plans: BillingPlan[];
  billing: BusinessBilling | null;
  dashboard: BillingDashboard | null;
  isLoading: boolean;
  onCreateSubscription: (plan: Exclude<BusinessPlan, "FREE_TRIAL">, billingInterval: BillingInterval, termYears?: number) => void;
  onActivateSubscription: (subscriptionId: number) => void;
}) {
  const paidPlans = plans.filter((plan) => plan.plan !== "FREE_TRIAL") as Array<BillingPlan & { plan: Exclude<BusinessPlan, "FREE_TRIAL"> }>;

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#10201d]">Current billing</h2>
            <p className="mt-1 text-sm text-[#61706a]">
              {billing ? `${billing.businessName} is on ${billing.businessPlan}.` : "Billing status is loading from the backend."}
            </p>
          </div>
          {billing?.stripeCheckoutUrl ? (
            <a
              href={billing.stripeCheckoutUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#123c33] px-4 text-sm font-semibold text-white shadow-lg shadow-[#123c33]/15 transition hover:bg-[#0f4c3f]"
            >
              Resume Stripe checkout
            </a>
          ) : billing?.paypalApprovalUrl ? (
            <a
              href={billing.paypalApprovalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#123c33] px-4 text-sm font-semibold text-white shadow-lg shadow-[#123c33]/15 transition hover:bg-[#0f4c3f]"
            >
              Open PayPal approval
            </a>
          ) : null}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricLine label="Plan" value={dashboard?.currentPlan ?? billing?.businessPlan ?? "FREE_TRIAL"} />
          <MetricLine label="Business status" value={dashboard?.businessStatus ?? billing?.businessStatus ?? "-"} />
          <MetricLine label="Payment" value={dashboard?.paymentStatus ?? billing?.paymentStatus ?? "No paid subscription"} />
          <MetricLine label="Trial days left" value={String(dashboard?.trialDaysLeft ?? 0)} />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <BillingFlag label="Products" enabled={dashboard?.canUseProducts} />
          <BillingFlag label="Barcode scanning" enabled={dashboard?.canUseBarcodeScanning} />
          <BillingFlag label="Tips platform" enabled={dashboard?.canUseWorkerTipsPlatform} />
          <BillingFlag label="Business AI" enabled={dashboard?.canUseBusinessAnalysisAi} />
          <BillingFlag label="Worker clocker" enabled={dashboard?.canUseWorkerClocker} />
        </div>
        {billing?.subscriptionId && billing?.paypalApprovalUrl ? (
          <button
            type="button"
            onClick={() => onActivateSubscription(billing.subscriptionId as number)}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-xl border border-[#d9d5c8] px-4 text-sm font-semibold text-[#123c33] transition hover:border-[#123c33] hover:bg-[#eefaf3]"
          >
            Activate approved subscription
          </button>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {paidPlans.length ? (
          paidPlans.map((plan) => (
            <div key={plan.plan} className="rounded-lg border border-[#dfdacb] bg-white p-5 shadow-[0_14px_38px_rgba(16,32,29,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#10201d]">{plan.displayName}</h3>
                  <p className="mt-1 text-sm text-[#61706a]">
                    {money(plan.monthlyPrice)} / month · {plan.unlimitedWorkers ? "Unlimited workers" : `${plan.maxWorkers} workers`}
                  </p>
                </div>
                <span className="rounded-md bg-[#e9f5ef] px-2 py-1 text-xs font-semibold text-[#237a5b]">
                  {plan.plan}
                </span>
              </div>
              <ul className="mt-5 grid gap-2 text-sm text-[#61706a]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#237a5b]" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onCreateSubscription(plan.plan, "MONTHLY")}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-[#123c33] px-4 text-sm font-semibold text-white transition hover:bg-[#0f4c3f]"
                >
                  Monthly checkout
                </button>
                <button
                  type="button"
                  onClick={() => onCreateSubscription(plan.plan, "YEARLY", 1)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d9d5c8] px-4 text-sm font-semibold text-[#123c33] transition hover:border-[#123c33] hover:bg-[#eefaf3]"
                >
                  Yearly checkout
                </button>
              </div>
            </div>
          ))
        ) : (
          <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
            <LoadingText isLoading={isLoading} fallback="No paid billing plans are available." />
          </section>
        )}
      </section>
    </div>
  );
}

function BillingFlag({ label, enabled }: { label: string; enabled?: boolean }) {
  return (
    <div className="rounded-md border border-[#ece7d8] bg-[#fbfaf6] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7b8782]">{label}</p>
      <p className={`mt-2 text-sm font-semibold ${enabled ? "text-[#237a5b]" : "text-[#8b2d1f]"}`}>
        {enabled ? "Enabled" : "Limited"}
      </p>
    </div>
  );
}

function ProductCreateModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <TransactionFormModal title="Add product" onClose={onClose}>
      <p className="mt-1 text-sm leading-6 text-[#61706a]">
        Create the owner product record first. Workers will register the item barcodes against this quantity.
      </p>
      <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
        <DashboardInput name="name" label="Product name" placeholder="Retail item" required />
        <DashboardSelect
          name="category"
          label="Product group"
          options={[
            { label: "Alcohol products", value: "Alcohol" },
            { label: "Non-alcohol products", value: "NonAlcohol" },
          ]}
        />
        <DashboardInput name="price" label="Unit price" type="number" min="0" step="0.01" placeholder="20.50" required />
        <DashboardCheckbox name="returnableEnabled" label="Returnable item" />
        <DashboardInput name="returnablePrice" label="Returnable price" type="number" min="0" step="0.01" placeholder="5.00" defaultValue="0" />
        <DashboardCheckbox name="nightShiftEnabled" label="Night shift price" />
        <DashboardInput name="nightShiftPrice" label="Night shift surcharge" type="number" min="0" step="0.01" placeholder="7.50" defaultValue="0" />
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardInput name="nightShiftStartTime" label="Night shift start" type="time" step="1" defaultValue="22:00:00" />
          <DashboardInput name="nightShiftEndTime" label="Night shift end" type="time" step="1" defaultValue="06:00:00" />
        </div>
        <DashboardInput name="stockQuantity" label="Opening stock" type="number" min="0" step="1" placeholder="20" required />
        <PrimaryButton label="Create product" icon={PackagePlus} />
      </form>
    </TransactionFormModal>
  );
}

function ProductQuantityModal({
  product,
  onClose,
  onSubmit,
}: {
  product: Product;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const barcodeCount = assignedBarcodeCount(product);

  return (
    <TransactionFormModal title="Update quantity" onClose={onClose}>
      <p className="mt-1 text-sm leading-6 text-[#61706a]">
        The backend prevents quantity from going below the barcode count already registered for this product.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetricLine label="Current quantity" value={String(product.stockQuantity)} />
        <MetricLine label="Registered barcodes" value={String(barcodeCount)} />
      </div>
      <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
        <DashboardInput label="Product" value={product.name} readOnly />
        <DashboardInput
          name="stockQuantity"
          label="Update quantity"
          type="number"
          min={barcodeCount}
          step="1"
          defaultValue={product.stockQuantity}
          required
        />
        <PrimaryButton label="Save quantity" icon={Pencil} />
      </form>
    </TransactionFormModal>
  );
}

function ProductsView({
  products,
  isLoading,
  canCreateProduct,
  canAddBarcode,
  onPaginationChange,
  onStartBarcodeScan,
  onStartQuantityUpdate,
  onSubmitApproval,
}: {
  products: PageResponse<Product>;
  isLoading: boolean;
  canCreateProduct: boolean;
  canAddBarcode: boolean;
  onPaginationChange: (pagination: PaginationState) => void;
  onStartBarcodeScan: (product: Product) => void;
  onStartQuantityUpdate: (product: Product) => void;
  onSubmitApproval: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (canAddBarcode && !canCreateProduct) {
    return (
      <WorkerProductsView
        products={products}
        isLoading={isLoading}
        onPaginationChange={onPaginationChange}
        onStartBarcodeScan={onStartBarcodeScan}
        onSubmitApproval={onSubmitApproval}
      />
    );
  }

  return (
    <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#10201d]">Products</h2>
          <p className="mt-1 text-sm text-[#61706a]">
            {products.totalElements} products from the backend.
          </p>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        {products.content.length ? (
          <table className="w-full min-w-[1300px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-[#7b8782]">
              <tr className="border-b border-[#ece7d8]">
                <th className="py-3 pr-4 font-semibold">ID</th>
                <th className="py-3 font-semibold">Name</th>
                <th className="py-3 font-semibold">Catalog</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold">Price</th>
                <th className="py-3 font-semibold">Sale price</th>
                <th className="py-3 font-semibold">Returnable item</th>
                <th className="py-3 font-semibold">Stock quantity</th>
                <th className="py-3 font-semibold">Barcode count</th>
                <th className="py-3 font-semibold">Remaining slots</th>
                <th className="sticky right-0 bg-[#f3f5ee] py-3 pl-4 font-semibold shadow-[-12px_0_18px_rgba(16,32,29,0.06)]">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.content.map((product) => (
                <tr key={product.id} className="border-b border-[#f1ede2] last:border-0">
                  <td className="py-3 pr-4 font-medium text-[#10201d]">#{product.id}</td>
                  <td className="py-3 font-medium text-[#10201d]">{product.name}</td>
                  <td className="py-3 text-[#61706a]">{productCatalogLabel(product)}</td>
                  <td className="py-3"><ProductStatusPill status={product.status} /></td>
                  <td className="py-3 text-[#61706a]">{money(product.price)}</td>
                  <td className="py-3 text-[#61706a]">{money(product.salePrice ?? product.price)}</td>
                  <td className="py-3 text-[#61706a]">{productReturnableEnabled(product) ? "Yes" : "No"}</td>
                  <td className="py-3 text-[#61706a]">{product.stockQuantity}</td>
                  <td className="py-3 text-[#61706a]">{assignedBarcodeCount(product)}</td>
                  <td className="py-3 text-[#61706a]">{remainingBarcodeSlots(product)}</td>
                  <td className="sticky right-0 bg-white py-3 pl-4 shadow-[-12px_0_18px_rgba(16,32,29,0.06)]">
                    <button
                      type="button"
                      onClick={() => onStartQuantityUpdate(product)}
                      disabled={!canCreateProduct}
                      className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#d9d5c8] px-3 text-xs font-semibold text-[#123c33] transition hover:border-[#123c33] hover:bg-[#eefaf3] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Update quantity
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <LoadingText isLoading={isLoading} fallback="No products have been created." />
        )}
      </div>
      <PaginationControls page={products} onChange={onPaginationChange} />
    </section>
  );
}

function WorkerProductsView({
  products,
  isLoading,
  onPaginationChange,
  onStartBarcodeScan,
  onSubmitApproval,
}: {
  products: PageResponse<Product>;
  isLoading: boolean;
  onPaginationChange: (pagination: PaginationState) => void;
  onStartBarcodeScan: (product: Product) => void;
  onSubmitApproval: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#10201d]">Products</h2>
          <p className="mt-1 text-sm text-[#61706a]">
            {products.totalElements} products assigned for barcode registration.
          </p>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        {products.content.length ? (
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-[#7b8782]">
              <tr className="border-b border-[#ece7d8]">
                <th className="py-3 pr-4 font-semibold">ID</th>
                <th className="py-3 font-semibold">Product name</th>
                <th className="py-3 font-semibold">Catalog</th>
                <th className="py-3 font-semibold">Quantity</th>
                <th className="py-3 font-semibold">Barcode registered</th>
                <th className="py-3 font-semibold">Barcode left to register</th>
                <th className="py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.content.map((product) => (
                <tr key={product.id} className="border-b border-[#f1ede2] last:border-0">
                  <td className="py-3 pr-4 font-medium text-[#10201d]">#{product.id}</td>
                  <td className="py-3 font-medium text-[#10201d]">{product.name}</td>
                  <td className="py-3 text-[#61706a]">{productCatalogLabel(product)}</td>
                  <td className="py-3 text-[#61706a]">{product.stockQuantity}</td>
                  <td className="py-3 text-[#61706a]">{assignedBarcodeCount(product)}</td>
                  <td className="py-3 text-[#61706a]">{remainingBarcodeSlots(product)}</td>
                  <td className="py-3">
                    <WorkerProductAction
                      product={product}
                      onStartBarcodeScan={onStartBarcodeScan}
                      onSubmitApproval={onSubmitApproval}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <LoadingText isLoading={isLoading} fallback="No products are available." />
        )}
      </div>
      <PaginationControls page={products} onChange={onPaginationChange} />
    </section>
  );
}

function WorkerProductAction({
  product,
  onStartBarcodeScan,
  onSubmitApproval,
}: {
  product: Product;
  onStartBarcodeScan: (product: Product) => void;
  onSubmitApproval: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const registered = assignedBarcodeCount(product);
  const remaining = remainingBarcodeSlots(product);

  if (isApprovedProduct(product)) {
    return <span className="rounded-md bg-[#e9f5ef] px-3 py-2 text-xs font-semibold text-[#237a5b]">Approved</span>;
  }

  if (product.status === "PENDING_APPROVAL") {
    return <span className="rounded-md bg-[#fff8e8] px-3 py-2 text-xs font-semibold text-[#6f5620]">Submitted</span>;
  }

  if (remaining > 0) {
    return (
      <button
        type="button"
        onClick={() => onStartBarcodeScan(product)}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#123c33] px-3 text-xs font-semibold text-white transition hover:bg-[#1b5b4a]"
      >
        <Barcode className="h-4 w-4" aria-hidden="true" />
        Add barcodes
      </button>
    );
  }

  if (registered > 0) {
    return (
      <form onSubmit={onSubmitApproval}>
        <input type="hidden" name="productId" value={product.id} />
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#123c33] px-3 text-xs font-semibold text-white transition hover:bg-[#1b5b4a]"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Submit barcodes
        </button>
      </form>
    );
  }

  return <span className="text-xs font-semibold text-[#61706a]">No barcodes</span>;
}

function ProductBarcodeScannerModal({
  product,
  onClose,
  onSubmit,
}: {
  product: Product;
  onClose: () => void;
  onSubmit: (product: Product, barcodes: string[], referencee?: string) => Promise<boolean> | boolean;
}) {
  const registeredCount = assignedBarcodeCount(product);
  const targetCount = remainingBarcodeSlots(product);
  const existingBarcodes = useMemo(() => productBarcodes(product).map((barcode) => barcode.barcode), [product]);
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);
  const [referencee, setReferencee] = useState("");
  const [scannerMessage, setScannerMessage] = useState(
    targetCount > 0
      ? `Scan 0/${targetCount} barcode${targetCount === 1 ? "" : "s"} for this product.`
      : "This product has no barcode slots left to register.",
  );
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const scannedBarcodesRef = useRef<string[]>([]);
  const existingBarcodesRef = useRef<string[]>(existingBarcodes);
  const targetCountRef = useRef(targetCount);
  const lastDetectedBarcodeRef = useRef({ value: "", time: 0 });
  const isScanComplete = targetCount > 0 && scannedBarcodes.length === targetCount;

  const stopScanner = useCallback(() => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    setIsScanning(false);
  }, []);

  useEffect(() => {
    scannedBarcodesRef.current = scannedBarcodes;
    existingBarcodesRef.current = existingBarcodes;
    targetCountRef.current = targetCount;
  }, [existingBarcodes, scannedBarcodes, targetCount]);

  useEffect(() => stopScanner, [stopScanner]);

  function registerScannedBarcode(rawBarcode: string, controls?: IScannerControls) {
    const barcode = rawBarcode.trim();
    const target = targetCountRef.current;
    const now = Date.now();

    if (!barcode || target < 1) {
      return;
    }

    if (lastDetectedBarcodeRef.current.value === barcode && now - lastDetectedBarcodeRef.current.time < 1200) {
      return;
    }

    lastDetectedBarcodeRef.current = { value: barcode, time: now };

    if (existingBarcodesRef.current.includes(barcode)) {
      setScannerMessage(`Barcode ${barcode} is already registered on this product.`);
      return;
    }

    if (scannedBarcodesRef.current.includes(barcode)) {
      setScannerMessage(`Barcode ${barcode} is already counted in this scan.`);
      return;
    }

    if (scannedBarcodesRef.current.length >= target) {
      controls?.stop();
      scannerControlsRef.current = null;
      setIsScanning(false);
      return;
    }

    setScannedBarcodes((currentBarcodes) => {
      if (currentBarcodes.includes(barcode)) {
        return currentBarcodes;
      }

      const nextBarcodes = [...currentBarcodes, barcode].slice(0, target);

      if (nextBarcodes.length >= target) {
        controls?.stop();
        scannerControlsRef.current = null;
        setIsScanning(false);
        setScannerMessage(`${nextBarcodes.length}/${target} barcodes ready for review.`);
      } else {
        setScannerMessage(`${nextBarcodes.length}/${target} barcodes scanned.`);
      }

      return nextBarcodes;
    });
  }

  async function handleStartScanner() {
    if (isScanComplete || isSubmitting) {
      return;
    }

    if (targetCount < 1) {
      setScannerMessage("This product has no barcode slots left to register.");
      return;
    }

    if (!videoRef.current) {
      setScannerMessage("Scanner preview is not ready yet.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerMessage("Camera access is not available in this browser.");
      return;
    }

    try {
      stopScanner();
      setScannerMessage(`Scanning ${scannedBarcodesRef.current.length}/${targetCount} barcodes.`);
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result, _error, activeControls) => {
        if (result) {
          registerScannedBarcode(result.getText(), activeControls);
        }
      });
      scannerControlsRef.current = controls;
      setIsScanning(true);
    } catch (error) {
      setIsScanning(false);
      setScannerMessage(error instanceof Error ? error.message : "Unable to start barcode scanner.");
    }
  }

  function handleQuit() {
    stopScanner();
    onClose();
  }

  async function handleSubmit() {
    if (!isScanComplete || isSubmitting) {
      setScannerMessage(`Scan ${targetCount} barcode${targetCount === 1 ? "" : "s"} before submitting.`);
      return;
    }

    setIsSubmitting(true);
    const submitted = await onSubmit(product, scannedBarcodes, referencee);

    if (submitted) {
      stopScanner();
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <TransactionFormModal title="Add product barcodes" onClose={handleQuit}>
      <p className="mt-1 text-sm leading-6 text-[#61706a]">
        Scan every barcode left for {product.name}, then submit the completed count for owner review.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-[#ece7d8] bg-[#fbfaf6] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7b8782]">Product type</p>
          <p className="mt-2 text-sm font-semibold text-[#10201d]">{productCatalogLabel(product)}</p>
        </div>
        <div className="rounded-md border border-[#ece7d8] bg-[#fbfaf6] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7b8782]">Quantity available</p>
          <p className="mt-2 text-sm font-semibold text-[#10201d]">{product.stockQuantity}</p>
        </div>
        <div className="rounded-md border border-[#ece7d8] bg-[#fbfaf6] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7b8782]">Barcode registered</p>
          <p className="mt-2 text-sm font-semibold text-[#10201d]">{registeredCount}</p>
        </div>
        <div className="rounded-md border border-[#ece7d8] bg-[#fbfaf6] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7b8782]">Left for review</p>
          <p className="mt-2 text-sm font-semibold text-[#10201d]">{targetCount}</p>
        </div>
      </div>

      {productReturnableEnabled(product) ? (
        <div className="mt-5">
          <DashboardInput
            label="Customer reference"
            value={referencee}
            onChange={(event) => setReferencee(event.target.value)}
            placeholder="0821234567"
          />
        </div>
      ) : null}

      <div className="mt-5 rounded-lg border border-[#dfdacb] bg-[#fbfaf6] p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#10201d]">Barcode counter</p>
            <p className="mt-1 text-xs text-[#61706a]">
              {scannedBarcodes.length}/{targetCount} required
            </p>
          </div>
          {isScanning ? (
            <span className="rounded-md bg-[#e9f5ef] px-2 py-1 text-xs font-semibold text-[#237a5b]">
              Scanning
            </span>
          ) : null}
        </div>
        <video
          ref={videoRef}
          className="mt-3 aspect-video w-full rounded-md bg-[#10201d] object-cover"
          muted
          playsInline
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {scannedBarcodes.length ? (
            scannedBarcodes.map((barcode) => (
              <span key={barcode} className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-[#123c33]">
                {barcode}
              </span>
            ))
          ) : (
            <span className="text-xs text-[#61706a]">{scannerMessage}</span>
          )}
        </div>
        {scannedBarcodes.length ? <p className="mt-3 text-xs text-[#61706a]">{scannerMessage}</p> : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[auto_1fr]">
        <button
          type="button"
          onClick={handleQuit}
          className="inline-flex h-11 items-center justify-center rounded-md border border-[#d9d5c8] px-4 text-sm font-semibold text-[#123c33] transition hover:bg-[#fbfaf6]"
        >
          Quit
        </button>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleStartScanner}
            disabled={isScanComplete || isScanning || isSubmitting || targetCount < 1}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#123c33] px-4 text-sm font-semibold text-[#123c33] transition hover:bg-[#e9f5ef] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Barcode className="h-4 w-4" aria-hidden="true" />
            {isScanning ? "Scanning..." : "Start scanner"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isScanComplete || isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#123c33] px-4 text-sm font-semibold text-white shadow-lg shadow-[#123c33]/15 transition hover:bg-[#1b5b4a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {isSubmitting ? "Submitting..." : "Submit barcodes"}
          </button>
        </div>
      </div>
    </TransactionFormModal>
  );
}

function ProductStatusPill({ status }: { status?: ProductStatus }) {
  const productStatus = status ?? "CREATED";
  const isPending = productStatus === "PENDING_APPROVAL";
  const isApproved = productStatus === "APPROVED";

  return (
    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${isPending ? "bg-[#fff8e8] text-[#6f5620]" : "bg-[#e9f5ef] text-[#237a5b]"}`}>
      {isApproved ? "Approved" : isPending ? "Pending approval" : "Created"}
    </span>
  );
}

function BarcodeStatusPill({ status }: { status?: ProductBarcodeStatus }) {
  const barcodeStatus = status ?? "NOT_CLAIMED";
  const isClaimed = barcodeStatus === "CLAIMED";
  const isExpired = barcodeStatus === "EXPIRED";

  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-semibold ${
        isExpired
          ? "bg-[#fff1ec] text-[#8b2d1f]"
          : isClaimed
            ? "bg-[#e9f5ef] text-[#237a5b]"
            : "bg-[#fff8e8] text-[#6f5620]"
      }`}
    >
      {barcodeStatus.replaceAll("_", " ")}
    </span>
  );
}

function BarcodesView({ products, isLoading }: { products: Product[]; isLoading: boolean }) {
  const barcodeRows = products.flatMap((product) =>
    productBarcodes(product).map((barcode) => ({
      productId: product.id,
      productName: product.name,
      barcode,
    })),
  );

  return (
    <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#10201d]">Barcodes</h2>
          <p className="mt-1 text-sm text-[#61706a]">
            {barcodeRows.length} registered item barcodes in this business.
          </p>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        {barcodeRows.length ? (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-[#7b8782]">
              <tr className="border-b border-[#ece7d8]">
                <th className="py-3 pr-4 font-semibold">ID</th>
                <th className="py-3 font-semibold">Product</th>
                <th className="py-3 font-semibold">Product ID</th>
                <th className="py-3 font-semibold">Barcode</th>
                <th className="py-3 font-semibold">Reference</th>
                <th className="py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {barcodeRows.map(({ productId, productName, barcode }) => (
                <tr key={`${productId}-${barcode.id ?? barcode.barcode}`} className="border-b border-[#f1ede2] last:border-0">
                  <td className="py-3 pr-4 font-medium text-[#10201d]">#{barcode.id ?? "-"}</td>
                  <td className="py-3 font-medium text-[#10201d]">{productName}</td>
                  <td className="py-3 text-[#61706a]">#{productId}</td>
                  <td className="py-3 text-[#61706a]">{barcode.barcode}</td>
                  <td className="py-3 text-[#61706a]">{barcode.referencee ?? "-"}</td>
                  <td className="py-3">
                    <BarcodeStatusPill status={barcode.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <LoadingText isLoading={isLoading} fallback="No barcodes have been registered." />
        )}
      </div>
    </section>
  );
}

function ClaimsView({
  results,
  isLoading,
  claimingBarcodeId,
  onSearch,
  onClaimByReference,
  onClaimById,
}: {
  results: ProductBarcodeLookup[];
  isLoading: boolean;
  claimingBarcodeId: number | null;
  onSearch: (referencee: string) => void;
  onClaimByReference: (referencee: string) => void;
  onClaimById: (barcodeId: number) => void;
}) {
  const [referencee, setReferencee] = useState("");
  const canClaimByReference = referencee.trim().length > 0 && !isLoading && claimingBarcodeId === null;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(referencee);
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#10201d]">Returnable claims</h2>
            <p className="mt-1 text-sm text-[#61706a]">Search customer references for business-scoped returnable barcode claims.</p>
          </div>
          <Search className="h-5 w-5 text-[#237a5b]" aria-hidden="true" />
        </div>
        <form className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]" onSubmit={handleSearch}>
          <DashboardInput
            label="Customer reference"
            value={referencee}
            onChange={(event) => setReferencee(event.target.value)}
            placeholder="0821234567"
            required
          />
          <button
            type="submit"
            disabled={isLoading || !referencee.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-xl border border-[#123c33] px-4 text-sm font-semibold text-[#123c33] transition hover:bg-[#e9f5ef] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            {isLoading ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            disabled={!canClaimByReference}
            onClick={() => onClaimByReference(referencee)}
            className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-xl bg-[#123c33] px-4 text-sm font-semibold text-white shadow-lg shadow-[#123c33]/15 transition hover:bg-[#1b5b4a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {claimingBarcodeId === -1 ? "Claiming..." : "Claim by reference"}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#10201d]">Claim results</h2>
        <p className="mt-1 text-sm text-[#61706a]">{results.length} matching barcode rows.</p>
        <div className="mt-5 overflow-x-auto">
          {results.length ? (
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.08em] text-[#7b8782]">
                <tr className="border-b border-[#ece7d8]">
                  <th className="py-3 pr-4 font-semibold">ID</th>
                  <th className="py-3 font-semibold">Barcode</th>
                  <th className="py-3 font-semibold">Reference</th>
                  <th className="py-3 font-semibold">Product</th>
                  <th className="py-3 font-semibold">Category</th>
                  <th className="py-3 font-semibold">Returnable</th>
                  <th className="py-3 font-semibold">Status</th>
                  <th className="py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => {
                  const isReturnable = barcodeLookupReturnableEnabled(result);
                  const canClaim = isReturnable && result.status === "NOT_CLAIMED";

                  return (
                    <tr key={result.id} className="border-b border-[#f1ede2] last:border-0">
                      <td className="py-3 pr-4 font-medium text-[#10201d]">#{result.id}</td>
                      <td className="py-3 font-mono text-xs font-semibold text-[#123c33]">{result.barcode}</td>
                      <td className="py-3 text-[#61706a]">{result.referencee ?? "-"}</td>
                      <td className="py-3 font-medium text-[#10201d]">{result.productName}</td>
                      <td className="py-3 text-[#61706a]">{productCategoryLabel(result.productCategory)}</td>
                      <td className="py-3 text-[#61706a]">{isReturnable ? "Yes" : "No"}</td>
                      <td className="py-3"><BarcodeStatusPill status={result.status} /></td>
                      <td className="py-3">
                        <button
                          type="button"
                          disabled={!canClaim || claimingBarcodeId !== null}
                          onClick={() => onClaimById(result.id)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[#d9d5c8] px-3 text-xs font-semibold text-[#123c33] transition hover:border-[#123c33] hover:bg-[#eefaf3] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          {claimingBarcodeId === result.id ? "Claiming..." : "Claim"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <LoadingText isLoading={isLoading} fallback="No reference lookup has been run." />
          )}
        </div>
      </section>
    </div>
  );
}

function AuditLogsView({
  auditLogs,
  isLoading,
  onPaginationChange,
}: {
  auditLogs: PageResponse<AuditLog>;
  isLoading: boolean;
  onPaginationChange: (pagination: PaginationState) => void;
}) {
  return (
    <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#10201d]">Audit logs</h2>
          <p className="mt-1 text-sm text-[#61706a]">{auditLogs.totalElements} business events from `/api/audit-logs`.</p>
        </div>
        <History className="h-5 w-5 text-[#237a5b]" aria-hidden="true" />
      </div>
      <div className="mt-5 overflow-x-auto">
        {auditLogs.content.length ? (
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-[#7b8782]">
              <tr className="border-b border-[#ece7d8]">
                <th className="py-3 pr-4 font-semibold">ID</th>
                <th className="py-3 font-semibold">Created</th>
                <th className="py-3 font-semibold">Action</th>
                <th className="py-3 font-semibold">Entity</th>
                <th className="py-3 font-semibold">Actor</th>
                <th className="py-3 font-semibold">Business</th>
                <th className="py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.content.map((log) => (
                <tr key={log.id} className="border-b border-[#f1ede2] last:border-0">
                  <td className="py-3 pr-4 font-medium text-[#10201d]">#{log.id}</td>
                  <td className="py-3 text-[#61706a]">{dateLabel(log.createdAt)}</td>
                  <td className="py-3 font-semibold text-[#10201d]">{log.action.replaceAll("_", " ")}</td>
                  <td className="py-3 text-[#61706a]">{log.entityType} #{log.entityId}</td>
                  <td className="py-3 text-[#61706a]">{log.actorUsername}</td>
                  <td className="py-3 text-[#61706a]">{log.businessName ?? "-"}</td>
                  <td className="py-3 text-[#61706a]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <LoadingText isLoading={isLoading} fallback="No audit events have been recorded." />
        )}
      </div>
      <PaginationControls page={auditLogs} onChange={onPaginationChange} />
    </section>
  );
}

function WorkerTransactionsView({
  products,
  currentUser,
  transactions,
  isLoading,
  isFormOpen,
  onCloseForm,
  onValidateBarcode,
  onSubmit,
}: {
  products: Product[];
  currentUser: TrackerUser | null;
  transactions: Transaction[];
  isLoading: boolean;
  isFormOpen: boolean;
  onCloseForm: () => void;
  onValidateBarcode: BarcodeValidator;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<boolean> | boolean | void;
}) {
  const ownerId = defaultOwnerIdValue();
  const sellableProducts = useMemo(
    () => products.filter((product) => product.stockQuantity > 0 && assignedBarcodeCount(product) > 0),
    [products],
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);
  const [scannerMessage, setScannerMessage] = useState("Select a product and quantity before scanning.");
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const selectedProductIdRef = useRef("");
  const requiredBarcodeCountRef = useRef(1);
  const scannedBarcodesRef = useRef<string[]>([]);
  const validationInFlightRef = useRef(false);
  const lastDetectedBarcodeRef = useRef({ value: "", time: 0 });
  const activeProductId =
    selectedProductId && sellableProducts.some((product) => String(product.id) === selectedProductId)
      ? selectedProductId
      : String(sellableProducts[0]?.id ?? "");
  const selectedProduct = sellableProducts.find((product) => String(product.id) === activeProductId);
  const selectedProductBarcodeCount = selectedProduct ? assignedBarcodeCount(selectedProduct) : 0;
  const maxQuantity = selectedProduct ? Math.max(1, Math.min(selectedProduct.stockQuantity, selectedProductBarcodeCount)) : 1;
  const parsedQuantity = Number(quantity);
  const requiredBarcodeCount =
    Number.isFinite(parsedQuantity) && parsedQuantity > 0
      ? Math.min(Math.floor(parsedQuantity), maxQuantity)
      : 1;
  const isScanComplete = requiredBarcodeCount > 0 && scannedBarcodes.length === requiredBarcodeCount;

  const stopScanner = useCallback(() => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    setIsScanning(false);
  }, []);

  const resetScans = useCallback((message: string) => {
    stopScanner();
    setScannedBarcodes([]);
    setScannerMessage(message);
    lastDetectedBarcodeRef.current = { value: "", time: 0 };
  }, [stopScanner]);

  useEffect(() => {
    selectedProductIdRef.current = activeProductId;
    requiredBarcodeCountRef.current = requiredBarcodeCount;
    scannedBarcodesRef.current = scannedBarcodes;
  }, [activeProductId, requiredBarcodeCount, scannedBarcodes]);

  useEffect(() => stopScanner, [stopScanner]);

  function handleProductChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedProductId(event.target.value);
    setQuantity("1");
    resetScans("Product changed. Scan the item barcodes for the new selection.");
  }

  function handleQuantityChange(event: ChangeEvent<HTMLInputElement>) {
    const nextQuantity = Number(event.target.value);
    setQuantity(Number.isFinite(nextQuantity) && nextQuantity > maxQuantity ? String(maxQuantity) : event.target.value);
    resetScans("Quantity changed. Scan the matching number of barcodes.");
  }

  async function registerScannedBarcode(rawBarcode: string, controls?: IScannerControls) {
    const barcode = rawBarcode.trim();
    const productId = Number(selectedProductIdRef.current);
    const targetCount = requiredBarcodeCountRef.current;
    const now = Date.now();

    if (!barcode || !Number.isFinite(productId) || validationInFlightRef.current) {
      return;
    }

    if (lastDetectedBarcodeRef.current.value === barcode && now - lastDetectedBarcodeRef.current.time < 1200) {
      return;
    }

    lastDetectedBarcodeRef.current = { value: barcode, time: now };

    if (scannedBarcodesRef.current.includes(barcode)) {
      setScannerMessage(`Barcode ${barcode} is already in this scan.`);
      return;
    }

    if (scannedBarcodesRef.current.length >= targetCount) {
      controls?.stop();
      setIsScanning(false);
      return;
    }

    validationInFlightRef.current = true;

    try {
      await onValidateBarcode(productId, barcode);
      setScannedBarcodes((currentBarcodes) => {
        if (currentBarcodes.includes(barcode)) {
          return currentBarcodes;
        }

        const nextBarcodes = [...currentBarcodes, barcode].slice(0, targetCount);

        if (nextBarcodes.length >= targetCount) {
          controls?.stop();
          scannerControlsRef.current = null;
          setIsScanning(false);
          setScannerMessage(`${nextBarcodes.length}/${targetCount} barcodes ready.`);
        } else {
          setScannerMessage(`${nextBarcodes.length}/${targetCount} barcodes scanned.`);
        }

        return nextBarcodes;
      });
    } catch (error) {
      setScannerMessage(error instanceof Error ? error.message : "Unable to validate scanned barcode.");
    } finally {
      validationInFlightRef.current = false;
    }
  }

  async function handleAddBarcodesClick() {
    if (isScanComplete) {
      return;
    }

    if (!selectedProduct || !videoRef.current) {
      setScannerMessage("Select a product before starting the scanner.");
      return;
    }

    if (!currentUser) {
      setScannerMessage("Sign in as a worker before scanning barcodes.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerMessage("Camera access is not available in this browser.");
      return;
    }

    try {
      stopScanner();
      setScannerMessage(`Scanning 0/${requiredBarcodeCount} barcodes.`);
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result, _error, activeControls) => {
        if (result) {
          void registerScannedBarcode(result.getText(), activeControls);
        }
      });
      scannerControlsRef.current = controls;
      setIsScanning(true);
    } catch (error) {
      setIsScanning(false);
      setScannerMessage(error instanceof Error ? error.message : "Unable to start barcode scanner.");
    }
  }

  async function handleWorkerSubmit(event: FormEvent<HTMLFormElement>) {
    const submitted = await onSubmit(event);
    stopScanner();

    if (submitted) {
      setScannedBarcodes([]);
      setScannerMessage("Select a product and quantity before scanning.");
    }
  }

  return (
    <div className="grid gap-6">
      {isFormOpen ? (
        <TransactionFormModal title="Record sale movement" onClose={onCloseForm}>
          <p className="mt-1 text-sm leading-6 text-[#61706a]">
            Worker identity is provided by the signed-in session. Each SELL movement must include scanned item barcodes.
          </p>
          <form className="mt-5 grid gap-4" onSubmit={handleWorkerSubmit}>
            <input type="hidden" name="type" value="SELL" />
            <input type="hidden" name="employeeId" value={currentUser?.id ?? ""} />
            <input type="hidden" name="ownerId" value={ownerId} />
            {!ownerId ? (
              <p className="rounded-md border border-[#e6dcc0] bg-[#fff8e8] px-3 py-2 text-xs leading-5 text-[#6f5620]">
                Set `NEXT_PUBLIC_KING_SPARKON_OWNER_ID` for worker sale entry. The current backend still requires `ownerId` on transaction creation.
              </p>
            ) : null}
            <DashboardSelect
              name="productId"
              label="Product"
              value={activeProductId}
              onChange={handleProductChange}
              options={sellableProducts.map((product) => ({
                label: `${product.name} (${product.stockQuantity} stock, ${assignedBarcodeCount(product)} barcodes)`,
                value: String(product.id),
              }))}
              placeholder="No sellable products available"
              disabled={!sellableProducts.length}
            />
            <DashboardInput
              name="quantity"
              label="Quantity"
              type="number"
              min="1"
              max={selectedProduct ? maxQuantity : undefined}
              step="1"
              value={quantity}
              onChange={handleQuantityChange}
              placeholder="1"
              required
              disabled={!sellableProducts.length}
            />
            <DashboardInput name="unitPrice" label="Unit price override" type="number" min="0" step="0.01" placeholder="Optional" />
            <div className="rounded-lg border border-[#dfdacb] bg-[#fbfaf6] p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#10201d]">Scanned barcodes</p>
                  <p className="mt-1 text-xs text-[#61706a]">
                    {scannedBarcodes.length}/{requiredBarcodeCount} required
                  </p>
                </div>
                {isScanning ? (
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-[#d9d5c8] px-3 text-xs font-semibold text-[#123c33] transition hover:bg-white"
                  >
                    Stop
                  </button>
                ) : null}
              </div>
              <video
                ref={videoRef}
                className="mt-3 aspect-video w-full rounded-md bg-[#10201d] object-cover"
                muted
                playsInline
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {scannedBarcodes.length ? (
                  scannedBarcodes.map((barcode) => (
                    <span key={barcode} className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-[#123c33]">
                      {barcode}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#61706a]">{scannerMessage}</span>
                )}
              </div>
              {scannedBarcodes.length ? <p className="mt-3 text-xs text-[#61706a]">{scannerMessage}</p> : null}
            </div>
            {scannedBarcodes.map((barcode) => (
              <input key={barcode} type="hidden" name="barcodes" value={barcode} />
            ))}
            <button
              type={isScanComplete ? "submit" : "button"}
              onClick={isScanComplete ? undefined : handleAddBarcodesClick}
              disabled={!currentUser || !ownerId || !sellableProducts.length || isScanning}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#123c33] px-4 text-sm font-semibold text-white shadow-lg shadow-[#123c33]/15 transition hover:bg-[#1b5b4a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Barcode className="h-4 w-4" aria-hidden="true" />
              {isScanning ? "Scanning..." : "Add barcodes"}
            </button>
          </form>
        </TransactionFormModal>
      ) : null}

      <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#10201d]">Submitted transactions</h2>
        <p className="mt-1 text-sm text-[#61706a]">Latest transaction responses from this worker session.</p>
        <TransactionResponseTable
          transactions={transactions}
          isLoading={isLoading}
          emptyMessage="No transactions have been submitted in this session."
        />
      </section>
    </div>
  );
}

function TransactionResponseTable({
  transactions,
  isLoading,
  emptyMessage,
}: {
  transactions: Transaction[];
  isLoading: boolean;
  emptyMessage: string;
}) {
  const [expandedTransactionId, setExpandedTransactionId] = useState<number | null>(null);

  return (
    <div className="mt-5 overflow-x-auto">
      {transactions.length ? (
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.08em] text-[#7b8782]">
            <tr className="border-b border-[#ece7d8]">
              <th className="py-3 font-semibold">ID</th>
              <th className="py-3 font-semibold">Date</th>
              <th className="py-3 font-semibold">Type</th>
              <th className="py-3 font-semibold">Status</th>
              <th className="py-3 font-semibold">Product sold</th>
              <th className="py-3 font-semibold">Transaction price</th>
              <th className="py-3 font-semibold">Barcode</th>
              <th className="py-3 font-semibold">Items</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const isExpanded = expandedTransactionId === transaction.id;

              return (
                <Fragment key={transaction.id}>
                  <tr className="border-b border-[#f1ede2]">
                    <td className="py-3 font-medium text-[#10201d]">#{transaction.id}</td>
                    <td className="py-3 text-[#61706a]">{dateLabel(transaction.date)}</td>
                    <td className="py-3">
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${transaction.type === "SELL" ? "bg-[#fff1ec] text-[#8b2d1f]" : "bg-[#eefaf3] text-[#1b5b3d]"}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3">
                      <TransactionStatusPill transaction={transaction} />
                    </td>
                    <td className="py-3 font-medium text-[#10201d]">{transactionProductSoldLabel(transaction)}</td>
                    <td className="py-3 font-semibold text-[#10201d]">{money(transactionTotalPrice(transaction))}</td>
                    <td className="py-3">
                      <span className="font-mono text-xs font-semibold text-[#123c33]">
                        {transactionBarcodeSummary(transaction)}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedTransactionId(isExpanded ? null : transaction.id)}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-[#d9d5c8] px-3 text-xs font-semibold text-[#123c33] transition hover:border-[#123c33] hover:bg-[#fbfaf6]"
                      >
                        {isExpanded ? "Hide items" : "Show items"}
                      </button>
                    </td>
                  </tr>
                  {isExpanded ? (
                    <tr className="border-b border-[#f1ede2] bg-[#fbfaf6]">
                      <td colSpan={8} className="px-4 py-4">
                        <TransactionItemsDetail transaction={transaction} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      ) : (
        <LoadingText isLoading={isLoading} fallback={emptyMessage} />
      )}
    </div>
  );
}

function TransactionStatusPill({ transaction }: { transaction: Transaction }) {
  const label = transactionStatusLabel(transaction);
  const normalizedStatus = label.toLowerCase();
  const isWarning = normalizedStatus.includes("pending") || normalizedStatus.includes("review");
  const isError = normalizedStatus.includes("fail") || normalizedStatus.includes("cancel");

  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-semibold ${
        isError
          ? "bg-[#fff1ec] text-[#8b2d1f]"
          : isWarning
            ? "bg-[#fff8e8] text-[#6f5620]"
            : "bg-[#e9f5ef] text-[#237a5b]"
      }`}
    >
      {label}
    </span>
  );
}

function TransactionItemsDetail({ transaction }: { transaction: Transaction }) {
  const totalBarcodes = transactionBarcodeTotal(transaction);
  const barcodeRows = transaction.items.flatMap((item) => {
    const baseRow = {
      itemId: item.id ?? item.productId,
      productName: item.productName ?? `Product #${item.productId}`,
      quantity: item.quantity,
    };

    if (!item.barcodes?.length) {
      return [{ ...baseRow, barcode: "", rowKey: `${transaction.id}-${baseRow.itemId}-empty` }];
    }

    return item.barcodes.map((barcode, index) => ({
      ...baseRow,
      barcode,
      rowKey: `${transaction.id}-${baseRow.itemId}-${barcode}-${index}`,
    }));
  });

  return (
    <div className="rounded-lg border border-[#dfdacb] bg-white p-4">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.08em] text-[#7b8782]">
          <tr className="border-b border-[#ece7d8]">
            <th className="py-3 font-semibold">Item ID</th>
            <th className="py-3 font-semibold">Product</th>
            <th className="py-3 font-semibold">Quantity</th>
            <th className="py-3 font-semibold">Barcode</th>
          </tr>
        </thead>
        <tbody>
          {barcodeRows.map((row) => (
            <tr key={row.rowKey} className="border-b border-[#f1ede2] last:border-0">
              <td className="py-3 font-medium text-[#10201d]">#{row.itemId}</td>
              <td className="py-3 font-medium text-[#10201d]">{row.productName}</td>
              <td className="py-3 text-[#61706a]">{row.quantity}</td>
              <td className="py-3 text-[#61706a]">
                {row.barcode ? (
                  <span className="font-mono text-sm font-semibold text-[#123c33]">{row.barcode}</span>
                ) : (
                  <span>No barcode data</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-sm font-semibold text-[#10201d]">
        Total barcodes: <span className="text-[#237a5b]">{totalBarcodes}</span>
      </p>
    </div>
  );
}

function TransactionsView({
  transactions,
  products,
  workers,
  owner,
  isLoading,
  isFormOpen,
  onCloseForm,
  onPaginationChange,
  onSubmit,
}: {
  transactions: PageResponse<Transaction>;
  products: Product[];
  workers: TrackerUser[];
  owner: TrackerUser | null;
  isLoading: boolean;
  isFormOpen: boolean;
  onCloseForm: () => void;
  onPaginationChange: (pagination: PaginationState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="grid gap-6">
      {isFormOpen ? (
        <TransactionFormModal title="Record movement" onClose={onCloseForm}>
          <p className="mt-1 text-sm leading-6 text-[#61706a]">
            The backend updates stock automatically: BUY increases stock, SELL decreases stock and rejects insufficient quantity.
          </p>
          <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
            <DashboardSelect name="type" label="Transaction type" options={["SELL", "BUY"]} />
            <DashboardSelect
              name="employeeId"
              label="Worker"
              options={workers.map((worker) => ({ label: `${worker.username} #${worker.id}`, value: String(worker.id) }))}
              placeholder="Create a worker first"
            />
            <DashboardSelect
              name="productId"
              label="Product"
              options={products.map((product) => ({
                label: `${product.name} (${product.stockQuantity} in stock, ${assignedBarcodeCount(product)} barcodes)`,
                value: String(product.id),
              }))}
              placeholder="Create a product first"
            />
            <DashboardInput name="quantity" label="Quantity" type="number" min="1" step="1" placeholder="2" required />
            <DashboardInput name="unitPrice" label="Unit price override" type="number" min="0" step="0.01" placeholder="Optional" />
            <p className="rounded-md bg-[#fbfaf6] px-3 py-2 text-xs leading-5 text-[#61706a]">
              Owner id sent to backend: <span className="font-semibold text-[#10201d]">{owner?.id ?? "waiting for profile"}</span>
            </p>
            <PrimaryButton label="Record transaction" icon={ArrowDownUp} disabled={!owner || !workers.length || !products.length} />
          </form>
        </TransactionFormModal>
      ) : null}

      <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#10201d]">Transaction history</h2>
        <p className="mt-1 text-sm text-[#61706a]">{transactions.totalElements} records from `/api/transactions`.</p>
        <TransactionResponseTable
          transactions={transactions.content}
          isLoading={isLoading}
          emptyMessage="No transactions have been recorded."
        />
        <PaginationControls page={transactions} onChange={onPaginationChange} />
      </section>
    </div>
  );
}

function WorkersView({
  users,
  isLoading,
  onPaginationChange,
  onDeleteWorker,
}: {
  users: PageResponse<TrackerUser>;
  isLoading: boolean;
  onPaginationChange: (pagination: PaginationState) => void;
  onDeleteWorker: (user: TrackerUser) => void;
}) {
  return (
    <section className="rounded-lg border border-[#dfdacb] bg-white p-5">
      <h2 className="text-lg font-semibold text-[#10201d]">Users</h2>
      <p className="mt-1 text-sm text-[#61706a]">{users.totalElements} users from `/api/users`.</p>
      <div className="mt-5 overflow-x-auto">
        {users.content.length ? (
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-[#7b8782]">
              <tr className="border-b border-[#ece7d8]">
                <th className="py-3 font-semibold">Username</th>
                <th className="py-3 font-semibold">Email</th>
                <th className="py-3 font-semibold">Privilege</th>
                <th className="py-3 font-semibold">Created</th>
                <th className="py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.content.map((user) => (
                <tr key={user.id} className="border-b border-[#f1ede2] last:border-0">
                  <td className="py-3 font-medium text-[#10201d]">{user.username}</td>
                  <td className="py-3 text-[#61706a]">{user.emailAddress}</td>
                  <td className="py-3 text-[#61706a]">{userRoleLabel(user.privilege)}</td>
                  <td className="py-3 text-[#61706a]">{dateLabel(user.createdDate)}</td>
                  <td className="py-3">
                    {isWorkerUser(user) ? (
                      <button
                        type="button"
                        onClick={() => onDeleteWorker(user)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[#efc8bd] px-3 text-xs font-semibold text-[#8b2d1f] transition hover:border-[#8b2d1f] hover:bg-[#fff1ec]"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Delete worker
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-[#8d9793]">Owner account</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <LoadingText isLoading={isLoading} fallback="No users are available." />
        )}
      </div>
      <PaginationControls page={users} onChange={onPaginationChange} />
    </section>
  );
}

function WorkerCreateModal({
  workers,
  canCreateWorker,
  onClose,
  onSubmit,
}: {
  workers: TrackerUser[];
  canCreateWorker: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <TransactionFormModal title="Add worker" onClose={onClose}>
      <p className="mt-1 text-sm leading-6 text-[#61706a]">
        The backend enforces a maximum of two worker accounts.
      </p>
      <div className="mt-4 rounded-xl border border-[#ece7d8] bg-[#fbfaf6] px-4 py-3">
        <p className="text-sm font-semibold text-[#10201d]">{workers.length}/{WORKER_LIMIT} workers used</p>
        <p className="mt-1 text-xs leading-5 text-[#61706a]">
          {canCreateWorker ? "A worker account can be added." : "Worker creation is disabled at the backend limit."}
        </p>
      </div>
      <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
        <DashboardInput name="username" label="Username" placeholder="worker" required disabled={!canCreateWorker} />
        <DashboardInput name="emailAddress" label="Email address" type="email" placeholder="worker@example.com" required disabled={!canCreateWorker} />
        <DashboardInput name="password" label="Password" type="password" placeholder="Temporary password" required disabled={!canCreateWorker} />
        <PrimaryButton label="Create worker" icon={UsersRound} disabled={!canCreateWorker} />
      </form>
    </TransactionFormModal>
  );
}

function DashboardInput({
  label,
  ...props
}: {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#233631]">{label}</span>
      <input
        {...props}
        className="mt-2 h-11 w-full rounded-xl border border-[#d3c9b9] bg-white px-3 text-sm text-[#10201d] shadow-sm shadow-[#10201d]/5 outline-none transition placeholder:text-[#8d9793] hover:border-[#9eb6aa] hover:bg-[#f9fbfa] hover:text-[#10201d] focus:border-[#237a5b] focus:bg-white focus:text-[#10201d] focus:ring-4 focus:ring-[#237a5b]/15 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function DashboardCheckbox({
  label,
  ...props
}: {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-xl border border-[#d3c9b9] bg-white px-3 text-sm font-medium text-[#233631] shadow-sm shadow-[#10201d]/5 transition hover:border-[#9eb6aa]">
      <input
        {...props}
        type="checkbox"
        className="h-4 w-4 rounded border-[#b9b4a6] accent-[#123c33]"
      />
      <span>{label}</span>
    </label>
  );
}

function DashboardSelect({
  label,
  options,
  placeholder,
  defaultValue,
  ...props
}: {
  label: string;
  options: Array<string | { label: string; value: string }>;
  placeholder?: string;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  const selectDefaultValue =
    props.value === undefined ? defaultValue ?? (placeholder ? "" : undefined) : undefined;

  return (
    <label className="block">
      <span className="text-sm font-medium text-[#233631]">{label}</span>
      <select
        {...props}
        required
        defaultValue={selectDefaultValue}
        className="mt-2 h-11 w-full rounded-xl border border-[#d3c9b9] bg-white px-3 text-sm text-[#10201d] shadow-sm shadow-[#10201d]/5 outline-none transition hover:border-[#9eb6aa] hover:bg-[#f9fbfa] hover:text-[#10201d] focus:border-[#237a5b] focus:bg-white focus:text-[#10201d] focus:ring-4 focus:ring-[#237a5b]/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const labelText = typeof option === "string" ? option : option.label;

          return (
            <option key={value} value={value}>
              {labelText}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function PrimaryButton({
  label,
  icon: Icon,
  disabled,
}: {
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#123c33] px-4 text-sm font-semibold text-white shadow-lg shadow-[#123c33]/20 transition hover:bg-[#0f4c3f] hover:shadow-xl hover:shadow-[#123c33]/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

function FloatingActionButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#123c33] px-5 text-sm font-semibold text-white shadow-2xl shadow-[#123c33]/25 transition hover:bg-[#0f4c3f] hover:shadow-[#123c33]/35 focus:outline-none focus:ring-4 focus:ring-[#237a5b]/20 focus:ring-offset-2"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

function TransactionFormModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#10201d]/45 px-4 py-5 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Close transaction popup backdrop"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-form-modal-title"
        className="relative z-10 max-h-[calc(100vh-2.5rem)] w-full max-w-[430px] overflow-y-auto rounded-2xl border border-[#dfdacb] bg-white p-5 shadow-2xl shadow-[#10201d]/25"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="transaction-form-modal-title" className="text-lg font-semibold text-[#10201d]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#d9d5c8] bg-white text-[#61706a] transition hover:border-[#123c33] hover:bg-[#eefaf3] hover:text-[#123c33]"
            aria-label="Close transaction form"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
