import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Heart,
  History,
  Landmark,
  Sparkles,
  Target,
} from "lucide-react";
import Footer from "../../../components/common/LandingPage/Footer";
import Navbar from "../../../components/common/LandingPage/Navbar";
import MetaData from "../../../components/common/MetaData";
import MosqueCardSection from "../../../components/common/Home/MosqueCardSection";
import GeneralDonationSection from "../../../components/common/Home/GeneralDonationSection";
import axiosInstance from "../../../api/axiosInstance";
import formatCurrency from "../../../utils/formatCurrency";
import formatDateWIB from "../../../utils/formatDate";
import { getDonorNavbarUser, getStoredUser } from "../../../utils/authStorage";
import {
  getCampaignDetailRoute,
  getMosqueDetailRoute,
  routes,
} from "../../../routes";

const quickActions = [
  {
    title: "Jelajahi Masjid",
    description: "Mulai dari profil masjid dan lihat kebutuhan yang terbuka.",
    icon: Building2,
    actionLabel: "Lihat daftar masjid",
    path: routes.public.mosques,
    tone: "from-emerald-500 to-emerald-600",
  },
  {
    title: "Buka Campaign",
    description: "Cari campaign yang sedang aktif dan siap menerima donasi.",
    icon: Target,
    actionLabel: "Lihat campaign",
    path: routes.public.campaigns,
    tone: "from-sky-500 to-sky-600",
  },
  {
    title: "Riwayat Saya",
    description: "Pantau transaksi yang sudah sukses, pending, atau gagal.",
    icon: History,
    actionLabel: "Lihat riwayat",
    path: routes.donor.history,
    tone: "from-amber-500 to-orange-500",
  },
];

