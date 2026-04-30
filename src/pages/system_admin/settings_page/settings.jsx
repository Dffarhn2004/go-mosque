import React, { useEffect, useState } from "react";
import SystemAdminLayout from "../../../layouts/system_admin_layout";
import {
  getAdminSystemConfigs,
  upsertAdminSystemConfig,
} from "../../../services/systemAdminService";
import toast from "react-hot-toast";

export default function SystemAdminSettingsPage() {
  const [configs, setConfigs] = useState([]);

  const load = async () => {
    try {
      setConfigs(await getAdminSystemConfigs());
    } catch {
      toast.error("Failed to load system configs");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SystemAdminLayout>
      <div className="rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">System Configurations</h1>
        <div className="space-y-4">
          {configs.map((config) => (
            <ConfigEditor key={config.id} config={config} onSaved={load} />
          ))}
        </div>
      </div>
    </SystemAdminLayout>
  );
}

function ConfigEditor({ config, onSaved }) {
  const [value, setValue] = useState(JSON.stringify(config.value, null, 2));
  const [description, setDescription] = useState(config.description || "");

  return (
    <div className="rounded-2xl border border-[#eee6d7] p-4">
      <div className="mb-2">
        <p className="font-semibold">{config.key}</p>
        <p className="text-xs text-[#6f6657]">
          Updated: {new Date(config.updatedAt).toLocaleString("id-ID")}
        </p>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        className="w-full rounded-xl border border-[#d7cfbe] px-4 py-3 font-mono text-sm"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-3 w-full rounded-xl border border-[#d7cfbe] px-4 py-3 text-sm"
        placeholder="Description"
      />
      <button
        onClick={async () => {
          try {
            await upsertAdminSystemConfig(config.key, {
              value: JSON.parse(value),
              description,
            });
            toast.success("Config updated");
            onSaved();
          } catch (error) {
            toast.error("Failed to update config");
          }
        }}
        className="mt-3 rounded-xl bg-[#1f4d3d] px-4 py-2 text-white"
      >
        Save
      </button>
    </div>
  );
}
