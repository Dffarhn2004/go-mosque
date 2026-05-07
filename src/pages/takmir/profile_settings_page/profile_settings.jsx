import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import TakmirLayout from "../../../layouts/takmir_layout";
import axiosInstance from "../../../api/axiosInstance";
import { getStoredUser } from "../../../utils/authStorage";

export default function TakmirProfileSettingsPage() {
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
    <TakmirLayout>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Perbarui informasi akun takmir Anda.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Nama lengkap
            </label>
            <input
              name="NamaLengkap"
              value={form.NamaLengkap}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
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
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              required
            />
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
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
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
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
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  placeholder="Minimal 6 karakter"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </TakmirLayout>
  );
}

