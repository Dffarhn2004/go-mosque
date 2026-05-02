import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../components/common/LandingPage/Navbar";
import Footer from "../../../components/common/LandingPage/Footer";
import MetaData from "../../../components/common/MetaData";
import LaporanNeraca from "../../../components/common/LaporanNeraca";
import LaporanLabaRugi from "../../../components/common/LaporanLabaRugi";
import LaporanPerubahanEkuitas from "../../../components/common/LaporanPerubahanEkuitas";
import COAViewUser from "../../../components/common/COAViewUser";
import {
  generateNeracaPublic as generateNeracaAPI,
  generateLabaRugiPublic as generateLabaRugiAPI,
  generatePerubahanEkuitasPublic as generatePerubahanEkuitasAPI,
} from "../../../services/laporanService";
import { getAllAccountsPublic } from "../../../services/coaService";
import { getAccountBalancesPublic } from "../../../services/jurnalService";
import { transformAccounts } from "../../../utils/dataTransform";
import { exportToPDF, exportToExcel } from "../../../utils/exportUtils";
import { Calendar, Download, Loader2, FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../../api/axiosInstance";
import { getDonorNavbarUser } from "../../../utils/authStorage";

const LaporanKeuanganUserPage = () => {
  const { id: masjidId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("neraca");
  const [laporanData, setLaporanData] = useState(null);
  const [coaList, setCoaList] = useState([]);
  const [saldoAkun, setSaldoAkun] = useState({});
  const [masjidData, setMasjidData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCOA, setLoadingCOA] = useState(false);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
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
  const navbarUser = getDonorNavbarUser();

  // Load masjid data
  useEffect(() => {
    const fetchMasjidData = async () => {
      try {
        const res = await axiosInstance.get(`/masjid/${masjidId}`);
        setMasjidData(res.data.data);
      } catch (error) {
        console.error("Error fetching masjid data:", error);
      }
    };
    if (masjidId) {
      fetchMasjidData();
    }
  }, [masjidId]);

  // Load COA dan saldo
  useEffect(() => {
    if (activeTab === "coa" && masjidId) {
      loadCOAData();
    }
  }, [activeTab, masjidId, tanggalAkhir]);

  // Generate laporan saat tab atau tanggal berubah
  useEffect(() => {
    if (activeTab !== "coa" && masjidId) {
      generateLaporan();
    }
  }, [activeTab, tanggal, tanggalAwal, tanggalAkhir, tahunPerubahan, masjidId]);

  const loadCOAData = async () => {
    if (!masjidId) {
      toast.error("Masjid ID tidak ditemukan");
      return;
    }

    try {
      setLoadingCOA(true);
      const [accounts, balances] = await Promise.all([
        getAllAccountsPublic(masjidId, { includeInactive: false }),
        getAccountBalancesPublic(masjidId, { endDate: tanggalAkhir }),
      ]);

      const transformedAccounts = transformAccounts(accounts);
      setCoaList(transformedAccounts);
      
      // Transform balances format: { accountId: { account, saldo } } -> { accountId: saldo }
      const transformedBalances = {};
      if (balances) {
        Object.keys(balances).forEach((accountId) => {
          const balanceData = balances[accountId];
          transformedBalances[accountId] = balanceData.saldo || 0;
        });
      }
      setSaldoAkun(transformedBalances);
    } catch (error) {
      console.error("Error loading COA data:", error);
      toast.error(error.response?.data?.message || "Gagal memuat data COA");
    } finally {
      setLoadingCOA(false);
    }
  };

  const generateLaporan = async () => {
    if (!masjidId) {
      toast.error("Masjid ID tidak ditemukan");
      return;
    }

    try {
      setLoading(true);
      setLaporanData(null);

      let data = null;

      switch (activeTab) {
        case "neraca":
          data = await generateNeracaAPI(masjidId, tanggal);
          data = transformNeracaData(data);
          break;
        case "laba-rugi":
          data = await generateLabaRugiAPI(masjidId, tanggalAwal, tanggalAkhir);
          data = transformLabaRugiData(data);
          break;
        case "perubahan-ekuitas":
          data = await generatePerubahanEkuitasAPI(masjidId, tahunPerubahan);
          data = transformPerubahanEkuitasData(data);
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
  };

  // Transform functions (sama seperti di laporan_keuangan_jurnal.jsx)
  const transformNeracaData = (data) => {
    if (!data) {
      return {
        aset: {},
        kewajiban: {},
        ekuitas: {},
        totalAset: 0,
        totalKewajiban: 0,
        totalEkuitas: 0,
      };
    }

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

  const transformLabaRugiData = (data) => {
    if (!data) {
      return {
        pendapatan: {},
        beban: {},
        totalPendapatan: 0,
        totalBeban: 0,
        labaRugi: 0,
      };
    }

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

  const handleExportPDF = () => {
    if (!laporanData) {
      toast.error("Tidak ada data untuk di-export");
      return;
    }

    const masjidName = masjidData?.namaMasjid || "Masjid";
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
      exportToPDF(laporanData, laporanType, masjidName, periode);
      toast.success("Laporan berhasil di-export ke PDF");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Gagal export ke PDF");
    }
  };

  const handleExportExcel = () => {
    if (!laporanData) {
      toast.error("Tidak ada data untuk di-export");
      return;
    }

    const masjidName = masjidData?.namaMasjid || "Masjid";
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
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Gagal export ke Excel");
    }
  };

  const tabs = [
    { id: "neraca", label: "Laporan Posisi Keuangan", icon: "📊" },
    { id: "laba-rugi", label: "Laporan Penghasilan Komprehensif", icon: "📈" },
    { id: "perubahan-ekuitas", label: "Laporan Perubahan Aset Neto", icon: "📋" },
    { id: "coa", label: "Chart of Accounts", icon: "📑" },
  ];

  return (
    <>
      <MetaData />
      <Navbar
        position="static"
        user={navbarUser}
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/masjid/${masjidId}`);
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-green-600 font-semibold mb-4 group transition-colors duration-200"
                aria-label="Kembali ke halaman detail masjid"
              >
                <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                Kembali ke Detail Masjid
              </button>
              <h1 className="text-3xl font-bold text-gray-800">
                Laporan Keuangan
              </h1>
              <p className="text-gray-600 mt-1">
                {masjidData?.Nama || masjidData?.namaMasjid || "Masjid"}
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (!loading && !loadingCOA) {
                        setActiveTab(tab.id);
                      }
                    }}
                    disabled={loading || loadingCOA}
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-green-600 text-green-600 bg-green-50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } ${loading || loadingCOA ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Filter Section - hanya untuk laporan, bukan COA */}
              {activeTab !== "coa" && (
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {activeTab === "neraca" && (
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          Tanggal Laporan
                        </label>
                        <input
                          type="date"
                          value={tanggal}
                          onChange={(e) => setTanggal(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                        />
                      </div>
                    )}
                    {activeTab === "laba-rugi" && (
                      <>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            Tanggal Awal
                          </label>
                          <input
                            type="date"
                            value={tanggalAwal}
                            onChange={(e) => setTanggalAwal(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            Tanggal Akhir
                          </label>
                          <input
                            type="date"
                            value={tanggalAkhir}
                            onChange={(e) => setTanggalAkhir(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                          />
                        </div>
                      </>
                    )}
                    {activeTab === "perubahan-ekuitas" && (
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          Tahun Laporan
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
                    <div className="flex items-end gap-2">
                      <button
                        onClick={handleExportPDF}
                        disabled={!laporanData || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FileText className="w-4 h-4" />
                        PDF
                      </button>
                      <button
                        onClick={handleExportExcel}
                        disabled={!laporanData || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4" />
                        Excel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter untuk COA */}
              {activeTab === "coa" && (
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        Tanggal Saldo
                      </label>
                      <input
                        type="date"
                        value={tanggalAkhir}
                        onChange={(e) => setTanggalAkhir(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {loading || loadingCOA ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    <span className="ml-2 text-gray-600">Memuat data...</span>
                  </div>
                ) : (
                  <>
                    {activeTab === "neraca" && laporanData && (
                      <LaporanNeraca data={laporanData} />
                    )}
                    {activeTab === "laba-rugi" && laporanData && (
                      <LaporanLabaRugi data={laporanData} />
                    )}
                    {activeTab === "perubahan-ekuitas" && laporanData && (
                      <LaporanPerubahanEkuitas data={laporanData} />
                    )}
                    {activeTab === "coa" && (
                      <COAViewUser coaList={coaList} saldoAkun={saldoAkun} />
                    )}
                    {!laporanData && activeTab !== "coa" && (
                      <div className="text-center py-12 text-gray-500">
                        Tidak ada data laporan
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LaporanKeuanganUserPage;

