import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../../../components/common/LandingPage/Navbar";
import Footer from "../../../components/common/LandingPage/Footer";
import MetaData from "../../../components/common/MetaData";
import axiosInstance from "../../../api/axiosInstance";
import { getDonorNavbarUser, getStoredUser } from "../../../utils/authStorage";
import { routes } from "../../../routes";

export default function DonorProfileSettingsPage() {
  const navbarUser = getDonorNavbarUser();
  const storedUser = getStoredUser();

  const initial = useMemo(() => {
    return {
      NamaLengkap: storedUser?.NamaLengkap || "",
      Email: storedUser?.Email || "",
      currentPassword: "",
      newPassword: "",
    };
  }, [storedUser?.NamaLengkap, storedUser?.Email]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        NamaLengkap: form.NamaLengkap,
        Email: form.Email,
      };

      if (form.currentPassword || form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await axiosInstance.patch("/users/me", payload);
      const updatedUser = res.data?.data;
      if (updatedUser?.id) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      toast.success("Profil berhasil diperbarui");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memperbarui profil";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <MetaData title="Pengaturan Profil" url={routes.donor.settings} />
      <Navbar position="static" user={navbarUser} />
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Profil</h1>
            <p className="mt-2 text-sm text-gray-600">
              Perbarui informasi akun Anda. Perubahan tersimpan untuk sesi ini.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Nama lengkap
                </label>
                <input
                  name="NamaLengkap"
                  value={form.NamaLengkap}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  placeholder="Nama lengkap"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="Email"
                  value={form.Email}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  placeholder="nama@email.com"
                  required
                />
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
                <p className="text-sm font-semibold text-gray-800">
                  Ubah password (opsional)
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password saat ini
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password baru
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      placeholder="Minimal 6 karakter"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

