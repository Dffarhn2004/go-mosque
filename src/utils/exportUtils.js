import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import formatCurrency from "./formatCurrency";
import { formatJurnalTanggalLabel } from "./saldoAwal";

const GOQU_LOGO_URL = "/Logo_With_Text.png";
const GOQU_BRAND_GREEN = [5, 150, 105];
const GOQU_BRAND_DARK = [6, 78, 59];

let cachedGoquLogoDataUrl = null;

const loadGoquLogoDataUrl = async () => {
  if (cachedGoquLogoDataUrl) return cachedGoquLogoDataUrl;
  try {
    const response = await fetch(GOQU_LOGO_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    cachedGoquLogoDataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return cachedGoquLogoDataUrl;
  } catch (error) {
    console.warn("Gagal memuat logo Goqu untuk PDF:", error);
    return null;
  }
};

const formatPeriodeText = (periode = {}) => {
  if (periode.tanggal) {
    const tanggalStr = new Date(periode.tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `Per ${tanggalStr}`;
  }
  if (periode.tanggalAwal && periode.tanggalAkhir) {
    const awalStr = new Date(periode.tanggalAwal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const akhirStr = new Date(periode.tanggalAkhir).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `Periode: ${awalStr} - ${akhirStr}`;
  }
  if (periode.tahun) {
    return `Tahun: ${periode.tahun}`;
  }
  return "";
};

/**
 * Header PDF berbranding Goqu (logo + identitas + judul laporan)
 * @returns {number} posisi Y setelah header
 */
const drawGoquReportHeader = (doc, { title, masjidName, periodeText, logoDataUrl, margin }) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const headerHeight = 34;

  doc.setFillColor(236, 253, 245);
  doc.rect(0, 0, pageWidth, headerHeight, "F");

  doc.setFillColor(...GOQU_BRAND_GREEN);
  doc.rect(0, 0, pageWidth, 2.2, "F");

  const logoW = 30;
  const logoH = 20;
  const logoX = margin;
  const logoY = 7;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", logoX, logoY, logoW, logoH);
    } catch (error) {
      console.warn("Gagal menambahkan logo ke PDF:", error);
      drawGoquWordmark(doc, logoX, logoY + 8);
    }
  } else {
    drawGoquWordmark(doc, logoX, logoY + 8);
  }

  const textCenterX = pageWidth / 2 + 6;
  doc.setTextColor(...GOQU_BRAND_DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(title, textCenterX, 13, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(masjidName || "Masjid", textCenterX, 20, { align: "center" });

  doc.setDrawColor(...GOQU_BRAND_GREEN);
  doc.setLineWidth(0.7);
  doc.line(margin, headerHeight - 1.2, pageWidth - margin, headerHeight - 1.2);

  let startY = headerHeight + 6;
  if (periodeText) {
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, startY - 4, pageWidth - margin * 2, 7, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(periodeText, pageWidth / 2, startY, { align: "center" });
    startY += 10;
  } else {
    startY += 3;
  }

  doc.setTextColor(0, 0, 0);
  return startY;
};

const drawGoquWordmark = (doc, x, y) => {
  doc.setTextColor(...GOQU_BRAND_GREEN);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Goqu", x, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Go Mosque", x, y + 4);
};

const drawGoquReportFooter = (doc, { margin, pageHeight, pageWidth }) => {
  const pageCount = doc.internal.getNumberOfPages();
  const tanggalGenerate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GOQU_BRAND_GREEN);
    doc.text("Goqu", margin, pageHeight - 10);

    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });

    doc.setFontSize(7.5);
    doc.text(`Dibuat pada: ${tanggalGenerate}`, pageWidth - margin, pageHeight - 10, {
      align: "right",
    });
  }
};

/**
 * Export laporan ke PDF
 * @param {Object} laporanData - Data laporan
 * @param {string} laporanType - Tipe laporan: 'neraca', 'laba-rugi', 'perubahan-ekuitas'
 * @param {string} masjidName - Nama masjid
 * @param {Object} periode - Object dengan tanggal atau tanggalAwal/tanggalAkhir
 */
