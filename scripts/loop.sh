#!/usr/bin/env bash
#
# loop.sh — single-task agent loop for Storyseed. See LOOP.md for the full
# design this script implements; this file should stay a direct translation
# of that document, not diverge from it.
#
# Bash is the orchestrator: every "did this succeed / loop again / stop"
# decision is a shell conditional checking a file, an exit code, or an
# iteration counter — never an LLM's self-report. Processes exactly ONE task
# from TASKS.md per run; it does not sweep the backlog.
#
# Stages: select task -> plan (fresh session) -> human approval gate ->
# implement (session captured) -> bash-checked test loop (resumes implementer
# on failure) -> fresh-context review (writes review-result.json) ->
# review-fix loop (resumes implementer, re-reviews with a fresh session) ->
# stop on success (hands off for human code review) or on MAX_ITERS exhausted.
#
# Usage:
#   scripts/loop.sh
#   MAX_ITERS=40 scripts/loop.sh
#   SKIP_E2E=1 scripts/loop.sh
#   CLAUDE_BIN=/path/to/claude CLAUDE_MODEL=claude-sonnet-5 scripts/loop.sh
#
# Env vars:
#   MAX_ITERS     max combined test-fix + review-fix rounds (default 25)
#   CLAUDE_BIN    path to the claude CLI (default: first on PATH)
#   CLAUDE_MODEL  optional --model passed to claude
#   SKIP_E2E      set to 1 to skip the Playwright gate (Jest + typecheck only)

set -uo pipefail

cd "$(dirname "$0")/.." || exit 1
ROOT="$(pwd)"

MAX_ITERS="${MAX_ITERS:-25}"
SKIP_E2E="${SKIP_E2E:-0}"
CLAUDE_BIN="${CLAUDE_BIN:-$(command -v claude || true)}"

if [[ -z "$CLAUDE_BIN" ]]; then
  echo "ERROR: claude CLI not found. Install it or set CLAUDE_BIN=/path/to/claude." >&2
  exit 1
fi
if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is required to parse claude's --output-format json responses." >&2
  exit 1
fi

MODEL_ARGS=()
[[ -n "${CLAUDE_MODEL:-}" ]] && MODEL_ARGS=(--model "$CLAUDE_MODEL")

TASKS_FILE="$ROOT/TASKS.md"
PLAN_FILE="$ROOT/plan.md"
REVIEW_FILE="$ROOT/review-result.json"
LOG_DIR="$ROOT/.loop"
mkdir -p "$LOG_DIR"

# ---- helpers ---------------------------------------------------------------

run_check() {
  local logfile="$1"; shift
  "$@" >"$logfile" 2>&1
}

# Invoke claude headlessly, capturing its JSON response to $3.
# $2 = session id to resume, or "" for a fresh session.
# --dangerously-skip-permissions lets the agent write files (plan.md,
# review-result.json, source/tests) unattended. Only run this in a trusted,
# checked-out working copy.
invoke_claude() {
  local prompt="$1" resume_id="$2" out_json="$3"
  local resume_args=()
  [[ -n "$resume_id" ]] && resume_args=(--resume "$resume_id")
  "$CLAUDE_BIN" -p "$prompt" \
    ${MODEL_ARGS[@]+"${MODEL_ARGS[@]}"} \
    ${resume_args[@]+"${resume_args[@]}"} \
    --output-format json \
    --dangerously-skip-permissions >"$out_json" 2>>"$LOG_DIR/claude-stderr.log"
}

RULES=$(cat <<'RULES'
Do NOT edit, weaken, skip, or delete any test to make it pass. data-testid
values and accessible names are a fixed API — see TEST_CONTRACT.md. Follow
design/README.md for layout/copy and use the tokens in lib/tokens.ts.
RULES
)

# ---- stage 1: select task ---------------------------------------------------

if [[ ! -f "$TASKS_FILE" ]]; then
  echo "ERROR: TASKS.md not found." >&2
  exit 1
fi

TASK_LINE=$(grep -m1 -n '^- \[ \] ' "$TASKS_FILE" || true)
if [[ -z "$TASK_LINE" ]]; then
  echo "No unchecked tasks in TASKS.md. Nothing to do."
  exit 0
