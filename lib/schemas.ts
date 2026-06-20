import { z } from "zod";

export const ProviderSchema = z.enum(["AWS", "Azure", "GCP"]);
export type Provider = z.infer<typeof ProviderSchema>;

export const ServiceOptionSchema = z.object({
  provider: ProviderSchema,
  serviceName: z.string().min(1),
  monthlyEstimatedCost: z.number().nonnegative(),
  description: z.string().min(1),
  specifications: z.array(z.string()),
  rationale: z.string().min(1),
  alternativeService: z.string().min(1),
  alternativeServiceCost: z.number().nonnegative(),
});
export type ServiceOption = z.infer<typeof ServiceOptionSchema>;

export const ServiceCategorySchema = z.object({
  categoryName: z.string().min(1),
  services: z
    .array(ServiceOptionSchema)
    .length(3)
    .refine(
      (services) => {
        const providers = services.map((s) => s.provider);
        return (
          providers.includes("AWS") &&
          providers.includes("Azure") &&
          providers.includes("GCP")
        );
      },
      { message: "Cada categoría debe tener exactamente un servicio por proveedor (AWS, Azure, GCP)" }
    ),
});
export type ServiceCategory = z.infer<typeof ServiceCategorySchema>;

export const ArchitectureResponseSchema = z.object({
  projectSummary: z.string().min(1),
  categories: z.array(ServiceCategorySchema).min(1),
});
export type ArchitectureResponse = z.infer<typeof ArchitectureResponseSchema>;

export type FinOpsStatus = "cheapest" | "middle" | "expensive";

export function getFinOpsStatus(
  services: ServiceOption[],
  provider: Provider
): FinOpsStatus {
  const sorted = [...services].sort(
    (a, b) => a.monthlyEstimatedCost - b.monthlyEstimatedCost
  );
  const index = sorted.findIndex((s) => s.provider === provider);
  if (index === 0) return "cheapest";
  if (index === 1) return "middle";
  return "expensive";
}
