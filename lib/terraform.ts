import type { ArchitectureResponse, ServiceCategory, Provider } from "@/lib/schemas";

interface SelectedServices {
  [categoryName: string]: Provider;
}

function getProviders(
  categories: ServiceCategory[],
  selectedServices: SelectedServices
): Set<Provider> {
  const providers = new Set<Provider>();
  for (const category of categories) {
    const provider = selectedServices[category.categoryName];
    if (provider) providers.add(provider);
  }
  return providers;
}

function generateProvidersTf(providers: Set<Provider>): string {
  const blocks: string[] = [
    `# ============================================================
# providers.tf — Configuración de proveedores cloud seleccionados
# Generado por Cloud Panel | ${new Date().toISOString().split("T")[0]}
# ============================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {`,
  ];

  if (providers.has("AWS")) {
    blocks.push(`    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }`);
  }
  if (providers.has("Azure")) {
    blocks.push(`    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }`);
  }
  if (providers.has("GCP")) {
    blocks.push(`    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }`);
  }

  blocks.push(`  }
}`);

  if (providers.has("AWS")) {
    blocks.push(`
provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}`);
  }

  if (providers.has("Azure")) {
    blocks.push(`
provider "azurerm" {
  features {}
  subscription_id = var.azure_subscription_id
  client_id       = var.azure_client_id
  client_secret   = var.azure_client_secret
  tenant_id       = var.azure_tenant_id
}`);
  }

  if (providers.has("GCP")) {
    blocks.push(`
provider "google" {
  project     = var.gcp_project_id
  region      = var.gcp_region
  credentials = var.gcp_credentials_file
}`);
  }

  return blocks.join("\n");
}

function generateVariablesTf(providers: Set<Provider>): string {
  const lines: string[] = [
    `# ============================================================
# variables.tf — Variables de configuración y credenciales
# IMPORTANTE: Usar variables de entorno o terraform.tfvars
# ============================================================
`,
  ];

  if (providers.has("AWS")) {
    lines.push(`variable "aws_region" {
  description = "Región de AWS donde se desplegarán los recursos"
  type        = string
  default     = "us-east-1"
}

variable "aws_access_key" {
  description = "AWS Access Key ID"
  type        = string
  sensitive   = true
}

variable "aws_secret_key" {
  description = "AWS Secret Access Key"
  type        = string
  sensitive   = true
}
`);
  }

  if (providers.has("Azure")) {
    lines.push(`variable "azure_subscription_id" {
  description = "ID de suscripción de Azure"
  type        = string
  sensitive   = true
}

variable "azure_client_id" {
  description = "ID de la aplicación de servicio en Azure AD"
  type        = string
  sensitive   = true
}

variable "azure_client_secret" {
  description = "Secreto de la aplicación de servicio en Azure AD"
  type        = string
  sensitive   = true
}

variable "azure_tenant_id" {
  description = "ID del tenant de Azure AD"
  type        = string
  sensitive   = true
}

variable "azure_location" {
  description = "Región de Azure"
  type        = string
  default     = "East US"
}
`);
  }

  if (providers.has("GCP")) {
    lines.push(`variable "gcp_project_id" {
  description = "ID del proyecto de Google Cloud"
  type        = string
  sensitive   = true
}

variable "gcp_region" {
  description = "Región de GCP"
  type        = string
  default     = "us-central1"
}

variable "gcp_credentials_file" {
  description = "Ruta al archivo de credenciales de cuenta de servicio GCP"
  type        = string
  sensitive   = true
}
`);
  }

  lines.push(`variable "project_name" {
  description = "Nombre del proyecto para etiquetado de recursos"
  type        = string
  default     = "cloud-panel-infra"
}

variable "environment" {
  description = "Entorno de despliegue (dev, staging, prod)"
  type        = string
  default     = "prod"
}`);

  return lines.join("\n");
}

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function generateMainTf(
  categories: ServiceCategory[],
  selectedServices: SelectedServices
): string {
  const lines: string[] = [
    `# ============================================================
# main.tf — Recursos principales de infraestructura
# Arquitectura seleccionada por Cloud Panel
# ============================================================
`,
  ];

  for (const category of categories) {
    const provider = selectedServices[category.categoryName];
    if (!provider) continue;

    const service = category.services.find((s) => s.provider === provider);
    if (!service) continue;

    const resourceName = sanitizeName(category.categoryName);

    lines.push(`# --- ${category.categoryName} (${provider}) ---
# Servicio: ${service.serviceName}
# Costo estimado: $${service.monthlyEstimatedCost.toFixed(2)}/mes
# ${service.description}
`);

    if (provider === "AWS") {
      if (
        category.categoryName.toLowerCase().includes("cómputo") ||
        category.categoryName.toLowerCase().includes("computo") ||
        category.categoryName.toLowerCase().includes("compute")
      ) {
        lines.push(`resource "aws_instance" "${resourceName}" {
  ami           = "ami-0c02fb55956c7d316" # Amazon Linux 2 (us-east-1)
  instance_type = "t3.medium"

  tags = {
    Name        = "\${var.project_name}-${resourceName}"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
`);
      } else if (
        category.categoryName.toLowerCase().includes("base") ||
        category.categoryName.toLowerCase().includes("datos") ||
        category.categoryName.toLowerCase().includes("database") ||
        category.categoryName.toLowerCase().includes("db")
      ) {
        lines.push(`resource "aws_db_instance" "${resourceName}" {
  identifier        = "\${var.project_name}-${resourceName}"
  engine            = "postgres"
  engine_version    = "15.4"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  username          = "admin"
  password          = var.aws_secret_key  # Use secrets manager in production

  skip_final_snapshot = true

  tags = {
    Name        = "\${var.project_name}-${resourceName}"
    Environment = var.environment
  }
}
`);
      } else {
        lines.push(`resource "aws_s3_bucket" "${resourceName}" {
  bucket = "\${var.project_name}-${resourceName}-\${var.environment}"

  tags = {
    Name        = "\${var.project_name}-${resourceName}"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
`);
      }
    } else if (provider === "Azure") {
      lines.push(`resource "azurerm_resource_group" "${resourceName}_rg" {
  name     = "\${var.project_name}-${resourceName}-rg"
  location = var.azure_location

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
`);
    } else if (provider === "GCP") {
      lines.push(`resource "google_compute_instance" "${resourceName}" {
  name         = "\${var.project_name}-${resourceName}"
  machine_type = "e2-medium"
  zone         = "\${var.gcp_region}-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}
`);
    }
  }

  return lines.join("\n");
}

