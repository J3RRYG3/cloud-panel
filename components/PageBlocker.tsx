"use client";

import { useArchitectureStore } from "@/store/useArchitectureStore";
import { cn } from "@/lib/utils";

/**
 * Envuelve el contenido de la página y aplica:
 *  - pointer-events-none  → ningún click ni hover llega a los elementos
 *  - opacity-50           → efecto visual "grisado"
 *  - select-none          → el usuario no puede seleccionar texto
 *  - transition-all       → la transición es suave al entrar/salir del estado de carga
 *
 * El LoadingOverlay (z-50) vive fuera de este wrapper para no verse afectado.
 */
export function PageBlocker({ children }: { children: React.ReactNode }) {
  const isLoading = useArchitectureStore((s) => s.isLoading);

  return (
    <div
      className={cn(
        "transition-all duration-300",
        isLoading && "pointer-events-none opacity-50 select-none"
      )}
    >
      {children}
    </div>
  );
}
