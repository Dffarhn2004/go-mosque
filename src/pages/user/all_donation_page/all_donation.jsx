import { useParams, useSearchParams } from "react-router-dom";
import MosqueCardSection from "../../../components/common/Home/MosqueCardSection";
import Footer from "../../../components/common/LandingPage/Footer";
import Hero from "../../../components/common/LandingPage/Hero";
import Navbar from "../../../components/common/LandingPage/Navbar";
import MetaData from "../../../components/common/MetaData";

function AllDonationUser() {
  const [searchParams] = useSearchParams();
  const title = searchParams.get("search") || "";

  return (
    <>
      <MetaData
        title="Semua Donasi Masjid"
        description="Jelajahi semua kampanye donasi masjid yang aktif. Pilih masjid yang ingin Anda dukung untuk pembangunan, renovasi, dan kegiatan keislaman."
        keywords="donasi masjid aktif, kampanye donasi, wakaf online, sedekah masjid"
        url="/donation"
      />
      <Navbar
        position="static"
        user={{
          name: JSON.parse(localStorage.getItem("user"))?.NamaLengkap || "User",
          email: JSON.parse(localStorage.getItem("user"))?.Email,
          role: "Donatur",
          avatar:
            "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
        }}
      />
      <MosqueCardSection title={title} limit={20} seeMore={false} />

      <Footer />
    </>
  );
}

export default AllDonationUser;
