import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import formatCurrency from "../../../utils/formatCurrency";
import formatDateWIB from "../../../utils/formatDate";
import {
  Heart,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { HistoryListSkeleton, StatStripSkeleton } from "../Skeleton";

const statusConfig = {
  Sukses: {
    color:
      "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
  },
  Pending: {
    color:
      "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200",
    icon: AlertCircle,
    iconColor: "text-amber-500",
  },
  Gagal: {
    color:
      "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200",
    icon: XCircle,
    iconColor: "text-red-500",
  },
};

export default function DonationHistoryList() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axiosInstance.get("donasi");
        if (response.data.statusCode !== 200) {
          throw new Error("Gagal mengambil data donasi");
        }
        setDonations(response.data.data || []);

        const total = response.data.data.length;
        const successful = response.data.data.filter(
          (d) => d.StatusDonasi === "Sukses"
        ).length;
        const totalAmount = response.data.data
          .filter((d) => d.StatusDonasi === "Sukses")
          .reduce((sum, d) => sum + Number(d.JumlahDonasi), 0);

        setStats({ total, successful, totalAmount });
      } catch (err) {
        console.error("Gagal mengambil data donasi", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen py-12"
        style={{
          background:
            "linear-gradient(135deg, rgba(12, 104, 57, 0.1) 0%, rgba(17, 130, 75, 0.1) 50%, rgba(10, 79, 46, 0.1) 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* Header placeholder */}
          <div className="text-center py-8 space-y-3">
            <div className="bg-gray-200 animate-pulse rounded-2xl h-16 w-16 mx-auto" />
            <div className="bg-gray-200 animate-pulse rounded h-7 w-56 mx-auto" />
            <div className="bg-gray-200 animate-pulse rounded h-4 w-72 mx-auto" />
          </div>
          {/* Stat strip */}
          <StatStripSkeleton count={3} />
          {/* List items */}
          <HistoryListSkeleton count={5} />
        </div>
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div
        className="min-h-screen py-12"
        style={{
          background:
            "linear-gradient(135deg, rgba(12, 104, 57, 0.1) 0%, rgba(17, 130, 75, 0.1) 50%, rgba(10, 79, 46, 0.1) 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div
                className="w-32 h-32 mx-auto rounded-full flex items-center justify-center shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(12, 104, 57, 0.2) 0%, rgba(17, 130, 75, 0.2) 50%, rgba(10, 79, 46, 0.2) 100%)",
                }}
              >
                <Heart className="w-16 h-16 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              Belum Ada Riwayat Donasi
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Mulai berdonasi untuk membantu pembangunan dan pemeliharaan masjid
              di sekitar kita.
            </p>
            <button
              className="text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(12, 104, 57, 0.95) 0%, rgba(17, 130, 75, 0.95) 50%, rgba(10, 79, 46, 0.95) 100%)",
              }}
            >
              Mulai Berdonasi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-12"
      style={{
        background:
          "linear-gradient(135deg, rgba(12, 104, 57, 0.1) 0%, rgba(17, 130, 75, 0.1) 50%, rgba(10, 79, 46, 0.1) 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-2xl shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, rgba(12, 104, 57, 0.95) 0%, rgba(17, 130, 75, 0.95) 50%, rgba(10, 79, 46, 0.95) 100%)",
              }}
            >
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-green-700">
              Riwayat Donasi
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Terima kasih atas kontribusi Anda dalam membangun dan memelihara
            rumah ibadah
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(12, 104, 57, 0.95) 0%, rgba(17, 130, 75, 0.95) 50%, rgba(10, 79, 46, 0.95) 100%)",
                }}
              >
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-left text-gray-600 font-medium">
                  Total Donasi
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-left text-gray-600 font-medium">
                  Berhasil
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.successful}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(12, 104, 57, 0.8) 0%, rgba(17, 130, 75, 0.8) 50%, rgba(10, 79, 46, 0.8) 100%)",
                }}
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-left text-gray-600 font-medium">
                  Total Nominal
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Donations List */}
        <div className="space-y-6">
          {donations.map((item, index) => {
            const StatusIcon =
              statusConfig[item.StatusDonasi]?.icon || AlertCircle;

            return (
              <div
                key={item.id}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Left Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex-shrink-0 p-3 rounded-xl group-hover:shadow-lg transition-all duration-300"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(12, 104, 57, 0.2) 0%, rgba(17, 130, 75, 0.2) 50%, rgba(10, 79, 46, 0.2) 100%)",
                        }}
                      >
                        <Heart className="w-6 h-6 text-green-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl text-left font-bold text-gray-800 mb-2 truncate">
                          {item.DonationChannel === "GENERAL"
                            ? item.masjid?.GeneralDonationTitle ||
                              `Donasi Umum ${item.masjid?.Nama || ""}`.trim()
                            : item.donasi_masjid?.Nama || "Donasi Masjid"}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">
                            {formatDateWIB(item.CreatedAt)}
                          </span>
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                            {item.DonationChannel === "GENERAL"
                              ? "Donasi Umum"
                              : "Campaign"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-4 w-full lg:w-auto lg:gap-6">
                    {/* Status Badge */}
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-semibold flex-shrink-0 ${
                        statusConfig[item.StatusDonasi]?.color ||
                        "bg-gray-100 text-gray-600 border-gray-300"
                      }`}
                    >
                      <StatusIcon
                        className={`w-4 h-4 ${
                          statusConfig[item.StatusDonasi]?.iconColor ||
                          "text-gray-500"
                        }`}
                      />
                      {item.StatusDonasi}
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-gray-500 mb-1">
                        Jumlah Donasi
                      </p>
                      <p className="text-xl lg:text-2xl font-bold text-green-700">
                        {formatCurrency(Number(item.JumlahDonasi))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <div className="inline-flex items-center gap-2 text-gray-500">
            <Heart className="w-4 h-4" />
            <span className="text-sm">
              Barakallahu fiikum atas kebaikan Anda
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
