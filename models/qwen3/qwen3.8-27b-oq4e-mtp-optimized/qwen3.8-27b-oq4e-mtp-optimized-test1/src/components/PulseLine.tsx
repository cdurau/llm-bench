/**
 * Die Pulslinie: schmale EKG-Linie, deren durchgezogener Teil (0–100)
 * dem Tagesfortschritt entspricht. Dekorativer Zusatz zur Zahlen-Anzeige,
 * daher `aria-hidden` – der Wert steht in der Statistikzeile.
 */
export function PulseLine({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  // pathLength=100 → Dashoffset ist direkt das Prozent (ohne Messung).
  return (
    <svg
      className="pulse"
      viewBox="0 0 240 44"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="pulse__base"
        d="M0 26 H68 Q76 19 84 26 H98 L106 6 L116 40 L124 26 H138 Q146 19 154 26 H240"
        pathLength={100}
      />
      <path
        className="pulse__overlay"
        d="M0 26 H68 Q76 19 84 26 H98 L106 6 L116 40 L124 26 H138 Q146 19 154 26 H240"
        pathLength={100}
        strokeDasharray="100"
        strokeDashoffset={100 - clamped}
      />
    </svg>
  );
}
