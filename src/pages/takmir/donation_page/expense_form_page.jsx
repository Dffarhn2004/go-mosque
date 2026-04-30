import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Upload, AlertTriangle } from "lucide-react";
import TakmirLayout from "../../../layouts/takmir_layout";
import axiosInstance from "../../../api/axiosInstance";
import toast from "react-hot-toast";
import formatCurrency from "../../../utils/formatCurrency";

export default function DonationExpenseFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [donation, setDonation] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    gambar: null,
    tujuan: "",
    kategori: "",
    deskripsi: "",
    jumlah: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryRes, donationRes] = await Promise.all([
          axiosInstance.get("/kategori-pengeluaran-donasi"),
          axiosInstance.get(`/donasi-masjid/takmir/${id}`),
        ]);
        setCategories(categoryRes.data.data || []);
        setDonation(donationRes.data.data);
      } catch (error) {
        console.error("Error loading expense form data:", error);
        toast.error("Gagal memuat form pengeluaran.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCurrencyInput = (value) => {
    const numericValue = value.replace(/[^\d]/g, "");
    setFormData((prev) => ({
      ...prev,
      jumlah: numericValue,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      gambar: file,
    }));

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const isValid =
    formData.tujuan.trim() &&
    formData.kategori &&
    formData.deskripsi.trim() &&
    formData.jumlah;

  const submitExpense = async () => {
    if (!donation || saving) return;

    try {
      setSaving(true);
      const data = new FormData();
      data.append("TujuanPengeluaran", formData.tujuan.trim());
      data.append("DeskripsiPengeluaran", formData.deskripsi.trim());
      data.append("UangPengeluaran", parseFloat(formData.jumlah).toFixed(2));
      data.append("id_kategori_pengeluaran", formData.kategori);
      if (formData.gambar) {
        data.append("FotoBuktiPengeluaran", formData.gambar);
      }
      data.append("id_donasi_masjid", donation.id);
      data.append("kategori_DonasiId", donation.kategori_donasi.id);
      data.append("masjidId", donation.masjid.id);

      const response = await axiosInstance.post("/pengeluaran-donasi", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.statusCode !== 201) {
        throw new Error(response.data.message || "Gagal menyimpan pengeluaran.");
      }

      toast.success("Pengeluaran berhasil disimpan.");
      navigate(`/admin/donation/${id}`, { replace: true });
    } catch (error) {
      console.error("Error submitting expense:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Terjadi kesalahan saat menyimpan pengeluaran."
      );
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return (
      <TakmirLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Memuat form pengeluaran...</span>
          </div>
        </div>
      </TakmirLayout>
    );
  }

  return (
    <TakmirLayout>
      <div className="space-y-6 p-6">
        <button
          onClick={() => navigate(`/admin/donation/${id}`)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Kembali ke Detail Donasi</span>
        </button>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Tambah Pengeluaran</h1>
            <p className="mt-1 text-sm text-gray-600">
              Catat pengeluaran untuk program{" "}
              <span className="font-semibold text-gray-800">
                {donation?.Nama || "Donasi"}
              </span>
              .
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Pemberitahuan ke donatur</p>
                <p className="text-sm">
                  Saat pengeluaran ini disimpan, perubahan ini akan diberitahukan
                  ke seluruh donatur program agar transparansi tetap terjaga.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tujuan Pengeluaran
                </label>
                <input
                  type="text"
                  name="tujuan"
                  value={formData.tujuan}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  placeholder="Contoh: Pembelian material bangunan"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Kategori Pengeluaran
                </label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.Nama || category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Jumlah Pengeluaran
                </label>
                <input
                  type="text"
                  value={
                    formData.jumlah
                      ? formatCurrency(parseInt(formData.jumlah, 10)).replace("Rp", "Rp ")
                      : ""
                  }
                  onChange={(e) => handleCurrencyInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  placeholder="Rp 0"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  placeholder="Jelaskan detail pengeluaran ini"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Foto Bukti Pengeluaran
                </label>
                <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-all hover:border-green-400 hover:bg-green-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img
                        src={imagePreview}
                        alt="Preview bukti pengeluaran"
                        className="mx-auto h-40 w-full max-w-sm rounded-lg object-cover"
                      />
                      <p className="text-sm text-gray-600">
                        {formData.gambar?.name}
                      </p>
                      <p className="text-xs text-green-700">
                        Klik area ini untuk mengganti gambar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="mx-auto h-10 w-10 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-700">
                          Upload bukti pengeluaran
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, atau JPEG
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">Ringkasan</p>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between gap-4">
                    <span>Program</span>
                    <span className="text-right font-medium text-gray-800">
                      {donation?.Nama || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Masjid</span>
                    <span className="text-right font-medium text-gray-800">
                      {donation?.masjid?.Nama || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Total akan dikeluarkan</span>
                    <span className="text-right font-semibold text-green-700">
                      {formData.jumlah
                        ? formatCurrency(parseInt(formData.jumlah, 10))
                        : "Rp 0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/admin/donation/${id}`)}
              disabled={saving}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                if (saving) return;
                if (!isValid) {
                  toast.error("Mohon lengkapi semua field wajib terlebih dahulu.");
                  return;
                }
                setShowConfirm(true);
              }}
              disabled={saving}
              className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Menyimpan...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save className="h-5 w-5" />
                  Simpan Pengeluaran
                </span>
              )}
            </button>
          </div>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Konfirmasi Simpan Pengeluaran
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Pengeluaran yang Anda simpan akan dicatat pada program ini dan
                    akan diberitahukan ke seluruh donatur.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <div className="flex justify-between gap-4">
                  <span>Tujuan</span>
                  <span className="text-right font-medium text-gray-900">
                    {formData.tujuan}
                  </span>
                </div>
                <div className="mt-2 flex justify-between gap-4">
                  <span>Jumlah</span>
                  <span className="text-right font-semibold text-green-700">
                    {formatCurrency(parseInt(formData.jumlah, 10) || 0)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={saving}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Tinjau Lagi
                </button>
                <button
                  type="button"
                  onClick={submitExpense}
                  disabled={saving}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Menyimpan...
                    </span>
                  ) : (
                    "Ya, Simpan Sekarang"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TakmirLayout>
  );
}
