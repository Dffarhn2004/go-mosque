export const clearAuthSession = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("masjid");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("masjid");
};

const parseStoredJson = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

export const getAccessToken = () =>
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("accessToken") ||
  null;

export const getStoredUser = () =>
  parseStoredJson(localStorage.getItem("user")) ||
  parseStoredJson(sessionStorage.getItem("user"));

export const hasAuthSession = () => {
  const token = getAccessToken();
  const user = getStoredUser();

  return Boolean(token && user?.id);
};

export const getDonorNavbarUser = () => {
  if (!hasAuthSession()) return null;

  const user = getStoredUser();

  return {
    name: user?.NamaLengkap || "Donatur",
    email: user?.Email || "",
    role: "Donatur",
    avatar:
      "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
  };
};

export const logoutAndRedirect = (targetPath = "/") => {
  clearAuthSession();
  window.location.replace(targetPath);
};
