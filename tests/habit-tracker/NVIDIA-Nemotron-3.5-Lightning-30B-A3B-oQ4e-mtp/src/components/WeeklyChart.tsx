import React from 'react'

interface WeeklyChartProps {
  habits: any[]
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ habits }) => {
  return (
    <div>
      <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Wochen-Chart</h3>
      <p className="text-gray-400 dark:text-gray-500">
        Chart-Funktion kommt später (recharts fehlt im Build)
      </p>
    </div>
  )
}
