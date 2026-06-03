// JWT 认证插件 —— 在请求中注入当前用户信息
export async function authenticate(request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: '未登录或登录已过期' })
  }
}
