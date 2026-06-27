import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { ArchitectureResponseSchema } from "@/lib/schemas";
import { z } from "zod";

// Paso 2: compilador estricto de Terraform — traduce el JSON estructurado
// del Paso 1 a código HCL usando los recursos administrados/serverless correctos.
const TERRAFORM_COMPILER_PROMPT = `Eres un compilador de Terraform estricto y preciso. Tu ÚNICA función es generar código HCL válido para el archivo main.tf de Terraform basándote en el JSON de arquitectura proporcionado.

REGLAS ABSOLUTAS (NO NEGOCIABLES):
1. Genera EXCLUSIVAMENTE el contenido del archivo main.tf en formato HCL. Sin explicaciones, sin markdown, sin bloques de código (sin triple backtick).
2. Implementa SOLAMENTE los servicios que aparecen en "SERVICIOS SELECCIONADOS" del input. Un servicio = un recurso principal.
3. Usa los recursos Terraform EXACTOS según este mapeo obligatorio:

── GCP ──────────────────────────────────────────────────────────────
"Cloud Run" / "Google Cloud Run"         → google_cloud_run_v2_service
"Cloud SQL" / "Google Cloud SQL"         → google_sql_database_instance
"Cloud Storage" / "Google Cloud Storage" → google_storage_bucket
"GKE" / "Google Kubernetes Engine"       → google_container_cluster
"Cloud Functions"                        → google_cloudfunctions2_function
"Pub/Sub" / "Google Pub/Sub"             → google_pubsub_topic
"BigQuery"                               → google_bigquery_dataset
"Cloud Armor"                            → google_compute_security_policy
"Cloud Load Balancing"                   → google_compute_url_map
"Cloud VPC" / "VPC"                      → google_compute_network
"Cloud Memorystore" / "Memorystore"      → google_redis_instance
"Cloud Spanner"                          → google_spanner_instance
"Firestore"                              → google_firestore_database
"Secret Manager"                         → google_secret_manager_secret
"Cloud NAT"                              → google_compute_router_nat

── AWS ──────────────────────────────────────────────────────────────
"ECS Fargate" / "AWS Fargate"            → aws_ecs_cluster + aws_ecs_task_definition + aws_ecs_service
"Lambda" / "AWS Lambda"                  → aws_lambda_function
"RDS" / "Amazon RDS"                     → aws_db_instance
"Aurora" / "Aurora Serverless"           → aws_rds_cluster
"S3" / "Amazon S3"                       → aws_s3_bucket
"EKS" / "Amazon EKS"                     → aws_eks_cluster
"API Gateway"                            → aws_api_gateway_rest_api
"CloudFront"                             → aws_cloudfront_distribution
"WAF" / "AWS WAF"                        → aws_wafv2_web_acl
"VPC" / "Amazon VPC"                     → aws_vpc
"SQS" / "Amazon SQS"                     → aws_sqs_queue
"SNS" / "Amazon SNS"                     → aws_sns_topic
"DynamoDB"                               → aws_dynamodb_table
"ElastiCache"                            → aws_elasticache_cluster
"Secrets Manager"                        → aws_secretsmanager_secret
"Route 53"                               → aws_route53_zone
"ALB" / "Application Load Balancer"     → aws_lb

── Azure ────────────────────────────────────────────────────────────
"Container Apps" / "Azure Container Apps"     → azurerm_container_app_environment + azurerm_container_app
"Container Instances" / "ACI"                 → azurerm_container_group
"App Service" / "Azure App Service"           → azurerm_linux_web_app
"Azure SQL Database" / "Azure SQL"            → azurerm_mssql_server + azurerm_mssql_database
"Cosmos DB" / "Azure Cosmos DB"               → azurerm_cosmosdb_account
"Blob Storage" / "Azure Storage"              → azurerm_storage_account + azurerm_storage_container
"AKS" / "Azure Kubernetes Service"            → azurerm_kubernetes_cluster
"Azure Functions"                             → azurerm_linux_function_app
"API Management" / "APIM"                     → azurerm_api_management
"Azure CDN" / "Front Door"                    → azurerm_cdn_profile
"Application Gateway" / "Azure WAF"          → azurerm_application_gateway
"Virtual Network" / "VNet"                    → azurerm_virtual_network
"Service Bus"                                 → azurerm_servicebus_namespace
"Key Vault"                                   → azurerm_key_vault
"Azure Cache for Redis" / "Redis Cache"       → azurerm_redis_cache
"Azure Database for PostgreSQL"               → azurerm_postgresql_flexible_server
"Azure Database for MySQL"                    → azurerm_mysql_flexible_server

4. PROHIBIDO ESTRICTAMENTE usar: "aws_instance", "google_compute_instance", "azurerm_virtual_machine" para cualquier servicio administrado o serverless.
5. Incluye tags o labels usando var.project_name y var.environment en todos los recursos.
6. Para Azure, siempre incluye un recurso "azurerm_resource_group" como dependencia base.
7. Si el servicio exacto no está en el mapeo, infiere el recurso Terraform correcto basándote en el tipo de servicio (administrado/serverless vs. VM), NUNCA uses VMs genéricas como fallback.`;

const RequestBodySchema = z.object({
  prompt: z.string().min(1).max(5000),
  architectureData: ArchitectureResponseSchema,
  selectedServices: z.record(z.string(), z.enum(["AWS", "Azure", "GCP"])),
});

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") {
    return NextResponse.json(
      {
        error:
          "La variable de entorno GOOGLE_GENERATIVE_AI_API_KEY no está configurada.",
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
        { error: "Datos de entrada inválidos para generar Terraform." },
        { status: 400 }
      );
    }

    const { prompt, architectureData, selectedServices } = parsed.data;

    // Construir resumen legible de los servicios seleccionados
    const selectedLines = architectureData.categories
      .map((cat) => {
        const provider = selectedServices[cat.categoryName];
        if (!provider) return null;
        const svc = cat.services.find((s) => s.provider === provider);
        if (!svc) return null;
        return `  - Categoría: "${cat.categoryName}" | Proveedor: ${provider} | Servicio: ${svc.serviceName} | Specs: ${svc.specifications.slice(0, 3).join(", ")}`;
      })
      .filter(Boolean)
      .join("\n");

    const userPrompt = `DESCRIPCIÓN ORIGINAL DEL PROYECTO:
${prompt}

JSON DE ARQUITECTURA GENERADO EN EL PASO 1:
${JSON.stringify(architectureData, null, 2)}

SERVICIOS SELECCIONADOS POR EL USUARIO (fuente de verdad para main.tf):
${selectedLines}

Genera el archivo main.tf que implemente EXACTAMENTE y ÚNICAMENTE los servicios listados en "SERVICIOS SELECCIONADOS". Usa los recursos Terraform correctos según el mapeo especificado. Responde solo con código HCL válido.`;

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: TERRAFORM_COMPILER_PROMPT,
      prompt: userPrompt,
    });

    // Limpiar bloques de código markdown si el modelo los incluye
    const mainTf = text
      .replace(/^```(?:hcl|terraform|tf)?\s*\n?/gim, "")
      .replace(/^```\s*$/gim, "")
      .trim();

    return NextResponse.json({ mainTf });
  } catch (error) {
    console.error("Error en generate-terraform (Paso 2):", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