export const exportToPDF = async (laporanData, laporanType, masjidName = "Masjid", periode = {}) => {
  try {
    if (autoTable && typeof autoTable.applyPlugin === "function") {
      autoTable.applyPlugin(jsPDF);
    }

    const doc = new jsPDF("portrait", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const title = getLaporanTitle(laporanType);
    const periodeText = formatPeriodeText(periode);
    const logoDataUrl = await loadGoquLogoDataUrl();

    let startY = drawGoquReportHeader(doc, {
      title,
      masjidName,
      periodeText,
      logoDataUrl,
      margin,
    });

    switch (laporanType) {
      case "neraca":
        startY = generateNeracaPDF(doc, laporanData, startY, pageWidth, margin, pageHeight);
        break;
      case "laba-rugi":
        startY = generateLabaRugiPDF(doc, laporanData, startY, pageWidth, margin, pageHeight);
        break;
      case "perubahan-ekuitas":
        startY = generatePerubahanEkuitasPDF(doc, laporanData, startY, pageWidth, margin, pageHeight);
        break;
      case "buku-besar":
        startY = generateBukuBesarPDF(doc, laporanData, startY, pageWidth, margin, pageHeight, periode);
        break;
      default:
        doc.text("Laporan tidak tersedia", margin, startY);
    }

    drawGoquReportFooter(doc, { margin, pageHeight, pageWidth });

    const fileName = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("❌ [exportToPDF] ERROR GENERATING PDF:", error);
    throw new Error("Gagal membuat PDF: " + (error.message || "Unknown error"));
  }
};

/**
 * Export laporan ke Excel
 * @param {Object} laporanData - Data laporan
 * @param {string} laporanType - Tipe laporan: 'neraca', 'laba-rugi', 'perubahan-ekuitas', 'buku-besar'
 * @param {string} masjidName - Nama masjid
 * @param {Object} periode - Object dengan tanggal atau tanggalAwal/tanggalAkhir
 */
export const exportToExcel = (laporanData, laporanType, masjidName = "Masjid", periode = {}) => {
  try {
    const wb = XLSX.utils.book_new();

    // Generate worksheet berdasarkan tipe laporan
    let ws;
    switch (laporanType) {
      case "neraca":
        ws = generateNeracaExcel(laporanData, masjidName, periode);
        break;
      case "laba-rugi":
        ws = generateLabaRugiExcel(laporanData, masjidName, periode);
        break;
      case "perubahan-ekuitas":
        ws = generatePerubahanEkuitasExcel(laporanData, masjidName, periode);
        break;
      case "buku-besar":
        ws = generateBukuBesarExcel(laporanData, masjidName, periode);
        break;
      default:
        ws = XLSX.utils.aoa_to_sheet([["Laporan tidak tersedia"]]);
    }

    XLSX.utils.book_append_sheet(wb, ws, "Laporan");

    // Save Excel
    const fileName = `${getLaporanTitle(laporanType).replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error("Error generating Excel:", error);
    throw new Error("Gagal membuat Excel: " + error.message);
  }
};

/**
 * Export buku besar ke PDF
 * @param {Array} entries - Array of jurnal entries
 * @param {string} masjidName - Nama masjid
 * @param {Object} periode - Object dengan tanggalAwal dan tanggalAkhir
 * @param {number} totalDebit - Total debit
 * @param {number} totalKredit - Total kredit
 */
export const exportBukuBesarToPDF = async (entries, masjidName = "Masjid", periode = {}, totalDebit = 0, totalKredit = 0) => {
  try {
    if (autoTable && typeof autoTable.applyPlugin === "function") {
      autoTable.applyPlugin(jsPDF);
    }

    const doc = new jsPDF("landscape", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const periodeText = formatPeriodeText(periode);
    const logoDataUrl = await loadGoquLogoDataUrl();

    let startY = drawGoquReportHeader(doc, {
      title: "Buku Besar",
      masjidName,
      periodeText,
      logoDataUrl,
      margin,
    });

    const tableData = (entries || []).map((entry) => {
      const tanggal = formatJurnalTanggalLabel(entry.transactionTanggal);
      const akun = entry.akun
        ? `${entry.akun.kodeAkun || ""} - ${entry.akun.namaAkun || ""}`.trim()
        : "-";
      const tipe = entry.tipe || "-";
      const debit = entry.tipe === "DEBIT" ? formatCurrency(parseFloat(entry.jumlah) || 0) : "-";
      const kredit = entry.tipe === "KREDIT" ? formatCurrency(parseFloat(entry.jumlah) || 0) : "-";
      const keterangan = entry.keterangan || entry.transactionKeterangan || "-";

      return [tanggal, akun, tipe, debit, kredit, keterangan];
    });

    tableData.push([
      "",
      "TOTAL",
      "",
      formatCurrency(totalDebit),
      formatCurrency(totalKredit),
      "",
    ]);

    const autoTableFn = getAutoTableFunction(doc);
    autoTableFn(doc, {
      startY,
      head: [["Tanggal", "Akun", "Tipe", "Debit", "Kredit", "Keterangan"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      styles: {
        fontSize: 8,
        cellPadding: 1.5,
      },
      columnStyles: {
        0: { cellWidth: 30, halign: "left" },
        1: { cellWidth: 50, halign: "left" },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 35, halign: "right" },
        4: { cellWidth: 35, halign: "right" },
        5: { cellWidth: 60, halign: "left" },
      },
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [240, 240, 240];
        }
        if (data.column.index === 3 || data.column.index === 4) {
          data.cell.styles.halign = "right";
        }
      },
    });

    drawGoquReportFooter(doc, { margin, pageHeight, pageWidth });

    const fileName = `Buku_Besar_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("❌ [exportBukuBesarToPDF] Error:", error);
    throw new Error("Gagal membuat PDF: " + error.message);
  }
};

/**
 * Export buku besar ke Excel
 * @param {Array} entries - Array of jurnal entries
 * @param {string} masjidName - Nama masjid
 * @param {Object} periode - Object dengan tanggalAwal dan tanggalAkhir
 * @param {number} totalDebit - Total debit
 * @param {number} totalKredit - Total kredit
 */
export const exportBukuBesarToExcel = (entries, masjidName = "Masjid", periode = {}, totalDebit = 0, totalKredit = 0) => {
  try {
    const rows = [];

    // Header
    rows.push(["Buku Besar"]);
    rows.push([masjidName]);
    if (periode.tanggalAwal && periode.tanggalAkhir) {
      const awalStr = new Date(periode.tanggalAwal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const akhirStr = new Date(periode.tanggalAkhir).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      rows.push([`Periode: ${awalStr} - ${akhirStr}`]);
    }
    rows.push([]);

    // Table header
    rows.push(["Tanggal", "Akun", "Tipe", "Debit", "Kredit", "Keterangan"]);

    // Data rows
    (entries || []).forEach((entry) => {
      const tanggal = formatJurnalTanggalLabel(entry.transactionTanggal);
      const akun = entry.akun 
        ? `${entry.akun.kodeAkun || ""} - ${entry.akun.namaAkun || ""}`.trim()
        : "-";
      const tipe = entry.tipe || "-";
      const debit = entry.tipe === "DEBIT" ? (parseFloat(entry.jumlah) || 0) : 0;
      const kredit = entry.tipe === "KREDIT" ? (parseFloat(entry.jumlah) || 0) : 0;
      const keterangan = entry.keterangan || entry.transactionKeterangan || "-";
      
      rows.push([tanggal, akun, tipe, debit, kredit, keterangan]);
    });

    // Summary row
    rows.push(["", "TOTAL", "", totalDebit, totalKredit, ""]);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Tanggal
      { wch: 40 }, // Akun
      { wch: 12 }, // Tipe
      { wch: 18 }, // Debit
      { wch: 18 }, // Kredit
      { wch: 50 }, // Keterangan
    ];

    // Format header row
    const headerRow = 5;
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach((col) => {
      const cell = ws[col + headerRow];
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "10B981" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
    });

    // Format angka sebagai number
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = headerRow + 1; R <= range.e.r; R++) {
      // Format kolom Debit (D) dan Kredit (E)
      ['D', 'E'].forEach((col) => {
        const cellAddress = col + R;
        if (!ws[cellAddress]) return;
        const cell = ws[cellAddress];
        if (typeof cell.v === 'number' && cell.v !== 0) {
          cell.z = '#,##0';
          cell.s = {
            ...cell.s,
            numFmt: '#,##0',
            alignment: { horizontal: "right" }
          };
        }
      });
    }

    // Format total row
    const totalRow = range.e.r;
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach((col) => {
      const cell = ws[col + totalRow];
      if (cell) {
        cell.s = {
          ...cell.s,
          font: { bold: true },
          fill: { fgColor: { rgb: "F0F0F0" } }
        };
      }
    });

    return ws;
  } catch (error) {
    console.error("Error generating buku besar Excel:", error);
    throw new Error("Gagal membuat Excel: " + error.message);
  }
};

