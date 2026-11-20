import { Link } from "@tanstack/react-router";

export function Wordmark({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex items-baseline font-display text-xl font-bold text-foreground">
      <span>LightGrab</span>
    </Link>
  );
}
