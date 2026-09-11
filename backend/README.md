# Aarogyam AI backend local database

Phase 1 uses PostgreSQL and Flyway. Flyway runs `V1__create_aarogyam_schema.sql` automatically when the Spring Boot application starts.

## Local environment

Copy `.env.example` to `.env` and set these values for your own machine:

```dotenv
DATABASE_URL=jdbc:postgresql://127.0.0.1:5432/aarogyam
DATABASE_USERNAME=ayushpatel
DATABASE_PASSWORD=
JWT_SECRET=use-a-long-random-value-in-any-non-demo-environment
JWT_EXPIRATION_MS=86400000
UPLOADS_DIR=./uploads
CBC_API_URL=http://127.0.0.1:8000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Email verification

New registrations require email verification before login. Local development defaults to `MAIL_DELIVERY_MODE=console`, which writes the verification link to the backend log instead of sending an email. For a deployed environment, set `MAIL_DELIVERY_MODE=smtp` and provide `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `MAIL_FROM`, and `FRONTEND_URL` through environment variables.

Set `JWT_COOKIE_SECURE=true` whenever the frontend is served over HTTPS.

Create the local database once:

```bash
createdb aarogyam
```

Then start the backend from the `backend` directory:

```bash
mvn spring-boot:run
```

The application validates its JPA mappings and runs Flyway migrations at startup. Do not put database credentials or `.env` files in source control.
