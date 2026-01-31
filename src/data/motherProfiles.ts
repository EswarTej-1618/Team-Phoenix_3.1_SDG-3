/**
 * Mother sign-up profile and chronic conditions.
 * Stored in localStorage for demo (no backend). Password stored in plain for demo only.
 */

export const CHRONIC_CONDITIONS = [
  "Diabetes (Type 2)",
  "Hypertension (High Blood Pressure)",
  "Heart Disease (Cardiovascular Disease)",
  "Thyroid Disorders",
  "Osteoporosis",
  "Asthma",
  "Chronic Respiratory Disease (COPD)",
  "Depression",
  "Anxiety Disorders",
  "Polycystic Ovary Syndrome (PCOS)",
  "Obesity",
  "Arthritis (Rheumatoid Arthritis)",
] as const;

export type ChronicConditionOption = (typeof CHRONIC_CONDITIONS)[number];

/** Optional vitals the mother can enter/edit in profile (in addition to Live Vitals) */
export interface ProfileVitals {
  weightKg?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  hemoglobin?: number;
  bloodSugarMgDl?: number;
  heartRateBpm?: number;
  spo2Percent?: number;
}

export interface MotherSignupProfile {
  id: string;
  name: string;
  email: string;
  /** Stored in plain for demo only; do not use in production */
  password: string;
  age: number;
  gestationWeek: number;
  bloodGroup: string;
  /** 1 = first pregnancy, 2 = second, etc. */
  pregnancyNumber: number;
  chronicConditions: string[];
  /** Other condition not in the list */
  otherCondition: string;
  onMedication: boolean;
  medicationNames: string;
  /** Optional vitals entered/edited in profile */
  vitals?: ProfileVitals;
  createdAt: string;
}

const STORAGE_KEY = "safemom_mother_profiles";

function loadAll(): Record<string, MotherSignupProfile> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(profiles: Record<string, MotherSignupProfile>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function getMotherProfileByEmail(email: string): MotherSignupProfile | null {
  const key = email.trim().toLowerCase();
  return loadAll()[key] ?? null;
}

export function getMotherProfileById(id: string): MotherSignupProfile | null {
  const all = loadAll();
  return Object.values(all).find((p) => p.id === id) ?? null;
}

export function saveMotherProfile(profile: MotherSignupProfile): void {
  const all = loadAll();
  const key = profile.email.trim().toLowerCase();
  all[key] = profile;
  saveAll(all);
}

export function verifyMotherPassword(email: string, password: string): boolean {
  const p = getMotherProfileByEmail(email);
  return !!p && p.password === password;
}

/** Vitals history for report generation (per user) */
const VITALS_HISTORY_KEY_PREFIX = "safemom_vitals_history_";

export interface VitalsHistoryEntry {
  timestamp: string;
  vitalsSummary: string;
  riskLevel?: string;
}

export function getVitalsHistory(userId: string): VitalsHistoryEntry[] {
  try {
    const raw = localStorage.getItem(VITALS_HISTORY_KEY_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function appendVitalsHistory(userId: string, entry: VitalsHistoryEntry): void {
  const list = getVitalsHistory(userId);
  list.unshift(entry);
  localStorage.setItem(VITALS_HISTORY_KEY_PREFIX + userId, JSON.stringify(list.slice(0, 50)));
}
