import React, { useEffect, useMemo, useState } from "react";
import { Copy, KeyRound, RefreshCw, X } from "lucide-react";
import SystemAdminLayout from "../../../layouts/system_admin_layout";
import {
  createAdminByAdmin,
  createTakmirByAdmin,
  getAdminUsers,
  resetAdminUserPassword,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "../../../services/systemAdminService";
import axiosInstance from "../../../api/axiosInstance";
import { getStoredUser } from "../../../utils/authStorage";
import toast from "react-hot-toast";
import { SysAdminTableSkeleton } from "../../../components/common/Skeleton";

const ROLE_FILTERS = [
  { id: "all", label: "Semua" },
  { id: "Donatur", label: "Donatur" },
  { id: "Takmir", label: "Takmir" },
  { id: "Admin", label: "Admin" },
];

function generateTemporaryPassword(length = 10) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export default function SystemAdminUsersPage() {
  const defaultForm = {
    username: "",
    email: "",
    password: "",
    nama_masjid: "",
    alamat: "",
    nomor_telfon: "",
  };

  const currentUser = useMemo(() => getStoredUser(), []);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [accountType, setAccountType] = useState("takmir");
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetForm, setResetForm] = useState({ password: "", confirm: "" });
  const [resetSaving, setResetSaving] = useState(false);
  const [resetResult, setResetResult] = useState("");

  const selectedRoleId = useMemo(() => {
    if (roleFilter === "all") return undefined;
    return roles.find((role) => role.Nama === roleFilter)?.id;
  }, [roleFilter, roles]);

  const loadData = async () => {
    try {
      const [userData, roleRes] = await Promise.all([
        getAdminUsers({
          search,
          roleId: selectedRoleId,
        }),
        axiosInstance.get("/role"),
      ]);
      setUsers(userData);
      setRoles(roleRes.data.data);
    } catch (error) {
      toast.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleId]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      if (accountType === "admin") {
        await createAdminByAdmin({
          username: form.username,
          email: form.email,
          password: form.password,
        });
        toast.success("Admin created");
      } else {
        await createTakmirByAdmin(form);
        toast.success("Takmir created");
      }

      setForm(defaultForm);
      loadData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to create ${accountType === "admin" ? "admin" : "takmir"}`
      );
    }
  };

  const openResetModal = (user) => {
    setResetTarget(user);
    setResetForm({ password: "", confirm: "" });
    setResetResult("");
  };

  const closeResetModal = () => {
    setResetTarget(null);
    setResetForm({ password: "", confirm: "" });
    setResetResult("");
    setResetSaving(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetTarget) return;

    if (resetForm.password.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }

    if (resetForm.password !== resetForm.confirm) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    setResetSaving(true);
    try {
      await resetAdminUserPassword(resetTarget.id, resetForm.password);
      setResetResult(resetForm.password);
      toast.success("Password berhasil direset");
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mereset password");
    } finally {
      setResetSaving(false);
    }
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(resetResult);
      toast.success("Password disalin");
    } catch {
      toast.error("Gagal menyalin password");
    }
  };

  if (loading) {
    return (
      <SystemAdminLayout>
        <SysAdminTableSkeleton rows={8} cols={6} title />
      </SystemAdminLayout>
    );
  }

  return (
    <SystemAdminLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-semibold">Manajemen User</h1>
              <p className="text-sm text-[#6f6657]">
                Kelola donatur, takmir, dan admin. Reset password jika user lupa
                akses.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau email"
                className="rounded-xl border border-[#d7cfbe] px-4 py-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadData();
                }}
              />
              <button
                onClick={loadData}
                className="rounded-xl bg-[#1f4d3d] px-4 py-2 text-white"
              >
                Cari
              </button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {ROLE_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setRoleFilter(filter.id)}
                className={`rounded-full px-4 py-1.5 text-sm ${
                  roleFilter === filter.id
                    ? "bg-[#1f4d3d] text-white"
                    : "border border-[#d7cfbe] text-[#6f6657] hover:bg-[#f6f3ea]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-[#6f6657]">
                <tr>
                  <th className="pb-3">Nama</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Masjid</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = currentUser?.id === user.id;

                  return (
                    <tr key={user.id} className="border-t border-[#eee6d7]">
                      <td className="py-3">{user.NamaLengkap}</td>
                      <td className="py-3">{user.Email}</td>
                      <td className="py-3">
                        <select
                          value={user.roleId}
                          onChange={async (e) => {
                            const nextRoleId = e.target.value;
                            const nextRole = roles.find((role) => role.id === nextRoleId);
                            const confirmed = window.confirm(
                              `Ubah role ${user.Email} menjadi ${nextRole?.Nama || "role baru"}?`
                            );
                            if (!confirmed) {
                              e.target.value = user.roleId;
                              return;
                            }
                            try {
                              await updateAdminUserRole(user.id, nextRoleId);
                              toast.success("Role updated");
                              loadData();
                            } catch (error) {
                              toast.error("Failed to update role");
                            }
                          }}
                          className="rounded-lg border border-[#d7cfbe] px-2 py-1"
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.Nama}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">{user.masjid?.Nama || "-"}</td>
                      <td className="py-3">
                        <button
                          onClick={async () => {
                            try {
                              await updateAdminUserStatus(user.id, !user.isActive);
                              toast.success("User status updated");
                              loadData();
                            } catch (error) {
                              toast.error("Failed to update user status");
                            }
                          }}
                          className={`rounded-full px-3 py-1 text-xs ${
                            user.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => openResetModal(user)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#d7cfbe] px-3 py-1.5 text-xs font-medium text-[#1f4d3d] hover:bg-[#f6f3ea] disabled:cursor-not-allowed disabled:opacity-40"
                          title={
                            isSelf
                              ? "Tidak bisa mereset password akun sendiri"
                              : "Reset password"
                          }
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Reset
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#6f6657]">
                      Tidak ada user yang cocok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form
          onSubmit={handleCreateUser}
          className="rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold">
              Create {accountType === "admin" ? "Admin" : "Takmir"} Account
            </h2>
            <div className="flex rounded-xl border border-[#d7cfbe] p-1">
              <button
                type="button"
                onClick={() => setAccountType("admin")}
                className={`rounded-lg px-4 py-2 text-sm ${
                  accountType === "admin"
                    ? "bg-[#1f4d3d] text-white"
                    : "text-[#6f6657]"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setAccountType("takmir")}
                className={`rounded-lg px-4 py-2 text-sm ${
                  accountType === "takmir"
                    ? "bg-[#1f4d3d] text-white"
                    : "text-[#6f6657]"
                }`}
              >
                Takmir
              </button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["username", "Nama Lengkap"],
              ["email", "Email"],
              ["password", "Password"],
            ].map(([key, label]) => (
              <input
                key={key}
                type={key === "password" ? "password" : "text"}
                value={form[key]}
                placeholder={label}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="rounded-xl border border-[#d7cfbe] px-4 py-3"
                required
              />
            ))}

            {accountType === "takmir" &&
              [
                ["nama_masjid", "Nama Masjid"],
                ["alamat", "Alamat"],
                ["nomor_telfon", "Nomor Telepon"],
              ].map(([key, label]) => (
                <input
                  key={key}
                  type="text"
                  value={form[key]}
                  placeholder={label}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="rounded-xl border border-[#d7cfbe] px-4 py-3"
                  required
                />
              ))}
          </div>
          <button className="mt-4 rounded-xl bg-[#1f4d3d] px-4 py-3 text-white">
            Create {accountType === "admin" ? "Admin" : "Takmir"}
          </button>
        </form>
      </div>

      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup"
            onClick={closeResetModal}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Reset password</h3>
                <p className="mt-1 text-sm text-[#6f6657]">
                  {resetTarget.NamaLengkap} · {resetTarget.Email}
                </p>
              </div>
              <button
                type="button"
                onClick={closeResetModal}
                className="rounded-full p-1 text-[#6f6657] hover:bg-[#f6f3ea]"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {resetResult ? (
              <div className="space-y-4">
                <p className="text-sm text-[#6f6657]">
                  Password baru sudah disimpan. Salin lalu sampaikan ke user via
                  WhatsApp atau email, dan minta mereka mengganti password setelah
                  login.
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-[#d7cfbe] bg-[#f6f3ea] px-3 py-2">
                  <code className="flex-1 break-all text-sm font-semibold">
                    {resetResult}
                  </code>
                  <button
                    type="button"
                    onClick={copyPassword}
                    className="rounded-lg p-2 text-[#1f4d3d] hover:bg-white"
                    aria-label="Salin password"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={closeResetModal}
                  className="w-full rounded-xl bg-[#1f4d3d] px-4 py-3 text-white"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="password"
                  value={resetForm.password}
                  onChange={(e) =>
                    setResetForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Password baru"
                  className="w-full rounded-xl border border-[#d7cfbe] px-4 py-3"
                  minLength={8}
                  required
                />
                <input
                  type="password"
                  value={resetForm.confirm}
                  onChange={(e) =>
                    setResetForm((prev) => ({ ...prev, confirm: e.target.value }))
                  }
                  placeholder="Konfirmasi password"
                  className="w-full rounded-xl border border-[#d7cfbe] px-4 py-3"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    const generated = generateTemporaryPassword();
                    setResetForm({ password: generated, confirm: generated });
                  }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#1f4d3d]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Buat password acak
                </button>
                <button
                  type="submit"
                  disabled={resetSaving}
                  className="w-full rounded-xl bg-[#1f4d3d] px-4 py-3 text-white disabled:opacity-50"
                >
                  {resetSaving ? "Menyimpan..." : "Reset password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </SystemAdminLayout>
  );
}
