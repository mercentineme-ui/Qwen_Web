#!/usr/bin/env bash
# ============================================================
# PORTFOLIO_E4 — FULL PRODUCTION SNAPSHOT
# One-command Git snapshot: commit + branch + tag + push.
#
# Run from the project root:   bash portfolio_e4_snapshot.sh
#
# Safe & idempotent: never destroys existing branch/tag history.
# ============================================================
set -euo pipefail

# --- CONFIG (edit the remote URL if your repository differs) ---
REMOTE_NAME="origin"
REMOTE_URL="https://github.com/mercentineme-ui/Qwen_Web.git"
SNAPSHOT="portfolio_E4"
COMMIT_MSG="PORTFOLIO_E4 — FULL PRODUCTION SNAPSHOT"

echo "==> PORTFOLIO_E4 snapshot"

# 1. Ensure we are inside a git repository (init if missing).
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "==> No git repo found — initializing."
  git init -b master
fi

# 2. Record the base branch we are snapshotting from.
BASE_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "==> Base branch: ${BASE_BRANCH}"

# 3. Stage the COMPLETE current working tree.
git add -A
if git diff --cached --quiet; then
  echo "==> No pending changes — working tree already committed."
  SNAPSHOT_COMMIT="$(git rev-parse HEAD)"
else
  git commit -m "${COMMIT_MSG}"
  SNAPSHOT_COMMIT="$(git rev-parse HEAD)"
  echo "==> Committed ${SNAPSHOT_COMMIT}"
fi

# 4. Create the snapshot branch (preserve any existing history).
if git show-ref --verify --quiet "refs/heads/${SNAPSHOT}"; then
  echo "==> Branch '${SNAPSHOT}' exists — moving it to the snapshot commit (old tip preserved in reflog)."
  git branch -f "${SNAPSHOT}" "${SNAPSHOT_COMMIT}"
else
  git branch "${SNAPSHOT}" "${SNAPSHOT_COMMIT}"
  echo "==> Created branch '${SNAPSHOT}'."
fi

# 5. Create the snapshot tag (preserve any existing tag).
if git rev-parse -q --verify "refs/tags/${SNAPSHOT}" >/dev/null; then
  echo "==> Tag '${SNAPSHOT}' exists — moving it to the snapshot commit (old tag preserved in reflog)."
  git tag -f -a "${SNAPSHOT}" -m "${COMMIT_MSG}" "${SNAPSHOT_COMMIT}"
else
  git tag -a "${SNAPSHOT}" -m "${COMMIT_MSG}" "${SNAPSHOT_COMMIT}"
  echo "==> Created tag '${SNAPSHOT}'."
fi

# 6. Ensure the remote exists (do not clobber an existing remote).
if ! git remote get-url "${REMOTE_NAME}" >/dev/null 2>&1; then
  echo "==> Adding remote '${REMOTE_NAME}' -> ${REMOTE_URL}"
  git remote add "${REMOTE_NAME}" "${REMOTE_URL}"
else
  echo "==> Remote '${REMOTE_NAME}' already present: $(git remote get-url "${REMOTE_NAME}")"
fi

# 7. Push the snapshot branch and tag.
echo "==> Pushing branch + tag to '${REMOTE_NAME}'…"
git push -u "${REMOTE_NAME}" "${SNAPSHOT}"
git push "${REMOTE_NAME}" "${SNAPSHOT}"

echo ""
echo "==> SNAPSHOT COMPLETE"
echo "    commit : ${SNAPSHOT_COMMIT}"
echo "    branch : ${SNAPSHOT}"
echo "    tag    : ${SNAPSHOT}"
echo "    remote : $(git remote get-url "${REMOTE_NAME}")"
echo "==> Recover later with: git checkout ${SNAPSHOT}  (or: git checkout tags/${SNAPSHOT})"
