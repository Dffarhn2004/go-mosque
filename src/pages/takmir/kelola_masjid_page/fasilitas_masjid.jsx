import TakmirLayout from "../../../layouts/takmir_layout";
import {
  Calendar,
  Save,
  Plus,
  Trash2,
  Edit,
  Building,
  Star,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "../../../api/axiosInstance";
import toast from "react-hot-toast";
import { TakmirPageHeaderSkeleton, FacilityCardsSkeleton } from "../../../components/common/Skeleton";

const FasilitasMasjidPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [newFacility, setNewFacility] = useState("");
  const [isAddingFacility, setIsAddingFacility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Default facilities yang akan ditambahkan jika belum ada data
  const defaultFacilities = [
    "Parkiran",
    "Mimbar Masjid",
    "Sajadah",
    "Sound System",
    "Tempat Wudhu & Toilet",
    "Ruang Ibadah",
  ];

  // Mapping rating values ke enum backend
  const ratingOptions = [
    {
      value: "KURANG_BAIK",
      label: "Kurang Baik",
      color: "text-red-600 bg-red-50",
      stars: 1,
    },
    {
      value: "CUKUP_BAIK",
      label: "Cukup Baik",
      color: "text-orange-600 bg-orange-50",
      stars: 2,
    },
    {
      value: "BAIK",
      label: "Baik",
      color: "text-yellow-600 bg-yellow-50",
      stars: 3,
    },
    {
      value: "BAIK_SEKALI",
      label: "Baik Sekali",
      color: "text-blue-600 bg-blue-50",
      stars: 4,
    },
    {
      value: "SANGAT_BAIK",
      label: "Sangat Baik",
      color: "text-green-600 bg-green-50",
      stars: 5,
    },
  ];

  // Load data dari backend saat component mount
  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/masjid/takmir");
      console.log("Response data:", response.data);

      if (response.data?.data?.fasilitasMasjid?.length > 0) {
        // Jika ada data fasilitas dari backend
        const facilitiesFromBackend = response.data.data.fasilitasMasjid.map(
          (facility, index) => ({
            id: index + 1,
            name: facility.Nama,
            rating: facility.Kondisi || "",
            isDefault: defaultFacilities.includes(facility.Nama),
          })
        );
        setFacilities(facilitiesFromBackend);
      } else {
        // Jika belum ada data, gunakan default facilities
        const defaultFacilitiesData = defaultFacilities.map((name, index) => ({
          id: index + 1,
          name,
          rating: "",
          isDefault: true,
        }));
        setFacilities(defaultFacilitiesData);
      }
    } catch (err) {
      console.error("Error loading facilities:", err);
      setError("Gagal memuat data fasilitas");

      // Fallback ke default facilities jika ada error
      const defaultFacilitiesData = defaultFacilities.map((name, index) => ({
        id: index + 1,
        name,
        rating: "",
        isDefault: true,
      }));
      setFacilities(defaultFacilitiesData);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (facilityId, rating) => {
    setFacilities((prev) =>
      prev.map((facility) =>
        facility.id === facilityId ? { ...facility, rating } : facility
      )
    );
  };

  const addNewFacility = () => {
    if (newFacility.trim()) {
      const newId = Math.max(...facilities.map((f) => f.id)) + 1;
      setFacilities((prev) => [
        ...prev,
        { id: newId, name: newFacility.trim(), rating: "", isDefault: false },
      ]);
      setNewFacility("");
      setIsAddingFacility(false);
    }
  };

  const removeFacility = (facilityId) => {
    setFacilities((prev) =>
      prev.filter((facility) => facility.id !== facilityId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);
      setError("");
      setSuccess("");

      // Prepare data untuk backend
      const facilitiesData = facilities
        .filter((facility) => facility.rating) // Hanya kirim yang sudah diberi rating
        .map((facility) => ({
          nama: facility.name,
          kondisi: facility.rating,
        }));

      if (facilitiesData.length === 0) {
        setError("Harap berikan penilaian untuk minimal satu fasilitas");
        return;
      }

      const formData = new FormData();

      // Kirim sebagai JSON string
      formData.append("fasilitasMasjid", JSON.stringify(facilitiesData));

      const response = await axiosInstance.patch("/masjid", formData);

      if (response.data.statusCode == 200) {
        setSuccess("Penilaian fasilitas berhasil disimpan!");
        toast.success("Penilaian fasilitas berhasil disimpan!");

        // Reload data untuk memastikan sinkronisasi
        setTimeout(() => {
          loadFacilities();
          setSuccess("");
        }, 2000);
      }
    } catch (err) {
      console.error("Error saving facilities:", err);
      setError(
        err.response?.data?.message || "Gagal menyimpan penilaian fasilitas"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const getRatingDisplay = (ratingValue) => {
    const rating = ratingOptions.find((r) => r.value === ratingValue);
    return rating || null;
  };

  const getCompletionStats = () => {
    const completed = facilities.filter((f) => f.rating).length;
    const total = facilities.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const stats = getCompletionStats();

  if (loading) {
    return (
      <TakmirLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6 lg:p-8 space-y-6">
          <TakmirPageHeaderSkeleton showActions />
          <FacilityCardsSkeleton count={6} />
        </div>
      </TakmirLayout>
    );
  }

  return (
    <TakmirLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="p-6 lg:p-8 space-y-8">
          {/* Alert Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
              {success}
            </div>
          )}

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
                      Fasilitas Masjid
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

                {/* <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Progress Penilaian
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {stats.completed}/{stats.total} ({stats.percentage}%)
                      </p>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {/* <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Kelengkapan Penilaian
              </h3>
              <span className="text-sm font-medium text-teal-600">
                {stats.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
          </div> */}

          {/* Facilities List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Penilaian Fasilitas
              </h2>
              <p className="text-gray-600">
                Berikan penilaian untuk setiap fasilitas masjid
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {facilities.map((facility) => {
                  const currentRating = getRatingDisplay(facility.rating);
                  return (
                    <div
                      key={facility.id}
                      className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-50 rounded-lg">
                            <Building className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <h3 className=" text-left font-semibold text-gray-900">
                              {facility.name}
                            </h3>
                            {currentRating && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < currentRating.stars
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${currentRating.color}`}
                                >
                                  {currentRating.label}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex flex-wrap gap-2">
                            {ratingOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                  handleRatingChange(facility.id, option.value)
                                }
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                  facility.rating === option.value
                                    ? `${option.color} ring-2 ring-offset-1`
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>

                          {!facility.isDefault && (
                            <button
                              type="button"
                              onClick={() => removeFacility(facility.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Facility */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tambah Fasilitas Baru
                </h3>

                {isAddingFacility ? (
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={newFacility}
                        onChange={(e) => setNewFacility(e.target.value)}
                        placeholder="Nama fasilitas baru..."
                        className="flex-1 px-4 py-3 text-black bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addNewFacility();
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={addNewFacility}
                          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300"
                        >
                          Tambah
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingFacility(false);
                            setNewFacility("");
                          }}
                          className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingFacility(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-gray-300 text-gray-600 font-semibold rounded-xl hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all duration-300"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah Fasilitas
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={
                    submitLoading ||
                    facilities.filter((f) => f.rating).length === 0
                  }
                  className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Simpan Penilaian
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </TakmirLayout>
  );
};

export default FasilitasMasjidPage;
