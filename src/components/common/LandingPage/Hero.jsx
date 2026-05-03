import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageCarousel from "./ImageCarousel";
import { routes } from "../../../routes";

const landingPopularSearches = [
  "Masjid Jogja",
  "Masjid komunitas",
  "Donasi umum",
];

const homePopularSearches = [
  "Masjid terdekat",
  "Operasional masjid",
  "Renovasi masjid",
];

const spotlightCards = [
  {
    title: "Pilih Masjid",
    description: "Mulai dari profil masjid, bukan langsung dari campaign.",
  },
  {
    title: "Lihat Transparansi",
    description: "Cek laporan keuangan dan aktivitas sebelum berdonasi.",
  },
  {
    title: "Donasi Fleksibel",
    description: "Bisa donasi umum masjid atau ke campaign tertentu.",
  },
];

const Hero = ({ isHome = false }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const popularSearches = useMemo(
    () => (isHome ? homePopularSearches : landingPopularSearches),
    [isHome]
  );

  const handleSearch = (keyword = searchTerm) => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      navigate(routes.public.mosques);
      return;
    }

    navigate(`${routes.public.mosques}?search=${encodeURIComponent(trimmedKeyword)}`);
  };

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),linear-gradient(135deg,#063c24_0%,#0C6839_45%,#0F8A4C_100%)]">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -left-12 top-12 h-40 w-40 rounded-full bg-emerald-300 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-sky-400/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-amber-300/30 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl gap-12 px-6 py-14 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-20">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-50 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            Donasi masjid dimulai dari profil masjid yang jelas
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Temukan masjid, pahami kebutuhannya, lalu salurkan donasi dengan
            lebih yakin.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-emerald-50/90 md:text-xl">
            GoQu sekarang tidak hanya menampilkan campaign. Donatur bisa mulai
            dari daftar masjid, melihat donasi umum, aktivitas, dan transparansi
            keuangan sebelum membantu.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              "Profil masjid terpusat",
              "Donasi umum tersedia",
              "Laporan mudah diakses",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[28px] border border-white/15 bg-white p-3 shadow-2xl shadow-black/20">
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <input
                id="landing-search"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Cari nama masjid, kota, atau kebutuhan donasi"
                className="rounded-2xl border border-gray-200 px-5 py-4 text-base text-gray-800 outline-none transition focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleSearch()}
                className="rounded-2xl bg-[#0473A8] px-6 py-4 text-base font-semibold text-white transition hover:bg-sky-700"
              >
                Cari Masjid
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(routes.public.mosques)
                }
                className="rounded-2xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-emerald-700"
              >
                Mulai Donasi
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
              <span className="text-sm text-gray-500">Pencarian populer:</span>
              {popularSearches.map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => handleSearch(keyword)}
                  className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-[560px]">
            <div className="rounded-[32px] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <div className="rounded-[24px] overflow-hidden border border-white/10">
                <ImageCarousel />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {spotlightCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl bg-[#072d1c]/60 p-4 text-white"
                  >
                    <p className="text-sm font-semibold text-amber-300">
                      {card.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-emerald-50/85">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Masjid aktif", value: "Daftar terkurasi" },
                { label: "Donasi umum", value: "Tanpa tunggu campaign" },
                { label: "Laporan", value: "Lebih transparan" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-center text-white backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
