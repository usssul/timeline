/**
 * 解析 example.txt 格式的时间线数据
 * 将 ImportData.vue 中的解析逻辑移植到后端
 */

// 时段词列表
const TIME_PERIODS = ['清晨', '早上', '中午', '午后', '傍晚', '晚上', '深夜']

/**
 * @param {string} text - 导入的文本内容
 * @returns {Array} parsedEvents - 解析后的事件数组
 */
export function parseImportData(text) {
  const lines = text.trim().split('\n')
  const parsedEvents = []
  let currentYear = ''
  let currentDate = ''
  let currentPeriod = ''
  let currentContent = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      continue
    }

    // 匹配年份
    if (/^\d{4}年$/.test(line)) {
      // 保存当前事件
      if (currentDate && currentContent.length > 0) {
        const [year, month, day] = currentDate.split('-')
        parsedEvents.push(buildEvent(year, month, day, currentPeriod, currentContent, parsedEvents.length))
        currentContent = []
        currentPeriod = ''
      }

      currentYear = line.replace('年', '')
      currentDate = ''
      continue
    }

    // 匹配日期
    const dateMatch = line.match(/^(\d{1,2})月(\d{1,2})日(.*)$/)
    if (dateMatch) {
      if (!currentYear || !/^\d{4}$/.test(currentYear)) {
        continue
      }

      // 保存上一个事件
      if (currentDate && currentContent.length > 0) {
        const [year, month, day] = currentDate.split('-')
        parsedEvents.push(buildEvent(year, month, day, currentPeriod, currentContent, parsedEvents.length))
      }

      const month = dateMatch[1].padStart(2, '0')
      const day = dateMatch[2].padStart(2, '0')
      const extra = dateMatch[3]
      currentDate = `${currentYear}-${month}-${day}`
      currentContent = []

      // 检查 extra 是否是时段词
      if (extra && TIME_PERIODS.includes(extra)) {
        currentPeriod = extra
      } else {
        currentPeriod = ''
        if (extra) {
          currentContent.push(extra)
        }
      }
      continue
    }

    // 检查是否是单独的时段词行
    if (TIME_PERIODS.includes(line)) {
      currentPeriod = line
      continue
    }

    if (currentDate) {
      currentContent.push(line)
    }
  }

  // 保存最后一个事件
  if (currentDate && currentContent.length > 0) {
    const [year, month, day] = currentDate.split('-')
    if (year && /^\d{4}$/.test(year)) {
      parsedEvents.push(buildEvent(year, month, day, currentPeriod, currentContent, parsedEvents.length))
    }
  }

  return parsedEvents
}

function buildEvent(year, month, day, period, contentLines, offset) {
  const title = `${month}月${day}日`
  const content = contentLines.join('\n\n')
  return {
    title,
    period,
    content,
    event_time: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00`,
  }
}

/**
 * 将事件数组导出为 example.txt 格式
 * @param {Array} events - 事件数组
 * @returns {string} 格式化后的文本
 */
export function exportToText(events) {
  const timePeriods = ['清晨', '早上', '中午', '午后', '傍晚', '晚上', '深夜']

  // 按年份分组
  const grouped = {}
  events.forEach((event) => {
    const eventDate = new Date(event.event_time)
    if (isNaN(eventDate.getTime())) return

    const year = eventDate.getFullYear()
    if (!grouped[year]) grouped[year] = []
    grouped[year].push(event)
  })

  // 按年份降序
  let content = ''
  Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a)
    .forEach((year) => {
      content += `${year}年\n\n`

      grouped[year]
        .sort((a, b) => new Date(b.event_time) - new Date(a.event_time))
        .forEach((event) => {
          const date = new Date(event.event_time)
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')

          let timeStr = `${month}月${day}日`
          if (event.period && timePeriods.includes(event.period)) {
            timeStr += event.period
          }

          content += `${timeStr}\n${event.content}\n\n`
        })
      content += '\n'
    })

  return content
}
