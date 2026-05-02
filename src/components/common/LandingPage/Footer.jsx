import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full py-16 px-8 md:px-32" style={{ backgroundColor: "#0C6839" }}>
      <div className="container mx-auto grid grid-cols-1 gap-12 md:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center mb-4">
            <img
              src="/Logo_With_Text.png"
              alt="GoQu Logo"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>
          <p className="text-white opacity-80 text-sm text-center md:text-left">
            GoQu adalah platform donasi dan pengelolaan masjid yang membantu transparansi antara takmir dan jamaah.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-start">
          <h3 className="mb-4 text-xl font-bold text-white">Jelajahi GoQu</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/")}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Beranda
            </button>
            <button
              onClick={() => navigate("/tentang-kami")}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Tentang Kami
            </button>
            <button
              onClick={() => navigate("/masjid-terdaftar")}
              className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Mulai Donasi
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
