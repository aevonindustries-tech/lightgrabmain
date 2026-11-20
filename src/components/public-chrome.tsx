import { Link } from "@tanstack/react-router";
import { Wordmark } from "./brand";
import { useMe } from "@/lib/session";

export function PublicHeader() {
  const { data: me } = useMe();
  return (
    <header className="rule-bottom">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4 sm:px-6">
        <Wordmark />
        <nav aria-label="Main" className="ml-auto flex items-center gap-5 text-sm">
          <Link to="/how-it-works" className="hidden hover:underline sm:inline" activeProps={{ className: "underline" }}>How it works</Link>
          <Link to="/runners" className="hidden hover:underline sm:inline" activeProps={{ className: "underline" }}>Become a runner</Link>
          <Link to="/courier" className="hidden hover:underline sm:inline" activeProps={{ className: "underline" }}>Become a courier</Link>
          {me ? (
            <Link to="/requests" className="inline-flex h-9 items-center rounded-sm bg-primary px-4 font-medium text-primary-foreground hover:bg-primary/90">My requests</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="rule-top mt-24">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3 sm:px-6">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-xs text-muted-foreground">A local shopping and delivery service by Aevon Industries, starting in Oron, Akwa Ibom.</p>
        </div>
        <div className="space-y-2">
          <p className="eyebrow">Service</p>
          <p><Link to="/how-it-works" className="hover:underline">How it works</Link></p>
          <p><Link to="/runners" className="hover:underline">Become a runner</Link></p>
          <p><Link to="/courier" className="hover:underline">Become a courier</Link></p>
        </div>
        <div className="space-y-2">
          <p className="eyebrow">Payments</p>
          <p className="text-muted-foreground">Online payment is not yet available. You pay on delivery, only after accepting a quote.</p>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 font-mono text-xs text-muted-foreground sm:px-6">© {new Date().getFullYear()} Aevon Industries</p>
    </footer>
  );
}