// Helper functions
const getLaporanTitle = (laporanType) => {
  const titles = {
    neraca: "Laporan Posisi Keuangan",
    "laba-rugi": "Laporan Penghasilan Komprehensif",
    "perubahan-ekuitas": "Laporan Perubahan Aset Neto",
    "buku-besar": "Buku Besar",
  };
  return titles[laporanType] || "Laporan Keuangan";
};

// Helper function untuk mendapatkan autoTable function
const getAutoTableFunction = (doc) => {
  // Prioritas 1: doc.autoTable (setelah plugin di-apply)
  if (typeof doc.autoTable === 'function') {
    return (doc, options) => doc.autoTable(options);
  }
  // Prioritas 2: autoTable sebagai fungsi langsung
  if (typeof autoTable === 'function') {
    return autoTable;
  }
  // Prioritas 3: default export
  if (autoTable && typeof autoTable.default === 'function') {
    return autoTable.default;
  }
  // Prioritas 4: named export
  if (autoTable && typeof autoTable.autoTable === 'function') {
    return autoTable.autoTable;
  }
  throw new Error("autoTable is not available. Please check jspdf-autotable installation.");
};

const formatAkunLabel = (acc) => {
  const kode = acc?.kodeAkun || "";
  const nama = acc?.namaAkun || acc?.nama || "";
  return kode ? `${kode} - ${nama}` : nama;
};

