import { defineRailway, github, postgres, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const Postgres = postgres("Postgres");
  const postgresVolume = volume("postgres-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "sfo", sizeMB: 500 });
  const bookGen = service("book-gen", {
    source: github("krkakrka/book-gen", { rootDirectory: "/backend" }),
    replicas: { "sfo": 1 },
    // Procfile's `release:` line is a Heroku convention, not honored by
    // Railway's Nixpacks builder — migrations never ran without this,
    // silently leaving the DB schema-less (auth_user didn't exist).
    preDeploy: ["python manage.py migrate --no-input && python manage.py collectstatic --no-input"],
    healthcheckPath: "/api/health/",
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
    resources: [bookGen, Postgres, postgresVolume],
  });
});
