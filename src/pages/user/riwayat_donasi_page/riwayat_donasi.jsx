import Footer from "../../../components/common/LandingPage/Footer";
import Navbar from "../../../components/common/LandingPage/Navbar";
import MetaData from "../../../components/common/MetaData";
import DonationHistoryList from "../../../components/common/Riwayat_Donasi/DonationHistoryList";
import { getDonorNavbarUser } from "../../../utils/authStorage";

function RiwayatDonasiPage() {
  const navbarUser = getDonorNavbarUser();

  return (
    <>
      <MetaData
        title="Riwayat Donasi Saya"
        description="Lihat riwayat donasi Anda ke berbagai masjid di Indonesia melalui platform GoQu."
        url="/riwayat"
        noIndex={true}
      />
      <Navbar
        position="static"
        user={navbarUser}
      />

      <DonationHistoryList />
      <Footer />
    </>
  );
}

export default RiwayatDonasiPage;
