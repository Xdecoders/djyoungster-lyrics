import { defineConfig } from '@prisma/client'

export default defineConfig({
  adapter: {
    provider: 'mysql',
    url: process.env.DATABASE_URL,
  },
})