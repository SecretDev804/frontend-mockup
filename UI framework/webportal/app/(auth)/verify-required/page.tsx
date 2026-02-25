import type { Metadata } from "next";
import VerifyRequiredContent from "./VerifyRequiredContent";

export const metadata: Metadata = {
  title: "Verify Account | Goobiez Portal",
  description: "Link your Second Life account to complete verification.",
};

export default function VerifyRequiredPage() {
  return <VerifyRequiredContent />;
}
