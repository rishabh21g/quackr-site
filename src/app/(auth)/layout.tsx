import Link from "next/link";
import { BrandPanel } from "@/components/auth/brand-panel";
import { Logo } from "@/components/brand/logo";

/**
 * Split auth screen. Left: the form column on paper. Right (lg+): an inset brand card with
 * the decoy phone. Below lg it is just the logo and the form.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-1 bg-paper">
      <div className="flex min-w-0 flex-1 flex-col px-5 pb-10 pt-5 sm:px-8 sm:pt-7 lg:px-12">
        <header>
          <Link
            href="/"
            aria-label="Quackr home"
            className="-m-1.5 inline-flex min-h-11 items-center rounded-[10px] p-1.5"
          >
            <Logo size="sm" />
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="w-full max-w-[400px]">{children}</div>
        </main>
      </div>

      <aside aria-label="Why Quackr" className="hidden p-3 lg:block lg:w-[48%] xl:w-[52%]">
        <div className="sticky top-3 h-[calc(100dvh-24px)] min-h-[760px]">
          <BrandPanel />
        </div>
      </aside>
    </div>
  );
}
