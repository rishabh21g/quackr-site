import { Suspense } from "react";
import type { Metadata } from "next";
import { PlanTag } from "@/components/auth/plan-tag";
import { SignupFlow } from "@/components/auth/signup-flow";

export const metadata: Metadata = {
  title: "Create account · Quackr",
  description: "Create a Quackr account and get your first free number for SMS verification.",
};

type SignupPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Not async: the searchParams promise is only awaited inside the Suspense boundary, so the
// whole form still prerenders into the static shell and only the plan tag streams in.
export default function SignupPage({ searchParams }: SignupPageProps) {
  return (
    <SignupFlow
      planTag={
        <Suspense fallback={null}>
          <PlanTag searchParams={searchParams} />
        </Suspense>
      }
    />
  );
}
