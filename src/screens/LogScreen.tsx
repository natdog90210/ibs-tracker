import { useState } from 'react';
import { Calendar, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Entry, LaxativeType, PeriodSymptom, Settings } from '../types';
import { defaultEntry } from '../utils/storage';
import { getToday, getYesterday, getDayBefore, formatDate, addDays } from '../utils/dateUtils';

interface LogScreenProps {
  currentDate: string;
  entry: Entry;
  settings: Settings;
  onDateChange: (date: string) => void;
  onSave: (entry: Entry) => void;
  onCopyPrevious: () => void;
}

export default function LogScreen({
  currentDate,
  entry,
  settings,
  onDateChange,
  onSave,
  onCopyPrevious,
}: LogScreenProps) {
  const [formData, setFormData] = useState<Entry>(entry);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDoseNote, setShowDoseNote] = useState(entry.doseNote.length > 0);
  const [showBodySection, setShowBodySection] = useState(entry.periodStatus !== 'none' || entry.quickNote.length > 0);

  const updateField = <K extends keyof Entry>(field: K, value: Entry[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (action?: 'next' | 'prev') => {
    onSave(formData);
    if (action === 'next') {
      onDateChange(addDays(currentDate, 1));
    } else if (action === 'prev') {
      onDateChange(addDays(currentDate, -1));
    }
  };

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 py-3">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => onDateChange(getToday())}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentDate === getToday()
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => onDateChange(getYesterday())}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentDate === getYesterday()
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => onDateChange(getDayBefore())}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentDate === getDayBefore()
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Day Before
            </button>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="ml-auto p-2 bg-gray-100 rounded-lg"
            >
              <Calendar size={24} />
            </button>
          </div>

          {showDatePicker && (
            <div className="mb-3">
              <input
                type="date"
                value={currentDate}
                onChange={(e) => {
                  onDateChange(e.target.value);
                  setShowDatePicker(false);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{currentDate}</h2>
            <button
              onClick={onCopyPrevious}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg text-sm"
            >
              <Copy size={16} />
              Copy Previous
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Bowel Movement</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Count</label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map(num => (
                  <button
                    key={num}
                    onClick={() => updateField('bmCount', num as 0 | 1 | 2 | 3)}
                    className={`py-3 rounded-lg font-semibold ${
                      formData.bmCount === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {num === 3 ? '3+' : num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Ease</label>
              <div className="grid grid-cols-2 gap-2">
                {(['easy', 'effort', 'straining', 'blocked'] as const).map(ease => (
                  <button
                    key={ease}
                    onClick={() => updateField('ease', ease)}
                    className={`py-3 rounded-lg font-medium capitalize ${
                      formData.ease === ease
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {ease}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.incompleteEmptying}
                onChange={(e) => updateField('incompleteEmptying', e.target.checked)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium">Incomplete Emptying</span>
            </label>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Bristol Scale</h3>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, null].map(num => (
              <button
                key={String(num)}
                onClick={() => updateField('bristol', num as any)}
                className={`py-3 rounded-lg font-semibold ${
                  formData.bristol === num
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {num ?? '?'}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Bloating (0-10)</h3>
          <div className="space-y-3">
            {settings.trackAMBloating && (
              <div>
                <label className="block text-sm text-gray-600 mb-2">Morning</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.bloatingAM ?? 0}
                  onChange={(e) => updateField('bloatingAM', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span className="font-semibold text-blue-600 text-base">{formData.bloatingAM ?? 0}</span>
                  <span>10</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-2">Evening</label>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.bloatingPM}
                onChange={(e) => updateField('bloatingPM', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span className="font-semibold text-blue-600 text-base">{formData.bloatingPM}</span>
                <span>10</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Gas</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Severity</label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map(num => (
                  <button
                    key={num}
                    onClick={() => updateField('gasSeverity', num as 0 | 1 | 2 | 3)}
                    className={`py-3 rounded-lg font-semibold ${
                      formData.gasSeverity === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {settings.trackGasSmell && (
              <div>
                <label className="block text-sm text-gray-600 mb-2">Smell</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['normal', 'strong'] as const).map(smell => (
                    <button
                      key={smell}
                      onClick={() => updateField('gasSmell', smell)}
                      className={`py-3 rounded-lg font-medium capitalize ${
                        formData.gasSmell === smell
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {smell}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.nightGas}
                onChange={(e) => updateField('nightGas', e.target.checked)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium">Night Gas</span>
            </label>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Triggers</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.garlicOnion}
                onChange={(e) => updateField('garlicOnion', e.target.checked)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium">Garlic / Onion</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.highFat}
                onChange={(e) => updateField('highFat', e.target.checked)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium">High Fat</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.highBreadWheat}
                onChange={(e) => updateField('highBreadWheat', e.target.checked)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium">High Bread / Wheat</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.spicy}
                onChange={(e) => updateField('spicy', e.target.checked)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium">Spicy Food</span>
            </label>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Alcohol</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 0, label: 'None' },
                  { val: 1, label: '1-2' },
                  { val: 2, label: '3+' },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => updateField('alcohol', val as 0 | 1 | 2)}
                    className={`py-3 rounded-lg font-medium ${
                      formData.alcohol === val
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Meds / Stimulants</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.adhdMeds}
                onChange={(e) => updateField('adhdMeds', e.target.checked)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium">ADHD Meds</span>
            </label>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Caffeine</label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map(num => (
                  <button
                    key={num}
                    onClick={() => updateField('caffeine', num as 0 | 1 | 2 | 3)}
                    className={`py-3 rounded-lg font-semibold ${
                      formData.caffeine === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {num === 3 ? '3+' : num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Laxatives</label>
              <div className="space-y-2">
                {(['macrogol', 'stimulant', 'enema'] as LaxativeType[]).map(type => (
                  <label key={type} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.laxatives.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateField('laxatives', [...formData.laxatives, type]);
                        } else {
                          updateField('laxatives', formData.laxatives.filter(l => l !== type));
                        }
                      }}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-medium capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {!showDoseNote && (
              <button
                onClick={() => setShowDoseNote(true)}
                className="text-sm text-blue-600 font-medium"
              >
                Add dose note
              </button>
            )}

            {showDoseNote && (
              <div>
                <label className="block text-sm text-gray-600 mb-2">Dose Note</label>
                <input
                  type="text"
                  maxLength={80}
                  value={formData.doseNote}
                  onChange={(e) => updateField('doseNote', e.target.value)}
                  placeholder="e.g., 2 sachets morning"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Mood</h3>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                onClick={() => updateField('mood', num as 1 | 2 | 3 | 4 | 5)}
                className={`py-4 rounded-lg text-3xl ${
                  formData.mood === num
                    ? 'bg-blue-600'
                    : 'bg-gray-100'
                }`}
              >
                {moodEmojis[num - 1]}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mt-3">
            <input
              type="checkbox"
              checked={formData.grossBody}
              onChange={(e) => updateField('grossBody', e.target.checked)}
              className="w-5 h-5 text-blue-600"
            />
            <span className="font-medium">Feeling Gross in Body</span>
          </label>
        </section>

        <section>
          <button
            onClick={() => setShowBodySection(!showBodySection)}
            className="flex items-center justify-between w-full p-3 bg-gray-100 rounded-lg font-semibold"
          >
            <span>Body / Cycle (Optional)</span>
            {showBodySection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showBodySection && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Period Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['none', 'spotting', 'light', 'medium', 'heavy'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => updateField('periodStatus', status)}
                      className={`py-3 rounded-lg font-medium capitalize text-sm ${
                        formData.periodStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Period Symptoms</label>
                <div className="space-y-2">
                  {([
                    { key: 'cramps', label: 'Cramps' },
                    { key: 'breastTenderness', label: 'Breast Tenderness' },
                    { key: 'headache', label: 'Headache' },
                    { key: 'lowEnergy', label: 'Low Energy' },
                    { key: 'pmsMood', label: 'PMS Mood' },
                    { key: 'hormonalBloating', label: 'Hormonal Bloating' },
                  ] as const).map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                      <input
                        type="checkbox"
                        checked={formData.periodSymptoms.includes(key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateField('periodSymptoms', [...formData.periodSymptoms, key]);
                          } else {
                            updateField('periodSymptoms', formData.periodSymptoms.filter(s => s !== key));
                          }
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Quick Note</label>
                <textarea
                  maxLength={160}
                  value={formData.quickNote}
                  onChange={(e) => updateField('quickNote', e.target.value)}
                  placeholder="Any other notes..."
                  className="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none"
                />
                <div className="text-xs text-gray-500 text-right mt-1">
                  {formData.quickNote.length}/160
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="space-y-2 pt-4">
          <button
            onClick={() => handleSave()}
            className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg text-lg"
          >
            Save
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSave('prev')}
              className="py-3 bg-gray-100 text-gray-700 font-medium rounded-lg"
            >
              Save & Previous Day
            </button>
            <button
              onClick={() => handleSave('next')}
              className="py-3 bg-gray-100 text-gray-700 font-medium rounded-lg"
            >
              Save & Next Day
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
