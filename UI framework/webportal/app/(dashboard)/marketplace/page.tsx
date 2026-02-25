import type { Metadata } from "next";
import MarketplaceContent from "./MarketplaceContent";

export const metadata: Metadata = {
  title: "Marketplace | Goobiez Portal",
  description:
    "Spend your Great Beyond Points on food, creatures, and special items.",
};

export default function MarketplacePage() {
  return <MarketplaceContent />;
}
