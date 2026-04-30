import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ChartColumn,
  CircleAlert,
  HandCoins,
  ShieldAlert,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import SystemAdminLayout from "../../../layouts/system_admin_layout";
import {
  getAdminAuditLogs,
  getAdminDonationCampaigns,
  getAdminExpenseRecords,
  getAdminMasjids,
  getAdminMonitoringSummary,
  getAdminUsers,
} from "../../../services/systemAdminService";
import toast from "react-hot-toast";
import { SysAdminDashboardSkeleton } from "../../../components/common/Skeleton";

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function toNumber(value) {
  return Number(value || 0);
}

function toDate(value) {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function isWithinRange(date, start, end) {
  return Boolean(date && date >= start && date < end);
}

function formatCurrency(value) {
  return `Rp ${toNumber(value).toLocaleString("id-ID")}`;
}

function formatCompact(value) {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(toNumber(value));
}

function formatChange(current, previous, suffix = "") {
  if (!previous) {
    if (!current) return "Stabil";
    return "Baru muncul";
  }

  const diff = ((current - previous) / previous) * 100;
  const rounded = Math.abs(diff).toFixed(1);
  return `${diff >= 0 ? "+" : "-"}${rounded}%${suffix}`;
}

function daysAgo(count) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - count);
  return date;
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

