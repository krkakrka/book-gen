import { defineRailway, github, postgres, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const Postgres = postgres("Postgres");
  const postgresVolume = volume("postgres-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "sfo", sizeMB: 500 });
  const bookGen = service("book-gen", {
    source: github("krkakrka/book-gen", { rootDirectory: "/backend" }),
    healthcheck: "/api/health/",
    replicas: { "sfo": 1 },
    // collectstatic moved to Procfile's `web:` line — preDeploy runs in a
    // separate ephemeral container whose filesystem doesn't persist into the
    // actual web container, so collectstatic's output here never took effect
    // (Django admin's static files 500'd: manifest entries were never there).
    deploy: { preDeployCommand: ["python manage.py migrate --no-input"] },
    env: {
      CORS_ALLOWED_ORIGINS: preserve(),
      CSRF_TRUSTED_ORIGINS: preserve(),
      DJANGO_ALLOWED_HOSTS: preserve(),
      DJANGO_SECRET_KEY: preserve(),
      DJANGO_SETTINGS_MODULE: preserve(),
      POSTGRES_DB: preserve(),
      POSTGRES_HOST: preserve(),
      POSTGRES_PASSWORD: preserve(),
      POSTGRES_PORT: preserve(),
      POSTGRES_USER: preserve(),
    },
  });

  return project("pacific-flexibility", {
    resources: [Postgres, bookGen, postgresVolume],
  });
});
