import type { Metadata } from "next";
import VorestShopContent from "./VorestShopContent";

export const metadata: Metadata = {
  title: "Vorest Shop | Goobiez Portal",
  description: "Purchase food and boosters for your Vorest creatures.",
};

export default function VorestShopPage() {
  return <VorestShopContent />;
}
