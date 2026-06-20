"use client";

import { useArchitectureStore } from "@/store/useArchitectureStore";
import { getFinOpsStatus, type Provider } from "@/lib/schemas";
import { ServiceCard } from "@/components/ServiceCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Server, Database, Network, Shield, HardDrive, Cpu } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  cómputo: <Cpu className="h-4 w-4" />,
  computo: <Cpu className="h-4 w-4" />,
  compute: <Cpu className="h-4 w-4" />,
  servidor: <Server className="h-4 w-4" />,
  "base de datos": <Database className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
  redes: <Network className="h-4 w-4" />,
  network: <Network className="h-4 w-4" />,
  seguridad: <Shield className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  almacenamiento: <HardDrive className="h-4 w-4" />,
  storage: <HardDrive className="h-4 w-4" />,
};

function getCategoryIcon(name: string): React.ReactNode {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return <Server className="h-4 w-4" />;
}

const PROVIDER_ORDER: Provider[] = ["AWS", "Azure", "GCP"];

export function ArchitectureGrid() {
  const { architectureData, selectedServices } = useArchitectureStore();

  if (!architectureData) return null;

  return (
    <div className="w-full space-y-4">
      <div className="mb-6">
        <p className="text-white/60 text-sm leading-relaxed bg-white/5 rounded-lg p-4 border border-white/10">
          {architectureData.projectSummary}
        </p>
      </div>

      {/* Cabecera de columnas */}
      <div className="hidden md:grid grid-cols-3 gap-4 px-4 mb-2">
        {PROVIDER_ORDER.map((provider) => (
          <div
            key={provider}
            className="text-center text-xs font-bold uppercase tracking-widest text-white/40"
          >
            {provider}
          </div>
        ))}
      </div>

      <Accordion type="multiple" defaultValue={architectureData.categories.map((_, i) => `item-${i}`)}>
        {architectureData.categories.map((category, index) => {
          const selectedProvider = selectedServices[category.categoryName];

          const sortedServices = PROVIDER_ORDER.map(
            (provider) =>
              category.services.find((s) => s.provider === provider)!
          ).filter(Boolean);

          return (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-white/10"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="text-white/60">
                    {getCategoryIcon(category.categoryName)}
                  </span>
                  <span>{category.categoryName}</span>
                  <span className="text-xs text-white/40 font-normal ml-1">
                    — Seleccionado:{" "}
                    <span className="text-white/70">{selectedProvider}</span>
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  {sortedServices.map((service) => {
                    const finOpsStatus = getFinOpsStatus(
                      category.services,
                      service.provider
                    );
                    const isSelected =
                      selectedProvider === service.provider;

                    return (
                      <ServiceCard
                        key={service.provider}
                        service={service}
                        categoryName={category.categoryName}
                        finOpsStatus={finOpsStatus}
                        isSelected={isSelected}
                      />
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