/** Filter ekuitas sama seperti LaporanNeraca (hindari duplikasi kategori backend) */
const groupEkuitasByRestriction = (ekuitas = {}) => {
  const tanpaPembatasan = [];
  const denganPembatasan = [];
  const kodeTanpaPembatasan = ["311101", "312101"];
  const kodeDenganPembatasan = ["321101", "322101"];

  const kategoriTanpa = ekuitas["Tanpa Pembatasan dari Pemberi Sumber Daya"] || [];
  if (Array.isArray(kategoriTanpa)) {
    kategoriTanpa.forEach((akun) => {
      if (kodeTanpaPembatasan.includes(akun.kodeAkun)) {
        tanpaPembatasan.push(akun);
      }
    });
  }

  const kategoriDengan = ekuitas["Dengan Pembatasan dari Pemberi Sumber Daya"] || [];
  if (Array.isArray(kategoriDengan)) {
    kategoriDengan.forEach((akun) => {
      if (kodeDenganPembatasan.includes(akun.kodeAkun)) {
        denganPembatasan.push(akun);
      }
    });
  }

  return { tanpaPembatasan, denganPembatasan };
};

const getTableFinalY = (doc, startY, rowCount, rowHeight = 6) => {
  try {
    if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
      return doc.lastAutoTable.finalY + 10;
    }
  } catch (e) {
    // ignore
  }
  return startY + rowCount * rowHeight + 10;
};

const isHighlightRowLabel = (text) => {
  if (!text) return false;
  return (
    text === "ASET" ||
    text === "KEWAJIBAN" ||
    text === "ASET NETO" ||
    text === "PENDAPATAN" ||
    text === "BEBAN" ||
    text === "SURPLUS (DEFISIT)" ||
    text === "Saldo Akhir" ||
    text.startsWith("TOTAL ") ||
    text.startsWith("Total ")
  );
};

const appendKategoriRows = (tableData, groups, subtotals, emptyLabel) => {
  if (!groups || typeof groups !== "object" || Object.keys(groups).length === 0) {
    tableData.push([emptyLabel, ""]);
    return;
  }

  Object.keys(groups).forEach((kategori) => {
    tableData.push([kategori, ""]);
    const accounts = Array.isArray(groups[kategori]) ? groups[kategori] : [];
    accounts.forEach((acc) => {
      tableData.push([formatAkunLabel(acc), formatCurrency(acc.saldo || 0)]);
    });
    if (subtotals && subtotals[kategori]) {
      tableData.push([
        `Total ${kategori}`,
        formatCurrency(subtotals[kategori].saldo || 0),
      ]);
    }
  });
};

const applyTwoColumnHighlight = (hookData) => {
  const cellText = hookData.cell.text[0] || "";
  if (hookData.column.index === 0 && isHighlightRowLabel(cellText)) {
    hookData.cell.styles.fontStyle = "bold";
    hookData.cell.styles.fillColor = [240, 240, 240];
  }
  if (hookData.column.index === 1) {
    hookData.cell.styles.halign = "right";
    if (isHighlightRowLabel(hookData.row.raw?.[0] || "")) {
      hookData.cell.styles.fontStyle = "bold";
      hookData.cell.styles.fillColor = [240, 240, 240];
    }
  }
};

const twoColumnTableOptions = (startY, margin, tableData, contentWidth) => ({
  startY,
  head: [["Uraian", "Saldo"]],
  body: tableData,
  theme: "striped",
  headStyles: {
    fillColor: [16, 185, 129],
    textColor: 255,
    fontStyle: "bold",
    fontSize: 10,
    halign: "center",
  },
  styles: {
    fontSize: 9,
    cellPadding: 2,
  },
  columnStyles: {
    0: { cellWidth: contentWidth * 0.68, halign: "left" },
    1: { cellWidth: contentWidth * 0.32, halign: "right" },
  },
  margin: { left: margin, right: margin },
  didParseCell: applyTwoColumnHighlight,
});

