"use client";

import { useState, useEffect } from "react";

export type CountdownResult = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
  progress: number;
};

function calculateTimeLeft(
  endDateString: string | undefined,
  durationMs?: number
): CountdownResult {
  if (!endDateString) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true, progress: 100 };
  }

  const endDate = new Date(endDateString).getTime();
  const now = Date.now();
  const diffMs = endDate - now;

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true, progress: 100 };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  let progress = 0;
  if (durationMs && durationMs > 0) {
    const startDate = endDate - durationMs;
    const elapsed = now - startDate;
    progress = Math.min(100, Math.max(0, (elapsed / durationMs) * 100));
  }

  return { days, hours, minutes, seconds, isComplete: false, progress };
}

export function useCountdown(
  endDateString: string | undefined,
  durationMs?: number
): CountdownResult {
  const [timeLeft, setTimeLeft] = useState<CountdownResult>(() =>
    calculateTimeLeft(endDateString, durationMs)
  );

  useEffect(() => {
    if (!endDateString) return;

    setTimeLeft(calculateTimeLeft(endDateString, durationMs));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDateString, durationMs));
    }, 1000);

    return () => clearInterval(timer);
  }, [endDateString, durationMs]);

  return timeLeft;
}
