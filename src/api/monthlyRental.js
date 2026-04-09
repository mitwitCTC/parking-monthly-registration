/**
 * 月租登記 API
 * - fetchSiteInfo: 真 API（select_register）
 * - 其餘 fetchPaymentPlans / calculateRental / submitRegistration: 仍為 mock
 */

import { getCompanyToken, COMPANY_TOKEN_KEY } from "../utils/urlParams.js";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

/* ── 假資料（部份保留為 mock） ── */

const VEHICLE_TYPES = [
  { vehicleType: 99, vehicleName: "汽車" },
  { vehicleType: 624, vehicleName: "機車" },
  { vehicleType: 1313, vehicleName: "大車" },
];

/** 各車型對應的繳費方式與金額 */
const PAYMENT_PLANS = {
  99: [
    { planId: "monthly", planName: "月繳", months: 1, amount: 3000 },
    { planId: "bimonthly", planName: "雙月繳", months: 2, amount: 5700 },
    { planId: "quarterly", planName: "季繳", months: 3, amount: 8100 },
    { planId: "semiannual", planName: "半年繳", months: 6, amount: 15000 },
    { planId: "annual", planName: "年繳", months: 12, amount: 28000 },
  ],
  603: [
    { planId: "monthly", planName: "月繳", months: 1, amount: 2500 },
    { planId: "bimonthly", planName: "雙月繳", months: 2, amount: 4800 },
    { planId: "quarterly", planName: "季繳", months: 3, amount: 6900 },
    { planId: "semiannual", planName: "半年繳", months: 6, amount: 12600 },
    { planId: "annual", planName: "年繳", months: 12, amount: 24000 },
  ],
  624: [
    { planId: "monthly", planName: "月繳", months: 1, amount: 800 },
    { planId: "bimonthly", planName: "雙月繳", months: 2, amount: 1500 },
    { planId: "quarterly", planName: "季繳", months: 3, amount: 2100 },
    { planId: "semiannual", planName: "半年繳", months: 6, amount: 3600 },
    { planId: "annual", planName: "年繳", months: 12, amount: 6000 },
  ],
  1313: [
    { planId: "monthly", planName: "月繳", months: 1, amount: 5000 },
    { planId: "bimonthly", planName: "雙月繳", months: 2, amount: 9500 },
    { planId: "quarterly", planName: "季繳", months: 3, amount: 13500 },
    { planId: "semiannual", planName: "半年繳", months: 6, amount: 25000 },
    { planId: "annual", planName: "年繳", months: 12, amount: 46000 },
  ],
};

/* ── API 方法 ── */

/** API 錯誤型別 */
export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

/**
 * 把 termContent 字串拆成 TermsPage 用的 {text, red} 陣列
 *
 * 支援：
 * - 字面 "\n"（backslash + n）或真實換行符 \r\n / \r / \n → 都當換行
 * - 行內含 "\red" 標記 → 整行標紅色，并移除標記本身
 * - 空行 → 保留為 <br>（TermsPage 犩渲時判斷）
 */
function parseTermContent(termContent) {
  if (!termContent) return [];
  const RED_MARKER = "\\red"; // 4 字元：字面 \red
  return termContent
    .split(/\\n|\r\n|\r|\n/)
    .map((rawLine) => {
      const line = rawLine.trim();
      const red = line.includes(RED_MARKER);
      const text = red ? line.split(RED_MARKER).join("").trim() : line;
      return { text, red };
    });
}

/**
 * 查詢場站資訊（含條款內容）
 * - 走 POST /member/link/select_register?bQz0fX8f={token}
 * - register_name 為使用者輸入的場站搜尋代號
 * @param {string} registerName
 * @returns {Promise<{
 *   site: { siteCode: string, siteName: string, termId: number, parkId: number, parkName: string },
 *   termContent: string | null,
 *   terms: Array<{ text: string, red: boolean }>,
 *   vehicleTypes: Array<{ vehicleType: number, vehicleName: string }>,
 * }>}
 * @throws {ApiError}
 */
