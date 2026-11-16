import { Link } from "@tanstack/react-router";

export function Wordmark({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="group inline-flex items-baseline gap-1.5 font-display text-xl font-bold tracking-tight text-foreground">
      <span aria-hidden className="inline-block h-2.5 w-2.5 translate-y-[-1px] rounded-full bg-signal" />
      LightGrab
    </Link>
  );
}
