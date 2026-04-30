import { useState, useMemo } from "react";
import formatCurrency from "../../../utils/formatCurrency";
import { TableSkeleton } from "../Skeleton";

// Enhanced Sort Icon with better animations
const SortIcon = ({ direction }) => (
  <svg
    className={`inline w-3 h-3 transition-all duration-300 ease-out ${
      direction === "asc"
        ? "rotate-180 text-emerald-600"
        : direction === "desc"
        ? "text-emerald-600"
        : "text-gray-400 hover:text-gray-600"
    }`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

// Search Icon
const SearchIcon = () => (
  <svg
    className="w-4 h-4 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

// Compact Stats Card
const CompactStatsCard = ({ label, value, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div
      className={`p-3 rounded-xl border ${colorClasses[color]} backdrop-blur-sm`}
    >
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-sm font-bold mt-1">{value}</p>
    </div>
  );
};

const DonationTable = ({ title, data = [], loading = false }) => {
  const [sortByAmount, setSortByAmount] = useState(null);
  const [sortByName, setSortByName] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Enhanced filtering and sorting
  const processedData = useMemo(() => {
    let filtered = data.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortByAmount) {
        return sortByAmount === "asc"
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
      if (sortByName) {
        return sortByName === "asc"
          ? a.name.localeCompare(b.name, "id-ID")
          : b.name.localeCompare(a.name, "id-ID");
      }
      return 0;
    });

    return filtered;
  }, [data, searchTerm, sortByAmount, sortByName]);

  // Statistics calculations
  const stats = useMemo(() => {
    const total = data.reduce((sum, item) => sum + Number(item.amount), 0); // convert here
    const average = data.length > 0 ? total / data.length : 0;
    const highest =
      data.length > 0
        ? Math.max(...data.map((item) => Number(item.amount)))
        : 0;
    const count = data.length;

    console.log("Stats calculated:", { total, average, highest, count });

    return { total, average, highest, count };
  }, [data]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = processedData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const toggleAmountSort = () => {
    setSortByName(null);
    setSortByAmount((prev) =>
      prev === "asc" ? "desc" : prev === "desc" ? null : "asc"
    );
  };

  const toggleNameSort = () => {
    setSortByAmount(null);
    setSortByName((prev) =>
      prev === "asc" ? "desc" : prev === "desc" ? null : "asc"
    );
  };

  const resetFilters = () => {
    setSortByAmount(null);
    setSortByName(null);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const isDonation =
    title.toLowerCase().includes("donatur") ||
    title.toLowerCase().includes("donation");

  return (
    <div className="h-full bg-gradient-to-br from-white via-gray-50 to-blue-50/30 rounded-2xl shadow-xl border border-gray-200/50 backdrop-blur-sm overflow-hidden flex flex-col">
      {/* Compact Header */}
      <div
        className="bg-gradient-to-br from-green-500 to-emerald-600 px-4 py-4 text-white"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              {isDonation ? "💝" : "💰"} {title}
            </h3>
            <p className="text-blue-100 text-xs mt-1">
              {processedData.length} dari {data.length} entries
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-100">Total</p>
            <p className="text-sm font-bold">{formatCurrency(stats.total)}</p>
          </div>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="p-4 pb-3">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <CompactStatsCard
            label="Rata-rata"
            value={formatCurrency(stats.average)}
            color="blue"
          />
          <CompactStatsCard
            label="Tertinggi"
            value={formatCurrency(stats.highest)}
            color="emerald"
          />
        </div>

        {/* Compact Search and Controls */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Cari..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-black pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white/80"
            />
          </div>
          <button
            onClick={resetFilters}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 text-xs font-medium"
          >
            Reset
          </button>
        </div>

        {/* Items per page selector */}
        <div className="flex justify-between items-center text-black mb-3">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-xs text-black px-2 py-1 border border-gray-200 rounded-lg focus:border-blue-500 bg-white"
          >
            <option value={5}>5 per halaman</option>
            <option value={10}>10 per halaman</option>
            <option value={15}>15 per halaman</option>
          </select>
          <div className="text-xs text-gray-500">
            {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, processedData.length)} dari{" "}
            {processedData.length}
          </div>
        </div>
      </div>

      {/* Table Container - Flexible height */}
      <div className="flex-1 text-black mx-4 mb-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={5} cols={2} />
          </div>
        ) : processedData.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center gap-3">
            <div className="text-4xl opacity-50">🔍</div>
            <p className="text-gray-500 text-sm text-center">
              {searchTerm ? "Tidak ditemukan" : "Belum ada data"}
            </p>
          </div>
        ) : (
          <>
            {/* Compact Table Header */}
            <div className="grid grid-cols-2 bg-gray-50 border-b p-3 text-xs font-semibold text-gray-700">
              <button
                onClick={toggleNameSort}
                className="flex items-center gap-1 hover:text-blue-700 transition-colors text-left"
              >
                <span>{isDonation ? "Donatur" : "Pengeluaran"}</span>
                <SortIcon direction={sortByName} />
              </button>
              <button
                onClick={toggleAmountSort}
                className="flex items-center justify-end gap-1 hover:text-blue-700 transition-colors"
              >
                <span>Jumlah</span>
                <SortIcon direction={sortByAmount} />
              </button>
            </div>

            {/* Scrollable Table Body */}
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {paginatedData.map((row, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 p-3 hover:bg-blue-50/50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {row.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors text-sm block truncate">
                          {row.name}
                        </span>
                        <div className="text-xs text-gray-500 text-left">
                          {((row.amount / stats.total) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <span className="font-bold text-gray-800 group-hover:text-emerald-700 transition-colors text-sm">
                        {formatCurrency(row.amount)}
                      </span>
                      <span className="text-xs text-gray-500">
                        #{startIndex + index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compact Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-3 bg-gray-50 border-t text-xs">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-2 py-1 bg-white border border-gray-200 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  ‹ Prev
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    const pageNum =
                      Math.max(1, Math.min(currentPage - 1, totalPages - 2)) +
                      i;
                    return pageNum <= totalPages ? (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-6 h-6 rounded text-xs transition-all duration-200 ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-200 hover:bg-blue-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ) : null;
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 bg-white border border-gray-200 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DonationTable;
