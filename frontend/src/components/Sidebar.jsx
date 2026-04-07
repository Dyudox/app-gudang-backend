import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  List,
  UserPlus,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(""); // Untuk melacak submenu mana yang terbuka
  const location = useLocation();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: Package,
      label: "Data Barang",
      submenu: [
        { label: "Daftar Barang", path: "/barang", icon: List },
        { label: "Tambah Barang", path: "/barang/tambah", icon: PlusCircle },
      ],
    },
    {
      icon: Users,
      label: "User Management",
      submenu: [
        { label: "Semua User", path: "/users", icon: List },
        { label: "Tambah User", path: "/users/tambah", icon: UserPlus },
        { label: "Hak Akses", path: "/users/roles", icon: ShieldCheck },
      ],
    },
    { icon: History, label: "Log Transaksi", path: "/logs" },
    { icon: Settings, label: "Pengaturan", path: "/settings" },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleSubmenu = (label) => {
    setOpenSubmenu(openSubmenu === label ? "" : label);
  };

  return (
    <>
      {/* TOMBOL HAMBURGER (Mobile) - Sekarang Ikut Bergeser */}
      <div
        className={`
          lg:hidden fixed top-4 z-50 transition-all duration-300
          ${isOpen ? "left-56" : "left-4"}
        `}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className={`shadow-md border-none ${isOpen ? "bg-white text-slate-600" : "bg-blue-600 text-white"}`}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* OVERLAY (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
        fixed top-0 left-0 h-screen bg-white border-r shadow-sm z-40 transition-all duration-300
        w-64 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0
      `}
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <Package size={24} /> KIERO GUDANG
          </h2>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const hasSubmenu = !!item.submenu;
            const isSubmenuOpen = openSubmenu === item.label;
            const isActive = location.pathname === item.path;

            return (
              <div key={item.label}>
                {hasSubmenu ? (
                  /* ITEM DENGAN SUBMENU */
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className="w-full flex items-center justify-between px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {isSubmenuOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                ) : (
                  /* ITEM BIASA */
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                )}

                {/* AREA SUBMENU */}
                {hasSubmenu && isSubmenuOpen && (
                  <div className="ml-9 mt-1 space-y-1 border-l-2 border-slate-100 pl-2 transition-all">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          location.pathname === sub.path
                            ? "text-blue-600 bg-blue-50"
                            : "text-slate-500 hover:text-blue-600 hover:bg-slate-50"
                        }`}
                      >
                        <sub.icon size={16} />
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 gap-3"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
          >
            <LogOut size={20} /> Keluar
          </Button>
        </div>
      </aside>
    </>
  );
}
