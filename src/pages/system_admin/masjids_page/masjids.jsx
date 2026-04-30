import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  FileCheck2,
  HandCoins,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import SystemAdminLayout from "../../../layouts/system_admin_layout";
import {
  getAdminDonationCampaigns,
  getAdminExpenseRecords,
  getAdminMasjids,
  updateAdminMasjid,
  updateAdminMasjidStatus,
} from "../../../services/systemAdminService";
import toast from "react-hot-toast";
import { SysAdminCardListSkeleton } from "../../../components/common/Skeleton";

function toNumber(value) {
  return Number(value || 0);
}

function toDate(value) {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
}

function formatCurrency(value) {
  return `Rp ${toNumber(value).toLocaleString("id-ID")}`;
}

function formatCompactCurrency(value) {
  return `Rp ${new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(toNumber(value))}`;
}

function daysBetween(date) {
  if (!date) return null;
  return Math.max(0, Math.floor((new Date() - date) / (1000 * 60 * 60 * 24)));
}

function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="rounded-[28px] border border-[#ded5c3] bg-white p-5 shadow-sm lg:p-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#1f2b22]">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-[#6f6657]">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone = "default" }) {
  const toneMap = {
    default: "bg-[#f8f4ea] text-[#8a7550]",
    success: "bg-[#eaf6ef] text-[#1f7a45]",
    warning: "bg-[#fff4e5] text-[#b26a00]",
    danger: "bg-[#fdeceb] text-[#a33b32]",
  };

  return (
    <div className="rounded-[24px] border border-[#ebe2d2] bg-[#fffdfa] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#6f6657]">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-[#1f2b22]">{value}</p>
          {hint ? <p className="mt-2 text-xs text-[#8b826f]">{hint}</p> : null}
        </div>
        <div className={`rounded-2xl p-3 ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Badge({ children, tone = "neutral" }) {
  const toneMap = {
    neutral: "bg-[#f4efe6] text-[#6b5e4b]",
    success: "bg-[#e8f5ec] text-[#1c7a43]",
    warning: "bg-[#fff2de] text-[#a86713]",
    danger: "bg-[#fdeceb] text-[#a33b32]",
    info: "bg-[#ebf3ff] text-[#305f9d]",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${toneMap[tone]}`}>
      {children}
    </span>
  );
}

function ProgressBar({ value, tone = "emerald" }) {
  const width = Math.max(0, Math.min(100, value));
  const toneMap = {
    emerald: "from-[#2f7a61] to-[#215546]",
    amber: "from-[#d59741] to-[#b26a00]",
    red: "from-[#d2685a] to-[#b44338]",
    blue: "from-[#4c7dd7] to-[#315fbc]",
  };

  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#efe6d8]">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${toneMap[tone]}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function HealthRing({ score }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const tone =
    clamped >= 75 ? "text-[#1f7a45]" : clamped >= 50 ? "text-[#b26a00]" : "text-[#a33b32]";

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full border-8 border-[#f1e8da] bg-[#fffaf2]">
      <div className={`text-center ${tone}`}>
        <p className="text-2xl font-semibold leading-none">{clamped}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em]">score</p>
      </div>
    </div>
  );
}

function getHealthLabel(score) {
  if (score >= 75) return { label: "Sehat", tone: "success" };
  if (score >= 50) return { label: "Perlu perhatian", tone: "warning" };
  return { label: "Berisiko", tone: "danger" };
}

function getCompletenessTone(percent) {
  if (percent >= 75) return "success";
  if (percent >= 50) return "warning";
  return "danger";
}

