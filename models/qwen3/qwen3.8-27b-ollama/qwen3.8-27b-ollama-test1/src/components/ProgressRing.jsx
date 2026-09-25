// A quiet progress ring: an empty track with a filled arc whose length is the
// share of completed tasks. The percentage sits in the middle.
export default function ProgressRing({ done, total, size = 66 }) {
   const share = total === 0 ? 0 : done / total
   const stroke = 6
   const r = (size - stroke) / 2
   const circumference = 2 * Math.PI * r
   const offset = circumference * (1 - share)
   const pct = Math.round(share * 100)
   const center = size / 2

   return (
        <div
          className="ring"
          style={{ width: size, height: size }}
          role="img"
          aria-label={
             total === 0
                 ? 'Keine Aufgaben'
                 : `${pct} Prozent erledigt, ${done} von ${total}`
          }
        >
           <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
               <circle
                 className="ring-track"
                 cx={center}
                 cy={center}
                 r={r}
                 strokeWidth={stroke}
                 fill="none"
              />
               <circle
                 className="ring-fill"
                 cx={center}
                 cy={center}
                 r={r}
                 strokeWidth={stroke}
                 fill="none"
                 strokeDasharray={circumference}
                 strokeDashoffset={offset}
                 strokeLinecap="round"
                 transform={`rotate(-90 ${center} ${center})`}
              />
               {total > 0 && (
                  <text
                    className="ring-label"
                    x="50%"
                    y="50%"
                    dominantBaseline="central"
                    textAnchor="middle"
                  >
                     {pct}%
                  </text>
               )}
           </svg>
        </div>
    )
}
