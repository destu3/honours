import { defineConfig } from 'drizzle-kit';

console.log(Deno.env.get('DATABASE_URL'));

export default defineConfig({
  out: './drizzle',
  schema: './db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: Deno.env.get('DATABASE_URL')!,
  },
});
