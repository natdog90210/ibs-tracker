export type LaxativeType = 'macrogol' | 'stimulant' | 'enema';
export type PeriodStatus = 'none' | 'spotting' | 'heavy' | 'medium' | 'light';
export type PeriodSymptom = 'cramps' | 'breastTenderness' | 'headache' | 'lowEnergy' | 'pmsMood' | 'hormonalBloating';

export interface Entry {
  date: string;
  bmCount: 0 | 1 | 2 | 3;
  ease: 'easy' | 'effort' | 'straining' | 'blocked';
  incompleteEmptying: boolean;
  bristol: 1 | 2 | 3 | 4 | 5 | 6 | 7 | null;
  bloatingAM: number | null;
  bloatingPM: number;
  gasSeverity: 0 | 1 | 2 | 3;
  gasSmell: 'normal' | 'strong';
  nightGas: boolean;
  garlicOnion: boolean;
  highFat: boolean;
  highBreadWheat: boolean;
  alcohol: 0 | 1 | 2;
  spicy: boolean;
  adhdMeds: boolean;
  caffeine: 0 | 1 | 2 | 3;
  laxatives: LaxativeType[];
  doseNote: string;
  mood: 1 | 2 | 3 | 4 | 5;
  grossBody: boolean;
  periodStatus: PeriodStatus;
  periodSymptoms: PeriodSymptom[];
  quickNote: string;
}

export interface Settings {
  trackAMBloating: boolean;
  trackGasSmell: boolean;
}

export interface AppData {
  version: number;
  settings: Settings;
  entries: Record<string, Entry>;
  lastSavedAt: string | null;
}

export type Screen = 'log' | 'history' | 'trends' | 'settings';
