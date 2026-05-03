import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MetaData from "../components/common/MetaData";
import Navbar from "../components/common/LandingPage/Navbar";
import Footer from "../components/common/LandingPage/Footer";
import { routes } from "../routes";

const principles = [
  {
    title: "Transparan",
    description:
      "Setiap donasi diarahkan ke laporan dan progres yang bisa dipantau, sehingga jamaah tidak berdonasi dalam ruang gelap.",
  },
  {
    title: "Mudah Digunakan",
    description:
      "Takmir dan donatur cukup fokus pada niat baiknya. Alur digitalnya kami buat ringkas dan langsung ke inti.",
  },
  {
    title: "Amanah",
    description:
      "GoQu dirancang untuk menjaga akuntabilitas pengelolaan dana masjid, baik untuk program khusus maupun donasi umum.",
  },
];

const workflows = [
  "Masjid atau takmir membuka identitas dan kebutuhan pendanaan secara jelas.",
  "Donatur dapat memilih campaign khusus atau menyalurkan donasi umum langsung ke masjid.",
  "Setiap transaksi masuk ke sistem pelaporan dan verifikasi agar jejak dana tetap terbaca.",
];

const highlights = [
  { value: "2 Jalur Donasi", label: "Campaign khusus dan donasi umum masjid" },
  { value: "Real-time", label: "Notifikasi dan verifikasi donasi untuk takmir" },
  { value: "Tertata", label: "Pencatatan jurnal, laporan, dan monitoring lebih rapi" },
];

function AboutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `https://goqu.vercel.app${routes.public.about}`,
        name: "Tentang Kami",
        url: `https://goqu.vercel.app${routes.public.about}`,
        description:
          "Profil GoQu sebagai platform donasi dan pengelolaan masjid yang transparan dan modern.",
        isPartOf: { "@id": "https://goqu.vercel.app/#website" },
      },
    ],
  };

  return (
    <>
      <MetaData
        title="Tentang Kami"
        description="Kenali GoQu, platform donasi dan pengelolaan masjid yang dibangun untuk transparansi, akuntabilitas, dan kemudahan jamaah serta takmir."
        url={routes.public.about}
        jsonLd={jsonLd}
      />
      <Navbar />

      <main className="bg-[#F5F8F6] text-slate-900">
        <section className="relative overflow-hidden bg-[#0C6839] px-5 pb-14 pt-20 sm:px-6 sm:pt-24 md:px-10 md:pb-20 lg:px-16 lg:pt-28 xl:px-24">
          <div className="absolute inset-0 opacity-25">
            <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-emerald-200 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-teal-300 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10">
            <div>
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-emerald-50">
                Tentang GoQu
              </span>
              <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                Platform digital yang membuat donasi masjid terasa lebih jelas,
                dekat, dan dapat dipertanggungjawabkan.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-50/90 sm:text-lg sm:leading-8">
                GoQu hadir untuk membantu takmir mengelola kebutuhan masjid
                secara modern dan membantu donatur menyalurkan kontribusi dengan
                rasa percaya yang lebih kuat.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <button
                  onClick={() => navigate(routes.public.mosques)}
                  className="w-full rounded-2xl bg-white px-6 py-3 font-semibold text-[#0C6839] transition hover:bg-emerald-50 sm:w-auto"
                >
                  Mulai Berdonasi
                </button>
                <button
                  onClick={() => navigate(routes.admin.login)}
                  className="w-full rounded-2xl border border-white/25 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/15 sm:w-auto"
                >
                  Daftarkan Masjid
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {highlights.map((item) => (
                <div
                  key={item.value}
                  className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm sm:p-6"
                >
                  <div className="text-2xl font-bold text-white">{item.value}</div>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/90">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-12 sm:px-6 md:px-10 md:py-16 lg:px-16 xl:px-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-emerald-100 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Kenapa GoQu
              </p>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">
                Donasi masjid tidak cukup hanya mudah. Ia juga harus terbaca.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Banyak kebutuhan masjid berjalan dari kepercayaan komunitas,
                tetapi tidak semua masjid punya alat yang nyaman untuk mengelola
                donasi, memisahkan campaign, mencatat pemasukan, dan memberi
                gambaran yang rapi kepada jamaah.
              </p>
              <p className="mt-4 text-base leading-8 text-slate-600">
                GoQu dibangun untuk menutup celah itu. Kami menggabungkan alur
                donasi, verifikasi, pelaporan, dan pengelolaan masjid dalam satu
                platform yang lebih terstruktur.
              </p>
            </div>

            <div className="rounded-[28px] bg-gradient-to-br from-emerald-600 via-[#11824B] to-[#0A4F2E] p-8 text-white shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-100">
                Cara Kerja
              </p>
              <div className="mt-6 space-y-5">
                {workflows.map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 font-semibold">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-base leading-7 text-emerald-50/95">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-12 sm:px-6 md:px-10 md:pb-16 lg:px-16 xl:px-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  Nilai Utama
                </p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  Fondasi produk yang kami jaga
                </h2>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {principles.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl text-emerald-700">
                    {item.title === "Transparan" ? "T" : item.title === "Mudah Digunakan" ? "M" : "A"}
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-6 md:px-10 md:pb-20 lg:px-16 xl:px-24">
          <div className="mx-auto max-w-7xl rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  Arah Kami
                </p>
                <h2 className="mt-4 text-3xl font-bold text-slate-900">
                  Membantu masjid terasa lebih siap mengelola amanah digital.
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                  Kami ingin GoQu menjadi ruang kerja yang membuat takmir lebih
                  tenang dan membuat donatur lebih yakin. Fokusnya bukan hanya
                  mengumpulkan dana, tetapi menjaga hubungan kepercayaan antara
                  masjid dan jamaah.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
                <button
                  onClick={() => navigate(routes.public.mosques)}
                  className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50 sm:w-auto"
                >
                  Lihat Masjid
                </button>
                <button
                  onClick={() => navigate(routes.public.landing)}
                  className="w-full rounded-2xl bg-[#0C6839] px-5 py-3 font-semibold text-white transition hover:bg-[#0A5A31] sm:w-auto"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default AboutPage;
