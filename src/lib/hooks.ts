"use client";

import { useState, useEffect, useCallback } from "react";
import { isOnline, fullSync, startAutoSync, stopAutoSync } from "@/lib/sync-manager";
import { getSyncQueueCount } from "@/lib/offline-db";

export function useOnlineStatus() {
  const [online, setOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setOnline(isOnline());

    const handleOnline = async () => {
      setOnline(true);
      setSyncing(true);
      try {
        await fullSync();
      } catch {}
      setSyncing(false);
      const count = await getSyncQueueCount();
      setPendingSync(count);
    };

    const handleOffline = () => {
      setOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    startAutoSync(30000);

    const checkPending = async () => {
      try {
        const count = await getSyncQueueCount();
        setPendingSync(count);
      } catch {}
    };
    checkPending();
    const interval = setInterval(checkPending, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      stopAutoSync();
      clearInterval(interval);
    };
  }, []);

  const syncNow = useCallback(async () => {
    setSyncing(true);
    try {
      await fullSync();
    } catch {}
    setSyncing(false);
    const count = await getSyncQueueCount();
    setPendingSync(count);
  }, []);

  return { online, pendingSync, syncing, syncNow };
}
