import { getConnection } from "./db";

const connectionStrings = [
  "postgresql://postgres:[YOUR-PASSWORD]@db.eegtiwalzliriibedlgk.supabase.co:5432/postgres",
  "mysql://0qnpifrkjmwv:pscale_pw_RkAMJblZhxxIuwm4C5mW5l9VLnYpXoU5my0ZLncL63E@gbcybvkl3dfi.us-west-2.psdb.cloud/",
  "mysql://0qnpifrkjmwv:pscale_pw_RkAMJblZhxxIuwm4C5mW5l9VLnYpXoU5my0ZLncL63E@gbcybvkl3dfi.us-west-2.psdb.cloud/show?ssl=true",
];

function testConnections() {
  for (const connectionString of connectionStrings) {
    getConnection(connectionString);
  }
}
