#!/usr/bin/env bash
#
# agent-loop.sh — red-spec agent loop for Storyseed.
#
# Repeatedly invokes Claude Code headlessly to implement the stubbed UI in
# app/ and components/ until the test suite is green. Each iteration the SCRIPT
# (not the agent) is the source of truth for pass/fail:
#
#   1. Run Jest + typecheck. If either fails, feed the output to `claude -p`
#      to make a focused fix, then loop.
#   2. Once Jest + typecheck are green, run Playwright e2e as the FINAL gate.
#      If e2e fails, feed the output back and loop; if it passes, we're done.
#
# The agent must implement behavior to satisfy the tests — never weaken or edit
# the tests. See TEST_CONTRACT.md and design/README.md.
#
# Usage:
#   scripts/agent-loop.sh            # run with defaults
#   MAX_ITERS=40 scripts/agent-loop.sh
#   CLAUDE_BIN=/path/to/claude scripts/agent-loop.sh
#
# Env vars:
#   MAX_ITERS   max implement iterations before giving up (default 25)
#   CLAUDE_BIN  path to the claude CLI (default: first on PATH)
#   CLAUDE_MODEL  optional --model passed to claude (default: claude's default)
#   SKIP_E2E    set to 1 to skip the e2e gate (Jest + typecheck only)

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

MODEL_ARGS=()
[[ -n "${CLAUDE_MODEL:-}" ]] && MODEL_ARGS=(--model "$CLAUDE_MODEL")

LOG_DIR="$ROOT/.agent-loop"
mkdir -p "$LOG_DIR"

# ---- helpers ---------------------------------------------------------------

# Run a command, tee its combined output to a file, return the command's status.
run_check() {
  local logfile="$1"; shift
  "$@" >"$logfile" 2>&1
}

# Drive one agent iteration. $1 = the focused instruction with failing output.
invoke_agent() {
  local prompt="$1"
  echo "→ invoking claude ($CLAUDE_BIN)..."
  # --dangerously-skip-permissions lets the agent edit files and run pnpm
  # unattended. Only run this loop in a trusted/checked-out working copy.
  "$CLAUDE_BIN" -p "$prompt" \
    "${MODEL_ARGS[@]}" \
    --dangerously-skip-permissions
}

AGENT_BRIEF=$(cat <<'BRIEF'
You are implementing the Storyseed red-spec harness. The Jest + Playwright tests
are written and failing on purpose. Your job: implement the stubbed UI in app/
and components/ (importing the finished reference data from lib/) until the tests
pass. RULES:
- Do NOT edit, weaken, skip, or delete any test to make it pass.
- data-testid values and accessible names are a fixed API — see TEST_CONTRACT.md.
- Follow design/README.md for layout/copy and use the tokens in lib/tokens.ts.
- Make focused changes, then stop. The loop will re-run the checks.
Below is the current failing output. Fix the most impactful failure(s):
BRIEF
)

# ---- main loop -------------------------------------------------------------

echo "=== Storyseed agent loop (max $MAX_ITERS iterations) ==="

for ((i = 1; i <= MAX_ITERS; i++)); do
  echo ""
  echo "===================== iteration $i / $MAX_ITERS ====================="

  jest_log="$LOG_DIR/jest.log"
  tsc_log="$LOG_DIR/typecheck.log"

  echo "• running Jest..."
  run_check "$jest_log" pnpm test
  jest_status=$?

  echo "• running typecheck..."
  run_check "$tsc_log" pnpm typecheck
  tsc_status=$?

  if [[ $jest_status -ne 0 || $tsc_status -ne 0 ]]; then
    echo "✗ Jest=$jest_status typecheck=$tsc_status — handing failures to the agent."
    prompt="$AGENT_BRIEF

===== JEST (exit $jest_status) =====
$(tail -n 200 "$jest_log")

===== TYPECHECK (exit $tsc_status) =====
$(tail -n 100 "$tsc_log")"
    invoke_agent "$prompt"
    continue
  fi

  echo "✓ Jest + typecheck green."

  if [[ "$SKIP_E2E" == "1" ]]; then
    echo "SKIP_E2E=1 — stopping after Jest + typecheck."
    echo "=== DONE (e2e skipped) after $i iteration(s) ==="
    exit 0
  fi

  # Final gatekeeper: Playwright e2e.
  e2e_log="$LOG_DIR/e2e.log"
  echo "• running Playwright e2e (final gate)..."
  run_check "$e2e_log" pnpm test:e2e
  e2e_status=$?

  if [[ $e2e_status -eq 0 ]]; then
    echo ""
    echo "=== ALL GREEN (Jest + typecheck + e2e) after $i iteration(s) ==="
    exit 0
  fi

  echo "✗ e2e failed (exit $e2e_status) — handing failures to the agent."
  prompt="$AGENT_BRIEF

Jest and typecheck already pass — keep them passing. The Playwright e2e gate is
failing. Fix the behavior the e2e specs assert (see TEST_CONTRACT.md).

===== PLAYWRIGHT E2E (exit $e2e_status) =====
$(tail -n 250 "$e2e_log")"
  invoke_agent "$prompt"
done

echo ""
echo "=== STOPPED: reached MAX_ITERS=$MAX_ITERS without going fully green ===" >&2
echo "Logs are in $LOG_DIR/. Inspect, then re-run to continue." >&2
exit 1
