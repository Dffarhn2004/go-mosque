import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TakmirLayout from "../../../layouts/takmir_layout";
import { getAllAccounts } from "../../../services/coaService";
import {
  getJurnalById,
  createJurnal,
  updateJurnal,
} from "../../../services/jurnalService";
import { transformAccounts, transformJurnal, transformJurnalForBackend } from "../../../utils/dataTransform";
import { getNormalBalance, isNormalBalance, getNormalBalanceLabel } from "../../../utils/accountUtils";
import formatCurrency from "../../../utils/formatCurrency";
import axiosInstance from "../../../api/axiosInstance";
import {
  buildEntriesFromTransactionType,
  getAsetKasBank,
  getPendapatanAccounts,
  getBebanAccounts,
  getHutangAccounts,
  getPiutangAccounts,
} from "../../../utils/jurnalUtils";
import toast from "react-hot-toast";
import SearchableSelect from "../../../components/common/SearchableSelect";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { JurnalFormSkeleton } from "../../../components/common/Skeleton";

const JurnalFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = !!id;
  const approvalParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const approvalDonationId = approvalParams.get("donationId") || "";
  const approvalCampaignName = approvalParams.get("campaignName") || "";
  const approvalDonorName = approvalParams.get("donorName") || "";
  const approvalAmount = approvalParams.get("amount") || "";
  const approvalDate = approvalParams.get("date") || "";
  const approvalReturnTo = approvalParams.get("returnTo") || "";
  const isDonationApprovalMode =
    !isEditMode && approvalParams.get("source") === "donasi-approval";
  
  const [coaList, setCoaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [referensi, setReferensi] = useState("");
  const tanggalInputRef = React.useRef(null);
  const [transactionType, setTransactionType] = useState("PEMASUKAN");
  const [templateForm, setTemplateForm] = useState({
    akunSatuId: "",
    akunDuaId: "",
    nominal: "",
    keterangan: "",
    hasRestriction: false,
  });
  const [entries, setEntries] = useState([
    {
      id: Date.now(),
      akunId: "",
      tipe: "DEBIT",
      jumlah: "",
      hasRestriction: false,
      keterangan: "",
    },
  ]);
  const [errors, setErrors] = useState({});

  // Load data
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load COA
      const accounts = await getAllAccounts({ includeInactive: false });
      const transformedAccounts = transformAccounts(accounts);
      const detailAccounts = transformedAccounts.filter(
        (acc) => !acc.isGroup && acc.isActive
      );
      setCoaList(detailAccounts);

      if (isDonationApprovalMode) {
        const pendapatanOptions = getPendapatanAccounts(detailAccounts).filter(
          (acc) => acc.restriction !== "DENGAN_PEMBATASAN"
        );
        const kasBankOptions = getAsetKasBank(detailAccounts).filter(
          (acc) => acc.restriction !== "DENGAN_PEMBATASAN"
        );

        setTransactionType("PEMASUKAN");
        setTanggal(
          approvalDate
            ? new Date(approvalDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]
        );
        setReferensi(approvalDonationId ? `DONASI:${approvalDonationId}` : "");
        setTemplateForm({
          akunSatuId: pendapatanOptions[0]?.id || "",
          akunDuaId: kasBankOptions[0]?.id || "",
          nominal: approvalAmount || "",
          keterangan: `Approval donasi masuk${
            approvalDonorName ? ` dari ${approvalDonorName}` : ""
          }${approvalCampaignName ? ` untuk campaign ${approvalCampaignName}` : ""}`,
          hasRestriction: false,
        });
      }

      // Load existing jurnal transaction untuk edit mode
      if (isEditMode) {
        const transaction = await getJurnalById(id);
        const transformedTransaction = transformJurnal(transaction);
        setTanggal(transformedTransaction.tanggal.split("T")[0]);
        setReferensi(transformedTransaction.referensi || "");
        setEntries(
          transformedTransaction.entries.map((entry) => ({
            id: entry.id || Date.now() + Math.random(),
            akunId: entry.akunId,
            tipe: entry.tipe,
            jumlah: entry.jumlah.toString(),
            hasRestriction: entry.hasRestriction || false,
            keterangan: entry.keterangan || "",
          }))
        );
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(error.response?.data?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const updateTemplateForm = (field, value) => {
    setTemplateForm((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      
      // Jika akun dipilih, auto-set hasRestriction berdasarkan restriction akun
      if (field === "akunSatuId" && value) {
        const selectedAkun = coaList.find((coa) => coa.id === value);
        if (selectedAkun && selectedAkun.restriction === "DENGAN_PEMBATASAN") {
          updated.hasRestriction = true;
        }
      }
      if (field === "akunDuaId" && value) {
        const selectedAkun = coaList.find((coa) => coa.id === value);
        if (selectedAkun && selectedAkun.restriction === "DENGAN_PEMBATASAN") {
          updated.hasRestriction = true;
        }
      }
      
      return updated;
    });
    
    // Clear field-level error jika ada
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined,
      });
    }
  };


  const addEntry = () => {
    setEntries([
      ...entries,
      {
        id: Date.now() + Math.random(),
        akunId: "",
        tipe: "DEBIT",
        jumlah: "",
        hasRestriction: false,
        keterangan: "",
      },
    ]);
  };

  const removeEntry = (entryId) => {
    if (entries.length <= 1) {
      toast.error("Minimal harus ada 1 entry");
      return;
    }
    setEntries(entries.filter((entry) => entry.id !== entryId));
  };

  const updateEntry = (entryId, field, value) => {
    setEntries(
      entries.map((entry) => {
        if (entry.id === entryId) {
          const updatedEntry = { ...entry, [field]: value };
          
          // Auto-set tipe berdasarkan normal balance saat akun dipilih
          if (field === "akunId" && value) {
            const selectedAkun = coaList.find((coa) => coa.id === value);
            if (selectedAkun) {
              // Gunakan normalBalance langsung dari account jika ada, baru fallback ke getNormalBalance
              const normalBalance = getNormalBalance(selectedAkun);
              updatedEntry.tipe = normalBalance;
              
              // Auto-set hasRestriction berdasarkan restriction dari akun
              if (selectedAkun.restriction === "DENGAN_PEMBATASAN") {
                updatedEntry.hasRestriction = true;
              } else {
                updatedEntry.hasRestriction = false;
              }
            }
          }
          
          return updatedEntry;
        }
        return entry;
      })
    );
    // Clear error for this field
    if (errors[entryId]) {
      setErrors({
        ...errors,
        [entryId]: {
          ...errors[entryId],
          [field]: undefined,
        },
      });
    }
  };

  const validateEntries = () => {
    const newErrors = {};
    let isValid = true;

    // Validate transaction level fields
    if (!tanggal) {
      newErrors.tanggal = "Tanggal harus diisi";
      isValid = false;
    }

    // Validate entries - minimal 1 entry, tidak perlu harus DEBIT dan KREDIT
    if (entries.length < 1) {
      newErrors.entries = "Minimal harus ada 1 entry";
      isValid = false;
    }

    entries.forEach((entry) => {
      const entryErrors = {};

      if (!entry.akunId) {
        entryErrors.akunId = "Akun harus dipilih";
        isValid = false;
      } else {
        const selectedAkun = coaList.find((coa) => coa.id === entry.akunId);
        if (selectedAkun && !selectedAkun.isActive) {
          entryErrors.akunId = "Akun yang dipilih tidak aktif";
          isValid = false;
        }
      }

      if (!entry.jumlah || parseFloat(entry.jumlah) <= 0) {
        entryErrors.jumlah = "Jumlah harus lebih dari 0";
        isValid = false;
      }

      if (Object.keys(entryErrors).length > 0) {
        newErrors[entry.id] = entryErrors;
      }
    });

    // Tidak perlu validasi balance - tidak balance itu tidak apa-apa
    // Tidak perlu validasi harus ada DEBIT dan KREDIT - bisa nyicil bertahap

    setErrors(newErrors);
    return isValid;
  };

  const validateTemplateTransaction = () => {
    const newErrors = {};
    let isValid = true;

    if (!tanggal) {
      newErrors.tanggal = "Tanggal harus diisi";
      isValid = false;
    }

    if (!transactionType) {
      newErrors.transactionType = "Jenis transaksi harus dipilih";
      isValid = false;
    }

    if (!templateForm.akunSatuId) {
      newErrors.akunSatuId = "Akun pertama harus dipilih";
      isValid = false;
    }

    if (!templateForm.akunDuaId) {
      newErrors.akunDuaId = "Akun kedua harus dipilih";
      isValid = false;
    }

    if (!templateForm.nominal || parseFloat(templateForm.nominal) <= 0) {
      newErrors.nominal = "Nominal harus lebih dari 0";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handlePreview = () => {
    if (isEditMode) {
      if (validateEntries()) {
        setShowPreview(true);
      } else {
        toast.error("Mohon lengkapi semua field yang wajib diisi");
      }
      return;
    }

    // Mode template (tambah jurnal baru dengan 6 jenis transaksi)
    if (!validateTemplateTransaction()) {
      setShowPreview(false);
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    try {
      const builtEntries = buildEntriesFromTransactionType(transactionType, {
        akunSatuId: templateForm.akunSatuId,
        akunDuaId: templateForm.akunDuaId,
        nominal: templateForm.nominal,
        keterangan: templateForm.keterangan,
        hasRestriction: templateForm.hasRestriction,
        coaList,
      });

      setEntries(
        builtEntries.map((entry) => ({
          id: Date.now() + Math.random(),
          ...entry,
        }))
      );
      setShowPreview(true);
    } catch (error) {
      console.error("Error building entries from template:", error);
      toast.error(error.message || "Gagal menyiapkan preview jurnal");
    }
  };

  const handleSave = async () => {
    if (isEditMode) {
      // Validasi hanya field wajib (mode edit lama)
      if (!validateEntries()) {
        setShowPreview(false);
        toast.error("Mohon lengkapi semua field yang wajib diisi");
        return;
      }

      try {
        setSaving(true);

        const transactionData = {
          tanggal,
          keterangan: "", // Keterangan sekarang di level entry
          referensi,
          entries: entries.map((entry) => ({
            akunId: entry.akunId,
            tipe: entry.tipe,
            jumlah: parseFloat(entry.jumlah),
            hasRestriction: entry.hasRestriction || false,
            keterangan: entry.keterangan || "",
          })),
        };

        const backendData = transformJurnalForBackend(transactionData);

        await updateJurnal(id, backendData);
        toast.success("Transaksi jurnal berhasil diupdate");

        // Navigate back
        navigate(approvalReturnTo || "/admin/jurnal");
      } catch (error) {
        console.error("Error saving jurnal transaction:", error);
        toast.error(
          error.response?.data?.message || "Gagal menyimpan transaksi jurnal"
        );
      } finally {
        setSaving(false);
        setShowPreview(false);
      }

      return;
    }

    // Mode template (transaksi baru 6 jenis)
    if (!validateTemplateTransaction()) {
      setShowPreview(false);
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    try {
      setSaving(true);

      const builtEntries = buildEntriesFromTransactionType(transactionType, {
        akunSatuId: templateForm.akunSatuId,
        akunDuaId: templateForm.akunDuaId,
        nominal: templateForm.nominal,
        keterangan: templateForm.keterangan,
        hasRestriction: templateForm.hasRestriction,
        coaList,
      });

      const transactionData = {
        tanggal,
        keterangan: templateForm.keterangan || "",
        referensi,
        entries: builtEntries,
      };

      const backendData = transformJurnalForBackend(transactionData);

      const createdTransaction = await createJurnal(backendData);

      if (isDonationApprovalMode && approvalDonationId) {
        try {
          await axiosInstance.patch(`/donasi/${approvalDonationId}/jurnal-approval`, {
            status: "APPROVED",
            jurnalTransactionId: createdTransaction.id,
          });
          toast.success("Donasi berhasil di-approve dan masuk ke jurnal");
        } catch (approvalError) {
          console.error("Error updating donation approval status:", approvalError);
          toast.error(
            approvalError.response?.data?.message ||
              "Jurnal berhasil dibuat, tapi status approval donasi gagal diperbarui"
          );
          navigate(approvalReturnTo || "/admin/jurnal");
          return;
        }
      } else {
        toast.success("Transaksi jurnal berhasil ditambahkan");
      }

      // Navigate back
      navigate(approvalReturnTo || "/admin/jurnal");
    } catch (error) {
      console.error("Error saving jurnal transaction:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Gagal menyimpan transaksi jurnal"
      );
    } finally {
      setSaving(false);
      setShowPreview(false);
    }
  };

  const handleBack = () => {
    navigate(approvalReturnTo || "/admin/jurnal");
  };

  // Calculate totals
  const totals = entries.reduce(
    (acc, entry) => {
      const jumlah = parseFloat(entry.jumlah) || 0;
      if (entry.tipe === "DEBIT") {
        acc.debit += jumlah;
      } else {
        acc.kredit += jumlah;
      }
      return acc;
    },
    { debit: 0, kredit: 0 }
  );

  const isBalanced = Math.abs(totals.debit - totals.kredit) < 0.01;

  const activeCOA = coaList.filter((coa) => coa.isActive);

  // Filter COA berdasarkan restriction jika hasRestriction dicentang
  // Menggunakan useCallback untuk memastikan re-compute ketika templateForm.hasRestriction berubah
  const filterByRestriction = useCallback((accounts, hasRestriction) => {
    if (hasRestriction) {
      // Jika hasRestriction dicentang, hanya tampilkan akun dengan DENGAN_PEMBATASAN
      return accounts.filter(
        (acc) => acc.restriction === "DENGAN_PEMBATASAN"
      );
    } else {
      // Jika hasRestriction tidak dicentang, hanya tampilkan akun dengan TANPA_PEMBATASAN
      return accounts.filter(
        (acc) => acc.restriction === "TANPA_PEMBATASAN"
      );
    }
  }, []);

  // Helper function untuk filter akun berdasarkan code prefix
  const filterByCodePrefix = useCallback((accounts, prefixes) => {
    return accounts.filter((acc) => {
      if (!acc.kodeAkun) return false;
      // Extract digit pertama dari code (handle format dengan titik atau tanpa titik)
      let firstDigit = '';
      if (acc.kodeAkun.includes('.')) {
        // Format dengan titik: ambil bagian sebelum titik pertama
        firstDigit = acc.kodeAkun.split('.')[0];
      } else {
        // Format tanpa titik: ambil digit pertama
        // Contoh: "111101" -> ambil "1", "211101" -> ambil "2"
        const match = acc.kodeAkun.match(/^(\d+)/);
        if (match) {
          // Ambil hanya digit pertama, bukan semua digit
          firstDigit = acc.kodeAkun.charAt(0);
        }
      }
      // Check jika digit pertama match dengan salah satu prefix
      return prefixes.includes(firstDigit);
    });
  }, []);

  // Helper function untuk filter akun berdasarkan 3 digit pertama (untuk code seperti "113")
  const filterByThreeDigitPrefix = useCallback((accounts, prefixes) => {
    return accounts.filter((acc) => {
      if (!acc.kodeAkun) return false;
      // Extract 3 digit pertama dari code
      let threeDigits = '';
      if (acc.kodeAkun.includes('.')) {
        // Format dengan titik: ambil 3 digit pertama sebelum titik
        const beforeDot = acc.kodeAkun.split('.')[0];
        threeDigits = beforeDot.substring(0, 3);
      } else {
        // Format tanpa titik: ambil 3 digit pertama
        threeDigits = acc.kodeAkun.substring(0, 3);
      }
      // Check jika 3 digit pertama match dengan salah satu prefix
      return prefixes.includes(threeDigits);
    });
  }, []);

  const asetKasBankAccounts = useMemo(
    () => filterByRestriction(getAsetKasBank(activeCOA), templateForm.hasRestriction),
    [activeCOA, templateForm.hasRestriction, filterByRestriction]
  );
  const pendapatanAccounts = useMemo(
    () => filterByRestriction(getPendapatanAccounts(activeCOA), templateForm.hasRestriction),
    [activeCOA, templateForm.hasRestriction, filterByRestriction]
  );
  const bebanAccounts = useMemo(
    () => filterByRestriction(getBebanAccounts(activeCOA), templateForm.hasRestriction),
    [activeCOA, templateForm.hasRestriction, filterByRestriction]
  );
  const hutangAccounts = useMemo(
    () => filterByRestriction(getHutangAccounts(activeCOA), templateForm.hasRestriction),
    [activeCOA, templateForm.hasRestriction, filterByRestriction]
  );
  const piutangAccounts = useMemo(
    () => filterByRestriction(getPiutangAccounts(activeCOA), templateForm.hasRestriction),
    [activeCOA, templateForm.hasRestriction, filterByRestriction]
  );
  const filteredActiveCOA = useMemo(
    () => filterByRestriction(activeCOA, templateForm.hasRestriction),
    [activeCOA, templateForm.hasRestriction, filterByRestriction]
  );

  // Filter untuk HUTANG - akun dengan code dimulai 1 (Aset) dan 5 (Beban) (untuk akunDua)
  const hutangAkunDuaOptions = useMemo(
    () => filterByRestriction(
      filterByCodePrefix(activeCOA, ["1", "5"]),
      templateForm.hasRestriction
    ),
    [activeCOA, templateForm.hasRestriction, filterByRestriction, filterByCodePrefix]
  );

  // Filter untuk PIUTANG - akun dengan code dimulai 1 (aset) dan 4 (pendapatan)
  // Kode 3 (ekuitas/aset neto) tidak dimasukkan karena aset neto otomatis perhitungan sistem
  const piutangAkunSatuOptions = useMemo(
    () => filterByRestriction(
      filterByCodePrefix(activeCOA, ["1", "4"]),
      templateForm.hasRestriction
    ),
    [activeCOA, templateForm.hasRestriction, filterByRestriction, filterByCodePrefix]
  );

  // Filter untuk DIBAYAR_PIUTANG - akun dengan code dimulai 113 (untuk akunSatu)
  const dibayarPiutangAkunSatuOptions = useMemo(
    () => filterByRestriction(
      filterByThreeDigitPrefix(activeCOA, ["113"]),
      templateForm.hasRestriction
    ),
    [activeCOA, templateForm.hasRestriction, filterByRestriction, filterByThreeDigitPrefix]
  );

  // Filter untuk DIBAYAR_PIUTANG - akun dengan code dimulai 1 (aset)
  // Kode 3 (ekuitas/aset neto) tidak dimasukkan karena aset neto otomatis perhitungan sistem
  const dibayarPiutangAkunDuaOptions = useMemo(
    () => filterByRestriction(
      filterByCodePrefix(activeCOA, ["1"]),
      templateForm.hasRestriction
    ),
    [activeCOA, templateForm.hasRestriction, filterByRestriction, filterByCodePrefix]
  );

  const getTemplateConfig = () => {
    switch (transactionType) {
      case "PEMASUKAN":
        return {
          title: "Pemasukan",
          description:
            "Catat pendapatan/infaq/donasi/uang masuk lain. Sistem akan membuat jurnal: DEBIT Kas/Bank, KREDIT Pendapatan.",
          akunSatuLabel: "Sumber Pendapatan",
          akunDuaLabel: "Disimpan ke",
          akunSatuOptions: pendapatanAccounts,
          akunDuaOptions: asetKasBankAccounts,
        };
      case "PENGELUARAN":
        return {
          title: "Pengeluaran",
          description:
            "Catat beban/biaya/penyaluran dana. Sistem akan membuat jurnal: DEBIT Beban, KREDIT Kas/Bank.",
          akunSatuLabel: "Dikeluarkan dari",
          akunDuaLabel: "Untuk Beban",
          akunSatuOptions: asetKasBankAccounts,
          akunDuaOptions: bebanAccounts,
        };
      case "HUTANG":
        return {
          title: "Hutang",
          description:
            "Catat penerimaan barang/jasa yang belum dibayar. Sistem akan membuat jurnal: DEBIT Beban/Aset, KREDIT Hutang.",
          akunSatuLabel: "Akun Hutang",
          akunDuaLabel: "Untuk Beban/Aset",
          akunSatuOptions: hutangAccounts,
          akunDuaOptions: hutangAkunDuaOptions,
        };
      case "BAYAR_HUTANG":
        return {
          title: "Bayar Hutang",
          description:
            "Catat pembayaran hutang yang sudah tercatat. Sistem akan membuat jurnal: DEBIT Hutang, KREDIT Kas/Bank.",
          akunSatuLabel: "Dibayar dari",
          akunDuaLabel: "Bayar Hutang ke",
          akunSatuOptions: asetKasBankAccounts,
          akunDuaOptions: hutangAccounts,
        };
      case "PIUTANG":
        return {
          title: "Piutang",
          description:
            "Catat jasa/fasilitas yang belum dibayar jamaah. Sistem akan membuat jurnal: DEBIT Piutang, KREDIT Pendapatan.",
          akunSatuLabel: "Sumber Pendapatan",
          akunDuaLabel: "Piutang ke",
          akunSatuOptions: piutangAkunSatuOptions, // Hanya pendapatan, aset neto tidak dimasukkan karena otomatis perhitungan sistem
          akunDuaOptions: piutangAccounts,
        };
      case "DIBAYAR_PIUTANG":
        return {
          title: "Dibayar Piutang",
          description:
            "Catat penerimaan pelunasan piutang. Sistem akan membuat jurnal: DEBIT Kas/Bank, KREDIT Piutang.",
          akunSatuLabel: "Terima Piutang dari",
          akunDuaLabel: "Disimpan ke",
          akunSatuOptions: dibayarPiutangAkunSatuOptions, // Hanya akun dengan code dimulai 113
          akunDuaOptions: dibayarPiutangAkunDuaOptions, // Hanya kas/bank, aset neto tidak dimasukkan karena otomatis perhitungan sistem
        };
      default:
        return null;
    }
  };

  const templateConfig = !isEditMode ? getTemplateConfig() : null;

  if (loading) {
    return (
      <TakmirLayout>
        <JurnalFormSkeleton />
      </TakmirLayout>
    );
  }

  return (
    <TakmirLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {isEditMode ? "Edit Jurnal" : "Tambah Jurnal"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditMode
                  ? "Edit transaksi jurnal akuntansi"
                  : "Catat transaksi keuangan dalam jurnal akuntansi"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>

        {isDonationApprovalMode && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Approval donasi siap diproses ke jurnal
                </p>
                <p className="mt-1 text-sm text-emerald-700">
                  Donasi ini dibawa langsung dari halaman takmir agar pencatatan jurnal
                  benar-benar terkait dengan transaksi yang masuk.
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-emerald-800">
                  {approvalCampaignName ? (
                    <span className="rounded-full bg-white px-3 py-1">
                      Campaign: {approvalCampaignName}
                    </span>
                  ) : null}
                  {approvalDonorName ? (
                    <span className="rounded-full bg-white px-3 py-1">
                      Donatur: {approvalDonorName}
                    </span>
                  ) : null}
                  {approvalAmount ? (
                    <span className="rounded-full bg-white px-3 py-1">
                      Nominal: {formatCurrency(parseFloat(approvalAmount) || 0)}
                    </span>
                  ) : null}
                  {referensi ? (
                    <span className="rounded-full bg-white px-3 py-1">
                      Referensi: {referensi}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Informasi Dasar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Informasi Dasar Transaksi
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tanggal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Transaksi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={tanggalInputRef}
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white [&::-webkit-calendar-picker-indicator]:hidden ${
                    errors.tanggal ? "border-red-500" : "border-gray-300"
                  }`}
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-gray-200 bg-white p-1 text-gray-600 shadow-sm hover:text-gray-800 pointer-events-auto z-10"
                  tabIndex={-1}
                >
                  <Calendar className="w-5 h-5" />
                </button>
              </div>
              {errors.tanggal && (
                <p className="mt-1 text-sm text-red-600">{errors.tanggal}</p>
              )}
            </div>

            {/* Jenis Transaksi - hanya untuk mode tambah (template) */}
            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Transaksi <span className="text-red-500">*</span>
                </label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white ${
                    errors.transactionType
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="PEMASUKAN">Pemasukan</option>
                  <option value="PENGELUARAN">Pengeluaran</option>
                  <option value="HUTANG">Hutang</option>
                  <option value="BAYAR_HUTANG">Bayar Hutang</option>
                  <option value="PIUTANG">Piutang</option>
                  <option value="DIBAYAR_PIUTANG">Dibayar Piutang</option>
                </select>
                {errors.transactionType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.transactionType}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Info Box untuk Jenis Transaksi */}
          {!isEditMode && templateConfig && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    {templateConfig.title}
                  </p>
                  <p className="text-sm text-blue-700">
                    {templateConfig.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Detail Transaksi - hanya untuk mode template */}
        {!isEditMode && templateConfig && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Detail Transaksi
              </h3>
            </div>

            {/* Pembatasan - di atas sebelum memilih akun */}
            <div className="mb-6">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={templateForm.hasRestriction}
                    onChange={(e) =>
                      updateTemplateForm("hasRestriction", e.target.checked)
                    }
                    className="w-5 h-5 mt-0.5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800">
                        Dengan Pembatasan dari Pemberi Sumber Daya
                      </span>
                      {templateForm.hasRestriction && (
                        <span className="px-2 py-0.5 text-xs font-semibold text-orange-700 bg-orange-200 rounded">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      Centang jika dana ini memiliki pembatasan penggunaan. 
                      Akun yang ditampilkan akan difilter berdasarkan pilihan ini.
                      (contoh: shodaqoh untuk pembangunan WC)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Akun pertama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {templateConfig.akunSatuLabel}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={templateConfig.akunSatuOptions}
                  value={templateForm.akunSatuId}
                  onChange={(value) =>
                    updateTemplateForm("akunSatuId", value)
                  }
                  placeholder="Pilih akun"
                  searchPlaceholder="Cari akun (kode, nama, atau tipe)..."
                  getOptionLabel={(coa) =>
                    `${coa.kodeAkun} - ${coa.namaAkun} (${coa.tipeAkun})`
                  }
                  getOptionValue={(coa) => coa.id}
                  error={!!errors.akunSatuId}
                />
                {errors.akunSatuId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.akunSatuId}
                  </p>
                )}
              </div>

              {/* Akun kedua */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {templateConfig.akunDuaLabel}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={templateConfig.akunDuaOptions}
                  value={templateForm.akunDuaId}
                  onChange={(value) => updateTemplateForm("akunDuaId", value)}
                  placeholder="Pilih akun"
                  searchPlaceholder="Cari akun (kode, nama, atau tipe)..."
                  getOptionLabel={(coa) =>
                    `${coa.kodeAkun} - ${coa.namaAkun} (${coa.tipeAkun})`
                  }
                  getOptionValue={(coa) => coa.id}
                  error={!!errors.akunDuaId}
                />
                {errors.akunDuaId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.akunDuaId}
                  </p>
                )}
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Nominal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={templateForm.nominal}
                    onChange={(e) =>
                      updateTemplateForm("nominal", e.target.value)
                    }
                    placeholder="0"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white ${
                      errors.nominal ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {templateForm.nominal && !errors.nominal && (
                  <p className="mt-2 text-sm font-medium text-green-600">
                    {formatCurrency(
                      parseFloat(templateForm.nominal) || 0
                    )}
                  </p>
                )}
                {errors.nominal && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.nominal}
                  </p>
                )}
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan Transaksi
                </label>
                <textarea
                  value={templateForm.keterangan}
                  onChange={(e) =>
                    updateTemplateForm("keterangan", e.target.value)
                  }
                  rows={3}
                  placeholder="Masukkan keterangan singkat transaksi..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preview Entries - hanya untuk mode edit */}
        {isEditMode && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Entri Jurnal
              </h3>
            </div>
            
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Entri #{index + 1}
                    </h4>
                    {entries.length > 1 && (
                      <button
                        onClick={() => removeEntry(entry.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Hapus Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Pembatasan - di atas sebelum memilih akun */}
                  <div className="mb-4">
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={entry.hasRestriction}
                          onChange={(e) =>
                            updateEntry(entry.id, "hasRestriction", e.target.checked)
                          }
                          className="w-5 h-5 mt-0.5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-800">
                              Dengan Pembatasan dari Pemberi Sumber Daya
                            </span>
                            {entry.hasRestriction && (
                              <span className="px-2 py-0.5 text-xs font-semibold text-orange-700 bg-orange-200 rounded">
                                Aktif
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">
                            Centang jika dana ini memiliki pembatasan penggunaan. 
                            Akun yang ditampilkan akan difilter berdasarkan pilihan ini.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Akun */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Akun <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    options={
                      entry.hasRestriction
                        ? activeCOA.filter(
                            (coa) => coa.restriction === "DENGAN_PEMBATASAN"
                          )
                        : activeCOA.filter(
                            (coa) => coa.restriction === "TANPA_PEMBATASAN"
                          )
                    }
                    value={entry.akunId}
                    onChange={(value) => updateEntry(entry.id, "akunId", value)}
                    placeholder="Pilih Akun"
                    searchPlaceholder="Cari akun (kode, nama, atau tipe)..."
                    getOptionLabel={(coa) =>
                      `${coa.kodeAkun} - ${coa.namaAkun} (${coa.tipeAkun})`
                    }
                    getOptionValue={(coa) => coa.id}
                    error={!!errors[entry.id]?.akunId}
                  />
                  {errors[entry.id]?.akunId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[entry.id].akunId}
                    </p>
                  )}
                </div>

                {/* Tipe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe <span className="text-red-500">*</span>
                    {entry.akunId && (() => {
                      const selectedAkun = coaList.find((coa) => coa.id === entry.akunId);
                      if (selectedAkun) {
                        const normalBalance = getNormalBalance(selectedAkun);
                        const isNormal = isNormalBalance(selectedAkun, entry.tipe);
                        return (
                          <span className={`ml-2 text-xs font-normal ${isNormal ? "text-green-600" : "text-orange-600"}`}>
                            ({getNormalBalanceLabel(selectedAkun)})
                            {!isNormal && " ⚠️"}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </label>
                  <div className="flex gap-3">
                    <label
                      className={`flex-1 cursor-pointer relative overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                        entry.tipe === "DEBIT"
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        value="DEBIT"
                        checked={entry.tipe === "DEBIT"}
                        onChange={(e) =>
                          updateEntry(entry.id, "tipe", e.target.value)
                        }
                        className="sr-only"
                      />
                      <div className="p-4 flex items-center justify-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            entry.tipe === "DEBIT"
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-400 bg-white"
                          }`}
                        >
                          {entry.tipe === "DEBIT" && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span
                          className={`font-semibold transition-colors ${
                            entry.tipe === "DEBIT"
                              ? "text-blue-700"
                              : "text-gray-600"
                          }`}
                        >
                          Debit
                        </span>
                      </div>
                      {entry.tipe === "DEBIT" && (
                        <>
                          <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-blue-500"></div>
                          <div className="absolute top-1 right-1 text-white text-xs">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        </>
                      )}
                    </label>
                    <label
                      className={`flex-1 cursor-pointer relative overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                        entry.tipe === "KREDIT"
                          ? "border-green-500 bg-green-50 shadow-md"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        value="KREDIT"
                        checked={entry.tipe === "KREDIT"}
                        onChange={(e) =>
                          updateEntry(entry.id, "tipe", e.target.value)
                        }
                        className="sr-only"
                      />
                      <div className="p-4 flex items-center justify-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            entry.tipe === "KREDIT"
                              ? "border-green-600 bg-green-600"
                              : "border-gray-400 bg-white"
                          }`}
                        >
                          {entry.tipe === "KREDIT" && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span
                          className={`font-semibold transition-colors ${
                            entry.tipe === "KREDIT"
                              ? "text-green-700"
                              : "text-gray-600"
                          }`}
                        >
                          Kredit
                        </span>
                      </div>
                      {entry.tipe === "KREDIT" && (
                        <>
                          <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-green-500"></div>
                          <div className="absolute top-1 right-1 text-white text-xs">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                  {/* Warning jika tipe tidak sesuai normal balance */}
                  {entry.akunId && (() => {
                    const selectedAkun = coaList.find((coa) => coa.id === entry.akunId);
                    if (selectedAkun) {
                      const isNormal = isNormalBalance(selectedAkun, entry.tipe);
                      if (!isNormal) {
                        return (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>Peringatan:</strong> Tipe ini tidak sesuai dengan normal balance akun ({getNormalBalanceLabel(selectedAkun)}). 
                                Pastikan ini adalah transaksi yang benar (misalnya pengurangan aset atau reversal).
                              </div>
                            </div>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>

                {/* Jumlah */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={entry.jumlah}
                      onChange={(e) =>
                        updateEntry(entry.id, "jumlah", e.target.value)
                      }
                      placeholder="0"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white ${
                        errors[entry.id]?.jumlah
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  {entry.jumlah && !errors[entry.id]?.jumlah && (
                    <p className="mt-1 text-sm text-gray-500">
                      {formatCurrency(parseFloat(entry.jumlah) || 0)}
                    </p>
                  )}
                  {errors[entry.id]?.jumlah && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[entry.id].jumlah}
                    </p>
                  )}
                </div>

                {/* Keterangan */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keterangan
                  </label>
                  <textarea
                    value={entry.keterangan || ""}
                    onChange={(e) =>
                      updateEntry(entry.id, "keterangan", e.target.value)
                    }
                    rows={2}
                    placeholder="Masukkan keterangan untuk entry ini..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>
              ))}
            </div>

            {/* Add Entry Button */}
            <button
              onClick={addEntry}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-400 bg-white text-gray-800 rounded-lg hover:border-green-600 hover:text-green-700 hover:bg-green-50 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Tambah Entri
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 px-6 py-3 border border-gray-400 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Transaksi
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Preview Jurnal</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <EyeOff className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Total Debit</div>
                    <div className="text-xl font-bold text-blue-600">
                      {formatCurrency(totals.debit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Kredit</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(totals.kredit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Selisih</div>
                    <div
                      className={`text-xl font-bold ${
                        isBalanced ? "text-gray-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(Math.abs(totals.debit - totals.kredit))}
                    </div>
                  </div>
                </div>

                {/* Entries Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tanggal
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Akun
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tipe
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Jumlah
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Pembatasan
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Keterangan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {entries.map((entry, index) => {
                        const account = coaList.find((coa) => coa.id === entry.akunId);
                        return (
                          <tr key={entry.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {new Date(tanggal).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-900">
                                  {account?.kodeAkun || "-"}
                                </span>
                                <br />
                                <span className="text-xs text-gray-500">
                                  {account?.namaAkun || "-"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  entry.tipe === "DEBIT"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {entry.tipe}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                              {formatCurrency(parseFloat(entry.jumlah) || 0)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {entry.hasRestriction ? (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold text-orange-700 bg-orange-100 rounded">
                                  Dengan Pembatasan
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded">
                                  Tanpa Pembatasan
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {entry.keterangan || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Kembali ke Edit
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Konfirmasi & Simpan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TakmirLayout>
  );
};

export default JurnalFormPage;
