import React, { useEffect, useState } from "react";
import SystemAdminLayout from "../../../layouts/system_admin_layout";
import {
  createAdminByAdmin,
  createTakmirByAdmin,
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "../../../services/systemAdminService";
import axiosInstance from "../../../api/axiosInstance";
import toast from "react-hot-toast";
import { SysAdminTableSkeleton } from "../../../components/common/Skeleton";

export default function SystemAdminUsersPage() {
  const defaultForm = {
    username: "",
    email: "",
    password: "",
    nama_masjid: "",
    alamat: "",
    nomor_telfon: "",
  };

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [accountType, setAccountType] = useState("takmir");
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [userData, roleRes] = await Promise.all([
        getAdminUsers({ search }),
        axiosInstance.get("/role"),
      ]);
      setUsers(userData);
      setRoles(roleRes.data.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) {
    return (
      <SystemAdminLayout>
        <SysAdminTableSkeleton rows={8} cols={5} title />
      </SystemAdminLayout>
    );
  }

  return (
    <SystemAdminLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-semibold">User Management</h1>
              <p className="text-sm text-[#6f6657]">
                Kelola role, status user, dan pembuatan akun takmir.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user"
                className="rounded-xl border border-[#d7cfbe] px-4 py-2"
              />
              <button
                onClick={loadData}
                className="rounded-xl bg-[#1f4d3d] px-4 py-2 text-white"
              >
                Search
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-[#6f6657]">
                <tr>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Masjid</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-[#eee6d7]">
                    <td className="py-3">{user.NamaLengkap}</td>
                    <td className="py-3">{user.Email}</td>
                    <td className="py-3">
                      <select
                        value={user.roleId}
                        onChange={async (e) => {
                          try {
                            await updateAdminUserRole(user.id, e.target.value);
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
                  </tr>
                ))}
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
    </SystemAdminLayout>
  );
}
