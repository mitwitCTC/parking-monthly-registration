/**
 * 月租登記 API
 * - fetchSiteInfo: POST /member/link/select_register（場站 + 條款）
 * - fetchRates:    POST /member/link/select_status（身分費率清單）
 * - submitRegistration: 仍為 mock，待正式 API 接上
 */

import { getCompanyToken, COMPANY_TOKEN_KEY } from "../utils/urlParams.js";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

/* ── 期別設定（對應 API payment_method 逗點順序） ── */

/**
 * 繳費期別定義：順序與 payment_method 欄位對應
 *   payment_method = "月租,雙月,季繳,半年,年繳"
 */
export const RENT_PERIODS = [
  { key: "monthly", label: "月繳", months: 1, field: "monthly_rent" },
  { key: "bimonthly", label: "雙月繳", months: 2, field: "bimonthly_rent" },
  { key: "quarterly", label: "季繳", months: 3, field: "quarterly_rent" },
  { key: "halfyear", label: "半年繳", months: 6, field: "halfyear_rent" },
  { key: "year", label: "年繳", months: 12, field: "year_rent" },
];

/** 車種 car_type 對照表 */
export const CAR_TYPE_LABELS = {
  0: "汽車",
  1: "機車",
  2: "重機",
};

/* ── 錯誤型別 ── */

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

/* ── 共用 helper ── */

/**
 * 呼叫 /member/link/* 系列 API（POST JSON + 統一錯誤處理）
 * @param {string} path 例：/member/link/select_register
 * @param {object} body
 * @returns {Promise<any>} data 欄位
 */
async function postJson(path, body) {
  const token = getCompanyToken();
  if (!token) {
    throw new ApiError(1, `網址缺少 ${COMPANY_TOKEN_KEY} 參數`);
  }

  const url = `${API_BASE}${path}?${COMPANY_TOKEN_KEY}=${encodeURIComponent(token)}`;

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError(500, `連線失敗:${err.message}`);
  }

  if (!res.ok) {
    throw new ApiError(res.status, `伺服器錯誤(${res.status})`);
  }

  let json;
  try {
    json = await res.json();
  } catch (err) {
    throw new ApiError(500, `回傳格式錯誤:${err.message}`);
  }

  const { returnCode, message, data } = json || {};
  if (returnCode !== 0) {
    throw new ApiError(returnCode ?? 500, message || "查詢失敗");
  }
  if (data === undefined || data === null) {
    throw new ApiError(-2, message || "查無資料");
  }

  return data;
}

/* ── 條款內容解析 ── */

/**
 * 把 termContent 字串拆成 TermsPage 用的 {text, red} 陣列
 *
 * 支援：
 * - 字面 "\n"（backslash + n）或真實換行符 \r\n / \r / \n → 都當換行
 * - 行內含 "\red" 標記 → 整行標紅色，並移除標記本身
 * - 空行 → 保留為 <br>（TermsPage 渲染時判斷）
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

/* ── API: 場站資訊 ── */

/**
 * 查詢場站資訊（含條款內容）
 * @param {string} registerName
 * @returns {Promise<{
 *   site: { siteCode: string, siteName: string, parkName: string, termId: number, parkId: number, isActive: string },
 *   termContent: string | null,
 *   terms: Array<{ text: string, red: boolean }>,
 * }>}
 */
export async function fetchSiteInfo(registerName) {
  if (!registerName) {
    throw new ApiError(-1, "請輸入場站代碼");
  }

  const data = await postJson("/member/link/select_register", {
    register_name: registerName,
  });

  // data 是陣列，取第一筆
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new ApiError(-2, "查無資料");
  }

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
  };
}

/* ── API: 身分費率 ── */

/**
 * 查詢場站所有身分 × 費率對應表
 * @param {string} registerName
 * @returns {Promise<Array<{
 *   identity: string,
 *   rateName: string,
 *   carType: string,
 *   monthlyRent: number,
 *   bimonthlyRent: number,
 *   quarterlyRent: number,
 *   halfyearRent: number,
 *   yearRent: number,
 *   paymentMethod: string,
 *   raw: object,
 * }>>}
 */
export async function fetchRates(registerName) {
  if (!registerName) {
    throw new ApiError(-1, "缺少場站代碼");
  }

  const data = await postJson("/member/link/select_status", {
    register_name: registerName,
  });

  const rows = Array.isArray(data) ? data : [data];

  return rows.map((row) => ({
    identity: row.identity,
    rateName: row.rate_name,
    carType: String(row.car_type),
    monthlyRent: Number(row.monthly_rent) || 0,
    bimonthlyRent: Number(row.bimonthly_rent) || 0,
    quarterlyRent: Number(row.quarterly_rent) || 0,
    halfyearRent: Number(row.halfyear_rent) || 0,
    yearRent: Number(row.year_rent) || 0,
    paymentMethod: row.payment_method || "",
    raw: row,
  }));
}

/**
 * 依 rate 物件解析出「可選的繳費期別」清單
 * - 以 payment_method ("1,0,1,1,1") 位元對應 RENT_PERIODS 順序
 * - 每個期別帶上對應的 amount（從 rate 上的 *Rent 欄位讀）
 * @param {object | null} rate fetchRates() 回傳的其中一筆
 * @returns {Array<{ key: string, label: string, months: number, amount: number }>}
 */
export function getAvailablePeriods(rate) {
  if (!rate) return [];
  const flags = String(rate.paymentMethod)
    .split(",")
    .map((x) => x.trim() === "1");

  return RENT_PERIODS.filter((_, i) => flags[i]).map((p) => {
    // field 是 snake_case（monthly_rent），對應 rate 物件是 camelCase（monthlyRent）
    const camelField = p.field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    return {
      key: p.key,
      label: p.label,
      months: p.months,
      amount: rate[camelField] ?? 0,
    };
  });
}

/* ── API: 送出登記（仍為 mock） ── */

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

  // 模擬：有期別 → 產繳費單；無 → 僅登記
  const hasBill = Boolean(data.paymentPeriod);
  return {
    success: true,
    message: hasBill ? "已產生繳費單" : "登記成功",
    hasBill,
    billId: hasBill ? "M20260402001" : undefined,
  };
}
