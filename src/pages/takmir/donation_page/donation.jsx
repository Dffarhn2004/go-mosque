import { useEffect, useState, useMemo } from "react";
import DonationCard from "../../../components/common/Dashboard_Takmir/DonationCardTakmir";
import TakmirLayout from "../../../layouts/takmir_layout";
import { StatCardsSkeleton, CampaignListSkeleton } from "../../../components/common/Skeleton";
import {
  Plus,
  Download,
  Calendar,
  Search,
  Filter,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  X,
  FileCheck2,
} from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import formatCurrency from "../../../utils/formatCurrency";
import getProgressPercentage from "../../../utils/progressPercentage";

const DonationTakmir = () => {
  const [donationCampaigns, setDonationCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, completed
  const [sortBy, setSortBy] = useState("latest"); // latest, name, progress, amount
  const [pendingVerificationCount, setPendingVerificationCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const [campaignRes, donorRes, jurnalRes] = await Promise.all([
          axiosInstance.get("/donasi-masjid/takmir"),
          axiosInstance.get("/donasi/donatur"),
          axiosInstance.get("/jurnal"),
        ]);
        setDonationCampaigns(campaignRes.data.data);

        const existingReferences = new Set(
          (jurnalRes.data?.data || [])
            .map((transaction) => transaction.referensi)
            .filter(Boolean)
        );

        setPendingVerificationCount(
          (donorRes.data.data || []).filter(
            (donation) =>
              donation.StatusDonasi === "Sukses" &&
              donation.JurnalApprovalStatus === "PENDING" &&
              !existingReferences.has(`DONASI:${donation.id}`)
          ).length
        );
        console.log("Fetched donation campaigns:", campaignRes.data.data);
      } catch (error) {
        console.error("Error fetching donation campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalCampaigns = donationCampaigns.length;
    const totalTarget = donationCampaigns.reduce(
      (sum, campaign) => sum + parseFloat(campaign.TargetUangDonasi || 0),
      0
    );
    const totalCollected = donationCampaigns.reduce(
      (sum, campaign) => sum + parseFloat(campaign.UangDonasiTerkumpul || 0),
      0
    );
    const totalDonors = donationCampaigns.reduce(
      (sum, campaign) => sum + (campaign.donasi?.length || 0),
      0
    );
    const overallProgress = getProgressPercentage(totalCollected, totalTarget);

    return {
      totalCampaigns,
      totalTarget,
      totalCollected,
      totalDonors,
      overallProgress,
    };
  }, [donationCampaigns]);

  // Filter and sort campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = donationCampaigns.filter((campaign) => {
      // Search filter
      const matchesSearch =
        campaign.Nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.Deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.kategori_donasi?.Nama?.toLowerCase().includes(
          searchTerm.toLowerCase()
        );

      // Status filter
      const progress = getProgressPercentage(
        campaign.UangDonasiTerkumpul,
        campaign.TargetUangDonasi
      );
      let matchesStatus = true;
      if (filterStatus === "active") {
        matchesStatus = progress < 100;
      } else if (filterStatus === "completed") {
        matchesStatus = progress >= 100;
      }

      return matchesSearch && matchesStatus;
    });

    // Sort campaigns
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.Nama.localeCompare(b.Nama);
        case "progress":
          const progressA = getProgressPercentage(
            a.UangDonasiTerkumpul,
            a.TargetUangDonasi
          );
          const progressB = getProgressPercentage(
            b.UangDonasiTerkumpul,
            b.TargetUangDonasi
          );
          return progressB - progressA;
        case "amount":
          return (
            parseFloat(b.UangDonasiTerkumpul || 0) -
            parseFloat(a.UangDonasiTerkumpul || 0)
          );
        case "latest":
        default:
          return new Date(b.CreatedAt || 0) - new Date(a.CreatedAt || 0);
      }
    });

    return filtered;
  }, [donationCampaigns, searchTerm, filterStatus, sortBy]);

  if (loading) {
    return (
      <TakmirLayout>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="bg-white rounded-xl p-6 flex justify-between items-center">
            <div className="space-y-2">
              <div className="bg-gray-200 animate-pulse rounded h-7 w-44" />
              <div className="bg-gray-200 animate-pulse rounded h-4 w-32" />
            </div>
            <div className="flex gap-2">
              <div className="bg-gray-200 animate-pulse rounded-lg h-10 w-36" />
              <div className="bg-gray-200 animate-pulse rounded-lg h-10 w-24" />
            </div>
          </div>
          <StatCardsSkeleton count={4} />
          {/* Search bar skeleton */}
          <div className="bg-white rounded-xl p-4 flex gap-3">
            <div className="bg-gray-200 animate-pulse rounded-lg h-10 flex-1" />
            <div className="bg-gray-200 animate-pulse rounded-lg h-10 w-28" />
          </div>
          <CampaignListSkeleton count={5} />
        </div>
      </TakmirLayout>
    );
  }

  return (
    <TakmirLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Kelola Donasi
              </h1>
              <p className="text-gray-600 flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="relative flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors font-medium"
                onClick={() => navigate("/admin/donation/verifikasi")}
              >
                <FileCheck2 className="w-4 h-4" />
                Verifikasi Donasi
                {pendingVerificationCount > 0 && (
                  <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-amber-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                    {pendingVerificationCount > 99
                      ? "99+"
                      : pendingVerificationCount}
                  </span>
                )}
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
                onClick={() => navigate("/admin/add/donation")}
              >
                <Plus className="w-4 h-4" />
                Tambah Donasi
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    Total Campaign
                  </p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {statistics.totalCampaigns}
                  </p>
                </div>
                <div className="bg-blue-200 rounded-lg p-3">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">
                    Total Terkumpul
                  </p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {formatCurrency(statistics.totalCollected)}
                  </p>
                </div>
                <div className="bg-green-200 rounded-lg p-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">
                    Total Target
                  </p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {formatCurrency(statistics.totalTarget)}
                  </p>
                </div>
                <div className="bg-purple-200 rounded-lg p-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">
                    Total Donatur
                  </p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">
                    {statistics.totalDonors}
                  </p>
                </div>
                <div className="bg-orange-200 rounded-lg p-3">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari donasi berdasarkan nama, deskripsi, atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all cursor-pointer text-gray-900"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="completed">Selesai</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all cursor-pointer text-gray-900"
              >
                <option value="latest">Terbaru</option>
                <option value="name">Nama A-Z</option>
                <option value="progress">Progress Tertinggi</option>
                <option value="amount">Jumlah Terbesar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Campaign Cards */}
        {filteredAndSortedCampaigns.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== "all"
                  ? "Tidak Ada Donasi Ditemukan"
                  : "Belum Ada Donasi"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "Coba ubah kata kunci atau filter pencarian Anda"
                  : "Mulai dengan membuat campaign donasi pertama Anda"}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <button
                  onClick={() => navigate("/admin/add/donation")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Donasi Pertama
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                Menampilkan {filteredAndSortedCampaigns.length} dari{" "}
                {donationCampaigns.length} donasi
              </span>
            </div>
            {filteredAndSortedCampaigns.map((campaign) => (
              <DonationCard
                key={campaign.id}
                campaign={campaign}
                onViewDetail={() => {
                  navigate(`/admin/donation/${campaign.id}`);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </TakmirLayout>
  );
};

export default DonationTakmir;
