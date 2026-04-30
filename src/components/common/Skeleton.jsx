// Reusable skeleton building blocks — all use animate-pulse (Tailwind built-in)

// ─── Primitive ────────────────────────────────────────────────────────────────
export const Sk = ({ className = "" }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

// ─── Stat Cards ───────────────────────────────────────────────────────────────
export const StatCardsSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 space-y-3">
        <div className="flex justify-between items-start">
          <Sk className="w-10 h-10 rounded-lg" />
          <Sk className="w-16 h-4" />
        </div>
        <Sk className="w-3/4 h-4" />
        <Sk className="w-1/2 h-7" />
      </div>
    ))}
  </div>
);

// ─── Table ────────────────────────────────────────────────────────────────────
export const TableSkeleton = ({ rows = 7, cols = 5 }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    {/* Header */}
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Sk key={i} className="h-4 rounded" style={{ flex: i === 0 ? 2 : 1 }} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="border-b border-gray-100 px-4 py-3 flex gap-4 items-center"
        style={{ opacity: 1 - i * 0.08 }}
      >
        {Array.from({ length: cols }).map((_, j) => (
          <Sk key={j} className="h-4 rounded" style={{ flex: j === 0 ? 2 : 1 }} />
        ))}
      </div>
    ))}
  </div>
);

// ─── Card Grid (mirip MosqueCard) ─────────────────────────────────────────────
export const CardGridSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow overflow-hidden">
        <Sk className="h-48 rounded-none" />
        <div className="p-4 space-y-3">
          <Sk className="h-5 w-3/4" />
          <Sk className="h-4 w-1/2" />
          <div className="space-y-1.5">
            <Sk className="h-3 w-full" />
            <Sk className="h-3 w-4/5" />
          </div>
          <div className="pt-1">
            <Sk className="h-2 w-full rounded-full" />
            <div className="flex justify-between mt-2">
              <Sk className="h-4 w-24" />
              <Sk className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ─── Donation Campaign Cards (takmir style — horizontal list) ─────────────────
export const CampaignListSkeleton = ({ count = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 items-center">
        <Sk className="w-16 h-16 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Sk className="h-5 w-2/3" />
          <Sk className="h-3.5 w-1/2" />
          <Sk className="h-2 w-full rounded-full" />
        </div>
        <Sk className="w-20 h-8 rounded-lg flex-shrink-0" />
      </div>
    ))}
  </div>
);

// ─── Riwayat Donasi items ─────────────────────────────────────────────────────
export const HistoryListSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 items-center shadow-sm">
        <Sk className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Sk className="h-4 w-1/2" />
          <Sk className="h-3 w-1/3" />
          <Sk className="h-3 w-2/3" />
        </div>
        <div className="text-right space-y-2 flex-shrink-0">
          <Sk className="h-5 w-28" />
          <Sk className="h-6 w-20 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Stats strip (3 cards, riwayat donasi header area) ───────────────────────
export const StatStripSkeleton = ({ count = 3 }) => (
  <div className={`grid grid-cols-1 md:grid-cols-${count} gap-4`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2 shadow-sm">
        <Sk className="h-4 w-1/2" />
        <Sk className="h-7 w-2/3" />
        <Sk className="h-3 w-1/3" />
      </div>
    ))}
  </div>
);

