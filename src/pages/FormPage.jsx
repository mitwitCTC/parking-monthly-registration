import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation, Navigate } from "react-router-dom";
import AppBar from "../components/AppBar.jsx";
import BottomButton from "../components/BottomButton.jsx";
import DatePicker from "../components/DatePicker.jsx";
import SelectField from "../components/SelectField.jsx";
import TextField from "../components/TextField.jsx";
import {
  fetchRates,
  getAvailablePeriods,
  submitRegistration,
  CAR_TYPE_LABELS,
  ApiError,
} from "../api/monthlyRental.js";
import useSiteInfo from "../hooks/useSiteInfo.js";
import { alertError } from "../utils/alert.js";
import {
  isValidCarNumber,
  isValidCarrier,
  isValidEmail,
  isValidPhone,
  isValidTaxId,
} from "../utils/validators.js";
import "./FormPage.css";

/** yyyy-MM-dd（local time） */
function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const today = fmtDate(new Date());
const tomorrow = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return fmtDate(d);
})();

/* ── 表單驗證：欄位 → error message 對應 ── */
function validate(form) {
  const errors = {};
  if (!form.carType) errors.carType = "請選擇車型類別";
  if (!form.rateName) errors.rateName = "請選擇身分費率";
  if (!form.paymentPeriod) errors.paymentPeriod = "請選擇繳費期別";
  if (!form.name.trim()) errors.name = "請輸入車主姓名";
  if (!form.phone) {
    errors.phone = "請輸入手機號碼";
  } else if (!isValidPhone(form.phone)) {
    errors.phone = "手機號碼格式：09 開頭共 10 碼";
  }
  if (!form.carNumber.trim()) {
    errors.carNumber = "請輸入車牌號碼";
  } else if (!isValidCarNumber(form.carNumber)) {
    errors.carNumber = "格式範例:ABC-1234 或 1234-TT";
  }
  if (!form.beginDate) {
    errors.beginDate = "請選擇起租日";
  } else if (form.beginDate <= today) {
    errors.beginDate = "起租日需為明日(含)之後";
  }
  if (form.email && !isValidEmail(form.email)) {
    errors.email = "Email 格式不正確";
  }
  if (form.carrier && !isValidCarrier(form.carrier)) {
    errors.carrier = "格式：/ 開頭共 8 碼（例：/ABC+123）";
  }
  if (form.taxId && !isValidTaxId(form.taxId)) {
    errors.taxId = "統一編號格式不正確";
  }
  if (form.address && form.address.trim().length < 5) {
    errors.address = "地址至少 5 個字";
  }
  return errors;
}

/* ── Component ── */

