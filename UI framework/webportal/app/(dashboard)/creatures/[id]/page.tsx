import type { Metadata } from "next";
import CreatureDetailContent from "./CreatureDetailContent";

export const metadata: Metadata = {
  title: "Creature Detail | Goobiez Portal",
  description: "View detailed stats and manage an individual Goobiez creature.",
};

export default function CreatureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <CreatureDetailContent params={params} />;
}
