import { useState, useEffect } from 'react';
import { Screen, Entry, AppData, Settings } from './types';
import { loadData, saveData, defaultEntry, clearAllData } from './utils/storage';
import { getToday } from './utils/dateUtils';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import LogScreen from './screens/LogScreen';
import HistoryScreen from './screens/HistoryScreen';
import TrendsScreen from './screens/TrendsScreen';
import SettingsScreen from './screens/SettingsScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('log');
  const [appData, setAppData] = useState<AppData>(loadData());
  const [currentDate, setCurrentDate] = useState<string>(getToday());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    saveData(appData);
  }, [appData]);

  const getCurrentEntry = (): Entry => {
    if (appData.entries[currentDate]) {
      return appData.entries[currentDate];
    }
    return { ...defaultEntry, date: currentDate };
  };

  const handleSaveEntry = (entry: Entry) => {
    setAppData(prev => ({
      ...prev,
      entries: {
        ...prev.entries,
        [currentDate]: entry,
      },
    }));
    setToast('Entry saved successfully!');
  };

  const handleDateChange = (date: string) => {
    setCurrentDate(date);
    setCurrentScreen('log');
  };

  const handleCopyPrevious = () => {
    const dates = Object.keys(appData.entries)
      .filter(d => d < currentDate)
      .sort();

    if (dates.length === 0) {
      setToast('No previous entries to copy');
      return;
    }

    const previousDate = dates[dates.length - 1];
    const previousEntry = appData.entries[previousDate];

    const copiedEntry: Entry = {
      ...previousEntry,
      date: currentDate,
    };

    handleSaveEntry(copiedEntry);
    setToast('Copied from previous day');
  };

  const handleSettingsChange = (settings: Settings) => {
    setAppData(prev => ({
      ...prev,
      settings,
    }));
  };

  const handleImport = (imported: AppData) => {
    setAppData(imported);
    saveData(imported);
    setToast('Data imported successfully!');
  };

  const handleClearAll = () => {
    clearAllData();
    const freshData = loadData();
    setAppData(freshData);
    setToast('All data cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative">
      {currentScreen === 'log' && (
        <LogScreen
          currentDate={currentDate}
          entry={getCurrentEntry()}
          settings={appData.settings}
          onDateChange={handleDateChange}
          onSave={handleSaveEntry}
          onCopyPrevious={handleCopyPrevious}
        />
      )}

      {currentScreen === 'history' && (
        <HistoryScreen
          entries={appData.entries}
          onDateSelect={handleDateChange}
        />
      )}

      {currentScreen === 'trends' && (
        <TrendsScreen entries={appData.entries} />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          appData={appData}
          onSettingsChange={handleSettingsChange}
          onImport={handleImport}
          onClearAll={handleClearAll}
        />
      )}

      <BottomNav current={currentScreen} onChange={setCurrentScreen} />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
