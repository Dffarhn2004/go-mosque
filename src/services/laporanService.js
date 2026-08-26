import axiosInstance from "../api/axiosInstance";

/**
 * Generate Neraca (Laporan Posisi Keuangan)
 * @param {string} tanggal - Date (ISO string or date string)
 * @returns {Promise<Object>} Neraca data
 */
export const generateNeraca = async (tanggal) => {
  try {
    // Convert tanggal to date string if needed
    const dateStr = tanggal.includes("T") ? tanggal.split("T")[0] : tanggal;

    const response = await axiosInstance.get(
      "/laporan-keuangan/jurnal/posisi-keuangan",
      {
        params: { tanggal: dateStr },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error generating neraca:", error);
    throw error;
  }
};

/**
 * Generate Laba Rugi (Laporan Penghasilan Komprehensif)
 * @param {string} tanggalAwal - Start date (ISO string or date string)
 * @param {string} tanggalAkhir - End date (ISO string or date string)
 * @returns {Promise<Object>} Laba Rugi data
 */
export const generateLabaRugi = async (tanggalAwal, tanggalAkhir) => {
  try {
    // Convert to date strings if needed
    const startStr = tanggalAwal.includes("T")
      ? tanggalAwal.split("T")[0]
      : tanggalAwal;
    const endStr = tanggalAkhir.includes("T")
      ? tanggalAkhir.split("T")[0]
      : tanggalAkhir;

    const response = await axiosInstance.get(
      "/laporan-keuangan/jurnal/penghasilan-komprehensif",
      {
        params: {
          tanggalAwal: startStr,
          tanggalAkhir: endStr,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error generating laba rugi:", error);
    throw error;
  }
};

/**
 * Generate Perubahan Ekuitas (Laporan Perubahan Aset Neto) tahunan
 * @param {string|number} tahun - Tahun laporan (YYYY)
 * @returns {Promise<Object>} Perubahan Ekuitas data
 */
export const generatePerubahanEkuitas = async (tahun) => {
  try {
    const year = Number(tahun);
    const response = await axiosInstance.get(
      "/laporan-keuangan/jurnal/perubahan-aset-neto",
      {
        params: {
          tahun: year,
          tanggalAwal: `${year}-01-01`,
          tanggalAkhir: `${year}-12-31`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error generating perubahan ekuitas:", error);
    throw error;
  }
};

/**
 * Generate Arus Kas
 * @param {string} tanggalAwal - Start date (ISO string or date string)
 * @param {string} tanggalAkhir - End date (ISO string or date string)
 * @returns {Promise<Object>} Arus Kas data
 */
export const generateArusKas = async (tanggalAwal, tanggalAkhir) => {
  try {
    // Convert to date strings if needed
    const startStr = tanggalAwal.includes("T")
      ? tanggalAwal.split("T")[0]
      : tanggalAwal;
    const endStr = tanggalAkhir.includes("T")
      ? tanggalAkhir.split("T")[0]
      : tanggalAkhir;

    const response = await axiosInstance.get(
      "/laporan-keuangan/jurnal/arus-kas",
      {
        params: {
          tanggalAwal: startStr,
          tanggalAkhir: endStr,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error generating arus kas:", error);
    throw error;
  }
};

/**
 * Generate Neraca (Laporan Posisi Keuangan) - Public version
 * @param {string} masjidId - Masjid ID
 * @param {string} tanggal - Date (ISO string or date string)
 * @returns {Promise<Object>} Neraca data
 */
export const generateNeracaPublic = async (masjidId, tanggal) => {
  try {
    // Convert tanggal to date string if needed
    const dateStr = tanggal.includes("T") ? tanggal.split("T")[0] : tanggal;

    const response = await axiosInstance.get(
      "/laporan-keuangan/public/jurnal/posisi-keuangan",
      {
        params: { masjidId, tanggal: dateStr },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error generating neraca:", error);
    throw error;
  }
};

/**
 * Generate Laba Rugi (Laporan Penghasilan Komprehensif) - Public version
 * @param {string} masjidId - Masjid ID
 * @param {string} tanggalAwal - Start date (ISO string or date string)
 * @param {string} tanggalAkhir - End date (ISO string or date string)
 * @returns {Promise<Object>} Laba Rugi data
 */
export const generateLabaRugiPublic = async (masjidId, tanggalAwal, tanggalAkhir) => {
  try {
    // Convert to date strings if needed
    const startStr = tanggalAwal.includes("T")
      ? tanggalAwal.split("T")[0]
      : tanggalAwal;
    const endStr = tanggalAkhir.includes("T")
      ? tanggalAkhir.split("T")[0]
      : tanggalAkhir;

    const response = await axiosInstance.get(
      "/laporan-keuangan/public/jurnal/penghasilan-komprehensif",
      {
        params: {
          masjidId,
          tanggalAwal: startStr,
          tanggalAkhir: endStr,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error generating laba rugi:", error);
    throw error;
  }
};

/**
 * Generate Perubahan Ekuitas (Laporan Perubahan Aset Neto) - Public version (tahunan)
 * @param {string} masjidId - Masjid ID
 * @param {string|number} tahun - Tahun laporan (YYYY)
 * @returns {Promise<Object>} Perubahan Ekuitas data
 */
export const generatePerubahanEkuitasPublic = async (masjidId, tahun) => {
  try {
    const year = Number(tahun);
    const response = await axiosInstance.get(
      "/laporan-keuangan/public/jurnal/perubahan-aset-neto",
      {
        params: {
          masjidId,
          tahun: year,
          tanggalAwal: `${year}-01-01`,
          tanggalAkhir: `${year}-12-31`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error generating perubahan ekuitas:", error);
    throw error;
  }
};

