import DonationCard from "../../../components/common/Dashboard_Takmir/DonationCardTakmir";
import DonaturTableTakmir from "../../../components/common/Dashboard_Takmir/DonaturTableTakmir";
import TakmirLayout from "../../../layouts/takmir_layout";
import { Plus, Download, Calendar, PlusIcon, Users, Heart } from "lucide-react"; // or replace these if you don't use Lucide
import formatCurrency from "../../../utils/formatCurrency";
import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { DonaturPageSkeleton } from "../../../components/common/Skeleton";

const recentDonors = [
  {
    id: 1,
    name: "Ahmad Supardi",
    campaign: "Teras Masjid",
    amount: 2000000,
    date: "2 jam lalu",
  },
  {
    id: 2,
    name: "Siti Aminah",
    campaign: "Toilet Masjid",
    amount: 500000,
    date: "5 jam lalu",
  },
  {
    id: 3,
    name: "Hamba Allah",
    campaign: "Santunan Yatim",
    amount: 1000000,
    date: "1 hari lalu",
  },
  {
    id: 4,
    name: "Budi Santoso",
    campaign: "Teras Masjid",
    amount: 750000,
    date: "1 hari lalu",
  },
  {
    id: 5,
    name: "Fatimah Zahra",
    campaign: "Santunan Yatim",
    amount: 300000,
    date: "2 hari lalu",
  },
];

const DonaturTakmir = () => {
  const [donatur, setDonatur] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <TakmirLayout>
        <DonaturPageSkeleton />
      </TakmirLayout>
    );
  }

  return (
    <TakmirLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Donatur Overview
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

        {/* Empty State */}
        {donatur.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-center py-20 px-4">
              <div className="relative mb-8 inline-block">
                <div
                  className="w-32 h-32 mx-auto rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(12, 104, 57, 0.2) 0%, rgba(17, 130, 75, 0.2) 50%, rgba(10, 79, 46, 0.2) 100%)",
                  }}
                >
                  <Users className="w-16 h-16 text-green-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                Belum Ada Donasi
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Belum ada donatur yang melakukan donasi untuk masjid ini. Donasi akan muncul di sini setelah ada yang berdonasi.
              </p>
            </div>
          </div>
        ) : (
          <DonaturTableTakmir
            recentDonors={donatur}
            formatCurrency={formatCurrency}
          ></DonaturTableTakmir>
        )}
      </div>
    </TakmirLayout>
  );
};

export default DonaturTakmir;
