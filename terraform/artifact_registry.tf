resource "google_artifact_registry_repository" "images" {
  location      = var.region
  repository_id = "${var.name}-images"
  format        = "DOCKER"
  description   = "Container images for ${var.name} (backend + frontend)"
  depends_on    = [google_project_service.apis]
}
