export const routes = {
  public: {
    landing: "/",
    about: "/tentang",
    mosques: "/masjid",
    campaigns: "/donasi",
    login: "/masuk",
    register: "/daftar",
  },
  donor: {
    home: "/akun",
    history: "/akun/riwayat",
  },
  admin: {
    login: "/auth/admin",
  },
  systemAdmin: {
    login: "/auth/system-admin",
  },
};

export const getMosqueDetailRoute = (id = ":id") => `${routes.public.mosques}/${id}`;
export const getMosqueReportRoute = (id = ":id") =>
  `${routes.public.mosques}/${id}/laporan-keuangan`;
export const getMosqueCheckoutRoute = (id = ":masjidId") =>
  `${routes.public.mosques}/${id}/checkout`;

export const getCampaignDetailRoute = (id = ":id") =>
  `${routes.public.campaigns}/${id}`;
export const getCampaignCheckoutRoute = (id = ":campaignId") =>
  `${routes.public.campaigns}/${id}/checkout`;
