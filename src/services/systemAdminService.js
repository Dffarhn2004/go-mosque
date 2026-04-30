import axiosInstance from "../api/axiosInstance";

export const getAdminUsers = async (params = {}) => {
  const { data } = await axiosInstance.get("/system-admin/users", { params });
  return data.data;
};

export const getAdminUserById = async (id) => {
  const { data } = await axiosInstance.get(`/system-admin/users/${id}`);
  return data.data;
};

export const createTakmirByAdmin = async (payload) => {
  const { data } = await axiosInstance.post("/system-admin/users/takmir", payload);
  return data.data;
};

export const createAdminByAdmin = async (payload) => {
  const { data } = await axiosInstance.post("/system-admin/users/admin", payload);
  return data.data;
};

export const updateAdminUserRole = async (id, roleId) => {
  const { data } = await axiosInstance.patch(`/system-admin/users/${id}/role`, { roleId });
  return data.data;
};

export const updateAdminUserStatus = async (id, isActive) => {
  const { data } = await axiosInstance.patch(`/system-admin/users/${id}/status`, { isActive });
  return data.data;
};

export const getAdminMasjids = async (params = {}) => {
  const { data } = await axiosInstance.get("/system-admin/masjids", { params });
  return data.data;
};

export const updateAdminMasjid = async (id, payload) => {
  const { data } = await axiosInstance.patch(`/system-admin/masjids/${id}`, payload);
  return data.data;
};

export const updateAdminMasjidStatus = async (id, isActive) => {
  const { data } = await axiosInstance.patch(`/system-admin/masjids/${id}/status`, { isActive });
  return data.data;
};

export const getAdminDonationCategories = async () => {
  const { data } = await axiosInstance.get("/system-admin/categories/donations");
  return data.data;
};

export const createAdminDonationCategory = async (nama) => {
  const { data } = await axiosInstance.post("/system-admin/categories/donations", { nama });
  return data.data;
};

export const updateAdminDonationCategory = async (id, payload) => {
  const { data } = await axiosInstance.patch(`/system-admin/categories/donations/${id}`, payload);
  return data.data;
};

export const getAdminExpenseCategories = async () => {
  const { data } = await axiosInstance.get("/system-admin/categories/expenses");
  return data.data;
};

export const createAdminExpenseCategory = async (nama) => {
  const { data } = await axiosInstance.post("/system-admin/categories/expenses", { nama });
  return data.data;
};

export const updateAdminExpenseCategory = async (id, payload) => {
  const { data } = await axiosInstance.patch(`/system-admin/categories/expenses/${id}`, payload);
  return data.data;
};

export const getAdminDefaultAccounts = async (params = {}) => {
  const { data } = await axiosInstance.get("/system-admin/coa/default", { params });
  return data.data;
};

export const createAdminDefaultAccount = async (payload) => {
  const { data } = await axiosInstance.post("/system-admin/coa/default", payload);
  return data.data;
};

export const updateAdminDefaultAccount = async (id, payload) => {
  const { data } = await axiosInstance.put(`/system-admin/coa/default/${id}`, payload);
  return data.data;
};

export const deactivateAdminDefaultAccount = async (id) => {
  const { data } = await axiosInstance.patch(`/system-admin/coa/default/${id}/status`);
  return data.data;
};

export const getAdminMonitoringSummary = async () => {
  const { data } = await axiosInstance.get("/system-admin/monitoring/summary");
  return data.data;
};

export const getAdminDonationCampaigns = async (params = {}) => {
  const { data } = await axiosInstance.get("/system-admin/monitoring/donations", { params });
  return data.data;
};

export const getAdminExpenseRecords = async (params = {}) => {
  const { data } = await axiosInstance.get("/system-admin/monitoring/expenses", { params });
  return data.data;
};

export const getAdminAuditLogs = async (params = {}) => {
  const { data } = await axiosInstance.get("/system-admin/audit-logs", { params });
  return data.data;
};

export const getAdminSystemConfigs = async () => {
  const { data } = await axiosInstance.get("/system-admin/configs");
  return data.data;
};

export const upsertAdminSystemConfig = async (key, payload) => {
  const { data } = await axiosInstance.put(`/system-admin/configs/${key}`, payload);
  return data.data;
};
