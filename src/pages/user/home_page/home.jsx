import MosqueCardSection from "../../../components/common/Home/MosqueCardSection";
import GeneralDonationSection from "../../../components/common/Home/GeneralDonationSection";
import CallToAction from "../../../components/common/LandingPage/CallToAction";
import Footer from "../../../components/common/LandingPage/Footer";
import Hero from "../../../components/common/LandingPage/Hero";
import Navbar from "../../../components/common/LandingPage/Navbar";
import MetaData from "../../../components/common/MetaData";

function HomeUser() {
  return (
    <>
      <MetaData
        title="Beranda"
        description="Temukan masjid di sekitarmu dan donasikan untuk pembangunan serta renovasi. GoQu menghubungkan donatur dengan masjid yang membutuhkan."
        url="/home"
      />
      <Navbar
        position="static"
        user={{
          name: JSON.parse(localStorage.getItem("user"))?.NamaLengkap || "User",
          email: JSON.parse(localStorage.getItem("user"))?.Email,
          role: "Donatur",
          avatar: "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
        }}
      />
      <Hero isHome={true} />
      <GeneralDonationSection />
      <MosqueCardSection />

      <MosqueCardSection 
        title="Masjid Disekitar Kamu" 
        seeMoreUrl="/donation?search=Masjid Disekitar Kamu"
        showEmptyState={false}
      />

      <CallToAction login={true} />
      <Footer />
    </>
  );
}

export default HomeUser;
