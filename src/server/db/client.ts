import { Kysely, SqliteDialect } from "kysely";
import Database from "better-sqlite3";
import path from "node:path";

type Database = {};

const SQLITE_DB_PATH = path.join(process.cwd(), "planetsheet.db");

function getDatabase() {
	return new Kysely<Database>({
		dialect: new SqliteDialect({
			database: new Database(SQLITE_DB_PATH),
		}),
	});
}

export const db = getDatabase();
