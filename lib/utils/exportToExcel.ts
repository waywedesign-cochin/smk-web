import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Export any array of objects to Excel (.xlsx)
 */
export const exportToExcel = <T extends Record<string, unknown>>(
  data: T[],
  options?: {
    fileName?: string;
    sheetName?: string;
    autoFormatHeaders?: boolean;
  }
): void => {
  const {
    fileName = "export.xlsx",
    sheetName = "Sheet1",
    autoFormatHeaders = true,
  } = options || {};

  if (!Array.isArray(data) || data.length === 0) {
    console.warn("No data available for export");
    return;
  }

  // ✅ Flatten nested objects
  const flattenedData = data.map((item) => flattenObject(item));

  // ✅ Optionally format headers to be user-friendly
  const formattedData = autoFormatHeaders
    ? flattenedData.map((obj) => {
        const formattedObj: Record<string, unknown> = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newKey = key
              .replace(/([A-Z])/g, " $1")
              .replace(/_/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .replace(/^./, (str) => str.toUpperCase());
            formattedObj[newKey] = obj[key];
          }
        }
        return formattedObj;
      })
    : flattenedData;

  // ✅ Create Excel workbook
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // ✅ Generate and save file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, fileName);
};

/**
 * Recursively flatten nested objects
 * Example: { student: { name: "John" } } → { student_name: "John" }
 */
function flattenObject(
  obj: Record<string, unknown>,
  parentKey = "",
  result: Record<string, unknown> = {}
): Record<string, unknown> {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = parentKey ? `${parentKey}_${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenObject(value as Record<string, unknown>, newKey, result);
    } else {
      result[newKey] = value;
    }
  }
  return result;
}