// PDF Generators — layout mengikuti komponen UI laporan
const generateNeracaPDF = (doc, data, startY, pageWidth, margin) => {
  if (!data) {
    doc.text("Tidak ada data", margin, startY);
    return startY + 10;
  }

  const tableData = [];
  const totalAset = data.totalAset || 0;
  const totalKewajiban = data.totalKewajiban || 0;
  const totalEkuitas = data.totalEkuitas || 0;
  const { tanpaPembatasan, denganPembatasan } = groupEkuitasByRestriction(data.ekuitas || {});
  const totalTanpaPembatasan = tanpaPembatasan.reduce((sum, akun) => sum + (akun.saldo || 0), 0);
  const totalDenganPembatasan = denganPembatasan.reduce((sum, akun) => sum + (akun.saldo || 0), 0);

  tableData.push(["ASET", ""]);
  appendKategoriRows(tableData, data.aset, data.subtotalAset, "Tidak ada aset");
  tableData.push(["TOTAL ASET", formatCurrency(totalAset)]);

  tableData.push(["KEWAJIBAN", ""]);
  appendKategoriRows(tableData, data.kewajiban, data.subtotalKewajiban, "Tidak ada kewajiban");
  tableData.push(["TOTAL KEWAJIBAN", formatCurrency(totalKewajiban)]);

  tableData.push(["ASET NETO", ""]);

  tableData.push(["Tanpa Pembatasan dari Pemberi Sumber Daya", ""]);
  if (tanpaPembatasan.length > 0) {
    tanpaPembatasan.forEach((akun) => {
      tableData.push([formatAkunLabel(akun), formatCurrency(akun.saldo || 0)]);
    });
    tableData.push([
      "Total Tanpa Pembatasan dari Pemberi Sumber Daya",
      formatCurrency(totalTanpaPembatasan),
    ]);
  } else {
    tableData.push(["Tidak ada akun", ""]);
  }

  tableData.push(["Dengan Pembatasan dari Pemberi Sumber Daya", ""]);
  if (denganPembatasan.length > 0) {
    denganPembatasan.forEach((akun) => {
      tableData.push([formatAkunLabel(akun), formatCurrency(akun.saldo || 0)]);
    });
    tableData.push([
      "Total Dengan Pembatasan dari Pemberi Sumber Daya",
      formatCurrency(totalDenganPembatasan),
    ]);
  } else {
    tableData.push(["Tidak ada akun", ""]);
  }

  tableData.push(["TOTAL ASET NETO", formatCurrency(totalEkuitas)]);
  tableData.push([
    "TOTAL LIABILITAS DAN ASET NETO",
    formatCurrency(totalKewajiban + totalEkuitas),
  ]);

  const contentWidth = pageWidth - margin * 2;
  const autoTableFn = getAutoTableFunction(doc);
  autoTableFn(doc, twoColumnTableOptions(startY, margin, tableData, contentWidth));
  return getTableFinalY(doc, startY, tableData.length);
};

const generateLabaRugiPDF = (doc, data, startY, pageWidth, margin) => {
  if (!data) {
    doc.text("Tidak ada data", margin, startY);
    return startY + 10;
  }

  const tableData = [];
  const totalPendapatan = data.totalPendapatan || 0;
  const totalBeban = data.totalBeban || 0;
  const labaRugi = data.labaRugi ?? totalPendapatan - totalBeban;

  tableData.push(["PENDAPATAN", ""]);
  appendKategoriRows(tableData, data.pendapatan, data.subtotalPendapatan, "Tidak ada pendapatan");
  tableData.push(["TOTAL PENDAPATAN", formatCurrency(totalPendapatan)]);

  tableData.push(["BEBAN", ""]);
  appendKategoriRows(tableData, data.beban, data.subtotalBeban, "Tidak ada beban");
  tableData.push(["TOTAL BEBAN", formatCurrency(totalBeban)]);
  tableData.push(["SURPLUS (DEFISIT)", formatCurrency(labaRugi)]);

  const contentWidth = pageWidth - margin * 2;
  const autoTableFn = getAutoTableFunction(doc);
  autoTableFn(doc, twoColumnTableOptions(startY, margin, tableData, contentWidth));
  return getTableFinalY(doc, startY, tableData.length);
};

const generatePerubahanEkuitasPDF = (doc, data, startY, pageWidth, margin) => {
  if (!data) {
    doc.text("Tidak ada data", margin, startY);
    return startY + 10;
  }

  const tableData = [
    [
      "Saldo Awal",
      formatCurrency(data.saldoAwalEkuitasTanpa || 0),
      formatCurrency(data.saldoAwalEkuitasDengan || 0),
      formatCurrency(data.saldoAwalEkuitas || 0),
    ],
    [
      "Penghasilan Komprehensif",
      formatCurrency(data.labaRugiTanpa || 0),
      formatCurrency(data.labaRugiDengan || 0),
      formatCurrency(data.labaRugi || 0),
    ],
  ];

  const hasPerubahanModal =
    (data.perubahanModalTanpa || 0) !== 0 ||
    (data.perubahanModalDengan || 0) !== 0 ||
    (data.perubahanModal || 0) !== 0;

  if (hasPerubahanModal) {
    tableData.push([
      "Perubahan Modal",
      formatCurrency(data.perubahanModalTanpa || 0),
      formatCurrency(data.perubahanModalDengan || 0),
      formatCurrency(data.perubahanModal || 0),
    ]);
  }

  tableData.push([
    "Saldo Akhir",
    formatCurrency(data.saldoAkhirEkuitasTanpa || 0),
    formatCurrency(data.saldoAkhirEkuitasDengan || 0),
    formatCurrency(data.saldoAkhirEkuitas || 0),
  ]);

  const contentWidth = pageWidth - margin * 2;
  const autoTableFn = getAutoTableFunction(doc);
  autoTableFn(doc, {
    startY,
    head: [[
      "Uraian",
      "Tanpa Pembatasan dari Pemberi Sumber Daya",
      "Dengan Pembatasan dari Pemberi Sumber Daya",
      "Jumlah",
    ]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      valign: "middle",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.28, halign: "left", fontStyle: "bold" },
      1: { cellWidth: contentWidth * 0.24, halign: "right" },
      2: { cellWidth: contentWidth * 0.24, halign: "right" },
      3: { cellWidth: contentWidth * 0.24, halign: "right", fontStyle: "bold" },
    },
    margin: { left: margin, right: margin },
    didParseCell: (hookData) => {
      const label = hookData.row.raw?.[0] || "";
      if (label === "Saldo Akhir") {
        hookData.cell.styles.fontStyle = "bold";
        hookData.cell.styles.fillColor = [240, 240, 240];
      }
      if (hookData.column.index > 0) {
        hookData.cell.styles.halign = "right";
      }
    },
  });

  let finalY = getTableFinalY(doc, startY, tableData.length);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const keterangan =
    "Keterangan: Saldo akhir ekuitas dihitung dari saldo awal ditambah penghasilan komprehensif dalam periode. Perubahan modal menunjukkan selisih antara perubahan total ekuitas dengan laba rugi.";
  const wrapped = doc.splitTextToSize(keterangan, contentWidth);
  doc.text(wrapped, margin, finalY);
  return finalY + wrapped.length * 4 + 4;
};

