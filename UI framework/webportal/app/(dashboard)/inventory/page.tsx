import type { Metadata } from "next";
import InventoryContent from "./InventoryContent";

export const metadata: Metadata = {
  title: "Inventory | Goobiez Portal",
  description: "Manage your food, heart pedestals, and booster items.",
};

export default function InventoryPage() {
  return <InventoryContent />;
}
