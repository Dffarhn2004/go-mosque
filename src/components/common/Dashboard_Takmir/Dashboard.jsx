import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Download,
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  HeartHandshake,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DonationCard from "./DonationCardTakmir";
import DonaturTableTakmir from "./DonaturTableTakmir";
import StatCard from "./StatCards";
import { DashboardSkeleton } from "../Skeleton";
import formatCurrency from "../../../utils/formatCurrency";
import axiosInstance from "../../../api/axiosInstance";

const Dashboard = () => {
  const navigate = useNavigate();

  const masjidId = useMemo(() => {
    try {
      const raw = localStorage.getItem("masjid");
      const parsedMasjid = raw ? JSON.parse(raw) : null;
      return parsedMasjid?.id ?? null;
    } catch {
      return null;
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["takmir-dashboard", masjidId],
    enabled: Boolean(masjidId),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const [statsResponse, campaignResponse, donorResponse, masjidResponse] =
        await Promise.all([
          axiosInstance.get(`/statistik/${masjidId}`),
          axiosInstance.get("/donasi-masjid/takmir?limit=3"),
          axiosInstance.get("/donasi/donatur"),
          axiosInstance.get("/masjid/takmir"),
        ]);

      return {
        stats: statsResponse.data.data,
        donationCampaigns: campaignResponse.data.data || [],
        donatur: donorResponse.data.data || [],
        masjid: masjidResponse.data.data || null,
      };
    },
  });

  const stats = data?.stats ?? {
    cashIn: { total: 0 },
    cashOut: { total: 0 },
    transactions: { total: 0 },
    generalDonations: { total: 0, count: 0 },
    campaignDonations: { total: 0, count: 0 },
  };
  const donationCampaigns = data?.donationCampaigns ?? [];
  const donatur = data?.donatur ?? [];
  const masjid = data?.masjid ?? null;

  if (masjidId && isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="mt-1 flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-green-600 bg-white px-4 py-2 text-green-600 transition-colors hover:bg-green-50">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Arus Kas Masuk"
          count={formatCurrency(stats.cashIn.total)}
          icon={ArrowDownCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Arus Kas Keluar"
          count={formatCurrency(stats.cashOut.total)}
          icon={ArrowUpCircle}
          color="bg-red-500"
        />
        <StatCard
          title="Total Transaksi"
          count={stats.transactions.total}
          icon={Banknote}
          color="bg-yellow-500"
        />
        <StatCard
          title="Donasi Umum"
          count={formatCurrency(stats.generalDonations.total)}
          icon={HeartHandshake}
          color="bg-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Donasi Umum Masjid
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Ringkasan penerimaan umum yang selalu terbuka untuk masjid.
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  masjid?.isOpenForGeneralDonation
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {masjid?.isOpenForGeneralDonation ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 p-5">
              <p className="text-sm font-medium text-emerald-800">
                Total Donasi Umum
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {formatCurrency(stats.generalDonations.total)}
              </p>
              <p className="mt-2 text-sm text-emerald-900/70">
                {stats.generalDonations.count} transaksi sukses
              </p>
            </div>

            <div className="rounded-2xl bg-sky-50 p-5">
              <p className="text-sm font-medium text-sky-800">
                Total Donasi Campaign
              </p>
              <p className="mt-2 text-2xl font-bold text-sky-700">
                {formatCurrency(stats.campaignDonations.total)}
              </p>
              <p className="mt-2 text-sm text-sky-900/70">
                {stats.campaignDonations.count} transaksi sukses
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 md:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                Headline Donasi Umum
              </p>
              <h3 className="mt-2 text-lg font-bold text-gray-900">
                {masjid?.GeneralDonationTitle ||
                  `Donasi umum untuk ${masjid?.Nama || "masjid ini"}`}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {masjid?.GeneralDonationDescription ||
                  "Gunakan area ini untuk menjelaskan bahwa masjid menerima donasi umum untuk operasional, perawatan, dan kebutuhan jamaah."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Campaign Donasi Aktif
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Campaign khusus yang masih berjalan di dashboard takmir.
            </p>
          </div>

          <div className="space-y-4 p-6">
            {donationCampaigns.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-6 text-center">
                <Target className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-3 text-sm text-gray-600">
                  Belum ada campaign khusus yang dibuat.
                </p>
              </div>
            ) : (
              donationCampaigns.map((campaign) => (
                <DonationCard
                  key={campaign.id}
                  campaign={campaign}
                  onViewDetail={() => navigate(`/admin/donation/${campaign.id}`)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <DonaturTableTakmir
        recentDonors={donatur}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default Dashboard;
