import {defineConfig} from "drizzle-kit";

export default defineConfig({
 schema:"./packages/database/schema.ts",
 out:"./packages/database/migrations",
 dialect:"postgresql",
 dbCredentials:{url:process.env.DATABASE_URL??"postgresql://taplink_app:taplink@localhost:5432/taplink"},
 strict:true,
 verbose:true
});
