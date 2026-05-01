import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TakmirLayout from "../../../layouts/takmir_layout";
import JurnalTable from "../../../components/common/JurnalTable";
import { StatStripSkeleton, TableSkeleton } from "../../../components/common/Skeleton";
import { getAllAccounts } from "../../../services/coaService";
import {
  getAllJurnals,
  deleteJurnal,
  getAccountBalances,
} from "../../../services/jurnalService";
import { transformAccounts, transformJurnals } from "../../../utils/dataTransform";
import formatCurrency from "../../../utils/formatCurrency";
import toast from "react-hot-toast";
import { Plus, CheckCircle2, AlertCircle, CircleAlert, FileCheck2, XCircle } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";

const JurnalPage = () => {
  const navigate = useNavigate();
  const [jurnalList, setJurnalList] = useState([]);
  const [coaList, setCoaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saldoAkun, setSaldoAkun] = useState({});
  const [incomingDonations, setIncomingDonations] = useState([]);

  // Load data dari API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load COA dan Jurnal in parallel
      const [accounts, jurnals, donationsRes] = await Promise.all([
        getAllAccounts({ includeInactive: false }),
        getAllJurnals({}),
        axiosInstance.get("/donasi/donatur"),
      ]);

      const transformedAccounts = transformAccounts(accounts);
      const transformedJurnals = transformJurnals(jurnals);

      // Filter COA untuk dropdown: hanya detail accounts (isGroup = false) dan aktif
      const detailAccounts = transformedAccounts.filter(
        (acc) => !acc.isGroup && acc.isActive
      );

      setCoaList(detailAccounts);
      setJurnalList(transformedJurnals);
      setIncomingDonations(donationsRes.data?.data || []);

      // Load account balances
      const balances = await getAccountBalances();
      setSaldoAkun(balances);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(
        error.response?.data?.message || "Gagal memuat data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate("/admin/jurnal/tambah");
  };

  const handleEdit = (jurnal) => {
    navigate(`/admin/jurnal/edit/${jurnal.id}`);
  };

  const handleDelete = async (jurnal) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus jurnal ini?\n${jurnal.keterangan}`
      )
    ) {
      return;
    }

    try {
      await deleteJurnal(jurnal.id);
      toast.success("Jurnal berhasil dihapus");
      await loadData(); // Reload data
    } catch (error) {
      console.error("Error deleting jurnal:", error);
      toast.error(
        error.response?.data?.message || "Gagal menghapus jurnal"
      );
    }
  };


  // Transform saldoAkun dari backend format ke frontend format untuk display - memoized
  const saldoAkunDisplay = useMemo(() => {
    return Object.values(saldoAkun).map((item) => {
      const account = item.account;
      return {
        akun: {
          id: account.id,
          kodeAkun: account.code,
          namaAkun: account.name,
        },
        saldo: typeof item.saldo === "string" ? parseFloat(item.saldo) : item.saldo,
      };
    });
  }, [saldoAkun]);

  // Calculate summary dari semua jurnal - memoized
  const jurnalSummary = useMemo(() => {
    return jurnalList.reduce(
      (acc, jurnal) => {
        jurnal.entries.forEach((entry) => {
          const jumlah = parseFloat(entry.jumlah) || 0;
          if (entry.tipe === "DEBIT") {
            acc.totalDebit += jumlah;
          } else {
            acc.totalKredit += jumlah;
          }
        });
        return acc;
      },
      { totalDebit: 0, totalKredit: 0 }
    );
  }, [jurnalList]);

  const summaryBalance = Math.abs(jurnalSummary.totalDebit - jurnalSummary.totalKredit);
  const isSummaryBalanced = summaryBalance < 0.01;

  const pendingApprovals = useMemo(() => {
    const existingReferences = new Set(
      jurnalList
        .map((transaction) => transaction.referensi)
        .filter(Boolean)
    );

    return incomingDonations.filter(
      (donation) =>
        donation.StatusDonasi === "Sukses" &&
        donation.JurnalApprovalStatus === "PENDING" &&
        !existingReferences.has(`DONASI:${donation.id}`)
    );
  }, [incomingDonations, jurnalList]);

  const handleApproveDonation = (donation) => {
    const params = new URLSearchParams({
      source: "donasi-approval",
      donationId: donation.id,
      campaignId: donation.donasi_masjid?.id || "",
      campaignName: donation.donasi_masjid?.Nama || "",
      donorName: donation.Nama || donation.user?.NamaLengkap || "",
      amount: String(donation.JumlahDonasi || ""),
      date: donation.CreatedAt || "",
      returnTo: "/admin/jurnal",
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
      toast.success("Donasi berhasil ditolak untuk masuk jurnal");
      await loadData();
    } catch (error) {
      console.error("Error rejecting donation approval:", error);
      toast.error(error.response?.data?.message || "Gagal menolak donasi");
    }
  };

  return (
    <TakmirLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Input Jurnal</h1>
            <p className="text-gray-600 mt-1">
              Catat transaksi keuangan dalam jurnal akuntansi
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Jurnal
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {/* 3 summary cards */}
            <StatStripSkeleton count={3} />
            {/* Table */}
            <TableSkeleton rows={8} cols={6} />
          </div>
        ) : (
          <>
            {pendingApprovals.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Approval Donasi Masuk
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Donasi sukses di bawah ini belum dicatat ke jurnal. Approve dari sini
                      untuk langsung masuk ke form jurnal dengan referensi otomatis.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                    <CircleAlert className="w-4 h-4" />
                    {pendingApprovals.length} menunggu approval
                  </div>
                </div>

                <div className="space-y-3">
                  {pendingApprovals.slice(0, 5).map((donation) => (
                    <div
                      key={donation.id}
                      className="flex flex-col gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {donation.Nama || donation.user?.NamaLengkap || "Donatur"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {donation.donasi_masjid?.Nama || "Campaign donasi"} •{" "}
                          {new Date(donation.CreatedAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-emerald-700 font-semibold mt-2">
                          {formatCurrency(parseFloat(donation.JumlahDonasi) || 0)}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleRejectDonation(donation)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Tolak
                        </button>
                        <button
                          onClick={() => handleApproveDonation(donation)}
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

            {/* Ringkasan Jurnal */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Ringkasan Jurnal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Debit</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(jurnalSummary.totalDebit)}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Kredit</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(jurnalSummary.totalKredit)}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Selisih</div>
                  <div
                    className={`text-2xl font-bold ${
                      isSummaryBalanced ? "text-gray-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(summaryBalance)}
                  </div>
                  {isSummaryBalanced && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Balance</span>
                    </div>
                  )}
                  {!isSummaryBalanced && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>Tidak Balance</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Saldo Akun Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Saldo Akun
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {saldoAkunDisplay
                  .filter((item) => item.saldo !== 0)
                  .map((item) => (
                    <div
                      key={item.akun.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="text-sm font-medium text-gray-700">
                        {item.akun.kodeAkun}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.akun.namaAkun}
                      </div>
                      <div
                        className={`text-sm font-bold mt-1 ${
                          item.saldo >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(item.saldo)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Jurnal Table */}
            <JurnalTable
              jurnalList={jurnalList}
              coaList={coaList}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}
      </div>
    </TakmirLayout>
  );
};

export default JurnalPage;
