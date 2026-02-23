import type { BirthInfo } from "../types";

const pad2 = (value: number) => String(value).padStart(2, "0");

const hourToTimezone = (hour: number) => {
  if (hour === 23) {
    return 12;
  }
  if (hour === 0) {
    return 0;
  }
  return Math.floor((hour + 1) / 2);
};

export interface ZiweiFortuneFormState {
  question?: string;
  calendar: BirthInfo["calendar"];
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  timeUnknown: boolean;
  gender: BirthInfo["gender"];
  provinceCode: string;
  cityCode: string;
  enableTrueSolar: boolean;
}

interface TrueSolarCityOption {
  code: string;
  name: string;
  longitude: number;
}

interface TrueSolarProvinceOption {
  code: string;
  name: string;
  cities: TrueSolarCityOption[];
}

interface TrueSolarCorrectionResult {
  cityName: string;
  longitude: number;
  longitudeOffsetMinutes: number;
  equationOfTimeMinutes: number;
  totalOffsetMinutes: number;
  correctedDate: string;
  correctedHour: number;
  correctedMinute: number;
}

/**
 * 中国34个省级行政区（按省会/代表城市）经度数据，用于真太阳时修正。
 */
export const TRUE_SOLAR_PROVINCES: TrueSolarProvinceOption[] = [
  { code: "beijing", name: "Beijing", cities: [{ code: "beijing", name: "Beijing", longitude: 116.41 }] },
  { code: "tianjin", name: "Tianjin", cities: [{ code: "tianjin", name: "Tianjin", longitude: 117.2 }] },
  { code: "shanghai", name: "Shanghai", cities: [{ code: "shanghai", name: "Shanghai", longitude: 121.47 }] },
  { code: "chongqing", name: "Chongqing", cities: [{ code: "chongqing", name: "Chongqing", longitude: 106.55 }] },
  { code: "hebei", name: "Hebei", cities: [{ code: "shijiazhuang", name: "Shijiazhuang", longitude: 114.51 }] },
  { code: "shanxi", name: "Shanxi", cities: [{ code: "taiyuan", name: "Taiyuan", longitude: 112.55 }] },
  { code: "liaoning", name: "Liaoning", cities: [{ code: "shenyang", name: "Shenyang", longitude: 123.43 }] },
  { code: "jilin", name: "Jilin", cities: [{ code: "changchun", name: "Changchun", longitude: 125.32 }] },
  { code: "heilongjiang", name: "Heilongjiang", cities: [{ code: "haerbin", name: "Harbin", longitude: 126.64 }] },
  { code: "jiangsu", name: "Jiangsu", cities: [{ code: "nanjing", name: "Nanjing", longitude: 118.8 }] },
  { code: "zhejiang", name: "Zhejiang", cities: [{ code: "hangzhou", name: "Hangzhou", longitude: 120.16 }] },
  { code: "anhui", name: "Anhui", cities: [{ code: "hefei", name: "Hefei", longitude: 117.23 }] },
  { code: "fujian", name: "Fujian", cities: [{ code: "fuzhou", name: "Fuzhou", longitude: 119.3 }] },
  { code: "jiangxi", name: "Jiangxi", cities: [{ code: "nanchang", name: "Nanchang", longitude: 115.86 }] },
  { code: "shandong", name: "Shandong", cities: [{ code: "jinan", name: "Jinan", longitude: 117.12 }] },
  { code: "henan", name: "Henan", cities: [{ code: "zhengzhou", name: "Zhengzhou", longitude: 113.63 }] },
  { code: "hubei", name: "Hubei", cities: [{ code: "wuhan", name: "Wuhan", longitude: 114.31 }] },
  { code: "hunan", name: "Hunan", cities: [{ code: "changsha", name: "Changsha", longitude: 112.94 }] },
  { code: "guangdong", name: "Guangdong", cities: [{ code: "guangzhou", name: "Guangzhou", longitude: 113.26 }] },
  { code: "hainan", name: "Hainan", cities: [{ code: "haikou", name: "Haikou", longitude: 110.33 }] },
  { code: "sichuan", name: "Sichuan", cities: [{ code: "chengdu", name: "Chengdu", longitude: 104.07 }] },
  { code: "guizhou", name: "Guizhou", cities: [{ code: "guiyang", name: "Guiyang", longitude: 106.63 }] },
  { code: "yunnan", name: "Yunnan", cities: [{ code: "kunming", name: "Kunming", longitude: 102.83 }] },
  { code: "shanxi2", name: "Shaanxi", cities: [{ code: "xian", name: "Xi'an", longitude: 108.94 }] },
  { code: "gansu", name: "Gansu", cities: [{ code: "lanzhou", name: "Lanzhou", longitude: 103.83 }] },
  { code: "qinghai", name: "Qinghai", cities: [{ code: "xining", name: "Xining", longitude: 101.78 }] },
  { code: "taiwan", name: "Taiwan", cities: [{ code: "taipei", name: "Taipei", longitude: 121.57 }] },
  { code: "neimenggu", name: "Inner Mongolia", cities: [{ code: "huhehaote", name: "Hohhot", longitude: 111.67 }] },
  { code: "guangxi", name: "Guangxi", cities: [{ code: "nanning", name: "Nanning", longitude: 108.37 }] },
  { code: "xizang", name: "Tibet", cities: [{ code: "lasa", name: "Lhasa", longitude: 91.13 }] },
  { code: "ningxia", name: "Ningxia", cities: [{ code: "yinchuan", name: "Yinchuan", longitude: 106.28 }] },
  { code: "xinjiang", name: "Xinjiang", cities: [{ code: "wulumuqi", name: "Urumqi", longitude: 87.62 }] },
  { code: "hongkong", name: "Hong Kong", cities: [{ code: "hongkong", name: "Hong Kong", longitude: 114.17 }] },
  { code: "macao", name: "Macao", cities: [{ code: "macao", name: "Macao", longitude: 113.54 }] },
];

