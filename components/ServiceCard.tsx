"use client";

import { CheckCircle, Check, X, Info, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceOption, FinOpsStatus } from "@/lib/schemas";
import { useArchitectureStore } from "@/store/useArchitectureStore";

interface ServiceCardProps {
  service: ServiceOption;
  categoryName: string;
  finOpsStatus: FinOpsStatus;
  isSelected: boolean;
}

const PROVIDER_LOGOS: Record<string, string> = {
  AWS: "🟧",
  Azure: "🔵",
  GCP: "🟥",
};

const FINOPS_CONFIG: Record<
  FinOpsStatus,
  {
    borderClass: string;
    bgClass: string;
    selectedBorderClass: string;
    icon: React.ReactNode;
    label: string;
    badgeClass: string;
  }
> = {
  cheapest: {
    borderClass: "border-emerald-700/60",
    bgClass: "bg-emerald-950/20",
    selectedBorderClass: "border-emerald-400 ring-2 ring-emerald-400/30 shadow-emerald-900/40",
    icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
    label: "Más económico",
    badgeClass: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
  },
  middle: {
    borderClass: "border-amber-700/60",
    bgClass: "bg-amber-950/15",
    selectedBorderClass: "border-amber-400 ring-2 ring-amber-400/25 shadow-amber-900/40",
    icon: <Check className="h-5 w-5 text-amber-400" />,
    label: "Precio medio",
    badgeClass: "bg-amber-900/50 text-amber-300 border-amber-700",
  },
  expensive: {
    borderClass: "border-red-700/50",
    bgClass: "bg-red-950/15",
    selectedBorderClass: "border-red-400 ring-2 ring-red-400/20 shadow-red-900/40",
    icon: <X className="h-5 w-5 text-red-400" />,
    label: "Más costoso",
    badgeClass: "bg-red-900/50 text-red-300 border-red-700",
  },
};

export function ServiceCard({
  service,
  categoryName,
  finOpsStatus,
  isSelected,
}: ServiceCardProps) {
  const selectService = useArchitectureStore((s) => s.selectService);
  const config = FINOPS_CONFIG[finOpsStatus];

  return (
    <button
      type="button"
      data-finops-status={finOpsStatus}
      data-provider={service.provider}
      data-selected={isSelected}
      onClick={() => selectService(categoryName, service.provider)}
      className={cn(
        "w-full text-left rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer shadow-lg",
        isSelected
          ? cn(config.selectedBorderClass, config.bgClass, "scale-[1.02]")
          : cn(config.borderClass, config.bgClass, "opacity-70 hover:opacity-100 hover:scale-[1.01]"),
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      )}
    >
      {/* Header: proveedor + estado FinOps */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            {PROVIDER_LOGOS[service.provider]}
          </span>
          <span className="font-bold text-sm text-white/90">
            {service.provider}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {config.icon}
          {isSelected && (
            <span className="text-xs font-semibold text-white/80 bg-white/10 rounded-full px-2 py-0.5">
              Seleccionado
            </span>
          )}
        </div>
      </div>

      {/* Nombre del servicio */}
      <p className="font-semibold text-white text-sm mb-1 leading-tight">
        {service.serviceName}
      </p>
      <p className="text-white/55 text-xs mb-3 line-clamp-2">
        {service.description}
      </p>

      {/* Precio + badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl font-bold text-white">
          ${service.monthlyEstimatedCost.toFixed(2)}
          <span className="text-xs font-normal text-white/50">/mes</span>
        </span>
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full border font-medium",
            config.badgeClass
          )}
        >
          {config.label}
        </span>
      </div>

      {/* Especificaciones técnicas */}
      {service.specifications.length > 0 && (
        <ul className="space-y-1 mb-3">
          {service.specifications.slice(0, 3).map((spec, i) => (
            <li
              key={i}
              className="text-xs text-white/45 flex items-start gap-1.5"
            >
              <span className="text-white/25 mt-0.5 shrink-0">•</span>
              <span>{spec}</span>
            </li>
          ))}
        </ul>
      )}

      {/* ¿Por qué este servicio? */}
      <div className="border-t border-white/8 pt-3 space-y-2">
        <div className="flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-200/70 leading-relaxed">
            {service.rationale}
          </p>
        </div>

        {/* Alternativa descartada */}
        <div className="flex items-start gap-2 bg-white/4 rounded-lg px-2.5 py-2">
          <ArrowLeftRight className="h-3.5 w-3.5 text-white/30 mt-0.5 shrink-0" />
          <div className="text-xs text-white/35 leading-snug">
            <span className="text-white/50 font-medium">Alternativa descartada: </span>
            {service.alternativeService}
            <span className="ml-1 text-white/30">
              (~${service.alternativeServiceCost.toFixed(2)}/mes)
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
