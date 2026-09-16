import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "@/store/auth-context";
import { useCart } from "@/store/cart-context";
import { useFavorites } from "@/store/favorites-context";
import { getUserRoles, isWorkerLike } from "@/lib/types";
import { listWorkerOnlinePurchases } from "@/lib/api";
import { tokens } from "@/theme/tokens";

function homeForRoles(roles: string[]): string {
  if (roles.includes("Worker")) return "/(tabs)/scan";
  return "/(tabs)/shop";
}

function roleLabel(roles: string[]): string {
  if (roles.includes("Admin")) return "ADMIN";
  if (roles.includes("Owner")) return "OWNER";
  if (roles.includes("Worker")) return "WORKER WORKSPACE";
  return "USER WORKSPACE";
}

export function AppHeader() {
  const { user, signOut } = useAuth();
  const { count: cartCount } = useCart();
  const { count: favoriteCount } = useFavorites();
  const [menuOpen, setMenuOpen] = useState(false);
  const [uifOpen, setUifOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);

  const roles = getUserRoles(user);
  const worker = isWorkerLike(user);
  const buyer = !worker || roles.includes("User");
  const userWorkspace = !worker;

  useEffect(() => {
    if (!worker) return;
    let active = true;
    listWorkerOnlinePurchases()
      .then((orders) => {
        if (active) setPendingOrders(Array.isArray(orders) ? orders.length : 0);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [worker]);

  return (
    <View style={styles.header}>
      <Link href={homeForRoles(roles)} asChild>
        <Pressable style={styles.brand}>
          <View>
            <Text style={styles.role}>{roleLabel(roles)}</Text>
            <Text style={styles.name}>King Sparkon</Text>
          </View>
        </Pressable>
      </Link>

      <View style={styles.actions}>
        {buyer ? (
          <>
            <Link href="/(tabs)/favorites" asChild>
              <Pressable style={styles.iconButton} accessibilityLabel={`Favorites, ${favoriteCount} businesses`}>
                <Text style={styles.icon}>♥{favoriteCount > 0 ? ` ${favoriteCount > 99 ? "99+" : favoriteCount}` : ""}</Text>
              </Pressable>
            </Link>
            <Link href="/(tabs)/cart" asChild>
              <Pressable style={styles.iconButton} accessibilityLabel={`Cart, ${cartCount} items`}>
                <Text style={styles.icon}>▣{cartCount > 0 ? ` ${cartCount > 99 ? "99+" : cartCount}` : ""}</Text>
              </Pressable>
            </Link>
            {userWorkspace ? <Link href="/(tabs)/profile" asChild>
              <Pressable style={styles.iconButton} accessibilityLabel="Open profile">
                <Text style={styles.icon}>☺</Text>
              </Pressable>
            </Link> : null}
            {userWorkspace ? <Pressable
              style={styles.iconButton}
              accessibilityLabel="Sign out"
              onPress={() => void signOut()}
            >
              <Text style={styles.icon}>↪</Text>
            </Pressable> : null}
          </>
        ) : null}

        {worker ? (
          <Link href="/(tabs)/orders" asChild>
            <Pressable style={styles.iconButton} accessibilityLabel={`Online orders, ${pendingOrders} pending`}>
              <Text style={styles.icon}>◇{pendingOrders > 0 ? ` ${pendingOrders > 99 ? "99+" : pendingOrders}` : ""}</Text>
            </Pressable>
          </Link>
        ) : null}

        {worker ? (
          <Pressable
            style={styles.iconButton}
            accessibilityLabel="Open profile menu"
            accessibilityExpanded={menuOpen}
            onPress={() => setMenuOpen((v) => !v)}
          >
            <Text style={styles.icon}>☺</Text>
          </Pressable>
        ) : null}
      </View>

      {worker && menuOpen ? (
        <View style={styles.menu}>
          <Text style={styles.menuUser}>{user?.username ?? "Signed out"}</Text>
          <Text style={styles.menuEmail}>{user?.emailAddress ?? ""}</Text>

          {buyer ? (
            <>
              <MenuLink href="/(tabs)/shop" label="Buy Products" onNavigate={() => setMenuOpen(false)} />
              <MenuLink href="/(tabs)/tickets" label="My Tickets" onNavigate={() => setMenuOpen(false)} />
              <MenuLink href="/tip-cart" label="Tip Cart" onNavigate={() => setMenuOpen(false)} />
              <MenuLink href="/(tabs)/jobs" label="Jobs" onNavigate={() => setMenuOpen(false)} />
              <MenuLink href="/(tabs)/applications" label="My Applications" onNavigate={() => setMenuOpen(false)} />
              <MenuLink href="/(tabs)/carts" label="My Carts" onNavigate={() => setMenuOpen(false)} />
              <MenuLink href="/(tabs)/favorites" label="Favorites" onNavigate={() => setMenuOpen(false)} />
              <Pressable style={styles.menuItem} onPress={() => setUifOpen((v) => !v)} accessibilityExpanded={uifOpen}>
                <Text style={styles.menuItemText}>UIF {uifOpen ? "▾" : "▸"}</Text>
              </Pressable>
              {uifOpen ? (
                <View style={styles.submenu}>
                  <MenuLink href="/uif/status" label="Check UIF Status" onNavigate={() => setMenuOpen(false)} />
                  <MenuLink href="/uif/password" label="Update UIF Password" onNavigate={() => setMenuOpen(false)} />
                  <MenuLink href="/uif/cart" label="UIF Cart" onNavigate={() => setMenuOpen(false)} />
                  <MenuLink href="/uif/apply" label="Apply for Benefits" onNavigate={() => setMenuOpen(false)} />
                </View>
              ) : null}
            </>
          ) : null}

          {worker ? (
            <>
              <MenuLink href="/(tabs)/scan" label="Counter Checkout" onNavigate={() => setMenuOpen(false)} />
              <MenuLink href="/(tabs)/products" label="Products & Barcodes" onNavigate={() => setMenuOpen(false)} />
              <MenuLink href="/(tabs)/orders" label="Online Orders" onNavigate={() => setMenuOpen(false)} />
              <MenuLink href="/(tabs)/sales" label="Product Sales" onNavigate={() => setMenuOpen(false)} />
              <MenuLink href="/(tabs)/verify" label="Ticket Entry" onNavigate={() => setMenuOpen(false)} />
            </>
          ) : null}

          <MenuLink href="/(tabs)/profile" label="Update profile" onNavigate={() => setMenuOpen(false)} />
          <Pressable
            style={[styles.menuItem, styles.logout]}
            onPress={() => {
              setMenuOpen(false);
              void signOut();
            }}
          >
            <Text style={[styles.menuItemText, styles.logoutText]}>Sign out</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function MenuLink({ href, label, onNavigate }: { href: string; label: string; onNavigate: () => void }) {
  return (
    <Link href={href} asChild>
      <Pressable
        style={styles.menuItem}
        onPress={() => {
          onNavigate();
          router.push(href);
        }}
      >
        <Text style={styles.menuItemText}>{label}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    borderBottomColor: tokens.line,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 50,
  },
  brand: { flexDirection: "row", alignItems: "center" },
  role: { color: tokens.signalStrong, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  name: { color: tokens.ink, fontSize: 15, fontWeight: "900" },
  actions: { flexDirection: "row", gap: 8, alignItems: "center" },
  iconButton: {
    minHeight: 40,
    minWidth: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tokens.line,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  icon: { color: tokens.ink, fontWeight: "800", fontSize: 13 },
  menu: {
    position: "absolute",
    top: "100%",
    right: 12,
    width: 260,
    backgroundColor: "#fff",
    borderColor: tokens.line,
    borderWidth: 1,
    borderRadius: tokens.radiusLg,
    padding: 8,
    gap: 2,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  menuUser: { color: tokens.ink, fontWeight: "900", fontSize: 15, paddingHorizontal: 8, paddingTop: 6 },
  menuEmail: { color: tokens.steel, fontSize: 12, paddingHorizontal: 8, paddingBottom: 6 },
  menuItem: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 10 },
  menuItemText: { color: tokens.ink, fontWeight: "800", fontSize: 14 },
  submenu: { paddingLeft: 12, gap: 2 },
  logout: { borderTopWidth: 1, borderTopColor: tokens.line, marginTop: 4 },
  logoutText: { color: tokens.danger },
});
