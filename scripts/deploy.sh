#!/usr/bin/env bash
#
# Deploy hakuna-outbound to prod (Cloud Run backend + frontend).
#
# Mirrors hakuna-signal's deploy idiom:
#   1. Build both images via Cloud Build, tagged with the git short SHA.
#   2. Re-alias :latest to the new SHA tag.
#   3. Roll new Cloud Run revisions pinned to the SHA tag (NOT :latest), so
#      Cloud Run's revision history mirrors git history for clean rollbacks.
#
# Terraform ignores image tag drift on both services on purpose, so this
# script IS the deploy — no `terraform apply` needed for code rollouts.
#
# Usage (local):
#   scripts/deploy.sh           # build + deploy both services
#   scripts/deploy.sh --dirty   # allow uncommitted changes
#
# Rollback:
#   gcloud run services update-traffic hakuna-outbound-backend \
#     --region us-central1 --to-revisions <previous-revision>=100
#
# Env overrides (defaults match terraform/terraform.tfvars):
#   PROJECT_ID=hakuna-prod-2026
#   REGION=us-central1
#   NAME=hakuna-outbound

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-hakuna-prod-2026}"
REGION="${REGION:-us-central1}"
NAME="${NAME:-hakuna-outbound}"

ALLOW_DIRTY=0
for arg in "$@"; do
  case "$arg" in
    --dirty) ALLOW_DIRTY=1 ;;
    -h|--help)
      grep -E '^# ?' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "unknown arg: $arg" >&2
      exit 1
      ;;
  esac
done

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "error: gcloud not found in PATH" >&2
  exit 1
fi

if [ -n "$(git status --porcelain)" ] && [ "$ALLOW_DIRTY" -eq 0 ]; then
  echo "error: working tree has uncommitted changes. commit, stash, or pass --dirty." >&2
  git status --short >&2
  exit 1
fi

GIT_SHA="$(git rev-parse --short HEAD)"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
REPO="${REGION}-docker.pkg.dev/${PROJECT_ID}/${NAME}-images"

BACKEND_IMAGE_BASE="${REPO}/${NAME}-backend"
FRONTEND_IMAGE_BASE="${REPO}/${NAME}-frontend"
BACKEND_IMAGE_SHA="${BACKEND_IMAGE_BASE}:${GIT_SHA}"
FRONTEND_IMAGE_SHA="${FRONTEND_IMAGE_BASE}:${GIT_SHA}"

echo "==> Deploying ${NAME}"
echo "    project : ${PROJECT_ID}"
echo "    region  : ${REGION}"
echo "    branch  : ${BRANCH}"
echo "    sha     : ${GIT_SHA}"
echo

# Resolve the backend URL *before* building the frontend so VITE_API_URL gets
# baked into the JS bundle at build time. On the very first deploy the service
# may not exist yet — fall back to a placeholder and require a re-deploy after
# the first apply (or set VITE_API_URL via env).
if BACKEND_URL="$(gcloud run services describe "${NAME}-backend" \
      --project "${PROJECT_ID}" --region "${REGION}" \
      --format='value(status.url)' 2>/dev/null)"; then
  echo "    backend url (resolved): ${BACKEND_URL}"
else
  BACKEND_URL="${VITE_API_URL:-}"
  if [ -z "${BACKEND_URL}" ]; then
    echo "warn: backend service not found and VITE_API_URL not set — frontend bundle will hit relative URLs." >&2
  fi
fi

# Cloud Build flags:
#   --default-buckets-behavior=REGIONAL_USER_OWNED_BUCKET
#     Avoid Cloud Build's global logs bucket which requires project Viewer to
#     stream logs — the github-deploy SA intentionally doesn't have that role.
echo "==> Building backend image..."
gcloud builds submit ./backend \
  --project "${PROJECT_ID}" \
  --tag "${BACKEND_IMAGE_SHA}" \
  --default-buckets-behavior=REGIONAL_USER_OWNED_BUCKET \
  --region "${REGION}"

echo
echo "==> Building frontend image (VITE_API_URL=${BACKEND_URL:-<unset>})..."
# Use a one-shot cloudbuild config so we can pass build-arg into Docker.
cat > /tmp/${NAME}-frontend-cloudbuild.yaml <<EOF
steps:
  - name: gcr.io/cloud-builders/docker
    args:
      - build
      - --build-arg
      - VITE_API_URL=${BACKEND_URL}
      - -t
      - ${FRONTEND_IMAGE_SHA}
      - .
images:
  - ${FRONTEND_IMAGE_SHA}
options:
  defaultLogsBucketBehavior: REGIONAL_USER_OWNED_BUCKET
EOF
gcloud builds submit ./frontend \
  --project "${PROJECT_ID}" \
  --config /tmp/${NAME}-frontend-cloudbuild.yaml \
  --region "${REGION}"
rm -f /tmp/${NAME}-frontend-cloudbuild.yaml

echo
echo "==> Re-aliasing :latest to ${GIT_SHA} for both images..."
gcloud artifacts docker tags add "${BACKEND_IMAGE_SHA}"  "${BACKEND_IMAGE_BASE}:latest"  --project "${PROJECT_ID}"
gcloud artifacts docker tags add "${FRONTEND_IMAGE_SHA}" "${FRONTEND_IMAGE_BASE}:latest" --project "${PROJECT_ID}"

# Cloud Run resolves image tags to digests at revision-creation time, so
# re-aliasing :latest above does NOT roll a new revision. Pin the deploy to
# the SHA tag so revision history mirrors git history.
echo
echo "==> Rolling backend revision to ${GIT_SHA}..."
gcloud run deploy "${NAME}-backend" \
  --project "${PROJECT_ID}" --region "${REGION}" \
  --image "${BACKEND_IMAGE_SHA}" --quiet

echo
echo "==> Rolling frontend revision to ${GIT_SHA}..."
gcloud run deploy "${NAME}-frontend" \
  --project "${PROJECT_ID}" --region "${REGION}" \
  --image "${FRONTEND_IMAGE_SHA}" --quiet

echo
echo "==> Done."
gcloud run services describe "${NAME}-backend"  --project "${PROJECT_ID}" --region "${REGION}" --format='value(status.url)'
gcloud run services describe "${NAME}-frontend" --project "${PROJECT_ID}" --region "${REGION}" --format='value(status.url)'
