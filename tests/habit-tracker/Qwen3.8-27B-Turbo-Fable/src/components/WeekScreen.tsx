import { useState, useEffect } from 'react';
import { getHabits, getCompletionsForDate } from '../db';

function WeekScreen() {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadWeekData();
  }, []);

  async function loadWeekData() {
    const habits = await getHabits();
    const today = new Date();
    const data: any[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      let completedCount = 0;
      for (const habit of habits) {
        const completions = await getCompletionsForDate(dateStr);
        if (completions.some((c) => c.habitId === habit.id)) {
          completedCount++;
        }
      }

      const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
      data.push({
        date: dayNames[date.getDay()],
        completions: completedCount,
      });
    }

    setChartData(data);
  }

  const maxCompletions = Math.max(...chartData.map((d) => d.completions), 1);
  const barWidth = 30;
  const chartHeight = 200;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Woche</h1>

      <div data-testid="week-chart" className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${barWidth * 7 + 40} ${chartHeight}`}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4, 5].map((y) => (
            <line
              key={`grid-${y}`}
              x1="20"
              y1={chartHeight - (y / 5) * chartHeight}
              x2={barWidth * 7 + 40}
              y2={chartHeight - (y / 5) * chartHeight}
              stroke="#EAEAEA"
              strokeWidth="1"
            />
          ))}

          {/* Bars */}
          {chartData.map((d, i) => {
            const barHeight = (d.completions / maxCompletions) * chartHeight;
            return (
              <g key={i}>
                <rect
                  x={20 + i * (barWidth + 10)}
                  y={chartHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill="#3B82F6"
                  rx="4"
                />
                <text
                  x={20 + i * (barWidth + 10) + barWidth / 2}
                  y={chartHeight + 15}
                  textAnchor="middle"
                  fill="#787774"
                  fontSize="12"
                >
                  {d.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
        Erledigte Habits pro Tag in den letzten 7 Tagen.
      </p>
    </div>
  );
}

export default WeekScreen;
