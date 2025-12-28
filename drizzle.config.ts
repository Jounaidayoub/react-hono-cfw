import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './migrations',
  schema: 'src/lib/schemas/index.ts',
  dialect: 'sqlite',
  

});
