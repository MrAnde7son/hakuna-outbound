variable "project_id" {
  type        = string
  description = "GCP project ID (e.g. hakuna-prod-2026)"
}

variable "region" {
  type        = string
  description = "GCP region for Cloud Run + Artifact Registry. Match VERTEX region for lower latency."
  default     = "us-central1"
}

variable "name" {
  type        = string
  description = "Resource name prefix for all GCP resources."
  default     = "hakuna-outbound"
}

variable "image_tag" {
  type        = string
  description = "Image tag to deploy on first apply. CI bumps this out-of-band by re-aliasing :latest."
  default     = "latest"
}

variable "vertex_location" {
  type        = string
  description = "Vertex AI region passed to backend as GCP_LOCATION."
  default     = "us-central1"
}

variable "vertex_model" {
  type        = string
  description = "Vertex model id passed to backend."
  default     = "gemini-2.5-flash"
}

variable "cors_origins" {
  type        = string
  description = "Comma-separated list of allowed origins for the backend CORS middleware."
  default     = ""
}

variable "apollo_api_key" {
  type        = string
  description = "Apollo API key. Stored in Secret Manager. Keep out of VCS."
  sensitive   = true
}

variable "lemlist_api_key" {
  type        = string
  description = "Lemlist API key. Stored in Secret Manager. Keep out of VCS."
  sensitive   = true
}

# ---------- GitHub Actions Workload Identity Federation ----------

variable "github_repo" {
  type        = string
  description = <<-EOT
    GitHub repository in `owner/name` form authorized to deploy via WIF.
    Only pushes from this repo can mint tokens for the deploy SA.
  EOT
  default     = "MrAnde7son/hakuna-outbound"
}

variable "github_deploy_branches" {
  type        = list(string)
  description = "Refs allowed to deploy. Defaults to main only."
  default     = ["refs/heads/main"]
}

# ---------- Cloudflare DNS ----------

variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare zone ID for hakunahq.com."
  default     = "e4e3883c2faef916330a88bb0c7e303e"
}

variable "hostname" {
  type        = string
  description = "Public hostname for the frontend Cloud Run service."
  default     = "outbound.hakunahq.com"
}
