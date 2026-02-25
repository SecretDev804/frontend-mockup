import type { Metadata } from "next";
import HelpContent from "./HelpContent";

export const metadata: Metadata = {
  title: "Help & Guide | Goobiez Portal",
  description: "Help documentation and guides for the Goobiez Portal.",
};

export default function HelpPage() {
  return <HelpContent />;
}
