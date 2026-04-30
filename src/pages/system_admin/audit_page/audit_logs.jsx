import React, { useEffect, useState } from "react";
import SystemAdminLayout from "../../../layouts/system_admin_layout";
import { getAdminAuditLogs } from "../../../services/systemAdminService";
import toast from "react-hot-toast";

export default function SystemAdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLogs(await getAdminAuditLogs({ limit: 200 }));
      } catch {
        toast.error("Failed to load audit logs");
      }
    })();
  }, []);

  return (
    <SystemAdminLayout>
      <div className="rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">Audit Logs</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-[#6f6657]">
              <tr>
                <th className="pb-3">Action</th>
                <th className="pb-3">Entity</th>
                <th className="pb-3">Entity Name</th>
                <th className="pb-3">User</th>
                <th className="pb-3">Created At</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-[#eee6d7] align-top">
                  <td className="py-3">{log.action}</td>
                  <td className="py-3">{log.entityType}</td>
                  <td className="py-3">{log.entityName || "-"}</td>
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
    </SystemAdminLayout>
  );
}
