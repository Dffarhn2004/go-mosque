import React, { useState, useEffect } from "react";
import TakmirLayout from "../../../layouts/takmir_layout";
import COATable from "../../../components/common/COATable";
import { getAllAccounts, createAccount, updateAccount, deleteAccount, getNextAccountCode, getValidParents } from "../../../services/coaService";
import { transformAccounts, transformAccount, transformAccountForBackend } from "../../../utils/dataTransform";
import { getDetailAccounts } from "../../../utils/accountUtils";
import toast from "react-hot-toast";
import { TableSkeleton } from "../../../components/common/Skeleton";

const COAPage = () => {
  const masjid = JSON.parse(localStorage.getItem("masjid") || "{}");
  const masjidId = masjid?.id;
  const [coaList, setCoaList] = useState([]); // Hanya detail accounts untuk tampilan table
  const [allAccounts, setAllAccounts] = useState([]); // Semua accounts untuk form modal
  const [showForm, setShowForm] = useState(false);
  const [editingCOA, setEditingCOA] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load COA dari API
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const accounts = await getAllAccounts({
        includeInactive: false,
        masjidId,
      });
      const transformedAccounts = transformAccounts(accounts);
      
      // Simpan semua accounts untuk form modal
      setAllAccounts(transformedAccounts);
      
      // Filter hanya detail accounts untuk tampilan table
      const detailAccounts = getDetailAccounts(transformedAccounts);
      setCoaList(detailAccounts);
    } catch (error) {
      console.error("Error loading accounts:", error);
      toast.error(
        error.response?.data?.message || "Gagal memuat data akun"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCOA(null);
    setShowForm(true);
  };

  const handleEdit = (coa) => {
    setEditingCOA(coa);
    setShowForm(true);
  };

  const handleDelete = async (coa) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus akun ${coa.namaAkun}?`
      )
    ) {
      return;
    }

    try {
      await deleteAccount(coa.id);
      toast.success("Akun berhasil dihapus");
      await loadAccounts(); // Reload data
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(
        error.response?.data?.message || "Gagal menghapus akun"
      );
    }
  };

  const handleSave = async (formData) => {
    try {
      const backendData = transformAccountForBackend(formData);
      backendData.masjidId = formData.masjidId || masjidId || null;

      if (editingCOA) {
        // Edit existing
        await updateAccount(editingCOA.id, backendData);
        toast.success("Akun berhasil diupdate");
      } else {
        // Create new
        await createAccount(backendData);
        toast.success("Akun berhasil ditambahkan");
      }

      setShowForm(false);
      setEditingCOA(null);
      await loadAccounts(); // Reload data
    } catch (error) {
      console.error("Error saving account:", error);
      toast.error(
        error.response?.data?.message || "Gagal menyimpan akun"
      );
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCOA(null);
  };

  return (
    <TakmirLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Manajemen Chart of Accounts
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola akun-akun untuk sistem jurnal akuntansi
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Tambah Akun
            </button>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : (
          /* COA Table */
          <COATable
            coaList={coaList}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
          />
        )}

        {/* Form Modal */}
        {showForm && (
          <COAFormModal
            coa={editingCOA}
            coaList={allAccounts}
            masjidId={masjidId}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </TakmirLayout>
  );
};

// COA Form Modal Component
const COAFormModal = ({ coa, coaList, masjidId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    kodeAkun: coa?.kodeAkun || "",
    namaAkun: coa?.namaAkun || "",
    tipeAkun: coa?.tipeAkun || "ASET",
    kategori: coa?.kategori || "",
    category: coa?.category || "",
    restriction: coa?.restriction || "",
    report: coa?.report || "",
    isActive: coa?.isActive ?? true,
    parentId: coa?.parentId || "",
    masjidId: coa?.masjidId || masjidId || "",
  });

  const [errors, setErrors] = useState({});
  const [parentOptions, setParentOptions] = useState([]);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [loadingParents, setLoadingParents] = useState(false);

  // Load valid parent options dari backend saat form dibuka untuk create baru
  useEffect(() => {
    if (!coa) {
      loadValidParents();
    }
  }, [coa]);

  const loadValidParents = async () => {
    try {
      setLoadingParents(true);
      const validParents = await getValidParents({ masjidId });
      // Transform untuk format frontend jika diperlukan
      const transformed = transformAccounts(validParents);
      setParentOptions(transformed);
    } catch (error) {
      console.error("Error loading valid parents:", error);
      toast.error(
        error.response?.data?.message || "Gagal memuat daftar parent account"
      );
      // Fallback: gunakan empty array
      setParentOptions([]);
    } finally {
      setLoadingParents(false);
    }
  };

  // Auto-generate code dan kategori saat parent dipilih
  const handleParentChange = async (parentId) => {
    if (!parentId) {
      setFormData({
        ...formData,
        parentId: "",
        kodeAkun: "",
        kategori: "",
      });
      return;
    }

    // Cari parent account untuk mendapatkan nama (kategori)
    const parentAccount = parentOptions.find((acc) => acc.id === parentId);
    const parentName = parentAccount?.namaAkun || "";

    setGeneratingCode(true);
    try {
      const nextCode = await getNextAccountCode(parentId, masjidId);
      setFormData({
        ...formData,
        parentId,
        kodeAkun: nextCode,
        kategori: parentName, // Auto-fill kategori dari parent name
        category: parentName,
      });
    } catch (error) {
      console.error("Error generating code:", error);
      toast.error(
        error.response?.data?.message || "Gagal generate kode akun"
      );
    } finally {
      setGeneratingCode(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    // Untuk create baru, parentId wajib
    if (!coa && !formData.parentId) {
      newErrors.parentId = "Parent account harus dipilih";
    }

    // Kode akun wajib (akan di-generate otomatis jika parent dipilih)
    if (!formData.kodeAkun.trim()) {
      newErrors.kodeAkun = "Kode akun harus diisi";
    }

    if (!formData.namaAkun.trim()) {
      newErrors.namaAkun = "Nama akun harus diisi";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category wajib diisi";
    }

    if (!formData.restriction.trim()) {
      newErrors.restriction = "Restriction wajib diisi";
    }

    if (!formData.report.trim()) {
      newErrors.report = "Report wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {coa ? "Edit Akun" : "Tambah Akun"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Parent Selection - hanya untuk create baru */}
          {!coa && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Account (Group) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.parentId || ""}
                  onChange={(e) => handleParentChange(e.target.value)}
                  disabled={loadingParents}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white ${
                    errors.parentId ? "border-red-500" : "border-gray-300"
                  } ${loadingParents ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {loadingParents ? "Memuat parent account..." : "Pilih Parent Account"}
                  </option>
                  {parentOptions.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.kodeAkun} - {parent.namaAkun}
                    </option>
                  ))}
                </select>
                {loadingParents && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                  </div>
                )}
              </div>
              {errors.parentId && (
                <p className="mt-1 text-sm text-red-600">{errors.parentId}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Pilih parent account yang valid (group account level terakhir)
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kode Akun <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.kodeAkun}
                onChange={(e) =>
                  setFormData({ ...formData, kodeAkun: e.target.value })
                }
                readOnly={!coa} // Read-only untuk create baru
                placeholder={
                  generatingCode
                    ? "Generating..."
                    : !coa
                    ? "Akan di-generate otomatis"
                    : "Contoh: 1.1.01"
                }
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  !coa ? "bg-gray-50 cursor-not-allowed" : "bg-white"
                } ${
                  errors.kodeAkun ? "border-red-500" : "border-gray-300"
                }`}
              />
              {generatingCode && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                </div>
              )}
            </div>
            {errors.kodeAkun && (
              <p className="mt-1 text-sm text-red-600">{errors.kodeAkun}</p>
            )}
            {!coa && (
              <p className="mt-1 text-xs text-gray-500">
                Kode akun akan di-generate otomatis setelah memilih parent account
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Akun <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.namaAkun}
              onChange={(e) =>
                setFormData({ ...formData, namaAkun: e.target.value })
              }
              placeholder="Contoh: Kas"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white ${
                errors.namaAkun ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.namaAkun && (
              <p className="mt-1 text-sm text-red-600">{errors.namaAkun}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Akun <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.tipeAkun}
              onChange={(e) =>
                setFormData({ ...formData, tipeAkun: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="ASET">ASET</option>
              <option value="KEWAJIBAN">KEWAJIBAN</option>
              <option value="EKUITAS">EKUITAS</option>
              <option value="PENDAPATAN">PENDAPATAN</option>
              <option value="BEBAN">BEBAN</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (backend enum) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    kategori: e.target.value,
                  })
                }
                placeholder="Contoh: BEBAN, PENDAPATAN, ASET_NETO, ASET_LANCAR"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Wajib sesuai enum backend (lihat dokumen).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restriction <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.restriction}
                onChange={(e) =>
                  setFormData({ ...formData, restriction: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white ${
                  errors.restriction ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Pilih Restriction</option>
                <option value="TANPA_PEMBATASAN">TANPA_PEMBATASAN</option>
                <option value="DENGAN_PEMBATASAN">DENGAN_PEMBATASAN</option>
              </select>
              {errors.restriction && (
                <p className="mt-1 text-sm text-red-600">{errors.restriction}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.report}
                onChange={(e) =>
                  setFormData({ ...formData, report: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white ${
                  errors.report ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Pilih Report</option>
                <option value="NERACA">NERACA</option>
                <option value="LAPORAN_PENGHASILAN_KOMPREHENSIF">
                  LAPORAN_PENGHASILAN_KOMPREHENSIF
                </option>
              </select>
              {errors.report && (
                <p className="mt-1 text-sm text-red-600">{errors.report}</p>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Aktif</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default COAPage;

