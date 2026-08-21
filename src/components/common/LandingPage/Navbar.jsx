import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, Settings, X } from "lucide-react";
import { logoutAndRedirect } from "../../../utils/authStorage";
import { routes } from "../../../routes";

const publicLinks = [
  { text: "Beranda", path: routes.public.landing, end: true },
  { text: "Jelajah Masjid", path: routes.public.mosques },
  { text: "Campaign Donasi", path: routes.public.campaigns },
  { text: "Tentang", path: routes.public.about, end: true },
];

const donorLinks = [
  { text: "Beranda Saya", path: routes.donor.home, end: true },
  { text: "Riwayat Donasi", path: routes.donor.history },
  { text: "Jelajah Masjid", path: routes.public.mosques },
  { text: "Campaign Donasi", path: routes.public.campaigns },
];

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "GQ";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const BrandLogo = ({ to }) => (
  <Link
    to={to}
    className="group flex items-center gap-2.5"
    aria-label="GoQu"
  >
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl">
      <img
        src="/Logo_Only.png"
        alt=""
        className="h-11 w-11 object-contain mix-blend-screen"
      />
    </span>
    <span className="text-[1.15rem] font-bold tracking-tight text-white transition group-hover:text-emerald-50">
      GoQu
    </span>
  </Link>
);

const DesktopNavLinks = ({ links }) => (
  <div className="flex items-center gap-1">
    {links.map((link) => (
      <NavLink
        key={link.path}
        to={link.path}
        end={link.end}
        className={({ isActive }) =>
          `rounded-full px-3.5 py-2 text-sm font-medium transition ${
            isActive
              ? "bg-white/15 text-white"
              : "text-white/75 hover:bg-white/10 hover:text-white"
          }`
        }
      >
        {link.text}
      </NavLink>
    ))}
  </div>
);

const AuthButtons = ({ fullWidth = false }) => (
  <Link
    to={routes.public.login}
    className={`inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0C6839] transition hover:bg-emerald-50 ${
      fullWidth ? "w-full" : ""
    }`}
  >
    Masuk
  </Link>
);

const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const initials = getInitials(user.name);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1 pl-1 pr-3 text-left transition hover:bg-white/15"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-xs font-bold text-[#063c24]">
          {initials}
        </span>
        <span className="max-w-[8.5rem] truncate text-sm font-semibold text-white">
          {user.name}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-white/70 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-black/5 bg-white py-2 shadow-xl shadow-black/10"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">
              {user.email || "Donatur GoQu"}
            </p>
          </div>
          <Link
            to={routes.donor.settings}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-800"
          >
            <Settings className="h-4 w-4" />
            Pengaturan
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      )}
    </div>
  );
};

const Navbar = ({ position = "fixed", user = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isFixed = position !== "static";
  const links = user ? donorLinks : publicLinks;
  const homePath = user ? routes.donor.home : routes.public.landing;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logoutAndRedirect(routes.public.landing);
  };

  return (
    <>
      <nav
        className={`${
          isFixed ? "sticky top-0 lg:fixed" : "relative"
        } left-0 top-0 isolate z-[120] w-full border-b border-white/10 transition-shadow duration-300 ${
          isScrolled ? "shadow-lg shadow-black/10" : ""
        }`}
        style={{
          background:
            "linear-gradient(135deg, #063c24 0%, #0C6839 52%, #0a4f32 100%)",
        }}
        role="navigation"
        aria-label="Navigasi utama"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex h-16 items-center justify-between gap-4">
            <BrandLogo to={homePath} />

            <div className="hidden flex-1 items-center justify-center lg:flex">
              <DesktopNavLinks links={links} />
            </div>

            <div className="hidden shrink-0 items-center lg:flex">
              {user ? (
                <UserMenu user={user} onLogout={handleLogout} />
              ) : (
                <AuthButtons />
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 lg:hidden"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="border-t border-white/10 pb-5 pt-3 lg:hidden">
              <div className="space-y-1">
                {links.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.end}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-3 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    {link.text}
                  </NavLink>
                ))}
              </div>

              {user ? (
                <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-300 text-sm font-bold text-[#063c24]">
                      {getInitials(user.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{user.name}</p>
                      <p className="truncate text-xs text-white/70">
                        {user.email || "Donatur GoQu"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate(routes.donor.settings);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white"
                    >
                      <Settings className="h-4 w-4" />
                      Pengaturan
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500/90 px-3 py-2 text-sm font-semibold text-white"
                    >
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <AuthButtons fullWidth />
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
