import TakmirLayout from "../../../layouts/takmir_layout";
import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Upload,
  FileSpreadsheet,
  Calendar,
  Building2,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import toast from "react-hot-toast";
import { TakmirPageHeaderSkeleton, LaporanBlockSkeleton } from "../../../components/common/Skeleton";

// Enum mapping for API
const JENIS_LAPORAN_ENUM = {
  POSISI_KEUANGAN: "POSISI_KEUANGAN",
  PENGHASILAN_KOMPREHENSIF: "PENGHASILAN_KOMP",
  PERUBAHAN_ASET_NETO: "PERUBAHAN_ASET_NETO",
  ARUS_KAS: "ARUS_KAS",
  CATATAN_LAPORAN_KEUANGAN: "CATATAN",
  LAPORAN_KEUANGAN_BULANAN:"KEUANGAN_BULANAN",
  LAPORAN_KEUANGAN_TAHUNAN:"KEUANGAN_TAHUNAN"
};

// Static template data with jenis mapping
const laporanTemplates = [
  {
    jenis: "POSISI_KEUANGAN",
    jenisEnum: JENIS_LAPORAN_ENUM.POSISI_KEUANGAN,
    title: "Laporan Atas Posisi Keuangan",
    subtitle: "Donasi Siap Pakai",
    description:
      "Ringkasan komprehensif posisi keuangan organisasi per periode",
    icon: Building2,
    color: "from-blue-500 to-blue-600",
    templateSize: "156 KB",
  },
  {
    jenis: "PENGHASILAN_KOMP",
    jenisEnum: JENIS_LAPORAN_ENUM.PENGHASILAN_KOMPREHENSIF,
    title: "Laporan Penghasilan Komprehensif",
    subtitle: "Donasi Siap Pakai",
    description:
      "Analisis detail pendapatan dan beban operasional periode berjalan",
    icon: TrendingUp,
    color: "from-emerald-500 to-emerald-600",
    templateSize: "142 KB",
  },
  {
    jenis: "PERUBAHAN_ASET_NETO",
    jenisEnum: JENIS_LAPORAN_ENUM.PERUBAHAN_ASET_NETO,
    title: "Laporan Perubahan Aset Neto",
    subtitle: "Donasi Siap Pakai",
    description: "Tracking perubahan aset bersih dan equity organisasi",
    icon: FileText,
    color: "from-purple-500 to-purple-600",
    templateSize: "128 KB",
  },
  {
    jenis: "ARUS_KAS",
    jenisEnum: JENIS_LAPORAN_ENUM.ARUS_KAS,
    title: "Laporan Arus Kas",
    subtitle: "Donasi Siap Pakai",
    description:
      "Monitoring aliran kas masuk dan keluar dalam periode pelaporan",
    icon: TrendingUp,
    color: "from-orange-500 to-orange-600",
    templateSize: "134 KB",
  },
  {
    jenis: "CATATAN",
    jenisEnum: JENIS_LAPORAN_ENUM.CATATAN_LAPORAN_KEUANGAN,
    title: "Catatan atas Laporan Keuangan",
    subtitle: "Donasi Siap Pakai",
    description: "Penjelasan detail dan metodologi laporan keuangan",
    icon: FileText,
    color: "from-indigo-500 to-indigo-600",
    templateSize: "178 KB",
  },
  {
    jenis: "KEUANGAN_BULANAN",
    jenisEnum: JENIS_LAPORAN_ENUM.LAPORAN_KEUANGAN_BULANAN,
    title: "Laporan Keuangan Bulanan",
    subtitle: "Donasi Siap Pakai",
    description: "Penjelasan detail dan metodologi laporan keuangan",
    icon: FileText,
    color: "from-indigo-500 to-indigo-600",
    templateSize: "178 KB",
  },
  {
    jenis: "KEUANGAN_TAHUNAN",
    jenisEnum: JENIS_LAPORAN_ENUM.LAPORAN_KEUANGAN_TAHUNAN,
    title: "Laporan Keuangan Tahunan",
    subtitle: "Donasi Siap Pakai",
    description: "Penjelasan detail dan metodologi laporan keuangan",
    icon: FileText,
    color: "from-indigo-500 to-indigo-600",
    templateSize: "178 KB",
  },
];

