import React from "react";
import { ArrowRight, MapPin } from "lucide-react";
import formatCurrency from "../../utils/formatCurrency";

const MosqueCard = ({
  image,
  title,
  name,
  description,
  currentAmount,
  targetAmount,
  onClick,
}) => {
  const safeCurrentAmount = Number(currentAmount) || 0;
  const safeTargetAmount = Number(targetAmount) || 0;
  const percentage =
    safeTargetAmount > 0
      ? Math.min(Math.round((safeCurrentAmount / safeTargetAmount) * 100), 100)
      : 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      <div className="relative">
        <img
          src={image || "/Masjid1.jpg"}
          alt={title}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/55 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
          {percentage}% Terkumpul
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-white backdrop-blur-md">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/75">
              Campaign
            </p>
            <p className="mt-1 line-clamp-1 text-sm font-semibold">{name}</p>
          </div>
          <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            Aktif
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-5">
          <h3 className="line-clamp-2 text-xl font-bold leading-snug text-slate-900">
            {title}
          </h3>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            <MapPin className="h-3.5 w-3.5" />
            {name}
          </div>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
            {description || "Campaign ini sedang menghimpun dukungan untuk kebutuhan masjid."}
          </p>
        </div>

        <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Progress dana</span>
          <span>{percentage}%</span>
        </div>
        <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 shadow-inner transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Terkumpul
            </p>
            <p className="mt-2 truncate text-sm font-bold text-slate-900">
              {formatCurrency(safeCurrentAmount)}
            </p>
          </div>
          <div className="min-w-0 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Target
            </p>
            <p className="mt-2 truncate text-sm font-bold text-slate-900">
              {formatCurrency(safeTargetAmount)}
            </p>
          </div>
        </div>

        <button
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0473A8] px-4 py-3.5 font-semibold text-white transition duration-300 hover:bg-sky-700 hover:shadow-lg"
          onClick={onClick}
        >
          Lihat Campaign
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
};

export default MosqueCard;
