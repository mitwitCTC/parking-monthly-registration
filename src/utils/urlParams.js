/**
 * 從目前頁面網址的 query string 取值
 * @param {string} key
 * @returns {string | null}
 */
export function getQueryParam(key) {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
}

/** 驗證碼 query key（公司識別） */
export const COMPANY_TOKEN_KEY = "bQz0fX8f";

/** 取得網址上的公司識別碼 */
export function getCompanyToken() {
  return getQueryParam(COMPANY_TOKEN_KEY);
}
