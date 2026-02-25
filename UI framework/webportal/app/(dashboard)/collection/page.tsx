import type { Metadata } from "next";
import CollectionContent from "./CollectionContent";

export const metadata: Metadata = {
  title: "My Collection | Goobiez Portal",
  description: "Browse all your Goobiez creatures and showcase your favourites.",
};

export default function CollectionPage() {
  return <CollectionContent />;
}
