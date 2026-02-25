import type { Metadata } from "next";
import VorestCreatureDetailContent from "./VorestCreatureDetailContent";

export const metadata: Metadata = {
  title: "Vorest Creature | Goobiez Portal",
  description: "View and manage an individual Vorest creature.",
};

export default function VorestCreatureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <VorestCreatureDetailContent params={params} />;
}
