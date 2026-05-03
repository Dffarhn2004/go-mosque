import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MosqueCard from "../MosqueCard";
import axiosInstance from "../../../api/axiosInstance";
import { Heart, Building2, SearchX } from "lucide-react";
import { getCampaignDetailRoute, routes } from "../../../routes";

// Loading Skeleton Component
const MosqueCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md w-3/4"></div>

        {/* Mosque name skeleton */}
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md w-1/2"></div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md w-full"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md w-4/5"></div>
        </div>

        {/* Progress bar skeleton */}
        <div className="pt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 bg-[length:200%_100%] animate-shimmer rounded-full w-3/5"></div>
          </div>

          {/* Amount skeleton */}
          <div className="flex justify-between mt-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md w-24"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Loading Component
const EnhancedLoadingScreen = ({ limit = 3 }) => {
  return (
    <div className="space-y-8">
      {/* Header loading */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md w-80"></div>
        <div className="h-10 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 bg-[length:200%_100%] animate-shimmer rounded-md w-40"></div>
      </div>

      {/* Cards grid loading */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: limit }, (_, index) => (
          <MosqueCardSkeleton key={index} />
        ))}
      </div>

      {/* Loading text with animation */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
        <p className="text-gray-600 mt-2 text-sm font-medium">
          Memuat kampanye donasi...
        </p>
      </div>
    </div>
  );
};

const MosqueCardSection = ({
  title = "Masjid Membutuhkan Kamu Segera",
  subtitle = "Pilih campaign dari masjid terdaftar sesuai kebutuhan yang ingin Anda bantu.",
  seeMore = true,
  seeMoreUrl = routes.public.campaigns,
  position = "px-6 md:px-20 mt-12",
  limit = 3,
  showEmptyState = true,
  searchTerm = "",
}) => {
  const [donationCampaigns, setDonationCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axiosInstance.get("/donasi-masjid?limit=" + limit);
        setDonationCampaigns(res.data.data); // sesuaikan struktur response lo
        console.log("Fetched donation campaigns:", res.data.data);
      } catch (error) {
        console.error("Error fetching donation campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [limit]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredCampaigns = donationCampaigns.filter((campaign) => {
    if (!normalizedSearch) return true;

    return [
      campaign.Nama,
      campaign.Deskripsi,
      campaign.masjid?.Nama,
      campaign.masjid?.Alamat,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  });

  return (
    <section className={`${position}`}>
      {loading ? (
        <EnhancedLoadingScreen limit={limit} />
      ) : donationCampaigns.length === 0 ? (
        showEmptyState ? (
          <div className="rounded-[32px] border border-gray-100 bg-white shadow-sm">
            <div className="px-4 py-16 text-center">
              <div className="relative mb-8 inline-block">
                <div
                  className="mx-auto flex h-32 w-32 items-center justify-center rounded-full shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(12, 104, 57, 0.2) 0%, rgba(17, 130, 75, 0.2) 50%, rgba(10, 79, 46, 0.2) 100%)",
                  }}
                >
                  <Building2 className="w-16 h-16 text-green-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                Belum Ada Donasi
              </h3>
              <p className="mx-auto mb-8 max-w-md text-gray-500">
                Belum ada campaign donasi yang tersedia saat ini. Campaign akan
                ditampilkan di halaman ini setelah dibuka oleh pengelola masjid.
              </p>
            </div>
          </div>
        ) : null
      ) : filteredCampaigns.length === 0 ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <SearchX className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="mt-5 text-2xl font-bold text-slate-900">
            Campaign tidak ditemukan
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Belum ada campaign yang cocok dengan pencarian <b>{searchTerm}</b>.
            Coba gunakan kata kunci lain untuk melihat hasil yang tersedia.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                {title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                {subtitle}
              </p>
            </div>

            {seeMore && (
              <button
                onClick={() => navigate(seeMoreUrl)}
                className="flex items-center rounded-2xl bg-[#0473A8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Lihat Lebih banyak
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCampaigns.map((mosque, index) => (
              <MosqueCard
                key={index}
                image={mosque.FotoDonasi}
                title={mosque.Nama}
                name={mosque.masjid.Nama}
                description={mosque.Deskripsi}
                currentAmount={mosque.UangDonasiTerkumpul}
                targetAmount={mosque.TargetUangDonasi}
                onClick={() => navigate(getCampaignDetailRoute(mosque.id))}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default MosqueCardSection;
