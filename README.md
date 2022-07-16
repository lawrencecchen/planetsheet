# Planetsheet

A SQL editor designed for developers and content editors.

Currently supports Postgres and MySql

### Connecting

## Common errors

### `npx psheet` terminates early

There's likely another process running on port 58337. Inspect using `lsof -i tcp:58337` and kill the suspecting process.

### Cannot connect

Planetsheet uses knex internally. Look up how to connect to your database with your database ssl settings.

## todos

- [ ] bottom action bar
  - [ ] content/structure/ddl
- [ ] query editor
  - [ ] query history
- [ ] redirect to /app/db when not found
- [ ] better error handling
- [ ] image previews
  - [ ] image uploads (configurable to cloudflare, s3, etc)
- [ ] relation selector
