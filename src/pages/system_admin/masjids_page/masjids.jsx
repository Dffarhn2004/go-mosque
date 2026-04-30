import React, { useEffect, useState } from "react";
import SystemAdminLayout from "../../../layouts/system_admin_layout";
import {
  getAdminMasjids,
  updateAdminMasjid,
  updateAdminMasjidStatus,
} from "../../../services/systemAdminService";
import toast from "react-hot-toast";

export default function SystemAdminMasjidsPage() {
  const [masjids, setMasjids] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const loadMasjids = async () => {
    try {
      setMasjids(await getAdminMasjids());
    } catch {
      toast.error("Failed to load masjids");
    }
  };

  useEffect(() => {
    loadMasjids();
  }, []);

  return (
    <SystemAdminLayout>
      <div className="rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">Masjid Directory</h1>
        <div className="space-y-4">
          {masjids.map((masjid) => (
            <div key={masjid.id} className="rounded-2xl border border-[#eee6d7] p-4">
              {editingId === masjid.id ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-xl border border-[#d7cfbe] px-4 py-3"
                    value={form.Nama || ""}
                    onChange={(e) => setForm({ ...form, Nama: e.target.value })}
                    placeholder="Nama"
                  />
                  <input
                    className="rounded-xl border border-[#d7cfbe] px-4 py-3"
                    value={form.NomorTelepon || ""}
                    onChange={(e) =>
                      setForm({ ...form, NomorTelepon: e.target.value })
                    }
                    placeholder="Nomor Telepon"
                  />
                  <textarea
                    className="rounded-xl border border-[#d7cfbe] px-4 py-3 md:col-span-2"
                    value={form.Alamat || ""}
                    onChange={(e) => setForm({ ...form, Alamat: e.target.value })}
                    placeholder="Alamat"
                  />
                  <div className="flex gap-2 md:col-span-2">
                    <button
                      onClick={async () => {
                        try {
                          await updateAdminMasjid(masjid.id, form);
                          toast.success("Masjid updated");
                          setEditingId(null);
                          loadMasjids();
                        } catch {
                          toast.error("Failed to update masjid");
                        }
                      }}
                      className="rounded-xl bg-[#1f4d3d] px-4 py-2 text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-xl border border-[#d7cfbe] px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{masjid.Nama}</h2>
                    <p className="text-sm text-[#6f6657]">{masjid.Alamat}</p>
                    <p className="mt-1 text-sm">Telp: {masjid.NomorTelepon}</p>
                    <p className="mt-2 text-xs text-[#8a7550]">
                      Users: {masjid.users.length}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(masjid.id);
                        setForm({
                          Nama: masjid.Nama,
                          Alamat: masjid.Alamat,
                          NomorTelepon: masjid.NomorTelepon,
                        });
                      }}
                      className="rounded-xl border border-[#d7cfbe] px-4 py-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await updateAdminMasjidStatus(masjid.id, !masjid.isActive);
                          toast.success("Masjid status updated");
                          loadMasjids();
                        } catch {
                          toast.error("Failed to update masjid status");
                        }
                      }}
                      className={`rounded-xl px-4 py-2 text-white ${
                        masjid.isActive ? "bg-[#7b2e2e]" : "bg-[#1f4d3d]"
                      }`}
                    >
                      {masjid.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SystemAdminLayout>
  );
}
