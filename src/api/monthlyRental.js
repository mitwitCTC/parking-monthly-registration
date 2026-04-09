/**
 * 月租登記 API（mock）
 * 所有方法回傳 Promise，之後替換成真實 fetch 即可。
 */

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/* ── 假資料 ── */

const SITES = {
  TP002001: {
    siteCode: "TP002001",
    siteName: "435藝文特區-大型車",
    termId: 643,
  },
  TP003001: {
    siteCode: "TP003001",
    siteName: "中正公園停車場",
    termId: 644,
  },
};

const TERMS = [
  { text: "場站條款", red: false },
  { text: "", red: false },
  {
    text: "1.月租繳費需3個工作天入帳,入帳後才能開通,請確認您要繳費的方式,選擇您的起租日,若需提前開通啟用，請於起租日前連絡管理員，並傳送繳費証明，註明停車場名稱及車號，協助開通啟用。",
    red: true,
  },
  { text: "", red: false },
  {
    text: "2.到期日當月21號發送繳納下期租金,遇假日順延,繳費期限至27號超過繳費期限請自行轉帳並提供繳費證明截圖傳LINE@,註明停車場名稱及車號,並來電告知,未繳費者1號,系統自動鎖卡,停車費以臨停計費,逾期產生的臨停費恕不退費。",
    red: true,
  },
  { text: "", red: false },
  {
    text: "3.月租請停放綁定車號車輛,不提供固定車位,遇停車場滿位時,請依序排隊進場停車.",
    red: true,
  },
  { text: "", red: false },
  {
    text: "4.退租請於到期日當月25號前告知，未足月以每日最高上限收費。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "5.月租限停放登記車號車輛，需更換車輛停放者請提前3天辦妥更換程序。",
    red: false,
  },
  { text: "", red: false },
  { text: "停放所屬其他車輛以臨停計價", red: false },
  { text: "", red: false },
  { text: "6.本停車場不負車輛保管責任。", red: false },
  { text: "", red: false },
  {
    text: "7.月租請停放綁定車號車輛,不提供固定車位,遇停車場滿位時,請依序排隊進場停車,其他相關規定請參閱本停車管理規範及相關公告。",
    red: false,
  },
  { text: "", red: false },
  { text: "8.本場逾期不適用信用卡繳費。", red: true },
  { text: "", red: false },
  {
    text: "9.本場取得您的個人資料，目的在於進行停車場月租登記，處理及使用您的個人資料是受到個人資料保護法及相關法令之規範。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "10.您同意力揚停車場所需，以您所提供的個人資料確認您的身份、與您進行聯絡；並同意轉移置下一任得標廠商使用您的個人資料與您進行聯絡。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "11.您可選擇是否提供力揚停車場您的個人資料，您所提供之個人資料，經檢舉或發現不足以確認您身分真實性或其他個人資料冒用、盜用、資料不實等情形，力揚停車場有權停止您的報名、錄取資格等相關權利，若有不便之處請見諒。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "12.其他相關規定請參閱本停車管理規範及相關公告。",
    red: false,
  },
  { text: "", red: false },
  { text: "路外停車場租用定型化契約", red: false },
  { text: "", red: false },
  {
    text: "一、登記權與承租權限以原申請人及登記車號使用，禁止一卡兩用及不得私自轉讓予他人，如登記期間或承租期間內有更換車輛者，請出具相關文件（例：報廢車證明文件）向本公司辦理更換倘資格轉讓經查證屬實者，取消其資格。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "二、不得冒用或借用他人證件資料辦理，倘經查獲屬實一律取消資格，一年內不得辦理月租。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "三、遇甲方調整收費標準或收費方式時，於甲方公告實施後，雙方重新簽立契約。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "四、車輛進、出場應遵循停車場內標誌、標線或依管理人員指示方向進出，車輛停放時，應依標誌、標線、停車格位佈設方式入格停妥車輛，俾確保安全，如有任意停放致妨礙其他車輛行進或停放者，甲方得依停車場法第三十二條規定，將車輛移置至適當處所，並得請求壹仟伍佰元移置及保管費（不得超過違規拖吊費用），如因違規停放導致停車場內意外事故或損壞相關停車設施，乙方應負損害賠償責任",
    red: false,
  },
  { text: "", red: false },
  {
    text: "五、車輛禁止裝載易燃、易爆或其他危險物品進入停車場停放，否則應負擔一切因而發生之損害賠償責任。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "六、本停車場僅出租停車位，供車輛停放之用，甲方對停放之車輛不負保管責任。但可歸責於甲方之事由，致車輛毀損、滅失或車內物品遺失者，不在此限。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "七、乙方因故意或過失破壞、毀損停車場內各項停車設備者，應負損害賠償責任。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "八、停車場內各項停車設施，甲方應善盡管理維護之責，乙方以及其相關人員因本契約使用停車場設施，而發生意外事故或遭毀損時，甲方應負損害賠償責任。但甲方對於設置或保管並無欠缺，或損害非因設置或保管有欠缺，或於防止損害之發生，已盡相當之注意者，不在此限。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "九、車輛停放於停車場內逾期超過7日以上未駛離，甲方得通知車主限期補繳停車費，逾期未補繳者，依法處理。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "十、乙方於停妥車輛後，應即熄火，不得在停車場內逗留且嚴禁由匝道進出取車。",
    red: false,
  },
  {
    text: "十一、甲方應設置消費者服務專線電話為0800-070-158。",
    red: false,
  },
  { text: "", red: false },
  { text: "十二、本停車場有投保公共意外責任險，予以公告。", red: false },
  { text: "", red: false },
  {
    text: "十三、甲、乙雙方簽訂之租用契約條款如對乙方較交通部公告之應記載事項規定標準更為有利者，從其約定。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "十四、基於甲、乙雙方因本契約涉訟時，同意以 基隆 地方法院為第一審管轄法院。但不得排除消費者保護法第四十七條或民事訴訟法第四三六條之九小額訴訟管轄法院之適用。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "十五、本契約如有未盡事宜，依有關法令規定辦理。法令規定不明時，由雙方本於誠信原則協議處理之。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "十六、計時計次停車場應將契約內容以公告方式揭示於停車場入口明顯處。",
    red: false,
  },
  { text: "", red: false },
  {
    text: "十七、本停車場月租戶不預留車位，停車場滿位時，請依序排隊入場。",
    red: true,
  },
  { text: "", red: false },
  {
    text: "十八、依基隆市公有停車場管理辦法規定，月租及臨時停放車輛均應依序進入公有停車場，並依場內劃設之車格位停放，且不得固定車位，違反規定者，本場得取消月租資格。",
    red: true,
  },
  { text: "", red: false },
  {
    text: "十九、依身心障礙者專用停車位設置管理辦法第12條及第13條規定，身心障礙者專用停車位識別證應由身心障礙者本人親自持用或配偶、親屬承載身心障礙者本人時持用，若經查獲未依規定使用及占用身心障礙者專用停車位，本場將通報新北市政府交通局依法裁罰，並得取消月租資格。",
    red: true,
  },
  { text: "", red: false },
  {
    text: "二十、承租人(月票購買人)無次年度之優先承租權利，一律重新辦理登記及抽籤事宜。",
    red: true,
  },
  { text: "", red: false },
  {
    text: "二十一、本契約乙式貳份，由甲、乙雙方各執乙份，並自簽約日起生效。",
    red: false,
  },
];

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

/**
 * 查詢場站資訊（含條款、車型選項）
 * @param {string} siteCode
 * @returns {Promise<{ site, terms, vehicleTypes } | null>}
 */
export async function fetchSiteInfo(siteCode) {
  await delay();
  const site = SITES[siteCode.toUpperCase()];
  if (!site) return null;
  return {
    site,
    terms: TERMS,
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
