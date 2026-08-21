import React from "react";
import { Eye, EyeOff } from "lucide-react";

const InputField = ({
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
  placeholder,
  autoComplete,
  hint,
}) => {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          id={name}
          type={showPasswordToggle && showPassword ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          className={`w-full rounded-2xl border border-gray-200 bg-white py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
            Icon ? "pl-11" : "pl-4"
          } ${showPasswordToggle ? "pr-12" : "pr-4"}`}
          placeholder={placeholder || label}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition hover:text-gray-600"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
};

export default InputField;
