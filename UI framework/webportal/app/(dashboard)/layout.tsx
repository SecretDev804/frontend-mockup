import DashboardFooter from "@/components/layout/DashboardFooter";
import DashboardHeader from "@/components/layout/DashboardHeader";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { GameConfigProvider } from "@/contexts/GameConfigContext";
import { UserProvider } from "@/contexts/UserContext";
import { CreatureProvider } from "@/contexts/CreatureContext";
import { MailboxProvider } from "@/contexts/MailboxContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { VorestProvider } from "@/contexts/VorestContext";
import { ToastProvider } from "@/components/ui/Toast";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GameConfigProvider>
      <UserProvider>
        <CreatureProvider>
          <MailboxProvider>
            <InventoryProvider>
              <VorestProvider>
                <ToastProvider>
                  <div className="dashboard-bg min-h-screen text-[var(--ink)]">
                    <DashboardHeader />
                    <div className="mx-auto flex w-full max-w-[1400px] gap-6 px-6 py-6">
                      <DashboardSidebar />
                      <main className="min-w-0 flex-1">{children}</main>
                    </div>
                    <DashboardFooter />
                  </div>
                </ToastProvider>
              </VorestProvider>
            </InventoryProvider>
          </MailboxProvider>
        </CreatureProvider>
      </UserProvider>
    </GameConfigProvider>
  );
}