function HomeUser() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const userName = user?.NamaLengkap || "Donatur";
  const navbarUser = getDonorNavbarUser();
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [recentDonations, setRecentDonations] = useState([]);
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalSuccessful: 0,
    totalAmount: 0,
    latestDonation: null,
  });

  useEffect(() => {
    const fetchDonorSummary = async () => {
      try {
        const response = await axiosInstance.get("/donasi");
        const donations = response.data?.data || [];
        const successfulDonations = donations.filter(
          (donation) => donation.StatusDonasi === "Sukses"
        );

        setRecentDonations(donations.slice(0, 3));
        setSummary({
          totalTransactions: donations.length,
          totalSuccessful: successfulDonations.length,
          totalAmount: successfulDonations.reduce(
            (accumulator, donation) =>
              accumulator + Number(donation.JumlahDonasi || 0),
            0
          ),
          latestDonation: donations[0] || null,
        });
      } catch (error) {
        console.error("Error fetching donor summary:", error);
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchDonorSummary();
  }, []);

  const welcomeMessage = useMemo(() => {
    if (summary.totalTransactions === 0) {
      return "Beranda ini menyiapkan titik awal: pilih masjid, lihat campaign, lalu mulai kontribusi pertamamu.";
    }

    if (summary.totalSuccessful > 0) {
      return "Kontribusimu sudah berjalan. Sekarang beranda ini bisa dipakai untuk lanjut eksplorasi, cek status terakhir, dan menemukan kebutuhan berikutnya.";
    }

    return "Kamu sudah mulai berinteraksi. Tinggal lanjutkan ke campaign atau donasi umum yang paling relevan.";
  }, [summary.totalSuccessful, summary.totalTransactions]);

  return (
    <>
      <MetaData
        title="Beranda Donatur"
        description="Jelajahi masjid, pantau aktivitas donasi, dan temukan campaign atau donasi umum yang relevan untuk Anda."
        url={routes.donor.home}
      />
      <Navbar position="static" user={navbarUser} />

      <main className="min-h-screen bg-[linear-gradient(180deg,#eef7f0_0%,#ffffff_18%,#f7faf8_100%)]">
        <section className="px-6 pb-8 pt-10 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#0C6839_0%,#11824B_45%,#0C4E2F_100%)] shadow-2xl">
            <div className="grid gap-8 px-6 py-8 md:px-8 md:py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
              <div className="text-white">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-50">
                  <Sparkles className="h-4 w-4" />
                  Beranda Donatur
                </div>
                <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
                  Halo, {userName}. Sekarang kamu bisa eksplor lebih banyak dari satu tempat.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50/90 md:text-lg">
                  {welcomeMessage}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(routes.public.mosques)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    <Landmark className="h-4 w-4" />
                    Lihat Masjid
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(routes.public.campaigns)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    <Target className="h-4 w-4" />
                    Buka Campaign
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(routes.donor.history)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    <History className="h-4 w-4" />
                    Cek Riwayat
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <SummaryCard
                  title="Transaksi"
                  value={loadingSummary ? "..." : summary.totalTransactions}
                  caption="Semua aktivitas donasi"
                />
                <SummaryCard
                  title="Berhasil"
                  value={loadingSummary ? "..." : summary.totalSuccessful}
                  caption="Donasi sukses tercatat"
                />
                <SummaryCard
                  title="Total Kontribusi"
                  value={loadingSummary ? "..." : formatCurrency(summary.totalAmount)}
                  caption="Akumulasi donasi sukses"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-8 md:px-10 lg:px-16">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                    Aktivitas Terakhir
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900">
                    Ringkasan yang harus kamu lihat dulu
                  </h2>
                </div>
                <Heart className="h-6 w-6 text-emerald-600" />
              </div>

              {summary.latestDonation ? (
                <div className="mt-6 rounded-[28px] bg-emerald-50 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                      {summary.latestDonation.DonationChannel === "GENERAL"
                        ? "Donasi Umum"
                        : "Campaign"}
                    </span>
                    <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                      <Clock3 className="h-4 w-4" />
                      {formatDateWIB(summary.latestDonation.CreatedAt)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    {getDonationTitle(summary.latestDonation)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Status terakhir donasimu adalah{" "}
                    <span className="font-semibold text-slate-900">
                      {summary.latestDonation.StatusDonasi}
                    </span>{" "}
                    dengan nominal{" "}
                    <span className="font-semibold text-emerald-700">
                      {formatCurrency(Number(summary.latestDonation.JumlahDonasi || 0))}
                    </span>
                    .
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(routes.donor.history)}
                      className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Lihat Semua Riwayat
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(getDonationActionPath(summary.latestDonation))}
                      className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Buka Halaman Terkait
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-[28px] border border-dashed border-emerald-200 bg-emerald-50/60 p-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    Belum ada aktivitas donasi
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Karena ini masih kosong, beranda kamu saya arahkan untuk eksplorasi: mulai dari masjid terdaftar atau campaign yang sedang aktif.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(routes.public.mosques)}
                      className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Mulai dari Masjid
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(routes.public.campaigns)}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Lihat Campaign
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                Jalur Cepat
              </p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                Mau mulai dari mana?
              </h2>
              <div className="mt-6 space-y-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.title}
                      type="button"
                      onClick={() => navigate(action.path)}
                      className="group w-full rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${action.tone} text-white shadow-sm`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-slate-900">
                            {action.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {action.description}
                          </p>
                          <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                            {action.actionLabel}
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>


        <GeneralDonationSection
          title="Donasi Umum Yang Bisa Langsung Kamu Bantu"
          position="px-6 pb-8 md:px-10 lg:px-16"
          limit={3}
        />

        <MosqueCardSection
          title="Campaign Aktif Untuk Dieksplor"
          subtitle="Kalau kamu ingin membantu kebutuhan yang lebih spesifik, mulai dari campaign yang target dan progresnya sudah terbuka."
          seeMore
          position="px-6 md:px-10 lg:px-16 pb-16"
          limit={3}
        />
      </main>

      <Footer />
    </>
  );
}

function SummaryCard({ title, value, caption }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 text-white backdrop-blur-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-50/85">
        {title}
      </p>
      <h3 className="mt-3 text-2xl font-bold">{value}</h3>
      <p className="mt-2 text-sm leading-6 text-emerald-50/80">{caption}</p>
    </div>
  );
}

function InsightCard({ icon: Icon, title, description }) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}

function getDonationTitle(donation) {
  if (donation.DonationChannel === "GENERAL") {
    return (
      donation.masjid?.GeneralDonationTitle ||
      `Donasi Umum ${donation.masjid?.Nama || "Masjid"}`
    );
  }

  return donation.donasi_masjid?.Nama || "Campaign Donasi";
}

function getDonationSubtitle(donation) {
  if (donation.DonationChannel === "GENERAL") {
    return donation.masjid?.Nama || "Masjid";
  }

  return donation.donasi_masjid?.masjid?.Nama || "Masjid";
}

function getDonationActionPath(donation) {
  if (donation.DonationChannel === "GENERAL") {
    return donation.masjid?.id
      ? getMosqueDetailRoute(donation.masjid.id)
      : routes.public.mosques;
  }

  return donation.donasi_masjid?.id
    ? getCampaignDetailRoute(donation.donasi_masjid.id)
    : routes.public.campaigns;
}

export default HomeUser;
