import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, CircleAlert, FileCheck2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import TakmirLayout from "../../../layouts/takmir_layout";
import axiosInstance from "../../../api/axiosInstance";
import formatCurrency from "../../../utils/formatCurrency";

const DonationVerificationPage = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [donationsRes, journalsRes] = await Promise.all([
        axiosInstance.get("/donasi/donatur"),
        axiosInstance.get("/jurnal"),
      ]);

      const existingReferences = new Set(
        (journalsRes.data?.data || [])
          .map((transaction) => transaction.referensi)
          .filter(Boolean)
      );

      const pending = (donationsRes.data?.data || []).filter(
        (donation) =>
          donation.StatusDonasi === "Pending" &&
          donation.JurnalApprovalStatus === "PENDING" &&
          !existingReferences.has(`DONASI:${donation.id}`)
      );

      setDonations(pending);
    } catch (error) {
      console.error("Error loading donation verifications:", error);
      toast.error("Gagal memuat daftar verifikasi donasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => {
    return donations.reduce(
      (acc, donation) => {
        if (donation.DonationChannel === "GENERAL") {
          acc.general += 1;
        } else {
          acc.campaign += 1;
        }
        acc.totalAmount += parseFloat(donation.JumlahDonasi || 0);
        return acc;
      },
      { general: 0, campaign: 0, totalAmount: 0 }
    );
  }, [donations]);

  const getDonationTargetName = (donation) => {
    if (donation.DonationChannel === "GENERAL") {
      return (
        donation.masjid?.GeneralDonationTitle ||
        `Donasi Umum ${donation.masjid?.Nama || ""}`.trim()
      );
    }

    return donation.donasi_masjid?.Nama || "Campaign donasi";
  };

  const handleApproveDonation = (donation) => {
    const params = new URLSearchParams({
      source: "donasi-approval",
      donationId: donation.id,
      campaignId: donation.donasi_masjid?.id || "",
      campaignName: getDonationTargetName(donation),
      donorName: donation.Nama || donation.user?.NamaLengkap || "",
      amount: String(donation.JumlahDonasi || ""),
      date: donation.CreatedAt || "",
      returnTo: "/admin/donation/verifikasi",
    });

    navigate(`/admin/jurnal/tambah?${params.toString()}`);
  };

  const handleRejectDonation = async (donation) => {
    const reason = window.prompt(
      "Alasan penolakan donasi ini (opsional):",
      donation.JurnalApprovalReason || ""
    );

    if (reason === null) {
      return;
    }

    try {
      await axiosInstance.patch(`/donasi/${donation.id}/jurnal-approval`, {
        status: "REJECTED",
        reason,
      });
      toast.success("Donasi berhasil ditolak");
      await loadData();
    } catch (error) {
      console.error("Error rejecting donation:", error);
      toast.error(error.response?.data?.message || "Gagal menolak donasi");
    }
  };

  return (
    <TakmirLayout>
      <div className="space-y-6 p-6">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Verifikasi Donasi
              </h1>
              <p className="mt-2 flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                Semua donasi masuk yang menunggu approval ke jurnal
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/donation")}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Kembali ke Kelola Donasi
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-700">
                Total Menunggu
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-900">
                {donations.length}
              </p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-700">
                Donasi Umum
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-900">
                {summary.general}
              </p>
            </div>
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
              <p className="text-sm font-medium text-purple-700">
                Campaign Khusus
              </p>
              <p className="mt-2 text-3xl font-bold text-purple-900">
                {summary.campaign}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-xl bg-gray-200"
                />
              ))}
            </div>
          ) : donations.length === 0 ? (
            <div className="py-16 text-center">
              <CircleAlert className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Tidak ada donasi yang perlu diverifikasi
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Semua donasi yang masuk sudah diproses atau belum ada transaksi
                baru.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {donations.length} donasi menunggu approval
                </span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(summary.totalAmount)}
                </span>
              </div>

              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {donation.Nama || donation.user?.NamaLengkap || "Donatur"}
                        </h3>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                          {donation.DonationChannel === "GENERAL"
                            ? "Donasi Umum"
                            : "Campaign"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {getDonationTargetName(donation)}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(donation.CreatedAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="mt-3 text-lg font-bold text-emerald-700">
                        {formatCurrency(parseFloat(donation.JumlahDonasi) || 0)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => handleRejectDonation(donation)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Tolak
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveDonation(donation)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                      >
                        <FileCheck2 className="h-4 w-4" />
                        Approve ke Jurnal
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TakmirLayout>
  );
};

export default DonationVerificationPage;
