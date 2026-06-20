import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { ArchitectureResponseSchema } from "@/lib/schemas";
import { z } from "zod";

const SYSTEM_PROMPT = `Eres un Arquitecto de Nube Senior y Especialista FinOps con 15 años de experiencia en AWS, Azure y Google Cloud Platform. Tu misión es analizar descripciones de proyectos de software y proponer la arquitectura de infraestructura óptima bajo criterios de costo-eficiencia.

Para cada categoría de infraestructura (Cómputo, Almacenamiento, Base de Datos, Redes, Seguridad, etc.) debes proponer un servicio específico para AWS, Azure y GCP.

CRITERIOS DE SELECCIÓN DE SERVICIOS (CRÍTICO):
- Elige el servicio ÓPTIMO para el caso de uso descrito, no siempre el más conocido.
- Ejemplo: para cargas sin gestión de servidores elige ECS/Fargate (no EKS). Para orquestación Kubernetes compleja elige EKS/AKS/GKE. Para bases de datos serverless elige Aurora Serverless (no RDS). Justifica siempre.
- El campo "rationale" debe explicar en 1-2 oraciones POR QUÉ se eligió ese servicio específico para este proyecto (ej: "Se eligió ECS Fargate en lugar de EKS porque el proyecto no requiere orquestación Kubernetes compleja y Fargate elimina la gestión de nodos, reduciendo costos operativos.").
- El campo "alternativeService" debe nombrar el servicio EQUIVALENTE del mismo proveedor que NO se eligió (ej: si elegiste ECS, la alternativa es "Amazon EKS").
- El campo "alternativeServiceCost" debe ser el costo mensual estimado de esa alternativa no elegida.

Reglas estrictas del esquema:
- Cada categoría DEBE tener exactamente 3 servicios: uno para AWS, uno para Azure y uno para GCP.
- Los costos deben ser números reales en USD por mes.
- Genera entre 4 y 7 categorías según la complejidad del proyecto.
- Los costos deben reflejar precios de mercado actuales (2024-2025).
- Incluye al menos 3 especificaciones técnicas por servicio.
- El resumen del proyecto debe ser de 2-3 oraciones concisas.
- "rationale" es obligatorio y debe ser específico al proyecto, no genérico.
- "alternativeService" debe ser un servicio real del mismo proveedor (AWS→AWS, Azure→Azure, GCP→GCP).`;

const RequestBodySchema = z.object({
  prompt: z.string().min(10).max(5000),
});

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") {
    return NextResponse.json(
      {
        error:
          "La variable de entorno GOOGLE_GENERATIVE_AI_API_KEY no está configurada. Agrégala en tu archivo .env.local o pásala al contenedor Docker con -e GOOGLE_GENERATIVE_AI_API_KEY=AIza...",
      },
      { status: 500 }
    );
  }

  const google = createGoogleGenerativeAI({ apiKey });

  try {
    const body = await request.json();
    const parsed = RequestBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "El prompt debe tener entre 10 y 5000 caracteres." },
        { status: 400 }
      );
    }

    const { prompt } = parsed.data;

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: ArchitectureResponseSchema,
      system: SYSTEM_PROMPT,
      prompt: `Analiza el siguiente proyecto y genera la arquitectura multicloud óptima con justificación de cada elección:\n\n${prompt}`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("Error en generate-architecture:", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
