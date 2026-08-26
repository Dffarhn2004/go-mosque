import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";

import TakmirLayout from "../../../layouts/takmir_layout";
import { TableSkeleton } from "../../../components/common/Skeleton";
import { getAllAccounts } from "../../../services/coaService";
import { createJurnal, getAllJurnals, updateJurnal } from "../../../services/jurnalService";
import { transformAccounts, transformJurnals } from "../../../utils/dataTransform";
import formatCurrency from "../../../utils/formatCurrency";
import {
  LEGACY_SALDO_AWAL_TANGGAL,
  SALDO_AWAL_LABEL,
  SALDO_AWAL_REFERENSI,
  SALDO_AWAL_TANGGAL,
  buildOpeningEntries,
  formatAmountInput,
  getAccountType,
  getChildAccounts,
  getJurnalTanggalKey,
  getOpeningEquityAccounts,
  getSectionRoots,
  hasVisibleDescendant,
  isNeracaAccount,
  isRestrictedAccount,
  isSaldoAwalJurnal,
  isTahunBerjalanEquity,
  parseAmount,
  sumDescendantAmounts,
  sumLeafAmounts,
} from "../../../utils/saldoAwal";

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

const AccountTree = ({
  accounts,
  roots,
  amounts,
  onAmountChange,
}) => {
  const renderNode = (account, depth = 0) => {
    if (!hasVisibleDescendant(account, accounts)) return null;

    const children = getChildAccounts(accounts, account.id);
    const paddingLeft = 12 + depth * 16;

    if (account.isGroup) {
      const subtotal = sumDescendantAmounts(account, accounts, amounts);

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

    const amount = Number(amounts[account.id]) || 0;

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
          <AmountInput
            value={amount}
            onChange={(nextValue) => onAmountChange(account.id, nextValue)}
          />
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
          Isi saldo kewajiban dan aset neto secara manual
        </p>
      </div>
      <AccountTree
        accounts={liabilityAccounts}
        roots={getSectionRoots(liabilityAccounts, "LIABILITY")}
        amounts={amounts}
        onAmountChange={onAmountChange}
      />
      <div className="flex items-center justify-between border-y border-amber-200 bg-amber-100 px-4 py-2.5 font-semibold text-amber-950">
        <span className="text-sm">Total Kewajiban</span>
        <span className="text-sm tabular-nums">{formatCurrency(totalKewajiban)}</span>
      </div>
      <AccountTree
        accounts={equityAccounts}
        roots={getSectionRoots(equityAccounts, "EQUITY")}
        amounts={amounts}
        onAmountChange={onAmountChange}
      />
      <div className="space-y-2 bg-amber-800 px-4 py-3 text-white">
        <div className="flex items-center justify-between text-sm">
          <span>Total Aset Neto</span>
          <span>{formatCurrency(totalAsetNeto)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-white/20 pt-2">
          <span className="font-semibold">Total Kewajiban dan Aset Neto</span>
          <span className="text-lg font-bold">{formatCurrency(totalKanan)}</span>
        </div>
      </div>
    </section>
  </div>
);

const SaldoAwalPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [existingJurnal, setExistingJurnal] = useState(null);
  const [amounts, setAmounts] = useState({});

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
            if (!account) return;
            if (getAccountType(account) === "EQUITY" && isTahunBerjalanEquity(account)) {
              return;
            }
            nextAmounts[entry.akunId] = Number(entry.jumlah) || 0;
          });
          setAmounts(nextAmounts);

          if (getJurnalTanggalKey(openingJurnal.tanggal) === LEGACY_SALDO_AWAL_TANGGAL) {
            try {
              await updateJurnal(openingJurnal.id, { tanggal: SALDO_AWAL_TANGGAL });
            } catch (error) {
              console.error("Gagal menyesuaikan tanggal saldo awal lama:", error);
            }
          }
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

  const totalAset = useMemo(
    () => sumLeafAmounts(assetAccounts, amounts),
    [assetAccounts, amounts]
  );
  const totalKewajiban = useMemo(
    () => sumLeafAmounts(liabilityAccounts, amounts),
    [liabilityAccounts, amounts]
  );
  const totalAsetNeto = useMemo(
    () => sumLeafAmounts(equityAccounts, amounts),
    [equityAccounts, amounts]
  );

  const totalKanan = totalKewajiban + totalAsetNeto;
  const selisih = Math.abs(totalAset - totalKanan);
  const isBalanced = selisih < 0.01;
  const hasAmount = totalAset > 0 || totalKewajiban > 0 || totalAsetNeto > 0;
  const unbalanceMessage =
    "Total aset belum sama dengan total kewajiban + aset neto. Saldo awal belum bisa disimpan.";

  const persistAmounts = async (nextAmounts, { silent = false } = {}) => {
    const nextTotalAset = sumLeafAmounts(assetAccounts, nextAmounts);
    const nextTotalKewajiban = sumLeafAmounts(liabilityAccounts, nextAmounts);
    const nextTotalAsetNeto = sumLeafAmounts(equityAccounts, nextAmounts);

    if (nextTotalAset <= 0 && nextTotalKewajiban <= 0 && nextTotalAsetNeto <= 0) {
      if (!silent) toast.error("Isi minimal satu akun aset, kewajiban, atau aset neto.");
      return false;
    }

    if (Math.abs(nextTotalAset - (nextTotalKewajiban + nextTotalAsetNeto)) >= 0.01) {
      if (!silent) toast.error(unbalanceMessage);
      return false;
    }

    if (!equityLeaves.unrestricted && !equityLeaves.restricted) {
      if (!silent) toast.error("Akun aset neto periode lalu tidak ditemukan di COA.");
      return false;
    }

    const entries = buildOpeningEntries({
      amounts: nextAmounts,
      assetAccounts,
      liabilityAccounts,
      equityAccounts,
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

  const handleSave = async () => {
    if (!isBalanced) {
      toast.error(unbalanceMessage);
      return;
    }
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
              Pastikan total aset sama dengan total kewajiban + aset neto.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <TableSkeleton rows={10} cols={2} />
            <TableSkeleton rows={10} cols={2} />
          </div>
        ) : (
          <AllAccountsWorksheet
            assetAccounts={assetAccounts}
            liabilityAccounts={liabilityAccounts}
            equityAccounts={equityAccounts}
            amounts={amounts}
            totalAset={totalAset}
            totalKewajiban={totalKewajiban}
            totalAsetNeto={totalAsetNeto}
            totalKanan={totalKanan}
            onAmountChange={handleAmountChange}
          />
        )}

        {!loading && (
          <div className="sticky bottom-4 z-10 space-y-3 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            {!isBalanced && hasAmount && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  {unbalanceMessage} Selisih {formatCurrency(selisih)}.
                </p>
              </div>
            )}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total Aset</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(totalAset)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Kewajiban dan Aset Neto</p>
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
        )}
      </div>
    </TakmirLayout>
  );
};

export default SaldoAwalPage;
