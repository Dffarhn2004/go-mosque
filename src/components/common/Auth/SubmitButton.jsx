import React from "react";

const SubmitButton = ({
  isLogin,
  loading = false,
  label,
  loadingLabel,
}) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center rounded-2xl bg-[#0C6839] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#075a2f] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <span className="flex items-center">
          <svg
            className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingLabel || "Memproses..."}
        </span>
      ) : (
        label || (isLogin ? "Masuk" : "Daftar")
      )}
    </button>
  );
};

export default SubmitButton;
