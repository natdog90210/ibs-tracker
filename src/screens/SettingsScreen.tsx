import { useState, useRef } from 'react';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { AppData, Settings } from '../types';
import { exportJSON, exportCSV, importJSON } from '../utils/storage';

interface SettingsScreenProps {
  appData: AppData;
  onSettingsChange: (settings: Settings) => void;
  onImport: (data: AppData) => void;
  onClearAll: () => void;
}

export default function SettingsScreen({
  appData,
  onSettingsChange,
  onImport,
  onClearAll,
}: SettingsScreenProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportMode, setShowImportMode] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const entryCount = Object.keys(appData.entries).length;
  const lastSaved = appData.lastSavedAt
    ? new Date(appData.lastSavedAt).toLocaleString()
    : 'Never';

  const handleExportJSON = () => {
    exportJSON(appData);
  };

  const handleExportCSV = () => {
    exportCSV(appData);
  };

  const handleImportClick = () => {
    setShowImportMode(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importJSON(file, importMode);
      onImport(imported);
      setShowImportMode(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert('Error importing file. Please check the file format.');
      console.error(error);
    }
  };

  const handleClearAll = () => {
    onClearAll();
    setShowClearConfirm(false);
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 py-3">
          <h2 className="text-xl font-semibold">Settings</h2>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Tracking Options</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium">Track Morning Bloating</div>
                <div className="text-sm text-gray-600">Add AM bloating field to log screen</div>
              </div>
              <input
                type="checkbox"
                checked={appData.settings.trackAMBloating}
                onChange={(e) =>
                  onSettingsChange({
                    ...appData.settings,
                    trackAMBloating: e.target.checked,
                  })
                }
                className="w-5 h-5 text-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium">Track Gas Smell</div>
                <div className="text-sm text-gray-600">Show gas smell field</div>
              </div>
              <input
                type="checkbox"
                checked={appData.settings.trackGasSmell}
                onChange={(e) =>
                  onSettingsChange({
                    ...appData.settings,
                    trackGasSmell: e.target.checked,
                  })
                }
                className="w-5 h-5 text-blue-600"
              />
            </label>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Data Management</h3>
          <div className="space-y-3">
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="text-blue-600" size={24} />
              <div className="text-left flex-1">
                <div className="font-medium">Download JSON Backup</div>
                <div className="text-sm text-gray-600">Full backup with all data</div>
              </div>
            </button>

            <button
              onClick={handleExportCSV}
              className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="text-blue-600" size={24} />
              <div className="text-left flex-1">
                <div className="font-medium">Download CSV Export</div>
                <div className="text-sm text-gray-600">Spreadsheet format for analysis</div>
              </div>
            </button>

            {!showImportMode ? (
              <button
                onClick={handleImportClick}
                className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="text-blue-600" size={24} />
                <div className="text-left flex-1">
                  <div className="font-medium">Import JSON Backup</div>
                  <div className="text-sm text-gray-600">Restore from backup file</div>
                </div>
              </button>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium mb-3">Import Mode</div>
                <div className="space-y-2 mb-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium">Merge</div>
                      <div className="text-sm text-gray-600">
                        Keep existing data, add new entries
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium">Replace All</div>
                      <div className="text-sm text-gray-600">
                        Delete existing data and replace with import
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg"
                  >
                    Choose File
                  </button>
                  <button
                    onClick={() => setShowImportMode(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg"
                  >
                    Cancel
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full flex items-center gap-3 p-4 bg-white border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="text-red-600" size={24} />
                <div className="text-left flex-1">
                  <div className="font-medium text-red-900">Clear All Data</div>
                  <div className="text-sm text-red-700">Permanently delete all entries</div>
                </div>
              </button>
            ) : (
              <div className="p-4 bg-red-50 border-2 border-red-600 rounded-lg">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <div className="font-semibold text-red-900 mb-1">
                      Are you absolutely sure?
                    </div>
                    <div className="text-sm text-red-800">
                      This will permanently delete all {entryCount} entries. This action cannot be
                      undone. Consider downloading a backup first.
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearAll}
                    className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Data Summary</h3>
          <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Entries</span>
              <span className="font-semibold">{entryCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Saved</span>
              <span className="font-semibold text-sm">{lastSaved}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data Version</span>
              <span className="font-semibold">{appData.version}</span>
            </div>
          </div>
        </section>

        <section className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2 text-gray-900 text-sm">About This App</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            This app helps you track digestive symptoms, identify triggers, and monitor patterns.
            All data is stored locally on your device and never sent to any server. Regular
            backups are recommended.
          </p>
        </section>
      </div>
    </div>
  );
}
