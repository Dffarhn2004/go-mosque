// Cache untuk transform account
const accountTransformCache = new Map();

/**
 * Clear transform cache
 * Call this when accounts are updated to ensure fresh data
 */
export const clearTransformCache = () => {
  accountTransformCache.clear();
};

/**
 * Transform backend account format to frontend format (with caching)
 * @param {Object} account - Backend account object
 * @returns {Object} Frontend account object
 */
export const transformAccount = (account) => {
  if (!account) return null;

  // Check cache first
  if (accountTransformCache.has(account.id)) {
    return accountTransformCache.get(account.id);
  }

  // Map type from backend to frontend
  const typeMap = {
    ASSET: "ASET",
    LIABILITY: "KEWAJIBAN",
    EQUITY: "EKUITAS",
    REVENUE: "PENDAPATAN",
    EXPENSE: "BEBAN",
  };

  // Get kategori from parent name or use default
  const kategori = account.parent?.name || "Lainnya";

  const transformed = {
    id: account.id,
    masjidId: account.masjidId,
    kodeAkun: account.code,
    namaAkun: account.name,
    tipeAkun: typeMap[account.type] || account.type, // Frontend format (ASET, KEWAJIBAN, dll)
    type: account.type, // Backend format (ASSET, LIABILITY, dll) - untuk normal balance
    normalBalance: account.normalBalance || null, // Normal balance (DEBIT/KREDIT)
    restriction: account.restriction || null, // TANPA_PEMBATASAN atau DENGAN_PEMBATASAN
    report: account.report || null, // NERACA atau LAPORAN_PENGHASILAN_KOMPREHENSIF
    category: account.category || null, // Kategori akun
    kategori: kategori,
    isGroup: account.isGroup,
    pathCode: account.pathCode,
    isActive: account.isActive,
    parentId: account.parentId,
    parent: account.parent ? transformAccount(account.parent) : null,
    children: account.children
      ? account.children.map((child) => transformAccount(child))
      : [],
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };

  // Cache the result
  accountTransformCache.set(account.id, transformed);
  return transformed;
};

/**
 * Transform array of accounts
 * @param {Array} accounts - Array of backend account objects
 * @returns {Array} Array of frontend account objects
 */
export const transformAccounts = (accounts) => {
  if (!Array.isArray(accounts)) return [];
  return accounts.map((account) => transformAccount(account));
};

/**
 * Get display name for account with parent context
 * Untuk akun ekuitas yang memiliki nama sama, tambahkan parent name untuk membedakan
 * @param {Object} account - Account object (frontend format)
 * @returns {string} Display name dengan parent context jika diperlukan
 */
export const getAccountDisplayName = (account) => {
  if (!account) return "";
  
  // Untuk akun ekuitas yang memiliki nama sama (Aset Neto Tahun Lalu/Tahun Berjalan)
  // Tambahkan parent name untuk membedakan
  if (account.type === "EQUITY" && account.parent) {
    const parentName = account.parent.name;
    // Cek jika parent adalah "Tanpa Pembatasan" atau "Dengan Pembatasan"
    if (parentName.includes("Pembatasan")) {
      // Ambil kata kunci dari parent (Tanpa/Dengan)
      const pembatasanType = parentName.includes("Tanpa") ? "Tanpa Pembatasan" : "Dengan Pembatasan";
      return `${account.namaAkun} (${pembatasanType})`;
    }
  }
  
  return account.namaAkun;
};

/**
 * Get full display string for account (kode + nama dengan context)
 * @param {Object} account - Account object (frontend format)
 * @param {Object} options - Options { showType: boolean }
 * @returns {string} Full display string
 */
export const getAccountDisplayString = (account, options = {}) => {
  if (!account) return "";
  
  const { showType = false } = options;
  const displayName = getAccountDisplayName(account);
  const typeStr = showType ? ` (${account.tipeAkun})` : "";
  
  return `${account.kodeAkun} - ${displayName}${typeStr}`;
};

/**
 * Transform backend jurnal entry format to frontend format
 * @param {Object} entry - Backend jurnal entry object
 * @returns {Object} Frontend jurnal entry object
 */
export const transformJurnalEntry = (entry) => {
  if (!entry) return null;

  return {
    id: entry.id,
    akunId: entry.akunId,
    akun: entry.akun ? transformAccount(entry.akun) : null,
    tipe: entry.tipe, // DEBIT or KREDIT
    jumlah: typeof entry.jumlah === "string"
      ? parseFloat(entry.jumlah)
      : entry.jumlah,
    hasRestriction: entry.hasRestriction || false,
    keterangan: entry.keterangan || "",
    createdAt: entry.createdAt,
  };
};

/**
 * Transform backend jurnal transaction format to frontend format
 * @param {Object} transaction - Backend jurnal transaction object
 * @returns {Object} Frontend jurnal transaction object
 */
export const transformJurnal = (transaction) => {
  if (!transaction) return null;

  return {
    id: transaction.id,
    masjidId: transaction.masjidId,
    tanggal: transaction.tanggal,
    keterangan: transaction.keterangan,
    referensi: transaction.referensi,
    entries: transaction.entries
      ? transaction.entries.map((entry) => transformJurnalEntry(entry))
      : [],
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
};

/**
 * Transform array of jurnal transactions
 * @param {Array} transactions - Array of backend jurnal transaction objects
 * @returns {Array} Array of frontend jurnal transaction objects
 */
export const transformJurnals = (transactions) => {
  if (!Array.isArray(transactions)) return [];
  return transactions.map((transaction) => transformJurnal(transaction));
};

/**
 * Transform account data for create/update (frontend to backend)
 * @param {Object} accountData - Frontend account data
 * @returns {Object} Backend account data
 */
export const transformAccountForBackend = (accountData) => {
  // Map type from frontend to backend
  const typeMap = {
    ASET: "ASSET",
    KEWAJIBAN: "LIABILITY",
    EKUITAS: "EQUITY",
    PENDAPATAN: "REVENUE",
    BEBAN: "EXPENSE",
  };

  return {
    code: accountData.kodeAkun || accountData.code,
    name: accountData.namaAkun || accountData.name,
    parentId: accountData.parentId || null,
    type: typeMap[accountData.tipeAkun] || accountData.type,
    isGroup: false, // Always false - hanya bisa create non-group account
    masjidId: accountData.masjidId || null,
    restriction: accountData.restriction || null,
    report: accountData.report || null,
    category: accountData.category || accountData.kategori || null,
    isActive: accountData.isActive !== undefined ? accountData.isActive : true,
  };
};

/**
 * Transform jurnal transaction data for create/update (frontend to backend)
 * @param {Object} transactionData - Frontend jurnal transaction data
 * @returns {Object} Backend jurnal transaction data
 */
export const transformJurnalForBackend = (transactionData) => {
  return {
    tanggal: transactionData.tanggal,
    keterangan: transactionData.keterangan || "", // Keterangan di transaction level (opsional)
    referensi: transactionData.referensi || null,
    entries: transactionData.entries.map((entry) => ({
      akunId: entry.akunId,
      tipe: entry.tipe, // DEBIT or KREDIT
      jumlah: parseFloat(entry.jumlah) || 0,
      hasRestriction: entry.hasRestriction || false,
      keterangan: entry.keterangan || "", // Keterangan di entry level
    })),
  };
};
