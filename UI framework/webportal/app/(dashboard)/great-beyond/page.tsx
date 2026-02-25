import type { Metadata } from "next";
import GreatBeyondContent from "./GreatBeyondContent";

export const metadata: Metadata = {
  title: "Great Beyond | Goobiez Portal",
  description: "Redeem tokens and view your Great Beyond points history.",
};

export default function GreatBeyondPage() {
  return <GreatBeyondContent />;
}
