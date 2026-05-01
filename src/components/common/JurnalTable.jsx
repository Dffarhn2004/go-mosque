import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import formatCurrency from "../../utils/formatCurrency";

const JurnalTable = ({
  jurnalList,
  coaList,
  onEdit,
  onDelete,
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAkun, setFilterAkun] = useState("ALL");
  const [filterTipe, setFilterTipe] = useState("ALL");
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const getTipeColor = (tipe) =>
    tipe === "DEBIT"
      ? "bg-blue-100 text-blue-800"
      : "bg-emerald-100 text-emerald-800";

  const filteredTransactions = useMemo(() => {
    return jurnalList.filter((transaction) => {
      const entries = transaction.entries || [];

      const matchSearch =
        (transaction.keterangan || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (transaction.referensi || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        entries.some(
          (entry) =>
            (entry.keterangan || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (entry.akun?.namaAkun || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (entry.akun?.kodeAkun || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );

      const matchAkun =
        filterAkun === "ALL" ||
        entries.some((entry) => entry.akunId === filterAkun);

      const matchTipe =
        filterTipe === "ALL" ||
        entries.some((entry) => entry.tipe === filterTipe);

      const transactionDate = new Date(transaction.tanggal);
      const matchTanggal =
        (!tanggalAwal || transactionDate >= new Date(tanggalAwal)) &&
        (!tanggalAkhir || transactionDate <= new Date(tanggalAkhir));

      return matchSearch && matchAkun && matchTipe && matchTanggal;
    });
  }, [jurnalList, searchTerm, filterAkun, filterTipe, tanggalAwal, tanggalAkhir]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const dateA = new Date(a.tanggal);
      const dateB = new Date(b.tanggal);
      if (dateB.getTime() !== dateA.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      return b.id.localeCompare(a.id);
    });
  }, [filteredTransactions]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(start, start + itemsPerPage);
  }, [sortedTransactions, currentPage]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterAkun, filterTipe, tanggalAwal, tanggalAkhir]);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        akunId: filterAkun,
        tipe: filterTipe,
        tanggalAwal,
        tanggalAkhir,
      });
    }
  }, [filterAkun, filterTipe, tanggalAwal, tanggalAkhir, onFilterChange]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeCOA = coaList.filter((coa) => coa.isActive);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari keterangan, referensi, kode akun, atau nama akun..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterAkun}
              onChange={(e) => setFilterAkun(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white text-sm text-gray-900"
            >
              <option value="ALL">Semua Akun</option>
              {activeCOA.map((coa) => (
                <option key={coa.id} value={coa.id}>
                  {coa.kodeAkun} - {coa.namaAkun}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white text-sm text-gray-900"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="DEBIT">Debit</option>
              <option value="KREDIT">Kredit</option>
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={tanggalAwal}
              onChange={(e) => setTanggalAwal(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-900 bg-white"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={tanggalAkhir}
              onChange={(e) => setTanggalAkhir(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-900 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
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
                Jumlah
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keterangan
              </th>
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={onEdit || onDelete ? 6 : 5}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Tidak ada data transaksi jurnal
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((transaction, idx) => {
                const currentDate = new Date(transaction.tanggal)
                  .toISOString()
                  .split("T")[0];
                const prevDate =
                  idx > 0
                    ? new Date(paginatedTransactions[idx - 1].tanggal)
                        .toISOString()
                        .split("T")[0]
                    : null;
                const showDateHeader = currentDate !== prevDate;
                const firstEntry = transaction.entries?.[0];

                return (
                  <React.Fragment key={transaction.id}>
                    {showDateHeader && (
                      <tr className="bg-blue-50 border-t-2 border-b border-blue-200">
                        <td
                          colSpan={onEdit || onDelete ? 6 : 5}
                          className="px-6 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-blue-700" />
                            <span className="text-sm font-semibold text-blue-900">
                              {new Date(transaction.tanggal).toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}

                    <tr className="hover:bg-gray-50 border-b border-gray-100 align-top">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.tanggal).toISOString().split("T")[0]}
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-3">
                          {(transaction.entries || []).map((entry) => (
                            <div key={entry.id}>
                              <span className="text-sm font-medium text-gray-900">
                                {entry.akun?.kodeAkun || "-"}
                              </span>
                              <br />
                              <span className="text-xs text-gray-500">
                                {entry.akun?.namaAkun || "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="space-y-3">
                          {(transaction.entries || []).map((entry) => (
                            <div key={entry.id} className="flex items-center gap-2">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipeColor(
                                  entry.tipe
                                )}`}
                              >
                                {entry.tipe}
                              </span>
                              {entry.hasRestriction && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold text-orange-700 bg-orange-100 rounded">
                                  Terbatas
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="space-y-3">
                          {(transaction.entries || []).map((entry) => (
                            <div
                              key={entry.id}
                              className="text-sm font-medium text-gray-900"
                            >
                              {formatCurrency(parseFloat(entry.jumlah) || 0)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <div className="space-y-3">
                          <div className="font-medium text-gray-700">
                            {transaction.keterangan || "-"}
                            {transaction.referensi && (
                              <div className="mt-1 text-xs text-gray-500">
                                Ref: {transaction.referensi}
                              </div>
                            )}
                          </div>
                          {(transaction.entries || []).map((entry) => (
                            <div key={entry.id} className="text-xs text-gray-500">
                              {entry.keterangan || " "}
                            </div>
                          ))}
                        </div>
                      </td>
                      {(onEdit || onDelete) && (
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-start justify-end gap-2">
                            {onEdit && (
                              <button
                                onClick={() => onEdit({ id: transaction.id })}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete({ id: transaction.id })}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-600">
          Menampilkan {paginatedTransactions.length} dari {sortedTransactions.length} transaksi
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 px-2">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Halaman selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JurnalTable;