/**
 * 提供省份下拉选项列表。
 */
export const getTrueSolarProvinceOptions = () =>
  TRUE_SOLAR_PROVINCES.map((item) => ({ code: item.code, name: item.name }));

/**
 * 根据省份编码获取城市选项列表。
 */
export const getTrueSolarCityOptions = (provinceCode: string) => {
  const province = TRUE_SOLAR_PROVINCES.find((item) => item.code === provinceCode) || TRUE_SOLAR_PROVINCES[0];
  return (province?.cities || []).map((city) => ({ code: city.code, name: city.name, longitude: city.longitude }));
};

/**
 * 计算指定日期在一年中的序号（1-366）。
 */
const dayOfYear = (year: number, month: number, day: number) => {
  const current = Date.UTC(year, month - 1, day);
  const start = Date.UTC(year, 0, 0);
  return Math.floor((current - start) / 86400000);
};

/**
 * 计算均时差（Equation of Time, 分钟），采用常见近似公式。
 */
const equationOfTimeMinutes = (year: number, month: number, day: number) => {
  const n = dayOfYear(year, month, day);
  const b = (2 * Math.PI * (n - 81)) / 364;
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
};

/**
 * 根据省市经度和均时差，计算真太阳时校正后的日期与时分。
 */
const computeTrueSolarCorrection = (form: ZiweiFortuneFormState): TrueSolarCorrectionResult => {
  const province = TRUE_SOLAR_PROVINCES.find((item) => item.code === form.provinceCode) || TRUE_SOLAR_PROVINCES[0];
  const city = (province?.cities || []).find((item) => item.code === form.cityCode) || (province?.cities || [])[0];

  const year = Number(form.year);
  const month = Number(form.month);
  const day = Number(form.day);
  const hour = Number(form.hour);
  const minute = Number(form.minute);
  const longitude = city?.longitude ?? 116.41;

  const eot = equationOfTimeMinutes(year, month, day);
  const longitudeOffset = 4 * (longitude - 120);
  const totalOffset = longitudeOffset + eot;
  const offsetRounded = Math.round(totalOffset);

  const rawTs = Date.UTC(year, month - 1, day, hour, minute, 0);
  const correctedTs = rawTs + offsetRounded * 60_000;
  const corrected = new Date(correctedTs);

  const correctedYear = corrected.getUTCFullYear();
  const correctedMonth = corrected.getUTCMonth() + 1;
  const correctedDay = corrected.getUTCDate();
  const correctedHour = corrected.getUTCHours();
  const correctedMinute = corrected.getUTCMinutes();

  return {
    cityName: city?.name || "Beijing",
    longitude,
    longitudeOffsetMinutes: longitudeOffset,
    equationOfTimeMinutes: eot,
    totalOffsetMinutes: totalOffset,
    correctedDate: `${correctedYear}-${pad2(correctedMonth)}-${pad2(correctedDay)}`,
    correctedHour,
    correctedMinute,
  };
};

