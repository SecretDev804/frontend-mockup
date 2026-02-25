import type { Metadata } from "next";
import MailboxContent from "./MailboxContent";

export const metadata: Metadata = {
  title: "Mailbox | Goobiez Portal",
  description: "Claim deliveries from your creatures.",
};

export default function MailboxPage() {
  return <MailboxContent />;
}