// ─── Dashboard Full ───────────────────────────────────────────────────────────
export const DashboardSkeleton = () => (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Sk className="h-7 w-56" />
        <Sk className="h-4 w-40" />
      </div>
      <Sk className="h-10 w-32 rounded-lg" />
    </div>

    {/* Stat cards */}
    <StatCardsSkeleton count={4} />

    {/* Campaign + Donatur row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-3">
        <Sk className="h-6 w-40 mb-2" />
        <CampaignListSkeleton count={3} />
      </div>
      <div className="space-y-3">
        <Sk className="h-6 w-32 mb-2" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 flex gap-3 items-center">
            <Sk className="w-9 h-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Sk className="h-4 w-3/4" />
              <Sk className="h-3 w-1/2" />
            </div>
            <Sk className="h-5 w-20 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Detail Masjid Hero ───────────────────────────────────────────────────────
export const DetailMasjidSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Hero green bar */}
    <div className="bg-gradient-to-br from-[#0C6839] via-[#0b5b33] to-[#094b2b] px-6 pt-8 pb-20">
      <div className="container mx-auto">
        <Sk className="h-8 w-24 mb-8 bg-white/20 rounded-lg" />
        <div className="text-center space-y-3 mb-10">
          <Sk className="h-10 w-64 mx-auto bg-white/20 rounded-xl" />
          <Sk className="h-5 w-80 mx-auto bg-white/20 rounded" />
          <Sk className="h-5 w-64 mx-auto bg-white/20 rounded" />
        </div>
        {/* 4 quick info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-6 space-y-2">
              <Sk className="w-10 h-10 rounded-lg bg-white/20 mx-auto" />
              <Sk className="h-3 w-20 mx-auto bg-white/20 rounded" />
              <Sk className="h-5 w-28 mx-auto bg-white/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Content area */}
    <div className="container mx-auto px-6 py-10 space-y-6">
      {/* Stat cards */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <Sk className="h-6 w-40" />
        <StatCardsSkeleton count={4} />
      </div>
      {/* Tab bar */}
      <div className="bg-white rounded-xl shadow-lg p-0 overflow-hidden">
        <div className="flex gap-1 border-b border-gray-200 px-4 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Sk key={i} className="h-9 w-28 rounded-t-lg" />
          ))}
        </div>
        <div className="p-8 space-y-4">
          <Sk className="h-6 w-48" />
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Sk className="h-32 w-full rounded-xl" />
              <Sk className="h-32 w-full rounded-xl" />
            </div>
            <div className="space-y-3">
              <Sk className="h-32 w-full rounded-xl" />
              <Sk className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Detail Donation (user) ───────────────────────────────────────────────────
export const DonationDetailSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Hero green */}
    <div className="bg-[#0C6839] px-6 pt-8 pb-20">
      <div className="container mx-auto">
        <Sk className="h-8 w-24 mb-8 bg-white/20 rounded-lg" />
        <Sk className="h-10 w-2/3 mx-auto bg-white/20 rounded-xl mb-10" />
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Sk className="h-4 w-32 bg-white/20 rounded" />
                <Sk className="h-6 w-48 bg-white/20 rounded" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <Sk className="h-4 w-28 bg-white/20 rounded" />
            <Sk className="h-3 w-full rounded-full bg-white/20" />
            <div className="flex justify-between">
              <Sk className="h-5 w-32 bg-white/20 rounded" />
              <Sk className="h-5 w-24 bg-white/20 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Summary cards */}
    <div className="container mx-auto px-6 -mt-10 pb-10 space-y-6">
      <StatCardsSkeleton count={4} />
      {/* Expense cards */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <Sk className="h-6 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <Sk className="h-5 w-1/3" />
              <Sk className="h-5 w-24" />
            </div>
            <Sk className="h-3.5 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Masjid Terdaftar list ────────────────────────────────────────────────────
export const MasjidListSkeleton = () => (
  <div className="min-h-screen">
    {/* Page header */}
    <div className="bg-white border-b px-4 py-6 text-center space-y-2">
      <Sk className="h-8 w-64 mx-auto" />
      <Sk className="h-4 w-80 mx-auto" />
    </div>

    {/* Search bar */}
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Sk className="h-12 w-full rounded-xl mb-8" />

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
            <Sk className="h-48 rounded-none" />
            <div className="p-5 space-y-3">
              <Sk className="h-5 w-3/4" />
              <Sk className="h-4 w-1/2" />
              <div className="flex gap-2 pt-1">
                <Sk className="h-7 flex-1 rounded-lg" />
                <Sk className="h-7 flex-1 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Form (input fields placeholder) ─────────────────────────────────────────
export const FormSkeleton = ({ fields = 5 }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Sk className="h-4 w-32" />
        <Sk className="h-11 w-full rounded-lg" />
      </div>
    ))}
    <div className="flex gap-3 pt-2">
      <Sk className="h-11 w-32 rounded-lg" />
      <Sk className="h-11 w-24 rounded-lg" />
    </div>
  </div>
);

// ─── Takmir page header (identitas, fasilitas, laporan pages) ─────────────────
// Mirrors the bg-white/80 backdrop-blur-sm rounded-2xl card with gradient icon
export const TakmirPageHeaderSkeleton = ({ showActions = false }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6 lg:p-8 space-y-6">
    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Sk className="w-14 h-14 rounded-xl flex-shrink-0" />
          <div className="space-y-2">
            <Sk className="h-7 w-56" />
            <Sk className="h-4 w-40" />
          </div>
        </div>
        {showActions && (
          <div className="flex gap-3">
            <Sk className="h-10 w-28 rounded-xl" />
            <Sk className="h-10 w-24 rounded-xl" />
          </div>
        )}
      </div>
    </div>
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8 space-y-5">
      <FormSkeleton fields={6} />
    </div>
  </div>
);

