/**
 * 表單欄位驗證 — 純函式集合
 * 空字串 / undefined / null 一律視為「未填」，由呼叫端自行處理 required 檢查
 */

const CAR_NUMBER_RE = /^[A-Z0-9]{2,4}-[A-Z0-9]{2,4}$/i;
const CARRIER_RE = /^\/[A-Z0-9.+-]{7}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^09\d{8}$/;
const TAX_ID_RE = /^\d{8}$/;

/** 手機號碼：09 開頭共 10 碼 */
export function isValidPhone(phone) {
  if (!phone) return false;
  return PHONE_RE.test(phone);
}

/** 車牌：ABC-1234 或 1234-TT 等 */
export function isValidCarNumber(carNumber) {
  if (!carNumber) return false;
  return CAR_NUMBER_RE.test(carNumber.trim());
}

/** 手機條碼載具：/ 開頭共 8 碼 */
export function isValidCarrier(carrier) {
  if (!carrier) return false;
  return CARRIER_RE.test(carrier);
}

/** Email */
export function isValidEmail(email) {
  if (!email) return false;
  return EMAIL_RE.test(email);
}

/**
 * 台灣公司統一編號驗證（含 checksum）
 * 規則：https://www.fia.gov.tw/
 * - 8 碼數字
 * - 邏輯乘數 [1, 2, 1, 2, 1, 2, 4, 1] 逐位相乘，乘積各位數相加後加總
 * - 總和 % 5 === 0 視為合法
 * - 倒數第二位為 7 時特例：總和 +0 或 +1 任一能被 5 整除即可
 * @param {string} taxId
 * @returns {boolean}
 */
export function isValidTaxId(taxId) {
  if (!taxId || !TAX_ID_RE.test(taxId)) return false;

  const logicMultipliers = [1, 2, 1, 2, 1, 2, 4, 1];
  const isSeventhSeven = taxId[6] === "7";

  // 逐位乘積 → 各位數相加 → 總和
  let logicProduct = 0;
  for (let i = 0; i < 8; i++) {
    // 倒數第二位（index 6）為 7 時，該位先跳過，最後用 0/1 特例判斷
    if (isSeventhSeven && i === 6) continue;
    const product = Number(taxId[i]) * logicMultipliers[i];
    logicProduct += sumDigits(product);
  }

  if (isSeventhSeven) {
    return logicProduct % 5 === 0 || (logicProduct + 1) % 5 === 0;
  }
  return logicProduct % 5 === 0;
}

/** 把一個數字的各位數加總，例如 18 → 1 + 8 = 9 */
function sumDigits(n) {
  return String(n)
    .split("")
    .reduce((acc, d) => acc + Number(d), 0);
}
