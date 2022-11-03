# What is Planetsheet?

![Planetsheet demo screenshot](./demo-screenshot-2.png)

A SQL editor designed for developers and content editors.

Today, Planetsheet is an (early) alternative to `npx prisma studio`, Postico, and TablePlus. See [todos](#todos) for missing features. File an issue to suggest new ideas.

In the future, Planetsheet will give you (and your content editors) an interface as intuitive as Airtable and Google Sheets, while letting you (as a developer) use powerful databases underneath.

## Usage

```
npx psheet
```

Make sure the `DATABASE_URL` environment variable is defined. Planetsheet should **just work**. If it doesn't, please file an issue!

## Supported Databases

- Postgres
- MySQL
- SQLite (coming soon)

## Sample connection strings

Currently, Planetsheet uses [simple custom heuristics](/src/backend/utils/db.ts) to add SSL query parameters for common database providers.

### Planetscale

```
DATABASE_URL=mysql://0qnpifrkjmwv:pscale_pw***********************@asdfojklae.r.us-west-2.psdb.cloud/show?ssl=true
```

### Supabase

```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.eegtiwadasfjibedlgk.supabase.co:5432/postgres
```

### Neon.tech

```
DATABASE_URL=postgres://lawrencecchen:[YOUR-PASSWORD]@prowl-read-4122469.cloud.neon.tech:5432/main?sslmode=require
```
