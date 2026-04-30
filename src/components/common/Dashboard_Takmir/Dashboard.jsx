import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  Download,
  Eye,
  MoreVertical,
  MapPin,
  Clock,
  Award,
  ArrowUpRight,
  Filter,
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
} from "lucide-react";
import DonationCard from "./DonationCardTakmir";
import DonaturTableTakmir from "./DonaturTableTakmir";
import formatCurrency from "../../../utils/formatCurrency";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import StatCard from "./StatCards";
import { DashboardSkeleton } from "../Skeleton";

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [searchTerm, setSearchTerm] = useState("");
  const [donationCampaigns, setDonationCampaigns] = useState([]);
  const [donatur, setDonatur] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    cashIn: { total: 0 },
    cashOut: { total: 0 },
    transactions: { total: 0 },
  });
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const raw = localStorage.getItem("masjid");
        if (!raw) {
          console.warn("No masjid data found in localStorage");
          return;
        }

        const masjid = JSON.parse(raw);
        const masjidId = masjid?.id;
        if (!masjidId) {
          console.warn("masjid.id not found");
          return;
        }

        const res = await axiosInstance.get(`/statistik/${masjidId}`);
        const data = res.data.data;

        setStats({
          cashIn: {
            total: data.cashIn.total,
          },
          cashOut: {
            total: data.cashOut.total,
          },
          transactions: {
            total: data.transactions.total,
          },
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axiosInstance.get("/donasi-masjid/takmir?limit=3");
        setDonationCampaigns(res.data.data); // sesuaikan struktur response lo
        console.log("Fetched donation campaigns:", res.data.data);
      } catch (error) {
        console.error("Error fetching donation campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  useEffect(() => {
    const fetchDonatur = async () => {
      try {
        const res = await axiosInstance.get("/donasi/donatur");
        setDonatur(res.data.data); // sesuaikan struktur response lo
        console.log("Fetched donation campaigns:", res.data.data);
      } catch (error) {
        console.error("Error fetching donation campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonatur();
  }, []);

  if (loading) return <DashboardSkeleton />;

  // const donationCampaigns = [
  //   {
  //     id: "asbcsacascas",
  //     title: "Pembangunan Teras Masjid",
  //     description:
  //       "Renovasi dan perluasan teras masjid untuk kenyamanan jamaah",
  //     image:
  //       "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=200&h=150&fit=crop",
  //     raised: 25000000,
  //     target: 50000000,
  //     donors: 156,
  //     daysLeft: 45,
  //     category: "Infrastruktur",
  //   },
  //   {
  //     id: "ascsacascas",
  //     title: "Renovasi Toilet Masjid",
  //     description: "Perbaikan dan modernisasi fasilitas toilet untuk jamaah",
  //     image:
  //       "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=150&fit=crop",
  //     raised: 8500000,
  //     target: 15000000,
  //     donors: 89,
  //     daysLeft: 30,
  //     category: "Fasilitas",
  //   },
  //   {
  //     id: "asjcbjasbc",
  //     title: "Program Santunan Yatim",
  //     description: "Bantuan pendidikan dan kebutuhan sehari-hari anak yatim",
  //     image:
  //       "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200&h=150&fit=crop",
  //     raised: 12000000,
  //     target: 20000000,
  //     donors: 203,
  //     daysLeft: 60,
  //     category: "Sosial",
  //   },
  // ];

  return (
    <div className=" p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
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
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      </div>

      {/* Donation Campaigns */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Campaign Donasi Aktif
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Kelola dan pantau progress campaign
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                onClick={() => navigate("/admin/donation")}
              >
                Lihat Semua
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {donationCampaigns.map((campaign) => (
            <DonationCard
              key={campaign.id}
              campaign={campaign}
              onViewDetail={() => {
                navigate(`/admin/donation/${campaign.id}`); // <-- pass id di URL
              }}
            />
          ))}
        </div>
      </div>

      <DonaturTableTakmir
        recentDonors={donatur}
        formatCurrency={formatCurrency}
      ></DonaturTableTakmir>
    </div>
  );
};

export default Dashboard;
