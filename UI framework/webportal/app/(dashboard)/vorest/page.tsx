import type { Metadata } from "next";
import VorestContent from "./VorestContent";

export const metadata: Metadata = {
  title: "Vorest | Goobiez Portal",
  description: "Virtual Forest — manage your creatures living in the Vorest ecosystem.",
};

export default function VorestPage() {
  return <VorestContent />;
}
