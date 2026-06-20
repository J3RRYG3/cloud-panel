"use client";

import { useArchitectureStore } from "@/store/useArchitectureStore";
import { DollarSign, TrendingDown } from "lucide-react";

export function CostWidget() {
  const { architectureData, totalMonthlyCost, selectedServices } =
    useArchitectureStore();

  if (!architectureData) return null;

  const yearlyEstimate = totalMonthlyCost * 12;

  const providerCounts: Record<string, number> = {};
  for (const provider of Object.values(selectedServices)) {
    providerCounts[provider] = (providerCounts[provider] ?? 0) + 1;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72">
      <div className="bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-emerald-500/20 rounded-lg">
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
            Costo Total Estimado
          </span>
        </div>

        <div className="mb-3">
          <div className="text-3xl font-bold text-white tabular-nums">
            ${totalMonthlyCost.toFixed(2)}
            <span className="text-sm font-normal text-white/40 ml-1">/mes</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/40 mt-1">
            <TrendingDown className="h-3 w-3" />
            <span>~${yearlyEstimate.toFixed(0)} USD/año</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3">
          <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">
            Mix de proveedores
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(providerCounts).map(([provider, count]) => (
              <span
                key={provider}
                className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-white/70 font-medium"
              >
                {provider}: {count}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/25 mt-3 leading-tight">
          * Estimado basado en precios de lista. Los costos reales pueden variar.
        </p>
      </div>
    </div>
  );
}
