import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Heart, Home } from "lucide-react";

import ErrorAlert from "../../../components/common/Auth/ErrorAlert";
import InputField from "../../../components/common/Auth/InputField";
import SubmitButton from "../../../components/common/Auth/SubmitButton";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../../api/axiosInstance";
import { routes } from "../../../routes";

// Toggle Link Component
const AuthToggle = ({ isLogin, onToggle }) => {
  return (
    <div className="mt-6 sm:mt-8">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-[#f0f9f4] text-gray-500 dark:text-gray-400">
            {isLogin ? "New to our platform?" : "Already have an account?"}
          </span>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 text-center">
        <button
          type="button"
          onClick={onToggle}
          className="w-full sm:w-auto px-6 py-3 sm:py-2 font-medium border border-transparent rounded-lg shadow-sm text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          {isLogin
            ? "Create an account to start donating"
            : "Sign in to your account"}
        </button>
      </div>
    </div>
  );
};

// Header Component
const AuthHeader = ({ isLogin }) => {
  return (
    <div className="text-center mb-6 sm:mb-8">
      <div className="flex justify-center mb-3 sm:mb-4">
        <div className="p-3 sm:p-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full">
          <Home className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
        </div>
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
        {isLogin ? "Welcome Back" : "Join Our Community"}
      </h2>
      <p className="text-gray-600 mt-2 text-sm sm:text-base px-2 sm:px-0">
        {isLogin
          ? "Sign in to continue your generous donations"
          : "Create an account to support our mosque"}
      </p>
    </div>
  );
};

// Trust Indicators Component
const TrustIndicators = () => {
  return (
    <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-50 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center">
          <Heart className="h-4 w-4 text-red-500 mr-1" />
          <span>Trusted Platform</span>
        </div>
        <div className="flex items-center">
          <svg
            className="h-4 w-4 text-green-500 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Secure</span>
        </div>
        <div className="flex items-center">
          <svg
            className="h-4 w-4 text-blue-500 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Verified</span>
        </div>
      </div>
    </div>
  );
};

// Main Auth Component
const AuthPage = ({ defaultMode = "login" }) => {
  const [isLogin, setIsLogin] = useState(defaultMode !== "register");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();

  React.useEffect(() => {
    setIsLogin(defaultMode !== "register");
  }, [defaultMode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const validateForm = () => {
    if (!form.email || !form.password) {
      setError("Please fill all required fields.");
      return false;
    }

    if (!isLogin && !form.name) {
      setError("Please enter your full name.");
      return false;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    if (!isLogin && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const res = await axiosInstance.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        const token = res.data.data.token;
        localStorage.setItem("accessToken", token);
        localStorage.setItem("user", JSON.stringify(res.data.data.user));

        toast.success("Authenticated! Redirecting...");
        navigate(routes.donor.home);
      } else {
        // Register
        const res = await axiosInstance.post("/auth/register", {
          username: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });

        toast.success("Registration successful! Please log in.");
        setIsLogin(true);
        setForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || (isLogin ? "Login failed." : "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAuth = () => {
    const nextIsLogin = !isLogin;
    setIsLogin(nextIsLogin);
    setError("");
    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    navigate(nextIsLogin ? routes.public.login : routes.public.register);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f4ed] via-[#d1eadb] to-[#315a47] flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto w-full sm:w-full sm:max-w-md">
        <div className="bg-[#f0f9f4] py-6 sm:py-8 px-4 sm:px-10 shadow-2xl rounded-xl border-0 dark:border dark:border-gray-700">
          <AuthHeader isLogin={isLogin} />

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {!isLogin && (
              <InputField
                label="Full Name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                icon={User}
              />
            )}

            <InputField
              label="Email Address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              icon={Mail}
            />

            <InputField
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              icon={Lock}
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            {!isLogin && (
              <InputField
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                icon={Lock}
                showPasswordToggle
                showPassword={showConfirmPassword}
                onTogglePassword={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              />
            )}

            <ErrorAlert message={error} />

            <SubmitButton
              isLogin={isLogin}
              loading={loading}
              onClick={handleSubmit}
            />
          </form>

          <AuthToggle isLogin={isLogin} onToggle={handleToggleAuth} />

          <TrustIndicators />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 sm:mt-8 text-center px-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
