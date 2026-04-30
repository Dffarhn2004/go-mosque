import TakmirLayout from "../../../layouts/takmir_layout";
import {
  Calendar,
  Save,
  MapPin,
  Phone,
  Building,
  Users,
  Target,
  Heart,
  Globe,
} from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import toast from "react-hot-toast";
import { TakmirPageHeaderSkeleton } from "../../../components/common/Skeleton";

const KelolaIdentitasMasjidPage = () => {
  // Format ISO ke "yyyy-MM-dd" untuk input type="date"
  const formatDateToInput = (isoDateStr) => {
    if (!isoDateStr) return "";
    return new Date(isoDateStr).toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    namaMasjid: "",
    alamatMasjid: "",
    nomorTelponMasjid: "",
    tahunBerdiri: "",
    statusKepemilikan: "",
    luasTanah: "",
    kapasitasMasjid: "",
    deskripsiMasjid: "",
    visi: "",
    misi: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data from API
  useEffect(() => {
    const fetchMasjidData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/masjid/takmir");
        console.log("Fetched masjid data:", response.data);

        const dataMasjid = response.data.data; // Adjust based on your API response structure
        // Map API data to form fields
        // Adjust the field mapping based on your actual API response structure
        setFormData({
          namaMasjid: dataMasjid.Nama,
          alamatMasjid: dataMasjid.Alamat || dataMasjid.alamat || "",
          nomorTelponMasjid:
            dataMasjid.NomorTelepon ||
            dataMasjid.nomorTelpon ||
            dataMasjid.telepon ||
            "",
          tahunBerdiri: formatDateToInput(dataMasjid.TanggalBerdiri) || "",
          statusKepemilikan: dataMasjid.StatusKepemilikan || "",
          luasTanah: dataMasjid.LuasTanah || "",
          kapasitasMasjid:
            dataMasjid.Kapasitas_Jamaah || dataMasjid.kapasitas || "",
          deskripsiMasjid: dataMasjid.Deskripsi || dataMasjid.deskripsi || "",
          visi: dataMasjid.Visi || "",
          misi: dataMasjid.Misi || "",
        });

        console.log("Form data set:", formData);

        setError(null);
      } catch (err) {
        console.error("Error fetching masjid data:", err);
        setError("Gagal memuat data masjid. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchMasjidData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const updatedData = {};

      if (formData.namaMasjid.trim()) {
        updatedData.Nama = formData.namaMasjid.trim();
      }
      if (formData.alamatMasjid.trim()) {
        updatedData.Alamat = formData.alamatMasjid.trim();
      }
      if (formData.nomorTelponMasjid.trim()) {
        updatedData.NomorTelepon = formData.nomorTelponMasjid.trim();
      }
      if (formData.tahunBerdiri) {
        updatedData.TanggalBerdiri = formData.tahunBerdiri;
      }
      if (formData.statusKepemilikan) {
        updatedData.StatusKepemilikan = formData.statusKepemilikan;
      }
      if (formData.luasTanah !== "" && !Number.isNaN(parseFloat(formData.luasTanah))) {
        updatedData.LuasTanah = parseFloat(formData.luasTanah);
      }
      if (formData.kapasitasMasjid !== "" && !Number.isNaN(parseInt(formData.kapasitasMasjid, 10))) {
        updatedData.Kapasitas_Jamaah = parseInt(formData.kapasitasMasjid, 10);
      }
      if (formData.deskripsiMasjid.trim()) {
        updatedData.Deskripsi = formData.deskripsiMasjid.trim();
      }
      if (formData.visi.trim()) {
        updatedData.Visi = formData.visi.trim();
      }
      if (formData.misi.trim()) {
        updatedData.Misi = formData.misi.trim();
      }

      if (Object.keys(updatedData).length === 0) {
        toast.error("Tidak ada perubahan yang bisa disimpan.");
        return;
      }

      // Submit updated data back to API
      const response = await axiosInstance.patch("/masjid", updatedData);

      if (response.data.statusCode != 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // This is not correct syntax. To store the masjid name in localStorage, use:
      // Get the existing data
      const existingData = JSON.parse(localStorage.getItem("masjid") || "{}");

      // Update just the Nama property
      if (updatedData.Nama) {
        existingData.Nama = updatedData.Nama;
      }

      // Save the updated object back to localStorage
      localStorage.setItem("masjid", JSON.stringify(existingData));
      // You might want to show a success message here
      toast.success("Data berhasil disimpan!");
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading && Object.values(formData).every((val) => val === "")) {
    return (
      <TakmirLayout>
        <TakmirPageHeaderSkeleton showActions />
      </TakmirLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TakmirLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="p-6 lg:p-8 space-y-8">
          {/* Header Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-500/5 rounded-2xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl shadow-lg">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Kelola Masjid
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <p className="font-medium">
                      {new Date().toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Identitas Masjid
              </h2>
              <p className="text-gray-600">
                Kelola dan update informasi masjid Anda
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Nama Masjid */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Building className="w-4 h-4 text-teal-600" />
                    Nama Masjid
                  </label>
                  <input
                    type="text"
                    name="namaMasjid"
                    value={formData.namaMasjid}
                    onChange={handleInputChange}
                    className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    placeholder="Masukkan nama masjid"
                  />
                </div>

                {/* Alamat Masjid */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    Alamat Masjid
                  </label>
                  <input
                    type="text"
                    name="alamatMasjid"
                    value={formData.alamatMasjid}
                    onChange={handleInputChange}
                    className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>

                {/* Nomor Telpon Masjid */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Phone className="w-4 h-4 text-teal-600" />
                    Nomor Telpon Masjid
                  </label>
                  <input
                    type="tel"
                    name="nomorTelponMasjid"
                    value={formData.nomorTelponMasjid}
                    onChange={handleInputChange}
                    className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    placeholder="Contoh: 021-12345678"
                  />
                </div>

                {/* Tahun Berdiri */}
                {/* Tahun Berdiri */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Calendar className="w-4 h-4 text-teal-600 " />
                    Tahun Berdiri
                  </label>
                  <input
                    type="date"
                    name="tahunBerdiri"
                    value={formData.tahunBerdiri}
                    onChange={handleInputChange}
                    className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                {/* Status Kepemilikan */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Building className="w-4 h-4 text-teal-600" />
                    Status Kepemilikan
                  </label>
                  <select
                    name="statusKepemilikan"
                    value={formData.statusKepemilikan}
                    onChange={handleInputChange}
                    className="w-full px-4 text-black py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Pilih status kepemilikan</option>
                    <option value="MILIK_SENDIRI">Milik Sendiri</option>
                    <option value="TANAH_WAKAF">Tanah Wakaf</option>
                    <option value="SEWA">Sewa</option>
                    <option value="HIBAH">Hibah</option>
                  </select>
                </div>

                {/* Luas Tanah */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Globe className="w-4 h-4 text-teal-600" />
                    Luas Tanah
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="luasTanah"
                      value={formData.luasTanah}
                      onChange={handleInputChange}
                      className="w-full text-black px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                      placeholder="500"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      m²
                    </span>
                  </div>
                </div>

                {/* Kapasitas Masjid */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Users className="w-4 h-4 text-teal-600" />
                    Kapasitas Masjid
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="kapasitasMasjid"
                      value={formData.kapasitasMasjid}
                      onChange={handleInputChange}
                      className="w-full text-black px-4 py-3 pr-16 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                      placeholder="200"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      orang
                    </span>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-6">
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informasi Tambahan
                  </h3>
                </div>

                {/* Deskripsi Masjid */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Building className="w-4 h-4 text-teal-600" />
                    Deskripsi Masjid
                  </label>
                  <textarea
                    name="deskripsiMasjid"
                    value={formData.deskripsiMasjid}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Deskripsikan masjid Anda secara singkat..."
                  />
                </div>

                {/* Visi and Misi */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Visi */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Target className="w-4 h-4 text-teal-600" />
                      Visi
                    </label>
                    <textarea
                      name="visi"
                      value={formData.visi}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Tuliskan visi masjid..."
                    />
                  </div>

                  {/* Misi */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Heart className="w-4 h-4 text-teal-600" />
                      Misi
                    </label>
                    <textarea
                      name="misi"
                      value={formData.misi}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Tuliskan misi masjid..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </TakmirLayout>
  );
};

export default KelolaIdentitasMasjidPage;
