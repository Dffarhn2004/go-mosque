import React, { useEffect, useState } from "react";
import SystemAdminLayout from "../../../layouts/system_admin_layout";
import {
  deactivateAdminDefaultAccount,
  getAdminDefaultAccounts,
} from "../../../services/systemAdminService";
import toast from "react-hot-toast";
import { SysAdminTableSkeleton } from "../../../components/common/Skeleton";

export default function SystemAdminCoaPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setAccounts(await getAdminDefaultAccounts({ includeInactive: true }));
    } catch {
      toast.error("Failed to load default COA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <SystemAdminLayout>
        <SysAdminTableSkeleton rows={10} cols={5} title />
      </SystemAdminLayout>
    );
  }

  return (
    <SystemAdminLayout>
      <div className="rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">Default COA</h1>
        <p className="mb-4 text-sm text-[#6f6657]">
          Endpoint backend untuk create/update sudah tersedia. Halaman ini fokus
          pada visibilitas dan nonaktifkan akun default tanpa mengganggu COA masjid.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-[#6f6657]">
              <tr>
                <th className="pb-3">Code</th>
                <th className="pb-3">Name</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Group</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-t border-[#eee6d7]">
                  <td className="py-3">{account.code}</td>
                  <td className="py-3">{account.name}</td>
                  <td className="py-3">{account.type}</td>
                  <td className="py-3">{account.isGroup ? "Yes" : "No"}</td>
                  <td className="py-3">
                    <button
                      disabled={!account.isActive || account.isGroup}
                      onClick={async () => {
                        try {
                          await deactivateAdminDefaultAccount(account.id);
                          toast.success("Default account deactivated");
                          load();
                        } catch (error) {
                          toast.error(
                            error.response?.data?.message ||
                              "Failed to deactivate default account"
                          );
                        }
                      }}
                      className={`rounded-xl px-3 py-2 text-xs ${
                        account.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {account.isActive ? "Active" : "Inactive"}
                    </button>
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
