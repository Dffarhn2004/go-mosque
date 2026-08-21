import React, { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Lock,
  User,
  Building,
  MapPin,
  Phone,
  Heart,
  FileText,
  HandCoins,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import ErrorAlert from "../../../components/common/Auth/ErrorAlert";
import InputField from "../../../components/common/Auth/InputField";
import SubmitButton from "../../../components/common/Auth/SubmitButton";
import axiosInstance from "../../../api/axiosInstance";
import { getRegisterRoute, routes } from "../../../routes";
import { getPostLoginPath, persistAuthSession } from "../../../utils/authStorage";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  nama_masjid: "",
  alamat: "",
  nomor_telfon: "",
};

const brandCopy = {
  login: {
    eyebrow: "Masuk ke GoQu",
    title: "Lanjutkan dukungan ke masjid dengan lebih yakin.",
    description:
      "Masuk sekali, lalu dashboard menyesuaikan peran akun Anda — donatur atau takmir.",
  },
  donatur: {
    eyebrow: "Akun donatur",
    title: "Buat akun, pilih masjid, lalu salurkan donasi dengan jelas.",
    description:
      "Mulai dari profil masjid, cek transparansi, lalu pilih donasi umum atau campaign.",
  },
  takmir: {
    eyebrow: "Akun takmir",
    title: "Daftarkan masjid dan kelola donasi secara transparan.",
    description:
      "Profil masjid publik, laporan keuangan, plus donasi umum dan campaign di satu tempat.",
  },
};

const brandPoints = [
  { icon: Building, text: "Profil masjid terpusat sebelum berdonasi" },
  { icon: FileText, text: "Laporan keuangan dan aktivitas mudah diakses" },
  { icon: HandCoins, text: "Donasi umum atau campaign, sesuai kebutuhan" },
];