// ─── Facility cards grid (fasilitas_masjid) ───────────────────────────────────
export const FacilityCardsSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sk className="w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="space-y-1.5">
            <Sk className="h-4 w-28" />
            <Sk className="h-3 w-16" />
          </div>
        </div>
        <Sk className="h-6 w-16 rounded-full flex-shrink-0" />
      </div>
    ))}
  </div>
);

// ─── Laporan block (panel tab content in laporan_keuangan) ────────────────────
export const LaporanBlockSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Sk className="h-6 w-40" />
      <Sk className="h-9 w-28 rounded-lg" />
    </div>
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-lg space-y-2">
            <Sk className="h-4 w-24" />
            <Sk className="h-7 w-32" />
          </div>
        ))}
      </div>
      <TableSkeleton rows={5} cols={4} />
    </div>
  </div>
);

// ─── Donatur page (header + table) ────────────────────────────────────────────
export const DonaturPageSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Sk className="h-7 w-48" />
        <Sk className="h-4 w-40" />
      </div>
      <Sk className="h-10 w-28 rounded-lg" />
    </div>
    <TableSkeleton rows={7} cols={5} />
  </div>
);

// ─── Jurnal form (numbered steps layout) ─────────────────────────────────────
export const JurnalFormSkeleton = () => (
  <div className="space-y-6 p-6">
    {/* Back button */}
    <Sk className="h-9 w-36 rounded-lg" />
    {/* Step 1: Info */}
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Sk className="w-8 h-8 rounded-full" />
        <Sk className="h-5 w-48" />
      </div>
      <FormSkeleton fields={3} />
    </div>
    {/* Step 2: Entries */}
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Sk className="w-8 h-8 rounded-full" />
        <Sk className="h-5 w-48" />
      </div>
      <TableSkeleton rows={3} cols={4} />
      <Sk className="h-9 w-40 rounded-lg" />
    </div>
    {/* Action buttons */}
    <div className="flex gap-3">
      <Sk className="h-11 w-32 rounded-lg" />
      <Sk className="h-11 w-24 rounded-lg" />
    </div>
  </div>
);

