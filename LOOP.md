# LOOP.md

Describes the single-task agent iteration loop for Storyseed — how one item from `TASKS.md` goes from a task description to human-reviewable code. This document is the spec; the script (`scripts/loop.sh`, replacing `scripts/agent-loop.sh`) is derived from it, not the other way around. For *what* the product does, see `PROJECT.md`; for the tech stack, see `ARCHITECTURE.md`; for the parent SDLC this loop is one step of, see `CLAUDE.md`.

## Scope

- **One task per run.** This script does not sweep `TASKS.md`, does not batch, and is not meant to run unattended across multiple tasks. Prove it reliable on single tasks first; scaling to multi-task/unattended runs is a later, separate step.
- **Bash is the orchestrator, not Claude.** Every "did this succeed, should we loop, should we stop" decision is a shell conditional checking a file, an exit code, or an iteration counter — never an LLM's self-report. This is what makes the loop deterministic and auditable, and it's why each Claude invocation below is scoped to one job (plan, implement, review) rather than one long session deciding its own next steps.

## Input

- **`TASKS.md`** — flat backlog of checkbox items. The script takes the **first unchecked item, top to bottom**. No priority, filtering, or dependency ordering yet — that's a later refinement once task selection needs to be smarter.

## Stages

### 1. Select task
Bash reads `TASKS.md`, takes the first `- [ ]` item as `TASK`.

### 2. Plan (fresh session)
Bash invokes `claude -p` with a fresh session — no prior history — giving it `TASK` plus the relevant specs (`PROJECT.md`, `ARCHITECTURE.md`, `TEST_CONTRACT.md`, `design/README.md`). Instruction: **write a plan to `plan.md`, do not touch any other file.** No implementation happens in this stage.

### 3. Human plan gate
Bash prints `plan.md` and blocks on a prompt (`read -p "Approve plan? [y/N] "`).
- **Reject** → script exits. You edit the task wording or talk it through separately, then re-run. (v1 has no automatic re-planning-with-feedback loop — that's manual for now.)
- **Approve** → proceed to implementation.

### 4. Implement (new session, ID captured)
Bash invokes `claude -p` with `plan.md` + `TASK` as context, instructed to implement the plan and write/update tests per `TEST_CONTRACT.md`. Bash captures this session's ID (via `--output-format json`) so it can resume the *same* session in later stages — this session accumulates memory of what it tried and why across every fix round that follows.

### 5. Test loop (bash-checked)
Bash runs the actual gates itself — `pnpm test`, `pnpm typecheck`, `pnpm test:e2e` (in that order, per `CLAUDE.md`) — and trusts exit codes, not the agent's word. On failure, bash feeds the failing output back into the **same implementer session** (`claude -p --resume <id>`) with a focused fix instruction, then re-runs the gates. Repeats until green or the iteration cap is hit.

### 6. Review (fresh session, no resume)
Once tests are green, bash invokes a **brand-new** `claude -p` session — no history of having written the code — pointed at `git diff`, instructed to review for correctness and spec-adherence and to write its verdict to `review-result.json`:
```json
{ "status": "pass" | "fail", "findings": [ { "summary": "...", "file": "...", "line": 0 } ] }
```
A missing or malformed `review-result.json` is treated as **fail** (fail-closed) — bash never assumes success from silence.

### 7. Review-fix loop
If `status: "fail"`, bash feeds `findings` back into the **same implementer session** (`--resume`) to address them, then re-runs stage 5 (tests) and stage 6 (a **fresh** reviewer again — never resumed, so it never grades its own prior verdict). Shares the same iteration counter as stage 5.

### 8. Stop conditions
- **Success** — tests green *and* review `status: "pass"`. The automated loop stops here; it does **not** decide the work is "done." It marks the task ready and hands off to **you** for the actual final code review — that gate is never automated.
- **Exhausted** — iteration cap reached first. Bash stops, writes a report (last test failures, last review findings, iteration count) to a scratch log, and exits non-zero. You decide whether to raise the cap, step in manually, or scrap the task.

## Artifacts & lifecycle

- **`plan.md`** — temporary, scoped to one task's run.
- On success, its content is appended into `TASKS.md` next to the now-checked-off task (a lightweight paper trail of what was planned and why), then `plan.md` is deleted. No separate archive folder for now.
- **`review-result.json`** — scratch, overwritten each review round, not kept after the task finishes.
- **Logs** (test output, per-iteration history) — kept in a scratch dir (mirroring today's `.agent-loop/`) so a capped-out run is inspectable.

## Session management

| Role | Session lifetime |
|---|---|
| Planner | Fresh every run, never resumed. |
| Implementer | One continuous session for the whole task — resumed across every test-fix and review-fix round. |
| Reviewer | Fresh **every** round, never resumed — this is what keeps it from rubber-stamping its own prior read of the code. |

## Bounds

- `MAX_ITERS` caps the combined test-fix + review-fix rounds for one task (today's script defaults to 25; retune once this design is running).
- No cap on the plan-approval stage — that's a human-blocking gate, not a retry loop.

## Explicitly out of scope for v1

- Multi-task / batch runs. This handles exactly one task per invocation.
- Smarter task selection (priority, dependencies, filtering) — "top of `TASKS.md`" only, for now.
- Automatic re-planning after a rejected plan — a human edit + re-run is the v1 path.

## Supersedes

`scripts/agent-loop.sh` — the prior unattended, no-plan, no-review, whole-suite loop. Once a script matching this document exists, `agent-loop.sh` should be removed rather than kept alongside it.
