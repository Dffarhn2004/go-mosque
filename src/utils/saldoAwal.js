export const SALDO_AWAL_REFERENSI = "SALDO_AWAL";
export const SALDO_AWAL_TANGGAL = "1970-01-02";
export const LEGACY_SALDO_AWAL_TANGGAL = "1000-10-10";
export const SALDO_AWAL_LABEL = "Saldo Awal";

export const getJurnalTanggalKey = (tanggal) => {
  if (!tanggal) return "";

  if (typeof tanggal === "string" && tanggal.includes("T")) {
    return tanggal.split("T")[0];
  }

  if (typeof tanggal === "string" && /^\d{4}-\d{2}-\d{2}/.test(tanggal)) {
    return tanggal.slice(0, 10);
  }

  const date = new Date(tanggal);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

export const isSaldoAwalTanggal = (tanggal) => {
  const key = getJurnalTanggalKey(tanggal);
  return key === SALDO_AWAL_TANGGAL || key === LEGACY_SALDO_AWAL_TANGGAL;
};

export const isSaldoAwalJurnal = (jurnal) =>
  jurnal?.referensi === SALDO_AWAL_REFERENSI ||
  isSaldoAwalTanggal(jurnal?.tanggal || jurnal?.transactionTanggal);

export const formatJurnalTanggalLabel = (
  tanggal,
  options = { day: "2-digit", month: "short", year: "numeric" }
) => {
  if (isSaldoAwalTanggal(tanggal)) return SALDO_AWAL_LABEL;

  const date = new Date(tanggal);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", options);
};

export const getAccountType = (account) => {
  const type = (account?.tipeAkun || account?.type || "").toUpperCase();

  if (type === "ASET" || type === "ASSET") return "ASSET";
  if (type === "KEWAJIBAN" || type === "LIABILITY") return "LIABILITY";
  if (type === "EKUITAS" || type === "EQUITY") return "EQUITY";
  if (type === "PENDAPATAN" || type === "REVENUE") return "REVENUE";
  if (type === "BEBAN" || type === "EXPENSE") return "EXPENSE";

  return type;
};

export const isRestrictedAccount = (account) =>
  account?.restriction === "DENGAN_PEMBATASAN";

export const isTahunBerjalanEquity = (account) => {
  if (getAccountType(account) !== "EQUITY") return false;

  const code = String(account?.kodeAkun || account?.code || "");
  const name = String(account?.namaAkun || account?.name || "").toLowerCase();

  return (
    code === "312101" ||
    code === "322101" ||
    name.includes("tahun berjalan")
  );
};

export const isNeracaAccount = (account) => {
  const type = getAccountType(account);
  return type === "ASSET" || type === "LIABILITY" || type === "EQUITY";
};

export const parseAmount = (value) => {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Number(digits);
};

export const formatAmountInput = (value) => {
  const amount = Number(value) || 0;
  if (amount === 0) return "";
  return new Intl.NumberFormat("id-ID").format(amount);
};

export const sortAccounts = (accounts = []) =>
  [...accounts].sort((a, b) =>
    String(a.pathCode || a.kodeAkun || "").localeCompare(
      String(b.pathCode || b.kodeAkun || ""),
      "id",
      { numeric: true }
    )
  );

export const getChildAccounts = (accounts, parentId) =>
  sortAccounts(accounts.filter((account) => account.parentId === parentId));

export const getRootAccounts = (accounts, type) =>
  sortAccounts(
    accounts.filter((account) => {
      if (getAccountType(account) !== type) return false;

      const parent = accounts.find((item) => item.id === account.parentId);
      return !parent || getAccountType(parent) !== type;
    })
  );

export const getSectionRoots = (accounts, type) => {
  const roots = getRootAccounts(accounts, type);

  if (roots.length === 1 && roots[0].isGroup) {
    return getChildAccounts(accounts, roots[0].id);
  }

  return roots;
};

export const hasVisibleDescendant = (account, accounts) => {
  if (!account.isGroup) {
    return getAccountType(account) !== "EQUITY" || !isTahunBerjalanEquity(account);
  }

  return getChildAccounts(accounts, account.id).some((child) =>
    hasVisibleDescendant(child, accounts)
  );
};

export const sumDescendantAmounts = (account, accounts, amounts) => {
  if (!account.isGroup) {
    return Number(amounts[account.id]) || 0;
  }

  return getChildAccounts(accounts, account.id).reduce(
    (total, child) => total + sumDescendantAmounts(child, accounts, amounts),
    0
  );
};

export const getOpeningEquityAccounts = (accounts = []) => {
  const equityLeaves = accounts.filter(
    (account) =>
      !account.isGroup &&
      getAccountType(account) === "EQUITY" &&
      !isTahunBerjalanEquity(account)
  );

  return {
    unrestricted:
      equityLeaves.find((account) => !isRestrictedAccount(account)) || null,
    restricted:
      equityLeaves.find((account) => isRestrictedAccount(account)) || null,
  };
};

export const sumLeafAmounts = (accounts = [], amounts = {}) =>
  accounts
    .filter((account) => !account.isGroup)
    .reduce((total, account) => total + (Number(amounts[account.id]) || 0), 0);

export const buildOpeningEntries = ({
  amounts,
  assetAccounts,
  liabilityAccounts,
  equityAccounts,
}) => {
  const entries = [];

  const pushEntry = (account, amount, tipe) => {
    const jumlah = Math.abs(Number(amount) || 0);
    if (!account || jumlah <= 0) return;

    entries.push({
      akunId: account.id,
      tipe,
      jumlah,
      hasRestriction: isRestrictedAccount(account),
      keterangan: "",
    });
  };

  assetAccounts
    .filter((account) => !account.isGroup)
    .forEach((account) => {
      pushEntry(account, amounts[account.id], "DEBIT");
    });

  liabilityAccounts
    .filter((account) => !account.isGroup)
    .forEach((account) => {
      pushEntry(account, amounts[account.id], "KREDIT");
    });

  equityAccounts
    .filter((account) => !account.isGroup && !isTahunBerjalanEquity(account))
    .forEach((account) => {
      pushEntry(account, amounts[account.id], "KREDIT");
    });

  return entries;
};

export const getFillableOpeningAccounts = (accounts = []) =>
  sortAccounts(
    accounts.filter((account) => {
      if (account.isGroup) return false;

      const type = getAccountType(account);
      if (type === "ASSET" || type === "LIABILITY") return true;
      return type === "EQUITY" && !isTahunBerjalanEquity(account);
    })
  );

export const getSaldoAwalUiConfig = () => {
  const mode = String(import.meta.env.VITE_SALDO_AWAL_MODE || "dual")
    .toLowerCase()
    .trim();

  if (mode === "direct") {
    return { isDual: false, initialInput: "all" };
  }

  if (mode === "one") {
    return { isDual: false, initialInput: "one" };
  }

  return { isDual: true, initialInput: "all" };
};
