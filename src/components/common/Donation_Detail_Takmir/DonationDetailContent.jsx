import DonationSummaryCard from "./DonationDetailSummary";
import DonationTable from "./DonationDetailTable";
import { useNavigate } from "react-router-dom";

const DonationDetailContent = ({ donation }) => {
  const navigate = useNavigate();
  const expenseData = donation.pengeluaran_donasi_masjid.map((expense) => ({
    name: expense.TujuanPengeluaran,
    amount: expense.UangPengeluaran,
  }));
  const donationData = donation.donasi.map((donatur) => ({
    name: donatur.Nama,
    amount: donatur.JumlahDonasi,
  }));
  const loading = false;

  return (
    <div className="space-y-6">
      <DonationSummaryCard {...donation} />

      <div className="mb-6 flex justify-end">
        <button
          onClick={() => navigate(`/admin/donation/${donation.id}/pengeluaran/tambah`)}
          className="flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50"
        >
          + Tambah Pengeluaran
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <DonationTable
          title="Data Donatur"
          data={donationData}
          loading={loading}
        />

        <DonationTable
          title="Data Pengeluaran"
          data={expenseData}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default DonationDetailContent;
