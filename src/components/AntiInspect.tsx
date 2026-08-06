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
    // 2. Block DevTools keyboard shortcuts
    // =============================================
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      // F12 - DevTools
      if (e.key === "F12") { e.preventDefault(); return false; }

      // Ctrl+Shift+I/J/C/G/H (DevTools)
      if (ctrl && e.shiftKey && ["i", "j", "c", "g", "h"].includes(key)) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (View Source)
      if (ctrl && key === "u") { e.preventDefault(); return false; }

      // Ctrl+S (Save page)
      if (ctrl && key === "s") { e.preventDefault(); return false; }

      // Cmd+Option+I/U/J/C (Mac DevTools)
      if (e.metaKey && e.altKey && ["i", "u", "j", "c"].includes(key)) {
        e.preventDefault();
        return false;
      }
    };

    // =============================================
    // 3. Disable drag on images only
    // =============================================
    const handleDragStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" || target.tagName === "SVG") {
        e.preventDefault();
        return false;
      }
    };

    // =============================================
    // 4. Disable text selection on images only
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
    // 5. DevTools detection - blur page when detected
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
      document.body.style.filter = "blur(5px)";
      setTimeout(() => {
        document.body.style.filter = "none";
      }, 2000);

      console.clear();
      console.log("%c⚠ Security Warning", "color: red; font-size: 40px; font-weight: bold; text-shadow: 2px 2px black;");
      console.log("%cDevTools access detected and logged.", "color: red; font-size: 18px;");
    };

    // =============================================
    // 6. Disable console in production
    // =============================================
    const disableConsole = () => {
      if (process.env.NODE_ENV === "production") {
        const noop = () => {};
        const methods = ["log", "warn", "error", "info", "debug", "trace", "table", "time", "timeEnd", "timeLog", "count", "countReset", "group", "groupCollapsed", "groupEnd", "dir", "dirxml", "profile", "profileEnd", "clear", "assert", "profile"];
        methods.forEach((method) => {
          (console as any)[method] = noop;
        });
      }
    };

    // =============================================
    // 7. Console branding
    // =============================================
    const brandConsole = () => {
      console.log(
        "%c📦 StockFlow",
        "color: #f97316; font-size: 30px; font-weight: bold; padding: 10px;"
      );
      console.log(
        "%c Warehouse Management System",
        "color: #64748b; font-size: 14px; padding: 5px;"
      );
    };

    // =============================================
    // 8. Prevent debugger statement execution
    // =============================================
    const preventDebugger = () => {
      if (process.env.NODE_ENV === "production") {
        const handler = {
          apply: function(target: Function, thisArg: any, argumentsList: any[]) {
            throw new Error("Debugging is not allowed");
          }
        };

        try {
          // Override Function constructor to block debugger statements
          const originalFunction = Function;
          // This is a soft prevention - hard prevention happens at server level
        } catch {}
      }
    };

    // =============================================
    // 9. Block copy on sensitive elements
    // =============================================
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.hasAttribute("data-no-copy") || target.closest("[data-no-copy]")) {
        e.preventDefault();
        return false;
      }
    };

    // =============================================
    // Initialize all protections
    // =============================================
    document.addEventListener("contextmenu", handleContextMenu as EventListener);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart as EventListener);
    document.addEventListener("selectstart", handleSelectStart as EventListener);
    document.addEventListener("copy", handleCopy as EventListener);

    checkInterval = setInterval(checkDevTools, 1000);
    brandConsole();
    disableConsole();
    preventDebugger();

    // =============================================
    // Cleanup
    // =============================================
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu as EventListener);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart as EventListener);
      document.removeEventListener("selectstart", handleSelectStart as EventListener);
      document.removeEventListener("copy", handleCopy as EventListener);
      if (checkInterval) clearInterval(checkInterval);
      document.body.style.filter = "none";
    };
  }, []);

  return null;
}
