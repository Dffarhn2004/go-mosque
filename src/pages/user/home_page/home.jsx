import { useNavigate } from "react-router-dom";
import Footer from "../../../components/common/LandingPage/Footer";
import Navbar from "../../../components/common/LandingPage/Navbar";
import MetaData from "../../../components/common/MetaData";
import MosqueCardSection from "../../../components/common/Home/MosqueCardSection";
import { Building2, History } from "lucide-react";
import { getDonorNavbarUser, getStoredUser } from "../../../utils/authStorage";

function HomeUser() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const userName = user?.NamaLengkap || "Donatur";
  const navbarUser = getDonorNavbarUser();

  return (
    <>
      <MetaData
        title="Beranda Donatur"
        description="Kelola donasi Anda, jelajahi masjid terdaftar, dan lihat riwayat kontribusi."
        url="/home"
      />
      <Navbar
        position="static"
        user={navbarUser}
      />

      <main className="min-h-screen bg-[linear-gradient(180deg,#eef7f0_0%,#ffffff_20%,#f8fafc_100%)]">
        <section className="mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-16">
          <div className="rounded-[32px] border border-emerald-100 bg-white/90 p-6 shadow-sm backdrop-blur md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Beranda Donatur
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
              Halo, {userName}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Mulai donasi ke masjid pilihan atau cek riwayat kontribusimu.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/masjid-terdaftar")}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Building2 className="h-4 w-4" />
                Jelajahi Masjid
              </button>
              <button
                type="button"
                onClick={() => navigate("/riwayat")}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <History className="h-4 w-4" />
                Riwayat Donasi
              </button>
            </div>
          </div>
        </section>

        <MosqueCardSection
          title="Campaign Aktif"
          subtitle="Campaign donasi yang sedang dibuka dari masjid terdaftar."
          seeMore={false}
          position="px-6 md:px-10 lg:px-16 pb-16"
          limit={3}
        />
      </main>

      <Footer />
    </>
  );
}

export default HomeUser;