function buildAlerts(masjid) {
  const alerts = [];

  if (!masjid.isActive) {
    alerts.push({ tone: "danger", text: "Masjid sedang nonaktif." });
  }

  if (masjid.profileCompleteness < 60) {
    alerts.push({
      tone: "warning",
      text: "Profil masjid belum lengkap, data publik dan monitoring berpotensi kosong.",
    });
  }

  if (masjid.campaignCount > 0 && masjid.donationTotal === 0) {
    alerts.push({
      tone: "warning",
      text: "Sudah memiliki campaign tetapi belum ada donasi masuk.",
    });
  }

  if (masjid.donationTotal > 0 && masjid.expenseRatio >= 80) {
    alerts.push({
      tone: "danger",
      text: "Rasio pengeluaran sangat tinggi terhadap donasi terkumpul.",
    });
  }

  if (masjid.activeUsers === 0) {
    alerts.push({
      tone: "danger",
      text: "Tidak ada user aktif yang terhubung ke masjid ini.",
    });
  }

  if (masjid.activityAgeDays !== null && masjid.activityAgeDays > 30) {
    alerts.push({
      tone: "warning",
      text: `Tidak ada aktivitas baru selama ${masjid.activityAgeDays} hari.`,
    });
  }

  if (masjid.documentCount === 0) {
    alerts.push({
      tone: "info",
      text: "Belum ada dokumen/laporan masjid yang terunggah.",
    });
  }

  return alerts;
}

