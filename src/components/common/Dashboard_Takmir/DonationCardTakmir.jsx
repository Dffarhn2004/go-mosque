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
    <div className="rounded-xl border border-gray-200 p-4 transition-all hover:border-green-300 hover:shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[120px_minmax(0,1fr)_220px] lg:items-start">
        <div className="relative">
          <img
            src={campaign.FotoDonasi}
            alt={campaign.Nama}
            className="h-28 w-full rounded-lg border border-gray-200 bg-white object-cover lg:h-24 lg:w-[120px]"
          />
        </div>

        <div className="min-w-0">
          <h3 className="text-left text-lg font-semibold leading-tight text-gray-900">
            {campaign.Nama}
          </h3>

          <p className="mt-2 line-clamp-2 text-left text-sm leading-relaxed text-gray-600">
            {campaign.Deskripsi}
          </p>

          <div className="mt-3 flex items-center gap-1">
            <MapPin className="h-3 w-3 flex-shrink-0 text-gray-500" />
            <span className="truncate text-xs text-gray-500">
              {campaign.kategori_donasi.Nama}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:items-stretch">
          <button
            onClick={() => {
              navigate(`/admin/donation/${campaign.id}/pengeluaran/tambah`);
            }}
            className="flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <Plus className="h-4 w-4" />
            <span className="whitespace-nowrap">Tambah Pengeluaran</span>
          </button>
          <button
            onClick={() => onViewDetail?.(campaign.id)}
            className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            <Eye className="h-4 w-4" />
            <span className="whitespace-nowrap">Lihat Detail</span>
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(campaign.UangDonasiTerkumpul)} /{" "}
            {formatCurrency(campaign.TargetUangDonasi)}
          </span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium text-green-600">
            {progress.toFixed(1)}% tercapai
          </span>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Award className="h-4 w-4" />
            <span>{campaign.donasi?.length || 0} donatur</span>
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
