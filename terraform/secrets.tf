resource "google_secret_manager_secret" "apollo_api_key" {
  secret_id = "${var.name}-apollo-api-key"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "apollo_api_key" {
  secret      = google_secret_manager_secret.apollo_api_key.id
  secret_data = var.apollo_api_key
}

resource "google_secret_manager_secret" "lemlist_api_key" {
  secret_id = "${var.name}-lemlist-api-key"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "lemlist_api_key" {
  secret      = google_secret_manager_secret.lemlist_api_key.id
  secret_data = var.lemlist_api_key
}
