import type { Metadata } from "next";
import CreaturesContent from "./CreaturesContent";

export const metadata: Metadata = {
  title: "My Creatures | Goobiez Portal",
  description: "View and manage all your Goobiez creatures.",
};

export default function CreaturesPage() {
  return <CreaturesContent />;
}
