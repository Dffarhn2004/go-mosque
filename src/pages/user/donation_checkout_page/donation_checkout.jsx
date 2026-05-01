import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Users,
  Target,
  CheckCircle,
  CreditCard,
  Wallet,
  Building,
  DollarSign,
} from "lucide-react";
import MetaData from "../../../components/common/MetaData";
import Navbar from "../../../components/common/LandingPage/Navbar";
import Footer from "../../../components/common/LandingPage/Footer";
import axiosInstance from "../../../api/axiosInstance";
import formatCurrency from "../../../utils/formatCurrency";

function CheckoutDonation() {
  const { campaignId, masjidId } = useParams();
  const isGeneralDonation = Boolean(masjidId);
  const [formData, setFormData] = useState({
    donorName: "",
    email: "",
    phone: "",
    keterangan: "", // Default message
    customAmount: "",
    selectedAmount: null,
    paymentMethod: "card",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [donationTarget, setDonationTarget] = useState(null);

  const predefinedAmounts = [
    { value: 50000, label: "Rp. 50.000" },
    { value: 100000, label: "Rp. 100.000" },
    { value: 250000, label: "Rp. 250.000" },
    { value: 500000, label: "Rp. 500.000" },
    { value: 1000000, label: "Rp. 1.000.000" },
    { value: 2000000, label: "Rp. 2.000.000" },
  ];

  const paymentMethods = [
    { id: "card", name: "Kartu Kredit/Debit", icon: CreditCard },
    { id: "ewallet", name: "E-Wallet", icon: Wallet },
    { id: "bank", name: "Transfer Bank", icon: Building },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmountSelect = (amount) => {
    setFormData((prev) => ({
      ...prev,
      selectedAmount: amount,
      customAmount: "",
    }));
  };

  const handleCustomAmountChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      customAmount: e.target.value,
      selectedAmount: null,
    }));
  };

  const handleCurrencyInput = (name, value) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^\d]/g, "");
    setFormData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Prepare the data to send to backend
      const donationData = {
        Nama: formData.donorName,
        Email: formData.email,
        NoTelepon: formData.phone,
        Keterangan: formData.keterangan,
        JumlahDonasi: getSelectedAmount(),
        StatusDonasi: "Sukses",
        DonationChannel: isGeneralDonation ? "GENERAL" : "CAMPAIGN",
        ...(isGeneralDonation
          ? { masjidId }
          : { id_donasi_masjid: campaignId }),
      };

      // Make API call to backend
      const response = await axiosInstance.post(`/donasi`, donationData);

      if (response.data.statusCode != 201) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // const result = await response.json();
      // console.log("Donation successful:", result);

      setShowSuccess(true);
    } catch (error) {
      console.error("Error submitting donation:", error);
      setError("Terjadi kesalahan saat memproses donasi. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const getSelectedAmount = () => {
    return formData.customAmount
      ? parseInt(formData.customAmount)
      : formData.selectedAmount;
  };

  useEffect(() => {
    const fetchTarget = async () => {
      try {
        const response = isGeneralDonation
          ? await axiosInstance.get(`/masjid/${masjidId}`)
          : await axiosInstance.get(`/donasi-masjid/${campaignId}`);

        setDonationTarget(response.data.data || null);
      } catch (fetchError) {
        console.error("Error fetching donation target:", fetchError);
      }
    };

    fetchTarget();
  }, [campaignId, isGeneralDonation, masjidId]);

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Donasi Berhasil!
          </h2>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            Terima kasih atas kebaikan Anda. Semoga Allah membalas kebaikan
            Anda.
          </p>
          <div className="text-emerald-600 text-2xl font-bold">
            Rp. {getSelectedAmount()?.toLocaleString("id-ID")}
          </div>

          <button
            onClick={handleGoBack}
            className="mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-full font-semibold text-lg hover:from-emerald-700 hover:to-teal-700 transition-colors shadow-lg"
          >
            Kembali ke Halaman Sebelumnya
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <MetaData></MetaData>
      <Navbar
        position="static"
        user={{
          name: JSON.parse(localStorage.getItem("user"))?.NamaLengkap || "User",
          role: "Donatur",
          avatar:
            "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        {/* Header */}
        <div className="text-black py-6 px-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center">
            <button
              onClick={handleGoBack}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors mr-4"
            >
              <ArrowLeft className="w-7 h-7" />
            </button>
            <p className="text-2xl lg:text-3xl font-bold">Kotak Donasi</p>
            <div className="ml-4 hidden rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 md:block">
              {isGeneralDonation ? "Donasi Umum Masjid" : "Campaign Khusus"}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Quranic Verse & Info */}
            <div className="space-y-8">
              {/* Quranic Verse Card */}
              <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10">
                <div className="text-center mb-8">
                  <div className="text-arabic text-3xl lg:text-4xl mb-3 font-serif">
                    سُوۡرَةُ البَقَرَة
                  </div>
                  <div className="text-gray-600 text-base lg:text-lg">
                    Al-Baqarah - Ayat 261
                  </div>
                </div>

                <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-left">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Tujuan Donasi
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-gray-900">
                    {isGeneralDonation
                      ? donationTarget?.GeneralDonationTitle ||
                        `Donasi untuk ${donationTarget?.Nama || "Masjid"}`
                      : donationTarget?.Nama || "Campaign Donasi"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {isGeneralDonation
                      ? donationTarget?.Nama || "Masjid"
                      : donationTarget?.masjid?.Nama || "Masjid"}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">
                    {isGeneralDonation
                      ? donationTarget?.GeneralDonationDescription ||
                        donationTarget?.Deskripsi ||
                        "Donasi umum ini akan membantu operasional dan kebutuhan rutin masjid."
                      : donationTarget?.Deskripsi ||
                        "Donasi Anda akan disalurkan ke campaign yang sedang dibuka."}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 lg:p-8 mb-6">
                  <div
                    className="text-right text-black text-arabic text-xl lg:text-2xl leading-relaxed mb-4"
                    style={{ fontFamily: "Amiri, serif" }}
                  >
                    مَثَلُ الَّذِيْنَ يُنْفِقُوْنَ اَمْوَالَهُمْ فِيْ سَبِيْلِ
                    اللّٰهِ كَمَثَلِ حَبَّةٍ اَنْۢبَتَتْ سَبْعَ سَنَابِلَ فِيْ
                    كُلِّ سُنْۢبُلَةٍ مِّائَةُ حَبَّةٍۗ وَاللّٰهُ يُضٰعِفُ
                    لِمَنْ يَّشَاۤءُۗ وَاللّٰهُ وَاسِعٌ عَلِيْمٌ
                  </div>
                </div>

                <div className="text-gray-700 text-base lg:text-lg leading-relaxed">
                  <p className="mb-4">
                    "Perumpamaan orang-orang yang menginfakkan hartanya di jalan
                    Allah adalah seperti (orang-orang yang menabur) sebutir biji
                    (benih) yang menumbuhkan tujuh tangkai, pada setiap tangkai
                    ada seratus biji. Allah melipatgandakan (pahala) bagi siapa
                    yang Dia kehendaki. Allah Mahaluas lagi Maha Mengetahui."
                  </p>
                  <p className="text-emerald-600 font-semibold text-lg">
                    Setiap kebaikan yang kita lakukan akan dibalas berlipat
                    ganda oleh Allah SWT.
                  </p>
                </div>
              </div>

              {/* Impact Statistics */}
              <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Target className="w-6 h-6 lg:w-7 lg:h-7 text-emerald-600 mr-3" />
                  Dampak Donasi Anda
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-emerald-50 rounded-2xl p-6 lg:p-8 text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-emerald-600 mb-2">
                      1,234
                    </div>
                    <div className="text-sm lg:text-base text-gray-600">
                      Keluarga Terbantu
                    </div>
                  </div>
                  <div className="bg-teal-50 rounded-2xl p-6 lg:p-8 text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-teal-600 mb-2">
                      567
                    </div>
                    <div className="text-sm lg:text-base text-gray-600">
                      Masjid Terdukung
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Donation Form */}
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10">
              <div className="flex items-center mb-8">
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-5">
                  <Heart className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
                    Profil Donatur
                  </h2>
                  <p className="text-gray-600 text-base lg:text-lg">
                    Lengkapi informasi Anda
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Donor Information */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-base lg:text-lg font-semibold text-gray-700 mb-3">
                      Nama Donatur
                    </label>
                    <input
                      type="text"
                      name="donorName"
                      value={formData.donorName}
                      onChange={handleInputChange}
                      className="w-full text-black px-5 py-4 lg:px-6 lg:py-5 text-base lg:text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-base lg:text-lg font-semibold text-gray-700 mb-3">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full text-black px-5 py-4 lg:px-6 lg:py-5 text-base lg:text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="nama@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-base lg:text-lg font-semibold text-gray-700 mb-3">
                      No. Telepon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full text-black px-5 py-4 lg:px-6 lg:py-5 text-base lg:text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-base lg:text-lg font-semibold text-gray-700 mb-3">
                      keterangan
                    </label>
                    <input
                      type="text"
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleInputChange}
                      className="w-full text-black px-5 py-4 lg:px-6 lg:py-5 text-base lg:text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="isi kan pesan untuk masjid"
                      required
                    />
                  </div>
                </div>

                {/* Donation Amount */}
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-6">
                    Nominal Donasi
                  </h3>

                  {/* Custom Amount Input */}
                  <div className="mb-6">
                    <label className="block text-base lg:text-lg font-semibold text-gray-700 mb-3">
                      Masukkan Nominal
                    </label>
                    <div className="relative">
                      <span className="absolute left-5 lg:left-6 top-1/2 transform -translate-y-1/2 text-gray-500 text-base lg:text-lg">
                        Rp.
                      </span>
                      <input
                        type="text"
                        name="customAmount"
                        value={
                          formData.customAmount
                            ? formatCurrency(formData.customAmount).replace(
                                "Rp",
                                ""
                              )
                            : ""
                        }
                        onChange={(e) =>
                          handleCurrencyInput("customAmount", e.target.value)
                        }
                        className="w-full text-black pl-14 lg:pl-16 pr-5 lg:pr-6 py-4 lg:py-5 text-base lg:text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="0"
                        min="10000"
                      />
                    </div>
                  </div>

                  {/* Predefined Amounts */}
                  <div>
                    <label className="block text-base lg:text-lg font-semibold text-gray-700 mb-4">
                      Atau Pilih Nominal
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {predefinedAmounts.map((amount) => (
                        <button
                          key={amount.value}
                          type="button"
                          onClick={() => handleAmountSelect(amount.value)}
                          className={`px-5 py-4 lg:px-6 lg:py-5 rounded-2xl border-2 transition-all font-semibold text-base lg:text-lg ${
                            formData.selectedAmount === amount.value
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-gray-200 hover:border-emerald-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {amount.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-6">
                    Metode Pembayaran
                  </h3>
                  <div className="space-y-4">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <label
                          key={method.id}
                          className={`flex items-center p-5 lg:p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                            formData.paymentMethod === method.id
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-200 hover:bg-gray-50 hover:border-emerald-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={formData.paymentMethod === method.id}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div
                            className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                              formData.paymentMethod === method.id
                                ? "border-emerald-500"
                                : "border-gray-300"
                            }`}
                          >
                            {formData.paymentMethod === method.id && (
                              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                            )}
                          </div>
                          <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-gray-600 mr-4" />
                          <span className="text-gray-700 font-semibold text-base lg:text-lg">
                            {method.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (!formData.customAmount && !formData.selectedAmount)
                  }
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-5 lg:py-6 rounded-2xl font-bold text-lg lg:text-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-2xl"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Memproses Donasi...
                    </div>
                  ) : (
                    <>
                      Kirimkan Donasi
                      {getSelectedAmount() && (
                        <span className="ml-2 font-normal">
                          (Rp. {getSelectedAmount().toLocaleString("id-ID")})
                        </span>
                      )}
                    </>
                  )}
                </button>
              </form>

              {/* Trust Indicators */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-center text-base lg:text-lg text-gray-600">
                  <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-500 mr-3" />
                  Donasi Anda aman dan tersalurkan dengan baik
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer></Footer>
    </>
  );
}

export default CheckoutDonation;
