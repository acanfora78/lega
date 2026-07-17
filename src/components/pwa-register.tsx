"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // registrazione best-effort: l'app funziona regolarmente anche senza SW attivo
      });
    }
  }, []);

  return null;
}
