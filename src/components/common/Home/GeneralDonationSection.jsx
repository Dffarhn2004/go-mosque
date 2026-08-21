import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, HeartHandshake, MapPin } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";

const GeneralDonationSection = ({
  title = "Donasi Umum Untuk Masjid",
  limit = 6,
  position = "px-6 md:px-20 mt-12",
}) => {
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMosques = async () => {
      try {
        const response = await axiosInstance.get(
          `/masjid?limit=${limit}&generalDonationOnly=true`
        );
        setMosques(response.data.data || []);
      } catch (error) {
        console.error("Error fetching general donation mosques:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMosques();
  }, [limit]);

  return (
    <section className={position}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Setiap masjid di bawah ini menerima donasi umum meski tanpa campaign
            khusus.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-56 rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse md:h-72 md:rounded-3xl"
            />
          ))}
        </div>
      ) : mosques.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Building2 className="h-8 w-8 text-green-700" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Belum Ada Donasi Umum
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Masjid yang membuka donasi umum akan tampil di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
          {mosques.map((masjid) => (
            <div
              key={masjid.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:rounded-3xl md:shadow-lg"
            >
              <img
                src={
                  masjid.GeneralDonationImage ||
                  masjid.FotoMasjid ||
                  "/Masjid1.jpg"
                }
                alt={masjid.Nama}
                className="h-28 w-full object-cover sm:h-36 md:h-48"
              />
              <div className="flex flex-1 flex-col space-y-2 p-3 md:space-y-4 md:p-6">
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 md:gap-2 md:px-3 md:py-1 md:text-xs">
                  <HeartHandshake className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="md:hidden">Dibuka</span>
                  <span className="hidden md:inline">Donasi Umum Dibuka</span>
                </span>

                <div>
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 md:text-xl">
                    {masjid.GeneralDonationTitle || `Donasi untuk ${masjid.Nama}`}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs font-medium text-blue-700 md:text-sm">
                    {masjid.Nama}
                  </p>
                </div>

                <p className="hidden line-clamp-3 text-sm leading-relaxed text-gray-600 md:block">
                  {masjid.GeneralDonationDescription ||
                    masjid.Deskripsi ||
                    "Bantu operasional, perawatan, dan kebutuhan rutin masjid ini."}
                </p>

                <div className="flex items-start gap-1.5 text-[11px] text-gray-500 md:gap-2 md:text-sm">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0 md:h-4 md:w-4" />
                  <span className="line-clamp-1 md:line-clamp-2">{masjid.Alamat}</span>
                </div>

                <div className="mt-auto grid grid-cols-1 gap-2 pt-1 md:grid-cols-2 md:gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/masjid/${masjid.id}`)}
                    className="rounded-lg border border-gray-300 px-2 py-2 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50 md:rounded-xl md:px-4 md:py-3 md:text-sm"
                  >
                    <span className="md:hidden">Lihat</span>
                    <span className="hidden md:inline">Lihat Masjid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/masjid/${masjid.id}/checkout`)}
                    className="rounded-lg bg-[#0473A8] px-2 py-2 text-[11px] font-semibold text-white transition hover:bg-sky-700 md:rounded-xl md:px-4 md:py-3 md:text-sm"
                  >
                    <span className="md:hidden">Donasi</span>
                    <span className="hidden md:inline">Donasi Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default GeneralDonationSection;
