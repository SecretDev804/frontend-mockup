import type { Metadata } from "next";
import VorestTransferContent from "./VorestTransferContent";

export const metadata: Metadata = {
  title: "Vorest Transfer | Goobiez Portal",
  description: "Send creatures to or retrieve creatures from the Vorest.",
};

export default function VorestTransferPage() {
  return <VorestTransferContent />;
}
