import React, { useState, useEffect, useRef } from "react";
import Logo from "../../../assets/logo.svg";
import { useNavigate } from "react-router-dom";

const Navbar = ({ position = "fixed", user = null }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Handle scroll effect for navbar backdrop
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logout clicked");
    setIsUserDropdownOpen(false);
  };

  return (
    <>
      <nav
        className={`static md:${position} top-0 left-0 w-full z-[120] isolate transition-all duration-500 ease-in-out`}
        style={{
          background: isScrolled 
            ? "linear-gradient(135deg, rgba(12, 104, 57, 0.98) 0%, rgba(17, 130, 75, 0.98) 50%, rgba(10, 79, 46, 0.98) 100%)"
            : "linear-gradient(135deg, rgba(12, 104, 57, 0.95) 0%, rgba(17, 130, 75, 0.95) 50%, rgba(10, 79, 46, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: isScrolled 
            ? "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)"
            : "0 4px 20px rgba(0, 0, 0, 0.1)",
          borderBottom: isScrolled ? "1px solid rgba(255, 255, 255, 0.1)" : "none"
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-32">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Enhanced Logo with Glow Effect */}
            <div 
              className="flex items-center cursor-pointer group" 
              onClick={() => navigate("/")}
              onKeyDown={(e) => handleKeyDown(e, () => navigate("/"))}
              tabIndex={0}
              role="button"
              aria-label="Go to homepage"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500 transform group-hover:scale-125"></div>
                <img
                  src={Logo}
                  alt="Goqu Logo"
                  className="h-10 w-10 md:h-12 md:w-12 mr-3 transition-all duration-500 group-hover:scale-110 relative z-10"
                />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-full transition-all duration-300 backdrop-blur-sm"></div>
              </div>
              <span className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent group-hover:from-emerald-100 group-hover:to-white transition-all duration-300">
                GoQu
              </span>
            </div>

            {/* Enhanced Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {user ? (
                // Enhanced Authenticated view
                <>
                  <NavLink 
                    text="Dashboard" 
                    onClick={() => navigate("/home")}
                    icon="🏠"
                  />
                  <NavLink 
                    text="Riwayat Donasi" 
                    onClick={() => navigate("/riwayat")}
                    icon="📋"
                  />
                  <NavLink 
                    text="Masjid Terdaftar" 
                    onClick={() => navigate("/masjid-terdaftar")}
                    icon="🕌"
                  />
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-3 rounded-xl border border-white/30 bg-white/5 p-3 backdrop-blur-sm">
                      <div className="relative">
                        <img
                          src={user.avatar || "https://source.unsplash.com/40x40/?face"}
                          alt={`${user.name} profile picture`}
                          className="h-10 w-10 rounded-full border-2 border-white/20 shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400 animate-pulse"></div>
                      </div>
                      <div className="text-sm leading-tight text-white">
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-xs opacity-80">
                          {user.role || "Donatur"}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="rounded-xl bg-red-500/90 px-4 py-2.5 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-red-600 hover:shadow-xl"
                    >
                      Keluar
                    </button>
                  </div>
                </>
              ) : (
                // Enhanced Landing page view
                <>
                  <NavLink text="Beranda" href="#beranda" icon="🏠" />
                  <NavLink text="Tentang Kami" href="#tentang" icon="ℹ️" />
                  
                  <div className="flex items-center space-x-3">
                    <PrimaryButton
                      text="Ayoo Bantu Mesjid"
                      onClick={() => navigate("/auth")}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
                      icon="🤲"
                    />
                    <SecondaryButton
                      text="Daftarkan Mesjid"
                      onClick={() => navigate("/auth/admin")}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl"
                      icon="🕌"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Enhanced Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                onKeyDown={(e) => handleKeyDown(e, toggleMenu)}
                className="text-white hover:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:rounded-lg p-2 transition-all duration-300 hover:bg-white/10 rounded-lg"
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

          {/* Enhanced Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-white/20 py-4 animate-slideDown backdrop-blur-xl">
              {user ? (
                <div className="space-y-2">
                  <MobileNavLink text="🏠 Dashboard" onClick={() => navigate("/home")} />
                  <MobileNavLink text="📋 Riwayat Donasi" onClick={() => navigate("/riwayat")} />
                  <MobileNavLink text="🕌 Masjid Terdaftar" onClick={() => navigate("/masjid-terdaftar")} />
                  
                  {/* Enhanced Mobile User Info */}
                  <div className="mx-4 my-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={user.avatar || "https://source.unsplash.com/40x40/?face"}
                          alt={user.name}
                          className="h-12 w-12 rounded-full border-2 border-white/30"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
                      </div>
                      <div className="text-white">
                        <div className="font-semibold text-base">{user.name}</div>
                        <div className="text-sm opacity-80">{user.role || "Donatur"}</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
                      <MobileNavLink text="👤 Profil Saya" onClick={() => navigate("/profile")} />
                      <MobileNavLink text="⚙️ Pengaturan" onClick={() => navigate("/settings")} />
                      <MobileNavLink 
                        text="🚪 Keluar" 
                        onClick={handleLogout}
                        className="text-red-200 hover:text-red-100 hover:bg-red-500/20"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <MobileNavLink text="🏠 Beranda" href="#beranda" />
                  <MobileNavLink text="ℹ️ Tentang Kami" href="#tentang" />
                  
                  <div className="space-y-3 px-4 pt-4">
                    <PrimaryButton
                      text="🤲 Ayoo Bantu Mesjid"
                      onClick={() => navigate("/auth")}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    />
                    <SecondaryButton
                      text="🕌 Daftarkan Mesjid"
                      onClick={() => navigate("/auth/admin")}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Add global styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

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

        .animate-fadeInUp {
          animation: fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-slideDown {
          animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Focus styles for better accessibility */
        button:focus,
        [role="button"]:focus {
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 2px;
        }

        /* Custom scrollbar for dropdown if needed */
        .dropdown-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .dropdown-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        
        .dropdown-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};

// Enhanced Helper Components
const NavLink = ({ text, href, onClick, icon }) => (
  <a
    href={href}
    onClick={onClick}
    onKeyDown={(e) => e.key === 'Enter' && onClick && onClick()}
    className="group relative px-4 py-2 text-white font-medium hover:text-emerald-100 cursor-pointer transition-all duration-300 rounded-lg hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
    tabIndex={0}
    role={onClick ? "button" : "link"}
  >
    <span className="flex items-center space-x-2">
      {icon && <span className="text-sm">{icon}</span>}
      <span>{text}</span>
    </span>
    <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
  </a>
);

const MobileNavLink = ({ text, href, onClick, className = "" }) => (
  <a
    href={href}
    onClick={onClick}
    onKeyDown={(e) => e.key === 'Enter' && onClick && onClick()}
    className={`block mx-4 px-4 py-3 text-white font-medium hover:text-emerald-100 hover:bg-white/10 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 ${className}`}
    tabIndex={0}
    role={onClick ? "button" : "link"}
  >
    {text}
  </a>
);

const PrimaryButton = ({ text, onClick, className = "", icon }) => (
  <button
    onClick={onClick}
    className={`group relative px-6 py-2.5 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 overflow-hidden ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <span className="relative flex items-center justify-center space-x-2">
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </span>
  </button>
);

const SecondaryButton = ({ text, onClick, className = "", icon }) => (
  <button
    onClick={onClick}
    className={`group relative px-6 py-2.5 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/50 overflow-hidden ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <span className="relative flex items-center justify-center space-x-2">
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </span>
  </button>
);

const DropdownItem = ({ text, onClick, className = "" }) => (
  <button
    onClick={onClick}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
    className={`w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:bg-gray-50 focus:text-gray-900 flex items-center space-x-2 ${className}`}
    tabIndex={0}
  >
    <span>{text}</span>
  </button>
);

export default Navbar;
