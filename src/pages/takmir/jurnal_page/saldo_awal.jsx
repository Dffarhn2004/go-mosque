import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  Pencil,
  Trash2,
} from "lucide-react";

import TakmirLayout from "../../../layouts/takmir_layout";
import { TableSkeleton } from "../../../components/common/Skeleton";
import SearchableSelect from "../../../components/common/SearchableSelect";
import { getAllAccounts } from "../../../services/coaService";
import { createJurnal, getAllJurnals, updateJurnal } from "../../../services/jurnalService";
import { transformAccounts, transformJurnals } from "../../../utils/dataTransform";
import formatCurrency from "../../../utils/formatCurrency";
import {
  SALDO_AWAL_LABEL,
  SALDO_AWAL_REFERENSI,
  SALDO_AWAL_TANGGAL,
  buildOpeningEntries,
  calculateOpeningEquity,
  formatAmountInput,
  getAccountType,
  getChildAccounts,
  getFillableOpeningAccounts,
  getOpeningEquityAccounts,
  getSaldoAwalUiConfig,
  getSectionRoots,
  hasVisibleDescendant,
  isNeracaAccount,
  isRestrictedAccount,
  isSaldoAwalJurnal,
  isTahunBerjalanEquity,
  parseAmount,
  sumDescendantAmounts,
} from "../../../utils/saldoAwal";

const saldoAwalUi = getSaldoAwalUiConfig();

const AmountInput = ({ value, onChange, disabled = false }) => (
  <input
    type="text"
    inputMode="numeric"
    disabled={disabled}
    value={formatAmountInput(value)}
    onChange={(event) => onChange(parseAmount(event.target.value))}
    placeholder="0"
    className={`w-full rounded-lg border px-3 py-2 text-right text-sm tabular-nums focus:border-transparent focus:ring-2 focus:ring-green-500 ${
      disabled
        ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-700"
        : "border-gray-300 bg-white text-gray-900"
    }`}
  />
);

