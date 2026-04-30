import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import TakmirLayout from "../../../layouts/takmir_layout";
import LaporanNeraca from "../../../components/common/LaporanNeraca";
import LaporanLabaRugi from "../../../components/common/LaporanLabaRugi";
import LaporanPerubahanEkuitas from "../../../components/common/LaporanPerubahanEkuitas";
import {
  generateNeraca as generateNeracaAPI,
  generateLabaRugi as generateLabaRugiAPI,
  generatePerubahanEkuitas as generatePerubahanEkuitasAPI,
} from "../../../services/laporanService";
import { exportToPDF, exportToExcel } from "../../../utils/exportUtils";
import { Calendar, Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
import { TableSkeleton } from "../../../components/common/Skeleton";
import toast from "react-hot-toast";
import axiosInstance from "../../../api/axiosInstance";
import { debounce } from "../../../utils/debounce";

const LaporanKeuanganJurnalPage = () => {
  const [activeTab, setActiveTab] = useState("neraca");
  const [laporanData, setLaporanData] = useState(null);
  const [masjidData, setMasjidData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [tahunPerubahan, setTahunPerubahan] = useState(
    new Date().getFullYear().toString()
  );
  const [tanggalAwal, setTanggalAwal] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0]
  );
  const [tanggalAkhir, setTanggalAkhir] = useState(
    new Date().toISOString().split("T")[0]
  );

  const tanggalInputRef = useRef(null);
  const tanggalAwalInputRef = useRef(null);
  const tanggalAkhirInputRef = useRef(null);
  const exportMenuRef = useRef(null);

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

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cache untuk transform results
  const transformCache = useRef(new Map());

  // Transform Neraca data dari backend ke format frontend
  const transformNeracaData = (data) => {
    if (!data) {
      // Return default structure jika data null
      return {
        aset: {},
        kewajiban: {},
        ekuitas: {},
        totalAset: 0,
        totalKewajiban: 0,
        totalEkuitas: 0,
      };
    }

    // Backend sudah mengembalikan format yang sesuai dengan restriction
    const transformAccountArray = (accounts) => {
      if (!Array.isArray(accounts)) return [];
      return accounts.map((acc) => ({
        ...acc,
        tanpaPembatasan: typeof acc.tanpaPembatasan === "string" ? parseFloat(acc.tanpaPembatasan) : (acc.tanpaPembatasan || 0),
        denganPembatasan: typeof acc.denganPembatasan === "string" ? parseFloat(acc.denganPembatasan) : (acc.denganPembatasan || 0),
        saldo: typeof acc.saldo === "string" ? parseFloat(acc.saldo) : (acc.saldo || 0),
      }));
    };

    const transformGrouped = (grouped) => {
      if (!grouped || typeof grouped !== 'object') return {};
      const result = {};
      Object.keys(grouped).forEach((key) => {
        result[key] = transformAccountArray(grouped[key]);
      });
      return result;
    };

    const toNumber = (val) => (typeof val === "string" ? parseFloat(val) : (val || 0));

    // Transform subtotal - backend sudah dalam format yang benar, hanya perlu ensure number
    const transformSubtotal = (subtotal) => {
      if (!subtotal || typeof subtotal !== 'object') return {};
      const result = {};
      Object.keys(subtotal).forEach((key) => {
        result[key] = {
          tanpaPembatasan: toNumber(subtotal[key]?.tanpaPembatasan),
          denganPembatasan: toNumber(subtotal[key]?.denganPembatasan),
          saldo: toNumber(subtotal[key]?.saldo),
        };
      });
      return result;
    };

    return {
      aset: transformGrouped(data.aset || {}),
      kewajiban: transformGrouped(data.kewajiban || {}),
      ekuitas: transformGrouped(data.ekuitas || {}),
      subtotalAset: transformSubtotal(data.subtotalAset),
      subtotalKewajiban: transformSubtotal(data.subtotalKewajiban),
      subtotalEkuitas: transformSubtotal(data.subtotalEkuitas),
      totalAsetTanpa: toNumber(data.totalAsetTanpa),
      totalAsetDengan: toNumber(data.totalAsetDengan),
      totalAset: toNumber(data.totalAset),
      totalKewajibanTanpa: toNumber(data.totalKewajibanTanpa),
      totalKewajibanDengan: toNumber(data.totalKewajibanDengan),
      totalKewajiban: toNumber(data.totalKewajiban),
      totalEkuitasTanpa: toNumber(data.totalEkuitasTanpa),
      totalEkuitasDengan: toNumber(data.totalEkuitasDengan),
      totalEkuitas: toNumber(data.totalEkuitas),
    };
  };

  // Transform Laba Rugi data dari backend ke format frontend
  const transformLabaRugiData = (data) => {
    if (!data) {
      // Return default structure jika data null
      return {
        pendapatan: {},
        beban: {},
        totalPendapatan: 0,
        totalBeban: 0,
        labaRugi: 0,
      };
    }

    // Backend sudah mengembalikan format yang sesuai dengan restriction
    const transformAccountArray = (accounts) => {
      if (!Array.isArray(accounts)) return [];
      return accounts.map((acc) => ({
        ...acc,
        tanpaPembatasan: typeof acc.tanpaPembatasan === "string" ? parseFloat(acc.tanpaPembatasan) : (acc.tanpaPembatasan || 0),
        denganPembatasan: typeof acc.denganPembatasan === "string" ? parseFloat(acc.denganPembatasan) : (acc.denganPembatasan || 0),
        saldo: typeof acc.saldo === "string" ? parseFloat(acc.saldo) : (acc.saldo || 0),
      }));
    };

    const transformGrouped = (grouped) => {
      if (!grouped || typeof grouped !== 'object') return {};
      const result = {};
      Object.keys(grouped).forEach((key) => {
        result[key] = transformAccountArray(grouped[key]);
      });
      return result;
    };

    const toNumber = (val) => (typeof val === "string" ? parseFloat(val) : (val || 0));

    // Transform subtotal - backend sudah dalam format yang benar, hanya perlu ensure number
    const transformSubtotal = (subtotal) => {
      if (!subtotal || typeof subtotal !== 'object') return {};
      const result = {};
      Object.keys(subtotal).forEach((key) => {
        result[key] = {
          tanpaPembatasan: toNumber(subtotal[key]?.tanpaPembatasan),
          denganPembatasan: toNumber(subtotal[key]?.denganPembatasan),
          saldo: toNumber(subtotal[key]?.saldo),
        };
      });
      return result;
    };

    return {
      pendapatan: transformGrouped(data.pendapatan || {}),
      beban: transformGrouped(data.beban || {}),
      subtotalPendapatan: transformSubtotal(data.subtotalPendapatan),
      subtotalBeban: transformSubtotal(data.subtotalBeban),
      totalPendapatanTanpa: toNumber(data.totalPendapatanTanpa),
      totalPendapatanDengan: toNumber(data.totalPendapatanDengan),
      totalPendapatan: toNumber(data.totalPendapatan),
      totalBebanTanpa: toNumber(data.totalBebanTanpa),
      totalBebanDengan: toNumber(data.totalBebanDengan),
      totalBeban: toNumber(data.totalBeban),
      labaRugiTanpa: toNumber(data.labaRugiTanpa),
      labaRugiDengan: toNumber(data.labaRugiDengan),
      labaRugi: toNumber(data.labaRugi),
    };
  };

  // Transform Perubahan Ekuitas data
  const transformPerubahanEkuitasData = (data) => {
    if (!data) {
      return {
        saldoAwalEkuitasTanpa: 0,
        saldoAwalEkuitasDengan: 0,
        saldoAwalEkuitas: 0,
        labaRugiTanpa: 0,
        labaRugiDengan: 0,
        labaRugi: 0,
        perubahanModalTanpa: 0,
        perubahanModalDengan: 0,
        perubahanModal: 0,
        saldoAkhirEkuitasTanpa: 0,
        saldoAkhirEkuitasDengan: 0,
        saldoAkhirEkuitas: 0,
      };
    }

    const toNumber = (val) => (typeof val === "string" ? parseFloat(val) : (val || 0));

    return {
      saldoAwalEkuitasTanpa: toNumber(data.saldoAwalEkuitasTanpa),
      saldoAwalEkuitasDengan: toNumber(data.saldoAwalEkuitasDengan),
      saldoAwalEkuitas: toNumber(data.saldoAwalEkuitas),
      labaRugiTanpa: toNumber(data.labaRugiTanpa),
      labaRugiDengan: toNumber(data.labaRugiDengan),
      labaRugi: toNumber(data.labaRugi),
      perubahanModalTanpa: toNumber(data.perubahanModalTanpa),
      perubahanModalDengan: toNumber(data.perubahanModalDengan),
      perubahanModal: toNumber(data.perubahanModal),
      saldoAkhirEkuitasTanpa: toNumber(data.saldoAkhirEkuitasTanpa),
      saldoAkhirEkuitasDengan: toNumber(data.saldoAkhirEkuitasDengan),
      saldoAkhirEkuitas: toNumber(data.saldoAkhirEkuitas),
    };
  };

  // Transform functions with caching
  const transformNeracaDataCached = (data, cacheKey) => {
    if (transformCache.current.has(cacheKey)) {
      return transformCache.current.get(cacheKey);
    }
    const transformed = transformNeracaData(data);
    transformCache.current.set(cacheKey, transformed);
    return transformed;
  };

  const transformLabaRugiDataCached = (data, cacheKey) => {
    if (transformCache.current.has(cacheKey)) {
      return transformCache.current.get(cacheKey);
    }
    const transformed = transformLabaRugiData(data);
    transformCache.current.set(cacheKey, transformed);
    return transformed;
  };

  const transformPerubahanEkuitasDataCached = (data, cacheKey) => {
    if (transformCache.current.has(cacheKey)) {
      return transformCache.current.get(cacheKey);
    }
    const transformed = transformPerubahanEkuitasData(data);
    transformCache.current.set(cacheKey, transformed);
    return transformed;
  };

  // Generate laporan function
  const generateLaporan = useCallback(async () => {
    try {
      setLoading(true);
      setLaporanData(null);

      // Create cache key based on tab and parameters
      let cacheKey = `${activeTab}_`;
      switch (activeTab) {
        case "neraca":
          cacheKey += tanggal;
          break;
        case "laba-rugi":
          cacheKey += `${tanggalAwal}_${tanggalAkhir}`;
          break;
        case "perubahan-ekuitas":
          cacheKey += tahunPerubahan;
          break;
        default:
          cacheKey += "default";
      }

      // Check cache first
      if (transformCache.current.has(cacheKey)) {
        setLaporanData(transformCache.current.get(cacheKey));
        setLoading(false);
        return;
      }

      let data = null;

      switch (activeTab) {
        case "neraca":
          data = await generateNeracaAPI(tanggal);
          // Transform data untuk komponen LaporanNeraca
          data = transformNeracaDataCached(data, cacheKey);
          break;
        case "laba-rugi":
          data = await generateLabaRugiAPI(tanggalAwal, tanggalAkhir);
          // Transform data untuk komponen LaporanLabaRugi
          data = transformLabaRugiDataCached(data, cacheKey);
          break;
        case "perubahan-ekuitas":
          data = await generatePerubahanEkuitasAPI(tahunPerubahan);
          // Transform untuk memastikan semua angka adalah number
          data = transformPerubahanEkuitasDataCached(data, cacheKey);
          break;
        default:
          data = null;
      }

      setLaporanData(data);
    } catch (error) {
      console.error("Error generating laporan:", error);
      toast.error(
        error.response?.data?.message || "Gagal generate laporan"
      );
      setLaporanData(null);
    } finally {
      setLoading(false);
    }
  }, [activeTab, tanggal, tanggalAwal, tanggalAkhir, tahunPerubahan]);

  // Debounce generate laporan
  const debouncedGenerate = useMemo(
    () => debounce(() => generateLaporan(), 500),
    [generateLaporan]
  );

  // Generate laporan saat tab atau tanggal berubah (with debounce)
  useEffect(() => {
    debouncedGenerate();
  }, [debouncedGenerate]);

  const handleExportPDF = () => {
    console.log("=== START EXPORT PDF ===");
    console.log("1. Checking laporanData:", laporanData);
    
    if (!laporanData) {
      console.error("❌ Laporan data is null or undefined");
      toast.error("Tidak ada data untuk di-export");
      return;
    }

    const masjidName = masjidData?.Nama || masjidData?.namaMasjid || "Masjid";
    console.log("2. Masjid Name:", masjidName);
    console.log("3. Masjid Data:", masjidData);
    
    let periode = {};
    let laporanType = "";

    switch (activeTab) {
      case "neraca":
        laporanType = "neraca";
        periode = { tanggal };
        console.log("4. Laporan Type: Neraca, Tanggal:", tanggal);
        break;
      case "laba-rugi":
        laporanType = "laba-rugi";
        periode = { tanggalAwal, tanggalAkhir };
        console.log("4. Laporan Type: Laba Rugi, Periode:", tanggalAwal, "to", tanggalAkhir);
        break;
      case "perubahan-ekuitas":
        laporanType = "perubahan-ekuitas";
        periode = { tahun: tahunPerubahan };
        console.log("4. Laporan Type: Perubahan Ekuitas, Tahun:", tahunPerubahan);
        break;
      default:
        console.error("❌ Unknown activeTab:", activeTab);
        return;
    }

    console.log("5. Final Parameters:");
    console.log("   - laporanType:", laporanType);
    console.log("   - masjidName:", masjidName);
    console.log("   - periode:", periode);
    console.log("   - laporanData keys:", Object.keys(laporanData));
    console.log("   - laporanData sample:", JSON.stringify(laporanData).substring(0, 200));

    try {
      console.log("6. Calling exportToPDF...");
      exportToPDF(laporanData, laporanType, masjidName, periode);
      console.log("✅ PDF export successful");
      toast.success("Laporan berhasil di-export ke PDF");
      setShowExportMenu(false);
    } catch (error) {
      console.error("❌ ERROR EXPORTING PDF:");
      console.error("   - Error message:", error.message);
      console.error("   - Error stack:", error.stack);
      console.error("   - Full error:", error);
      toast.error(`Gagal export ke PDF: ${error.message || "Unknown error"}`);
    }
    console.log("=== END EXPORT PDF ===");
  };

  const handleExportExcel = () => {
    if (!laporanData) {
      toast.error("Tidak ada data untuk di-export");
      return;
    }

    const masjidName = masjidData?.Nama || masjidData?.namaMasjid || "Masjid";
    let periode = {};
    let laporanType = "";

    switch (activeTab) {
      case "neraca":
        laporanType = "neraca";
        periode = { tanggal };
        break;
      case "laba-rugi":
        laporanType = "laba-rugi";
        periode = { tanggalAwal, tanggalAkhir };
        break;
      case "perubahan-ekuitas":
        laporanType = "perubahan-ekuitas";
        periode = { tahun: tahunPerubahan };
        break;
      default:
        return;
    }

    try {
      exportToExcel(laporanData, laporanType, masjidName, periode);
      toast.success("Laporan berhasil di-export ke Excel");
      setShowExportMenu(false);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Gagal export ke Excel");
    }
  };

  const tabs = [
    { id: "neraca", label: "Laporan Posisi Keuangan", icon: "📊" },
    { id: "laba-rugi", label: "Laporan Penghasilan Komprehensif", icon: "📈" },
    { id: "perubahan-ekuitas", label: "Laporan Perubahan Aset Neto", icon: "📋" },
  ];

  return (
    <TakmirLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Laporan Keuangan dari Jurnal
          </h1>
          <p className="text-gray-600 mt-1">
            Generate laporan keuangan otomatis dari data jurnal
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!loading) {
                    setActiveTab(tab.id);
                  }
                }}
                disabled={loading}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative z-10 ${
                  activeTab === tab.id
                    ? "border-green-600 text-green-600 bg-green-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter Section */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              {activeTab === "neraca" && (
                <div className="flex-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-gray-700" />
                    <span>Tanggal Laporan</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={tanggalInputRef}
                      type="date"
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white [&::-webkit-calendar-picker-indicator]:hidden"
                      style={{
                        colorScheme: 'light'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tanggalInputRef.current) {
                          tanggalInputRef.current.showPicker?.();
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 pointer-events-auto z-10"
                      tabIndex={-1}
                    >
                      <Calendar className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "laba-rugi" && (
                <>
                  <div className="flex-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 text-gray-700" />
                      <span>Tanggal Awal</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={tanggalAwalInputRef}
                        type="date"
                        value={tanggalAwal}
                        onChange={(e) => setTanggalAwal(e.target.value)}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white [&::-webkit-calendar-picker-indicator]:hidden"
                        style={{
                          colorScheme: 'light'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tanggalAwalInputRef.current) {
                            tanggalAwalInputRef.current.showPicker?.();
                          }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 pointer-events-auto z-10"
                        tabIndex={-1}
                      >
                        <Calendar className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 text-gray-700" />
                      <span>Tanggal Akhir</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={tanggalAkhirInputRef}
                        type="date"
                        value={tanggalAkhir}
                        onChange={(e) => setTanggalAkhir(e.target.value)}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white [&::-webkit-calendar-picker-indicator]:hidden"
                        style={{
                          colorScheme: 'light'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tanggalAkhirInputRef.current) {
                            tanggalAkhirInputRef.current.showPicker?.();
                          }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 pointer-events-auto z-10"
                        tabIndex={-1}
                      >
                        <Calendar className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "perubahan-ekuitas" && (
                <div className="flex-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-gray-700" />
                    <span>Tahun Laporan</span>
                  </label>
                  <select
                    value={tahunPerubahan}
                    onChange={(e) => setTahunPerubahan(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    {(() => {
                      const currentYear = new Date().getFullYear();
                      const years = [];
                      // Generate tahun dari 10 tahun lalu sampai 5 tahun ke depan
                      for (let year = currentYear - 10; year <= currentYear + 5; year++) {
                        years.push(year);
                      }
                      return years.map((year) => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ));
                    })()}
                  </select>
                </div>
              )}
              <div className="flex items-end relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={!laporanData || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                    <button
                      onClick={handleExportPDF}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">Export ke PDF</div>
                        <div className="text-xs text-gray-500">Format dokumen untuk cetak</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-200"
                    >
                      <FileSpreadsheet className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">Export ke Excel</div>
                        <div className="text-xs text-gray-500">Format spreadsheet untuk analisis</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <TableSkeleton rows={6} cols={4} />
            ) : laporanData ? (
              <>
                {activeTab === "neraca" && <LaporanNeraca data={laporanData} />}
                {activeTab === "laba-rugi" && (
                  <LaporanLabaRugi data={laporanData} />
                )}
                {activeTab === "perubahan-ekuitas" && (
                  <LaporanPerubahanEkuitas data={laporanData} />
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Tidak ada data untuk ditampilkan
              </div>
            )}
          </div>
        </div>
      </div>
    </TakmirLayout>
  );
};

export default LaporanKeuanganJurnalPage;

