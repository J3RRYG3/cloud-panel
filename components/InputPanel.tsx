"use client";

import { useState, useRef } from "react";
import { useArchitectureStore } from "@/store/useArchitectureStore";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RotateCcw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArchitectureResponse } from "@/lib/schemas";

const EXAMPLE_PROMPTS = [
  "Una plataforma SaaS de e-commerce con 10,000 usuarios concurrentes, catálogo de 500K productos, pagos en tiempo real y un dashboard de análisis de ventas.",
  "Sistema de streaming de video bajo demanda con transcoding automático, CDN global y soporte para 1 millón de usuarios simultáneos.",
  "Aplicación de IoT para monitoreo industrial con 50,000 sensores enviando datos cada segundo, análisis en tiempo real y alertas.",
];

export function InputPanel() {
  const [prompt, setPrompt] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  // Ref para bloqueo sincrónico inmediato antes de que React re-renderice
  const pendingRef = useRef(false);

  const {
    isLoading,
    setLoading,
    setError,
    setArchitectureData,
    reset,
    architectureData,
  } = useArchitectureStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Doble guardia: estado Zustand + ref sincrónico — imposible lanzar 2 peticiones
    if (!prompt.trim() || isLoading || pendingRef.current) return;
    pendingRef.current = true;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = (await response.json()) as { error?: string } &
        ArchitectureResponse;

      if (!response.ok) {
        throw new Error(
          data.error ?? "Error desconocido al analizar la arquitectura."
        );
      }

      setArchitectureData(data as ArchitectureResponse);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al conectar con el servidor.";
      setError(message);
    } finally {
      // Siempre libera el bloqueo — sea éxito, error o timeout
      setLoading(false);
      pendingRef.current = false;
    }
  }

  function handleReset() {
    if (isLoading || isResetting) return;
    setIsResetting(true);
    setTimeout(() => {
      reset();
      setPrompt("");
      setIsResetting(false);
    }, 300);
  }

  const isBusy = isLoading || isResetting;
  const canSubmit = prompt.trim().length >= 10 && !isBusy;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            id="project-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe tu proyecto de software con el mayor detalle posible. Por ejemplo: usuarios esperados, tipo de carga, base de datos, regiones geográficas, requisitos de disponibilidad..."
            rows={6}
            disabled={isBusy}
            className={cn(
              "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white",
              "placeholder:text-white/30 text-sm resize-none focus:outline-none",
              "focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50",
              "transition-all duration-200",
              isBusy && "opacity-50 cursor-not-allowed"
            )}
          />
          <div className="absolute bottom-3 right-3 text-xs text-white/20">
            {prompt.length}/5000
          </div>
        </div>

        {!architectureData && (
          <div className="space-y-2">
            <p className="text-xs text-white/30 uppercase tracking-wider">
              Ejemplos rápidos:
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((example, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => !isBusy && setPrompt(example)}
                  disabled={isBusy}
                  className={cn(
                    "text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5",
                    "transition-all text-left line-clamp-1 max-w-xs",
                    isBusy
                      ? "opacity-30 cursor-not-allowed text-white/30"
                      : "text-white/40 hover:text-white/70 hover:bg-white/10"
                  )}
                >
                  {example.slice(0, 60)}…
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* ── Botón principal ── */}
          <Button
            type="submit"
            disabled={!canSubmit}
            aria-busy={isLoading}
            className={cn(
              "relative font-semibold px-6 py-2.5 h-auto rounded-xl transition-all duration-200 overflow-hidden",
              isLoading
                ? // Estado de carga: gris azulado con cursor prohibido
                  "bg-indigo-800 text-white/60 opacity-60 cursor-not-allowed pointer-events-none select-none"
                : canSubmit
                ? // Activo
                  "bg-indigo-600 hover:bg-indigo-500 text-white"
                : // Sin texto suficiente
                  "bg-indigo-600 text-white opacity-40 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-pulse" />
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analizando Arquitectura FinOps…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analizar y Optimizar Arquitectura
              </>
            )}
          </Button>

          {/* ── Botón Nuevo análisis ── */}
          {architectureData && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isBusy}
              aria-busy={isResetting}
              className={cn(
                "h-auto px-4 py-2.5 rounded-xl transition-all duration-200",
                isBusy
                  ? "border-white/5 text-white/20 opacity-40 cursor-not-allowed pointer-events-none"
                  : "border-white/10 text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {isResetting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Nuevo análisis
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
