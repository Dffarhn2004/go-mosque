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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-72 rounded-3xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mosques.map((masjid) => (
            <div
              key={masjid.id}
              className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={
                  masjid.GeneralDonationImage ||
                  masjid.FotoMasjid ||
                  "/Masjid1.jpg"
                }
                alt={masjid.Nama}
                className="h-48 w-full object-cover"
              />
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <HeartHandshake className="h-4 w-4" />
                    Donasi Umum Dibuka
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {masjid.GeneralDonationTitle || `Donasi untuk ${masjid.Nama}`}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-blue-700">
                    {masjid.Nama}
                  </p>
                </div>

                <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                  {masjid.GeneralDonationDescription ||
                    masjid.Deskripsi ||
                    "Bantu operasional, perawatan, dan kebutuhan rutin masjid ini."}
                </p>

                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span className="line-clamp-2">{masjid.Alamat}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/masjid/${masjid.id}`)}
                    className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Lihat Masjid
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/masjid/${masjid.id}/checkout`)}
                    className="rounded-xl bg-[#0473A8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                  >
                    Donasi Sekarang
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