export default function SystemAdminMasjidsPage() {
  const [masjids, setMasjids] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState("health_desc");

  const loadMasjids = async () => {
    try {
      const [masjidData, campaignData, expenseData] = await Promise.all([
        getAdminMasjids(),
        getAdminDonationCampaigns(),
        getAdminExpenseRecords(),
      ]);

      setMasjids(masjidData);
      setCampaigns(campaignData);
      setExpenses(expenseData);
    } catch {
      toast.error("Failed to load masjid monitoring data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasjids();
  }, []);

  const analytics = useMemo(() => {
    const mapped = masjids.map((masjid) => {
      const masjidCampaigns = campaigns.filter((campaign) => campaign.id_masjid === masjid.id);
      const masjidExpenses = expenses.filter((expense) => expense.masjidId === masjid.id);
      const donationTotal = masjidCampaigns.reduce(
        (sum, campaign) => sum + toNumber(campaign.UangDonasiTerkumpul),
        0
      );
      const targetTotal = masjidCampaigns.reduce(
        (sum, campaign) => sum + toNumber(campaign.TargetUangDonasi),
        0
      );
      const expenseTotal = masjidExpenses.reduce(
        (sum, expense) => sum + toNumber(expense.UangPengeluaran),
        0
      );
      const activeUsers = (masjid.users || []).filter((user) => user.isActive).length;
      const totalUsers = masjid.users?.length || 0;
      const fasilitasCount = masjid.fasilitasMasjid?.length || 0;
      const kegiatanCount = masjid.kegiatanMasjid?.length || 0;
      const laporanCount = masjid.laporanMasjid?.length || 0;
      const documentCount = laporanCount;

      const profileChecklist = [
        Boolean(masjid.Nama),
        Boolean(masjid.Alamat),
        Boolean(masjid.NomorTelepon),
        Boolean(masjid.Deskripsi),
        Boolean(masjid.Visi),
        Boolean(masjid.Misi),
        Boolean(masjid.TanggalBerdiri),
        Array.isArray(masjid.FotoLuarMasjid) && masjid.FotoLuarMasjid.length > 0,
        Array.isArray(masjid.FotoDalamMasjid) && masjid.FotoDalamMasjid.length > 0,
      ];
      const profileCompleteness = Math.round(
        (profileChecklist.filter(Boolean).length / profileChecklist.length) * 100
      );

      const lastCampaignDate = masjidCampaigns
        .map((campaign) => toDate(campaign.CreatedAt || campaign.createdAt))
        .filter(Boolean)
        .sort((a, b) => b - a)[0];
      const lastExpenseDate = masjidExpenses
        .map((expense) => toDate(expense.CreatedAt || expense.createdAt))
        .filter(Boolean)
        .sort((a, b) => b - a)[0];
      const lastKegiatanDate = (masjid.kegiatanMasjid || [])
        .map((item) => toDate(item.CreatedAt || item.createdAt || item.TanggalKegiatan))
        .filter(Boolean)
        .sort((a, b) => b - a)[0];

      const lastActivityDate = [lastCampaignDate, lastExpenseDate, lastKegiatanDate]
        .filter(Boolean)
        .sort((a, b) => b - a)[0] || null;

      const activityAgeDays = daysBetween(lastActivityDate);
      const fundingProgress = targetTotal > 0 ? Math.round((donationTotal / targetTotal) * 100) : 0;
      const expenseRatio = donationTotal > 0 ? Math.round((expenseTotal / donationTotal) * 100) : 0;

      let healthScore = 0;
      healthScore += masjid.isActive ? 25 : 0;
      healthScore += Math.min(profileCompleteness * 0.25, 25);
      healthScore += totalUsers > 0 ? Math.min(activeUsers / totalUsers, 1) * 15 : 0;
      healthScore += Math.min((fasilitasCount >= 4 ? 1 : fasilitasCount / 4) * 10, 10);
      healthScore += documentCount > 0 ? 10 : 0;
      healthScore += masjidCampaigns.length > 0 ? 5 : 0;
      healthScore += donationTotal > 0 ? 5 : 0;
      healthScore += activityAgeDays === null ? 0 : activityAgeDays <= 14 ? 5 : activityAgeDays <= 30 ? 3 : 0;

      if (donationTotal > 0 && expenseRatio > 100) {
        healthScore -= 15;
      } else if (donationTotal > 0 && expenseRatio > 80) {
        healthScore -= 8;
      }

      if (activeUsers === 0) {
        healthScore -= 10;
      }

      healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));
      const health = getHealthLabel(healthScore);

      const result = {
        ...masjid,
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        campaignCount: masjidCampaigns.length,
        donationTotal,
        targetTotal,
        expenseTotal,
        netFlow: donationTotal - expenseTotal,
        fasilitasCount,
        kegiatanCount,
        laporanCount,
        documentCount,
        profileCompleteness,
        fundingProgress,
        expenseRatio,
        lastActivityDate,
        activityAgeDays,
        healthScore,
        health,
      };

      return {
        ...result,
        alerts: buildAlerts(result),
      };
    });

    const filtered = mapped
      .filter((masjid) => {
        const keyword = search.trim().toLowerCase();
        const text = [
          masjid.Nama,
          masjid.Alamat,
          masjid.NomorTelepon,
          masjid.Deskripsi,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (keyword && !text.includes(keyword)) return false;
        if (statusFilter === "active" && !masjid.isActive) return false;
        if (statusFilter === "inactive" && masjid.isActive) return false;

        if (riskFilter === "risk" && masjid.healthScore >= 50) return false;
        if (riskFilter === "warning" && (masjid.healthScore < 50 || masjid.healthScore >= 75))
          return false;
        if (riskFilter === "healthy" && masjid.healthScore < 75) return false;

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "health_asc":
            return a.healthScore - b.healthScore;
          case "donation_desc":
            return b.donationTotal - a.donationTotal;
          case "expense_desc":
            return b.expenseTotal - a.expenseTotal;
          case "activity_desc":
            return (a.activityAgeDays ?? 9999) - (b.activityAgeDays ?? 9999);
          case "users_desc":
            return b.totalUsers - a.totalUsers;
          case "health_desc":
          default:
            return b.healthScore - a.healthScore;
        }
      });

    const summary = {
      total: mapped.length,
      active: mapped.filter((item) => item.isActive).length,
      risky: mapped.filter((item) => item.healthScore < 50).length,
      lowCompleteness: mapped.filter((item) => item.profileCompleteness < 60).length,
      zeroActiveUsers: mapped.filter((item) => item.activeUsers === 0).length,
      totalDonations: mapped.reduce((sum, item) => sum + item.donationTotal, 0),
      totalExpenses: mapped.reduce((sum, item) => sum + item.expenseTotal, 0),
      totalCampaigns: mapped.reduce((sum, item) => sum + item.campaignCount, 0),
    };

    return { mapped, filtered, summary };
  }, [masjids, campaigns, expenses, search, statusFilter, riskFilter, sortBy]);

  if (loading) {
    return (
      <SystemAdminLayout>
        <SysAdminCardListSkeleton count={5} title />
      </SystemAdminLayout>
    );
  }

  return (
    <SystemAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#1f2b22]">
              Masjid Monitoring Board
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-[#6f6657]">
              Halaman ini menilai keadaan setiap masjid dari sisi status operasional,
              kelengkapan profil, aktivitas takmir, pendanaan, pengeluaran, dan alert
              yang perlu segera diperhatikan superadmin.
            </p>
          </div>
          <div className="rounded-2xl border border-[#ddd2bf] bg-[#fcf8ef] px-4 py-3 text-sm text-[#6e6758]">
            Monitoring lintas profil, campaign, user, fasilitas, dan dokumen.
          </div>
        </div>

        <SectionCard
          title="Portfolio Summary"
          subtitle="Ringkasan cepat untuk melihat kualitas portofolio masjid secara keseluruhan."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Building2}
              label="Masjid aktif"
              value={`${analytics.summary.active} / ${analytics.summary.total}`}
              hint="Proporsi masjid yang masih aktif di sistem."
              tone={analytics.summary.active === analytics.summary.total ? "success" : "warning"}
            />
            <StatCard
              icon={CircleAlert}
              label="Masjid berisiko"
              value={analytics.summary.risky}
              hint="Health score di bawah 50."
              tone={analytics.summary.risky ? "danger" : "success"}
            />
            <StatCard
              icon={FileCheck2}
              label="Profil belum lengkap"
              value={analytics.summary.lowCompleteness}
              hint="Kelengkapan profil di bawah 60%."
              tone={analytics.summary.lowCompleteness ? "warning" : "success"}
            />
            <StatCard
              icon={Users}
              label="Tanpa user aktif"
              value={analytics.summary.zeroActiveUsers}
              hint="Masjid tanpa operator aktif."
              tone={analytics.summary.zeroActiveUsers ? "danger" : "success"}
            />
            <StatCard
              icon={HandCoins}
              label="Total donasi"
              value={formatCompactCurrency(analytics.summary.totalDonations)}
              hint="Akumulasi dana terkumpul lintas masjid."
              tone="success"
            />
            <StatCard
              icon={ArrowDownRight}
              label="Total pengeluaran"
              value={formatCompactCurrency(analytics.summary.totalExpenses)}
              hint="Akumulasi pengeluaran lintas masjid."
              tone="warning"
            />
            <StatCard
              icon={ArrowUpRight}
              label="Net flow"
              value={formatCompactCurrency(
                analytics.summary.totalDonations - analytics.summary.totalExpenses
              )}
              hint="Donasi dikurangi pengeluaran."
              tone={
                analytics.summary.totalDonations - analytics.summary.totalExpenses >= 0
                  ? "success"
                  : "danger"
              }
            />
            <StatCard
              icon={CalendarClock}
              label="Total campaign"
              value={analytics.summary.totalCampaigns}
              hint="Campaign yang sudah terhubung ke masjid."
              tone="default"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Filter & Prioritization"
          subtitle="Fokuskan monitoring pada masjid yang perlu tindakan lebih cepat."
          action={
            <Badge tone="info">{analytics.filtered.length} masjid tampil</Badge>
          }
        >
          <div className="grid gap-3 lg:grid-cols-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7550]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau alamat masjid"
                className="w-full rounded-xl border border-[#d7cfbe] bg-[#fffcf6] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#1f4d3d]"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#d7cfbe] bg-[#fffcf6] px-4 py-3 text-sm outline-none focus:border-[#1f4d3d]"
            >
              <option value="all">Semua status</option>
              <option value="active">Hanya aktif</option>
              <option value="inactive">Hanya nonaktif</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="rounded-xl border border-[#d7cfbe] bg-[#fffcf6] px-4 py-3 text-sm outline-none focus:border-[#1f4d3d]"
            >
              <option value="all">Semua kondisi</option>
              <option value="risk">Hanya berisiko</option>
              <option value="warning">Hanya perlu perhatian</option>
              <option value="healthy">Hanya sehat</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-[#d7cfbe] bg-[#fffcf6] px-4 py-3 text-sm outline-none focus:border-[#1f4d3d]"
            >
              <option value="health_desc">Urutkan: health score tertinggi</option>
              <option value="health_asc">Urutkan: health score terendah</option>
              <option value="donation_desc">Urutkan: donasi terbesar</option>
              <option value="expense_desc">Urutkan: pengeluaran terbesar</option>
              <option value="activity_desc">Urutkan: aktivitas terbaru</option>
              <option value="users_desc">Urutkan: user terbanyak</option>
            </select>
          </div>
        </SectionCard>

        <div className="space-y-4">
          {analytics.filtered.map((masjid) => (
            <div
              key={masjid.id}
              className="rounded-[28px] border border-[#ded5c3] bg-white p-5 shadow-sm lg:p-6"
            >
              {editingId === masjid.id ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-xl border border-[#d7cfbe] px-4 py-3"
                    value={form.Nama || ""}
                    onChange={(e) => setForm({ ...form, Nama: e.target.value })}
                    placeholder="Nama"
                  />
                  <input
                    className="rounded-xl border border-[#d7cfbe] px-4 py-3"
                    value={form.NomorTelepon || ""}
                    onChange={(e) => setForm({ ...form, NomorTelepon: e.target.value })}
                    placeholder="Nomor Telepon"
                  />
                  <textarea
                    className="rounded-xl border border-[#d7cfbe] px-4 py-3 md:col-span-2"
                    value={form.Alamat || ""}
                    onChange={(e) => setForm({ ...form, Alamat: e.target.value })}
                    placeholder="Alamat"
                  />
                  <textarea
                    className="rounded-xl border border-[#d7cfbe] px-4 py-3 md:col-span-2"
                    value={form.Deskripsi || ""}
                    onChange={(e) => setForm({ ...form, Deskripsi: e.target.value })}
                    placeholder="Deskripsi singkat"
                  />
                  <div className="flex gap-2 md:col-span-2">
                    <button
                      onClick={async () => {
                        try {
                          await updateAdminMasjid(masjid.id, form);
                          toast.success("Masjid updated");
                          setEditingId(null);
                          loadMasjids();
                        } catch {
                          toast.error("Failed to update masjid");
                        }
                      }}
                      className="rounded-xl bg-[#1f4d3d] px-4 py-2 text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-xl border border-[#d7cfbe] px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex items-start gap-4">
                      <HealthRing score={masjid.healthScore} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-[#1f2b22]">{masjid.Nama}</h2>
                          <Badge tone={masjid.isActive ? "success" : "danger"}>
                            {masjid.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                          <Badge tone={masjid.health.tone}>{masjid.health.label}</Badge>
                        </div>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6f6657]">
                          {masjid.Alamat || "Alamat belum tersedia"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge tone="neutral">Telp: {masjid.NomorTelepon || "-"}</Badge>
                          <Badge tone="info">{masjid.totalUsers} user</Badge>
                          <Badge tone="info">{masjid.activeUsers} aktif</Badge>
                          <Badge tone={getCompletenessTone(masjid.profileCompleteness)}>
                            Profil {masjid.profileCompleteness}%
                          </Badge>
                          <Badge tone="neutral">{masjid.fasilitasCount} fasilitas</Badge>
                          <Badge tone="neutral">{masjid.documentCount} dokumen</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setEditingId(masjid.id);
                          setForm({
                            Nama: masjid.Nama,
                            Alamat: masjid.Alamat,
                            NomorTelepon: masjid.NomorTelepon,
                            Deskripsi: masjid.Deskripsi,
                          });
                        }}
                        className="rounded-xl border border-[#d7cfbe] px-4 py-2 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await updateAdminMasjidStatus(masjid.id, !masjid.isActive);
                            toast.success("Masjid status updated");
                            loadMasjids();
                          } catch {
                            toast.error("Failed to update masjid status");
                          }
                        }}
                        className={`rounded-xl px-4 py-2 text-sm text-white ${
                          masjid.isActive ? "bg-[#7b2e2e]" : "bg-[#1f4d3d]"
                        }`}
                      >
                        {masjid.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-4">
                    <div className="rounded-2xl border border-[#ece4d5] bg-[#fffcf6] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-[#6f6657]">Kelengkapan profil</p>
                        <ShieldCheck className="h-4 w-4 text-[#8a7550]" />
                      </div>
                      <p className="text-2xl font-semibold text-[#1f2b22]">
                        {masjid.profileCompleteness}%
                      </p>
                      <p className="mt-2 text-xs text-[#8b826f]">
                        Menilai identitas, narasi, kontak, dan galeri utama.
                      </p>
                      <div className="mt-3">
                        <ProgressBar
                          value={masjid.profileCompleteness}
                          tone={
                            masjid.profileCompleteness >= 75
                              ? "emerald"
                              : masjid.profileCompleteness >= 50
                              ? "amber"
                              : "red"
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#ece4d5] bg-[#fffcf6] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-[#6f6657]">Aktivitas operasional</p>
                        <CalendarClock className="h-4 w-4 text-[#8a7550]" />
                      </div>
                      <p className="text-2xl font-semibold text-[#1f2b22]">
                        {masjid.activityAgeDays === null ? "-" : `${masjid.activityAgeDays} hari`}
                      </p>
                      <p className="mt-2 text-xs text-[#8b826f]">
                        Sejak campaign, pengeluaran, atau kegiatan terakhir tercatat.
                      </p>
                      <div className="mt-3">
                        <ProgressBar
                          value={
                            masjid.activityAgeDays === null
                              ? 0
                              : Math.max(0, 100 - Math.min(masjid.activityAgeDays, 60) * 1.6)
                          }
                          tone={
                            masjid.activityAgeDays !== null && masjid.activityAgeDays <= 14
                              ? "emerald"
                              : masjid.activityAgeDays !== null && masjid.activityAgeDays <= 30
                              ? "amber"
                              : "red"
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#ece4d5] bg-[#fffcf6] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-[#6f6657]">Pendanaan</p>
                        <HandCoins className="h-4 w-4 text-[#8a7550]" />
                      </div>
                      <p className="text-2xl font-semibold text-[#1f2b22]">
                        {masjid.fundingProgress}%
                      </p>
                      <p className="mt-2 text-xs text-[#8b826f]">
                        {formatCompactCurrency(masjid.donationTotal)} dari target {formatCompactCurrency(masjid.targetTotal)}.
                      </p>
                      <div className="mt-3">
                        <ProgressBar
                          value={masjid.fundingProgress}
                          tone={masjid.fundingProgress >= 60 ? "emerald" : masjid.fundingProgress >= 25 ? "amber" : "red"}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#ece4d5] bg-[#fffcf6] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-[#6f6657]">Rasio pengeluaran</p>
                        <ArrowDownRight className="h-4 w-4 text-[#8a7550]" />
                      </div>
                      <p className="text-2xl font-semibold text-[#1f2b22]">
                        {masjid.donationTotal > 0 ? `${masjid.expenseRatio}%` : "-"}
                      </p>
                      <p className="mt-2 text-xs text-[#8b826f]">
                        {formatCompactCurrency(masjid.expenseTotal)} keluar dari {formatCompactCurrency(masjid.donationTotal)} donasi.
                      </p>
                      <div className="mt-3">
                        <ProgressBar
                          value={masjid.expenseRatio}
                          tone={masjid.expenseRatio <= 60 ? "emerald" : masjid.expenseRatio <= 80 ? "amber" : "red"}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-2xl border border-[#ece4d5] bg-[#fffdfa] p-4">
                      <h3 className="text-sm font-semibold text-[#1f2b22]">Monitoring highlights</h3>
                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-2xl bg-[#f8f4ea] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#8a7550]">Campaign</p>
                          <p className="mt-2 text-2xl font-semibold text-[#1f2b22]">{masjid.campaignCount}</p>
                          <p className="mt-1 text-xs text-[#7b7365]">Campaign aktif/tercatat untuk masjid ini.</p>
                        </div>
                        <div className="rounded-2xl bg-[#f8f4ea] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#8a7550]">Fasilitas</p>
                          <p className="mt-2 text-2xl font-semibold text-[#1f2b22]">{masjid.fasilitasCount}</p>
                          <p className="mt-1 text-xs text-[#7b7365]">Jumlah fasilitas yang sudah dimasukkan takmir.</p>
                        </div>
                        <div className="rounded-2xl bg-[#f8f4ea] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#8a7550]">Dokumen</p>
                          <p className="mt-2 text-2xl font-semibold text-[#1f2b22]">{masjid.documentCount}</p>
                          <p className="mt-1 text-xs text-[#7b7365]">Laporan atau dokumen pendukung yang tersedia.</p>
                        </div>
                        <div className="rounded-2xl bg-[#f8f4ea] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#8a7550]">User aktif</p>
                          <p className="mt-2 text-2xl font-semibold text-[#1f2b22]">{masjid.activeUsers}</p>
                          <p className="mt-1 text-xs text-[#7b7365]">Operator aktif dari total {masjid.totalUsers} user.</p>
                        </div>
                        <div className="rounded-2xl bg-[#f8f4ea] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#8a7550]">Net flow</p>
                          <p className="mt-2 text-2xl font-semibold text-[#1f2b22]">
                            {formatCompactCurrency(masjid.netFlow)}
                          </p>
                          <p className="mt-1 text-xs text-[#7b7365]">Posisi dana bersih saat ini.</p>
                        </div>
                        <div className="rounded-2xl bg-[#f8f4ea] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#8a7550]">Kegiatan</p>
                          <p className="mt-2 text-2xl font-semibold text-[#1f2b22]">{masjid.kegiatanCount}</p>
                          <p className="mt-1 text-xs text-[#7b7365]">Agenda atau aktivitas masjid yang pernah tercatat.</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#ece4d5] bg-[#fffdfa] p-4">
                      <h3 className="text-sm font-semibold text-[#1f2b22]">Alert penting</h3>
                      <div className="mt-4 space-y-3">
                        {masjid.alerts.length ? (
                          masjid.alerts.map((alert, index) => (
                            <div
                              key={`${masjid.id}-alert-${index}`}
                              className={`rounded-2xl border p-4 ${
                                alert.tone === "danger"
                                  ? "border-[#efc3bf] bg-[#fff3f1] text-[#8f3028]"
                                  : alert.tone === "warning"
                                  ? "border-[#f3d6a2] bg-[#fff7ea] text-[#99611b]"
                                  : "border-[#d8d0c1] bg-[#faf7f0] text-[#5f594e]"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="rounded-2xl bg-white/70 p-2">
                                  {alert.tone === "danger" ? (
                                    <AlertTriangle className="h-4 w-4" />
                                  ) : alert.tone === "warning" ? (
                                    <CircleAlert className="h-4 w-4" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                </div>
                                <p className="text-sm leading-6">{alert.text}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-[#cfe6d5] bg-[#eef8f1] p-4 text-sm text-[#276a44]">
                            Tidak ada alert penting. Kondisi dasar masjid ini relatif stabil.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {!analytics.filtered.length ? (
            <div className="rounded-[28px] border border-dashed border-[#d9cfbf] bg-[#faf7f1] px-6 py-12 text-center text-sm text-[#7c7364]">
              Tidak ada masjid yang cocok dengan filter saat ini.
            </div>
          ) : null}
        </div>
      </div>
    </SystemAdminLayout>
  );
}
