output "backend_url" {
  description = "Public Cloud Run URL for the backend API."
  value       = google_cloud_run_v2_service.backend.uri
}

output "frontend_url" {
  description = "Public Cloud Run URL for the frontend."
  value       = google_cloud_run_v2_service.frontend.uri
}

output "image_repo" {
  description = "Push container images here."
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.images.repository_id}"
}

output "backend_image" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.images.repository_id}/${var.name}-backend"
}

output "frontend_image" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.images.repository_id}/${var.name}-frontend"
}

# ---------- Values to set as GitHub Actions repo variables ----------

output "gh_workload_identity_provider" {
  description = "Set as GitHub Actions variable GCP_WORKLOAD_IDENTITY_PROVIDER."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "gh_deploy_service_account" {
  description = "Set as GitHub Actions variable GCP_DEPLOY_SERVICE_ACCOUNT."
  value       = google_service_account.github_deploy.email
}

output "gh_setup_command" {
  description = "Copy-paste setup for `gh` CLI."
  value       = <<-EOT
    gh variable set GCP_PROJECT_ID --body "${var.project_id}"
    gh variable set GCP_REGION --body "${var.region}"
    gh variable set GCP_RESOURCE_NAME --body "${var.name}"
    gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER --body "${google_iam_workload_identity_pool_provider.github.name}"
    gh variable set GCP_DEPLOY_SERVICE_ACCOUNT --body "${google_service_account.github_deploy.email}"
  EOT
}
