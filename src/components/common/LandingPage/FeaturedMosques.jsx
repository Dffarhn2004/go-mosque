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
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loadingCards.map((card) => (
              <div
                key={card}
                className="h-[420px] rounded-[28px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"
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
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {generalMosques.map((masjid) => (
              <article
                key={masjid.id}
                className="overflow-hidden rounded-[28px] bg-white shadow-lg ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative">
                  <img
                    src={
                      masjid.GeneralDonationImage ||
                      masjid.FotoMasjid ||
                      "/Masjid1.jpg"
                    }
                    alt={masjid.Nama}
                    className="h-56 w-full object-cover"
                  />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-emerald-800 backdrop-blur">
                    <HeartHandshake className="h-4 w-4" />
                    Donasi umum dibuka
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-2xl font-bold text-gray-900">
                    {masjid.Nama}
                  </h4>
                  <p className="mt-2 text-sm font-semibold text-sky-700">
                    {masjid.GeneralDonationTitle || "Bantu kebutuhan masjid"}
                  </p>
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-gray-600">
                    {masjid.GeneralDonationDescription ||
                      masjid.Deskripsi ||
                      "Donasi umum membantu operasional, perawatan, dan kebutuhan rutin masjid."}
                  </p>

                  <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {masjid.Alamat || "Alamat masjid belum tersedia"}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(getMosqueDetailRoute(masjid.id))}
                      className="rounded-2xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                    >
                      Lihat Profil
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(getMosqueCheckoutRoute(masjid.id))}
                      className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Donasi Umum
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
