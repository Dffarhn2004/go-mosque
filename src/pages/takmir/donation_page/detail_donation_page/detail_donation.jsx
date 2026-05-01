import DonationDetailContent from "../../../../components/common/Donation_Detail_Takmir/DonationDetailContent";
import { ArrowLeft, Calendar, FileCheck2, XCircle } from "lucide-react";
import TakmirLayout from "../../../../layouts/takmir_layout";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../../api/axiosInstance";
import { Sk, StatCardsSkeleton, CampaignListSkeleton } from "../../../../components/common/Skeleton";
import { getAllJurnals } from "../../../../services/jurnalService";
import formatCurrency from "../../../../utils/formatCurrency";
import toast from "react-hot-toast";

const DonationDetailTakmir = () => {
  // const donation = dummyData[0];
  const { id } = useParams(); // get the id from route param
  const [donation, setDonation] = useState(null);
  const [jurnalList, setJurnalList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDonation = async () => {
    try {
      const [res, jurnals] = await Promise.all([
        axiosInstance.get("/donasi-masjid/takmir/" + id),
        getAllJurnals({}),
      ]);
      setDonation(res.data.data); // sesuaikan struktur response lo
      setJurnalList(jurnals);
      // console.log("Fetched donation campaigns:", res.data.data);
    } catch (error) {
      console.error("Error fetching donation campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  useEffect(() => {
    fetchDonation();
  }, []);

  if (loading) {
    return (
      <TakmirLayout>
        <div className="p-6 space-y-6">
          <Sk className="h-9 w-36 rounded-lg" />
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <Sk className="h-8 w-72" />
              <Sk className="h-4 w-48" />
            </div>
            <Sk className="h-10 w-32 rounded-lg" />
          </div>
          <StatCardsSkeleton count={4} />
          <CampaignListSkeleton count={3} />
        </div>
      </TakmirLayout>
    );
  }
  const handleBack = () => {
    navigate(-1); // Go back to previous page
    // Alternative: navigate to specific route
    // navigate('/takmir/donations');
  };

  const approvedReferences = new Set(
    jurnalList.map((transaction) => transaction.referensi).filter(Boolean)
  );

  const pendingDonations = (donation?.donasi || []).filter(
    (item) =>
      item.StatusDonasi === "Sukses" &&
      item.JurnalApprovalStatus === "PENDING" &&
      !approvedReferences.has(`DONASI:${item.id}`)
  );

  const handleApproveDonation = (item) => {
    const params = new URLSearchParams({
      source: "donasi-approval",
      donationId: item.id,
      campaignId: donation.id,
      campaignName: donation.Nama || "",
      donorName: item.Nama || "",
      amount: String(item.JumlahDonasi || ""),
      date: item.CreatedAt || "",
      returnTo: `/admin/donation/${donation.id}`,
    });

    navigate(`/admin/jurnal/tambah?${params.toString()}`);
  };

  const handleRejectDonation = async (item) => {
    const reason = window.prompt(
      "Alasan penolakan donasi ini (opsional):",
      item.JurnalApprovalReason || ""
    );

    if (reason === null) {
      return;
    }

    try {
      await axiosInstance.patch(`/donasi/${item.id}/jurnal-approval`, {
        status: "REJECTED",
        reason,
      });
      toast.success("Donasi berhasil ditolak untuk masuk jurnal");
      await fetchDonation();
    } catch (error) {
      console.error("Error rejecting donation approval:", error);
      toast.error(error.response?.data?.message || "Gagal menolak donasi");
    }
  };
  return (
    <TakmirLayout>
      <div className="p-6 space-y-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Kembali</span>
        </button>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pembangunan & Program Keagamaan
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
          {pendingDonations.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
              {pendingDonations.length} donasi masuk menunggu approval jurnal
            </div>
          )}
        </div>

        {pendingDonations.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Approval Donasi Masuk
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Setujui donasi sukses berikut agar langsung diproses ke form jurnal dengan
                referensi transaksi otomatis.
              </p>
            </div>
            <div className="space-y-3">
              {pendingDonations.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border border-amber-100 bg-amber-50/60 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.Nama || "Donatur"}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(item.CreatedAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm font-semibold text-emerald-700 mt-2">
                      {formatCurrency(parseFloat(item.JumlahDonasi) || 0)}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleRejectDonation(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Tolak
                    </button>
                    <button
                      onClick={() => handleApproveDonation(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      Approve ke Jurnal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DonationDetailContent
          donation={donation}
        />
      </div>
    </TakmirLayout>
  );
};

export default DonationDetailTakmir;
