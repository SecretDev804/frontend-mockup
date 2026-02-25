import type { Metadata } from "next";
import LoginContent from "./LoginContent";

export const metadata: Metadata = {
  title: "Sign In | Goobiez Portal",
  description: "Sign in to manage your Goobiez creatures and account.",
};

export default function LoginPage() {
  return <LoginContent />;
}
