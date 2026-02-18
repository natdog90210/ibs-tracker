import { useState } from 'react';
import { ChevronLeft, ChevronRight, List, Calendar as CalendarIcon } from 'lucide-react';
import { Entry } from '../types';
import { getMonthDays, getMonthName, getDayName, formatDate } from '../utils/dateUtils';

interface HistoryScreenProps {
  entries: Record<string, Entry>;
  onDateSelect: (date: string) => void;
}

export default function HistoryScreen({ entries, onDateSelect }: HistoryScreenProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filter, setFilter] = useState<'all' | 'blocked' | 'enema' | 'noBM' | 'triggers'>('all');

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthDays = getMonthDays(currentYear, currentMonth);
  const firstDayOfWeek = monthDays[0].getDay();

  const getEntryForDate = (date: Date): Entry | undefined => {
    return entries[formatDate(date)];
  };

  const getBloatingColor = (bloating: number): string => {
    if (bloating <= 2) return 'bg-green-100';
    if (bloating <= 4) return 'bg-yellow-100';
    if (bloating <= 6) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getSortedDates = (): string[] => {
    let dates = Object.keys(entries).sort().reverse();

    if (filter === 'blocked') {
      dates = dates.filter(date => entries[date].ease === 'blocked');
    } else if (filter === 'enema') {
      dates = dates.filter(date => entries[date].laxatives.includes('enema'));
    } else if (filter === 'noBM') {
      dates = dates.filter(date => entries[date].bmCount === 0);
    } else if (filter === 'triggers') {
      dates = dates.filter(date => {
        const e = entries[date];
        return e.garlicOnion || e.highFat || e.highBreadWheat || e.alcohol > 0;
      });
    }

    return dates.slice(0, 30);
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">History</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg ${
                  viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}
              >
                <CalendarIcon size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {viewMode === 'list' && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'blocked', 'enema', 'noBM', 'triggers'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1 rounded-lg whitespace-nowrap text-sm font-medium ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {f === 'noBM' ? 'No BM' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        {viewMode === 'calendar' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft size={24} />
              </button>
              <h3 className="text-lg font-semibold">
                {getMonthName(currentMonth)} {currentYear}
              </h3>
              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array(firstDayOfWeek).fill(null).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {monthDays.map(date => {
                const entry = getEntryForDate(date);
                const dateStr = formatDate(date);
                const isToday = dateStr === formatDate(today);

                return (
                  <button
                    key={dateStr}
                    onClick={() => onDateSelect(dateStr)}
                    className={`aspect-square p-1 rounded-lg border-2 transition-all ${
                      isToday ? 'border-blue-600' : 'border-transparent'
                    } ${
                      entry
                        ? getBloatingColor(entry.bloatingPM)
                        : 'bg-white'
                    } hover:shadow-md`}
                  >
                    <div className="text-sm font-medium">{date.getDate()}</div>
                    {entry && (
                      <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                        {entry.ease === 'blocked' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        )}
                        {entry.laxatives.includes('enema') && (
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                        )}
                        {entry.bmCount === 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-semibold text-gray-600 mb-2">Legend</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600" />
                  <span>Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-600" />
                  <span>Enema</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-600" />
                  <span>No BM</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-3 bg-gradient-to-r from-green-100 via-yellow-100 to-red-100" />
                  <span>Bloating</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            {getSortedDates().map(date => {
              const entry = entries[date];
              return (
                <button
                  key={date}
                  onClick={() => onDateSelect(date)}
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold">{date}</div>
                      <div className="text-sm text-gray-600">
                        {getDayName(new Date(date + 'T00:00:00'))}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.bloatingPM <= 3 ? 'bg-green-100 text-green-800' :
                      entry.bloatingPM <= 6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Bloat: {entry.bloatingPM}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      BM: {entry.bmCount === 3 ? '3+' : entry.bmCount}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                      {entry.ease}
                    </span>
                    {entry.bristol && (
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        Bristol: {entry.bristol}
                      </span>
                    )}
                    {entry.laxatives.length > 0 && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        {entry.laxatives.join(', ')}
                      </span>
                    )}
                    {(entry.garlicOnion || entry.highFat || entry.highBreadWheat || entry.alcohol > 0) && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                        Triggers
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {getSortedDates().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No entries found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
