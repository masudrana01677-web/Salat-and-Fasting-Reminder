/**
 * Astronomical Prayer Time & Qibla Calculations
 * Based on authentic solar calculations (Solar declination, equation of time, Julian Day)
 * Equivalent to Adhan-java algorithms.
 */

export interface LocationCoordinates {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export type CalculationMethod =
  | 'MWL' // Muslim World League
  | 'ISNA' // Islamic Society of North America
  | 'EGYPT' // Egyptian General Authority of Survey
  | 'MAKKAH' // Umm al-Qura University, Makkah
  | 'KARACHI' // Univ. of Islamic Sciences, Karachi
  | 'SINGAPORE' // MUIS Singapore
  | 'TEHRAN'; // Institute of Geophysics, Tehran

export type AsrMethod = 'STANDARD' | 'HANAFI';

export interface PrayerAdjustment {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export interface PrayerTimesResult {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  sunset: Date;
  maghrib: Date;
  isha: Date;
  midnight: Date;
  tahajjud: Date;
}

// Famous default locations
export const PRESET_CITIES: LocationCoordinates[] = [
  { name: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.4125, timezone: 'Asia/Dhaka' },
  { name: 'Chittagong', country: 'Bangladesh', latitude: 22.3569, longitude: 91.7832, timezone: 'Asia/Dhaka' },
  { name: 'Sylhet', country: 'Bangladesh', latitude: 24.8949, longitude: 91.8687, timezone: 'Asia/Dhaka' },
  { name: 'Makkah', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh' },
  { name: 'Madinah', country: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692, timezone: 'Asia/Riyadh' },
  { name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
  { name: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
  { name: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, timezone: 'Asia/Jakarta' },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' },
];

// Calculation method parameters: [fajrAngle, ishaAngle, ishaIntervalMinutes (0 if angle used)]
const METHOD_PARAMS: Record<CalculationMethod, { fajrAngle: number; ishaAngle: number; ishaInterval: number }> = {
  MWL: { fajrAngle: 18.0, ishaAngle: 17.0, ishaInterval: 0 },
  ISNA: { fajrAngle: 15.0, ishaAngle: 15.0, ishaInterval: 0 },
  EGYPT: { fajrAngle: 19.5, ishaAngle: 17.5, ishaInterval: 0 },
  MAKKAH: { fajrAngle: 18.5, ishaAngle: 0, ishaInterval: 90 }, // 90 min after Maghrib (120 in Ramadan)
  KARACHI: { fajrAngle: 18.0, ishaAngle: 18.0, ishaInterval: 0 },
  SINGAPORE: { fajrAngle: 20.0, ishaAngle: 18.0, ishaInterval: 0 },
  TEHRAN: { fajrAngle: 17.7, ishaAngle: 14.0, ishaInterval: 0 },
};

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180.0;
}

function toDegrees(radians: number): number {
  return (radians * 180.0) / Math.PI;
}

function fixHour(hour: number): number {
  let a = hour - 24.0 * Math.floor(hour / 24.0);
  return a < 0 ? a + 24.0 : a;
}

/**
 * Calculates prayer times for a given date, coordinates and preferences
 */
export function calculatePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  method: CalculationMethod = 'KARACHI',
  asrMethod: AsrMethod = 'HANAFI',
  adjustments: PrayerAdjustment = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }
): PrayerTimesResult {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Julian Date
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  const d = jd - 2451545.0;

  // Sun's mean anomaly
  const g = 357.529 + 0.98560028 * d;
  const q = 280.459 + 0.98564736 * d;
  const l = q + 1.915 * Math.sin(toRadians(g)) + 0.02 * Math.sin(toRadians(2 * g));

  // Sun's declination
  const e = 23.439 - 0.00000036 * d;
  const sinDecl = Math.sin(toRadians(e)) * Math.sin(toRadians(l));
  const decl = toDegrees(Math.asin(sinDecl));

  // Equation of time (in hours)
  const ra = toDegrees(Math.atan2(Math.cos(toRadians(e)) * Math.sin(toRadians(l)), Math.cos(toRadians(l)))) / 15.0;
  const eqt = q / 15.0 - fixHour(ra);

  // Solar noon
  const noon = fixHour(12.0 - eqt - lng / 15.0 + date.getTimezoneOffset() / -60.0);

  // Hour angle helper
  const hourAngle = (angle: number): number => {
    const cosHA =
      (Math.sin(toRadians(-angle)) - Math.sin(toRadians(lat)) * Math.sin(toRadians(decl))) /
      (Math.cos(toRadians(lat)) * Math.cos(toRadians(decl)));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return 12;
    return toDegrees(Math.acos(cosHA)) / 15.0;
  };

  // Asr hour angle calculation
  const asrFactor = asrMethod === 'HANAFI' ? 2 : 1;
  const asrAngle = toDegrees(
    Math.atan(1.0 / (asrFactor + Math.tan(toRadians(Math.abs(lat - decl)))))
  );
  const asrHA = hourAngle(-asrAngle);

  const params = METHOD_PARAMS[method] || METHOD_PARAMS.KARACHI;

  const fajrHA = hourAngle(params.fajrAngle);
  const sunriseHA = hourAngle(0.833);
  const sunsetHA = hourAngle(0.833);
  const ishaHA = params.ishaInterval > 0 ? 0 : hourAngle(params.ishaAngle);

  const fajrHour = noon - fajrHA;
  const sunriseHour = noon - sunriseHA;
  const dhuhrHour = noon;
  const asrHour = noon + asrHA;
  const sunsetHour = noon + sunsetHA;
  const maghribHour = sunsetHour;
  const ishaHour = params.ishaInterval > 0 ? maghribHour + params.ishaInterval / 60.0 : noon + ishaHA;

  const toDate = (hour: number, offsetMinutes = 0): Date => {
    const res = new Date(date);
    const totalMinutes = hour * 60 + offsetMinutes;
    const h = Math.floor(totalMinutes / 60);
    const m = Math.floor(totalMinutes % 60);
    const s = Math.floor((totalMinutes * 60) % 60);
    res.setHours(h, m, s, 0);
    return res;
  };

  const fajr = toDate(fajrHour, adjustments.fajr);
  const sunrise = toDate(sunriseHour, 0);
  const dhuhr = toDate(dhuhrHour, adjustments.dhuhr);
  const asr = toDate(asrHour, adjustments.asr);
  const sunset = toDate(sunsetHour, 0);
  const maghrib = toDate(maghribHour, adjustments.maghrib);
  const isha = toDate(ishaHour, adjustments.isha);

  // Midnight (Islamic midpoint between Sunset and next Fajr)
  const nextFajr = new Date(fajr.getTime() + 24 * 60 * 60 * 1000);
  const nightDuration = nextFajr.getTime() - sunset.getTime();
  const midnight = new Date(sunset.getTime() + nightDuration / 2);
  const tahajjud = new Date(sunset.getTime() + (nightDuration * 2) / 3);

  return {
    fajr,
    sunrise,
    dhuhr,
    asr,
    sunset,
    maghrib,
    isha,
    midnight,
    tahajjud,
  };
}

/**
 * Calculates Qibla direction (bearing in degrees from True North)
 * and distance to the Kaaba in kilometers
 */
export function calculateQibla(latitude: number, longitude: number): { bearing: number; distanceKm: number } {
  // Kaaba coordinates
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;

  const phi1 = toRadians(latitude);
  const phi2 = toRadians(kaabaLat);
  const deltaLambda = toRadians(kaabaLng - longitude);

  // Forward azimuth formula
  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);
  let qiblaBearing = toDegrees(Math.atan2(y, x));
  qiblaBearing = (qiblaBearing + 360) % 360;

