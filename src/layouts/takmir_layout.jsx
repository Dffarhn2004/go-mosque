// src/layouts/MainLayout.jsx
import React, { useState } from "react";
import {
  LogOut,
  Users,
  BarChart2,
  Home,
  FileText,
  Bell,
  ChevronDown,
  Menu,
  X,
  Settings,
  User,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  {
    label: "Dashboard",
    icon: <Home className="w-5 h-5" />,
    to: "/admin/dashboard",
  },
  {
    label: "Donasi",
    icon: <BarChart2 className="w-5 h-5" />,
    to: "/admin/donation",
  },
  {
    label: "Donatur",
    icon: <Users className="w-5 h-5" />,
    to: "/admin/donatur",
  },
  {
    label: "Sistem Jurnal",
    icon: <FileText className="w-5 h-5" />,
    to: "/admin/jurnal",
    children: [
      { label: "Chart of Accounts", to: "/admin/coa" },
      { label: "Input Jurnal", to: "/admin/jurnal" },
      { label: "Buku Besar", to: "/admin/buku-besar" },
      { label: "Laporan dari Jurnal", to: "/admin/laporan-jurnal" },
    ],
  },
  {
    label: "Kelola Masjid",
    icon: <Settings className="w-5 h-5" />,
    to: "/admin/masjid",
    children: [
      { label: "Identitas Masjid", to: "/admin/masjid/identitas" },
      { label: "Fasilitas Masjid", to: "/admin/masjid/fasilitas" },
      { label: "Dokumen Pendukung", to: "/admin/masjid/dokumen" },
      { label: "Kegiatan Masjid", to: "/admin/masjid/kegiatan" },
    ],
  },
];

export default function TakmirLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const parseStorageItem = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  };

  if (!localStorage.getItem("user")) {
    navigate("/", { replace: true });
    return null; // Prevent rendering if user is not logged in
  }

  const user = parseStorageItem("user");
  let masjid = parseStorageItem("masjid");

  if ((!masjid?.Nama || masjid?.Email) && user?.masjid?.Nama) {
    masjid = user.masjid;
    localStorage.setItem("masjid", JSON.stringify(user.masjid));
  }

  const masjidName = masjid?.Nama || user?.masjid?.Nama || "Masjid";

  if (user?.role?.Nama === "Admin") {
    navigate("/system-admin/dashboard", { replace: true });
    return null;
  }

  if (!masjid) {
    navigate("/auth/admin", { replace: true });
    return null;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleProfileDropdown = () =>
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);

  const isActiveRoute = (path) => location.pathname === path;

  const getCurrentPageTitle = () => {
    const currentItem = navItems.find((item) => item.to === location.pathname);
    return currentItem ? currentItem.label : "Dashboard";
  };

  const [openMenus, setOpenMenus] = useState({});
  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-20 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {masjidName}
              </h3>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.to);
            const isMenuOpen = openMenus[item.label] || false;

            return (
              <div key={item.label}>
                <button
                  onClick={() => {
                    if (item.children) {
                      toggleMenu(item.label);
                    } else {
                      setIsSidebarOpen(false);
                      navigate(item.to);

                      window.scrollTo(0, 0); // Scroll to top when navigating
                    }
                  }}
                  className={`
            flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
            ${
              isActive
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }
          `}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-white" : "text-gray-500"}>
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                  {item.children && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Render submenu jika ada */}
                {item.children && isMenuOpen && (
                  <div className="ml-4 mt-1 pl-3 border-l-2 border-emerald-200 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = isActiveRoute(child.to);

                      return (
                        <Link
                          key={child.label}
                          to={child.to}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`
            group flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all duration-200
            ${
              isChildActive
                ? "bg-emerald-100 text-green-700 font-medium"
                : "text-gray-600 hover:bg-gray-100 hover:text-emerald-700"
            }
          `}
                        >
                          {/* Dot Icon */}
                          <span
                            className={`w-2 h-2 rounded-full transition-colors duration-200 
              ${
                isChildActive
                  ? "bg-emerald-600"
                  : "bg-gray-300 group-hover:bg-emerald-500"
              }
            `}
                          />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {getCurrentPageTitle()}
              </h2>
              <p className="text-sm text-gray-500">
                Manage your mosque operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={toggleNotification}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 hover:bg-gray-50 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">
                        New donation received
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Rp 500,000 from Ahmad Fauzi
                      </p>
                    </div>
                    <div className="p-3 hover:bg-gray-50 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">
                        Monthly report ready
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Financial report for March 2024
                      </p>
                    </div>
                    <div className="p-3 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-800">
                        New donor registered
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Siti Aminah joined the system
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                  className="w-8 h-8 rounded-full object-cover"
                  alt="User Avatar"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-800">
                    {user?.NamaLengkap || "User Name"}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isProfileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <p className="font-medium text-gray-800">
                      {" "}
                      {user?.NamaLengkap || "User Name"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {" "}
                      {user?.Email || "User Name"}
                    </p>
                  </div>
                  <div className="py-2">
                    <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="w-4 h-4" />
                      Profile Settings
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="w-4 h-4" />
                      System Settings
                    </button>
                  </div>
                  <div className="border-t border-gray-200 py-2">
                    <button
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => {
                        localStorage.clear();
                        navigate("/", { replace: true });
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>

      {/* Click outside handlers */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
      {isNotificationOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsNotificationOpen(false)}
        />
      )}
    </div>
  );
}
