import type { Metadata } from "next";
import DashboardContent from "./DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard | Goobiez Portal",
  description: "Overview of your creatures, mailbox, and portal activity.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
