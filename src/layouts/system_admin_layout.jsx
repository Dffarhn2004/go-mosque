import React, { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Tags,
  BookOpen,
  ChartColumn,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/system-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/system-admin/users", label: "Users", icon: Users },
  { to: "/system-admin/masjids", label: "Masjids", icon: Building2 },
  { to: "/system-admin/categories", label: "Categories", icon: Tags },
  { to: "/system-admin/coa", label: "Default COA", icon: BookOpen },
  { to: "/system-admin/monitoring", label: "Monitoring", icon: ChartColumn },
  { to: "/system-admin/audit-logs", label: "Audit Logs", icon: ClipboardList },
  { to: "/system-admin/settings", label: "Settings", icon: Settings },
];

export default function SystemAdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  if (!user || user?.role?.Nama !== "Admin") {
    navigate("/auth/admin", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f6f3ea] text-[#1e2a21]">
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-[#d7cfbc] bg-[#fbf8ef] p-5 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#8a7550]">
              Goqu
            </p>
            <h1 className="font-serif text-2xl font-semibold">System Admin</h1>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-[#e0d7c5] bg-white p-4">
          <p className="text-sm font-semibold">{user.NamaLengkap}</p>
          <p className="text-xs text-[#6e6758]">{user.Email}</p>
          <p className="mt-2 text-xs uppercase tracking-wide text-[#97784a]">
            {user.role?.Nama}
          </p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  active
                    ? "bg-[#1f4d3d] text-white"
                    : "text-[#304236] hover:bg-[#efe8d8]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/auth/admin", { replace: true });
          }}
          className="mt-8 flex w-full items-center gap-3 rounded-xl border border-[#d1c7b3] px-4 py-3 text-sm text-[#7b2e2e] hover:bg-[#f5e5e5]"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-[#ddd5c5] bg-[#f6f3ea]/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button className="lg:hidden" onClick={() => setOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#8a7550]">
                  Administration
                </p>
                <h2 className="text-lg font-semibold">
                  {navItems.find((item) => item.to === location.pathname)?.label ||
                    "System Admin"}
                </h2>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