const LaporanKeuanganPage = () => {
  const [laporanList, setLaporanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(new Set());

  // Fetch data from API
  const fetchLaporanData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/masjid/takmir");
      console.log("Fetched masjid data:", response.data);

      const dataMasjid = response.data.data; // Adjust based on your API response structure
      const laporanMasjid = dataMasjid.laporanMasjid || [];

      // Merge template data with API data
      const mergedLaporanList = laporanTemplates.map((template) => {
        const apiData = laporanMasjid.find(
          (laporan) => laporan.jenis === template.jenis
        );

        return {
          ...template,
          // API data fields
          id: apiData?.id || null,
          fileUrl: apiData?.fileUrl || null,
          uploadedAt: apiData?.uploadedAt || null,
          fileSizeKB: apiData?.fileSizeKB || null,
          // Computed fields
          hasUpload: !!apiData,
          uploadDate: apiData
            ? new Date(apiData.uploadedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : null,
          uploadStatus: apiData ? "completed" : "pending",
        };
      });

      setLaporanList(mergedLaporanList);
      console.log(mergedLaporanList);
      setError(null);
    } catch (err) {
      console.error("Error fetching laporan data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporanData();
  }, []);

  const handleDownloadTemplate = (laporan) => {
    // Buat mapping nama file template berdasarkan jenis laporan
    const templateFiles = {
      POSISI_KEUANGAN: "Template_Laporan_Keuangan_Posisi_Keuangan.xlsx",
      PENGHASILAN_KOMP: "Template_Laporan_Keuangan_Penghasilan_Komprehensif.xlsx",
      PERUBAHAN_ASET_NETO: "Template_Laporan_Keuangan_Perubahan_Aset_Neto.xlsx",
      ARUS_KAS: "Template_Laporan_Keuangan_Arus_Kas.xlsx",
      CATATAN: "template-catatan-laporan-keuangan.xlsx",
      KEUANGAN_BULANAN: "Template_Keuangan_Bulanan.xlsx",
      KEUANGAN_TAHUNAN: "Template_Keuangan_Tahunan.xlsx",
    };

    const fileName = templateFiles[laporan.jenis];
    if (fileName) {
      const fileUrl = `/templates/${fileName}`;

      // Method 1: Direct download
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      link.click();

      // Atau Method 2: Open in new tab (user bisa save as)
      // window.open(fileUrl, '_blank');
    } else {
      console.error("Template file not found for:", laporan.jenis);
      toast.error("Template tidak ditemukan");
    }
  };

  const handleUploadFile = (laporan) => {
    // Check if already uploading
    if (uploadingFiles.has(laporan.jenis)) {
      return;
    }

    // Logic untuk upload file
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          // Set uploading state
          setUploadingFiles((prev) => new Set([...prev, laporan.jenis]));

          // Create FormData
          const formData = new FormData();
          formData.append("laporanExcel", file);

          // Upload to API
          const response = await axiosInstance.post(
            `/laporan-keuangan?type=${laporan.jenisEnum}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.data.statusCode != 201) {
            throw new Error("Upload failed");
          }

          toast("Upload successful");

          // Refresh data after successful upload
          await fetchLaporanData();
        } catch (error) {
          console.error("Error uploading file:", error);
          alert("Upload gagal. Silakan coba lagi.");
        } finally {
          // Remove uploading state
          setUploadingFiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(laporan.jenis);
            return newSet;
          });
        }
      }
    };
    input.click();
  };

  const handleDownloadFile = (laporan) => {
    if (laporan.fileUrl) {
      window.open(laporan.fileUrl, "_blank");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Terupload";
      case "pending":
        return "Menunggu Upload";
      default:
        return "Belum Upload";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-amber-600 bg-amber-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Loading state
  if (loading) {
    return (
      <TakmirLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6 lg:p-8 space-y-6">
          <TakmirPageHeaderSkeleton showActions />
          <LaporanBlockSkeleton />
        </div>
      </TakmirLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <TakmirLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </TakmirLayout>
    );
  }

  return (
    <TakmirLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="p-6 lg:p-8 space-y-8">
          {/* Header Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-500/5 rounded-2xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Laporan Keuangan
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <p className="font-medium">
                      {new Date().toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Download Semua Template
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Terupload</p>
                  <p className="text-xl font-bold text-gray-900">
                    {
                      laporanList.filter((l) => l.uploadStatus === "completed")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Menunggu</p>
                  <p className="text-xl font-bold text-gray-900">
                    {
                      laporanList.filter((l) => l.uploadStatus === "pending")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Laporan</p>
                  <p className="text-xl font-bold text-gray-900">
                    {laporanList.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {laporanList.map((laporan, index) => {
                const IconComponent = laporan.icon;
                return (
                  <div
                    key={laporan.jenis}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500"
                  >
                    {/* Header with gradient */}
                    <div
                      className={`h-24 bg-gradient-to-r ${laporan.color} relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full"></div>
                      <div className="relative p-6 flex items-center justify-between h-full">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(laporan.uploadStatus)}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors duration-300">
                          {laporan.title}
                        </h3>

                        <p className="text-sm text-gray-600 leading-relaxed">
                          {laporan.description}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            laporan.uploadStatus
                          )}`}
                        >
                          {getStatusText(laporan.uploadStatus)}
                        </span>
                        {laporan.hasUpload && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {laporan.uploadDate}
                          </span>
                        )}
                      </div>

                      {/* File Info */}
                      {laporan.hasUpload && (
                        <div className="bg-green-50 rounded-xl p-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">File Terupload</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-green-600">
                            <span>Ukuran: {laporan.fileSizeKB} KB</span>
                          </div>
                        </div>
                      )}

                      {/* Template Info */}
                      <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium">Template Excel</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Ukuran: {laporan.templateSize}</span>
                          <button
                            onClick={() =>
                              handleDownloadTemplate(laporan)
                            }
                            className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleUploadFile(laporan)}
                          disabled={uploadingFiles.has(laporan.jenis)}
                          className={`flex-1 py-2 px-4 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                            uploadingFiles.has(laporan.jenis)
                              ? "bg-gray-400 cursor-not-allowed"
                              : laporan.hasUpload
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                              : "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                          }`}
                        >
                          {uploadingFiles.has(laporan.jenis) ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              {laporan.hasUpload
                                ? "Update File"
                                : "Upload File"}
                            </>
                          )}
                        </button>

                        {laporan.hasUpload && (
                          <button
                            onClick={() => handleDownloadFile(laporan)}
                            className="py-2 px-4 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Cara Menggunakan Template
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Download Template
                  </p>
                  <p>Unduh template Excel yang sesuai dengan jenis laporan</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Isi Data</p>
                  <p>Lengkapi template dengan data keuangan yang akurat</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Upload File</p>
                  <p>Upload file yang sudah diisi untuk generate laporan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TakmirLayout>
  );
};

export default LaporanKeuanganPage;
