import type { Metadata } from "next";
import BreedingContent from "./BreedingContent";

export const metadata: Metadata = {
  title: "Breeding | Goobiez Portal",
  description: "View and manage your active and completed breeding sessions.",
};

export default function BreedingPage() {
  return <BreedingContent />;
}
