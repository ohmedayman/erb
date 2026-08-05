"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, Download, X, RefreshCw } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showBanner) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] px-4 py-2.5 text-center text-sm font-medium transition-all duration-300 ${
        isOnline
          ? "bg-green-600 text-white animate-slide-down"
          : "bg-amber-500 text-black"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <RefreshCw className="w-4 h-4" />
            <span>النت رجع — البيانات بتتسync تلقائياً</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>أنت أوفلاين — البيانات بتتحفظ محلياً وهتتسync أول ما النت يرجع</span>
          </>
        )}
      </div>
    </div>
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem("pwa-install-dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setShowInstall(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", "true");
    setShowInstall(false);
    setDismissed(true);
  };

  if (!showInstall || dismissed) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[9998]">
      <div className="bg-[#1e293b] border border-orange-500/30 rounded-2xl p-5 shadow-2xl shadow-orange-500/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm">ثبّت StockFlow على جهازك</h3>
            <p className="text-slate-400 text-xs mt-1">
              شغّل أوفلاين و.sync البيانات تلقائياً
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
              >
                تثبيت
              </button>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white text-xs px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                مش دلوقتي
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SyncStatus() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const checkSync = async () => {
      try {
        const { getSyncQueueCount } = await import("@/lib/offline-db");
        const count = await getSyncQueueCount();
        setPendingCount(count);
      } catch {}
    };

    checkSync();
    const interval = setInterval(checkSync, 5000);

    const handleSync = () => {
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
        checkSync();
      }, 2000);
    };

    window.addEventListener("sync-data", handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener("sync-data", handleSync);
    };
  }, []);

  if (pendingCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9997]">
      <div className="bg-[#1e293b] border border-amber-500/30 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
        <div className={`w-2 h-2 rounded-full ${isSyncing ? "bg-green-400 animate-pulse" : "bg-amber-400"}`} />
        <span className="text-slate-300 text-xs">
          {isSyncing
            ? "جاري_SYNC البيانات..."
            : `${pendingCount} تغيير في الانتظار`}
        </span>
      </div>
    </div>
  );
}
