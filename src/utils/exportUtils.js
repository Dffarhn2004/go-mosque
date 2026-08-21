import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import formatCurrency from "./formatCurrency";
import { formatJurnalTanggalLabel } from "./saldoAwal";

/**
 * Export laporan ke PDF
 * @param {Object} laporanData - Data laporan
 * @param {string} laporanType - Tipe laporan: 'neraca', 'laba-rugi', 'perubahan-ekuitas'
 * @param {string} masjidName - Nama masjid
 * @param {Object} periode - Object dengan tanggal atau tanggalAwal/tanggalAkhir
 */
export const exportToPDF = (laporanData, laporanType, masjidName = "Masjid", periode = {}) => {
  console.log("📄 [exportToPDF] Starting PDF generation...");
  console.log("📄 [exportToPDF] Parameters received:");
  console.log("   - laporanType:", laporanType);
  console.log("   - masjidName:", masjidName);
  console.log("   - periode:", periode);
  console.log("   - laporanData type:", typeof laporanData);
  console.log("   - laporanData is null?", laporanData === null);
  console.log("   - laporanData is undefined?", laporanData === undefined);
  
  try {
    console.log("📄 [exportToPDF] Step 0: Checking autoTable availability...");
    console.log("   - autoTable type:", typeof autoTable);
    console.log("   - autoTable:", autoTable);
    
    // Untuk jspdf-autotable v5.x, mungkin perlu apply plugin
    if (autoTable && typeof autoTable.applyPlugin === 'function') {
      console.log("📄 [exportToPDF] Applying autoTable plugin...");
      autoTable.applyPlugin(jsPDF);
      console.log("✅ [exportToPDF] Plugin applied");
    }
    
    console.log("📄 [exportToPDF] Step 1: Creating jsPDF instance...");
    const doc = new jsPDF("portrait", "mm", "a4");
    console.log("✅ [exportToPDF] jsPDF instance created");
    console.log("   - doc.autoTable type:", typeof doc.autoTable);
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let startY = 20;
    
    console.log("📄 [exportToPDF] Page dimensions:", { pageWidth, pageHeight, margin });

    console.log("📄 [exportToPDF] Step 2: Creating header...");
    const title = getLaporanTitle(laporanType);
    console.log("   - Title:", title);
    
    // Header dengan background color
    doc.setFillColor(16, 185, 129); // Green color
    doc.rect(0, 0, pageWidth, 30, "F");
    console.log("✅ [exportToPDF] Header background drawn");
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, 15, { align: "center" });
    console.log("✅ [exportToPDF] Title added");

    // Masjid Name
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(masjidName, pageWidth / 2, 22, { align: "center" });
    console.log("✅ [exportToPDF] Masjid name added");

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Periode dengan background putih
    console.log("📄 [exportToPDF] Step 3: Adding periode...");
    startY = 35;
    doc.setFillColor(245, 247, 250);
    doc.rect(margin, startY - 5, pageWidth - (margin * 2), 8, "F");
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    let periodeText = "";
    if (periode.tanggal) {
      const tanggalStr = new Date(periode.tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      periodeText = `Per ${tanggalStr}`;
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
      periodeText = `Periode: ${awalStr} - ${akhirStr}`;
    } else if (periode.tahun) {
      periodeText = `Tahun: ${periode.tahun}`;
    }
    console.log("   - Periode text:", periodeText);
    doc.text(periodeText, pageWidth / 2, startY, { align: "center" });
    console.log("✅ [exportToPDF] Periode added");

    startY = 48;

    // Generate table berdasarkan tipe laporan
    console.log("📄 [exportToPDF] Step 4: Generating table for type:", laporanType);
    console.log("   - laporanData structure:", {
      hasAset: !!laporanData.aset,
      hasKewajiban: !!laporanData.kewajiban,
      hasEkuitas: !!laporanData.ekuitas,
      hasPendapatan: !!laporanData.pendapatan,
      hasBeban: !!laporanData.beban,
      keys: Object.keys(laporanData || {})
    });
    
    switch (laporanType) {
      case "neraca":
        console.log("📄 [exportToPDF] Calling generateNeracaPDF...");
        startY = generateNeracaPDF(doc, laporanData, startY, pageWidth, margin, pageHeight);
        console.log("✅ [exportToPDF] generateNeracaPDF completed, startY:", startY);
        break;
      case "laba-rugi":
        console.log("📄 [exportToPDF] Calling generateLabaRugiPDF...");
        startY = generateLabaRugiPDF(doc, laporanData, startY, pageWidth, margin, pageHeight);
        console.log("✅ [exportToPDF] generateLabaRugiPDF completed, startY:", startY);
        break;
      case "perubahan-ekuitas":
        console.log("📄 [exportToPDF] Calling generatePerubahanEkuitasPDF...");
        startY = generatePerubahanEkuitasPDF(doc, laporanData, startY, pageWidth, margin, pageHeight);
        console.log("✅ [exportToPDF] generatePerubahanEkuitasPDF completed, startY:", startY);
        break;
      case "buku-besar":
        console.log("📄 [exportToPDF] Calling generateBukuBesarPDF...");
        startY = generateBukuBesarPDF(doc, laporanData, startY, pageWidth, margin, pageHeight, periode);
        console.log("✅ [exportToPDF] generateBukuBesarPDF completed, startY:", startY);
        break;
      default:
        console.warn("⚠️ [exportToPDF] Unknown laporanType:", laporanType);
        doc.text("Laporan tidak tersedia", margin, startY);
    }

    // Footer dengan garis
    console.log("📄 [exportToPDF] Step 5: Adding footer...");
    const pageCount = doc.internal.getNumberOfPages();
    console.log("   - Total pages:", pageCount);
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Garis footer
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      // Nomor halaman
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
      
      // Tanggal generate
      const tanggalGenerate = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      doc.setFontSize(8);
      doc.text(
        `Dibuat pada: ${tanggalGenerate}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: "right" }
      );
    }
    console.log("✅ [exportToPDF] Footer added to all pages");

    // Save PDF
    console.log("📄 [exportToPDF] Step 6: Saving PDF file...");
    const fileName = `${getLaporanTitle(laporanType).replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    console.log("   - File name:", fileName);
    doc.save(fileName);
    console.log("✅ [exportToPDF] PDF file saved successfully!");
  } catch (error) {
    console.error("❌ [exportToPDF] ERROR GENERATING PDF:");
    console.error("   - Error name:", error.name);
    console.error("   - Error message:", error.message);
    console.error("   - Error stack:", error.stack);
    console.error("   - Full error object:", error);
    console.error("   - Error type:", typeof error);
    console.error("   - Is Error instance?", error instanceof Error);
    
    // Log additional context
    console.error("   - Context at error:");
    console.error("     * laporanType:", laporanType);
    console.error("     * masjidName:", masjidName);
    console.error("     * periode:", JSON.stringify(periode));
    console.error("     * laporanData exists?", !!laporanData);
    
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
export const exportBukuBesarToPDF = (entries, masjidName = "Masjid", periode = {}, totalDebit = 0, totalKredit = 0) => {
  console.log("📄 [exportBukuBesarToPDF] Starting PDF generation...");
  console.log("   - Entries count:", entries?.length || 0);
  console.log("   - Masjid Name:", masjidName);
  console.log("   - Periode:", periode);
  
  try {
    console.log("📄 [exportBukuBesarToPDF] Step 0: Checking autoTable...");
    if (autoTable && typeof autoTable.applyPlugin === 'function') {
      autoTable.applyPlugin(jsPDF);
      console.log("✅ Plugin applied");
    }
    
    const doc = new jsPDF("landscape", "mm", "a4"); // Landscape untuk tabel yang lebar
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let startY = 20;
    
    console.log("📄 [exportBukuBesarToPDF] Page dimensions (landscape):", { pageWidth, pageHeight, margin });

    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 25, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Buku Besar", pageWidth / 2, 12, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(masjidName, pageWidth / 2, 19, { align: "center" });

    doc.setTextColor(0, 0, 0);

    // Periode
    startY = 30;
    doc.setFillColor(245, 247, 250);
    doc.rect(margin, startY - 3, pageWidth - (margin * 2), 6, "F");
    
    doc.setFontSize(9);
    let periodeText = "";
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
      periodeText = `Periode: ${awalStr} - ${akhirStr}`;
    }
    doc.text(periodeText, pageWidth / 2, startY, { align: "center" });

    startY = 40;

    // Prepare table data
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
        // Bold untuk total row
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [240, 240, 240];
        }
        // Right align untuk kolom angka
        if (data.column.index === 3 || data.column.index === 4) {
          data.cell.styles.halign = "right";
        }
      },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        pageWidth / 2,
        pageHeight - 7,
        { align: "center" }
      );
    }

    const fileName = `Buku_Besar_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
    console.log("✅ [exportBukuBesarToPDF] PDF saved successfully");
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

// PDF Generators
const generateNeracaPDF = (doc, data, startY, pageWidth, margin, pageHeight) => {
  console.log("📊 [generateNeracaPDF] Starting...");
  console.log("   - data exists?", !!data);
  console.log("   - data type:", typeof data);
  
  if (!data) {
    console.warn("⚠️ [generateNeracaPDF] No data provided");
    doc.text("Tidak ada data", margin, startY);
    return startY + 10;
  }

  console.log("📊 [generateNeracaPDF] Building table data...");
  const tableData = [];
  const columnStyles = {};

  // Aset
  console.log("📊 [generateNeracaPDF] Processing ASET...");
  tableData.push(["ASET", "", "", ""]);
  if (data.aset && typeof data.aset === 'object') {
    const asetKeys = Object.keys(data.aset);
    console.log("   - ASET categories:", asetKeys.length);
    asetKeys.forEach((kategori) => {
      tableData.push([kategori, "", "", ""]);
      const accounts = Array.isArray(data.aset[kategori]) ? data.aset[kategori] : [];
      console.log(`   - Category "${kategori}" has ${accounts.length} accounts`);
      accounts.forEach((acc) => {
        try {
          const nama = acc.namaAkun || acc.nama || "";
          const tanpa = acc.tanpaPembatasan || 0;
          const dengan = acc.denganPembatasan || 0;
          const saldo = acc.saldo || 0;
          tableData.push([
            nama,
            formatCurrency(tanpa),
            formatCurrency(dengan),
            formatCurrency(saldo),
          ]);
        } catch (err) {
          console.error(`   ❌ Error processing account:`, acc, err);
        }
      });
      if (data.subtotalAset && data.subtotalAset[kategori]) {
        const subtotal = data.subtotalAset[kategori];
        tableData.push([
          `Subtotal ${kategori}`,
          formatCurrency(subtotal.tanpaPembatasan || 0),
          formatCurrency(subtotal.denganPembatasan || 0),
          formatCurrency(subtotal.saldo || 0),
        ]);
      }
    });
  } else {
    console.warn("   ⚠️ ASET data is not an object or doesn't exist");
  }
  tableData.push([
    "Total Aset",
    formatCurrency(data.totalAsetTanpa || 0),
    formatCurrency(data.totalAsetDengan || 0),
    formatCurrency(data.totalAset || 0),
  ]);

  // Kewajiban
  tableData.push(["KEWAJIBAN", "", "", ""]);
  if (data.kewajiban && typeof data.kewajiban === 'object') {
    Object.keys(data.kewajiban).forEach((kategori) => {
      tableData.push([kategori, "", "", ""]);
      const accounts = Array.isArray(data.kewajiban[kategori]) ? data.kewajiban[kategori] : [];
      accounts.forEach((acc) => {
        const nama = acc.namaAkun || acc.nama || "";
        const tanpa = acc.tanpaPembatasan || 0;
        const dengan = acc.denganPembatasan || 0;
        const saldo = acc.saldo || 0;
        tableData.push([
          nama,
          formatCurrency(tanpa),
          formatCurrency(dengan),
          formatCurrency(saldo),
        ]);
      });
      if (data.subtotalKewajiban && data.subtotalKewajiban[kategori]) {
        const subtotal = data.subtotalKewajiban[kategori];
        tableData.push([
          `Subtotal ${kategori}`,
          formatCurrency(subtotal.tanpaPembatasan || 0),
          formatCurrency(subtotal.denganPembatasan || 0),
          formatCurrency(subtotal.saldo || 0),
        ]);
      }
    });
  }
  tableData.push([
    "Total Kewajiban",
    formatCurrency(data.totalKewajibanTanpa || 0),
    formatCurrency(data.totalKewajibanDengan || 0),
    formatCurrency(data.totalKewajiban || 0),
  ]);

  // Ekuitas
  tableData.push(["EKUITAS", "", "", ""]);
  if (data.ekuitas && typeof data.ekuitas === 'object') {
    Object.keys(data.ekuitas).forEach((kategori) => {
      tableData.push([kategori, "", "", ""]);
      const accounts = Array.isArray(data.ekuitas[kategori]) ? data.ekuitas[kategori] : [];
      accounts.forEach((acc) => {
        const nama = acc.namaAkun || acc.nama || "";
        const tanpa = acc.tanpaPembatasan || 0;
        const dengan = acc.denganPembatasan || 0;
        const saldo = acc.saldo || 0;
        tableData.push([
          nama,
          formatCurrency(tanpa),
          formatCurrency(dengan),
          formatCurrency(saldo),
        ]);
      });
      if (data.subtotalEkuitas && data.subtotalEkuitas[kategori]) {
        const subtotal = data.subtotalEkuitas[kategori];
        tableData.push([
          `Subtotal ${kategori}`,
          formatCurrency(subtotal.tanpaPembatasan || 0),
          formatCurrency(subtotal.denganPembatasan || 0),
          formatCurrency(subtotal.saldo || 0),
        ]);
      }
    });
  }
  tableData.push([
    "Total Ekuitas",
    formatCurrency(data.totalEkuitasTanpa || 0),
    formatCurrency(data.totalEkuitasDengan || 0),
    formatCurrency(data.totalEkuitas || 0),
  ]);

  console.log("📊 [generateNeracaPDF] Table data rows:", tableData.length);
  console.log("📊 [generateNeracaPDF] Creating autoTable...");
  
  try {
    console.log("📊 [generateNeracaPDF] Checking autoTable function...");
    console.log("   - autoTable type:", typeof autoTable);
    console.log("   - autoTable:", autoTable);
    
    console.log("📊 [generateNeracaPDF] Getting autoTable function...");
    const autoTableFn = getAutoTableFunction(doc);
    console.log("✅ [generateNeracaPDF] autoTable function obtained");
    console.log("📊 [generateNeracaPDF] Calling autoTable with", tableData.length, "rows...");
    autoTableFn(doc, {
      startY: startY,
      head: [["Akun", "Tanpa Pembatasan", "Dengan Pembatasan", "Saldo"]],
      body: tableData,
      theme: "striped",
      headStyles: { 
        fillColor: [16, 185, 129], 
        textColor: 255, 
        fontStyle: "bold",
        fontSize: 10,
        halign: "center"
      },
      styles: { 
        fontSize: 9,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 80, halign: "left" },
        1: { cellWidth: 50, halign: "right" },
        2: { cellWidth: 50, halign: "right" },
        3: { cellWidth: 50, halign: "right" },
      },
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        const cellText = data.cell.text[0] || "";
        // Bold untuk header kategori dan total
        if (
          cellText === "ASET" || 
          cellText === "KEWAJIBAN" || 
          cellText === "EKUITAS" || 
          cellText.includes("Total") ||
          cellText.includes("Subtotal")
        ) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [240, 240, 240];
        }
        // Right align untuk kolom angka
        if (data.column.index > 0) {
          data.cell.styles.halign = "right";
        }
      },
      didDrawPage: (data) => {
        // Reset startY untuk halaman berikutnya
        if (data.cursor.y > pageHeight - 30) {
          startY = 20;
        }
      },
    });
    console.log("✅ [generateNeracaPDF] autoTable created successfully");
    // Untuk versi baru, lastAutoTable mungkin tidak langsung tersedia
    // Kita perlu mendapatkan finalY dari hasil autoTable atau menggunakan cara lain
    let finalY = startY;
    try {
      if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
        finalY = doc.lastAutoTable.finalY + 10;
      } else {
        // Fallback: estimasi berdasarkan jumlah baris
        finalY = startY + (tableData.length * 6) + 10;
      }
    } catch (e) {
      console.warn("⚠️ Could not get finalY from lastAutoTable, using estimate");
      finalY = startY + (tableData.length * 6) + 10;
    }
    console.log("   - Final Y position:", finalY);
    return finalY;
  } catch (error) {
    console.error("❌ [generateNeracaPDF] Error in autoTable:");
    console.error("   - Error:", error);
    throw error;
  }
};

const generateLabaRugiPDF = (doc, data, startY, pageWidth, margin, pageHeight) => {
  if (!data) {
    doc.text("Tidak ada data", margin, startY);
    return startY + 10;
  }

  const tableData = [];

  // Pendapatan
  tableData.push(["PENDAPATAN", "", "", ""]);
  if (data.pendapatan && typeof data.pendapatan === 'object') {
    Object.keys(data.pendapatan).forEach((kategori) => {
      tableData.push([kategori, "", "", ""]);
      const accounts = Array.isArray(data.pendapatan[kategori]) ? data.pendapatan[kategori] : [];
      accounts.forEach((acc) => {
        const nama = acc.namaAkun || acc.nama || "";
        const tanpa = acc.tanpaPembatasan || 0;
        const dengan = acc.denganPembatasan || 0;
        const saldo = acc.saldo || 0;
        tableData.push([
          nama,
          formatCurrency(tanpa),
          formatCurrency(dengan),
          formatCurrency(saldo),
        ]);
      });
      if (data.subtotalPendapatan && data.subtotalPendapatan[kategori]) {
        const subtotal = data.subtotalPendapatan[kategori];
        tableData.push([
          `Subtotal ${kategori}`,
          formatCurrency(subtotal.tanpaPembatasan || 0),
          formatCurrency(subtotal.denganPembatasan || 0),
          formatCurrency(subtotal.saldo || 0),
        ]);
      }
    });
  }
  tableData.push([
    "Total Pendapatan",
    formatCurrency(data.totalPendapatanTanpa || 0),
    formatCurrency(data.totalPendapatanDengan || 0),
    formatCurrency(data.totalPendapatan || 0),
  ]);

  // Beban
  tableData.push(["BEBAN", "", "", ""]);
  if (data.beban && typeof data.beban === 'object') {
    Object.keys(data.beban).forEach((kategori) => {
      tableData.push([kategori, "", "", ""]);
      const accounts = Array.isArray(data.beban[kategori]) ? data.beban[kategori] : [];
      accounts.forEach((acc) => {
        const nama = acc.namaAkun || acc.nama || "";
        const tanpa = acc.tanpaPembatasan || 0;
        const dengan = acc.denganPembatasan || 0;
        const saldo = acc.saldo || 0;
        tableData.push([
          nama,
          formatCurrency(tanpa),
          formatCurrency(dengan),
          formatCurrency(saldo),
        ]);
      });
      if (data.subtotalBeban && data.subtotalBeban[kategori]) {
        const subtotal = data.subtotalBeban[kategori];
        tableData.push([
          `Subtotal ${kategori}`,
          formatCurrency(subtotal.tanpaPembatasan || 0),
          formatCurrency(subtotal.denganPembatasan || 0),
          formatCurrency(subtotal.saldo || 0),
        ]);
      }
    });
  }
  tableData.push([
    "Total Beban",
    formatCurrency(data.totalBebanTanpa || 0),
    formatCurrency(data.totalBebanDengan || 0),
    formatCurrency(data.totalBeban || 0),
  ]);

  // Laba Rugi
  const labaRugiTanpa = (data.totalPendapatanTanpa || 0) - (data.totalBebanTanpa || 0);
  const labaRugiDengan = (data.totalPendapatanDengan || 0) - (data.totalBebanDengan || 0);
  const labaRugi = (data.totalPendapatan || 0) - (data.totalBeban || 0);
  
  tableData.push([
    "Laba (Rugi) Bersih",
    formatCurrency(labaRugiTanpa),
    formatCurrency(labaRugiDengan),
    formatCurrency(labaRugi),
  ]);

  const autoTableFn = getAutoTableFunction(doc);
  autoTableFn(doc, {
    startY: startY,
    head: [["Akun", "Tanpa Pembatasan", "Dengan Pembatasan", "Saldo"]],
    body: tableData,
    theme: "striped",
    headStyles: { 
      fillColor: [16, 185, 129], 
      textColor: 255, 
      fontStyle: "bold",
      fontSize: 10,
      halign: "center"
    },
    styles: { 
      fontSize: 9,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 80, halign: "left" },
      1: { cellWidth: 50, halign: "right" },
      2: { cellWidth: 50, halign: "right" },
      3: { cellWidth: 50, halign: "right" },
    },
    margin: { left: margin, right: margin },
    didParseCell: (data) => {
      const cellText = data.cell.text[0] || "";
      if (
        cellText === "PENDAPATAN" || 
        cellText === "BEBAN" || 
        cellText.includes("Total") || 
        cellText.includes("Laba") ||
        cellText.includes("Subtotal")
      ) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [240, 240, 240];
      }
      if (data.column.index > 0) {
        data.cell.styles.halign = "right";
      }
    },
  });

  let finalY = startY;
  try {
    if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
      finalY = doc.lastAutoTable.finalY + 10;
    } else {
      finalY = startY + (tableData.length * 6) + 10;
    }
  } catch (e) {
    finalY = startY + (tableData.length * 6) + 10;
  }
  return finalY;
};

const generatePerubahanEkuitasPDF = (doc, data, startY, pageWidth, margin, pageHeight) => {
  if (!data) {
    doc.text("Tidak ada data", margin, startY);
    return startY + 10;
  }

  const tableData = [
    ["Saldo Awal", 
     formatCurrency(data.saldoAwalEkuitasTanpa || 0), 
     formatCurrency(data.saldoAwalEkuitasDengan || 0), 
     formatCurrency((data.saldoAwalEkuitasTanpa || 0) + (data.saldoAwalEkuitasDengan || 0))],
    ["Penghasilan Komprehensif", 
     formatCurrency(data.labaRugiTanpa || 0), 
     formatCurrency(data.labaRugiDengan || 0), 
     formatCurrency((data.labaRugiTanpa || 0) + (data.labaRugiDengan || 0))],
    ["Perubahan Modal", 
     formatCurrency(data.perubahanModalTanpa || 0), 
     formatCurrency(data.perubahanModalDengan || 0), 
     formatCurrency((data.perubahanModalTanpa || 0) + (data.perubahanModalDengan || 0))],
    ["Saldo Akhir", 
     formatCurrency(data.saldoAkhirEkuitasTanpa || 0), 
     formatCurrency(data.saldoAkhirEkuitasDengan || 0), 
     formatCurrency((data.saldoAkhirEkuitasTanpa || 0) + (data.saldoAkhirEkuitasDengan || 0))],
  ];

  const autoTableFn = getAutoTableFunction(doc);
  autoTableFn(doc, {
    startY: startY,
    head: [["", "Tanpa Pembatasan", "Dengan Pembatasan", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: { 
      fillColor: [16, 185, 129], 
      textColor: 255, 
      fontStyle: "bold",
      fontSize: 10,
      halign: "center"
    },
    styles: { 
      fontSize: 10,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 80, halign: "left", fontStyle: "bold" },
      1: { cellWidth: 50, halign: "right" },
      2: { cellWidth: 50, halign: "right" },
      3: { cellWidth: 50, halign: "right", fontStyle: "bold" },
    },
    margin: { left: margin, right: margin },
  });

  let finalY = startY;
  try {
    if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
      finalY = doc.lastAutoTable.finalY + 10;
    } else {
      finalY = startY + (tableData.length * 6) + 10;
    }
  } catch (e) {
    finalY = startY + (tableData.length * 6) + 10;
  }
  return finalY;
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

// Excel Generators dengan formatting dan lebar kolom
const generateNeracaExcel = (data, masjidName, periode) => {
  const rows = [];

  // Header
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

  // Table header
  rows.push(["Akun", "Tanpa Pembatasan", "Dengan Pembatasan", "Saldo"]);

  // Aset
  rows.push(["ASET", "", "", ""]);
  if (data.aset && typeof data.aset === 'object') {
    Object.keys(data.aset).forEach((kategori) => {
      rows.push([kategori, "", "", ""]);
      const accounts = Array.isArray(data.aset[kategori]) ? data.aset[kategori] : [];
      accounts.forEach((acc) => {
        rows.push([
          acc.namaAkun || acc.nama || "",
          acc.tanpaPembatasan || 0,
          acc.denganPembatasan || 0,
          acc.saldo || 0,
        ]);
      });
      if (data.subtotalAset && data.subtotalAset[kategori]) {
        const subtotal = data.subtotalAset[kategori];
        rows.push([
          `Subtotal ${kategori}`,
          subtotal.tanpaPembatasan || 0,
          subtotal.denganPembatasan || 0,
          subtotal.saldo || 0,
        ]);
      }
    });
  }
  rows.push([
    "Total Aset",
    data.totalAsetTanpa || 0,
    data.totalAsetDengan || 0,
    data.totalAset || 0,
  ]);
  rows.push([]);

  // Kewajiban
  rows.push(["KEWAJIBAN", "", "", ""]);
  if (data.kewajiban && typeof data.kewajiban === 'object') {
    Object.keys(data.kewajiban).forEach((kategori) => {
      rows.push([kategori, "", "", ""]);
      const accounts = Array.isArray(data.kewajiban[kategori]) ? data.kewajiban[kategori] : [];
      accounts.forEach((acc) => {
        rows.push([
          acc.namaAkun || acc.nama || "",
          acc.tanpaPembatasan || 0,
          acc.denganPembatasan || 0,
          acc.saldo || 0,
        ]);
      });
      if (data.subtotalKewajiban && data.subtotalKewajiban[kategori]) {
        const subtotal = data.subtotalKewajiban[kategori];
        rows.push([
          `Subtotal ${kategori}`,
          subtotal.tanpaPembatasan || 0,
          subtotal.denganPembatasan || 0,
          subtotal.saldo || 0,
        ]);
      }
    });
  }
  rows.push([
    "Total Kewajiban",
    data.totalKewajibanTanpa || 0,
    data.totalKewajibanDengan || 0,
    data.totalKewajiban || 0,
  ]);
  rows.push([]);

  // Ekuitas
  rows.push(["EKUITAS", "", "", ""]);
  if (data.ekuitas && typeof data.ekuitas === 'object') {
    Object.keys(data.ekuitas).forEach((kategori) => {
      rows.push([kategori, "", "", ""]);
      const accounts = Array.isArray(data.ekuitas[kategori]) ? data.ekuitas[kategori] : [];
      accounts.forEach((acc) => {
        rows.push([
          acc.namaAkun || acc.nama || "",
          acc.tanpaPembatasan || 0,
          acc.denganPembatasan || 0,
          acc.saldo || 0,
        ]);
      });
      if (data.subtotalEkuitas && data.subtotalEkuitas[kategori]) {
        const subtotal = data.subtotalEkuitas[kategori];
        rows.push([
          `Subtotal ${kategori}`,
          subtotal.tanpaPembatasan || 0,
          subtotal.denganPembatasan || 0,
          subtotal.saldo || 0,
        ]);
      }
    });
  }
  rows.push([
    "Total Ekuitas",
    data.totalEkuitasTanpa || 0,
    data.totalEkuitasDengan || 0,
    data.totalEkuitas || 0,
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 40 }, // Akun - lebih lebar
    { wch: 20 }, // Tanpa Pembatasan
    { wch: 20 }, // Dengan Pembatasan
    { wch: 20 }, // Saldo
  ];

  // Format header row (row 5, index 4)
  const headerRow = 5;
  ['A', 'B', 'C', 'D'].forEach((col) => {
    const cell = ws[col + headerRow];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "10B981" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
  });

  // Format angka sebagai number dengan separator
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = headerRow; R <= range.e.r; R++) {
    for (let C = 1; C <= 3; C++) { // Kolom B, C, D
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      const cell = ws[cellAddress];
      if (typeof cell.v === 'number' && cell.v !== 0) {
        cell.z = '#,##0';
        cell.s = {
          ...cell.s,
          numFmt: '#,##0',
          alignment: { horizontal: "right" }
        };
      }
    }
  }

  return ws;
};

const generateLabaRugiExcel = (data, masjidName, periode) => {
  const rows = [];

  // Header
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

  // Table header
  rows.push(["Akun", "Tanpa Pembatasan", "Dengan Pembatasan", "Saldo"]);

  // Pendapatan
  rows.push(["PENDAPATAN", "", "", ""]);
  if (data.pendapatan && typeof data.pendapatan === 'object') {
    Object.keys(data.pendapatan).forEach((kategori) => {
      rows.push([kategori, "", "", ""]);
      const accounts = Array.isArray(data.pendapatan[kategori]) ? data.pendapatan[kategori] : [];
      accounts.forEach((acc) => {
        rows.push([
          acc.namaAkun || acc.nama || "",
          acc.tanpaPembatasan || 0,
          acc.denganPembatasan || 0,
          acc.saldo || 0,
        ]);
      });
      if (data.subtotalPendapatan && data.subtotalPendapatan[kategori]) {
        const subtotal = data.subtotalPendapatan[kategori];
        rows.push([
          `Subtotal ${kategori}`,
          subtotal.tanpaPembatasan || 0,
          subtotal.denganPembatasan || 0,
          subtotal.saldo || 0,
        ]);
      }
    });
  }
  rows.push([
    "Total Pendapatan",
    data.totalPendapatanTanpa || 0,
    data.totalPendapatanDengan || 0,
    data.totalPendapatan || 0,
  ]);
  rows.push([]);

  // Beban
  rows.push(["BEBAN", "", "", ""]);
  if (data.beban && typeof data.beban === 'object') {
    Object.keys(data.beban).forEach((kategori) => {
      rows.push([kategori, "", "", ""]);
      const accounts = Array.isArray(data.beban[kategori]) ? data.beban[kategori] : [];
      accounts.forEach((acc) => {
        rows.push([
          acc.namaAkun || acc.nama || "",
          acc.tanpaPembatasan || 0,
          acc.denganPembatasan || 0,
          acc.saldo || 0,
        ]);
      });
      if (data.subtotalBeban && data.subtotalBeban[kategori]) {
        const subtotal = data.subtotalBeban[kategori];
        rows.push([
          `Subtotal ${kategori}`,
          subtotal.tanpaPembatasan || 0,
          subtotal.denganPembatasan || 0,
          subtotal.saldo || 0,
        ]);
      }
    });
  }
  rows.push([
    "Total Beban",
    data.totalBebanTanpa || 0,
    data.totalBebanDengan || 0,
    data.totalBeban || 0,
  ]);
  rows.push([]);

  // Laba Rugi
  rows.push([
    "Laba (Rugi) Bersih",
    (data.totalPendapatanTanpa || 0) - (data.totalBebanTanpa || 0),
    (data.totalPendapatanDengan || 0) - (data.totalBebanDengan || 0),
    (data.totalPendapatan || 0) - (data.totalBeban || 0),
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 40 }, // Akun
    { wch: 20 }, // Tanpa Pembatasan
    { wch: 20 }, // Dengan Pembatasan
    { wch: 20 }, // Saldo
  ];

  // Format header
  const headerRow = 5;
  ['A', 'B', 'C', 'D'].forEach((col) => {
    const cell = ws[col + headerRow];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "10B981" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
  });

  // Format angka
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = headerRow; R <= range.e.r; R++) {
    for (let C = 1; C <= 3; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      const cell = ws[cellAddress];
      if (typeof cell.v === 'number' && cell.v !== 0) {
        cell.z = '#,##0';
        cell.s = {
          ...cell.s,
          numFmt: '#,##0',
          alignment: { horizontal: "right" }
        };
      }
    }
  }

  return ws;
};

const generatePerubahanEkuitasExcel = (data, masjidName, periode) => {
  const rows = [];

  // Header
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

  // Table
  rows.push(["", "Tanpa Pembatasan", "Dengan Pembatasan", "Total"]);
  rows.push([
    "Saldo Awal",
    data.saldoAwalEkuitasTanpa || 0,
    data.saldoAwalEkuitasDengan || 0,
    (data.saldoAwalEkuitasTanpa || 0) + (data.saldoAwalEkuitasDengan || 0),
  ]);
  rows.push([
    "Penghasilan Komprehensif",
    data.labaRugiTanpa || 0,
    data.labaRugiDengan || 0,
    (data.labaRugiTanpa || 0) + (data.labaRugiDengan || 0),
  ]);
  rows.push([
    "Perubahan Modal",
    data.perubahanModalTanpa || 0,
    data.perubahanModalDengan || 0,
    (data.perubahanModalTanpa || 0) + (data.perubahanModalDengan || 0),
  ]);
  rows.push([
    "Saldo Akhir",
    data.saldoAkhirEkuitasTanpa || 0,
    data.saldoAkhirEkuitasDengan || 0,
    (data.saldoAkhirEkuitasTanpa || 0) + (data.saldoAkhirEkuitasDengan || 0),
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 35 }, // Kolom pertama
    { wch: 20 }, // Tanpa Pembatasan
    { wch: 20 }, // Dengan Pembatasan
    { wch: 20 }, // Total
  ];

  // Format header
  const headerRow = 5;
  ['A', 'B', 'C', 'D'].forEach((col) => {
    const cell = ws[col + headerRow];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "10B981" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
  });

  // Format angka
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = headerRow; R <= range.e.r; R++) {
    for (let C = 1; C <= 3; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      const cell = ws[cellAddress];
      if (typeof cell.v === 'number' && cell.v !== 0) {
        cell.z = '#,##0';
        cell.s = {
          ...cell.s,
          numFmt: '#,##0',
          alignment: { horizontal: "right" }
        };
      }
    }
  }

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
