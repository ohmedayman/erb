"use client";

import { useEffect } from "react";

export default function AntiInspect() {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts for dev tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        return false;
      }
      // Ctrl+S (Save)
      if (e.ctrlKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        return false;
      }
      // Cmd+Option+I (Mac)
      if (e.metaKey && e.altKey && (e.key === "I" || e.key === "i")) {
        e.preventDefault();
        return false;
      }
      // Cmd+Option+U (Mac)
      if (e.metaKey && e.altKey && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        return false;
      }
      // Cmd+Option+J (Mac)
      if (e.metaKey && e.altKey && (e.key === "J" || e.key === "j")) {
        e.preventDefault();
        return false;
      }
      // Cmd+Option+C (Mac)
      if (e.metaKey && e.altKey && (e.key === "C" || e.key === "c")) {
        e.preventDefault();
        return false;
      }
      // Cmd+S (Mac)
      if (e.metaKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag on images
    const handleDragStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection on sensitive elements
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" || target.hasAttribute("data-no-select")) {
        e.preventDefault();
        return false;
      }
    };

    // Detect dev tools open (basic detection via debugger timing)
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      if (widthThreshold || heightThreshold) {
        // Dev tools might be open - optional: redirect or show warning
      }
    };

    // Console warning
    const warnAboutConsole = () => {
      console.log(
        "%c⚠ تحذير أمني",
        "color: red; font-size: 30px; font-weight: bold;"
      );
      console.log(
        "%cالوصول للكود المصدري محظور. استخدام هذا الكود بدون إذن يُعتبر انتهاكًا للحقوق.",
        "color: red; font-size: 16px;"
      );
    };

    document.addEventListener("contextmenu", handleContextMenu as EventListener);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart as EventListener);
    document.addEventListener("selectstart", handleSelectStart as EventListener);
    window.addEventListener("resize", detectDevTools);
    warnAboutConsole();
    detectDevTools();

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu as EventListener);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart as EventListener);
      document.removeEventListener("selectstart", handleSelectStart as EventListener);
      window.removeEventListener("resize", detectDevTools);
    };
  }, []);

  return null;
}
