"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone, Share, Plus } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already dismissed or installed
    const wasDismissed = localStorage.getItem("pwa-install-dismissed");
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);
    
    if (wasDismissed || standalone) {
      setDismissed(true);
      return;
    }

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    // Android/Chrome - listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Show install prompt after 8 seconds on mobile
    const timer = setTimeout(() => {
      if (!dismissed && !standalone) {
        setShowInstall(true);
      }
    }, 8000);

    window.addEventListener("appinstalled", () => {
      setShowInstall(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android/Chrome
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstall(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", "true");
    setShowInstall(false);
    setDismissed(true);
  };

  if (!showInstall || dismissed || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[9998]">
      <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-orange-500/30 rounded-2xl p-5 shadow-2xl shadow-orange-500/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm">ثبّت StockFlow</h3>
            
            {isIOS ? (
              // iOS instructions
              <div className="mt-2 space-y-2">
                <p className="text-slate-400 text-xs">
                  اضغط على زر المشاركة <Share className="w-3 h-3 inline" /> في Safari واختار "إضافة إلى الشاشة الرئيسية"
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="bg-slate-700 px-1.5 py-0.5 rounded">1</span>
                    اضغط المشاركة
                  </span>
                  <span>→</span>
                  <span className="flex items-center gap-1">
                    <span className="bg-slate-700 px-1.5 py-0.5 rounded">2</span>
                    "إضافة للشاشة"
                  </span>
                </div>
              </div>
            ) : (
              // Android install button
              <p className="text-slate-400 text-xs mt-1">
                شغّل أوفلاين واتزامن تلقائياً
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-3">
              {deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-orange-500/25"
                >
                  تثبيت الآن
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white text-xs px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                مش دلوقتي
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-slate-500 hover:text-white transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

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
            <span>✓</span>
            <span>النت رجع — البيانات بتتسync تلقائياً</span>
          </>
        ) : (
          <>
            <span>⚡</span>
            <span>أنت أوفلاين — البيانات بتتحفظ محلياً</span>
          </>
        )}
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
            ? "جاري_sync البيانات..."
            : `${pendingCount} تغيير في الانتظار`}
        </span>
      </div>
    </div>
  );
}
