import type { Recommendation } from "@/lib/types";

/** Mapa „wpływ × wysiłek”. Numerowane kropki to trzy pierwsze rekomendacje. */
export function Matrix({ recs }: { recs: Recommendation[] }) {
  const W = 680, H = 300, l = 64, r = 24, t = 28, b = 48;
  const maxM = Math.max(...recs.map((x) => x.moneyPerMonth), 1);
  const X = (e: number) => l + ((e - 0.5) / 3) * (W - l - r);
  const Y = (m: number) => t + (1 - (m / maxM) * 0.9) * (H - t - b);
  const midX = X(1.5), midY = t + (H - t - b) / 2;
  const perEffort: Record<number, number> = {};
  return (
    <svg className="matrix" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mapa wpływ i wysiłek">
      <rect x={l} y={t} width={midX - l} height={midY - t} fill="var(--accent-soft)" />
      <text x={l + 10} y={t + 18} fontSize="12" fontWeight="600" fill="var(--accent)">Szybkie wygrane</text>
      <text x={W - r - 10} y={t + 18} fontSize="12" textAnchor="end" fill="var(--muted)">Duże projekty</text>
      <text x={l + 10} y={H - b - 10} fontSize="12" fill="var(--muted)">Drobne usprawnienia</text>
      <line x1={l} y1={H - b} x2={W - r} y2={H - b} stroke="var(--line)" />
      <line x1={l} y1={t} x2={l} y2={H - b} stroke="var(--line)" />
      <line x1={midX} y1={t} x2={midX} y2={H - b} stroke="var(--line)" strokeDasharray="3 4" />
      <line x1={l} y1={midY} x2={W - r} y2={midY} stroke="var(--line)" strokeDasharray="3 4" />
      {[1, 2, 3].map((e) => (
        <text key={e} x={X(e)} y={H - b + 18} textAnchor="middle" fontSize="11" fill="var(--muted)">
          {["", "mały", "średni", "duży"][e]}
        </text>
      ))}
      <text x={(l + W - r) / 2} y={H - 8} textAnchor="middle" fontSize="12" fill="var(--muted)">Wysiłek wdrożenia</text>
      <text x={16} y={(t + H - b) / 2} fontSize="12" fill="var(--muted)" textAnchor="middle" transform={`rotate(-90 16 ${(t + H - b) / 2})`}>
        Oszczędność / mies.
      </text>
      {recs.map((x, i) => {
        perEffort[x.effort] = (perEffort[x.effort] ?? 0) + 1;
        const cx = X(x.effort) + (perEffort[x.effort] - 1) * 22 - 22;
        const cy = Y(x.moneyPerMonth);
        const top = i < 3;
        return (
          <g key={x.area + x.taskId}>
            <circle cx={cx} cy={cy} r={top ? 9 : 6} fill={top ? "var(--accent)" : "var(--surface)"} stroke="var(--accent)" strokeWidth="1.5" />
            {top && (
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontFamily="var(--mono)" fill="var(--accent-ink)">
                {i + 1}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
