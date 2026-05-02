import { Building2, FileText, HandCoins, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Building2,
    title: "Telusuri profil masjid",
    description:
      "Pelajari identitas, lokasi, fasilitas, dan kebutuhan masjid sebelum menyalurkan donasi.",
  },
  {
    icon: FileText,
    title: "Periksa transparansi",
    description:
      "Lihat laporan keuangan dan aktivitas masjid sebagai bahan pertimbangan sebelum berdonasi.",
  },
  {
    icon: HandCoins,
    title: "Pilih jenis donasi",
    description:
      "Salurkan donasi umum untuk masjid atau pilih campaign khusus sesuai tujuan bantuan Anda.",
  },
];

const trustPoints = [
  "Daftar masjid aktif lebih mudah dijelajahi",
  "Donasi umum tidak tertutup oleh campaign",
  "Keputusan donatur jadi lebih informed",
  "Takmir punya profil masjid yang lebih kuat",
];

const TransparencyHighlights = () => {
  return (
    <section className="bg-white px-6 py-16 md:px-10 lg:px-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-800">
              <ShieldCheck className="h-4 w-4" />
              Donasi yang lebih terarah
            </span>
            <h2 className="mt-5 text-3xl font-bold text-gray-900 md:text-5xl">
              Membantu donatur memahami masjid sebelum memilih jenis donasi.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">
              GoQu dirancang agar proses donasi terasa lebih jelas, mulai dari
              mengenal profil masjid hingga menyalurkan bantuan dengan lebih
              yakin.
            </p>
          </div>

          <div className="rounded-[32px] bg-[#f4f8fb] p-8 ring-1 ring-sky-100">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
              Keunggulan GoQu
            </p>
            <div className="mt-5 space-y-3">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-2xl bg-white px-4 py-4 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-black/5"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                key={step.title}
                className="rounded-[28px] bg-[#fbfcf8] p-8 shadow-sm ring-1 ring-black/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-gray-600">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TransparencyHighlights;
