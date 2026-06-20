"use client";

import { useArchitectureStore } from "@/store/useArchitectureStore";
import { AlertCircle, X } from "lucide-react";

export function ErrorBanner() {
  const { error, setError } = useArchitectureStore();

  if (!error) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-start gap-3 p-4 bg-red-950/50 border border-red-500/30 rounded-xl text-sm text-red-300">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-400" />
        <span className="flex-1">{error}</span>
        <button
          type="button"
          onClick={() => setError(null)}
          className="text-red-400 hover:text-red-200 transition-colors"
          aria-label="Cerrar error"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
