import PropTypes from "prop-types";
import { MapPin, Award, Plus, Eye } from "lucide-react";
import getProgressPercentage from "../../../utils/progressPercentage";
import formatCurrency from "../../../utils/formatCurrency";
import { useNavigate } from "react-router-dom";

const DonationCard = ({ campaign, onViewDetail }) => {
  const navigate = useNavigate();

  const progress = getProgressPercentage(
    campaign.UangDonasiTerkumpul,
    campaign.TargetUangDonasi
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all">
      {/* Image Section */}
      <div className="relative flex-shrink-0">
        <img
          src={campaign.FotoDonasi}
          alt={campaign.Nama}
          className="w-full h-48 sm:w-24 sm:h-20 rounded-lg object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-2">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="font-semibold text-gray-900 text-lg sm:text-base leading-tight mb-2 text-left">
              {campaign.Nama}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-3 sm:mb-2 line-clamp-2 text-left">
              {campaign.Deskripsi}
            </p>

            {/* Category */}
            <div className="flex items-center gap-1 mb-4 sm:mb-2">
              <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
              <span className="text-xs text-gray-500 truncate">
                {campaign.kategori_donasi.Nama}
              </span>
            </div>
          </div>

          {/* Action Buttons - Mobile: Full width, Desktop: Side by side */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 sm:ml-4 w-full sm:w-auto">
            <button
              onClick={() => {
                navigate(`/admin/donation/${campaign.id}/pengeluaran/tambah`);
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:px-3 sm:py-1.5 text-sm sm:text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-md border border-gray-200 transition-colors touch-manipulation"
            >
              <Plus className="w-4 h-4 sm:w-3 sm:h-3" />
              <span className="whitespace-nowrap">Tambah Pengeluaran</span>
            </button>
            <button
              onClick={() => onViewDetail?.(campaign.id)}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:px-3 sm:py-1.5 text-sm sm:text-xs font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-md transition-colors touch-manipulation"
            >
              <Eye className="w-4 h-4 sm:w-3 sm:h-3" />
              <span className="whitespace-nowrap">Lihat Detail</span>
            </button>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-3 sm:space-y-2">
          {/* Progress Labels */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="font-medium text-gray-900 text-sm">
              {formatCurrency(campaign.UangDonasiTerkumpul)} /{" "}
              {formatCurrency(campaign.TargetUangDonasi)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Stats */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
            <span className="text-sm font-medium text-green-600">
              {progress.toFixed(1)}% tercapai
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Award className="w-4 h-4" />
              <span>{campaign.donasi?.length || 0} donatur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DonationCard.propTypes = {
  campaign: PropTypes.shape({
    id: PropTypes.string.isRequired,
    Nama: PropTypes.string.isRequired,
    Deskripsi: PropTypes.string.isRequired,
    FotoDonasi: PropTypes.string,
    kategori_donasi: PropTypes.object.isRequired,
    TargetUangDonasi: PropTypes.string.isRequired,
    UangDonasiTerkumpul: PropTypes.string.isRequired,
    donasi: PropTypes.array,
  }).isRequired,
  onViewDetail: PropTypes.func,
};

export default DonationCard;
