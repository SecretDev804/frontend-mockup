import type { Metadata } from "next";
import RegisterContent from "./RegisterContent";

export const metadata: Metadata = {
  title: "Create Account | Goobiez Portal",
  description: "Create a Goobiez Portal account to start managing your creatures.",
};

export default function RegisterPage() {
  return <RegisterContent />;
}
