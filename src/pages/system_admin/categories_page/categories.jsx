import React, { useEffect, useState } from "react";
import SystemAdminLayout from "../../../layouts/system_admin_layout";
import {
  createAdminDonationCategory,
  createAdminExpenseCategory,
  getAdminDonationCategories,
  getAdminExpenseCategories,
  updateAdminDonationCategory,
  updateAdminExpenseCategory,
} from "../../../services/systemAdminService";
import toast from "react-hot-toast";
import { SysAdminCategoryGridSkeleton } from "../../../components/common/Skeleton";

function CategorySection({ title, items, onCreate, onToggle }) {
  const [value, setValue] = useState("");

  return (
    <div className="rounded-2xl border border-[#ded5c3] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Nama kategori"
            className="rounded-xl border border-[#d7cfbe] px-4 py-2"
          />
          <button
            onClick={async () => {
              if (!value.trim()) return;
              await onCreate(value);
              setValue("");
            }}
            className="rounded-xl bg-[#1f4d3d] px-4 py-2 text-white"
          >
            Add
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-[#eee6d7] px-4 py-3"
          >
            <div>
              <p className="font-medium">{item.Nama}</p>
              <p className="text-xs text-[#6f6657]">
                {item.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <button
              onClick={() => onToggle(item)}
              className={`rounded-xl px-3 py-2 text-sm ${
                item.isActive
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {item.isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SystemAdminCategoriesPage() {
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [donationData, expenseData] = await Promise.all([
        getAdminDonationCategories(),
        getAdminExpenseCategories(),
      ]);
      setDonations(donationData);
      setExpenses(expenseData);
    } catch {
      toast.error("Failed to load categories");
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
        <SysAdminCategoryGridSkeleton />
      </SystemAdminLayout>
    );
  }

  return (
    <SystemAdminLayout>
      <div className="space-y-6">
        <CategorySection
          title="Kategori Donasi"
          items={donations}
          onCreate={async (value) => {
            try {
              await createAdminDonationCategory(value);
              toast.success("Donation category created");
              load();
            } catch (error) {
              toast.error(error.response?.data?.message || "Failed to create category");
            }
          }}
          onToggle={async (item) => {
            try {
              await updateAdminDonationCategory(item.id, { isActive: !item.isActive });
              toast.success("Donation category updated");
              load();
            } catch {
              toast.error("Failed to update donation category");
            }
          }}
        />
        <CategorySection
          title="Kategori Pengeluaran"
          items={expenses}
          onCreate={async (value) => {
            try {
              await createAdminExpenseCategory(value);
              toast.success("Expense category created");
              load();
            } catch (error) {
              toast.error(error.response?.data?.message || "Failed to create category");
            }
          }}
          onToggle={async (item) => {
            try {
              await updateAdminExpenseCategory(item.id, { isActive: !item.isActive });
              toast.success("Expense category updated");
              load();
            } catch {
              toast.error("Failed to update expense category");
            }
          }}
        />
      </div>
    </SystemAdminLayout>
  );
}
