// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import Landing from "./pages/landing_pages";
import AuthPage from "./pages/user/auth_page/auth";
import AdminAuthPage from "./pages/takmir/auth_page/auth";
import HomeUser from "./pages/user/home_page/home";
import DashboardTakmir from "./pages/takmir/dashboard_page/dashboard";
import DonationTakmir from "./pages/takmir/donation_page/donation";
import DonaturTakmir from "./pages/takmir/donatur_page/donatur";
import DonationDetailTakmir from "./pages/takmir/donation_page/detail_donation_page/detail_donation";
import DonationExpenseFormPage from "./pages/takmir/donation_page/expense_form_page";
import DetailDonation from "./pages/user/detail_donation_page/detail_donation";
import LaporanKeuanganPage from "./pages/takmir/laporan_keuangan_page/laporan_keuangan";
import KelolaIdentitasMasjidPage from "./pages/takmir/kelola_masjid_page/identitas_masjid";
import FasilitasMasjidPage from "./pages/takmir/kelola_masjid_page/fasilitas_masjid";
import DokumenMasjidPage from "./pages/takmir/kelola_masjid_page/dokumen_masjid";
import KegiatanMasjidPage from "./pages/takmir/kelola_masjid_page/kegiatan_masjid";
import NotFoundPage from "./pages/user/404_pages";
import CheckoutDonation from "./pages/user/donation_checkout_page/donation_checkout";
import AddDonationTakmirPage from "./pages/takmir/add_donation_page/add_donation";
import RiwayatDonasiPage from "./pages/user/riwayat_donasi_page/riwayat_donasi";
import AllDonationUser from "./pages/user/all_donation_page/all_donation";
import DetailMasjid from "./pages/user/detail_masjid_page/detail_masjid";
import COAPage from "./pages/takmir/coa_page/coa";
import JurnalPage from "./pages/takmir/jurnal_page/jurnal";
import JurnalFormPage from "./pages/takmir/jurnal_page/jurnal_form_page";
import LaporanKeuanganJurnalPage from "./pages/takmir/laporan_keuangan_jurnal_page/laporan_keuangan_jurnal";
import LaporanKeuanganUserPage from "./pages/user/laporan_keuangan_page/laporan_keuangan";
import MasjidTerdaftarPage from "./pages/user/masjid_terdaftar_page/masjid_terdaftar";
import BukuBesarPage from "./pages/takmir/buku_besar_page/buku_besar";
import SystemAdminDashboardPage from "./pages/system_admin/dashboard_page/dashboard";
import SystemAdminUsersPage from "./pages/system_admin/users_page/users";
import SystemAdminMasjidsPage from "./pages/system_admin/masjids_page/masjids";
import SystemAdminCategoriesPage from "./pages/system_admin/categories_page/categories";
import SystemAdminCoaPage from "./pages/system_admin/coa_page/coa";
import SystemAdminMonitoringPage from "./pages/system_admin/monitoring_page/monitoring";
import SystemAdminAuditLogsPage from "./pages/system_admin/audit_page/audit_logs";
import SystemAdminSettingsPage from "./pages/system_admin/settings_page/settings";
import NotificationsTakmir from "./pages/takmir/notification_page/notifications";
import DonationVerificationPage from "./pages/takmir/donation_verification_page/donation_verification";
import AboutPage from "./pages/about_page";
import ScrollToTop from "./components/common/ScrollToTop";
import { hasAuthSession } from "./utils/authStorage";
import {
  getCampaignCheckoutRoute,
  getCampaignDetailRoute,
  getMosqueCheckoutRoute,
  getMosqueDetailRoute,
  getMosqueReportRoute,
  routes,
} from "./routes";

function RequireDonorAuth({ children }) {
  if (!hasAuthSession()) {
    return <Navigate to={routes.public.login} replace />;
  }

  return children;
}

function LegacyCampaignDetailRedirect() {
  const { id } = useParams();
  return <Navigate to={getCampaignDetailRoute(id)} replace />;
}