const generateBukuBesarPDF = (doc, data, startY, pageWidth, margin, pageHeight, periode) => {
  if (!data || !Array.isArray(data.entries)) {
    doc.text("Tidak ada data", margin, startY);
    return startY + 10;
  }

  const entries = data.entries || [];
  const totalDebit = data.totalDebit || 0;
  const totalKredit = data.totalKredit || 0;

  const tableData = entries.map((entry) => {
    const tanggal = formatJurnalTanggalLabel(entry.transactionTanggal);
    const akun = entry.akun 
      ? `${entry.akun.kodeAkun || ""} - ${entry.akun.namaAkun || ""}`.trim()
      : "-";
    const tipe = entry.tipe || "-";
    const debit = entry.tipe === "DEBIT" ? formatCurrency(parseFloat(entry.jumlah) || 0) : "-";
    const kredit = entry.tipe === "KREDIT" ? formatCurrency(parseFloat(entry.jumlah) || 0) : "-";
    const keterangan = entry.keterangan || entry.transactionKeterangan || "-";
    
    return [tanggal, akun, tipe, debit, kredit, keterangan];
  });

  // Add summary row
  tableData.push([
    "",
    "TOTAL",
    "",
    formatCurrency(totalDebit),
    formatCurrency(totalKredit),
    ""
  ]);

  const autoTableFn = getAutoTableFunction(doc);
  autoTableFn(doc, {
    startY: startY,
    head: [["Tanggal", "Akun", "Tipe", "Debit", "Kredit", "Keterangan"]],
    body: tableData,
    theme: "striped",
    headStyles: { 
      fillColor: [16, 185, 129], 
      textColor: 255, 
      fontStyle: "bold",
      fontSize: 9,
      halign: "center"
    },
    styles: { 
      fontSize: 8,
      cellPadding: 1.5
    },
    columnStyles: {
      0: { cellWidth: 30, halign: "left" },
      1: { cellWidth: 50, halign: "left" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 35, halign: "right" },
      4: { cellWidth: 35, halign: "right" },
      5: { cellWidth: 60, halign: "left" },
    },
    margin: { left: margin, right: margin },
    didParseCell: (data) => {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [240, 240, 240];
      }
      if (data.column.index === 3 || data.column.index === 4) {
        data.cell.styles.halign = "right";
      }
    },
  });

  let finalY = startY;
  try {
    if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
      finalY = doc.lastAutoTable.finalY + 10;
    } else {
      finalY = startY + (tableData.length * 5) + 10;
    }
  } catch (e) {
    finalY = startY + (tableData.length * 5) + 10;
  }
  return finalY;
};

// Excel Generators — layout mengikuti komponen UI laporan
const appendKategoriExcelRows = (rows, groups, subtotals, emptyLabel) => {
  if (!groups || typeof groups !== "object" || Object.keys(groups).length === 0) {
    rows.push([emptyLabel, ""]);
    return;
  }

  Object.keys(groups).forEach((kategori) => {
    rows.push([kategori, ""]);
    const accounts = Array.isArray(groups[kategori]) ? groups[kategori] : [];
    accounts.forEach((acc) => {
      rows.push([formatAkunLabel(acc), acc.saldo || 0]);
    });
    if (subtotals && subtotals[kategori]) {
      rows.push([`Total ${kategori}`, subtotals[kategori].saldo || 0]);
    }
  });
};

const applyExcelNumberFormat = (ws, headerRow, valueCols) => {
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let R = headerRow; R <= range.e.r; R++) {
    for (const C of valueCols) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      const cell = ws[cellAddress];
      if (typeof cell.v === "number") {
        cell.z = "#,##0";
        cell.s = {
          ...cell.s,
          numFmt: "#,##0",
          alignment: { horizontal: "right" },
        };
      }
    }
  }
};

const styleExcelHeaderRow = (ws, headerRow, cols) => {
  cols.forEach((col) => {
    const cell = ws[col + headerRow];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "10B981" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  });
};

