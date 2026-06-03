import 'dotenv/config'

export const config = {
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'timeline',
    password: process.env.DB_PASSWORD || 'timeline123',
    database: process.env.DB_NAME || 'timeline',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
  },
}
