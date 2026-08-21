import React from "react";
import { AlertCircle } from "lucide-react";

const ErrorAlert = ({ message }) => {
  if (!message) return null;

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
        <p className="text-sm text-red-800">{message}</p>
      </div>
    </div>
  );
};

export default ErrorAlert;
