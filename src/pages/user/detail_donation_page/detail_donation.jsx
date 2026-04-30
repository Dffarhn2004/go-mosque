import { useNavigate, useParams } from "react-router-dom"; // 1. Import useNavigate
import Navbar from "../../../components/common/LandingPage/Navbar";
import MetaData from "../../../components/common/MetaData";
import Footer from "../../../components/common/LandingPage/Footer";
import MosqueCardSection from "../../../components/common/Home/MosqueCardSection";
import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import formatCurrency from "../../../utils/formatCurrency";

// SVG component for the decorative curve
const TopCurve = () => (
  <svg
    className="absolute top-0 left-0 w-full"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1440 120"
  >
    <path
      d="M1440,89c-28.53-20.56-122.28-79.31-253.33-79.31C959.33,9.69,870,110.31,586.67,110.31,303.33,110.31,214,9.69,82.67,9.69,49.33,9.69,0,22.31,0,22.31V0H1440Z"
      fill="rgba(255,255,255,0.08)"
    ></path>
  </svg>
);

function DetailDonation() {
  const { id } = useParams(); // get the id from route param
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const res = await axiosInstance.get("/donasi-masjid/" + id);
        setDonation(res.data.data); // sesuaikan struktur response lo
        console.log("Fetched donation campaigns:", res.data.data);
      } catch (error) {
        console.error("Error fetching donation campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id]);

  if (loading) return <p className="text-center">Loading campaigns...</p>;
  if (!donation) return <p className="text-center">Donasi tidak ditemukan</p>;

  const currentDonation = donation.UangDonasiTerkumpul;
  const targetDonation = donation.TargetUangDonasi;
  const usedDonation = donation.UangPengeluaran || 0;
  const remainingDonation = currentDonation - usedDonation;
  const progress = (currentDonation / targetDonation) * 100;
  const usageProgress = currentDonation > 0 ? (usedDonation / currentDonation) * 100 : 0;
  
  const progressData = donation.pengeluaran_donasi_masjid.map((item) => ({
    id: item.id,
    image: item.FotoPengeluaran,
    title: item.TujuanPengeluaran,
    description: item.DeskripsiPengeluaran,
    amount: item.UangPengeluaran,
    category: item.kategori_pengeluaran?.Nama || "-",
    createdAt: item.CreatedAt,
  }));

  return (
    <>
      <MetaData />
      <Navbar
        position="static"
        user={{
          name: JSON.parse(localStorage.getItem("user"))?.NamaLengkap || "User",
          role: "Donatur",
          avatar:
            "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
        }}
      />

      <main>
        {/* === Top Section: Green Background === */}
        <section className="bg-[#0C6839] text-white relative overflow-hidden">
          <TopCurve />
          <div className="container mx-auto px-6 pt-8 pb-20 relative z-10">
            {/* 3. Tombol Kembali ditambahkan di sini */}
            <button
              onClick={() => navigate(-1)} // Aksi untuk kembali
              className="flex items-center gap-2 text-white font-semibold mb-6 group"
              aria-label="Kembali ke halaman sebelumnya"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Kembali
            </button>

            <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center">
              {donation.Nama}
            </h1>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left Section */}
              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-gray-200">
                    Nama Masjid
                  </h3>
                  <p className="text-2xl font-bold">{donation.masjid.Nama}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-gray-200">
                    Lokasi Masjid
                  </h3>
                  <p className="text-lg text-gray-100 leading-relaxed">
                    {donation.masjid.Alamat}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-gray-200">
                    Deskripsi
                  </h3>
                  <p className="text-lg text-gray-100 leading-relaxed">
                    {donation.Deskripsi}
                  </p>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex flex-col space-y-6">
                <img
                  src={donation.FotoDonasi}
                  alt="Foto Masjid An-nur"
                  className="w-full h-80 object-cover rounded-xl shadow-2xl"
                />
                <div className="w-full bg-black/20 rounded-full h-5 overflow-hidden border border-white/30">
                  <div
                    className="bg-lime-400 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-center">
                  <p className="font-medium text-lg">
                    <span className="font-bold text-lime-300">
                      {formatCurrency(currentDonation)}
                    </span>{" "}
                    / {formatCurrency(targetDonation)}
                  </p>
                  <p className="text-sm text-gray-200">
                    Progress: {progress.toFixed(2)}%
                  </p>
                </div>
                <div className="flex gap-4 w-full justify-center pt-4">
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                  
                    onClick={() => navigate(`/masjid/${donation.masjid.id}`)} // Navigate to detail page
                  >
                    Lihat Detail Masjid
                  </button>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                    onClick={() => navigate(`/home/donation/${id}/checkout`)} // Navigate to donation page
                  >
                    Ayo Donasi Segera →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === Summary Section: Dana Terkumpul === */}
        <section className="bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto px-6 py-16">
            <h2 className="text-3xl text-left font-bold text-gray-900  mb-12">
              Ringkasan Dana
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Total Dana Terkumpul */}
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-l-4 border-blue-500">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Total Dana Terkumpul
                </h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(currentDonation)}
                </p>
                <p className="text-sm text-gray-600">
                  dari target {formatCurrency(targetDonation)}
                </p>
              </div>

              {/* Dana Telah Digunakan */}
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-l-4 border-red-500">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Dana Telah Digunakan
                </h3>
                <p className="text-3xl font-bold text-red-600 mb-2">
                  {formatCurrency(usedDonation)}
                </p>
                <p className="text-sm text-gray-600">
                  {usageProgress.toFixed(1)}% dari dana terkumpul
                </p>
              </div>

              {/* Dana Tersisa */}
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-l-4 border-green-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Dana Tersisa
                </h3>
                <p className="text-3xl font-bold text-green-600 mb-2">
                  {formatCurrency(remainingDonation)}
                </p>
                <p className="text-sm text-gray-600">
                  {(100 - usageProgress).toFixed(1)}% dari dana terkumpul
                </p>
              </div>
            </div>

            {/* Progress Bar Penggunaan Dana */}
            {/* <div className="max-w-3xl mx-auto mt-12">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-700">Penggunaan Dana</span>
                <span className="text-sm font-medium text-gray-700">{usageProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                  style={{ width: `${usageProgress}%` }}
                >
                  {usageProgress > 10 && (
                    <span className="text-white text-xs font-medium">
                      {formatCurrency(usedDonation)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Dana Digunakan</span>
                <span>Dana Tersisa: {formatCurrency(remainingDonation)}</span>
              </div>
            </div> */}
          </div>
        </section>

        {/* === Bottom Section: White Background === */}
        <section className="bg-white">
          <div className="container mx-auto px-6 py-20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Progress Penggunaan Dana
              </h2>
            </div>

            {progressData && progressData.length > 0 ? (
              <div className="flex space-x-6 overflow-x-auto pb-4 -mx-6 px-6">
                {progressData.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                  >
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"
                      }
                      alt={item.title}
                      className="w-full h-40 object-cover rounded-t-2xl"
                    />
                    <div className="p-4 flex flex-col">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "Tanggal belum tersedia"}
                      </p>
                      <p className="mt-3 flex-grow text-base leading-relaxed text-gray-600 line-clamp-3">
                        {item.description || "Belum ada deskripsi pengeluaran."}
                      </p>
                      <div className="mt-4">
                        <span className="bg-purple-100 text-purple-700 font-semibold text-base px-4 py-1.5 rounded-md inline-block shadow-sm">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedExpense(item)}
                        className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                      >
                        Lihat Detail Pengeluaran
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Belum Ada Pengeluaran
                </h3>
                <p className="text-gray-600 text-center max-w-md leading-relaxed">
                  Belum ada pengeluaran yang dilakukan untuk program ini.
                  Pengeluaran akan ditampilkan di sini setelah ada aktivitas.
                </p>
              </div>
            )}

            <div className="mt-16 text-center">
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold w-full max-w-lg mx-auto py-4 rounded-xl shadow-lg transition duration-300 text-xl transform hover:scale-105"
                onClick={() => navigate(`/home/donation/${id}/checkout`)} // Navigate to donation page
              >
                Ikut Berdonasi Sekarang
              </button>
            </div>
          </div>
        </section>
        <section className="bg-gradient-to-br from-[#0C6839] via-[#0b5b33] to-[#094b2b]">
          <div className="container mx-auto px-6 py-20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white drop-shadow-md">
                Masjid Lain Yang Membutuhkan
              </h2>
            </div>

            <MosqueCardSection title="" position="" />
          </div>
        </section>
      </main>

      {selectedExpense && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedExpense(null)}
              className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-700 shadow transition hover:bg-gray-100"
            >
              Tutup
            </button>

            <img
              src={
                selectedExpense.image ||
                "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"
              }
              alt={selectedExpense.title}
              className="h-64 w-full rounded-t-3xl object-cover"
            />

            <div className="space-y-6 p-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-600">
                  Detail Pengeluaran
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  {selectedExpense.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {selectedExpense.createdAt
                    ? new Date(selectedExpense.createdAt).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Tanggal belum tersedia"}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-green-50 p-4">
                  <p className="text-sm text-green-800">Jumlah Pengeluaran</p>
                  <p className="mt-1 text-2xl font-bold text-green-700">
                    {formatCurrency(selectedExpense.amount)}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">Kategori</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {selectedExpense.category}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-700">Deskripsi</p>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-600">
                  {selectedExpense.description || "Belum ada deskripsi pengeluaran."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default DetailDonation;
