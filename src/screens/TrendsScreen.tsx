import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { Entry } from '../types';
import { formatDate, addDays } from '../utils/dateUtils';

interface TrendsScreenProps {
  entries: Record<string, Entry>;
}

export default function TrendsScreen({ entries }: TrendsScreenProps) {
  const [window, setWindow] = useState<7 | 14 | 30>(7);

  const getEntriesForPeriod = (days: number): Array<[string, Entry]> => {
    const today = new Date();
    const result: Array<[string, Entry]> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      if (entries[dateStr]) {
        result.push([dateStr, entries[dateStr]]);
      }
    }

    return result;
  };

  const calculateStats = (period: Array<[string, Entry]>) => {
    if (period.length === 0) {
      return {
        avgBM: 0,
        noBMPercent: 0,
        avgBloatingPM: 0,
        avgBloatingAM: 0,
        avgGas: 0,
        strongSmellPercent: 0,
        blockedPercent: 0,
        incompletePercent: 0,
        garlicPercent: 0,
        highFatPercent: 0,
        highBreadPercent: 0,
        alcoholPercent: 0,
        adhdMedsPercent: 0,
        avgCaffeine: 0,
        laxativeCount: 0,
        enemaCount: 0,
        periodPercent: 0,
        bloatingOnPeriod: 0,
        bloatingOffPeriod: 0,
      };
    }

    const total = period.length;
    let bmSum = 0;
    let noBMCount = 0;
    let bloatingPMSum = 0;
    let bloatingAMSum = 0;
    let bloatingAMCount = 0;
    let gasSum = 0;
    let strongSmellCount = 0;
    let blockedCount = 0;
    let incompleteCount = 0;
    let garlicCount = 0;
    let highFatCount = 0;
    let highBreadCount = 0;
    let alcoholCount = 0;
    let adhdMedsCount = 0;
    let caffeineSum = 0;
    let laxativeCount = 0;
    let enemaCount = 0;
    let periodCount = 0;
    let bloatingOnPeriodSum = 0;
    let bloatingOnPeriodCount = 0;
    let bloatingOffPeriodSum = 0;
    let bloatingOffPeriodCount = 0;

    period.forEach(([_, entry]) => {
      bmSum += entry.bmCount === 3 ? 3 : entry.bmCount;
      if (entry.bmCount === 0) noBMCount++;
      bloatingPMSum += entry.bloatingPM;
      if (entry.bloatingAM !== null) {
        bloatingAMSum += entry.bloatingAM;
        bloatingAMCount++;
      }
      gasSum += entry.gasSeverity;
      if (entry.gasSmell === 'strong') strongSmellCount++;
      if (entry.ease === 'blocked') blockedCount++;
      if (entry.incompleteEmptying) incompleteCount++;
      if (entry.garlicOnion) garlicCount++;
      if (entry.highFat) highFatCount++;
      if (entry.highBreadWheat) highBreadCount++;
      if (entry.alcohol > 0) alcoholCount++;
      if (entry.adhdMeds) adhdMedsCount++;
      caffeineSum += entry.caffeine === 3 ? 3 : entry.caffeine;
      laxativeCount += entry.laxatives.filter(l => l !== 'enema').length;
      if (entry.laxatives.includes('enema')) enemaCount++;

      const onPeriod = entry.periodStatus !== 'none';
      if (onPeriod) {
        periodCount++;
        bloatingOnPeriodSum += entry.bloatingPM;
        bloatingOnPeriodCount++;
      } else {
        bloatingOffPeriodSum += entry.bloatingPM;
        bloatingOffPeriodCount++;
      }
    });

    return {
      avgBM: bmSum / total,
      noBMPercent: (noBMCount / total) * 100,
      avgBloatingPM: bloatingPMSum / total,
      avgBloatingAM: bloatingAMCount > 0 ? bloatingAMSum / bloatingAMCount : 0,
      avgGas: gasSum / total,
      strongSmellPercent: (strongSmellCount / total) * 100,
      blockedPercent: (blockedCount / total) * 100,
      incompletePercent: (incompleteCount / total) * 100,
      garlicPercent: (garlicCount / total) * 100,
      highFatPercent: (highFatCount / total) * 100,
      highBreadPercent: (highBreadCount / total) * 100,
      alcoholPercent: (alcoholCount / total) * 100,
      adhdMedsPercent: (adhdMedsCount / total) * 100,
      avgCaffeine: caffeineSum / total,
      laxativeCount,
      enemaCount,
      periodPercent: (periodCount / total) * 100,
      bloatingOnPeriod: bloatingOnPeriodCount > 0 ? bloatingOnPeriodSum / bloatingOnPeriodCount : 0,
      bloatingOffPeriod: bloatingOffPeriodCount > 0 ? bloatingOffPeriodSum / bloatingOffPeriodCount : 0,
    };
  };

  const checkRedFlags = () => {
    const flags: string[] = [];
    const last30 = getEntriesForPeriod(30);
    const last14 = getEntriesForPeriod(14);

    let consecutiveNoBM = 0;
    let maxConsecutiveNoBM = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      const entry = entries[dateStr];

      if (entry && entry.bmCount === 0) {
        consecutiveNoBM++;
        maxConsecutiveNoBM = Math.max(maxConsecutiveNoBM, consecutiveNoBM);
      } else {
        consecutiveNoBM = 0;
      }
    }

    if (maxConsecutiveNoBM >= 3) {
      flags.push(`No bowel movement for ${maxConsecutiveNoBM} consecutive days`);
    }

    const enemaCount = last30.filter(([_, e]) => e.laxatives.includes('enema')).length;
    if (enemaCount >= 2) {
      flags.push(`Enema used ${enemaCount} times in last 30 days`);
    }

    const blockedCount = last30.filter(([_, e]) => e.ease === 'blocked').length;
    if (blockedCount >= 7) {
      flags.push(`Blocked feeling on ${blockedCount} days in last 30 days`);
    }

    const highBloatingCount = last14.filter(([_, e]) => e.bloatingPM >= 7).length;
    if (highBloatingCount >= 5) {
      flags.push(`Severe bloating (≥7) on ${highBloatingCount} days in last 14 days`);
    }

    return flags;
  };

  const currentStats = calculateStats(getEntriesForPeriod(window));
  const previousStats = calculateStats(
    getEntriesForPeriod(window * 2).slice(0, window)
  );

  const getTrend = (current: number, previous: number) => {
    if (Math.abs(current - previous) < 0.1) return 'stable';
    return current > previous ? 'up' : 'down';
  };

  const bloatingData = getEntriesForPeriod(30).map(([date, entry]) => ({
    date: date.slice(5),
    bloating: entry.bloatingPM,
  }));

  const bmData = getEntriesForPeriod(14).map(([date, entry]) => ({
    date: date.slice(5),
    count: entry.bmCount === 3 ? 3 : entry.bmCount,
  }));

  const redFlags = checkRedFlags();

  const StatCard = ({ label, value, trend, isPercent = false, isGood = false }: {
    label: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
    isPercent?: boolean;
    isGood?: boolean;
  }) => {
    const trendIcon = trend === 'up' ? <TrendingUp size={16} /> :
                      trend === 'down' ? <TrendingDown size={16} /> :
                      <Minus size={16} />;

    const trendColor = trend === 'stable' ? 'text-gray-500' :
                       (isGood ? (trend === 'up' ? 'text-green-600' : 'text-red-600') :
                       (trend === 'up' ? 'text-red-600' : 'text-green-600'));

    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <div className="text-sm text-gray-600 mb-1">{label}</div>
        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold">
            {value.toFixed(1)}{isPercent && '%'}
          </div>
          <div className={trendColor}>
            {trendIcon}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 py-3">
          <h2 className="text-xl font-semibold mb-3">Trends</h2>
          <div className="flex gap-2">
            {[7, 14, 30].map(days => (
              <button
                key={days}
                onClick={() => setWindow(days as 7 | 14 | 30)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  window === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {redFlags.length > 0 && (
          <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <div className="font-semibold text-red-900 mb-2">
                  Consider Medical Review
                </div>
                <ul className="space-y-1 text-sm text-red-800">
                  {redFlags.map((flag, i) => (
                    <li key={i}>• {flag}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Bowel Movements</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Avg BM Count"
              value={currentStats.avgBM}
              trend={getTrend(currentStats.avgBM, previousStats.avgBM)}
              isGood
            />
            <StatCard
              label="Days with No BM"
              value={currentStats.noBMPercent}
              trend={getTrend(currentStats.noBMPercent, previousStats.noBMPercent)}
              isPercent
            />
            <StatCard
              label="Blocked Feeling"
              value={currentStats.blockedPercent}
              trend={getTrend(currentStats.blockedPercent, previousStats.blockedPercent)}
              isPercent
            />
            <StatCard
              label="Incomplete Emptying"
              value={currentStats.incompletePercent}
              trend={getTrend(currentStats.incompletePercent, previousStats.incompletePercent)}
              isPercent
            />
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Bloating</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Avg Evening Bloating"
              value={currentStats.avgBloatingPM}
              trend={getTrend(currentStats.avgBloatingPM, previousStats.avgBloatingPM)}
            />
            {currentStats.avgBloatingAM > 0 && (
              <StatCard
                label="Avg Morning Bloating"
                value={currentStats.avgBloatingAM}
                trend={getTrend(currentStats.avgBloatingAM, previousStats.avgBloatingAM)}
              />
            )}
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Evening Bloating Trend</h3>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bloatingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="bloating" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3 text-gray-900">BM Count (14 Days)</h3>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bmData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 3]} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Gas</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Avg Gas Severity"
              value={currentStats.avgGas}
              trend={getTrend(currentStats.avgGas, previousStats.avgGas)}
            />
            <StatCard
              label="Strong Smell Days"
              value={currentStats.strongSmellPercent}
              trend={getTrend(currentStats.strongSmellPercent, previousStats.strongSmellPercent)}
              isPercent
            />
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Trigger Frequency</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Garlic/Onion"
              value={currentStats.garlicPercent}
              trend={getTrend(currentStats.garlicPercent, previousStats.garlicPercent)}
              isPercent
            />
            <StatCard
              label="High Fat"
              value={currentStats.highFatPercent}
              trend={getTrend(currentStats.highFatPercent, previousStats.highFatPercent)}
              isPercent
            />
            <StatCard
              label="High Bread/Wheat"
              value={currentStats.highBreadPercent}
              trend={getTrend(currentStats.highBreadPercent, previousStats.highBreadPercent)}
              isPercent
            />
            <StatCard
              label="Alcohol"
              value={currentStats.alcoholPercent}
              trend={getTrend(currentStats.alcoholPercent, previousStats.alcoholPercent)}
              isPercent
            />
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3 text-gray-900">Meds & Stimulants</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="ADHD Meds Days"
              value={currentStats.adhdMedsPercent}
              trend={getTrend(currentStats.adhdMedsPercent, previousStats.adhdMedsPercent)}
              isPercent
            />
            <StatCard
              label="Avg Caffeine"
              value={currentStats.avgCaffeine}
              trend={getTrend(currentStats.avgCaffeine, previousStats.avgCaffeine)}
            />
          </div>
          <div className="mt-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Laxatives Used</span>
              <span className="font-semibold">{currentStats.laxativeCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Enemas Used</span>
              <span className="font-semibold">{currentStats.enemaCount}</span>
            </div>
          </div>
        </section>

        {currentStats.periodPercent > 0 && (
          <section>
            <h3 className="font-semibold mb-3 text-gray-900">Period & Bloating</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Days on Period"
                value={currentStats.periodPercent}
                trend={getTrend(currentStats.periodPercent, previousStats.periodPercent)}
                isPercent
              />
            </div>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Avg Bloating On Period</span>
                <span className="font-semibold">{currentStats.bloatingOnPeriod.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Bloating Off Period</span>
                <span className="font-semibold">{currentStats.bloatingOffPeriod.toFixed(1)}</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
