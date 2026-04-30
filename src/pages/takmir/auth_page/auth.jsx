import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  Users,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  User,
  Building,
  MapPin,
  Phone,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";

// Auth Input Component
const AdminInputField = ({
  label,
  type,
  name,
  value,
  onChange,
  required,
  icon: Icon,
  showPasswordToggle,
  onTogglePassword,
  showPassword,
  disabled = false,
}) => {
  return (
    <div className="mb-4 sm:mb-6">
      <label className="block text-gray-700 text-sm font-semibold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#0C6839]" />
        </div>
        <input
          type={showPasswordToggle && showPassword ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C6839] focus:border-[#0C6839] transition-all duration-200 bg-white text-black placeholder-gray-500 font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center touch-manipulation"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[#0C6839] hover:text-[#064f2d]" />
            ) : (
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[#0C6839] hover:text-[#064f2d]" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Auth Error Alert Component
const AdminErrorAlert = ({ message }) => {
  if (!message) return null;

  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
        </div>
        <div className="ml-2 sm:ml-3">
          <p className="text-xs sm:text-sm font-medium text-red-800">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

// Auth Success Alert Component
const AdminSuccessAlert = ({ message }) => {
  if (!message) return null;

  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
        </div>
        <div className="ml-2 sm:ml-3">
          <p className="text-xs sm:text-sm font-medium text-green-800">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

// Auth Submit Button Component
const AdminSubmitButton = ({ loading = false, onClick, isLogin = true }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex justify-center py-3 sm:py-4 px-4 sm:px-6 border border-transparent rounded-lg shadow-lg text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-[#0C6839] to-[#064f2d] hover:from-[#075a2f] hover:to-[#053d1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C6839] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 touch-manipulation"
    >
      {loading ? (
        <div className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {isLogin ? "Authenticating..." : "Creating Account..."}
        </div>
      ) : (
        <>
          {isLogin ? (
            <>
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white" />
              Login to Dashboard
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white" />
              Register Takmir Account
            </>
          )}
        </>
      )}
    </button>
  );
};

// Auth Header Component
const AdminAuthHeader = ({ isLogin = true }) => {
  return (
    <div className="text-center mb-6 sm:mb-8">
      <div className="flex justify-center mb-4 sm:mb-6">
        <div className="p-3 sm:p-4 bg-[#0C6839] rounded-xl shadow-lg">
          {isLogin ? (
            <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          ) : (
            <UserPlus className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          )}
        </div>
      </div>
      <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
        {isLogin ? "Dashboard Portal" : "Takmir Registration"}
      </h1>
      <p className="text-gray-600 text-sm sm:text-lg px-4">
        {isLogin
          ? "Login untuk Takmir dan System Admin Goqu"
          : "Create New Takmir Account"}
      </p>
      <div className="mt-3 sm:mt-4 h-1 w-16 sm:w-24 bg-[#0C6839] mx-auto rounded-full"></div>
    </div>
  );
};

// Security Features Component
const AdminSecurityFeatures = () => {
  const features = [
    { icon: Shield, text: "Multi-Factor Authentication" },
    { icon: Lock, text: "End-to-End Encryption" },
    { icon: BarChart3, text: "Audit Logging" },
    { icon: Settings, text: "Role-Based Access" },
  ];

  return (
    <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-[#e6f5e8] rounded-xl border-2 border-[#c0dccb]">
      <h3 className="text-xs sm:text-sm font-semibold text-[#0C6839] mb-3 sm:mb-4 text-center">
        SECURITY FEATURES
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-xs text-gray-600">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center">
            <feature.icon className="h-3 w-3 sm:h-4 sm:w-4 text-[#0C6839] mr-2 flex-shrink-0" />
            <span className="font-medium text-xs sm:text-xs">
              {feature.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mode Toggle Component
const ModeToggle = ({ isLogin, onToggle }) => {
  return (
    <div className="text-center mb-6">
      <p className="text-sm text-gray-600 mb-3">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
      </p>
      <button
        type="button"
        onClick={onToggle}
        className="text-[#0C6839] hover:text-[#064f2d] font-semibold text-sm underline transition-colors duration-200"
      >
        {isLogin ? "Register as Takmir" : "Login to Admin Panel"}
      </button>
    </div>
  );
};

// Main Auth Component
const AdminAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    nama_masjid: "",
    alamat: "",
    nomor_telfon: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateLoginForm = () => {
    if (!loginForm.email || !loginForm.password) {
      setError("Please enter both email and password.");
      return false;
    }

    if (loginForm.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginForm.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const validateRegisterForm = () => {
    const { username, email, password, nama_masjid, alamat, nomor_telfon } =
      registerForm;

    if (
      !username ||
      !email ||
      !password ||
      !nama_masjid ||
      !alamat ||
      !nomor_telfon
    ) {
      setError("Please fill in all required fields.");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return false;
    }

    if (nama_masjid.length < 3) {
      setError("Mosque name must be at least 3 characters long.");
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/login", {
        email: loginForm.email,
        password: loginForm.password,
      });

      const { token, user } = res.data.data;
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user?.masjid) {
        localStorage.setItem("masjid", JSON.stringify(user.masjid));
      } else {
        localStorage.removeItem("masjid");
      }

      toast.success("Authenticated! Redirecting...");
      if (user?.role?.Nama === "Admin") {
        navigate("/system-admin/dashboard");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
      toast.error(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;
    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/register/takmir", {
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        nama_masjid: registerForm.nama_masjid,
        alamat: registerForm.alamat,
        nomor_telfon: registerForm.nomor_telfon,
      });

      setSuccess(
        "Registration successful! You can now login with your credentials."
      );
      toast.success("Registration successful! Please login.");

      // Clear form and switch to login
      setRegisterForm({
        username: "",
        email: "",
        password: "",
        nama_masjid: "",
        alamat: "",
        nomor_telfon: "",
      });

      // Switch to login mode after a short delay
      setTimeout(() => {
        setIsLogin(true);
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f4ed] via-[#d1eadb] to-[#315a47] flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-lg mx-auto">
        <div className="bg-[#f0f9f4] py-6 sm:py-10 px-4 sm:px-8 shadow-2xl rounded-xl sm:rounded-2xl border border-[#d0e6da] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-2 sm:-mt-4 -mr-2 sm:-mr-4 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-[#0C6839] to-[#064f2d] rounded-full opacity-20"></div>
          <div className="absolute bottom-0 left-0 -mb-2 sm:-mb-4 -ml-2 sm:-ml-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-[#0C6839] to-[#064f2d] rounded-full opacity-20"></div>

          <div className="relative">
            <AdminAuthHeader isLogin={isLogin} />

            <ModeToggle isLogin={isLogin} onToggle={toggleMode} />

            <div className="space-y-4 sm:space-y-6">
              {isLogin ? (
                // Login Form
                <>
                  <AdminInputField
                    label="Email"
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    required
                    icon={Mail}
                  />

                  <AdminInputField
                    label="Password"
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    required
                    icon={Lock}
                    showPasswordToggle
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                  />

                  <AdminErrorAlert message={error} />
                  <AdminSuccessAlert message={success} />

                  <AdminSubmitButton
                    loading={loading}
                    onClick={handleLogin}
                    isLogin={true}
                  />
                </>
              ) : (
                // Register Form
                <>
                  <AdminInputField
                    label="Full Name"
                    type="text"
                    name="username"
                    value={registerForm.username}
                    onChange={handleRegisterChange}
                    required
                    icon={User}
                  />

                  <AdminInputField
                    label="Email Address"
                    type="email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    required
                    icon={Mail}
                  />

                  <AdminInputField
                    label="Password"
                    type="password"
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    required
                    icon={Lock}
                    showPasswordToggle
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                  />

                  <AdminInputField
                    label="Mosque Name"
                    type="text"
                    name="nama_masjid"
                    value={registerForm.nama_masjid}
                    onChange={handleRegisterChange}
                    required
                    icon={Building}
                  />

                  <AdminInputField
                    label="Address"
                    type="text"
                    name="alamat"
                    value={registerForm.alamat}
                    onChange={handleRegisterChange}
                    required
                    icon={MapPin}
                  />

                  <AdminInputField
                    label="Phone Number"
                    type="tel"
                    name="nomor_telfon"
                    value={registerForm.nomor_telfon}
                    onChange={handleRegisterChange}
                    required
                    icon={Phone}
                  />

                  <AdminErrorAlert message={error} />
                  <AdminSuccessAlert message={success} />

                  <AdminSubmitButton
                    loading={loading}
                    onClick={handleRegister}
                    isLogin={false}
                  />
                </>
              )}
            </div>

            <AdminSecurityFeatures />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 sm:mt-8 text-center px-4">
        <p className="text-xs sm:text-xs text-[#0C6839] mb-1 sm:mb-2">
          {isLogin
            ? "Unified login for Takmir and System Admin"
            : "Takmir Registration - Create Your Account"}
        </p>
        <p className="text-xs text-gray-400">
          All activities are monitored and logged for security purposes
        </p>
      </div>
    </div>
  );
};

export default AdminAuthPage;
