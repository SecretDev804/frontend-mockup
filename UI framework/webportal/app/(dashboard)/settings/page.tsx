import type { Metadata } from "next";
import SettingsContent from "./SettingsContent";

export const metadata: Metadata = {
  title: "Settings | Goobiez Portal",
  description: "Manage your Goobiez Portal account settings.",
};

export default function SettingsPage() {
  return <SettingsContent />;
}
