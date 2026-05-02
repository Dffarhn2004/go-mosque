import { useEffect, useState } from "react";
import Navbar from "../../../components/common/LandingPage/Navbar";
import Footer from "../../../components/common/LandingPage/Footer";
import MetaData from "../../../components/common/MetaData";
import {
  Search,
  Building2,
  MapPin,
  Eye,
  Calendar,
  Loader2,
} from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MasjidListSkeleton } from "../../../components/common/Skeleton";
import { getDonorNavbarUser } from "../../../utils/authStorage";

const MasjidTerdaftarPage = () => {
  const [masjidList, setMasjidList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navbarUser = getDonorNavbarUser();

  const navigate = useNavigate();

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const fetchMasjid = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get("/masjid");
        setMasjidList(res.data.data || []);
        console.log("Fetched masjid list:", res.data.data);
      } catch (error) {
        console.error("Error fetching masjid list:", error);
        setError("Gagal memuat data masjid. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchMasjid();
  }, []);

  // Filter masjid berdasarkan search term
  const filteredMasjid = masjidList.filter((masjid) =>
    masjid.Nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    masjid.Deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    masjid.Alamat?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetail = (masjidId) => {
    navigate(`/masjid/${masjidId}`);
  };

  if (loading) {
    return (
      <>
        <MetaData
          title="Masjid Terdaftar"
          description="Daftar masjid yang terdaftar di GoQu. Temukan masjid yang membutuhkan dukungan donasi untuk pembangunan dan renovasi di seluruh Indonesia."
          keywords="daftar masjid, masjid terdaftar, masjid butuh donasi, GoQu"
          url="/masjid-terdaftar"
        />
        <Navbar
          position="static"
          user={navbarUser}
        />
        <MasjidListSkeleton />
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <MetaData
          title="Masjid Terdaftar"
          description="Daftar masjid yang terdaftar di GoQu. Temukan masjid yang membutuhkan dukungan donasi untuk pembangunan dan renovasi di seluruh Indonesia."
          keywords="daftar masjid, masjid terdaftar, masjid butuh donasi, GoQu"
          url="/masjid-terdaftar"
        />
        <Navbar
          position="static"
          user={navbarUser}
        />
        <div
          className="min-h-screen py-12"
          style={{
            background:
              "linear-gradient(135deg, rgba(12, 104, 57, 0.1) 0%, rgba(17, 130, 75, 0.1) 50%, rgba(10, 79, 46, 0.1) 100%)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <MetaData
          title="Masjid Terdaftar"
          description="Daftar masjid yang terdaftar di GoQu. Temukan masjid yang membutuhkan dukungan donasi untuk pembangunan dan renovasi di seluruh Indonesia."
          keywords="daftar masjid, masjid terdaftar, masjid butuh donasi, GoQu"
          url="/masjid-terdaftar"
        />
      <Navbar
        position="static"
        user={navbarUser}
      />
      <div
        className="min-h-screen py-12"
        style={{
          background:
            "linear-gradient(135deg, rgba(12, 104, 57, 0.1) 0%, rgba(17, 130, 75, 0.1) 50%, rgba(10, 79, 46, 0.1) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Masjid Terdaftar
              </h1>
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Search Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari masjid berdasarkan nama, deskripsi, atau alamat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Masjid List */}
            {filteredMasjid.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-center py-20 px-4">
                  <div className="relative mb-8 inline-block">
                    <div
                      className="w-32 h-32 mx-auto rounded-full flex items-center justify-center shadow-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(12, 104, 57, 0.2) 0%, rgba(17, 130, 75, 0.2) 50%, rgba(10, 79, 46, 0.2) 100%)",
                      }}
                    >
                      <Building2 className="w-16 h-16 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">
                    {searchTerm
                      ? "Tidak Ada Masjid Ditemukan"
                      : "Belum Ada Masjid Terdaftar"}
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    {searchTerm
                      ? "Coba ubah kata kunci pencarian Anda"
                      : "Belum ada masjid yang terdaftar di sistem"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMasjid.map((masjid) => (
                  <div
                    key={masjid.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Masjid Image */}
                    {masjid.FotoMasjid ? (
                      <div className="h-48 w-full overflow-hidden">
                        <img
                          src={masjid.FotoMasjid}
                          alt={masjid.Nama}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 w-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-green-600" />
                      </div>
                    )}

                    {/* Masjid Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {masjid.Nama}
                      </h3>

                      {masjid.Alamat && (
                        <div className="flex items-start gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {masjid.Alamat}
                          </p>
                        </div>
                      )}

                      {masjid.Deskripsi && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {masjid.Deskripsi}
                        </p>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={() => handleViewDetail(masjid.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info Section */}
            {filteredMasjid.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 text-center">
                  Menampilkan {filteredMasjid.length} dari {masjidList.length}{" "}
                  masjid terdaftar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MasjidTerdaftarPage;
