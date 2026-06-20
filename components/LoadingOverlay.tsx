"use client";

import { useArchitectureStore } from "@/store/useArchitectureStore";

const STEPS = [
  "Interpretando los requisitos del proyecto...",
  "Evaluando servicios de AWS, Azure y GCP...",
  "Calculando costos y aplicando criterios FinOps...",
  "Seleccionando la arquitectura óptima...",
  "Generando justificaciones técnicas...",
];

export function LoadingOverlay() {
  const isLoading = useArchitectureStore((s) => s.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 px-8 py-10 bg-gray-900/90 border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full mx-4">

        {/* Reloj animado */}
        <div className="relative flex items-center justify-center w-20 h-20">
          {/* Anillo exterior giratorio */}
          <svg
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: "2s" }}
            viewBox="0 0 80 80"
            fill="none"
          >
            <circle
              cx="40" cy="40" r="36"
              stroke="url(#grad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="60 166"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>

          {/* Cara del reloj */}
          <div className="w-14 h-14 rounded-full bg-gray-800 border-2 border-white/10 flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
              {/* Marco */}
              <circle cx="24" cy="24" r="22" stroke="#4f46e5" strokeWidth="2" />
              {/* Marcas de horas */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <line
                  key={deg}
                  x1="24" y1="5" x2="24" y2={deg % 90 === 0 ? "9" : "7"}
                  stroke={deg % 90 === 0 ? "#818cf8" : "#374151"}
                  strokeWidth={deg % 90 === 0 ? "2" : "1"}
                  transform={`rotate(${deg} 24 24)`}
                />
              ))}
              {/* Minutero — gira 1 vuelta por segundo */}
              <line
                x1="24" y1="24" x2="24" y2="8"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                className="origin-center"
                style={{
                  transformOrigin: "24px 24px",
                  animation: "spin 4s linear infinite",
                }}
              />
              {/* Horario — gira más lento */}
              <line
                x1="24" y1="24" x2="24" y2="13"
                stroke="#22d3ee"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  transformOrigin: "24px 24px",
                  animation: "spin 48s linear infinite",
                }}
              />
              {/* Centro */}
              <circle cx="24" cy="24" r="2" fill="#818cf8" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <div className="text-center space-y-1">
          <p className="text-white font-semibold text-base">
            Analizando arquitectura multicloud
          </p>
          <p className="text-white/40 text-xs">
            Gemini 2.5 Flash está procesando tu solicitud
          </p>
        </div>

        {/* Pasos animados */}
        <div className="w-full space-y-2">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs text-white/40"
              style={{
                animation: `fadeInStep 0.5s ease forwards`,
                animationDelay: `${i * 1.2}s`,
                opacity: 0,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 animate-pulse" />
              {step}
            </div>
          ))}
        </div>

        {/* Barra de progreso indeterminada */}
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
            style={{ animation: "progressBar 2s ease-in-out infinite" }}
          />
        </div>
      </div>

    </div>
  );
}
