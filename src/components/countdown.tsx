import { useEffect, useState } from "react";

export function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now == null) return null;
  const diff = Math.max(0, new Date(to).getTime() - now);
  const d = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000) % 24, m = Math.floor(diff / 60000) % 60, s = Math.floor(diff / 1000) % 60;
  const cells = [["days", d], ["hrs", h], ["min", m], ["sec", s]] as const;
  return (
    <div className="flex gap-4" aria-label="Time until launch">
      {cells.map(([l, v]) => (
        <div key={l}>
          <div className="tabular text-3xl font-medium">{String(v).padStart(2, "0")}</div>
          <div className="eyebrow">{l}</div>
        </div>
      ))}
    </div>
  );
}