const ModeToggle = ({ value, onChange }) => {
  const options = [
    { id: "all", label: "Semua akun" },
    { id: "one", label: "Per akun" },
  ];

  return (
    <div className="grid max-w-md grid-cols-2 gap-3">
      {options.map((option) => {
        const isActive = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
                : "border-gray-300 bg-white text-gray-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

const AccountTree = ({
  accounts,
  roots,
  amounts,
  onAmountChange,
  readOnlyAmounts = {},
  showInputs = true,
}) => {
  const renderNode = (account, depth = 0) => {
    if (!hasVisibleDescendant(account, accounts)) return null;

    const children = getChildAccounts(accounts, account.id);
    const paddingLeft = 12 + depth * 16;

    if (account.isGroup) {
      const subtotal = sumDescendantAmounts(account, accounts, {
        ...amounts,
        ...readOnlyAmounts,
      });

      return (
        <div key={account.id}>
          <div
            className={`flex items-center justify-between gap-3 border-b border-gray-100 py-2.5 ${
              depth === 0 ? "bg-emerald-50/70 font-bold text-emerald-900" : "font-semibold text-gray-800"
            }`}
            style={{ paddingLeft, paddingRight: 12 }}
          >
            <span className="text-sm">{account.namaAkun}</span>
            {depth > 0 && subtotal > 0 && (
              <span className="text-xs font-medium text-gray-500">
                {formatCurrency(subtotal)}
              </span>
            )}
          </div>
          {children.map((child) => renderNode(child, depth + 1))}
        </div>
      );
    }

    const isEquity = getAccountType(account) === "EQUITY";
    const amount = isEquity
      ? Number(readOnlyAmounts[account.id]) || 0
      : Number(amounts[account.id]) || 0;

    return (
      <div
        key={account.id}
        className="flex items-center justify-between gap-3 border-b border-gray-100 py-2"
        style={{ paddingLeft, paddingRight: 12 }}
      >
        <div className="min-w-0">
          <p className="truncate text-sm text-gray-800">{account.namaAkun}</p>
          <p className="text-[11px] text-gray-400">
            {account.kodeAkun}
            {isRestrictedAccount(account) ? " · Terikat" : ""}
          </p>
        </div>
        <div className="w-36 shrink-0">
          {showInputs && !isEquity ? (
            <AmountInput
              value={amount}
              onChange={(nextValue) => onAmountChange(account.id, nextValue)}
            />
          ) : (
            <AmountInput value={amount} onChange={() => {}} disabled />
          )}
        </div>
      </div>
    );
  };

  return <div>{roots.map((account) => renderNode(account))}</div>;
};

const AllAccountsWorksheet = ({
  assetAccounts,
  liabilityAccounts,
  equityAccounts,
  amounts,
  equityDisplayAmounts,
  totalAset,
  totalKewajiban,
  totalAsetNeto,
  totalKanan,
  onAmountChange,
}) => (
  <div className="grid items-start gap-6 lg:grid-cols-2">
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-3">
        <h2 className="font-semibold text-emerald-900">Aset</h2>
        <p className="text-xs text-emerald-700">Isi saldo masing-masing akun aset</p>
      </div>
      <AccountTree
        accounts={assetAccounts}
        roots={getSectionRoots(assetAccounts, "ASSET")}
        amounts={amounts}
        onAmountChange={onAmountChange}
      />
      <div className="flex items-center justify-between bg-emerald-700 px-4 py-3 text-white">
        <span className="text-sm font-semibold">Total Aset</span>
        <span className="text-lg font-bold">{formatCurrency(totalAset)}</span>
      </div>
    </section>

    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-amber-100 bg-amber-50 px-4 py-3">
        <h2 className="font-semibold text-amber-900">Kewajiban & Aset Neto</h2>
        <p className="text-xs text-amber-800">
          Hutang diisi manual, aset neto menyesuaikan otomatis
        </p>
      </div>
      <AccountTree
        accounts={liabilityAccounts}
        roots={getSectionRoots(liabilityAccounts, "LIABILITY")}
        amounts={amounts}
        onAmountChange={onAmountChange}
      />
      <AccountTree
        accounts={equityAccounts}
        roots={getSectionRoots(equityAccounts, "EQUITY")}
        amounts={{}}
        readOnlyAmounts={equityDisplayAmounts}
        onAmountChange={() => {}}
        showInputs={false}
      />
      <div className="space-y-2 bg-amber-800 px-4 py-3 text-white">
        <div className="flex items-center justify-between text-sm">
          <span>Total Kewajiban</span>
          <span>{formatCurrency(totalKewajiban)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Total Aset Neto</span>
          <span>{formatCurrency(totalAsetNeto)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-white/20 pt-2">
          <span className="font-semibold">Total Kanan</span>
          <span className="text-lg font-bold">{formatCurrency(totalKanan)}</span>
        </div>
      </div>
    </section>
  </div>
);

const PerAccountPanel = ({
  fillableAccounts,
  amounts,
  equity,
  equityLeaves,
  selectedId,
  draftAmount,
  saving,
  onSelect,
  onDraftChange,
  onSaveOne,
  onSkip,
  onEditFilled,
  onRemoveFilled,
}) => {
  const selectedAccount = fillableAccounts.find((account) => account.id === selectedId);
  const filledAccounts = fillableAccounts.filter(
    (account) => Number(amounts[account.id]) > 0
  );
  const remainingCount = fillableAccounts.length - filledAccounts.length;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Tambah per akun</h2>
        <p className="mt-1 text-sm text-gray-600">
          Pilih satu akun, isi nominalnya, lalu lanjut ke akun berikutnya.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Akun
            </label>
            <SearchableSelect
              options={fillableAccounts}
              value={selectedId}
              onChange={onSelect}
              placeholder="Pilih akun"
              searchPlaceholder="Cari nama atau kode akun..."
              getOptionLabel={(account) =>
                `${account.kodeAkun} - ${account.namaAkun}`
              }
              getOptionValue={(account) => account.id}
            />
            {selectedAccount && (
              <p className="mt-2 text-xs text-gray-500">
                {getAccountType(selectedAccount) === "ASSET" ? "Aset" : "Kewajiban"}
                {isRestrictedAccount(selectedAccount) ? " · Dana terikat" : ""}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nominal
            </label>
            <AmountInput value={draftAmount} onChange={onDraftChange} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onSaveOne}
              disabled={saving || !selectedId || !draftAmount}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Menyimpan..." : "Simpan & lanjut"}
            </button>
            <button
              type="button"
              onClick={onSkip}
              disabled={!selectedId}
              className="rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Lewati
            </button>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-gray-800">Sudah diisi</h3>
            <span className="text-xs text-gray-500">
              {filledAccounts.length} akun · {remainingCount} belum
            </span>
          </div>
          {filledAccounts.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada akun yang diisi.</p>
          ) : (
            <div className="space-y-2">
              {filledAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {account.namaAkun}
                    </p>
                    <p className="text-xs text-gray-500">{account.kodeAkun}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(amounts[account.id])}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEditFilled(account.id)}
                      className="rounded p-1 text-blue-600 hover:bg-blue-50"
                      title="Ubah"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveFilled(account.id)}
                      className="rounded p-1 text-red-600 hover:bg-red-50"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-semibold text-amber-900">Aset neto otomatis</h3>
          <div className="mt-3 space-y-2 text-sm text-amber-950">
            <div className="flex items-center justify-between gap-3">
              <span>{equityLeaves.unrestricted?.namaAkun || "Tanpa pembatasan"}</span>
              <span className="font-semibold">
                {formatCurrency(equity.unrestricted)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>{equityLeaves.restricted?.namaAkun || "Dengan pembatasan"}</span>
              <span className="font-semibold">
                {formatCurrency(equity.restricted)}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const SaldoAwalPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [existingJurnal, setExistingJurnal] = useState(null);
  const [amounts, setAmounts] = useState({});
  const [inputMode, setInputMode] = useState(saldoAwalUi.initialInput);
  const [selectedId, setSelectedId] = useState("");
  const [draftAmount, setDraftAmount] = useState(0);

  const fillableAccounts = useMemo(
    () => getFillableOpeningAccounts(accounts),
    [accounts]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [rawAccounts, rawJurnals] = await Promise.all([
          getAllAccounts({ includeInactive: false }),
          getAllJurnals({}),
        ]);

        const allAccounts = transformAccounts(rawAccounts).filter(isNeracaAccount);
        const openingJurnal = transformJurnals(rawJurnals).find(isSaldoAwalJurnal);

        setAccounts(allAccounts);

        if (openingJurnal) {
          setExistingJurnal(openingJurnal);

          const nextAmounts = {};
          (openingJurnal.entries || []).forEach((entry) => {
            const account = allAccounts.find((item) => item.id === entry.akunId);
            if (!account || getAccountType(account) === "EQUITY") return;
            nextAmounts[entry.akunId] = Number(entry.jumlah) || 0;
          });
          setAmounts(nextAmounts);
        }
      } catch (error) {
        console.error("Error loading saldo awal:", error);
        toast.error(error.response?.data?.message || "Gagal memuat data saldo awal");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!fillableAccounts.length) return;
    if (selectedId && fillableAccounts.some((account) => account.id === selectedId)) {
      return;
    }

    const firstEmpty = fillableAccounts.find(
      (account) => !Number(amounts[account.id])
    );
    setSelectedId((firstEmpty || fillableAccounts[0]).id);
  }, [fillableAccounts, amounts, selectedId]);

  useEffect(() => {
    setDraftAmount(Number(amounts[selectedId]) || 0);
  }, [selectedId, amounts]);

  const assetAccounts = useMemo(
    () => accounts.filter((account) => getAccountType(account) === "ASSET"),
    [accounts]
  );
  const liabilityAccounts = useMemo(
    () => accounts.filter((account) => getAccountType(account) === "LIABILITY"),
    [accounts]
  );
  const equityAccounts = useMemo(
    () =>
      accounts.filter(
        (account) =>
          getAccountType(account) === "EQUITY" &&
          (account.isGroup || !isTahunBerjalanEquity(account))
      ),
    [accounts]
  );

  const equityLeaves = useMemo(
    () => getOpeningEquityAccounts(accounts),
    [accounts]
  );

  const equity = useMemo(
    () => calculateOpeningEquity(assetAccounts, liabilityAccounts, amounts),
    [assetAccounts, liabilityAccounts, amounts]
  );

  const equityDisplayAmounts = useMemo(() => {
    const values = {};
    if (equityLeaves.unrestricted && equityLeaves.restricted) {
      values[equityLeaves.unrestricted.id] = equity.unrestricted;
      values[equityLeaves.restricted.id] = equity.restricted;
    } else {
      const fallback = equityLeaves.unrestricted || equityLeaves.restricted;
      if (fallback) {
        values[fallback.id] = equity.unrestricted + equity.restricted;
      }
    }
    return values;
  }, [equity, equityLeaves]);

  const totalAset = useMemo(
    () =>
      assetAccounts
        .filter((account) => !account.isGroup)
        .reduce((total, account) => total + (Number(amounts[account.id]) || 0), 0),
    [assetAccounts, amounts]
  );

  const totalKewajiban = useMemo(
    () =>
      liabilityAccounts
        .filter((account) => !account.isGroup)
        .reduce((total, account) => total + (Number(amounts[account.id]) || 0), 0),
    [liabilityAccounts, amounts]
  );

  const totalAsetNeto = equity.unrestricted + equity.restricted;
  const totalKanan = totalKewajiban + totalAsetNeto;
  const selisih = Math.abs(totalAset - totalKanan);
  const isBalanced = selisih < 0.01;
  const hasAmount = totalAset > 0 || totalKewajiban > 0;
  const showAllAccounts = inputMode === "all";

  const persistAmounts = async (nextAmounts, { silent = false } = {}) => {
    const nextEquity = calculateOpeningEquity(
      assetAccounts,
      liabilityAccounts,
      nextAmounts
    );
    const nextTotalAset = assetAccounts
      .filter((account) => !account.isGroup)
      .reduce((total, account) => total + (Number(nextAmounts[account.id]) || 0), 0);
    const nextTotalKewajiban = liabilityAccounts
      .filter((account) => !account.isGroup)
      .reduce((total, account) => total + (Number(nextAmounts[account.id]) || 0), 0);

    if (nextTotalAset <= 0 && nextTotalKewajiban <= 0) {
      if (!silent) toast.error("Isi minimal satu akun aset atau kewajiban.");
      return false;
    }

    if (Math.abs(nextTotalAset - (nextTotalKewajiban + nextEquity.unrestricted + nextEquity.restricted)) >= 0.01) {
      if (!silent) toast.error("Total aset belum sama dengan kewajiban + aset neto.");
      return false;
    }

    if (!equityLeaves.unrestricted && !equityLeaves.restricted) {
      if (!silent) toast.error("Akun aset neto tahun lalu tidak ditemukan di COA.");
      return false;
    }

    const entries = buildOpeningEntries({
      amounts: nextAmounts,
      assetAccounts,
      liabilityAccounts,
      equity: nextEquity,
      equityAccounts: equityLeaves,
    });

    if (entries.length < 1) {
      if (!silent) toast.error("Tidak ada baris jurnal yang bisa disimpan.");
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        tanggal: SALDO_AWAL_TANGGAL,
        keterangan: SALDO_AWAL_LABEL,
        referensi: SALDO_AWAL_REFERENSI,
        entries,
      };

      if (existingJurnal?.id) {
        await updateJurnal(existingJurnal.id, payload);
        if (!silent) toast.success("Saldo awal berhasil disimpan");
      } else {
        const created = await createJurnal(payload);
        setExistingJurnal(created);
        if (!silent) toast.success("Saldo awal berhasil disimpan");
      }
      return true;
    } catch (error) {
      console.error("Error saving saldo awal:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan saldo awal");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleAmountChange = (accountId, value) => {
    setAmounts((prev) => ({
      ...prev,
      [accountId]: value,
    }));
  };

  const selectNextAccount = (fromId, nextAmounts) => {
    const currentIndex = fillableAccounts.findIndex((account) => account.id === fromId);
    const rotated = [
      ...fillableAccounts.slice(currentIndex + 1),
      ...fillableAccounts.slice(0, currentIndex + 1),
    ];
    const nextEmpty = rotated.find((account) => !Number(nextAmounts[account.id]));
    if (nextEmpty) setSelectedId(nextEmpty.id);
  };

  const handleSaveOne = async () => {
    if (!selectedId || !draftAmount) {
      toast.error("Pilih akun dan isi nominal.");
      return;
    }

    const nextAmounts = {
      ...amounts,
      [selectedId]: draftAmount,
    };
    setAmounts(nextAmounts);
    const saved = await persistAmounts(nextAmounts);
    if (saved) selectNextAccount(selectedId, nextAmounts);
  };

  const handleSkip = () => {
    selectNextAccount(selectedId, amounts);
  };

  const handleRemoveFilled = async (accountId) => {
    const nextAmounts = { ...amounts, [accountId]: 0 };
    setAmounts(nextAmounts);
    setSelectedId(accountId);
    if (existingJurnal?.id) {
      await persistAmounts(nextAmounts, { silent: true });
    }
  };

  const handleSave = async () => {
    await persistAmounts(amounts);
  };

  return (
    <TakmirLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/jurnal")}
              className="mb-3 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke jurnal
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Saldo Awal</h1>
            <p className="mt-1 text-gray-600">
              Jabarkan posisi keuangan masjid sebelum transaksi pertama dicatat di GoQu.
              Aset neto dihitung otomatis agar neraca seimbang.
            </p>
          </div>
        </div>

        {saldoAwalUi.isDual && (
          <ModeToggle value={inputMode} onChange={setInputMode} />
        )}

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <TableSkeleton rows={10} cols={2} />
            <TableSkeleton rows={10} cols={2} />
          </div>
        ) : showAllAccounts ? (
          <>
            <AllAccountsWorksheet
              assetAccounts={assetAccounts}
              liabilityAccounts={liabilityAccounts}
              equityAccounts={equityAccounts}
              amounts={amounts}
              equityDisplayAmounts={equityDisplayAmounts}
              totalAset={totalAset}
              totalKewajiban={totalKewajiban}
              totalAsetNeto={totalAsetNeto}
              totalKanan={totalKanan}
              onAmountChange={handleAmountChange}
            />

            <div className="sticky bottom-4 z-10 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total kiri</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(totalAset)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total kanan</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(totalKanan)}</p>
                  </div>
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                      isBalanced
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {isBalanced ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {isBalanced ? "Seimbang" : `Selisih ${formatCurrency(selisih)}`}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !isBalanced || !hasAmount}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving
                    ? "Menyimpan..."
                    : existingJurnal
                      ? "Perbarui saldo awal"
                      : "Simpan saldo awal"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <PerAccountPanel
            fillableAccounts={fillableAccounts}
            amounts={amounts}
            equity={equity}
            equityLeaves={equityLeaves}
            selectedId={selectedId}
            draftAmount={draftAmount}
            saving={saving}
            onSelect={setSelectedId}
            onDraftChange={setDraftAmount}
            onSaveOne={handleSaveOne}
            onSkip={handleSkip}
            onEditFilled={(accountId) => setSelectedId(accountId)}
            onRemoveFilled={handleRemoveFilled}
          />
        )}
      </div>
    </TakmirLayout>
  );
};

export default SaldoAwalPage;
