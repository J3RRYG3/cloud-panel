"use client";

import { useState } from "react";
import JSZip from "jszip";
import { useArchitectureStore } from "@/store/useArchitectureStore";
import { generateSupportingFiles } from "@/lib/terraform";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FolderArchive, Cpu } from "lucide-react";

export function TerraformButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const { architectureData, currentPrompt, selectedServices, totalMonthlyCost } =
    useArchitectureStore();

  if (!architectureData) return null;

  async function handleGenerateTerraform() {
    if (!architectureData || isGenerating) return;
    setIsGenerating(true);
    setStatusMsg("Consultando IA para generar Terraform…");

    try {
      // Paso 2: el LLM genera main.tf con recursos exactos según los servicios seleccionados
      const res = await fetch("/api/generate-terraform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentPrompt,
          architectureData,
          selectedServices,
        }),
      });

      const json = await res.json() as { mainTf?: string; error?: string };

      if (!res.ok || !json.mainTf) {
        throw new Error(json.error ?? "Error generando el código Terraform.");
      }

      setStatusMsg("Empaquetando archivos…");

      // Archivos de soporte (providers.tf, variables.tf, outputs.tf, .gitignore, README.md)
      const supporting = generateSupportingFiles(
        architectureData,
        selectedServices,
        totalMonthlyCost
      );

      const zip = new JSZip();
      const folder = zip.folder("infraestructura-multicloud");
      if (!folder) throw new Error("No se pudo crear la carpeta en el ZIP.");

      // main.tf viene del LLM (Paso 2) — consistencia garantizada con la UI
      folder.file("main.tf", json.mainTf);

      for (const [filename, content] of Object.entries(supporting)) {
        folder.file(filename, content);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "infraestructura-multicloud.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando Terraform:", err);
    } finally {
      setIsGenerating(false);
      setStatusMsg("");
    }
  }

  const selectedCount = Object.keys(selectedServices).length;

  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
      <div className="flex items-center gap-2 text-white/60">
        <FolderArchive className="h-5 w-5 text-indigo-400" />
        <div>
          <p className="text-sm font-medium text-white">
            Generar código Terraform
          </p>
          <p className="text-xs text-white/40">
            {isGenerating
              ? statusMsg
              : `${selectedCount} servicio${selectedCount !== 1 ? "s" : ""} seleccionado${selectedCount !== 1 ? "s" : ""} · $${totalMonthlyCost.toFixed(2)}/mes`}
          </p>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleGenerateTerraform}
        disabled={isGenerating || selectedCount === 0}
        className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 h-auto rounded-xl disabled:opacity-40 transition-all"
      >
        {isGenerating ? (
          <>
            <Cpu className="h-4 w-4 mr-2 animate-pulse" />
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generando con IA…
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Descargar .zip
          </>
        )}
      </Button>
    </div>
  );
}
