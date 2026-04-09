import { useState, useEffect, useRef } from "react";
import { fetchSiteInfo } from "../api/monthlyRental.js";

/**
 * 依 siteCode 載入場站資訊（site, termContent, terms）
 *
 * @param {string | undefined} siteCode
 * @param {{ initialData?: object | null }} [options]
 *   initialData：若呼叫端已有資料（例如從 SearchPage 帶過來），第一次 mount 直接使用、不打 API
 */
export default function useSiteInfo(siteCode, options = {}) {
  const { initialData = null } = options;

  // 「第一次跳過 fetch」的一次性旗標：
  // - 首次 mount 若 caller 已帶 initialData，設成 true → effect 跳過 fetch
  // - effect 內把它設成 false，之後 siteCode 變更會正常 fetch
  // 注意：
  //   (1) 只在 useRef 初始值讀 initialData，之後 render 不再依賴這個 props
  //   (2) 只在 effect 內部寫入 ref.current，避免「render 期間 mutate ref」
  const skipFirstFetchRef = useRef(Boolean(initialData));

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(Boolean(siteCode) && !initialData);
  const [error, setError] = useState(!siteCode);
  const [prevSiteCode, setPrevSiteCode] = useState(siteCode);

  // siteCode 變更時 reset（render 期間調整 state 是合法的，避免 effect 內 setState 造成 cascading render）
  if (siteCode !== prevSiteCode) {
    setPrevSiteCode(siteCode);
    setData(null);
    setLoading(Boolean(siteCode));
    setError(!siteCode);
  }

  useEffect(() => {
    if (!siteCode) return;

    // 首次 mount 已經有 initialData：直接跳過 fetch，同時把旗標關掉
    // 下次 effect 重跑（例如 siteCode 變更）就會正常打 API
    if (skipFirstFetchRef.current) {
      skipFirstFetchRef.current = false;
      return;
    }

    let cancelled = false;

    fetchSiteInfo(siteCode)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setData(result);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [siteCode]);

  return { data, loading, error };
}