const RoleTabs = ({ role, onChange }) => {
  const tabs = [
    {
      id: "donatur",
      label: "Donatur",
      hint: "Dukung masjid pilihan",
      icon: Heart,
    },
    {
      id: "takmir",
      label: "Takmir",
      hint: "Daftarkan masjid Anda",
      icon: Building,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1">
      {tabs.map((tab) => {
        const isActive = role === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-xl px-3 py-3 text-left transition ${
              isActive
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Icon
                className={`h-4 w-4 ${
                  isActive ? "text-emerald-600" : "text-gray-400"
                }`}
              />
              {tab.label}
            </span>
            <span className="mt-0.5 block text-xs text-gray-500">{tab.hint}</span>
          </button>
        );
      })}
    </div>
  );
};

const StepIndicator = ({ step }) => {
  return (
    <div className="mb-6 flex items-center gap-3 text-xs font-medium">
      <div className={`flex items-center gap-2 ${step >= 1 ? "text-emerald-700" : "text-gray-400"}`}>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
            step > 1
              ? "bg-emerald-100 text-emerald-700"
              : "bg-emerald-600 text-white"
          }`}
        >
          {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
        </span>
        Akun takmir
      </div>
      <div className="h-px flex-1 bg-gray-200" />
      <div className={`flex items-center gap-2 ${step === 2 ? "text-emerald-700" : "text-gray-400"}`}>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
            step === 2
              ? "bg-emerald-600 text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          2
        </span>
        Data masjid
      </div>
    </div>
  );
};

const AuthBrandPanel = ({ isLogin, role }) => {
  const copy = isLogin ? brandCopy.login : brandCopy[role];

  return (
    <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),linear-gradient(135deg,#063c24_0%,#0C6839_45%,#0F8A4C_100%)]" />
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -left-12 top-12 h-40 w-40 rounded-full bg-emerald-300 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-sky-400/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-amber-300/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between px-10 py-10 xl:px-14">
        <Link to={routes.public.landing} className="inline-flex w-fit items-center">
          <img
            src="/Logo_With_Text.png"
            alt="GoQu"
            className="h-10 w-auto object-contain"
          />
        </Link>

        <div className="max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-50 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            {copy.eyebrow}
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight text-white xl:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-emerald-50/90">
            {copy.description}
          </p>

          <div className="mt-8 space-y-3">
            {brandPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.text}
                  className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur"
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                  <span>{point.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-[28px] border border-white/15 bg-white/10 p-3 backdrop-blur">
          <div className="overflow-hidden rounded-[20px]">
            <img
              src="/Masjid1.jpg"
              alt="Masjid di platform GoQu"
              className="h-48 w-full object-cover"
            />
          </div>
          <p className="mt-3 px-1 text-sm text-emerald-50/85">
            Didukung Universitas Islam Indonesia — donasi dimulai dari profil
            masjid yang jelas.
          </p>
        </div>
      </div>
    </aside>
  );
};

const AuthPage = ({ defaultMode = "login" }) => {
  const [isLogin, setIsLogin] = useState(defaultMode !== "register");
  const [registerStep, setRegisterStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const role = useMemo(
    () => (searchParams.get("role") === "takmir" ? "takmir" : "donatur"),
    [searchParams]
  );

  const isTakmirRegister = !isLogin && role === "takmir";

  useEffect(() => {
    setIsLogin(defaultMode !== "register");
    setRegisterStep(1);
    setError("");
  }, [defaultMode, role]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const resetForm = () => {
    setForm(emptyForm);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRegisterStep(1);
    setError("");
  };

  const handleRoleChange = (nextRole) => {
    resetForm();
    navigate(getRegisterRoute(nextRole), { replace: true });
  };

  const validateEmailAndPassword = () => {
    if (!form.email || !form.password) {
      setError("Email dan password wajib diisi.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Masukkan alamat email yang valid.");
      return false;
    }

    const minPasswordLength = !isLogin && role === "takmir" ? 8 : 6;
    if (form.password.length < minPasswordLength) {
      setError(`Password minimal ${minPasswordLength} karakter.`);
      return false;
    }

    return true;
  };

  const validateAccountFields = () => {
    if (!validateEmailAndPassword()) return false;

    if (!form.name) {
      setError("Nama lengkap wajib diisi.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return false;
    }

    return true;
  };

  const validateMosqueFields = () => {
    if (!form.nama_masjid || !form.alamat || !form.nomor_telfon) {
      setError("Lengkapi data masjid sebelum mendaftar.");
      return false;
    }

    if (form.nama_masjid.length < 3) {
      setError("Nama masjid minimal 3 karakter.");
      return false;
    }

    return true;
  };

  const validateForm = () => {
    if (isLogin) return validateEmailAndPassword();
    if (!validateAccountFields()) return false;
    if (role === "takmir") return validateMosqueFields();
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isTakmirRegister && registerStep === 1) {
      if (validateAccountFields()) {
        setError("");
        setRegisterStep(2);
      }
      return;
    }

    if (!validateForm()) return;
    setLoading(true);

    try {
      if (isLogin) {
        const res = await axiosInstance.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        const { token, user } = res.data.data;
        persistAuthSession(token, user);

        toast.success("Berhasil masuk. Mengalihkan...");
        navigate(getPostLoginPath(user));
        return;
      }

      if (role === "takmir") {
        await axiosInstance.post("/auth/register/takmir", {
          username: form.name,
          email: form.email,
          password: form.password,
          nama_masjid: form.nama_masjid,
          alamat: form.alamat,
          nomor_telfon: form.nomor_telfon,
        });
      } else {
        await axiosInstance.post("/auth/register", {
          username: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });
      }

      toast.success("Pendaftaran berhasil. Silakan masuk.");
      resetForm();
      setIsLogin(true);
      navigate(routes.public.login);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (isLogin ? "Gagal masuk." : "Pendaftaran gagal.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAuth = () => {
    const nextIsLogin = !isLogin;
    resetForm();
    setIsLogin(nextIsLogin);
    navigate(nextIsLogin ? routes.public.login : getRegisterRoute(role));
  };

  const title = isLogin
    ? "Selamat datang kembali"
    : role === "takmir"
      ? registerStep === 2
        ? "Data masjid"
        : "Daftarkan masjid Anda"
      : "Bergabung sebagai donatur";

  const subtitle = isLogin
    ? "Masuk dengan email dan password. Dashboard akan menyesuaikan peran akun Anda."
    : role === "takmir"
      ? registerStep === 2
        ? "Lengkapi identitas masjid agar profilnya bisa tampil di GoQu."
        : "Buat akun takmir dulu, lalu lanjut isi data masjid."
      : "Buat akun untuk mulai mendukung masjid pilihan Anda.";

  const submitLabel = isLogin
    ? "Masuk"
    : isTakmirRegister && registerStep === 1
      ? "Lanjut ke data masjid"
      : role === "takmir"
        ? "Daftarkan masjid"
        : "Daftar sebagai donatur";

  const showAccountFields = isLogin || !isTakmirRegister || registerStep === 1;
  const showMosqueFields = isTakmirRegister && registerStep === 2;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <AuthBrandPanel isLogin={isLogin} role={role} />

      <main className="flex min-h-screen flex-col bg-[#f4f7f5]">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#063c24_0%,#0C6839_55%,#0F8A4C_100%)] px-5 py-5 lg:hidden">
          <Link to={routes.public.landing} className="inline-flex items-center">
            <img
              src="/Logo_With_Text.png"
              alt="GoQu"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-emerald-50/90">
            {isLogin
              ? "Masuk untuk mulai berdonasi dengan lebih yakin."
              : role === "takmir"
                ? "Daftarkan masjid dan kelola donasi secara transparan."
                : "Buat akun, pilih masjid, lalu salurkan donasi dengan jelas."}
          </p>
        </div>

        <div className="flex flex-1 items-start justify-center px-4 py-8 sm:px-8 sm:py-12 lg:items-center">
          <div className="w-full max-w-md">
            <button
              type="button"
              onClick={() => navigate(routes.public.landing)}
              className="mb-6 hidden items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-emerald-700 lg:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke beranda
            </button>

            <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-xl shadow-emerald-950/5 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {subtitle}
                </p>
              </div>

              {!isLogin && <RoleTabs role={role} onChange={handleRoleChange} />}
              {isTakmirRegister && <StepIndicator step={registerStep} />}

              <form onSubmit={handleSubmit} className="space-y-4">
                {showAccountFields && (
                  <>
                    {!isLogin && (
                      <InputField
                        label="Nama lengkap"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        icon={User}
                        autoComplete="name"
                        placeholder="Masukkan nama lengkap"
                      />
                    )}

                    <InputField
                      label="Email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      icon={Mail}
                      autoComplete="email"
                      placeholder="nama@email.com"
                    />

                    <InputField
                      label="Password"
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      icon={Lock}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      showPasswordToggle
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      placeholder="Masukkan password"
                      hint={
                        !isLogin && role === "takmir"
                          ? "Minimal 8 karakter"
                          : !isLogin
                            ? "Minimal 6 karakter"
                            : undefined
                      }
                    />

                    {!isLogin && (
                      <InputField
                        label="Konfirmasi password"
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        icon={Lock}
                        autoComplete="new-password"
                        showPasswordToggle
                        showPassword={showConfirmPassword}
                        onTogglePassword={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        placeholder="Ulangi password"
                      />
                    )}
                  </>
                )}

                {showMosqueFields && (
                  <>
                    <InputField
                      label="Nama masjid"
                      type="text"
                      name="nama_masjid"
                      value={form.nama_masjid}
                      onChange={handleChange}
                      required
                      icon={Building}
                      placeholder="Masjid Al-Ikhlas"
                    />

                    <InputField
                      label="Alamat masjid"
                      type="text"
                      name="alamat"
                      value={form.alamat}
                      onChange={handleChange}
                      required
                      icon={MapPin}
                      placeholder="Alamat lengkap masjid"
                    />

                    <InputField
                      label="Nomor telepon"
                      type="tel"
                      name="nomor_telfon"
                      value={form.nomor_telfon}
                      onChange={handleChange}
                      required
                      icon={Phone}
                      autoComplete="tel"
                      placeholder="08xxxxxxxxxx"
                    />
                  </>
                )}

                <ErrorAlert message={error} />

                <div className="flex flex-col gap-3 pt-1">
                  {showMosqueFields && (
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setRegisterStep(1);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Kembali ke data akun
                    </button>
                  )}

                  <SubmitButton
                    isLogin={isLogin}
                    loading={loading}
                    label={
                      isTakmirRegister && registerStep === 1 ? (
                        <span className="inline-flex items-center gap-2">
                          {submitLabel}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      ) : (
                        submitLabel
                      )
                    }
                  />
                </div>
              </form>

              {isLogin ? (
                <div className="mt-6 space-y-3">
                  <p className="text-center text-sm text-gray-500">
                    Belum punya akun?
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setIsLogin(false);
                        navigate(getRegisterRoute("donatur"));
                      }}
                      className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                    >
                      Daftar sebagai donatur
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setIsLogin(false);
                        navigate(getRegisterRoute("takmir"));
                      }}
                      className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
                    >
                      Daftar sebagai takmir
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-center text-sm text-gray-600">
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={handleToggleAuth}
                    className="font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Masuk
                  </button>
                </p>
              )}
            </div>

            <p className="mt-6 px-2 text-center text-xs leading-relaxed text-gray-500">
              Dengan melanjutkan, Anda menyetujui Ketentuan Layanan dan Kebijakan
              Privasi GoQu.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
