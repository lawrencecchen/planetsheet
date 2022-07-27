# Planetsheet

A SQL editor designed for developers and content editors.

Today, Planetsheet is an (early) alternative to `npx prisma studio`, Postico, and TablePlus. See [todos](#todos) for missing features. File an issue to suggest new ideas.

In the future, Planetsheet will give you (and your content editors) an interface as intuitive as Airtable and Google Sheets, while letting you (as a developer) use powerful databases underneath.

![Planetsheet demo screenshot](/assets/demo-screenshot-2.png)

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

## Common errors

### `npx psheet` terminates early

There's likely another process running on port 58337. Inspect using `lsof -i tcp:58337` and kill the suspecting process.

### Cannot connect

Planetsheet uses knex internally. Look up how to connect to your database with your database's SSL settings.

## Development

```
npm install
npm run dev
```

## Deployment

```
npm run build
```

Currently, Planetsheet is only tested with `npx psheet`. In the future, there should be a straighforward path towards self-hosting (Vercel/Railway/Docker).

## Todos

- [ ] more visible error handling
- [ ] bottom action bar
  - [ ] content/structure/ddl
- [ ] query editor
  - [ ] query history
- [ ] redirect to /app/db when table/schema not found
- [ ] better error handling
- [ ] image previews
  - [ ] image uploads (configurable to cloudflare, s3, supabase s3, etc.)
- [ ] relation selector
- [ ] save database credentials
  - [ ] store db credentials in keychain. what's the windows/linux analogous service??
- [ ] automatically kill other processes on port 58337?
- [ ] sort user tables to top; move system tables into another accordion
- [ ] move away from glide grid for more control; create custom canvas grid.

## Future

- Use [Bun](https://github.com/oven-sh/bun/issues/441) to bundle a standalone executable. Should have faster start up times, and (hopefully) ditch the hacky stuff happening in cli/cli.ts. Will also let us ditch node's sqlite3 + @mapbox/node-pre-gyp.
