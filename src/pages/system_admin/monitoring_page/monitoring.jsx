import React, { useEffect, useState } from "react";
import SystemAdminLayout from "../../../layouts/system_admin_layout";
import {
  getAdminDonationCampaigns,
  getAdminExpenseRecords,
  getAdminMonitoringSummary,
} from "../../../services/systemAdminService";
import toast from "react-hot-toast";

export default function SystemAdminMonitoringPage() {
  const [summary, setSummary] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [summaryData, campaignData, expenseData] = await Promise.all([
          getAdminMonitoringSummary(),
          getAdminDonationCampaigns(),
          getAdminExpenseRecords(),
        ]);
        setSummary(summaryData);
        setCampaigns(campaignData);
        setExpenses(expenseData);
      } catch {
        toast.error("Failed to load monitoring data");
      }
    })();
  }, []);

  return (
    <SystemAdminLayout>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#6f6657]">Campaign</p>
            <p className="mt-2 text-3xl font-semibold">{summary?.campaignCount ?? "-"}</p>
          </div>
          <div className="rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#6f6657]">Donasi Masuk</p>
            <p className="mt-2 text-3xl font-semibold">
              {summary ? `Rp ${summary.totalDonations.toLocaleString("id-ID")}` : "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#6f6657]">Pengeluaran</p>
            <p className="mt-2 text-3xl font-semibold">
              {summary ? `Rp ${summary.totalExpenses.toLocaleString("id-ID")}` : "-"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Campaign Donasi</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-[#6f6657]">
                <tr>
                  <th className="pb-3">Campaign</th>
                  <th className="pb-3">Masjid</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Target</th>
                  <th className="pb-3">Terkumpul</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((item) => (
                  <tr key={item.id} className="border-t border-[#eee6d7]">
                    <td className="py-3">{item.Nama}</td>
                    <td className="py-3">{item.masjid?.Nama}</td>
                    <td className="py-3">{item.kategori_donasi?.Nama}</td>
                    <td className="py-3">Rp {Number(item.TargetUangDonasi).toLocaleString("id-ID")}</td>
                    <td className="py-3">Rp {Number(item.UangDonasiTerkumpul).toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Pengeluaran Donasi</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-[#6f6657]">
                <tr>
                  <th className="pb-3">Tujuan</th>
                  <th className="pb-3">Masjid</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((item) => (
                  <tr key={item.id} className="border-t border-[#eee6d7]">
                    <td className="py-3">{item.TujuanPengeluaran}</td>
                    <td className="py-3">{item.Masjid?.Nama}</td>
                    <td className="py-3">{item.kategori_pengeluaran?.Nama}</td>
                    <td className="py-3">Rp {Number(item.UangPengeluaran).toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SystemAdminLayout>
  );
}
