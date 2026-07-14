import { test as setup } from "@playwright/test";
import { execSync } from "node:child_process";
import path from "node:path";

// Shared by two independent Playwright projects (reset-before-library,
// reset-before-wizard) so each of library.spec.ts and wizard.spec.ts — the
// two files with absolute book-count assertions — starts from its own clean
// 3-book baseline, rather than inheriting the other file's create/delete
// side effects on the shared Postgres DB.
setup("reset seed books to a clean baseline", () => {
  const backendDir = path.resolve(__dirname, "../backend");
  execSync(
    `bash -c "cd '${backendDir}' && source .venv/bin/activate && python manage.py reset_seed_data"`,
    { stdio: "inherit" }
  );
});
