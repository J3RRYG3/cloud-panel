import { InputPanel } from "@/components/InputPanel";
import { ArchitectureGrid } from "@/components/ArchitectureGrid";
import { CostWidget } from "@/components/CostWidget";
import { TerraformButton } from "@/components/TerraformButton";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { PageBlocker } from "@/components/PageBlocker";
import { Cloud, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Fondo decorativo — no se ve afectado por el PageBlocker */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-cyan-600/6 rounded-full blur-3xl" />
      </div>

      {/*
        PageBlocker envuelve TODO el contenido interactivo.
        Cuando isLoading=true aplica: pointer-events-none opacity-50 select-none
        El LoadingOverlay (z-50) y el CostWidget viven fuera del PageBlocker
        para permanecer visibles y sin degradar durante la carga.
      */}
      <PageBlocker>
        <div className="relative z-10">
          {/* Header */}
          <header className="border-b border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                  <Cloud className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">
                    Cloud Panel
                  </h1>
                  <p className="text-xs text-white/40">
                    Arquitecto Multicloud · FinOps AI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-white/30">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-indigo-400" />
                  <span>Powered by Gemini</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 rounded-full text-xs font-medium">
                    AWS
                  </span>
                  <span className="px-2 py-0.5 bg-blue-900/40 text-blue-400 border border-blue-800/50 rounded-full text-xs font-medium">
                    Azure
                  </span>
                  <span className="px-2 py-0.5 bg-red-900/40 text-red-400 border border-red-800/50 rounded-full text-xs font-medium">
                    GCP
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
            {/* Hero */}
            <section className="text-center space-y-4 py-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-300 mb-2">
                <Zap className="h-3 w-3" />
                Análisis arquitectónico inteligente
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Diseña tu infraestructura
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                  multicloud óptima
                </span>
              </h2>
              <p className="text-white/50 max-w-2xl mx-auto text-base leading-relaxed">
                Describe tu proyecto y Gemini analizará AWS, Azure y GCP bajo criterios FinOps,
                seleccionando los servicios más eficientes en costo. Descarga el código Terraform
                listo para producción.
              </p>
            </section>

            {/* Input */}
            <section>
              <InputPanel />
            </section>

            {/* Error */}
            <ErrorBanner />

            {/* Results */}
            <ArchitectureGridWrapper />
          </main>

          <footer className="border-t border-white/5 mt-20">
            <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-white/20">
              <span>Cloud Panel · Powered by Google Gemini 2.5 Flash</span>
              <span>Los costos son estimaciones y pueden variar</span>
            </div>
          </footer>
        </div>
      </PageBlocker>

      {/* CostWidget fuera del PageBlocker — siempre visible durante la carga */}
      <CostWidget />

      {/* LoadingOverlay fuera del PageBlocker — vive en z-50 sin degradar */}
      <LoadingOverlay />
    </div>
  );
}

function ArchitectureGridWrapper() {
  return (
    <section className="space-y-6">
      <TerraformButton />
      <ArchitectureGrid />
    </section>
  );
}
