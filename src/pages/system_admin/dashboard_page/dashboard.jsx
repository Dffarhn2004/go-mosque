import React, { useEffect, useState } from "react";
import SystemAdminLayout from "../../../layouts/system_admin_layout";
import { getAdminMonitoringSummary, getAdminAuditLogs } from "../../../services/systemAdminService";
import toast from "react-hot-toast";

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm">
      <p className="text-sm text-[#6f6657]">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-[#1f2b22]">{value}</p>
    </div>
  );
}

export default function SystemAdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [summaryData, logData] = await Promise.all([
          getAdminMonitoringSummary(),
          getAdminAuditLogs({ limit: 10 }),
        ]);
        setSummary(summaryData);
        setLogs(logData);
      } catch (error) {
        toast.error("Failed to load system admin dashboard");
      }
    })();
  }, []);

  return (
    <SystemAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold">System Overview</h1>
          <p className="mt-2 text-sm text-[#6f6657]">
            Monitoring lintas masjid, donasi, pengeluaran, dan aktivitas admin.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Campaign Donasi" value={summary?.campaignCount ?? "-"} />
          <StatCard title="Masjid Aktif" value={summary?.activeMasjidCount ?? "-"} />
          <StatCard title="Total Donasi" value={summary ? `Rp ${summary.totalDonations.toLocaleString("id-ID")}` : "-"} />
          <StatCard title="Total Pengeluaran" value={summary ? `Rp ${summary.totalExpenses.toLocaleString("id-ID")}` : "-"} />
        </div>

        <div className="rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Recent Audit Logs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-[#6f6657]">
                <tr>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Entity</th>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-[#eee6d7]">
                    <td className="py-3">{log.action}</td>
                    <td className="py-3">{log.entityType}</td>
                    <td className="py-3">{log.user?.NamaLengkap || "-"}</td>
                    <td className="py-3">
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </td>
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
