"use client";

import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  CreditCard,
  Building2,
  Car,
  UserCheck,
  Wallet,
  Gift,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu berdasarkan role
const menuItems = {
  admin: [
    {
      title: "Utama",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: Home },
        { title: "POS", url: "/dashboard/pos", icon: CreditCard },
      ],
    },
    {
      title: "Produk & Stok",
      items: [
        { title: "Produk", url: "/dashboard/products", icon: Package },
        {
          title: "Stok Opname",
          url: "/dashboard/inventory/stock-opname",
          icon: BarChart3,
        },
        {
          title: "Mutasi Stok",
          url: "/dashboard/inventory/mutation",
          icon: Package,
        },
      ],
    },
    {
      title: "Penjualan",
      items: [
        {
          title: "Order Penjualan",
          url: "/dashboard/sales/orders",
          icon: ShoppingCart,
        },
        {
          title: "Buat Order",
          url: "/dashboard/sales/create",
          icon: ShoppingCart,
        },
      ],
    },
    {
      title: "Pembelian",
      items: [
        {
          title: "Faktur Pembelian",
          url: "/dashboard/purchases/invoices",
          icon: Building2,
        },
        {
          title: "Penerimaan Barang",
          url: "/dashboard/purchases/receive",
          icon: Building2,
        },
      ],
    },
    {
      title: "Pelanggan & Supplier",
      items: [
        { title: "Pelanggan", url: "/dashboard/customers", icon: Users },
        { title: "Supplier", url: "/dashboard/suppliers", icon: Building2 },
      ],
    },
    {
      title: "Promosi",
      items: [
        { title: "Promo & Diskon", url: "/dashboard/promotions", icon: Gift },
      ],
    },
    {
      title: "SDM",
      items: [
        { title: "Karyawan", url: "/dashboard/employees", icon: UserCheck },
        { title: "Absensi", url: "/dashboard/attendance", icon: UserCheck },
        { title: "Slip Gaji", url: "/dashboard/payroll", icon: Wallet },
      ],
    },
    {
      title: "Keuangan",
      items: [
        {
          title: "Transaksi",
          url: "/dashboard/finance/transactions",
          icon: Wallet,
        },
        {
          title: "Jurnal Umum",
          url: "/dashboard/finance/journal",
          icon: Wallet,
        },
        {
          title: "Neraca",
          url: "/dashboard/finance/balance-sheet",
          icon: BarChart3,
        },
        {
          title: "Laba Rugi",
          url: "/dashboard/finance/profit-loss",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Laporan",
      items: [
        {
          title: "Lap. Penjualan",
          url: "/dashboard/reports/sales",
          icon: BarChart3,
        },
        {
          title: "Lap. Produk",
          url: "/dashboard/reports/products",
          icon: BarChart3,
        },
        {
          title: "Lap. Stok",
          url: "/dashboard/reports/stock",
          icon: BarChart3,
        },
        {
          title: "Lap. Sales",
          url: "/dashboard/reports/salesman",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Pengaturan",
      items: [
        { title: "Pengguna", url: "/dashboard/settings/users", icon: Settings },
        {
          title: "Perusahaan",
          url: "/dashboard/settings/company",
          icon: Settings,
        },
        {
          title: "Hak Akses",
          url: "/dashboard/settings/permissions",
          icon: Settings,
        },
      ],
    },
  ],
  kasir: [
    {
      title: "POS",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: Home },
        { title: "POS", url: "/dashboard/pos", icon: CreditCard },
        { title: "Riwayat", url: "/dashboard/pos/history", icon: BarChart3 },
        { title: "Shift Kasir", url: "/dashboard/pos/shift", icon: CreditCard },
      ],
    },
    {
      title: "Produk",
      items: [
        { title: "Daftar Produk", url: "/dashboard/products", icon: Package },
      ],
    },
  ],
  gudang: [
    {
      title: "Utama",
      items: [{ title: "Dashboard", url: "/dashboard", icon: Home }],
    },
    {
      title: "Produk & Stok",
      items: [
        { title: "Produk", url: "/dashboard/products", icon: Package },
        {
          title: "Stok Opname",
          url: "/dashboard/inventory/stock-opname",
          icon: BarChart3,
        },
        {
          title: "Mutasi Stok",
          url: "/dashboard/inventory/mutation",
          icon: Package,
        },
      ],
    },
    {
      title: "Pembelian",
      items: [
        {
          title: "Penerimaan Barang",
          url: "/dashboard/purchases/receive",
          icon: Building2,
        },
      ],
    },
  ],
  sales: [
    {
      title: "Utama",
      items: [{ title: "Dashboard", url: "/dashboard", icon: Home }],
    },
    {
      title: "Penjualan",
      items: [
        {
          title: "Order Penjualan",
          url: "/dashboard/sales/orders",
          icon: ShoppingCart,
        },
        {
          title: "Buat Order",
          url: "/dashboard/sales/create",
          icon: ShoppingCart,
        },
      ],
    },
    {
      title: "Pelanggan",
      items: [{ title: "Pelanggan", url: "/dashboard/customers", icon: Users }],
    },
    {
      title: "Laporan",
      items: [
        {
          title: "Performa Sales",
          url: "/dashboard/reports/salesman",
          icon: BarChart3,
        },
      ],
    },
  ],
};

export function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Default ke kasir jika tidak ada role atau role tidak dikenali
  const userRole = (session?.user?.role as keyof typeof menuItems) || "kasir";
  const currentMenuItems = menuItems[userRole] || menuItems.kasir;

  return (
    <Sidebar>
      <SidebarContent>
        <div className="px-3 py-3 border-b">
          <h2 className="text-base sm:text-lg font-semibold">BizFlow</h2>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {session?.user?.name} ({userRole})
          </p>
        </div>

        {currentMenuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <div className="mt-auto p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              import("next-auth/react").then(({ signOut }) => signOut());
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                />
              </svg>
              Logout
            </button>
          </form>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