// ─── Expense form (back button + form card) ───────────────────────────────────
export const ExpenseFormSkeleton = () => (
  <div className="space-y-6 p-6">
    <Sk className="h-9 w-48 rounded-lg" />
    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
      <div className="space-y-1 mb-2">
        <Sk className="h-7 w-52" />
        <Sk className="h-4 w-72" />
      </div>
      {/* Amber warning box placeholder */}
      <Sk className="h-16 w-full rounded-xl" />
      <FormSkeleton fields={4} />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// System Admin skeletons — warm beige design language
// ═══════════════════════════════════════════════════════════════════════════════

// Shared warm-tone card wrapper used by all sys-admin skeletons
const SysCard = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm ${className}`}>
    {children}
  </div>
);

// ─── Sys-admin table (warm borders) ──────────────────────────────────────────
export const SysAdminTableSkeleton = ({ rows = 7, cols = 5, title }) => (
  <SysCard>
    {title && <Sk className="h-6 w-40 mb-4" />}
    <div className="overflow-x-auto">
      <div className="flex gap-6 pb-3 border-b border-[#eee6d7] mb-1">
        {Array.from({ length: cols }).map((_, i) => (
          <Sk key={i} className="h-4 rounded" style={{ flex: i === 0 ? 2 : 1 }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-6 py-3 border-b border-[#eee6d7] items-center"
          style={{ opacity: 1 - i * 0.07 }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <Sk key={j} className="h-4 rounded" style={{ flex: j === 0 ? 2 : 1 }} />
          ))}
        </div>
      ))}
    </div>
  </SysCard>
);

// ─── Sys-admin card list (masjids page) ───────────────────────────────────────
export const SysAdminCardListSkeleton = ({ count = 5, title }) => (
  <SysCard>
    {title && <Sk className="h-6 w-40 mb-4" />}
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-[#eee6d7] p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Sk className="h-5 w-48" />
              <Sk className="h-4 w-64" />
              <Sk className="h-4 w-32" />
            </div>
            <div className="flex gap-2">
              <Sk className="h-9 w-20 rounded-xl" />
              <Sk className="h-9 w-24 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </SysCard>
);

// ─── Sys-admin category grid (categories page) ────────────────────────────────
export const SysAdminCategoryGridSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 2 }).map((_, s) => (
      <SysCard key={s}>
        <div className="flex items-center justify-between mb-4">
          <Sk className="h-6 w-40" />
          <div className="flex gap-2">
            <Sk className="h-10 w-36 rounded-xl" />
            <Sk className="h-10 w-16 rounded-xl" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-[#eee6d7] px-4 py-3">
              <div className="space-y-1.5">
                <Sk className="h-4 w-32" />
                <Sk className="h-3 w-16" />
              </div>
              <Sk className="h-8 w-20 rounded-xl" />
            </div>
          ))}
        </div>
      </SysCard>
    ))}
  </div>
);

// ─── Sys-admin settings (stacked config editors) ─────────────────────────────
export const SysAdminSettingsSkeleton = () => (
  <SysCard>
    <Sk className="h-6 w-52 mb-4" />
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-[#eee6d7] p-4 space-y-3">
          <div className="flex justify-between items-center">
            <Sk className="h-5 w-40" />
            <Sk className="h-3 w-32" />
          </div>
          <Sk className="h-24 w-full rounded-xl" />
          <Sk className="h-10 w-full rounded-xl" />
          <Sk className="h-9 w-20 rounded-xl" />
        </div>
      ))}
    </div>
  </SysCard>
);

// ─── Sys-admin monitoring (3 metric cards + 2 tables) ────────────────────────
export const SysAdminMonitoringSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <SysCard key={i}>
          <Sk className="h-4 w-24 mb-2" />
          <Sk className="h-9 w-16 mt-2" />
        </SysCard>
      ))}
    </div>
    <SysAdminTableSkeleton rows={6} cols={5} title />
    <SysAdminTableSkeleton rows={6} cols={4} title />
  </div>
);

// ─── Sys-admin dashboard (full page) ─────────────────────────────────────────
export const SysAdminDashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Page header */}
    <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
      <div className="space-y-2">
        <Sk className="h-9 w-64" />
        <Sk className="h-4 w-96 max-w-full" />
        <Sk className="h-4 w-80 max-w-full" />
      </div>
      <Sk className="h-12 w-72 max-w-full rounded-2xl" />
    </div>

    {/* Executive Summary — 6 stat cards */}
    <div className="rounded-[28px] border border-[#ded5c3] bg-white p-5 shadow-sm lg:p-6">
      <Sk className="h-5 w-48 mb-1" />
      <Sk className="h-3 w-80 mb-5 max-w-full" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-[24px] border border-[#ebe2d2] bg-[#fffdfa] p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <Sk className="h-4 w-28" />
                <Sk className="h-7 w-36" />
              </div>
              <Sk className="w-11 h-11 rounded-2xl" />
            </div>
            <div className="flex justify-between items-center">
              <Sk className="h-3 w-32" />
              <Sk className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Alert + Trend row */}
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
      <div className="rounded-[28px] border border-[#ded5c3] bg-white p-5 shadow-sm lg:p-6 space-y-3">
        <Sk className="h-5 w-32 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#ebe2d2] p-4 space-y-2">
            <div className="flex gap-3 items-start">
              <Sk className="w-8 h-8 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Sk className="h-4 w-48" />
                <Sk className="h-3 w-full" />
                <Sk className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-[28px] border border-[#ded5c3] bg-white p-5 shadow-sm lg:p-6">
        <Sk className="h-5 w-40 mb-4" />
        <div className="rounded-[24px] border border-[#ece3d3] bg-[#fffdfa] p-4">
          <div className="flex h-56 items-end gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-3">
                <Sk className="h-3 w-6" />
                <Sk className="w-full max-w-[56px] rounded-t-2xl" style={{ height: `${30 + Math.random() * 60}%` }} />
                <div className="space-y-1 text-center">
                  <Sk className="h-4 w-8 mx-auto" />
                  <Sk className="h-3 w-10 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Ranking sections */}
    {Array.from({ length: 2 }).map((_, row) => (
      <div key={row} className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, col) => (
          <div key={col} className="rounded-[28px] border border-[#ded5c3] bg-white p-5 shadow-sm lg:p-6 space-y-3">
            <Sk className="h-5 w-40 mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[#ece4d5] bg-[#fffcf6] p-4 space-y-2">
                <div className="flex justify-between mb-2">
                  <div className="space-y-1">
                    <Sk className="h-4 w-36" />
                    <Sk className="h-3 w-28" />
                  </div>
                  <div className="text-right space-y-1">
                    <Sk className="h-4 w-24" />
                    <Sk className="h-3 w-20" />
                  </div>
                </div>
                <Sk className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    ))}
  </div>
);
