# Cloud Panel — Arquitecto Multicloud FinOps

Panel web agentic impulsado por **Google Gemini** que analiza proyectos de software, propone arquitecturas optimizadas en AWS, Azure y GCP bajo criterios FinOps, y genera código Terraform listo para producción.

---

## Requisitos previos

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://www.docker.com/products/docker-desktop/) (solo para modo contenedor)
- Una clave de API de Google Gemini → [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## Configuración de la API Key

La aplicación requiere la variable de entorno `GOOGLE_GENERATIVE_AI_API_KEY`.

### Opción A — Desarrollo local (`npm run dev`)

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env.local
   ```
2. Edita `.env.local` con tu clave real:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyTU_CLAVE_AQUI
   ```
3. Inicia el servidor:
   ```bash
   npm install
   npm run dev
   # → http://localhost:3000
   ```

> `.env.local` está en `.gitignore` y **nunca** se sube al repositorio.

---

### Opción B — Contenedor Docker

La imagen está publicada en Docker Hub: `j3rryg3/cloudpanel:v.1.1`

#### Con `-e` (más simple)

```bash
docker run -d \
  -p 8080:8080 \
  -e GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyTU_CLAVE_AQUI \
  --name cloud-panel \
  --restart unless-stopped \
  j3rryg3/cloudpanel:v.1.1
```

#### Con `--env-file` (más seguro)

Crea `secrets.env` (no lo subas a Git):
```env
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyTU_CLAVE_AQUI
```

```bash
docker run -d \
  -p 8080:8080 \
  --env-file secrets.env \
  --name cloud-panel \
  --restart unless-stopped \
  j3rryg3/cloudpanel:v.1.1
```

#### Con Docker Compose

```yaml
services:
  cloud-panel:
    image: j3rryg3/cloudpanel:v.1.1
    ports:
      - "8080:8080"
    environment:
      - GOOGLE_GENERATIVE_AI_API_KEY=${GOOGLE_GENERATIVE_AI_API_KEY}
    restart: unless-stopped
```

```bash
# Archivo .env en el mismo directorio:
# GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyTU_CLAVE_AQUI

docker compose up -d
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript strict |
| Estilos | Tailwind CSS + Radix UI |
| Estado global | Zustand |
| Validación LLM | Zod (Structured Outputs) |
| IA Backend | Vercel AI SDK + **Google Gemini 2.0 Flash** |
| Generación IaC | JSZip → Terraform |
| Contenedor | Docker multi-stage, puerto 8080 |

---

## Versiones Docker Hub

| Tag | Descripción |
|---|---|
| `v.1.1` | Motor IA: Google Gemini 2.0 Flash |
| `v.1.0` | Motor IA: Anthropic Claude Sonnet |

---

*Generado con [Claude Code](https://claude.ai/code)*
