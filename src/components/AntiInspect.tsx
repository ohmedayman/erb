"use client";

import { useEffect, useRef } from "react";

export default function AntiInspect() {
  const devToolsOpen = useRef(false);

  useEffect(() => {
    // =============================================
    // 1. Disable right-click
    // =============================================
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // =============================================
    // 2. Block ALL keyboard shortcuts for dev tools + save + print
    // =============================================
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      // F12 - DevTools
      if (e.key === "F12") { e.preventDefault(); return false; }

      // F5 / F6 / F7 / F8 / F9 / F10 / F11
      if (["f5", "f6", "f7", "f8", "f9", "f10", "f11"].includes(key)) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I/J/C/G/H (DevTools)
      if (ctrl && e.shiftKey && ["i", "j", "c", "g", "h"].includes(key)) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (View Source)
      if (ctrl && key === "u") { e.preventDefault(); return false; }

      // Ctrl+S (Save Page)
      if (ctrl && key === "s") { e.preventDefault(); return false; }

      // Ctrl+P (Print)
      if (ctrl && key === "p") { e.preventDefault(); return false; }

      // Ctrl+G (Find next)
      if (ctrl && key === "g") { e.preventDefault(); return false; }

      // Ctrl+F (Find)
      if (ctrl && key === "f") { e.preventDefault(); return false; }

      // Ctrl+H (History)
      if (ctrl && key === "h") { e.preventDefault(); return false; }

      // Ctrl+J (Downloads)
      if (ctrl && key === "j") { e.preventDefault(); return false; }

      // Ctrl+L (Location bar)
      if (ctrl && key === "l") { e.preventDefault(); return false; }

      // Ctrl+N (New Window)
      if (ctrl && key === "n") { e.preventDefault(); return false; }

      // Ctrl+T (New Tab)
      if (ctrl && key === "t") { e.preventDefault(); return false; }

      // Ctrl+W (Close Tab)
      if (ctrl && key === "w") { e.preventDefault(); return false; }

      // Ctrl+Shift+Delete (Clear Data)
      if (ctrl && e.shiftKey && key === "delete") { e.preventDefault(); return false; }

      // Cmd+Option+I/U/J/C (Mac DevTools)
      if (e.metaKey && e.altKey && ["i", "u", "j", "c"].includes(key)) {
        e.preventDefault();
        return false;
      }
    };

    // =============================================
    // 3. Disable drag on ALL elements
    // =============================================
    const handleDragStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // =============================================
    // 4. Disable text selection on images + sensitive content
    // =============================================
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "IMG" ||
        target.tagName === "SVG" ||
        target.hasAttribute("data-no-select") ||
        target.closest("[data-no-select]")
      ) {
        e.preventDefault();
        return false;
      }
    };

    // =============================================
    // 5. Disable mobile long-press context menu
    // =============================================
    let touchTimer: ReturnType<typeof setTimeout> | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" || target.tagName === "A" || target.tagName === "BUTTON") {
        touchTimer = setTimeout(() => {
          e.preventDefault();
        }, 500);
      }
    };

    const handleTouchEnd = () => {
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
    };

    const handleTouchMove = () => {
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
    };

    // =============================================
    // 6. DevTools detection - multiple methods
    // =============================================
    let checkInterval: ReturnType<typeof setInterval> | null = null;

    const checkDevTools = () => {
      const threshold = 200;
      const widthOpen = window.outerWidth - window.innerWidth > threshold;
      const heightOpen = window.outerHeight - window.innerHeight > threshold;

      if ((widthOpen || heightOpen) && !devToolsOpen.current) {
        devToolsOpen.current = true;
        onDevToolsOpen();
      } else if (!widthOpen && !heightOpen && devToolsOpen.current) {
        devToolsOpen.current = false;
      }
    };

    const onDevToolsOpen = () => {
      // Mess up the page when dev tools are detected
      document.body.style.filter = "blur(5px)";
      setTimeout(() => {
        document.body.style.filter = "none";
      }, 2000);

      // Console warnings
      console.clear();
      console.log("%c⚠ تنبيه أمني", "color: red; font-size: 40px; font-weight: bold; text-shadow: 2px 2px black;");
      console.log("%cتم اكتشاف فتح أدوات المطور. هذه العملية مسجلة.", "color: red; font-size: 18px;");
      console.log("%cكل محاولات الوصول للكود المصدري مسجلة ومراقبة.", "color: orange; font-size: 14px;");
    };

    // =============================================
    // 7. Anti-debugging - detect debugger
    // =============================================
    const antiDebug = () => {
      const startTime = performance.now();
      // This triggers the debugger statement
      // eslint-disable-next-line
      const devToolsDetector = function() {};
      devToolsDetector.toString = function() {
        throw new Error("DevTools detected!");
      };
      // console.table(devToolsDetector); // Removed to avoid actual debugging pause
    };

    // =============================================
    // 8. Console obfuscation - override console methods
    // =============================================
    const obfuscateConsole = () => {
      // Override console.log to prevent copying
      const originalLog = console.log;
      const originalTable = console.table;
      const originalDir = console.dir;
      const originalDirxml = console.dirxml;

      console.log = function(...args: any[]) {
        if (args.some(a => typeof a === "object")) {
          originalLog.apply(console, ["%c🔒 المحتوى محمي", "color: red; font-size: 14px;"]);
          return;
        }
        originalLog.apply(console, args);
      };

      console.table = function() {
        originalLog.apply(console, ["%c🔒 جداول البيانات معطلة", "color: red; font-size: 14px;"]);
      };

      console.dir = function() {
        originalLog.apply(console, ["%c🔒 فحص الكائنات معطل", "color: red; font-size: 14px;"]);
      };

      console.dirxml = function() {
        originalLog.apply(console, ["%c🔒 فحص XML معطل", "color: red; font-size: 14px;"]);
      };

      return () => {
        console.log = originalLog;
        console.table = originalTable;
        console.dir = originalDir;
        console.dirxml = originalDirxml;
      };
    };

    // =============================================
    // 9. Fake console data when inspected
    // =============================================
    const fakeData = () => {
      // Overwrite common data extraction methods
      const originalStringify = JSON.stringify;
      JSON.stringify = function(value: any) {
        if (value && typeof value === "object" && (value.password || value.email || value.token)) {
          return originalStringify({ message: "🔒 البيانات محمية" });
        }
        return originalStringify.apply(this, arguments as any);
      };

      return () => {
        JSON.stringify = originalStringify;
      };
    };

    // =============================================
    // 10. Disable copy/paste
    // =============================================
    const handleCopy = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const handlePaste = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const handleCut = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // =============================================
    // Console branding
    // =============================================
    const brandConsole = () => {
      console.log(
        "%c📦 StockFlow",
        "color: #f97316; font-size: 30px; font-weight: bold; padding: 10px;"
      );
      console.log(
        "%c نظام إدارة المخازن والمخزون",
        "color: #64748b; font-size: 14px; padding: 5px;"
      );
      console.log(
        "%c⚠ تحذير: هذا النظام محمي بحقوق الملكية الفكرية",
        "color: red; font-size: 12px; padding: 5px; background: #fef2f2; border-radius: 4px;"
      );
      console.log(
        "%c未经授权访问此系统的源代码是违法的。",
        "color: #94a3b8; font-size: 11px; padding: 3px;"
      );
      console.log(
        "%cUnauthorized access to this system's source code is illegal.",
        "color: #94a3b8; font-size: 11px; padding: 3px;"
      );
    };

    // =============================================
    // Initialize all protections
    // =============================================
    document.addEventListener("contextmenu", handleContextMenu as EventListener);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart as EventListener);
    document.addEventListener("selectstart", handleSelectStart as EventListener);
    document.addEventListener("touchstart", handleTouchStart as EventListener);
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("copy", handleCopy as EventListener);
    document.addEventListener("paste", handlePaste as EventListener);
    document.addEventListener("cut", handleCut as EventListener);

    // DevTools detection interval
    checkInterval = setInterval(checkDevTools, 1000);

    // Console protections
    brandConsole();
    obfuscateConsole();
    const restoreJson = fakeData();
    antiDebug();

    // =============================================
    // Cleanup
    // =============================================
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu as EventListener);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart as EventListener);
      document.removeEventListener("selectstart", handleSelectStart as EventListener);
      document.removeEventListener("touchstart", handleTouchStart as EventListener);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("copy", handleCopy as EventListener);
      document.removeEventListener("paste", handlePaste as EventListener);
      document.removeEventListener("cut", handleCut as EventListener);
      if (checkInterval) clearInterval(checkInterval);
      if (touchTimer) clearTimeout(touchTimer);
      restoreJson();
      document.body.style.filter = "none";
    };
  }, []);

  return null;
}
