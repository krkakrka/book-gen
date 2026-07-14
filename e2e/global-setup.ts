import { execSync } from "node:child_process";
import path from "node:path";

// Resets the shared dev Postgres DB to exactly the 3 seed books before each
// e2e run, so book-count assertions (library.spec.ts, wizard.spec.ts) stay
// repeatable across runs — unlike the old localStorage-per-context world,
// Postgres persists create/edit/delete side effects across test runs.
export default function globalSetup() {
  const backendDir = path.resolve(__dirname, "../backend");
  execSync(
    `bash -c "cd '${backendDir}' && source .venv/bin/activate && python manage.py reset_seed_data"`,
    { stdio: "inherit" }
  );
}
