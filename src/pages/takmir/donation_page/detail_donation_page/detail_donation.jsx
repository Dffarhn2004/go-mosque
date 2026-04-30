import DonationDetailContent from "../../../../components/common/Donation_Detail_Takmir/DonationDetailContent";
import { ArrowLeft, Calendar, Download } from "lucide-react";
import TakmirLayout from "../../../../layouts/takmir_layout";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../../api/axiosInstance";

const DonationDetailTakmir = () => {
  // const donation = dummyData[0];
  const { id } = useParams(); // get the id from route param
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDonation = async () => {
    try {
      const res = await axiosInstance.get("/donasi-masjid/takmir/" + id);
      setDonation(res.data.data); // sesuaikan struktur response lo
      // console.log("Fetched donation campaigns:", res.data.data);
    } catch (error) {
      console.error("Error fetching donation campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  useEffect(() => {
    fetchDonation();
  }, []);

  if (loading) return <p className="text-center">Loading campaigns...</p>;
  const handleBack = () => {
    navigate(-1); // Go back to previous page
    // Alternative: navigate to specific route
    // navigate('/takmir/donations');
  };
  return (
    <TakmirLayout>
      <div className="p-6 space-y-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Kembali</span>
        </button>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pembangunan & Program Keagamaan
            </h1>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <DonationDetailContent
          donation={donation}
        />
      </div>
    </TakmirLayout>
  );
};

export default DonationDetailTakmir;
