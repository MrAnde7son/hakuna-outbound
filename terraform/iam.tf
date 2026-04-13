# Workload Identity Federation for GitHub Actions.
#
# Lets the CI workflow exchange a GitHub OIDC token for a short-lived GCP
# access token — no JSON service account keys committed to GitHub Secrets.
# The deploy SA is constrained to the repo in var.github_repo via the
# attribute_condition on the provider.

resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "${var.name}-github"
  display_name              = "${var.name} GitHub Actions"
  depends_on                = [google_project_service.apis]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
  display_name                       = "GitHub OIDC"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  # Lock down to the configured repo. Without this, any repo on github.com
  # using this provider could mint tokens.
  attribute_condition = "assertion.repository == \"${var.github_repo}\""

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account" "github_deploy" {
  account_id   = "${var.name}-deploy"
  display_name = "${var.name} GitHub Actions deploy SA"
}

# Permissions the deploy SA needs to push images and roll Cloud Run revisions.
resource "google_project_iam_member" "github_deploy_roles" {
  for_each = toset([
    "roles/run.admin",                # deploy / update Cloud Run services
    "roles/artifactregistry.writer",  # push images
    "roles/cloudbuild.builds.editor", # submit builds
    "roles/storage.admin",            # Cloud Build staging bucket
    "roles/iam.serviceAccountUser",   # actAs backend/frontend runtime SAs
    "roles/logging.viewer",           # read build logs
  ])
  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.github_deploy.email}"
}

# Bind the WIF principalSet to the deploy SA, scoped to the configured repo.
resource "google_service_account_iam_member" "github_wif_binding" {
  service_account_id = google_service_account.github_deploy.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repo}"
}
