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
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl md:rounded-[28px]">
      <div className="relative">
        <img
          src={image || "/Masjid1.jpg"}
          alt={title}
          className="h-28 w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-40 md:h-56"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/55 to-transparent md:h-24" />
        <div className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg md:left-4 md:top-4 md:px-3 md:py-1.5 md:text-xs">
          {percentage}% Terkumpul
        </div>
        <div className="absolute bottom-2 left-2 right-2 hidden items-center justify-between rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-white backdrop-blur-md md:bottom-4 md:left-4 md:right-4 md:flex">
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

      <div className="flex flex-1 flex-col p-3 md:p-6">
        <div className="mb-3 md:mb-5">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 md:text-xl">
            {title}
          </h3>
          <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 md:gap-2 md:px-3 md:py-1 md:text-xs">
            <MapPin className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
            <span className="truncate">{name}</span>
          </div>
          <p className="mt-4 hidden line-clamp-3 text-sm leading-6 text-slate-600 md:block">
            {description || "Campaign ini sedang menghimpun dukungan untuk kebutuhan masjid."}
          </p>
        </div>

        <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium text-slate-500 md:mb-3 md:text-xs">
          <span>Progress dana</span>
          <span>{percentage}%</span>
        </div>
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 md:mb-4 md:h-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 shadow-inner transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mb-3 grid grid-cols-1 gap-1 rounded-xl bg-slate-50 p-2.5 md:mb-6 md:grid-cols-2 md:gap-3 md:rounded-2xl md:p-4">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.14em] text-slate-500 md:text-xs md:tracking-[0.18em]">
              Terkumpul
            </p>
            <p className="mt-1 truncate text-xs font-bold text-slate-900 md:mt-2 md:text-sm">
              {formatCurrency(safeCurrentAmount)}
            </p>
          </div>
          <div className="min-w-0 md:text-right">
            <p className="text-[9px] uppercase tracking-[0.14em] text-slate-500 md:text-xs md:tracking-[0.18em]">
              Target
            </p>
            <p className="mt-1 truncate text-xs font-bold text-slate-900 md:mt-2 md:text-sm">
              {formatCurrency(safeTargetAmount)}
            </p>
          </div>
        </div>

        <button
          className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0473A8] px-3 py-2.5 text-xs font-semibold text-white transition duration-300 hover:bg-sky-700 hover:shadow-lg md:gap-2 md:rounded-2xl md:px-4 md:py-3.5 md:text-base"
          onClick={onClick}
        >
          <span className="md:hidden">Lihat</span>
          <span className="hidden md:inline">Lihat Campaign</span>
          <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </button>
      </div>
    </article>
  );
};

export default MosqueCard;
