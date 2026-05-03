import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import MosqueCardSection from "../../../components/common/Home/MosqueCardSection";
import Footer from "../../../components/common/LandingPage/Footer";
import Navbar from "../../../components/common/LandingPage/Navbar";
import MetaData from "../../../components/common/MetaData";
import { useSearchParams } from "react-router-dom";
import { getDonorNavbarUser } from "../../../utils/authStorage";
import { routes } from "../../../routes";

function AllDonationUser() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const navbarUser = getDonorNavbarUser();

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  return (
    <>
      <MetaData
        title="Semua Donasi Masjid"
        description="Jelajahi semua kampanye donasi masjid yang aktif. Pilih masjid yang ingin Anda dukung untuk pembangunan, renovasi, dan kegiatan keislaman."
        keywords="donasi masjid aktif, kampanye donasi, wakaf online, sedekah masjid"
        url={routes.public.campaigns}
      />
      <Navbar
        position="static"
        user={navbarUser}
      />
      <main className="min-h-screen bg-[linear-gradient(180deg,#f5f8f3_0%,#ffffff_28%,#f8fafc_100%)]">
        <section className="px-6 pb-8 pt-10 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl rounded-[32px] bg-[#0C6839] px-6 py-8 text-white shadow-xl md:px-8 md:py-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100">
                Campaign Donasi
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
                Temukan campaign yang sesuai dengan tujuan donasi Anda.
              </h1>
              <p className="mt-4 text-base leading-7 text-emerald-50/90">
                Cari berdasarkan nama campaign, nama masjid, atau kebutuhan
                donasi untuk menemukan program yang sedang berjalan.
              </p>
            </div>

            <div className="mt-6 max-w-2xl rounded-[28px] border border-white/15 bg-white p-3 shadow-lg">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Cari campaign, masjid, atau kebutuhan tertentu"
                  className="w-full rounded-2xl border border-slate-200 py-4 pl-12 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 md:text-base"
                />
              </div>
            </div>
          </div>
        </section>

        <MosqueCardSection
          title={searchTerm ? `Hasil pencarian untuk "${searchTerm}"` : "Semua Campaign Aktif"}
          subtitle="Daftar berikut menampilkan campaign donasi yang sedang dibuka oleh masjid terdaftar."
          limit={20}
          seeMore={false}
          position="px-6 pb-16 md:px-10 lg:px-16"
          searchTerm={searchTerm}
        />
      </main>

      <Footer />
    </>
  );
}

export default AllDonationUser;
