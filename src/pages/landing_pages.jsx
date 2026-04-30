// pages/Landing.jsx
import MetaData from "../components/common/MetaData";
import Navbar from "../components/common/LandingPage/Navbar";
import Hero from "../components/common/LandingPage/Hero";
import FeaturedMosques from "../components/common/LandingPage/FeaturedMosques";
import UIISupport from "../components/common/LandingPage/UIISupport";
import CallToAction from "../components/common/LandingPage/CallToAction";
import Footer from "../components/common/LandingPage/Footer";
import { useEffect } from "react";

function Landing() {
  useEffect(() => {
    const handlePopState = (e) => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://goqu.vercel.app/#organization',
        name: 'GoQu',
        url: 'https://goqu.vercel.app',
        logo: 'https://goqu.vercel.app/logo.svg',
        description: 'Platform donasi digital untuk pembangunan dan renovasi masjid yang akuntabel dan transparan di seluruh Indonesia.',
        sameAs: [],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://goqu.vercel.app/#website',
        url: 'https://goqu.vercel.app',
        name: 'GoQu',
        publisher: { '@id': 'https://goqu.vercel.app/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://goqu.vercel.app/masjid-terdaftar?search={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <>
      <MetaData
        url="/"
        type="website"
        jsonLd={jsonLd}
      />
      <Navbar />
      <Hero />
      <FeaturedMosques />
      <UIISupport />
      <CallToAction />
      <Footer />
    </>
  );
}

export default Landing;
