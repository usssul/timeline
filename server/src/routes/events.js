import pool from '../db/connection.js'
import { parseImportData, exportToText } from '../utils/parser.js'

export default async function eventRoutes(app, opts) {
  // 所有路由都需要认证
  app.addHook('onRequest', app.authenticate)

  // 获取当前用户的所有事件
  app.get('/', async (request) => {
    const [rows] = await pool.query(
      'SELECT id, title, content, period, event_time, created_at FROM events WHERE user_id = ? ORDER BY event_time DESC',
      [request.user.userId]
    )
    return { events: rows }
  })

  // 添加单条事件
  app.post('/', async (request, reply) => {
    const { title, content, period, event_time } = request.body || {}

    if (!content || !event_time) {
      return reply.status(400).send({ error: '内容和日期不能为空' })
    }

    const eventTitle = title || content.trim().split('\n')[0].substring(0, 30)
    const eventPeriod = period || ''

    const [result] = await pool.query(
      'INSERT INTO events (user_id, title, content, period, event_time) VALUES (?, ?, ?, ?, ?)',
      [request.user.userId, eventTitle, content, eventPeriod, event_time]
    )

    return {
      id: result.insertId,
      title: eventTitle,
      content,
      period: eventPeriod,
      event_time,
    }
  })

  // 删除事件
  app.delete('/:id', async (request, reply) => {
    const eventId = parseInt(request.params.id)
    if (isNaN(eventId)) {
      return reply.status(400).send({ error: '无效的事件 ID' })
    }

    const [result] = await pool.query(
      'DELETE FROM events WHERE id = ? AND user_id = ?',
      [eventId, request.user.userId]
    )

    if (result.affectedRows === 0) {
      return reply.status(404).send({ error: '事件不存在' })
    }

    return { success: true }
  })

  // 批量导入（解析 example.txt 格式）
  app.post('/import', async (request, reply) => {
    const { text } = request.body || {}

    if (!text || !text.trim()) {
      return reply.status(400).send({ error: '导入数据不能为空' })
    }

    const events = parseImportData(text)

    if (events.length === 0) {
      return reply.status(400).send({ error: '未能解析到任何事件，请检查格式' })
    }

    // 批量插入
    const userId = request.user.userId
    const values = []
    const placeholders = []

    for (const ev of events) {
      placeholders.push('(?, ?, ?, ?, ?)')
      values.push(userId, ev.title, ev.content, ev.period, ev.event_time)
    }

    const sql = `INSERT INTO events (user_id, title, content, period, event_time) VALUES ${placeholders.join(', ')}`
    await pool.query(sql, values)

    return { imported: events.length }
  })

  // 导出为 txt 格式
  app.get('/export', async (request, reply) => {
    const [rows] = await pool.query(
      'SELECT content, period, event_time FROM events WHERE user_id = ? ORDER BY event_time DESC',
      [request.user.userId]
    )

    const text = exportToText(rows)

    reply.header('Content-Type', 'text/plain; charset=utf-8')
    reply.header(
      'Content-Disposition',
      `attachment; filename="timeline-${new Date().toISOString().slice(0, 10)}.txt"`
    )
    return text
  })
}
