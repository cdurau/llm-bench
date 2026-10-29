import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '../lib/theme';
import { dateKey, weekdayShort } from '../lib/date';

export interface WeekDayPoint {
  key: string;
  done: number;
  mood?: number;
}

interface WeekChartProps {
  data: WeekDayPoint[];
}

export default function WeekChart({ data }: WeekChartProps) {
  const { resolved } = useTheme();
  const accent = resolved === 'dark' ? '#A8B584' : '#4D5B38';
  const grid = resolved === 'dark' ? 'rgba(237, 234, 228, 0.12)' : '#EAEAEA';
  const tick = resolved === 'dark' ? '#A39A8C' : '#787774';
  const tooltipBg = resolved === 'dark' ? '#1E1B17' : '#FFFFFF';
  const today = dateKey(new Date());
  const softBar = resolved === 'dark' ? 'rgba(168, 181, 132, 0.35)' : '#EDF3EC';
  const neutralBar = resolved === 'dark' ? '#3A372C' : '#E8E5DA';

  const tooltipStyle = {
    backgroundColor: tooltipBg,
    border: `1px solid ${grid}`,
    borderRadius: 12,
    fontSize: 13,
  };

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey="key"
          tickFormatter={(value) => weekdayShort(new Date(`${String(value)}T12:00:00`))}
          tick={{ fontSize: 11, fill: tick }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 'auto']}
          allowDecimals={false}
          tick={{ fontSize: 11, fill: tick }}
          axisLine={false}
          tickLine={false}
          width={20}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          contentStyle={tooltipStyle}
        />
        <Bar dataKey="done" name="Erledigte" radius={[4, 4, 0, 0]} maxBarSize={28}>
          {data.map((d) => (
            <Cell
              key={d.key}
              fill={d.done > 0 ? (d.key === today ? accent : softBar) : neutralBar}
              opacity={d.done > 0 ? 1 : 0.35}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface MoodChartProps {
  data: WeekDayPoint[];
}

export function MoodChart({ data }: MoodChartProps) {
  const { resolved } = useTheme();
  const accent = resolved === 'dark' ? '#A8B584' : '#4D5B38';
  const grid = resolved === 'dark' ? 'rgba(237, 234, 228, 0.12)' : '#EAEAEA';
  const tick = resolved === 'dark' ? '#A39A8C' : '#787774';
  const tooltipBg = resolved === 'dark' ? '#1E1B17' : '#FFFFFF';

  const moodData = data.filter((d) => d.mood !== undefined);

  if (moodData.length === 0) {
    return <p className="py-10 text-center text-sm text-muted">Noch keine Stimmungsdaten für diese Woche.</p>;
  }

  const tooltipStyle = {
    backgroundColor: tooltipBg,
    border: `1px solid ${grid}`,
    borderRadius: 12,
    fontSize: 13,
  };

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={moodData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey="key"
          tickFormatter={(value) => weekdayShort(new Date(`${String(value)}T12:00:00`))}
          tick={{ fontSize: 11, fill: tick }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          allowDecimals={false}
          tick={{ fontSize: 11, fill: tick }}
          axisLine={false}
          tickLine={false}
          width={24}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="mood"
          name="Stimmung"
          stroke={accent}
          strokeWidth={2}
          dot={{ r: 3, fill: accent, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: accent, strokeWidth: 2, stroke: tooltipBg }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}