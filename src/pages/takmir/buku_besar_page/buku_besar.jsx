import React, { useEffect, useState, useMemo } from "react";
import TakmirLayout from "../../../layouts/takmir_layout";
import { getAllAccounts } from "../../../services/coaService";
import { getAllJurnals } from "../../../services/jurnalService";
import { transformAccounts, transformJurnals } from "../../../utils/dataTransform";
import formatCurrency from "../../../utils/formatCurrency";
import { hitungSaldoAkun } from "../../../utils/jurnalUtils";
import { exportBukuBesarToPDF } from "../../../utils/exportUtils";
import { Calendar, Loader2, Download } from "lucide-react";
import { TableSkeleton } from "../../../components/common/Skeleton";
import toast from "react-hot-toast";
import axiosInstance from "../../../api/axiosInstance";

const BukuBesarPage = () => {
  const [coaList, setCoaList] = useState([]);
  const [jurnalList, setJurnalList] = useState([]);
  const [masjidData, setMasjidData] = useState(null);
  const [tanggalAwal, setTanggalAwal] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0]
  );
  const [tanggalAkhir, setTanggalAkhir] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Fetch masjid data
  useEffect(() => {
    const fetchMasjidData = async () => {
      try {
        const response = await axiosInstance.get("/masjid/takmir");
        setMasjidData(response.data.data);
      } catch (error) {
        console.error("Error fetching masjid data:", error);
      }
    };
    fetchMasjidData();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [accounts, jurnals] = await Promise.all([
          getAllAccounts({ includeInactive: false }),
          getAllJurnals({}),
        ]);

        const transformedAccounts = transformAccounts(accounts).filter(
          (acc) => !acc.isGroup && acc.isActive
        );
        const transformedJurnals = transformJurnals(jurnals);

        setCoaList(transformedAccounts);
        setJurnalList(transformedJurnals);
      } catch (error) {
        console.error("Error loading buku besar data:", error);
        toast.error(
          error.response?.data?.message || "Gagal memuat data buku besar"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Flatten semua entry jurnal dengan info transaksi - memoized
  const allEntries = useMemo(() => {
    return jurnalList.flatMap((trx) =>
      (trx.entries || []).map((entry) => ({
        ...entry,
        transactionTanggal: trx.tanggal,
        transactionId: trx.id,
        transactionKeterangan: trx.keterangan,
      }))
    );
  }, [jurnalList]);

  // Filter berdasarkan tanggal - memoized
  const filteredEntries = useMemo(() => {
    return allEntries.filter((entry) => {
      const t = new Date(entry.transactionTanggal);
      return (
        (!tanggalAwal || t >= new Date(tanggalAwal)) &&
        (!tanggalAkhir || t <= new Date(tanggalAkhir))
      );
    });
  }, [allEntries, tanggalAwal, tanggalAkhir]);

  // Sort kronologis (terlama ke terbaru) - memoized
  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      const da = new Date(a.transactionTanggal).getTime();
      const db = new Date(b.transactionTanggal).getTime();
      if (da !== db) return da - db;
      return (a.transactionId || "").localeCompare(b.transactionId || "");
    });
  }, [filteredEntries]);

  // Calculate totals - memoized
  const totals = useMemo(() => {
    const debit = sortedEntries
      .filter((r) => r.tipe === "DEBIT")
      .reduce((sum, r) => sum + (parseFloat(r.jumlah) || 0), 0);
    
    const kredit = sortedEntries
      .filter((r) => r.tipe === "KREDIT")
      .reduce((sum, r) => sum + (parseFloat(r.jumlah) || 0), 0);
    
    return { debit, kredit };
  }, [sortedEntries]);

  const totalDebit = totals.debit;
  const totalKredit = totals.kredit;

  // Pagination - memoized
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedEntries.slice(start, start + itemsPerPage);
  }, [sortedEntries, currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedEntries.length / itemsPerPage);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tanggalAwal, tanggalAkhir]);

  const handleExportPDF = () => {
    if (sortedEntries.length === 0) {
      toast.error("Tidak ada data untuk di-export");
      return;
    }

    const masjidName = masjidData?.Nama || masjidData?.namaMasjid || "Masjid";
    const periode = { tanggalAwal, tanggalAkhir };

    try {
      exportBukuBesarToPDF(sortedEntries, masjidName, periode, totalDebit, totalKredit);
      toast.success("Buku besar berhasil di-export ke PDF");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error(`Gagal export ke PDF: ${error.message || "Unknown error"}`);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <TakmirLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Buku Besar</h1>
          <p className="text-gray-600 mt-1">
            Lihat semua transaksi jurnal (semua akun) dalam periode tertentu
          </p>
        </div>

        {/* Filter Tanggal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-800">Filter</h2>
            <div className="flex items-center gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Awal
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      value={tanggalAwal}
                      onChange={(e) => setTanggalAwal(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Akhir
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      value={tanggalAkhir}
                      onChange={(e) => setTanggalAkhir(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleExportPDF}
                  disabled={sortedEntries.length === 0 || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Buku Besar Semua Akun */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <TableSkeleton rows={10} cols={6} />
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-600">Total Debit</div>
                  <div className="text-xl font-semibold text-blue-600">
                    {formatCurrency(totalDebit)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Kredit</div>
                  <div className="text-xl font-semibold text-green-600">
                    {formatCurrency(totalKredit)}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Akun
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipe
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Debit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kredit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedEntries.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          Tidak ada transaksi untuk periode ini
                        </td>
                      </tr>
                    ) : (
                      paginatedEntries.map((row, idx) => (
                        <tr key={row.id || idx}>
                          <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                            {new Date(row.transactionTanggal).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {row.akun?.kodeAkun || "-"}{" "}
                            {row.akun?.namaAkun
                              ? `- ${row.akun.namaAkun}`
                              : ""}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {row.tipe}
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-gray-900">
                            {row.tipe === "DEBIT"
                              ? formatCurrency(parseFloat(row.jumlah) || 0)
                              : "-"}
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-gray-900">
                            {row.tipe === "KREDIT"
                              ? formatCurrency(parseFloat(row.jumlah) || 0)
                              : "-"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {row.keterangan || row.transactionKeterangan || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-gray-600">
                  Menampilkan {paginatedEntries.length} dari {sortedEntries.length} transaksi
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Sebelumnya
                    </button>
                    <span className="text-sm text-gray-600">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Selanjutnya
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </TakmirLayout>
  );
};

export default BukuBesarPage;

