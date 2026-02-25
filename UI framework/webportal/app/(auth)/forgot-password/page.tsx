import type { Metadata } from "next";
import ForgotPasswordContent from "./ForgotPasswordContent";

export const metadata: Metadata = {
  title: "Reset Password | Goobiez Portal",
  description: "Reset your Goobiez Portal password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />;
}