function generateOutputsTf(
  categories: ServiceCategory[],
  selectedServices: SelectedServices
): string {
  const lines: string[] = [
    `# ============================================================
# outputs.tf — Valores de salida de la infraestructura
# ============================================================
`,
  ];

  for (const category of categories) {
    const provider = selectedServices[category.categoryName];
    if (!provider) continue;

    const resourceName = sanitizeName(category.categoryName);

    if (provider === "AWS") {
      lines.push(`output "${resourceName}_provider" {
  description = "Proveedor seleccionado para ${category.categoryName}"
  value       = "AWS"
}
`);
    } else if (provider === "Azure") {
      lines.push(`output "${resourceName}_resource_group" {
  description = "Grupo de recursos de Azure para ${category.categoryName}"
  value       = azurerm_resource_group.${resourceName}_rg.name
}
`);
    } else if (provider === "GCP") {
      lines.push(`output "${resourceName}_instance_id" {
  description = "ID de instancia GCP para ${category.categoryName}"
  value       = google_compute_instance.${resourceName}.instance_id
}
`);
    }
  }

  return lines.join("\n");
}

function generateGitignore(): string {
  return `# Archivos de estado de Terraform (contienen información sensible)
.terraform/
.terraform.lock.hcl
*.tfstate
*.tfstate.backup
*.tfstate.d/

# Archivos de variables con valores sensibles
*.tfvars
*.auto.tfvars
!example.tfvars

# Directorio de crash logs
crash.log
crash.*.log

# Archivos de override
override.tf
override.tf.json
*_override.tf
*_override.tf.json

# Archivos de plan
*.tfplan
`;
}

function generateReadme(
  data: ArchitectureResponse,
  selectedServices: SelectedServices,
  totalCost: number
): string {
  const selectedList = data.categories
    .map((cat) => {
      const provider = selectedServices[cat.categoryName];
      const service = cat.services.find((s) => s.provider === provider);
      return `- **${cat.categoryName}**: ${provider} — ${service?.serviceName} (~$${service?.monthlyEstimatedCost.toFixed(2)}/mes)`;
    })
    .join("\n");

  return `# Infraestructura Multicloud — Cloud Panel

## Resumen del Proyecto
${data.projectSummary}

## Arquitectura Seleccionada
${selectedList}

**Costo Total Estimado: ~$${totalCost.toFixed(2)} USD/mes**

---

## Prerrequisitos
- [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.5.0
- Credenciales de los proveedores cloud seleccionados

## Configuración de Credenciales

### Opción A: Variables de Entorno (Recomendado)
\`\`\`bash
# AWS
export TF_VAR_aws_access_key="tu-access-key"
export TF_VAR_aws_secret_key="tu-secret-key"

# Azure
export TF_VAR_azure_subscription_id="tu-subscription-id"
export TF_VAR_azure_client_id="tu-client-id"
export TF_VAR_azure_client_secret="tu-client-secret"
export TF_VAR_azure_tenant_id="tu-tenant-id"

# GCP
export TF_VAR_gcp_project_id="tu-project-id"
export TF_VAR_gcp_credentials_file="/ruta/a/credenciales.json"
\`\`\`

### Opción B: Archivo terraform.tfvars
Crea un archivo \`terraform.tfvars\` (NO lo subas a control de versiones):
\`\`\`hcl
aws_access_key = "tu-access-key"
# ... resto de variables
\`\`\`

## Comandos de Despliegue

\`\`\`bash
# 1. Inicializar Terraform (descarga providers)
terraform init

# 2. Revisar el plan de cambios
terraform plan

# 3. Aplicar la infraestructura
terraform apply

# 4. Para destruir la infraestructura
terraform destroy
\`\`\`

---
*Generado por [Cloud Panel](https://github.com/j3rryg3/cloudPanel) — ${new Date().toISOString().split("T")[0]}*
`;
}

export interface TerraformFiles {
  "providers.tf": string;
  "variables.tf": string;
  "main.tf": string;
  "outputs.tf": string;
  ".gitignore": string;
  "README.md": string;
}

export function generateTerraformFiles(
  data: ArchitectureResponse,
  selectedServices: SelectedServices,
  totalCost: number
): TerraformFiles {
  const providers = getProviders(data.categories, selectedServices);

  return {
    "providers.tf": generateProvidersTf(providers),
    "variables.tf": generateVariablesTf(providers),
    "main.tf": generateMainTf(data.categories, selectedServices),
    "outputs.tf": generateOutputsTf(data.categories, selectedServices),
    ".gitignore": generateGitignore(),
    "README.md": generateReadme(data, selectedServices, totalCost),
  };
}
