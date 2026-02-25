import type { Metadata } from "next";
import ProfileContent from "./ProfileContent";

export const metadata: Metadata = {
  title: "Profile | Goobiez Portal",
  description: "View your Goobiez Portal profile and account details.",
};

export default function ProfilePage() {
  return <ProfileContent />;
}
