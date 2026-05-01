import { useState } from "react";
import PropTypes from "prop-types";
import formatDateWIB from "../../../utils/formatDate";
import {
  Search,
  Eye,
  X,
  User,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Target,
  TrendingUp,
} from "lucide-react";
import getProgressPercentage from "../../../utils/progressPercentage";

const DonaturTableTakmir = ({ recentDonors, formatCurrency }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredDonors = recentDonors.filter((donor) =>
    donor.Nama?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDetailClick = (donor) => {
    setSelectedDonor(donor);
    setIsDialogOpen(true);
  };

  const getDonationTargetLabel = (donor) => {
    if (donor.DonationChannel === "GENERAL") {
      return donor.masjid?.GeneralDonationTitle || `Donasi Umum ${donor.masjid?.Nama || ""}`.trim();
    }

    return donor.donasi_masjid?.Nama || "N/A";
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedDonor(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header Section */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Donatur Terbaru
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Donasi terbaru yang masuk hari ini
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari donatur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Lihat Semua</span>
              <span className="sm:hidden">Semua</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section with Horizontal Scroll */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="min-w-[200px] px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donatur
                </th>
                <th className="min-w-[140px] px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tujuan
                </th>
                <th className="min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="min-w-[140px] px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="min-w-[80px] px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDonors.map((donor) => (
                <tr
                  key={donor.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Donatur Column */}
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 text-xs sm:text-sm">
                        {donor.isAnonymous
                          ? "🤝"
                          : donor.Nama?.charAt(0) || "?"}
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {donor.isAnonymous ? "Hamba Allah" : donor.Nama}
                        </div>
                        <div className="text-xs text-left text-gray-500">
                          {donor.isAnonymous ? "Anonim" : "Donatur"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tujuan Column */}
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 max-w-full truncate">
                      {getDonationTargetLabel(donor)}
                    </span>
                  </td>

                  {/* Jumlah Column */}
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(donor.JumlahDonasi)}
                    </div>
                  </td>

                  {/* Waktu Column */}
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                    <div className="text-xs sm:text-sm text-gray-500">
                      {formatDateWIB(donor.CreatedAt)}
                    </div>
                  </td>

                  {/* Aksi Column */}
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                    <button
                      onClick={() => handleDetailClick(donor)}
                      className="inline-flex items-center px-2 sm:px-3 py-1 border border-green-300 text-green-600 hover:bg-green-50 text-xs sm:text-sm font-medium rounded-md transition-colors"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredDonors.length === 0 && (
        <div className="text-center py-8 px-4">
          <div className="text-gray-500 text-sm">
            Tidak ada donatur yang ditemukan
          </div>
        </div>
      )}
      {/* Detail Dialog */}
      {isDialogOpen && selectedDonor && (
        <div className="fixed inset-0  bg-white/10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Detail Donatur
              </h3>
              <button
                onClick={closeDialog}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-6 space-y-6">
              {/* Donor Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Informasi Donatur
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Nama</label>
                    <p className="font-medium text-gray-900">
                      {selectedDonor.isAnonymous
                        ? "Hamba Allah"
                        : selectedDonor.Nama}
                    </p>
                  </div>
                  {!selectedDonor.isAnonymous && selectedDonor.Email && (
                    <div>
                      <label className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Email
                      </label>
                      <p className="font-medium text-gray-900">
                        {selectedDonor.Email}
                      </p>
                    </div>
                  )}
                  {!selectedDonor.isAnonymous && selectedDonor.NoTelepon && (
                    <div>
                      <label className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        No. Telepon
                      </label>
                      <p className="font-medium text-gray-900">
                        {selectedDonor.NoTelepon}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Waktu Donasi
                    </label>
                    <p className="font-medium text-gray-900">
                      {formatDateWIB(selectedDonor.CreatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Donation Details */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Detail Donasi
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">
                      Jumlah Donasi
                    </label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(parseInt(selectedDonor.JumlahDonasi))}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        selectedDonor.StatusDonasi === "Sukses"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedDonor.StatusDonasi || "Sukses"}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Jenis Donasi</label>
                    <p className="font-medium text-gray-900">
                      {selectedDonor.DonationChannel === "GENERAL"
                        ? "Donasi Umum Masjid"
                        : "Campaign Khusus"}
                    </p>
                  </div>
                  {selectedDonor.Keterangan && (
                    <div>
                      <label className="text-sm text-gray-600 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Pesan/Doa
                      </label>
                      <p className="font-medium text-gray-900 bg-white p-3 rounded border italic">
                        "{selectedDonor.Keterangan}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Campaign Information */}
              {selectedDonor.DonationChannel === "GENERAL" && selectedDonor.masjid && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    Masjid Penerima Donasi
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-1">
                        {selectedDonor.masjid.Nama}
                      </h5>
                      <p className="text-gray-700 text-sm">
                        {selectedDonor.masjid.GeneralDonationDescription ||
                          selectedDonor.masjid.Deskripsi ||
                          "Donasi umum ini disalurkan untuk operasional dan kebutuhan masjid."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedDonor.DonationChannel !== "GENERAL" &&
                selectedDonor.donasi_masjid && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    Program Donasi
                  </h4>
                  <div className="space-y-4">
                    {selectedDonor.donasi_masjid.FotoDonasi && (
                      <img
                        src={selectedDonor.donasi_masjid.FotoDonasi}
                        alt="Foto Program"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-1">
                        {selectedDonor.donasi_masjid.Nama}
                      </h5>
                      {selectedDonor.donasi_masjid.Deskripsi && (
                        <p className="text-gray-700 text-sm mb-3">
                          {selectedDonor.donasi_masjid.Deskripsi}
                        </p>
                      )}
                    </div>

                    {selectedDonor.donasi_masjid.TargetUangDonasi && (
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progress Donasi</span>
                          <span>
                            {getProgressPercentage(
                              selectedDonor.donasi_masjid.UangDonasiTerkumpul ||
                                0,
                              selectedDonor.donasi_masjid.TargetUangDonasi
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${getProgressPercentage(
                                selectedDonor.donasi_masjid
                                  .UangDonasiTerkumpul || 0,
                                selectedDonor.donasi_masjid.TargetUangDonasi
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Terkumpul</span>
                            <p className="font-semibold text-blue-600">
                              {formatCurrency(
                                parseInt(
                                  selectedDonor.donasi_masjid
                                    .UangDonasiTerkumpul || 0
                                )
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Target</span>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(
                                parseInt(
                                  selectedDonor.donasi_masjid.TargetUangDonasi
                                )
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={closeDialog}
                className="w-full sm:w-auto px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
DonaturTableTakmir.propTypes = {
  recentDonors: PropTypes.array.isRequired,
  formatCurrency: PropTypes.func.isRequired,
};

export default DonaturTableTakmir;
