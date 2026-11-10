import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in · Quackr",
  description: "Log in to Quackr to read your verification codes and manage your numbers.",
};

export default function LoginPage() {
  return <LoginForm />;
}
