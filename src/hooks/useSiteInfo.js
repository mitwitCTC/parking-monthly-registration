import { useState, useEffect } from "react";
import { fetchSiteInfo } from "../api/monthlyRental.js";

/**
 * 依 siteCode 載入場站資訊（site, terms, vehicleTypes）
 * @param {string | undefined} siteCode
 */
export default function useSiteInfo(siteCode) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(siteCode));
  const [error, setError] = useState(!siteCode);
  const [prevSiteCode, setPrevSiteCode] = useState(siteCode);

  // siteCode 變更時 reset（render 期間調整，避免 effect 內 setState 造成 cascading render）
  if (siteCode !== prevSiteCode) {
    setPrevSiteCode(siteCode);
    setData(null);
    setLoading(Boolean(siteCode));
    setError(!siteCode);
  }

  useEffect(() => {
    if (!siteCode) return;

    let cancelled = false;

    fetchSiteInfo(siteCode).then((result) => {
      if (cancelled) return;
      if (result) {
        setData(result);
      } else {
        setError(true);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [siteCode]);

  return { data, loading, error };
}
