import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, HeartHandshake, MapPin } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import {
  getMosqueCheckoutRoute,
  getMosqueDetailRoute,
  routes,
} from "../../../routes";

const loadingCards = Array.from({ length: 3 }, (_, index) => index);

const FeaturedMosques = () => {
  const navigate = useNavigate();
  const [generalMosques, setGeneralMosques] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const masjidResponse = await axiosInstance.get("/masjid?limit=6&generalDonationOnly=true");
        setGeneralMosques(masjidResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching featured landing data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  return (
    <section className="bg-[#f5f8f3] px-6 py-16 md:px-10 lg:px-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
              Donasi Umum Masjid
            </span>
            <h2 className="mt-5 text-3xl font-bold text-gray-900 md:text-5xl">
              Pilih masjid yang ingin Anda bantu, lalu salurkan donasi sesuai
              kebutuhannya.
            </h2>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5">
            <p className="text-lg leading-relaxed text-gray-700">
              Setiap masjid di bawah ini membuka donasi umum yang dapat
              digunakan untuk mendukung operasional, perawatan, dan kebutuhan
              prioritas lainnya.
            </p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Masjid unggulan
            </p>
            <h3 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
              Masjid yang membuka donasi umum
            </h3>
          </div>
          <button
            type="button"
            onClick={() => navigate(routes.public.mosques)}
            className="rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-emerald-500 hover:text-emerald-700"
          >
            Lihat Semua Masjid
          </button>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-3 md:gap-6 xl:grid-cols-3">
            {loadingCards.map((card) => (
              <div
                key={card}
                className="h-56 rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse md:h-[420px] md:rounded-[28px]"
              />
            ))}
          </div>
        ) : generalMosques.length === 0 ? (
          <div className="mt-8 rounded-[32px] bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Building2 className="h-8 w-8 text-emerald-700" />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-gray-900">
              Belum ada masjid dengan donasi umum aktif
            </h3>
            <p className="mt-2 text-gray-600">
              Masjid yang membuka donasi umum akan otomatis ditampilkan di sini.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 md:gap-6 xl:grid-cols-3">
            {generalMosques.map((masjid) => (
              <article
                key={masjid.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl md:rounded-[28px] md:shadow-lg"
              >
                <div className="relative">
                  <img
                    src={
                      masjid.GeneralDonationImage ||
                      masjid.FotoMasjid ||
                      "/Masjid1.jpg"
                    }
                    alt={masjid.Nama}
                    className="h-28 w-full object-cover sm:h-40 md:h-56"
                  />
                  <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-emerald-800 backdrop-blur md:left-4 md:top-4 md:gap-2 md:px-3 md:py-1.5 md:text-xs">
                    <HeartHandshake className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="md:hidden">Dibuka</span>
                    <span className="hidden md:inline">Donasi umum dibuka</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-3 md:p-6">
                  <h4 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 md:text-2xl">
                    {masjid.Nama}
                  </h4>
                  <p className="mt-1 line-clamp-1 text-xs font-semibold text-sky-700 md:mt-2 md:text-sm">
                    {masjid.GeneralDonationTitle || "Bantu kebutuhan masjid"}
                  </p>
                  <p className="mt-2 hidden line-clamp-3 text-sm leading-relaxed text-gray-600 md:mt-4 md:block">
                    {masjid.GeneralDonationDescription ||
                      masjid.Deskripsi ||
                      "Donasi umum membantu operasional, perawatan, dan kebutuhan rutin masjid."}
                  </p>

                  <div className="mt-2 flex items-start gap-1.5 text-[11px] text-gray-500 md:mt-4 md:gap-2 md:text-sm">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0 md:h-4 md:w-4" />
                    <span className="line-clamp-1 md:line-clamp-2">
                      {masjid.Alamat || "Alamat masjid belum tersedia"}
                    </span>
                  </div>

                  <div className="mt-auto grid grid-cols-1 gap-2 pt-3 md:mt-6 md:grid-cols-2 md:gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(getMosqueDetailRoute(masjid.id))}
                      className="rounded-lg border border-gray-300 px-2 py-2 text-[11px] font-semibold text-gray-800 transition hover:bg-gray-50 md:rounded-2xl md:px-4 md:py-3 md:text-sm"
                    >
                      <span className="md:hidden">Profil</span>
                      <span className="hidden md:inline">Lihat Profil</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(getMosqueCheckoutRoute(masjid.id))}
                      className="rounded-lg bg-emerald-600 px-2 py-2 text-[11px] font-semibold text-white transition hover:bg-emerald-700 md:rounded-2xl md:px-4 md:py-3 md:text-sm"
                    >
                      <span className="md:hidden">Donasi</span>
                      <span className="hidden md:inline">Donasi Umum</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default FeaturedMosques;
