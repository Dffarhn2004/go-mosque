import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutAndRedirect } from "../../../utils/authStorage";
import { routes } from "../../../routes";

const publicLinks = [
  { text: "Beranda", path: routes.public.landing },
  { text: "Jelajah Masjid", path: routes.public.mosques },
  { text: "Campaign Donasi", path: routes.public.campaigns },
  { text: "Tentang", path: routes.public.about },
];

const donorLinks = [
  { text: "Beranda Saya", path: routes.donor.home },
  { text: "Riwayat Donasi", path: routes.donor.history },
  { text: "Jelajah Masjid", path: routes.public.mosques },
  { text: "Campaign Donasi", path: routes.public.campaigns },
];

const Navbar = ({ position = "fixed", user = null }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const desktopPositionClass = position === "static" ? "lg:static" : "lg:fixed";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logoutAndRedirect(routes.public.landing);
  };

  const links = user ? donorLinks : publicLinks;

  return (
    <>
      <nav
        className={`static ${desktopPositionClass} left-0 top-0 isolate z-[120] w-full transition-all duration-500 ease-in-out`}
        style={{
          background: isScrolled
            ? "linear-gradient(135deg, rgba(12, 104, 57, 0.98) 0%, rgba(17, 130, 75, 0.98) 50%, rgba(10, 79, 46, 0.98) 100%)"
            : "linear-gradient(135deg, rgba(12, 104, 57, 0.95) 0%, rgba(17, 130, 75, 0.95) 50%, rgba(10, 79, 46, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: isScrolled
            ? "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)"
            : "0 4px 20px rgba(0, 0, 0, 0.1)",
          borderBottom: isScrolled ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-32">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              type="button"
              className="group flex items-center"
              onClick={() => navigate(routes.public.landing)}
              aria-label="Go to homepage"
            >
              <div className="relative">
                <div className="absolute inset-0 scale-100 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-25 group-hover:scale-105" />
                <img
                  src="/Logo_With_Text.png"
                  alt="GoQu"
                  className="relative z-10 h-8 w-auto object-contain transition-all duration-300 group-hover:scale-[1.02] md:h-10"
                />
              </div>
            </button>

            <div className="hidden items-center space-x-2 lg:flex lg:space-x-4">
              {links.map((link) => (
                <NavLink
                  key={link.path}
                  text={link.text}
                  onClick={() => navigate(link.path)}
                />
              ))}

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center space-x-3 rounded-xl border border-white/30 bg-white/5 p-3 backdrop-blur-sm">
                    <div className="relative">
                      <img
                        src={user.avatar || "https://source.unsplash.com/40x40/?face"}
                        alt={`${user.name} profile picture`}
                        className="h-10 w-10 rounded-full border-2 border-white/20 shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
                    </div>
                    <div className="text-sm leading-tight text-white">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-xs opacity-80">{user.role || "Donatur"}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl bg-red-500/90 px-4 py-2.5 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-red-600 hover:shadow-xl"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <PrimaryButton
                    text="Masuk"
                    onClick={() => navigate(routes.public.login)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
                  />
                  <SecondaryButton
                    text="Daftar"
                    onClick={() => navigate(routes.public.register)}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                  />
                  <SecondaryButton
                    text="Daftarkan Masjid"
                    onClick={() => navigate(routes.admin.login)}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl"
                  />
                </div>
              )}
            </div>

            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="rounded-lg p-2 text-white transition-all duration-300 hover:bg-white/10 hover:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-expanded={isMenuOpen}
                aria-label="Toggle mobile menu"
              >
                <svg
                  className={`h-6 w-6 transition-transform duration-300 ${
                    isMenuOpen ? "rotate-90 scale-110" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="animate-slideDown border-t border-white/20 py-4 backdrop-blur-xl lg:hidden">
              <div className="space-y-2">
                {links.map((link) => (
                  <MobileNavLink
                    key={link.path}
                    text={link.text}
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate(link.path);
                    }}
                  />
                ))}
              </div>

              {user ? (
                <div className="mx-4 my-4 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={user.avatar || "https://source.unsplash.com/40x40/?face"}
                        alt={user.name}
                        className="h-12 w-12 rounded-full border-2 border-white/30"
                      />
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
                    </div>
                    <div className="text-white">
                      <div className="font-semibold text-base">{user.name}</div>
                      <div className="text-sm opacity-80">{user.role || "Donatur"}</div>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-white/20 pt-3">
                    <MobileNavLink
                      text="Keluar"
                      onClick={handleLogout}
                      className="text-red-200 hover:bg-red-500/20 hover:text-red-100"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 px-4 pt-4">
                  <PrimaryButton
                    text="Masuk"
                    onClick={() => navigate(routes.public.login)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  />
                  <SecondaryButton
                    text="Daftar"
                    onClick={() => navigate(routes.public.register)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                  />
                  <SecondaryButton
                    text="Daftarkan Masjid"
                    onClick={() => navigate(routes.admin.login)}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-15px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        button:focus,
        [role="button"]:focus {
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
};

const NavLink = ({ text, href, onClick }) => (
  <a
    href={href}
    onClick={onClick}
    onKeyDown={(event) => event.key === "Enter" && onClick && onClick()}
    className="group relative cursor-pointer rounded-lg border border-transparent px-4 py-2 font-medium text-white transition-all duration-300 hover:bg-white/10 hover:text-emerald-100 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
    tabIndex={0}
    role={onClick ? "button" : "link"}
  >
    <span>{text}</span>
    <span className="absolute bottom-1 left-4 right-4 h-0.5 scale-x-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-transform duration-300 group-hover:scale-x-100" />
  </a>
);

const MobileNavLink = ({ text, href, onClick, className = "" }) => (
  <a
    href={href}
    onClick={onClick}
    onKeyDown={(event) => event.key === "Enter" && onClick && onClick()}
    className={`mx-4 block cursor-pointer rounded-xl border border-transparent px-4 py-3 font-medium text-white transition-all duration-300 hover:bg-white/10 hover:text-emerald-100 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 ${className}`}
    tabIndex={0}
    role={onClick ? "button" : "link"}
  >
    {text}
  </a>
);

const PrimaryButton = ({ text, onClick, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative overflow-hidden rounded-xl px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 ${className}`}
  >
    <span className="relative">{text}</span>
  </button>
);

const SecondaryButton = ({ text, onClick, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative overflow-hidden rounded-xl px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-emerald-400/50 ${className}`}
  >
    <span className="relative">{text}</span>
  </button>
);

export default Navbar;