fi
TASK_LINE_NO="${TASK_LINE%%:*}"
TASK_TEXT=$(printf '%s' "$TASK_LINE" | cut -d: -f2- | sed 's/^- \[ \] //')

echo "=== Task (line $TASK_LINE_NO): $TASK_TEXT ==="

# ---- stage 2: plan (fresh session) -----------------------------------------

rm -f "$PLAN_FILE"

PLAN_PROMPT=$(cat <<PROMPT
You are planning ONE task for Storyseed, per LOOP.md.

Task: $TASK_TEXT

Read PROJECT.md, ARCHITECTURE.md, TEST_CONTRACT.md, and design/README.md as
needed. Write a concise implementation plan to plan.md at the repo root.
Do NOT edit, create, or delete any other file, and do not write any code yet.

$RULES
PROMPT
)

echo "• planning..."
invoke_claude "$PLAN_PROMPT" "" "$LOG_DIR/plan-response.json"

if [[ ! -f "$PLAN_FILE" ]]; then
  echo "ERROR: planner did not produce plan.md. See $LOG_DIR/plan-response.json." >&2
  exit 1
fi

# ---- stage 3: human plan gate -----------------------------------------------

echo ""
echo "----- plan.md -----"
cat "$PLAN_FILE"
echo "--------------------"
echo ""
read -r -p "Approve this plan and start implementation? [y/N] " APPROVE
if [[ ! "$APPROVE" =~ ^[Yy]$ ]]; then
  echo "Plan rejected. Edit the task or plan.md, then re-run."
  exit 1
fi

# ---- stage 4: implement (new session, id captured) -------------------------

IMPLEMENT_PROMPT=$(cat <<PROMPT
Implement the approved plan in plan.md for this task, writing/updating tests
per TEST_CONTRACT.md as the plan calls for.

Task: $TASK_TEXT

$RULES
PROMPT
)

echo "• implementing..."
invoke_claude "$IMPLEMENT_PROMPT" "" "$LOG_DIR/implement-response.json"
IMPLEMENTER_SESSION=$(jq -r '.session_id // empty' "$LOG_DIR/implement-response.json")
if [[ -z "$IMPLEMENTER_SESSION" ]]; then
  echo "ERROR: could not capture implementer session id. See $LOG_DIR/implement-response.json." >&2
  exit 1
fi

# ---- stage 5: bash-checked test loop ---------------------------------------

TEST_FAILURE=""

run_tests() {
  local jest_log="$LOG_DIR/jest.log" tsc_log="$LOG_DIR/typecheck.log" e2e_log="$LOG_DIR/e2e.log"

  run_check "$jest_log" pnpm test
  local jest_status=$?
  run_check "$tsc_log" pnpm typecheck
  local tsc_status=$?

  if [[ $jest_status -ne 0 || $tsc_status -ne 0 ]]; then
    TEST_FAILURE=$(printf '===== JEST (exit %s) =====\n%s\n\n===== TYPECHECK (exit %s) =====\n%s' \
      "$jest_status" "$(tail -n 200 "$jest_log")" "$tsc_status" "$(tail -n 100 "$tsc_log")")
    return 1
  fi

  if [[ "$SKIP_E2E" != "1" ]]; then
    run_check "$e2e_log" pnpm test:e2e
    local e2e_status=$?
    if [[ $e2e_status -ne 0 ]]; then
      TEST_FAILURE=$(printf '===== PLAYWRIGHT E2E (exit %s) =====\n%s' "$e2e_status" "$(tail -n 250 "$e2e_log")")
      return 1
    fi
  fi

  return 0
}

# ---- stages 5-7: bounded test-fix / review-fix loop ------------------------

SUCCESS=0
REVIEW_STATUS="fail"
REVIEW_FINDINGS=""
ITER=0

