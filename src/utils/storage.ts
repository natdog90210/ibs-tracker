import { AppData, Entry, Settings } from '../types';

const STORAGE_KEY = 'ibs-tracker-data';
const CURRENT_VERSION = 1;

const defaultSettings: Settings = {
  trackAMBloating: false,
  trackGasSmell: true,
};

export const defaultEntry: Omit<Entry, 'date'> = {
  bmCount: 0,
  ease: 'easy',
  incompleteEmptying: false,
  bristol: null,
  bloatingAM: null,
  bloatingPM: 3,
  gasSeverity: 1,
  gasSmell: 'normal',
  nightGas: false,
  garlicOnion: false,
  highFat: false,
  highBreadWheat: false,
  alcohol: 0,
  spicy: false,
  adhdMeds: false,
  caffeine: 0,
  laxatives: [],
  doseNote: '',
  mood: 3,
  grossBody: false,
  periodStatus: 'none',
  periodSymptoms: [],
  quickNote: '',
};

export function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as AppData;
      return {
        version: data.version || CURRENT_VERSION,
        settings: { ...defaultSettings, ...data.settings },
        entries: data.entries || {},
        lastSavedAt: data.lastSavedAt || null,
      };
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }

  return {
    version: CURRENT_VERSION,
    settings: defaultSettings,
    entries: {},
    lastSavedAt: null,
  };
}

export function saveData(data: AppData): void {
  try {
    const toSave = {
      ...data,
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportJSON(data: AppData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ibs-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCSV(data: AppData): void {
  const dates = Object.keys(data.entries).sort();

  const headers = [
    'date',
    'bmCount',
    'ease',
    'incompleteEmptying',
    'bristol',
    'bloatingAM',
    'bloatingPM',
    'gasSeverity',
    'gasSmell',
    'nightGas',
    'garlicOnion',
    'highFat',
    'highBreadWheat',
    'alcohol',
    'spicy',
    'adhdMeds',
    'caffeine',
    'laxatives',
    'doseNote',
    'mood',
    'grossBody',
    'periodStatus',
    'periodSymptoms',
    'quickNote',
  ];

  const rows = dates.map(date => {
    const entry = data.entries[date];
    return [
      date,
      entry.bmCount,
      entry.ease,
      entry.incompleteEmptying,
      entry.bristol ?? '',
      entry.bloatingAM ?? '',
      entry.bloatingPM,
      entry.gasSeverity,
      entry.gasSmell,
      entry.nightGas,
      entry.garlicOnion,
      entry.highFat,
      entry.highBreadWheat,
      entry.alcohol,
      entry.spicy,
      entry.adhdMeds,
      entry.caffeine,
      entry.laxatives.join(';'),
      entry.doseNote,
      entry.mood,
      entry.grossBody,
      entry.periodStatus,
      entry.periodSymptoms.join(';'),
      entry.quickNote,
    ].map(val => {
      const str = String(val);
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ibs-tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importJSON(file: File, mode: 'replace' | 'merge'): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as AppData;

        if (mode === 'replace') {
          resolve(imported);
        } else {
          const current = loadData();
          resolve({
            ...imported,
            entries: {
              ...current.entries,
              ...imported.entries,
            },
          });
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
