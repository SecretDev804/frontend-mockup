import type { Metadata } from "next";
import VorestCreaturesContent from "./VorestCreaturesContent";

export const metadata: Metadata = {
  title: "Vorest Creatures | Goobiez Portal",
  description: "View and manage all your creatures living in the Vorest.",
};

export default function VorestCreaturesPage() {
  return <VorestCreaturesContent />;
}