function StatCard({ icon: Icon, label, value, hint, trend, tone = "default" }) {
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
        </div>
        <div className={`rounded-2xl p-3 ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-[#8b826f]">{hint}</p>
        {trend ? (
          <span className="rounded-full bg-[#f3eee3] px-2.5 py-1 text-xs font-medium text-[#7a6850]">
            {trend}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function AlertItem({ tone, title, detail, meta }) {
  const toneMap = {
    danger: "border-[#efc3bf] bg-[#fff3f1] text-[#8f3028]",
    warning: "border-[#f3d6a2] bg-[#fff7ea] text-[#99611b]",
    info: "border-[#d8d0c1] bg-[#faf7f0] text-[#5f594e]",
  };

  const Icon =
    tone === "danger" ? ShieldAlert : tone === "warning" ? AlertTriangle : CircleAlert;

  return (
    <div className={`rounded-2xl border p-4 ${toneMap[tone]}`}>
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white/70 p-2">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6 opacity-90">{detail}</p>
          {meta ? <p className="mt-2 text-xs font-medium opacity-80">{meta}</p> : null}
        </div>
      </div>
    </div>
  );
}

function RankingList({ items, emptyLabel, valueLabel, tone = "emerald" }) {
  const barTone =
    tone === "danger"
      ? "from-[#d2685a] to-[#b44338]"
      : "from-[#2f7a61] to-[#215546]";

  const maxValue = Math.max(...items.map((item) => item.value), 0);

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#ddd3c1] bg-[#faf7f1] px-4 py-8 text-center text-sm text-[#7c7364]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const width = maxValue > 0 ? Math.max((item.value / maxValue) * 100, 8) : 8;
        return (
          <div key={`${item.name}-${index}`} className="rounded-2xl border border-[#ece4d5] bg-[#fffcf6] p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1f2b22]">{item.name}</p>
                {item.caption ? (
                  <p className="mt-1 text-xs text-[#786f61]">{item.caption}</p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#1f2b22]">{valueLabel(item)}</p>
                {item.badge ? (
                  <p className="mt-1 text-xs text-[#8a7550]">{item.badge}</p>
                ) : null}
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#efe6d8]">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${barTone}`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrendBars({ items }) {
  const maxValue = Math.max(...items.map((item) => item.total), 1);

  return (
    <div className="rounded-[24px] border border-[#ece3d3] bg-[#fffdfa] p-4">
      <div className="flex h-56 items-end gap-3">
        {items.map((item) => {
          const totalHeight = Math.max((item.total / maxValue) * 100, item.total ? 12 : 4);
          const donationHeight = item.total ? (item.donations / item.total) * 100 : 0;
          const expenseHeight = item.total ? (item.expenses / item.total) * 100 : 0;
          const logHeight = item.total ? (item.logs / item.total) * 100 : 0;

          return (
            <div key={item.key} className="flex flex-1 flex-col items-center gap-3">
              <span className="text-xs font-medium text-[#6f6657]">{item.total}</span>
              <div className="flex w-full justify-center">
                <div
                  className="flex w-full max-w-[56px] flex-col-reverse overflow-hidden rounded-t-2xl rounded-b-md bg-[#f0e9dd]"
                  style={{ height: `${totalHeight}%`, minHeight: "16px" }}
                >
                  <div style={{ height: `${logHeight}%` }} className="bg-[#8a7550]" />
                  <div style={{ height: `${expenseHeight}%` }} className="bg-[#d07a4a]" />
                  <div style={{ height: `${donationHeight}%` }} className="bg-[#2f7a61]" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#1f2b22]">{item.label}</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a8d77]">
                  {item.caption}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#6f6657]">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2f7a61]" />
          Donasi
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d07a4a]" />
          Pengeluaran
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#8a7550]" />
          Audit log
        </span>
      </div>
    </div>
  );
}

export default function SystemAdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [masjids, setMasjids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [
          summaryData,
          logData,
          campaignData,
          expenseData,
          userData,
          masjidData,
        ] = await Promise.all([
          getAdminMonitoringSummary(),
          getAdminAuditLogs({ limit: 150 }),
          getAdminDonationCampaigns(),
          getAdminExpenseRecords(),
          getAdminUsers(),
          getAdminMasjids(),
        ]);

        setSummary(summaryData);
        setLogs(logData);
        setCampaigns(campaignData);
        setExpenses(expenseData);
        setUsers(userData);
        setMasjids(masjidData);
      } catch (error) {
        toast.error("Failed to load system admin dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const analytics = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const nextMonthStart = shiftMonth(currentMonthStart, 1);
    const previousMonthStart = shiftMonth(currentMonthStart, -1);
    const last7DaysStart = daysAgo(6);
    const last14DaysStart = daysAgo(13);

    const donations = campaigns.flatMap((campaign) =>
      (campaign.donasi || []).map((donation) => ({
        ...donation,
        campaign,
        createdAt: toDate(donation.CreatedAt || donation.createdAt),
        amount: toNumber(donation.JumlahDonasi),
      }))
    );

    const normalizedExpenses = expenses.map((expense) => ({
      ...expense,
      createdAt: toDate(expense.CreatedAt || expense.createdAt),
      amount: toNumber(expense.UangPengeluaran),
    }));

    const currentMonthDonations = donations
      .filter((item) => isWithinRange(item.createdAt, currentMonthStart, nextMonthStart))
      .reduce((sum, item) => sum + item.amount, 0);

    const previousMonthDonations = donations
      .filter((item) => isWithinRange(item.createdAt, previousMonthStart, currentMonthStart))
      .reduce((sum, item) => sum + item.amount, 0);

    const currentMonthExpenses = normalizedExpenses
      .filter((item) => isWithinRange(item.createdAt, currentMonthStart, nextMonthStart))
      .reduce((sum, item) => sum + item.amount, 0);

    const previousMonthExpenses = normalizedExpenses
      .filter((item) => isWithinRange(item.createdAt, previousMonthStart, currentMonthStart))
      .reduce((sum, item) => sum + item.amount, 0);

    const takmirUsers = users.filter((user) => user.role?.Nama === "Takmir");
    const currentMonthTakmirGrowth = takmirUsers.filter((user) =>
      isWithinRange(toDate(user.CreatedAt || user.createdAt), currentMonthStart, nextMonthStart)
    ).length;
    const previousMonthTakmirGrowth = takmirUsers.filter((user) =>
      isWithinRange(toDate(user.CreatedAt || user.createdAt), previousMonthStart, currentMonthStart)
    ).length;

    const masjidAnalytics = masjids.map((masjid) => {
      const masjidCampaigns = campaigns.filter((campaign) => campaign.id_masjid === masjid.id);
      const masjidExpenses = normalizedExpenses.filter((expense) => expense.masjidId === masjid.id);
      const donationTotal = masjidCampaigns.reduce(
        (sum, campaign) => sum + toNumber(campaign.UangDonasiTerkumpul),
        0
      );
      const expenseTotal = masjidExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const activeUsers = (masjid.users || []).filter((user) => user.isActive).length;
      const activityScore =
        masjidCampaigns.length * 3 + masjidExpenses.length * 2 + activeUsers + (masjid.kegiatanMasjid?.length || 0);

      return {
        id: masjid.id,
        name: masjid.Nama,
        isActive: masjid.isActive,
        userCount: masjid.users?.length || 0,
        activeUsers,
        campaignCount: masjidCampaigns.length,
        donationTotal,
        expenseTotal,
        netFlow: donationTotal - expenseTotal,
        activityScore,
      };
    });

    const campaignAnalytics = campaigns.map((campaign) => {
      const target = toNumber(campaign.TargetUangDonasi);
      const collected = toNumber(campaign.UangDonasiTerkumpul);
      const progress = target > 0 ? (collected / target) * 100 : 0;
      const createdAt = toDate(campaign.CreatedAt || campaign.createdAt);
      const ageDays = createdAt
        ? Math.max(0, Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)))
        : 0;

      return {
        id: campaign.id,
        name: campaign.Nama,
        masjidName: campaign.masjid?.Nama || "Masjid",
        target,
        collected,
        progress,
        createdAt,
        ageDays,
      };
    });

    const inactiveMasjids = masjidAnalytics.filter((masjid) => !masjid.isActive);
    const stagnantCampaigns = campaignAnalytics.filter(
      (campaign) => campaign.ageDays >= 14 && campaign.progress < 20
    );
    const riskMasjids = masjidAnalytics.filter(
      (masjid) => masjid.donationTotal > 0 && masjid.expenseTotal >= masjid.donationTotal * 0.8
    );
    const recentlyUpdatedRoles = logs.filter(
      (log) =>
        log.action === "USER_ROLE_UPDATED" &&
        isWithinRange(toDate(log.createdAt), last14DaysStart, new Date(now.getTime() + 1))
    );
    const recentDeactivations = logs.filter(
      (log) =>
        String(log.action).includes("DEACTIVATED") &&
        isWithinRange(toDate(log.createdAt), last14DaysStart, new Date(now.getTime() + 1))
    );

    const alerts = [];

    if (inactiveMasjids.length) {
      alerts.push({
        tone: "danger",
        title: `${inactiveMasjids.length} masjid sedang nonaktif`,
        detail: inactiveMasjids
          .slice(0, 3)
          .map((masjid) => masjid.name)
          .join(", "),
        meta: "Perlu verifikasi apakah ini kebijakan operasional atau ada kendala.",
      });
    }

    if (stagnantCampaigns.length) {
      alerts.push({
        tone: "warning",
        title: `${stagnantCampaigns.length} campaign stagnan lebih dari 14 hari`,
        detail: stagnantCampaigns
          .slice(0, 2)
          .map((campaign) => `${campaign.name} (${campaign.masjidName})`)
          .join(", "),
        meta: "Progress rendah biasanya butuh evaluasi narasi campaign atau distribusi promosi.",
      });
    }

    if (riskMasjids.length) {
      alerts.push({
        tone: "warning",
        title: `${riskMasjids.length} masjid punya rasio pengeluaran tinggi`,
        detail: riskMasjids
          .slice(0, 2)
          .map(
            (masjid) =>
              `${masjid.name} (${formatCurrency(masjid.expenseTotal)} dari ${formatCurrency(
                masjid.donationTotal
              )})`
          )
          .join(", "),
        meta: "Masjid ini layak dipantau agar cashflow tidak menipis terlalu cepat.",
      });
    }

    if (recentlyUpdatedRoles.length) {
      alerts.push({
        tone: "info",
        title: `${recentlyUpdatedRoles.length} perubahan role user dalam 14 hari`,
        detail: recentlyUpdatedRoles
          .slice(0, 2)
          .map((log) => log.user?.NamaLengkap || log.entityName || "User")
          .join(", "),
        meta: "Perubahan akses admin/takmir perlu tetap terlacak karena berdampak ke kontrol sistem.",
      });
    }

    if (recentDeactivations.length) {
      alerts.push({
        tone: "info",
        title: `${recentDeactivations.length} akun atau masjid dinonaktifkan`,
        detail: recentDeactivations
          .slice(0, 2)
          .map((log) => `${log.entityType}: ${log.entityName || "-"}`)
          .join(", "),
        meta: "Deaktivasi terbaru perlu diberi konteks agar tidak menimbulkan gap operasional.",
      });
    }

    const topMasjids = [...masjidAnalytics]
      .sort((a, b) => b.donationTotal - a.donationTotal)
      .slice(0, 5)
      .map((masjid) => ({
        name: masjid.name,
        value: masjid.donationTotal,
        caption: `${masjid.campaignCount} campaign, ${masjid.activeUsers} user aktif`,
        badge: `Net ${formatCurrency(masjid.netFlow)}`,
      }));

    const bottomMasjids = [...masjidAnalytics]
      .filter((masjid) => masjid.isActive)
      .sort((a, b) => a.activityScore - b.activityScore)
      .slice(0, 5)
      .map((masjid) => ({
        name: masjid.name,
        value: masjid.activityScore,
        caption: `${masjid.campaignCount} campaign, ${masjid.userCount} user`,
        badge: masjid.donationTotal
          ? `Donasi ${formatCompact(masjid.donationTotal)}`
          : "Belum ada donasi",
      }));

    const topCampaigns = [...campaignAnalytics]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5)
      .map((campaign) => ({
        name: campaign.name,
        value: campaign.progress,
        caption: campaign.masjidName,
        badge: `${Math.round(campaign.progress)}% dari target`,
      }));

    const attentionCampaigns = [...campaignAnalytics]
      .sort((a, b) => a.progress - b.progress || b.ageDays - a.ageDays)
      .slice(0, 5)
      .map((campaign) => ({
        name: campaign.name,
        value: 100 - Math.min(campaign.progress, 100),
        caption: `${campaign.masjidName}, umur ${campaign.ageDays} hari`,
        badge: `${Math.round(campaign.progress)}% tercapai`,
      }));

    const behaviorTrend = Array.from({ length: 7 }).map((_, index) => {
      const date = daysAgo(6 - index);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dailyDonations = donations.filter((item) => isWithinRange(item.createdAt, date, nextDate)).length;
      const dailyExpenses = normalizedExpenses.filter((item) =>
        isWithinRange(item.createdAt, date, nextDate)
      ).length;
      const dailyLogs = logs.filter((item) => isWithinRange(toDate(item.createdAt), date, nextDate)).length;

      return {
        key: date.toISOString(),
        label: DAY_NAMES[date.getDay()],
        caption: date.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit" }),
        donations: dailyDonations,
        expenses: dailyExpenses,
        logs: dailyLogs,
        total: dailyDonations + dailyExpenses + dailyLogs,
      };
    });

    return {
      currentMonthDonations,
      previousMonthDonations,
      currentMonthExpenses,
      previousMonthExpenses,
      currentMonthTakmirGrowth,
      previousMonthTakmirGrowth,
      netFlowMonth: currentMonthDonations - currentMonthExpenses,
      inactiveMasjids,
      alerts,
      topMasjids,
      bottomMasjids,
      topCampaigns,
      attentionCampaigns,
      behaviorTrend,
    };
  }, [campaigns, expenses, logs, masjids, users]);

  if (loading) {
    return (
      <SystemAdminLayout>
        <SysAdminDashboardSkeleton />
      </SystemAdminLayout>
    );
  }

  return (
    <SystemAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#1f2b22]">
              Executive Dashboard
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6f6657]">
              Ringkasan ini berfokus pada apa yang sedang terjadi di level sistem:
              arus dana, pertumbuhan akun takmir, area berisiko, dan siapa yang
              paling aktif atau justru perlu perhatian.
            </p>
          </div>
          <div className="rounded-2xl border border-[#ddd2bf] bg-[#fcf8ef] px-4 py-3 text-sm text-[#6e6758]">
            Data live dari monitoring, campaign, masjid, users, dan audit log.
          </div>
        </div>

        <SectionCard
          title="Executive Summary"
          subtitle="Empat indikator inti ditambah pertumbuhan bulan berjalan untuk menangkap momentum sistem."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard
              icon={Building2}
              label="Masjid aktif"
              value={`${summary?.activeMasjidCount ?? 0} / ${masjids.length || 0}`}
              hint="Proporsi masjid aktif terhadap seluruh masjid terdaftar."
              tone={analytics.inactiveMasjids.length ? "warning" : "success"}
            />
            <StatCard
              icon={HandCoins}
              label="Campaign aktif"
              value={summary?.campaignCount ?? 0}
              hint="Total campaign donasi yang saat ini termonitor sistem."
              tone="default"
            />
            <StatCard
              icon={TrendingUp}
              label="Donasi bulan ini"
              value={formatCurrency(analytics.currentMonthDonations)}
              hint="Dibanding bulan sebelumnya."
              trend={formatChange(
                analytics.currentMonthDonations,
                analytics.previousMonthDonations
              )}
              tone="success"
            />
            <StatCard
              icon={ArrowDownRight}
              label="Pengeluaran bulan ini"
              value={formatCurrency(analytics.currentMonthExpenses)}
              hint="Dibanding bulan sebelumnya."
              trend={formatChange(
                analytics.currentMonthExpenses,
                analytics.previousMonthExpenses
              )}
              tone={analytics.currentMonthExpenses > analytics.currentMonthDonations ? "danger" : "warning"}
            />
            <StatCard
              icon={UserPlus}
              label="Takmir baru bulan ini"
              value={analytics.currentMonthTakmirGrowth}
              hint="Pertumbuhan akun takmir dalam periode berjalan."
              trend={formatChange(
                analytics.currentMonthTakmirGrowth,
                analytics.previousMonthTakmirGrowth
              )}
              tone="default"
            />
            <StatCard
              icon={analytics.netFlowMonth >= 0 ? ArrowUpRight : ArrowDownRight}
              label="Net flow bulan ini"
              value={formatCurrency(analytics.netFlowMonth)}
              hint="Donasi dikurangi pengeluaran pada bulan berjalan."
              tone={analytics.netFlowMonth >= 0 ? "success" : "danger"}
            />
          </div>
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
          <SectionCard
            title="Risk & Alert"
            subtitle="Daftar ini bukan sekadar log, tetapi titik yang layak dipantau karena punya dampak operasional."
            action={
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f5efe4] px-3 py-1.5 text-xs font-medium text-[#7b6b54]">
                <AlertTriangle className="h-3.5 w-3.5" />
                {analytics.alerts.length} alert aktif
              </span>
            }
          >
            <div className="space-y-3">
              {analytics.alerts.length ? (
                analytics.alerts.map((alert, index) => (
                  <AlertItem key={`${alert.title}-${index}`} {...alert} />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#ddd3c1] bg-[#faf7f1] px-4 py-8 text-center text-sm text-[#7c7364]">
                  Belum ada anomali yang cukup kuat untuk ditandai dari data yang tersedia.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Behavior Trend"
            subtitle="Volume aktivitas 7 hari terakhir yang menggabungkan donasi, pengeluaran, dan audit log."
            action={
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f5efe4] px-3 py-1.5 text-xs font-medium text-[#7b6b54]">
                <CalendarDays className="h-3.5 w-3.5" />
                7 hari terakhir
              </span>
            }
          >
            <TrendBars items={analytics.behaviorTrend} />
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Performance Ranking"
            subtitle="Masjid dengan dana terkumpul terbesar saat ini, dilengkapi konteks jumlah campaign dan user aktif."
            action={
              <span className="inline-flex items-center gap-2 rounded-full bg-[#edf5f0] px-3 py-1.5 text-xs font-medium text-[#2a6c55]">
                <ChartColumn className="h-3.5 w-3.5" />
                Top 5 masjid
              </span>
            }
          >
            <RankingList
              items={analytics.topMasjids}
              emptyLabel="Belum ada data masjid yang bisa dirangking."
              valueLabel={(item) => formatCurrency(item.value)}
            />
          </SectionCard>

          <SectionCard
            title="Needs Attention"
            subtitle="Masjid aktif dengan skor aktivitas rendah agar admin cepat melihat area yang melemah."
            action={
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fff0ee] px-3 py-1.5 text-xs font-medium text-[#a14a40]">
                <CircleAlert className="h-3.5 w-3.5" />
                Bottom 5 aktivitas
              </span>
            }
          >
            <RankingList
              items={analytics.bottomMasjids}
              emptyLabel="Belum ada data aktivitas masjid yang bisa dianalisis."
              valueLabel={(item) => `${Math.round(item.value)} poin`}
              tone="danger"
            />
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Top Campaign"
            subtitle="Campaign dengan progress terbaik terhadap target yang sudah ditetapkan."
          >
            <RankingList
              items={analytics.topCampaigns}
              emptyLabel="Belum ada campaign untuk dibandingkan."
              valueLabel={(item) => `${Math.round(item.value)}%`}
            />
          </SectionCard>

          <SectionCard
            title="Campaign Perlu Perhatian"
            subtitle="Campaign berumur lebih tua atau progress terlalu rendah sehingga layak dievaluasi."
          >
            <RankingList
              items={analytics.attentionCampaigns}
              emptyLabel="Belum ada campaign yang perlu perhatian khusus."
              valueLabel={(item) => item.badge || `${Math.round(item.value)}%`}
              tone="danger"
            />
          </SectionCard>
        </div>
      </div>
    </SystemAdminLayout>
  );
}
