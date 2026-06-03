import bcrypt from 'bcrypt'
import pool from '../db/connection.js'

export default async function authRoutes(app, opts) {
  // 注册
  app.post('/register', async (request, reply) => {
    const { username, password } = request.body || {}

    if (!username || !password) {
      return reply.status(400).send({ error: '用户名和密码不能为空' })
    }

    if (username.length < 2 || username.length > 50) {
      return reply.status(400).send({ error: '用户名长度需要 2-50 个字符' })
    }

    if (password.length < 4) {
      return reply.status(400).send({ error: '密码长度至少 4 个字符' })
    }

    // 检查用户名是否已存在
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    )

    if (existing.length > 0) {
      return reply.status(409).send({ error: '用户名已存在' })
    }

    // 哈希密码并插入
    const passwordHash = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    )

    const token = app.jwt.sign(
      { userId: result.insertId, username },
      { expiresIn: '30d' }
    )

    return {
      token,
      user: {
        id: result.insertId,
        username,
      },
    }
  })

  // 登录
  app.post('/login', async (request, reply) => {
    const { username, password } = request.body || {}

    if (!username || !password) {
      return reply.status(400).send({ error: '用户名和密码不能为空' })
    }

    const [rows] = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = ?',
      [username]
    )

    if (rows.length === 0) {
      return reply.status(401).send({ error: '用户名或密码错误' })
    }

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)

    if (!valid) {
      return reply.status(401).send({ error: '用户名或密码错误' })
    }

    const token = app.jwt.sign(
      { userId: user.id, username: user.username },
      { expiresIn: '30d' }
    )

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    }
  })

  // 获取当前用户信息
  app.get('/me', { onRequest: [app.authenticate] }, async (request) => {
    return {
      user: {
        id: request.user.userId,
        username: request.user.username,
      },
    }
  })
}