export async function fetchSiteInfo(registerName) {
  const token = getCompanyToken();
  if (!token) {
    throw new ApiError(1, `網址缺少 ${COMPANY_TOKEN_KEY} 參數`);
  }
  if (!registerName) {
    throw new ApiError(-1, "請輸入場站代碼");
  }

  const url = `${API_BASE}/member/link/select_register?${COMPANY_TOKEN_KEY}=${encodeURIComponent(
    token,
  )}`;

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ register_name: registerName }),
    });
  } catch (err) {
    throw new ApiError(500, `連線失敗：${err.message}`);
  }

  if (!res.ok) {
    throw new ApiError(res.status, `伺服器錯誤（${res.status}）`);
  }

  let json;
  try {
    json = await res.json();
  } catch (err) {
    throw new ApiError(500, `回傳格式錯誤：${err.message}`);
  }

  const { returnCode, message, data } = json || {};

  if (returnCode !== 0) {
    throw new ApiError(returnCode ?? 500, message || "查詢失敗");
  }
  if (!data) {
    throw new ApiError(-2, message || "查無資料");
  }

  // API 回傳的 data 是陣列，取第一筆
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new ApiError(-2, "查無資料");
  }

  // 雙名稱兼容：snake_case / camelCase 都接受
  const siteCode = row.register_name ?? row.registerName ?? registerName;
  const parkName = row.park_name ?? row.parkName;
  const termContent = row.termContent ?? row.term_content ?? null;
  const termId = row.termId ?? row.term_id;
  const parkId = row.parkId ?? row.park_id;
  const isActive = row.isActive ?? row.is_active;

  return {
    site: {
      siteCode,
      siteName: parkName || siteCode,
      parkName,
      termId,
      parkId,
      isActive,
    },
    termContent,
    terms: parseTermContent(termContent),
    // vehicleTypes 暫時仍走 mock，待對應 API 接上後替換
    vehicleTypes: VEHICLE_TYPES,
  };
}

/**
 * 取得指定車型的繳費方式清單（含金額）
 * @param {number} vehicleType
 * @returns {Promise<Array<{ planId, planName, months, amount }>>}
 */
export async function fetchPaymentPlans(vehicleType) {
  await delay(200);
  return PAYMENT_PLANS[vehicleType] || [];
}

/**
 * 後端計算應繳資訊
 * @param {{ vehicleType: number, planId: string, beginDate: string }} params
 * @returns {Promise<{
 *   beginDate: string,
 *   endDate: string,
 *   months: number,
 *   unitPrice: number,
 *   totalAmount: number,
 *   note: string,
 * }>}
 */
export async function calculateRental({ vehicleType, planId, beginDate }) {
  await delay(200);
  const plans = PAYMENT_PLANS[vehicleType] || [];
  const plan = plans.find((p) => p.planId === planId);
  if (!plan) return null;

  const start = new Date(beginDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + plan.months);
  end.setDate(end.getDate() - 1);

  const fmt = (d) => d.toISOString().slice(0, 10);

  return {
    beginDate: fmt(start),
    endDate: fmt(end),
    months: plan.months,
    unitPrice: plan.amount / plan.months,
    totalAmount: plan.amount,
    note: `租期 ${fmt(start)} ~ ${fmt(end)}，共 ${plan.months} 個月`,
  };
}

/**
 * 送出月租登記
 * @param {object} data
 * @returns {Promise<{
 *   success: boolean,
 *   message: string,
 *   hasBill: boolean,
 *   billId?: string,
 * }>}
 */
export async function submitRegistration(data) {
  await delay(500);

  // 模擬：有繳費方式 → 產繳費單；無 → 僅登記
  const hasBill = Boolean(data.paymentPlan);
  return {
    success: true,
    message: hasBill ? "已產生繳費單" : "登記成功",
    hasBill,
    billId: hasBill ? "M20260402001" : undefined,
  };
}