export default function FormPage() {
  const { siteCode } = useParams();
  const location = useLocation();
  const { data: siteData, loading: siteLoading, error: siteError } = useSiteInfo(
    siteCode,
    { initialData: location.state?.siteInfo ?? null },
  );
  const navigate = useNavigate();

  // 帶著原本 query string（bQz0fX8f）導航
  const goWithSearch = (pathname, options) =>
    navigate({ pathname, search: location.search }, options);

  // 上一頁：走 history back 保留 state、避免重打 API
  const handleBack = () => {
    if (location.key === "default") {
      goWithSearch("/");
    } else {
      navigate(-1);
    }
  };

  const [form, setForm] = useState({
    carType: "",
    rateName: "",
    paymentPeriod: "",
    name: "",
    phone: "",
    carNumber: "",
    address: "",
    beginDate: tomorrow,
    email: "",
    carrier: "",
    taxId: "",
    company: "",
  });
  const [errors, setErrors] = useState({});
  const [rates, setRates] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ── siteCode 就緒 → 載入身分費率清單 ── */
  useEffect(() => {
    if (!siteCode) return;
    let cancelled = false;
    setRatesLoading(true);
    fetchRates(siteCode)
      .then((data) => {
        if (cancelled) return;
        setRates(data);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof ApiError ? err.message : "載入費率失敗";
        alertError(msg);
      })
      .finally(() => {
        if (!cancelled) setRatesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [siteCode]);

  /* ── guard ── */
  if (siteLoading) {
    return (
      <div className="form-page">
        <AppBar title="載入中..." onBack={handleBack} />
        <p style={{ textAlign: "center", marginTop: 120 }}>載入中...</p>
      </div>
    );
  }
  if (siteError || !siteData)
    return <Navigate to={{ pathname: "/", search: location.search }} replace />;

  const { site } = siteData;

  /* ── 級聯選單資料 ── */

  // 車型類別：從 rates 裡 unique 的 car_type
  const availableCarTypes = Array.from(new Set(rates.map((r) => r.carType)));
  const carTypeOptions = availableCarTypes.map((ct) => ({
    value: ct,
    label: CAR_TYPE_LABELS[ct] ?? `類型 ${ct}`,
  }));

  // 身分費率：依目前選的車型過濾
  const filteredRates = form.carType
    ? rates.filter((r) => r.carType === form.carType)
    : [];
  const rateOptions = filteredRates.map((r) => ({
    value: r.rateName,
    label: r.rateName,
  }));

  // 選中的 rate 物件
  const selectedRate = filteredRates.find((r) => r.rateName === form.rateName);

  // 繳費期別：依選中的 rate 的 payment_method 位元過濾
  const periodOptions = getAvailablePeriods(selectedRate).map((p) => ({
    value: p.key,
    label: p.label,
  }));
  const availablePeriods = getAvailablePeriods(selectedRate);
  const selectedPeriod = availablePeriods.find((p) => p.key === form.paymentPeriod);

  /* ── helpers ── */

  // 一般欄位更新
  function update(field) {
    return (value) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  // 級聯更新：切換車型 → 清空費率 + 期別；切換費率 → 清空期別
  function handleCarTypeChange(value) {
    setForm((prev) => ({
      ...prev,
      carType: value,
      rateName: "",
      paymentPeriod: "",
    }));
    setErrors((prev) => ({
      ...prev,
      carType: undefined,
      rateName: undefined,
      paymentPeriod: undefined,
    }));
  }

  function handleRateNameChange(value) {
    setForm((prev) => ({ ...prev, rateName: value, paymentPeriod: "" }));
    setErrors((prev) => ({
      ...prev,
      rateName: undefined,
      paymentPeriod: undefined,
    }));
  }

  async function handleSubmit() {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitRegistration({
        ...form,
        siteCode,
        rate: selectedRate,
        period: selectedPeriod,
      });
      if (!result.success) return;

      if (result.hasBill && result.billId) {
        window.location.href = `https://rental.mitwit-cre.com.tw/?mid=${result.billId}`;
      } else {
        goWithSearch(`/success/${siteCode}`, {
          state: { form, rate: selectedRate, period: selectedPeriod },
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-page">
      <AppBar title={site.parkName || site.siteName} onBack={handleBack} />

      <main className="form-page__body">
        <h2 className="form-page__heading">基本資料</h2>

        <div className="form-page__fields">
          <div className="form-page__full" data-field="carType">
            <SelectField
              icon="mdi-parking"
              label={ratesLoading ? "載入費率中..." : "車型類別"}
              required
              value={form.carType}
              onChange={handleCarTypeChange}
              options={carTypeOptions}
              error={errors.carType}
            />
          </div>

          {form.carType && (
            <div className="form-page__full" data-field="rateName">
              <SelectField
                icon="mdi-card-account-details-outline"
                label="身分費率"
                required
                value={form.rateName}
                onChange={handleRateNameChange}
                options={rateOptions}
                error={errors.rateName}
              />
            </div>
          )}

          {form.rateName && (
            <div className="form-page__full" data-field="paymentPeriod">
              <SelectField
                icon="mdi-credit-card-outline"
                label="繳費期別"
                required
                value={form.paymentPeriod}
                onChange={update("paymentPeriod")}
                options={periodOptions}
                error={errors.paymentPeriod}
              />
            </div>
          )}

          {selectedPeriod && (
            <div className="form-page__full form-page__fee-badge">
              <span className="form-page__fee-label">費率金額</span>
              <span className="form-page__fee-amount">
                NT$ {selectedPeriod.amount.toLocaleString()}
              </span>
              <span className="form-page__fee-per">／{selectedPeriod.label}</span>
            </div>
          )}

          <div data-field="name">
            <TextField
              icon="mdi-account"
              label="車主姓名"
              required
              value={form.name}
              onChange={update("name")}
              error={errors.name}
            />
          </div>

          <div data-field="phone">
            <TextField
              icon="mdi-cellphone"
              label="手機號碼"
              required
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              error={errors.phone}
              hint="09 開頭共 10 碼"
            />
          </div>

          <div data-field="carNumber">
            <TextField
              icon="mdi-aspect-ratio"
              label="車牌號碼"
              required
              value={form.carNumber}
              onChange={update("carNumber")}
              error={errors.carNumber}
              hint="包含符號，例：ABC-1234"
            />
          </div>

          <div data-field="address" className="form-page__full">
            <TextField
              icon="mdi-home-variant"
              label="聯絡地址"
              multiline
              value={form.address}
              onChange={update("address")}
              error={errors.address}
            />
          </div>

          <div data-field="beginDate">
            <DatePicker
              icon="mdi-pin"
              label="起租日"
              required
              value={form.beginDate}
              onChange={update("beginDate")}
              min={tomorrow}
              error={errors.beginDate}
            />
          </div>

          <div data-field="taxId">
            <TextField
              icon="mdi-ballot"
              label="統一編號"
              value={form.taxId}
              onChange={update("taxId")}
              error={errors.taxId}
              hint="選填，8 碼數字"
            />
          </div>

          <div data-field="company">
            <TextField
              icon="mdi-home-account"
              label="公司抬頭"
              value={form.company}
              onChange={update("company")}
              hint="選填"
            />
          </div>

          <div data-field="email">
            <TextField
              icon="mdi-email-outline"
              label="Email"
              type="email"
              value={form.email}
              onChange={update("email")}
              error={errors.email}
              hint="選填"
            />
          </div>

          <div data-field="carrier">
            <TextField
              icon="mdi-cellphone-text"
              label="手機載具"
              value={form.carrier}
              onChange={update("carrier")}
              error={errors.carrier}
              hint="選填，/ 開頭共 8 碼"
            />
          </div>
        </div>
      </main>

      <BottomButton onClick={handleSubmit} disabled={submitting}>
        {submitting ? "送出中..." : "送出資料"}
      </BottomButton>
    </div>
  );
}