function LegacyCampaignCheckoutRedirect() {
  const { campaignId } = useParams();
  return <Navigate to={getCampaignCheckoutRoute(campaignId)} replace />;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path={routes.public.landing} element={<Landing />} />
        <Route path={routes.public.about} element={<AboutPage />} />
        <Route path="/tentang-kami" element={<Navigate to={routes.public.about} replace />} />
        <Route path={routes.public.login} element={<AuthPage defaultMode="login" />} />
        <Route path={routes.public.register} element={<AuthPage defaultMode="register" />} />
        <Route path="/auth" element={<Navigate to={routes.public.login} replace />} />
        <Route path="/auth/admin" element={<AdminAuthPage />} />
        <Route path="/auth/system-admin" element={<Navigate to="/auth/admin" replace />} />
        <Route
          path={routes.donor.history}
          element={
            <RequireDonorAuth>
              <RiwayatDonasiPage />
            </RequireDonorAuth>
          }
        />
        <Route path="/riwayat" element={<Navigate to={routes.donor.history} replace />} />
        <Route path={routes.public.mosques} element={<MasjidTerdaftarPage />} />
        <Route path="/masjid-terdaftar" element={<Navigate to={routes.public.mosques} replace />} />
        <Route
          path={routes.donor.home}
          element={
            <RequireDonorAuth>
              <HomeUser />
            </RequireDonorAuth>
          }
        />
        <Route path="/home" element={<Navigate to={routes.donor.home} replace />} />
        <Route path={getMosqueDetailRoute()} element={<DetailMasjid />} />
        <Route path={getMosqueCheckoutRoute()} element={<CheckoutDonation />} />
        <Route path={getMosqueReportRoute()} element={<LaporanKeuanganUserPage />} />
        <Route path="/donation" element={<Navigate to={routes.public.campaigns} replace />} />
        <Route path={routes.public.campaigns} element={<AllDonationUser />} />
        <Route path="/campaign" element={<Navigate to={routes.public.campaigns} replace />} />
        <Route path={getCampaignDetailRoute()} element={<DetailDonation />} />
        <Route path="/campaign/:id" element={<LegacyCampaignDetailRedirect />} />
        <Route path={getCampaignCheckoutRoute()} element={<CheckoutDonation />} />
        <Route
          path="/campaign/:campaignId/checkout"
          element={<LegacyCampaignCheckoutRedirect />}
        />
        <Route path="/admin/dashboard" element={<DashboardTakmir />} />
        <Route path="/admin/notifications" element={<NotificationsTakmir />} />
        <Route path="/admin/donation" element={<DonationTakmir />} />
        <Route
          path="/admin/donation/verifikasi"
          element={<DonationVerificationPage />}
        />
        <Route path="/admin/add/donation" element={<AddDonationTakmirPage />} />
        <Route path="/admin/donation/:id" element={<DonationDetailTakmir />} />
        <Route path="/admin/donation/:id/pengeluaran/tambah" element={<DonationExpenseFormPage />} />
        <Route path="/admin/donatur" element={<DonaturTakmir />} />
        <Route path="/admin/laporan" element={<LaporanKeuanganPage />} />
        <Route path="/admin/coa" element={<COAPage />} />
        <Route path="/admin/jurnal" element={<JurnalPage />} />
        <Route path="/admin/jurnal/tambah" element={<JurnalFormPage />} />
        <Route path="/admin/jurnal/edit/:id" element={<JurnalFormPage />} />
        <Route path="/admin/buku-besar" element={<BukuBesarPage />} />
        <Route path="/admin/laporan-jurnal" element={<LaporanKeuanganJurnalPage />} />
        <Route
          path="/admin/masjid/identitas"
          element={<KelolaIdentitasMasjidPage />}
        />
        <Route
          path="/admin/masjid/fasilitas"
          element={<FasilitasMasjidPage />}
        />
        <Route path="/admin/masjid/dokumen" element={<DokumenMasjidPage />} />
        <Route path="/admin/masjid/kegiatan" element={<KegiatanMasjidPage />} />
        <Route path="/system-admin/dashboard" element={<SystemAdminDashboardPage />} />
        <Route path="/system-admin/users" element={<SystemAdminUsersPage />} />
        <Route path="/system-admin/masjids" element={<SystemAdminMasjidsPage />} />
        <Route path="/system-admin/categories" element={<SystemAdminCategoriesPage />} />
        <Route path="/system-admin/coa" element={<SystemAdminCoaPage />} />
        <Route path="/system-admin/monitoring" element={<SystemAdminMonitoringPage />} />
        <Route path="/system-admin/audit-logs" element={<SystemAdminAuditLogsPage />} />
        <Route path="/system-admin/settings" element={<SystemAdminSettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