const generateNeracaExcel = (data, masjidName, periode) => {
  const rows = [];
  const totalAset = data.totalAset || 0;
  const totalKewajiban = data.totalKewajiban || 0;
  const totalEkuitas = data.totalEkuitas || 0;
  const { tanpaPembatasan, denganPembatasan } = groupEkuitasByRestriction(data.ekuitas || {});
  const totalTanpaPembatasan = tanpaPembatasan.reduce((sum, akun) => sum + (akun.saldo || 0), 0);
  const totalDenganPembatasan = denganPembatasan.reduce((sum, akun) => sum + (akun.saldo || 0), 0);

  rows.push(["Laporan Posisi Keuangan"]);
  rows.push([masjidName]);
  if (periode.tanggal) {
    const tanggalStr = new Date(periode.tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    rows.push([`Per ${tanggalStr}`]);
  } else if (periode.tanggalAwal && periode.tanggalAkhir) {
    const awalStr = new Date(periode.tanggalAwal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const akhirStr = new Date(periode.tanggalAkhir).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    rows.push([`Periode: ${awalStr} - ${akhirStr}`]);
  }
  rows.push([]);
  rows.push(["Uraian", "Saldo"]);

  rows.push(["ASET", ""]);
  appendKategoriExcelRows(rows, data.aset, data.subtotalAset, "Tidak ada aset");
  rows.push(["TOTAL ASET", totalAset]);
  rows.push([]);

  rows.push(["KEWAJIBAN", ""]);
  appendKategoriExcelRows(rows, data.kewajiban, data.subtotalKewajiban, "Tidak ada kewajiban");
  rows.push(["TOTAL KEWAJIBAN", totalKewajiban]);
  rows.push([]);

  rows.push(["ASET NETO", ""]);
  rows.push(["Tanpa Pembatasan dari Pemberi Sumber Daya", ""]);
  if (tanpaPembatasan.length > 0) {
    tanpaPembatasan.forEach((akun) => {
      rows.push([formatAkunLabel(akun), akun.saldo || 0]);
    });
    rows.push(["Total Tanpa Pembatasan dari Pemberi Sumber Daya", totalTanpaPembatasan]);
  } else {
    rows.push(["Tidak ada akun", ""]);
  }

  rows.push(["Dengan Pembatasan dari Pemberi Sumber Daya", ""]);
  if (denganPembatasan.length > 0) {
    denganPembatasan.forEach((akun) => {
      rows.push([formatAkunLabel(akun), akun.saldo || 0]);
    });
    rows.push(["Total Dengan Pembatasan dari Pemberi Sumber Daya", totalDenganPembatasan]);
  } else {
    rows.push(["Tidak ada akun", ""]);
  }

  rows.push(["TOTAL ASET NETO", totalEkuitas]);
  rows.push(["TOTAL LIABILITAS DAN ASET NETO", totalKewajiban + totalEkuitas]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 55 }, { wch: 22 }];
  const headerRow = 5;
  styleExcelHeaderRow(ws, headerRow, ["A", "B"]);
  applyExcelNumberFormat(ws, headerRow, [1]);
  return ws;
};

const generateLabaRugiExcel = (data, masjidName, periode) => {
  const rows = [];
  const totalPendapatan = data.totalPendapatan || 0;
  const totalBeban = data.totalBeban || 0;
  const labaRugi = data.labaRugi ?? totalPendapatan - totalBeban;

  rows.push(["Laporan Penghasilan Komprehensif"]);
  rows.push([masjidName]);
  if (periode.tanggalAwal && periode.tanggalAkhir) {
    const awalStr = new Date(periode.tanggalAwal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const akhirStr = new Date(periode.tanggalAkhir).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    rows.push([`Periode: ${awalStr} - ${akhirStr}`]);
  }
  rows.push([]);
  rows.push(["Uraian", "Saldo"]);

  rows.push(["PENDAPATAN", ""]);
  appendKategoriExcelRows(rows, data.pendapatan, data.subtotalPendapatan, "Tidak ada pendapatan");
  rows.push(["TOTAL PENDAPATAN", totalPendapatan]);
  rows.push([]);

  rows.push(["BEBAN", ""]);
  appendKategoriExcelRows(rows, data.beban, data.subtotalBeban, "Tidak ada beban");
  rows.push(["TOTAL BEBAN", totalBeban]);
  rows.push([]);
  rows.push(["SURPLUS (DEFISIT)", labaRugi]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 55 }, { wch: 22 }];
  const headerRow = 5;
  styleExcelHeaderRow(ws, headerRow, ["A", "B"]);
  applyExcelNumberFormat(ws, headerRow, [1]);
  return ws;
};

const generatePerubahanEkuitasExcel = (data, masjidName, periode) => {
  const rows = [];

  rows.push(["Laporan Perubahan Aset Neto"]);
  rows.push([masjidName]);
  if (periode.tanggalAwal && periode.tanggalAkhir) {
    const awalStr = new Date(periode.tanggalAwal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const akhirStr = new Date(periode.tanggalAkhir).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    rows.push([`Periode: ${awalStr} - ${akhirStr}`]);
  } else if (periode.tahun) {
    rows.push([`Tahun: ${periode.tahun}`]);
  }
  rows.push([]);

  rows.push([
    "Uraian",
    "Tanpa Pembatasan dari Pemberi Sumber Daya",
    "Dengan Pembatasan dari Pemberi Sumber Daya",
    "Jumlah",
  ]);
  rows.push([
    "Saldo Awal",
    data.saldoAwalEkuitasTanpa || 0,
    data.saldoAwalEkuitasDengan || 0,
    data.saldoAwalEkuitas || 0,
  ]);
  rows.push([
    "Penghasilan Komprehensif",
    data.labaRugiTanpa || 0,
    data.labaRugiDengan || 0,
    data.labaRugi || 0,
  ]);

  const hasPerubahanModal =
    (data.perubahanModalTanpa || 0) !== 0 ||
    (data.perubahanModalDengan || 0) !== 0 ||
    (data.perubahanModal || 0) !== 0;

  if (hasPerubahanModal) {
    rows.push([
      "Perubahan Modal",
      data.perubahanModalTanpa || 0,
      data.perubahanModalDengan || 0,
      data.perubahanModal || 0,
    ]);
  }

  rows.push([
    "Saldo Akhir",
    data.saldoAkhirEkuitasTanpa || 0,
    data.saldoAkhirEkuitasDengan || 0,
    data.saldoAkhirEkuitas || 0,
  ]);
  rows.push([]);
  rows.push([
    "Keterangan: Saldo akhir ekuitas dihitung dari saldo awal ditambah penghasilan komprehensif dalam periode. Perubahan modal menunjukkan selisih antara perubahan total ekuitas dengan laba rugi.",
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 35 }, { wch: 28 }, { wch: 28 }, { wch: 18 }];
  const headerRow = 5;
  styleExcelHeaderRow(ws, headerRow, ["A", "B", "C", "D"]);
  applyExcelNumberFormat(ws, headerRow, [1, 2, 3]);
  return ws;
};

const generateBukuBesarExcel = (data, masjidName, periode) => {
  const entries = data.entries || [];
  const totalDebit = data.totalDebit || 0;
  const totalKredit = data.totalKredit || 0;

  const rows = [];

  // Header
  rows.push(["Buku Besar"]);
  rows.push([masjidName]);
  if (periode.tanggalAwal && periode.tanggalAkhir) {
    const awalStr = new Date(periode.tanggalAwal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const akhirStr = new Date(periode.tanggalAkhir).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    rows.push([`Periode: ${awalStr} - ${akhirStr}`]);
  }
  rows.push([]);

  // Table header
  rows.push(["Tanggal", "Akun", "Tipe", "Debit", "Kredit", "Keterangan"]);

  // Data rows
  entries.forEach((entry) => {
    const tanggal = formatJurnalTanggalLabel(entry.transactionTanggal);
    const akun = entry.akun 
      ? `${entry.akun.kodeAkun || ""} - ${entry.akun.namaAkun || ""}`.trim()
      : "-";
    const tipe = entry.tipe || "-";
    const debit = entry.tipe === "DEBIT" ? (parseFloat(entry.jumlah) || 0) : 0;
    const kredit = entry.tipe === "KREDIT" ? (parseFloat(entry.jumlah) || 0) : 0;
    const keterangan = entry.keterangan || entry.transactionKeterangan || "-";
    
    rows.push([tanggal, akun, tipe, debit, kredit, keterangan]);
  });

  // Summary row
  rows.push(["", "TOTAL", "", totalDebit, totalKredit, ""]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // Tanggal
    { wch: 40 }, // Akun
    { wch: 12 }, // Tipe
    { wch: 18 }, // Debit
    { wch: 18 }, // Kredit
    { wch: 50 }, // Keterangan
  ];

  // Format header row
  const headerRow = 5;
  ['A', 'B', 'C', 'D', 'E', 'F'].forEach((col) => {
    const cell = ws[col + headerRow];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "10B981" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
  });

  // Format angka sebagai number
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = headerRow + 1; R <= range.e.r; R++) {
    ['D', 'E'].forEach((col) => {
      const cellAddress = col + R;
      if (!ws[cellAddress]) return;
      const cell = ws[cellAddress];
      if (typeof cell.v === 'number' && cell.v !== 0) {
        cell.z = '#,##0';
        cell.s = {
          ...cell.s,
          numFmt: '#,##0',
          alignment: { horizontal: "right" }
        };
      }
    });
  }

  // Format total row
  const totalRow = range.e.r;
  ['A', 'B', 'C', 'D', 'E', 'F'].forEach((col) => {
    const cell = ws[col + totalRow];
    if (cell) {
      cell.s = {
        ...cell.s,
        font: { bold: true },
        fill: { fgColor: { rgb: "F0F0F0" } }
      };
    }
  });

  return ws;
};
