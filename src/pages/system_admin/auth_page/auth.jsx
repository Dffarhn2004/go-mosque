import React, { useState } from "react";
import { Shield, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";

export default function SystemAdminAuthPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login", form);
      const { token, user } = res.data.data;

      if (user?.role?.Nama !== "Admin") {
        toast.error("Akun ini bukan admin sistem.");
        return;
      }

      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (user.masjid) {
        localStorage.setItem("masjid", JSON.stringify(user.masjid));
      } else {
        localStorage.removeItem("masjid");
      }

      toast.success("Admin authenticated");
      navigate("/system-admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#d8d0bd,_#f6f3ea_55%,_#e3dbc9)] px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-[#d8cfbe] bg-white/90 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1f4d3d] text-white">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[#1d2d25]">
            System Admin
          </h1>
          <p className="mt-2 text-sm text-[#6f6657]">
            Login khusus admin sistem Goqu
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm text-[#4c564f]">
              <Mail className="h-4 w-4" />
              Email
            </span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-[#d6cebd] px-4 py-3 outline-none focus:border-[#1f4d3d]"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm text-[#4c564f]">
              <Lock className="h-4 w-4" />
              Password
            </span>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-[#d6cebd] px-4 py-3 outline-none focus:border-[#1f4d3d]"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#1f4d3d] px-4 py-3 font-medium text-white transition hover:bg-[#173c30] disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