  // Great circle distance (Haversine formula)
  const earthRadius = 6371; // km
  const dLat = toRadians(kaabaLat - latitude);
  const dLng = toRadians(kaabaLng - longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(earthRadius * c);

  return {
    bearing: Math.round(qiblaBearing),
    distanceKm,
  };
}

/**
 * Accurate Hijri date calculation based on Umm al-Qura astronomical epoch
 */
export function getHijriDate(date: Date, offsetDays = 0): { day: number; month: number; monthName: string; monthNameBn: string; year: number } {
  const adjusted = new Date(date);
  if (offsetDays !== 0) {
    adjusted.setDate(adjusted.getDate() + offsetDays);
  }

  // Simplified Ku-waiti / Umm al-Qura algorithm for Hijri calendar
  let day = adjusted.getDate();
  let month = adjusted.getMonth();
  let year = adjusted.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
  let bjd = jd - 1948440 + 10632;
  let n = Math.floor((bjd - 1) / 10631);
  bjd = bjd - 10631 * n + 354;
  let j = (Math.floor((10985 - bjd) / 5316)) * (Math.floor((50 * bjd) / 17719)) + (Math.floor(bjd / 5670)) * (Math.floor((43 * bjd) / 15238));
  bjd = bjd - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  let hMonth = Math.floor((24 * bjd) / 709);
  let hDay = bjd - Math.floor((709 * hMonth) / 24);
  let hYear = 30 * n + j - 30;

  const ISLAMIC_MONTHS = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];

  const ISLAMIC_MONTHS_BN = [
    'মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি',
    'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শা\'বান',
    'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ্জ'
  ];

  const mIdx = Math.max(0, Math.min(11, hMonth - 1));

  return {
    day: hDay,
    month: hMonth,
    monthName: ISLAMIC_MONTHS[mIdx] || 'Ramadan',
    monthNameBn: ISLAMIC_MONTHS_BN[mIdx] || 'রমজান',
    year: hYear,
  };
}

/**
 * Format time helper: returns "5:31 AM" or "05:31"
 */
export function formatTime(date: Date, use24Hour = false): string {
  if (use24Hour) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Formats seconds into HH:MM:SS
 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00:00';
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}