export const validateBirthForm = (form: ZiweiFortuneFormState): string | null => {
  const yearNumber = Number(form.year);
  const monthNumber = Number(form.month);
  const dayNumber = Number(form.day);

  if ([yearNumber, monthNumber, dayNumber].some((value) => Number.isNaN(value))) {
    return "Please complete birth date and time.";
  }
  if (yearNumber < 1900 || yearNumber > 2100) {
    return "Year should be within 1900-2100.";
  }
  if (monthNumber < 1 || monthNumber > 12) {
    return "Month should be within 1-12.";
  }

  if (form.calendar === "lunar") {
    if (dayNumber < 1 || dayNumber > 30) {
      return "Lunar day should be within 1-30.";
    }
  } else {
    const temp = new Date(yearNumber, monthNumber - 1, dayNumber);
    const isValidSolarDate =
      temp.getFullYear() === yearNumber
      && temp.getMonth() === monthNumber - 1
      && temp.getDate() === dayNumber;
    if (!isValidSolarDate) {
      return "Invalid solar date. Please check year, month, and day.";
    }
  }

  if (!form.timeUnknown) {
    const hourNumber = Number(form.hour);
    const minuteNumber = Number(form.minute);
    if ([hourNumber, minuteNumber].some((value) => Number.isNaN(value))) {
      return "Please complete birth date and time.";
    }
    if (hourNumber < 0 || hourNumber > 23 || minuteNumber < 0 || minuteNumber > 59) {
      return "Invalid time. Use 24-hour format.";
    }
  }

  return null;
};

/**
 * 生成真太阳时修正说明文本，用于页面提示。
 */
export const formatTrueSolarCorrectionPreview = (form: ZiweiFortuneFormState): string => {
  if (form.timeUnknown) {
    return "Date-only mode selected. True solar time correction is off.";
  }
  if (!form.enableTrueSolar) {
    return "True solar time correction is not enabled.";
  }
  const correction = computeTrueSolarCorrection(form);
  const sign = correction.totalOffsetMinutes >= 0 ? "+" : "";
  return [
    `Correction based on ${correction.cityName} longitude ${correction.longitude.toFixed(2)}°`,
    `Longitude offset ${correction.longitudeOffsetMinutes.toFixed(1)} min, equation of time ${correction.equationOfTimeMinutes.toFixed(1)} min`,
    `Total offset ${sign}${correction.totalOffsetMinutes.toFixed(1)} min, corrected time ${correction.correctedDate} ${pad2(correction.correctedHour)}:${pad2(correction.correctedMinute)}`,
  ].join("; ");
};

export const toBirthInfo = (form: ZiweiFortuneFormState): BirthInfo => {
  const yearNumber = Number(form.year);
  const monthNumber = Number(form.month);
  const dayNumber = Number(form.day);
  let dateText = `${yearNumber}-${pad2(monthNumber)}-${pad2(dayNumber)}`;
  let hourNumber = Number(form.hour);

  if (form.timeUnknown) {
    return {
      date: dateText,
      timezone: hourToTimezone(12),
      gender: form.gender,
      calendar: form.calendar,
    };
  }

  if (form.enableTrueSolar) {
    const correction = computeTrueSolarCorrection(form);
    dateText = correction.correctedDate;
    hourNumber = correction.correctedHour;
  }

  return {
    date: dateText,
    timezone: hourToTimezone(hourNumber),
    gender: form.gender,
    calendar: form.calendar,
  };
};

export const formatBirthPreview = (form: ZiweiFortuneFormState): string => {
  const y = Number(form.year) || 0;
  const m = Number(form.month) || 0;
  const d = Number(form.day) || 0;
  const genderLabel = form.gender === "男" ? "Male" : form.gender === "女" ? "Female" : form.gender;
  if (form.timeUnknown) {
    return `${form.calendar === "lunar" ? "Lunar" : "Solar"} ${y}-${m}-${d} · Time unknown · ${genderLabel}`;
  }
  const h = Number(form.hour) || 0;
  const min = Number(form.minute) || 0;
  return `${form.calendar === "lunar" ? "Lunar" : "Solar"} ${y}-${m}-${d} ${pad2(h)}:${pad2(min)} · ${genderLabel}`;
};
