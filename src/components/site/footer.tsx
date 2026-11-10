// Layout adapted from Arc UI SiteFooter, "columns" variant (MIT, © 2026 Elia Kuratli). Newsletter dropped; kept as a server component.

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";

type FooterLink = { label: string; href: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Free numbers", href: "/signup?plan=free" },
      { label: "Private numbers", href: "/signup" },
      { label: "Quackr ID", href: "/id" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "API", href: "#developers" },
      { label: "MCP server", href: "/docs/mcp" },
      { label: "Webhooks", href: "/docs/webhooks" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Acceptable use", href: "/acceptable-use" },
    ],
  },
];

const link =
  "inline-flex min-h-11 items-center text-[14px] sm:min-h-9 text-ink-2 transition-colors duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:text-ink hover:duration-[var(--hover-in)]";

/** A calm footer: brand and tagline, four link columns (2-up on phones), then copyright and live status. */
export function SiteFooter() {
  return (
    <footer data-site-footer className="border-t border-line bg-paper">
      <Container className="pb-10 pt-16 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,3fr)] lg:gap-16">
          <div>
            <Link href="/" aria-label="Quackr home" className="inline-flex">
              <Logo size="md" />
            </Link>
            <p className="mt-4 max-w-[280px] text-[14px] leading-[1.6] text-ink-3">
              Get the code, keep your number. Disposable numbers for SMS verification in 30+ countries.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-ink-3">{col.title}</h2>
                <ul className="mt-3 space-y-0.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className={link}>
                        {/* mi-underline: a 1px rule grows from the left on hover, focus or press (globals.css). */}
                        <span className="mi-underline">{l.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col-reverse gap-4 border-t border-line pt-6 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Quackr</p>
          <Link
            href="/status"
            className="inline-flex min-h-11 items-center gap-2.5 self-start rounded-full transition-colors duration-[var(--hover-out)] hover:text-ink hover:duration-[var(--hover-in)] sm:self-auto"
          >
            <span className="live-dot" aria-hidden />
            <span className="mi-underline">All systems normal</span>
          </Link>
        </div>
      </Container>
    </footer>
  );
}