while (( ITER < MAX_ITERS )); do
  ITER=$((ITER + 1))
  echo ""
  echo "----- iteration $ITER/$MAX_ITERS: tests -----"

  if ! run_tests; then
    echo "✗ tests failed — feeding back to implementer (resume $IMPLEMENTER_SESSION)."
    FIX_PROMPT=$(cat <<PROMPT
Tests are failing. Fix the most impactful failure(s).

$RULES

$TEST_FAILURE
PROMPT
)
    invoke_claude "$FIX_PROMPT" "$IMPLEMENTER_SESSION" "$LOG_DIR/fix-$ITER.json"
    continue
  fi
  echo "✓ tests green."

  echo "----- iteration $ITER/$MAX_ITERS: review (fresh session) -----"
  rm -f "$REVIEW_FILE"
  REVIEW_PROMPT=$(cat <<PROMPT
Review the current working-tree diff (run: git diff) for Storyseed against
PROJECT.md, ARCHITECTURE.md, and TEST_CONTRACT.md.

Task under review: $TASK_TEXT

Write your verdict to review-result.json at the repo root, exactly:
{"status": "pass" or "fail", "findings": [{"summary": "...", "file": "...", "line": 0}]}
Do not edit any other file.
PROMPT
)
  invoke_claude "$REVIEW_PROMPT" "" "$LOG_DIR/review-$ITER.json"

  if [[ ! -f "$REVIEW_FILE" ]]; then
    echo "✗ reviewer produced no review-result.json — treating as fail (fail-closed)."
    REVIEW_STATUS="fail"
    REVIEW_FINDINGS="(reviewer did not produce review-result.json — see $LOG_DIR/review-$ITER.json)"
  else
    REVIEW_STATUS=$(jq -r '.status // "fail"' "$REVIEW_FILE" 2>/dev/null || echo "fail")
    REVIEW_FINDINGS=$(jq -r '.findings // []' "$REVIEW_FILE" 2>/dev/null || echo "(malformed review-result.json)")
  fi

  if [[ "$REVIEW_STATUS" == "pass" ]]; then
    echo "✓ review passed."
    SUCCESS=1
    break
  fi

  echo "✗ review found issues — feeding back to implementer (resume $IMPLEMENTER_SESSION)."
  FIX_PROMPT=$(cat <<PROMPT
Code review found issues with your implementation. Address them.

$RULES

Findings:
$REVIEW_FINDINGS
PROMPT
)
  invoke_claude "$FIX_PROMPT" "$IMPLEMENTER_SESSION" "$LOG_DIR/review-fix-$ITER.json"
done

# ---- stage 8: stop ----------------------------------------------------------

if [[ "$SUCCESS" == "1" ]]; then
  echo ""
  echo "=== SUCCESS after $ITER iteration(s): tests green, review passed. ==="
  echo "Archiving plan into TASKS.md and marking the task done..."

  TMP_TASKS=$(mktemp)
  awk -v n="$TASK_LINE_NO" -v planfile="$PLAN_FILE" '
    NR==n {
      sub(/^- \[ \] /, "- [x] ")
      print
      print ""
      print "  <details><summary>plan</summary>"
      print ""
      while ((getline line < planfile) > 0) { print "  " line }
      print ""
      print "  </details>"
      print ""
      next
    }
    { print }
  ' "$TASKS_FILE" > "$TMP_TASKS"
  mv "$TMP_TASKS" "$TASKS_FILE"
  rm -f "$PLAN_FILE" "$REVIEW_FILE"

  echo "Task checked off in TASKS.md. Over to you for the human code review."
  exit 0
fi

echo ""
echo "=== STOPPED: reached MAX_ITERS=$MAX_ITERS without success. ===" >&2
{
  echo "# Loop report — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo ""
  echo "Task: $TASK_TEXT"
  echo "Iterations: $ITER"
  echo ""
  echo "## Last test failure"
  echo '```'
  echo "$TEST_FAILURE"
  echo '```'
  echo ""
  echo "## Last review status: $REVIEW_STATUS"
  echo '```'
  echo "$REVIEW_FINDINGS"
  echo '```'
} > "$LOG_DIR/report.md"
echo "See $LOG_DIR/report.md and $LOG_DIR/ for full logs. plan.md left in place for inspection." >&2
exit 1
