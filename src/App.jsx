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
import DonorProfileSettingsPage from "./pages/user/profile_settings_page/profile_settings";
import TakmirProfileSettingsPage from "./pages/takmir/profile_settings_page/profile_settings";
import AboutPage from "./pages/about_page";
import ScrollToTop from "./components/common/ScrollToTop";
import { getStoredUser, hasAuthSession } from "./utils/authStorage";
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

function RequireTakmirAuth({ children }) {
  if (!hasAuthSession()) {
    return <Navigate to="/auth/admin" replace />;
  }

  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/auth/admin" replace />;
  }

  if (user?.role?.Nama === "Admin") {
    return <Navigate to="/system-admin/dashboard" replace />;
  }

  // Takmir pages rely on mosque context; allow fallback from user.masjid.
  let masjid = null;
  try {
    masjid = JSON.parse(localStorage.getItem("masjid") || "null");
  } catch {
    masjid = null;
  }
  if (!masjid && user?.masjid) {
    masjid = user.masjid;
  }

  if (!masjid) {
    return <Navigate to="/auth/admin" replace />;
  }

  return children;
}

function RequireSystemAdminAuth({ children }) {
  if (!hasAuthSession()) {
    return <Navigate to="/auth/admin" replace />;
  }

  const user = getStoredUser();
  if (!user || user?.role?.Nama !== "Admin") {
    return <Navigate to="/auth/admin" replace />;
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
        <Route
          path={routes.donor.settings}
          element={
            <RequireDonorAuth>
              <DonorProfileSettingsPage />
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
        <Route
          path="/admin/dashboard"
          element={
            <RequireTakmirAuth>
              <DashboardTakmir />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <RequireTakmirAuth>
              <TakmirProfileSettingsPage />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <RequireTakmirAuth>
              <NotificationsTakmir />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/donation"
          element={
            <RequireTakmirAuth>
              <DonationTakmir />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/donation/verifikasi"
          element={
            <RequireTakmirAuth>
              <DonationVerificationPage />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/add/donation"
          element={
            <RequireTakmirAuth>
              <AddDonationTakmirPage />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/donation/:id"
          element={
            <RequireTakmirAuth>
              <DonationDetailTakmir />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/donation/:id/pengeluaran/tambah"
          element={
            <RequireTakmirAuth>
              <DonationExpenseFormPage />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/donatur"
          element={
            <RequireTakmirAuth>
              <DonaturTakmir />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/laporan"
          element={
            <RequireTakmirAuth>
              <LaporanKeuanganPage />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/coa"
          element={
            <RequireTakmirAuth>
              <COAPage />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/jurnal"
          element={
            <RequireTakmirAuth>
              <JurnalPage />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/jurnal/tambah"
          element={
            <RequireTakmirAuth>
              <JurnalFormPage />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/jurnal/edit/:id"
          element={
            <RequireTakmirAuth>
              <JurnalFormPage />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/buku-besar"
          element={
            <RequireTakmirAuth>
              <BukuBesarPage />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/laporan-jurnal"
          element={
            <RequireTakmirAuth>
              <LaporanKeuanganJurnalPage />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/masjid/identitas"
          element={
            <RequireTakmirAuth>
              <KelolaIdentitasMasjidPage />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/masjid/fasilitas"
          element={
            <RequireTakmirAuth>
              <FasilitasMasjidPage />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/masjid/dokumen"
          element={
            <RequireTakmirAuth>
              <DokumenMasjidPage />
            </RequireTakmirAuth>
          }
        />
        <Route
          path="/admin/masjid/kegiatan"
          element={
            <RequireTakmirAuth>
              <KegiatanMasjidPage />
            </RequireTakmirAuth>
          }
        />

        <Route
          path="/system-admin/dashboard"
          element={
            <RequireSystemAdminAuth>
              <SystemAdminDashboardPage />
            </RequireSystemAdminAuth>
          }
        />
        <Route
          path="/system-admin/users"
          element={
            <RequireSystemAdminAuth>
              <SystemAdminUsersPage />
            </RequireSystemAdminAuth>
          }
        />
        <Route
          path="/system-admin/masjids"
          element={
            <RequireSystemAdminAuth>
              <SystemAdminMasjidsPage />
            </RequireSystemAdminAuth>
          }
        />
        <Route
          path="/system-admin/categories"
          element={
            <RequireSystemAdminAuth>
              <SystemAdminCategoriesPage />
            </RequireSystemAdminAuth>
          }
        />
        <Route
          path="/system-admin/coa"
          element={
            <RequireSystemAdminAuth>
              <SystemAdminCoaPage />
            </RequireSystemAdminAuth>
          }
        />
        <Route
          path="/system-admin/monitoring"
          element={
            <RequireSystemAdminAuth>
              <SystemAdminMonitoringPage />
            </RequireSystemAdminAuth>
          }
        />
        <Route
          path="/system-admin/audit-logs"
          element={
            <RequireSystemAdminAuth>
              <SystemAdminAuditLogsPage />
            </RequireSystemAdminAuth>
          }
        />
        <Route
          path="/system-admin/settings"
          element={
            <RequireSystemAdminAuth>
              <SystemAdminSettingsPage />
            </RequireSystemAdminAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
