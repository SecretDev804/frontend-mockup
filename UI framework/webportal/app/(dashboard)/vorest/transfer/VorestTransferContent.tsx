"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRightLeft,
  ArrowRight,
  ArrowLeftRight,
  PawPrint,
  Trees,
  Check,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useCreatureContext } from "@/contexts/CreatureContext";
import { useVorestContext } from "@/contexts/VorestContext";
import { useUserContext } from "@/contexts/UserContext";
import {
  sendCreatureToVorest,
  retrieveCreatureFromVorest,
  type Creature,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Confirm Modal
// ---------------------------------------------------------------------------

function TransferConfirmModal({
  creature,
  direction,
  isProcessing,
  onConfirm,
  onCancel,
}: {
  creature: Creature;
  direction: "to_vorest" | "from_vorest";
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isToVorest = direction === "to_vorest";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_24px_60px_rgba(16,25,21,0.2)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-modal-title"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              isToVorest
                ? "bg-[rgba(45,93,49,0.12)] text-[var(--moss)]"
                : "bg-[rgba(218,165,32,0.12)] text-[var(--ember)]"
            }`}>
              {isToVorest ? <ArrowRight className="h-5 w-5" /> : <ArrowLeftRight className="h-5 w-5" />}
            </div>
            <div>
              <h2
                id="transfer-modal-title"
                className="font-semibold text-[rgba(16,25,21,0.85)]"
              >
                {isToVorest ? "Send to Vorest" : "Retrieve from Vorest"}
              </h2>
              <p className="text-xs text-[rgba(16,25,21,0.5)]">
                {creature.name} ({creature.creature_type})
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[rgba(17,24,39,0.4)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-[rgba(17,24,39,0.08)] bg-[rgba(17,24,39,0.02)] p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[rgba(17,24,39,0.55)]">Creature</span>
            <span className="font-medium text-[rgba(16,25,21,0.8)]">{creature.name}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[rgba(17,24,39,0.55)]">Type</span>
            <span className="font-medium text-[rgba(16,25,21,0.8)]">{creature.creature_type}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[rgba(17,24,39,0.55)]">Age</span>
            <span className="font-medium text-[rgba(16,25,21,0.8)]">{creature.age} days</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[rgba(17,24,39,0.55)]">Munchiez</span>
            <span className="font-medium text-[rgba(16,25,21,0.8)]">{creature.munchiez}%</span>
          </div>
          <div className="mt-2 border-t border-[rgba(17,24,39,0.08)] pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[rgba(17,24,39,0.55)]">Transfer</span>
              <span className="font-semibold text-[var(--moss)]">
                {isToVorest ? "Second Life → Vorest" : "Vorest → Second Life"}
              </span>
            </div>
          </div>
        </div>

        {isToVorest && (
          <p className="mt-3 text-xs leading-relaxed text-[rgba(16,25,21,0.55)]">
            Your creature will leave Second Life and move to the Virtual Forest.
            You can retrieve it back at any time (if not breeding).
          </p>
        )}
        {!isToVorest && (
          <p className="mt-3 text-xs leading-relaxed text-[rgba(16,25,21,0.55)]">
            Your creature will leave the Vorest and return to Second Life.
            Its current age and munchiez will be preserved.
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 rounded-full border border-[rgba(17,24,39,0.12)] px-4 py-2.5 text-sm font-semibold text-[rgba(17,24,39,0.6)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--moss)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[rgba(45,93,49,0.85)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Confirm Transfer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Creature Card for Transfer
// ---------------------------------------------------------------------------

function TransferCreatureCard({
  creature,
  direction,
  onTransfer,
  isProcessing,
}: {
  creature: Creature;
  direction: "to_vorest" | "from_vorest";
  onTransfer: (creature: Creature) => void;
  isProcessing: boolean;
}) {
  const isToVorest = direction === "to_vorest";

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[rgba(16,25,21,0.08)] bg-white/95 p-4 transition hover:border-[rgba(16,25,21,0.15)]">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[rgba(45,93,49,0.1)] to-[rgba(218,165,32,0.1)]">
        <PawPrint className="h-5 w-5 text-[var(--moss)]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[rgba(16,25,21,0.85)]">
          {creature.name}
        </p>
        <p className="mt-0.5 text-xs text-[rgba(16,25,21,0.5)]">
          {creature.creature_type} &middot; Age {creature.age} &middot; Munchiez {creature.munchiez}%
        </p>
      </div>
      <button
        onClick={() => onTransfer(creature)}
        disabled={isProcessing}
        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          isToVorest
            ? "border border-[rgba(45,93,49,0.35)] text-[var(--moss)] hover:bg-[rgba(45,93,49,0.08)]"
            : "border border-[rgba(218,165,32,0.35)] text-[var(--ember)] hover:bg-[rgba(218,165,32,0.08)]"
        }`}
      >
        {isToVorest ? (
          <>
            Send <ArrowRight className="h-3 w-3" />
          </>
        ) : (
          <>
            Retrieve <ArrowLeftRight className="h-3 w-3" />
          </>
        )}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function VorestTransferContent() {
  const { ownerKey } = useUserContext();
  const {
    creatures: slCreatures,
    isLoading: slLoading,
    refetch: slRefetch,
  } = useCreatureContext();
  const {
    creatures: vorestCreatures,
    isLoading: vorestLoading,
    refetch: vorestRefetch,
  } = useVorestContext();

  const [pendingTransfer, setPendingTransfer] = useState<{
    creature: Creature;
    direction: "to_vorest" | "from_vorest";
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  // Filter SL creatures eligible for transfer to Vorest
  const eligibleForVorest = useMemo(() => {
    return slCreatures.filter(
      (c) =>
        c.is_alive &&
        !c.is_decorative &&
        !c.is_paired &&
        c.location !== "vorest" &&
        c.location !== "lost" &&
        !c.sent_to_beyond
    );
  }, [slCreatures]);

  // Filter Vorest creatures eligible for retrieval
  const eligibleForRetrieval = useMemo(() => {
    return vorestCreatures.filter(
      (c) => c.is_alive && !c.is_paired
    );
  }, [vorestCreatures]);

  const handleTransferClick = (creature: Creature, direction: "to_vorest" | "from_vorest") => {
    setPendingTransfer({ creature, direction });
    setErrorMessage(null);
  };

  const handleConfirmTransfer = async () => {
    if (!pendingTransfer || !ownerKey) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (pendingTransfer.direction === "to_vorest") {
        await sendCreatureToVorest(pendingTransfer.creature.creature_id, ownerKey);
        setSuccessMessage(
          `${pendingTransfer.creature.name} has been sent to the Vorest!`
        );
      } else {
        await retrieveCreatureFromVorest(pendingTransfer.creature.creature_id, ownerKey);
        setSuccessMessage(
          `${pendingTransfer.creature.name} has been retrieved from the Vorest!`
        );
      }
      setPendingTransfer(null);
      await Promise.allSettled([slRefetch(), vorestRefetch()]);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Transfer failed. Please try again."
      );
      setPendingTransfer(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelTransfer = () => {
    if (!isProcessing) {
      setPendingTransfer(null);
    }
  };

  const isLoading = slLoading || vorestLoading;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[rgba(16,25,21,0.5)]">
        <Link href="/dashboard" className="transition hover:text-[var(--moss)]">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/vorest" className="transition hover:text-[var(--moss)]">
          Vorest
        </Link>
        <span>/</span>
        <span className="font-semibold text-[rgba(16,25,21,0.8)]">Transfer</span>
      </nav>

      {/* Header */}
      <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
        <div className="flex items-center gap-3">
          <Link
            href="/vorest"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(16,25,21,0.12)] transition hover:bg-[rgba(16,25,21,0.04)]"
          >
            <ArrowLeft className="h-4 w-4 text-[rgba(16,25,21,0.6)]" />
          </Link>
          <div>
            <h1 className="font-display text-3xl">Transfer Creatures</h1>
            <p className="mt-1 text-sm text-[rgba(16,25,21,0.6)]">
              Move creatures between Second Life and the Vorest.
            </p>
          </div>
        </div>
      </header>

      {/* Success banner */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(45,93,49,0.3)] bg-[rgba(45,93,49,0.08)] p-4">
          <Check className="h-5 w-5 flex-shrink-0 text-[var(--moss)]" />
          <p className="flex-1 text-sm font-medium text-[var(--moss)]">
            {successMessage}
          </p>
          <button
            onClick={() => setSuccessMessage(null)}
            aria-label="Dismiss"
            className="text-[rgba(45,93,49,0.5)] hover:text-[var(--moss)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error banner */}
      {errorMessage && !pendingTransfer && (
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.08)] p-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-[var(--ember)]" />
          <p className="flex-1 text-sm font-medium text-[var(--ember)]">
            {errorMessage}
          </p>
          <button
            onClick={() => setErrorMessage(null)}
            aria-label="Dismiss"
            className="text-[rgba(196,107,46,0.5)] hover:text-[var(--ember)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white/95 p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[rgba(16,25,21,0.08)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-[rgba(16,25,21,0.08)]" />
                  <div className="h-3 w-48 rounded bg-[rgba(16,25,21,0.08)]" />
                </div>
                <div className="h-8 w-20 rounded-full bg-[rgba(16,25,21,0.08)]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <>
          {/* Send to Vorest section */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-[var(--moss)]" />
              <h2 className="font-display text-xl">Send to Vorest</h2>
              <span className="rounded-full bg-[rgba(45,93,49,0.12)] px-2 py-0.5 text-[10px] font-bold text-[var(--moss)]">
                {eligibleForVorest.length}
              </span>
            </div>

            {eligibleForVorest.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.15)] bg-white/70 p-8 text-center">
                <PawPrint className="mx-auto h-10 w-10 text-[rgba(16,25,21,0.2)]" />
                <p className="mt-3 text-sm font-semibold text-[rgba(16,25,21,0.6)]">
                  No creatures available to send
                </p>
                <p className="mt-1 text-xs text-[rgba(16,25,21,0.45)]">
                  Only alive, non-decorative, non-paired SL creatures can be sent to the Vorest.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {eligibleForVorest.map((creature) => (
                  <TransferCreatureCard
                    key={creature.creature_id}
                    creature={creature}
                    direction="to_vorest"
                    onTransfer={(c) => handleTransferClick(c, "to_vorest")}
                    isProcessing={isProcessing}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-[rgba(16,25,21,0.1)]" />
            <ArrowRightLeft className="h-5 w-5 text-[rgba(16,25,21,0.3)]" />
            <div className="h-px flex-1 bg-[rgba(16,25,21,0.1)]" />
          </div>

          {/* Retrieve from Vorest section */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-[var(--ember)]" />
              <h2 className="font-display text-xl">Retrieve from Vorest</h2>
              <span className="rounded-full bg-[rgba(218,165,32,0.15)] px-2 py-0.5 text-[10px] font-bold text-[var(--ember)]">
                {eligibleForRetrieval.length}
              </span>
            </div>

            {eligibleForRetrieval.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.15)] bg-white/70 p-8 text-center">
                <Trees className="mx-auto h-10 w-10 text-[rgba(45,93,49,0.25)]" />
                <p className="mt-3 text-sm font-semibold text-[rgba(16,25,21,0.6)]">
                  No creatures to retrieve
                </p>
                <p className="mt-1 text-xs text-[rgba(16,25,21,0.45)]">
                  Only alive, non-paired Vorest creatures can be retrieved back to Second Life.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {eligibleForRetrieval.map((creature) => (
                  <TransferCreatureCard
                    key={creature.creature_id}
                    creature={creature}
                    direction="from_vorest"
                    onTransfer={(c) => handleTransferClick(c, "from_vorest")}
                    isProcessing={isProcessing}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Transfer confirmation modal */}
      {pendingTransfer && (
        <TransferConfirmModal
          creature={pendingTransfer.creature}
          direction={pendingTransfer.direction}
          isProcessing={isProcessing}
          onConfirm={handleConfirmTransfer}
          onCancel={handleCancelTransfer}
        />
      )}
    </div>
  );
}
