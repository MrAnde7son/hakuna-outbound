# Backend (FastAPI) and frontend (nginx static) Cloud Run services.
#
# Image tags are bumped out-of-band by CI (scripts/deploy.sh re-aliases :latest
# and rolls a new revision pinned to the git SHA), so Terraform ignores image
# drift on both services — the same pattern used by hakuna-signal.
#
# NOTE: backend persists state to a local SQLite file at $DB_PATH. On Cloud Run
# this is ephemeral per-instance — fine for a single-instance prototype but
# data will not survive revisions or scale-out. Migrate to Cloud SQL Postgres
# (or mount a GCS bucket via gcsfuse) before relying on this in real production.

# ---------- Backend service ----------

resource "google_service_account" "backend" {
  account_id   = "${var.name}-backend"
  display_name = "${var.name} backend Cloud Run service"
}

resource "google_project_iam_member" "backend_aiplatform" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

resource "google_secret_manager_secret_iam_member" "backend_apollo" {
  secret_id = google_secret_manager_secret.apollo_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.backend.email}"
}

resource "google_secret_manager_secret_iam_member" "backend_lemlist" {
  secret_id = google_secret_manager_secret.lemlist_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.backend.email}"
}

resource "google_cloud_run_v2_service" "backend" {
  name                = "${var.name}-backend"
  location            = var.region
  deletion_protection = false
  ingress             = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.backend.email

    scaling {
      min_instance_count = 0
      max_instance_count = 4
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.images.repository_id}/${var.name}-backend:${var.image_tag}"

      ports {
        container_port = 8000
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
        cpu_idle = true
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "GCP_LOCATION"
        value = var.vertex_location
      }
      env {
        name  = "VERTEX_MODEL"
        value = var.vertex_model
      }
      env {
        name  = "CORS_ORIGINS"
        value = var.cors_origins
      }
      env {
        name  = "DB_PATH"
        value = "/tmp/hakuna.db"
      }

      env {
        name = "APOLLO_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.apollo_api_key.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "LEMLIST_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.lemlist_api_key.secret_id
            version = "latest"
          }
        }
      }
    }
  }

  depends_on = [
    google_project_service.apis,
    google_artifact_registry_repository.images,
    google_secret_manager_secret_iam_member.backend_apollo,
    google_secret_manager_secret_iam_member.backend_lemlist,
  ]

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }
}

resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  location = google_cloud_run_v2_service.backend.location
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ---------- Frontend service ----------

resource "google_service_account" "frontend" {
  account_id   = "${var.name}-frontend"
  display_name = "${var.name} frontend Cloud Run service"
}

resource "google_cloud_run_v2_service" "frontend" {
  name                = "${var.name}-frontend"
  location            = var.region
  deletion_protection = false
  ingress             = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.frontend.email

    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.images.repository_id}/${var.name}-frontend:${var.image_tag}"

      ports {
        container_port = 80
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
        cpu_idle = true
      }
    }
  }

  depends_on = [
    google_project_service.apis,
    google_artifact_registry_repository.images,
  ]

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }
}

resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  location = google_cloud_run_v2_service.frontend.location
  name     = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
